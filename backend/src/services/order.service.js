const Order = require('../models/Order.model');
const Cart = require('../models/Cart.model');
const Product = require('../models/Product.model');

/**
 * Generate unique, human-readable order number
 * Format: ORD-YYYYMMDD-XXXXX (where XXXXX is incrementing counter for that day)
 * Example: ORD-20260121-00001
 */
async function generateOrderNumber() {
  const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const countToday = await Order.countDocuments({
    createdAt: {
      $gte: new Date(new Date().setHours(0, 0, 0, 0)),
      $lt: new Date(new Date().setHours(23, 59, 59, 999)),
    },
  });
  const counter = String(countToday + 1).padStart(5, '0');
  return `ORD-${dateStr}-${counter}`;
}

/**
 * Create order from user's cart
 * - Validates cart is not empty
 * - Freezes cart items as order items (snapshots)
 * - Calculates pricing breakdown (subtotal, tax, shipping, total)
 * - Generates unique orderNumber
 * - Saves order
 * - Clears user's cart
 *
 * @param {string} userId - User ID from auth middleware
 * @param {object} orderOptions - { shippingAddress, shippingCost (default 0), taxRate (default 0.1) }
 * @returns {object} Created order document
 * @throws {Error} If cart empty, unauthorized, or DB error
 */
async function createOrderFromCart(userId, orderOptions = {}) {
  const { shippingAddress = 'TBD', shippingCost = 0, taxRate = 0.1 } = orderOptions;

  if (!userId) {
    const error = new Error('User ID required');
    error.statusCode = 400;
    throw error;
  }

  // Fetch user's cart with populated product details
  const cart = await Cart.findOne({ user: userId }).populate('items.product');
  if (!cart || !cart.items || cart.items.length === 0) {
    const error = new Error('Cart is empty. Cannot create order.');
    error.statusCode = 400;
    throw error;
  }

  // Build order items from cart (freeze snapshots)
  const orderItems = cart.items.map((cartItem) => {
    const product = cartItem.product;
    if (!product) {
      throw new Error('Product not found in cart');
    }
    return {
      product: product._id,
      // Snapshot: Product name at time of order
      name: product.name,
      // Snapshot: Price from cart (already calculated at add-to-cart time)
      price: cartItem.priceSnapshot,
      quantity: cartItem.quantity,
    };
  });

  // Calculate pricing breakdown
  const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = parseFloat((subtotal * taxRate).toFixed(2));
  const shipping = parseFloat(shippingCost);
  const totalAmount = parseFloat((subtotal + tax + shipping).toFixed(2));

  // Generate unique order number
  const orderNumber = await generateOrderNumber();

  // Create order document
  const order = await Order.create({
    user: userId,
    orderNumber,
    items: orderItems,
    pricing: {
      subtotal: parseFloat(subtotal.toFixed(2)),
      tax,
      shipping,
      totalAmount,
    },
    status: 'pending',
    payment: {
      method: 'cod', // Default to Cash on Delivery
      status: 'pending',
    },
    shippingAddress,
  });

  // Clear user's cart after successful order creation
  await Cart.updateOne({ user: userId }, { items: [] });

  // Return populated order
  return order.populate('items.product');
}

/**
 * Get all orders for a user (with pagination)
 *
 * @param {string} userId - User ID
 * @param {object} options - { page, limit, status }
 * @returns {object} { items: [orders], pagination: {...} }
 */
async function getUserOrders(userId, options = {}) {
  const { page = 1, limit = 10, status } = options;

  if (!userId) {
    const error = new Error('User ID required');
    error.statusCode = 400;
    throw error;
  }

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 50);

  const filter = { user: userId };
  if (status) {
    filter.status = status;
  }

  const skip = (pageNum - 1) * limitNum;

  const [items, total] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('items.product', 'name')
      .lean(),
    Order.countDocuments(filter),
  ]);

  return {
    items,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
    },
  };
}

/**
 * Get order by ID with authorization check
 * Ensures order belongs to requesting user (prevent unauthorized access)
 *
 * @param {string} orderId - Order ID
 * @param {string} userId - User ID (for authorization)
 * @returns {object} Order document with populated items
 * @throws {Error} If order not found or user unauthorized
 */
async function getOrderById(orderId, userId) {
  if (!orderId || !userId) {
    const error = new Error('Order ID and User ID required');
    error.statusCode = 400;
    throw error;
  }

  const order = await Order.findOne({
    _id: orderId,
    user: userId, // Ensure user owns this order
  }).populate('items.product', 'name slug');

  if (!order) {
    const error = new Error('Order not found or unauthorized');
    error.statusCode = 404;
    throw error;
  }

  return order;
}

/**
 * Cancel an order (admin or owner only)
 * Only allows cancellation if status is pending or confirmed
 *
 * @param {string} orderId - Order ID
 * @param {string} userId - User ID (for authorization)
 * @returns {object} Updated order
 */
async function cancelOrder(orderId, userId) {
  if (!orderId || !userId) {
    const error = new Error('Order ID and User ID required');
    error.statusCode = 400;
    throw error;
  }

  const order = await Order.findOne({ _id: orderId, user: userId });

  if (!order) {
    const error = new Error('Order not found or unauthorized');
    error.statusCode = 404;
    throw error;
  }

  if (order.status !== 'pending' && order.status !== 'confirmed') {
    const error = new Error(
      `Cannot cancel order with status "${order.status}". Only pending or confirmed orders can be cancelled.`
    );
    error.statusCode = 400;
    throw error;
  }

  order.status = 'cancelled';
  await order.save();

  return order;
}

module.exports = {
  createOrderFromCart,
  getUserOrders,
  getOrderById,
  cancelOrder,
};
