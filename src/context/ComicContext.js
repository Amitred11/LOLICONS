// context/ComicContext.js

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';

import { ComicService } from '@api/MockComicService';
import { useAlert } from './AlertContext';

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
    const { showAlert } = useAlert();

    // --- State ---
    const [libraryIds, setLibraryIds] = useState(new Set());
    const [libraryComics, setLibraryComics] = useState([]);
    const [favoriteIds, setFavoriteIds] = useState(new Set());
    const [history, setHistory] = useState([]);
    const [isLoadingUserData, setIsLoadingUserData] = useState(true);

    const [downloads, setDownloads] = useState({});
    const [downloadQueue, setDownloadQueue] = useState({});
    const [isLoadingDownloads, setIsLoadingDownloads] = useState(true);

    // --- Init Downloads ---
    useEffect(() => {
        const loadDownloadState = async () => {
            try {
                await ensureDirExists();
                const storedState = await AsyncStorage.getItem(DOWNLOADS_STORAGE_KEY);
                if (storedState) {
                    setDownloads(JSON.parse(storedState));
                }
            } catch (e) {
                console.error("Failed to load downloads", e);
            } finally {
                setIsLoadingDownloads(false);
            }
        };
        loadDownloadState();
    }, []);

    // --- Persist Downloads ---
    useEffect(() => {
        const saveState = async () => {
            if (!isLoadingDownloads) {
                try {
                    await AsyncStorage.setItem(DOWNLOADS_STORAGE_KEY, JSON.stringify(downloads));
                } catch (e) {
                    console.error("Failed to save downloads", e);
                }
            }
        };
        saveState();
    }, [downloads, isLoadingDownloads]);

    // --- Init User Data ---
    const loadUserData = useCallback(async () => {
        setIsLoadingUserData(true);
        try {
            const [libRes, favRes, histRes] = await Promise.all([
                ComicService.getLibrary(),
                ComicService.getFavorites(),
                ComicService.getHistory()
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
    const addToLibrary = async (comic) => {
        const newSet = new Set(libraryIds);
        newSet.add(comic.id);
        setLibraryIds(newSet);
        setLibraryComics(prev => [...prev, comic]);

        try {
            await ComicService.addToLibrary(comic.id);
            showAlert({ title: "Added", message: "Added to your Library", type: "success" });
        } catch (error) {
            newSet.delete(comic.id);
            setLibraryIds(new Set(newSet));
            setLibraryComics(prev => prev.filter(c => c.id !== comic.id));
            showAlert({ title: "Error", message: "Failed to add to library", type: "error" });
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
            showAlert({ title: "Error", message: "Failed to remove from library", type: "error" });
        }
    };

    const toggleFavorite = async (comic) => {
        const isFav = favoriteIds.has(comic.id);
        const newSet = new Set(favoriteIds);
        
        if (isFav) {
            newSet.delete(comic.id);
            try { await ComicService.removeFromFavorites(comic.id); } 
            catch(e) { console.error(e); }
        } else {
            newSet.add(comic.id);
            try { 
                await ComicService.addToFavorites(comic.id); 
                showAlert({ title: "Favorited!", message: "Added to favorites", type: "success" });
            } 
            catch(e) { console.error(e); }
        }
        setFavoriteIds(newSet);
    };

    const updateHistory = async (comicId, chapterTitle) => {
        await ComicService.updateHistory(comicId, chapterTitle);
        const res = await ComicService.getHistory();
        if(res.success) setHistory(res.data);
    };

    const removeFromHistory = async (comicId) => {
        setHistory(prev => prev.filter(h => h.id !== comicId));
        await ComicService.removeFromHistory(comicId);
    };

    const isInLibrary = (comicId) => libraryIds.has(comicId);
    const isFavorite = (comicId) => favoriteIds.has(comicId);

    // --- Download Logic ---
    const getChapterStatus = (comicId, chapterId) => {
        const key = `${comicId}-${chapterId}`;
        if (downloads[comicId]?.chapters?.[chapterId]) return { status: 'downloaded', progress: 1 };
        if (downloadQueue[key]) return downloadQueue[key];
        return { status: 'none', progress: 0 };
    };

    const downloadChapters = async (comicId, chapterIds, comicSources) => {
        const newQueueItems = {};
        chapterIds.forEach(chapId => {
            if (getChapterStatus(comicId, chapId).status === 'none') {
                newQueueItems[`${comicId}-${chapId}`] = { status: 'queued', progress: 0 };
            }
        });
        setDownloadQueue(prev => ({ ...prev, ...newQueueItems }));

        try {
            // 1. Handle Cover Image
            let coverUri = downloads[comicId]?.coverUri;
            if (!coverUri) {
                const source = comicSources.cover;
                const targetUri = `${COMICS_DIR}${comicId}-cover.jpg`;

                // FIX: Check if source is a remote URI object or a local asset number
                if (source && source.uri) {
                    // Remote URL
                    await FileSystem.downloadAsync(source.uri, targetUri);
                    coverUri = targetUri;
                } else {
                    // Local Asset (require)
                    const asset = Asset.fromModule(source);
                    await asset.downloadAsync();
                    await FileSystem.copyAsync({ from: asset.localUri || asset.uri, to: targetUri });
                    coverUri = targetUri;
                }
            }

            // 2. Process Chapters
            for (const chapterId of chapterIds) {
                const key = `${comicId}-${chapterId}`;
                const pageList = comicSources.pages[comicId];
                
                if (!pageList) continue;

                setDownloadQueue(prev => ({ ...prev, [key]: { status: 'downloading', progress: 0 } }));

                const pageUris = [];
                for (let i = 0; i < pageList.length; i++) {
                    const pageData = pageList[i];
                    const targetPageUri = `${COMICS_DIR}${comicId}-${chapterId}-p${i}.jpg`;
                    
                    // FIX: Handle Page Data (URI vs Asset)
                    if (pageData.uri) {
                         // Remote URL (Mock Service usually returns { id, uri })
                         await FileSystem.downloadAsync(pageData.uri, targetPageUri);
                         pageUris.push(targetPageUri);
                    } else {
                        // Local Asset
                        const pageAsset = Asset.fromModule(pageData);
                        await pageAsset.downloadAsync();
                        await FileSystem.copyAsync({ from: pageAsset.localUri || pageAsset.uri, to: targetPageUri });
                        pageUris.push(targetPageUri);
                    }
                    
                    const currentProgress = (i + 1) / pageList.length;
                    setDownloadQueue(prev => {
                        if (!prev[key]) return prev;
                        return { ...prev, [key]: { status: 'downloading', progress: currentProgress } };
                    });
                }

                setDownloads(prev => ({
                    ...prev,
                    [comicId]: {
                        ...prev[comicId],
                        coverUri,
                        chapters: { ...prev[comicId]?.chapters, [chapterId]: pageUris }
                    }
                }));

                setDownloadQueue(prev => {
                    const newQueue = { ...prev };
                    delete newQueue[key];
                    return newQueue;
                });
            }
        } catch (error) {
            console.error("Download failed:", error);
            showAlert({ title: "Download Error", message: "Failed to save chapter.", type: "error" });
            
            // Cleanup queue on failure
            chapterIds.forEach(cid => {
                const key = `${comicId}-${cid}`;
                setDownloadQueue(prev => {
                    const next = {...prev};
                    delete next[key];
                    return next;
                });
            });
        }
    };

    const deleteChapter = async (comicId, chapterId) => {
        const chapterData = downloads[comicId]?.chapters?.[chapterId];
        if (chapterData) {
            for(const pageUri of chapterData) {
                await FileSystem.deleteAsync(pageUri, { idempotent: true });
            }
        }
        setDownloads(prev => {
            const newDownloads = { ...prev };
            if (newDownloads[comicId]?.chapters) {
                delete newDownloads[comicId].chapters[chapterId];
                if (Object.keys(newDownloads[comicId].chapters).length === 0) {
                    if (newDownloads[comicId].coverUri) {
                        FileSystem.deleteAsync(newDownloads[comicId].coverUri, { idempotent: true });
                    }
                    delete newDownloads[comicId];
                }
            }
            return newDownloads;
        });
    };

    const getDownloadInfo = (comicId, totalChapters) => {
        const downloadedCount = Object.keys(downloads[comicId]?.chapters || {}).length;
        return {
            downloadedCount,
            progress: totalChapters > 0 ? downloadedCount / totalChapters : 0,
        };
    };

    const getDownloadedCoverUri = (comicId) => downloads[comicId]?.coverUri;
    const getDownloadedPages = (comicId, chapterId) => downloads[comicId]?.chapters?.[chapterId];

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