// services/MockHomeService.js
import { EventsService } from '@api/hub/MockEventsService';
import { ComicService } from '@api/MockComicService';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const MOCK_MISSIONS = [
    { id: 'm1', title: 'Read 1 Chapter', progress: 1, total: 1, completed: true, icon: 'book-outline' },
    { id: 'm2', title: 'Spend 10 Minutes', progress: 5, total: 10, completed: false, icon: 'time-outline' },
    { id: 'm3', title: 'Rate a Comic', progress: 0, total: 1, completed: false, icon: 'star-outline' },
];

const formatViews = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
};

export const HomeService = {
    // 1. Featured Comics
    getFeaturedComics: async () => {
        try {
            const response = await ComicService.getFeaturedComics();
            
            // FIX: Check for success and extract .data
            const comics = response.success ? response.data : [];

            const mappedData = comics.map(comic => ({
                id: comic.id,
                title: comic.title,
                author: comic.author,
                cover: comic.image,
                localSource: comic.image,
                rating: comic.rating,
                views: formatViews(comic.views),
                tags: comic.genres || [],
                description: comic.synopsis,
                status: comic.status
            }));

            return { success: true, data: mappedData };
        } catch (error) {
            console.error('HomeService Featured Error:', error);
            return { success: false, data: [] };
        }
    },

    // 2. Continue Reading
    getContinueReading: async () => {
        try {
            const response = await ComicService.getHistory();
            
            // FIX: Check for success and extract .data
            const history = response.success ? response.data : [];

            const mappedHistory = history.map(item => ({
                ...item,
                cover: item.image,
                localSource: item.image,
                totalChapters: item.totalChapters || 100, 
                chapters: [{ id: item.lastChapterRead }] 
            }));

            return { success: true, data: mappedHistory };
        } catch (error) {
            console.error('HomeService History Error:', error);
            return { success: false, data: [] };
        }
    },

    // 3. Daily Goals
    getDailyGoals: async () => {
        await delay(500);
        return { success: true, data: MOCK_MISSIONS };
    },

    // 4. Upcoming Events
    getUpcomingEvents: async () => {
        try {
            // Check if EventsService exists to prevent crashes if module is missing
            if (typeof EventsService !== 'undefined' && EventsService.getEvents) {
                return await EventsService.getEvents();
            }
            return { success: true, data: [] };
        } catch (e) {
            return { success: true, data: [] };
        }
    },

    // 5. Search
    searchContent: async (query) => {
        try {
            // This method usually returns a raw array in ComicService, 
            // but let's handle it safely if it returns an object.
            const rawResults = await ComicService.getComics({ searchQuery: query });
            
            // Handle both Array return or { success, data } return
            const results = Array.isArray(rawResults) ? rawResults : (rawResults.data || []);
            
            const mappedResults = results.map(c => ({
                ...c,
                cover: c.image,
                views: formatViews(c.views)
            }));
            
            return { success: true, data: mappedResults };
        } catch (error) {
            return { success: true, data: [] };
        }
    }
};