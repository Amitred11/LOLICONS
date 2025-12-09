// api/MockChatService.js

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
  { id: '2', type: 'group', name: 'Camping Trip 🏕️', lastMessage: 'David: I brought the tent', time: '1h', unread: 5, isOnline: false, isMuted: false }, 
  { id: '3', type: 'community', name: 'React Native Devs', lastMessage: 'New version released!', time: '4h', unread: 0, isOnline: false, isMuted: true },
  { id: '4', type: 'direct', name: 'Mike Ross', lastMessage: 'Sent an attachment', time: '1d', unread: 0, avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400', isOnline: true, isMuted: false },
];

// **FIX**: Added the missing MOCK_MESSAGES object
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
    const newGroup = {
      id: `group_${Date.now()}`,
      type: 'group', name: groupName,
      lastMessage: `You created the group "${groupName}"`,
      time: '1m', unread: 0, isOnline: false, isMuted: false,
      members: memberIds,
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

  // **FIX**: Added missing clearHistory function
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
    return { success: true };
  },

  reportUser: async (userId, reason) => {
    await delay(800);
    console.log(`[API] Report sent for ${userId}: ${reason}`);
    return { success: true };
  }
};