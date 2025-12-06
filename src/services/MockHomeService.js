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
    getFeaturedComics: async () => {
        try {
            const response = await ComicService.getFeaturedComics();
            const comics = response.success ? response.data : [];
            return { 
                success: true, 
                data: comics.map(c => ({
                    id: c.id,
                    title: c.title,
                    author: c.author,
                    cover: c.image,
                    localSource: c.image, // Ensure compatibility
                    rating: c.rating,
                    views: formatViews(c.views),
                    tags: c.genres || [],
                    description: c.synopsis,
                    status: c.status
                }))
            };
        } catch (e) { return { success: false, data: [] }; }
    },

    getContinueReading: async () => {
        try {
            const response = await ComicService.getHistory();
            const history = response.success ? response.data : [];
            return { 
                success: true, 
                data: history.map(item => ({
                    ...item,
                    cover: item.image,
                    localSource: item.image,
                    totalChapters: item.totalChapters || 100, 
                    chapters: [{ id: item.lastChapterRead }] 
                }))
            };
        } catch (e) { return { success: false, data: [] }; }
    },

    getDailyGoals: async () => {
        await delay(500); // Simulate network
        return { success: true, data: MOCK_MISSIONS };
    },

    getUpcomingEvents: async () => {
        try {
            if (typeof EventsService !== 'undefined' && EventsService.getEvents) {
                return await EventsService.getEvents();
            }
            return { success: true, data: [] };
        } catch (e) { return { success: true, data: [] }; }
    },

    searchContent: async (query) => {
        try {
            const rawResults = await ComicService.getComics({ searchQuery: query });
            const results = Array.isArray(rawResults) ? rawResults : (rawResults.data || []);
            return { 
                success: true, 
                data: results.map(c => ({ ...c, cover: c.image, views: formatViews(c.views) })) 
            };
        } catch (e) { return { success: true, data: [] }; }
    },
    
    getSearchSuggestions: async (query) => {
        await delay(100); // Fast response for typing
        if (!query || query.length < 2) return { success: true, data: [] };

        try {
            // Fetch all comics to filter (Simulating backend search index)
            const response = await ComicService.getComics({});
            const allComics = response.data || [];
            const lowerQuery = query.toLowerCase();

            const suggestions = [];
            const seen = new Set();

            // 1. Match Titles
            allComics.forEach(c => {
                if (c.title.toLowerCase().includes(lowerQuery)) {
                    if (!seen.has(c.title)) {
                        suggestions.push({ type: 'comic', text: c.title, id: c.id });
                        seen.add(c.title);
                    }
                }
            });

            // 2. Match Authors
            allComics.forEach(c => {
                if (c.author && c.author.toLowerCase().includes(lowerQuery)) {
                    if (!seen.has(c.author)) {
                        suggestions.push({ type: 'author', text: c.author });
                        seen.add(c.author);
                    }
                }
            });

            // 3. Match Genres (Static list check)
            const commonGenres = ['Action', 'Fantasy', 'Romance', 'Isekai', 'Horror', 'Sci-Fi'];
            commonGenres.forEach(g => {
                if (g.toLowerCase().includes(lowerQuery)) {
                    if (!seen.has(g)) {
                        suggestions.push({ type: 'genre', text: g });
                        seen.add(g);
                    }
                }
            });

            return { success: true, data: suggestions.slice(0, 7) }; // Limit to 7 suggestions
        } catch (e) {
            return { success: true, data: [] };
        }
    },

    /**
     * Returns "Trending" keywords based on simulated analytics
     */
    getTrendingKeywords: async () => {
        await delay(500);
        return {
            success: true,
            data: [
                { id: 't1', text: 'Solo Leveling', type: 'trending' },
                { id: 't2', text: 'Isekai', type: 'genre' },
                { id: 't3', text: 'Villainess', type: 'trending' },
                { id: 't4', text: 'Tower of God', type: 'trending' },
                { id: 't5', text: 'Romance', type: 'genre' }
            ]
        };
    },

    /**
     * Full Search Results
     */
    searchContent: async (query) => {
        try {
            const rawResults = await ComicService.getComics({ searchQuery: query });
            const results = Array.isArray(rawResults) ? rawResults : (rawResults.data || []);
            return { success: true, data: results.map(mapComicData) };
        } catch (e) { return { success: true, data: [] }; }
    }
};

// Helper
const mapComicData = (c) => ({
    id: c.id,
    title: c.title,
    author: c.author,
    cover: c.image,
    localSource: c.image,
    rating: c.rating,
    views: formatViews(c.views),
    tags: c.genres || [],
    description: c.synopsis,
    status: c.status
});