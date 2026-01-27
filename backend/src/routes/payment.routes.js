const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const authMiddleware = require('../middlewares/auth.middleware');

/**
 * Payment Routes - Mock Payment Gateway
 */

// POST /api/payments/mock/intent - Create mock payment intent (requires auth)
router.post('/mock/intent', authMiddleware, paymentController.createMockPaymentIntent);

// POST /api/payments/mock/webhook - Handle payment webhooks (NO auth - simulates gateway callbacks)
router.post('/mock/webhook', paymentController.handleMockPaymentWebhook);

module.exports = router;
