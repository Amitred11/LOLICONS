import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, StyleSheet, Modal, Image, TouchableOpacity, 
  SafeAreaView, Alert, Platform 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera'; // Modern API
import { Audio } from 'expo-av'; 

const CallOverlay = ({ visible, user, type, onClose }) => {
  // --- State ---
  const [callStatus, setCallStatus] = useState('connecting'); // connecting | connected | ended
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);
  
  // Camera State
  const [facing, setFacing] = useState('front'); // 'front' or 'back'
  const [permission, requestPermission] = useCameraPermissions();
  const [micPermission, setMicPermission] = useState(false);

  const timerRef = useRef(null);

  // --- 1. Initialize Call (Permissions & Audio Mode) ---
  useEffect(() => {
    if (visible) {
      initializeCall();
    } else {
      cleanupCall();
    }
    return () => cleanupCall();
  }, [visible]);

  const initializeCall = async () => {
    // A. Request Permissions
    const camStatus = await requestPermission();
    const audioStatus = await Audio.requestPermissionsAsync();
    setMicPermission(audioStatus.status === 'granted');

    if (!camStatus.granted || audioStatus.status !== 'granted') {
      Alert.alert("Permissions Required", "Please allow Camera and Microphone access to make calls.");
      onClose();
      return;
    }

    // B. Configure Audio for Voice Call (Earpiece vs Speaker)
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        // Default to earpiece (false) unless it's a video call (usually speaker)
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: type === 'voice', 
      });
    } catch (e) {
      console.log("Audio Config Error:", e);
    }

    // C. Connect
    setTimeout(() => {
      setCallStatus('connected');
      startTimer();
    }, 1500); // Simulate connection delay
  };

  const cleanupCall = () => {
    stopTimer();
    setDuration(0);
    setCallStatus('connecting');
    setIsMuted(false);
    setIsSpeaker(false);
    // Reset Audio to default media mode
    Audio.setAudioModeAsync({ allowsRecordingIOS: false }); 
  };

  // --- 2. Timer Logic ---
  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setDuration(prev => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // --- 3. Actions ---
  const handleEndCall = () => {
    setCallStatus('ended');
    stopTimer();
    setTimeout(onClose, 500);
  };

  const toggleCamera = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const toggleSpeaker = async () => {
    const newMode = !isSpeaker;
    setIsSpeaker(newMode);
    // Real Audio Routing
    // Note: On iOS, playsInSilentModeIOS handles most routing. 
    // On Android, we explicitly switch.
    if(Platform.OS === 'android') {
        await Audio.setAudioModeAsync({
            playThroughEarpieceAndroid: !newMode
        });
    }
  };

  if (!visible || !user) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={handleEndCall}>
      <View style={styles.container}>
        
        {/* --- REAL VIDEO FEED --- */}
        {type === 'video' && permission?.granted ? (
            <CameraView 
                style={StyleSheet.absoluteFill} 
                facing={facing}
            >
                 <LinearGradient 
                    colors={['rgba(0,0,0,0.4)', 'transparent', 'rgba(0,0,0,0.8)']} 
                    style={StyleSheet.absoluteFill} 
                />
            </CameraView>
        ) : (
            // Audio Background
            <LinearGradient colors={['#203A43', '#2C5364']} style={StyleSheet.absoluteFill} />
        )}

        <SafeAreaView style={styles.safeArea}>
            
            {/* Header Info */}
            <View style={styles.callHeader}>
                <View style={styles.avatarContainer}>
                    {/* Only show avatar if audio call OR connecting */}
                    {(type === 'voice' || callStatus === 'connecting') && (
                        <Image source={{ uri: user.avatar || 'https://i.pravatar.cc/150' }} style={styles.callAvatar} />
                    )}
                    {callStatus === 'connected' && type === 'voice' && (
                        <View style={styles.audioWave} /> // Placeholder for audio visualizer
                    )}
                </View>
                
                <Text style={styles.callName}>{user.name}</Text>
                <Text style={styles.callStatus}>
                    {callStatus === 'connecting' 
                        ? (type === 'video' ? 'Connecting Video...' : 'Calling...') 
                        : formatTime(duration)
                    }
                </Text>
            </View>

            {/* Camera Flip Button (Video Only) */}
            {type === 'video' && callStatus === 'connected' && (
                <TouchableOpacity style={styles.flipBtn} onPress={toggleCamera}>
                    <Ionicons name="camera-reverse" size={28} color="#FFF" />
                </TouchableOpacity>
            )}

            {/* Controls */}
            <View style={styles.callActions}>
                
                {/* Mute */}
                <TouchableOpacity 
                    style={[styles.secondaryBtn, isMuted && styles.activeBtn]} 
                    onPress={() => setIsMuted(!isMuted)}
                >
                    <Ionicons name={isMuted ? "mic-off" : "mic"} size={28} color={isMuted ? "#000" : "#FFF"} />
                    <Text style={[styles.btnLabel, isMuted && {color:'#000'}]}>Mute</Text>
                </TouchableOpacity>

                {/* End Call */}
                <TouchableOpacity 
                    style={styles.endBtn}
                    onPress={handleEndCall}
                >
                    <Ionicons name="call" size={32} color="#FFF" style={{ transform: [{ rotate: '135deg' }] }} />
                </TouchableOpacity>

                {/* Speaker */}
                <TouchableOpacity 
                    style={[styles.secondaryBtn, isSpeaker && styles.activeBtn]}
                    onPress={toggleSpeaker}
                >
                    <Ionicons name={isSpeaker ? "volume-high" : "volume-off"} size={28} color={isSpeaker ? "#000" : "#FFF"} />
                    <Text style={[styles.btnLabel, isSpeaker && {color:'#000'}]}>Speaker</Text>
                </TouchableOpacity>

            </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111' },
  safeArea: { flex: 1, justifyContent: 'space-between', paddingVertical: 50 },
  
  callHeader: { alignItems: 'center', width: '100%', marginTop: 60 },
  
  avatarContainer: { marginBottom: 20, alignItems: 'center', justifyContent: 'center' },
  callAvatar: { width: 120, height: 120, borderRadius: 60, borderWidth: 3, borderColor: 'rgba(255,255,255,0.2)' },
  
  callName: { fontSize: 32, color: '#FFF', fontWeight: '700', marginBottom: 8, textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 5 },
  callStatus: { fontSize: 18, color: 'rgba(255,255,255,0.8)', fontWeight: '500', letterSpacing: 1 },
  
  callActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly', width: '100%', paddingHorizontal: 30, marginBottom: 20 },
  
  endBtn: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#FF453A', justifyContent: 'center', alignItems: 'center', elevation: 5 },
  
  secondaryBtn: { alignItems: 'center', justifyContent: 'center', width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(255,255,255,0.15)' },
  activeBtn: { backgroundColor: '#FFF' },
  
  btnLabel: { position: 'absolute', bottom: -20, color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '600' },

  flipBtn: { position: 'absolute', top: 60, right: 30, width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' }
});

export default CallOverlay;