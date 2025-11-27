import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiSave, FiArrowLeft, FiPlus, FiX, FiCalendar } from 'react-icons/fi';

const AddProblem = () => {
  const [loading, setLoading] = useState(false);
  const [topicTags, setTopicTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [scheduleRevision, setScheduleRevision] = useState(false);
  const [revisionDate, setRevisionDate] = useState('');
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      platform: 'LeetCode',
      platformDifficulty: 'Easy',
      realDifficulty: 'Easy',
      mainCategory: 'Arrays',
      problemPattern: 'Other',
      status: 'Solved',
      isFavorite: false,
    },
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const problemData = {
        ...data,
        topicTags,
        timeTaken: parseInt(data.timeTaken),
      };

      const response = await axios.post('/api/problems', problemData);
      
      // Schedule revision if requested
      if (scheduleRevision && revisionDate) {
        try {
          await axios.put(`/api/problems/${response.data.problem._id}/schedule-revision`, {
            revisionDate: new Date(revisionDate).toISOString()
          });
        } catch (revisionError) {
          console.error('Error scheduling revision:', revisionError);
          // Don't fail the entire operation if revision scheduling fails
        }
      }

      toast.success('Problem added successfully!');
      navigate('/problems');
    } catch (error) {
      console.error('Error adding problem:', error);
      toast.error(error.response?.data?.message || 'Failed to add problem');
    } finally {
      setLoading(false);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !topicTags.includes(newTag.trim())) {
      setTopicTags([...topicTags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setTopicTags(topicTags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate('/problems')}
          className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors duration-200"
        >
          <FiArrowLeft className="w-4 h-4 mr-2" />
          Back to Problems
        </button>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-4">
          Add New Problem
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Track your coding progress by adding a new problem
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
            Problem Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Problem Name *
              </label>
              <input
                {...register('problemName', { required: 'Problem name is required' })}
                type="text"
                className="input-field"
                placeholder="e.g., Two Sum"
              />
              {errors.problemName && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.problemName.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Problem Title *
              </label>
              <input
                {...register('problemTitle', { required: 'Problem title is required' })}
                type="text"
                className="input-field"
                placeholder="e.g., Two Sum - LeetCode"
              />
              {errors.problemTitle && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.problemTitle.message}
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Problem Link *
              </label>
              <input
                {...register('problemLink', { 
                  required: 'Problem link is required',
                  pattern: {
                    value: /^https?:\/\/.+/,
                    message: 'Please enter a valid URL'
                  }
                })}
                type="url"
                className="input-field"
                placeholder="https://leetcode.com/problems/two-sum/"
              />
              {errors.problemLink && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.problemLink.message}
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description *
              </label>
              <textarea
                {...register('description', { required: 'Description is required' })}
                rows={4}
                className="input-field"
                placeholder="Describe the problem and your approach..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.description.message}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
            Problem Classification
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Platform *
              </label>
              <select
                {...register('platform', { required: 'Platform is required' })}
                className="input-field"
              >
                <option value="LeetCode">LeetCode</option>
                <option value="HackerRank">HackerRank</option>
                <option value="Codeforces">Codeforces</option>
                <option value="CodeChef">CodeChef</option>
                <option value="AtCoder">AtCoder</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Platform Difficulty *
              </label>
              <select
                {...register('platformDifficulty', { required: 'Platform difficulty is required' })}
                className="input-field"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Real Difficulty *
              </label>
              <select
                {...register('realDifficulty', { required: 'Real difficulty is required' })}
                className="input-field"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Main Category *
              </label>
              <select
                {...register('mainCategory', { required: 'Main category is required' })}
                className="input-field"
              >
                <option value="Arrays">Arrays</option>
                <option value="Strings">Strings</option>
                <option value="Linked Lists">Linked Lists</option>
                <option value="Trees">Trees</option>
                <option value="Graphs">Graphs</option>
                <option value="Dynamic Programming">Dynamic Programming</option>
                <option value="Backtracking">Backtracking</option>
                <option value="Greedy">Greedy</option>
                <option value="Sorting">Sorting</option>
                <option value="Searching">Searching</option>
                <option value="Hash Tables">Hash Tables</option>
                <option value="Stacks">Stacks</option>
                <option value="Queues">Queues</option>
                <option value="Heaps">Heaps</option>
                <option value="Binary Search">Binary Search</option>
                <option value="Two Pointers">Two Pointers</option>
                <option value="Sliding Window">Sliding Window</option>
                <option value="Math">Math</option>
                <option value="Bit Manipulation">Bit Manipulation</option>
                <option value="Recursion">Recursion</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Problem Pattern *
              </label>
              <select
                {...register('problemPattern', { required: 'Problem pattern is required' })}
                className="input-field"
              >
                <option value="Sliding Window">Sliding Window</option>
                <option value="Two Pointers">Two Pointers</option>
                <option value="Fast & Slow Pointers">Fast & Slow Pointers</option>
                <option value="Merge Intervals">Merge Intervals</option>
                <option value="Cyclic Sort">Cyclic Sort</option>
                <option value="In-place Reversal">In-place Reversal</option>
                <option value="Tree BFS">Tree BFS</option>
                <option value="Tree DFS">Tree DFS</option>
                <option value="Two Heaps">Two Heaps</option>
                <option value="Subsets">Subsets</option>
                <option value="Modified Binary Search">Modified Binary Search</option>
                <option value="Top K Elements">Top K Elements</option>
                <option value="K-way Merge">K-way Merge</option>
                <option value="Topological Sort">Topological Sort</option>
                <option value="Dynamic Programming">Dynamic Programming</option>
                <option value="Backtracking">Backtracking</option>
                <option value="Greedy">Greedy</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Time Taken (minutes) *
              </label>
              <input
                {...register('timeTaken', { 
                  required: 'Time taken is required',
                  min: { value: 1, message: 'Time must be at least 1 minute' }
                })}
                type="number"
                min="1"
                className="input-field"
                placeholder="30"
              />
              {errors.timeTaken && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.timeTaken.message}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
            Additional Information
          </h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Topic Tags
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {topicTags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-2 hover:text-primary-600"
                    >
                      <FiX className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="input-field flex-1"
                  placeholder="Add a topic tag"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="btn-secondary inline-flex items-center"
                >
                  <FiPlus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Approach Notes
              </label>
              <textarea
                {...register('approachNotes')}
                rows={4}
                className="input-field"
                placeholder="Describe your approach, algorithm, and key insights..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Code Snippet
              </label>
              <textarea
                {...register('codeSnippet')}
                rows={6}
                className="input-field font-mono text-sm"
                placeholder="Paste your solution code here..."
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-6">
                <label className="flex items-center">
                  <input
                    {...register('isFavorite')}
                    type="checkbox"
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Add to Favorites
                  </span>
                </label>

                <label className="flex items-center">
                  <input
                    {...register('status')}
                    type="radio"
                    value="Solved"
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Solved
                  </span>
                </label>

                <label className="flex items-center">
                  <input
                    {...register('status')}
                    type="radio"
                    value="In Progress"
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    In Progress
                  </span>
                </label>
              </div>

              {/* Revision Scheduling */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="flex items-center mb-3">
                  <FiCalendar className="w-5 h-5 text-primary-600 dark:text-primary-400 mr-2" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    Revision Schedule
                  </h3>
                </div>
                
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={scheduleRevision}
                      onChange={(e) => setScheduleRevision(e.target.checked)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Schedule a revision for this problem
                    </span>
                  </label>

                  {scheduleRevision && (
                    <div className="ml-6 space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Revision Date
                        </label>
                        <input
                          type="date"
                          value={revisionDate}
                          onChange={(e) => setRevisionDate(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          className="input-field"
                        />
                      </div>
                      
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        <p>💡 Tip: Schedule revisions to reinforce your learning and improve retention.</p>
                        <p>Recommended intervals: 1 day, 3 days, 1 week, 2 weeks, 1 month, 2 months.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/problems')}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary inline-flex items-center"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <FiSave className="w-4 h-4 mr-2" />
            )}
            Save Problem
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProblem;

