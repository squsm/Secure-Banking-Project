// ============================================================
// routes/transactionRoutes.js — Transaction History Routes
// ============================================================
// GET /api/transactions         — Get all transactions for user
// GET /api/transactions/:id     — Get single transaction
// GET /api/transactions/stats   — Get spending stats
// ============================================================

const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

// ---------------------------------------------------------------
// @route   GET /api/transactions
// @desc    Get all transactions for logged-in user
// ---------------------------------------------------------------
router.get('/', async (req, res) => {
  try {
    // Find all transactions belonging to this user
    // .sort({ createdAt: -1 }) returns newest first
    const transactions = await Transaction.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ---------------------------------------------------------------
// @route   GET /api/transactions/stats
// @desc    Get spending stats for the current month
// ---------------------------------------------------------------
router.get('/stats', async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // MongoDB aggregation pipeline — groups and summarizes data
    const stats = await Transaction.aggregate([
      {
        $match: {
          userId: req.user._id,
          createdAt: { $gte: startOfMonth },
          type: { $in: ['withdrawal', 'payment', 'transfer'] },
        },
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    // Total money in this month
    const totalIn = await Transaction.aggregate([
      {
        $match: {
          userId: req.user._id,
          createdAt: { $gte: startOfMonth },
          type: 'deposit',
        },
      },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    // Total money out this month
    const totalOut = await Transaction.aggregate([
      {
        $match: {
          userId: req.user._id,
          createdAt: { $gte: startOfMonth },
          type: { $in: ['withdrawal', 'payment', 'transfer'] },
        },
      },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    res.json({
      categoryBreakdown: stats,
      totalIn: totalIn[0]?.total || 0,
      totalOut: totalOut[0]?.total || 0,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ---------------------------------------------------------------
// @route   GET /api/transactions/:id
// @desc    Get a single transaction by ID
// ---------------------------------------------------------------
router.get('/:id', async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
