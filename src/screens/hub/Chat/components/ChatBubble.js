import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@config/Colors';

const ChatBubble = ({ message, isMe, showSender }) => {
  return (
    <View style={[styles.wrapper, isMe ? styles.wrapperMe : styles.wrapperThem]}>
      {/* Avatar (Them) */}
      {!isMe && showSender && (
        <View style={styles.avatarContainer}>
          <Image source={{ uri: message.avatar }} style={styles.avatar} />
          {/* Decorative ring */}
          <View style={styles.avatarRing} />
        </View>
      )}
      
      <View style={{ maxWidth: '75%' }}>
        {!isMe && showSender && (
          <Text style={styles.senderName}>{message.senderName}</Text>
        )}

        {isMe ? (
          <LinearGradient
            colors={[Colors.primary, '#2E86DE']} // Vibrant Blue Gradient
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={[styles.bubble, styles.bubbleMe]}
          >
            <Text style={styles.textMe}>{message.text}</Text>
          </LinearGradient>
        ) : (
          <View style={[styles.bubble, styles.bubbleThem]}>
            <Text style={styles.textThem}>{message.text}</Text>
          </View>
        )}
        
        <Text style={[styles.time, isMe ? { textAlign: 'right' } : { textAlign: 'left' }]}>
          {message.time}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 16 },
  wrapperMe: { justifyContent: 'flex-end' },
  wrapperThem: { justifyContent: 'flex-start' },
  
  avatarContainer: { marginRight: 10, position: 'relative' },
  avatar: { width: 34, height: 34, borderRadius: 12, zIndex: 2 }, // Squircle avatar
  avatarRing: { 
    position: 'absolute', width: 38, height: 38, borderRadius: 14, 
    backgroundColor: Colors.secondary, opacity: 0.3, top: -2, left: -2, zIndex: 1 
  },
  
  senderName: { color: Colors.secondary, fontSize: 10, marginLeft: 4, marginBottom: 4, fontFamily: 'Poppins_600SemiBold', textTransform: 'uppercase' },
  
  bubble: { paddingHorizontal: 18, paddingVertical: 14, borderRadius: 24, minWidth: 60 },
  
  // Unique Shape: "The Shout" (Bottom Right sharp)
  bubbleMe: { 
    borderBottomRightRadius: 4, 
    shadowColor: Colors.primary, 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.3, 
    shadowRadius: 8,
    elevation: 5
  },
  
  // Unique Shape: "The Whisper" (Bottom Left sharp) - Glass effect
  bubbleThem: { 
    backgroundColor: 'rgba(255,255,255,0.08)', 
    borderBottomLeftRadius: 4, 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.05)' 
  },
  
  textMe: { color: '#FFF', fontFamily: 'Poppins_500Medium', fontSize: 15, lineHeight: 22 },
  textThem: { color: Colors.text, fontFamily: 'Poppins_400Regular', fontSize: 15, lineHeight: 22 },
  time: { color: 'rgba(255,255,255,0.3)', fontSize: 9, marginTop: 6, marginHorizontal: 5, fontWeight: '700' }
});

export default ChatBubble;