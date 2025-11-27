import React from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiCalendar, FiEdit, FiEye, FiExternalLink } from 'react-icons/fi';
import { format } from 'date-fns';

const ProblemCard = ({ problem, onToggleFavorite, onScheduleRevision }) => {
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy':
        return 'badge-easy';
      case 'Medium':
        return 'badge-medium';
      case 'Hard':
        return 'badge-hard';
      default:
        return 'badge-easy';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Solved':
        return 'badge-solved';
      case 'In Progress':
        return 'badge-progress';
      case 'For Review':
        return 'badge-review';
      default:
        return 'badge-solved';
    }
  };

  return (
    <div className="problem-card hover:shadow-lg transition-shadow duration-200">
      <div className="problem-card-body">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className={`badge ${getDifficultyColor(problem.platformDifficulty)}`}>
              {problem.platformDifficulty}
            </span>
            <span className={`badge ${getStatusColor(problem.status)}`}>
              {problem.status}
            </span>
          </div>
          <button
            onClick={() => onToggleFavorite(problem._id)}
            className={`p-2 rounded-full transition-colors duration-200 ${
              problem.isFavorite
                ? 'text-red-500 hover:text-red-600'
                : 'text-gray-400 hover:text-red-500'
            }`}
          >
            <FiHeart className={`w-5 h-5 ${problem.isFavorite ? 'fill-current' : ''}`} />
          </button>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          {problem.problemName}
        </h3>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
          {problem.description}
        </p>

        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
          <span>{problem.platform}</span>
          <span>•</span>
          <span>{problem.mainCategory}</span>
          <span>•</span>
          <span>{problem.timeTaken}m</span>
        </div>

        {problem.problemPattern && (
          <div className="mb-4">
            <span className="inline-block bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded text-xs">
              {problem.problemPattern}
            </span>
          </div>
        )}

        {problem.topicTags && problem.topicTags.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {problem.topicTags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded text-xs"
                >
                  {tag}
                </span>
              ))}
              {problem.topicTags.length > 3 && (
                <span className="inline-block bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded text-xs">
                  +{problem.topicTags.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {format(new Date(problem.solveDate), 'MMM dd, yyyy')}
          </div>
          <div className="flex items-center space-x-2">
            <Link
              to={`/problems/${problem._id}/edit`}
              className="p-2 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200"
              title="Edit Problem"
            >
              <FiEdit className="w-4 h-4" />
            </Link>
            <button
              onClick={() => window.open(problem.problemLink, '_blank')}
              className="p-2 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200"
              title="View Problem"
            >
              <FiExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>

        {problem.revisionSchedule?.nextRevisionDate && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <FiCalendar className="w-4 h-4 mr-2" />
                Next revision: {format(new Date(problem.revisionSchedule.nextRevisionDate), 'MMM dd, yyyy')}
              </div>
              <button
                onClick={() => onScheduleRevision(problem._id)}
                className="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
              >
                Reschedule
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProblemCard;

