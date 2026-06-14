// ============================================================
// server.js — The Entry Point of our Node.js + Express Server
// ============================================================
// Node.js is the runtime that lets us run JavaScript on the server.
// Express is a web framework built on Node.js that makes it easy
// to define routes, handle HTTP requests, and send responses.

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Create our Express application instance
const app = express();

// ---------------------------------------------------------------
// MIDDLEWARE
// Middleware are functions that run between a request and response.
// Every incoming request passes through these in order.
// ---------------------------------------------------------------
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json()); // Parses incoming JSON request bodies

// ---------------------------------------------------------------
// ROUTES
// Routes define what happens when a specific URL is hit.
// We separate them into files to keep the code organized.
// ---------------------------------------------------------------
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/account', require('./routes/accountRoutes'));
app.use('/api/transactions', require('./routes/transactionRoutes'));

// Root health-check route
app.get('/', (req, res) => {
  res.json({ message: '🏦 NovBank API is running!' });
});

// ---------------------------------------------------------------
// MONGODB CONNECTION (via Mongoose)
// Mongoose is an ODM (Object Data Modeling) library for MongoDB.
// It lets us define schemas and models for our data.
// ---------------------------------------------------------------
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    // Start the server only after DB connects
    app.listen(process.env.PORT, () => {
      console.log(`🚀 Server running on http://localhost:${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });
