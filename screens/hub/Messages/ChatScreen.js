// screens/social/ChatScreen.js

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { View, StyleSheet, FlatList, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { messagesData } from '../../../constants/mockData';
import { MessageBubble, ChatHeader, ChatInput, DateSeparator, TypingIndicator } from './components/ChatUI';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import calendar from 'dayjs/plugin/calendar';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useModal } from '../../../context/ModalContext';

dayjs.extend(relativeTime);
dayjs.extend(calendar);

const HEADER_HEIGHT = 60;

const formatDate = (date) => {
    return dayjs(date).calendar(null, { sameDay: '[Today]', lastDay: '[Yesterday]', lastWeek: 'dddd', sameElse: 'DD/MM/YYYY' });
};


const ChatScreen = ({ route, navigation }) => {
  // --- FIX: Destructure all possible params and create a consistent chat partner object ---
  const { user, channelName, avatar } = route.params || {}; // Add fallback for safety
  const chatPartner = user || { name: channelName, avatar: avatar };
  // --- END OF FIX ---

  const insets = useSafeAreaInsets();
  const flatListRef = useRef(null);
  const modal = useModal();

  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState(
    messagesData['ch1'].map(m => m.author === 'Nexus' ? { ...m, status: 'read' } : m)
  );
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.author === 'Nexus' && lastMessage.status === 'sent') {
      const deliveredTimer = setTimeout(() => {
        setMessages(prev => prev.map(msg => msg.id === lastMessage.id ? { ...msg, status: 'delivered' } : msg));
      }, 1500);

      const readTimer = setTimeout(() => {
        setMessages(prev => prev.map(msg => msg.id === lastMessage.id ? { ...msg, status: 'read' } : msg));
      }, 3000);

      return () => {
        clearTimeout(deliveredTimer);
        clearTimeout(readTimer);
      };
    }
  }, [messages]);

  const addMessage = (messageData) => {
    const newMessage = {
      id: `msg_${Date.now()}`,
      author: 'Nexus',
      createdAt: new Date(),
      replyTo: replyingTo,
      status: 'sent',
      ...messageData,
    };
    setMessages(prev => [...prev, newMessage]);
    setReplyingTo(null);
  };

  const handleSend = useCallback(() => {
    const content = inputText.trim();
    if (content.length === 0) return;
    addMessage({ content });
    setInputText('');
  }, [inputText, replyingTo]);
  
  const handleOpenAttachmentMenu = () => {
    modal.show('actionSheet', {
      title: 'Share',
      options: [
        { label: 'Take Photo', icon: 'camera-outline', onPress: () => Alert.alert('Camera', 'Camera functionality not implemented.') },
        { label: 'Choose from Library', icon: 'image-outline', onPress: async () => {
            let result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaType.Images, allowsEditing: true, quality: 1 });
            if (!result.canceled) {
              addMessage({ imageUri: result.assets[0].uri });
            }
        }},
        { label: 'Document', icon: 'document-text-outline', onPress: () => Alert.alert('Document', 'Document picker not implemented.') },
        { label: 'Location', icon: 'location-outline', onPress: () => Alert.alert('Location', 'Location sharing not implemented.') },
        { label: 'Cancel', isCancel: true },
      ]
    });
  };
  
  const handleMoreOptions = () => {
    modal.show('actionSheet', {
      title: 'Chat Options',
      options: [
        // --- FIX: Pass the consistent chatPartner object ---
        { label: 'View Profile', icon: 'person-circle-outline', onPress: () => navigation.navigate('UserProfile', { user: chatPartner }) },
        { label: 'Search', icon: 'search-outline', onPress: () => Alert.alert('Search', 'Search functionality not implemented.') },
        { label: 'Mute Notifications', icon: 'notifications-off-outline', onPress: () => Alert.alert('Muted', 'Notifications have been muted.') },
        { label: 'Clear Chat', icon: 'trash-outline', isDestructive: true, onPress: () => setMessages([]) },
        { label: 'Cancel', isCancel: true },
      ]
    });
  };

  useEffect(() => {
      // --- FIX: Ensure chatPartner.name is defined before proceeding ---
      if (!chatPartner?.name) return;

      const lastMessage = messages[messages.length - 1];
      if (lastMessage && lastMessage.author === 'Nexus') {
          setIsOtherUserTyping(true);
          const typingTimer = setTimeout(() => {
              setIsOtherUserTyping(false);
              const replyMessage = {
                  id: `msg_reply_${Date.now()}`,
                  author: chatPartner.name, // Use chatPartner
                  content: "This is awesome!",
                  createdAt: new Date(),
              };
              setMessages(prev => [...prev, replyMessage]);
          }, 2500);

          return () => clearTimeout(typingTimer);
      }
  }, [messages, chatPartner?.name]); // Use optional chaining in dependency array

  const processedData = useMemo(() => {
    let lastDate = null;
    const dataWithSeparators = [];
    messages.forEach((msg, index) => {
        const currentDate = dayjs(msg.createdAt).startOf('day');
        if (!lastDate || !currentDate.isSame(lastDate)) {
            dataWithSeparators.push({ type: 'date', id: `date_${msg.createdAt}`, date: formatDate(msg.createdAt) });
            lastDate = currentDate;
        }
        const prev = messages[index - 1];
        const next = messages[index + 1];
        const isFirstInGroup = !prev || prev.author !== msg.author || !dayjs(msg.createdAt).isSame(prev.createdAt, 'day');
        const isLastInGroup = !next || next.author !== msg.author || !dayjs(msg.createdAt).isSame(next.createdAt, 'day');
        dataWithSeparators.push({ type: 'message', ...msg, isMine: msg.author === 'Nexus', isFirstInGroup, isLastInGroup, timestamp: dayjs(msg.createdAt).format('HH:mm') });
    });
    return dataWithSeparators;
  }, [messages]);

  const renderItem = ({ item }) => {
    if (item.type === 'date') return <DateSeparator date={item.date} />;
    // --- FIX: Use chatPartner ---
    return <MessageBubble {...item} authorAvatar={chatPartner.avatar} onReply={setReplyingTo} onImagePress={(uri) => modal.show('imageViewer', { uri })} />;
  };

  return (
    <LinearGradient colors={['#1D243D', '#121521', '#0e0f14']} style={styles.container}>
      {/* --- FIX: Pass the consistent chatPartner object --- */}
      <ChatHeader 
        user={chatPartner} 
        onBack={() => navigation.goBack()} 
        topInset={insets.top}
        isTyping={isOtherUserTyping}
        onMorePress={handleMoreOptions}
      />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={Platform.OS === 'ios' ? HEADER_HEIGHT + insets.top : 0}>
        <FlatList
          ref={flatListRef}
          data={processedData}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
          contentContainerStyle={{ paddingTop: HEADER_HEIGHT + insets.top + 10, paddingBottom: 10 }}
          // --- FIX: Use chatPartner ---
          ListFooterComponent={isOtherUserTyping ? <TypingIndicator avatar={chatPartner.avatar} /> : null}
        />
        <ChatInput
          inputText={inputText}
          setInputText={setInputText}
          onSend={handleSend}
          onAttachmentPress={handleOpenAttachmentMenu}
          replyingTo={replyingTo}
          onClearReply={() => setReplyingTo(null)}
        />
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({ container: { flex: 1 } });

export default ChatScreen;