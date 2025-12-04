/**
 * @file mockData.js
 * @description This file contains all the static mock data used throughout the application.
 * It simulates database records for comics, users, missions, events, etc., to allow for
 * UI development and testing without a live backend.
 */

// A helper function to generate ISO date strings for a specified number of days in the past.
// This is used to create dynamic-looking release dates for chapters.
const getDateString = (daysAgo) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0]; // Returns 'YYYY-MM-DD'
};

// --- CORE DATA ---

/**
 * The main dataset for all comics available in the app.
 * Each object represents a single comic series.
 * - id: Unique identifier for the comic.
 * - title: The main title of the comic.
 * - author: The creator's name.
 * - status: 'Ongoing' or 'Completed'.
 * - type: The format of the comic, e.g., 'Manhwa', 'Manga', 'Comic'.
 * - genres: An array of strings representing the comic's genres.
 * - synopsis: A brief summary of the plot.
 * - image, localSource: Require() paths to the cover image. In a real app, `image` might be a remote URL.
 * - isPopular: A boolean to flag the comic for "Popular" sections.
 * - chapters: An array of chapter objects, each with an id, title, and releaseDate.
 * 
 * Note: Some entries have duplicate properties (e.g., `type`, `lastRead`) which may indicate inconsistent
 * data entry that would be cleaned up in a real database.
 */
export const comicsData = [
  { 
    id: '1', 
    title: 'Cybernetic Dawn', 
    author: 'J.K. Artwright',
    status: 'Ongoing',
    type: 'Manhwa',
    genres: ['Sci-Fi', 'Action', 'Cyberpunk'],
    synopsis: 'In a neon-drenched future, a rogue android discovers a secret that could shatter the fragile peace between humans and machines. Hunted by corporations, she must fight to expose the truth.',
    image: require('../assets/comic-1.jpg'),
    localSource: require('../assets/comic-1.jpg'),
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
    image: require('../assets/comic-4.jpg'),
    localSource: require('../assets/comic-4.jpg'),
    chapters: [ {id: '1', title: 'Chapter 1'}, {id: '2', title: 'Chapter 2'} ],
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
    image: require('../assets/comic-3.jpg'), 
    localSource: require('../assets/comic-3.jpg'),
    chapters: [{id: '1', title: 'Chapter 1'}],
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
    image: require('../assets/comic-4.jpg'),
    localSource: require('../assets/comic-4.jpg'),
    chapters: [{id: '1', title: 'Chapter 1'}],
    isPopular: false,
  }
  // Add more comic entries as needed...
];

/**
 * Defines the user ranking system based on experience points (XP).
 * - name: The rank's letter grade.
 * - minXp: The minimum XP required to achieve this rank.
 * - color: A color code associated with the rank for UI styling.
 */
export const ranks = [
  // --- Special / Anomaly Rank ---
  // This rank is for special cases and is not part of the normal progression.
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

// Helper function to generate a "reading" status object for a user.
function ReadingStatus({ comic }) {
  return {
    type: 'reading',
    text: `Reading "${comic.title}"`,
  };
}
// Set a default comic for the user's initial status.
const currentComic = comicsData[1];
const status = ReadingStatus({ comic: currentComic });

/**
 * Mock data object for the currently logged-in user.
 * This simulates a user profile fetched from a database.
 */
export const userData = {
  id: 'usr_a1b2c3d4e5f6g7h8',
  email: 'loli.hunter@example.com',
  name: 'AMITRED11',
  handle: 'pogiako',
  avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
  xp: 3.14159,
  stats: [
    { label: 'Comics Read', value: '2K' },
    { label: 'Chapters', value: '1.2B' },
    { label: 'Rank', value: '#1' },
  ],
  // A list of achievements/badges the user has unlocked.
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
    },
  ],
  // Slices of the main comicsData array to populate the user's favorites and history for demonstration.
  favorites: comicsData.slice(0, 4),
  history: comicsData.slice(1, 4).reverse(),
  status, // The generated status object from above.
  bio: "Just a comic enthusiast exploring new worlds, one chapter at a time. Big fan of fantasy and sci-fi.",
  favoriteComicBanner: require('../assets/comic-2.jpg'),
};

