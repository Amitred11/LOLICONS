import React, { memo } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@config/Colors'; 

const { width } = Dimensions.get('window');

const PostCard = ({ 
  item, 
  onLike, 
  onUserPress, 
  onPress,        // Tap on body/image -> Go to Thread
  onReply,        // Tap on Reply button -> Go to Thread
  onShare,        // Tap on Share button
  onOptions,      // Tap on Three Dots
  hideOptions = false // Option to hide dots (optional)
}) => { 
  return (
    <View style={styles.card}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onUserPress} activeOpacity={0.8}> 
           <Image source={{ uri: item.avatar }} style={styles.avatar} />
        </TouchableOpacity>
        
        <View style={styles.headerText}>
           <TouchableOpacity onPress={onUserPress} activeOpacity={0.8}> 
             <Text style={styles.username}>{item.user}</Text>
           </TouchableOpacity>
           <View style={styles.metaRow}>
              <Text style={styles.time}>{item.time}</Text>
              {!!item.guild && (
                <>
                  <Text style={styles.dot}>•</Text>
                  <Text style={styles.guildName}>#{item.guild}</Text>
                </>
              )}
           </View>
        </View>
        
        {!hideOptions && (
          <TouchableOpacity style={styles.moreBtn} onPress={onOptions} hitSlop={10}>
            <Ionicons name="ellipsis-horizontal" size={20} color={Colors.textSecondary || "#94A3B8"} />
          </TouchableOpacity>
        )}
      </View>

      {/* TEXT CONTENT - Tapping text also goes to thread */}
      <TouchableOpacity activeOpacity={0.9} onPress={onPress} disabled={!onPress}>
        {item.content ? (
          <View style={styles.contentContainer}>
            <Text style={styles.content}>{item.content}</Text>
          </View>
        ) : null}
      </TouchableOpacity>

      {/* IMAGE CONTENT */}
      {!!item.image && (
        <TouchableOpacity activeOpacity={0.95} onPress={onPress} disabled={!onPress} style={styles.imageContainer}>
          <Image source={{ uri: item.image }} style={styles.postImage} resizeMode="cover" />
        </TouchableOpacity>
      )}

      {/* ACTION BAR */}
      <View style={styles.actions}>
        {/* Like */}
        <TouchableOpacity style={styles.actionBtn} onPress={onLike} activeOpacity={0.7}>
          <Ionicons 
            name={item.liked ? "heart" : "heart-outline"} 
            size={22} 
            color={item.liked ? "#EF4444" : "#94A3B8"} 
          />
          <Text style={[styles.actionText, item.liked && { color: '#EF4444' }]}>
            {item.likes > 0 ? item.likes : 'Like'}
          </Text>
        </TouchableOpacity>

        {/* Reply */}
        <TouchableOpacity style={styles.actionBtn} onPress={onReply} activeOpacity={0.7}>
          <Ionicons name="chatbubble-outline" size={22} color="#94A3B8" />
          <Text style={styles.actionText}>Reply</Text>
        </TouchableOpacity>

        {/* Share */}
        <TouchableOpacity style={styles.actionBtn} onPress={onShare} activeOpacity={0.7}>
          <Ionicons name="share-social-outline" size={22} color="#94A3B8" />
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1E293B', 
    marginHorizontal: 16, 
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, marginRight: 12, borderWidth: 1, borderColor: '#334155' },
  headerText: { flex: 1, justifyContent: 'center' },
  username: { color: '#FFF', fontWeight: 'bold', fontSize: 16, marginBottom: 2 },
  metaRow: { flexDirection: 'row', alignItems: 'center' },
  time: { color: '#94A3B8', fontSize: 12 },
  dot: { color: '#94A3B8', fontSize: 12, marginHorizontal: 4 },
  guildName: { color: '#6366F1', fontSize: 12, fontWeight: '600' },
  moreBtn: { padding: 4 },
  contentContainer: { marginBottom: 12 },
  content: { color: '#E2E8F0', fontSize: 15, lineHeight: 24 },
  imageContainer: { marginBottom: 12, borderRadius: 12, overflow: 'hidden' },
  postImage: { width: '100%', height: 250, backgroundColor: '#0F172A' },
  actions: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    borderTopWidth: 1, 
    borderTopColor: 'rgba(255,255,255,0.05)', 
    paddingTop: 14,
    marginTop: 4 
  },
  actionBtn: { flexDirection: 'row', alignItems: 'center', marginRight: 24 },
  actionText: { color: '#94A3B8', fontSize: 13, fontWeight: '500', marginLeft: 6 }
});

export default memo(PostCard);