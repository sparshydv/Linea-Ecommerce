const Cart = require('../models/Cart.model');
const Product = require('../models/Product.model');

/**
 * Get or create cart for a user
 */
async function getUserCart(userId) {
  let cart = await Cart.findOne({ user: userId }).populate('items.product');
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }
  return cart;
}

/**
 * Add item to cart or increase quantity if already exists
 * Validates product exists, stock availability, and updates priceSnapshot
 */
async function addToCart(userId, productId, quantity = 1) {
  if (!productId || quantity < 1) {
    const error = new Error('Invalid product or quantity');
    error.statusCode = 400;
    throw error;
  }

  const product = await Product.findById(productId);
  if (!product) {
    const error = new Error('Product not found');
    error.statusCode = 404;
    throw error;
  }

  if (!product.isActive) {
    const error = new Error('Product is not available');
    error.statusCode = 400;
    throw error;
  }

  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }

  const existingItemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId.toString()
  );

  if (existingItemIndex > -1) {
    const newQuantity = cart.items[existingItemIndex].quantity + quantity;
    if (newQuantity > product.stock) {
      const error = new Error('Insufficient stock');
      error.statusCode = 400;
      throw error;
    }
    cart.items[existingItemIndex].quantity = newQuantity;
    cart.items[existingItemIndex].priceSnapshot = product.finalPrice;
  } else {
    if (quantity > product.stock) {
      const error = new Error('Insufficient stock');
      error.statusCode = 400;
      throw error;
    }
    cart.items.push({
      product: productId,
      quantity,
      priceSnapshot: product.finalPrice,
    });
  }

  await cart.save();
  return await Cart.findOne({ user: userId }).populate('items.product');
}

/**
 * Update cart item quantity
 * Validates stock and updates priceSnapshot
 */
async function updateCartItem(userId, productId, quantity) {
  if (!productId || quantity < 1) {
    const error = new Error('Invalid product or quantity');
    error.statusCode = 400;
    throw error;
  }

  const product = await Product.findById(productId);
  if (!product) {
    const error = new Error('Product not found');
    error.statusCode = 404;
    throw error;
  }

  if (quantity > product.stock) {
    const error = new Error('Insufficient stock');
    error.statusCode = 400;
    throw error;
  }

  const cart = await Cart.findOne({ user: userId });
  if (!cart) {
    const error = new Error('Cart not found');
    error.statusCode = 404;
    throw error;
  }

  const itemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId.toString()
  );

  if (itemIndex === -1) {
    const error = new Error('Item not in cart');
    error.statusCode = 404;
    throw error;
  }

  cart.items[itemIndex].quantity = quantity;
  cart.items[itemIndex].priceSnapshot = product.finalPrice;

  await cart.save();
  return await Cart.findOne({ user: userId }).populate('items.product');
}

/**
 * Remove item from cart
 */
async function removeFromCart(userId, productId) {
  if (!productId) {
    const error = new Error('Invalid product');
    error.statusCode = 400;
    throw error;
  }

  const cart = await Cart.findOne({ user: userId });
  if (!cart) {
    const error = new Error('Cart not found');
    error.statusCode = 404;
    throw error;
  }

  cart.items = cart.items.filter(
    (item) => item.product.toString() !== productId.toString()
  );

  await cart.save();
  return await Cart.findOne({ user: userId }).populate('items.product');
}

/**
 * Clear entire cart
 */
async function clearCart(userId) {
  const cart = await Cart.findOne({ user: userId });
  if (!cart) {
    return null;
  }
  cart.items = [];
  await cart.save();
  return cart;
}

module.exports = {
  getUserCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
};
