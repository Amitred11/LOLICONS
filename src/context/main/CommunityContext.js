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
  const [currentGuild, setCurrentGuild] = useState(null);
  
  // New State for Replies
  const [currentReplies, setCurrentReplies] = useState([]);

  // --- State: Loading ---
  const [isLoadingGuilds, setIsLoadingGuilds] = useState(false);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [isLoadingMarket, setIsLoadingMarket] = useState(false);
  const [isLoadingReplies, setIsLoadingReplies] = useState(false); // New

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

  const searchGuilds = useCallback(async (query) => {
    setIsLoadingGuilds(true);
    try {
      const data = await CommunityAPI.searchGuilds(query);
      setGuilds(data);
    } catch (err) {
      console.error("Context: Failed to search guilds", err);
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

  const joinGuildPublic = useCallback(async (guildId) => {
    try {
      await CommunityAPI.joinPublicGuild(guildId);
      // Update the currentGuild state locally to reflect the change immediately
      setCurrentGuild(prev => ({ ...prev, membershipStatus: 'member' }));
      return true;
    } catch (err) {
      console.error("Context: Join failed", err);
      return false;
    }
  }, []);

  const requestGuildAccess = useCallback(async (guildId) => {
    try {
      await CommunityAPI.requestJoinGuild(guildId);
      // Update state to 'pending'
      setCurrentGuild(prev => ({ ...prev, membershipStatus: 'pending' }));
      return true;
    } catch (err) {
      console.error("Context: Request failed", err);
      return false;
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

  const fetchReplies = useCallback(async (postId) => {
    setIsLoadingReplies(true);
    setCurrentReplies([]); // Clear previous thread's replies first
    try {
      const data = await CommunityAPI.getReplies(postId);
      setCurrentReplies(data);
    } catch (err) {
      console.error("Context: Failed to fetch replies", err);
      setError("Failed to load replies.");
    } finally {
      setIsLoadingReplies(false);
    }
  }, []);

  const submitReply = useCallback(async (replyData) => {
    try {
      const newReply = await CommunityAPI.addReply(replyData);
      // Optimistically update the list
      setCurrentReplies(prev => [newReply, ...prev]);
      return true;
    } catch (err) {
      console.error("Context: Failed to submit reply", err);
      return false;
    }
  }, []);

  // ==============================
  //       MARKETPLACE LOGIC
  // ==============================

  const fetchMarketItems = useCallback(async (query = '', category = 'All', filters = {}) => {
    setIsLoadingMarket(true);
    try {
      const data = await CommunityAPI.searchMarket(query, category, filters);
      setMarketItems(data);
    } catch (err) {
      console.error("Context: Failed to load market", err);
    } finally {
      setIsLoadingMarket(false);
    }
  }, []);

  const getSecurityLevel = (guild) => {
    return CommunityAPI.getRealmSecurityLevel(guild);
  };

  // ==============================
  //       EXPOSED VALUES
  // ==============================

  const value = {
    guilds,
    posts,
    marketItems,
    currentGuild,
    currentReplies, // Exported
    error,

    isLoadingGuilds,
    isLoadingPosts,
    isLoadingMarket,
    isLoadingReplies, // Exported

    fetchGuilds,
    searchGuilds,
    fetchGuildDetails,
    fetchPosts,
    createPost,
    togglePostLike,
    joinGuildPublic,     
    requestGuildAccess, 
    
    fetchReplies, // Exported
    submitReply,  // Exported
    
    getSecurityLevel,
    fetchMarketItems
  };

  return (
    <CommunityContext.Provider value={value}>
      {children}
    </CommunityContext.Provider>
  );
};