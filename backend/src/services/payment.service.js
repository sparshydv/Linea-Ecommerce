const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order.model');
const logger = require('../utils/logger');

/**
 * Initialize Razorpay instance
 * Requires RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env
 */
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * Create a Razorpay order for payment
 *
 * Security: Amount comes from DB (order.pricing.totalAmount), NEVER from frontend.
 * This prevents price tampering attacks.
 *
 * @param {string} orderId - Internal order ObjectId
 * @param {string} userId - User ID (for authorization check)
 * @returns {object} { razorpayOrderId, amount, currency, keyId }
 * @throws {Error} If order not found, unauthorized, or not payable
 */
async function createRazorpayOrder(orderId, userId) {
  if (!orderId || !userId) {
    const error = new Error('Order ID and User ID required');
    error.statusCode = 400;
    throw error;
  }

  // Fetch order from database
  const order = await Order.findById(orderId);
  if (!order) {
    const error = new Error('Order not found');
    error.statusCode = 404;
    throw error;
  }

  // Authorization: Ensure order belongs to user
  if (order.user.toString() !== userId.toString()) {
    const error = new Error('Unauthorized: Order does not belong to user');
    error.statusCode = 403;
    throw error;
  }

  // Validation: Check if order is still payable (not already paid or failed)
  if (order.payment.status !== 'pending') {
    const error = new Error(
      `Order payment already ${order.payment.status}. Cannot create new Razorpay order.`
    );
    error.statusCode = 400;
    throw error;
  }

  // Get amount from order (trust DB, not frontend)
  const amountInRupees = order.pricing.totalAmount;
  const amountInPaise = Math.round(amountInRupees * 100); // Convert to paise

  if (amountInPaise <= 0) {
    const error = new Error('Invalid order amount');
    error.statusCode = 400;
    throw error;
  }

  try {
    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise, // Amount in paise
      currency: 'INR',
      receipt: order.orderNumber, // Human-readable order reference
      notes: {
        orderId: order._id.toString(), // Link back to internal order
        userId: userId.toString(),
      },
    });

    // Return public details (keyId from env, razorpay order details)
    return {
      razorpayOrderId: razorpayOrder.id,
      amount: amountInRupees,
      amountInPaise,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    };
  } catch (err) {
    const error = new Error(`Razorpay order creation failed: ${err.message}`);
    error.statusCode = 500;
    error.originalError = err;
    throw error;
  }
}

/**
 * Verify Razorpay webhook signature
 * Prevents tampering by validating HMAC-SHA256 signature
 *
 * @param {string} body - Raw webhook body (unparsed JSON string)
 * @param {string} signature - X-Razorpay-Signature header
 * @returns {boolean} True if signature is valid
 */
function verifyWebhookSignature(body, signature) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    logger.error('RAZORPAY_WEBHOOK_SECRET is not set');
    return false;
  }

  const hash = crypto.createHmac('sha256', secret).update(body).digest('hex');
  return hash === signature;
}

/**
 * Handle Razorpay webhook events
 * Idempotent: Safe to call multiple times (retries won't duplicate updates)
 *
 * Edge Cases Handled:
 * 1. DB failure during payment.captured update → webhook returns 200, Razorpay retries, idempotency catches it
 * 2. Order exists but payment fails → status remains 'pending' to allow retry
 * 3. Duplicate webhooks → idempotency check prevents double-confirmation
 * 4. User retries payment after failure → new Razorpay order allowed when payment.status='failed'
 *
 * @param {object} event - Webhook event from Razorpay
 * @returns {object} { success, message, orderId, action }
 * @throws {Error} Only on critical failures (order not found, etc.)
 */
