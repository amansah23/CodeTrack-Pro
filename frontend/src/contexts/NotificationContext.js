import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState({
    upcoming: [],
    overdue: [],
  });
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  const fetchNotifications = async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      const res = await axios.get('/api/revisions/notifications');
      setNotifications(res.data.notifications);
    } catch (error) {
      console.error('Fetch notifications error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      
      // Fetch notifications every 5 minutes
      const interval = setInterval(fetchNotifications, 5 * 60 * 1000);
      
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const markAsRead = (notificationId) => {
    // This would typically update the notification status on the server
    // For now, we'll just remove it from the local state
    setNotifications(prev => ({
      ...prev,
      upcoming: prev.upcoming.filter(n => n._id !== notificationId),
      overdue: prev.overdue.filter(n => n._id !== notificationId),
    }));
  };

  const value = {
    notifications,
    loading,
    fetchNotifications,
    markAsRead,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

