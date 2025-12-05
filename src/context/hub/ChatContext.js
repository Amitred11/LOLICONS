import React, { createContext, useContext, useState, useCallback } from 'react';
import { ChatAPI } from '@api/hub/MockChatService';

const ChatContext = createContext();

export const useChat = () => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChat must be used within a ChatProvider');
    }
    return context;
};

export const ChatProvider = ({ children }) => {
    // --- Global State ---
    const [chats, setChats] = useState([]);
    const [isLoadingChats, setIsLoadingChats] = useState(true);
    
    // --- Active Conversation State ---
    const [messageCache, setMessageCache] = useState({});
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);

    // Helper to update a specific chat in the list
    const updateChatInList = (chatId, updates) => {
        setChats(prev => prev.map(c => c.id === chatId ? { ...c, ...updates } : c));
    };

    // --- 1. Global Actions (Chat List) ---

    const loadChats = useCallback(async (isRefresh = false) => {
        if (!isRefresh && chats.length > 0) return;
        
        setIsLoadingChats(true);
        try {
            const response = await ChatAPI.fetchChatList();
            if (response.success) {
                const data = response.data.map(c => ({...c, pinned: c.id === '1'})); 
                setChats(data);
            }
        } catch (error) {
            console.error("ChatContext: Load Chats Error", error);
        } finally {
            setIsLoadingChats(false);
        }
    }, [chats.length]);

    // --- 2. Active Chat Actions ---

    const loadMessages = useCallback(async (chatId) => {
        // If not cached, show loader
        if (!messageCache[chatId]) {
            setIsLoadingMessages(true);
        }

        try {
            const response = await ChatAPI.fetchHistory(chatId);
            if (response.success) {
                setMessageCache(prev => ({ ...prev, [chatId]: response.data }));
            }
        } catch (error) {
            console.error("ChatContext: Load History Error", error);
        } finally {
            setIsLoadingMessages(false);
        }
    }, [messageCache]);

    const sendMessage = useCallback(async (chatId, content, type = 'text', fileName = null) => {
        // 1. Optimistic Message
        const tempId = Date.now().toString();
        const optimisticMsg = { 
            id: tempId, 
            text: type === 'text' ? content : (fileName || 'Attachment'), 
            sender: 'me', 
            type: type,
            imageUri: (type === 'image' || type === 'video') ? content : null,
            fileUri: type === 'document' ? content : null,
            time: 'Just now',
            pending: true
        };

        // 2. Update Cache
        setMessageCache(prev => ({
            ...prev,
            [chatId]: [optimisticMsg, ...(prev[chatId] || [])]
        }));

        // 3. Update List Preview
        updateChatListLocally(chatId, { 
            lastMessage: type === 'text' ? content : `Sent a ${type}`, 
            time: 'Now' 
        });

        try {
            // 4. Upload if needed
            let finalContent = content;
            if (type !== 'text') {
                const uploadRes = await ChatAPI.uploadMedia(content);
                if(uploadRes.success) finalContent = uploadRes.url;
                else throw new Error("Upload failed");
            }

            // 5. API Call
            const response = await ChatAPI.sendMessage(chatId, finalContent, type);
            
            if (response.success) {
                // 6. Replace Optimistic with Real
                setMessageCache(prev => ({
                    ...prev,
                    [chatId]: prev[chatId].map(m => m.id === tempId ? response.data : m)
                }));
            }
        } catch (error) {
            console.error("Send Message Fail", error);
            setMessageCache(prev => ({
                ...prev,
                [chatId]: prev[chatId].filter(m => m.id !== tempId)
            }));
            throw error; // Let UI know
        }
    }, []);

    // --- 3. Chat Management Actions ---

    const pinChat = useCallback((chatId) => {
        setChats(prev => prev.map(c => c.id === chatId ? { ...c, pinned: !c.pinned } : c));
    }, []);

    const markRead = useCallback((chatId) => {
        updateChatInList(chatId, { unread: 0 });
    }, []);

    const toggleReadStatus = useCallback((chatId) => {
        setChats(prev => prev.map(c => {
            if (c.id === chatId) {
                return { ...c, unread: c.unread > 0 ? 0 : 1 };
            }
            return c;
        }));
    }, []);

    const deleteChat = useCallback(async (chatId) => {
        const previousChats = [...chats];
        setChats(prev => prev.filter(c => c.id !== chatId)); // Optimistic
        try {
            await ChatAPI.deleteChat(chatId);
        } catch (error) {
            setChats(previousChats); // Revert
            throw error;
        }
    }, [chats]);

    const archiveChat = useCallback(async (chatId) => {
        const previousChats = [...chats];
        setChats(prev => prev.filter(c => c.id !== chatId));
        try {
            await ChatAPI.archiveChat(chatId);
        } catch (error) {
            setChats(previousChats);
            throw error;
        }
    }, [chats]);

    // --- 4. Settings Actions ---

    const toggleMute = useCallback(async (chatId, currentState) => {
        // Toggle in list logic if applicable, or just API
        // We can update local list state to show a muted icon if we had one
        try {
            await ChatAPI.toggleMute(chatId, !currentState);
            return !currentState;
        } catch (e) {
            throw e;
        }
    }, []);

    const blockUser = useCallback(async (chatId) => {
        await ChatAPI.blockUser(chatId);
        // Remove from list or mark as blocked
        setChats(prev => prev.filter(c => c.id !== chatId));
    }, []);

    const reportUser = useCallback(async (chatId) => {
        await ChatAPI.reportUser(chatId, 'general');
    }, []);

    const clearChatHistory = useCallback(async (chatId) => {
        setMessageCache(prev => ({ ...prev, [chatId]: [] })); // Clear local
        // await ChatAPI.clearHistory(chatId); // API call if it existed
    }, []);

    // Helper for optimistic list updates
    const updateChatListLocally = (chatId, updates) => updateChatInList(chatId, updates);

    const value = {
        chats,
        isLoadingChats,
        loadChats,
        
        currentMessages: (id) => (messageCache[id] || []),
        isLoadingMessages,
        loadMessages,
        sendMessage,

        pinChat,
        markRead,
        toggleReadStatus,
        deleteChat,
        toggleMute,
        archiveChat,
        blockUser,
        reportUser,
        clearChatHistory
    };

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
};