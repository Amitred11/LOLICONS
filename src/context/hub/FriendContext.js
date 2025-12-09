import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { FriendAPI } from '@api/hub/MockFriendService';

const FriendContext = createContext();

export const useFriend = () => {
    const context = useContext(FriendContext);
    if (!context) {
        throw new Error('useFriend must be used within a FriendProvider');
    }
    return context;
};

export const FriendProvider = ({ children }) => {
    // --- State ---
    const [friends, setFriends] = useState([]);
    const [suggestions, setSuggestions] = useState([]); // New state for suggestions
    const [isLoading, setIsLoading] = useState(true);

    // --- Actions ---

    const loadFriends = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await FriendAPI.fetchFriends();
            if (response.success) {
                setFriends(response.data);
            }
        } catch (error) {
            console.error("FriendContext: Load Friends Error", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // New action to load suggestions
    const loadSuggestions = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await FriendAPI.fetchSuggestions();
            if (response.success) {
                setSuggestions(response.data);
            }
        } catch (error) {
            console.error("FriendContext: Load Suggestions Error", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const addFriend = useCallback(async (userId) => {
        const userToAdd = MOCK_ALL_USERS[userId] || MOCK_ALL_USERS[`friend_${userId}`];
        if (!userToAdd || friends.some(f => f.id === userId)) return; // Don't add if already a friend

        const previousFriends = friends;
        setFriends(prev => [...prev, userToAdd]); // Optimistic update

        try {
            const response = await FriendAPI.addFriend(userId);
            if (!response.success) throw new Error("API failed");
        } catch (error) {
            console.error("FriendContext: Add Friend Error", error);
            setFriends(previousFriends); // Revert on failure
            throw error; // Re-throw to be caught in the UI
        }
    }, [friends]);

    // NEW: Remove Friend action with optimistic update
    const removeFriend = useCallback(async (userId) => {
        if (!friends.some(f => f.id === userId)) return;

        const previousFriends = friends;
        setFriends(prev => prev.filter(f => f.id !== userId)); // Optimistic update

        try {
            const response = await FriendAPI.removeFriend(userId);
            if (!response.success) throw new Error("API failed");
        } catch (error) {
            console.error("FriendContext: Remove Friend Error", error);
            setFriends(previousFriends); // Revert on failure
            throw error;
        }
    }, [friends]);

    const createEntity = useCallback(async (type, name, memberIds) => {
        try {
            const response = await FriendAPI.createEntity(type, name, memberIds);
            return response;
        } catch (error) {
            console.error(`FriendContext: Create ${type} Error`, error);
            throw error;
        }
    }, []);

    // --- Derived State ---
    
    const onlineFriends = useMemo(() => {
        return friends.filter(f => f.status?.type === 'online');
    }, [friends]);

    const value = {
        friends,
        suggestions, // Expose suggestions
        onlineFriends,
        isLoading,
        loadFriends,
        loadSuggestions, // Expose suggestion loader
        createEntity,
        addFriend,      // Expose new function
        removeFriend,
    };

    return (
        <FriendContext.Provider value={value}>
            {children}
        </FriendContext.Provider>
    );
};