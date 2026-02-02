const Order = require('../models/Order.model');
const crypto = require('crypto');

async function createMockPayment(orderId, userId) {
  const order = await Order.findById(orderId);

  if (!order) {
    const err = new Error('Order not found');
    err.statusCode = 404;
    throw err;
  }

  if (!userId) {
    const err = new Error('User ID required');
    err.statusCode = 400;
    throw err;
  }

  if (!order.user || order.user.toString() !== userId.toString()) {
    const err = new Error('Not authorized to access this order');
    err.statusCode = 403;
    throw err;
  }

  if (order.payment.status === 'success') {
    const err = new Error('Payment already completed');
    err.statusCode = 400;
    throw err;
  }

  if (order.payment.status === 'failed') {
    order.payment.status = 'pending';
    order.status = 'pending';
    await order.save();
  }

  // Set payment method if not already set
  if (!order.payment.method) {
    order.payment.method = 'credit_card'; // Default for mock payments
    await order.save();
  }

  const mockPaymentId = 'mock_pay_' + crypto.randomBytes(16).toString('hex');
  const mockClientSecret = 'mock_secret_' + crypto.randomBytes(24).toString('hex');

  return {
    mockPaymentId,
    mockClientSecret,
    amount: order.pricing.totalAmount,
    currency: 'INR',
    orderId: order._id,
    orderNumber: order.orderNumber
  };
}

async function handleMockWebhook(payload) {
  const { event, mockPaymentId, orderId } = payload;

  if (!event || !orderId) {
    const err = new Error('event and orderId are required');
    err.statusCode = 400;
    throw err;
  }

  const order = await Order.findById(orderId);
  if (!order) {
    const err = new Error('Order not found');
    err.statusCode = 404;
    throw err;
  }

  // Check for duplicate events (same state being set again)
  if (event === 'payment.success' && order.payment.status === 'success') {
    return { processed: false, reason: 'duplicate_success' };
  }

  if (event === 'payment.failed' && order.payment.status === 'failed') {
    return { processed: false, reason: 'duplicate_failure' };
  }

  // Check for invalid state transitions (critical edge cases)
  // Success after failure OR failure after success - both are invalid
  if (event === 'payment.success' && order.payment.status === 'failed') {
    return { 
      processed: false, 
      reason: 'invalid_state_transition',
      requiresAdminReview: true,
      severity: 'CRITICAL'
    };
  }

  if (event === 'payment.failed' && order.payment.status === 'success') {
    return { 
      processed: false, 
      reason: 'invalid_state_transition',
      requiresAdminReview: true,
      severity: 'CRITICAL'
    };
  }

  if (event === 'payment.success') {
    order.payment.status = 'success';
    order.payment.transactionId = mockPaymentId;
    order.payment.paidAt = new Date();
    order.status = 'confirmed';
    await order.save();
    return { processed: true };
  }

  if (event === 'payment.failed') {
    order.payment.status = 'failed';
    order.status = 'cancelled';
    await order.save();
    return { processed: true };
  }

  return { processed: false, reason: 'unknown_event' };
}

module.exports = { createMockPayment, handleMockWebhook };
