import React, { createContext, useState, useEffect, useContext, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { HomeService } from '@api/MockHomeService';
import { useAuth } from './AuthContext'; 
import { MOCK_RANKS } from '@api/MockProfileService';
import { useAlert } from '@context/other/AlertContext';
import { useReward } from '@context/other/RewardContext';

const GOALS_STORAGE_KEY = 'daily_goals_progress';
const HomeContext = createContext();

export const HomeProvider = ({ children }) => {
  const { user, awardXP } = useAuth();
  const { showAlert } = useAlert(); 
  const { showReward } = useReward();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Data States
  const [featuredComics, setFeaturedComics] = useState([]);
  const [continueReading, setContinueReading] = useState([]);
  const [dailyGoals, setDailyGoals] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  
  // Search States
  const [recentSearches, setRecentSearches] = useState([]);
  const [trendingKeywords, setTrendingKeywords] = useState([]);
  
  // Calculate user level from XP
  const currentUserRank = useMemo(() => {
    if (!user) return MOCK_RANKS[0];
    return MOCK_RANKS.slice().reverse().find(r => user.xp >= r.minXp) || MOCK_RANKS[0];
  }, [user]);

  // Handles daily reset and loading goals
  const loadHomeData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setIsRefreshing(true); else if (!isLoading) setIsLoading(true);

    try {
        const todayStr = new Date().toISOString().split('T')[0];
        const storedGoalsData = await AsyncStorage.getItem(GOALS_STORAGE_KEY);
        let goalsToSet = [];
        let storedGoalsMatchToday = false;

        // --- FIX: Logic to prevent progress reset on manual refresh ---
        if (storedGoalsData) {
            const { date, goals } = JSON.parse(storedGoalsData);
            if (date === todayStr) {
                // If data exists for today, always use it as the source of truth
                goalsToSet = goals;
                storedGoalsMatchToday = true;
            }
        }
        
        // Only fetch new goals from the service if no valid data exists for the current day
        if (!storedGoalsMatchToday) {
            const goalRes = await HomeService.getDailyGoals(currentUserRank);
            if (goalRes.success) {
                goalsToSet = goalRes.data;
                await AsyncStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify({ date: todayStr, goals: goalsToSet }));
            }
        }
        
        setDailyGoals(goalsToSet);

      // Fetch other home screen data in parallel
      const [featRes, histRes, eventRes, trendRes] = await Promise.all([
        HomeService.getFeaturedComics(),
        HomeService.getContinueReading(),
        HomeService.getUpcomingEvents(),
        HomeService.getTrendingKeywords()
      ]);

      if (featRes.success) setFeaturedComics(featRes.data);
      if (histRes.success) setContinueReading(histRes.data);
      if (eventRes.success) setUpcomingEvents(eventRes.data);
      if (trendRes.success) setTrendingKeywords(trendRes.data);

      // Also load recent searches from storage
      const storedRecents = await AsyncStorage.getItem('recent_searches');
      if (storedRecents) setRecentSearches(JSON.parse(storedRecents));

    } catch (error) {
      console.error("HomeContext: Failed to load home data", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [currentUserRank]);

  useEffect(() => { loadHomeData(); }, [loadHomeData]);

  const updateGoalProgress = useCallback(async (goalId, amount) => {
    const todayStr = new Date().toISOString().split('T')[0];
    let updatedGoals = [];

    setDailyGoals(prevGoals => {
        updatedGoals = prevGoals.map(goal => {
            if (goal.id === goalId && !goal.completed) {
                const newProgress = Math.min((goal.progress || 0) + amount, goal.total);
                const isNowComplete = newProgress >= goal.total;

                if (isNowComplete) {
                    const oldXp = user.xp; 
                    const newXp = oldXp + goal.xp;
                    showReward({ goal, oldXp, newXp });                 
                    awardXP(goal.xp);
                }
                
                return { ...goal, progress: newProgress, completed: isNowComplete };
            }
            return goal;
        });
        return updatedGoals;
    });

    await AsyncStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify({ date: todayStr, goals: updatedGoals }));
  }, [awardXP, showReward, user]);
  
  // Public functions to be called from other screens
  const logChapterRead = useCallback(() => updateGoalProgress('read_chapters', 1), [updateGoalProgress]);
  const logTimeSpent = useCallback((minutes) => updateGoalProgress('time_spent', minutes), [updateGoalProgress]);
  const logComicRated = useCallback(() => updateGoalProgress('rate_comic', 1), [updateGoalProgress]);
  const logAddedToLibrary = useCallback(() => updateGoalProgress('add_to_library', 1), [updateGoalProgress]);
  const logComment = useCallback(() => updateGoalProgress('comment', 1), [updateGoalProgress]);
  const logShare = useCallback(() => updateGoalProgress('share_comic', 1), [updateGoalProgress]);
  const logExplore = useCallback(() => updateGoalProgress('explore_genre', 1), [updateGoalProgress]);
  const logVisitHistory = useCallback(() => updateGoalProgress('check_history', 1), [updateGoalProgress]);
  const logMissionCompleted = useCallback(() => updateGoalProgress('complete_mission', 1), [updateGoalProgress]);

  // --- Search Actions ---
  const searchComics = useCallback(async (query) => {
      return await HomeService.searchContent(query);
  }, []);

  const getSuggestions = useCallback(async (query) => {
      return await HomeService.getSearchSuggestions(query);
  }, []);

  const addToHistory = useCallback(async (text) => {
      setRecentSearches(prev => {
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
      logChapterRead,
      logTimeSpent,
      logComicRated,
      logAddedToLibrary,
      logComment,
      logShare,
      logExplore,
      logVisitHistory,
      logMissionCompleted, // <-- Expose new function
      searchComics,
      getSuggestions,
      addToHistory,
      clearHistory
  }), [
      isLoading, isRefreshing, featuredComics, continueReading, dailyGoals, upcomingEvents, trendingKeywords, recentSearches, 
      loadHomeData, logChapterRead, logTimeSpent, logComicRated, logAddedToLibrary, logComment, logShare, logExplore, logVisitHistory,
      logMissionCompleted, // <-- Add to dependency array
      searchComics, getSuggestions, addToHistory, clearHistory
  ]);

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