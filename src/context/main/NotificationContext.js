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

  // --- MODIFIED: Optimistic update without reloading ---
  const markAsRead = useCallback(async (id) => {
    const originalNotifications = [...notifications];
    // Optimistically update the UI for a faster perceived response
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, unread: false } : n))
    );
    try {
      // Call the API in the background without triggering a loading state
      await NotificationAPI.markAsRead(id);
    } catch (error) {
      console.error("Context: Failed to mark as read", error);
      // On failure, revert the optimistic update
      setNotifications(originalNotifications);
    }
  }, [notifications]); // Dependency changed to 'notifications'

  const markAllAsRead = useCallback(async () => {
    const originalNotifications = notifications;
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
    try {
      await NotificationAPI.markAllAsRead();
    } catch (error) {
      console.error("Context: Failed to mark all read", error);
      setNotifications(originalNotifications);
    }
  }, [notifications]);

   const deleteMultipleNotifications = useCallback(async (ids) => {
    const originalNotifications = notifications;
    setNotifications(prev => prev.filter(n => !ids.includes(n.id)));
    try {
      await NotificationAPI.deleteMultipleNotifications(ids);
    } catch (error) {
      console.error("Context: Failed to delete notifications", error);
      setNotifications(originalNotifications);
    }
  }, [notifications]);


  const value = {
    notifications,
    isLoading,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteMultipleNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};