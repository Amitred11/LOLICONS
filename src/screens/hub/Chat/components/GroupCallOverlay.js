import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Image, TouchableOpacity, FlatList, Animated, 
  Dimensions, Modal, ActivityIndicator, TextInput, KeyboardAvoidingView, 
  Platform, StatusBar, SafeAreaView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useAlert } from '@context/other/AlertContext';
import { useChat } from '@context/hub/ChatContext';

const { width, height } = Dimensions.get('window');
const PARTICIPANTS_PER_PAGE = 4;

// --- CONFIGURATION ---
// "Squeeze" the video area to 82% of the screen height.
// This leaves the bottom ~18% empty for the control bar.
const VIDEO_AREA_HEIGHT = height * 0.82; 

// --- Helper: Control Button ---
const ControlButton = ({ onPress, icon, color = '#FFF', bg = 'transparent', size = 52, isActive = false, activeColor = '#000', activeBg = '#FFF', isDestructive = false }) => (
  <TouchableOpacity 
    style={[
      styles.controlBtn, 
      { 
        width: size, height: size, borderRadius: size / 2, 
        backgroundColor: isDestructive ? '#FF3B30' : (isActive ? activeBg : bg),
        borderWidth: isActive || isDestructive ? 0 : 1,
        borderColor: 'rgba(255,255,255,0.15)' 
      }
    ]} 
    activeOpacity={0.7}
    onPress={onPress}
  >
    <Ionicons name={icon} size={24} color={isActive ? activeColor : color} />
  </TouchableOpacity>
);

const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

// --- Helper: Video Card ---
const GroupParticipant = ({ item, isMyStream }) => {
    return (
        <View style={styles.cardInner}>
            {item.isCameraOn ? (
                isMyStream ? (
                    <CameraView style={styles.videoStream} facing="front" /> 
                ) : (
                    <View style={[styles.videoStream, styles.videoPlaceholder]}>
                        <Ionicons name="videocam" size={40} color="rgba(255,255,255,0.2)" />
                    </View>
                )
            ) : (
                <View style={styles.avatarFallback}>
                    <Image source={{ uri: item.avatar }} style={styles.avatarLarge} />
                    <View style={styles.videoOffIcon}>
                        <Ionicons name="videocam-off" size={16} color="#FFF" />
                    </View>
                </View>
            )}

            {/* Name Overlay */}
            <LinearGradient colors={['transparent', 'rgba(0,0,0,0.7)']} style={styles.cardOverlay}>
                <View style={styles.userInfoRow}>
                    <Text style={styles.cardName} numberOfLines={1}>{isMyStream ? 'You' : item.name}</Text>
                    {item.isMuted && <Ionicons name="mic-off" size={14} color="#FF453A" style={{ marginLeft: 6 }} />}
                </View>
            </LinearGradient>
        </View>
    );
};

// --- Full Screen In-Call Chat (Unchanged) ---
const InCallChat = ({ visible, onClose }) => {
    const [msg, setMsg] = useState('');
    const { inCallMessages, sendInCallMessage } = useChat(); 
    const flatListRef = useRef(null);

    if (!visible) return null;

    return (
        <View style={styles.fullScreenChatContainer}>
            <View style={styles.chatBackground} />
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
                <SafeAreaView style={styles.chatSafeArea}>
                    <View style={styles.chatHeader}>
                        <TouchableOpacity onPress={onClose} style={styles.backButton}>
                            <Ionicons name="chevron-down" size={28} color="#FFF" />
                        </TouchableOpacity>
                        <Text style={styles.chatHeaderTitle}>In-Call Messages</Text>
                        <View style={{ width: 28 }} />
                    </View>
                    
                    <FlatList
                        ref={flatListRef}
                        data={inCallMessages}
                        inverted
                        keyExtractor={item => item.id}
                        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 10 }}
                        renderItem={({ item }) => {
                            const isMe = item.sender === 'me';
                            return (
                                <View style={[styles.msgRow, isMe ? styles.msgRowMe : styles.msgRowThem]}>
                                    {!isMe && <Text style={styles.msgName}>{item.senderName}</Text>}
                                    <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
                                        <Text style={styles.msgText}>{item.text}</Text>
                                    </View>
                                </View>
                            );
                        }}
                    />
                    
                    <View style={styles.inputContainer}>
                        <TextInput 
                            style={styles.chatInput} 
                            value={msg} 
                            onChangeText={setMsg} 
                            placeholder="Type a message..." 
                            placeholderTextColor="#666"
                            returnKeyType="send"
                            onSubmitEditing={() => { if(msg.trim()) { sendInCallMessage(msg); setMsg(''); }}}
                        />
                        <TouchableOpacity 
                            style={[styles.sendButton, { backgroundColor: msg.trim() ? '#34C759' : '#333' }]} 
                            disabled={!msg.trim()}
                            onPress={() => { sendInCallMessage(msg); setMsg(''); }}
                        >
                            <Ionicons name="arrow-up" size={20} color="#FFF" />
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </KeyboardAvoidingView>
        </View>
    );
};

