import { ComicService } from '@api/MockComicService';

// --- 1. MOCK DATA DEFINITIONS ---

export const MOCK_RANKS = [
  { 
    name: '¿¿', 
    minXp: -10, 
    color: '#FF3D00',
    title: 'Th∑_An0m@ly',
    description: 'ex!st@1.1294:::ERR << sy$tem_ƒragm€nt >> anom@ly // br°ken pr0gr€ssion && nat.law || [ERR-C0DE:INFINITE] :: unattain//n0rm@l_m€ans'
  },
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
  {
    name: '创',
    minXp: 10000000,
    color: '#9CCC65',
    title: 'Transcendent Architect',
    description: 'A being beyond creation itself—shaping laws, concepts, and dimensions beyond reality.'
  },
  {
    name: '宙', 
    minXp: 10000001,
    color: '#8BC34A',
    title: 'Omniverse Sovereign',
    description: 'One who commands countless universes, bending infinities and metaphysical constants.'
  },
  {
    name: '源',
    minXp: 10000002,
    color: '#7CB342',
    title: 'Boundless Origin',
    description: 'The unfathomable source from which all creation, paradox, and possibility emerge.'
  },
  {
    name: '异',
    minXp: 10000003,
    color: '#689F38',
    title: 'Absolute Anomaly',
    description: 'A presence transcending reality, non-reality, and every framework that defines existence.'
  },
  {
    name: '巅',
    minXp: 10000004,
    color: '#558B2F',
    title: 'Primordial Apex',
    description: 'Older than existence, surpassing creation, the final and ultimate apex of all power.'
  }
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
    { label: 'Feature Request', icon: 'bulb-outline', action: { type: 'link', url: 'https://lha-web.vercel.app/#dms' } },
    { label: 'Community', icon: 'people-outline', action: { type: 'link', url: 'https://lha-web.vercel.app/' } },
    { label: 'Terms & Privacy', icon: 'document-text-outline', action: { type: 'link', url: 'https://lha-web.vercel.app/#dms' } },
];

const DEFAULT_SETTINGS = {
    notifications: {
        global: true,
        preferences: { newChapters: true, recommendations: true, newFollowers: true, comments: true, dms: false, promotions: false },
        quietHours: { enabled: false, start: '10:00 PM', end: '8:00 AM' }
    },
    privacy: { twoFactor: false, activeSessions: 1, blockedUsers: [] },
    storage: { downloads: 0, appData: 50000000, cache: 20000000 },
    connectedAccounts: { google: false, github: false, facebook: false }
};

// --- 2. MAIN USER DATABASE ---

export const MOCK_ALL_USERS = {
  'usr_a1b2c3d4e5f6g7h8': {
    id: 'usr_a1b2c3d4e5f6g7h8',
    email: 'loli.hunter@example.com',
    name: 'AMITRED11',
    handle: 'pogiako',
    avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
    xp: 100000002,
    
    // NEW: Detailed User Info
    location: 'Manila, Philippines',
    website: 'https://amitred.dev',

    // NEW: Detailed Statistics
    extendedStats: {
        reading: {
            comics: 245,
            chapters: 15420,
            novels: 12,
            timeSpent: '482h' 
        },
        entertainment: {
            movies: 45,
            kdrama: 18,
            anime: 156,
            series: 8
        },
        community: {
            eventsJoined: 14,
            comments: 892,
            likesReceived: 14500,
            reports: 0
        }
    },

    // Legacy simple stats (kept for backward compatibility)
    stats: [
      { label: 'Comics Read', value: '2K' },
      { label: 'Chapters', value: '1.2B' },
      { label: 'Rank', value: '#1' },
    ],
    
    favoriteComicBanner: { uri: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?q=80&w=1000&auto=format&fit=crop' },
    status: { type: 'online', text: 'Online' },
    bio: "Just a comic enthusiast exploring new worlds, one chapter at a time. Big fan of fantasy and sci-fi.",

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
        id: 'b5', 
        name: 'Loyal Reader', 
        icon: 'heart-circle-outline', 
        description: 'Awarded for reading every day for a full week.', 
        unlockedDate: 'Feb 22, 2024',
        rarity: 'Rare',
        category: 'Reading',
        rewards: { xp: 1000, gems: 25 },
        unlocked: true
      },
    ],

    favorites: [],
    history: [],
      
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
            downloads: 450000000, 
            appData: 120000000,
            cache: 56000000
        },
        connectedAccounts: {
            google: true,
            github: true,
            facebook: false
        }
    }
  },
  'user_test_002': {
    id: 'user_test_002',
    name: 'Test User',
    email: 'test@test.com', 
    handle: 'test_user',
    avatarUrl: 'https://i.pravatar.cc/150?u=test',
    xp: 0,
    extendedStats: {
        reading: { comics: 0, chapters: 0, novels: 0, timeSpent: '0h' },
        entertainment: { movies: 0, kdrama: 0, anime: 0, series: 0 },
        community: { eventsJoined: 0, comments: 0, likesReceived: 0, reports: 0 }
    },
    stats: [{ label: 'Comics', value: '0' }, { label: 'Rank', value: 'Mortal' }],
    bio: 'I am a test unit.',
    badges: [],
    favorites: [],
    history: [],
    settings: JSON.parse(JSON.stringify(DEFAULT_SETTINGS))
  },
};

