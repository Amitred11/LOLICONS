// api/MockProfileService.js
import { ComicService } from '@api/MockComicService';

// --- 1. MOCK DATA DEFINITIONS ---

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
  {
    name: '创',   // Creation / Genesis
    minXp: 10000000,
    color: '#9CCC65',
    title: 'Transcendent Architect',
    description: 'A being beyond creation itself—shaping laws, concepts, and dimensions beyond reality.'
  },
  {
    name: '宙',   // Universe / Cosmos
    minXp: 10000001,
    color: '#8BC34A',
    title: 'Omniverse Sovereign',
    description: 'One who commands countless universes, bending infinities and metaphysical constants.'
  },
  {
    name: '源',   // Origin / Source
    minXp: 10000002,
    color: '#7CB342',
    title: 'Boundless Origin',
    description: 'The unfathomable source from which all creation, paradox, and possibility emerge.'
  },
  {
    name: '异',   // Anomaly / Beyond
    minXp: 10000003,
    color: '#689F38',
    title: 'Absolute Anomaly',
    description: 'A presence transcending reality, non-reality, and every framework that defines existence.'
  },
  {
    name: '巅',   // Apex / Peak
    minXp: 10000004,
    color: '#558B2F',
    title: 'Primordial Apex',
    description: 'Older than existence, surpassing creation, the final and ultimate apex of all power.'
  }
];
//static help, not a mockdata
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
  
  // Banner will be updated dynamically from ComicService
  favoriteComicBanner: { uri: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?q=80&w=1000&auto=format&fit=crop' },

  stats: [
    { label: 'Comics Read', value: '2K' },
    { label: 'Chapters', value: '1.2B' },
    { label: 'Rank', value: '#1' },
  ],
  
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
      unlocked: false
    },
    { 
      id: 'b5', 
      name: 'Loyal Reader', 
      icon: 'heart-circle-outline', 
      description: 'Awarded for reading every day for a full week. That\'s dedication!', 
      unlockedDate: 'Feb 22, 2024',
      rarity: 'Rare',
      category: 'Reading',
      rewards: { xp: 1000, gems: 25 },
      unlocked: true
    },
  ],

  // Note: 'favorites' and 'history' are now populated dynamically in getProfile
  favorites: [],
  history: [],
    
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
  }},
  // 2. TEST USER (Previously Hardcoded)
  'user_test_002': {
    id: 'user_test_002',
    name: 'Test User',
    email: 'test@test.com', // Corresponds to login 'a' / 'a' (see login logic)
    handle: 'test_user',
    avatarUrl: 'https://i.pravatar.cc/150?u=test',
    xp: 0,
    stats: [{ label: 'Comics', value: '0' }, { label: 'Rank', value: 'Mortal' }],
    bio: 'I am a test unit.',
    badges: [],
    favorites: [],
    history: [],
    settings: JSON.parse(JSON.stringify(DEFAULT_SETTINGS))
  },

  // 3. FRIENDS / OTHER USERS
  'friend_1': { 
    id: 'friend_1',
    email: 'jess.dev@example.com',
    name: 'Jessica Parker', 
    handle: 'jess_dev',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
    xp: 25000,
    favoriteComicBanner: { uri: 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=800' },
    stats: [{ label: 'Read', value: '1.2K' }, { label: 'Rank', value: '#45' }],
    status: { type: 'online', text: 'Online' },
    bio: 'Level 99 Mage in real life.', 
    badges: [{ id: 'b5', name: 'Loyal Reader', icon: 'heart-circle-outline', unlocked: true }],
    settings: JSON.parse(JSON.stringify(DEFAULT_SETTINGS))
  },
  'friend_2': { 
    id: 'friend_2',
    email: 'dave.gamer@example.com',
    name: 'David Miller', 
    handle: 'dave_gamer',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
    xp: 8500,
    favoriteComicBanner: { uri: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800' },
    stats: [{ label: 'Read', value: '800' }, { label: 'Rank', value: '#102' }],
    status: { type: 'ingame', text: 'In Game' },
    bio: 'Grinding for that Absolute rarity badge.', 
    badges: [],
    settings: JSON.parse(JSON.stringify(DEFAULT_SETTINGS))
  },
  'friend_3': { 
    id: 'friend_3',
    email: 'sarah.connor@example.com',
    name: 'Sarah Connor', 
    handle: 'future_savior',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
    xp: 150000,
    favoriteComicBanner: { uri: 'https://images.unsplash.com/photo-1535905557558-afc4877a26fc?w=800' },
    stats: [{ label: 'Read', value: '5K' }, { label: 'Rank', value: '#5' }],
    status: { type: 'offline', text: 'Offline' },
    bio: 'No fate but what we make.', 
    badges: [],
    settings: JSON.parse(JSON.stringify(DEFAULT_SETTINGS))
  },
  's1': {
    id: 's1', 
    name: 'Dr. Doom', 
    handle: 'latveria_ruler', 
    avatarUrl: 'https://i.pravatar.cc/150?u=doom', 
    bio: 'Looking for challengers.', 
    status: { type: 'online' },
    xp: 55000,
    stats: [{ label: 'Read', value: '7K' }, { label: 'Rank', value: '#2' }, { label: 'Guild', value: 'Latveria' }],
    settings: JSON.parse(JSON.stringify(DEFAULT_SETTINGS))
  },
  's2': {
    id: 's2', 
    name: 'Gwen Stacy', 
    handle: 'ghost_spider', 
    avatarUrl: 'https://i.pravatar.cc/150?u=gwen', 
    bio: 'Band practice later?', 
    status: { type: 'offline' },
    xp: 9200,
    stats: [{ label: 'Read', value: '950' }, { label: 'Rank', value: '#98' }, { label: 'Guild', value: 'The Mary Janes' }],
    settings: JSON.parse(JSON.stringify(DEFAULT_SETTINGS))
  },
  's3': {
    id: 's3', 
    name: 'Miles M.', 
    handle: 'brooklyn_spidey', 
    avatarUrl: 'https://i.pravatar.cc/150?u=miles', 
    bio: 'Doing my own thing.', 
    status: { type: 'online' },
    xp: 12500,
    stats: [{ label: 'Read', value: '1.1K' }, { label: 'Rank', value: '#76' }, { label: 'Guild', value: 'Spider-Verse' }],
    badges: [],
    settings: JSON.parse(JSON.stringify(DEFAULT_SETTINGS))
  },
};

// --- STATE MANAGEMENT ---
// This acts as the "Server Session"
let CURRENT_USER_ID = 'usr_a1b2c3d4e5f6g7h8'; // Default for development

// Legacy export for backward compatibility if needed, though APIs use ID lookup now
export const MOCK_USER_DB = MOCK_ALL_USERS[CURRENT_USER_ID]; 

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const getCurrentUser = () => {
    return MOCK_ALL_USERS[CURRENT_USER_ID] || null;
};

// --- 3. API SERVICE EXPORTS ---

export const ProfileAPI = {

    // --- MAIN PROFILE & EDIT ---
    
    getProfile: async () => {
        await delay(1000);
        
        const currentUser = getCurrentUser();
        if (!currentUser) throw new Error("No active user");

        const currentRank = MOCK_RANKS.slice().reverse().find(r => currentUser.xp >= r.minXp) || MOCK_RANKS[0];
        const nextRankIndex = MOCK_RANKS.findIndex(r => r.name === currentRank.name) + 1;
        const nextRank = MOCK_RANKS[nextRankIndex] || null;

        // In a real app, History/Favorites would be fetched by User ID. 
        // For now, we simulate pulling them into the current user object if they aren't there.
        try {
            const historyData = await ComicService.getHistory();
            const favoritesData = (await ComicService.getFavorites()).data;
            
            // Only overwrite if empty, or simulate sync
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

        return {
            success: true,
            data: {
                ...currentUser,
                currentRank,
                nextRank,
                favoriteComicBanner: banner,
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
        
        // Update the global DB object for this user
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


    // --- FRIEND PROFILE ---
    
    getFriendProfile: async (userId) => {
        await delay(800);
        
        // Search by ID or Partial ID (handling 'friend_1' vs '1')
        let friendData = MOCK_ALL_USERS[userId] || 
                         MOCK_ALL_USERS[`friend_${userId}`] ||
                         Object.values(MOCK_ALL_USERS).find(u => u.id === userId);

        if (!friendData) {
            return { success: false, message: "User not found" };
        }
        
        const currentRank = MOCK_RANKS.slice().reverse().find(r => friendData.xp >= r.minXp) || MOCK_RANKS[0];

        return { success: true, data: { ...friendData, currentRank } };
    },

    // --- TROPHY CASE ---

    getTrophies: async () => {
        await delay(800);
        const currentUser = getCurrentUser();
        return { success: true, data: currentUser ? currentUser.badges : [] };
    },

    // --- ACCOUNT SCREEN ---

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

    // --- CHANGE PASSWORD SCREEN ---

    changePassword: async (current, newPass) => {
        await delay(1500);
        // We accept '123456' OR 'a' as current password for testing
        if (current === '123456' || current === 'a') { 
            return { success: true };
        } else {
            throw new Error("Current password is incorrect.");
        }
    },

    // --- PRIVACY SCREEN ---

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

    // --- NOTIFICATIONS SCREEN ---

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

    // --- DATA & STORAGE SCREEN ---

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