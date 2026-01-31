const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const authMiddleware = require('../middleware/auth');

router.post('/mock/intent', authMiddleware, paymentController.createMockPaymentIntent);
router.post('/mock/webhook', paymentController.handleMockPaymentWebhook);

module.exports = router;
