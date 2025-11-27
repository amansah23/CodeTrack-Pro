import React, { useState } from 'react';
import { FiX, FiCalendar, FiClock } from 'react-icons/fi';
import axios from 'axios';
import toast from 'react-hot-toast';

const RevisionScheduleModal = ({ isOpen, onClose, problem, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [revisionDate, setRevisionDate] = useState('');
  const [customDate, setCustomDate] = useState('');

  // Predefined revision intervals
  const revisionIntervals = [
    { label: 'Tomorrow', days: 1 },
    { label: 'In 3 days', days: 3 },
    { label: 'In 1 week', days: 7 },
    { label: 'In 2 weeks', days: 14 },
    { label: 'In 1 month', days: 30 },
    { label: 'In 2 months', days: 60 },
    { label: 'Custom date', days: 'custom' }
  ];

  const handleScheduleRevision = async () => {
    if (!revisionDate) {
      toast.error('Please select a revision date');
      return;
    }

    try {
      setLoading(true);
      let selectedDate;

      if (revisionDate === 'custom') {
        if (!customDate) {
          toast.error('Please select a custom date');
          return;
        }
        selectedDate = new Date(customDate);
      } else {
        const days = parseInt(revisionDate);
        selectedDate = new Date();
        selectedDate.setDate(selectedDate.getDate() + days);
      }

      await axios.put(`/api/problems/${problem._id}/schedule-revision`, {
        revisionDate: selectedDate.toISOString()
      });

      toast.success('Revision scheduled successfully!');
      onSuccess && onSuccess();
      onClose();
    } catch (error) {
      console.error('Error scheduling revision:', error);
      toast.error(error.response?.data?.message || 'Failed to schedule revision');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSchedule = async (days) => {
    try {
      setLoading(true);
      const selectedDate = new Date();
      selectedDate.setDate(selectedDate.getDate() + days);

      await axios.put(`/api/problems/${problem._id}/schedule-revision`, {
        revisionDate: selectedDate.toISOString()
      });

      toast.success('Revision scheduled successfully!');
      onSuccess && onSuccess();
      onClose();
    } catch (error) {
      console.error('Error scheduling revision:', error);
      toast.error(error.response?.data?.message || 'Failed to schedule revision');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Schedule Revision
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>

          {problem && (
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                {problem.problemName}
              </h3>
              <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                <span>{problem.platform}</span>
                <span>•</span>
                <span className={`px-2 py-1 rounded text-xs ${
                  problem.platformDifficulty === 'Easy' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                  problem.platformDifficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                  'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}>
                  {problem.platformDifficulty}
                </span>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Quick Schedule
              </label>
              <div className="grid grid-cols-2 gap-2">
                {revisionIntervals.slice(0, 6).map((interval) => (
                  <button
                    key={interval.days}
                    onClick={() => handleQuickSchedule(interval.days)}
                    disabled={loading}
                    className="p-3 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {interval.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Custom Date
              </label>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="custom-option"
                    name="revisionType"
                    value="custom"
                    checked={revisionDate === 'custom'}
                    onChange={(e) => setRevisionDate(e.target.value)}
                    className="text-primary-600 focus:ring-primary-500"
                  />
                  <label htmlFor="custom-option" className="text-sm text-gray-700 dark:text-gray-300">
                    Select specific date
                  </label>
                </div>
                
                {revisionDate === 'custom' && (
                  <div className="ml-6">
                    <input
                      type="date"
                      value={customDate}
                      onChange={(e) => setCustomDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="input-field"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={onClose}
              disabled={loading}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleScheduleRevision}
              disabled={loading || !revisionDate}
              className="btn-primary inline-flex items-center"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <FiCalendar className="w-4 h-4 mr-2" />
              )}
              Schedule Revision
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevisionScheduleModal;
