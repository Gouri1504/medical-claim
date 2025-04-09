const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
const logger = require('./config/logger');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const claimRoutes = require('./routes/claimRoutes');
const aiTestRoutes = require('./routes/aiTestRoutes');

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/claims', claimRoutes);
app.use('/api/ai-test', aiTestRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(`Error: ${err.message}`);
  res.status(500).json({ 
    success: false, 
    error: 'Internal server error' 
  });
});

// MongoDB connection options
const mongoOptions = {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4
};

// Connect to MongoDB with retry
const connectWithRetry = async (retries = 5, interval = 5000) => {
  for (let i = 0; i < retries; i++) {
    try {
      await mongoose.connect(process.env.MONGODB_URI, mongoOptions);
      logger.info('MongoDB Connected Successfully');
      return true;
    } catch (err) {
      logger.error(`MongoDB connection attempt ${i + 1} failed: ${err.message}`);
      if (i < retries - 1) {
        logger.info(`Retrying in ${interval/1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, interval));
      } else {
        logger.error('Failed to connect to MongoDB after all retry attempts');
        throw err;
      }
    }
  }
  return false;
};

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    const connected = await connectWithRetry();
    if (!connected) {
      logger.error('Failed to connect to MongoDB after multiple attempts');
      process.exit(1);
    }

    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    logger.error(`Server startup error: ${error.message}`);
    process.exit(1);
  }
};

startServer();

module.exports = app; 