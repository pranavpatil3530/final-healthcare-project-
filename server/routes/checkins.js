import express from 'express';
import CheckIn from '../models/CheckIn.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateCheckIn } from '../middleware/validation.js';
import { encrypt, decrypt } from '../utils/encryption.js';

const router = express.Router();

// Create a new check-in
router.post('/', authenticateToken, validateCheckIn, async (req, res) => {
  try {
    const { moodRating, stressLevel, feelingsNotes } = req.body;
    const userId = req.user._id;

    // Check if user already has a check-in for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingCheckIn = await CheckIn.findOne({
      userId,
      date: { $gte: today, $lt: tomorrow }
    });

    if (existingCheckIn) {
      return res.status(400).json({
        success: false,
        message: 'You have already completed a check-in for today'
      });
    }

    // Encrypt feelings notes if provided
    const encryptedNotes = feelingsNotes ? encrypt(feelingsNotes) : '';

    // Create new check-in
    const checkIn = new CheckIn({
      userId,
      moodRating,
      stressLevel,
      feelingsNotes: '', // Store empty string for security
      encryptedNotes,
      date: new Date()
    });

    await checkIn.save();

    // Return check-in with decrypted notes
    const responseCheckIn = {
      ...checkIn.toObject(),
      feelingsNotes: feelingsNotes || '',
      encryptedNotes: undefined // Don't send encrypted data to client
    };

    res.status(201).json({
      success: true,
      message: 'Check-in created successfully',
      data: responseCheckIn
    });
  } catch (error) {
    console.error('Check-in creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create check-in',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get user's check-ins
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const { limit = 30, page = 1 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const checkIns = await CheckIn.find({ userId })
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    // Decrypt notes for response
    const decryptedCheckIns = checkIns.map(checkIn => ({
      ...checkIn.toObject(),
      feelingsNotes: checkIn.encryptedNotes ? decrypt(checkIn.encryptedNotes) : '',
      encryptedNotes: undefined // Don't send encrypted data to client
    }));

    res.json({
      success: true,
      data: decryptedCheckIns
    });
  } catch (error) {
    console.error('Get check-ins error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get check-ins',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get check-in statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;

    // Get all check-ins for the user
    const checkIns = await CheckIn.find({ userId }).sort({ date: -1 });

    if (checkIns.length === 0) {
      return res.json({
        success: true,
        data: {
          totalCheckins: 0,
          averageMood: 0,
          averageStress: 0,
          streak: 0,
          moodTrend: []
        }
      });
    }

    // Calculate statistics
    const totalCheckins = checkIns.length;
    const averageMood = checkIns.reduce((sum, c) => sum + c.moodRating, 0) / totalCheckins;
    const averageStress = checkIns.reduce((sum, c) => sum + c.stressLevel, 0) / totalCheckins;

    // Calculate streak (consecutive days)
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < checkIns.length; i++) {
      const checkInDate = new Date(checkIns[i].date);
      checkInDate.setHours(0, 0, 0, 0);
      
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);

      if (checkInDate.getTime() === expectedDate.getTime()) {
        streak++;
      } else {
        break;
      }
    }

    // Get mood trend for last 7 days
    const moodTrend = checkIns.slice(0, 7).reverse().map(checkIn => ({
      date: checkIn.date,
      mood: checkIn.moodRating,
      stress: checkIn.stressLevel
    }));

    res.json({
      success: true,
      data: {
        totalCheckins,
        averageMood: Math.round(averageMood * 10) / 10,
        averageStress: Math.round(averageStress * 10) / 10,
        streak,
        moodTrend
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Update a check-in (same day only)
router.put('/:id', authenticateToken, validateCheckIn, async (req, res) => {
  try {
    const { id } = req.params;
    const { moodRating, stressLevel, feelingsNotes } = req.body;
    const userId = req.user._id;

    const checkIn = await CheckIn.findOne({ _id: id, userId });
    
    if (!checkIn) {
      return res.status(404).json({
        success: false,
        message: 'Check-in not found'
      });
    }

    // Check if check-in is from today (allow updates only for today's check-in)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkInDate = new Date(checkIn.date);
    checkInDate.setHours(0, 0, 0, 0);

    if (checkInDate.getTime() !== today.getTime()) {
      return res.status(400).json({
        success: false,
        message: 'Can only update today\'s check-in'
      });
    }

    // Update check-in
    checkIn.moodRating = moodRating;
    checkIn.stressLevel = stressLevel;
    checkIn.encryptedNotes = feelingsNotes ? encrypt(feelingsNotes) : '';
    
    await checkIn.save();

    // Return updated check-in with decrypted notes
    const responseCheckIn = {
      ...checkIn.toObject(),
      feelingsNotes: feelingsNotes || '',
      encryptedNotes: undefined
    };

    res.json({
      success: true,
      message: 'Check-in updated successfully',
      data: responseCheckIn
    });
  } catch (error) {
    console.error('Update check-in error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update check-in',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Delete a check-in
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const checkIn = await CheckIn.findOneAndDelete({ _id: id, userId });
    
    if (!checkIn) {
      return res.status(404).json({
        success: false,
        message: 'Check-in not found'
      });
    }

    res.json({
      success: true,
      message: 'Check-in deleted successfully'
    });
  } catch (error) {
    console.error('Delete check-in error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete check-in',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;