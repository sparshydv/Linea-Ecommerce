const Order = require('../models/Order.model');
const crypto = require('crypto');

/**
 * Payment Service - Mock Payment Gateway
 * Simulates a real payment gateway (like Razorpay, Stripe)
 */

/**
 * Create a mock payment intent
 * Mirrors real gateway flow: validate order → generate payment session → return client credentials
 * 
 * EDGE CASE HANDLING:
 * - Scenario 4: User retries payment after failure
 *   Strategy: Allow payment intent creation if paymentStatus is 'failed'
 *   Rationale: User should be able to retry failed payments
 * 
 * @param {String} orderId - Order ID to create payment for
 * @param {String} userId - User ID for authorization
 * @returns {Object} Mock payment credentials
 */
async function createMockPayment(orderId, userId) {
  // Fetch order from database
  const order = await Order.findById(orderId);

  // Validate order exists
  if (!order) {
    const error = new Error('Order not found');
    error.statusCode = 404;
    throw error;
  }

  // Validate order belongs to user (authorization)
  if (order.user.toString() !== userId.toString()) {
    const error = new Error('Not authorized to access this order');
    error.statusCode = 403;
    throw error;
  }

  // EDGE CASE 4: Allow payment retry after failure
  // Valid states to create payment: 'pending' (first attempt) or 'failed' (retry)
  if (order.paymentStatus === 'success') {
    const error = new Error('Payment already successful. Cannot create new payment intent.');
    error.statusCode = 400;
    throw error;
  }

  // EDGE CASE 3: Orphaned payment detection
  // If payment was initiated but webhook never arrived, status stays 'pending'
  // This is safe - user can create new payment intent and old one becomes orphaned
  // Recovery strategy: Manual admin review of old pending payments (> 24 hours)
  if (order.paymentStatus === 'pending') {
    console.log(`[PAYMENT] Creating payment intent for pending order ${order.orderNumber}. Previous payment may be orphaned.`);
  }

  // EDGE CASE 4: Payment retry after failure
  if (order.paymentStatus === 'failed') {
    console.log(`[PAYMENT] Retrying payment for failed order ${order.orderNumber}`);
    // Reset payment status to pending for new attempt
    order.paymentStatus = 'pending';
    order.status = 'pending';
    await order.save();
  }

  // Generate unique mock payment ID (simulates gateway payment ID)
  const mockPaymentId = `mock_pay_${crypto.randomBytes(16).toString('hex')}`;

  // Generate mock client secret (simulates gateway client secret for frontend)
  const mockClientSecret = `mock_secret_${crypto.randomBytes(24).toString('hex')}`;

  // Amount MUST come from order (never trust frontend)
  const amount = order.totalAmount;
  const currency = 'INR';

  // In real gateway: payment intent is stored in gateway DB
  // Here: we could store in our DB but it's optional for mock
  // Real gateways return: paymentId, clientSecret for frontend to complete payment

  return {
    mockPaymentId,
    mockClientSecret,
    amount,
    currency,
    orderId: order._id,
    orderNumber: order.orderNumber
  };
}

/**
 * Handle mock payment webhook events
 * Simulates real gateway webhooks (Razorpay, Stripe send payment confirmations)
 * 
 * EDGE CASE HANDLING:
 * - Scenario 1: Payment success webhook arrives twice
 *   Strategy: Idempotency check - reject if already success
 *   Rationale: Prevents double order confirmation
 * 
 * - Scenario 2: Payment success arrives after failure
 *   Strategy: State transition validation - reject invalid transitions
 *   Rationale: Cannot resurrect failed payment without retry flow
 * 
 * - Scenario 3: Payment created but webhook never arrives
 *   Strategy: Manual admin review (separate tool needed)
 *   Detection: Orders with paymentStatus='pending' > 24 hours old
 * 
 * @param {Object} webhookPayload - Event data from mock gateway
 * @returns {Object} Processing result
 */
