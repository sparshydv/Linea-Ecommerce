const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    // Snapshot: Product name at time of order
    name: {
      type: String,
      required: true,
      trim: true,
    },
    // Snapshot: Price paid per unit (not live product price)
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { _id: true, timestamps: false }
);

const OrderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    // Human-readable order identifier (e.g., ORD-20260121-001)
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    // Array of items purchased (snapshots from cart)
    items: {
      type: [OrderItemSchema],
      required: true,
      validate: {
        validator: function (arr) {
          return Array.isArray(arr) && arr.length > 0;
        },
        message: 'Order must contain at least one item',
      },
    },
    // Pricing breakdown
    pricing: {
      subtotal: {
        type: Number,
        required: true,
        min: 0,
      },
      tax: {
        type: Number,
        required: true,
        min: 0,
        default: 0,
      },
      shipping: {
        type: Number,
        required: true,
        min: 0,
        default: 0,
      },
      totalAmount: {
        type: Number,
        required: true,
        min: 0,
      },
    },
    // Order status lifecycle
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
      index: true,
    },
    // Payment information
    payment: {
      method: {
        type: String,
        required: true,
        enum: ['credit_card', 'debit_card', 'paypal', 'bank_transfer', 'cod'],
      },
      status: {
        type: String,
        enum: ['pending', 'success', 'failed'],
        default: 'pending',
      },
      reference: {
        type: String,
        trim: true,
      },
    },
    // Delivery address (placeholder for Phase 6.2+)
    shippingAddress: {
      type: String,
      required: true,
    },
    // Optional notes
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: true },
  }
);

// Index for common queries
OrderSchema.index({ user: 1, status: 1 });
OrderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Order', OrderSchema);
