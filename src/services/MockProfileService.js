// api/MockProfileService.js

/**
 * MOCK PROFILE BACKEND SERVICE
 * ----------------------------
 * Backend Dev: Replace the contents of these functions with real API calls/endpoints.
 */

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// --- 1. MOCK DATA DEFINITIONS ---

// Helper data for favorites/history since 'comicsData' was external
const MOCK_COMICS = [
    { id: 'c1', title: 'Solo Leveling', image: { uri: 'https://m.media-amazon.com/images/M/MV5BMzMwYzQ2NzctOTJlNS00NTc3LTliNjAtMjI2ZGI5YTA3ZTM1XkEyXkFqcGdeQXVyMTI2NTM5ODE5._V1_.jpg' }, lastChapterRead: 'Ch. 179' },
    { id: 'c2', title: 'Omniscient Reader', image: { uri: 'https://upload.wikimedia.org/wikipedia/en/thumb/3/3b/Omniscient_Reader%27s_Viewpoint_cover.jpg/220px-Omniscient_Reader%27s_Viewpoint_cover.jpg' }, lastChapterRead: 'Ch. 200' },
    { id: 'c3', title: 'The Beginning After The End', image: { uri: 'https://m.media-amazon.com/images/M/MV5BMjA1YjYxYTUtMWM4Yy00MGU5LTk0Y2QtOGU5NTFmZjU4Zjg3XkEyXkFqcGdeQXVyMTEzMTI1Mjk3._V1_.jpg' }, lastChapterRead: 'Ch. 175' },
    { id: 'c4', title: 'Tower of God', image: { uri: 'https://m.media-amazon.com/images/M/MV5BN2RjMzY2NDktMzAyMy00NzQyLThkYzEtODQzMDVlZTE1Y2I4XkEyXkFqcGdeQXVyMTEzMTI1Mjk3._V1_FMjpg_UX1000_.jpg' }, lastChapterRead: 'Ch. 500' },
];

export const MOCK_RANKS = [
  // --- Special / Anomaly Rank ---
  { 
    name: '¿¿', 
    minXp: -10, 
    color: '#FF3D00',
    title: 'Th∑_An0m@ly',
    description: 'ex!st@1.1294:::ERR << sy$tem_ƒragm€nt >> anom@ly // br°ken pr0gr€ssion && nat.law || [ERR-C0DE:INFINITE] :: unattain//n0rm@l_m€ans'
  },

  // --- Mortal to Divine Progression ---
  { 
    name: '凡', 
    minXp: 0, 
    color: '#A0A0A0',
    title: 'The Mortal Realm',
    description: 'The beginning of all journeys. A mortal soul, unaware of the vast powers that permeate the universe, holds a seed of limitless potential.' 
  },
  { 
    name: '气', 
    minXp: 250, 
    color: '#8B4513',
    title: 'Spirit Apprentice',
    description: 'The first awakening. The ability to sense the flow of Qi has been unlocked, laying the foundation for all future cultivation.' 
  },
  { 
    name: '灵', 
    minXp: 500, 
    color: '#CD7F32',
    title: 'Soul Forger',
    description: 'Moving beyond mere sense, one begins to actively cultivate and strengthen the soul, forging a stable core of spiritual power.' 
  },
  { 
    name: '玄', 
    minXp: 1000, 
    color: '#C0C0C0',
    title: 'Profound Master',
    description: 'A grasp of the profound mysteries is achieved. Power is now guided by a deeper understanding of the world\'s hidden laws.' 
  },
  { 
    name: '尊', 
    minXp: 2000, 
    color: '#FFD700',
    title: 'Venerable Lord',
    description: 'A name and power that commands respect across the lands. A truly formidable existence, capable of founding their own dynasty or sect.' 
  },
  { 
    name: '仙', 
    minXp: 5000, 
    color: '#E53935',
    title: 'Celestial Immortal',
    description: 'Having shed all mortal shackles, this being has transcended the limits of life and death to roam the heavens as a true immortal of legend.' 
  },
  { 
    name: '圣', 
    minXp: 10000, 
    color: '#8E24AA',
    title: 'Myriad Saint',
    description: 'Achieving a state of enlightenment close to perfection. The will of a Saint can subtly influence the fabric of reality itself.' 
  },
  { 
    name: '神', 
    minXp: 20000, 
    color: '#00f3fcff',
    title: 'Divine Monarch',
    description: 'True ascension to godhood. A divine being who can establish their own domain and create laws, wielding power that defies mortal comprehension.' 
  },
  
  // --- Divine to Creator Progression ---
  { 
    name: '主', 
    minXp: 50000, 
    color: '#4FC3F7',
    title: 'Sovereign of the Gods',
    description: 'A ruler among deities, a monarch whose authority is absolute in the divine realm. The pinnacle of godly power.' 
  },
  { 
    name: '帝', 
    minXp: 100000, 
    color: '#EC407A',
    title: 'Divine Emperor',
    description: 'The ultimate ruler of the heavens, whose dominion extends beyond a single realm. Their gaze can cross worlds.'
  },
  { 
    name: '道', 
    minXp: 250000, 
    color: '#F5F5F5',
    title: 'Embodiment of the Dao',
    description: 'No longer just a being, but an embodiment of a fundamental principle of the universe. They are the law, not merely a follower of it.' 
  },
  { 
    name: '源', 
    minXp: 500000, 
    color: '#FFF8E1',
    title: 'The Primeval Source',
    description: 'Becoming the origin point from which concepts and realities spring forth. The alpha from which all things begin.'
  },
  { 
    name: '创', 
    minXp: 1000000, 
    color: '#9CCC65',
    title: 'World Creator',
    description: 'The final apotheosis. The power to wield the origin and shape the void into new realities. A true creator of worlds.' 
  },
];

