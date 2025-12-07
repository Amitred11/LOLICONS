import { EventsService } from '@api/hub/MockEventsService';
import { ComicService } from '@api/MockComicService';
import { MOCK_RANKS } from '@api/MockProfileService';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const getGoalsForRank = (rank) => {
    const rankIndex = MOCK_RANKS.findIndex(r => r.name === rank.name);
    const difficulty = Math.max(0, rankIndex);
    let goals = [];

    switch (rank.name) {
        case '气': // Spirit Apprentice
            goals = [
                { id: 'read_chapters', type: 'read', title: `Read ${1 + difficulty} Chapter(s)`, total: 1 + difficulty, icon: 'book-outline', xp: 150 },
                { id: 'time_spent', type: 'time', title: 'Spend 15 Minutes Reading', total: 15, icon: 'time-outline', xp: 100 },
                { id: 'rate_comic', type: 'rate', title: 'Rate a Comic', total: 1, icon: 'star-outline', xp: 75 },
                { id: 'add_to_library', type: 'library', title: 'Add a Comic to Bookshelf', total: 1, icon: 'bookmark-outline', xp: 75 },
                { id: 'comment', type: 'comment', title: 'Leave a Comment', total: 1, icon: 'chatbubble-ellipses-outline', xp: 100 },
            ];
            break;

        case '灵': // Soul Forger
            goals = [
                { id: 'read_chapters', type: 'read', title: `Read ${1 + difficulty} Chapters`, total: 1 + difficulty, icon: 'book-outline', xp: 200 },
                { id: 'time_spent', type: 'time', title: `Spend ${20 + difficulty * 2} Minutes`, total: 20 + difficulty * 2, icon: 'time-outline', xp: 150 },
                { id: 'rate_comic', type: 'rate', title: 'Rate 2 Different Comics', total: 2, icon: 'star-half-outline', xp: 125 },
                // --- NEW MISSION GOAL ADDED ---
                { id: 'complete_mission', type: 'mission', title: 'Complete a Special Mission', total: 1, icon: 'rocket-outline', xp: 250 },
                { id: 'share_comic', type: 'share', title: 'Share a Comic', total: 1, icon: 'share-social-outline', xp: 150 },
            ];
            break;
            
        case '玄': case '尊': case '仙': case '圣': case '神':
             goals = [
                { id: 'read_chapters', type: 'read', title: `Read ${2 + difficulty} Chapters`, total: 2 + difficulty, icon: 'book-outline', xp: 250 + (difficulty * 20) },
                { id: 'time_spent', type: 'time', title: `Spend ${30 + difficulty * 5} Minutes`, total: 30 + difficulty * 5, icon: 'time-outline', xp: 200 + (difficulty * 15) },
                { id: 'rate_comic', type: 'rate', title: `Rate ${2 + Math.floor(difficulty/2)} Comics`, total: 2 + Math.floor(difficulty/2), icon: 'star-outline', xp: 175 + (difficulty * 10) },
                { id: 'add_to_library', type: 'library', title: `Add ${1 + Math.floor(difficulty/3)} Comics`, total: 1 + Math.floor(difficulty/3), icon: 'library-outline', xp: 150 + (difficulty * 10) },
                { id: 'explore_genre', type: 'explore', title: 'Read a New Genre', total: 1, icon: 'compass-outline', xp: 200 },
            ];
            break;

        default: // '凡' (The Mortal Realm)
            goals = [
                { id: 'read_chapters', type: 'read', title: 'Read 1 Chapter', total: 1, icon: 'book-outline', xp: 100 },
                { id: 'time_spent', type: 'time', title: 'Spend 10 Minutes Reading', total: 10, icon: 'time-outline', xp: 75 },
                { id: 'explore_featured', type: 'explore', title: 'Explore a Featured Comic', total: 1, icon: 'sparkles-outline', xp: 50 },
                { id: 'check_history', type: 'history', title: 'Visit Your Read History', total: 1, icon: 'time-outline', xp: 50 },
                { id: 'rate_comic', type: 'rate', title: 'Rate a Comic', total: 1, icon: 'star-outline', xp: 75 },
            ];
            break;
    }
    // Return fresh objects with progress and completed status reset
    return goals.map(g => ({ ...g, progress: 0, completed: false }));
};

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

    getDailyGoals: async (userRank) => {
        await delay(300);
        const rank = userRank || MOCK_RANKS[0];
        const goals = getGoalsForRank(rank);
        return { success: true, data: goals };
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