// --- DASHBOARD & HOME SCREEN DATA ---

/** Data for the "Today's Quest" card on the home screen. */
export const dashboardMissions = [
  { id: '1', title: 'Read a new chapter', reward: '+50 XP', progress: 0.66 },
  { id: '2', title: 'Open the app daily', reward: '+10 Gems', progress: 1 },
  { id: '3', title: 'Join a Community', reward: '+25 XP', progress: 0 },
];

/** Data for the "Upcoming Events" carousel on the home screen. */
export const upcomingEvents = [
  { id: '1', title: 'CyberFest 2024', date: 'DEC 12', image: require('../assets/event-1.jpg') },
  { id: '2', title: 'Indie Game Jam', date: 'DEC 18', image: require('../assets/event-2.jpg') },
  { id: '3', title: 'Comic Con Pre-party', date: 'DEC 22', image: require('../assets/event-3.jpg') },
];

// --- READER & HISTORY DATA ---

/**
 * A separate mock dataset specifically for the user's reading history.
 * In a real app, this would be generated dynamically based on user activity.
 * It includes a `lastRead` Date object for sorting and grouping.
 */
export const historyData = [
  {
    id: '1',
    title: 'Solo Leveling',
    image: require('../assets/comic-1.jpg'),
    lastChapterRead: 'Chapter 178',
    lastRead: new Date(new Date().setDate(new Date().getDate() - 0)), // Today
    progress: 0.75,
  },
  {
    id: '4',
    title: 'Tower of God',
    image: require('../assets/comic-4.jpg'),
    lastChapterRead: 'S3 - Chapter 130',
    lastRead: new Date(new Date().setDate(new Date().getDate() - 1)), // Yesterday
    progress: 0.2,
  },
].sort((a, b) => b.lastRead - a.lastRead);

/**
 * A map of comic IDs to an array of their page images.
 * This simulates fetching the pages for a specific chapter for the reader screen.
 * For simplicity, we use the same images for all chapters of a comic.
 */
export const comicPagesData = {
  '1': [ require('../assets/comic-1.jpg'), require('../assets/comic-2.jpg'), require('../assets/comic-3.jpg') ],
  '2': [ require('../assets/comic-4.jpg'), require('../assets/comic-5.jpg'), require('../assets/comic-6.jpg') ],
  '3': [ require('../assets/comic-1.jpg'), require('../assets/comic-3.jpg'), require('../assets/comic-5.jpg') ],
  '4': [ require('../assets/comic-2.jpg'), require('../assets/comic-4.jpg'), require('../assets/comic-6.jpg') ],
};

// --- ACTIVITY & SOCIAL HUB DATA ---

/** Mock data for games, used in the social presence/activity feature. */
export const gamesData = [
  { id: '1', title: 'Cyber-Heist', genre: 'Stealth Action', description: 'Infiltrate megacorporations in a cyberpunk world.', players: '1.2M Players', image: require('../assets/game-1.jpg'), isFeatured: true, isInstalled: true },
  { id: '2', title: 'Mage Arena', genre: 'Fantasy Battler', description: 'Clash with other mages in a fast-paced arena.', players: '850K Players', image: require('../assets/game-2.jpg'), isInstalled: false },
  { id: '3', title: 'Starship Raiders', genre: 'Space Shooter', description: 'Pilot your custom starship through asteroid fields.', players: '450K Players', image: require('../assets/game-3.jpg'), isInstalled: false },
];

/**
 * Simulates the current activity status of the user's friends.
 * - activityType: 'game', 'comic', or 'idle'.
 * - activityId: Links to an ID in `gamesData` or `comicsData`.
 */
