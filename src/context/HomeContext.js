// context/HomeContext.js
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { HomeService } from '@api/MockHomeService';

const HomeContext = createContext();

export const HomeProvider = ({ children }) => {
  // --- State ---
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Data Containers
  const [featuredComics, setFeaturedComics] = useState([]);
  const [continueReading, setContinueReading] = useState([]);
  const [dailyGoals, setDailyGoals] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);

  // --- Actions ---

  const loadHomeData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
        setIsRefreshing(true);
    } else {
        setIsLoading(true);
    }

    try {
      // Execute all API calls in parallel
      const [featRes, histRes, goalRes, eventRes] = await Promise.all([
        HomeService.getFeaturedComics(),
        HomeService.getContinueReading(),
        HomeService.getDailyGoals(),
        HomeService.getUpcomingEvents(),
      ]);

      if (featRes.success) setFeaturedComics(featRes.data || []);
      if (histRes.success) setContinueReading(histRes.data || []);
      if (goalRes.success) setDailyGoals(goalRes.data || []);
      if (eventRes.success) setUpcomingEvents(eventRes.data || []);

    } catch (error) {
      console.error("HomeContext: Failed to load data", error);
      // Optional: Trigger a global error alert here if needed
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Initial Load
  useEffect(() => {
    loadHomeData();
  }, [loadHomeData]);

  /**
   * Wrapper for search to keep API logic centralized.
   * We don't store search results in Context state usually, 
   * as they are ephemeral to the search screen.
   */
  const searchComics = async (query) => {
      return await HomeService.searchContent(query);
  };

  return (
    <HomeContext.Provider
      value={{
        // State
        isLoading,
        isRefreshing,
        featuredComics,
        continueReading,
        dailyGoals,
        upcomingEvents,
        
        // Actions
        refreshData: () => loadHomeData(true),
        searchComics
      }}
    >
      {children}
    </HomeContext.Provider>
  );
};

export const useHome = () => {
  const context = useContext(HomeContext);
  if (!context) {
    throw new Error('useHome must be used within a HomeProvider');
  }
  return context;
};