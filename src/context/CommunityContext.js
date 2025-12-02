import React, { createContext, useState } from 'react';
import { POSTS as INITIAL_POSTS } from '../screens/community/data/communityData';

export const CommunityContext = createContext();

export const CommunityProvider = ({ children }) => {
  const [posts, setPosts] = useState(INITIAL_POSTS);

  const addPost = (newPost) => {
    setPosts(prev => [newPost, ...prev]);
  };

  const toggleLike = (postId) => {
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
  };

  return (
    <CommunityContext.Provider value={{ posts, addPost, toggleLike }}>
      {children}
    </CommunityContext.Provider>
  );
};