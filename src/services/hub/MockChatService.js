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
  { id: '1', type: 'direct', name: 'Jessica Parker', lastMessage: 'See you at the event!', time: '2m', unread: 2, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400', isOnline: true, isMuted: false, disappearingMessages: { enabled: false } },
  { 
    id: '2', 
    type: 'group', 
    name: 'Camping Trip 🏕️', 
    lastMessage: 'David: I brought the tent', 
    time: '1h', 
    unread: 5, 
    isOnline: false, 
    isMuted: false, 
    disappearingMessages: { enabled: false, duration: 86400 },
    // --- NEW: ADDED MEMBERS FOR GROUP CALL ---
    members: [
        { id: '1', name: 'You', avatar: 'https://i.pravatar.cc/150?u=1', isMuted: true, isCameraOn: true },
        { id: '2', name: 'Jane', avatar: 'https://i.pravatar.cc/150?u=2', isMuted: false, isCameraOn: false },
        { id: '3', name: 'John', avatar: 'https://i.pravatar.cc/150?u=3', isMuted: false, isCameraOn: true },
        { id: '4', name: 'Emily', avatar: 'https://i.pravatar.cc/150?u=4', isMuted: true, isCameraOn: false },
    ]
  }, 
  { id: '3', type: 'community', name: 'React Native Devs', lastMessage: 'New version released!', time: '4h', unread: 0, isOnline: false, isMuted: true, disappearingMessages: { enabled: false } },
  { id: '4', type: 'direct', name: 'Mike Ross', lastMessage: 'Sent an attachment', time: '1d', unread: 0, avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400', isOnline: true, isMuted: false, disappearingMessages: { enabled: true, duration: 86400 } },
];

// Updated Message Structure to support Reactions (Array of IDs), Edits, and Deletion
const MOCK_MESSAGES = {
  '1': [
    { 
      id: 'm1-1', 
      text: 'See you at the event!', 
      sender: 'them', 
      type: 'text', 
      time: '10:00 AM', 
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400', 
      senderName: 'Jessica',
      reactions: { '❤️': ['me', 'jessica'] }, 
      isEdited: false 
    },
    { 
      id: 'm1-2', 
      text: 'Sounds good!', 
      sender: 'me', 
      type: 'text', 
      time: '10:05 AM', 
      reactions: {}, 
      isEdited: false 
    },
  ],
  '2': [
    { id: 'm2-1', text: 'I brought the tent', sender: 'them', type: 'text', time: '1h ago', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400', senderName: 'David', reactions: {} },
    { id: 'm2-2', text: 'Awesome, I have the marshmallows!', sender: 'me', type: 'text', time: '59m ago', reactions: { '👍': ['user_3', 'user_4'] } },
  ],
  '4': [
     { id: 'm4-1', text: 'Sent an attachment', sender: 'them', type: 'document', fileName: 'legal_brief.pdf', time: '1d ago', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400', senderName: 'Mike Ross', reactions: {}  }
  ]
};

let MOCK_IN_CALL_MESSAGES = [];


export const ChatAPI = {
  
  fetchChatList: async () => {
    await delay(1000);
    return { success: true, data: MOCK_CHATS };
  },

  createGroup: async (groupName, memberIds) => {
    await delay(1200);
    const allUsers = Object.values(MOCK_ALL_USERS || {});
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
    return { success: true };
  },

  deleteChat: async (chatId) => {
    await delay(800);
    MOCK_CHATS = MOCK_CHATS.filter(c => c.id !== chatId);
    return { success: true };
  },

  fetchHistory: async (chatId) => {
    await delay(600); 
    const history = MOCK_MESSAGES[chatId] || [];
    return { success: true, data: history };
  },

  sendMessage: async (chatId, messageData) => {
    await delay(400); 
    const { content, type, fileName } = messageData;
    const newMessage = {
      id: Date.now().toString(),
      text: content,
      sender: 'me',
      type: type,
      imageUri: type === 'image' ? content : null,
      fileName: type === 'document' ? fileName : null,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      reactions: {},
      isEdited: false,
      isDeleted: false
    };
    if (!MOCK_MESSAGES[chatId]) MOCK_MESSAGES[chatId] = [];
    MOCK_MESSAGES[chatId].unshift(newMessage);
    return { success: true, data: newMessage };
  },

  reactToMessage: async (chatId, messageId, reaction) => {
    await delay(200);
    const msgs = MOCK_MESSAGES[chatId];
    if (!msgs) return { success: false };

    const msg = msgs.find(m => m.id === messageId);
    if (msg) {
        if (!msg.reactions) msg.reactions = {};
        
        if (!Array.isArray(msg.reactions[reaction])) {
            msg.reactions[reaction] = [];
        }

        const userId = 'me';
        const index = msg.reactions[reaction].indexOf(userId);

        if (index > -1) {
            msg.reactions[reaction].splice(index, 1);
            if (msg.reactions[reaction].length === 0) {
                delete msg.reactions[reaction];
            }
        } else {
            msg.reactions[reaction].push(userId);
        }

        return { success: true, data: msg };
    }
    return { success: false };
  },

  editMessage: async (chatId, messageId, newText) => {
    await delay(300);
    const msgs = MOCK_MESSAGES[chatId];
    if (!msgs) return { success: false };

    const msg = msgs.find(m => m.id === messageId);
    if (msg) {
        msg.text = newText;
        msg.isEdited = true;
        return { success: true, data: msg };
    }
    return { success: false };
  },

  deleteMessage: async (chatId, messageId, deleteType) => {
    await delay(300);
    if (!MOCK_MESSAGES[chatId]) return { success: false };

    if (deleteType === 'for_me') {
        MOCK_MESSAGES[chatId] = MOCK_MESSAGES[chatId].filter(m => m.id !== messageId);
        return { success: true, action: 'removed' };
    } else {
        const msg = MOCK_MESSAGES[chatId].find(m => m.id === messageId);
        if (msg) {
            msg.type = 'system'; 
            msg.text = '🚫 This message was deleted';
            msg.isDeleted = true;
            msg.imageUri = null;
            msg.fileName = null;
            return { success: true, action: 'updated', data: msg };
        }
    }
    return { success: false };
  },
  
  // --- NEW FUNCTION: FETCH GROUP CALL PARTICIPANTS ---
  fetchGroupCallParticipants: async (chatId) => {
      await delay(700);
      const chat = MOCK_CHATS.find(c => c.id === chatId);
      if (chat && chat.type === 'group' && chat.members) {
          return { success: true, data: chat.members };
      }
      return { success: false, message: 'Group not found or no members' };
  },

  fetchFriendsForCall: async (chatId) => {
    await delay(500);
    const chat = MOCK_CHATS.find(c => c.id === chatId);
    // If we are in a call, we need the current list of people IN the call
    // For this mock, we assume chat.members ARE the people in the call
    const currentMemberIds = chat ? chat.members.map(m => m.id) : [];
    
    // Also exclude 'me' (id: '1') explicitly if not already in the list
    const excludeIds = [...currentMemberIds, '1'];

    const availableFriends = Object.values(MOCK_ALL_USERS)
        .filter(u => !excludeIds.includes(u.id)) 
        .map(u => ({ id: u.id, name: u.name, avatar: u.avatarUrl }));
        
    return { success: true, data: availableFriends };
  },

  addParticipantsToGroupCall: async (chatId, newUserIds) => {
    await delay(800);
    const chat = MOCK_CHATS.find(c => c.id === chatId);
    if (!chat) return { success: false };

    const newMembers = newUserIds.map(id => {
        const user = MOCK_ALL_USERS[id]; // Assuming MOCK_ALL_USERS is accessible
        return {
            id: user.id,
            name: user.name,
            avatar: user.avatarUrl,
            isMuted: true,
            isCameraOn: false 
        };
    });
    
    // Add to local mock state so subsequent fetches see them
    chat.members.push(...newMembers);
    
    return { success: true, data: chat.members };
  },

  // --- NEW: Ephemeral In-Call Chat Functions ---
  sendInCallMessage: async (text) => {
      await delay(200);
      const newMsg = {
          id: `incall_${Date.now()}`,
          text,
          sender: 'me',
          senderName: 'You',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      MOCK_IN_CALL_MESSAGES.push(newMsg);
      return { success: true, data: newMsg };
  },

  // In a real app, you might use a socket. This mock just returns the array.
  getInCallMessages: () => {
      return MOCK_IN_CALL_MESSAGES;
  },

  clearInCallMessages: () => {
      MOCK_IN_CALL_MESSAGES = [];
  },
  // ---------------------------------------------------

  clearHistory: async (chatId) => {
    await delay(800);
    MOCK_MESSAGES[chatId] = [];
    return { success: true };
  },

  toggleMute: async (chatId, isMuted) => {
    await delay(400);
    const chat = MOCK_CHATS.find(c => c.id === chatId);
    if(chat) chat.isMuted = isMuted;
    return { success: true };
  },

  blockUser: async (userId) => {
    await delay(1000);
    MOCK_CHATS = MOCK_CHATS.filter(c => c.id !== userId);
    return { success: true };
  },

  reportUser: async (userId, reason) => {
    await delay(800);
    return { success: true };
  },
  
  leaveGroup: async (chatId) => {
    await delay(1200);
    MOCK_CHATS = MOCK_CHATS.filter(c => c.id !== chatId);
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
    return { success: true, data: MOCK_CHATS[chatIndex] };
  },

  fetchFriends: async () => {
    await delay(600);
    const users = Object.values(MOCK_ALL_USERS || {})
        .filter(u => u.id !== 'usr_a1b2c3d4e5f6g7h8')
        .map(u => ({ ...u, avatar: u.avatarUrl }));
    return { success: true, data: users };
  },

  addMembersToGroup: async (chatId, newMemberIds) => {
    await delay(1000);
    const chat = MOCK_CHATS.find(c => c.id === chatId);
    if (chat) {
      const allUsers = Object.values(MOCK_ALL_USERS || {});
      const newMembers = newMemberIds.map(id => {
          const user = allUsers.find(u => u.id === id);
          return user ? { ...user, avatar: user.avatarUrl } : null;
      }).filter(Boolean);
      
      let currentMembers = chat.members || [];
      const currentMemberIds = currentMembers.map(m => m.id || m); 
      const uniqueNewMembers = newMembers.filter(m => !currentMemberIds.includes(m.id));
      
      chat.members = [...currentMembers, ...uniqueNewMembers];
      return { success: true, data: chat.members };
    }
    return { success: false, message: 'Chat not found' };
  },

  updateGroupProfile: async (chatId, updates) => {
    await delay(800);
    const chat = MOCK_CHATS.find(c => c.id === chatId);
    if (chat) {
        if (updates.name) chat.name = updates.name;
        if (updates.avatar) chat.avatar = updates.avatar;
        return { success: true, data: chat };
    }
    return { success: false, message: 'Chat not found' };
  },

  removeMemberFromGroup: async (chatId, userId) => {
    await delay(1000);
    const chat = MOCK_CHATS.find(c => c.id === chatId);
    if (chat) {
        chat.members = chat.members.filter(m => (m.id || m) !== userId);
        return { success: true, data: chat.members };
    }
    return { success: false };
  },

  setMemberNickname: async (chatId, userId, nickname) => {
    await delay(500);
    const chat = MOCK_CHATS.find(c => c.id === chatId);
    if(chat) {
       const memberIndex = chat.members.findIndex(m => (m.id || m) === userId);
       if(memberIndex > -1) {
           if(typeof chat.members[memberIndex] === 'string') {
               chat.members[memberIndex] = { id: chat.members[memberIndex], name: chat.members[memberIndex] };
           }
           chat.members[memberIndex].nickname = nickname;
       }
       return { success: true };
    }
    return { success: false };
  },
};