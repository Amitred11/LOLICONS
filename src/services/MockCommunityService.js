// @api/MockCommunityService.js

import { Colors } from '@config/Colors'; // Assuming you have access to Colors here, or hardcode them

const GUILDS_DATA = [
  // --- EXISTING ---
  { 
    id: 'artist', 
    name: 'Canvas Realm', 
    type: 'owned', // ADMIN
    icon: 'color-palette', 
    members: '12.5k', 
    desc: 'The home for digital painters, UI designers, and traditional artists.',
    cover: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=80',
    accent: '#EC4899'
  },
  { 
    id: 'dev', 
    name: 'Syntax City', 
    type: 'private', // PRIVATE
    icon: 'code-slash', 
    members: '45.2k', 
    desc: 'Compiling the future. A hub for frontend, backend, and full-stack wizards.',
    cover: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80',
    accent: '#6366F1'
  },
  { 
    id: 'gamer', 
    name: 'Respawn Point', 
    type: 'public', // PUBLIC
    icon: 'game-controller', 
    members: '89.1k', 
    desc: 'LFG? Highlights? Esports? Discuss everything gaming here.',
    cover: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80',
    accent: '#10B981'
  },
  
  // --- NEW DATA ---
  { 
    id: 'writers', 
    name: 'Ink & Quill', 
    type: 'public', 
    icon: 'book', 
    members: '8.4k', 
    desc: 'A quiet place for novelists, poets, and screenwriters to share drafts.',
    cover: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&q=80',
    accent: '#F59E0B'
  },
  { 
    id: 'music', 
    name: 'Decibel Hall', 
    type: 'public', 
    icon: 'musical-notes', 
    members: '22k', 
    desc: 'Producers, vocalists, and instrumentalists collaborating on new sounds.',
    cover: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&q=80',
    accent: '#EF4444'
  },
  { 
    id: 'crypto', 
    name: 'Satoshi Block', 
    type: 'private', 
    icon: 'wallet', 
    members: '1.2k', 
    desc: 'Exclusive alpha group for trading strategies and blockchain dev.',
    cover: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=800&q=80',
    accent: '#FBBF24'
  },
  { 
    id: 'fitness', 
    name: 'Iron Temple', 
    type: 'public', 
    icon: 'barbell', 
    members: '35k', 
    desc: 'Motivation, workout plans, and nutrition advice for gains.',
    cover: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80',
    accent: '#3B82F6'
  },
  { 
    id: 'photo', 
    name: 'Shutter Island', 
    type: 'public', 
    icon: 'camera', 
    members: '19k', 
    desc: 'Share your best shots and learn post-processing techniques.',
    cover: 'https://images.unsplash.com/photo-1452587925703-749559920669?w=800&q=80',
    accent: '#8B5CF6'
  }
];

let MOCK_USER_MEMBERSHIPS = {
  'artist': 'owner',
  'gamer': 'member',
  'dev': 'pending',
};

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

let REPLIES_DATA = [
  { 
    id: 'r1', 
    postId: '1', 
    user: 'Sarah Jen', 
    avatar: 'https://ui-avatars.com/api/?name=Sarah+Jen', 
    content: 'This is exactly what I was thinking! Great point regarding the color theory.', 
    time: '2m ago' 
  },
  { 
    id: 'r2', 
    postId: '1', 
    user: 'Mike Ross', 
    avatar: 'https://ui-avatars.com/api/?name=Mike+Ross', 
    content: 'Can you elaborate on the second part? I feel like the shading is a bit off.', 
    time: '10m ago' 
  },
  {
    id: 'r3',
    postId: '2',
    user: 'DevOpsGuy',
    avatar: 'https://ui-avatars.com/api/?name=Dev+Ops',
    content: 'I am in! JS or TS?',
    time: '1h ago'
  }
];

const MARKET_ITEMS_DATA = [
  {
    id: 'm1',
    title: 'Gaming Laptop RTX 3060',
    price: 45000, // Numeric for filtering
    currency: '₱',
    displayPrice: '₱45,000',
    image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=800&q=80',
    category: 'Hardware',
    seller: 'KnightWalker',
    sellerId: 'u1', // Added ID for navigation
    sellerAvatar: 'https://ui-avatars.com/api/?name=KnightWalker&background=0D8ABC&color=fff',
    condition: 'Used',
    rating: 5.0,
    sales: 42,
    description: 'Slightly used gaming laptop. RFS: Upgrading to desktop. No scratches, comes with original box.',
  },
  {
    id: 'm2',
    title: 'React Native Mentorship',
    price: 1500,
    currency: '₱',
    displayPrice: '₱1,500 / hr',
    image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=800&q=80',
    category: 'Services',
    seller: 'DevGuru',
    sellerId: 'u2',
    sellerAvatar: 'https://ui-avatars.com/api/?name=DevGuru&background=random',
    condition: 'N/A',
    rating: 4.8,
    sales: 150,
    description: '1 hour expert code review and mentorship for React Native or Node.js projects.',
  },
  {
    id: 'm3',
    title: 'Abstract Art Asset Pack',
    price: 250,
    currency: '₱',
    displayPrice: '₱250',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    category: 'Digital',
    seller: 'ArtsyFartsy',
    sellerId: 'u3',
    sellerAvatar: 'https://ui-avatars.com/api/?name=Artsy&background=random',
    condition: 'New',
    rating: 4.5,
    sales: 12,
    description: 'A collection of 50 high-res abstract backgrounds for your next project.',
  },
  {
    id: 'm4',
    title: 'Mechanical Keyboard (Custom)',
    price: 8500,
    currency: '₱',
    displayPrice: '₱8,500',
    image: 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=800&q=80',
    category: 'Hardware',
    seller: 'ClickClack',
    sellerId: 'u4',
    sellerAvatar: 'https://ui-avatars.com/api/?name=Click+Clack&background=random',
    condition: 'Mint',
    rating: 5.0,
    sales: 5,
    description: 'Lubed switches, GMK keycaps. Sounds thocky.',
  }
];

