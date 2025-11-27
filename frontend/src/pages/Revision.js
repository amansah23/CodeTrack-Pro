import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiRotateCcw, FiClock, FiTarget, FiAlertCircle, FiCheckCircle, FiCalendar } from 'react-icons/fi';
import { format, isAfter, isBefore, addDays } from 'date-fns';
import StatsCard from '../components/StatsCard';
import DifficultyDonut from '../components/Charts/DifficultyDonut';
import CategoryProgress from '../components/Charts/CategoryProgress';
import ProblemCard from '../components/ProblemCard';

const Revision = () => {
  const [stats, setStats] = useState(null);
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [showMarkRevisedModal, setShowMarkRevisedModal] = useState(false);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [revisionData, setRevisionData] = useState({
    timeTaken: '',
    notes: '',
  });

  useEffect(() => {
    fetchRevisionData();
  }, [activeTab]);

  const fetchRevisionData = async () => {
    try {
      setLoading(true);
      const [statsRes, problemsRes] = await Promise.all([
        axios.get('/api/revisions/stats'),
        axios.get(`/api/revisions?status=${activeTab}&limit=20`)
      ]);
      
      setStats(statsRes.data.stats);
      setProblems(problemsRes.data.problems);
    } catch (error) {
      console.error('Error fetching revision data:', error);
      toast.error('Failed to fetch revision data');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRevised = async () => {
    if (!selectedProblem || !revisionData.timeTaken) {
      toast.error('Please enter the time taken');
      return;
    }

    try {
      await axios.put(`/api/revisions/${selectedProblem._id}/mark-revised`, {
        timeTaken: parseInt(revisionData.timeTaken),
        notes: revisionData.notes,
      });

      toast.success('Problem marked as revised!');
      setShowMarkRevisedModal(false);
      setSelectedProblem(null);
      setRevisionData({ timeTaken: '', notes: '' });
      fetchRevisionData();
    } catch (error) {
      console.error('Error marking as revised:', error);
      toast.error('Failed to mark as revised');
    }
  };

  const handleReschedule = async (problemId, newDate) => {
    try {
      await axios.put(`/api/revisions/${problemId}/reschedule`, {
        revisionDate: newDate,
      });

      toast.success('Revision rescheduled successfully!');
      fetchRevisionData();
    } catch (error) {
      console.error('Error rescheduling:', error);
      toast.error('Failed to reschedule revision');
    }
  };

  const openMarkRevisedModal = (problem) => {
    setSelectedProblem(problem);
    setShowMarkRevisedModal(true);
  };

  const getRevisionStatus = (problem) => {
    const now = new Date();
    const revisionDate = new Date(problem.revisionSchedule.nextRevisionDate);
    
    if (isBefore(revisionDate, now)) {
      return { status: 'overdue', color: 'text-red-600 dark:text-red-400' };
    } else if (isAfter(revisionDate, addDays(now, 1))) {
      return { status: 'upcoming', color: 'text-gray-600 dark:text-gray-400' };
    } else {
      return { status: 'due-today', color: 'text-yellow-600 dark:text-yellow-400' };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Revision
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Track and manage your problem revisions
        </p>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Revised This Week"
            value={stats.revisedThisWeek}
            icon={FiRotateCcw}
            color="blue"
            subtitle={`${Math.round((stats.revisedThisWeek / stats.totalProblems) * 100)}% of total`}
          />
          <StatsCard
            title="Missed Revisions"
            value={stats.missedRevisions}
            icon={FiAlertCircle}
            color="red"
            subtitle="Need attention"
          />
          <StatsCard
            title="Avg Revision Time"
            value={`${stats.averageRevisionTime}m`}
            icon={FiClock}
            color="yellow"
            subtitle="per problem"
          />
          <StatsCard
            title="Pending Today"
            value={stats.pendingToday}
            icon={FiTarget}
            color="green"
            subtitle="due for revision"
          />
        </div>
      )}

      {/* Charts */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <DifficultyDonut data={stats.difficultyStats} />
          <CategoryProgress data={stats.categoryStats} />
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'pending', label: 'Pending', count: problems.filter(p => getRevisionStatus(p).status === 'upcoming').length },
            { id: 'due-today', label: 'Due Today', count: problems.filter(p => getRevisionStatus(p).status === 'due-today').length },
            { id: 'overdue', label: 'Overdue', count: problems.filter(p => getRevisionStatus(p).status === 'overdue').length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                  activeTab === tab.id
                    ? 'bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-300'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Problems List */}
      <div className="space-y-6">
        {problems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {problems.map((problem) => {
              const revisionStatus = getRevisionStatus(problem);
              return (
                <div key={problem._id} className="card p-6 hover:shadow-lg transition-shadow duration-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <span className={`badge badge-${problem.platformDifficulty.toLowerCase()}`}>
                        {problem.platformDifficulty}
                      </span>
                      <span className={`badge badge-${problem.status.toLowerCase().replace(' ', '')}`}>
                        {problem.status}
                      </span>
                    </div>
                    <div className={`text-sm font-medium ${revisionStatus.color}`}>
                      {revisionStatus.status === 'overdue' && 'Overdue'}
                      {revisionStatus.status === 'due-today' && 'Due Today'}
                      {revisionStatus.status === 'upcoming' && 'Upcoming'}
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    {problem.problemName}
                  </h3>

                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {problem.description}
                  </p>

                  <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <span>{problem.platform}</span>
                    <span>•</span>
                    <span>{problem.mainCategory}</span>
                    <span>•</span>
                    <span>{problem.timeTaken}m</span>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <div className="flex items-center">
                      <FiCalendar className="w-4 h-4 mr-2" />
                      Next: {format(new Date(problem.revisionSchedule.nextRevisionDate), 'MMM dd, yyyy')}
                    </div>
                    <div>
                      Rev: {problem.revisionSchedule.revisionCount}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => openMarkRevisedModal(problem)}
                      className="flex-1 btn-primary text-sm inline-flex items-center justify-center"
                    >
                      <FiCheckCircle className="w-4 h-4 mr-2" />
                      Mark Revised
                    </button>
                    <button
                      onClick={() => {
                        const newDate = prompt('Enter new revision date (YYYY-MM-DD):');
                        if (newDate) {
                          handleReschedule(problem._id, newDate);
                        }
                      }}
                      className="btn-secondary text-sm inline-flex items-center justify-center"
                    >
                      <FiCalendar className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <FiRotateCcw className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No revisions {activeTab === 'pending' ? 'pending' : activeTab === 'overdue' ? 'overdue' : 'due today'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {activeTab === 'pending' 
                ? 'Great job! You\'re all caught up with your revisions.'
                : activeTab === 'overdue'
                ? 'Excellent! No overdue revisions.'
                : 'No problems due for revision today.'}
            </p>
          </div>
        )}
      </div>

      {/* Mark Revised Modal */}
      {showMarkRevisedModal && selectedProblem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Mark as Revised
            </h3>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Problem: {selectedProblem.problemName}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Time Taken (minutes) *
                </label>
                <input
                  type="number"
                  min="1"
                  value={revisionData.timeTaken}
                  onChange={(e) => setRevisionData(prev => ({ ...prev, timeTaken: e.target.value }))}
                  className="input-field"
                  placeholder="Enter time taken"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notes (optional)
                </label>
                <textarea
                  rows={3}
                  value={revisionData.notes}
                  onChange={(e) => setRevisionData(prev => ({ ...prev, notes: e.target.value }))}
                  className="input-field"
                  placeholder="Any additional notes about the revision..."
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowMarkRevisedModal(false);
                  setSelectedProblem(null);
                  setRevisionData({ timeTaken: '', notes: '' });
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleMarkRevised}
                className="btn-primary"
              >
                Mark as Revised
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Revision;

