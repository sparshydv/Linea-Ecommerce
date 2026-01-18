const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const healthRouter = require('./routes/health');
const productRouter = require('./routes/product.routes');
const authRouter = require('./routes/auth.routes');
const cartRouter = require('./routes/cart.routes');
const wishlistRouter = require('./routes/wishlist.routes');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Security headers
app.use(helmet());
// CORS configuration (default allows all; tighten as needed)
app.use(cors());
// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Request logging
app.use(morgan('combined'));

// Routes
app.use('/health', healthRouter);
app.use('/api/products', productRouter);
app.use('/api/auth', authRouter);
app.use('/api/cart', cartRouter);
app.use('/api/wishlist', wishlistRouter);

// 404 handler
app.use(notFound);
// Global error handler
app.use(errorHandler);

module.exports = app;
