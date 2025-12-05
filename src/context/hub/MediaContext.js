import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { MediaService } from '@api/hub/MockMediaService';

const MediaContext = createContext();

export const useMedia = () => {
    const context = useContext(MediaContext);
    if (!context) {
        throw new Error('useMedia must be used within a MediaProvider');
    }
    return context;
};

export const MediaProvider = ({ children }) => {
    // --- State ---
    const [mediaData, setMediaData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchResults, setSearchResults] = useState([]);
    
    // --- Actions ---

    // Load Initial Data
    const loadMedia = useCallback(async (isRefresh = false) => {
        if (!isRefresh && mediaData.length > 0) return;
        
        setIsLoading(true);
        try {
            const response = await MediaService.getAllMedia();
            if (response.success) {
                setMediaData(response.data);
            }
        } catch (error) {
            console.error("MediaContext: Load Failed", error);
        } finally {
            setIsLoading(false);
        }
    }, [mediaData.length]);

    // Search
    const searchMedia = useCallback(async (query) => {
        if (!query || query.length < 2) {
            setSearchResults([]);
            return;
        }
        
        // Optimistic local filter first (optional)
        const localResults = mediaData.filter(item => 
            item.title.toLowerCase().includes(query.toLowerCase())
        );
        setSearchResults(localResults);

        try {
            const response = await MediaService.searchMedia(query);
            if (response.success) {
                setSearchResults(response.data);
            }
        } catch (error) {
            console.error("MediaContext: Search Failed", error);
        }
    }, [mediaData]);

    // Toggle Favorite (My List)
    const toggleFavorite = useCallback(async (id) => {
        // Optimistic Update
        setMediaData(prev => prev.map(item => 
            item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
        ));

        try {
            const response = await MediaService.toggleFavorite(id);
            if (!response.success) {
                // Revert if failed
                setMediaData(prev => prev.map(item => 
                    item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
                ));
                return { success: false, message: 'Failed to update list' };
            }
            return response;
        } catch (error) {
            return { success: false, message: 'Network Error' };
        }
    }, []);

    // Get Single Item (from cache or API)
    const getMediaById = useCallback(async (id) => {
        // Check cache first
        const cachedItem = mediaData.find(m => m.id === id);
        if (cachedItem) return { success: true, data: cachedItem };

        // Fallback to API call
        try {
            return await MediaService.getMediaById(id);
        } catch (e) {
            return { success: false };
        }
    }, [mediaData]);

    // Get Cast
    const getCast = useCallback(async (id) => {
        return await MediaService.getCast(id);
    }, []);

    // Derived State: My List
    const myList = mediaData.filter(item => item.isFavorite);

    useEffect(() => {
        loadMedia();
    }, [loadMedia]);

    const value = {
        mediaData,
        isLoading,
        loadMedia,
        
        // Search
        searchResults,
        searchMedia,

        // Actions
        toggleFavorite,
        getMediaById,
        getCast,

        // Derived
        myList
    };

    return (
        <MediaContext.Provider value={value}>
            {children}
        </MediaContext.Provider>
    );
};