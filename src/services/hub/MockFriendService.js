import { MOCK_ALL_USERS } from '@api/MockProfileService'; // Import the single source of truth

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// NOTE: We no longer define the full friend objects here.
// This is just the list of IDs representing the main user's friends.
const MAIN_USER_FRIEND_IDS = ['1', '2', '3'];

export const FriendAPI = {
  fetchFriends: async () => {
    await delay(800); 
    
    // The magic happens here: we map the IDs to the full user objects from our central DB
    const friendsData = MAIN_USER_FRIEND_IDS.map(id => {
        // Find the user by their ID. The original ID from the old service was a simple number string.
        // We can look up by the partial key `friend_${id}` or the direct id.
        const friendUser = MOCK_ALL_USERS[`friend_${id}`] || Object.values(MOCK_ALL_USERS).find(user => user.id === id);
        return friendUser;
    }).filter(Boolean); // Filter out any potential misses

    return { success: true, data: friendsData };
  },

  // This function can remain as it is, as it's for creating new entities
  createEntity: async (type, name, memberIds) => {
    await delay(1500);
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