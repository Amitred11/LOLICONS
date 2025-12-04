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
const MOCK_CHATS = [
  { id: '1', type: 'direct', name: 'Jessica Parker', lastMessage: 'See you at the event!', time: '2m', unread: 2, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400', isOnline: true },
  { id: '2', type: 'group', name: 'Camping Trip 🏕️', lastMessage: 'David: I brought the tent', time: '1h', unread: 5, isOnline: false }, 
  { id: '3', type: 'community', name: 'React Native Devs', lastMessage: 'New version released!', time: '4h', unread: 0, isOnline: false },
  { id: '4', type: 'direct', name: 'Mike Ross', lastMessage: 'Sent an attachment', time: '1d', unread: 0, avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400', isOnline: true },
];

export const ChatAPI = {
  
  // --- CHAT LIST ---
  fetchChatList: async () => {
    await delay(1000); // Simulate loading
    return { success: true, data: MOCK_CHATS };
  },

  archiveChat: async (chatId) => {
    await delay(500);
    console.log(`[API] Archived Chat ${chatId}`);
    return { success: true };
  },

  deleteChat: async (chatId) => {
    await delay(800);
    console.log(`[API] Deleted Chat ${chatId}`);
    return { success: true };
  },

  // --- CHAT DETAILS ---
  fetchHistory: async (userId) => {
    await delay(1000); 
    return {
      success: true,
      data: [
        { id: '1', text: 'Bro, are we still on for the raid tonight?', sender: 'them', type: 'text', time: '10:00 AM', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400', senderName: 'User' },
        { id: '2', text: 'Always. I got the snacks ready 🍕', sender: 'me', type: 'text', time: '10:05 AM' },
        { id: '3', text: 'Lobby opens in 10 mins!', sender: 'them', type: 'text', time: '10:07 AM', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400', senderName: 'User' },
      ]
    };
  },

  sendMessage: async (chatId, content, type = 'text') => {
    await delay(600); 
    // Backend should return the standardized message object
    return {
      success: true,
      data: {
        id: Date.now().toString(),
        text: type === 'image' ? 'Image Sent' : content,
        sender: 'me',
        type: type,
        imageUri: type === 'image' ? content : null, // In real app, this would be a remote URL
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    };
  },

  uploadMedia: async (uri) => {
    await delay(1500); // Simulate upload time (S3/Cloudinary)
    return { success: true, url: uri }; // Return local uri for mock
  },

  deleteMessage: async (messageId) => {
    await delay(500);
    return { success: true };
  },

  // --- SETTINGS ---
  toggleMute: async (userId, isMuted) => {
    await delay(400);
    console.log(`[API] User ${userId} mute status: ${isMuted}`);
    return { success: true };
  },

  blockUser: async (userId) => {
    await delay(1000); // Intentionally slow for dramatic effect
    console.log(`[API] User ${userId} blocked`);
    return { success: true };
  },

  reportUser: async (userId, reason) => {
    await delay(800);
    console.log(`[API] Report sent for ${userId}: ${reason}`);
    return { success: true };
  }
};