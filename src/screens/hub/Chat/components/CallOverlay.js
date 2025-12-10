import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  // Modal, // <-- REMOVE THIS
  Image,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  FlatList,
  Animated,
  PanResponder,
  Dimensions,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Audio } from 'expo-av'; 

import { useAlert } from '@context/other/AlertContext';

const { width, height } = Dimensions.get('window');


// --- Helper Components ---
const ControlButton = ({ onPress, icon, color = '#FFF', bg = 'rgba(255,255,255,0.15)', size = 50, isActive = false, activeColor = '#000', activeBg = '#FFF' }) => (
  <TouchableOpacity 
    style={[styles.controlBtn, { width: size, height: size, borderRadius: size/2, backgroundColor: isActive ? activeBg : bg }]} 
    onPress={onPress}
  >
    <Ionicons name={icon} size={size * 0.45} color={isActive ? activeColor : color} />
  </TouchableOpacity>
);

const SettingsModal = ({ visible, onClose }) => {
  const { showToast } = useAlert();

  if (!visible) return null;

  const handleSettingPress = (title, status) => {
    // Now this WILL work because CallOverlay is no longer a native Modal
    showToast(title, status, 'info');
  };

  return (
    <TouchableOpacity activeOpacity={1} onPress={onClose} style={styles.settingsOverlay}>
      <View style={styles.settingsSheet}>
        <Text style={styles.settingsTitle}>Audio Settings</Text>
        <TouchableOpacity style={styles.settingRow} onPress={() => handleSettingPress("Noise Cancellation", "Enabled")}>
            <Ionicons name="mic-outline" size={24} color="#FFF" />
            <Text style={styles.settingText}>Noise Cancellation</Text>
            <Ionicons name="toggle" size={24} color="#34C759" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingRow} onPress={() => handleSettingPress("Input Device", "Default Mic Selected")}>
            <Ionicons name="headset-outline" size={24} color="#FFF" />
            <Text style={styles.settingText}>Input Device</Text>
            <Ionicons name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingRow} onPress={() => handleSettingPress("Connection", "High Quality")}>
            <Ionicons name="cellular-outline" size={24} color="#FFF" />
            <Text style={styles.settingText}>Connection Quality</Text>
            <Text style={{color: '#34C759', fontSize: 12}}>Excellent</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

// --- Sub-components (AudioCallUI, VideoCallUI, GroupCallUI) ---
// (Kept exactly the same as your previous code for brevity)
const AudioCallUI = ({ user, status, duration }) => (
  <View style={styles.centerContent}>
    <View style={styles.avatarContainer}>
      <Image source={{ uri: user?.avatar || 'https://i.pravatar.cc/150' }} style={styles.callAvatar} />
      <View style={[styles.pulsingRing, { borderColor: status === 'connected' ? '#34C759' : '#FFD60A' }]} />
    </View>
    <Text style={styles.callName}>{user?.name || 'Unknown User'}</Text>
    <Text style={styles.callStatus}>{status === 'connecting' ? 'Calling...' : status === 'initializing' ? 'Connecting...' : formatTime(duration)}</Text>
  </View>
);

const VideoCallUI = ({ facing, permission, onToggleCamera }) => {
  const pan = useRef(new Animated.ValueXY()).current;
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }),
      onPanResponderRelease: () => { Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start(); },
    })
  ).current;

  return (
    <>
      <CameraView style={StyleSheet.absoluteFill} facing={facing === 'front' ? 'back' : 'front'} />
      <Animated.View {...panResponder.panHandlers} style={[styles.pipVideo, { transform: [{ translateX: pan.x }, { translateY: pan.y }] }]}>
        {permission?.granted && <CameraView style={{ flex: 1 }} facing={facing} />}
        <TouchableOpacity style={styles.flipBtnSmall} onPress={onToggleCamera}>
          <Ionicons name="camera-reverse" size={16} color="#FFF" />
        </TouchableOpacity>
      </Animated.View>
    </>
  );
};

const GroupCallUI = ({ participants }) => (
  <View style={styles.gridContainer}>
      <FlatList
        data={participants}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.gridContent}
        renderItem={({ item }) => (
        <View style={styles.gridItem}>
            <Image source={{ uri: item.avatar }} style={styles.gridAvatar} />
            <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={styles.gridOverlay}>
                <Text style={styles.gridName}>{item.name}</Text>
                {item.isMuted && <Ionicons name="mic-off" size={16} color="#FF453A" />}
            </LinearGradient>
        </View>
        )}
      />
  </View>
);

const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

// --- Main Component ---

