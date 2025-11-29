// screens/social/components/ChatUI.js

import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, TextInput, Platform, Animated as RNAnimated } from 'react-native';
import Animated, { useAnimatedStyle, withSpring, FadeIn, FadeOut, Layout, FadeInLeft, FadeInRight } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@config/Colors';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import LottieView from 'lottie-react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { useModal } from '@context/ModalContext'; 

const getStatusDetails = (activityType) => {
    switch(activityType) {
        case 'game': return { icon: 'game-controller-outline', color: '#7289DA' }; // Discord Blue
        case 'listening': return { icon: 'musical-notes-outline', color: '#1DB954' }; // Spotify Green
        case 'watching': return { icon: 'tv-outline', color: '#E50914' }; // Netflix Red
        default: return { icon: 'ellipse', color: '#34C759' }; // Online Green
    }
};

// --- ScreenHeader, SearchInput, SectionHeader ---
export const ScreenHeader = ({ title, onBack, rightButtonIcon, onRightButtonPress }) => (
  <View style={styles.header}>
    <TouchableOpacity onPress={onBack} style={styles.headerButton}>
      <Ionicons name="arrow-back" size={24} color={Colors.text} />
    </TouchableOpacity>
    <Text style={styles.headerTitle}>{title}</Text>
    <TouchableOpacity onPress={onRightButtonPress} style={[styles.headerButton, { width: 44 }]}>
      {rightButtonIcon && <Ionicons name={rightButtonIcon} size={24} color={Colors.text} />}
    </TouchableOpacity>
  </View>
);
export const SearchInput = ({ value, onChangeText, placeholder }) => (
  <View style={styles.searchContainer}>
    <Ionicons name="search" size={20} color={Colors.textSecondary} style={styles.searchIcon} />
    <TextInput placeholder={placeholder} placeholderTextColor={Colors.textSecondary} style={styles.searchInput} value={value} onChangeText={onChangeText} />
  </View>
);

