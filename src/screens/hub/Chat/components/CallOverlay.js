import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Animated,
  PanResponder,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Audio } from 'expo-av'; 
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAlert } from '@context/other/AlertContext';
import ToastContainer from '@components/alerts/ToastContainer';

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

const SettingsModal = ({ visible, onClose, insets }) => {
  const { showToast } = useAlert();

  if (!visible) return null;

  const handleSettingPress = (title, status) => {
    showToast(title, status, 'info');
  };

  return (
    <TouchableOpacity activeOpacity={1} onPress={onClose} style={styles.settingsOverlay}>
      <View style={[styles.settingsSheet, { paddingBottom: insets.bottom + 20 }]}>
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

// --- Sub-components (AudioCallUI, VideoCallUI) ---
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

const VideoCallUI = ({ facing, permission, onToggleCamera, insets }) => {
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
      <Animated.View 
        {...panResponder.panHandlers} 
        style={[styles.pipVideo, { transform: [{ translateX: pan.x }, { translateY: pan.y }], top: insets.top + 20 }]}
      >
        {permission?.granted ? (
            <CameraView style={{ flex: 1 }} facing={facing} />
        ) : (
            <View style={styles.pipNoPermission}>
                <Ionicons name="camera-off" size={24} color="#FFF" />
            </View>
        )}
        <TouchableOpacity style={styles.flipBtnSmall} onPress={onToggleCamera}>
          <Ionicons name="camera-reverse" size={16} color="#FFF" />
        </TouchableOpacity>
      </Animated.View>
    </>
  );
};

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
  const [reactions, setReactions] = useState([]); // FIX: Added missing state for reactions
  
  // State to manage if the video view is active
  const [isCameraView, setIsCameraView] = useState(type === 'video');

  const insets = useSafeAreaInsets();
  const { showToast, toasts, removeToast } = useAlert(); 
  const [permission, requestPermission] = useCameraPermissions();
  const timerRef = useRef(null);
  const slideAnim = useRef(new Animated.Value(height)).current;

  useEffect(() => {
    if (visible) {
        setIsCameraView(type === 'video'); // Reset view based on initial call type
        Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 0
        }).start();
        initializeCall();
    } else {
        Animated.timing(slideAnim, {
            toValue: height,
            duration: 300,
            useNativeDriver: true
        }).start(() => cleanupCall());
    }
  }, [visible, type]);

  const initializeCall = async () => {
    setStatus('initializing');
    const camStatus = await requestPermission();
    const audioStatus = await Audio.requestPermissionsAsync();

    if (audioStatus.status !== 'granted') {
      showToast("Permission Required", "Microphone access is needed for calls.", "error");
      onClose();
      return;
    }
    // Note: Camera permission is not required to START a call, only to switch to video.

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
    } catch(e) { /* Fails silently */ }
  };
  
  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setDuration(p => p + 1), 1000);
  };
  const stopTimer = () => { if (timerRef.current) clearInterval(timerRef.current); };

  const handleEndCall = () => {
    const finalDuration = duration;
    const wasConnected = status === 'connected' || duration > 0;
    setStatus('ended');
    stopTimer();
    setTimeout(() => {
        onClose({
            duration: finalDuration,
            wasConnected: wasConnected,
            type: isCameraView ? 'video' : 'voice' // Report final call type
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
  
  // Toggles the camera view between audio and video
  const toggleCameraView = () => {
      if (!permission?.granted) {
          showToast("Camera Permission", "Camera access is required for video.", "info");
          return;
      }
      setIsCameraView(prev => !prev);
  };

  const sendReaction = (emoji) => {
    const newReaction = { id: Date.now(), emoji };
    setReactions(prev => [...prev, newReaction]);
    setTimeout(() => setReactions(p => p.filter(r => r.id !== newReaction.id)), 2500);
  };

  if (!visible && slideAnim._value === height) return null;

  return (
    <Animated.View 
      style={[
        styles.container, 
        StyleSheet.absoluteFill, 
        { transform: [{ translateY: slideAnim }] } 
      ]}
    >
        {/* Background is always dark unless video is active and permission is granted */}
        {(isCameraView && permission?.granted) ? null : (
          <LinearGradient colors={['#1c1c1e', '#000000']} style={StyleSheet.absoluteFill} />
        )}
        
        <View style={[styles.safeArea, { paddingTop: insets.top }]}>
            <View style={styles.contentContainer}>
                {/* REFACTORED: UI now depends on isCameraView state, not the initial 'type' prop */}
                {isCameraView && status === 'connected' ? (
                    <VideoCallUI 
                        facing={facing} 
                        permission={permission} 
                        onToggleCamera={() => setFacing(p => p === 'back' ? 'front' : 'back')} 
                        insets={insets} 
                    />
                ) : (
                    <AudioCallUI user={user} status={status} duration={duration} />
                )}
            </View>

            <View style={[styles.bottomControls, { paddingBottom: insets.bottom + 20 }]}>
                {status === 'connected' && (
                    <View style={styles.reactionRow}>
                        {['😀','😂','😍','🔥','👍'].map(e => (
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
                    
                    {/* REFACTORED: This button now toggles the camera view on/off */}
                    <ControlButton 
                        icon={isCameraView ? "videocam" : "videocam-off"}
                        isActive={!isCameraView} // Active when camera is OFF
                        onPress={toggleCameraView}
                    />
                </View>
            </View>
        </View>
        
        <SettingsModal visible={showSettings} onClose={() => setShowSettings(false)} insets={insets} />
        {reactions.map(r => <AnimatedReaction key={r.id} emoji={r.emoji} />)}
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 9999, elevation: 9999 }} pointerEvents="box-none">
            <ToastContainer toasts={toasts} onHide={removeToast} />
        </View>
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
  container: { 
    flex: 1, 
    backgroundColor: '#000', 
    zIndex: 1000, 
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
  pipVideo: { position: 'absolute', right: 20, width: 100, height: 150, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', backgroundColor: '#333' },
  pipNoPermission: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#222' },
  flipBtnSmall: { position: 'absolute', bottom: 5, right: 5, padding: 5, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20 },
  bottomControls: { width: '100%' },
  reactionRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 20 },
  reactionBtn: { marginHorizontal: 15, padding: 5, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 20 },
  controlRow: { flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center', paddingHorizontal: 10 },
  controlBtn: { justifyContent: 'center', alignItems: 'center' },
  settingsOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end', zIndex: 1100 },
  settingsSheet: { backgroundColor: '#1C1C1E', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
  settingsTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  settingRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
  settingText: { flex: 1, color: '#FFF', fontSize: 16, marginLeft: 15 },
  floatingEmoji: { position: 'absolute', bottom: 150, left: width / 2 - 20 }
});

export default CallOverlay;