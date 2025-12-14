import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { 
  View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, 
  KeyboardAvoidingView, Platform, Animated, Keyboard, ActivityIndicator, Modal, Image
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker'; 
import * as DocumentPicker from 'expo-document-picker'; 
import { useHeaderHeight } from '@react-navigation/elements'; // Import this

import { Colors } from '@config/Colors';
import ChatBubble from './components/ChatBubble';
import CallOverlay from './components/CallOverlay'; 
import GroupCallOverlay from './components/GroupCallOverlay';
import { useChat } from '@context/hub/ChatContext';
import { useAlert } from '@context/other/AlertContext';

const ChatDetailScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();
  const flatListRef = useRef();
  const { showToast } = useAlert();
  const headerHeight = useHeaderHeight(); 

  const { user } = route.params || { user: { id: '0', name: 'Chat', type: 'direct' }};
  const isGroup = user.type === 'group';

  // Context Actions
  const { 
    loadMessages, currentMessages, isLoadingMessages, sendMessage, 
    reactToMessage, editMessage, deleteMessage 
  } = useChat();

  const [msg, setMsg] = useState('');
  const [showAttachments, setShowAttachments] = useState(false); 
  const [showEmojis, setShowEmojis] = useState(false); 
  
  // Call State
  const [isCalling, setIsCalling] = useState(false);
  const [callType, setCallType] = useState('voice'); 
  const [isCallMinimized, setIsCallMinimized] = useState(false); // NEW STATE


  // New States for Features
  const [selectedMessage, setSelectedMessage] = useState(null); // Long press menu
  const [fullScreenImage, setFullScreenImage] = useState(null); // Image Viewer
  const [editingMessageId, setEditingMessageId] = useState(null); // Edit Mode
  
  // State for Reactors Modal
  const [reactorsModal, setReactorsModal] = useState({ visible: false, emoji: '', users: [] });

  const attachmentHeight = useRef(new Animated.Value(0)).current;

  useLayoutEffect(() => {
    navigation.getParent()?.setOptions({
      tabBarStyle: { display: 'none' }
    });
    return () => {
      navigation.getParent()?.setOptions({
        tabBarStyle: undefined // Reset to default when leaving
      });
    };
  }, [navigation]);

  useEffect(() => {
    loadMessages(user.id);
    const keyboardSub = Keyboard.addListener('keyboardDidShow', () => {
        setShowAttachments(false);
        setShowEmojis(false);
    });
    return () => keyboardSub.remove();
  }, [user.id]);

  useEffect(() => {
    Animated.timing(attachmentHeight, {
        toValue: showAttachments ? 120 : 0,
        duration: 250,
        useNativeDriver: false
    }).start();
  }, [showAttachments]);

  const startCall = (type) => {
      setCallType(type);
      setIsCallMinimized(false); // Reset minimize state
      setIsCalling(true);
  };

  const handleSend = async (content = msg, type = 'text', fileName = null) => {
    if (!content) return;

    if (editingMessageId) {
        await editMessage(user.id, editingMessageId, content);
        setEditingMessageId(null);
        setMsg('');
        Keyboard.dismiss();
        return;
    }

    if(type === 'text') setMsg('');
    setShowAttachments(false);
    setShowEmojis(false);
    try {
      await sendMessage(user.id, content, type, fileName);
    } catch (error) {
      showToast("Message failed to send", 'error');
    }
  };

  const handlePickImage = async () => {
    Keyboard.dismiss();
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled) handleSend(result.assets[0].uri, 'image');
  };

  const handleCamera = async () => {
    Keyboard.dismiss();
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) return showToast("Permission", "Camera access needed.", 'info');
    
    const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    if (!result.canceled) handleSend(result.assets[0].uri, 'image');
  };

  const handleDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: true });
      if (result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        handleSend(file.uri, 'document', file.name); 
      }
    } catch (err) { console.log("Doc Picker Error", err); }
  };

  const handleCallEnded = async (callData) => {
    setIsCalling(false);
    setIsCallMinimized(false); 
    if (!callData) return;
    const { duration, wasConnected, type } = callData;
    const callLogData = {
        callType: type, 
        duration: duration,
        status: wasConnected ? 'ended' : 'missed',
        timestamp: new Date().toISOString()
    };
    try {
        await sendMessage(user.id, JSON.stringify(callLogData), 'call_log'); 
    } catch (error) {
        console.error("Failed to send call log", error);
    }
};

   const handleMinimizeCall = () => {
    setIsCallMinimized(true);
  };
  
  const handleReturnToCall = () => {
    setIsCallMinimized(false);
  };

  // --- LONG PRESS ACTIONS ---
  const handleLongPress = (message) => { setSelectedMessage(message); };

  const handleReaction = (emoji) => {
      if (selectedMessage) {
          reactToMessage(user.id, selectedMessage.id, emoji);
          setSelectedMessage(null);
      }
  };

  const handleReactionPress = (messageId, emoji) => {
      reactToMessage(user.id, messageId, emoji);
  };

  const handleReactionLongPress = (emoji, userIds) => {
      const formattedUsers = Array.isArray(userIds) ? userIds.map(id => {
          if (id === 'me') return { id, name: 'You', avatar: null };
          if (id === 'jessica') return { id, name: 'Jessica Parker', avatar: null };
          return { id, name: `User ${id}`, avatar: null };
      }) : [];
      setReactorsModal({ visible: true, emoji, users: formattedUsers });
  };

  const handleEditAction = () => {
      if (selectedMessage?.type === 'text' && selectedMessage?.sender === 'me') {
          setMsg(selectedMessage.text);
          setEditingMessageId(selectedMessage.id);
          setSelectedMessage(null);
      } else {
          showToast("Can't Edit", "Only your text messages can be edited.", "info");
      }
  };

  const handleDeleteAction = (type) => { 
      if (selectedMessage) {
          deleteMessage(user.id, selectedMessage.id, type === 'everyone' ? 'everyone' : 'for_me');
          setSelectedMessage(null);
      }
  };

  const cancelEdit = () => {
      setEditingMessageId(null);
      setMsg('');
      Keyboard.dismiss();
  };

  const toggleAttachments = () => { Keyboard.dismiss(); setShowEmojis(false); setShowAttachments(!showAttachments); };
  const toggleEmojis = () => { Keyboard.dismiss(); setShowAttachments(false); setShowEmojis(!showEmojis); };
  const addEmoji = (emoji) => { setMsg(prev => prev + emoji); };

  const messages = currentMessages(user.id);

  const renderContent = () => {
    if (isLoadingMessages) return <View style={styles.emptyListContainer}><ActivityIndicator color={Colors.primary} size="large" /></View>;
    if (messages.length === 0) {
        return (
            <View style={styles.emptyListContainer}>
                <Ionicons name="chatbubbles-outline" size={60} color={Colors.textSecondary} style={{ opacity: 0.5 }} />
                <Text style={styles.emptyText}>No messages yet.</Text>
            </View>
        );
    }
    return (
        <FlatList
            ref={flatListRef}
            data={messages}
            inverted
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContentContainer}
            renderItem={({ item, index }) => {
                const olderMessage = messages[index + 1];
                const newerMessage = messages[index - 1];
                const isFirstInChain = !olderMessage || olderMessage.sender !== item.sender || olderMessage.type === 'system';
                const isLastInChain = !newerMessage || newerMessage.sender !== item.sender || newerMessage.type === 'system';

                return (
                    <ChatBubble 
                        message={item} 
                        isMe={item.sender === 'me'} 
                        isFirstInChain={isFirstInChain} 
                        isLastInChain={isLastInChain}
                        onCallAgain={(type) => { setCallType(type); setIsCalling(true); }}
                        onLongPress={handleLongPress}
                        onImagePress={(uri) => setFullScreenImage(uri)}
                        onReactionPress={handleReactionPress}
                        onReactionLongPress={handleReactionLongPress} 
                    />
                );
            }}
        />
    );
  };

  return (
    <View style={styles.container}>
      {/* 
         CHANGED: Replaced Modal with Conditional Rendering using View.
         We keep CallOverlay mounted if isCalling is true, but pass isMinimized prop.
         The component sits on top of everything via zIndex.
      */}
      {isCalling && !isGroup && (
        <View style={[StyleSheet.absoluteFill, { zIndex: 999 }]} pointerEvents="box-none">
           <CallOverlay 
              visible={isCalling} 
              user={user} 
              type={callType} 
              onClose={handleCallEnded} 
              isMinimized={isCallMinimized}
              onMinimize={handleMinimizeCall} 
            />
        </View>
      )}

      {/* Group Call Overlay (keep as Modal for now) */}
      <Modal visible={isCalling && isGroup} transparent={true} animationType="fade">
        <View style={{ flex: 1, backgroundColor: '#000' }}>
            <GroupCallOverlay visible={isCalling} user={user} onClose={handleCallEnded} />
        </View>
      </Modal>

      {/* FULL SCREEN IMAGE VIEWER */}
      <Modal visible={!!fullScreenImage} transparent={true} animationType="fade">
        <View style={styles.fullScreenContainer}>
            <TouchableOpacity style={styles.closeImageBtn} onPress={() => setFullScreenImage(null)}>
                <Ionicons name="close-circle" size={40} color="#FFF" />
            </TouchableOpacity>
            {fullScreenImage && (
                <Image source={{ uri: fullScreenImage }} style={styles.fullScreenImage} resizeMode="contain" />
            )}
        </View>
      </Modal>

      {/* REACTORS LIST MODAL */}
      <Modal visible={reactorsModal.visible} transparent={true} animationType="fade">
        <TouchableOpacity 
            style={styles.modalOverlay} 
            activeOpacity={1} 
            onPress={() => setReactorsModal({ ...reactorsModal, visible: false })}
        >
            <View style={styles.reactorsPopup}>
                <View style={styles.reactorsHeader}>
                    <Text style={styles.reactorsTitle}>Reactions {reactorsModal.emoji}</Text>
                    <TouchableOpacity onPress={() => setReactorsModal({ ...reactorsModal, visible: false })}>
                        <Ionicons name="close-circle" size={24} color={Colors.textSecondary} />
                    </TouchableOpacity>
                </View>
                <FlatList 
                    data={reactorsModal.users}
                    keyExtractor={item => item.id}
                    style={{ maxHeight: 200 }}
                    renderItem={({ item }) => (
                        <View style={styles.reactorRow}>
                            <View style={styles.reactorAvatar}>
                                <Text style={{color:'#FFF', fontWeight:'bold'}}>{item.name[0]}</Text>
                            </View>
                            <Text style={styles.reactorName}>{item.name}</Text>
                        </View>
                    )}
                />
            </View>
        </TouchableOpacity>
      </Modal>

      {/* MESSAGE OPTIONS MODAL */}
      <Modal visible={!!selectedMessage} transparent={true} animationType="fade">
          <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setSelectedMessage(null)}>
              <View style={styles.contextMenu}>
                   <View style={styles.reactionRow}>
                       {['❤️','👍','😂','😮','😡','🙏'].map(emoji => (
                           <TouchableOpacity key={emoji} onPress={() => handleReaction(emoji)} style={styles.emojiBtn}>
                               <Text style={{fontSize:28}}>{emoji}</Text>
                           </TouchableOpacity>
                       ))}
                   </View>

                   <View style={styles.actionsList}>
                       <TouchableOpacity style={styles.actionRow} onPress={() => setSelectedMessage(null)}>
                           <Text style={styles.actionText}>Copy</Text>
                           <Ionicons name="copy-outline" size={20} color={Colors.text} />
                       </TouchableOpacity>
                       {selectedMessage?.sender === 'me' && selectedMessage?.type === 'text' && (
                           <TouchableOpacity style={styles.actionRow} onPress={handleEditAction}>
                               <Text style={styles.actionText}>Edit</Text>
                               <Ionicons name="pencil-outline" size={20} color={Colors.text} />
                           </TouchableOpacity>
                       )}
                       <TouchableOpacity style={styles.actionRow} onPress={() => handleDeleteAction('me')}>
                           <Text style={[styles.actionText, {color: '#FF453A'}]}>Delete for me</Text>
                           <Ionicons name="trash-outline" size={20} color="#FF453A" />
                       </TouchableOpacity>
                       {selectedMessage?.sender === 'me' && (
                            <TouchableOpacity style={styles.actionRow} onPress={() => handleDeleteAction('everyone')}>
                                <Text style={[styles.actionText, {color: '#FF453A'}]}>Delete for everyone</Text>
                                <Ionicons name="trash-bin-outline" size={20} color="#FF453A" />
                            </TouchableOpacity>
                       )}
                   </View>
              </View>
          </TouchableOpacity>
      </Modal>

      <View style={styles.bgGlow} />

      {/* HEADER */}
      <View style={[styles.header, { marginTop: insets.top + 10 }]}>
        <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.glassBtn}>
                <Ionicons name="chevron-back" size={24} color={Colors.text} />
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => navigation.navigate('ChatSettings', { user })} style={styles.headerInfo}>
                <Text style={styles.headerTitle}>{user.name}</Text>
                <View style={{flexDirection:'row', alignItems:'center'}}>
                    {isGroup && <Ionicons name="people" size={12} color={Colors.secondary} style={{marginRight:4}} />}
                    <Text style={styles.headerSub}>{isLoadingMessages ? 'Connecting...' : 'Online'}</Text>
                </View>
            </TouchableOpacity>
        </View>

        <View style={styles.headerRight}>
            <TouchableOpacity onPress={() => startCall('voice')} style={[styles.callBtn, { backgroundColor: 'rgba(52, 199, 89, 0.2)', borderWidth: 1, borderColor: '#34C759' }]}>
                <Ionicons name="call" size={18} color="#34C759" />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => startCall('video')} style={[styles.callBtn, { backgroundColor: 'rgba(0, 122, 255, 0.2)', borderWidth: 1, borderColor: '#007AFF' }]}>
                <Ionicons name="videocam" size={18} color="#007AFF" />
            </TouchableOpacity>
        </View>
      </View>

      {isCalling && isCallMinimized && (
          <TouchableOpacity onPress={handleReturnToCall} activeOpacity={0.9}>
              <Animated.View style={styles.activeCallBanner}>
                  <View style={styles.bannerContent}>
                      <View style={[styles.bannerIcon, { backgroundColor: callType === 'video' ? '#007AFF' : '#34C759' }]}>
                          <Ionicons name={callType === 'video' ? "videocam" : "call"} size={14} color="#FFF" />
                      </View>
                      <View>
                          <Text style={styles.bannerTitle}>Tap to return to call</Text>
                          <Text style={styles.bannerSub}>Call in progress • {user.name}</Text>
                      </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
              </Animated.View>
          </TouchableOpacity>
      )}

      <View style={{ flex: 1 }}>{renderContent()}</View>

      {/* FIX 2: KEYBOARD AVOIDING VIEW ADJUSTMENTS */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        // Important: Offset by header height to prevent keyboard covering input
        keyboardVerticalOffset={Platform.OS === 'ios' ? headerHeight : 0}
        style={{ flexShrink: 0 }} // Ensures it doesn't expand unexpectedly
      >
        <View style={{ marginBottom: insets.bottom > 0 ? insets.bottom : 10 }}>
            
            {/* EDITING BAR */}
            {editingMessageId && (
                <View style={styles.editingBar}>
                    <Text style={{color: Colors.text, flex: 1}}>Editing Message...</Text>
                    <TouchableOpacity onPress={cancelEdit}>
                        <Ionicons name="close" size={20} color={Colors.text} />
                    </TouchableOpacity>
                </View>
            )}

            <View style={styles.inputWrapper}>
                <View style={[styles.glassInputContainer, editingMessageId && { borderColor: Colors.primary }]}>
                    <TouchableOpacity onPress={toggleAttachments} style={styles.attachBtn}>
                        <Animated.View style={{ transform: [{ rotate: showAttachments ? '45deg' : '0deg' }] }}>
                             <Ionicons name="add" size={28} color={Colors.text} />
                        </Animated.View>
                    </TouchableOpacity>
                    <TextInput 
                        style={styles.input}
                        placeholder={editingMessageId ? "Edit your message..." : "Message..."}
                        placeholderTextColor={Colors.textSecondary}
                        value={msg}
                        onChangeText={setMsg}
                        multiline
                        onFocus={() => { setShowAttachments(false); setShowEmojis(false); }}
                    />
                    {msg.length === 0 && !editingMessageId ? (
                        <View style={{ flexDirection: 'row' }}>
                            <TouchableOpacity onPress={handleCamera} style={styles.iconBtn}>
                                <Ionicons name="camera-outline" size={24} color={Colors.textSecondary} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={toggleEmojis} style={styles.iconBtn}>
                                <Ionicons name={showEmojis ? "keypad-outline" : "happy-outline"} size={24} color={Colors.textSecondary} />
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity onPress={() => handleSend(msg, 'text')} style={styles.sendBtn}>
                            <Ionicons name={editingMessageId ? "checkmark" : "arrow-up"} size={20} color="#000" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
            {showEmojis && <EmojiPicker onSelect={addEmoji} />}
            <Animated.View style={[styles.attachmentMenu, { height: attachmentHeight }]}>
                <View style={styles.attachmentGrid}>
                    <AttachmentItem icon="image" color="#FF2D55" label="Gallery" onPress={handlePickImage} />
                    <AttachmentItem icon="document-text" color="#5856D6" label="File" onPress={handleDocument} />
                    <AttachmentItem icon="location" color="#34C759" label="Location" onPress={() => showToast("Location", "Feature coming soon", 'info')} />
                    <AttachmentItem icon="person" color="#007AFF" label="Contact" onPress={() => showToast("Contact", "Feature coming soon", 'info')} />
                </View>
            </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const EmojiPicker = ({ onSelect }) => {
    const emojis = ['😀','😂','😍','🔥','👍','🎉','❤️','😭','😡','👻','👽','🤖','💩','💀','👀','🧠','👋','🙏'];
    return (
      <View style={{ height: 50, backgroundColor: '#111' }}>
        <FlatList data={emojis} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 10 }}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => onSelect(item)} style={{ padding: 10 }}>
              <Text style={{ fontSize: 24 }}>{item}</Text>
            </TouchableOpacity>
          )} keyExtractor={(item) => item} />
      </View>
    );
};

