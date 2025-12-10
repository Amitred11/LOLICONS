import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { FriendAPI } from '@api/hub/MockFriendService';
import { MOCK_ALL_USERS } from '@api/MockProfileService'; // Needed for addFriend optimistic update

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
    const [suggestions, setSuggestions] = useState([]); 
    const [isLoading, setIsLoading] = useState(true);

    // --- Search State (NEW) ---
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    // --- Actions ---
    const loadFriends = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await FriendAPI.fetchFriends();
            if (response.success) setFriends(response.data);
        } catch (error) {
            console.error("FriendContext: Load Friends Error", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const loadSuggestions = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await FriendAPI.fetchSuggestions();
            if (response.success) setSuggestions(response.data);
        } catch (error) {
            console.error("FriendContext: Load Suggestions Error", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // --- NEW SEARCH FUNCTION ---
    const searchDirectory = useCallback(async (query) => {
        if (!query) {
            setSearchResults([]);
            return;
        }
        
        setIsSearching(true);
        try {
            const response = await FriendAPI.searchUsers(query);
            if (response.success) {
                setSearchResults(response.data);
            }
        } catch (error) {
            console.error("Search failed", error);
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    }, []);
    // ---------------------------

    const addFriend = useCallback(async (userId) => {
        // Optimistic update
        const userToAdd = Object.values(MOCK_ALL_USERS).find(u => u.id === userId);
        
        if (userToAdd && !friends.some(f => f.id === userId)) {
             setFriends(prev => [...prev, userToAdd]);
        }

        try {
            const response = await FriendAPI.addFriend(userId);
            if (!response.success) throw new Error("API failed");
        } catch (error) {
            console.error("FriendContext: Add Friend Error", error);
            // Revert on failure
            if(userToAdd) setFriends(prev => prev.filter(f => f.id !== userId));
            throw error; 
        }
    }, [friends]);

    const removeFriend = useCallback(async (userId) => {
        if (!friends.some(f => f.id === userId)) return;

        const previousFriends = friends;
        setFriends(prev => prev.filter(f => f.id !== userId)); 

        try {
            const response = await FriendAPI.removeFriend(userId);
            if (!response.success) throw new Error("API failed");
        } catch (error) {
            console.error("FriendContext: Remove Friend Error", error);
            setFriends(previousFriends);
            throw error;
        }
    }, [friends]);

    const createEntity = useCallback(async (type, name, memberIds) => {
        return await FriendAPI.createEntity(type, name, memberIds);
    }, []);

    const onlineFriends = useMemo(() => friends.filter(f => f.status?.type === 'online'), [friends]);

    const value = {
        friends,
        suggestions,
        onlineFriends,
        isLoading,
        // Export Search Stuff
        searchResults, 
        isSearching,
        searchDirectory,
        // ------------------
        loadFriends,
        loadSuggestions,
        createEntity,
        addFriend,
        removeFriend,
    };

    return (
        <FriendContext.Provider value={value}>
            {children}
        </FriendContext.Provider>
    );
};