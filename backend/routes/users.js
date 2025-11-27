const express = require('express');
const User = require('../models/User');
const Problem = require('../models/Problem');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get user profile with detailed statistics
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get additional statistics
    const totalProblems = await Problem.countDocuments({
      user: req.user._id,
      status: 'Solved'
    });

    const problemsByPlatform = await Problem.aggregate([
      { $match: { user: req.user._id, status: 'Solved' } },
      { $group: { _id: '$platform', count: { $sum: 1 } } }
    ]);

    const problemsByDifficulty = await Problem.aggregate([
      { $match: { user: req.user._id, status: 'Solved' } },
      { $group: { _id: '$platformDifficulty', count: { $sum: 1 } } }
    ]);

    const problemsByCategory = await Problem.aggregate([
      { $match: { user: req.user._id, status: 'Solved' } },
      { $group: { _id: '$mainCategory', count: { $sum: 1 } } }
    ]);

    // Calculate best week
    const weeklyStats = await Problem.aggregate([
      { $match: { user: req.user._id, status: 'Solved' } },
      {
        $group: {
          _id: {
            year: { $year: '$solveDate' },
            week: { $week: '$solveDate' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 1 }
    ]);

    const bestWeek = weeklyStats.length > 0 ? weeklyStats[0].count : 0;

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
        platformUsernames: user.platformUsernames,
        preferences: user.preferences,
        statistics: {
          ...user.statistics,
          totalProblems,
          bestWeek
        },
        detailedStats: {
          problemsByPlatform,
          problemsByDifficulty,
          problemsByCategory
        }
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/update-preferences
// @desc    Update user preferences
// @access  Private
router.put('/update-preferences', auth, async (req, res) => {
  try {
    const { preferences } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { preferences: { ...req.user.preferences, ...preferences } },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      preferences: user.preferences
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/update-platform-usernames
// @desc    Update platform usernames
// @access  Private
router.put('/update-platform-usernames', auth, async (req, res) => {
  try {
    const { platformUsernames } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { platformUsernames: { ...req.user.platformUsernames, ...platformUsernames } },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      platformUsernames: user.platformUsernames
    });
  } catch (error) {
    console.error('Update platform usernames error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/activity
// @desc    Get user activity data for charts
// @access  Private
router.get('/activity', auth, async (req, res) => {
  try {
    const { period = '30' } = req.query; // days
    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Daily activity
    const dailyActivity = await Problem.aggregate([
      {
        $match: {
          user: req.user._id,
          status: 'Solved',
          solveDate: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$solveDate' }
          },
          count: { $sum: 1 },
          avgTime: { $avg: '$timeTaken' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Weekly activity
    const weeklyActivity = await Problem.aggregate([
      {
        $match: {
          user: req.user._id,
          status: 'Solved',
          solveDate: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$solveDate' },
            week: { $week: '$solveDate' }
          },
          count: { $sum: 1 },
          avgTime: { $avg: '$timeTaken' }
        }
      },
      { $sort: { '_id.year': 1, '_id.week': 1 } }
    ]);

    // Monthly activity
    const monthlyActivity = await Problem.aggregate([
      {
        $match: {
          user: req.user._id,
          status: 'Solved',
          solveDate: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$solveDate' },
            month: { $month: '$solveDate' }
          },
          count: { $sum: 1 },
          avgTime: { $avg: '$timeTaken' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({
      success: true,
      activity: {
        daily: dailyActivity,
        weekly: weeklyActivity,
        monthly: monthlyActivity
      }
    });
  } catch (error) {
    console.error('Get activity error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

