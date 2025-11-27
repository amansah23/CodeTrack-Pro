import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiPlus, FiGrid, FiList, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import ProblemCard from '../components/ProblemCard';
import ProblemFilters from '../components/ProblemFilters';
import RevisionScheduleModal from '../components/RevisionScheduleModal';

const Problems = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    platform: '',
    difficulty: '',
    category: '',
    pattern: '',
    favorites: false,
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
  });
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [revisionModalOpen, setRevisionModalOpen] = useState(false);
  const [selectedProblem, setSelectedProblem] = useState(null);

  useEffect(() => {
    fetchProblems();
  }, [filters, pagination.current, sortBy, sortOrder]);

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.current,
        limit: 12,
        sortBy,
        sortOrder,
        ...filters,
      };

      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null || params[key] === undefined) {
          delete params[key];
        }
      });

      const response = await axios.get('/api/problems', { params });
      setProblems(response.data.problems);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching problems:', error);
      toast.error('Failed to fetch problems');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleSearchChange = (value) => {
    setFilters(prev => ({ ...prev, search: value }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      status: '',
      platform: '',
      difficulty: '',
      category: '',
      pattern: '',
      favorites: false,
    });
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleToggleFavorite = async (problemId) => {
    try {
      const response = await axios.put(`/api/problems/${problemId}/favorite`);
      setProblems(prev =>
        prev.map(problem =>
          problem._id === problemId
            ? { ...problem, isFavorite: response.data.problem.isFavorite }
            : problem
        )
      );
      toast.success(
        response.data.problem.isFavorite
          ? 'Added to favorites'
          : 'Removed from favorites'
      );
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorite status');
    }
  };

  const handleScheduleRevision = (problemId) => {
    const problem = problems.find(p => p._id === problemId);
    setSelectedProblem(problem);
    setRevisionModalOpen(true);
  };

  const handleRevisionScheduled = () => {
    // Refresh the problems list to show updated revision schedule
    fetchProblems();
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, current: page }));
  };

  const handleSortChange = (newSortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Problems
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage and track your coding problems
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors duration-200 ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-gray-600 text-primary-600 dark:text-primary-400 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <FiGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors duration-200 ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-gray-600 text-primary-600 dark:text-primary-400 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <FiList className="w-4 h-4" />
            </button>
          </div>
          <Link
            to="/problems/add"
            className="btn-primary inline-flex items-center"
          >
            <FiPlus className="w-4 h-4 mr-2" />
            Add Problem
          </Link>
        </div>
      </div>

      {/* Filters */}
      <ProblemFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onSearchChange={handleSearchChange}
        onClearFilters={handleClearFilters}
        totalCount={pagination.total}
      />

      {/* Sort Options */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600 dark:text-gray-400">Sort by:</span>
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [newSortBy, newSortOrder] = e.target.value.split('-');
              setSortBy(newSortBy);
              setSortOrder(newSortOrder);
            }}
            className="input-field text-sm"
          >
            <option value="createdAt-desc">Newest First</option>
            <option value="createdAt-asc">Oldest First</option>
            <option value="solveDate-desc">Recently Solved</option>
            <option value="solveDate-asc">Oldest Solved</option>
            <option value="timeTaken-asc">Quickest First</option>
            <option value="timeTaken-desc">Longest First</option>
            <option value="problemName-asc">Name A-Z</option>
            <option value="problemName-desc">Name Z-A</option>
          </select>
        </div>
      </div>

      {/* Problems Grid/List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : problems.length > 0 ? (
        <>
          <div className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-4'
          }>
            {problems.map((problem) => (
              <ProblemCard
                key={problem._id}
                problem={problem}
                onToggleFavorite={handleToggleFavorite}
                onScheduleRevision={handleScheduleRevision}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-center space-x-2">
              <button
                onClick={() => handlePageChange(pagination.current - 1)}
                disabled={pagination.current === 1}
                className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiChevronLeft className="w-5 h-5" />
              </button>

              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    page === pagination.current
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => handlePageChange(pagination.current + 1)}
                disabled={pagination.current === pagination.pages}
                className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiPlus className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No problems found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {Object.values(filters).some(f => f !== '' && f !== false)
              ? 'Try adjusting your filters or search terms.'
              : 'Start by adding your first coding problem!'}
          </p>
          <Link
            to="/problems/add"
            className="btn-primary inline-flex items-center"
          >
            <FiPlus className="w-4 h-4 mr-2" />
            Add Problem
          </Link>
        </div>
      )}

      {/* Revision Schedule Modal */}
      <RevisionScheduleModal
        isOpen={revisionModalOpen}
        onClose={() => setRevisionModalOpen(false)}
        problem={selectedProblem}
        onSuccess={handleRevisionScheduled}
      />
    </div>
  );
};

export default Problems;

