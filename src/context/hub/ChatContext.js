import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { ChatAPI } from '@api/hub/MockChatService';

const ChatContext = createContext();

export const useChat = () => {
    const context = useContext(ChatContext);
    if (!context) throw new Error('useChat must be used within a ChatProvider');
    return context;
};

export const ChatProvider = ({ children }) => {
    const [chats, setChats] = useState([]);
    const [isLoadingChats, setIsLoadingChats] = useState(true);
    const [messages, setMessages] = useState({});
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);

    const updateChatInList = useCallback((chatId, updates) => {
        setChats(prev => prev.map(c => c.id === chatId ? { ...c, ...updates } : c));
    }, []);

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

    const pinChat = useCallback((chatId) => {
        const chat = chats.find(c => c.id === chatId);
        if (!chat) return;
        const isPinned = !chat.pinned;
        updateChatInList(chatId, { pinned: isPinned });
    }, [chats, updateChatInList]);

    const deleteChat = useCallback(async (chatId) => {
        const prevChats = chats;
        setChats(prev => prev.filter(c => c.id !== chatId));
        try { await ChatAPI.deleteChat(chatId); } catch (e) { setChats(prevChats); }
    }, [chats]);
    
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
        const newMessage = { 
            id: tempId, text: content, sender: 'me', type, time: 'sending...', 
            imageUri: type === 'image' ? content : null, fileName,
            reactions: {}, isEdited: false
        };
        setMessages(prev => ({ ...prev, [chatId]: [newMessage, ...(prev[chatId] || [])] }));
        try {
            const response = await ChatAPI.sendMessage(chatId, { content, type, fileName });
            if (response.success) {
                 setMessages(prev => ({ ...prev, [chatId]: prev[chatId].map(m => m.id === tempId ? response.data : m) }));
                 const lastMessageText = type === 'image' ? 'Sent an image' : type === 'document' ? fileName : content;
                 updateChatInList(chatId, { lastMessage: lastMessageText, time: response.data.time });
            } else { throw new Error('API Error'); }
        } catch(e) {
             setMessages(prev => ({ ...prev, [chatId]: prev[chatId].map(m => m.id === tempId ? {...m, time: 'failed'} : m) }));
        }
    }, [updateChatInList]);

    // --- NEW ACTIONS: React, Edit, Delete ---

    const reactToMessage = useCallback(async (chatId, messageId, reaction) => {
        // Optimistic Update with Toggle Logic
        setMessages(prev => ({
            ...prev,
            [chatId]: prev[chatId].map(m => {
                if (m.id === messageId) {
                    const currentReactions = m.reactions?.[reaction] || [];
                    const userId = 'me'; // Current user
                    
                    let newReactionList;
                    if (currentReactions.includes(userId)) {
                        // User already reacted: Remove them (Toggle Off)
                        newReactionList = currentReactions.filter(id => id !== userId);
                    } else {
                        // User hasn't reacted: Add them (Toggle On)
                        newReactionList = [...currentReactions, userId];
                    }

                    const newReactionsObj = { ...m.reactions };
                    
                    if (newReactionList.length > 0) {
                        newReactionsObj[reaction] = newReactionList;
                    } else {
                        // If no one is left reacting, remove the key
                        delete newReactionsObj[reaction];
                    }

                    return { ...m, reactions: newReactionsObj };
                }
                return m;
            })
        }));
        await ChatAPI.reactToMessage(chatId, messageId, reaction);
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
            // Delete for everyone (convert to system message)
            setMessages(prev => ({
                ...prev,
                [chatId]: prev[chatId].map(m => m.id === messageId ? { 
                    ...m, type: 'system', text: '🚫 This message was deleted', isDeleted: true, imageUri: null 
                } : m)
            }));
        }
        await ChatAPI.deleteMessage(chatId, messageId, deleteType);
    }, []);

    // ----------------------------------------

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
        try {
            await ChatAPI.toggleMute(chatId, newState);
            return newState;
        } catch (e) {
            updateChatInList(chatId, { isMuted: currentState });
            throw e;
        }
    }, [updateChatInList]);

    const blockUser = useCallback(async (chatId) => {
        const prevChats = chats;
        setChats(prev => prev.filter(c => c.id !== chatId));
        try { await ChatAPI.blockUser(chatId); } catch(e) { setChats(prevChats); }
    }, [chats]);

    const reportUser = useCallback(async (chatId, reason) => {
        await ChatAPI.reportUser(chatId, reason);
    }, []);

    const leaveGroup = useCallback(async (chatId) => {
        const prevChats = chats;
        setChats(prev => prev.filter(c => c.id !== chatId)); 
        try { await ChatAPI.leaveGroup(chatId); } 
        catch (e) { setChats(prevChats); throw e; }
    }, [chats]);

    const addMembersToGroup = useCallback(async (chatId, memberIds) => {
        try {
            const response = await ChatAPI.addMembersToGroup(chatId, memberIds);
            if (response.success) {
                updateChatInList(chatId, { members: response.data });
                return response.data;
            } else {
                throw new Error('Failed to add members');
            }
        } catch (e) { throw e; }
    }, [updateChatInList]);

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

    const updateGroupInfo = useCallback(async (chatId, updates) => {
        try {
            const response = await ChatAPI.updateGroupProfile(chatId, updates);
            if (response.success) {
                updateChatInList(chatId, updates);
                return response.data;
            }
            throw new Error('Failed to update group info');
        } catch (e) { throw e; }
    }, [updateChatInList]);

    const kickMember = useCallback(async (chatId, userId) => {
        try {
            const response = await ChatAPI.removeMemberFromGroup(chatId, userId);
            if(response.success) {
                updateChatInList(chatId, { members: response.data });
                return true;
            }
            return false;
        } catch(e) { throw e; }
    }, [updateChatInList]);

    const setNickname = useCallback(async (chatId, userId, nickname) => {
        await ChatAPI.setMemberNickname(chatId, userId, nickname);
    }, []);
    
    const value = useMemo(() => ({
        chats, isLoadingChats, messages, isLoadingMessages, currentMessages,
        loadChats, pinChat, deleteChat, createGroupChat, loadMessages, sendMessage,
        toggleReadStatus, archiveChat, toggleMute, blockUser, reportUser, clearChatHistory,
        leaveGroup, setDisappearingMessages, addMembersToGroup, updateGroupInfo, kickMember, setNickname,
        reactToMessage, editMessage, deleteMessage 
    }), [
        chats, isLoadingChats, messages, isLoadingMessages,
        loadChats, pinChat, deleteChat, createGroupChat, loadMessages, sendMessage,
        toggleReadStatus, archiveChat, toggleMute, blockUser, reportUser, clearChatHistory,
        leaveGroup, setDisappearingMessages, addMembersToGroup, updateGroupInfo, kickMember, setNickname,
        reactToMessage, editMessage, deleteMessage
    ]);

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
};