// @api/MockCommunityService.js

// --- Raw Data ---

const GUILDS_DATA = [
  { 
    id: 'artist', 
    name: 'Canvas Realm', 
    icon: 'color-palette', 
    members: '12.5k', 
    desc: 'The home for digital painters, UI designers, and traditional artists.',
    cover: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=80',
    accent: '#EC4899' // Pink
  },
  { 
    id: 'dev', 
    name: 'Syntax City', 
    icon: 'code-slash', 
    members: '45.2k', 
    desc: 'Compiling the future. A hub for frontend, backend, and full-stack wizards.',
    cover: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80',
    accent: '#6366F1' // Indigo
  },
  { 
    id: 'gamer', 
    name: 'Respawn Point', 
    icon: 'game-controller', 
    members: '89.1k', 
    desc: 'LFG? Highlights? Esports? Discuss everything gaming here.',
    cover: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80',
    accent: '#10B981' // Emerald
  },
];

// Mutable posts array to simulate adding new posts during the session
let POSTS_DATA = [
  { 
    id: '1', 
    user: 'PixelMaster', 
    avatar: 'https://ui-avatars.com/api/?name=Pixel+Master&background=random', 
    content: 'Just finished this new comic cover! Thoughts?', 
    likes: 120, 
    time: '2h ago',
    liked: false,
    guildId: 'artist' 
  },
  { 
    id: '2', 
    user: 'CodeNinja', 
    avatar: 'https://ui-avatars.com/api/?name=Code+Ninja&background=random', 
    content: 'Anyone want to team up for the upcoming hackathon? I need a designer.', 
    likes: 45, 
    time: '5h ago',
    liked: true,
    guildId: 'dev' 
  },
  {
    id: '3',
    user: 'FragKing',
    avatar: 'https://ui-avatars.com/api/?name=Frag+King&background=random',
    content: 'The new patch nerfed my main character. Unbelievable.',
    likes: 89,
    time: '1d ago',
    liked: false,
    guildId: 'gamer'
  }
];

const MARKET_ITEMS_DATA = [
  {
    id: 'm1',
    title: 'Legendary Sword',
    price: '1,500 Gold',
    image: 'https://images.unsplash.com/photo-1589252084795-356c8db2778e?auto=format&fit=crop&w=800&q=80',
    category: 'Hardware',
    seller: 'KnightWalker',
    sellerAvatar: 'https://ui-avatars.com/api/?name=KnightWalker&background=0D8ABC&color=fff',
    condition: 'Mint',
    rating: 5.0,
    sales: 42,
    description: 'A handcrafted replica sword. Perfect for cosplay or display. Forged from high-quality steel.',
  },
  {
    id: 'm2',
    title: 'Code Review Session',
    price: '300 Credits',
    image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=800&q=80',
    category: 'Services',
    seller: 'DevGuru',
    sellerAvatar: 'https://ui-avatars.com/api/?name=DevGuru&background=random',
    condition: 'N/A',
    rating: 4.8,
    sales: 150,
    description: '1 hour expert code review for React Native or Node.js projects.',
  },
  {
    id: 'm3',
    title: 'Digital Art Pack',
    price: '50 Gems',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    category: 'Digital',
    seller: 'ArtsyFartsy',
    sellerAvatar: 'https://ui-avatars.com/api/?name=Artsy&background=random',
    condition: 'New',
    rating: 4.5,
    sales: 12,
    description: 'A collection of 50 high-res abstract backgrounds for your next project.',
  }
];

// --- Service Definition ---

export const CommunityAPI = {
  
  // --- GUILDS ---

  /**
   * Fetches the list of active communities/guilds.
   */
  getGuilds: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...GUILDS_DATA]);
      }, 800);
    });
  },

  /**
   * Fetches a specific guild by ID.
   */
  getGuildById: async (guildId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const guild = GUILDS_DATA.find(g => g.id === guildId);
        resolve(guild || null);
      }, 500);
    });
  },

  // --- POSTS ---

  /**
   * Fetches posts. Can optionally filter by guildId.
   */
  getPosts: async (guildId = null) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (guildId) {
          const filtered = POSTS_DATA.filter(p => p.guildId === guildId);
          resolve(filtered);
        } else {
          resolve([...POSTS_DATA]);
        }
      }, 1000);
    });
  },

  /**
   * Simulates creating a new post.
   */
  createPost: async (postData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newPost = {
          ...postData,
          id: Date.now().toString(), // Generate simplified ID
          likes: 0,
          liked: false,
        };
        // Prepend to local mock array
        POSTS_DATA.unshift(newPost);
        resolve(newPost);
      }, 600);
    });
  },

  /**
   * Toggles the like status of a post.
   */
  toggleLikePost: async (postId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = POSTS_DATA.findIndex(p => p.id === postId);
        if (index !== -1) {
          const post = POSTS_DATA[index];
          post.liked = !post.liked;
          post.likes = post.liked ? post.likes + 1 : post.likes - 1;
          resolve({ success: true, liked: post.liked, newCount: post.likes });
        } else {
          resolve({ success: false });
        }
      }, 300);
    });
  },

  // --- MARKETPLACE ---

  /**
   * Fetches items listed in the marketplace.
   */
  getMarketItems: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...MARKET_ITEMS_DATA]);
      }, 1200); // Slightly longer delay for "heavier" data
    });
  },

  /**
   * Simulates searching/filtering marketplace items.
   */
  searchMarket: async (query, category) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        let results = [...MARKET_ITEMS_DATA];

        if (category && category !== 'All') {
          results = results.filter(item => item.category === category);
        }

        if (query) {
          const lowerQ = query.toLowerCase();
          results = results.filter(item => 
            item.title.toLowerCase().includes(lowerQ) || 
            item.seller.toLowerCase().includes(lowerQ)
          );
        }

        resolve(results);
      }, 600);
    });
  }
};