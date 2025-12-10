import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@config/Colors'; // Assuming you have this, or use hardcoded colors

const { width } = Dimensions.get('window');

const ChatBubble = ({ message, isMe, showSender, onCallAgain }) => {
  
  // --- RENDER: Call Log (New Logic) ---
  if (message.type === 'call_log') {
    let callData = {};
    try {
        callData = JSON.parse(message.text);
    } catch (e) {
        // Fallback if message.text isn't JSON (legacy support)
        callData = { status: 'ended', callType: 'voice', duration: 0 };
    }

    const { callType, duration, status } = callData;
    
    // Config based on call data
    const isVideo = callType === 'video';
    const isGroup = callType === 'group';
    const iconName = isVideo ? 'videocam' : isGroup ? 'people' : 'call';
    const statusText = status === 'missed' ? 'Call cancelled' : 'Call ended';
    const statusColor = status === 'missed' ? '#FF453A' : Colors.textSecondary;
    
    // Format duration
    const mins = Math.floor(duration / 60);
    const secs = duration % 60;
    const durationText = status === 'missed' ? '' : `${mins}:${secs < 10 ? '0' : ''}${secs}`;

    return (
      <View style={[styles.container, isMe ? styles.rightContainer : styles.leftContainer]}>
        <View style={[styles.callLogCard, { borderColor: isMe ? 'rgba(52, 199, 89, 0.3)' : 'rgba(255,255,255,0.1)' }]}>
            
            {/* Header: Icon + Status */}
            <View style={styles.callLogHeader}>
                <View style={[styles.iconCircle, { backgroundColor: status === 'missed' ? 'rgba(255, 69, 58, 0.2)' : 'rgba(255,255,255,0.1)' }]}>
                    <Ionicons name={iconName} size={20} color={status === 'missed' ? '#FF453A' : Colors.text} />
                </View>
                <View style={{marginLeft: 10}}>
                    <Text style={styles.callTitle}>
                        {isVideo ? 'Video Call' : isGroup ? 'Group Call' : 'Voice Call'}
                    </Text>
                    <Text style={[styles.callSubtitle, { color: statusColor }]}>
                        {statusText} {duration > 0 && `• ${durationText}`}
                    </Text>
                </View>
            </View>

            {/* Action Button */}
            <TouchableOpacity 
                style={styles.callAgainBtn} 
                onPress={() => onCallAgain && onCallAgain(callType)}
            >
                <Text style={styles.callAgainText}>Call Again</Text>
            </TouchableOpacity>
        </View>
        <Text style={[styles.timeText, isMe ? styles.timeRight : styles.timeLeft]}>{message.time}</Text>
      </View>
    );
  }

  // --- RENDER: Standard Text/Image/Document (Existing Logic) ---
  return (
    <View style={[styles.container, isMe ? styles.rightContainer : styles.leftContainer]}>
      {showSender && !isMe && <Text style={styles.senderName}>{message.senderName || 'User'}</Text>}
      
      <View style={[
        styles.bubble, 
        isMe ? styles.bubbleRight : styles.bubbleLeft,
        message.type === 'image' && styles.bubbleImage
      ]}>
        {message.type === 'text' && (
          <Text style={isMe ? styles.textRight : styles.textLeft}>{message.text}</Text>
        )}

        {message.type === 'image' && (
          <Image source={{ uri: message.imageUri }} style={styles.image} resizeMode="cover" />
        )}

        {message.type === 'document' && (
            <View style={styles.docContainer}>
                <Ionicons name="document-text" size={24} color={isMe ? '#FFF' : Colors.text} />
                <Text style={[styles.docText, { color: isMe ? '#FFF' : Colors.text }]}>
                    {message.fileName || 'Attachment'}
                </Text>
            </View>
        )}
      </View>
      
      <Text style={[styles.timeText, isMe ? styles.timeRight : styles.timeLeft]}>{message.time}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 15, maxWidth: '80%' },
  leftContainer: { alignSelf: 'flex-start' },
  rightContainer: { alignSelf: 'flex-end' },
  
  // Standard Bubble Styles
  bubble: { padding: 12, borderRadius: 20 },
  bubbleLeft: { backgroundColor: Colors.surface, borderBottomLeftRadius: 4 },
  bubbleRight: { backgroundColor: Colors.primary, borderBottomRightRadius: 4 },
  bubbleImage: { padding: 0, overflow: 'hidden' },
  textLeft: { color: Colors.text, fontSize: 16 },
  textRight: { color: '#000', fontSize: 16 }, // Assuming primary is bright, text is dark
  senderName: { color: Colors.textSecondary, fontSize: 12, marginBottom: 4, marginLeft: 12 },
  timeText: { fontSize: 10, color: Colors.textSecondary, marginTop: 4 },
  timeRight: { alignSelf: 'flex-end', marginRight: 4 },
  timeLeft: { alignSelf: 'flex-start', marginLeft: 4 },
  image: { width: 200, height: 200 },
  docContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  docText: { textDecorationLine: 'underline' },

  // --- Call Log Specific Styles ---
  callLogCard: {
      backgroundColor: '#1C1C1E', // Dark card background
      borderRadius: 16,
      padding: 12,
      borderWidth: 1,
      minWidth: 200,
  },
  callLogHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
  },
  iconCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
  },
  callTitle: {
      color: '#FFF',
      fontWeight: 'bold',
      fontSize: 15,
  },
  callSubtitle: {
      fontSize: 12,
      marginTop: 2,
  },
  callAgainBtn: {
      backgroundColor: 'rgba(255,255,255,0.1)',
      paddingVertical: 10,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 4
  },
  callAgainText: {
      color: Colors.primary || '#34C759', // Green text for action
      fontWeight: '600',
      fontSize: 14
  }
});

export default ChatBubble;