// api/MockMediaService.js

// Simulated Network Delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const MEDIA_DATABASE = [
    {
        id: '1',
        title: 'Cyberpunk: Edgerunners',
        description: 'In a dystopia riddled with corruption and cybernetic implants, a talented but reckless street kid strives to become a mercenary outlaw — an edgerunner.',
        type: 'Anime',
        year: '2024',
        rating: 9.8,
        match: '98%',
        poster: { uri: 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=800&q=80' },
        backdrop: { uri: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=1200&q=80' },
        tags: ['Trending', 'Sci-Fi', 'Action'],
        cast: [1, 2, 3],
        isFavorite: false
    },
    {
        id: '2',
        title: 'Dune: Part Two',
        description: 'Paul Atreides unites with Chani and the Fremen while on a warpath of revenge against the conspirators who destroyed his family.',
        type: 'Movie',
        year: '2024',
        rating: 9.5,
        match: '95%',
        poster: { uri: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=800&q=80' },
        backdrop: { uri: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=1200&q=80' },
        tags: ['New', 'Sci-Fi', 'Adventure'],
        cast: [4, 5],
        isFavorite: false
    },
    {
        id: '3',
        title: 'Squid Game',
        description: 'Hundreds of cash-strapped players accept a strange invitation to compete in children\'s games. Inside, a tempting prize awaits with deadly high stakes.',
        type: 'K-Drama',
        year: '2023',
        rating: 9.2,
        match: '90%',
        poster: { uri: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&q=80' },
        backdrop: { uri: 'https://images.unsplash.com/photo-1453928582365-b6ad33cbcf64?w=1200&q=80' },
        tags: ['Trending', 'Thriller', 'Drama'],
        cast: [6, 7],
        isFavorite: true
    },
    {
        id: '4',
        title: 'Arcane',
        description: 'Set in Utopian Piltover and the oppressed underground of Zaun, the story follows the origins of two iconic League champions-and the power that will tear them apart.',
        type: 'TV Show',
        year: '2024',
        rating: 9.9,
        match: '99%',
        poster: { uri: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80' },
        backdrop: { uri: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=1200&q=80' },
        tags: ['Trending', 'Fantasy'],
        cast: [1, 8],
        isFavorite: false
    },
    {
        id: '5',
        title: 'Solo Leveling',
        description: 'In a world where hunters, humans who possess magical abilities, must battle deadly monsters to protect the human race from certain annihilation.',
        type: 'Anime',
        year: '2024',
        rating: 9.7,
        match: '97%',
        poster: { uri: 'https://images.unsplash.com/photo-1605806616949-1e87b487bc2a?w=800&q=80' },
        backdrop: { uri: 'https://images.unsplash.com/photo-1519074069444-1ba4fff66d16?w=1200&q=80' },
        tags: ['Action', 'Fantasy'],
        cast: [2],
        isFavorite: false
    },
    {
        id: '6',
        title: 'Fallout',
        description: 'In a future, post-apocalyptic Los Angeles brought about by nuclear decimation, citizens must live in underground bunkers to protect themselves from radiation, mutants and bandits.',
        type: 'TV Show',
        year: '2024',
        rating: 9.4,
        match: '96%',
        poster: { uri: 'https://images.unsplash.com/photo-1590625325841-8e01053426e2?w=800&q=80' },
        backdrop: { uri: 'https://images.unsplash.com/photo-1525127752301-9990263d20b4?w=1200&q=80' },
        tags: ['Trending', 'Sci-Fi', 'Adventure'],
        cast: [9, 10],
        isFavorite: false
    },
    {
        id: '7',
        title: 'Godzilla x Kong',
        description: 'Two ancient titans, Godzilla and Kong, clash in an epic battle as humans unravel their intertwined origins and connection to Skull Island\'s mysteries.',
        type: 'Movie',
        year: '2024',
        rating: 8.9,
        match: '88%',
        poster: { uri: 'https://images.unsplash.com/photo-1535581652167-3d6b98e29a8a?w=800&q=80' },
        backdrop: { uri: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1200&q=80' },
        tags: ['Action', 'Monster'],
        cast: [11],
        isFavorite: false
    }
];

export const MediaService = {
    // Fetch all media
    getAllMedia: async () => {
        await delay(1000); 
        return { success: true, data: MEDIA_DATABASE };
    },

    // Fetch details
    getMediaById: async (id) => {
        await delay(500);
        const item = MEDIA_DATABASE.find(m => m.id === id);
        return item ? { success: true, data: item } : { success: false, message: 'Not Found' };
    },

    // Search
    searchMedia: async (query) => {
        await delay(600);
        if (!query) return { success: true, data: [] };
        const lowerQ = query.toLowerCase();
        const results = MEDIA_DATABASE.filter(item => 
            item.title.toLowerCase().includes(lowerQ) || 
            item.type.toLowerCase().includes(lowerQ)
        );
        return { success: true, data: results };
    },

    // Toggle Favorite
    toggleFavorite: async (id) => {
        await delay(300);
        const index = MEDIA_DATABASE.findIndex(m => m.id === id);
        if (index !== -1) {
            MEDIA_DATABASE[index].isFavorite = !MEDIA_DATABASE[index].isFavorite;
            return { 
                success: true, 
                isFavorite: MEDIA_DATABASE[index].isFavorite,
                message: MEDIA_DATABASE[index].isFavorite ? 'Added to My List' : 'Removed from My List'
            };
        }
        return { success: false, message: 'Error' };
    },

    // Rate Media (Mock)
    rateMedia: async (id, rating) => {
        await delay(800);
        return { success: true, message: 'Rating submitted successfully!' };
    },

    // Get Cast
    getCast: async (mediaId) => {
        await delay(300);
        return { 
            success: true, 
            data: [
                { id: 1, name: 'Keanu Reeves', img: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop' },
                { id: 2, name: 'Scarlett J.', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop' },
                { id: 3, name: 'Tom H.', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop' },
                { id: 4, name: 'Zendaya', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop' }
            ]
        };
    }
};