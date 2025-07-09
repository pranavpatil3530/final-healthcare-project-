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

// Init express app
const app = express();
const PORT = process.env.PORT || 5000;

// Connect to DB
connectDB();

// ✅✅ FINAL FIX: Global CORS + OPTIONS handler
const allowedOrigins = ['https://final-healthcare-project-s5kz.vercel.app'];

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }

  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204); // Preflight OK
  }

  next();
});

// ✅ Security
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// ✅ Performance + rate limiting
app.use(performanceMiddleware);
app.use(generalLimiter);

// ✅ Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ✅ Health check
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

// ✅ API Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/checkins', checkinRoutes);
app.use('/api/admin', adminRoutes);

// ✅ 404 Fallback
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
  });
});

// ✅ Global Error Handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.stack : undefined,
  });
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 Mental Health API server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`📈 Admin panel: http://localhost:${PORT}/api/admin/health`);
});

export default app;
