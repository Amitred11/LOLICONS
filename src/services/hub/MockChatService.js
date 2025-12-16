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
  { id: '1', type: 'direct', pinned: false, name: 'Jessica Parker', lastMessage: 'See you at the event!', time: '2m', unread: 2, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400', isOnline: true, isMuted: false, disappearingMessages: { enabled: false } },
  { 
    id: '2', 
    type: 'group', 
    pinned: true, // Example of a pinned chat
    name: 'Camping Trip 🏕️', 
    lastMessage: 'David: I brought the tent', 
    time: '1h', 
    unread: 5, 
    isOnline: false, 
    isMuted: false, 
    disappearingMessages: { enabled: false, duration: 86400 },
    members: [
        { id: '1', name: 'You', avatar: 'https://i.pravatar.cc/150?u=1', isMuted: true, isCameraOn: true },
        { id: '2', name: 'Jane', avatar: 'https://i.pravatar.cc/150?u=2', isMuted: false, isCameraOn: false },
        { id: '3', name: 'John', avatar: 'https://i.pravatar.cc/150?u=3', isMuted: false, isCameraOn: true },
        { id: '4', name: 'Emily', avatar: 'https://i.pravatar.cc/150?u=4', isMuted: true, isCameraOn: false },
    ]
  }, 
  { id: '3', type: 'community', pinned: false, name: 'React Native Devs', lastMessage: 'New version released!', time: '4h', unread: 0, isOnline: false, isMuted: true, disappearingMessages: { enabled: false } },
  { id: '4', type: 'direct', pinned: false, name: 'Mike Ross', lastMessage: 'Sent an attachment', time: '1d', unread: 0, avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400', isOnline: true, isMuted: false, disappearingMessages: { enabled: true, duration: 86400 } },
];

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
      isEdited: false,
      isPinned: false
    },
    { 
      id: 'm1-2', 
      text: 'Sounds good!', 
      sender: 'me', 
      type: 'text', 
      time: '10:05 AM', 
      reactions: {}, 
      isEdited: false,
      isPinned: true // Example pinned message
    },
  ],
  '2': [
    { id: 'm2-1', text: 'I brought the tent', sender: 'them', type: 'text', time: '1h ago', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400', senderName: 'David', reactions: {}, isPinned: false },
    { id: 'm2-2', text: 'Awesome, I have the marshmallows!', sender: 'me', type: 'text', time: '59m ago', reactions: { '👍': ['user_3', 'user_4'] }, isPinned: false },
  ],
  '4': [
     { id: 'm4-1', text: 'Sent an attachment', sender: 'them', type: 'document', fileName: 'legal_brief.pdf', time: '1d ago', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400', senderName: 'Mike Ross', reactions: {}, isPinned: false  }
  ]
};

let MOCK_IN_CALL_MESSAGES = [];


export const ChatAPI = {
  
  fetchChatList: async () => {
    await delay(1000);
    // Sort pinned chats to top
    const sortedChats = [...MOCK_CHATS].sort((a, b) => (b.pinned === a.pinned) ? 0 : b.pinned ? 1 : -1);
    return { success: true, data: sortedChats };
  },

  // --- ADDED: PIN CHAT ---
  pinChat: async (chatId, isPinned) => {
      await delay(300);
      const chat = MOCK_CHATS.find(c => c.id === chatId);
      if (chat) {
          chat.pinned = isPinned;
          return { success: true };
      }
      return { success: false };
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
      pinned: false,
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
      isDeleted: false,
      isPinned: false
    };
    if (!MOCK_MESSAGES[chatId]) MOCK_MESSAGES[chatId] = [];
    MOCK_MESSAGES[chatId].unshift(newMessage);
    
    // Update Chat List
    const chat = MOCK_CHATS.find(c => c.id === chatId);
    if(chat) {
        chat.lastMessage = type === 'text' ? content : (type === 'image' ? '📷 Photo' : 'New Message');
        chat.time = newMessage.time;
    }

    return { success: true, data: newMessage };
  },

  // --- ADDED: CREATE POLL ---
  createPoll: async (chatId, { question, options }) => {
    await delay(600);
    
    const pollData = {
        question,
        options: options.map((opt, index) => ({ 
            id: index, 
            text: opt, 
            votes: 0, 
            voters: [] 
        })),
        totalVotes: 0,
        hasEnded: false
    };

    const newMessage = {
        id: `poll_${Date.now()}`,
        sender: 'me',
        type: 'poll',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        poll: pollData,
        reactions: {},
        isPinned: false
    };

    if (!MOCK_MESSAGES[chatId]) MOCK_MESSAGES[chatId] = [];
    MOCK_MESSAGES[chatId].unshift(newMessage);

    // Update Chat List Preview
    const chat = MOCK_CHATS.find(c => c.id === chatId);
    if(chat) {
        chat.lastMessage = `📊 Poll: ${question}`;
        chat.time = newMessage.time;
    }

    return { success: true, data: newMessage };
  },

  addPollOption: async (chatId, messageId, optionText) => {
      await delay(400);
      const msgs = MOCK_MESSAGES[chatId];
      if (!msgs) return { success: false };

      const msg = msgs.find(m => m.id === messageId);
      if (msg && msg.type === 'poll') {
          const newId = msg.poll.options.length; // Simple ID generation
          const newOption = {
              id: newId,
              text: optionText,
              votes: 0,
              voters: []
          };
          msg.poll.options.push(newOption);
          return { success: true, data: msg };
      }
      return { success: false, message: 'Message not found' };
  },

  votePoll: async (chatId, messageId, optionId) => {
    await delay(200);
    const msgs = MOCK_MESSAGES[chatId];
    if (!msgs) return { success: false };

    const msg = msgs.find(m => m.id === messageId);
    if (msg && msg.type === 'poll') {
        const userId = 'me';
        // Mocking user details for the voter list
        const userDetails = { id: 'me', name: 'You', avatar: null };

        // Logic: Single Choice for this mock
        msg.poll.options.forEach(opt => {
            const voterIndex = opt.voters.findIndex(v => v.id === userId);

            if (opt.id === optionId) {
                // If already voted, remove (toggle)
                if (voterIndex > -1) {
                    opt.voters.splice(voterIndex, 1);
                    opt.votes--;
                } else {
                    // Add vote
                    opt.voters.push(userDetails);
                    opt.votes++;
                }
            } else {
                // Remove vote from others (Single Choice)
                if (voterIndex > -1) {
                    opt.voters.splice(voterIndex, 1);
                    opt.votes--;
                }
            }
        });

        msg.poll.totalVotes = msg.poll.options.reduce((acc, curr) => acc + curr.votes, 0);
        return { success: true, data: msg };
    }
    return { success: false };
  },

  // --- ADDED: PIN MESSAGE ---
  pinMessage: async (chatId, messageId) => {
      await delay(300);
      const msgs = MOCK_MESSAGES[chatId];
      if (!msgs) return { success: false };

      const msg = msgs.find(m => m.id === messageId);
      if (msg) {
          msg.isPinned = !msg.isPinned;
          return { success: true, data: msg };
      }
      return { success: false };
  },

  // --- ADDED: REPORT MESSAGE ---
  reportMessage: async (chatId, messageId, reason) => {
      await delay(500);
      console.log(`[MOCK] Message ${messageId} in chat ${chatId} reported for: ${reason}`);
      return { success: true };
  },

  reactToMessage: async (chatId, messageId, reaction) => {
    await delay(200);
    const msgs = MOCK_MESSAGES[chatId];
    if (!msgs) return { success: false };

    const msg = msgs.find(m => m.id === messageId);
    if (msg) {
        if (!msg.reactions) msg.reactions = {};
        
        // Ensure array exists
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
            // Remove 'me' from any other reaction (Single Reaction Logic)
            Object.keys(msg.reactions).forEach(key => {
                msg.reactions[key] = msg.reactions[key].filter(id => id !== userId);
                if(msg.reactions[key].length === 0) delete msg.reactions[key];
            });
            // Add new reaction
            if(!msg.reactions[reaction]) msg.reactions[reaction] = [];
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
            msg.poll = null; // Clear poll data if deleted
            return { success: true, action: 'updated', data: msg };
        }
    }
    return { success: false };
  },
  
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
    const currentMemberIds = chat ? (chat.members || []).map(m => m.id) : [];
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
        const user = MOCK_ALL_USERS[id]; 
        return {
            id: user.id,
            name: user.name,
            avatar: user.avatarUrl,
            isMuted: true,
            isCameraOn: false 
        };
    });
    
    chat.members.push(...newMembers);
    return { success: true, data: chat.members };
  },

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

  getInCallMessages: () => {
      return MOCK_IN_CALL_MESSAGES;
  },

  clearInCallMessages: () => {
      MOCK_IN_CALL_MESSAGES = [];
  },

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