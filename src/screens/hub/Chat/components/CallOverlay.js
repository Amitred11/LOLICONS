import React from 'react';
import { View, Text, StyleSheet, Modal, Image, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const CallOverlay = ({ visible, user, type, onClose }) => {
  const insets = useSafeAreaInsets();

  if (!visible || !user) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <LinearGradient colors={['#1a2a6c', '#b21f1f', '#fdbb2d']} style={styles.callContainer}>
        
        {/* Header Info */}
        <View style={[styles.callHeader, { marginTop: insets.top + 60 }]}>
            <View style={styles.avatarContainer}>
                <Image source={{ uri: user.avatar || 'https://i.pravatar.cc/150' }} style={styles.callAvatar} />
                <View style={[styles.indicator, { backgroundColor: type === 'video' ? '#34C759' : '#007AFF' }]} />
            </View>
            <Text style={styles.callName}>{user.name}</Text>
            <Text style={styles.callStatus}>
                {type === 'video' ? 'Incoming Video Call...' : 'Calling...'}
            </Text>
        </View>

        {/* Action Buttons */}
        <View style={[styles.callActions, { marginBottom: insets.bottom + 50 }]}>
            
            {/* Mute Button */}
            <TouchableOpacity style={styles.secondaryBtn}>
                <Ionicons name="mic-off" size={24} color="#FFF" />
                <Text style={styles.btnLabel}>Mute</Text>
            </TouchableOpacity>

            {/* End Call Button */}
            <TouchableOpacity 
                style={[styles.callBtn, { backgroundColor: '#FF453A' }]}
                onPress={onClose}
            >
                <Ionicons name="call" size={32} color="#FFF" style={{ transform: [{ rotate: '135deg' }] }} />
            </TouchableOpacity>

            {/* Speaker Button */}
            <TouchableOpacity style={styles.secondaryBtn}>
                <Ionicons name="volume-high" size={24} color="#FFF" />
                <Text style={styles.btnLabel}>Speaker</Text>
            </TouchableOpacity>

        </View>
      </LinearGradient>
    </Modal>
  );
};

const styles = StyleSheet.create({
  callContainer: { flex: 1, alignItems: 'center', justifyContent: 'space-between' },
  callHeader: { alignItems: 'center', width: '100%' },
  avatarContainer: { position: 'relative', marginBottom: 25 },
  callAvatar: { width: 140, height: 140, borderRadius: 70, borderWidth: 4, borderColor: 'rgba(255,255,255,0.3)' },
  indicator: { position: 'absolute', bottom: 5, right: 10, width: 24, height: 24, borderRadius: 12, borderWidth: 3, borderColor: '#fff' },
  callName: { fontSize: 32, color: '#FFF', fontWeight: '800', marginBottom: 8, textShadowColor: 'rgba(0,0,0,0.3)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4 },
  callStatus: { fontSize: 18, color: 'rgba(255,255,255,0.8)', letterSpacing: 0.5 },
  callActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly', width: '100%', paddingHorizontal: 40 },
  callBtn: { width: 72, height: 72, borderRadius: 36, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 8 },
  secondaryBtn: { alignItems: 'center', gap: 8 },
  btnLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '500' }
});

export default CallOverlay;