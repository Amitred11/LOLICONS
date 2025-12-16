import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity,
  KeyboardAvoidingView, Platform, Animated, Keyboard, ActivityIndicator,
  PanResponder, Dimensions
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { useHeaderHeight } from '@react-navigation/elements';

import { Colors } from '@config/Colors';
import ChatBubble from './components/ChatBubble';
import ChatDetailModals from './components/ChatDetailModals';
import { useChat } from '@context/hub/ChatContext';
import { useAlert } from '@context/other/AlertContext';

const SCREEN_HEIGHT = Dimensions.get('window').height;

const ChatDetailScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();
  const flatListRef = useRef();
  const { showToast } = useAlert();
  const headerHeight = useHeaderHeight();

  const { user } = route.params || { user: { id: '0', name: 'Chat', type: 'direct' }};
  const isGroup = user.type === 'group';
  const isUser = !isGroup;
  const MY_USER_ID = 'me';

  // Context Actions
  const {
    loadMessages, currentMessages, isLoadingMessages, sendMessage,
    reactToMessage, editMessage, deleteMessage,
    pinMessage, reportMessage, createPollMessage, votePoll, addNewPollOption
  } = useChat();

  const [msg, setMsg] = useState('');
  const [showAttachments, setShowAttachments] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);

  // Call State
  const [isCalling, setIsCalling] = useState(false);
  const [callType, setCallType] = useState('voice');
  const [isCallMinimized, setIsCallMinimized] = useState(false);

  // Feature States
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [fullScreenImage, setFullScreenImage] = useState(null);
  const [editingMessageId, setEditingMessageId] = useState(null);
  
  // Track the poll being viewed/voted on
  const [activePollMessage, setActivePollMessage] = useState(null);

  // Modals
  const [reactorsModal, setReactorsModal] = useState({ visible: false, emoji: '', users: [] });
  const [showPollModal, setShowPollModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  // -- PINNED MESSAGES STATE --
  const [showPinnedModal, setShowPinnedModal] = useState(false);

  // -- POLL FEATURES --
  const [pollData, setPollData] = useState({ question: '', options: ['', ''] });
  const [addOptionModal, setAddOptionModal] = useState({ visible: false, messageId: null, text: '' });
  const [votersModal, setVotersModal] = useState({ visible: false, optionText: '', users: [] });

  // Report Form State
  const [reportReason, setReportReason] = useState('');
  const [reportingMessageId, setReportingMessageId] = useState(null);

  const attachmentHeight = useRef(new Animated.Value(0)).current;

  // --- ANIMATION VALUES ---
  const panY = useRef(new Animated.Value(0)).current; // Create/View Poll
  const addOptionPanY = useRef(new Animated.Value(0)).current; // Add Option
  const pinnedPanY = useRef(new Animated.Value(0)).current; // Pinned Messages

  // ====================================================================
  // 1. FIX: RESET ANIMATIONS WHEN MODALS OPEN
  // ====================================================================
  
  useEffect(() => {
    if (showPollModal) {
        panY.setValue(0); // Reset position to screen center/bottom
    }
  }, [showPollModal]);

  useEffect(() => {
    if (addOptionModal.visible) {
        addOptionPanY.setValue(0);
    }
  }, [addOptionModal.visible]);

  useEffect(() => {
    if (showPinnedModal) {
        pinnedPanY.setValue(0);
    }
  }, [showPinnedModal]);

  // ====================================================================
  // 2. POLL MODAL ANIMATION
  // ====================================================================
  const resetPollModalPosition = Animated.timing(panY, { toValue: 0, duration: 300, useNativeDriver: true });
  const closePollModalAnimation = Animated.timing(panY, { toValue: SCREEN_HEIGHT, duration: 300, useNativeDriver: true });

  const pollPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 0,
      onPanResponderMove: Animated.event([null, { dy: panY }], { useNativeDriver: false }),
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 150) closePollModal();
        else resetPollModalPosition.start();
      },
    })
  ).current;

  const closePollModal = () => {
     Keyboard.dismiss();
     closePollModalAnimation.start(() => { 
         setShowPollModal(false); 
     });
  };

  // ====================================================================
  // 3. ADD OPTION ANIMATION
  // ====================================================================
  const resetAddOptionPosition = Animated.timing(addOptionPanY, { toValue: 0, duration: 300, useNativeDriver: true });
  const closeAddOptionAnimation = Animated.timing(addOptionPanY, { toValue: SCREEN_HEIGHT, duration: 300, useNativeDriver: true });

  const addOptionPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 0,
      onPanResponderMove: Animated.event([null, { dy: addOptionPanY }], { useNativeDriver: false }),
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 150) closeAddOptionModal();
        else resetAddOptionPosition.start();
      },
    })
  ).current;

  const closeAddOptionModal = () => {
      Keyboard.dismiss();
      closeAddOptionAnimation.start(() => {
          setAddOptionModal({ ...addOptionModal, visible: false });
      });
  };

  // ====================================================================
  // 4. PINNED MESSAGES ANIMATION
  // ====================================================================
  const resetPinnedPosition = Animated.timing(pinnedPanY, { toValue: 0, duration: 300, useNativeDriver: true });
  const closePinnedAnimation = Animated.timing(pinnedPanY, { toValue: SCREEN_HEIGHT, duration: 300, useNativeDriver: true });

  const pinnedPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 0,
      onPanResponderMove: Animated.event([null, { dy: pinnedPanY }], { useNativeDriver: false }),
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 150) closePinnedModal();
        else resetPinnedPosition.start();
      },
    })
  ).current;

  const closePinnedModal = () => {
      closePinnedAnimation.start(() => {
          setShowPinnedModal(false);
      });
  };

  useLayoutEffect(() => {
    navigation.getParent()?.setOptions({ tabBarStyle: { display: 'none' } });
    return () => { navigation.getParent()?.setOptions({ tabBarStyle: undefined }); };
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
        toValue: showAttachments ? 180 : 0, 
        duration: 250,
        useNativeDriver: false
    }).start();
  }, [showAttachments]);

  const startCall = (type) => {
      setCallType(type);
      setIsCallMinimized(false);
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

  // --- POLL VIEWING LOGIC ---
  const handleViewPoll = (message) => {
      setActivePollMessage(message);
      setShowPollModal(true);
  };

  // --- OPEN CREATION MODAL ---
  const openCreatePollModal = () => {
      setActivePollMessage(null); 
      setPollData({ question: '', options: ['', ''] }); 
      setShowPollModal(true);
  };

  // --- POLL CREATION SUBMIT ---
  const handleCreatePoll = async () => {
      Keyboard.dismiss(); 
      const validOptions = pollData.options.filter(o => o.trim().length > 0);
      if (!pollData.question.trim()) return showToast("Missing Info", "Please enter a question", "info");
      if (validOptions.length < 2) return showToast("Missing Info", "Poll needs at least 2 options", "info");

      try {
          setTimeout(async () => {
            await createPollMessage(user.id, pollData.question, validOptions);
            closePollModal();
            setShowAttachments(false);
          }, 100);
      } catch (error) {
          showToast("Error", "Failed to create poll", "error");
      }
  };

  const handleVoteAction = (messageId, optionId) => {
      votePoll(user.id, messageId, optionId);
  };

  const addCreatePollOption = () => {
      if (pollData.options.length >= 5) return showToast("Limit Reached", "Max 5 options", "info");
      setPollData(prev => ({ ...prev, options: [...prev.options, ''] }));
  };

  const updatePollOption = (text, index) => {
      const newOptions = [...pollData.options];
      newOptions[index] = text;
      setPollData(prev => ({ ...prev, options: newOptions }));
  };


  const handleAddOptionToExisting = (messageId) => {
     setAddOptionModal({ visible: true, messageId, text: '' });
  };

  const submitNewOption = async () => {
      const { messageId, text } = addOptionModal;
      if(!text.trim()) return showToast("Info", "Please enter option text", "info");
      
      try {
          await addNewPollOption(user.id, messageId, text.trim());
          closeAddOptionModal(); 
          setAddOptionModal(prev => ({ ...prev, text: '' }));
          showToast("Success", "Option added", "success");
      } catch(e) {
          showToast("Error", "Failed to add option", "error");
      }
  };

  // --- MEDIA HANDLERS ---
  const handlePickImage = async () => {
    Keyboard.dismiss();
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
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
    const callLogData = { callType: type, duration: duration, status: wasConnected ? 'ended' : 'missed', timestamp: new Date().toISOString() };
    await sendMessage(user.id, JSON.stringify(callLogData), 'call_log'); 
  };

  const handleLongPress = (message) => { setSelectedMessage(message); };

  // --- REACTION HANDLERS ---
  const handleReactionPress = (messageId, emoji) => {
      const message = messages.find(m => m.id === messageId);
      if (!message) return;

      const existingReactions = message.reactions?.[emoji] || [];
      const iHaveReacted = existingReactions.includes(MY_USER_ID);

      if (iHaveReacted) {
           reactToMessage(user.id, messageId, emoji); 
      } else {
          reactToMessage(user.id, messageId, emoji);
      }
  };

  const handleReactionLongPress = (emoji, userIds) => {
      const formattedUsers = Array.isArray(userIds) ? userIds.map(id => ({ id, name: id === 'me' ? 'You' : `User ${id}`, avatar: null })) : [];
      setReactorsModal({ visible: true, emoji, users: formattedUsers });
  };
  
  const handlePinAction = () => {
      if (selectedMessage) {
          pinMessage(user.id, selectedMessage.id);
          setSelectedMessage(null);
          showToast("Success", selectedMessage.isPinned ? "Message Unpinned" : "Message Pinned", "success");
      }
  };

  const handleGoToPinnedMessage = (messageId) => {
      const messages = currentMessages(user.id);
      const index = messages.findIndex(m => m.id === messageId);
      if (index !== -1 && flatListRef.current) {
          closePinnedModal();
          setTimeout(() => {
              flatListRef.current.scrollToIndex({ index, animated: true, viewPosition: 0.5 });
          }, 300);
      } else {
          showToast("Info", "Message not loaded in view", "info");
      }
  };

  const handleReportAction = () => {
      if (selectedMessage) {
          setReportingMessageId(selectedMessage.id); 
          setSelectedMessage(null);
          setShowReportModal(true);
      }
  };

  const handleSubmitReport = async () => {
      if (!reportReason.trim()) return showToast("Error", "Please enter a reason", "error");
      try {
          if (reportingMessageId) await reportMessage(user.id, reportingMessageId, reportReason);
          setShowReportModal(false);
          setReportReason('');
          setReportingMessageId(null);
          showToast("Report Sent", "We will review this content shortly.", "success");
      } catch (error) {
          showToast("Error", "Failed to send report", "error");
      }
  };
  
  const handleDeleteAction = (type) => { 
      if (selectedMessage) { deleteMessage(user.id, selectedMessage.id, type); setSelectedMessage(null); }
  };

  const toggleAttachments = () => { Keyboard.dismiss(); setShowEmojis(false); setShowAttachments(!showAttachments); };
  const toggleEmojis = () => { Keyboard.dismiss(); setShowAttachments(false); setShowEmojis(!showEmojis); };
  const addEmoji = (emoji) => { setMsg(prev => prev + emoji); };

  const messages = currentMessages(user.id);
  const pinnedMessages = messages.filter(m => m.isPinned);

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
            onScrollToIndexFailed={info => {
                const wait = new Promise(resolve => setTimeout(resolve, 500));
                wait.then(() => {
                    flatListRef.current?.scrollToIndex({ index: info.index, animated: true });
                });
            }}
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
                        currentUserId={MY_USER_ID}
                        onCallAgain={(type) => { setCallType(type); setIsCalling(true); }}
                        onLongPress={handleLongPress}
                        onImagePress={(uri) => setFullScreenImage(uri)}
                        onReactionPress={handleReactionPress}
                        onReactionLongPress={handleReactionLongPress} 
                        
                        onViewPoll={handleViewPoll} 
                        onVote={handleVoteAction} 
                    />
                );
            }}
        />
    );
  };

  return (
    <View style={styles.container}>
      {/* 
        Modals are typically rendered as native screens by React Native `Modal`. 
        Placing this here ensures they are mounted in the component tree.
      */}
      <ChatDetailModals
          user={user}
          isGroup={isGroup}
          isCalling={isCalling}
          callType={callType}
          isCallMinimized={isCallMinimized}
          fullScreenImage={fullScreenImage}
          showReportModal={showReportModal}
          reportReason={reportReason}
          
          showPollModal={showPollModal}
          pollData={pollData}
          activePollMessage={activePollMessage} 
          
          addOptionModal={addOptionModal}
          showPinnedModal={showPinnedModal}
          pinnedMessages={pinnedMessages}
          reactorsModal={reactorsModal}
          votersModal={votersModal}
          selectedMessage={selectedMessage}
          messages={messages}
          MY_USER_ID={MY_USER_ID}

          handleCallEnded={handleCallEnded}
          setIsCallMinimized={setIsCallMinimized}
          setFullScreenImage={setFullScreenImage}
          setShowReportModal={setShowReportModal}
          setReportReason={setReportReason}
          handleSubmitReport={handleSubmitReport}
          
          closePollModal={closePollModal}
          setPollData={setPollData}
          updatePollOption={updatePollOption}
          addCreatePollOption={addCreatePollOption}
          handleCreatePoll={handleCreatePoll}
          
          handleVote={handleVoteAction}
          handleAddOptionToExisting={handleAddOptionToExisting}
          
          closeAddOptionModal={closeAddOptionModal}
          setAddOptionModal={setAddOptionModal}
          submitNewOption={submitNewOption}
          closePinnedModal={closePinnedModal}
          handleGoToPinnedMessage={handleGoToPinnedMessage}
          setReactorsModal={setReactorsModal}
          setVotersModal={setVotersModal}
          setSelectedMessage={setSelectedMessage}
          handleReactionPress={handleReactionPress}
          handlePinAction={handlePinAction}
          setMsg={setMsg}
          setEditingMessageId={setEditingMessageId}
          handleReportAction={handleReportAction}
          handleDeleteAction={handleDeleteAction}

          panY={panY}
          pollPanResponder={pollPanResponder}
          addOptionPanY={addOptionPanY}
          addOptionPanResponder={addOptionPanResponder}
          pinnedPanY={pinnedPanY}
          pinnedPanResponder={pinnedPanResponder}
      />

      <View style={styles.bgGlow} />

      {/* --- HEADER --- */}
      <View style={[styles.header, { marginTop: insets.top + 10 }]}>
        <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.glassBtn}>
                <Ionicons name="chevron-back" size={24} color={Colors.text} />
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => navigation.navigate('ChatSettings', { user })} style={styles.headerInfo}>
                <View style={{flexDirection:'row', alignItems:'center'}}>
                    <Text style={styles.headerTitle}>{user.name}</Text>
                </View>
                <View style={{flexDirection:'row', alignItems:'center'}}>
                    {isGroup && <Ionicons name="people" size={12} color={Colors.secondary} style={{marginRight:4}} />}
                    <Text style={styles.headerSub}>{isLoadingMessages ? 'Connecting...' : 'Online'}</Text>
                </View>
            </TouchableOpacity>
        </View>

        <View style={styles.headerRight}>
            <TouchableOpacity 
                onPress={() => setShowPinnedModal(true)} 
                style={[styles.glassBtn, { backgroundColor: 'transparent', borderColor: 'transparent', marginRight: 5 }]}
            >
                <Ionicons name="push-outline" size={22} color={Colors.text} />
            </TouchableOpacity>

            {isUser && (<TouchableOpacity onPress={() => startCall('voice')} style={[styles.callBtn, { backgroundColor: 'rgba(52, 199, 89, 0.2)', borderWidth: 1, borderColor: '#34C759' }]}>
                <Ionicons name="call" size={18} color="#34C759" />
            </TouchableOpacity>)}
            <TouchableOpacity onPress={() => startCall('video')} style={[styles.callBtn, { backgroundColor: 'rgba(0, 122, 255, 0.2)', borderWidth: 1, borderColor: '#007AFF' }]}>
                <Ionicons name="videocam" size={18} color="#007AFF" />
            </TouchableOpacity>
        </View>
      </View>

      {/* MINIMIZED CALL BANNER */}
      {isCalling && isCallMinimized && (
          <TouchableOpacity onPress={() => setIsCallMinimized(false)} activeOpacity={0.9}>
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

      {/* --- INPUT AREA --- */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        keyboardVerticalOffset={Platform.OS === 'ios' ? headerHeight + 5 : 0}
        style={{ flexShrink: 0 }} 
      >
        <View style={{ marginBottom: insets.bottom > 0 ? insets.bottom : 10 }}>
            {editingMessageId && (
                <View style={styles.editingBar}>
                    <Text style={{color: Colors.text, flex: 1}}>Editing Message...</Text>
                    <TouchableOpacity onPress={() => { setEditingMessageId(null); setMsg(''); Keyboard.dismiss(); }}>
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
                    <AttachmentItem icon="stats-chart" color="#FF9500" label="Poll" onPress={() => { openCreatePollModal(); }} /> 
                    <AttachmentItem icon="location" color="#34C759" label="Location" onPress={() => showToast("Location", "Coming soon", 'info')} />
                </View>
                <View style={[styles.attachmentGrid, { marginTop: 10 }]}>
                    <AttachmentItem icon="person" color="#007AFF" label="Contact" onPress={() => showToast("Contact", "Coming soon", 'info')} />
                </View>
            </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

// --- SUB COMPONENTS ---

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
  
  // Attachments
  attachmentMenu: { overflow: 'hidden', backgroundColor: 'rgba(20,20,20,0.95)' },
  attachmentGrid: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingHorizontal: 20 },
  attachItem: { alignItems: 'center', width: 70 },
  attachIconBg: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  attachLabel: { color: Colors.textSecondary, fontSize: 12 },
  
  emptyText: { fontSize: 18, fontWeight: '600', color: Colors.textSecondary, marginTop: 20 },
  editingBar: { flexDirection: 'row', backgroundColor: '#2C2C2E', padding: 10, marginHorizontal: 15, borderTopLeftRadius: 10, borderTopRightRadius: 10 },
  
  // Call Banner
  activeCallBanner: { backgroundColor: '#1C1C1E', marginHorizontal: 15, marginBottom: 10, padding: 10, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: '#34C759', shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 5 },
  bannerContent: { flexDirection: 'row', alignItems: 'center' },
  bannerIcon: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  bannerTitle: { color: '#FFF', fontSize: 14, fontWeight: '600' },
  bannerSub: { color: Colors.textSecondary, fontSize: 11 },
});

export default ChatDetailScreen;