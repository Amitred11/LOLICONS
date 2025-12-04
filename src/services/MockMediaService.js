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
        poster: { uri: 'https://i.pinimg.com/736x/8e/23/04/8e2304da56fa8dc941a868f041d8fc06.jpg' },
        backdrop: { uri: 'https://images5.alphacoders.com/131/1315849.jpg' },
        tags: ['Trending', 'Sci-Fi', 'Action'],
        cast: [1, 2, 3],
        isFavorite: false
    },
    {
        id: '2',
        title: 'Dune: Part Two',
        description: 'Paul Atreides unites with Chani and the Fremen while on a warpath of revenge against the conspirators who destroyed his family.',
        type: 'Movies',
        year: '2024',
        rating: 9.5,
        match: '95%',
        poster: { uri: 'https://i.pinimg.com/564x/e7/71/3b/e7713b63290dc7c40df2b97c41bf373a.jpg' },
        backdrop: { uri: 'https://images.alphacoders.com/135/1350172.jpeg' },
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
        poster: { uri: 'https://i.pinimg.com/564x/d1/62/1d/d1621d1297127e997f0a823c323f4628.jpg' },
        backdrop: { uri: 'https://images.alphacoders.com/118/1183134.jpg' },
        tags: ['Thriller', 'Drama'],
        cast: [6, 7],
        isFavorite: true
    },
    {
        id: '4',
        title: 'Arcane',
        description: 'Set in Utopian Piltover and the oppressed underground of Zaun, the story follows the origins of two iconic League champions-and the power that will tear them apart.',
        type: 'TV Shows',
        year: '2024',
        rating: 9.9,
        match: '99%',
        poster: { uri: 'https://i.pinimg.com/736x/55/e5/22/55e5223c6f866415ceb5314050eb494e.jpg' },
        backdrop: { uri: 'https://images2.alphacoders.com/119/1191373.jpg' },
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
        poster: { uri: 'https://i.pinimg.com/564x/37/10/72/37107297920427b0c345339dfa4b2781.jpg' },
        backdrop: { uri: 'https://images8.alphacoders.com/134/1346083.jpeg' },
        tags: ['Action', 'Fantasy'],
        cast: [2],
        isFavorite: false
    },
];

export const MediaService = {
    // Fetch all media (Home Screen)
    getAllMedia: async () => {
        await delay(1000); // Simulate slow network
        return { success: true, data: MEDIA_DATABASE };
    },

    // Fetch details for a specific ID
    getMediaById: async (id) => {
        await delay(500);
        const item = MEDIA_DATABASE.find(m => m.id === id);
        return item ? { success: true, data: item } : { success: false, message: 'Not Found' };
    },

    // Search function
    searchMedia: async (query) => {
        await delay(600);
        if (!query) return { success: true, data: [] };
        
        const lowerQ = query.toLowerCase();
        const results = MEDIA_DATABASE.filter(item => 
            item.title.toLowerCase().includes(lowerQ) || 
            item.type.toLowerCase().includes(lowerQ) ||
            item.tags.some(tag => tag.toLowerCase().includes(lowerQ))
        );
        return { success: true, data: results };
    },

    // Toggle Favorite (My List)
    toggleFavorite: async (id) => {
        await delay(400);
        const index = MEDIA_DATABASE.findIndex(m => m.id === id);
        if (index !== -1) {
            MEDIA_DATABASE[index].isFavorite = !MEDIA_DATABASE[index].isFavorite;
            return { 
                success: true, 
                isFavorite: MEDIA_DATABASE[index].isFavorite,
                message: MEDIA_DATABASE[index].isFavorite ? 'Added to My List' : 'Removed from My List'
            };
        }
        return { success: false, message: 'Error updating list' };
    },

    // Mock Cast Data
    getCast: async (mediaId) => {
        await delay(300);
        return { 
            success: true, 
            data: [
                { id: 1, name: 'Keanu Reeves', img: 'https://i.pravatar.cc/100?img=11' },
                { id: 2, name: 'Scarlett J.', img: 'https://i.pravatar.cc/100?img=5' },
                { id: 3, name: 'Tom H.', img: 'https://i.pravatar.cc/100?img=3' },
                { id: 4, name: 'Zendaya', img: 'https://i.pravatar.cc/100?img=9' }
            ]
        };
    }
};