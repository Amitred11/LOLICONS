import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@config/Colors';

const ChatBubble = ({ 
  message, 
  isMe, 
  isFirstInChain, 
  isLastInChain,  
  onCallAgain, 
  onLongPress, 
  onImagePress,
  onReactionPress,
  onReactionLongPress,
  onViewPoll, 
  onVote, 
  currentUserId = 'me' 
}) => {  

  const hasReactions = message.reactions && Object.keys(message.reactions).length > 0;

  // --- HELPER: PIN HEADER ---
  // Updated to accept a 'variant' to style Polls differently
  const renderPinStatus = (variant = 'default') => {
      if (!message.isPinned) return null;

      // 1. POLL SPECIFIC PIN STYLE
      if (variant === 'poll') {
        return (
            <View style={styles.pollPinContainer}>
                <Ionicons name="push" size={12} color="#FFD700" style={{ marginRight: 6 }} />
                <Text style={styles.pollPinText}>Pinned Poll</Text>
            </View>
        );
      }

      // 2. STANDARD BUBBLE PIN STYLE
      const pinColor = isMe ? 'rgba(255,255,255,0.9)' : Colors.primary;
      const borderBottom = isMe ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.05)';
      return (
          <View style={[styles.pinContainer, { borderBottomColor: borderBottom }]}>
              <Ionicons name="push" size={11} color={pinColor} style={{ marginRight: 4 }} />
              <Text style={[styles.pinText, { color: pinColor }]}>Pinned</Text>
          </View>
      );
  };

  // --- HELPER: SENDER NAME ---
  const renderSenderName = () => {
      if (!isFirstInChain) return null;
      const displayName = isMe ? 'You' : (message.senderName || 'User');
      return (
          <View style={[styles.headerRow, isMe ? { justifyContent: 'flex-end', marginRight: 10 } : { justifyContent: 'flex-start', marginLeft: 12 }]}>
              <Text numberOfLines={1}>
                  <Text style={styles.senderName}>{displayName}</Text>
                  {message.isEdited && !message.isDeleted && <Text style={styles.editedLabel}> (edited)</Text>}
              </Text>
          </View>
      );
  };

  // --- HELPER: REACTIONS ---
  const renderReactions = () => {
      if (message.isDeleted || !message.reactions || Object.keys(message.reactions).length === 0) return null;
      return (
          <View style={[styles.reactionContainer, isMe ? { justifyContent: 'flex-end' } : { justifyContent: 'flex-start' }]}>
              {Object.entries(message.reactions).map(([emoji, userIds]) => {
                  const safeUserIds = Array.isArray(userIds) ? userIds : [];
                  const count = safeUserIds.length;
                  const iReacted = safeUserIds.includes(currentUserId);
                  return (
                    <TouchableOpacity 
                        key={emoji} activeOpacity={0.7}
                        style={[styles.reactionBadge, iReacted ? styles.reactionBadgeActive : styles.reactionBadgeInactive]}
                        onPress={() => onReactionPress && onReactionPress(message.id, emoji)}
                        onLongPress={() => onReactionLongPress && onReactionLongPress(emoji, safeUserIds)}
                    >
                        <Text style={[styles.reactionText, iReacted && styles.reactionTextActive]}>{emoji}{count > 1 ? ` ${count}` : ''}</Text>
                    </TouchableOpacity>
                  );
              })}
          </View>
      );
  };

  // ==========================================
  // --- DELETED MESSAGE RENDERER ---
  // ==========================================
  if (message.isDeleted) {
    return (
        <View style={[styles.container, isMe ? styles.rightContainer : styles.leftContainer, { marginBottom: isLastInChain ? 15 : 5 }]}>
            {renderSenderName()}
            <View style={[
                styles.deletedBubble, 
                isMe ? { alignItems: 'flex-end' } : { alignItems: 'flex-start' }
            ]}>
                <View style={styles.deletedContent}>
                    <Ionicons name="trash-bin-outline" size={14} color="rgba(255,255,255,0.4)" style={{ marginRight: 6 }} />
                    <Text style={styles.deletedText}>Message deleted</Text>
                </View>
                <Text style={styles.deletedTimestamp}>{message.time}</Text>
            </View>
        </View>
    );
  }

  // ==========================================
  // --- POLL RENDERER ---
  // ==========================================
  if (message.type === 'poll') {
    const pollData = message.poll || { question: 'Poll', options: [], totalVotes: 0 };
    const topOptions = pollData.options.slice(0, 3); 
    const remainingCount = pollData.options.length - 3;

    return (
        <View style={[styles.container, isMe ? styles.rightContainer : styles.leftContainer, { marginBottom: 15 }]}>
            {renderSenderName()}
            
            <View style={[styles.pollCard, isMe ? { borderTopRightRadius: 4 } : { borderTopLeftRadius: 4 }]}>
                
                {/* Use the new 'poll' variant here */}
                {renderPinStatus('poll')}

                <TouchableOpacity 
                    activeOpacity={0.7} 
                    onPress={() => onViewPoll && onViewPoll(message)}
                    onLongPress={() => onLongPress && onLongPress(message)}
                    style={styles.pollHeader}
                >
                    <View style={styles.pollIconCircle}>
                        <Ionicons name="stats-chart" size={14} color="#000" />
                    </View>
                    <Text style={styles.pollQuestion} numberOfLines={2}>{pollData.question}</Text>
                </TouchableOpacity>

                <View style={styles.pollPreviewList}>
                    {topOptions.map((option) => {
                        const percentage = pollData.totalVotes > 0 ? (option.votes / pollData.totalVotes) * 100 : 0;
                        const isVotedByMe = option.voters && option.voters.some(v => v.id === currentUserId);
                        
                        return (
                            <TouchableOpacity 
                                key={option.id} 
                                style={styles.pollPreviewRow}
                                activeOpacity={0.7}
                                onPress={() => onVote && onVote(message.id, option.id)}
                            >
                                <View style={[
                                    styles.pollPreviewBar, 
                                    { width: `${percentage}%` },
                                    isVotedByMe && { backgroundColor: 'rgba(52, 199, 89, 0.5)' } 
                                ]} />
                                <View style={styles.pollPreviewContent}>
                                    <Text style={[styles.pollPreviewText, isVotedByMe && {fontWeight:'bold', color:'#FFF'}]} numberOfLines={1}>
                                        {option.text}
                                    </Text>
                                    <View style={{flexDirection:'row', alignItems:'center'}}>
                                        {isVotedByMe && <Ionicons name="checkmark" size={12} color="#FFF" style={{marginRight:4}} />}
                                        <Text style={styles.pollPreviewPercent}>{Math.round(percentage)}%</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                    {remainingCount > 0 && (
                        <TouchableOpacity onPress={() => onViewPoll && onViewPoll(message)}>
                            <Text style={styles.pollMoreText}>+ {remainingCount} more options</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <TouchableOpacity 
                    style={styles.pollFooter} 
                    onPress={() => onViewPoll && onViewPoll(message)}
                    activeOpacity={0.7}
                >
                    <Text style={styles.pollTotalVotes}>{pollData.totalVotes} vote{pollData.totalVotes !== 1 ? 's' : ''}</Text>
                </TouchableOpacity>
            </View>
            {renderReactions()}
        </View>
    );
  }

  // --- CALL LOG RENDERER ---
  if (message.type === 'call_log') {
    let callData = {};
    try { callData = JSON.parse(message.text); } catch (e) { callData = { status: 'ended', callType: 'voice', duration: 0 }; }
    const { callType, duration, status } = callData;
    const isMissed = status === 'missed';
    const isVideo = callType === 'video';
    const accentColor = isMissed ? '#FF453A' : (isVideo ? '#007AFF' : '#34C759');
    const bgTint = isMissed ? 'rgba(255, 69, 58, 0.15)' : (isVideo ? 'rgba(0, 122, 255, 0.15)' : 'rgba(52, 199, 89, 0.15)');
    const iconName = isVideo ? 'videocam' : 'call';
    const titleText = isMissed ? 'Missed Call' : (isVideo ? 'Video Call' : 'Voice Call');
    const mins = Math.floor(duration / 60);
    const secs = duration % 60;
    const durationText = isMissed ? '' : `${mins}m ${secs}s`;

    return (
      <TouchableOpacity 
        style={[styles.container, isMe ? styles.rightContainer : styles.leftContainer, hasReactions && { marginBottom: 20 }]}
        onLongPress={() => onLongPress && onLongPress(message)}
        delayLongPress={300}
        activeOpacity={0.9}
      >
        <View style={[styles.modernCallCard, { borderColor: isMe ? 'rgba(255,255,255,0.15)' : 'transparent' }]}>
            <View style={styles.cardContent}>
                <View style={[styles.callIconSquircle, { backgroundColor: bgTint }]}>
                    <Ionicons name={isMissed ? (isVideo ? "videocam-off" : "call") : iconName} size={20} color={accentColor} />
                </View>
                <View style={styles.cardTextContent}>
                    <Text style={styles.callTitle}>{titleText}</Text>
                    <Text style={styles.callSubtitle}>{isMissed ? 'No answer' : durationText}</Text>
                </View>
            </View>
            <View style={styles.cardSeparator} />
            <TouchableOpacity style={styles.cardAction} activeOpacity={0.7} onPress={() => onCallAgain && onCallAgain(callType)}>
                <Text style={styles.callActionText}>Call Again</Text>
                <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} />
            </TouchableOpacity>
        </View>
        <Text style={[styles.timeText, isMe ? styles.timeRight : styles.timeLeft]}>{message.time}</Text>
        {renderReactions()}
      </TouchableOpacity>
    );
  }

  // --- STANDARD MESSAGES ---
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
    <View style={[styles.container, isMe ? styles.rightContainer : styles.leftContainer, { marginBottom: isLastInChain ? 15 : 2 }, hasReactions && { marginBottom: 25 }]}>
      {renderSenderName()}
      <TouchableOpacity 
        onLongPress={() => onLongPress && onLongPress(message)} 
        delayLongPress={300}
        activeOpacity={0.9}
      >
          <View style={bubbleStyle}>
            {renderPinStatus()}
            {message.type === 'text' && <View style={styles.textContainer}><Text style={isMe ? styles.textRight : styles.textLeft}>{message.text}</Text></View>}
            {message.type === 'image' && <TouchableOpacity onPress={() => onImagePress && onImagePress(message.imageUri)}><Image source={{ uri: message.imageUri }} style={styles.image} resizeMode="cover" /></TouchableOpacity>}
            {message.type === 'document' && (
                <View style={styles.docContainer}>
                    <Ionicons name="document-text" size={24} color={isMe ? '#FFF' : Colors.text} />
                    <Text style={[styles.docText, { color: isMe ? '#FFF' : Colors.text }]}>{message.fileName || 'Attachment'}</Text>
                </View>
            )}
            <View style={styles.timeContainer}><Text style={[styles.timeText, { color: isMe ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.6)' }]}>{message.time}</Text></View>
          </View>
      </TouchableOpacity>
      {renderReactions()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { maxWidth: '75%', minWidth: '20%' },
  leftContainer: { alignSelf: 'flex-start', marginLeft: 10, alignItems: 'flex-start' },
  rightContainer: { alignSelf: 'flex-end', marginRight: 10, alignItems: 'flex-end' },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  senderName: { color: Colors.textSecondary, fontSize: 12, fontWeight: '700' },
  editedLabel: { color: Colors.textSecondary, fontSize: 10, fontStyle: 'italic', opacity: 0.8 },
  
  // Standard Pin Styles
  pinContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 6, paddingBottom: 4, borderBottomWidth: 1 },
  pinText: { fontSize: 10, fontWeight: '600', textTransform: 'uppercase' },

  // --- NEW POLL PIN STYLES ---
  pollPinContainer: {
    backgroundColor: 'rgba(255, 215, 0, 0.15)', // Subtle gold background
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 215, 0, 0.2)'
  },
  pollPinText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFD700', // Gold color text
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },

  bubble: { paddingTop: 12, paddingBottom: 12, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 18, minWidth: 80 },
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

  // --- DELETED MESSAGES ---
  deletedBubble: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginTop: 2,
    maxWidth: 200,
  },
  deletedContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    borderStyle: 'dashed',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  deletedText: {
    fontStyle: 'italic',
    color: 'rgba(255,255,255,0.4)',
    fontSize: 14,
  },
  deletedTimestamp: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.2)',
    marginTop: 4,
    marginRight: 4,
  },

  // --- POLL STYLES ---
  pollCard: { backgroundColor: '#1C1C1E', borderRadius: 16, width: 250, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', overflow: 'hidden' },
  pollHeader: { padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  pollIconCircle: { width: 24, height: 24, borderRadius: 12, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center' },
  pollQuestion: { fontSize: 15, fontWeight: '700', color: '#FFF', flex: 1 },
  pollPreviewList: { padding: 12, gap: 8 },
  pollPreviewRow: { height: 32, justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 8, overflow: 'hidden' },
  pollPreviewBar: { position: 'absolute', top: 0, left: 0, bottom: 0, backgroundColor: 'rgba(52, 199, 89, 0.3)' },
  pollPreviewContent: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 10 },
  pollPreviewText: { fontSize: 13, color: '#DDD', fontWeight:'500' },
  pollPreviewPercent: { fontSize: 11, color: '#AAA' },
  pollMoreText: { fontSize: 11, color: Colors.textSecondary, textAlign: 'center', marginTop: 4 },
  pollFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, backgroundColor: 'rgba(0,0,0,0.2)' },
  pollTotalVotes: { fontSize: 11, color: Colors.textSecondary },

  // --- REACTIONS ---
  reactionContainer: { marginTop: -5, zIndex: 10, flexDirection: 'row', flexWrap: 'wrap', gap: 4, maxWidth: '100%' },
  reactionBadge: { paddingHorizontal: 6, paddingVertical: 4, borderRadius: 12, borderWidth: 1.5, flexDirection: 'row', alignItems: 'center', backgroundColor: '#2C2C2E', borderColor: Colors.background, minWidth: 28, justifyContent: 'center', marginBottom: 2 },
  reactionBadgeActive: { backgroundColor: 'rgba(0, 131, 33, 0.51)', borderColor: '#34C759' },
  reactionBadgeInactive: { borderColor: Colors.background },
  reactionText: { fontSize: 11, color: '#FFFFFF', fontWeight: '500' },
  reactionTextActive: { color: '#34C759', fontWeight: '700' },

  // --- CALL LOG ---
  modernCallCard: { backgroundColor: '#1C1C1E', borderRadius: 20, width: 220, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', overflow: 'hidden', elevation: 4 },
  cardContent: { padding: 16, flexDirection: 'row', alignItems: 'center' },
  callIconSquircle: { width: 42, height: 42, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  cardTextContent: { marginLeft: 12, flex: 1 },
  callTitle: { color: '#FFF', fontWeight: '700', fontSize: 16, marginBottom: 2 },
  callSubtitle: { color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: '500' },
  cardSeparator: { height: 1, backgroundColor: 'rgba(255,255,255,0.08)', width: '100%' },
  cardAction: { paddingVertical: 12, paddingHorizontal: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.02)' },
  callActionText: { color: Colors.text, fontSize: 14, fontWeight: '600' },
});

export default ChatBubble;