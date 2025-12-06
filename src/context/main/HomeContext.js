import React, { createContext, useState, useEffect, useContext, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Ensure this is installed
import { HomeService } from '@api/MockHomeService';

const HomeContext = createContext();

export const HomeProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Data
  const [featuredComics, setFeaturedComics] = useState([]);
  const [continueReading, setContinueReading] = useState([]);
  const [dailyGoals, setDailyGoals] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  
  // Search State
  const [recentSearches, setRecentSearches] = useState([]);
  const [trendingKeywords, setTrendingKeywords] = useState([]);

  // Load Initial Data
  const loadHomeData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setIsRefreshing(true); else setIsLoading(true);

    try {
      const [featRes, histRes, goalRes, eventRes, trendRes] = await Promise.all([
        HomeService.getFeaturedComics(),
        HomeService.getContinueReading(),
        HomeService.getDailyGoals(),
        HomeService.getUpcomingEvents(),
        HomeService.getTrendingKeywords()
      ]);

      if (featRes.success) setFeaturedComics(featRes.data);
      if (histRes.success) setContinueReading(histRes.data);
      if (goalRes.success) setDailyGoals(goalRes.data);
      if (eventRes.success) setUpcomingEvents(eventRes.data);
      if (trendRes.success) setTrendingKeywords(trendRes.data);

      // Load recent searches from storage
      const storedRecents = await AsyncStorage.getItem('recent_searches');
      if (storedRecents) setRecentSearches(JSON.parse(storedRecents));

    } catch (error) {
      console.error("HomeContext: Failed load", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => { loadHomeData(); }, [loadHomeData]);

  // --- Search Actions ---

  const searchComics = useCallback(async (query) => {
      return await HomeService.searchContent(query);
  }, []);

  const getSuggestions = useCallback(async (query) => {
      return await HomeService.getSearchSuggestions(query);
  }, []);

  const addToHistory = useCallback(async (text) => {
      setRecentSearches(prev => {
          // Remove duplicates and keep top 10
          const filtered = prev.filter(item => item.toLowerCase() !== text.toLowerCase());
          const newHistory = [text, ...filtered].slice(0, 10);
          AsyncStorage.setItem('recent_searches', JSON.stringify(newHistory));
          return newHistory;
      });
  }, []);

  const clearHistory = useCallback(async () => {
      setRecentSearches([]);
      AsyncStorage.removeItem('recent_searches');
  }, []);

  const contextValue = useMemo(() => ({
      isLoading, isRefreshing,
      featuredComics, continueReading, dailyGoals, upcomingEvents, trendingKeywords, recentSearches,
      refreshData: () => loadHomeData(true),
      searchComics,
      getSuggestions,
      addToHistory,
      clearHistory
  }), [isLoading, isRefreshing, featuredComics, continueReading, dailyGoals, upcomingEvents, trendingKeywords, recentSearches, loadHomeData, searchComics, getSuggestions, addToHistory, clearHistory]);

  return (
    <HomeContext.Provider value={contextValue}>
      {children}
    </HomeContext.Provider>
  );
};

export const useHome = () => {
  const context = useContext(HomeContext);
  if (!context) throw new Error('useHome must be used within a HomeProvider');
  return context;
};