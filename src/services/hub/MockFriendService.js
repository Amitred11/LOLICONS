import { MOCK_ALL_USERS } from '@api/MockProfileService'; // Import the single source of truth

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// NOTE: We no longer define the full friend objects here.
// This is just the list of IDs representing the main user's friends.
let MAIN_USER_FRIEND_IDS = ['1', '2', '3'];
const MAIN_USER_ID = 'usr_a1b2c3d4e5f6g7h8';

export const FriendAPI = {
  fetchFriends: async () => {
    await delay(800); 
    
    // The magic happens here: we map the IDs to the full user objects from our central DB
    const friendsData = MAIN_USER_FRIEND_IDS.map(id => {
        const friendUser = MOCK_ALL_USERS[`friend_${id}`] || Object.values(MOCK_ALL_USERS).find(user => user.id === id);
        return friendUser;
    }).filter(Boolean); // Filter out any potential misses

    return { success: true, data: friendsData };
  },

  // NEW: Fetch users who are not the main user or already friends
  fetchSuggestions: async () => {
    await delay(1000);
    
    const allUserIds = Object.keys(MOCK_ALL_USERS);
    const friendIdsSet = new Set(MAIN_USER_FRIEND_IDS.map(id => `friend_${id}`));
    
    const suggestionIds = allUserIds.filter(id => {
      // Exclude the main user and their friends
      return id !== MAIN_USER_ID && !friendIdsSet.has(id) && !MAIN_USER_FRIEND_IDS.includes(id);
    });
    
    const suggestionsData = suggestionIds.map(id => MOCK_ALL_USERS[id]);

    return { success: true, data: suggestionsData };
  },

  addFriend: async (userId) => {
    await delay(1000);
    if (!MAIN_USER_FRIEND_IDS.includes(userId)) {
        MAIN_USER_FRIEND_IDS.push(userId);
    }
    console.log('[API] Friend Added. Current Friends:', MAIN_USER_FRIEND_IDS);
    return { success: true };
  },

  // NEW: Remove a friend by their ID
  removeFriend: async (userId) => {
    await delay(1000);
    const initialLength = MAIN_USER_FRIEND_IDS.length;
    MAIN_USER_FRIEND_IDS = MAIN_USER_FRIEND_IDS.filter(id => id !== userId);
    if (MAIN_USER_FRIEND_IDS.length < initialLength) {
        console.log('[API] Friend Removed. Current Friends:', MAIN_USER_FRIEND_IDS);
        return { success: true };
    }
    return { success: false, message: 'Friend not found.' };
  },

  createEntity: async (type, name, memberIds) => {
    await delay(1500);
    // Simulate potential failure
    if (!name || name.trim().length < 3) {
      return { success: false, message: 'Group name must be at least 3 characters.' };
    }
    console.log(`[API] Creating ${type}: "${name}" with members:`, memberIds);
    return {
      success: true,
      data: {
        id: `${type}_${Date.now()}`,
        name: name,
        type: type.toLowerCase(),
        avatar: null,
        members: memberIds,
      }
    };
  }
};