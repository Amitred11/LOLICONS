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
  
  // Check if message has reactions to adjust spacing
  const hasReactions = message.reactions && Object.keys(message.reactions).length > 0;

  // --- HELPER FUNCTIONS ---

  const renderHeader = () => {
      if (!isFirstInChain) return null;

      const displayName = isMe 
        ? (message.senderName || 'You') 
        : (message.senderName || 'User');

      return (
          <View style={[
              styles.headerRow, 
              isMe ? { justifyContent: 'flex-end', marginRight: 10 } : { justifyContent: 'flex-start', marginLeft: 12 }
          ]}>
              <Text numberOfLines={1}>
                  <Text style={styles.senderName}>{displayName}</Text>
                  {message.isEdited && <Text> </Text>}
                  {message.isEdited && <Text style={styles.editedLabel}>(edited)</Text>}
              </Text>
          </View>
      );
  };

  const renderReactions = () => {
      if (!message.reactions || Object.keys(message.reactions).length === 0) return null;
      
      const reactionsEntries = Object.entries(message.reactions);
      const chunkedReactions = [];
      for (let i = 0; i < reactionsEntries.length; i += 3) {
          chunkedReactions.push(reactionsEntries.slice(i, i + 3));
      }

      return (
          <View style={[
              styles.reactionContainer, 
              isMe ? { right: 0, alignItems: 'flex-end' } : { left: 0, alignItems: 'flex-start' }
          ]}>
              {chunkedReactions.map((row, rowIndex) => (
                  <View key={rowIndex} style={styles.reactionRow}>
                      {row.map(([emoji, userIds]) => {
                          const count = Array.isArray(userIds) ? userIds.length : 0;
                          const iReacted = Array.isArray(userIds) && userIds.includes('me');
                          return (
                            <TouchableOpacity 
                                key={emoji} 
                                activeOpacity={0.7}
                                style={[
                                    styles.reactionBadge, 
                                    iReacted ? styles.reactionBadgeActive : styles.reactionBadgeInactive
                                ]}
                                onPress={() => onReactionPress && onReactionPress(message.id, emoji)}
                                onLongPress={() => onReactionLongPress && onReactionLongPress(emoji, userIds)}
                            >
                                <Text style={styles.reactionText}>{emoji}{count > 1 ? ` ${count}` : ''}</Text>
                            </TouchableOpacity>
                          );
                      })}
                  </View>
              ))}
          </View>
      );
  };

  // --- RENDER LOGIC ---

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

  // 2. Handle Call Logs (MODERN REFACTOR)
  if (message.type === 'call_log') {
    let callData = {};
    try {
        callData = JSON.parse(message.text);
    } catch (e) {
        callData = { status: 'ended', callType: 'voice', duration: 0 };
    }

    const { callType, duration, status } = callData;
    const isMissed = status === 'missed';
    const isVideo = callType === 'video';
    
    // Config based on status
    const accentColor = isMissed ? '#FF453A' : (isVideo ? '#007AFF' : '#34C759');
    const bgTint = isMissed ? 'rgba(255, 69, 58, 0.15)' : (isVideo ? 'rgba(0, 122, 255, 0.15)' : 'rgba(52, 199, 89, 0.15)');
    const iconName = isVideo ? 'videocam' : 'call';
    const titleText = isMissed ? 'Missed Call' : (isVideo ? 'Video Call' : 'Voice Call');
    
    // Formatting duration
    const mins = Math.floor(duration / 60);
    const secs = duration % 60;
    const durationText = isMissed ? '' : `${mins}m ${secs}s`;

    return (
      <TouchableOpacity 
        style={[
            styles.container, 
            isMe ? styles.rightContainer : styles.leftContainer,
            hasReactions && { marginBottom: 20 }
        ]}
        onLongPress={() => onLongPress && onLongPress(message)}
        delayLongPress={300}
        activeOpacity={0.9}
      >
        <View style={[styles.modernCallCard, { borderColor: isMe ? 'rgba(255,255,255,0.15)' : 'transparent' }]}>
            
            {/* Top Section: Info */}
            <View style={styles.cardContent}>
                <View style={[styles.callIconSquircle, { backgroundColor: bgTint }]}>
                    <Ionicons name={isMissed ? (isVideo ? "videocam-off" : "call") : iconName} size={20} color={accentColor} />
                </View>
                <View style={styles.cardTextContent}>
                    <Text style={styles.callTitle}>{titleText}</Text>
                    <Text style={styles.callSubtitle}>
                        {isMissed ? 'No answer' : durationText}
                    </Text>
                </View>
            </View>

            {/* Separator */}
            <View style={styles.cardSeparator} />

            {/* Bottom Section: Action */}
            <TouchableOpacity 
                style={styles.cardAction} 
                activeOpacity={0.7}
                onPress={() => onCallAgain && onCallAgain(callType)}
            >
                <Text style={styles.callActionText}>Call Again</Text>
                <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} />
            </TouchableOpacity>
        </View>

        <Text style={[styles.timeText, isMe ? styles.timeRight : styles.timeLeft]}>{message.time}</Text>
        {renderReactions()}
      </TouchableOpacity>
    );
  }

  // 3. Normal Message Render
  const bubbleStyle = [
      styles.bubble,
      isMe ? styles.bubbleRight : styles.bubbleLeft,
      !isFirstInChain && isMe && { borderTopRightRadius: 3 },
      !isFirstInChain && !isMe && { borderTopLeftRadius: 3 },
      !isLastInChain && isMe && { borderBottomRightRadius: 3 },
      !isLastInChain && !isMe && { borderBottomLeftRadius: 3 },
      message.type === 'image' && styles.bubbleImage
  ];

  return (
    <View style={[
        styles.container, 
        isMe ? styles.rightContainer : styles.leftContainer,
        { marginBottom: isLastInChain ? 15 : 2 },
        hasReactions && { marginBottom: 25 }
    ]}>
      
      {renderHeader()}

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

            <View style={styles.timeContainer}>
                 <Text style={[styles.timeText, { color: isMe ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.6)' }]}>
                     {message.time}
                 </Text>
            </View>
          </View>
      </TouchableOpacity>

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
  
  headerRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      marginBottom: 4,
  },
  senderName: { color: Colors.textSecondary, fontSize: 12, fontWeight: '700' },
  editedLabel: { color: Colors.textSecondary, fontSize: 10, fontStyle: 'italic', opacity: 0.8 },

  bubble: { 
      paddingTop: 12, paddingBottom: 12, paddingHorizontal: 12, paddingVertical: 10,
      borderRadius: 18, minWidth: 80, 
  },
  bubbleLeft: { backgroundColor: Colors.surface },
  bubbleRight: { backgroundColor: Colors.primary },
  bubbleImage: { padding: 0, overflow: 'hidden' },

  textContainer: { marginBottom: 10 },
  textLeft: { color: Colors.text, fontSize: 16, lineHeight: 22 },
  textRight: { color: '#000', fontSize: 16, lineHeight: 22 },

  timeContainer: { position: 'absolute', bottom: 6, right: 10 },
  timeText: { fontSize: 10 },
  
  image: { width: 220, height: 220 },
  docContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  docText: { textDecorationLine: 'underline', maxWidth: 180 },

  reactionContainer: { position: 'absolute', top: '100%', marginTop: 5, zIndex: 10, marginBottom: 10 },
  reactionRow: { flexDirection: 'row', gap: 5, marginBottom: 2 },
  reactionBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, borderWidth: 1, marginRight: 4, marginTop: 2, flexDirection: 'row', alignItems: 'center', shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 1, elevation: 2 },
  reactionBadgeInactive: { backgroundColor: '#2C2C2E', borderColor: Colors.background },
  reactionBadgeActive: { backgroundColor: 'rgba(52, 199, 89, 0.3)', borderColor: '#34C759' },
  reactionText: { fontSize: 10, color: '#FFFFFF', fontWeight: '600' },

  // --- MODERN CALL LOG STYLES ---
  modernCallCard: {
    backgroundColor: '#1C1C1E', // Dark card background
    borderRadius: 20,
    width: 220,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  cardContent: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  callIconSquircle: {
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTextContent: {
    marginLeft: 12,
    flex: 1,
  },
  callTitle: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 2,
  },
  callSubtitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    fontWeight: '500',
  },
  cardSeparator: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    width: '100%',
  },
  cardAction: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.02)', // Slightly lighter bottom
  },
  callActionText: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ChatBubble;