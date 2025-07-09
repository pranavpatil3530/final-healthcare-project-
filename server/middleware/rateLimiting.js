import dotenv from 'dotenv';
dotenv.config();

import rateLimit from 'express-rate-limit';
import MongoStore from 'rate-limit-mongo';

console.log("📡 Rate limiting URI:", process.env.MONGODB_URI); // Debug output

// Create MongoDB-backed store for rate limiting
const createMongoStore = () => {
  return new MongoStore({
    uri: process.env.MONGODB_URI,
    collectionName: 'rate_limits',
    expireTimeMs: 15 * 60 * 1000, // 15 minutes
    errorHandler: (err) => {
      console.warn('⚠️ Rate limiting MongoDB store error. Using memory store.', err.message);
    }
  });
};

// 📌 General API rate limiter
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, // limit each IP to 100 requests
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: process.env.NODE_ENV === 'development' ? undefined : createMongoStore(),
  keyGenerator: (req) => req.user?.id || req.ip
});

// ✅ Strict Auth Rate Limiter (combined into one)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'development' ? 1000 : 10,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: process.env.NODE_ENV === 'development' ? undefined : createMongoStore(),
  skipSuccessfulRequests: true
});

// ✅ Limiter for data export or analytics
export const analyticsLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: 'Too many analytics requests, please try again later.',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: process.env.NODE_ENV === 'development' ? undefined : createMongoStore(),
  keyGenerator: (req) => `analytics_${req.user?.id || req.ip}`
});

// ✅ Dynamic limiter based on user tier (Pro, Premium, etc.)
export const createDynamicLimiter = (getUserTier) => {
  return rateLimit({
    windowMs: 15 * 60 * 1000,
    max: async (req) => {
      const tier = await getUserTier(req.user?.id);
      switch (tier) {
        case 'premium': return 500;
        case 'pro': return 200;
        default: return 100;
      }
    },
    message: {
      success: false,
      message: 'Rate limit exceeded for your account tier.',
    },
    standardHeaders: true,
    legacyHeaders: false,
    store: process.env.NODE_ENV === 'development' ? undefined : createMongoStore()
  });
};
