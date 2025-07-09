import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import authRoutes from './routes/auth.js';
import checkinRoutes from './routes/checkins.js';
import adminRoutes from './routes/admin.js';
import { generalLimiter, authLimiter } from './middleware/rateLimiting.js';
import { performanceMiddleware } from './utils/monitoring.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to database
connectDB();

// Performance monitoring
app.use(performanceMiddleware);

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Apply general rate limiting
app.use(generalLimiter);

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
 res.json({
  success: true,
  message: 'Mental Health API is running',
  timestamp: new Date().toISOString(),
  environment: process.env.NODE_ENV || 'development',
  version: '2.0.0',
  features: ['mongodb', 'caching', 'rate-limiting', 'monitoring', 'analytics']
});
});

// API routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/checkins', checkinRoutes);
app.use('/api/admin', adminRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.stack : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Mental Health API server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`📈 Admin panel: http://localhost:${PORT}/api/admin/health`);
  console.log(`🎯 Features: MongoDB, Caching, Rate Limiting, Monitoring, Analytics`);
});

export default app;