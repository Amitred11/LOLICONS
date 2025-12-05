// context/CommunityContext.js

import React, { createContext, useState, useCallback } from 'react';
import { CommunityAPI } from '@api/MockCommunityService'; // Import your new Service

export const CommunityContext = createContext();

export const CommunityProvider = ({ children }) => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Loads posts from the API. 
   * Can be filtered by guildId (optional).
   */
  const loadPosts = useCallback(async (guildId = null) => {
    setIsLoading(true);
    try {
      const data = await CommunityAPI.getPosts(guildId);
      setPosts(data);
    } catch (error) {
      console.error("CommunityContext: Failed to load posts", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Adds a post via API and updates local state immediately.
   */
  const addPost = async (postData) => {
    try {
      // 1. Call API
      const newPost = await CommunityAPI.createPost(postData);
      
      // 2. Update Local State (Prepend new post)
      setPosts(prev => [newPost, ...prev]);
      
      return true;
    } catch (error) {
      console.error("CommunityContext: Failed to add post", error);
      return false;
    }
  };

  /**
   * Toggles like status optimistically (updates UI immediately, then calls API).
   */
  const toggleLike = async (postId) => {
    // 1. Optimistic UI Update
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          liked: !post.liked,
          likes: post.liked ? post.likes - 1 : post.likes + 1
        };
      }
      return post;
    }));

    // 2. Background API Call
    try {
      await CommunityAPI.toggleLikePost(postId);
    } catch (error) {
      console.error("CommunityContext: Failed to toggle like", error);
      // Optional: Revert state here if API fails
    }
  };

  return (
    <CommunityContext.Provider value={{ 
      posts, 
      isLoading, 
      loadPosts, 
      addPost, 
      toggleLike 
    }}>
      {children}
    </CommunityContext.Provider>
  );
};