const MOCK_FAQ = [
    { q: "How do I reset my password?", a: "Go to Account > Login Credentials > Password to initiate a reset link sent to your email." },
    { q: "Can I download comics offline?", a: "Yes! Premium members can download unlimited chapters. Check Data & Storage settings to manage them." },
    { q: "How does the ranking system work?", a: "You earn XP by reading chapters and interacting with the community. Ranks unlock exclusive profile frames." },
    { q: "Why is my account restricted?", a: "This usually happens if community guidelines are violated. Contact support for an appeal." },
    { q: "How do I change my avatar?", a: "Go to Edit Profile and tap on your current avatar icon." },
];

const MOCK_CONTACT_TOPICS = [
    { label: 'Report a Bug', icon: 'bug-outline', action: { type: 'modal', modalName: 'reportBug' } },
    { label: 'Feature Request', icon: 'bulb-outline', action: { type: 'link', url: 'https://feedback.example.com' } },
    { label: 'Community', icon: 'people-outline', action: { type: 'link', url: 'https://discord.gg/example' } },
    { label: 'Terms & Privacy', icon: 'document-text-outline', action: { type: 'link', url: 'https://example.com/terms' } },
];

// --- 2. MAIN USER DATABASE ---

const MOCK_USER_DB = {
  id: 'usr_a1b2c3d4e5f6g7h8',
  email: 'loli.hunter@example.com',
  name: 'AMITRED11',
  handle: 'pogiako',
  avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
  xp: 12309,
  
  // Using placeholder for require('../assets/comic-2.jpg') for service compatibility
  favoriteComicBanner: { uri: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?q=80&w=1000&auto=format&fit=crop' },

  stats: [
    { label: 'Comics Read', value: '2K' },
    { label: 'Chapters', value: '1.2B' },
    { label: 'Rank', value: '#1' },
  ],
  
  // Status Object
  status: { type: 'online', text: 'Online' },

  // Bio
  bio: "Just a comic enthusiast exploring new worlds, one chapter at a time. Big fan of fantasy and sci-fi.",

  // Achievements / Badges
  badges: [
    { 
      id: 'Creators_ID124', 
      name: 'The Designer', 
      icon: 'pencil-outline', 
      description: 'Awarded to the creative mind behind the system’s design.', 
      unlockedDate: 'Jan 21, 2024',
      rarity: 'Primeval',
      category: 'Special',
      rewards: { xp: 50000, gems: 100 },
      unlocked: true
    },
    { 
      id: 'Creators_ID123', 
      name: 'The Celestials', 
      icon: 'infinite-outline', 
      description: 'This Badge is for the person who created the system. BOW DOWN YOU FOOLS!!!', 
      unlockedDate: 'Jan 21, 2024',
      rarity: 'Absolute',
      category: 'Special',
      rewards: { xp: 999999, gems: 1000 },
      unlocked: true
    },
    { 
      id: 'b0', 
      name: 'Supreme Racist', 
      icon: 'sad-outline', 
      description: 'Awarded for being the greatest Racist on the App. Keep up the good work!', 
      unlockedDate: 'Jan 21, 2024',
      rarity: 'Epic',
      category: 'Community',
      rewards: { xp: 69 },
      unlocked: true
    },
    { 
      id: 'b1', 
      name: 'First Read', 
      icon: 'book-outline', 
      description: 'Awarded for completing your very first chapter. Welcome to the journey!', 
      unlockedDate: 'Jan 21, 2024',
      rarity: 'Common',
      category: 'Reading',
      rewards: { xp: 50 },
      unlocked: true
    },
    { 
      id: 'b2', 
      name: 'Night Owl', 
      icon: 'moon-outline', 
      description: 'Awarded for reading a chapter between midnight and 4 AM. The story never sleeps!', 
      unlockedDate: 'Jan 25, 2024',
      rarity: 'Uncommon',
      category: 'Reading',
      rewards: { xp: 150, gems: 5 },
      unlocked: true
    },
    { 
      id: 'b3', 
      name: 'Social Butterfly', 
      icon: 'people-outline', 
      description: 'Awarded for making your first comment in the community section.', 
      unlockedDate: 'Feb 02, 2024',
      rarity: 'Common',
      category: 'Community',
      rewards: { xp: 75 },
      unlocked: true
    },
    { 
      id: 'b4', 
      name: 'Collector', 
      icon: 'albums-outline', 
      description: 'Awarded for adding 10 or more comics to your personal library.', 
      unlockedDate: 'Feb 15, 2024',
      rarity: 'Rare',
      category: 'Collection',
      rewards: { xp: 250, gems: 10 },
      unlocked: true
    },
    { 
      id: 'b5', 
      name: 'Loyal Reader', 
      icon: 'heart-circle-outline', 
      description: 'Awarded for reading every day for a full week. That\'s dedication!', 
      unlockedDate: 'Feb 22, 2024',
      rarity: 'Epic',
      category: 'Reading',
      rewards: { xp: 1000, gems: 25 },
      unlocked: true
    },
  ],

  // Simulating slice(0, 4) and slice(1, 4).reverse() using mock data
  favorites: MOCK_COMICS.slice(0, 4),
  history: MOCK_COMICS.slice(1, 4).reverse(),
    
  // Settings configuration (Preserved for functionality)
  settings: {
      notifications: {
          global: true,
          preferences: {
              newChapters: true,
              recommendations: true,
              newFollowers: true,
              comments: true,
              dms: false,
              promotions: false
          },
          quietHours: {
              enabled: false,
              start: '10:00 PM',
              end: '8:00 AM',
          }
      },
      privacy: {
          twoFactor: false,
          activeSessions: 1,
          blockedUsers: []
      },
      storage: {
          downloads: 450000000, // bytes
          appData: 120000000,
          cache: 56000000
      },
      connectedAccounts: {
          google: true,
          github: true,
          facebook: false
      }
  }
};

// Generic Friend/Other User (Placeholder)
const MOCK_FRIEND = {
    id: 'UID-999-FRIEND',
    name: 'Jessica Parker',
    handle: 'jp_comics',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
    banner: 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=800',
    bio: 'Comic enthusiast | Artist | Dreamer ✨',
    status: 'Online',
    stats: [
        { label: 'Reads', value: '890' },
        { label: 'Likes', value: '1.2k' },
        { label: 'Rank', value: 'Master' }
    ],
    badges: [
        { id: '1', name: 'First Read', icon: 'book-outline', description: 'Read your first comic chapter.', rarity: 'Common' },
        { id: '3', name: 'Collector', icon: 'library-outline', description: 'Save 50 comics to library.', rarity: 'Rare' },
        { id: '5', name: 'Speedster', icon: 'flash-outline', description: 'Finish a chapter in under 1 min.', rarity: 'Epic' },
    ]
};


// --- 3. API SERVICE EXPORTS ---

export const ProfileAPI = {

    // --- MAIN PROFILE & EDIT ---
    
    getProfile: async () => {
        await delay(1000);
        // Calculate Rank based on XP
        const currentRank = MOCK_RANKS.slice().reverse().find(r => MOCK_USER_DB.xp >= r.minXp) || MOCK_RANKS[0];
        const nextRankIndex = MOCK_RANKS.findIndex(r => r.name === currentRank.name) + 1;
        const nextRank = MOCK_RANKS[nextRankIndex] || null;

        return {
            success: true,
            data: {
                ...MOCK_USER_DB,
                currentRank,
                nextRank,
                // The badges are already in MOCK_USER_DB
                badges: MOCK_USER_DB.badges
            }
        };
    },

    updateProfile: async (updateData) => {
        await delay(1500);
        Object.assign(MOCK_USER_DB, updateData);
        return { success: true, message: "Profile updated successfully" };
    },

    // --- FRIEND PROFILE ---
    
    getFriendProfile: async (userId) => {
        await delay(800);
        return { success: true, data: MOCK_FRIEND };
    },

    // --- TROPHY CASE ---

    getTrophies: async () => {
        await delay(800);
        // Returns the badges in the user's list
        return { success: true, data: MOCK_USER_DB.badges };
    },

    // --- ACCOUNT SCREEN ---

    getAccountSettings: async () => {
        await delay(800);
        return {
            success: true,
            data: {
                id: MOCK_USER_DB.id,
                name: MOCK_USER_DB.name,
                handle: MOCK_USER_DB.handle,
                email: MOCK_USER_DB.email,
                joinDate: MOCK_USER_DB.joinDate, // Note: Provided userData didn't have joinDate, defaulting to hardcoded
                connected: MOCK_USER_DB.settings.connectedAccounts
            }
        };
    },

    updateEmail: async (email) => {
        await delay(1000);
        MOCK_USER_DB.email = email;
        return { success: true };
    },

    connectSocial: async (provider) => {
        await delay(1500);
        MOCK_USER_DB.settings.connectedAccounts[provider] = true;
        return { success: true };
    },

    deleteAccount: async () => {
        await delay(2000);
        console.log("Account deleted on backend");
        return { success: true };
    },

    // --- CHANGE PASSWORD SCREEN ---

    changePassword: async (current, newPass) => {
        await delay(1500);
        if (current === '123456') { 
            return { success: true };
        } else {
            throw new Error("Current password is incorrect.");
        }
    },

    // --- PRIVACY SCREEN ---

    getPrivacySettings: async () => {
        await delay(600);
        return { 
            success: true, 
            data: {
                twoFactor: MOCK_USER_DB.settings.privacy.twoFactor,
                sessions: MOCK_USER_DB.settings.privacy.activeSessions,
                blocked: MOCK_USER_DB.settings.privacy.blockedUsers
            }
        };
    },

    toggle2FA: async (status) => {
        await delay(500);
        MOCK_USER_DB.settings.privacy.twoFactor = !status;
        return !status;
    },

    logoutAllSessions: async () => {
        await delay(800);
        MOCK_USER_DB.settings.privacy.activeSessions = 1;
        return { success: true };
    },

    blockUser: async (username) => {
        await delay(500);
        if (!username) throw new Error("Invalid username");
        const newBlock = { id: Math.random().toString(), name: username, date: new Date().toISOString().split('T')[0] };
        MOCK_USER_DB.settings.privacy.blockedUsers.push(newBlock);
        return newBlock;
    },

    unblockUser: async (id) => {
        await delay(500);
        MOCK_USER_DB.settings.privacy.blockedUsers = MOCK_USER_DB.settings.privacy.blockedUsers.filter(u => u.id !== id);
        return { success: true };
    },

    // --- NOTIFICATIONS SCREEN ---

    getNotificationSettings: async () => {
        await delay(600);
        return { 
            success: true, 
            data: {
                globalEnabled: MOCK_USER_DB.settings.notifications.global,
                preferences: MOCK_USER_DB.settings.notifications.preferences,
                quietHours: MOCK_USER_DB.settings.notifications.quietHours
            }
        };
    },

    updateNotificationSetting: async (key, value) => {
        await delay(300); 
        if (key === 'global') {
             MOCK_USER_DB.settings.notifications.global = value;
        } else {
             MOCK_USER_DB.settings.notifications.preferences[key] = value;
        }
        return { success: true };
    },

    updateQuietHours: async (newSettings) => {
        await delay(500);
        MOCK_USER_DB.settings.notifications.quietHours = newSettings;
        return { success: true };
    },

    // --- DATA & STORAGE SCREEN ---

    getStorageUsage: async () => {
        await delay(800);
        const { downloads, appData, cache } = MOCK_USER_DB.settings.storage;
        
        const format = (b) => {
            if(b === 0) return '0 B';
            const i = Math.floor(Math.log(b) / Math.log(1024));
            return (b / Math.pow(1024, i)).toFixed(1) + ' ' + ['B','KB','MB','GB'][i];
        };

        return {
            success: true,
            data: {
                downloads,
                appData,
                cache,
                downloadsLabel: format(downloads),
                appDataLabel: format(appData),
                cacheLabel: format(cache)
            }
        };
    },

    clearCache: async () => {
        await delay(1000);
        MOCK_USER_DB.settings.storage.cache = 0;
        return { success: true };
    },

    clearDownloads: async () => {
        await delay(1500);
        MOCK_USER_DB.settings.storage.downloads = 0;
        return { success: true };
    },

    // --- HELP SCREEN ---

    getFAQ: async (query) => {
        await delay(500);
        if (!query) return { success: true, data: MOCK_FAQ };
        
        const lowerQ = query.toLowerCase();
        const filtered = MOCK_FAQ.filter(item => 
            item.q.toLowerCase().includes(lowerQ) || 
            item.a.toLowerCase().includes(lowerQ)
        );
        return { success: true, data: filtered };
    },

    getContactTopics: async () => {
        await delay(400);
        return { success: true, data: MOCK_CONTACT_TOPICS };
    }
};