import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { ChatAPI } from '@api/hub/MockChatService';

const ChatContext = createContext();

export const useChat = () => {
    const context = useContext(ChatContext);
    if (!context) throw new Error('useChat must be used within a ChatProvider');
    return context;
}; 

export const ChatProvider = ({ children }) => {
    // --- STATE ---
    const [chats, setChats] = useState([]);
    const [isLoadingChats, setIsLoadingChats] = useState(true);
    const [messages, setMessages] = useState({});
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [callableFriends, setCallableFriends] = useState([]);
    const [isLoadingFriends, setIsLoadingFriends] = useState(false);
    const [inCallMessages, setInCallMessages] = useState([]);
    const [groupCallParticipants, setGroupCallParticipants] = useState([]);

    // --- CHAT LIST MANAGEMENT ---

    const loadChats = useCallback(async (isRefresh = false) => {
        if (!isRefresh) setIsLoadingChats(true);
        try {
            const response = await ChatAPI.fetchChatList();
            if (response.success) setChats(response.data);
        } catch (error) {
            console.error("ChatContext: Load Chats Error", error);
        } finally {
            if (!isRefresh) setIsLoadingChats(false);
        }
    }, []);

    const updateChatInList = useCallback((chatId, updates) => {
        setChats(prev => prev.map(c => c.id === chatId ? { ...c, ...updates } : c));
    }, []);

    const pinChat = useCallback((chatId) => {
        const chat = chats.find(c => c.id === chatId);
        if (!chat) return;
        const isPinned = !chat.pinned;
        updateChatInList(chatId, { pinned: isPinned });
        ChatAPI.pinChat(chatId, isPinned).catch(e => console.error(e));
    }, [chats, updateChatInList]);

    const deleteChat = useCallback(async (chatId) => {
        const prevChats = chats;
        setChats(prev => prev.filter(c => c.id !== chatId));
        try { await ChatAPI.deleteChat(chatId); } catch (e) { setChats(prevChats); }
    }, [chats]);

    const createGroupChat = useCallback(async (groupName, memberIds) => {
        const tempId = `temp_${Date.now()}`;
        const placeholder = { id: tempId, type: 'group', name: groupName, lastMessage: 'Creating group...', time: 'now', unread: 0 };
        setChats(prev => [placeholder, ...prev]);
        try {
            const response = await ChatAPI.createGroup(groupName, memberIds);
            if (response.success) {
                setChats(prev => prev.map(c => c.id === tempId ? response.data : c));
                return response;
            }
            throw new Error(response.message || 'API Error');
        } catch (error) {
            setChats(prev => prev.filter(c => c.id !== tempId));
            throw error;
        }
    }, []);

    // --- MESSAGE LOGIC ---

    const loadMessages = useCallback(async (chatId) => {
        setIsLoadingMessages(true);
        try {
            const response = await ChatAPI.fetchHistory(chatId);
            if (response.success) setMessages(prev => ({ ...prev, [chatId]: response.data }));
        } catch (error) {
            console.error("ChatContext: Load Messages Error", error);
        } finally {
            setIsLoadingMessages(false);
        }
    }, []);

    const sendMessage = useCallback(async (chatId, content, type, fileName) => {
       const tempId = `temp_msg_${Date.now()}`;
        const newMessage = { id: tempId, text: content, sender: 'me', type, time: 'sending...', senderName: 'You', imageUri: type === 'image' ? content : null, fileName, reactions: {}, isEdited: false, isPinned: false };
        setMessages(prev => ({ ...prev, [chatId]: [newMessage, ...(prev[chatId] || [])] }));

        try {
            const response = await ChatAPI.sendMessage(chatId, { content, type, fileName });
            if (response.success) {
                 setMessages(prev => ({ ...prev, [chatId]: prev[chatId].map(m => m.id === tempId ? response.data : m) }));
                let lastMessageText;
                switch (type) {
                    case 'image': lastMessageText = '📷 Photo'; break;
                    case 'document': lastMessageText = `📄 ${fileName || 'File'}`; break;
                    case 'poll': lastMessageText = '📊 Poll'; break;
                    case 'call_log': lastMessageText = '📞 Call info'; break;
                    default: lastMessageText = content.length > 35 ? content.substring(0, 35) + '...' : content;
                }
                updateChatInList(chatId, { lastMessage: lastMessageText, time: response.data.time });
            }
        } catch(e) {
             setMessages(prev => ({ ...prev, [chatId]: prev[chatId].map(m => m.id === tempId ? {...m, time: 'failed'} : m) }));
        }
    }, [updateChatInList]);

    const createPollMessage = useCallback(async (chatId, question, options) => {
        const tempId = `temp_poll_${Date.now()}`;
        const pollData = { question, options: options.map((opt, index) => ({ id: index, text: opt, votes: 0, voters: [] })), totalVotes: 0, hasEnded: false };
        const newMessage = { id: tempId, type: 'poll', sender: 'me', senderName: 'You', time: 'sending...', poll: pollData, reactions: {} };
        setMessages(prev => ({ ...prev, [chatId]: [newMessage, ...(prev[chatId] || [])] }));
       try {
           const response = await ChatAPI.createPoll(chatId, { question, options });
           if(response.success) {
               setMessages(prev => ({ ...prev, [chatId]: prev[chatId].map(m => m.id === tempId ? response.data : m) }));
               updateChatInList(chatId, { lastMessage: `📊 Poll: ${question}`, time: response.data.time });
           }
       } catch (e) { console.error("Failed to create poll", e); }
    }, [updateChatInList]);

    const reactToMessage = useCallback(async (chatId, messageId, newEmoji) => {
        const userId = 'me';
        setMessages(prev => {
            const chatMessages = prev[chatId] || [];
            return {
                ...prev,
                [chatId]: chatMessages.map(m => {
                    if (m.id !== messageId) return m;

                    let reactions = { ...(m.reactions || {}) };
                    const myExistingReaction = Object.keys(reactions).find(emoji => reactions[emoji].includes(userId));

                    if (myExistingReaction) {
                        reactions[myExistingReaction] = reactions[myExistingReaction].filter(id => id !== userId);
                        if (reactions[myExistingReaction].length === 0) {
                            delete reactions[myExistingReaction];
                        }
                    }

                    if (myExistingReaction !== newEmoji) {
                        reactions[newEmoji] = [...(reactions[newEmoji] || []), userId];
                    }

                    return { ...m, reactions };
                })
            };
        });
        await ChatAPI.reactToMessage(chatId, messageId, newEmoji);
    }, []);

    const addNewPollOption = useCallback(async (chatId, messageId, optionText) => {
        setMessages(prev => ({
            ...prev,
            [chatId]: (prev[chatId] || []).map(m => {
                if (m.id === messageId && m.type === 'poll') {
                    const newOpt = { id: m.poll.options.length, text: optionText, votes: 0, voters: [] };
                    return { ...m, poll: { ...m.poll, options: [...m.poll.options, newOpt] } };
                }
                return m;
            })
        }));
        try {
            await ChatAPI.addPollOption(chatId, messageId, optionText);
        } catch (e) { console.error("Failed to add option", e); loadMessages(chatId); }
    }, [loadMessages]);

    const votePoll = useCallback(async (chatId, messageId, optionId) => {
        const userId = 'me';
        const userDetails = { id: 'me', name: 'You', avatar: null };

        setMessages(prev => {
            const chatMessages = prev[chatId] || [];
            return {
                ...prev,
                [chatId]: chatMessages.map(m => {
                    if (m.id !== messageId || m.type !== 'poll') return m;

                    const poll = { ...m.poll };
                    const myCurrentVoteOption = poll.options.find(opt => opt.voters && opt.voters.some(v => v.id === userId));

                    poll.options = poll.options.map(opt => {
                        let voters = (opt.voters || []).filter(v => v.id !== userId);
                        if (opt.id === optionId && (!myCurrentVoteOption || myCurrentVoteOption.id !== optionId)) {
                            voters.push(userDetails);
                        }
                        return { ...opt, voters, votes: voters.length };
                    });

                    poll.totalVotes = poll.options.reduce((acc, curr) => acc + curr.votes, 0);
                    return { ...m, poll };
                })
            };
        });
        await ChatAPI.votePoll(chatId, messageId, optionId);
    }, []);

    const pinMessage = useCallback(async (chatId, messageId) => {
        setMessages(prev => ({
            ...prev,
            [chatId]: prev[chatId].map(m => m.id === messageId ? { ...m, isPinned: !m.isPinned } : m)
        }));
        await ChatAPI.pinMessage(chatId, messageId);
    }, []);

    const reportMessage = useCallback(async (chatId, messageId, reason) => {
        try { await ChatAPI.reportMessage(chatId, messageId, reason); } 
        catch (error) { console.error("Report failed", error); }
    }, []);

    const editMessage = useCallback(async (chatId, messageId, newText) => {
        setMessages(prev => ({
            ...prev,
            [chatId]: prev[chatId].map(m => m.id === messageId ? { ...m, text: newText, isEdited: true } : m)
        }));
        await ChatAPI.editMessage(chatId, messageId, newText);
    }, []);

    const deleteMessage = useCallback(async (chatId, messageId, deleteType) => {
        if (deleteType === 'for_me') {
            setMessages(prev => ({
                ...prev,
                [chatId]: prev[chatId].filter(m => m.id !== messageId)
            }));
        } else {
            setMessages(prev => ({
                ...prev,
                [chatId]: prev[chatId].map(m => {
                    if (m.id === messageId) {
                        return { 
                            ...m, 
                            type: 'system',
                            isDeleted: true,
                            text: m.sender === 'me' ? "You deleted this message" : "This message was deleted", 
                            imageUri: null,
                            poll: null,
                            reactions: {}
                        };
                    }
                    return m;
                })
            }));
        }
        await ChatAPI.deleteMessage(chatId, messageId, deleteType);
    }, []);

    const toggleReadStatus = useCallback((chatId) => {
        const chat = chats.find(c => c.id === chatId);
        if (chat) updateChatInList(chatId, { unread: chat.unread > 0 ? 0 : 1 });
    }, [chats, updateChatInList]);

    const archiveChat = useCallback(async (chatId) => {
        const prevChats = chats;
        setChats(prev => prev.filter(c => c.id !== chatId));
        try { await ChatAPI.archiveChat(chatId); } 
        catch (error) { setChats(prevChats); throw error; }
    }, [chats]);
    
    const clearChatHistory = useCallback(async (chatId) => {
        const prevMessages = messages[chatId] || [];
        setMessages(prev => ({ ...prev, [chatId]: [] }));
        updateChatInList(chatId, { lastMessage: 'Chat history cleared' });
        try { await ChatAPI.clearHistory(chatId); }
        catch(e) { setMessages(prev => ({...prev, [chatId]: prevMessages})); }
    }, [messages, updateChatInList]);

    const toggleMute = useCallback(async (chatId, currentState) => {
        const newState = !currentState;
        updateChatInList(chatId, { isMuted: newState });
        try { await ChatAPI.toggleMute(chatId, newState); return newState; } 
        catch (e) { updateChatInList(chatId, { isMuted: currentState }); throw e; }
    }, [updateChatInList]);

    const blockUser = useCallback(async (chatId) => {
        const prevChats = chats;
        setChats(prev => prev.filter(c => c.id !== chatId));
        try { await ChatAPI.blockUser(chatId); } catch(e) { setChats(prevChats); }
    }, [chats]);

    const reportUser = useCallback(async (chatId, reason) => {
        await ChatAPI.reportUser(chatId, reason);
    }, []);

    // --- CALL RELATED ---
    
    const loadCallableFriends = useCallback(async (chatId) => {
        setIsLoadingFriends(true);
        try {
            const response = await ChatAPI.fetchFriendsForCall(chatId);
            if (response.success) setCallableFriends(response.data);
        } catch (error) { console.error("ChatContext: Load Friends Error", error); } 
        finally { setIsLoadingFriends(false); }
    }, []);

    const addParticipantsToCall = useCallback(async (chatId, newUserIds) => {
        const newParticipants = newUserIds.map(id => {
            const friend = callableFriends.find(f => f.id === id);
            return { ...friend, isMuted: true, isCameraOn: false };
        });
        setGroupCallParticipants(prev => [...prev, ...newParticipants]);
        try {
            const response = await ChatAPI.addParticipantsToGroupCall(chatId, newUserIds);
            if (response.success) setGroupCallParticipants(response.data);
        } catch (error) { console.error("ChatContext: Add Participants Error", error); }
    }, [callableFriends]);

    const loadGroupCallParticipants = useCallback(async (chatId) => {
        try {
            const response = await ChatAPI.fetchGroupCallParticipants(chatId);
            if(response.success) setGroupCallParticipants(response.data);
            else setGroupCallParticipants([]);
        } catch (error) { setGroupCallParticipants([]); }
    }, []);

    const sendInCallMessage = useCallback(async (text) => {
        const tempMsg = { id: `temp_${Date.now()}`, text, sender: 'me', senderName: 'You', time: 'now' };
        setInCallMessages(prev => [tempMsg, ...prev]);
        try {
            const response = await ChatAPI.sendInCallMessage(text);
            if (response.success) setInCallMessages(prev => prev.map(m => m.id === tempMsg.id ? response.data : m));
        } catch (error) { console.error("Failed to send in-call message"); }
    }, []);

    const clearInCallSession = useCallback(() => {
        setInCallMessages([]);
        ChatAPI.clearInCallMessages();
    }, []);

    // --- GROUP MANAGEMENT ---
    
    const leaveGroup = useCallback(async (chatId) => {
        const prevChats = chats;
        setChats(prev => prev.filter(c => c.id !== chatId)); 
        try { await ChatAPI.leaveGroup(chatId); } 
        catch (e) { setChats(prevChats); throw e; }
    }, [chats]);

    const addMembersToGroup = useCallback(async (chatId, memberIds) => {
        try {
            const response = await ChatAPI.addMembersToGroup(chatId, memberIds);
            if (response.success) { updateChatInList(chatId, { members: response.data }); return response.data; }
            else throw new Error('Failed to add members');
        } catch (e) { throw e; }
    }, [updateChatInList]);

    const updateGroupInfo = useCallback(async (chatId, updates) => {
        try {
            const response = await ChatAPI.updateGroupProfile(chatId, updates);
            if (response.success) { updateChatInList(chatId, updates); return response.data; }
            throw new Error('Failed to update group info');
        } catch (e) { throw e; }
    }, [updateChatInList]);

    const kickMember = useCallback(async (chatId, userId) => {
        try {
            const response = await ChatAPI.removeMemberFromGroup(chatId, userId);
            if(response.success) { updateChatInList(chatId, { members: response.data }); return true; }
            return false;
        } catch(e) { throw e; }
    }, [updateChatInList]);

    const setNickname = useCallback(async (chatId, userId, nickname) => {
        await ChatAPI.setMemberNickname(chatId, userId, nickname);
    }, []);

    const setDisappearingMessages = useCallback(async (chatId, newState) => {
        const currentChat = chats.find(c => c.id === chatId);
        const originalState = currentChat.disappearingMessages.enabled;
        updateChatInList(chatId, { disappearingMessages: { ...currentChat.disappearingMessages, enabled: newState }});
        try {
            await ChatAPI.updateChatSettings(chatId, { disappearingMessages: newState });
            return newState;
        } catch (e) {
            updateChatInList(chatId, { disappearingMessages: { ...currentChat.disappearingMessages, enabled: originalState }}); 
            throw e;
        }
    }, [chats, updateChatInList]);

    const currentMessages = useCallback((chatId) => messages[chatId] || [], [messages]);
    
    // --- EXPORTS ---

    const value = useMemo(() => ({
        chats, isLoadingChats, messages, isLoadingMessages, currentMessages,
        loadChats, pinChat, deleteChat, createGroupChat, loadMessages, sendMessage,
        toggleReadStatus, archiveChat, toggleMute, blockUser, reportUser, clearChatHistory,
        leaveGroup, setDisappearingMessages, addMembersToGroup, updateGroupInfo, kickMember, setNickname,
        editMessage, deleteMessage,
        // Refactored/New Logic:
        reactToMessage, 
        createPollMessage,
        addNewPollOption,
        votePoll,
        pinMessage,
        reportMessage,
        // Call Logic:
        groupCallParticipants, loadGroupCallParticipants, callableFriends,
        isLoadingFriends, loadCallableFriends, addParticipantsToCall,
        inCallMessages, sendInCallMessage, clearInCallSession,
    }), [
        chats, isLoadingChats, messages, isLoadingMessages, currentMessages,
        loadChats, pinChat, deleteChat, createGroupChat, loadMessages, sendMessage,
        toggleReadStatus, archiveChat, toggleMute, blockUser, reportUser, clearChatHistory,
        leaveGroup, setDisappearingMessages, addMembersToGroup, updateGroupInfo, kickMember, setNickname,
        editMessage, deleteMessage, reactToMessage, createPollMessage, addNewPollOption, votePoll, pinMessage, reportMessage,
        groupCallParticipants, loadGroupCallParticipants, callableFriends,
        isLoadingFriends, loadCallableFriends, addParticipantsToCall,
        inCallMessages, sendInCallMessage, clearInCallSession,
    ]);

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
};