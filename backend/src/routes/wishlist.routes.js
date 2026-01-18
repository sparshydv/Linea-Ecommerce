const express = require('express');
const { addItem, getItems, removeItem } = require('../controllers/wishlist.controller');
const auth = require('../middleware/auth');

const router = express.Router();

// All wishlist routes require authentication
router.use(auth);

router.post('/', addItem);
router.get('/', getItems);
router.delete('/:productId', removeItem);

module.exports = router;