export const CommunityAPI = {
  getGuilds: async () => {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...GUILDS_DATA]), 400); // Faster
    });
  },
  searchGuilds: async (query) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (!query || query.trim() === '') {
          resolve([...GUILDS_DATA]);
          return;
        }

        const lowerQ = query.toLowerCase();
        const results = GUILDS_DATA.filter(guild => 
          guild.name.toLowerCase().includes(lowerQ) || 
          guild.desc.toLowerCase().includes(lowerQ)
        );
        
        resolve(results);
      }, 400); // Simulated network delay
    });
  },

  getGuildById: async (guildId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const guild = GUILDS_DATA.find(g => g.id === guildId);
        if (guild) {
          // Attach the dynamic membership status for the current user
          const status = MOCK_USER_MEMBERSHIPS[guildId] || 'guest';
          resolve({ ...guild, membershipStatus: status });
        } else {
          resolve(null);
        }
      }, 300);
    });
  },

  // NEW: Request to join a Private/Admin guild
  requestJoinGuild: async (guildId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        MOCK_USER_MEMBERSHIPS[guildId] = 'pending';
        resolve('pending');
      }, 500);
    });
  },

  // NEW: Join a Public guild immediately
  joinPublicGuild: async (guildId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        MOCK_USER_MEMBERSHIPS[guildId] = 'member';
        resolve('member');
      }, 500);
    });
  },


  getPosts: async (guildId = null) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (guildId) {
          const filtered = POSTS_DATA.filter(p => p.guildId === guildId);
          resolve(filtered);
        } else {
          resolve([...POSTS_DATA]);
        }
      }, 500);
    });
  },

  createPost: async (postData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newPost = {
          ...postData,
          id: Date.now().toString(),
          likes: 0,
          liked: false,
        };
        POSTS_DATA.unshift(newPost);
        resolve(newPost);
      }, 400);
    });
  },

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
      }, 200); // Very fast for UI responsiveness
    });
  },

  getMarketItems: async () => {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...MARKET_ITEMS_DATA]), 600);
    });
  },

  /**
   * Enhanced Search Function
   * @param {string} query - Text search
   * @param {string} category - Category filter
   * @param {object} filters - { minPrice, maxPrice, condition }
   */
  searchMarket: async (query, category, filters = {}) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        let results = [...MARKET_ITEMS_DATA];

        // 1. Category Filter
        if (category && category !== 'All') {
          results = results.filter(item => item.category === category);
        }

        // 2. Text Query
        if (query) {
          const lowerQ = query.toLowerCase();
          results = results.filter(item => 
            item.title.toLowerCase().includes(lowerQ) || 
            item.seller.toLowerCase().includes(lowerQ) ||
            item.description.toLowerCase().includes(lowerQ)
          );
        }

        // 3. Price Filter (Real logic)
        if (filters.minPrice) {
          results = results.filter(item => item.price >= parseFloat(filters.minPrice));
        }
        if (filters.maxPrice) {
          results = results.filter(item => item.price <= parseFloat(filters.maxPrice));
        }

        // 4. Condition Filter
        if (filters.condition && filters.condition !== 'Any') {
          results = results.filter(item => item.condition === filters.condition);
        }

        resolve(results);
      }, 400);
    });
  },

  getReplies: async (postId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const filtered = REPLIES_DATA.filter(r => r.postId === postId);
        // Sort by newest first (optional, or by time string if parsed)
        resolve(filtered);
      }, 400);
    });
  },

  addReply: async (replyData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newReply = {
          ...replyData,
          id: Date.now().toString(), // Simple ID generation
        };
        // Add to beginning of array
        REPLIES_DATA.unshift(newReply);
        resolve(newReply);
      }, 400);
    });
  },
  
  getRealmSecurityLevel: (guild) => {
    if (!guild) return {};
    
    // Status Logic for UI Labels
    const status = guild.membershipStatus || 'guest';

    switch (guild.type) {
      case 'private':
        return { 
          type: 'PRIVATE', 
          label: 'Request Only', 
          status: status,
          icon: 'lock-closed', 
          color: Colors.danger || '#EF4444' 
        };
      case 'owned':
        return { 
          type: 'OWNED', 
          label: 'Admin Realm', 
          status: status,
          icon: 'shield-checkmark', 
          color: '#FBBF24' 
        };
      default: // public
        return { 
          type: 'PUBLIC', 
          label: 'Public Realm', 
          status: status,
          icon: 'globe', 
          color: Colors.secondary || '#10B981' 
        };
    }
  }
};