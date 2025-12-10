// api/MockChatService.js

import { MOCK_ALL_USERS } from '@api/MockProfileService';

/**
 * MOCK BACKEND SERVICE
 * ---------------------
 * Backend Dev: Replace the contents of these functions with real API calls.
 * All functions return Promises to simulate network latency.
 */

// Simulating network delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Mock Database
let MOCK_CHATS = [
  { id: '1', type: 'direct', name: 'Jessica Parker', lastMessage: 'See you at the event!', time: '2m', unread: 2, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400', isOnline: true, isMuted: false },
  { id: '2', type: 'group', name: 'Camping Trip 🏕️', lastMessage: 'David: I brought the tent', time: '1h', unread: 5, isOnline: false, isMuted: false, disappearingMessages: { enabled: false, duration: 86400 } }, 
  { id: '3', type: 'community', name: 'React Native Devs', lastMessage: 'New version released!', time: '4h', unread: 0, isOnline: false, isMuted: true },
  { id: '4', type: 'direct', name: 'Mike Ross', lastMessage: 'Sent an attachment', time: '1d', unread: 0, avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400', isOnline: true, isMuted: false, disappearingMessages: { enabled: true, duration: 86400 } },
];

const MOCK_MESSAGES = {
  '1': [
    { id: 'm1-1', text: 'See you at the event!', sender: 'them', type: 'text', time: '10:00 AM', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400', senderName: 'Jessica' },
    { id: 'm1-2', text: 'Sounds good!', sender: 'me', type: 'text', time: '10:05 AM' },
  ],
  '2': [
    { id: 'm2-1', text: 'I brought the tent', sender: 'them', type: 'text', time: '1h ago', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400', senderName: 'David' },
    { id: 'm2-2', text: 'Awesome, I have the marshmallows!', sender: 'me', type: 'text', time: '59m ago' },
  ],
  '4': [
     { id: 'm4-1', text: 'Sent an attachment', sender: 'them', type: 'document', fileName: 'legal_brief.pdf', time: '1d ago', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400', senderName: 'Mike Ross'  }
  ]
};

export const ChatAPI = {
  
  fetchChatList: async () => {
    await delay(1000);
    return { success: true, data: MOCK_CHATS };
  },

  createGroup: async (groupName, memberIds) => {
    await delay(1200);
    // Create members array from IDs
    const allUsers = Object.values(MOCK_ALL_USERS);
    const members = memberIds.map(id => {
        const u = allUsers.find(user => user.id === id);
        return u ? { ...u, avatar: u.avatarUrl } : { id, name: 'Unknown' };
    });

    const newGroup = {
      id: `group_${Date.now()}`,
      type: 'group', name: groupName,
      lastMessage: `You created the group "${groupName}"`,
      time: '1m', unread: 0, isOnline: false, isMuted: false,
      members: members,
      disappearingMessages: { enabled: false, duration: 86400 },
    };
    MOCK_CHATS.unshift(newGroup);
    return { success: true, data: newGroup };
  },

  archiveChat: async (chatId) => {
    await delay(500);
    console.log(`[API] Archived Chat ${chatId}`);
    return { success: true };
  },

  deleteChat: async (chatId) => {
    await delay(800);
    MOCK_CHATS = MOCK_CHATS.filter(c => c.id !== chatId);
    return { success: true };
  },

  fetchHistory: async (chatId) => {
    await delay(1000); 
    const history = MOCK_MESSAGES[chatId] || [];
    return { success: true, data: history };
  },

  sendMessage: async (chatId, messageData) => {
    await delay(600); 
    const { content, type, fileName } = messageData;
    const newMessage = {
      id: Date.now().toString(),
      text: content,
      sender: 'me',
      type: type,
      imageUri: type === 'image' ? content : null,
      fileName: type === 'document' ? fileName : null,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    if (!MOCK_MESSAGES[chatId]) MOCK_MESSAGES[chatId] = [];
    MOCK_MESSAGES[chatId].unshift(newMessage);
    return { success: true, data: newMessage };
  },

  clearHistory: async (chatId) => {
    await delay(800);
    MOCK_MESSAGES[chatId] = [];
    console.log(`[API] Cleared history for Chat ${chatId}`);
    return { success: true };
  },

  toggleMute: async (chatId, isMuted) => {
    await delay(400);
    const chat = MOCK_CHATS.find(c => c.id === chatId);
    if(chat) chat.isMuted = isMuted;
    console.log(`[API] Chat ${chatId} mute status set to: ${isMuted}`);
    return { success: true };
  },

  blockUser: async (userId) => {
    await delay(1000);
    console.log(`[API] User ${userId} blocked`);
    // In a real app, this would also remove any chats with this user
    MOCK_CHATS = MOCK_CHATS.filter(c => c.id !== userId);
    return { success: true };
  },

  reportUser: async (userId, reason) => {
    await delay(800);
    console.log(`[API] Report sent for ${userId}: ${reason}`);
    return { success: true };
  },
  
  leaveGroup: async (chatId) => {
    await delay(1200);
    MOCK_CHATS = MOCK_CHATS.filter(c => c.id !== chatId);
    console.log(`[API] User left group ${chatId}`);
    return { success: true };
  },

  updateChatSettings: async (chatId, settings) => {
    await delay(500);
    const chatIndex = MOCK_CHATS.findIndex(c => c.id === chatId);
    if (chatIndex === -1) return { success: false };

    if (settings.disappearingMessages !== undefined) {
      MOCK_CHATS[chatIndex].disappearingMessages = {
        ...MOCK_CHATS[chatIndex].disappearingMessages,
        enabled: settings.disappearingMessages
      };
    }
    console.log(`[API] Updated settings for chat ${chatId}:`, MOCK_CHATS[chatIndex]);
    return { success: true, data: MOCK_CHATS[chatIndex] };
  },

  // --- NEW: Add Member Logic utilizing MOCK_ALL_USERS ---

  fetchFriends: async () => {
    await delay(600);
    // Convert MOCK_ALL_USERS object to array
    const users = Object.values(MOCK_ALL_USERS)
        // Filter out the main user (assuming 'usr_a1b2c3d4e5f6g7h8' is me)
        .filter(u => u.id !== 'usr_a1b2c3d4e5f6g7h8')
        // Map keys to match chat UI expectations (avatarUrl -> avatar)
        .map(u => ({
            ...u,
            avatar: u.avatarUrl
        }));
    
    return { success: true, data: users };
  },

  addMembersToGroup: async (chatId, newMemberIds) => {
    await delay(1000);
    const chat = MOCK_CHATS.find(c => c.id === chatId);
    
    if (chat) {
      const allUsers = Object.values(MOCK_ALL_USERS);
      
      // Look up full user objects based on IDs
      const newMembers = newMemberIds.map(id => {
          const user = allUsers.find(u => u.id === id);
          if (user) {
              // Ensure shape matches chat UI expectations
              return { ...user, avatar: user.avatarUrl };
          }
          return null;
      }).filter(Boolean);
      
      // Initialize members array if it doesn't exist
      let currentMembers = chat.members || [];
      
      // Filter out members already in the group (avoid duplicates)
      const currentMemberIds = currentMembers.map(m => m.id || m); // handle object or string legacy data
      const uniqueNewMembers = newMembers.filter(m => !currentMemberIds.includes(m.id));
      
      // Merge
      chat.members = [...currentMembers, ...uniqueNewMembers];
      
      console.log(`[API] Added members to ${chatId}:`, uniqueNewMembers.map(m => m.name));
      return { success: true, data: chat.members };
    }
    return { success: false, message: 'Chat not found' };
  },
  updateGroupProfile: async (chatId, updates) => {
    await delay(800);
    const chat = MOCK_CHATS.find(c => c.id === chatId);
    if (chat) {
        if (updates.name) chat.name = updates.name;
        if (updates.avatar) chat.avatar = updates.avatar; // In real app, this is a URL
        return { success: true, data: chat };
    }
    return { success: false, message: 'Chat not found' };
  },

  removeMemberFromGroup: async (chatId, userId) => {
    await delay(1000);
    const chat = MOCK_CHATS.find(c => c.id === chatId);
    if (chat) {
        // Handle object or string members
        chat.members = chat.members.filter(m => (m.id || m) !== userId);
        return { success: true, data: chat.members };
    }
    return { success: false };
  },

  setMemberNickname: async (chatId, userId, nickname) => {
    await delay(500);
    // In a real backend, this would be stored in a "members" join table
    const chat = MOCK_CHATS.find(c => c.id === chatId);
    if(chat) {
       // Mock implementation: attach nickname to the member object in the array
       const memberIndex = chat.members.findIndex(m => (m.id || m) === userId);
       if(memberIndex > -1) {
           if(typeof chat.members[memberIndex] === 'string') {
               // Convert legacy string to object
               chat.members[memberIndex] = { id: chat.members[memberIndex], name: chat.members[memberIndex] };
           }
           chat.members[memberIndex].nickname = nickname;
       }
       return { success: true };
    }
    return { success: false };
  },
  searchUsers: async (query) => {
    await delay(600);
    if (!query) return { success: true, data: [] };

    const lowerQuery = query.toLowerCase();
    const allUsers = Object.values(MOCK_ALL_USERS);

    // Filter all users by name or handle
    const results = allUsers.filter(u => 
      (u.name && u.name.toLowerCase().includes(lowerQuery)) ||
      (u.handle && u.handle.toLowerCase().includes(lowerQuery))
    );

    return { success: true, data: results };
  },
};