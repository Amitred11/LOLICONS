// api/MockFriendService.js

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to generate random badges for friends
const getBadges = (count) => {
  const allBadges = [
    { id: 'b1', name: 'The Designer', icon: 'pencil-outline', rarity: 'Primeval', description: 'Awarded to the creative mind.' },
    { id: 'b2', name: 'Supreme Racist', icon: 'sad-outline', rarity: 'Epic', description: 'Top tier community contributor.' },
    { id: 'b3', name: 'Night Owl', icon: 'moon-outline', rarity: 'Uncommon', description: 'Reads past midnight.' },
    { id: 'b4', name: 'Collector', icon: 'albums-outline', rarity: 'Rare', description: '10+ Comics in library.' },
    { id: 'b5', name: 'The Celestials', icon: 'infinite-outline', rarity: 'Absolute', description: 'System Creator.' },
    { id: 'b6', name: 'Grass Toucher', icon: 'leaf-outline', rarity: 'Impossible', description: 'Actually went outside.' },
    { id: 'b7', name: 'Void Walker', icon: 'eye-off-outline', rarity: 'Legendary', description: 'Read 100 chapters without an account.' },
  ];
  return allBadges.sort(() => 0.5 - Math.random()).slice(0, count);
};

// EXPORTED DATA so ProfileService can find these users
export const MOCK_FRIENDS_LIST = [
  { 
    id: '1', 
    name: 'Jessica Parker', 
    handle: 'jess_dev',
    status: 'Online', 
    bio: 'Level 99 Mage in real life. 🧙‍♀️ Code by day, Mana cultivation by night.', 
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
    banner: 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=800',
    stats: [{ label: 'Read', value: '1.2K' }, { label: 'Rank', value: '#45' }, { label: 'Guild', value: 'Apex' }],
    badges: getBadges(4)
  },
  { 
    id: '2', 
    name: 'David Miller', 
    handle: 'dave_gamer',
    status: 'In Game', 
    bio: 'Grinding for that Absolute rarity badge. Do not disturb unless it is urgent.', 
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
    banner: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800',
    stats: [{ label: 'Read', value: '800' }, { label: 'Rank', value: '#102' }, { label: 'Guild', value: 'None' }],
    badges: getBadges(2)
  },
  { 
    id: '3', 
    name: 'Sarah Connor', 
    handle: 'future_savior',
    status: 'Offline', 
    bio: 'No fate but what we make. Also looking for good Isekai recs.', 
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
    banner: 'https://images.unsplash.com/photo-1535905557558-afc4877a26fc?w=800',
    stats: [{ label: 'Read', value: '5K' }, { label: 'Rank', value: '#5' }, { label: 'Guild', value: 'Resistance' }],
    badges: getBadges(5)
  },
  { 
    id: '4', 
    name: 'Kaelthas Sunstrider', 
    handle: 'magister_k',
    status: 'Reading', 
    bio: 'Merely a setback. I have returned to read more manwha.', 
    avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=400',
    banner: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800',
    stats: [{ label: 'Read', value: '999' }, { label: 'Rank', value: '#66' }, { label: 'Guild', value: 'Sunfury' }],
    badges: getBadges(3)
  },
];

export const FriendAPI = {
  fetchFriends: async () => {
    await delay(800); 
    return { success: true, data: MOCK_FRIENDS_LIST };
  },

  // Handle both Group and Guild Creation
  createEntity: async (type, name, memberIds) => {
    await delay(1500);
    console.log(`[API] Creating ${type}: "${name}" with members:`, memberIds);
    return {
      success: true,
      data: {
        id: `${type}_${Date.now()}`,
        name: name,
        type: type.toLowerCase(), // 'group' or 'guild'
        avatar: null,
        members: memberIds,
      }
    };
  }
};