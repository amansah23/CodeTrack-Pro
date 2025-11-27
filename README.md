# Coding Tracker - MERN Stack Application

A comprehensive MERN (MongoDB, Express, React, Node.js) stack application designed for tracking coding problems, revision progress, and overall user performance. The system helps users improve their coding skills by providing statistics, charts, and analysis across various platforms.

## Features

### 🎯 Core Functionality
- **Problem Tracking**: Add, edit, and manage coding problems from various platforms
- **Revision System**: Schedule and track problem revisions with spaced repetition
- **Progress Analytics**: Comprehensive statistics and data visualizations
- **User Management**: Secure authentication and profile management

### 📊 Dashboard Features
- **Statistics Cards**: Total problems solved, current streak, average solve time, pending revisions
- **Consistency Heatmap**: GitHub-style contribution graph showing daily activity
- **Difficulty Distribution**: Donut chart showing problems by difficulty level
- **Category Progress**: Bar chart tracking progress across different problem categories
- **Time Analysis**: Line chart showing improvement in solve times over time

### 🔧 Problem Management
- **Multi-Platform Support**: LeetCode, HackerRank, Codeforces, CodeChef, AtCoder
- **Advanced Filtering**: Filter by status, platform, difficulty, category, and patterns
- **Search Functionality**: Full-text search across problem names, descriptions, and tags
- **Favorites System**: Mark important problems for quick access
- **Revision Scheduling**: Automatic scheduling based on spaced repetition intervals

### 🎨 User Experience
- **Dark Mode**: Toggle between light and dark themes
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Real-time Notifications**: Get notified about upcoming and overdue revisions
- **Modern UI**: Clean, intuitive interface built with TailwindCSS

## Technology Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **express-validator** for input validation

### Frontend
- **React.js** with functional components and hooks
- **React Router** for navigation
- **TailwindCSS** for styling
- **Chart.js** with react-chartjs-2 for data visualization
- **React Hook Form** for form management
- **React Hot Toast** for notifications

### Development Tools
- **Concurrently** for running multiple scripts
- **Nodemon** for backend development
- **ESLint** for code linting

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### 1. Clone the Repository
```bash
git clone <repository-url>
cd coding-tracker-mern
```

### 2. Install Dependencies
```bash
# Install backend dependencies
npm install

# Install frontend dependencies
npm run install-client
```

### 3. Environment Configuration
Create a `.env` file in the root directory:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/coding-tracker
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:3000
```

### 4. Start the Application
```bash
# Start both backend and frontend concurrently
npm run dev

# Or start them separately:
# Backend only
npm run server