export const ChatListItem = ({ item }) => {
  const navigation = useNavigation();
  const isUnread = item.unreadCount > 0;
  return (
    <Animated.View entering={FadeIn.duration(500)}>
      <TouchableOpacity style={styles.chatItem} activeOpacity={0.8} onPress={() => navigation.navigate('Chat', { channelName: item.friend.name, avatar: item.friend.avatar })}>
        <View>
          <Image source={{ uri: item.friend.avatar }} style={styles.chatAvatar} />
          {item.friend.isOnline && <View style={styles.onlineIndicator} />}
        </View>
        <View style={styles.chatTextContainer}>
          <Text style={[styles.chatName, isUnread && styles.unreadTextBold]} numberOfLines={1}>{item.friend.name}</Text>
          <Text style={[styles.chatLastMessage, isUnread && styles.unreadTextNormal]} numberOfLines={1}>{item.lastMessage}</Text>
        </View>
        <View style={styles.chatMetaContainer}>
          <Text style={styles.chatTimestamp}>2h ago</Text>
          {isUnread && <View style={styles.unreadBadge}><Text style={styles.unreadCount}>{item.unreadCount}</Text></View>}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export const GroupListItem = ({ item }) => {
  const navigation = useNavigation();
  return (
    <Animated.View entering={FadeIn.duration(500)}>
      <TouchableOpacity style={styles.chatItem} activeOpacity={0.8} onPress={() => navigation.navigate('Chat', { channelName: item.name, avatar: item.avatar })}>
        <Image source={item.avatar} style={styles.groupAvatar} />
        <View style={styles.chatTextContainer}>
          <Text style={styles.chatName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.chatLastMessage} numberOfLines={1}>{item.lastMessage}</Text>
        </View>
        <View style={styles.chatMetaContainer}>
          <Text style={styles.chatTimestamp}>{item.members} members</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const MessageStatusIndicator = ({ status }) => {
    const iconName = status === 'read' ? 'checkmark-done' : status === 'delivered' ? 'checkmark-done' : 'checkmark';
    const iconColor = status === 'read' ? Colors.primary : Colors.textSecondary;
    if (!status || status === 'sending') return null; // Or show a clock icon for 'sending'

    return (
        <Ionicons name={iconName} size={16} color={iconColor} style={styles.statusIcon} />
    );
};

export const ChatHeader = ({ user, onBack, topInset = 0, isTyping, onMorePress }) => (
  <BlurView intensity={80} tint="dark" style={[styles.chatHeaderContainer, { height: 60 + topInset }]}>
    <View style={[styles.chatHeaderContent, { paddingTop: topInset }]}>
      <TouchableOpacity onPress={onBack} style={styles.headerButton}><Ionicons name="chevron-back" size={28} color={Colors.text} /></TouchableOpacity>
      <TouchableOpacity style={styles.chatHeaderUserInfo} activeOpacity={0.8} onPress={onMorePress}>
        <Image source={typeof user.avatar === 'string' ? { uri: user.avatar } : user.avatar} style={styles.chatHeaderAvatar} />
        <View>
          <Text style={styles.chatHeaderTitle} numberOfLines={1}>{user.name}</Text>
          <View style={styles.chatHeaderStatusContainer}>
            {isTyping ? (
              <Animated.Text entering={FadeIn} exiting={FadeOut} style={styles.typingStatusText}>typing...</Animated.Text>
            ) : (
              <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.onlineStatusContainer}>
                <View style={styles.chatHeaderOnlineIndicator} />
                <Text style={styles.chatHeaderStatusText}>Active now</Text>
              </Animated.View>
            )}
          </View>
        </View>
      </TouchableOpacity>
      <View style={styles.chatHeaderActions}>
        <TouchableOpacity style={styles.headerButton}><Ionicons name="call-outline" size={22} color={Colors.text} /></TouchableOpacity>
        <TouchableOpacity style={styles.headerButton} onPress={onMorePress}><Ionicons name="ellipsis-vertical" size={22} color={Colors.text} /></TouchableOpacity>
      </View>
    </View>
  </BlurView>
);

// --- UPDATED TypingIndicator ---
export const TypingIndicator = ({ avatar }) => (
    <Animated.View style={styles.messageRow} entering={FadeIn.duration(300)}>
      <Image source={typeof avatar === 'string' ? { uri: avatar } : avatar} style={styles.messageAvatar} />
      <View style={[styles.messageBubble, styles.theirMessageBubble, styles.typingBubble]}>
        <LottieView
          source={require('../../../../assets/typing-dots.json')}
          autoPlay
          loop
          style={{ width: 60, height: 60 }}
        />
      </View>
    </Animated.View>
);

// UPDATED: ChatInput to show "Replying to" banner
export const ChatInput = ({ inputText, setInputText, onSend, onAttachmentPress, replyingTo, onClearReply }) => {
  const hasText = inputText.trim().length > 0;
  const sendButtonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(hasText ? 1 : 0, { damping: 15, stiffness: 200 }) }],
    opacity: withSpring(hasText ? 1 : 0),
  }));
  return (
    <View style={styles.inputOuterContainer}>
      {replyingTo && (
        <View style={styles.replyingToContainer}>
          <View style={{ flex: 1 }}>
            <Text style={styles.replyingToTitle}>Replying to {replyingTo.author}</Text>
            <Text style={styles.replyingToContent} numberOfLines={1}>{replyingTo.content || 'an image'}</Text>
          </View>
          <TouchableOpacity onPress={onClearReply}>
            <Ionicons name="close-circle" size={24} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>
      )}
      <BlurView intensity={80} tint="dark" style={styles.inputContainer}>
        <TouchableOpacity style={styles.inputActionButton} onPress={onAttachmentPress}><Ionicons name="add-circle" size={28} color={Colors.primary} /></TouchableOpacity>
        <View style={styles.textInputWrapper}>
          <TextInput placeholder="Message..." placeholderTextColor={Colors.textSecondary} style={styles.textInput} multiline value={inputText} onChangeText={setInputText} />
        </View>
        <Animated.View style={[styles.sendButtonContainer, sendButtonAnimatedStyle]}>
          <TouchableOpacity onPress={onSend}>
            <LinearGradient colors={['#0A84FF', '#005CE6']} style={styles.sendButton}><Ionicons name="arrow-up" size={20} color={"#fff"} /></LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </BlurView>
    </View>
  );
};

