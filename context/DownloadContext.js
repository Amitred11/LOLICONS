// Import necessary modules from React and Expo libraries for storage and file system management.
import React, { createContext, useContext, useState, useEffect } from 'react';
import * as Storage from 'expo-storage';
import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';

// Define a unique key for storing download metadata in the device's persistent storage.
const DOWNLOADS_STORAGE_KEY = 'user_downloads_v2';
// Define the directory within the app's document folder where comic files will be stored.
const COMICS_DIR = FileSystem.documentDirectory + 'comics/';

// A helper function to ensure the comics directory exists before attempting to write files to it.
const ensureDirExists = async () => {
  const dirInfo = await FileSystem.getInfoAsync(COMICS_DIR);
  if (!dirInfo.exists) {
    // If the directory doesn't exist, create it.
    await FileSystem.makeDirectoryAsync(COMICS_DIR, { intermediates: true });
  }
};

// Create the context for download management.
const DownloadContext = createContext();
// Create a custom hook for easy access to the download context.
export const useDownloads = () => useContext(DownloadContext);

/**
 * Provider component that encapsulates all download logic, state, and file system interactions.
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The child components.
 */
export const DownloadProvider = ({ children }) => {
  // State to store metadata about downloaded comics (e.g., { comicId: { coverUri, chapters: { chapterId: [...] } } }).
  const [downloads, setDownloads] = useState({});
  // State to track if the initial download state is being loaded from storage.
  const [isLoading, setIsLoading] = useState(true);
  // State to manage the queue and progress of ongoing downloads.
  const [downloadQueue, setDownloadQueue] = useState({});

  // Effect to load the download state from persistent storage when the component first mounts.
  useEffect(() => {
    const loadState = async () => {
      await ensureDirExists();
      const storedState = await Storage.getItem({ key: DOWNLOADS_STORAGE_KEY });
      if (storedState) {
        setDownloads(JSON.parse(storedState));
      }
      setIsLoading(false);
    };
    loadState();
  }, []);

  // Effect to save the download state to persistent storage whenever it changes.
  useEffect(() => {
    // Only save after the initial loading is complete to avoid overwriting stored data with an empty object.
    if (!isLoading) {
      Storage.setItem({ key: DOWNLOADS_STORAGE_KEY, value: JSON.stringify(downloads) });
    }
  }, [downloads, isLoading]);

  /**
   * Gets the current status of a chapter (downloaded, downloading, queued, or none).
   * @param {string} comicId - The ID of the comic.
   * @param {string} chapterId - The ID of the chapter.
   * @returns {{status: string, progress: number}} The status and progress of the chapter.
   */
  const getChapterStatus = (comicId, chapterId) => {
    const key = `${comicId}-${chapterId}`;
    // If it's in the main downloads state, it's fully downloaded.
    if (downloads[comicId]?.chapters?.[chapterId]) {
      return { status: 'downloaded', progress: 1 };
    }
    // If it's in the queue, return its current queue status.
    if (downloadQueue[key]) {
      return downloadQueue[key];
    }
    // Otherwise, it has not been downloaded.
    return { status: 'none', progress: 0 };
  };

  /**
   * Initiates the download process for a list of chapters.
   * @param {string} comicId - The ID of the comic to download chapters for.
   * @param {string[]} chapterIds - An array of chapter IDs to download.
   * @param {object} comicSources - An object containing the sources for the comic cover and pages.
   */
  const downloadChapters = async (comicId, chapterIds, comicSources) => {
    // Add chapters to the queue if they aren't already being processed.
    const newQueueItems = {};
    chapterIds.forEach(chapId => {
      if (getChapterStatus(comicId, chapId).status === 'none') {
        newQueueItems[`${comicId}-${chapId}`] = { status: 'queued', progress: 0 };
      }
    });
    setDownloadQueue(prev => ({ ...prev, ...newQueueItems }));

    // --- CHANGE IS HERE --- (Original user comment)
    // Download the comic's cover image if it's not already downloaded.
    let coverUri = downloads[comicId]?.coverUri;
    if (!coverUri) {
        const asset = Asset.fromModule(comicSources.cover);
        // Download the asset from the dev server/bundle to the app's cache.
        await asset.downloadAsync();
        const localUri = `${COMICS_DIR}${comicId}-cover.jpg`;
        // Copy the asset from the cache to our persistent comics directory.
        await FileSystem.copyAsync({ from: asset.localUri || asset.uri, to: localUri });
        coverUri = localUri;
    }

    // Process each chapter in the list.
    for (const chapterId of chapterIds) {
      const key = `${comicId}-${chapterId}`;
      const pageSources = comicSources.pages[comicId];
      if (!pageSources) continue; // Skip if no pages are found for this comic.

      // Update the queue to show this chapter is actively downloading.
      setDownloadQueue(prev => ({ ...prev, [key]: { status: 'downloading', progress: 0 } }));

      // Download each page of the chapter.
      const pageUris = [];
      for (let i = 0; i < pageSources.length; i++) {
        const pageAsset = Asset.fromModule(pageSources[i]);
        await pageAsset.downloadAsync();
        const pageUri = `${COMICS_DIR}${comicId}-${chapterId}-p${i}.jpg`;
        await FileSystem.copyAsync({ from: pageAsset.localUri || pageAsset.uri, to: pageUri });
        pageUris.push(pageUri);
        
        // Update the download progress in the queue after each page is downloaded.
        const currentProgress = (i + 1) / pageSources.length;
        setDownloadQueue(prev => {
            if (!prev[key]) return prev; // Avoid updating if the task was cancelled.
            return {
                ...prev,
                [key]: { status: 'downloading', progress: currentProgress }
            };
        });
      }
      
      // Once all pages are downloaded, update the main downloads state with the local file URIs.
      setDownloads(prev => ({
          ...prev,
          [comicId]: {
              ...prev[comicId],
              coverUri,
              chapters: {
                  ...prev[comicId]?.chapters,
                  [chapterId]: pageUris
              }
          }
      }));

      // Remove the completed chapter from the download queue.
      setDownloadQueue(prev => {
        const newQueue = { ...prev };
        delete newQueue[key];
        return newQueue;
      });
    }
  };
  
  /**
   * Deletes a downloaded chapter and its associated files from the device.
   * @param {string} comicId - The ID of the comic.
   * @param {string} chapterId - The ID of the chapter to delete.
   */
  const deleteChapter = async (comicId, chapterId) => {
    const chapterData = downloads[comicId]?.chapters?.[chapterId];
    if (chapterData) {
        // Delete each page file from the file system.
        for(const pageUri of chapterData) {
            await FileSystem.deleteAsync(pageUri, { idempotent: true });
        }
    }
    // Update the state to remove the chapter's metadata.
    setDownloads(prev => {
        const newDownloads = { ...prev };
        if (newDownloads[comicId]?.chapters) {
            delete newDownloads[comicId].chapters[chapterId];
            // If this was the last chapter, delete the comic entry and its cover as well.
            if (Object.keys(newDownloads[comicId].chapters).length === 0) {
                if (newDownloads[comicId].coverUri) {
                    FileSystem.deleteAsync(newDownloads[comicId].coverUri, { idempotent: true });
                }
                delete newDownloads[comicId];
            }
        }
        return newDownloads;
    })
  };
  
  /**
   * Gets information about a comic's download status.
   * @param {string} comicId - The ID of the comic.
   * @param {number} totalChapters - The total number of chapters the comic has.
   * @returns {{downloadedCount: number, progress: number}} An object with the count and progress.
   */
  const getDownloadInfo = (comicId, totalChapters) => {
      const downloadedCount = Object.keys(downloads[comicId]?.chapters || {}).length;
      return {
          downloadedCount,
          progress: totalChapters > 0 ? downloadedCount / totalChapters : 0,
      }
  };

  // Helper function to get the local URI for a downloaded cover.
  const getDownloadedCoverUri = (comicId) => downloads[comicId]?.coverUri;
  // Helper function to get the array of local page URIs for a downloaded chapter.
  const getDownloadedPages = (comicId, chapterId) => downloads[comicId]?.chapters?.[chapterId];

  // Bundle all functions and state into the value object for the provider.
  const value = {
    getChapterStatus,
    downloadChapters,
    deleteChapter,
    getDownloadInfo,
    getDownloadedCoverUri,
    getDownloadedPages,
  };

  return (
    <DownloadContext.Provider value={value}>
      {children}
    </DownloadContext.Provider>
  );
};