// api/MockComicService.js

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper to generate dates relative to today
const getDateString = (daysAgo) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString();
};

// --- MOCK DATA ---

let _comics = [
  { 
    id: '1', 
    title: 'Cybernetic Dawn', 
    author: 'J.K. Artwright',
    status: 'Ongoing',
    type: 'Manhwa',
    genres: ['Sci-Fi', 'Action', 'Cyberpunk'],
    synopsis: 'In a neon-drenched future, a rogue android discovers a secret that could shatter the fragile peace between humans and machines.',
    image: { uri: 'https://images.unsplash.com/photo-1535905557558-afc4877a26fc?w=800&q=80' },
    cover: { uri: 'https://images.unsplash.com/photo-1535905557558-afc4877a26fc?w=800&q=80' },
    isPopular: true,
    views: 2500000, 
    rating: 4.8,
    chapters: Array.from({ length: 15 }, (_, i) => ({ id: `${15-i}`, title: `Chapter ${15-i}`, releaseDate: getDateString(i*2) }))
  },
  { 
    id: '2', 
    title: 'The Quantum Mage', 
    author: 'Elara Vance',
    status: 'Completed',
    type: 'Manga',
    genres: ['Fantasy', 'Magic', 'Adventure'],
    synopsis: 'A young mage with the ability to bend reality itself is thrust into a war between ancient magical houses.',
    image: { uri: 'https://images.unsplash.com/photo-1614726365206-897379203a5e?w=800&q=80' },
    cover: { uri: 'https://images.unsplash.com/photo-1614726365206-897379203a5e?w=800&q=80' },
    isPopular: true,
    views: 4100000, 
    rating: 4.9,
    chapters: Array.from({ length: 50 }, (_, i) => ({ id: `${50-i}`, title: `Chapter ${50-i}`, releaseDate: getDateString(i*10) })),
  },
  { 
    id: '3', 
    title: 'Galactic Ghosts', 
    author: 'Axel Corrigan', 
    status: 'Ongoing',
    type: 'Comic',
    genres: ['Sci-Fi', 'Horror'],
    synopsis: 'A crew of smugglers takes on a job that\'s too good to be true.', 
    image: { uri: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800&q=80' }, 
    cover: { uri: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800&q=80' }, 
    isPopular: true,
    views: 890000, 
    rating: 4.5,
    chapters: [{id: '1', title: 'Chapter 1', releaseDate: getDateString(1)}],
  },
  {
    id: '4',
    title: 'Chronos Heist',
    author: 'Lena Petrova',
    status: 'Completed',
    type: 'Manga',
    genres: ['Sci-Fi', 'Thriller'],
    synopsis: 'A team of thieves uses experimental time-travel technology.',
    image: { uri: 'https://images.unsplash.com/photo-1519074069444-1ba4fff66d16?w=800&q=80' },
    cover: { uri: 'https://images.unsplash.com/photo-1519074069444-1ba4fff66d16?w=800&q=80' },
    isPopular: false,
    views: 120000, 
    rating: 4.2,
    chapters: [{id: '1', title: 'Chapter 1', releaseDate: getDateString(20)}],
  },
  {
    id: '5',
    title: 'Solo Leveling',
    author: 'Chugong',
    status: 'Ongoing',
    type: 'Manhwa',
    genres: ['Action', 'Fantasy'],
    synopsis: 'The weakest hunter of all mankind discovers a system.',
    image: { uri: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=800' },
    cover: { uri: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=800' },
    isPopular: true,
    views: 15000000, 
    rating: 4.9,
    chapters: Array.from({ length: 100 }, (_, i) => ({ id: `${100-i}`, title: `Chapter ${100-i}`, releaseDate: getDateString(i) })),
  },
  {
    id: 'novel-1',
    title: 'The Shadow Monarch’s Legacy',
    author: 'V.H. Nightfall',
    status: 'Ongoing',
    type: 'Novel',
    isNovel: true, // Flag to distinguish
    genres: ['Fantasy', 'System', 'Adventure'],
    synopsis: 'A world where text is power. After failing the entrance exam, Arthur finds an old book...',
    image: { uri: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800' },
    cover: { uri: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800' },
    views: 1200000,
    rating: 4.7,
    chapters: [
        { 
            id: '1', 
            title: 'Chapter 1: The Awakening', 
            releaseDate: new Date().toISOString(),
            content: `The air in the Great Library was thick with the scent of ancient parchment and ozone.\n\nArthur gripped the edge of the mahogany table, his knuckles white. Before him lay the "Lexicon of Void," a book that shouldn't exist. \n\n"System initialization..." a cold, mechanical voice echoed in his mind. \n\nHe gasped, falling back as blue holographic windows erupted in his vision. Unlike the Gold-tier mages, his interface was dark—pitch black with crimson text.\n\n[Title Acquired: The Last Reader]\n[Unique Skill Unlocked: Narrative Interference]\n\n"So it's true," he whispered, a manic grin spreading across his face. "The world really is just a story."`
        },
        { id: '2', title: 'Chapter 2: Narrative Interference', content: 'Continuing the story...' }
    ]
}
];



let _history = [
  {
    id: '1',
    title: 'Cybernetic Dawn',
    image: { uri: 'https://images.unsplash.com/photo-1535905557558-afc4877a26fc?w=800&q=80' },
    lastChapterRead: 'Chapter 15',
    lastRead: new Date().toISOString(),
    progress: 0.75,
    totalChapters: 15
  },
  {
    id: '4',
    title: 'Chronos Heist',
    image: { uri: 'https://images.unsplash.com/photo-1519074069444-1ba4fff66d16?w=800&q=80' },
    lastChapterRead: 'Chapter 1',
    lastRead: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(), 
    progress: 0.2,
    totalChapters: 20
  },
];


// Mock Library (IDs only)
let _library = new Set(['1', '3']); 

// Mock Favorites (IDs only) - NEW
let _favorites = new Set(['5', '2']);
let _userRatings = {
    '1': 5, // User has rated 'Cybernetic Dawn' 5 stars
    '3': 4, // User has rated 'Galactic Ghosts' 4 stars
};
// --- SERVICE ---

export const ComicService = {
    // 1. Basic Getters
    getAllComics: () => _comics,
    
    getComicDetails: async (id) => {
        await delay(300);
        return _comics.find(c => c.id === id);
    },

    // 2. Home Screen Data
    getFeaturedComics: async () => {
        await delay(500);
        const sorted = [..._comics].sort((a, b) => b.views - a.views);
        return { success: true, data: sorted.slice(0, 5) };
    },

    // 3. History
    getHistory: async (searchQuery = null) => {
        await delay(500);
        let result = [..._history];
        
        if (searchQuery) {
            const lowerQ = searchQuery.toLowerCase();
            result = result.filter(h => h.title.toLowerCase().includes(lowerQ));
        }

        const sorted = result.sort((a, b) => new Date(b.lastRead) - new Date(a.lastRead));
        return { success: true, data: sorted };
    },
    
    getContinueReading: async () => {
        return ComicService.getHistory();
    },

    updateHistory: async (comicId, chapterTitle) => {
        const comic = _comics.find(c => c.id === comicId);
        if (!comic) return;
        
        const existingIdx = _history.findIndex(h => h.id === comicId);
        const historyItem = {
            id: comicId,
            title: comic.title,
            image: comic.image,
            lastChapterRead: chapterTitle,
            lastRead: new Date().toISOString(),
            progress: Math.random(),
            totalChapters: comic.chapters.length
        };

        if (existingIdx >= 0) {
            _history[existingIdx] = historyItem;
        } else {
            _history.push(historyItem);
        }
    },

    removeFromHistory: async (id) => {
        await delay(300);
        _history = _history.filter(h => h.id !== id);
        return { success: true };
    },

    // 4. Library Actions
    getLibrary: async ({ searchQuery, filters } = {}) => {
        await delay(400);
        
        let result = _comics.filter(c => _library.has(c.id));

        if (searchQuery) {
            const lowerQ = searchQuery.toLowerCase();
            result = result.filter(c => c.title.toLowerCase().includes(lowerQ));
        }

        if (filters) {
             if (filters.status && filters.status !== 'All') {
                 result = result.filter(c => c.status === filters.status);
             }
        }

        return { success: true, data: result };
    },

    addToLibrary: async (id) => {
        await delay(200);
        _library.add(id);
        return { success: true };
    },

    removeFromLibrary: async (id) => {
        await delay(200);
        _library.delete(id);
        return { success: true };
    },

    getNovelChapter: async (comicId, chapterId) => {
        await delay(500);
        const novel = _comics.find(c => c.id === comicId);
        return novel?.chapters.find(ch => ch.id === chapterId.toString());
    },

    // 5. Favorites Actions
    getFavorites: async () => {
        await delay(400);
        const result = _comics.filter(c => _favorites.has(c.id));
        return { success: true, data: result };
    },

    addToFavorites: async (id) => {
        await delay(200);
        _favorites.add(id);
        return { success: true };
    },

    getUserRatings: async () => {
        await delay(250);
        return { success: true, data: _userRatings };
    },

    rateComic: async (comicId, rating) => {
        await delay(300);
        _userRatings[comicId] = rating;

        const comic = _comics.find(c => c.id === comicId);
        if (comic) {
            const currentTotalRating = comic.rating * comic.views;
            const newTotalRating = currentTotalRating + rating;
            const newViewCount = comic.views + 1;
            comic.rating = Math.round((newTotalRating / newViewCount) * 10) / 10;
            comic.views = newViewCount;
        }

        return { success: true };
    },

    removeFromFavorites: async (id) => {
        await delay(200);
        _favorites.delete(id);
        return { success: true };
    },

    isFavorite: (id) => {
        return _favorites.has(id);
    },

    // 6. Reader/Detail Data
    getChapterPages: async (comicId, chapterId) => {
        await delay(600);
        const pageCount = 8; // Use a fixed page count for predictability
        
        // **THE FIX: Use a deterministic URL structure**
        // This ensures the URL for a given page is always the same.
        return Array.from({ length: pageCount }, (_, i) => ({
            id: `pg_${i}`,
            uri: `https://picsum.photos/seed/${comicId}-${chapterId}-${i}/800/1200`
        }));
    },

    getComics: async (options = {}) => {
        await delay(500);
        let result = [..._comics];
        if (options.searchQuery) {
            const lowerQ = options.searchQuery.toLowerCase();
            result = result.filter(c => c.title.toLowerCase().includes(lowerQ));
        }
        return result;
    },

    // 7. Mock Home Screen Widgets
    getDailyGoals: async () => {
        await delay(400);
        return {
            success: true,
            data: [
                { id: 'g1', title: 'Read 3 Chapters', progress: 1, total: 3, icon: 'book' },
                { id: 'g2', title: 'Earn 100 XP', progress: 40, total: 100, icon: 'flash' },
            ]
        };
    },

    getUpcomingEvents: async () => {
        await delay(400);
        return {
            success: true,
            data: [
                { 
                    id: 'e1', 
                    title: 'Double XP Weekend', 
                    date: 'Starts in 2h', 
                    image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800',
                    description: 'Get double XP for every chapter you read this weekend!'
                }
            ]
        };
    }
};