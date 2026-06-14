const express = require('express');
const router  = express.Router();
const jwt     = require('jsonwebtoken');
const bcrypt  = require('bcryptjs');
const crypto  = require('crypto');
const User    = require('../models/User');
const { protect }      = require('../middleware/authMiddleware');
const { sendOTPEmail } = require('../utils/sendEmail');

// Helper: generate JWT token
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

// Helper: generate a cryptographically secure 6-digit OTP
const generateOTP = () =>
  crypto.randomInt(100000, 999999).toString();

// ---------------------------------------------------------------
// @route   POST /api/auth/register
// @desc    Register a new user & send OTP email
// ---------------------------------------------------------------
router.post('/register', async (req, res) => {
  const { fullName, email, password } = req.body;

  try {
    // Block if a verified account already exists
    const existingVerified = await User.findOne({ email, isVerified: true });
    if (existingVerified) {
      return res.status(400).json({ message: 'An account with this email already exists' });
    }

    // Delete any previous unverified attempt for this email
    await User.deleteOne({ email, isVerified: false });

    // Generate OTP and hash it before storing
    const otp       = generateOTP();
    const salt      = await bcrypt.genSalt(10);
    const hashedOtp = await bcrypt.hash(otp, salt);

    const otpExpiry = new Date(
      Date.now() + (parseInt(process.env.OTP_EXPIRE_MINUTES) || 10) * 60 * 1000
    );

    // Create user as UNVERIFIED
    await User.create({
      fullName,
      email,
      password,
      isVerified: false,
      otp: hashedOtp,
      otpExpiry,
    });

    // Send plain OTP (not the hash) to user's email
    await sendOTPEmail(email, fullName, otp);

    res.status(201).json({
      message: 'OTP sent to your email. Please verify to activate your account.',
      email,
    });
  } catch (error) {
    console.error('Register error:', error.message);
    res.status(500).json({ message: error.message });
  }
});

// ---------------------------------------------------------------
// @route   POST /api/auth/verify-otp
// @desc    Verify OTP and activate account
// ---------------------------------------------------------------
router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email }).select('+otp +otpExpiry');

    if (!user) {
      return res.status(400).json({ message: 'No account found. Please register again.' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'Account already verified. Please log in.' });
    }

    // Check expiry
    if (!user.otpExpiry || user.otpExpiry < new Date()) {
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    // Compare entered OTP with stored hash
    const isMatch = await bcrypt.compare(otp, user.otp);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid OTP. Please try again.' });
    }

    // Activate the account and clear OTP fields
    user.isVerified = true;
    user.otp        = undefined;
    user.otpExpiry  = undefined;
    await user.save();

    res.json({
      message: 'Email verified successfully! Welcome to NovBank.',
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      accountNumber: user.accountNumber,
      balance: user.balance,
      savingsBalance: user.savingsBalance,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('Verify OTP error:', error.message);
    res.status(500).json({ message: error.message });
  }
});

// ---------------------------------------------------------------
// @route   POST /api/auth/resend-otp
// @desc    Resend a fresh OTP
// ---------------------------------------------------------------
router.post('/resend-otp', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email, isVerified: false });

    if (!user) {
      return res.status(400).json({ message: 'No pending account found for this email.' });
    }

    const otp  = generateOTP();
    const salt = await bcrypt.genSalt(10);
    user.otp       = await bcrypt.hash(otp, salt);
    user.otpExpiry = new Date(
      Date.now() + (parseInt(process.env.OTP_EXPIRE_MINUTES) || 10) * 60 * 1000
    );
    await user.save();

    await sendOTPEmail(email, user.fullName, otp);

    res.json({ message: 'A new OTP has been sent to your email.' });
  } catch (error) {
    console.error('Resend OTP error:', error.message);
    res.status(500).json({ message: error.message });
  }
});

// ---------------------------------------------------------------
// @route   POST /api/auth/login
// @desc    Login user and return token
// ---------------------------------------------------------------
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Block login if email not verified
    if (!user.isVerified) {
      return res.status(401).json({
        message: 'Email not verified. Please check your inbox for the OTP.',
        needsVerification: true,
        email,
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      accountNumber: user.accountNumber,
      balance: user.balance,
      savingsBalance: user.savingsBalance,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ---------------------------------------------------------------
// @route   GET /api/auth/me
// @desc    Get currently logged-in user
// ---------------------------------------------------------------
router.get('/me', protect, async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({
    _id: user._id,
    fullName: user.fullName,
    email: user.email,
    accountNumber: user.accountNumber,
    balance: user.balance,
    savingsBalance: user.savingsBalance,
  });
});

module.exports = router;