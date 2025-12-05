// api/MockComicService.js

// --- 1. DATA DEFINITIONS ---

// Helper to generate dates relative to today
const getDateString = (daysAgo) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString();
};

const comicsData = [
  { 
    id: '1', 
    title: 'Cybernetic Dawn', 
    author: 'J.K. Artwright',
    status: 'Ongoing',
    type: 'Manhwa',
    genres: ['Sci-Fi', 'Action', 'Cyberpunk'],
    synopsis: 'In a neon-drenched future, a rogue android discovers a secret that could shatter the fragile peace between humans and machines. Hunted by corporations, she must fight to expose the truth.',
    // Using remote placeholder images to ensure the code runs without local assets. 
    // You can swap these back to require('../assets/comic-1.jpg') if you have the files.
    image: { uri: 'https://images.unsplash.com/photo-1535905557558-afc4877a26fc?w=800&q=80' },
    localSource: { uri: 'https://images.unsplash.com/photo-1535905557558-afc4877a26fc?w=800&q=80' },
    isPopular: true,
    chapters: [
      { id: '9', title: 'Chapter 9', releaseDate: getDateString(2) },
      { id: '8', title: 'Chapter 8', releaseDate: getDateString(5) },
      { id: '7', title: 'Chapter 7', releaseDate: getDateString(9) },
      { id: '6', title: 'Chapter 6', releaseDate: getDateString(15) },
      { id: '5', title: 'Chapter 5', releaseDate: getDateString(21) },
      { id: '4', title: 'Chapter 4', releaseDate: getDateString(30) },
      { id: '3', title: 'Chapter 3', releaseDate: getDateString(45) },
      { id: '2', title: 'Chapter 2', releaseDate: getDateString(60) },
      { id: '1', title: 'Chapter 1', releaseDate: getDateString(90) },
    ]
  },
  { 
    id: '2', 
    title: 'The Quantum Mage', 
    author: 'Elara Vance',
    status: 'Completed',
    type: 'Manga',
    genres: ['Fantasy', 'Magic', 'Adventure'],
    synopsis: 'A young mage with the ability to bend reality itself is thrust into a war between ancient magical houses. His power could be the key to victory, or the catalyst for total annihilation.',
    image: { uri: 'https://images.unsplash.com/photo-1614726365206-897379203a5e?w=800&q=80' },
    localSource: { uri: 'https://images.unsplash.com/photo-1614726365206-897379203a5e?w=800&q=80' },
    chapters: [ {id: '1', title: 'Chapter 1', releaseDate: getDateString(100)}, {id: '2', title: 'Chapter 2', releaseDate: getDateString(90)} ],
    isPopular: true,
  },
  { 
    id: '3', 
    title: 'Galactic Ghosts', 
    author: 'Axel Corrigan', 
    status: 'Ongoing',
    type: 'Comic',
    genres: ['Sci-Fi', 'Horror', 'Space Opera'],
    synopsis: 'A crew of smugglers on the galaxy\'s edge takes on a job that\'s too good to be true, finding themselves haunted by a mysterious ghost ship.', 
    image: { uri: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800&q=80' }, 
    localSource: { uri: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800&q=80' },
    chapters: [{id: '1', title: 'Chapter 1', releaseDate: getDateString(5)}],
    isPopular: true,
  },
  {
    id: '4',
    title: 'Chronos Heist',
    author: 'Lena Petrova',
    status: 'Completed',
    type: 'Manga',
    genres: ['Sci-Fi', 'Thriller'],
    synopsis: 'A team of thieves uses experimental time-travel technology to pull off the ultimate score, but fracturing the timeline has unforeseen and deadly consequences.',
    image: { uri: 'https://images.unsplash.com/photo-1519074069444-1ba4fff66d16?w=800&q=80' },
    localSource: { uri: 'https://images.unsplash.com/photo-1519074069444-1ba4fff66d16?w=800&q=80' },
    chapters: [{id: '1', title: 'Chapter 1', releaseDate: getDateString(300)}],
    isPopular: false,
  }
];

const historyData = [
  {
    id: '1',
    title: 'Cybernetic Dawn',
    image: { uri: 'https://images.unsplash.com/photo-1535905557558-afc4877a26fc?w=800&q=80' },
    lastChapterRead: 'Chapter 9',
    lastRead: new Date(new Date().setDate(new Date().getDate() - 0)), // Today
    progress: 0.75,
  },
  {
    id: '4',
    title: 'Chronos Heist',
    image: { uri: 'https://images.unsplash.com/photo-1519074069444-1ba4fff66d16?w=800&q=80' },
    lastChapterRead: 'Chapter 1',
    lastRead: new Date(new Date().setDate(new Date().getDate() - 1)), // Yesterday
    progress: 0.2,
  },
].sort((a, b) => b.lastRead - a.lastRead);

// Map of comic IDs to an array of their page images (simulated).
const comicPagesData = {
  '1': [ 
    { uri: 'https://images.unsplash.com/photo-1535905557558-afc4877a26fc?w=800&q=80' }, 
    { uri: 'https://images.unsplash.com/photo-1614726365206-897379203a5e?w=800&q=80' }, 
    { uri: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800&q=80' } 
  ],
  '2': [ 
    { uri: 'https://images.unsplash.com/photo-1519074069444-1ba4fff66d16?w=800&q=80' }, 
    { uri: 'https://images.unsplash.com/photo-1535905557558-afc4877a26fc?w=800&q=80' }, 
    { uri: 'https://images.unsplash.com/photo-1614726365206-897379203a5e?w=800&q=80' } 
  ],
  '3': [ 
    { uri: 'https://images.unsplash.com/photo-1535905557558-afc4877a26fc?w=800&q=80' }, 
    { uri: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800&q=80' }, 
    { uri: 'https://images.unsplash.com/photo-1519074069444-1ba4fff66d16?w=800&q=80' } 
  ],
  '4': [ 
    { uri: 'https://images.unsplash.com/photo-1614726365206-897379203a5e?w=800&q=80' }, 
    { uri: 'https://images.unsplash.com/photo-1519074069444-1ba4fff66d16?w=800&q=80' }, 
    { uri: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800&q=80' } 
  ],
};


// --- 2. IN-MEMORY STATE & SERVICE LOGIC ---

let _comics = [...comicsData];
let _history = [...historyData];
let _library = new Set(['1', '3']); // Simulating some initial items in the library
const SIMULATED_DELAY = 600; // Time in ms to simulate network latency

// --- Helpers ---

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const filterComics = (data, query, filters) => {
    let result = [...data];

    // 1. Text Search
    if (query) {
        const lowerQuery = query.toLowerCase();
        result = result.filter(item => 
            item.title.toLowerCase().includes(lowerQuery) ||
            item.author.toLowerCase().includes(lowerQuery)
        );
    }

    // 2. Status Filter
    if (filters?.status && filters.status !== 'All') {
        result = result.filter(item => item.status === filters.status);
    }

    // 3. Type Filter
    if (filters?.type && filters.type !== 'All') {
        result = result.filter(item => item.type === filters.type);
    }

    // 4. Genre Filter
    if (filters?.genres && filters.genres.length > 0) {
        result = result.filter(item => 
            filters.genres.every(genre => item.genres.includes(genre))
        );
    }

    // 5. Sorting
    if (filters?.sort) {
        switch (filters.sort) {
            case 'az':
                result.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 'za':
                result.sort((a, b) => b.title.localeCompare(a.title));
                break;
            case 'newest':
                 // Assuming IDs roughly correlate to newness for mock data
                result.sort((a, b) => parseInt(b.id) - parseInt(a.id));
                break;
            default:
                break;
        }
    }

    return result;
};

// --- Service API ---

export const ComicService = {

    /**
     * Fetch all comics with optional filtering options.
     */
    getComics: async (options = {}) => {
        await delay(SIMULATED_DELAY);
        const { searchQuery, filters } = options;
        return filterComics(_comics, searchQuery, filters);
    },

    /**
     * Fetch the list of "Popular" or "Featured" comics.
     */
    getFeaturedComics: async () => {
        await delay(SIMULATED_DELAY);
        return _comics.filter(c => c.isPopular);
    },

    /**
     * Fetch details for a specific comic by ID.
     */
    getComicDetails: async (comicId) => {
        await delay(SIMULATED_DELAY);
        const comic = _comics.find(c => c.id === comicId);
        if (!comic) throw new Error('Comic not found');
        
        return {
            ...comic,
            inLibrary: _library.has(comicId)
        };
    },

    /**
     * Fetch pages for a specific chapter.
     */
    getChapterPages: async (comicId, chapterId) => {
        await delay(SIMULATED_DELAY);
        // In the mock data, `comicPagesData` is keyed by comicId for simplicity
        const pages = comicPagesData[comicId];
        
        if (!pages) throw new Error('Pages not found for this comic');
        return pages;
    },

    // --- Library Management ---

    getLibrary: async (options = {}) => {
        await delay(SIMULATED_DELAY);
        // Filter the master list to only include IDs in the library Set
        const libraryItems = _comics.filter(c => _library.has(c.id));
        
        // Apply search/filter logic to the library subset
        const { searchQuery, filters } = options;
        return filterComics(libraryItems, searchQuery, filters);
    },

    addToLibrary: async (comicId) => {
        await delay(300); // Shorter delay for interactions
        _library.add(comicId);
        return true;
    },

    removeFromLibrary: async (comicId) => {
        await delay(300);
        _library.delete(comicId);
        return true;
    },

    checkLibraryStatus: (comicId) => {
        return _library.has(comicId);
    },

    // --- History Management ---

    getHistory: async (query = '') => {
        await delay(SIMULATED_DELAY);
        let result = [..._history];

        if (query) {
            result = result.filter(item => 
                item.title.toLowerCase().includes(query.toLowerCase())
            );
        }

        // Sort by lastRead (descending)
        return result.sort((a, b) => b.lastRead - a.lastRead);
    },

    /**
     * Updates reading history. If the comic exists, moves it to top.
     * If new, adds it.
     */
    updateHistory: async (comicId, chapterTitle) => {
        await delay(300);
        const now = new Date();
        const existingIndex = _history.findIndex(h => h.id === comicId);
        
        const comicInfo = _comics.find(c => c.id === comicId);
        if (!comicInfo) return; 

        if (existingIndex >= 0) {
            // Update existing
            _history[existingIndex] = {
                ..._history[existingIndex],
                lastChapterRead: chapterTitle,
                lastRead: now,
                progress: Math.min(1, (_history[existingIndex].progress || 0) + 0.05) 
            };
        } else {
            // Create new entry
            const newEntry = {
                id: comicInfo.id,
                title: comicInfo.title,
                image: comicInfo.image, // Use the image object from comic info
                lastChapterRead: chapterTitle,
                lastRead: now,
                progress: 0.05,
            };
            _history.push(newEntry);
        }

        // Re-sort mock history
        _history.sort((a, b) => b.lastRead - a.lastRead);
        return _history;
    },

    removeFromHistory: async (comicId) => {
        await delay(300);
        _history = _history.filter(item => item.id !== comicId);
        return true;
    }
};