// --- Add User Modal (Unchanged) ---
const AddUserModal = ({ visible, onClose, onAdd, chatId }) => {
    const { callableFriends, isLoadingFriends, loadCallableFriends } = useChat();
    const [selectedUsers, setSelectedUsers] = useState([]);

    useEffect(() => {
        if (visible) {
            loadCallableFriends(chatId);
            setSelectedUsers([]);
        }
    }, [visible, chatId]);

    const toggleSelection = (userId) => {
        setSelectedUsers(prev => prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]);
    };

    if (!visible) return null;

    return (
        <Modal transparent visible={visible} animationType="fade">
            <View style={styles.modalBackdrop}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalHeader}>Invite to Call</Text>
                    {isLoadingFriends ? <ActivityIndicator color="#FFF" style={{ margin: 20 }} /> : (
                        <FlatList
                            data={callableFriends} keyExtractor={item => item.id}
                            style={{ maxHeight: 300 }}
                            ListEmptyComponent={<Text style={{color: '#666', textAlign: 'center', padding: 20}}>No one else to add.</Text>}
                            renderItem={({ item }) => (
                                <TouchableOpacity style={styles.friendRow} onPress={() => toggleSelection(item.id)}>
                                    <Image source={{ uri: item.avatar }} style={styles.friendAvatar} />
                                    <Text style={styles.friendName}>{item.name}</Text>
                                    <Ionicons 
                                        name={selectedUsers.includes(item.id) ? "checkmark-circle" : "ellipse-outline"} 
                                        size={24} color={selectedUsers.includes(item.id) ? "#34C759" : "#444"}
                                    />
                                </TouchableOpacity>
                            )}
                        />
                    )}
                    <View style={styles.modalButtons}>
                        <TouchableOpacity style={[styles.modalBtn, styles.modalBtnCancel]} onPress={onClose}>
                            <Text style={styles.modalBtnText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[styles.modalBtn, styles.modalBtnAdd, { opacity: selectedUsers.length === 0 ? 0.5 : 1 }]} 
                            disabled={selectedUsers.length === 0}
                            onPress={() => onAdd(selectedUsers)}
                        >
                            <Text style={[styles.modalBtnText, { color: '#000' }]}>Add ({selectedUsers.length})</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

