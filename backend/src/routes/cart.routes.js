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

router.get('/', getCart);
router.post('/items', addItem);
router.put('/items/:productId', updateItem);
router.delete('/items/:productId', removeItem);
router.delete('/', clearUserCart);

module.exports = router;
