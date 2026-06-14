const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false,
    },
    accountNumber: {
      type: String,
      unique: true,
    },
    balance: {
      type: Number,
      default: 5000.00,
    },
    savingsBalance: {
      type: Number,
      default: 0,
    },
    avatar: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },

    // ── Email OTP Verification ──────────────────────────────
    // isVerified: false means registered but not yet confirmed via OTP
    isVerified: {
      type: Boolean,
      default: false,
    },
    // Hashed OTP code
    otp: {
      type: String,
      select: false,
    },
    // OTP expiry timestamp
    otpExpiry: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare entered password with hashed one
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate account number on first save
UserSchema.pre('save', function (next) {
  if (!this.accountNumber) {
    this.accountNumber = Math.floor(1000000000 + Math.random() * 9000000000).toString();
  }
  next();
});

module.exports = mongoose.model('User', UserSchema);