# Frontend only
npm run client
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/update-profile` - Update user profile
- `PUT /api/auth/change-password` - Change password

### Problems
- `GET /api/problems` - Get all problems (with filtering and pagination)
- `GET /api/problems/stats` - Get problem statistics
- `GET /api/problems/:id` - Get single problem
- `POST /api/problems` - Create new problem
- `PUT /api/problems/:id` - Update problem
- `DELETE /api/problems/:id` - Delete problem
- `PUT /api/problems/:id/favorite` - Toggle favorite status
- `PUT /api/problems/:id/schedule-revision` - Schedule revision

### Revisions
- `GET /api/revisions` - Get problems scheduled for revision
- `GET /api/revisions/stats` - Get revision statistics
- `PUT /api/revisions/:id/mark-revised` - Mark problem as revised
- `PUT /api/revisions/:id/reschedule` - Reschedule revision
- `GET /api/revisions/notifications` - Get revision notifications

### Users
- `GET /api/users/profile` - Get detailed user profile
- `PUT /api/users/update-preferences` - Update user preferences
- `PUT /api/users/update-platform-usernames` - Update platform usernames
- `GET /api/users/activity` - Get user activity data

## Project Structure

```
coding-tracker-mern/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   └── Problem.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── problems.js
│   │   ├── revisions.js
│   │   └── users.js
│   ├── middleware/
│   │   └── auth.js
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Charts/
│   │   │   ├── Navbar.js
│   │   │   ├── ProblemCard.js
│   │   │   ├── ProblemFilters.js
│   │   │   ├── ProtectedRoute.js
│   │   │   └── StatsCard.js
│   │   ├── contexts/
│   │   │   ├── AuthContext.js
│   │   │   ├── ThemeContext.js
│   │   │   └── NotificationContext.js
│   │   ├── pages/
│   │   │   ├── Dashboard.js
│   │   │   ├── Problems.js
│   │   │   ├── AddProblem.js
│   │   │   ├── EditProblem.js
│   │   │   ├── Revision.js
│   │   │   ├── Profile.js
│   │   │   ├── Login.js
│   │   │   └── Register.js
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   ├── package.json
│   ├── tailwind.config.js
│   └── postcss.config.js
├── package.json
├── .env.example
└── README.md
```

## Key Features Explained

### Revision System
The application implements a spaced repetition system for problem revisions:
- **Initial Schedule**: Problems are scheduled for revision at 1, 3, 7, 14, 30, and 60 days
- **Extended Schedule**: After 6 revisions, problems are scheduled every 90 days
- **Automatic Scheduling**: Next revision date is automatically calculated when a problem is marked as revised

### Data Visualization
- **Consistency Heatmap**: Shows daily problem-solving activity similar to GitHub's contribution graph
- **Difficulty Distribution**: Donut chart displaying the breakdown of problems by difficulty
- **Category Progress**: Bar chart showing progress across different problem categories
- **Time Analysis**: Line chart tracking improvement in solve times over time

### Responsive Design
The application is fully responsive and works seamlessly across:
- Desktop computers
- Tablets
- Mobile phones

## Deployment

### Backend Deployment (Heroku)
1. Create a Heroku app
2. Set environment variables in Heroku dashboard
3. Connect your GitHub repository
4. Deploy the backend

### Frontend Deployment (Vercel/Netlify)
1. Build the frontend: `npm run build`
2. Deploy the build folder to Vercel or Netlify
3. Set environment variables for the API URL

### Database (MongoDB Atlas)
1. Create a MongoDB Atlas cluster
2. Get the connection string
3. Update the MONGODB_URI in your environment variables

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, email your-email@example.com or create an issue in the repository.

---

**Happy Coding! 🚀**





import React from 'react';
import { format, startOfYear, endOfYear, eachDayOfInterval, isSameDay } from 'date-fns';

const ConsistencyHeatmap = ({ data }) => {
  const currentYear = new Date().getFullYear();
  const yearStart = startOfYear(new Date(currentYear, 0, 1));
  const yearEnd = endOfYear(new Date(currentYear, 11, 31));
  const daysInYear = eachDayOfInterval({ start: yearStart, end: yearEnd });

  // Create a map of dates to problem counts
  const dataMap = {};
  data.forEach(item => {
    dataMap[item._id] = item.count;
  });

  const getIntensity = (count) => {
    if (count === 0) return 'bg-gray-100 dark:bg-gray-800';
    if (count === 1) return 'bg-green-200 dark:bg-green-900';
    if (count <= 3) return 'bg-green-300 dark:bg-green-800';
    if (count <= 5) return 'bg-green-400 dark:bg-green-700';
    return 'bg-green-500 dark:bg-green-600';
  };

  const getTooltipText = (date, count) => {
    return `${format(date, 'MMM dd, yyyy')}: ${count} problem${count !== 1 ? 's' : ''} solved`;
  };

  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Consistency Heatmap
      </h3>
      <div className="overflow-x-auto">
        <div className="grid grid-cols-53 gap-1 min-w-max">
          {daysInYear.map((day, index) => {
            const dayKey = format(day, 'yyyy-MM-dd');
            const count = dataMap[dayKey] || 0;
            const isToday = isSameDay(day, new Date());
            
            return (
              <div
                key={index}
                className={`w-3 h-3 rounded-sm ${getIntensity(count)} ${
                  isToday ? 'ring-2 ring-primary-500' : ''
                } cursor-pointer hover:ring-2 hover:ring-gray-400 transition-all duration-200`}
                title={getTooltipText(day, count)}
              />
            );
          })}
        </div>
      </div>
      <div className="flex items-center justify-between mt-4 text-sm text-gray-600 dark:text-gray-400">
        <span>Less</span>
        <div className="flex space-x-1">
          <div className="w-3 h-3 bg-gray-100 dark:bg-gray-800 rounded-sm"></div>
          <div className="w-3 h-3 bg-green-200 dark:bg-green-900 rounded-sm"></div>
          <div className="w-3 h-3 bg-green-300 dark:bg-green-800 rounded-sm"></div>
          <div className="w-3 h-3 bg-green-400 dark:bg-green-700 rounded-sm"></div>
          <div className="w-3 h-3 bg-green-500 dark:bg-green-600 rounded-sm"></div>
        </div>
        <span>More</span>
      </div>
    </div>
  );
};

export default ConsistencyHeatmap;