export const MessageBubble = ({ onReply, onImagePress, ...props }) => {
  const { content, isMine, isFirstInGroup, status, isLastInGroup, authorAvatar, timestamp, imageUri, replyTo } = props;
  const bubbleRef = useRef(null);

  const bubbleStyle = {
    borderTopLeftRadius: !isMine && isFirstInGroup ? 5 : 20,
    borderBottomLeftRadius: !isMine && isLastInGroup ? 5 : 20,
    borderTopRightRadius: isMine && isFirstInGroup ? 5 : 20,
    borderBottomRightRadius: isMine && isLastInGroup ? 5 : 20,
  };
  const enteringAnimation = isMine ? FadeInRight.duration(400) : FadeInLeft.duration(400);

  // Improved reply swipe animation
  const renderReplyAction = (progress, dragX) => {
    const scale = dragX.interpolate({
      inputRange: [0, 80],
      outputRange: [0, 1],
      extrapolate: 'clamp',
    });
    return (
      <View style={styles.replyActionContainer}>
        <RNAnimated.View style={{ transform: [{ scale }] }}>
          <Ionicons name="arrow-undo" size={24} color={Colors.text} />
        </RNAnimated.View>
      </View>
    );
  };
  
  const handleSwipeOpen = (direction) => {
      if (direction === 'left') { // 'left' swipe on a 'their' message
          onReply(props);
      }
      bubbleRef.current?.close();
  };

  const renderMessageContent = () => {
    if (imageUri) {
      return (
        <TouchableOpacity activeOpacity={0.8} onPress={() => onImagePress(imageUri)}>
          <Image source={{ uri: imageUri }} style={styles.messageImage} />
        </TouchableOpacity>
      );
    }
    return (
      <Text style={isMine ? styles.myMessageText : styles.theirMessageText}>{content}</Text>
    );
  };

  return (
    <Swipeable ref={bubbleRef} renderLeftActions={!isMine ? renderReplyAction : undefined} onSwipeableOpen={!isMine ? () => handleSwipeOpen('left') : undefined}>
      <Animated.View style={[styles.messageRow, isMine ? styles.myMessageRow : styles.theirMessageRow]} entering={enteringAnimation}>
        {!isMine && isLastInGroup && <Image source={typeof authorAvatar === 'string' ? { uri: authorAvatar } : authorAvatar} style={styles.messageAvatar} />}
        
        <View style={{ maxWidth: '75%' }}>
          <View style={[styles.messageBubbleWrapper, isMine ? styles.myBubbleWrapper : styles.theirBubbleWrapper]}>
              <View style={[styles.messageBubble, isMine ? styles.myMessageBubble : styles.theirMessageBubble, bubbleStyle]}>
                {replyTo && (
                  <View style={styles.replyBubble}>
                    <View style={styles.replyConnector} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.replyAuthor}>{replyTo.author}</Text>
                      <Text style={styles.replyContent} numberOfLines={1}>{replyTo.content || 'Image'}</Text>
                    </View>
                  </View>
                )}
                {renderMessageContent()}
              </View>
          </View>
          {isLastInGroup && timestamp && (
            <View style={[styles.timestampContainer, { justifyContent: isMine ? 'flex-end' : 'flex-start' }]}>
              {isMine && <MessageStatusIndicator status={status} />}
              <Text style={styles.messageTimestamp}>{timestamp}</Text>
            </View>
          )}
        </View>
      </Animated.View>
    </Swipeable>
  );
};

