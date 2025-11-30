import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ScrollView, SafeAreaView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@config/Colors'; 

// --- MOCK DATA ---
const GUILDS = [
  { id: 'all', label: 'All Realms', icon: 'earth' },
  { id: 'artist', label: 'Artists', icon: 'color-palette' },
  { id: 'dev', label: 'Devs', icon: 'code-slash' },
  { id: 'gamer', label: 'Gamers', icon: 'game-controller' },
];

const MARKET_ITEMS = [
  { id: '1', title: 'Wacom Tablet', price: '$50', guild: 'artist', image: 'https://via.placeholder.com/150' },
  { id: '2', title: 'Mech Keyboard', price: '$120', guild: 'dev', image: 'https://via.placeholder.com/150' },
  { id: '3', title: 'RTX 3080', price: '$500', guild: 'gamer', image: 'https://via.placeholder.com/150' },
  { id: '4', title: 'Commission Slot', price: '$25', guild: 'artist', image: 'https://via.placeholder.com/150' },
];

const POSTS = [
  { id: '1', user: 'PixelMaster', guild: 'artist', content: 'Just finished this new comic cover! Thoughts?', likes: 120 },
  { id: '2', user: 'CodeNinja', guild: 'dev', content: 'Anyone want to team up for the upcoming hackathon?', likes: 45 },
  { id: '3', user: 'ProGamer', guild: 'gamer', content: 'Looking for a squad for Apex tonight.', likes: 89 },
];

