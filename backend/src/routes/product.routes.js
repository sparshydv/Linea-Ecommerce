const express = require('express');
const { listProducts, getProduct, searchProductsHandler } = require('../controllers/product.controller');

const router = express.Router();

router.get('/', listProducts);
router.get('/search', searchProductsHandler);
router.get('/:slug', getProduct);

module.exports = router;
