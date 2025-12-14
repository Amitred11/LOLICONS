import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Animated,
  PanResponder,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Audio } from 'expo-av'; 
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAlert } from '@context/other/AlertContext';
import ToastContainer from '@components/alerts/ToastContainer';

const { width, height } = Dimensions.get('window');

// ... [Keep ControlButton and SettingsModal components exactly as they were] ...
const ControlButton = ({ onPress, icon, color = '#FFF', bg = 'rgba(255,255,255,0.15)', size = 50, isActive = false, activeColor = '#000', activeBg = '#FFF' }) => (
  <TouchableOpacity 
    style={[
      styles.controlBtn, 
      { 
        width: size, 
        height: size, 
        borderRadius: size/2, 
        backgroundColor: isActive ? activeBg : bg,
      }
    ]} 
    activeOpacity={0.7}
    onPress={onPress}
  >
    <Ionicons name={icon} size={size * 0.45} color={isActive ? activeColor : color} />
  </TouchableOpacity>
);

const SettingsModal = ({ visible, onClose, insets, onReaction }) => {
    // ... [Keep existing implementation] ...
    const { showToast } = useAlert();
    if (!visible) return null;
    const handleSettingPress = (title, status) => showToast(title, status, 'info');
  
    return (
      <TouchableOpacity activeOpacity={1} onPress={onClose} style={styles.settingsOverlay}>
        <View style={[styles.settingsSheet, { paddingBottom: insets.bottom + 20 }]}>
          <View style={styles.sheetHandle} />
          <Text style={styles.settingsSectionTitle}>Reactions</Text>
          <View style={styles.modalReactionContainer}>
               {['😀','😂','❤️','🔥','👋','👍','🎉'].map(e => (
                  <TouchableOpacity key={e} onPress={() => { onReaction(e); onClose(); }} style={styles.modalReactionBtn}>
                      <Text style={{fontSize: 32}}>{e}</Text>
                  </TouchableOpacity>
              ))}
          </View>
          <View style={styles.divider} />
          <Text style={styles.settingsSectionTitle}>Call Settings</Text>
           {/* ... Keep rest of settings ... */}
           <View style={{padding: 20}}><Text style={{color:'#666', textAlign:'center'}}>Settings Content</Text></View>
        </View>
      </TouchableOpacity>
    );
  };

// ... [Keep AudioCallUI and VideoCallUI exactly as they were] ...
const AudioCallUI = ({ user, status, duration }) => (
    <View style={styles.centerContent}>
      <View style={styles.avatarContainer}>
        <View style={[styles.pulsingRing, { borderColor: status === 'connected' ? 'rgba(52, 199, 89, 0.5)' : 'rgba(255, 214, 10, 0.5)' }]} />
        <View style={[styles.pulsingRingInner, { borderColor: status === 'connected' ? 'rgba(52, 199, 89, 0.8)' : 'rgba(255, 214, 10, 0.8)' }]} />
        <Image source={{ uri: user?.avatar || 'https://i.pravatar.cc/150' }} style={styles.callAvatar} />
      </View>
      <View style={styles.infoContainer}>
          <Text style={styles.callName}>{user?.name || 'Unknown User'}</Text>
          <Text style={styles.callStatus}>
              {status === 'connecting' ? 'Calling...' : status === 'initializing' ? 'Connecting...' : formatTime(duration)}
          </Text>
      </View>
    </View>
  );

