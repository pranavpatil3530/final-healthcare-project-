import express from 'express';
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

// Init app
const app = express();
const PORT = process.env.PORT || 5000;

// Connect to DB
connectDB();

// Apply helmet security
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// ✅✅ FINAL FIX: Handle CORS and preflight (OPTIONS) requests
const allowedOrigins = ['https://final-healthcare-project-s5kz.vercel.app'];

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
});

// Performance monitoring
app.use(performanceMiddleware);

// General rate limiting
app.use(generalLimiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Mental Health API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '2.0.0',
    features: ['mongodb', 'caching', 'rate-limiting', 'monitoring', 'analytics'],
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/checkins', checkinRoutes);
app.use('/api/admin', adminRoutes);

// 404 Handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);

  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.stack : undefined,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Mental Health API server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`📈 Admin panel: http://localhost:${PORT}/api/admin/health`);
});

export default app;
