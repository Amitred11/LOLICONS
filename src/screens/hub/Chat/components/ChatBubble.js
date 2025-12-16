import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, LayoutAnimation, Platform, UIManager } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@config/Colors'; // Ensure this path is correct in your project

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
  onReactionLongPress,
  onVote,
  onViewVoters, 
  onAddOption,
  currentUserId = 'me' // Default to 'me', but ideally pass real ID prop
}) => {  
  
  const [pollExpanded, setPollExpanded] = useState(false);
  const hasReactions = message.reactions && Object.keys(message.reactions).length > 0;

  // --- TOGGLE ANIMATION ---
  const togglePollActions = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setPollExpanded(!pollExpanded);
  };

  // --- HELPER: PIN HEADER (Inside Bubble) ---
  const renderPinStatus = () => {
      if (!message.isPinned) return null;
      
      const pinColor = isMe ? 'rgba(255,255,255,0.9)' : Colors.primary;
      const borderBottom = isMe ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.05)';

      return (
          <View style={[styles.pinContainer, { borderBottomColor: borderBottom }]}>
              <Ionicons name="push" size={11} color={pinColor} style={{ marginRight: 4 }} />
              <Text style={[styles.pinText, { color: pinColor }]}>Pinned</Text>
          </View>
      );
  };

  // --- HELPER: SENDER NAME (Outside Bubble) ---
  const renderSenderName = () => {
      if (!isFirstInChain) return null;
      const displayName = isMe ? 'You' : (message.senderName || 'User');

      return (
          <View style={[
              styles.headerRow, 
              isMe ? { justifyContent: 'flex-end', marginRight: 10 } : { justifyContent: 'flex-start', marginLeft: 12 }
          ]}>
              <Text numberOfLines={1}>
                  <Text style={styles.senderName}>{displayName}</Text>
                  {message.isEdited && <Text style={styles.editedLabel}> (edited)</Text>}
              </Text>
          </View>
      );
  };

  // --- HELPER: REACTIONS (FIXED) ---
  const renderReactions = () => {
      // Safety check for empty or missing reactions
      if (!message.reactions || Object.keys(message.reactions).length === 0) return null;
      
      const reactionsEntries = Object.entries(message.reactions);

      return (
          <View style={[
              styles.reactionContainer, 
              // Align reactions to the right if it's my message, left if it's theirs
              isMe ? { justifyContent: 'flex-end' } : { justifyContent: 'flex-start' }
          ]}>
              {reactionsEntries.map(([emoji, userIds]) => {
                  // Safely handle userIds array
                  const safeUserIds = Array.isArray(userIds) ? userIds : [];
                  const count = safeUserIds.length;
                  
                  // specific check using the passed currentUserId prop
                  const iReacted = safeUserIds.includes(currentUserId);

                  return (
                    <TouchableOpacity 
                        key={emoji} 
                        activeOpacity={0.7}
                        style={[
                            styles.reactionBadge, 
                            iReacted ? styles.reactionBadgeActive : styles.reactionBadgeInactive
                        ]}
                        // Pass event up
                        onPress={() => onReactionPress && onReactionPress(message.id, emoji)}
                        onLongPress={() => onReactionLongPress && onReactionLongPress(emoji, safeUserIds)}
                    >
                        <Text style={[
                            styles.reactionText, 
                            iReacted && styles.reactionTextActive // Optional: change text color if active
                        ]}>
                            {emoji}{count > 1 ? ` ${count}` : ''}
                        </Text>
                    </TouchableOpacity>
                  );
              })}
          </View>
      );
  };

  // --- RENDERERS ---

  if (message.isDeleted) {
    return (
        <View style={[styles.container, { alignSelf: 'center', marginVertical: 10 }]}>
            <View style={styles.deletedBubble}>
                <Ionicons name="ban-outline" size={14} color={Colors.textSecondary} style={{ marginRight: 6 }} />
                <Text style={styles.deletedText}>{isMe ? "You deleted this message" : "This message was deleted"}</Text>
            </View>
        </View>
    );
  }

  if (message.type === 'system') {
     return (
        <View style={{ alignSelf: 'center', marginVertical: 8, paddingHorizontal: 20 }}>
            <Text style={{ color: Colors.textSecondary, fontSize: 11, textAlign: 'center' }}>{message.text}</Text>
        </View>
     );
  }

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

  // --- POLL RENDERER ---
  if (message.type === 'poll') {
    const pollData = message.poll || { question: 'Poll', options: [], totalVotes: 0 };
    
    return (
        <View style={[styles.container, isMe ? styles.rightContainer : styles.leftContainer, { marginBottom: 15 }]}>
            {renderSenderName()}
            
            <View style={[styles.pollCard, isMe ? { borderTopRightRadius: 4 } : { borderTopLeftRadius: 4 }]}>
                
                {message.isPinned && (
                    <View style={{paddingHorizontal: 14, paddingTop: 10}}>
                         {renderPinStatus()}
                    </View>
                )}

                <TouchableOpacity 
                    activeOpacity={1} 
                    onLongPress={() => onLongPress && onLongPress(message)}
                    style={styles.pollHeader}
                >
                    <View style={styles.pollIconCircle}>
                        <Ionicons name="stats-chart" size={16} color="#FFF" />
                    </View>
                    <Text style={styles.pollQuestion}>{pollData.question}</Text>
                </TouchableOpacity>
                
                <View style={styles.pollOptionsList}>
                    {pollData.options.map((option) => {
                        const percentage = pollData.totalVotes > 0 ? (option.votes / pollData.totalVotes) * 100 : 0;
                        const isVotedByMe = option.voters && option.voters.some(v => v.id === currentUserId);
                        
                        return (
                            <View key={option.id} style={styles.pollOptionWrapper}>
                                <TouchableOpacity 
                                    style={[
                                        styles.pollOptionRow, 
                                        isVotedByMe && styles.pollOptionRowSelected
                                    ]}
                                    onPress={() => onVote && onVote(message.id, option.id)}
                                    disabled={pollData.hasEnded}
                                    activeOpacity={0.7}
                                >
                                    <View style={[
                                        styles.pollProgressBar, 
                                        { width: `${percentage}%` },
                                        isVotedByMe && { backgroundColor: 'rgba(52, 199, 89, 0.2)' }
                                    ]} />
                                    
                                    <View style={styles.pollOptionContent}>
                                        <View style={{flexDirection: 'row', alignItems: 'center', flex: 1}}>
                                            {isVotedByMe ? (
                                                 <Ionicons name="checkmark-circle" size={18} color={Colors.primary} style={{ marginRight: 8 }} />
                                            ) : (
                                                 <View style={styles.pollEmptyCircle} />
                                            )}
                                            <Text style={[styles.pollOptionText, isVotedByMe && { color: Colors.primary, fontWeight: '700' }]} numberOfLines={1}>
                                                {option.text}
                                            </Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>

                                <TouchableOpacity 
                                    style={styles.pollPercentageBtn} 
                                    onPress={() => onViewVoters && onViewVoters(option.text, option.voters)}
                                    activeOpacity={0.6}
                                >
                                    <Text style={styles.pollPercentageText}>{Math.round(percentage)}%</Text>
                                    <Ionicons name="people-circle-outline" size={14} color={Colors.textSecondary} style={{marginLeft: 2}} />
                                </TouchableOpacity>
                            </View>
                        );
                    })}
                </View>

                <View style={styles.pollFooterContainer}>
                    <TouchableOpacity 
                        style={styles.pollFooterToggle}
                        activeOpacity={0.7}
                        onPress={togglePollActions}
                    >
                         <Text style={styles.pollTotalVotes}>
                            {pollData.totalVotes} vote{pollData.totalVotes !== 1 ? 's' : ''} • {message.time}
                        </Text>
                        <View style={styles.pollExpandBtn}>
                            <Text style={styles.pollExpandText}>{pollExpanded ? "Close" : "More"}</Text>
                            <Ionicons name={pollExpanded ? "chevron-up" : "chevron-down"} size={14} color={Colors.primary} />
                        </View>
                    </TouchableOpacity>

                    {pollExpanded && (
                        <View style={styles.pollExpandedContent}>
                             <View style={styles.pollHintContainer}>
                                <Ionicons name="information-circle-outline" size={14} color={Colors.textSecondary} />
                                <Text style={styles.pollHintText}>Tap percentage buttons to view voters.</Text>
                            </View>

                            {onAddOption && (
                                <TouchableOpacity 
                                    style={styles.pollAddOptionBtn}
                                    onPress={onAddOption}
                                    activeOpacity={0.7}
                                >
                                    <Ionicons name="add" size={18} color={Colors.primary} />
                                    <Text style={styles.pollAddOptionText}>Add Option</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}
                </View>
            </View>

            {renderReactions()}
        </View>
    );
  }

  // --- STANDARD MESSAGE ---
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
      {renderSenderName()}
      <TouchableOpacity 
        onLongPress={() => onLongPress && onLongPress(message)} 
        delayLongPress={300}
        activeOpacity={0.9}
        style={{ position: 'relative' }} 
      >
          <View style={bubbleStyle}>
            {renderPinStatus()}

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
  container: { maxWidth: '75%', minWidth: '20%' },
  leftContainer: { alignSelf: 'flex-start', marginLeft: 10, alignItems: 'flex-start' },
  rightContainer: { alignSelf: 'flex-end', marginRight: 10, alignItems: 'flex-end' },
  
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  senderName: { color: Colors.textSecondary, fontSize: 12, fontWeight: '700' },
  editedLabel: { color: Colors.textSecondary, fontSize: 10, fontStyle: 'italic', opacity: 0.8 },

  pinContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 6,
      paddingBottom: 4,
      borderBottomWidth: 1,
  },
  pinText: {
      fontSize: 10,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 0.5
  },

  deletedBubble: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.2)' },
  deletedText: { fontStyle: 'italic', color: Colors.textSecondary, fontSize: 12 },

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

  // --- POLL STYLES ---
  pollCard: {
      backgroundColor: '#1C1C1E',
      borderRadius: 18,
      width: 260,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.1)',
      overflow: 'hidden',
  },
  pollHeader: {
      padding: 14,
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255,255,255,0.05)',
      backgroundColor: 'rgba(255,255,255,0.02)'
  },
  pollIconCircle: {
      width: 28, 
      height: 28, 
      borderRadius: 14, 
      backgroundColor: Colors.primary, 
      justifyContent: 'center', 
      alignItems: 'center'
  },
  pollQuestion: {
      fontSize: 16,
      fontWeight: '700',
      color: '#FFF',
      flex: 1,
      lineHeight: 22
  },
  pollOptionsList: {
      padding: 10,
      gap: 8
  },
  pollOptionWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6
  },
  pollOptionRow: {
      flex: 1,
      height: 44,
      borderRadius: 12,
      backgroundColor: 'rgba(255,255,255,0.05)',
      overflow: 'hidden',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: 'transparent'
  },
  pollOptionRowSelected: {
      borderColor: Colors.primary,
      backgroundColor: 'rgba(255,255,255,0.02)'
  },
  pollProgressBar: {
      position: 'absolute',
      left: 0, 
      top: 0, 
      bottom: 0,
      backgroundColor: 'rgba(255,255,255,0.1)',
      borderRadius: 0
  },
  pollOptionContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 12,
      zIndex: 1
  },
  pollEmptyCircle: {
      width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)', marginRight: 8
  },
  pollOptionText: {
      color: '#EEE',
      fontSize: 14,
      fontWeight: '500',
      flex: 1
  },
  pollPercentageBtn: {
      minWidth: 45,
      height: 44,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 8,
      backgroundColor: 'rgba(0,0,0,0.2)'
  },
  pollPercentageText: {
      color: Colors.textSecondary,
      fontSize: 11,
      fontWeight: '600'
  },
  
  // --- POLL FOOTER ---
  pollFooterContainer: {
      backgroundColor: 'rgba(0,0,0,0.1)',
      borderTopWidth: 1,
      borderTopColor: 'rgba(255,255,255,0.05)',
  },
  pollFooterToggle: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 12,
  },
  pollExpandBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4
  },
  pollExpandText: {
      color: Colors.primary,
      fontSize: 12,
      fontWeight: '600'
  },
  pollTotalVotes: {
      color: Colors.textSecondary,
      fontSize: 11
  },
  pollExpandedContent: {
      paddingHorizontal: 12,
      paddingBottom: 12,
      gap: 10
  },
  pollHintContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 4,
      opacity: 0.7
  },
  pollHintText: {
      color: Colors.textSecondary,
      fontSize: 11,
      fontStyle: 'italic'
  },
  pollAddOptionBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      backgroundColor: 'rgba(255,255,255,0.05)',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.1)',
      borderStyle: 'dashed'
  },
  pollAddOptionText: {
      color: Colors.primary,
      fontSize: 14,
      fontWeight: '600',
      marginLeft: 6
  },

  // --- REACTIONS ---
  reactionContainer: { 
      marginTop: -10, // Pulls the reactions up into the bubble slightly
      zIndex: 10, 
      flexDirection: 'row', 
      flexWrap: 'wrap', // This replaces the need for "chunkedReactions"
      gap: 4, 
      maxWidth: '100%',
  },
  reactionBadge: { 
      paddingHorizontal: 6, 
      paddingVertical: 4, 
      borderRadius: 12, 
      borderWidth: 1.5, // Slightly thicker border for better visibility against bubble
      flexDirection: 'row', 
      alignItems: 'center', 
      backgroundColor: '#2C2C2E', 
      borderColor: Colors.background, // Creates a "cutout" effect against the bubble
      minWidth: 28,
      justifyContent: 'center',
      marginBottom: 2 // Adds space if they wrap to a new line
  },
  reactionBadgeActive: { 
      backgroundColor: 'rgba(52, 199, 89, 0.15)', 
      borderColor: '#34C759' 
  },
  reactionBadgeInactive: {
      borderColor: Colors.background 
  },
  reactionText: { 
      fontSize: 11, 
      color: '#FFFFFF', 
      fontWeight: '500' 
  },
  reactionTextActive: {
      color: '#34C759', // Green text when selected
      fontWeight: '700'
  },

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