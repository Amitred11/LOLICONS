import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@config/Colors';

const STORIES = [
  { id: '1', name: 'You', isMe: true, avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400' },
  { id: '2', name: 'Jess', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400', hasStory: true },
  { id: '3', name: 'Dave', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400', hasStory: true },
];

const CHATS = [
  { id: '1', type: 'direct', name: 'Jessica Parker', lastMessage: 'See you at the event!', time: '2m', unread: 2, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400' },
  { id: '2', type: 'group', name: 'Camping Trip 🏕️', lastMessage: 'David: I brought the tent', time: '1h', unread: 5 }, 
  { id: '3', type: 'community', name: 'React Native Devs', lastMessage: 'New version released!', time: '4h', unread: 0 },
];

const ChatListScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [filter, setFilter] = useState('All'); 

  const renderVibe = ({ item }) => (
    <TouchableOpacity style={styles.vibeCard}>
      <Image source={{ uri: item.avatar }} style={styles.vibeImage} />
      <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={styles.vibeOverlay} />
      {item.isMe && (
        <View style={styles.addVibeBtn}>
          <Ionicons name="add" size={16} color="#FFF" />
        </View>
      )}
      <Text style={styles.vibeName}>{item.name}</Text>
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
            <Text style={[styles.chatMessage, item.unread > 0 ? { color: '#FFF' } : { color: Colors.textSecondary }]} numberOfLines={1}>
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
      <View style={styles.header}>
        <View>
            <Text style={styles.greeting}>What's Good,</Text>
            <Text style={styles.title}>Messages</Text>
        </View>
        <TouchableOpacity 
            style={styles.newChatBtn}
            onPress={() => navigation.navigate('Friends')}
        >
            <Ionicons name="add" size={28} color="#000" />
        </TouchableOpacity>
      </View>

      <View style={{ height: 110, marginBottom: 20 }}>
        <FlatList 
            data={STORIES}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={renderVibe}
            contentContainerStyle={{ paddingHorizontal: 20, gap: 15 }}
        />
      </View>

      <View style={styles.listContainer}>
          <FlatList
            data={CHATS}
            keyExtractor={item => item.id}
            renderItem={renderChat}
            contentContainerStyle={{ paddingBottom: 100 }}
            ListHeaderComponent={
                <Text style={styles.sectionTitle}>Recents</Text>
            }
          />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 25, marginBottom: 20 },
  greeting: { color: Colors.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 14 },
  title: { fontSize: 32, fontFamily: 'Poppins_700Bold', color: Colors.text, lineHeight: 40 },
  
  newChatBtn: {
    width: 50, height: 50, borderRadius: 18,
    backgroundColor: Colors.secondary,
    justifyContent: 'center', alignItems: 'center',
    transform: [{ rotate: '-10deg' }] // Playful tilt
  },

  // Vibe Cards (Stories)
  vibeCard: { width: 75, height: 95, borderRadius: 20, overflow: 'hidden', backgroundColor: '#333' },
  vibeImage: { width: '100%', height: '100%' },
  vibeOverlay: { ...StyleSheet.absoluteFillObject },
  vibeName: { position: 'absolute', bottom: 6, left: 0, right: 0, textAlign: 'center', color: '#FFF', fontSize: 10, fontFamily: 'Poppins_600SemiBold' },
  vibeIndicator: { position: 'absolute', top: 6, right: 6, width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary, borderWidth: 1, borderColor: '#000' },
  addVibeBtn: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' },

  // Chat List
  listContainer: { flex: 1, backgroundColor: Colors.surface, borderTopLeftRadius: 40, borderTopRightRadius: 40, padding: 25 },
  sectionTitle: { color: 'rgba(255,255,255,0.4)', fontFamily: 'Poppins_600SemiBold', fontSize: 12, marginBottom: 15, textTransform: 'uppercase', letterSpacing: 1 },

  chatCard: { 
    backgroundColor: '#252525', 
    borderRadius: 24, 
    padding: 16, 
    marginBottom: 12,
  },
  chatRow: { flexDirection: 'row', alignItems: 'center' },
  chatAvatar: { width: 48, height: 48, borderRadius: 18 }, // Squircle
  groupAvatar: { width: 48, height: 48, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  
  chatContent: { flex: 1, marginLeft: 16 },
  chatHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  chatName: { color: Colors.text, fontSize: 16, fontFamily: 'Poppins_600SemiBold' },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.secondary, marginLeft: 6 },
  chatMessage: { fontSize: 13, fontFamily: 'Poppins_400Regular' },
  
  timeContainer: { justifyContent: 'flex-start', height: '100%' },
  chatTime: { color: 'rgba(255,255,255,0.3)', fontSize: 11, fontFamily: 'Poppins_500Medium' },
});

export default ChatListScreen;