import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { FiPlus, FiBookOpen, FiClock, FiTarget, FiAlertCircle, FiRefreshCw } from 'react-icons/fi';
import StatsCard from '../components/StatsCard';
import ConsistencyHeatmap from '../components/Charts/ConsistencyHeatmap';
import DifficultyDonut from '../components/Charts/DifficultyDonut';
import CategoryProgress from '../components/Charts/CategoryProgress';
import TimeAnalysis from '../components/Charts/TimeAnalysis';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentProblems, setRecentProblems] = useState([]);
  const location = useLocation();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Refresh data when user navigates back to dashboard
  useEffect(() => {
    if (location.pathname === '/dashboard') {
      fetchDashboardData();
    }
  }, [location.pathname]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, problemsRes] = await Promise.all([
        axios.get('/api/problems/stats'),
        axios.get('/api/problems?limit=5&sortBy=solveDate&sortOrder=desc')
      ]);
      
      setStats(statsRes.data.stats);
      setRecentProblems(problemsRes.data.problems);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Failed to load dashboard data</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Dashboard
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Track your coding progress and stay consistent
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="btn-secondary inline-flex items-center"
          >
            <FiRefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <Link
            to="/problems/add"
            className="btn-primary inline-flex items-center"
          >
            <FiPlus className="w-4 h-4 mr-2" />
            Add Problem
          </Link>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatsCard
          title="Total Problems"
          value={stats.totalProblems}
          icon={FiBookOpen}
          color="purple"
          subtitle="all time"
        />
        <StatsCard
          title="Problems This Week"
          value={stats.problemsThisWeek}
          icon={FiBookOpen}
          color="blue"
          subtitle="Keep up the momentum!"
        />
        <StatsCard
          title="Current Streak"
          value={stats.currentStreak}
          icon={FiTarget}
          color="green"
          subtitle="days in a row"
        />
        <StatsCard
          title="Avg Solve Time"
          value={`${stats.averageSolveTime}m`}
          icon={FiClock}
          color="yellow"
          subtitle="per problem"
        />
        <StatsCard
          title="Pending Revisions"
          value={stats.pendingRevisions}
          icon={FiAlertCircle}
          color="red"
          subtitle="due today"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Consistency Heatmap */}
        <div className="lg:col-span-2">
          <ConsistencyHeatmap data={stats.heatmapData} />
        </div>

        {/* Difficulty Distribution */}
        <DifficultyDonut data={stats.difficultyStats} />

        {/* Category Progress */}
        <CategoryProgress data={stats.categoryStats} />

        {/* Time Analysis */}
        <div className="lg:col-span-2">
          <TimeAnalysis data={stats.timeAnalysis} />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Recent Activity
          </h3>
        </div>
        <div className="card-body">
          {recentProblems.length > 0 ? (
            <div className="space-y-4">
              {recentProblems.map((problem) => (
                <div
                  key={problem._id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div className={`badge badge-${problem.platformDifficulty.toLowerCase()}`}>
                        {problem.platformDifficulty}
                      </div>
                      <div className={`badge badge-${problem.status.toLowerCase().replace(' ', '')}`}>
                        {problem.status}
                      </div>
                    </div>
                    <h4 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                      {problem.problemName}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {problem.platform} • {problem.mainCategory}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {problem.timeTaken}m
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {new Date(problem.solveDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FiBookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                No problems solved yet. Start your coding journey!
              </p>
              <Link
                to="/problems/add"
                className="btn-primary mt-4 inline-flex items-center"
              >
                <FiPlus className="w-4 h-4 mr-2" />
                Add Your First Problem
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

