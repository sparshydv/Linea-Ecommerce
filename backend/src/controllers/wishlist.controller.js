const {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
} = require('../services/wishlist.service');
const { HTTP_STATUS } = require('../constants/httpStatus');

const addItem = async (req, res, next) => {
  try {
    const { productId } = req.body;
    const result = await addToWishlist(req.user.id, productId);
    res.status(HTTP_STATUS.CREATED).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

const getItems = async (req, res, next) => {
  try {
    const wishlist = await getWishlist(req.user.id);
    res.status(HTTP_STATUS.OK).json({ success: true, data: wishlist });
  } catch (err) {
    next(err);
  }
};

const removeItem = async (req, res, next) => {
  try {
    const { productId } = req.params;
    await removeFromWishlist(req.user.id, productId);
    res.status(HTTP_STATUS.OK).json({ success: true, message: 'Removed from wishlist' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  addItem,
  getItems,
  removeItem,
};
