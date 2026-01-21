const express = require('express');
const { placeOrder, listUserOrders, getOrder } = require('../controllers/order.controller');
const auth = require('../middleware/auth');

const router = express.Router();

// All order routes require authentication
router.use(auth);

// POST /api/orders - Create order from cart
router.post('/', placeOrder);

// GET /api/orders - Get all orders for logged-in user (with pagination & filtering)
router.get('/', listUserOrders);

// GET /api/orders/:id - Get single order by ID (with authorization check)
router.get('/:id', getOrder);

module.exports = router;

/*
 * MOUNTING IN app.js:
 *
 * const orderRoutes = require('./routes/order.routes');
 * app.use('/api/orders', orderRoutes);
 *
 * This makes routes available at:
 * - POST /api/orders
 * - GET /api/orders
 * - GET /api/orders/:id
 */