const VideoCallUI = ({ facing, permission, onToggleCamera, insets }) => {
    // ... [Keep existing implementation] ...
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
        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.95)']} locations={[0.7, 0.85, 1]} style={StyleSheet.absoluteFill} pointerEvents="none" />
        <Animated.View {...panResponder.panHandlers} style={[styles.pipShadowContainer, { transform: [{ translateX: pan.x }, { translateY: pan.y }], top: insets.top - 50 }]}>
          <View style={styles.pipClippingContainer} renderToHardwareTextureAndroid={true}>
              {permission?.granted ? <CameraView style={styles.innerCamera} facing={facing} /> : <View style={styles.pipNoPermission}><Ionicons name="camera-off" size={24} color="#FFF" /></View>}
              <View style={styles.pipBorderOverlay} pointerEvents="none" />
              <TouchableOpacity style={styles.flipBtnSmall} onPress={onToggleCamera}><Ionicons name="camera-reverse" size={16} color="#FFF" /></TouchableOpacity>
          </View>
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
const CallOverlay = ({ visible, user, type, onClose, isMinimized, onMinimize }) => {
  const [status, setStatus] = useState('initializing');
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);
  const [facing, setFacing] = useState('front');
  const [showSettings, setShowSettings] = useState(false);
  const [reactions, setReactions] = useState([]);
  
  const [isCameraView, setIsCameraView] = useState(type === 'video');

  const insets = useSafeAreaInsets();
  const { showToast, toasts, removeToast } = useAlert(); 
  const [permission, requestPermission] = useCameraPermissions();
  const timerRef = useRef(null);
  const slideAnim = useRef(new Animated.Value(height)).current;

  // Handle Entrance/Exit Animations
  useEffect(() => {
    if (visible) {
        setIsCameraView(type === 'video'); 
        Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 0,
            speed: 12
        }).start();
        initializeCall();
    } else {
        // Only run exit animation if NOT minimized (actually ending)
        Animated.timing(slideAnim, {
            toValue: height,
            duration: 300,
            useNativeDriver: true
        }).start(() => cleanupCall());
    }
  }, [visible]); // Removed type from dependency to prevent reset on type switch

  const initializeCall = async () => {
    if (status === 'connected') return; // Prevent re-init

    setStatus('initializing');
    const camStatus = await requestPermission();
    const audioStatus = await Audio.requestPermissionsAsync();

    if (audioStatus.status !== 'granted') {
      showToast("Permission Required", "Microphone access is needed for calls.", "error");
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
    } catch(e) { }
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
    
    // Animate out before closing
    Animated.timing(slideAnim, {
        toValue: height,
        duration: 300,
        useNativeDriver: true
    }).start(() => {
        onClose({
            duration: finalDuration,
            wasConnected: wasConnected,
            type: isCameraView ? 'video' : 'voice' 
        });
    });
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

  // If minimized, we return NULL to hide the UI, 
  // BUT the component remains mounted in parent, so hooks (Timer, Audio) keep running.
  if (isMinimized) return null;

  if (!visible && slideAnim._value === height) return null;

  return (
    <Animated.View 
      style={[
        styles.container, 
        StyleSheet.absoluteFill, 
        { transform: [{ translateY: slideAnim }] } 
      ]}
    >
        {(isCameraView && permission?.granted) ? null : (
          <LinearGradient 
            colors={['#2c2c2e', '#1c1c1e', '#000000']} 
            locations={[0, 0.4, 1]}
            style={StyleSheet.absoluteFill} 
          />
        )}
        
        <View style={[styles.safeArea, { paddingTop: insets.top }]}>
            {/* Top Bar */}
            <View style={styles.topHeader}>
                {/* CHANGED: Minimize Button calls onMinimize instead of onClose */}
                <TouchableOpacity onPress={onMinimize} style={styles.minimizeBtn}>
                    <Ionicons name="chevron-down" size={20} color="rgba(255,255,255,0.8)" />
                </TouchableOpacity>
                
                {!isCameraView && (
                    <View style={styles.secureBadge}>
                        <Ionicons name="lock-closed" size={10} color="#34C759" />
                        <Text style={styles.secureText}>Encrypted</Text>
                    </View>
                )}
                {/* Spacer for layout balance */}
                <View style={{width: 44}} /> 
            </View>

            <View style={styles.contentContainer}>
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

            <View style={[styles.bottomControls, { paddingBottom: insets.bottom + 10 }]}>
                <View style={styles.glassDock}>
                    <ControlButton icon="settings-sharp" size={44} onPress={() => setShowSettings(true)} />
                    <ControlButton icon={isCameraView ? "videocam" : "videocam-off"} isActive={isCameraView} size={44} onPress={toggleCameraView} />
                    <ControlButton icon={isMuted ? "mic-off" : "mic"} isActive={isMuted} size={44} onPress={() => setIsMuted(!isMuted)} />
                    <ControlButton icon={isSpeaker ? "volume-high" : "volume-low"} isActive={isSpeaker} size={44} onPress={toggleSpeaker} />
                    <View style={styles.separator} />
                    <ControlButton icon="call" color="#FFF" bg="#FF453A" size={56} onPress={handleEndCall} />
                </View>
            </View>
        </View>
        
        <SettingsModal 
            visible={showSettings} 
            onClose={() => setShowSettings(false)} 
            insets={insets} 
            onReaction={sendReaction}
        />
        
        {reactions.map(r => <AnimatedReaction key={r.id} emoji={r.emoji} />)}
        
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 9999, elevation: 9999 }} pointerEvents="box-none">
            <ToastContainer toasts={toasts} onHide={removeToast} />
        </View>
    </Animated.View>
  );
};