export const DateSeparator = ({ date }) => (
  <Animated.View style={styles.dateSeparatorContainer} entering={FadeIn.duration(800)}>
    <BlurView intensity={20} tint="dark" style={styles.dateSeparator}>
      <Text style={styles.dateSeparatorText}>{date}</Text>
    </BlurView>
  </Animated.View>
);

// --- UPDATED FriendListItem Component ---
export const SectionHeader = ({ title, onActionPress, actionText }) => (
  <View style={styles.sectionHeaderContainer}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {onActionPress && (
      <TouchableOpacity onPress={onActionPress}>
        <Text style={styles.sectionActionText}>{actionText}</Text>
      </TouchableOpacity>
    )}
  </View>
);

// --- UPDATED: FriendListItem with Selection Mode ---
export const FriendListItem = ({ item, isSelectionMode, isSelected, onRemoveFriend }) => {
    const navigation = useNavigation();
    const modal = useModal();
    const status = getStatusDetails(item.activityType);
    
    const handleMoreOptions = () => {
      modal.show('actionSheet', {
        title: item.name,
        options: [
          { 
            label: 'Chat',
            icon: 'chatbubble-outline',
            onPress: () => navigation.navigate('Chat', { channelName: item.name, avatar: item.avatar })
          },
          { 
            label: 'View Profile', 
            icon: 'person-circle-outline', 
            // --- THIS IS THE FIX: Navigate to the UserProfileScreen ---
            onPress: () => navigation.navigate('UserProfile', { user: item })
          },
          { 
            label: 'Remove Friend', 
            icon: 'trash-outline', 
            isDestructive: true,
            onPress: () => onRemoveFriend(item.id)
          },
          { 
            label: 'Block', 
            icon: 'ban-outline', 
            isDestructive: true,
            onPress: () => Alert.alert("Blocked", `${item.name} has been blocked.`)
          },
          { label: 'Cancel', isCancel: true },
        ]
      });
    };
    
    const statusText = item.activityType === 'game' ? `Playing ${item.activityName}`
                     : item.activityType === 'listening' ? `Listening to ${item.activityName}`
                     : item.activityType === 'watching' ? `Watching ${item.activityName}`
                     : 'Online';

    return (
        <TouchableOpacity style={styles.friendRow} onPress={handleMoreOptions} activeOpacity={0.7}>
            {isSelectionMode && (
                <View style={styles.checkbox}>
                    <Ionicons name={isSelected ? "checkmark-circle" : "ellipse-outline"} size={26} color={isSelected ? Colors.primary : Colors.textSecondary} />
                </View>
            )}
            <View>
                <Image source={{ uri: item.avatar }} style={styles.friendAvatar} />
                <View style={[styles.statusIndicator, { backgroundColor: status.color }]}>
                    <Ionicons name={status.icon} size={status.icon === 'ellipse' ? 6 : 10} color="#fff" />
                </View>
            </View>
            <View style={styles.friendInfo}>
                <Text style={styles.friendName}>{item.name}</Text>
                <Text style={styles.friendStatus} numberOfLines={1}>{statusText}</Text>
            </View>
        </TouchableOpacity>
    );
};


// --- REDESIGNED FriendRequestCard ---
export const FriendRequestCard = ({ item, onAccept, onDecline }) => (
  <View style={styles.requestCard}>
      <Image source={{ uri: item.avatar }} style={styles.requestAvatar} />
      <View style={styles.friendInfo}>
          <Text style={styles.friendName}>{item.name}</Text>
          <Text style={styles.friendStatus}>{item.mutualFriends} Mutual Friends</Text>
      </View>
      <View style={styles.requestActions}>
          <TouchableOpacity style={styles.requestButton} onPress={onDecline}>
            <Ionicons name="close-outline" size={24} color={Colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.requestButton, styles.acceptButton]} onPress={onAccept}>
            <Ionicons name="checkmark-outline" size={24} color={'#fff'} />
          </TouchableOpacity>
      </View>
  </View>
);

