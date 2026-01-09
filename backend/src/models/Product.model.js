const mongoose = require('mongoose');

const VariantSchema = new mongoose.Schema(
  {
    size: { type: String, trim: true },
    color: { type: String, trim: true },
    stock: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 160,
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true,
      index: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    tags: {
      type: [String],
      default: [],
      set: (vals) => vals.map((v) => v.toLowerCase()),
    },
    basePrice: {
      type: Number,
      required: true,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    finalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },
    inStock: {
      type: Boolean,
      default: false,
    },
    variants: {
      type: [VariantSchema],
      default: [],
    },
    images: {
      type: [
        new mongoose.Schema(
          {
            url: {
              type: String,
              required: true,
              trim: true,
              match: /^https?:\/\//i,
            },
            publicId: {
              type: String,
              trim: true,
            },
          },
          { _id: false }
        ),
      ],
      default: [],
      validate: {
        validator: function (arr) {
          return Array.isArray(arr) && arr.length <= 12;
        },
        message: 'Images array exceeds maximum length',
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: true },
  }
);

// Maintain pricing and stock flags at the model layer to keep controllers/services clean.
ProductSchema.pre('save', function productPreSave(next) {
  this.finalPrice = Math.max(this.basePrice - this.discount, 0);
  this.inStock = (this.stock ?? 0) > 0;
  next();
});

module.exports = mongoose.model('Product', ProductSchema);