const CommunityScreen = ({ navigation }) => {
  const [activeGuild, setActiveGuild] = useState('all'); 
  const [viewMode, setViewMode] = useState('feed'); // 'feed' or 'market'

  // --- RENDER HELPERS ---

  const renderGuildSelector = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.guildScroll} contentContainerStyle={{ paddingHorizontal: 16 }}>
      {GUILDS.map((guild) => (
        <TouchableOpacity 
          key={guild.id} 
          style={[styles.guildChip, activeGuild === guild.id && styles.guildChipActive]}
          onPress={() => setActiveGuild(guild.id)}
        >
          <Ionicons name={guild.icon} size={16} color={activeGuild === guild.id ? '#FFF' : '#888'} />
          <Text style={[styles.guildText, activeGuild === guild.id && styles.guildTextActive]}>{guild.label}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderFeedItem = ({ item }) => (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <View style={styles.avatar} />
        <View>
          <Text style={styles.userName}>{item.user}</Text>
          <Text style={styles.guildTag}>@{item.guild}</Text>
        </View>
      </View>
      <Text style={styles.postContent}>{item.content}</Text>
      <View style={styles.postActions}>
        <TouchableOpacity style={styles.actionBtn}>
          <Ionicons name="heart-outline" size={20} color="#FFF" />
          <Text style={styles.actionText}>{item.likes}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}>
          <Ionicons name="chatbubble-outline" size={20} color="#FFF" />
          <Text style={styles.actionText}>Comment</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderMarketItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.marketCard} 
      onPress={() => navigation.navigate('MarketDetail', { item })} 
    >
      <Image source={{ uri: item.image }} style={styles.marketImage} />
      <View style={styles.marketInfo}>
        <Text style={styles.itemPrice}>{item.price}</Text>
        <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.itemGuild}>{item.guild.toUpperCase()}</Text>
      </View>
    </TouchableOpacity>
  );

  // Filter Data
  const filteredPosts = activeGuild === 'all' ? POSTS : POSTS.filter(p => p.guild === activeGuild);
  const filteredMarket = activeGuild === 'all' ? MARKET_ITEMS : MARKET_ITEMS.filter(m => m.guild === activeGuild);

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Community Hub</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity><Ionicons name="search" size={24} color="#FFF" /></TouchableOpacity>
          <TouchableOpacity style={{marginLeft: 15}}><Ionicons name="notifications" size={24} color="#FFF" /></TouchableOpacity>
        </View>
      </View>

      {/* GUILD FILTERS */}
      <View style={{ height: 60 }}>
        {renderGuildSelector()}
      </View>

      {/* VIEW TOGGLE (Feed vs Market) */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tabBtn, viewMode === 'feed' && styles.tabBtnActive]} 
          onPress={() => setViewMode('feed')}
        >
          <Text style={[styles.tabText, viewMode === 'feed' && styles.tabTextActive]}>Discussions</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabBtn, viewMode === 'market' && styles.tabBtnActive]} 
          onPress={() => setViewMode('market')}
        >
          <Text style={[styles.tabText, viewMode === 'market' && styles.tabTextActive]}>Marketplace</Text>
        </TouchableOpacity>
      </View>

      {/* CONTENT AREA */}
      <View style={styles.contentArea}>
        <FlatList
          // --- THE CRITICAL FIX IS HERE ---
          // Changing the key forces React to create a brand new FlatList instance
          // whenever viewMode changes.
          key={viewMode} 
          
          // Dynamic Data & Renderer
          data={viewMode === 'feed' ? filteredPosts : filteredMarket}
          renderItem={viewMode === 'feed' ? renderFeedItem : renderMarketItem}
          keyExtractor={item => item.id}
          
          // Dynamic Columns
          numColumns={viewMode === 'feed' ? 1 : 2}
          
          // Dynamic Styling
          // columnWrapperStyle is ONLY allowed when numColumns > 1
          columnWrapperStyle={
            viewMode === 'market' 
              ? { justifyContent: 'space-between', paddingHorizontal: 16 } 
              : null
          }
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      </View>

      {/* FAB - Create Post/Listing */}
      <TouchableOpacity style={styles.fab}>
        <Ionicons name="add" size={30} color="#FFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background || '#121212' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, alignItems: 'center', paddingTop: 45 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#FFF' },
  headerIcons: { flexDirection: 'row' },
  
  // Guild Selector
  guildScroll: { marginTop: 10 },
  guildChip: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#2A2A2A', 
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 10, height: 40 
  },
  guildChipActive: { backgroundColor: '#FF4500' }, 
  guildText: { color: '#888', marginLeft: 6, fontWeight: '600' },
  guildTextActive: { color: '#FFF' },

  // Tabs
  tabContainer: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 10 },
  tabBtn: { marginRight: 20, paddingBottom: 5 },
  tabBtnActive: { borderBottomWidth: 2, borderBottomColor: '#FF4500' },
  tabText: { color: '#666', fontSize: 16, fontWeight: '600' },
  tabTextActive: { color: '#FFF' },

  // Feed Styles
  contentArea: { flex: 1 },
  postCard: { backgroundColor: '#1E1E1E', marginHorizontal: 16, marginBottom: 15, padding: 15, borderRadius: 12 },
  postHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#333', marginRight: 10 },
  userName: { color: '#FFF', fontWeight: 'bold' },
  guildTag: { color: '#888', fontSize: 12 },
  postContent: { color: '#DDD', lineHeight: 20, marginBottom: 10 },
  postActions: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#333', paddingTop: 10 },
  actionBtn: { flexDirection: 'row', marginRight: 20, alignItems: 'center' },
  actionText: { color: '#888', marginLeft: 5 },

  // Market Styles
  marketCard: { width: '48%', backgroundColor: '#1E1E1E', borderRadius: 12, marginBottom: 15, padding: 10 },
  marketImage: { width: '100%', height: 100, borderRadius: 8, backgroundColor: '#333', marginBottom: 8 },
  marketInfo: { marginTop: 5 },
  itemPrice: { color: '#4CAF50', fontWeight: 'bold', fontSize: 16 },
  itemTitle: { color: '#FFF', fontSize: 14, marginVertical: 4 },
  itemGuild: { color: '#666', fontSize: 10 },

  // FAB
  fab: { 
    position: 'absolute', bottom: 20, right: 20, 
    width: 56, height: 56, borderRadius: 28, backgroundColor: '#FF4500', 
    alignItems: 'center', justifyContent: 'center', elevation: 5, shadowOpacity: 0.3 
  }
});

export default CommunityScreen;