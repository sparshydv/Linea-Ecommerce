const express = require('express');
const { createRazorpayOrderHandler, razorpayWebhookHandler } = require('../controllers/payment.controller');
const auth = require('../middleware/auth');

const router = express.Router();

// Protected routes (require authentication)
router.post('/razorpay/order', auth, createRazorpayOrderHandler);

// Public webhook route (NO auth middleware - signature verification instead)
router.post('/razorpay/webhook', razorpayWebhookHandler);

module.exports = router;

/*
 * MOUNTING IN app.js:
 *
 * const paymentRoutes = require('./routes/payment.routes');
 * app.use('/api/payments', paymentRoutes);
 *
 * This makes routes available at:
 * - POST /api/payments/razorpay/order (protected)
 * - POST /api/payments/razorpay/webhook (public, signature-verified)
 */