export const friendsPresence = [
    { id: '1', name: 'Cypher', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704a', activityType: 'game', activityId: '1', status: 'Playing Cyber-Heist', details: 'Mission 5: The Infiltration' },
    { id: '2', name: 'Elara', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704b', activityType: 'comic', activityId: '2', status: 'Reading The Quantum Mage', details: 'Chapter 2' },
    { id: '3', name: 'RoguePilot', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704c', activityType: 'game', activityId: '3', status: 'Playing Starship Raiders', details: 'Wave 15' },
    { id: '4', name: 'Nexus', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d', activityType: 'comic', activityId: '1', status: 'Reading Cybernetic Dawn', details: 'Chapter 9' },
    { id: '5', name: 'Watcher', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704e', activityType: 'idle', status: 'Online', details: 'Browsing the app' },
];

// --- COMMUNITY & CHAT DATA ---

/** Data for community hubs/servers. */
export const communityHubsData = [
  {
    id: 'hub1',
    name: 'Cybernetic Dawn Fans',
    icon: require('../assets/comic-1.jpg'),
    channels: [
      { type: 'category', name: 'Text Channels' },
      { type: 'text', id: 'ch1', name: 'general-discussion' },
      { type: 'text', id: 'ch2', name: 'fan-art-showcase' },
      { type: 'text', id: 'ch3', name: 'spoilers' },
      { type: 'category', name: 'Voice Channels' },
      { type: 'voice', id: 'vc1', name: 'Lobby' },
      { type: 'voice', id: 'vc2', name: 'Reading Group' },
    ],
  },
  {
    id: 'hub2',
    name: 'Quantum Mage Guild',
    icon: require('../assets/comic-4.jpg'),
    channels: [
      { type: 'category', name: 'Text Channels' },
      { type: 'text', id: 'ch4', name: 'welcome' },
      { type: 'text', id: 'ch5', name: 'theorycrafting' },
    ],
  },
];

/** A map of channel IDs to their messages. */
export const messagesData = {
  'ch1': [ // Messages for #general-discussion
    { id: 'm5', author: 'Nexus', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d', content: 'That last chapter was insane!', timestamp: new Date(new Date().setMinutes(new Date().getMinutes() - 2))},
    { id: 'm4', author: 'Nexus', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d', content: 'Did anyone else finish it yet?', timestamp: new Date(new Date().setMinutes(new Date().getMinutes() - 3))},
    { id: 'm3', author: 'Elara', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704b', content: 'Working on it now! Don\'t spoil it!', timestamp: new Date(new Date().setMinutes(new Date().getMinutes() - 5))},
    { id: 'm2', author: 'Cypher', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704a', content: 'Welcome to the server!', timestamp: new Date(new Date().setHours(new Date().getHours() - 1))},
    { id: 'm1', author: 'Cypher', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704a', content: 'Hey everyone!', timestamp: new Date(new Date().setHours(new Date().getHours() - 1))},
  ]
};

/** Data for the main community feed on the Community screen. */
export const communityPostsData = [
    { id: '1', community: 'Cybernetic Dawn Fans', type: 'Announcement', title: 'Version 2.0 Update is LIVE!', author: 'Dev Team', avatar: require('../assets/dev-avatar.png'), timestamp: new Date(new Date().setDate(new Date().getDate() - 1)), upvotes: 1200, comments: 128, image: require('../assets/event-1.jpg'), snippet: 'We are thrilled to announce the biggest update yet! Featuring a new UI, offline downloads, and the brand new Activity Hub.' },
    { id: '2', community: 'Quantum Mage Guild', type: 'Discussion', title: 'Who is the strongest character?', author: 'TheoryCrafter', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d', timestamp: new Date(new Date().setHours(new Date().getHours() - 3)), upvotes: 450, comments: 42, snippet: 'I think the protagonist is obviously strong, but that side character from chapter 5 has some serious hidden power.' },
    { id: '3', community: 'Fan Art Central', type: 'Fan Art', title: 'My drawing of the main character!', author: 'ArtElara', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704e', timestamp: new Date(new Date().setHours(new Date().getHours() - 8)), upvotes: 890, comments: 15, image: require('../assets/fan-art-1.jpg'), snippet: 'Just finished this piece, took me around 10 hours. Hope you all like it!' },
];

/** Data for the Direct Messages list. Links to `friendsPresence` data. */
export const directMessagesData = [
    { id: 'dm1', friend: friendsPresence[0], lastMessage: 'Yeah, that last mission was tough!', timestamp: new Date(new Date().setMinutes(new Date().getMinutes() - 15)), unreadCount: 2 },
    { id: 'dm2', friend: friendsPresence[1], lastMessage: 'Did you see my new fan art?', timestamp: new Date(new Date().setHours(new Date().getHours() - 1)), unreadCount: 0 },
    { id: 'dm3', friend: friendsPresence[3], lastMessage: 'Let\'s read the new chapter together later.', timestamp: new Date(new Date().setDate(new Date().getDate() - 1)), unreadCount: 0 },
];

// --- HELP SCREEN DATA ---

/** Data for the FAQ section on the Help screen. */
import { Alert, Linking } from 'react-native';
export const faqData = [
    { q: "How do I reset my password?", a: "You can reset your password from the login screen by tapping on the 'Forgot Password?' link." },
    { q: "Can I read comics offline?", a: "Yes! On a comic's detail page, you can tap the download icon to save chapters for offline reading." },
    { q: "How does the ranking system work?", a: "You gain XP by completing daily missions, reading chapters, and participating in community events." },
    { q: "How do I change my username?", a: "You can change your username by navigating to your profile and tapping the 'Edit Profile' button." },
];

/** Data for the "Contact & Legal" section on the Help screen. */
export const contactTopics = [
    { 
      label: "Contact Us", 
      icon: "chatbubble-ellipses-outline", 
      action: { type: 'link', url: 'mailto:support@example.com' } 
    },
    { 
      label: "Terms of Service", 
      icon: "document-text-outline", 
      action: { 
        type: 'modal', 
        modalName: 'info', 
        modalProps: {
          icon: 'document-text-outline',
          title: 'Terms of Service',
          message: 'By using this app, you agree to our terms. All content is for demonstration purposes. Do not distribute or sell any materials found within the app.'
        }
      } 
    },
    { 
      label: "Privacy Policy", 
      icon: "shield-checkmark-outline", 
      action: { 
        type: 'modal', 
        modalName: 'info', 
        modalProps: {
          icon: 'shield-checkmark-outline',
          title: 'Privacy Policy',
          message: 'We do not collect or share your personal data. All user information is stored locally on your device for this demonstration.'
        }
      } 
    },
    { 
      label: "Community Rules", 
      icon: "people-outline", 
      action: {
        type: 'modal',
        modalName: 'info', // This tells ModalProvider to use InfoModal
        modalProps: { // These props are passed directly to InfoModal
          icon: 'people-outline',
          title: 'Community Rules',
          message: 'Bakal Si Aldrin.'
        }
      } 
    },
];


export const NOTIFICATIONS = [
  {
    id: '1',
    type: 'guild',
    title: 'Guild Invitation',
    message: 'Dragon Slayers invited you to join their realm.',
    time: '2m ago',
    unread: true,
  },
  {
    id: '2',
    type: 'market',
    title: 'Offer Received',
    message: 'xX_Shadow_Xx made an offer on your Mythic Sword.',
    time: '1h ago',
    unread: true,
  },
  {
    id: '3',
    type: 'system',
    title: 'System Update',
    message: 'Maintenance scheduled for tonight at 00:00 UTC.',
    time: '5h ago',
    unread: false,
  },
  {
    id: '4',
    type: 'social',
    title: 'New Mention',
    message: 'Sarah replied to your discussion thread.',
    time: '1d ago',
    unread: false,
  },
  {
    id: '5',
    type: 'market',
    title: 'Item Sold',
    message: 'Your listing "Iron Helmet" was sold for 500 Gold.',
    time: '2d ago',
    unread: false,
  },
];