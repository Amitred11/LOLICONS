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
            console.error("FriendContext: Load Error", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Create Group or Guild
    // We return the result so the UI can navigate to the new Chat
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
    
    // Calculate online friends automatically for the "Favorites" section
    const onlineFriends = useMemo(() => {
        return friends.filter(f => f.status === 'Online');
    }, [friends]);

    const value = {
        friends,
        onlineFriends,
        isLoading,
        loadFriends,
        createEntity,
    };

    return (
        <FriendContext.Provider value={value}>
            {children}
        </FriendContext.Provider>
    );
};