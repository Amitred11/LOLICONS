import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Alert, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@config/Colors'; // Ensure this path is correct

// Mock Data
const STORIES = [
  { id: '1', name: 'You', isMe: true, avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400' },
  { id: '2', name: 'Jess', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400', hasStory: true },
  { id: '3', name: 'Dave', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400', hasStory: true },
  { id: '4', name: 'Sarah', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400', hasStory: false },
];

const CHATS = [
  { id: '1', type: 'direct', name: 'Jessica Parker', lastMessage: 'See you at the event!', time: '2m', unread: 2, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400' },
  { id: '2', type: 'group', name: 'Camping Trip 🏕️', lastMessage: 'David: I brought the tent', time: '1h', unread: 5 }, 
  { id: '3', type: 'community', name: 'React Native Devs', lastMessage: 'New version released!', time: '4h', unread: 0 },
  { id: '4', type: 'direct', name: 'Mike Ross', lastMessage: 'Sent an attachment', time: '1d', unread: 0, avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400' },
];

const CATEGORIES = ['All', 'Direct', 'Group', 'Community'];

const ChatListScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [activeFilter, setActiveFilter] = useState('All'); 

  // Filter Logic
  const filteredChats = useMemo(() => {
    if (activeFilter === 'All') return CHATS;
    return CHATS.filter(chat => chat.type.toLowerCase() === activeFilter.toLowerCase());
  }, [activeFilter]);

  const handleStoryPress = (name) => {
    Alert.alert("View Story", `Opening ${name}'s story...`);
  };

  const renderVibe = ({ item }) => (
    <TouchableOpacity 
      style={styles.vibeCard}
      onPress={() => item.isMe ? Alert.alert("Add Story", "Camera opening...") : handleStoryPress(item.name)}
    >
      <Image source={{ uri: item.avatar }} style={styles.vibeImage} />
      <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={styles.vibeOverlay} />
      {item.isMe ? (
        <View style={styles.addVibeBtn}>
          <Ionicons name="add" size={16} color="#FFF" />
        </View>
      ) : (
        <Text style={styles.vibeName}>{item.name}</Text>
      )}
      {item.hasStory && <View style={styles.vibeIndicator} />}
    </TouchableOpacity>
  );

  const renderChat = ({ item }) => (
    <TouchableOpacity 
        style={styles.chatCard} 
        activeOpacity={0.9}
        onPress={() => navigation.navigate('ChatDetail', { user: item })}
    >
      <View style={styles.chatRow}>
        {item.avatar ? (
            <Image source={{ uri: item.avatar }} style={styles.chatAvatar} />
        ) : (
            <LinearGradient 
                colors={item.type === 'group' ? [Colors.primary, '#2E86DE'] : [Colors.secondary, '#00C896']} 
                style={styles.groupAvatar}
            >
                <Ionicons name={item.type === 'group' ? "people" : "planet"} size={22} color="#000" />
            </LinearGradient>
        )}
        
        <View style={styles.chatContent}>
            <View style={styles.chatHeader}>
                <Text style={styles.chatName}>{item.name}</Text>
                {item.unread > 0 && <View style={styles.dot} />}
            </View>
            <Text 
              style={[styles.chatMessage, item.unread > 0 ? { color: Colors.text } : { color: Colors.textSecondary }]} 
              numberOfLines={1}
            >
                {item.lastMessage}
            </Text>
        </View>

        <View style={styles.timeContainer}>
            <Text style={styles.chatTime}>{item.time}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <View>
            <Text style={styles.greeting}>What's Good,</Text>
            <Text style={styles.title}>Messages</Text>
        </View>
        <TouchableOpacity 
            style={styles.newChatBtn}
            onPress={() => navigation.navigate('Friends')}
        >
            <Ionicons name="create-outline" size={26} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Stories Section */}
      <View style={{ height: 110, marginBottom: 10 }}>
        <FlatList 
            data={STORIES}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={renderVibe}
            contentContainerStyle={{ paddingHorizontal: 20, gap: 15 }}
        />
      </View>

      {/* Main List Area */}
      <View style={styles.listContainer}>
          {/* Filter Tabs */}
          <View style={styles.filterContainer}>
            <FlatList 
              horizontal
              data={CATEGORIES}
              showsHorizontalScrollIndicator={false}
              keyExtractor={item => item}
              contentContainerStyle={{ gap: 10, paddingHorizontal: 5 }}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  onPress={() => setActiveFilter(item)}
                  style={[
                    styles.filterPill, 
                    activeFilter === item && styles.filterPillActive
                  ]}
                >
                  <Text style={[
                    styles.filterText, 
                    activeFilter === item && styles.filterTextActive
                  ]}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>

          <FlatList
            data={filteredChats}
            keyExtractor={item => item.id}
            renderItem={renderChat}
            contentContainerStyle={{ paddingBottom: 100, paddingTop: 10 }}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No chats found in {activeFilter}</Text>
            }
          />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  
  // Header with MarginTop 15 as requested
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 25, 
    marginBottom: 20,
    marginTop: 15 
  },
  greeting: { color: Colors.textSecondary, fontSize: 14, fontWeight: '500' },
  title: { fontSize: 32, fontWeight: '800', color: Colors.text, lineHeight: 40 },
  
  newChatBtn: {
    width: 50, height: 50, borderRadius: 18,
    backgroundColor: Colors.secondary,
    justifyContent: 'center', alignItems: 'center',
    transform: [{ rotate: '-5deg' }],
    shadowColor: Colors.secondary, shadowOpacity: 0.5, shadowRadius: 10
  },

  // Stories
  vibeCard: { width: 75, height: 95, borderRadius: 20, overflow: 'hidden', backgroundColor: Colors.surface },
  vibeImage: { width: '100%', height: '100%' },
  vibeOverlay: { ...StyleSheet.absoluteFillObject },
  vibeName: { position: 'absolute', bottom: 6, left: 0, right: 0, textAlign: 'center', color: '#FFF', fontSize: 10, fontWeight: '600' },
  vibeIndicator: { position: 'absolute', top: 6, right: 6, width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.primary, borderWidth: 2, borderColor: '#000' },
  addVibeBtn: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' },

  // List Container
  listContainer: { flex: 1, backgroundColor: Colors.surface, borderTopLeftRadius: 40, borderTopRightRadius: 40, paddingHorizontal: 20, paddingTop: 20 },
  
  // Filters
  filterContainer: { marginBottom: 15, height: 40 },
  filterPill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  filterPillActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterText: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600' },
  filterTextActive: { color: '#FFF' },
  emptyText: { color: Colors.textSecondary, textAlign: 'center', marginTop: 30 },

  // Chat Item
  chatCard: { 
    backgroundColor: '#252525', 
    borderRadius: 24, 
    padding: 16, 
    marginBottom: 12,
  },
  chatRow: { flexDirection: 'row', alignItems: 'center' },
  chatAvatar: { width: 50, height: 50, borderRadius: 18 },
  groupAvatar: { width: 50, height: 50, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  
  chatContent: { flex: 1, marginLeft: 16 },
  chatHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4, justifyContent: 'space-between', paddingRight: 10 },
  chatName: { color: Colors.text, fontSize: 16, fontWeight: '700' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.secondary, position: 'absolute', right: -12, top: 6 },
  chatMessage: { fontSize: 13, fontWeight: '400' },
  
  timeContainer: { justifyContent: 'flex-start', height: '100%' },
  chatTime: { color: 'rgba(255,255,255,0.3)', fontSize: 11, fontWeight: '600' },
});

export default ChatListScreen;