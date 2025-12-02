import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PostCard = ({ item, onLike, onPress }) => {
  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={styles.card}>
      <View style={styles.header}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        <View style={styles.headerText}>
          {/* Wrap Text in View to prevent Reanimated warnings */}
          <View>
            <Text style={styles.username}>{item.user}</Text>
          </View>
          <View>
            <Text style={styles.time}>{item.time}</Text>
          </View>
        </View>
        <TouchableOpacity>
          <Ionicons name="ellipsis-horizontal" size={20} color="#94A3B8" />
        </TouchableOpacity>
      </View>

      {/* Content Text */}
      <View style={styles.contentContainer}>
        <Text style={styles.content}>{item.content}</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn} onPress={onLike}>
          <Ionicons 
            name={item.liked ? "heart" : "heart-outline"} 
            size={22} 
            color={item.liked ? "#EF4444" : "#94A3B8"} 
          />
          {/* CRITICAL FIX: Wrap the dynamic Like count in a View */}
          <View style={styles.textWrapper}>
            <Text style={[styles.actionText, item.liked && { color: '#EF4444' }]}>
              {item.likes}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn}>
          <Ionicons name="chatbubble-outline" size={22} color="#94A3B8" />
          <View style={styles.textWrapper}>
            <Text style={styles.actionText}>Reply</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn}>
          <Ionicons name="share-social-outline" size={22} color="#94A3B8" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1E293B',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
  },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
  headerText: { flex: 1 },
  username: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
  time: { color: '#94A3B8', fontSize: 12 },
  contentContainer: { marginBottom: 16 }, // Move margin here
  content: { color: '#E2E8F0', fontSize: 15, lineHeight: 22 },
  actions: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#334155', paddingTop: 12 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', marginRight: 24 },
  textWrapper: { marginLeft: 6 }, // Apply margin to wrapper, not Text
  actionText: { color: '#94A3B8', fontSize: 13, fontWeight: '500' }
});

export default PostCard;