const { createOrderFromCart, getUserOrders, getOrderById } = require('../services/order.service');
const { HTTP_STATUS } = require('../constants/httpStatus');

/**
 * Create order from user's cart
 * POST /api/orders
 * Protected: Requires authentication
 *
 * Body: { shippingAddress?, shippingCost?, taxRate?, paymentMethod? }
 */
const placeOrder = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { shippingAddress, shippingCost, taxRate, paymentMethod } = req.body;

    const order = await createOrderFromCart(userId, {
      shippingAddress,
      shippingCost,
      taxRate,
      paymentMethod,
    });

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Order placed successfully',
      data: order,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get all orders for logged-in user
 * GET /api/orders?page=1&limit=10&status=pending
 * Protected: Requires authentication
 */
const listUserOrders = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { page, limit, status } = req.query;

    const result = await getUserOrders(userId, { page, limit, status });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get single order by ID
 * GET /api/orders/:id
 * Protected: Requires authentication
 * Authorization: User can only view their own orders
 */
const getOrder = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { id: orderId } = req.params;

    const order = await getOrderById(orderId, userId);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: order,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  placeOrder,
  listUserOrders,
  getOrder,
};
