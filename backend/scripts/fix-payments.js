const fs = require("fs");
const path = require("path");

function write(file, content) {
  fs.writeFileSync(path.resolve(file), content, { encoding: "utf8" });
  console.log("✔ written:", file);
}

/* ================= payment.service.js ================= */

write(
  "src/services/payment.service.js",
`const Order = require('../models/Order.model');
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

  if (order.paymentStatus === 'success') {
    const err = new Error('Payment already completed');
    err.statusCode = 400;
    throw err;
  }

  if (order.paymentStatus === 'failed') {
    order.paymentStatus = 'pending';
    order.status = 'pending';
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

  if (event === 'payment.success' && order.paymentStatus === 'success') {
    return { processed: false, reason: 'duplicate_success' };
  }

  if (event === 'payment.failed' && order.paymentStatus === 'failed') {
    return { processed: false, reason: 'duplicate_failure' };
  }

  if (event === 'payment.success') {
    order.paymentStatus = 'success';
    order.status = 'confirmed';
    order.payment = {
      transactionId: mockPaymentId,
      paidAt: new Date()
    };
    await order.save();
    return { processed: true };
  }

  if (event === 'payment.failed') {
    order.paymentStatus = 'failed';
    order.status = 'cancelled';
    await order.save();
    return { processed: true };
  }

  return { processed: false, reason: 'unknown_event' };
}

module.exports = { createMockPayment, handleMockWebhook };
`
);

/* ================= payment.controller.js ================= */

write(
  "src/controllers/payment.controller.js",
`const paymentService = require('../services/payment.service');

async function createMockPaymentIntent(req, res, next) {
  try {
    const { orderId } = req.body;
    const userId = req.user._id;

    if (!orderId) {
      return res.status(400).json({ success: false, message: 'orderId required' });
    }

    const data = await paymentService.createMockPayment(orderId, userId);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function handleMockPaymentWebhook(req, res, next) {
  try {
    const result = await paymentService.handleMockWebhook(req.body);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createMockPaymentIntent,
  handleMockPaymentWebhook
};
`
);

/* ================= payment.routes.js ================= */

write(
  "src/routes/payment.routes.js",
`const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const authMiddleware = require('../middleware/auth');

router.post('/mock/intent', authMiddleware, paymentController.createMockPaymentIntent);
router.post('/mock/webhook', paymentController.handleMockPaymentWebhook);

module.exports = router;
`
);

console.log("✅ Payment system recreated cleanly");