const AttachmentItem = ({ icon, color, label, onPress }) => (
    <TouchableOpacity style={styles.attachItem} onPress={onPress}>
        <View style={[styles.attachIconBg, { backgroundColor: color }]}>
            <Ionicons name={icon} size={24} color="#FFF" />
        </View>
        <Text style={styles.attachLabel}>{label}</Text>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  bgGlow: { position: 'absolute', top: -100, left: -100, width: 300, height: 300, backgroundColor: Colors.primary, opacity: 0.1, borderRadius: 150, blurRadius: 100 },
  header: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 15, marginBottom: 10, justifyContent: 'space-between', zIndex: 10 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  headerInfo: { marginLeft: 15 },
  headerTitle: { fontWeight: '700', color: Colors.text, fontSize: 16 },
  headerSub: { color: Colors.secondary, fontSize: 11, fontWeight: '500', marginTop: 2 },
  glassBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.08)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  
  callBtn: { width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center', marginLeft: 8 },

  listContentContainer: { flexGrow: 1, justifyContent: 'flex-end', paddingHorizontal: 20, paddingBottom: 20, paddingTop: 20 },
  emptyListContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  inputWrapper: { paddingHorizontal: 15, paddingVertical: 10 },
  glassInputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: 25, padding: 5, paddingHorizontal: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  attachBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center', marginRight: 5 },
  input: { flex: 1, color: Colors.text, maxHeight: 100, fontSize: 16, paddingVertical: 8 },
  iconBtn: { padding: 8 },
  sendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center', marginLeft: 5 },
  attachmentMenu: { overflow: 'hidden', backgroundColor: 'rgba(20,20,20,0.95)' },
  attachmentGrid: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', height: 120, paddingHorizontal: 20 },
  attachItem: { alignItems: 'center' },
  attachIconBg: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  attachLabel: { color: Colors.textSecondary, fontSize: 12 },
  emptyText: { fontSize: 18, fontWeight: '600', color: Colors.textSecondary, marginTop: 20 },

  editingBar: { flexDirection: 'row', backgroundColor: '#2C2C2E', padding: 10, marginHorizontal: 15, borderTopLeftRadius: 10, borderTopRightRadius: 10 },
  
  fullScreenContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', alignItems: 'center' },
  fullScreenImage: { width: '100%', height: '80%' },
  closeImageBtn: { position: 'absolute', top: 50, right: 20, zIndex: 10 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  contextMenu: { backgroundColor: '#1C1C1E', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 40 },
  reactionRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, backgroundColor: '#2C2C2E', padding: 10, borderRadius: 15 },
  emojiBtn: { padding: 5 },
  actionsList: { backgroundColor: '#2C2C2E', borderRadius: 15, overflow: 'hidden' },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: '#3A3A3C' },
  actionText: { color: '#FFF', fontSize: 16, fontWeight: '500' },

  // NEW STYLES FOR REACTORS MODAL
  reactorsPopup: {
      backgroundColor: '#1C1C1E',
      width: '80%',
      alignSelf: 'center',
      borderRadius: 16,
      padding: 15,
      marginBottom: 'auto', 
      marginTop: 'auto',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.1)',
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.5,
      shadowRadius: 10,
      elevation: 10
  },
  reactorsHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 15,
      borderBottomWidth: 1,
      borderBottomColor: '#2C2C2E',
      paddingBottom: 10
  },
  reactorsTitle: {
      color: '#FFF',
      fontSize: 18,
      fontWeight: 'bold'
  },
  reactorRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12
  },
  reactorAvatar: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: Colors.primary || '#34C759',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 10
  },
  reactorName: {
      color: Colors.text,
      fontSize: 16
  },
  activeCallBanner: {
      backgroundColor: '#1C1C1E',
      marginHorizontal: 15,
      marginBottom: 10,
      padding: 10,
      borderRadius: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderWidth: 1,
      borderColor: '#34C759', // Or dynamic based on call type
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 5,
  },
  bannerContent: {
      flexDirection: 'row',
      alignItems: 'center'
  },
  bannerIcon: {
      width: 28,
      height: 28,
      borderRadius: 14,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 10
  },
  bannerTitle: {
      color: '#FFF',
      fontSize: 14,
      fontWeight: '600'
  },
  bannerSub: {
      color: Colors.textSecondary,
      fontSize: 11
  }
});

export default ChatDetailScreen;