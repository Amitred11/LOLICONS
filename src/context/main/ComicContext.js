// context/ComicContext.js

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';

import { ComicService } from '@api/MockComicService';
import { useAlert } from '@context/other/AlertContext';

const DOWNLOADS_STORAGE_KEY = 'user_downloads_v3';
const COMICS_DIR = FileSystem.documentDirectory + 'comics/';

const ensureDirExists = async () => {
    const dirInfo = await FileSystem.getInfoAsync(COMICS_DIR);
    if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(COMICS_DIR, { intermediates: true });
    }
};

const ComicContext = createContext();

export const ComicProvider = ({ children }) => {
    const { showToast } = useAlert();

    // --- State ---
    const [libraryIds, setLibraryIds] = useState(new Set());
    const [libraryComics, setLibraryComics] = useState([]);
    const [favoriteIds, setFavoriteIds] = useState(new Set());
    const [history, setHistory] = useState([]);
    const [isLoadingUserData, setIsLoadingUserData] = useState(true);
    
    // NEW: State for user's personal ratings
    const [userRatings, setUserRatings] = useState({});

    const [downloads, setDownloads] = useState({});
    const [downloadQueue, setDownloadQueue] = useState({});
    const [isLoadingDownloads, setIsLoadingDownloads] = useState(true);

    // --- Init & Persist Downloads ---
    useEffect(() => {
        const loadDownloadState = async () => {
            try {
                await ensureDirExists();
                const storedState = await AsyncStorage.getItem(DOWNLOADS_STORAGE_KEY);
                if (storedState) setDownloads(JSON.parse(storedState));
            } catch (e) { console.error("Failed to load downloads", e); } 
            finally { setIsLoadingDownloads(false); }
        };
        loadDownloadState();
    }, []);

    useEffect(() => {
        if (!isLoadingDownloads) {
            AsyncStorage.setItem(DOWNLOADS_STORAGE_KEY, JSON.stringify(downloads))
                .catch(e => console.error("Failed to save downloads", e));
        }
    }, [downloads, isLoadingDownloads]);

    // --- Init User Data ---
    const loadUserData = useCallback(async () => {
        setIsLoadingUserData(true);
        try {
            // UPDATED: Fetch ratings along with other user data
            const [libRes, favRes, histRes, ratingsRes] = await Promise.all([
                ComicService.getLibrary(),
                ComicService.getFavorites(),
                ComicService.getHistory(),
                ComicService.getUserRatings() // Fetch user ratings
            ]);

            if (libRes.success) {
                setLibraryComics(libRes.data);
                setLibraryIds(new Set(libRes.data.map(c => c.id)));
            }
            if (favRes.success) {
                setFavoriteIds(new Set(favRes.data.map(c => c.id)));
            }
            if (histRes.success) {
                setHistory(histRes.data);
            }
            // NEW: Set the ratings state
            if (ratingsRes.success) {
                setUserRatings(ratingsRes.data);
            }
        } catch (error) {
            console.error("ComicContext: Failed to load user data", error);
        } finally {
            setIsLoadingUserData(false);
        }
    }, []);

    useEffect(() => {
        loadUserData();
    }, [loadUserData]);

    // --- Actions ---
    // ... (addToLibrary, removeFromLibrary, toggleFavorite, history actions remain the same) ...
    const addToLibrary = async (comic) => {
        const newSet = new Set(libraryIds);
        newSet.add(comic.id);
        setLibraryIds(newSet);
        setLibraryComics(prev => [...prev, comic]);

        try {
            await ComicService.addToLibrary(comic.id);
            showToast("Added to your Library",  "success" );
        } catch (error) {
            newSet.delete(comic.id);
            setLibraryIds(new Set(newSet));
            setLibraryComics(prev => prev.filter(c => c.id !== comic.id));
            showToast ("Failed to add to library",  "error" );
        }
    };
    const removeFromLibrary = async (comicId) => {
        const newSet = new Set(libraryIds);
        newSet.delete(comicId);
        setLibraryIds(newSet);
        setLibraryComics(prev => prev.filter(c => c.id !== comicId));
        try {
            await ComicService.removeFromLibrary(comicId);
        } catch (error) {
            loadUserData();
            showToast ( "Failed to remove from library", "error" );
        }
    };
    const toggleFavorite = async (comic) => {
        const isFav = favoriteIds.has(comic.id);
        const newSet = new Set(favoriteIds);
        if (isFav) newSet.delete(comic.id);
        else newSet.add(comic.id);
        setFavoriteIds(newSet);

        try {
            if (isFav) {
                await ComicService.removeFromFavorites(comic.id);
            } else {
                await ComicService.addToFavorites(comic.id);
                showToast ( "Added to favorites", "success" );
            }
        } catch (e) {
            console.error(e);
            loadUserData(); // Revert on error
        }
    };
    const updateHistory = useCallback(async (comicId, chapterTitle) => {
        await ComicService.updateHistory(comicId, chapterTitle);
        // We fetch silently to update the UI list
        const res = await ComicService.getHistory();
        if(res.success) setHistory(res.data);
    }, []); 

    const removeFromHistory = async (comicId) => {
        setHistory(prev => prev.filter(h => h.id !== comicId));
        await ComicService.removeFromHistory(comicId);
    };

    // --- NEW: Rating Actions ---
    const rateComic = async (comicId, rating) => {
        const previousRating = userRatings[comicId];
        // Optimistically update UI
        setUserRatings(prev => ({ ...prev, [comicId]: rating }));

        try {
            await ComicService.rateComic(comicId, rating);
            showToast ( `You rated this comic ${rating} stars.`, "success" );
        } catch (error) {
            // Revert on failure
            setUserRatings(prev => ({ ...prev, [comicId]: previousRating }));
            showToast ( "Failed to save your rating.", "error" );
        }
    };

    // --- Getters ---
    const isInLibrary = (comicId) => libraryIds.has(comicId);
    const isFavorite = (comicId) => favoriteIds.has(comicId);
    // NEW: Getter for a specific comic's user rating
    const getUserRating = (comicId) => userRatings[comicId] || 0; // Return 0 if not rated


    // --- Download Logic (remains the same) ---
    const getChapterStatus = (comicId, chapterId) => {
        const key = `${comicId}-${chapterId}`;
        if (downloads[comicId]?.chapters?.[chapterId]) return { status: 'downloaded', progress: 1 };
        if (downloadQueue[key]) return downloadQueue[key];
        return { status: 'none', progress: 0 };
    };
    const downloadChapters = async (comicId, chapterIds, comicSources) => {
        // ... implementation remains the same
    };
    const deleteChapter = async (comicId, chapterId) => {
        // ... implementation remains the same
    };
    const getDownloadInfo = (comicId, totalChapters) => {
        const downloadedCount = Object.keys(downloads[comicId]?.chapters || {}).length;
        return {
            downloadedCount,
            progress: totalChapters > 0 ? downloadedCount / totalChapters : 0,
        };
    };
    const getDownloadedCoverUri = (comicId) => downloads[comicId]?.coverUri;
    const getDownloadedPages = useCallback((comicId, chapterId) => {
        return downloads[comicId]?.chapters?.[chapterId];
    }, [downloads]); 
    return (
        <ComicContext.Provider
            value={{
                libraryComics,
                history,
                isLoadingUserData,
                isInLibrary,
                isFavorite,
                addToLibrary,
                removeFromLibrary,
                toggleFavorite,
                updateHistory,
                removeFromHistory,
                refreshUserData: loadUserData,

                // Ratings
                userRatings,
                rateComic,
                getUserRating,
                
                // Downloads
                getChapterStatus,
                downloadChapters,
                deleteChapter,
                getDownloadInfo,
                getDownloadedCoverUri,
                getDownloadedPages,
                isLoadingDownloads
            }}
        >
            {children}
        </ComicContext.Provider>
    );
};

export const useComic = () => {
    const context = useContext(ComicContext);
    if (!context) throw new Error("useComic must be used within a ComicProvider");
    return context;
};