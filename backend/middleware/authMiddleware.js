// ============================================================
// middleware/authMiddleware.js — JWT Authentication Middleware
// ============================================================
// This middleware PROTECTS routes. Before the route handler runs,
// this function checks if the user has a valid JWT token.
// If not, it blocks the request with a 401 Unauthorized error.
//
// HOW JWT WORKS:
// 1. User logs in → server creates a signed token with user's ID
// 2. Client stores the token and sends it with every request
// 3. Server verifies the token on protected routes
// ============================================================

const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  // Check for token in the Authorization header: "Bearer <token>"
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extract the token part (remove "Bearer ")
      token = req.headers.authorization.split(' ')[1];

      // Verify and decode the token using our secret key
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach the user object to the request (without password)
      req.user = await User.findById(decoded.id).select('-password');

      // Pass control to the next middleware or route handler
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

module.exports = { protect };
