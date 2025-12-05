import React, { createContext, useState, useContext, useCallback } from 'react';
import { CommunityAPI } from '@api/MockCommunityService';

// 1. Create the Context
const CommunityContext = createContext();

// 2. Custom Hook for easy consumption
export const useCommunity = () => {
  const context = useContext(CommunityContext);
  if (!context) {
    throw new Error('useCommunity must be used within a CommunityProvider');
  }
  return context;
};

// 3. The Provider Component
export const CommunityProvider = ({ children }) => {
  // --- State: Data ---
  const [guilds, setGuilds] = useState([]);
  const [posts, setPosts] = useState([]);
  const [marketItems, setMarketItems] = useState([]);
  const [currentGuild, setCurrentGuild] = useState(null); // Detailed view

  // --- State: Loading Indicators ---
  // We separate these so one part of the app doesn't block another
  const [isLoadingGuilds, setIsLoadingGuilds] = useState(false);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [isLoadingMarket, setIsLoadingMarket] = useState(false);

  // --- State: Errors ---
  const [error, setError] = useState(null);

  // ==============================
  //         GUILD LOGIC
  // ==============================

  const fetchGuilds = useCallback(async () => {
    setIsLoadingGuilds(true);
    try {
      const data = await CommunityAPI.getGuilds();
      setGuilds(data);
    } catch (err) {
      console.error("Context: Failed to fetch guilds", err);
      setError("Failed to load guilds.");
    } finally {
      setIsLoadingGuilds(false);
    }
  }, []);

  const fetchGuildDetails = useCallback(async (guildId) => {
    setIsLoadingGuilds(true);
    try {
      const data = await CommunityAPI.getGuildById(guildId);
      setCurrentGuild(data);
      return data;
    } catch (err) {
      console.error("Context: Failed to fetch guild detail", err);
      return null;
    } finally {
      setIsLoadingGuilds(false);
    }
  }, []);

  // ==============================
  //         POST LOGIC
  // ==============================

  const fetchPosts = useCallback(async (guildId = null) => {
    setIsLoadingPosts(true);
    try {
      const data = await CommunityAPI.getPosts(guildId);
      setPosts(data);
    } catch (err) {
      console.error("Context: Failed to fetch posts", err);
      setError("Failed to load discussion.");
    } finally {
      setIsLoadingPosts(false);
    }
  }, []);

  const createPost = useCallback(async (postData) => {
    try {
      // 1. API Call
      const newPost = await CommunityAPI.createPost(postData);
      
      // 2. Update State Locally (Prepend to top of list)
      setPosts(prevPosts => [newPost, ...prevPosts]);
      
      return true;
    } catch (err) {
      console.error("Context: Failed to create post", err);
      setError("Could not create post.");
      return false;
    }
  }, []);

  const togglePostLike = useCallback(async (postId) => {
    // 1. Optimistic Update: Update UI immediately before API returns
    setPosts(prevPosts => 
      prevPosts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            liked: !post.liked,
            likes: post.liked ? post.likes - 1 : post.likes + 1
          };
        }
        return post;
      })
    );

    // 2. API Call (Background)
    try {
      await CommunityAPI.toggleLikePost(postId);
    } catch (err) {
      console.error("Context: Failed to toggle like", err);
      // Optional: Revert state here if API fails
    }
  }, []);

  // ==============================
  //       MARKETPLACE LOGIC
  // ==============================

  const fetchMarketItems = useCallback(async (query = '', category = 'All') => {
    setIsLoadingMarket(true);
    try {
      const data = await CommunityAPI.searchMarket(query, category);
      setMarketItems(data);
    } catch (err) {
      console.error("Context: Failed to load market", err);
    } finally {
      setIsLoadingMarket(false);
    }
  }, []);

  // ==============================
  //       EXPOSED VALUES
  // ==============================

  const value = {
    // Data
    guilds,
    posts,
    marketItems,
    currentGuild,
    error,

    // Loading States
    isLoadingGuilds,
    isLoadingPosts,
    isLoadingMarket,

    // Actions
    fetchGuilds,
    fetchGuildDetails,
    fetchPosts,
    createPost,
    togglePostLike,
    fetchMarketItems
  };

  return (
    <CommunityContext.Provider value={value}>
      {children}
    </CommunityContext.Provider>
  );
};