const {
  getUserCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} = require('../services/cart.service');
const { HTTP_STATUS } = require('../constants/httpStatus');

const getCart = async (req, res, next) => {
  try {
    const cart = await getUserCart(req.user._id);
    res.status(HTTP_STATUS.OK).json({ success: true, data: cart });
  } catch (err) {
    next(err);
  }
};

const addItem = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;
    const cart = await addToCart(req.user._id, productId, quantity);
    res.status(HTTP_STATUS.OK).json({ success: true, data: cart });
  } catch (err) {
    next(err);
  }
};

const updateItem = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    const cart = await updateCartItem(req.user._id, productId, quantity);
    res.status(HTTP_STATUS.OK).json({ success: true, data: cart });
  } catch (err) {
    next(err);
  }
};

const removeItem = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const cart = await removeFromCart(req.user._id, productId);
    res.status(HTTP_STATUS.OK).json({ success: true, data: cart });
  } catch (err) {
    next(err);
  }
};

const clearUserCart = async (req, res, next) => {
  try {
    const cart = await clearCart(req.user._id);
    res.status(HTTP_STATUS.OK).json({ success: true, data: cart });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getCart,
  addItem,
  updateItem,
  removeItem,
  clearUserCart,
};
