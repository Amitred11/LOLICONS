import React, { createContext, useState, useContext, useCallback, useMemo } from 'react';
import { NotificationAPI } from '@api/MockNotificationService';

// 1. Create Context
const NotificationContext = createContext();

// 2. Custom Hook
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

// 3. Provider Component
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Derived state: Calculate unread count automatically whenever notifications change
  const unreadCount = useMemo(() => {
    return notifications.filter(n => n.unread).length;
  }, [notifications]);

  // --- Actions ---

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await NotificationAPI.getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error("Context: Failed to fetch notifications", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (id) => {
    // 1. Optimistic Update (Instant UI change)
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, unread: false } : n)
    );

    // 2. Background API Call
    try {
      await NotificationAPI.markAsRead(id);
    } catch (error) {
      console.error("Context: Failed to mark as read", error);
      // Optional: Revert state here if strictly necessary
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    // 1. Optimistic Update
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));

    // 2. Background API Call
    try {
      await NotificationAPI.markAllAsRead();
    } catch (error) {
      console.error("Context: Failed to mark all read", error);
    }
  }, []);

  const value = {
    notifications,
    isLoading,
    unreadCount,     // Exposed for badges on other screens
    fetchNotifications,
    markAsRead,
    markAllAsRead
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};