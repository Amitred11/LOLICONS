import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@config/Colors';

const { width } = Dimensions.get('window');

const ChatBubble = ({ 
  message, 
  isMe, 
  isFirstInChain, 
  isLastInChain,  
  onCallAgain, 
  onLongPress, 
  onImagePress,
  onReactionPress,
  onReactionLongPress 
}) => {  
  // 1. Handle Deleted Messages
  if (message.isDeleted || message.type === 'system') {
    return (
        <View style={[styles.container, { alignSelf: 'center', marginVertical: 10 }]}>
            <View style={{ backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 15, paddingVertical: 5, borderRadius: 10 }}>
                <Text style={{ color: Colors.textSecondary, fontStyle: 'italic', fontSize: 12 }}>
                    {message.text}
                </Text>
            </View>
        </View>
    );
  }

  // 2. Handle Call Logs
  if (message.type === 'call_log') {
    let callData = {};
    try {
        callData = JSON.parse(message.text);
    } catch (e) {
        callData = { status: 'ended', callType: 'voice', duration: 0 };
    }

    const { callType, duration, status } = callData;
    const isVideo = callType === 'video';
    const isGroup = callType === 'group';
    const iconName = isVideo ? 'videocam' : isGroup ? 'people' : 'call';
    const statusText = status === 'missed' ? 'Call cancelled' : 'Call ended';
    const statusColor = status === 'missed' ? '#FF453A' : Colors.textSecondary;
    
    const mins = Math.floor(duration / 60);
    const secs = duration % 60;
    const durationText = status === 'missed' ? '' : `${mins}:${secs < 10 ? '0' : ''}${secs}`;

    return (
      <TouchableOpacity 
        style={[styles.container, isMe ? styles.rightContainer : styles.leftContainer]}
        onLongPress={() => onLongPress && onLongPress(message)}
        delayLongPress={300}
        activeOpacity={0.9}
      >
        <View style={[styles.callLogCard, { borderColor: isMe ? 'rgba(52, 199, 89, 0.3)' : 'rgba(255,255,255,0.1)' }]}>
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

            <TouchableOpacity 
                style={styles.callAgainBtn} 
                onPress={() => onCallAgain && onCallAgain(callType)}
            >
                <Text style={styles.callAgainText}>Call Again</Text>
            </TouchableOpacity>
        </View>
        <Text style={[styles.timeText, isMe ? styles.timeRight : styles.timeLeft]}>{message.time}</Text>
      </TouchableOpacity>
    );
  }

  // 3. Helper for Reactions & Header (Name + Edited)
  const renderHeader = () => {
      // Only show header if it's the first message in a continuous chain
      if (!isFirstInChain) return null;

      // Logic: If isMe, use senderName (nickname) if available, otherwise 'You'.
      // If not me, use senderName or 'User'.
      const displayName = isMe 
        ? (message.senderName || 'You') 
        : (message.senderName || 'User');

      return (
          <View style={[
              styles.headerRow, 
              // Align header right for 'me', left for others
              isMe ? { justifyContent: 'flex-end', marginRight: 10 } : { justifyContent: 'flex-start', marginLeft: 12 }
          ]}>
              <Text numberOfLines={1}>
                  <Text style={styles.senderName}>
                      {displayName}
                  </Text>
                  
                  {/* Space if edited */}
                  {message.isEdited && <Text> </Text>}

                  {/* Edited Label (Beside name) */}
                  {message.isEdited && (
                      <Text style={styles.editedLabel}>(edited)</Text>
                  )}
              </Text>
          </View>
      );
  };

  const renderReactions = () => {
      if (!message.reactions || Object.keys(message.reactions).length === 0) return null;
      return (
          <View style={[styles.reactionContainer, isMe ? { right: 0 } : { left: 0 }]}>
              {Object.entries(message.reactions).map(([emoji, userIds], index) => {
                  const count = Array.isArray(userIds) ? userIds.length : 0;
                  const iReacted = Array.isArray(userIds) && userIds.includes('me');

                  return (
                    <TouchableOpacity 
                        key={index} 
                        style={[
                            styles.reactionBadge,
                            iReacted ? styles.reactionBadgeActive : styles.reactionBadgeInactive
                        ]}
                        onPress={() => onReactionPress && onReactionPress(message.id, emoji)}
                        onLongPress={() => onReactionLongPress && onReactionLongPress(emoji, userIds)}
                        delayLongPress={300}
                    >
                        <Text style={styles.reactionText}>
                            {emoji} <Text style={styles.reactionCount}>{count > 1 ? count : ''}</Text>
                        </Text>
                    </TouchableOpacity>
                  );
              })}
          </View>
      );
  };

  const bubbleStyle = [
      styles.bubble,
      isMe ? styles.bubbleRight : styles.bubbleLeft,
      // If NOT first in chain, flatten top corners
      !isFirstInChain && isMe && { borderTopRightRadius: 3 },
      !isFirstInChain && !isMe && { borderTopLeftRadius: 3 },
      // If NOT last in chain, flatten bottom corners
      !isLastInChain && isMe && { borderBottomRightRadius: 3 },
      !isLastInChain && !isMe && { borderBottomLeftRadius: 3 },
      
      message.type === 'image' && styles.bubbleImage
  ];

  return (
    <View style={[
        styles.container, 
        isMe ? styles.rightContainer : styles.leftContainer,
        { marginBottom: isLastInChain ? 15 : 2 } 
    ]}>
      
      {/* 1. Header: Name (You/Other) + Edited */}
      {renderHeader()}

      {/* 2. Body: Message Bubble */}
      <TouchableOpacity 
        onLongPress={() => onLongPress && onLongPress(message)}
        delayLongPress={300}
        activeOpacity={0.9}
        style={{ position: 'relative' }} 
      >
          <View style={bubbleStyle}>
            {message.type === 'text' && (
              <View style={styles.textContainer}>
                  <Text style={isMe ? styles.textRight : styles.textLeft}>{message.text}</Text>
              </View>
            )}

            {message.type === 'image' && (
              <TouchableOpacity onPress={() => onImagePress && onImagePress(message.imageUri)} onLongPress={() => onLongPress(message)}>
                  <Image source={{ uri: message.imageUri }} style={styles.image} resizeMode="cover" />
              </TouchableOpacity>
            )}

            {message.type === 'document' && (
                <View style={styles.docContainer}>
                    <Ionicons name="document-text" size={24} color={isMe ? '#FFF' : Colors.text} />
                    <Text style={[styles.docText, { color: isMe ? '#FFF' : Colors.text }]}>
                        {message.fileName || 'Attachment'}
                    </Text>
                </View>
            )}

            {/* Timestamp inside bubble, bottom right */}
            <View style={styles.timeContainer}>
                 <Text style={[styles.timeText, { color: isMe ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.6)' }]}>
                     {message.time}
                 </Text>
            </View>
          </View>
      </TouchableOpacity>

      {/* 3. Footer: Reactions */}
      {renderReactions()}

    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
      maxWidth: '75%', 
      minWidth: '20%',
  },
  leftContainer: { alignSelf: 'flex-start', marginLeft: 10 },
  rightContainer: { alignSelf: 'flex-end', marginRight: 10 },
  
  // Header
  headerRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      marginBottom: 4,
  },
  senderName: { 
      color: Colors.textSecondary, 
      fontSize: 12, 
      fontWeight: '700', // Bold name
  },
  editedLabel: {
      color: Colors.textSecondary,
      fontSize: 10,
      fontStyle: 'italic',
      opacity: 0.8
  },

  // Bubbles
  bubble: { 
      padding: 10, 
      borderRadius: 18, 
      minWidth: 80, 
  },
  bubbleLeft: { backgroundColor: Colors.surface },
  bubbleRight: { backgroundColor: Colors.primary },
  bubbleImage: { padding: 0, overflow: 'hidden' },

  // Text Content
  textContainer: {
      marginBottom: 10,
  },
  textLeft: { color: Colors.text, fontSize: 16, lineHeight: 22 },
  textRight: { color: '#000', fontSize: 16, lineHeight: 22 },

  // Time
  timeContainer: {
      position: 'absolute',
      bottom: 6,
      right: 15,
  },
  timeText: { 
      fontSize: 10, 
  },
  
  image: { width: 220, height: 220 },
  docContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  docText: { textDecorationLine: 'underline', maxWidth: 180 },

  // Reactions
  reactionContainer: {
      flexDirection: 'row',
      marginTop: 4,
      flexWrap: 'wrap',
      zIndex: 10,
  },
  reactionBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      borderWidth: 1,
      marginRight: 4,
      marginTop: 2,
      flexDirection: 'row',
      alignItems: 'center',
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 1,
      elevation: 2,
  },
  reactionBadgeInactive: {
      backgroundColor: '#2C2C2E', 
      borderColor: Colors.background, 
  },
  reactionBadgeActive: {
      backgroundColor: 'rgba(52, 199, 89, 0.3)', 
      borderColor: '#34C759', 
  },
  reactionText: {
      fontSize: 12,
      color: '#FFFFFF', 
      fontWeight: '600'
  },
  reactionCount: {
      color: '#FFFFFF', 
      fontSize: 11
  },
  
  // Call Log
  callLogCard: { backgroundColor: '#1C1C1E', borderRadius: 16, padding: 12, borderWidth: 1, minWidth: 200 },
  callLogHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  callTitle: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
  callAgainBtn: { backgroundColor: 'rgba(255,255,255,0.1)', paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  callAgainText: { color: Colors.primary || '#34C759', fontWeight: '600', fontSize: 14 }
});

export default ChatBubble;