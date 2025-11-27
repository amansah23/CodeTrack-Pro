const mongoose = require('mongoose');

const problemSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  problemName: {
    type: String,
    required: [true, 'Please provide a problem name'],
    trim: true,
    maxlength: [200, 'Problem name cannot be more than 200 characters']
  },
  problemTitle: {
    type: String,
    required: [true, 'Please provide a problem title'],
    trim: true,
    maxlength: [200, 'Problem title cannot be more than 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide a problem description'],
    trim: true
  },
  problemLink: {
    type: String,
    required: [true, 'Please provide a problem link'],
    trim: true
  },
  platform: {
    type: String,
    required: [true, 'Please provide a platform'],
    enum: ['LeetCode', 'HackerRank', 'Codeforces', 'CodeChef', 'AtCoder', 'Other'],
    default: 'LeetCode'
  },
  platformDifficulty: {
    type: String,
    required: [true, 'Please provide platform difficulty'],
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Easy'
  },
  realDifficulty: {
    type: String,
    required: [true, 'Please provide real difficulty'],
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Easy'
  },
  timeTaken: {
    type: Number,
    required: [true, 'Please provide time taken in minutes'],
    min: [1, 'Time taken must be at least 1 minute']
  },
  mainCategory: {
    type: String,
    required: [true, 'Please provide a main category'],
    enum: [
      'Arrays', 'Strings', 'Linked Lists', 'Trees', 'Graphs', 
      'Dynamic Programming', 'Backtracking', 'Greedy', 'Sorting',
      'Searching', 'Hash Tables', 'Stacks', 'Queues', 'Heaps',
      'Binary Search', 'Two Pointers', 'Sliding Window', 'Math',
      'Bit Manipulation', 'Recursion', 'Other'
    ],
    default: 'Arrays'
  },
  topicTags: [{
    type: String,
    trim: true
  }],
  problemPattern: {
    type: String,
    required: [true, 'Please provide a problem pattern'],
    enum: [
      'Sliding Window', 'Two Pointers', 'Fast & Slow Pointers',
      'Merge Intervals', 'Cyclic Sort', 'In-place Reversal',
      'Tree BFS', 'Tree DFS', 'Two Heaps', 'Subsets',
      'Modified Binary Search', 'Top K Elements', 'K-way Merge',
      'Topological Sort', 'Dynamic Programming', 'Backtracking',
      'Greedy', 'Other'
    ],
    default: 'Other'
  },
  approachNotes: {
    type: String,
    trim: true
  },
  codeSnippet: {
    type: String,
    trim: true
  },
  images: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    enum: ['Solved', 'In Progress', 'For Review'],
    default: 'Solved'
  },
  isFavorite: {
    type: Boolean,
    default: false
  },
  revisionSchedule: {
    nextRevisionDate: {
      type: Date,
      default: null
    },
    revisionCount: {
      type: Number,
      default: 0
    },
    lastRevisionDate: {
      type: Date,
      default: null
    },
    revisionHistory: [{
      date: {
        type: Date,
        default: Date.now
      },
      timeTaken: {
        type: Number,
        default: 0
      },
      notes: {
        type: String,
        default: ''
      }
    }]
  },
  solveDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for better query performance
problemSchema.index({ user: 1, status: 1 });
problemSchema.index({ user: 1, platform: 1 });
problemSchema.index({ user: 1, mainCategory: 1 });
problemSchema.index({ user: 1, 'revisionSchedule.nextRevisionDate': 1 });

// Virtual for days since solved
problemSchema.virtual('daysSinceSolved').get(function() {
  return Math.floor((Date.now() - this.solveDate) / (1000 * 60 * 60 * 24));
});

// Method to schedule next revision
problemSchema.methods.scheduleNextRevision = function() {
  const revisionIntervals = [1, 3, 7, 14, 30, 60]; // days
  const currentRevisionCount = this.revisionSchedule.revisionCount;
  
  if (currentRevisionCount < revisionIntervals.length) {
    const daysToAdd = revisionIntervals[currentRevisionCount];
    this.revisionSchedule.nextRevisionDate = new Date(Date.now() + (daysToAdd * 24 * 60 * 60 * 1000));
  } else {
    // After 6 revisions, schedule every 90 days
    this.revisionSchedule.nextRevisionDate = new Date(Date.now() + (90 * 24 * 60 * 60 * 1000));
  }
  
  return this.save();
};

// Method to mark as revised
problemSchema.methods.markAsRevised = function(timeTaken, notes = '') {
  this.revisionSchedule.revisionHistory.push({
    date: new Date(),
    timeTaken: timeTaken,
    notes: notes
  });
  
  this.revisionSchedule.revisionCount += 1;
  this.revisionSchedule.lastRevisionDate = new Date();
  
  // Schedule next revision
  this.scheduleNextRevision();
  
  return this.save();
};

module.exports = mongoose.model('Problem', problemSchema);

