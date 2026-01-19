const { getProducts, getProductBySlug, searchProducts } = require('../services/product.service');
const { HTTP_STATUS } = require('../constants/httpStatus');

const listProducts = async (req, res, next) => {
  try {
    const { page, limit, category, minPrice, maxPrice, newArrivals, sort } = req.query;
    const result = await getProducts({ page, limit, category, minPrice, maxPrice, newArrivals, sort });
    res.status(HTTP_STATUS.OK).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

const getProduct = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const product = await getProductBySlug(slug);
    if (!product) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .json({ success: false, message: 'Product not found' });
    }
    res.status(HTTP_STATUS.OK).json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};

const searchProductsHandler = async (req, res, next) => {
  try {
    const { q, category, minPrice, maxPrice, newArrivals, page, limit, sort } = req.query;
    const result = await searchProducts({ q, category, minPrice, maxPrice, newArrivals, page, limit, sort });
    res.status(HTTP_STATUS.OK).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listProducts,
  getProduct,
  searchProductsHandler,
};
