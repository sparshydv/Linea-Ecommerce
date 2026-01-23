const { createRazorpayOrder, verifyWebhookSignature, handleRazorpayWebhook } = require('../services/payment.service');
const { HTTP_STATUS } = require('../constants/httpStatus');
const logger = require('../utils/logger');

/**
 * Create Razorpay order for payment
 * POST /api/payments/razorpay/order
 * Protected: Requires authentication
 *
 * Body: { orderId }
 * Returns: { razorpayOrderId, amount, currency, keyId }
 */
const createRazorpayOrderHandler = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'orderId is required',
      });
    }

    const razorpayOrder = await createRazorpayOrder(orderId, userId);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Razorpay order created successfully',
      data: razorpayOrder,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Handle Razorpay webhook
 * POST /api/payments/razorpay/webhook
 * NOT protected: Public endpoint (signature verification instead)
 *
 * Header: X-Razorpay-Signature
 * Body: Razorpay event payload
 *
 * Critical: Always returns 200 OK to acknowledge receipt.
 * This prevents Razorpay retry storms. Internal errors are logged for manual intervention.
 */
const razorpayWebhookHandler = async (req, res, next) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    
    if (!signature) {
      logger.warn('Webhook received without signature');
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Signature required',
      });
    }

    // Verify webhook signature (prevent tampering)
    const isValid = verifyWebhookSignature(
      JSON.stringify(req.body),
      signature
    );

    if (!isValid) {
      logger.warn('Webhook signature verification failed');
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'Invalid signature',
      });
    }

    // Process webhook event
    let result;
    try {
      result = await handleRazorpayWebhook(req.body);
    } catch (err) {
      // Service layer threw error (e.g., order not found)
      // Log for manual intervention
      logger.error(`🚨 SERVICE ERROR in webhook: ${err.message}`, {
        error: err,
        body: req.body,
      });

      // CRITICAL: Still return 200 OK to Razorpay to prevent retry storm
      // (But log prominently for manual handling)
      result = {
        success: false,
        message: 'Webhook processing failed (logged for manual review)',
        error: err.message,
      };
    }

    // ====================================================================
    // CRITICAL: Always return 200 OK to acknowledge receipt
    // Even if DB write failed, webhook should return success
    // Idempotency on next retry will prevent duplicates
    // ====================================================================
    res.status(HTTP_STATUS.OK).json({
      success: result.success !== false,
      message: result.message,
      data: result,
    });
  } catch (err) {
    logger.error(`🚨 UNEXPECTED ERROR in webhook handler: ${err.message}`, {
      error: err,
      stack: err.stack,
    });

    // Even on unexpected error, return 200 OK
    res.status(HTTP_STATUS.OK).json({
      success: false,
      message: 'Webhook acknowledged but unexpected error occurred (logged for review)',
    });
  }
};

module.exports = {
  createRazorpayOrderHandler,
  razorpayWebhookHandler,
};
