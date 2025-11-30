import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PostCard = ({ item, onPress }) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(item.likes || 12);

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);
  };

  return (
    <View style={styles.cardContainer}>
      {/* Header */}
      <View style={styles.header}>
        <Image source={{ uri: item.avatar || 'https://ui-avatars.com/api/?background=random' }} style={styles.avatar} />
        <View style={styles.meta}>
          <Text style={styles.username}>{item.user}</Text>
          <Text style={styles.timestamp}>{item.time || '2h ago'}</Text>
        </View>
        <TouchableOpacity>
          <Ionicons name="ellipsis-horizontal" size={20} color="#64748B" />
        </TouchableOpacity>
      </View>

      {/* Body */}
      <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
        <Text style={styles.content}>{item.content}</Text>
        {item.postImage && (
          <Image source={{ uri: item.postImage }} style={styles.postImage} resizeMode="cover" />
        )}
      </TouchableOpacity>

      {/* Footer Actions */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.actionBtn} onPress={handleLike}>
          <Ionicons 
            name={liked ? "heart" : "heart-outline"} 
            size={22} 
            color={liked ? "#F43F5E" : "#94A3B8"} 
          />
          <Text style={[styles.actionText, liked && { color: '#F43F5E' }]}>{likeCount}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn}>
          <Ionicons name="chatbubble-outline" size={20} color="#94A3B8" />
          <Text style={styles.actionText}>{item.comments || 4} Comments</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn}>
          <Ionicons name="share-social-outline" size={20} color="#94A3B8" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#0F172A',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    paddingVertical: 16,
    paddingHorizontal: 20
  },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#334155' },
  meta: { flex: 1, marginLeft: 12 },
  username: { color: '#F8FAFC', fontWeight: '700', fontSize: 15 },
  timestamp: { color: '#64748B', fontSize: 12 },
  
  content: { color: '#E2E8F0', fontSize: 15, lineHeight: 22, marginBottom: 12 },
  postImage: { width: '100%', height: 220, borderRadius: 12, marginBottom: 12, backgroundColor: '#1E293B' },
  
  footer: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', marginRight: 24 },
  actionText: { color: '#94A3B8', fontSize: 13, marginLeft: 6, fontWeight: '500' }
});

export default PostCard;