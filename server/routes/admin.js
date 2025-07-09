import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { dbMonitor } from '../utils/monitoring.js';
import { getCacheStats, clearAllCache } from '../middleware/cache.js';
import User from '../models/User.js';
import CheckIn from '../models/CheckIn.js';
import Analytics from '../models/Analytics.js';

const router = express.Router();

// Admin middleware (you can enhance this with role-based access)
const requireAdmin = async (req, res, next) => {
  try {
    // For now, check if user email contains 'admin' or implement proper role system
    if (!req.user.email.includes('admin')) {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Authorization error'
    });
  }
};

// Database health endpoint
router.get('/health', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const health = await dbMonitor.healthCheck();
    res.json({
      success: true,
      data: health
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Health check failed',
      error: error.message
    });
  }
});

// Detailed database statistics
router.get('/stats/database', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const stats = await dbMonitor.getDetailedStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get database stats',
      error: error.message
    });
  }
});

// Application statistics
router.get('/stats/app', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [userCount, checkinCount, todayCheckins] = await Promise.all([
      User.countDocuments({ isActive: true }),
      CheckIn.countDocuments(),
      CheckIn.countDocuments({
        createdAt: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      })
    ]);

    const cacheStats = getCacheStats();

    res.json({
      success: true,
      data: {
        users: {
          total: userCount,
          active: userCount // Assuming all users are active for now
        },
        checkins: {
          total: checkinCount,
          today: todayCheckins
        },
        cache: cacheStats,
        performance: dbMonitor.getMetrics()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get application stats',
      error: error.message
    });
  }
});

// User analytics
router.get('/analytics/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { period = 'daily', days = 30 } = req.query;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    
    const userGrowth = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: period === 'daily' ? '%Y-%m-%d' : '%Y-%m',
              date: '$createdAt'
            }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: {
        userGrowth,
        period,
        days: parseInt(days)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get user analytics',
      error: error.message
    });
  }
});

// Check-in analytics
router.get('/analytics/checkins', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { period = 'daily', days = 30 } = req.query;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    
    const checkinAnalytics = await CheckIn.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: period === 'daily' ? '%Y-%m-%d' : '%Y-%m',
              date: '$createdAt'
            }
          },
          count: { $sum: 1 },
          avgMood: { $avg: '$moodRating' },
          avgStress: { $avg: '$stressLevel' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Global mood distribution
    const moodDistribution = await CheckIn.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $bucket: {
          groupBy: '$moodRating',
          boundaries: [1, 3, 5, 7, 9, 11],
          default: 'other',
          output: {
            count: { $sum: 1 }
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        checkinTrends: checkinAnalytics,
        moodDistribution,
        period,
        days: parseInt(days)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get check-in analytics',
      error: error.message
    });
  }
});

// Clear cache
router.post('/cache/clear', authenticateToken, requireAdmin, async (req, res) => {
  try {
    clearAllCache();
    res.json({
      success: true,
      message: 'Cache cleared successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to clear cache',
      error: error.message
    });
  }
});

// Generate analytics for all users
router.post('/analytics/generate', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { period = 'monthly' } = req.body;
    const date = new Date();
    
    const users = await User.find({ isActive: true }).select('_id');
    const results = [];
    
    for (const user of users) {
      try {
        const analytics = await Analytics.generateAnalytics(user._id, period, date);
        if (analytics) {
          const saved = await Analytics.findOneAndUpdate(
            { userId: user._id, period, date: analytics.date },
            analytics,
            { upsert: true, new: true }
          );
          results.push(saved);
        }
      } catch (error) {
        console.error(`Failed to generate analytics for user ${user._id}:`, error);
      }
    }
    
    res.json({
      success: true,
      message: `Generated analytics for ${results.length} users`,
      data: { generated: results.length, total: users.length }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to generate analytics',
      error: error.message
    });
  }
});

export default router;