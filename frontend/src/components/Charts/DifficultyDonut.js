import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const DifficultyDonut = ({ data }) => {
  const difficultyColors = {
    Easy: '#10B981',
    Medium: '#F59E0B',
    Hard: '#EF4444',
  };

  const chartData = {
    labels: data.map(item => item._id),
    datasets: [
      {
        data: data.map(item => item.count),
        backgroundColor: data.map(item => difficultyColors[item._id]),
        borderColor: data.map(item => difficultyColors[item._id]),
        borderWidth: 2,
        hoverOffset: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          color: '#6B7280',
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
    cutout: '60%',
  };

  const total = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Difficulty Distribution
      </h3>
      <div className="relative h-64">
        <Doughnut data={chartData} options={options} />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {total}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total Problems
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DifficultyDonut;