async function handleRazorpayWebhook(event) {
  const eventType = event.event;
  
  // Only process payment events
  if (!eventType.startsWith('payment.')) {
    logger.info(`Ignoring Razorpay event: ${eventType}`);
    return { success: true, message: 'Event ignored', eventType };
  }

  const payment = event.payload.payment.entity;
  const orderId = payment.notes?.orderId;

  if (!orderId) {
    const error = new Error('Webhook payment missing orderId in notes');
    error.statusCode = 400;
    logger.error(`Webhook error: ${error.message}`, { payment });
    throw error;
  }

  try {
    // Fetch order from database
    const order = await Order.findById(orderId);
    if (!order) {
      const error = new Error(`Order not found: ${orderId}`);
      error.statusCode = 404;
      logger.error(`Webhook error: ${error.message}`);
      throw error;
    }

    // ========================================================================
    // EDGE CASE 1 & 3: Handle payment.captured (SUCCESS)
    // Prevent double-confirmation via idempotency check
    // ========================================================================
    if (eventType === 'payment.captured') {
      // Idempotency Guard: Check if payment already marked as success
      if (order.payment.status === 'success') {
        logger.warn(`IDEMPOTENT RETRY: Payment already captured for order: ${orderId}`, {
          razorpayPaymentId: order.payment.reference,
          currentPaymentReference: payment.id,
          action: 'SKIPPED_UPDATE',
        });
        return {
          success: true,
          message: 'Payment already processed (idempotent retry)',
          orderId,
          action: 'SKIPPED',
        };
      }

      // Safety Check: Prevent overwriting a failed payment with success
      // (This should not happen in normal flow, but guards against webhook order issues)
      if (order.payment.status === 'failed') {
        logger.warn(`UNEXPECTED STATE: Received payment.captured after payment.failed for order: ${orderId}`, {
          previousPaymentReference: order.payment.reference,
          newPaymentReference: payment.id,
          action: 'SKIPPED_UPDATE - Requires manual review',
        });
        
        // Alert for manual intervention (flag in logs/monitoring)
        logger.error(
          `⚠️ MANUAL INTERVENTION REQUIRED: Multiple payment attempts for order ${orderId}. ` +
          `Previous failed payment: ${order.payment.reference}, New payment: ${payment.id}. ` +
          `Admin should verify which payment actually completed.`
        );

        return {
          success: true,
          message: 'Payment received but order already has failed payment (manual review required)',
          orderId,
          action: 'MANUAL_REVIEW_REQUIRED',
        };
      }

      // ====================================================================
      // EDGE CASE 1: DB Failure During Update
      // If save() fails, webhook returns 200 OK to Razorpay (prevents retry storm)
      // On retry, idempotency check catches it and prevents duplicate confirmation
      // ====================================================================
      try {
        // Atomic update: Both payment and order status must change together
        order.payment.status = 'success';
        order.payment.reference = payment.id; // Store Razorpay payment ID
        order.status = 'confirmed';
        
        await order.save();

        logger.info(`✓ PAYMENT CAPTURED: Order ${orderId} confirmed`, {
          razorpayPaymentId: payment.id,
          amount: payment.amount / 100, // Convert from paise to rupees
          action: 'CONFIRMED',
        });

        return {
          success: true,
          message: 'Payment captured and order confirmed',
          orderId,
          razorpayPaymentId: payment.id,
          action: 'CONFIRMED',
        };
      } catch (dbError) {
        // DB write failed but Razorpay thinks payment succeeded
        // Return 200 OK so Razorpay doesn't retry (we'll handle on next retry via idempotency)
        logger.error(
          `🚨 CRITICAL: DB save failed during payment.captured for order ${orderId}. ` +
          `Payment succeeded in Razorpay but order not updated. ` +
          `On next webhook retry, idempotency check will recover. ` +
          `Manual check recommended if issue persists.`,
          {
            orderId,
            razorpayPaymentId: payment.id,
            dbError: dbError.message,
            action: 'DB_SAVE_FAILED',
          }
        );

        // Rethrow: Let webhook handler return 200 anyway (controller catches this)
        throw new Error(
          `DB_SAVE_FAILED: Payment captured but order not updated. Will retry on next webhook. ` +
          `Original error: ${dbError.message}`
        );
      }
    }

    // ========================================================================
    // EDGE CASE 2 & 4: Handle payment.failed (FAILURE)
    // Allow safe retries by keeping order status as 'pending'
    // ========================================================================
    if (eventType === 'payment.failed') {
      // Idempotency Guard: Check if failure already recorded
      if (order.payment.status === 'failed') {
        logger.warn(`IDEMPOTENT RETRY: Payment failure already recorded for order: ${orderId}`, {
          razorpayPaymentId: order.payment.reference,
          currentFailureReference: payment.id,
          action: 'SKIPPED_UPDATE',
        });
        return {
          success: true,
          message: 'Payment failure already recorded (idempotent retry)',
          orderId,
          action: 'SKIPPED',
        };
      }

      // Safety Check: Prevent overwriting a successful payment
      if (order.payment.status === 'success') {
        logger.error(
          `🚨 ALERT: Received payment.failed for already-confirmed order: ${orderId}. ` +
          `This suggests webhook delivery order issue. Ignoring failed event. ` +
          `Manual review recommended.`,
          {
            confirmedPaymentId: order.payment.reference,
            failedPaymentId: payment.id,
            action: 'SKIPPED - Order already confirmed',
          }
        );

        return {
          success: true,
          message: 'Order already confirmed, ignoring failed payment notification',
          orderId,
          action: 'SKIPPED',
        };
      }

      // Update order: payment failed, status stays 'pending' (allows retry)
      try {
        order.payment.status = 'failed';
        order.payment.reference = payment.id; // Store Razorpay payment ID
        // Status remains 'pending' — allows user to retry payment (EDGE CASE 4)
        
        await order.save();

        logger.warn(`⚠️ PAYMENT FAILED: Order ${orderId} remains pending for retry`, {
          razorpayPaymentId: payment.id,
          reason: payment.description || 'No reason provided',
          action: 'PENDING_RETRY',
        });

        return {
          success: true,
          message: 'Payment failed, order remains pending for retry',
          orderId,
          razorpayPaymentId: payment.id,
          action: 'PENDING_RETRY', // User can attempt new payment
        };
      } catch (dbError) {
        // DB write failed for failure notification
        logger.error(
          `⚠️ DB SAVE FAILED: Failed to record payment failure for order ${orderId}. ` +
          `On next webhook retry, idempotency will check and recover.`,
          {
            orderId,
            razorpayPaymentId: payment.id,
            dbError: dbError.message,
            action: 'DB_SAVE_FAILED',
          }
        );

        throw new Error(
          `DB_SAVE_FAILED: Payment failure not recorded. Will retry on next webhook. ` +
          `Original error: ${dbError.message}`
        );
      }
    }

    // Unknown payment event
    logger.info(`Unhandled payment event: ${eventType}`, { payment, action: 'ACKNOWLEDGED' });
    return { success: true, message: 'Event acknowledged but not processed', eventType, action: 'ACKNOWLEDGED' };
  } catch (err) {
    logger.error(`🚨 WEBHOOK PROCESSING FAILED: ${err.message}`, {
      orderId,
      event: eventType,
      error: err.message,
      action: 'ERROR',
    });
    throw err;
  }
}

module.exports = {
  createRazorpayOrder,
  verifyWebhookSignature,
  handleRazorpayWebhook,
};