// --- Main Component ---
const GroupCallOverlay = ({ visible, user, onClose }) => {
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [permission, requestPermission] = useCameraPermissions();
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showChat, setShowChat] = useState(false);
  
  const insets = useSafeAreaInsets();
  const { showToast } = useAlert();
  const timerRef = useRef(null);
  const slideAnim = useRef(new Animated.Value(height)).current;
  
  const { groupCallParticipants, loadGroupCallParticipants, addParticipantsToCall, clearInCallSession } = useChat();
  const [participants, setParticipants] = useState([]);
  const [paginatedParticipants, setPaginatedParticipants] = useState([]);
  const [activePage, setActivePage] = useState(0);

  useEffect(() => {
    if (visible) {
        requestPermission();
        if (user?.id) loadGroupCallParticipants(user.id);
        Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, damping: 20 }).start(startTimer);
    } else {
        Animated.timing(slideAnim, { toValue: height, duration: 250, useNativeDriver: true }).start(cleanupCall);
    }
  }, [visible, user?.id]);
  
  useEffect(() => {
      setParticipants(groupCallParticipants);
      const me = groupCallParticipants.find(p => p.id === '1');
      if (me) {
          setIsCameraOn(me.isCameraOn);
          setIsMuted(me.isMuted);
      }
      
      const pages = [];
      for (let i = 0; i < groupCallParticipants.length; i += PARTICIPANTS_PER_PAGE) {
          pages.push(groupCallParticipants.slice(i, i + PARTICIPANTS_PER_PAGE));
      }
      if (pages.length === 0) pages.push([]);
      setPaginatedParticipants(pages);
  }, [groupCallParticipants]);
  
  const cleanupCall = () => { stopTimer(); setDuration(0); clearInCallSession(); };
  const startTimer = () => { timerRef.current = setInterval(() => setDuration(p => p + 1), 1000); };
  const stopTimer = () => { if (timerRef.current) clearInterval(timerRef.current); };
  const handleEndCall = () => { stopTimer(); onClose({ duration, wasConnected: true, type: 'group' }); };
  
  const handleAddUsers = (userIds) => {
      if(userIds.length > 0) addParticipantsToCall(user.id, userIds);
      setShowAddUserModal(false);
  };
  
  const toggleCamera = () => {
      if (!permission?.granted) return showToast("Permission", "Camera access is needed.", "info");
      const newState = !isCameraOn;
      setIsCameraOn(newState);
      setParticipants(prev => prev.map(p => p.id === '1' ? { ...p, isCameraOn: newState } : p));
  };

  const toggleMute = () => {
    const newState = !isMuted;
    setIsMuted(newState);
    setParticipants(prev => prev.map(p => p.id === '1' ? { ...p, isMuted: newState } : p));
  };

  // --- UPDATED DIMENSION LOGIC ---
  // Now uses VIDEO_AREA_HEIGHT instead of full height
  const getCardDimensions = (totalOnPage) => {
      // 1 person: Full Video Area
      if (totalOnPage === 1) return { w: width, h: VIDEO_AREA_HEIGHT };
      // 2 people: Split vertically (top/bottom) within the area
      if (totalOnPage === 2) return { w: width, h: VIDEO_AREA_HEIGHT * 0.5 };
      // 3-4 people: 2x2 Grid within the area
      return { w: width / 2, h: VIDEO_AREA_HEIGHT * 0.5 };
  };
  
  if (!visible && slideAnim._value === height) return null;

  return (
    <Animated.View style={[styles.container, { transform: [{ translateY: slideAnim }] }]}>
        <StatusBar hidden />
        <View style={styles.fullScreenContent}>
            
            {/* 1. Video Grid Layer - LIMITED HEIGHT */}
            <View style={{ height: VIDEO_AREA_HEIGHT, width: width }}>
                <FlatList
                    data={paginatedParticipants}
                    keyExtractor={(_, index) => `page_${index}`}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    windowSize={5} 
                    initialNumToRender={1}
                    removeClippedSubviews={false} 
                    onMomentumScrollEnd={(e) => setActivePage(Math.round(e.nativeEvent.contentOffset.x / width))}
                    renderItem={({ item: pageParticipants }) => {
                        const { w, h } = getCardDimensions(pageParticipants.length);
                        return (
                            <View style={styles.pageContainer}>
                                {pageParticipants.map(p => (
                                    <View key={p.id} style={{ width: w, height: h, padding: 1 }}>
                                        <GroupParticipant item={p} isMyStream={p.id === '1' && permission?.granted} />
                                    </View>
                                ))}
                            </View>
                        );
                    }}
                />
            </View>

            {/* 2. Top Timer */}
            <View style={[styles.timerContainer, { top: insets.top + 20 }]}>
                <View style={styles.timerPill}>
                    <View style={styles.recordingDot} />
                    <Text style={styles.timerText}>{formatTime(duration)}</Text>
                </View>
            </View>

            {/* 3. Bottom Controls Area - Fills the empty space below the videos */}
            <View style={[styles.bottomWrapper, { height: height - VIDEO_AREA_HEIGHT }]}>
                
                {/* Pagination Dots */}
                {paginatedParticipants.length > 1 && (
                    <View style={styles.paginationDots}>
                        {paginatedParticipants.map((_, i) => (
                            <View key={`dot_${i}`} style={[styles.dot, activePage === i ? styles.activeDot : {}]}/>
                        ))}
                    </View>
                )}

                {/* Control Bar Island */}
                <View style={styles.controlIsland}>
                    <ControlButton icon={isMuted ? "mic-off" : "mic"} isActive={isMuted} onPress={toggleMute} />
                    <ControlButton icon={isCameraOn ? "videocam" : "videocam-off"} isActive={!isCameraOn} onPress={toggleCamera} />
                    <ControlButton icon="call" isDestructive onPress={handleEndCall} size={60} iconSize={30} />
                    <ControlButton icon="chatbubbles-outline" onPress={() => setShowChat(true)} />
                    <ControlButton icon="person-add-outline" onPress={() => setShowAddUserModal(true)} />
                </View>
            </View>
        </View>

        <AddUserModal visible={showAddUserModal} onClose={() => setShowAddUserModal(false)} onAdd={handleAddUsers} chatId={user?.id} />
        <InCallChat visible={showChat} onClose={() => setShowChat(false)} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#000', zIndex: 2000 },
  fullScreenContent: { flex: 1, backgroundColor: '#000' }, // Pure black background

  // --- Video Grid ---
  // The page container now matches VIDEO_AREA_HEIGHT exactly
  pageContainer: { width: width, height: VIDEO_AREA_HEIGHT, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', backgroundColor: '#000' },
  
  cardInner: { flex: 1, backgroundColor: '#1C1C1E', overflow: 'hidden', position: 'relative' },
  videoStream: { width: '100%', height: '100%' },
  videoPlaceholder: { backgroundColor: '#222', justifyContent: 'center', alignItems: 'center' },
  avatarFallback: { flex: 1, backgroundColor: '#222', justifyContent: 'center', alignItems: 'center' },
  avatarLarge: { width: 80, height: 80, borderRadius: 40, marginBottom: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  videoOffIcon: { position: 'absolute', bottom: '40%', right: '35%', backgroundColor: '#000', padding: 4, borderRadius: 10 },
  
  cardOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 12 },
  userInfoRow: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start' },
  cardName: { color: '#FFF', fontSize: 13, fontWeight: '700', textShadowColor: 'rgba(0,0,0,0.8)', textShadowRadius: 3 },

  // --- Timer ---
  timerContainer: { position: 'absolute', width: '100%', alignItems: 'center', zIndex: 10 },
  timerPill: { 
    flexDirection: 'row', alignItems: 'center', 
    backgroundColor: 'rgba(20,20,20,0.6)', 
    paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, 
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' 
  },
  recordingDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#FF3B30', marginRight: 8 },
  timerText: { color: '#FFF', fontSize: 14, fontWeight: '600', fontVariant: ['tabular-nums'] },

  // --- Bottom Controls (Updated Layout) ---
  bottomWrapper: { 
    width: '100%', 
    position: 'absolute', 
    bottom: 0, 
    justifyContent: 'center', 
    alignItems: 'center',
    paddingBottom: 20, // Bottom padding from screen edge
  },
  
  paginationDots: { flexDirection: 'row', justifyContent: 'center', marginBottom: 20 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.2)', marginHorizontal: 4 },
  activeDot: { backgroundColor: '#FFF', width: 8, height: 8, borderRadius: 4, marginTop: -1 },
  
  controlIsland: { 
    width: '90%', 
    maxWidth: 450,
    flexDirection: 'row', 
    justifyContent: 'space-evenly', 
    alignItems: 'center', 
    backgroundColor: 'rgba(20,20,20,0.95)', 
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 35,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 10,
  },
  controlBtn: { justifyContent: 'center', alignItems: 'center' },

  // --- Chat ---
  fullScreenChatContainer: { position: 'absolute', width: width, height: height, zIndex: 3000 },
  chatBackground: { ...StyleSheet.absoluteFillObject, backgroundColor: '#050505' }, 
  chatSafeArea: { flex: 1 },
  chatHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: '#222' },
  chatHeaderTitle: { color: '#FFF', fontSize: 17, fontWeight: '700' },
  backButton: { padding: 8 },
  
  msgRow: { marginVertical: 6, maxWidth: '80%' },
  msgRowMe: { alignSelf: 'flex-end', alignItems: 'flex-end' },
  msgRowThem: { alignSelf: 'flex-start', alignItems: 'flex-start' },
  msgName: { color: '#888', fontSize: 11, marginBottom: 4, marginLeft: 12 },
  bubble: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 22 },
  bubbleMe: { backgroundColor: '#34C759', borderBottomRightRadius: 4 },
  bubbleThem: { backgroundColor: '#222', borderBottomLeftRadius: 4 },
  msgText: { color: '#FFF', fontSize: 16 },
  
  inputContainer: { flexDirection: 'row', padding: 15, alignItems: 'center', borderTopWidth: 1, borderTopColor: '#222', backgroundColor: '#050505' },
  chatInput: { flex: 1, backgroundColor: '#222', color: '#FFF', borderRadius: 25, paddingHorizontal: 20, paddingVertical: 12, marginRight: 12, fontSize: 16 },
  sendButton: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },

  // --- Modal ---
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '85%', backgroundColor: '#1C1C1E', borderRadius: 24, padding: 24, borderWidth: 1, borderColor: '#333' },
  modalHeader: { color: '#FFF', fontSize: 20, fontWeight: '700', marginBottom: 20, textAlign: 'center' },
  friendRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#2C2C2E' },
  friendAvatar: { width: 44, height: 44, borderRadius: 22, marginRight: 15, backgroundColor: '#333' },
  friendName: { color: '#FFF', fontSize: 16, flex: 1, fontWeight: '500' },
  modalButtons: { flexDirection: 'row', marginTop: 25, gap: 15 },
  modalBtn: { flex: 1, paddingVertical: 14, borderRadius: 16, alignItems: 'center' },
  modalBtnCancel: { backgroundColor: '#2C2C2E' },
  modalBtnAdd: { backgroundColor: '#34C759' },
  modalBtnText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
});

export default GroupCallOverlay;