// services/MockHomeService.js
import { EventsService } from './MockEventsService';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// --- Inline Mock Data (Prevents undefined imports) ---
const MOCK_MISSIONS = [
    { id: 'm1', title: 'Read 1 Chapter', progress: 1, total: 1, completed: true, icon: 'book-outline' },
    { id: 'm2', title: 'Spend 10 Minutes', progress: 5, total: 10, completed: false, icon: 'time-outline' },
    { id: 'm3', title: 'Rate a Comic', progress: 0, total: 1, completed: false, icon: 'star-outline' },
];

const MOCK_COMICS = [
    {
        id: 'c1',
        title: 'Solo Leveling',
        author: 'Chugong',
        cover: { uri: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=800' },
        rating: 4.9,
        views: '2.1M',
        tags: ['Action', 'Fantasy', 'System'],
        description: 'The weakest hunter of all mankind.',
        status: 'Ongoing'
    },
    {
        id: 'c2',
        title: 'The Beginning After The End',
        author: 'TurtleMe',
        cover: { uri: 'https://images.unsplash.com/photo-1519074069444-1ba4fff66d16?w=800' },
        rating: 4.8,
        views: '1.8M',
        tags: ['Fantasy', 'Isekai', 'Magic'],
        description: 'King Grey has unrivaled strength.',
        status: 'Ongoing'
    },
    {
        id: 'c3',
        title: 'Lore Olympus',
        author: 'Rachel Smythe',
        cover: { uri: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800' },
        rating: 4.7,
        views: '3.5M',
        tags: ['Romance', 'Drama', 'Fantasy'],
        description: 'Witness what the gods do… after dark.',
        status: 'Completed'
    },
    {
        id: 'c4',
        title: 'Omniscient Reader',
        author: 'SingNsong',
        cover: { uri: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800' },
        rating: 4.9,
        views: '1.2M',
        tags: ['Action', 'Apocalypse'],
        description: 'Only I know the end of this world.',
        status: 'Ongoing'
    },
    {
        id: 'c5',
        title: 'Tower of God',
        author: 'SIU',
        cover: { uri: 'https://images.unsplash.com/photo-1515549832467-8783363e19b6?w=800' },
        rating: 4.6,
        views: '4.0M',
        tags: ['Fantasy', 'Adventure'],
        description: 'Reach the top, and everything will be yours.',
        status: 'Ongoing'
    },
    {
        id: 'c6',
        title: 'Villains Are Destined to Die',
        author: 'Gwon Gyeoeul',
        cover: { uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800' },
        rating: 4.8,
        views: '900K',
        tags: ['Romance', 'Isekai', 'Villainess'],
        description: 'I’ve been reincarnated as the villainess.',
        status: 'Ongoing'
    }
];

export const HomeService = {
    // 1. Featured Comics
    getFeaturedComics: async () => {
        await delay(800);
        return { success: true, data: MOCK_COMICS.slice(0, 4) };
    },

    // 2. Continue Reading
    getContinueReading: async () => {
        await delay(600);
        // Safety checks to ensure we don't spread undefined objects
        const c1 = MOCK_COMICS[3] || MOCK_COMICS[0];
        const c2 = MOCK_COMICS[1] || MOCK_COMICS[0];

        // Ensure chapters/localSource structure matches what cards expect
        const history = [
            { 
                ...c1, 
                lastChapter: 45, 
                totalChapters: 120, 
                progress: 0.35,
                chapters: [{ id: 45 }], // Mock for card display
                localSource: c1.cover // Map cover to localSource for card compatibility
            }, 
            { 
                ...c2, 
                lastChapter: 112, 
                totalChapters: 175, 
                progress: 0.64,
                chapters: [{ id: 112 }],
                localSource: c2.cover
            }, 
        ];
        return { success: true, data: history };
    },

    // 3. Daily Goals
    getDailyGoals: async () => {
        await delay(500);
        // Return local MOCK_MISSIONS so it is never undefined
        return { success: true, data: MOCK_MISSIONS };
    },

    // 4. Upcoming Events
    getUpcomingEvents: async () => {
        try {
            // Handle case where EventsService might be missing or fail
            if (EventsService && EventsService.getEvents) {
                return await EventsService.getEvents();
            }
            return { success: true, data: [] };
        } catch (e) {
            console.warn("Event service failed", e);
            return { success: true, data: [] };
        }
    },

    // 5. Search
    searchContent: async (query) => {
        await delay(300); 
        if (!query) return { success: true, data: [] };

        const lowerQ = query.toLowerCase();
        const results = MOCK_COMICS.filter(comic => 
            comic.title.toLowerCase().includes(lowerQ) || 
            comic.author.toLowerCase().includes(lowerQ) ||
            comic.tags.some(tag => tag.toLowerCase().includes(lowerQ))
        );
        
        return { success: true, data: results };
    }
};