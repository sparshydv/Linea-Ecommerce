const paymentService = require('../services/payment.service');

async function createMockPaymentIntent(req, res, next) {
  try {
    const { orderId, paymentMethod } = req.body;
    const userId = req.user._id;

    if (!orderId) {
      return res.status(400).json({ success: false, message: 'orderId required' });
    }

    const data = await paymentService.createMockPayment(orderId, userId, paymentMethod);
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
