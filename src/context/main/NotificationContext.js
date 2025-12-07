// @context/main/NotificationContext.js

import React, { createContext, useState, useContext, useCallback, useMemo } from 'react';
import { NotificationAPI } from '@api/MockNotificationService';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const unreadCount = useMemo(() => {
    return notifications.filter(n => n.unread).length;
  }, [notifications]);

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

  // --- FIX: Refactored to call the API then refetch ---
  const markAsRead = useCallback(async (id) => {
    // Optimistically update the UI for a faster perceived response
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, unread: false } : n)
    );
    try {
      await NotificationAPI.markAsRead(id);
      // Refetch from the "source of truth" to ensure consistency
      await fetchNotifications(); 
    } catch (error) {
      console.error("Context: Failed to mark as read", error);
      // Optional: Revert optimistic update on failure
    }
  }, [fetchNotifications]);

  // --- FIX: Refactored to call the API then refetch ---
  const markAllAsRead = useCallback(async () => {
    // Optimistically update
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
    try {
      await NotificationAPI.markAllAsRead();
      // Refetch from the "source of truth"
      await fetchNotifications();
    } catch (error) {
      console.error("Context: Failed to mark all read", error);
    }
  }, [fetchNotifications]);

   const deleteNotification = useCallback(async (id) => {
    // Optimistically update the UI for a fast response
    setNotifications(prev => prev.filter(n => n.id !== id));
    try {
      await NotificationAPI.deleteNotification(id);
    } catch (error) {
      console.error("Context: Failed to delete notification", error);
      // Optional: Could add logic here to revert the state on API failure
    }
  }, []);


  const value = {
    notifications,
    isLoading,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification, // Expose the new function
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};