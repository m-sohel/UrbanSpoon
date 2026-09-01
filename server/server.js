const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const inquiryRoutes = require('./routes/inquiryRoutes');
const errorHandler = require('./middleware/errorHandler');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root Welcome Route
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to the Urban Spoon API Server!',
    status: 'online',
    timestamp: new Date(),
    endpoints: {
      health: '/api/health',
      inquiries: '/api/inquiries',
    },
  });
});

// Health Check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'Urban Spoon API', timestamp: new Date() });
});

// API Routes
app.use('/api/inquiries', inquiryRoutes);

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`[Urban Spoon Server] Running on http://localhost:${PORT}`);
});