// --- All Styles (No changes from previous version) ---
const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 10, height: 60, borderBottomWidth: 1, borderBottomColor: Colors.surface, backgroundColor: Colors.darkBackground },
  headerTitle: { flex: 1, textAlign: 'center', fontFamily: 'Poppins_600SemiBold', color: Colors.text, fontSize: 18 },
  headerButton: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: 12, marginHorizontal: 15, marginVertical: 10, paddingHorizontal: 15, height: 44 },
  searchIcon: { marginRight: 12 },
  searchInput: { flex: 1, height: '100%', fontFamily: 'Poppins_400Regular', fontSize: 15, color: Colors.text },
  sectionTitle: { fontFamily: 'Poppins_600SemiBold', color: Colors.textSecondary, fontSize: 13, marginVertical: 10, marginLeft: 15, textTransform: 'uppercase', letterSpacing: 0.5 },
  chatItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 15 },
  chatAvatar: { width: 56, height: 56, borderRadius: 28, marginRight: 15 },
  groupAvatar: { width: 56, height: 56, borderRadius: 16, marginRight: 15 },
  onlineIndicator: { position: 'absolute', bottom: 1, right: 16, width: 16, height: 16, borderRadius: 8, backgroundColor: '#34C759', borderWidth: 3, borderColor: Colors.darkBackground },
  chatTextContainer: { flex: 1, justifyContent: 'center' },
  chatName: { fontFamily: 'Poppins_600SemiBold', color: Colors.text, fontSize: 16, marginBottom: 4 },
  chatLastMessage: { fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, fontSize: 14 },
  unreadTextBold: { color: Colors.text, fontFamily: 'Poppins_700Bold' },
  unreadTextNormal: { color: Colors.text, fontFamily: 'Poppins_500Medium' },
  chatMetaContainer: { alignItems: 'flex-end', justifyContent: 'space-between', height: 50 },
  chatTimestamp: { fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, fontSize: 13 },
  unreadBadge: { backgroundColor: Colors.primary, minWidth: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5 },
  unreadCount: { color: '#fff', fontFamily: 'Poppins_600SemiBold', fontSize: 12 },
  chatHeaderContainer: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(255,255,255,0.15)' },
  chatHeaderContent: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10 },
  chatHeaderUserInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', marginLeft: 8 },
  chatHeaderAvatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
  chatHeaderTitle: { fontFamily: 'Poppins_600SemiBold', color: Colors.text, fontSize: 17 },
  chatHeaderStatusContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 1 },
  chatHeaderStatusText: { fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, fontSize: 13 },
  chatHeaderOnlineIndicator: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#34C759', marginRight: 6 },
  chatHeaderActions: { flexDirection: 'row' },
  inputOuterContainer: { backgroundColor: 'transparent' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingTop: 12, paddingBottom: Platform.OS === 'ios' ? 0 : 12, borderTopWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(255,255,255,0.1)' },
  textInputWrapper: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 22, paddingHorizontal: 8, minHeight: 44 },
  inputActionButton: { padding: 8 },
  textInput: { flex: 1, fontFamily: 'Poppins_400Regular', paddingVertical: Platform.OS === 'ios' ? 10 : 8, fontSize: 16, color: Colors.text, maxHeight: 120, marginHorizontal: 4 },
  sendButtonContainer: { marginLeft: 10, marginBottom: Platform.OS === 'ios' ? 0 : 2 },
  sendButton: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  messageRow: { flexDirection: 'row', marginVertical: 1, alignItems: 'flex-end', paddingHorizontal: 12 },
  myMessageRow: { justifyContent: 'flex-end' },
  theirMessageRow: { justifyContent: 'flex-start' },
  messageAvatar: { width: 32, height: 32, borderRadius: 16, marginRight: 8 },
  messageBubbleWrapper: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.22, shadowRadius: 2.22, elevation: 3 },
  myMessageText: { fontFamily: 'Poppins_400Regular', color: '#fff', fontSize: 15, lineHeight: 22 },
  theirMessageText: { fontFamily: 'Poppins_400Regular', color: Colors.text, fontSize: 15, lineHeight: 22 },
  messageBubble: { paddingHorizontal: 16, paddingVertical: 10, overflow: 'hidden' },
  myMessageBubble: { backgroundColor: Colors.primary },
  theirMessageBubble: { backgroundColor: '#262626' },
  messageImage: { width: 220, aspectRatio: 1, borderRadius: 16 },

  // New Reply Bubble Styles
  replyBubble: { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.2)', padding: 8, borderRadius: 8, marginBottom: 8, overflow: 'hidden' },
  replyConnector: { width: 3, backgroundColor: Colors.primary, marginRight: 8, borderRadius: 2 },
  replyAuthor: { fontFamily: 'Poppins_600SemiBold', color: Colors.primary, fontSize: 13, marginBottom: 1 },
  replyContent: { fontFamily: 'Poppins_400Regular', color: 'rgba(255,255,255,0.7)', fontSize: 13 },
  
  replyActionContainer: { justifyContent: 'center', alignItems: 'center', width: 80 },

  // Updated Date Separator Styles
  dateSeparatorContainer: { alignItems: 'center', marginVertical: 15 },
  dateSeparator: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 12, overflow: 'hidden' },
  dateSeparatorText: { fontFamily: 'Poppins_600SemiBold', color: Colors.textSecondary, fontSize: 12 },
  friendRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 15 },
  friendAvatar: { width: 54, height: 54, borderRadius: 27, marginRight: 15 },
  friendInfo: { flex: 1 },
  friendName: { fontFamily: 'Poppins_600SemiBold', color: Colors.text, fontSize: 16 },
  friendStatus: { fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, fontSize: 13, marginTop: 2 },
  requestCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: 12, padding: 12, marginHorizontal: 15, marginBottom: 10 },
  requestAvatar: { width: 48, height: 48, borderRadius: 24, marginRight: 12 },
  requestActions: { flexDirection: 'row' },
  requestButton: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8, marginLeft: 8 },
  acceptButton: { backgroundColor: Colors.primary },
  replyingToContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2C2C2E', paddingHorizontal: 15, paddingVertical: 8, borderTopLeftRadius: 12, borderTopRightRadius: 12 },
  replyingToTitle: { fontFamily: 'Poppins_600SemiBold', color: Colors.text, fontSize: 14 },
  replyingToContent: { fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, fontSize: 13 },
  sectionHeaderContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingRight: 15 },
  sectionActionText: { fontFamily: 'Poppins_500Medium', color: Colors.primary, fontSize: 14 },
  checkbox: { marginRight: 15, width: 26, height: 26, justifyContent: 'center', alignItems: 'center' },
  statusIndicator: { position: 'absolute', bottom: 0, right: 0, width: 20, height: 20, borderRadius: 10, backgroundColor: '#34C759', borderWidth: 2, borderColor: Colors.darkBackground, justifyContent: 'center', alignItems: 'center' },
  typingStatusText: { fontFamily: 'Poppins_500Medium', fontStyle: 'italic', color: Colors.primary, fontSize: 13 },
  onlineStatusContainer: { flexDirection: 'row', alignItems: 'center' },
  typingBubble: { padding: 0, width: 80, height: 40, justifyContent: 'center', alignItems: 'center' },
  timestampContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 4, marginHorizontal: 5 },
  messageTimestamp: { fontFamily: 'Poppins_500Medium', color: Colors.textSecondary, fontSize: 11 },
  statusIcon: { marginRight: 4 },
});