const CallOverlay = ({ visible, user, type, onClose }) => {
  const [status, setStatus] = useState('initializing');
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);
  const [facing, setFacing] = useState('front');
  const [showSettings, setShowSettings] = useState(false);
  const [reactions, setReactions] = useState([]);
  
  const { showToast } = useAlert();
  const [permission, requestPermission] = useCameraPermissions();
  const timerRef = useRef(null);

  // Animation for the Overlay entering/exiting
  const slideAnim = useRef(new Animated.Value(height)).current;

  const [participants] = useState([
    { id: '1', name: 'You', avatar: 'https://i.pravatar.cc/150?u=1', isMuted: true },
    { id: '2', name: 'Jane', avatar: 'https://i.pravatar.cc/150?u=2', isMuted: false },
    { id: '3', name: 'John', avatar: 'https://i.pravatar.cc/150?u=3', isMuted: false },
    { id: '4', name: 'Emily', avatar: 'https://i.pravatar.cc/150?u=4', isMuted: true },
  ]);

  useEffect(() => {
    if (visible) {
        // Animate In
        Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 0
        }).start();
        initializeCall();
    } else {
        // Animate Out
        Animated.timing(slideAnim, {
            toValue: height,
            duration: 300,
            useNativeDriver: true
        }).start(() => cleanupCall());
    }
  }, [visible]);

  const initializeCall = async () => {
    setStatus('initializing');
    const camStatus = await requestPermission();
    const audioStatus = await Audio.requestPermissionsAsync();

    if (!camStatus.granted || audioStatus.status !== 'granted') {
      showToast("Permission Required", "Camera and Microphone access are needed.");
      onClose();
      return;
    }

    try {
        await Audio.setAudioModeAsync({
            allowsRecordingIOS: true,
            playsInSilentModeIOS: true,
            staysActiveInBackground: true,
            playThroughEarpieceAndroid: type === 'voice', 
        });
        setIsSpeaker(type !== 'voice');
    } catch (e) {
        console.error("Audio Init Error", e);
    }

    setStatus('connecting');
    setTimeout(() => {
        setStatus('connected');
        startTimer();
    }, 1500);
  };

  const cleanupCall = async () => {
    stopTimer();
    setDuration(0);
    setStatus('initializing');
    setIsMuted(false);
    setIsSpeaker(false);
    try {
        if (Audio) {
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: false,
                playsInSilentModeIOS: false,
            });
        }
    } catch(e) {}
  };
  
  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setDuration(p => p + 1), 1000);
  };
  const stopTimer = () => { if (timerRef.current) clearInterval(timerRef.current); };

  const handleEndCall = () => {
    // Capture state before resetting
    const finalDuration = duration;
    const wasConnected = status === 'connected' || duration > 0;
    
    setStatus('ended');
    stopTimer();
    
    // Wait for the "End Call" animation/delay, then pass data back
    setTimeout(() => {
        onClose({
            duration: finalDuration,
            wasConnected: wasConnected,
            type: type
        });
    }, 500);
  };

  const toggleSpeaker = async () => {
    try {
        const nextState = !isSpeaker;
        await Audio.setAudioModeAsync({
            allowsRecordingIOS: true,
            playThroughEarpieceAndroid: !nextState 
        });
        setIsSpeaker(nextState);
    } catch (error) {
        showToast("Error", "Could not toggle speaker", "error");
    }
  };

  const sendReaction = (emoji) => {
    const newReaction = { id: Date.now(), emoji };
    setReactions(prev => [...prev, newReaction]);
    setTimeout(() => setReactions(p => p.filter(r => r.id !== newReaction.id)), 2500);
  };

  // If not visible and animation is done, we could return null, 
  // but Animated.View handles off-screen positioning via `slideAnim`.
  // However, to prevent rendering overhead when closed:
  if (!visible && slideAnim._value === height) return null;

  return (
    // REPLACED <Modal> with <Animated.View>
    <Animated.View 
      style={[
        styles.container, 
        StyleSheet.absoluteFill, // Covers entire screen
        { transform: [{ translateY: slideAnim }] } // Slide animation
      ]}
    >
        {/* Background */}
        {(type === 'video' && permission?.granted) ? null : (
          <LinearGradient colors={['#1c1c1e', '#000000']} style={StyleSheet.absoluteFill} />
        )}
        
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.contentContainer}>
                {type === 'group' ? (
                    <GroupCallUI participants={participants} />
                ) : type === 'video' && status === 'connected' ? (
                    <VideoCallUI facing={facing} permission={permission} onToggleCamera={() => setFacing(p => p === 'back' ? 'front' : 'back')} />
                ) : (
                    <AudioCallUI user={user} status={status} duration={duration} />
                )}
            </View>

            <View style={styles.bottomControls}>
                {status === 'connected' && (
                    <View style={styles.reactionRow}>
                        {['❤️','👍','😂','👋'].map(e => (
                            <TouchableOpacity key={e} onPress={() => sendReaction(e)} style={styles.reactionBtn}>
                                <Text style={{fontSize: 24}}>{e}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                <View style={styles.controlRow}>
                    <ControlButton icon="settings-sharp" onPress={() => setShowSettings(true)} />
                    <ControlButton icon={isMuted ? "mic-off" : "mic"} isActive={isMuted} onPress={() => setIsMuted(!isMuted)} />
                    <ControlButton icon="call" color="#FFF" bg="#FF3B30" size={64} onPress={handleEndCall} />
                    <ControlButton icon={isSpeaker ? "volume-high" : "volume-low"} isActive={isSpeaker} onPress={toggleSpeaker} />
                    {type === 'video' ? (
                        <ControlButton icon="camera-reverse" onPress={() => setFacing(p => p === 'back' ? 'front' : 'back')} />
                    ) : (
                        <ControlButton icon="videocam" onPress={() => showToast("Switching", "Video request sent...", "info")} />
                    )}
                </View>
            </View>
        </SafeAreaView>
        
        <SettingsModal visible={showSettings} onClose={() => setShowSettings(false)} />
        {reactions.map(r => <AnimatedReaction key={r.id} emoji={r.emoji} />)}
    </Animated.View>
  );
};

const AnimatedReaction = ({ emoji }) => {
    const anim = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        Animated.timing(anim, { toValue: 1, duration: 2000, useNativeDriver: true }).start();
    }, []);

    const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, -400] });
    const opacity = anim.interpolate({ inputRange: [0, 0.8, 1], outputRange: [1, 1, 0] });
    const randomX = Math.random() * 100 - 50;

    return (
        <Animated.View style={[styles.floatingEmoji, { opacity, transform: [{ translateY }, { translateX: randomX }] }]}>
            <Text style={{fontSize: 40}}>{emoji}</Text>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
  // UPDATED CONTAINER STYLE
  container: { 
    flex: 1, 
    backgroundColor: '#000', 
    zIndex: 1000, // High, but lower than Toast (2000)
    elevation: 1000, 
  },
  safeArea: { flex: 1 },
  contentContainer: { flex: 1, justifyContent: 'center' },
  centerContent: { alignItems: 'center', justifyContent: 'center' },
  avatarContainer: { marginBottom: 25, justifyContent: 'center', alignItems: 'center' },
  callAvatar: { width: 140, height: 140, borderRadius: 70, borderWidth: 3, borderColor: '#FFF' },
  pulsingRing: { position: 'absolute', width: 156, height: 156, borderRadius: 78, borderWidth: 2, opacity: 0.5 },
  callName: { fontSize: 28, fontWeight: '700', color: '#FFF', marginBottom: 8 },
  callStatus: { fontSize: 16, color: 'rgba(255,255,255,0.6)', letterSpacing: 0.5 },
  pipVideo: { position: 'absolute', top: 20, right: 20, width: 100, height: 150, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', backgroundColor: '#333' },
  flipBtnSmall: { position: 'absolute', bottom: 5, right: 5, padding: 5, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20 },
  gridContainer: { flex: 1, paddingTop: 40 },
  gridContent: { alignItems: 'center' },
  gridItem: { width: width * 0.45, height: width * 0.55, margin: 5, borderRadius: 15, overflow: 'hidden', backgroundColor: '#333' },
  gridAvatar: { width: '100%', height: '100%' },
  gridOverlay: { position: 'absolute', bottom: 0, width: '100%', padding: 10, flexDirection: 'row', justifyContent: 'space-between' },
  gridName: { color: '#FFF', fontWeight: 'bold' },
  bottomControls: { paddingBottom: 20, width: '100%' },
  reactionRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 20 },
  reactionBtn: { marginHorizontal: 15, padding: 5, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 20 },
  controlRow: { flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center', paddingHorizontal: 10 },
  controlBtn: { justifyContent: 'center', alignItems: 'center' },
  settingsOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end', zIndex: 1100 }, // Higher than container
  settingsSheet: { backgroundColor: '#1C1C1E', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 40 },
  settingsTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  settingRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
  settingText: { flex: 1, color: '#FFF', fontSize: 16, marginLeft: 15 },
  floatingEmoji: { position: 'absolute', bottom: 150, left: width / 2 - 20 }
});

export default CallOverlay;