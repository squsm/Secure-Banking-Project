// ============================================================
// routes/accountRoutes.js — Account Management Routes
// ============================================================
// All routes here are PROTECTED — the user must be logged in.
// GET  /api/account/balance
// POST /api/account/deposit
// POST /api/account/withdraw
// POST /api/account/transfer
// ============================================================

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { protect } = require('../middleware/authMiddleware');

// All routes below require authentication
router.use(protect);

// ---------------------------------------------------------------
// @route   GET /api/account/balance
// @desc    Get user's current balance
// ---------------------------------------------------------------
router.get('/balance', async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      balance: user.balance,
      savingsBalance: user.savingsBalance,
      accountNumber: user.accountNumber,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ---------------------------------------------------------------
// @route   POST /api/account/deposit
// @desc    Deposit money into checking account
// ---------------------------------------------------------------
router.post('/deposit', async (req, res) => {
  const { amount, description } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ message: 'Amount must be greater than 0' });
  }

  try {
    const user = await User.findById(req.user._id);
    user.balance += parseFloat(amount);
    await user.save();

    // Record the transaction in MongoDB
    const transaction = await Transaction.create({
      userId: user._id,
      type: 'deposit',
      amount: parseFloat(amount),
      description: description || 'Cash Deposit',
      category: 'income',
      balanceAfter: user.balance,
    });

    res.json({
      message: 'Deposit successful',
      balance: user.balance,
      transaction,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ---------------------------------------------------------------
// @route   POST /api/account/withdraw
// @desc    Withdraw money from checking account
// ---------------------------------------------------------------
router.post('/withdraw', async (req, res) => {
  const { amount, description, category } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ message: 'Amount must be greater than 0' });
  }

  try {
    const user = await User.findById(req.user._id);

    if (user.balance < amount) {
      return res.status(400).json({ message: 'Insufficient funds' });
    }

    user.balance -= parseFloat(amount);
    await user.save();

    const transaction = await Transaction.create({
      userId: user._id,
      type: 'withdrawal',
      amount: parseFloat(amount),
      description: description || 'Cash Withdrawal',
      category: category || 'other',
      balanceAfter: user.balance,
    });

    res.json({
      message: 'Withdrawal successful',
      balance: user.balance,
      transaction,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ---------------------------------------------------------------
// @route   POST /api/account/transfer
// @desc    Transfer money to another account
// ---------------------------------------------------------------
router.post('/transfer', async (req, res) => {
  const { amount, recipientAccount, recipientName, description } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ message: 'Amount must be greater than 0' });
  }

  try {
    const sender = await User.findById(req.user._id);

    if (sender.balance < amount) {
      return res.status(400).json({ message: 'Insufficient funds' });
    }

    // Find recipient by account number
    const recipient = await User.findOne({ accountNumber: recipientAccount });

    sender.balance -= parseFloat(amount);
    await sender.save();

    // Credit recipient if they exist in our system
    if (recipient) {
      recipient.balance += parseFloat(amount);
      await recipient.save();

      // Credit transaction for recipient
      await Transaction.create({
        userId: recipient._id,
        type: 'deposit',
        amount: parseFloat(amount),
        description: `Transfer from ${sender.fullName}`,
        category: 'transfer',
        balanceAfter: recipient.balance,
        recipientName: sender.fullName,
      });
    }

    // Debit transaction for sender
    const transaction = await Transaction.create({
      userId: sender._id,
      type: 'transfer',
      amount: parseFloat(amount),
      description: description || `Transfer to ${recipientName}`,
      category: 'transfer',
      balanceAfter: sender.balance,
      recipientName: recipientName || 'External Account',
      recipientAccount,
    });

    res.json({
      message: 'Transfer successful',
      balance: sender.balance,
      transaction,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
