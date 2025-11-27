const express = require('express');
const { body, validationResult } = require('express-validator');
const Problem = require('../models/Problem');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/revisions
// @desc    Get problems scheduled for revision
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status = 'pending', // pending, overdue, completed
      difficulty,
      category,
      sortBy = 'revisionSchedule.nextRevisionDate',
      sortOrder = 'asc'
    } = req.query;

    const now = new Date();
    let filter = { user: req.user._id };

    // Filter by revision status
    if (status === 'pending') {
      filter['revisionSchedule.nextRevisionDate'] = { $gte: now };
    } else if (status === 'overdue') {
      filter['revisionSchedule.nextRevisionDate'] = { $lt: now };
    }

    if (difficulty) filter.platformDifficulty = difficulty;
    if (category) filter.mainCategory = category;

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const problems = await Problem.find(filter)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Problem.countDocuments(filter);

    res.json({
      success: true,
      problems,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get revisions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/revisions/stats
// @desc    Get revision statistics
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Total problems revised this week
    const revisedThisWeek = await Problem.countDocuments({
      user: userId,
      'revisionSchedule.lastRevisionDate': { $gte: startOfWeek }
    });

    // Total problems for revision
    const totalProblems = await Problem.countDocuments({
      user: userId,
      status: 'Solved'
    });

    // Missed revision questions
    const missedRevisions = await Problem.countDocuments({
      user: userId,
      'revisionSchedule.nextRevisionDate': { $lt: now }
    });

    // Average time to solve revision problems
    const avgRevisionTimeResult = await Problem.aggregate([
      {
        $match: {
          user: userId,
          'revisionSchedule.revisionHistory': { $exists: true, $ne: [] }
        }
      },
      {
        $unwind: '$revisionSchedule.revisionHistory'
      },
      {
        $group: {
          _id: null,
          avgTime: { $avg: '$revisionSchedule.revisionHistory.timeTaken' }
        }
      }
    ]);
    const averageRevisionTime = avgRevisionTimeResult.length > 0 ? 
      Math.round(avgRevisionTimeResult[0].avgTime) : 0;

    // Pending revisions today
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const pendingToday = await Problem.countDocuments({
      user: userId,
      'revisionSchedule.nextRevisionDate': { $lte: today }
    });

    // Difficulty distribution for revisions
    const difficultyStats = await Problem.aggregate([
      {
        $match: {
          user: userId,
          'revisionSchedule.revisionHistory': { $exists: true, $ne: [] }
        }
      },
      { $group: { _id: '$platformDifficulty', count: { $sum: 1 } } }
    ]);

    // Category distribution for revisions
    const categoryStats = await Problem.aggregate([
      {
        $match: {
          user: userId,
          'revisionSchedule.revisionHistory': { $exists: true, $ne: [] }
        }
      },
      { $group: { _id: '$mainCategory', count: { $sum: 1 } } }
    ]);

    // Recent revision activity
    const recentRevisions = await Problem.find({
      user: userId,
      'revisionSchedule.lastRevisionDate': { $exists: true }
    })
    .sort({ 'revisionSchedule.lastRevisionDate': -1 })
    .limit(5)
    .select('problemName problemTitle platformDifficulty mainCategory revisionSchedule.lastRevisionDate');

    res.json({
      success: true,
      stats: {
        revisedThisWeek,
        totalProblems,
        missedRevisions,
        averageRevisionTime,
        pendingToday,
        difficultyStats,
        categoryStats,
        recentRevisions
      }
    });
  } catch (error) {
    console.error('Get revision stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/revisions/:id/mark-revised
// @desc    Mark problem as revised
// @access  Private
router.put('/:id/mark-revised', auth, [
  body('timeTaken').isNumeric().isInt({ min: 1 }).withMessage('Valid time taken is required'),
  body('notes').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { timeTaken, notes = '' } = req.body;

    const problem = await Problem.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    // Mark as revised
    await problem.markAsRevised(timeTaken, notes);

    // Update user statistics
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { 'statistics.totalRevisionCount': 1 }
    });

    res.json({ success: true, problem });
  } catch (error) {
    console.error('Mark revised error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/revisions/:id/reschedule
// @desc    Reschedule revision
// @access  Private
router.put('/:id/reschedule', auth, [
  body('revisionDate').isISO8601().withMessage('Valid revision date is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { revisionDate } = req.body;

    const problem = await Problem.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    problem.revisionSchedule.nextRevisionDate = new Date(revisionDate);
    await problem.save();

    res.json({ success: true, problem });
  } catch (error) {
    console.error('Reschedule revision error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/revisions/notifications
// @desc    Get revision notifications
// @access  Private
router.get('/notifications', auth, async (req, res) => {
  try {
    const now = new Date();
    const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // Get problems scheduled for revision in next 24 hours
    const upcomingRevisions = await Problem.find({
      user: req.user._id,
      'revisionSchedule.nextRevisionDate': {
        $gte: now,
        $lte: next24Hours
      }
    })
    .select('problemName problemTitle platformDifficulty revisionSchedule.nextRevisionDate')
    .sort({ 'revisionSchedule.nextRevisionDate': 1 });

    // Get overdue revisions
    const overdueRevisions = await Problem.find({
      user: req.user._id,
      'revisionSchedule.nextRevisionDate': { $lt: now }
    })
    .select('problemName problemTitle platformDifficulty revisionSchedule.nextRevisionDate')
    .sort({ 'revisionSchedule.nextRevisionDate': 1 });

    res.json({
      success: true,
      notifications: {
        upcoming: upcomingRevisions,
        overdue: overdueRevisions
      }
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