// --- STATE MANAGEMENT ---
let CURRENT_USER_ID = 'usr_a1b2c3d4e5f6g7h8'; 

export const MOCK_USER_DB = MOCK_ALL_USERS[CURRENT_USER_ID]; 

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const getCurrentUser = () => {
    return MOCK_ALL_USERS[CURRENT_USER_ID] || null;
};

// --- 3. API SERVICE EXPORTS ---

export const ProfileAPI = {

    getProfile: async () => {
        await delay(1000);
        
        const currentUser = getCurrentUser();
        if (!currentUser) throw new Error("No active user");

        const currentRank = MOCK_RANKS.slice().reverse().find(r => currentUser.xp >= r.minXp) || MOCK_RANKS[0];
        const nextRankIndex = MOCK_RANKS.findIndex(r => r.name === currentRank.name) + 1;
        const nextRank = MOCK_RANKS[nextRankIndex] || null;

        try {
            const historyData = await ComicService.getHistory();
            const favoritesData = (await ComicService.getFavorites()).data;
            
            if(!currentUser.history || currentUser.history.length === 0) {
                 currentUser.history = historyData.data || historyData;
            }
            if(!currentUser.favorites || currentUser.favorites.length === 0) {
                 currentUser.favorites = favoritesData || [];
            }
        } catch (e) {
            console.log("Mock ComicService not available or failed, using local user data.");
        }

        let banner = currentUser.favoriteComicBanner;
        if (currentUser.favorites && currentUser.favorites.length > 0 && currentUser.favorites[0].image) {
            banner = currentUser.favorites[0].image;
        }

        // Ensure stats exist for safety
        const safeStats = currentUser.extendedStats || {
            reading: { comics: 0, chapters: 0, novels: 0, timeSpent: '0h' },
            entertainment: { movies: 0, kdrama: 0, anime: 0, series: 0 },
            community: { eventsJoined: 0, comments: 0, likesReceived: 0, reports: 0 }
        };

        return {
            success: true,
            data: {
                ...currentUser,
                currentRank,
                nextRank,
                favoriteComicBanner: banner,
                extendedStats: safeStats
            }
        };
    },
    
    updateProfile: async (updateData) => {
        await delay(1000);
        const currentUser = getCurrentUser();
        if (!currentUser) return { success: false, message: "Session expired" };

        if (updateData.handle && updateData.handle.length < 3) {
            return { success: false, message: "Username must be at least 3 characters." };
        }
        
        Object.assign(MOCK_ALL_USERS[currentUser.id], updateData);
        
        return { success: true, message: "Profile updated successfully" };
    },

    uploadAvatar: async (uri) => {
        await delay(1500);
        const currentUser = getCurrentUser();
        if (currentUser) {
            MOCK_ALL_USERS[currentUser.id].avatarUrl = uri;
        }
        return { success: true, url: uri };
    },
    
    getFriendProfile: async (userId) => {
        await delay(800);
        let friendData = MOCK_ALL_USERS[userId] || 
                         MOCK_ALL_USERS[`friend_${userId}`] ||
                         Object.values(MOCK_ALL_USERS).find(u => u.id === userId);

        if (!friendData) {
            return { success: false, message: "User not found" };
        }
        const currentRank = MOCK_RANKS.slice().reverse().find(r => friendData.xp >= r.minXp) || MOCK_RANKS[0];
        return { success: true, data: { ...friendData, currentRank } };
    },

    getTrophies: async () => {
        await delay(800);
        const currentUser = getCurrentUser();
        return { success: true, data: currentUser ? currentUser.badges : [] };
    },

    getAccountSettings: async () => {
        await delay(500);
        const currentUser = getCurrentUser();
        if (!currentUser) return { success: false, message: "No user" };

        return {
            success: true,
            data: {
                id: currentUser.id,
                name: currentUser.name,
                handle: currentUser.handle,
                email: currentUser.email,
                joinDate: '2023-08-15',
                connected: currentUser.settings.connectedAccounts
            }
        };
    },

    updateEmail: async (email) => {
        await delay(1000);
        const currentUser = getCurrentUser();
        if(currentUser) MOCK_ALL_USERS[currentUser.id].email = email;
        return { success: true };
    },

    connectSocial: async (provider) => {
        await delay(1500);
        const currentUser = getCurrentUser();
        if(currentUser) MOCK_ALL_USERS[currentUser.id].settings.connectedAccounts[provider] = true;
        return { success: true };
    },

    deleteAccount: async () => {
        await delay(2000);
        const currentUser = getCurrentUser();
        if (currentUser) {
            delete MOCK_ALL_USERS[currentUser.id];
            CURRENT_USER_ID = null;
        }
        return { success: true };
    },

    changePassword: async (current, newPass) => {
        await delay(1500);
        if (current === '123456' || current === 'a') { 
            return { success: true };
        } else {
            throw new Error("Current password is incorrect.");
        }
    },

    getPrivacySettings: async () => {
        await delay(600);
        const currentUser = getCurrentUser();
        return { 
            success: true, 
            data: {
                twoFactor: currentUser.settings.privacy.twoFactor,
                sessions: currentUser.settings.privacy.activeSessions,
                blocked: currentUser.settings.privacy.blockedUsers
            }
        };
    },

    toggle2FA: async (status) => {
        await delay(500);
        const currentUser = getCurrentUser();
        if(currentUser) {
            MOCK_ALL_USERS[currentUser.id].settings.privacy.twoFactor = !status;
            return !status;
        }
        return false;
    },

    logoutAllSessions: async () => {
        await delay(800);
        const currentUser = getCurrentUser();
        if(currentUser) MOCK_ALL_USERS[currentUser.id].settings.privacy.activeSessions = 1;
        return { success: true };
    },

    blockUser: async (username) => {
        await delay(500);
        if (!username) throw new Error("Invalid username");
        const currentUser = getCurrentUser();
        if (currentUser) {
            const newBlock = { id: Math.random().toString(), name: username, date: new Date().toISOString().split('T')[0] };
            MOCK_ALL_USERS[currentUser.id].settings.privacy.blockedUsers.push(newBlock);
            return newBlock;
        }
    },

    unblockUser: async (id) => {
        await delay(500);
        const currentUser = getCurrentUser();
        if (currentUser) {
            MOCK_ALL_USERS[currentUser.id].settings.privacy.blockedUsers = 
                currentUser.settings.privacy.blockedUsers.filter(u => u.id !== id);
        }
        return { success: true };
    },

    getNotificationSettings: async () => {
        await delay(600);
        const currentUser = getCurrentUser();
        return { 
            success: true, 
            data: {
                globalEnabled: currentUser.settings.notifications.global,
                preferences: currentUser.settings.notifications.preferences,
                quietHours: currentUser.settings.notifications.quietHours
            }
        };
    },

    updateNotificationSetting: async (key, value) => {
        await delay(300); 
        const currentUser = getCurrentUser();
        if (currentUser) {
            if (key === 'global') {
                 MOCK_ALL_USERS[currentUser.id].settings.notifications.global = value;
            } else {
                 MOCK_ALL_USERS[currentUser.id].settings.notifications.preferences[key] = value;
            }
        }
        return { success: true };
    },

    updateQuietHours: async (newSettings) => {
        await delay(500);
        const currentUser = getCurrentUser();
        if(currentUser) MOCK_ALL_USERS[currentUser.id].settings.notifications.quietHours = newSettings;
        return { success: true };
    },

    getStorageUsage: async () => {
        await delay(800);
        const currentUser = getCurrentUser();
        if (!currentUser) return { success: false };

        const { downloads, appData, cache } = currentUser.settings.storage;
        
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
        const currentUser = getCurrentUser();
        if(currentUser) MOCK_ALL_USERS[currentUser.id].settings.storage.cache = 0;
        return { success: true };
    },

    clearDownloads: async () => {
        await delay(1500);
        const currentUser = getCurrentUser();
        if(currentUser) MOCK_ALL_USERS[currentUser.id].settings.storage.downloads = 0;
        return { success: true };
    },

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