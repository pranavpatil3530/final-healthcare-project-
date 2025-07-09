import mongoose from 'mongoose';

const checkInSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  moodRating: {
    type: Number,
    required: true,
    min: 1,
    max: 10,
    index: true // For analytics queries
  },
  stressLevel: {
    type: Number,
    required: true,
    min: 1,
    max: 10,
    index: true // For analytics queries
  },
  feelingsNotes: {
    type: String,
    default: '',
    maxlength: 1000
  },
  encryptedNotes: {
    type: String,
    default: ''
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [0, 0]
    }
  },
  weather: {
    condition: String,
    temperature: Number,
    humidity: Number
  },
  activities: [{
    name: String,
    duration: Number, // in minutes
    intensity: { type: Number, min: 1, max: 5 }
  }],
  date: {
    type: Date,
    default: Date.now,
    index: true
  },
  version: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
});

// Compound indexes for scalability and performance
checkInSchema.index({ userId: 1, date: -1 });
checkInSchema.index({ userId: 1, createdAt: -1 });
checkInSchema.index({ userId: 1, moodRating: 1, date: -1 });
checkInSchema.index({ userId: 1, stressLevel: 1, date: -1 });
checkInSchema.index({ date: -1, moodRating: 1 }); // For global analytics
checkInSchema.index({ tags: 1, userId: 1 });

// Geospatial index for location-based features
checkInSchema.index({ location: '2dsphere' });

// Text index for searching notes
checkInSchema.index({ 
  feelingsNotes: 'text',
  tags: 'text'
});

// Ensure one check-in per user per day (with better error handling)
checkInSchema.index({ 
  userId: 1, 
  date: 1 
}, { 
  unique: true,
  name: 'unique_daily_checkin',
  partialFilterExpression: {
    date: { $type: "date" }
  }
});

// Pre-save middleware for data validation and processing
checkInSchema.pre('save', function(next) {
  // Ensure date is set to start of day for uniqueness
  if (this.isNew) {
    const date = new Date(this.date);
    date.setHours(0, 0, 0, 0);
    this.date = date;
  }
  
  // Auto-generate tags based on mood and stress levels
  if (this.isModified('moodRating') || this.isModified('stressLevel')) {
    this.tags = this.tags || [];
    
    // Add mood-based tags
    if (this.moodRating >= 8) this.tags.push('positive');
    else if (this.moodRating <= 3) this.tags.push('negative');
    else this.tags.push('neutral');
    
    // Add stress-based tags
    if (this.stressLevel >= 8) this.tags.push('high-stress');
    else if (this.stressLevel <= 3) this.tags.push('low-stress');
    else this.tags.push('moderate-stress');
    
    // Remove duplicates
    this.tags = [...new Set(this.tags)];
  }
  
  next();
});

// Static methods for analytics
checkInSchema.statics.getAggregatedStats = function(userId, startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        date: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: null,
        avgMood: { $avg: '$moodRating' },
        avgStress: { $avg: '$stressLevel' },
        maxMood: { $max: '$moodRating' },
        minMood: { $min: '$moodRating' },
        maxStress: { $max: '$stressLevel' },
        minStress: { $min: '$stressLevel' },
        totalCheckins: { $sum: 1 },
        moodTrend: { $push: { date: '$date', mood: '$moodRating', stress: '$stressLevel' } }
      }
    }
  ]);
};

checkInSchema.statics.getMoodTrends = function(userId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        date: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
        avgMood: { $avg: '$moodRating' },
        avgStress: { $avg: '$stressLevel' },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);
};
export default mongoose.model('CheckIn', checkInSchema);