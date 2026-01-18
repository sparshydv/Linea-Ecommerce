const express = require('express');
const {
  getCart,
  addItem,
  updateItem,
  removeItem,
  clearUserCart,
} = require('../controllers/cart.controller');
const auth = require('../middleware/auth');

const router = express.Router();

// All cart routes require authentication
router.use(auth);

router.get('/', getCart); //show me my cart
router.post('/items', addItem); //add this product to my cart
router.put('/items/:productId', updateItem); //update/change quantity of this product in my cart
router.delete('/items/:productId', removeItem);
router.delete('/', clearUserCart); //clear my cart

module.exports = router;
