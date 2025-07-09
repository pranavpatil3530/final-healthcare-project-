import mongoose from 'mongoose';

// Schema for storing aggregated analytics data
const analyticsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  period: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'yearly'],
    required: true,
    index: true
  },
  date: {
    type: Date,
    required: true,
    index: true
  },
  metrics: {
    totalCheckins: { type: Number, default: 0 },
    averageMood: { type: Number, default: 0 },
    averageStress: { type: Number, default: 0 },
    moodVariance: { type: Number, default: 0 },
    stressVariance: { type: Number, default: 0 },
    streakDays: { type: Number, default: 0 },
    topTags: [String],
    moodDistribution: {
      excellent: { type: Number, default: 0 }, // 9-10
      good: { type: Number, default: 0 },      // 7-8
      fair: { type: Number, default: 0 },      // 5-6
      poor: { type: Number, default: 0 },      // 3-4
      bad: { type: Number, default: 0 }        // 1-2
    },
    stressDistribution: {
      low: { type: Number, default: 0 },       // 1-3
      moderate: { type: Number, default: 0 },  // 4-6
      high: { type: Number, default: 0 },      // 7-8
      extreme: { type: Number, default: 0 }    // 9-10
    }
  },
  insights: [{
    type: String,
    message: String,
    severity: { type: String, enum: ['info', 'warning', 'alert'] },
    createdAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

// Compound indexes for efficient queries
analyticsSchema.index({ userId: 1, period: 1, date: -1 });
analyticsSchema.index({ period: 1, date: -1 });

// Static method to generate analytics
analyticsSchema.statics.generateAnalytics = async function(userId, period, date) {
  const CheckIn = mongoose.model('CheckIn');
  
  let startDate, endDate;
  
  switch (period) {
    case 'daily':
      startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      break;
    case 'weekly':
      startDate = new Date(date);
      startDate.setDate(date.getDate() - date.getDay());
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
      break;
    case 'monthly':
      startDate = new Date(date.getFullYear(), date.getMonth(), 1);
      endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
      break;
    case 'yearly':
      startDate = new Date(date.getFullYear(), 0, 1);
      endDate = new Date(date.getFullYear(), 11, 31, 23, 59, 59, 999);
      break;
  }
  
  const checkins = await CheckIn.find({
    userId,
    date: { $gte: startDate, $lte: endDate }
  });
  
  if (checkins.length === 0) {
    return null;
  }
  
  // Calculate metrics
  const totalCheckins = checkins.length;
  const averageMood = checkins.reduce((sum, c) => sum + c.moodRating, 0) / totalCheckins;
  const averageStress = checkins.reduce((sum, c) => sum + c.stressLevel, 0) / totalCheckins;
  
  // Calculate variance
  const moodVariance = checkins.reduce((sum, c) => sum + Math.pow(c.moodRating - averageMood, 2), 0) / totalCheckins;
  const stressVariance = checkins.reduce((sum, c) => sum + Math.pow(c.stressLevel - averageStress, 2), 0) / totalCheckins;
  
  // Calculate distributions
  const moodDistribution = { excellent: 0, good: 0, fair: 0, poor: 0, bad: 0 };
  const stressDistribution = { low: 0, moderate: 0, high: 0, extreme: 0 };
  
  checkins.forEach(checkin => {
    // Mood distribution
    if (checkin.moodRating >= 9) moodDistribution.excellent++;
    else if (checkin.moodRating >= 7) moodDistribution.good++;
    else if (checkin.moodRating >= 5) moodDistribution.fair++;
    else if (checkin.moodRating >= 3) moodDistribution.poor++;
    else moodDistribution.bad++;
    
    // Stress distribution
    if (checkin.stressLevel >= 9) stressDistribution.extreme++;
    else if (checkin.stressLevel >= 7) stressDistribution.high++;
    else if (checkin.stressLevel >= 4) stressDistribution.moderate++;
    else stressDistribution.low++;
  });
  
  // Get top tags
  const tagCounts = {};
  checkins.forEach(checkin => {
    checkin.tags?.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });
  const topTags = Object.entries(tagCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([tag]) => tag);
  
  // Generate insights
  const insights = [];
  
  if (averageMood < 4) {
    insights.push({
      type: 'mood_concern',
      message: 'Your average mood has been low recently. Consider reaching out for support.',
      severity: 'alert'
    });
  }
  
  if (averageStress > 7) {
    insights.push({
      type: 'stress_warning',
      message: 'Your stress levels have been high. Try some relaxation techniques.',
      severity: 'warning'
    });
  }
  
  if (moodVariance > 6) {
    insights.push({
      type: 'mood_volatility',
      message: 'Your mood has been quite variable. Consider tracking triggers.',
      severity: 'info'
    });
  }
  
  return {
    userId,
    period,
    date: startDate,
    metrics: {
      totalCheckins,
      averageMood: Math.round(averageMood * 10) / 10,
      averageStress: Math.round(averageStress * 10) / 10,
      moodVariance: Math.round(moodVariance * 10) / 10,
      stressVariance: Math.round(stressVariance * 10) / 10,
      topTags,
      moodDistribution,
      stressDistribution
    },
    insights
  };
};

export default mongoose.model('Analytics', analyticsSchema);