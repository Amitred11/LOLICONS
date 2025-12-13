import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View, Text, StyleSheet, Image, TouchableOpacity, FlatList, 
  Dimensions, Modal, ActivityIndicator, TextInput, KeyboardAvoidingView, 
  Platform, StatusBar, Pressable
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import ToastContainer from '@components/alerts/ToastContainer'; 

// Context Imports
import { useAlert } from '@context/other/AlertContext';
import { useChat } from '@context/hub/ChatContext';

const { width, height } = Dimensions.get('window');
const PARTICIPANTS_PER_PAGE = 4;

// --- UTILS ---
const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) return `${hrs}:${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

const triggerHaptic = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
};

// --- SUB-COMPONENT: Control Button ---
const ControlButton = ({ onPress, icon, color = '#FFF', bg = 'rgba(255,255,255,0.1)', size = 52, isActive = false, activeColor = '#000', activeBg = '#FFF', isDestructive = false }) => (
  <TouchableOpacity 
    style={[
      styles.controlBtn, 
      { 
        width: size, height: size, borderRadius: size / 2, 
        backgroundColor: isDestructive ? '#FF3B30' : (isActive ? activeBg : bg),
        borderColor: isActive || isDestructive ? 'transparent' : 'rgba(255,255,255,0.15)',
        borderWidth: 1
      }
    ]} 
    activeOpacity={0.7}
    onPress={() => { triggerHaptic(); onPress(); }}
  >
    <Ionicons name={icon} size={24} color={isActive ? activeColor : color} />
  </TouchableOpacity>
);

// --- SUB-COMPONENT: Participant Cell ---
const ParticipantCell = React.memo(({ item, cellWidth, cellHeight, isMe, hasPermission, isOverlayVisible }) => {
    const shouldRenderCamera = isMe && hasPermission && item.isCameraOn && isOverlayVisible;

    return (
        <View style={{ width: cellWidth, height: cellHeight, padding: 1 }}>
            <View style={styles.cellContent}>
                {item.isCameraOn ? (
                    isMe ? (
                        shouldRenderCamera ? (
                            <CameraView 
                                style={styles.fill} 
                                facing="front"
                                key={`cam-${isMe}-${isOverlayVisible}`} 
                            />
                        ) : (
                            <View style={[styles.fill, styles.placeholder]}>
                                <ActivityIndicator color="#FFF" />
                            </View>
                        )
                    ) : (
                        <View style={[styles.fill, styles.placeholder]}>
                             <Image source={{ uri: item.avatar }} style={styles.avatarBlurred} blurRadius={20} />
                             <Ionicons name="person" size={40} color="rgba(255,255,255,0.2)" />
                        </View>
                    )
                ) : (
                    <View style={[styles.fill, styles.placeholder]}>
                        <Image source={{ uri: item.avatar }} style={styles.avatarLarge} />
                        <View style={styles.videoOffBadge}>
                            <Ionicons name="videocam-off" size={12} color="#FFF" />
                        </View>
                    </View>
                )}

                <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={styles.nameTagContainer}>
                    <Text style={styles.nameText} numberOfLines={1}>
                        {isMe ? 'You' : item.name}
                    </Text>
                    {item.isMuted && <Ionicons name="mic-off" size={12} color="#FF453A" style={{ marginLeft: 6 }} />}
                </LinearGradient>
            </View>
        </View>
    );
});

// --- MODAL: Chat ---
const ChatModal = ({ visible, onClose }) => {
    const { inCallMessages, sendInCallMessage } = useChat();
    const [msg, setMsg] = useState('');
    const insets = useSafeAreaInsets();
    
    return (
        <Modal 
            visible={visible} 
            animationType="slide" 
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>In-Call Chat</Text>
                    <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                        <Ionicons name="close" size={24} color="#FFF" />
                    </TouchableOpacity>
                </View>
                
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                    <FlatList
                        data={inCallMessages}
                        inverted
                        keyExtractor={(item, index) => item.id || index.toString()}
                        contentContainerStyle={{ padding: 16 }}
                        renderItem={({ item }) => {
                            const isMe = item.sender === 'me';
                            return (
                                <View style={[styles.msgRow, isMe ? styles.msgRowRight : styles.msgRowLeft]}>
                                    {!isMe && <Text style={styles.senderName}>{item.senderName}</Text>}
                                    <View style={[styles.bubble, isMe ? styles.bubbleRight : styles.bubbleLeft]}>
                                        <Text style={styles.msgText}>{item.text}</Text>
                                    </View>
                                </View>
                            );
                        }}
                    />
                    <View style={[styles.inputContainer, { paddingBottom: insets.bottom + 10 }]}>
                        <TextInput 
                            style={styles.input} 
                            placeholder="Type a message..." 
                            placeholderTextColor="#666"
                            value={msg}
                            onChangeText={setMsg}
                            returnKeyType="send"
                            onSubmitEditing={() => { if(msg.trim()) { sendInCallMessage(msg); setMsg(''); }}}
                        />
                        <TouchableOpacity 
                            style={[styles.sendBtn, { backgroundColor: msg.trim() ? '#34C759' : '#333' }]} 
                            disabled={!msg.trim()}
                            onPress={() => { sendInCallMessage(msg); setMsg(''); }}
                        >
                            <Ionicons name="arrow-up" size={20} color="#FFF" />
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
};

// --- MODAL: Settings & Invite ---
const SettingsSheet = ({ visible, onClose, onInvite, userId }) => {
    const { callableFriends, isLoadingFriends, loadCallableFriends } = useChat();
    const { showToast, toasts, removeToast } = useAlert(); 
    const [view, setView] = useState('menu'); 
    const [selected, setSelected] = useState([]);
    const insets = useSafeAreaInsets();

    useEffect(() => {
        if (visible) {
            setView('menu');
            setSelected([]);
            loadCallableFriends(userId);
        }
    }, [visible]);

    const handleInviteSubmit = () => {
        onInvite(selected);
        onClose();
    };

    const toggleSelection = (id) => {
        setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
        triggerHaptic();
    };

    const handleWatchParty = () => {
        triggerHaptic();
        showToast("Watch Party", "This feature will be available soon!", "info");
    };

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={styles.sheetBackdrop}>
                <Pressable style={{ flex: 1 }} onPress={onClose} />
                <View style={[styles.sheetContent, { paddingBottom: insets.bottom + 20 }]}>
                    
                    <View style={styles.sheetHeader}>
                        {view === 'invite' && (
                            <TouchableOpacity onPress={() => setView('menu')} style={styles.backBtn}>
                                <Ionicons name="chevron-back" size={24} color="#FFF" />
                            </TouchableOpacity>
                        )}
                        <Text style={styles.sheetTitle}>{view === 'invite' ? 'Invite Friends' : 'Call Settings'}</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <Ionicons name="close" size={24} color="#888" />
                        </TouchableOpacity>
                    </View>

                    {view === 'menu' && (
                        <View style={{ gap: 10 }}>
                            <TouchableOpacity style={styles.menuItem} onPress={() => setView('invite')}>
                                <View style={[styles.menuIcon, { backgroundColor: '#0A84FF' }]}>
                                    <Ionicons name="person-add" size={20} color="#FFF" />
                                </View>
                                <Text style={styles.menuText}>Add Participants</Text>
                                <Ionicons name="chevron-forward" size={20} color="#444" />
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.menuItem} onPress={handleWatchParty}>
                                <View style={[styles.menuIcon, { backgroundColor: '#5856D6' }]}>
                                    <Ionicons name="film" size={20} color="#FFF" />
                                </View>
                                <Text style={styles.menuText}>Watch Party</Text>
                                <View style={styles.betaBadge}>
                                    <Text style={styles.betaText}>SOON</Text>
                                </View>
                            </TouchableOpacity>
                            
                            <View style={styles.menuItem}>
                                <View style={[styles.menuIcon, { backgroundColor: '#323232' }]}>
                                    <Ionicons name="volume-high" size={20} color="#FFF" />
                                </View>
                                <Text style={styles.menuText}>Audio Output</Text>
                                <Text style={{ color: '#666', marginRight: 5 }}>Speaker</Text>
                            </View>
                        </View>
                    )}

                    {view === 'invite' && (
                        <View style={{ height: 350 }}>
                            {isLoadingFriends ? (
                                <ActivityIndicator color="#FFF" style={{ marginTop: 40 }} />
                            ) : (
                                <FlatList
                                    data={callableFriends}
                                    keyExtractor={item => item.id}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity style={styles.friendRow} onPress={() => toggleSelection(item.id)}>
                                            <Image source={{ uri: item.avatar }} style={styles.friendImg} />
                                            <Text style={styles.friendName}>{item.name}</Text>
                                            <Ionicons 
                                                name={selected.includes(item.id) ? "checkmark-circle" : "ellipse-outline"} 
                                                size={24} 
                                                color={selected.includes(item.id) ? "#34C759" : "#444"} 
                                            />
                                        </TouchableOpacity>
                                    )}
                                    ListEmptyComponent={<Text style={styles.emptyText}>No available friends.</Text>}
                                />
                            )}
                            <TouchableOpacity 
                                style={[styles.actionBtn, { opacity: selected.length ? 1 : 0.5 }]} 
                                disabled={!selected.length}
                                onPress={handleInviteSubmit}
                            >
                                <Text style={styles.actionBtnText}>Send Invites ({selected.length})</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );
};

// --- MAIN COMPONENT ---
const GroupCallOverlay = ({ visible, user, onClose }) => {
    const insets = useSafeAreaInsets();
    const { showToast, toasts, removeToast } = useAlert(); 
    const [permission, requestPermission] = useCameraPermissions();
    
    // UI State
    const [duration, setDuration] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [isCameraOn, setIsCameraOn] = useState(true);
    const [showChat, setShowChat] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [activePage, setActivePage] = useState(0);
    
    const timerRef = useRef(null);
    const { groupCallParticipants, loadGroupCallParticipants, addParticipantsToCall } = useChat();

    useEffect(() => {
        if (visible) {
            requestPermission();
            if (user?.id) loadGroupCallParticipants(user.id);
            timerRef.current = setInterval(() => setDuration(d => d + 1), 1000);
        } else {
            clearInterval(timerRef.current);
            setDuration(0);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [visible, user?.id]);

    const paginatedParticipants = useMemo(() => {
        const updatedList = groupCallParticipants.map(p => 
            p.id === user.id ? { ...p, isMuted, isCameraOn } : p
        );
        const pages = [];
        for (let i = 0; i < updatedList.length; i += PARTICIPANTS_PER_PAGE) {
            pages.push(updatedList.slice(i, i + PARTICIPANTS_PER_PAGE));
        }
        return pages.length ? pages : [[]];
    }, [groupCallParticipants, isMuted, isCameraOn, user.id]);

    const handleInvite = (ids) => {
        if (ids.length) {
            addParticipantsToCall(user.id, ids);
            showToast("Invites Sent", `Invited ${ids.length} people to the call.`, "success");
        }
    };

    // --- FIX: Handle End Call Logic Correctly ---
    const handleEndCall = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        
        // Pass back specific structure expected by ChatDetailScreen
        onClose({
            duration: duration,
            wasConnected: true, // Assuming call was active since overlay was open
            type: 'group' 
        });
    };
    // ---------------------------------------------

    const getLayout = (count) => {
        if (count <= 1) return { w: width, h: '100%' };
        if (count === 2) return { w: width, h: '50%' };
        return { w: width / 2, h: '50%' }; 
    };

    if (!visible) return null;

    return (
        <View style={styles.root}>
            <StatusBar barStyle="light-content" backgroundColor="#000" />
            
            <View style={styles.videoArea}>
                <FlatList
                    data={paginatedParticipants}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onMomentumScrollEnd={(e) => setActivePage(Math.round(e.nativeEvent.contentOffset.x / width))}
                    renderItem={({ item: pageParticipants }) => {
                        const { w, h } = getLayout(pageParticipants.length);
                        return (
                            <View style={{ width, height: '100%', flexDirection: 'row', flexWrap: 'wrap', alignContent: 'center' }}>
                                {pageParticipants.map(p => (
                                    <ParticipantCell 
                                        key={p.id} 
                                        item={p} 
                                        cellWidth={w} 
                                        cellHeight={h} 
                                        isMe={p.id === user.id} 
                                        hasPermission={permission?.granted}
                                        isOverlayVisible={visible} 
                                    />
                                ))}
                            </View>
                        );
                    }}
                />
                
                {paginatedParticipants.length > 1 && (
                    <View style={styles.dotsContainer}>
                        {paginatedParticipants.map((_, i) => (
                            <View key={i} style={[styles.dot, activePage === i && styles.activeDot]} />
                        ))}
                    </View>
                )}
            </View>

            <View style={[styles.controlBar, { paddingBottom: insets.bottom + 15 }]}>
                
                {/* Timer Display */}
                <View style={styles.timerRow}>
                    <View style={styles.recDot} />
                    <Text style={styles.timerText}>{formatTime(duration)}</Text>
                </View>

                <View style={styles.controlRow}>
                    <ControlButton 
                        icon={isMuted ? "mic-off" : "mic"} 
                        isActive={isMuted} 
                        onPress={() => setIsMuted(!isMuted)} 
                    />
                    <ControlButton 
                        icon={isCameraOn ? "videocam" : "videocam-off"} 
                        isActive={!isCameraOn} 
                        onPress={() => setIsCameraOn(!isCameraOn)} 
                    />
                    
                    {/* Updated End Call Button */}
                    <TouchableOpacity style={styles.endCallBtn} onPress={handleEndCall}>
                        <Ionicons name="call" size={32} color="#FFF" />
                    </TouchableOpacity>

                    <ControlButton 
                        icon="chatbubble-ellipses-outline" 
                        onPress={() => setShowChat(true)} 
                    />
                    
                    <ControlButton 
                        icon="settings-outline" 
                        onPress={() => setShowSettings(true)} 
                    />
                </View>
            </View>

            <ChatModal visible={showChat} onClose={() => setShowChat(false)} />
            <SettingsSheet 
                visible={showSettings} 
                onClose={() => setShowSettings(false)} 
                onInvite={handleInvite}
                userId={user?.id}
            />
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 9999, elevation: 9999 }} pointerEvents="box-none">
                <ToastContainer toasts={toasts} onHide={removeToast} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#000', flexDirection: 'column', zIndex: 1000,  },
    
    // Video Area
    videoArea: { flex: 1, backgroundColor: '#111', position: 'relative' },
    cellContent: { flex: 1, backgroundColor: '#1C1C1E', overflow: 'hidden', borderWidth: 1, borderColor: '#000' },
    fill: { flex: 1, width: '100%', height: '100%' },
    placeholder: { justifyContent: 'center', alignItems: 'center', backgroundColor: '#1C1C1E' },
    avatarLarge: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#333' },
    avatarBlurred: { width: '100%', height: '100%', opacity: 0.3, position: 'absolute' },
    videoOffBadge: { position: 'absolute', bottom: -5, right: -5, backgroundColor: '#333', padding: 4, borderRadius: 10 },
    
    nameTagContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 12, paddingBottom: 15, flexDirection: 'row', alignItems: 'center' },
    nameText: { color: '#FFF', fontSize: 13, fontWeight: '700', textShadowColor: 'rgba(0,0,0,0.8)', textShadowRadius: 3 },
    
    dotsContainer: { position: 'absolute', bottom: 15, width: '100%', flexDirection: 'row', justifyContent: 'center' },
    dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.3)', marginHorizontal: 4 },
    activeDot: { backgroundColor: '#FFF', width: 8, height: 8, marginTop: -1 },

    // Controls
    controlBar: { backgroundColor: '#111', width: '100%', paddingTop: 10, borderTopWidth: 1, borderTopColor: '#222' },
    timerRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
    recDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#FF3B30', marginRight: 8 },
    timerText: { color: '#888', fontSize: 13, fontVariant: ['tabular-nums'], fontWeight: '600', letterSpacing: 0.5 },

    controlRow: { flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center' },
    controlBtn: { justifyContent: 'center', alignItems: 'center' },
    endCallBtn: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#FF3B30', justifyContent: 'center', alignItems: 'center' },

    // Modals
    modalContainer: { flex: 1, backgroundColor: '#1C1C1E' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#2C2C2E' },
    modalTitle: { color: '#FFF', fontSize: 17, fontWeight: '600' },
    
    msgRow: { marginVertical: 4, maxWidth: '80%' },
    msgRowRight: { alignSelf: 'flex-end', alignItems: 'flex-end' },
    msgRowLeft: { alignSelf: 'flex-start' },
    senderName: { color: '#888', fontSize: 11, marginLeft: 12, marginBottom: 2 },
    bubble: { padding: 12, borderRadius: 18 },
    bubbleRight: { backgroundColor: '#34C759', borderBottomRightRadius: 4 },
    bubbleLeft: { backgroundColor: '#2C2C2E', borderBottomLeftRadius: 4 },
    msgText: { color: '#FFF', fontSize: 15 },
    
    inputContainer: { flexDirection: 'row', padding: 12, borderTopWidth: 1, borderTopColor: '#2C2C2E', alignItems: 'center', backgroundColor: '#1C1C1E' },
    input: { flex: 1, backgroundColor: '#2C2C2E', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, color: '#FFF', marginRight: 10 },
    sendBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },

    // Settings Modal
    sheetBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
    sheetContent: { backgroundColor: '#1C1C1E', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
    sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 20, position: 'relative' },
    sheetTitle: { color: '#FFF', fontSize: 17, fontWeight: '700' },
    closeBtn: { position: 'absolute', right: 0 },
    backBtn: { position: 'absolute', left: 0 },
    
    menuItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2C2C2E', padding: 16, borderRadius: 12 },
    menuIcon: { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    menuText: { flex: 1, color: '#FFF', fontSize: 16, fontWeight: '500' },
    betaBadge: { backgroundColor: '#FF9F0A', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
    betaText: { color: '#000', fontSize: 10, fontWeight: '700' },
    
    friendRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#2C2C2E' },
    friendImg: { width: 40, height: 40, borderRadius: 20, marginRight: 12, backgroundColor: '#333' },
    friendName: { flex: 1, color: '#FFF', fontSize: 16 },
    emptyText: { color: '#666', textAlign: 'center', marginTop: 20 },
    actionBtn: { backgroundColor: '#0A84FF', padding: 16, borderRadius: 14, alignItems: 'center', marginTop: 20 },
    actionBtnText: { color: '#FFF', fontSize: 16, fontWeight: '600' }
});

export default GroupCallOverlay;