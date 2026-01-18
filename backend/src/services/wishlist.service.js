const Wishlist = require('../models/Wishlist.model');
const Product = require('../models/Product.model');

/**
 * Add product to user's wishlist
 * Validates product exists and is active
 * Prevents duplicate entries via unique index
 */
async function addToWishlist(userId, productId) {
  if (!productId) {
    const error = new Error('Product ID is required');
    error.statusCode = 400;
    throw error;
  }

  // Validate product exists and is active
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

  try {
    const wishlistItem = await Wishlist.create({ user: userId, product: productId });
    return await Wishlist.findById(wishlistItem._id).populate('product');
  } catch (err) {
    // Handle duplicate entry (MongoDB unique index violation)
    if (err.code === 11000) {
      const dupError = new Error('Product already in wishlist');
      dupError.statusCode = 409;
      throw dupError;
    }
    throw err;
  }
}

/**
 * Get all wishlist items for a user
 * Populates product data (name, price, images, etc.)
 */
async function getWishlist(userId) {
  const wishlist = await Wishlist.find({ user: userId })
    .populate({
      path: 'product',
      select: 'name slug basePrice discount finalPrice images category isActive',
    })
    .sort({ createdAt: -1 });

  return wishlist;
}

/**
 * Remove product from user's wishlist
 */
async function removeFromWishlist(userId, productId) {
  if (!productId) {
    const error = new Error('Product ID is required');
    error.statusCode = 400;
    throw error;
  }

  const result = await Wishlist.findOneAndDelete({
    user: userId,
    product: productId,
  });

  if (!result) {
    const error = new Error('Item not in wishlist');
    error.statusCode = 404;
    throw error;
  }

  return result;
}

/**
 * Check if product is in user's wishlist
 * Utility for frontend (e.g., show "Remove from wishlist" button)
 */
async function isInWishlist(userId, productId) {
  const item = await Wishlist.findOne({ user: userId, product: productId });
  return !!item;
}

module.exports = {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
  isInWishlist,
};
