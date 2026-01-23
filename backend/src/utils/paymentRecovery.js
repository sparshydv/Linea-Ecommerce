/**
 * Payment Recovery & Verification Utilities
 *
 * Provides tools for:
 * - Detecting payment inconsistencies (e.g., Razorpay success but DB not updated)
 * - Manual recovery procedures
 * - Order state auditing
 */

const Order = require('../models/Order.model');
const logger = require('./logger');

/**
 * Check if order has payment inconsistencies
 * Useful for monitoring and manual intervention
 *
 * @param {string} orderId - Order ID to check
 * @returns {object} { isConsistent, issues: [], recommendation }
 */
async function checkPaymentConsistency(orderId) {
  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return {
        isConsistent: false,
        issues: ['Order not found'],
        recommendation: 'Verify order ID',
      };
    }

    const issues = [];
    let recommendation = 'OK';

    // Check 1: Confirmed order without successful payment
    if (order.status === 'confirmed' && order.payment.status !== 'success') {
      issues.push(
        `Order is confirmed (${order.status}) but payment status is ${order.payment.status}. ` +
        'This is inconsistent.'
      );
      recommendation = 'MANUAL REVIEW: Check if payment succeeded in Razorpay but DB save failed.';
    }

    // Check 2: Pending order with successful payment
    if (order.status === 'pending' && order.payment.status === 'success') {
      issues.push(
        `Order is pending but payment is marked successful. ` +
        'Status transition may have failed.'
      );
      recommendation = 'RECOVER: Run order.status = "confirmed"; await order.save()';
    }

    // Check 3: Multiple different payment references (suggests retried payments)
    if (!order.payment.reference) {
      issues.push('No payment reference stored. Cannot verify with Razorpay.');
      recommendation = 'Check webhook logs for payment ID.';
    }

    return {
      isConsistent: issues.length === 0,
      issues,
      recommendation,
      orderState: {
        status: order.status,
        paymentStatus: order.payment.status,
        paymentReference: order.payment.reference,
      },
    };
  } catch (err) {
    logger.error(`Error checking payment consistency: ${err.message}`);
    return {
      isConsistent: false,
      issues: [`Error: ${err.message}`],
      recommendation: 'Check server logs',
    };
  }
}

/**
 * Recovery: Confirm order if payment succeeded but order not confirmed
 * MANUAL ONLY - Must be verified before calling
 *
 * @param {string} orderId - Order ID to recover
 * @returns {object} { success, message, order }
 */
async function recoverConfirmation(orderId) {
  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return { success: false, message: 'Order not found' };
    }

    // Only allow recovery if payment succeeded but order not confirmed
    if (order.payment.status !== 'success') {
      return {
        success: false,
        message: `Cannot recover: Payment status is ${order.payment.status}, not 'success'`,
      };
    }

    if (order.status === 'confirmed') {
      return {
        success: true,
        message: 'Order already confirmed',
        order,
      };
    }

    // Recover: Confirm the order
    order.status = 'confirmed';
    await order.save();

    logger.warn(`⚠️ MANUAL RECOVERY: Order ${orderId} confirmed due to previous DB failure`, {
      paymentReference: order.payment.reference,
      action: 'CONFIRMED_BY_RECOVERY',
    });

    return {
      success: true,
      message: 'Order successfully confirmed (recovered from DB failure)',
      order,
    };
  } catch (err) {
    logger.error(`Recovery failed: ${err.message}`);
    return { success: false, message: `Recovery error: ${err.message}` };
  }
}

/**
 * Audit: List orders with payment state anomalies
 * Useful for finding orphaned or inconsistent orders
 *
 * @returns {Promise<Array>} Orders with issues
 */
async function auditPaymentAnomalies() {
  try {
    // Find confirmed orders without successful payments
    const anomalies = await Order.find({
      $or: [
        { status: 'confirmed', 'payment.status': { $ne: 'success' } },
        { status: 'pending', 'payment.status': 'success' },
        { 'payment.status': 'pending', status: 'confirmed' },
      ],
    })
      .select('_id orderNumber status payment user createdAt')
      .sort({ createdAt: -1 });

    return anomalies;
  } catch (err) {
    logger.error(`Audit failed: ${err.message}`);
    return [];
  }
}

/**
 * Suggested Logging & Monitoring Strategy
 * Add these to your monitoring dashboard or alerting service
 *
 * KEY LOGS TO MONITOR:
 * 1. "✓ PAYMENT CAPTURED" - Normal success
 * 2. "⚠️ PAYMENT FAILED" - Normal failure (user retries)
 * 3. "🚨 CRITICAL" - DB save failed (requires manual intervention)
 * 4. "🚨 ALERT" - Webhook order issues (requires investigation)
 * 5. "🚨 MANUAL INTERVENTION REQUIRED" - Multiple payment attempts
 * 6. "IDEMPOTENT RETRY" - Retry detected (normal, no action)
 *
 * SUGGESTED ALERTS:
 * - Count logs with "🚨 CRITICAL" in last 1 hour > 0
 * - Count logs with "🚨 ALERT" in last 1 hour > 5
 * - Count logs with "DB_SAVE_FAILED" in last 1 hour > 2
 *
 * RECOVERY PROCEDURES:
 * - Call auditPaymentAnomalies() periodically (e.g., hourly cron job)
 * - Investigate "confirmed + payment.status != success"
 * - Call recoverConfirmation(orderId) after manual verification
 * - Log all manual interventions for audit trail
 */

module.exports = {
  checkPaymentConsistency,
  recoverConfirmation,
  auditPaymentAnomalies,
};
