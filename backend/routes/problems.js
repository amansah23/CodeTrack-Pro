const express = require('express');
const { body, validationResult } = require('express-validator');
const Problem = require('../models/Problem');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/problems
// @desc    Get all problems for a user with filtering and pagination
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      platform,
      difficulty,
      category,
      pattern,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      favorites
    } = req.query;

    // Build filter object
    const filter = { user: req.user._id };
    
    if (status) filter.status = status;
    if (platform) filter.platform = platform;
    if (difficulty) filter.platformDifficulty = difficulty;
    if (category) filter.mainCategory = category;
    if (pattern) filter.problemPattern = pattern;
    if (favorites === 'true') filter.isFavorite = true;
    
    if (search) {
      filter.$or = [
        { problemName: { $regex: search, $options: 'i' } },
        { problemTitle: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { topicTags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const problems = await Problem.find(filter)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('user', 'name email');

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
    console.error('Get problems error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/problems/stats
// @desc    Get problem statistics for dashboard
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Total problems count
    const totalProblems = await Problem.countDocuments({
      user: userId
    });

    // Total problems solved this week
    const problemsThisWeek = await Problem.countDocuments({
      user: userId,
      status: 'Solved',
      solveDate: { $gte: startOfWeek }
    });

    // Current streak calculation
    const problems = await Problem.find({
      user: userId,
      status: 'Solved'
    }).sort({ solveDate: -1 });

    let currentStreak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const problem of problems) {
      const problemDate = new Date(problem.solveDate);
      problemDate.setHours(0, 0, 0, 0);
      
      if (problemDate.getTime() === currentDate.getTime()) {
        currentStreak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (problemDate.getTime() < currentDate.getTime()) {
        break;
      }
    }

    // Average solve time
    const avgTimeResult = await Problem.aggregate([
      { $match: { user: userId, status: 'Solved' } },
      { $group: { _id: null, avgTime: { $avg: '$timeTaken' } } }
    ]);
    const averageSolveTime = avgTimeResult.length > 0 ? Math.round(avgTimeResult[0].avgTime) : 0;

    // Pending revisions today
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const pendingRevisions = await Problem.countDocuments({
      user: userId,
      'revisionSchedule.nextRevisionDate': { $lte: today }
    });

    // Difficulty distribution
    const difficultyStats = await Problem.aggregate([
      { $match: { user: userId, status: 'Solved' } },
      { $group: { _id: '$platformDifficulty', count: { $sum: 1 } } }
    ]);

    // Category distribution
    const categoryStats = await Problem.aggregate([
      { $match: { user: userId, status: 'Solved' } },
      { $group: { _id: '$mainCategory', count: { $sum: 1 } } }
    ]);

    // Time analysis (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const timeAnalysis = await Problem.aggregate([
      {
        $match: {
          user: userId,
          status: 'Solved',
          solveDate: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$solveDate' }
          },
          avgTime: { $avg: '$timeTaken' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Consistency heatmap data
    const heatmapData = await Problem.aggregate([
      { $match: { user: userId, status: 'Solved' } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$solveDate' }
          },
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      stats: {
        totalProblems,
        problemsThisWeek,
        currentStreak,
        averageSolveTime,
        pendingRevisions,
        difficultyStats,
        categoryStats,
        timeAnalysis,
        heatmapData
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/problems/:id
// @desc    Get single problem
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const problem = await Problem.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    res.json({ success: true, problem });
  } catch (error) {
    console.error('Get problem error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/problems
// @desc    Create new problem
// @access  Private
router.post('/', auth, [
  body('problemName').trim().isLength({ min: 1, max: 200 }).withMessage('Problem name is required'),
  body('problemTitle').trim().isLength({ min: 1, max: 200 }).withMessage('Problem title is required'),
  body('description').trim().isLength({ min: 1 }).withMessage('Description is required'),
  body('problemLink').isURL().withMessage('Valid problem link is required'),
  body('platform').isIn(['LeetCode', 'HackerRank', 'Codeforces', 'CodeChef', 'AtCoder', 'Other']).withMessage('Valid platform is required'),
  body('platformDifficulty').isIn(['Easy', 'Medium', 'Hard']).withMessage('Valid difficulty is required'),
  body('timeTaken').isNumeric().isInt({ min: 1 }).withMessage('Valid time taken is required'),
  body('mainCategory').isIn([
    'Arrays', 'Strings', 'Linked Lists', 'Trees', 'Graphs', 
    'Dynamic Programming', 'Backtracking', 'Greedy', 'Sorting',
    'Searching', 'Hash Tables', 'Stacks', 'Queues', 'Heaps',
    'Binary Search', 'Two Pointers', 'Sliding Window', 'Math',
    'Bit Manipulation', 'Recursion', 'Other'
  ]).withMessage('Valid category is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const problemData = {
      ...req.body,
      user: req.user._id
    };

    const problem = new Problem(problemData);
    await problem.save();

    // Update user statistics
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { 'statistics.totalProblemsSolved': 1 }
    });

    res.status(201).json({ success: true, problem });
  } catch (error) {
    console.error('Create problem error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/problems/:id
// @desc    Update problem
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const problem = await Problem.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    const updatedProblem = await Problem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({ success: true, problem: updatedProblem });
  } catch (error) {
    console.error('Update problem error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/problems/:id
// @desc    Delete problem
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const problem = await Problem.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    await Problem.findByIdAndDelete(req.params.id);

    // Update user statistics
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { 'statistics.totalProblemsSolved': -1 }
    });

    res.json({ success: true, message: 'Problem deleted successfully' });
  } catch (error) {
    console.error('Delete problem error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/problems/:id/favorite
// @desc    Toggle favorite status
// @access  Private
router.put('/:id/favorite', auth, async (req, res) => {
  try {
    const problem = await Problem.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    problem.isFavorite = !problem.isFavorite;
    await problem.save();

    res.json({ success: true, problem });
  } catch (error) {
    console.error('Toggle favorite error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/problems/:id/schedule-revision
// @desc    Schedule revision for problem
// @access  Private
router.put('/:id/schedule-revision', auth, async (req, res) => {
  try {
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
    console.error('Schedule revision error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