// ... [Keep AnimatedReaction and styles exactly as they were] ...
const AnimatedReaction = ({ emoji }) => {
    const anim = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        Animated.timing(anim, { toValue: 1, duration: 2500, useNativeDriver: true }).start();
    }, []);

    const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, -height * 0.6] });
    const scale = anim.interpolate({ inputRange: [0, 0.2, 0.8, 1], outputRange: [0.5, 1.5, 1, 0] });
    const opacity = anim.interpolate({ inputRange: [0, 0.8, 1], outputRange: [1, 1, 0] });
    const wobble = anim.interpolate({ 
        inputRange: [0, 0.3, 0.6, 1], 
        outputRange: ['0deg', '-20deg', '20deg', '0deg'] 
    });
    const randomX = Math.random() * 100 - 50;

    return (
        <Animated.View style={[styles.floatingEmoji, { opacity, transform: [{ translateY }, { translateX: randomX }, { scale }, { rotate: wobble }] }]}>
            <Text style={{fontSize: 50}}>{emoji}</Text>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#000', 
    zIndex: 2000, // High z-index to sit on top of everything
    elevation: 2000, 
  },
  safeArea: { flex: 1 },
  topHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 10, zIndex: 10 },
  minimizeBtn: { padding: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 20, bottom: 1, },
  secureBadge: { flexDirection: 'row', alignItems: 'center', bottom: 1, backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  secureText: { color: 'rgba(255,255,255,0.7)', fontSize: 10, marginLeft: 4, fontWeight: '500' },
  contentContainer: { flex: 1, justifyContent: 'center' },
  centerContent: { alignItems: 'center', justifyContent: 'center', width: '100%' },
  avatarContainer: { marginBottom: 35, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  callAvatar: { width: 140, height: 140, borderRadius: 70, borderWidth: 3, borderColor: '#FFF', zIndex: 2 },
  pulsingRing: { position: 'absolute', width: 220, height: 220, borderRadius: 110, borderWidth: 1, opacity: 0.3, zIndex: 1 },
  pulsingRingInner: { position: 'absolute', width: 170, height: 170, borderRadius: 85, borderWidth: 1.5, opacity: 0.5, zIndex: 1 },
  infoContainer: { alignItems: 'center' },
  callName: { fontSize: 32, fontWeight: '700', color: '#FFF', marginBottom: 8, letterSpacing: 0.5, textAlign: 'center' },
  callStatus: { fontSize: 16, color: 'rgba(255,255,255,0.7)', letterSpacing: 1, fontWeight: '400', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
  pipShadowContainer: { 
    position: 'absolute', 
    right: 20, 
    width: 130, 
    height: 170, 
    backgroundColor: 'transparent',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
    borderRadius: 20,
    zIndex: 20,
  },
  pipClippingContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
    overflow: 'hidden', 
    zIndex: 1, 
    borderRadius: 20,
  },
  innerCamera: { flex: 1, borderRadius: 25 },
  pipBorderOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
    zIndex: 999,
  },
  pipNoPermission: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#333', borderRadius: 24 },
  flipBtnSmall: { position: 'absolute', bottom: 10, right: 10, padding: 8, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 20, zIndex: 1000 },
  bottomControls: { width: '100%', alignItems: 'center', justifyContent: 'flex-end' },
  glassDock: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(30, 30, 30, 0.85)', borderRadius: 45, padding: 12, paddingHorizontal: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', gap: 14, shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.4, shadowRadius: 15, elevation: 10 },
  separator: { width: 1, height: 25, backgroundColor: 'rgba(255,255,255,0.1)', marginHorizontal: 5 },
  controlBtn: { justifyContent: 'center', alignItems: 'center' },
  settingsOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end', zIndex: 1100 },
  settingsSheet: { backgroundColor: '#1C1C1E', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20 },
  sheetHandle: { width: 40, height: 4, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  settingsSectionTitle: { color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: '700', marginBottom: 10, marginLeft: 5, textTransform: 'uppercase' },
  modalReactionContainer: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 10, marginBottom: 20 },
  modalReactionBtn: { width: 45, height: 45, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12 },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginVertical: 15 },
  floatingEmoji: { position: 'absolute', bottom: 180, left: width / 2 - 25, zIndex: 100 }
});

export default CallOverlay;