async function handleMockWebhook(webhookPayload) {
  const { event, mockPaymentId, orderId } = webhookPayload;

  // Validate required fields
  if (!event || !orderId) {
    const error = new Error('event and orderId are required');
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

  // EDGE CASE 1: Prevent double order confirmation
  // IDEMPOTENCY CHECK - Payment success webhook arrives twice
  if (event === 'payment.success' && order.paymentStatus === 'success') {
    console.log(`[WEBHOOK] Duplicate success event for order ${order.orderNumber}. Ignoring.`);
    return {
      processed: false,
      reason: 'duplicate_event',
      message: 'Payment already successful'
    };
  }

  if (event === 'payment.failed' && order.paymentStatus === 'failed') {
    console.log(`[WEBHOOK] Duplicate failed event for order ${order.orderNumber}. Ignoring.`);
    return {
      processed: false,
      reason: 'duplicate_event',
      message: 'Payment already failed'
    };
  }

  // EDGE CASE 2: Invalid state transition guard
  // Payment success arrives after failure
  // This could happen if:
  // 1. User retried payment and old webhook arrived late
  // 2. Webhook ordering issue (network delay)
  // 3. Malicious webhook replay attack
  if (event === 'payment.success' && order.paymentStatus === 'failed') {
    console.error(`[WEBHOOK] CRITICAL: Success webhook for already-failed order ${order.orderNumber}. Payment ID: ${mockPaymentId}`);
    console.error(`[WEBHOOK] This may indicate: (1) Late webhook after retry, (2) Webhook ordering issue, (3) Replay attack`);
    
    // CONSISTENCY OVER CONVENIENCE
    // Do NOT auto-resurrect failed orders
    // Manual admin review required to verify payment actually succeeded
    return {
      processed: false,
      reason: 'invalid_state_transition',
      message: 'Cannot mark failed payment as success. Manual review required.',
      severity: 'CRITICAL',
      requiresAdminReview: true,
      orderId: order._id,
      orderNumber: order.orderNumber,
      currentPaymentStatus: order.paymentStatus,
      attemptedTransition: 'failed -> success'
    };
  }

  // EDGE CASE 2 (reverse): Failure after success (rare but possible with race conditions)
  if (event === 'payment.failed' && order.paymentStatus === 'success') {
    console.error(`[WEBHOOK] CRITICAL: Failure webhook for already-successful order ${order.orderNumber}. Payment ID: ${mockPaymentId}`);
    console.error(`[WEBHOOK] This may indicate webhook race condition or replay attack`);
    
    // NEVER downgrade success to failure
    return {
      processed: false,
      reason: 'invalid_state_transition',
      message: 'Cannot mark successful payment as failed. Manual review required.',
      severity: 'CRITICAL',
      requiresAdminReview: true,
      orderId: order._id,
      orderNumber: order.orderNumber,
      currentPaymentStatus: order.paymentStatus,
      attemptedTransition: 'success -> failed'
    };
  }

  // Handle payment success (valid transition: pending -> success)
  if (event === 'payment.success') {
    if (order.paymentStatus !== 'pending') {
      console.warn(`[WEBHOOK] Success webhook for non-pending order ${order.orderNumber}. Current status: ${order.paymentStatus}`);
    }

    order.paymentStatus = 'success';
    order.status = 'confirmed';
    order.payment.transactionId = mockPaymentId || 'mock_txn_success';
    order.payment.paidAt = new Date();
    
    await order.save();

    console.log(`[WEBHOOK] Payment success for order ${order.orderNumber}`);
    
    return {
      processed: true,
      event: 'payment.success',
      orderId: order._id,
      orderNumber: order.orderNumber,
      paymentStatus: order.paymentStatus,
      orderStatus: order.status
    };
  }

  // Handle payment failure (valid transition: pending -> failed)
  if (event === 'payment.failed') {
    if (order.paymentStatus !== 'pending') {
      console.warn(`[WEBHOOK] Failure webhook for non-pending order ${order.orderNumber}. Current status: ${order.paymentStatus}`);
    }

    order.paymentStatus = 'failed';
    order.status = 'cancelled';
    order.payment.transactionId = mockPaymentId || 'mock_txn_failed';
    
    await order.save();

    console.log(`[WEBHOOK] Payment failed for order ${order.orderNumber}`);
    
    return {
      processed: true,
      event: 'payment.failed',
      orderId: order._id,
      orderNumber: order.orderNumber,
      paymentStatus: order.paymentStatus,
      orderStatus: order.status
    };
  }

  // Unknown event type
  console.warn(`[WEBHOOK] Unknown event type: ${event} for order ${order.orderNumber}`);
  
  return {
    processed: false,
    reason: 'unknown_event',
    message: `Unknown event type: ${event}`
  };
}

module.exports = {
  createMockPayment,
  handleMockWebhook
};
