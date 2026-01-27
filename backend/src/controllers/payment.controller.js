const paymentService = require('../services/payment.service');

/**
 * Payment Controller - Thin layer
 * Parse request → call service → format response
 */

/**
 * POST /api/payments/mock/intent
 * Create mock payment intent for an order
 */
async function createMockPaymentIntent(req, res, next) {
  try {
    const { orderId } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'orderId is required'
      });
    }

    // Call service
    const paymentIntent = await paymentService.createMockPayment(orderId, userId);

    // Return response
    res.status(200).json({
      success: true,
      data: paymentIntent
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/payments/mock/webhook
 * Handle mock payment gateway webhooks
 * No authentication required (simulates real gateway callbacks)
 */
async function handleMockPaymentWebhook(req, res, next) {
  try {
    const webhookPayload = req.body;

    // Call service
    const result = await paymentService.handleMockWebhook(webhookPayload);

    // Return response
    // Real gateways expect 200 OK to confirm webhook received
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createMockPaymentIntent,
  handleMockPaymentWebhook
};
