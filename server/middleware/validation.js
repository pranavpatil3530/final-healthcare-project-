export const validateCheckIn = (req, res, next) => {
  const { moodRating, stressLevel, feelingsNotes } = req.body;

  // Validate mood rating
  if (!moodRating || typeof moodRating !== 'number' || moodRating < 1 || moodRating > 10) {
    return res.status(400).json({
      success: false,
      message: 'Mood rating must be a number between 1 and 10'
    });
  }

  // Validate stress level
  if (!stressLevel || typeof stressLevel !== 'number' || stressLevel < 1 || stressLevel > 10) {
    return res.status(400).json({
      success: false,
      message: 'Stress level must be a number between 1 and 10'
    });
  }

  // Validate feelings notes (optional)
  if (feelingsNotes && typeof feelingsNotes !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Feelings notes must be a string'
    });
  }

  if (feelingsNotes && feelingsNotes.length > 1000) {
    return res.status(400).json({
      success: false,
      message: 'Feelings notes cannot exceed 1000 characters'
    });
  }

  next();
};

export const validateAuth = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }

  if (typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Email and password must be strings'
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 6 characters long'
    });
  }

  next();
};