import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@config/Colors';

const ChatBubble = ({ message, isMe, showSender }) => {
  
  const renderContent = () => {
    if (message.type === 'image') {
      return (
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: message.imageUri }} 
            style={styles.mediaImage} 
            resizeMode="cover"
          />
        </View>
      );
    }

    // Default Text
    return (
      <Text style={isMe ? styles.textMe : styles.textThem}>
        {message.text}
      </Text>
    );
  };

  return (
    <View style={[styles.wrapper, isMe ? styles.wrapperMe : styles.wrapperThem]}>
      {/* Avatar (Them) */}
      {!isMe && showSender && (
        <View style={styles.avatarContainer}>
          <Image source={{ uri: message.avatar }} style={styles.avatar} />
          <View style={styles.avatarRing} />
        </View>
      )}
      
      <View style={{ maxWidth: '75%' }}>
        {!isMe && showSender && (
          <Text style={styles.senderName}>{message.senderName}</Text>
        )}

        {isMe ? (
          <LinearGradient
            colors={[Colors.primary, '#2E86DE']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={[styles.bubble, styles.bubbleMe, message.type === 'image' && styles.bubbleImage]}
          >
            {renderContent()}
          </LinearGradient>
        ) : (
          <View style={[styles.bubble, styles.bubbleThem, message.type === 'image' && styles.bubbleImage]}>
             {renderContent()}
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
  avatar: { width: 30, height: 30, borderRadius: 12, zIndex: 2, backgroundColor: '#333' },
  avatarRing: { 
    position: 'absolute', width: 34, height: 34, borderRadius: 14, 
    backgroundColor: Colors.secondary, opacity: 0.3, top: -2, left: -2, zIndex: 1 
  },
  
  senderName: { color: Colors.secondary, fontSize: 10, marginLeft: 4, marginBottom: 4, fontWeight: '700', textTransform: 'uppercase' },
  
  bubble: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 22, minWidth: 60 },
  bubbleImage: { padding: 4, borderRadius: 16 }, // Less padding for images
  
  // "The Shout" (Bottom Right sharp)
  bubbleMe: { 
    borderBottomRightRadius: 4, 
    shadowColor: Colors.primary, 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.3, 
    shadowRadius: 8,
    elevation: 5
  },
  
  // "The Whisper" (Bottom Left sharp)
  bubbleThem: { 
    backgroundColor: Colors.surface,
    borderBottomLeftRadius: 4, 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.05)' 
  },
  
  textMe: { color: '#FFF', fontSize: 15, lineHeight: 22 },
  textThem: { color: Colors.text, fontSize: 15, lineHeight: 22 },
  time: { color: 'rgba(255,255,255,0.3)', fontSize: 10, marginTop: 4, marginHorizontal: 5, fontWeight: '600' },

  // Media Styles
  imageContainer: { width: 200, height: 150, borderRadius: 14, overflow: 'hidden' },
  mediaImage: { width: '100%', height: '100%' }
});

export default ChatBubble;