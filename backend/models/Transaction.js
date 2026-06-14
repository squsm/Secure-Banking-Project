// ============================================================
// models/Transaction.js — Transaction Schema & Model
// ============================================================

const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema(
  {
    // Reference to a User document — this creates a relationship between collections
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['deposit', 'withdrawal', 'transfer', 'payment'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['income', 'food', 'transport', 'shopping', 'bills', 'transfer', 'other'],
      default: 'other',
    },
    balanceAfter: {
      type: Number,
      required: true,
    },
    recipientName: {
      type: String,
      default: '',
    },
    recipientAccount: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'completed',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Transaction', TransactionSchema);
