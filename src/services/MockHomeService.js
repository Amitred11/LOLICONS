// services/MockHomeService.js
import { EventsService } from '@api/hub/MockEventsService';
import { ComicService } from '@api/MockComicService'; // Import the source of truth

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const MOCK_MISSIONS = [
    { id: 'm1', title: 'Read 1 Chapter', progress: 1, total: 1, completed: true, icon: 'book-outline' },
    { id: 'm2', title: 'Spend 10 Minutes', progress: 5, total: 10, completed: false, icon: 'time-outline' },
    { id: 'm3', title: 'Rate a Comic', progress: 0, total: 1, completed: false, icon: 'star-outline' },
];

// Helper to format large numbers (e.g., 2500000 -> 2.5M)
const formatViews = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
};

export const HomeService = {
    // 1. Featured Comics (Fetched from ComicService based on Views)
    getFeaturedComics: async () => {
        try {
            const featured = await ComicService.getFeaturedComics();
            
            // Map the ComicService data structure to the Home UI structure
            const mappedData = featured.map(comic => ({
                id: comic.id,
                title: comic.title,
                author: comic.author,
                cover: comic.image, // Map 'image' to 'cover' for UI
                localSource: comic.image, // Ensure localSource exists for AnimatedCards
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

    // 2. Continue Reading (Fetched from ComicService History)
    getContinueReading: async () => {
        try {
            const history = await ComicService.getHistory();
            
            // Map History data to Card expectations
            const mappedHistory = history.map(item => ({
                ...item,
                cover: item.image, // UI often expects 'cover'
                localSource: item.image,
                // Ensure specific fields exist for the Progress Bar in Card
                totalChapters: item.totalChapters || 100, 
                chapters: [{ id: item.lastChapterRead }] // Mock for card display
            }));

            return { success: true, data: mappedHistory };
        } catch (error) {
            console.error('HomeService History Error:', error);
            return { success: false, data: [] };
        }
    },

    // 3. Daily Goals (Kept local for now, or could act as a bridge to a MissionService)
    getDailyGoals: async () => {
        await delay(500);
        return { success: true, data: MOCK_MISSIONS };
    },

    // 4. Upcoming Events
    getUpcomingEvents: async () => {
        try {
            if (EventsService && EventsService.getEvents) {
                return await EventsService.getEvents();
            }
            return { success: true, data: [] };
        } catch (e) {
            return { success: true, data: [] };
        }
    },

    // 5. Search (Delegates to ComicService)
    searchContent: async (query) => {
        try {
            const results = await ComicService.getComics({ searchQuery: query });
            
            // Map results for consistency
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