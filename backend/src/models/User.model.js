const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      index: true,
    },
    password: {
      type: String,
      required: function requiredPassword() {
        return !this.googleId;
      },
      minlength: 6,
      select: false,
    },
    name: {
      type: String,
      trim: true,
      maxlength: 120,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    authProvider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local',
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
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

module.exports = mongoose.model('User', UserSchema);
