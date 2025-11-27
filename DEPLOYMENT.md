# Deployment Guide

This guide will help you deploy the Coding Tracker MERN application to production.

## Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account
- Heroku account (for backend)
- Vercel/Netlify account (for frontend)
- Git repository

## Backend Deployment (Heroku)

### 1. Prepare Backend for Production

1. **Update package.json scripts** (already done):
```json
{
  "scripts": {
    "start": "node backend/server.js",
    "dev": "concurrently \"npm run server\" \"npm run client\"",
    "server": "nodemon backend/server.js",
    "client": "cd frontend && npm start",
    "build": "cd frontend && npm run build",
    "install-client": "cd frontend && npm install",
    "install-server": "npm install",
    "install-all": "npm run install-server && npm run install-client"
  }
}
```

2. **Create Procfile** in root directory:
```
web: npm start
```

### 2. Deploy to Heroku

1. **Install Heroku CLI** and login:
```bash
heroku login
```

2. **Create Heroku app**:
```bash
heroku create your-app-name-backend
```

3. **Set environment variables**:
```bash
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your_production_jwt_secret
heroku config:set JWT_EXPIRE=7d
heroku config:set MONGODB_URI=your_mongodb_atlas_connection_string
heroku config:set CLIENT_URL=https://your-frontend-domain.vercel.app
```

4. **Deploy**:
```bash
git add .
git commit -m "Deploy backend to Heroku"
git push heroku main
```

## Frontend Deployment (Vercel)

### 1. Prepare Frontend for Production

1. **Update API base URL** in frontend (if needed):
```javascript
// In your API calls, use environment variable
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
```

2. **Build the frontend**:
```bash
cd frontend
npm run build
```

### 2. Deploy to Vercel

1. **Install Vercel CLI**:
```bash
npm i -g vercel
```

2. **Login to Vercel**:
```bash
vercel login
```

3. **Deploy**:
```bash
cd frontend
vercel
```

4. **Set environment variables** in Vercel dashboard:
```
REACT_APP_API_URL=https://your-backend-app.herokuapp.com
```

## Database Setup (MongoDB Atlas)

### 1. Create MongoDB Atlas Cluster

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Choose your preferred cloud provider and region
4. Create a database user with read/write permissions

### 2. Configure Network Access

1. Add your IP address to the whitelist
2. For production, add `0.0.0.0/0` to allow all IPs (or specific IPs)

### 3. Get Connection String

1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy the connection string
4. Replace `<password>` with your database user password
5. Replace `<dbname>` with your database name

## Environment Variables

### Backend (Heroku)
```
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/coding-tracker?retryWrites=true&w=majority
JWT_SECRET=your_super_secure_jwt_secret_key
JWT_EXPIRE=7d
CLIENT_URL=https://your-frontend-domain.vercel.app
```

### Frontend (Vercel)
```
REACT_APP_API_URL=https://your-backend-app.herokuapp.com
```

## Alternative Deployment Options

### Frontend - Netlify

1. **Connect GitHub repository** to Netlify
2. **Set build settings**:
   - Build command: `npm run build`
   - Publish directory: `frontend/build`
3. **Set environment variables**:
   - `REACT_APP_API_URL`: Your backend URL

### Backend - Railway

1. **Connect GitHub repository** to Railway
2. **Set environment variables** in Railway dashboard
3. **Deploy automatically** on push to main branch

### Database - Railway MongoDB

1. **Add MongoDB service** in Railway
2. **Get connection string** from Railway dashboard
3. **Update MONGODB_URI** in your backend environment variables

## Post-Deployment Checklist

### 1. Test All Features
- [ ] User registration and login
- [ ] Problem CRUD operations
- [ ] Revision system
- [ ] Dashboard statistics
- [ ] Profile management
- [ ] Dark mode toggle
- [ ] Responsive design

### 2. Security Checklist
- [ ] JWT secret is secure and unique
- [ ] MongoDB connection is secure
- [ ] CORS is properly configured
- [ ] Environment variables are not exposed
- [ ] HTTPS is enabled

### 3. Performance Optimization
- [ ] Enable gzip compression
- [ ] Set up CDN for static assets
- [ ] Optimize images
- [ ] Enable caching headers

## Monitoring and Maintenance

### 1. Set up Monitoring
- **Heroku**: Use Heroku metrics and logs
- **Vercel**: Use Vercel analytics
- **MongoDB Atlas**: Monitor database performance

### 2. Regular Backups
- **Database**: Set up automated backups in MongoDB Atlas
- **Code**: Regular commits to version control

### 3. Updates and Maintenance
- Keep dependencies updated
- Monitor for security vulnerabilities
- Regular performance reviews

## Troubleshooting

### Common Issues

1. **CORS Errors**:
   - Ensure CLIENT_URL is set correctly in backend
   - Check CORS configuration in server.js

2. **Database Connection Issues**:
   - Verify MongoDB Atlas connection string
   - Check network access settings
   - Ensure database user has correct permissions

3. **Build Failures**:
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Check for TypeScript errors (if using TypeScript)

4. **Environment Variable Issues**:
   - Verify all required variables are set
   - Check variable names match exactly
   - Ensure no trailing spaces or quotes

### Getting Help

- Check application logs in Heroku/Vercel dashboards
- Use browser developer tools for frontend issues
- Monitor MongoDB Atlas logs for database issues
- Check network tab for API call failures

## Scaling Considerations

### Backend Scaling
- Use Heroku dynos or upgrade to dedicated servers
- Implement Redis for session storage
- Add load balancing for multiple instances

### Database Scaling
- Upgrade MongoDB Atlas cluster
- Implement database indexing
- Consider read replicas for better performance

### Frontend Scaling
- Use CDN for static assets
- Implement service workers for offline functionality
- Consider server-side rendering for better SEO

---

**Note**: This deployment guide assumes you're using the recommended services. You can adapt it for other cloud providers like AWS, Google Cloud, or Azure.

