import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { 
  View, Text, StyleSheet, FlatList, Image, TouchableOpacity, 
  StatusBar, TextInput, Modal, LayoutAnimation, Platform, 
  ActivityIndicator, RefreshControl, Animated, Dimensions, ScrollView
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@config/Colors'; 
import { useAlert } from '@context/other/AlertContext';
import { useChat } from '@context/hub/ChatContext'; 

const { width } = Dimensions.get('window');
const CATEGORIES = ['All', 'Direct', 'Group', 'Community'];

// --- Helper: Animated Item ---
const AnimatedChatItem = ({ index, children }) => {
    const animatedValue = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        Animated.timing(animatedValue, { 
            toValue: 1, 
            duration: 500, 
            delay: index * 60, 
            useNativeDriver: true 
        }).start();
    }, []);
    
    const translateY = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [20, 0]
    });

    return (
        <Animated.View style={{ opacity: animatedValue, transform: [{ translateY }] }}>
            {children}
        </Animated.View>
    );
};

// --- Helper: Horizontal Favorites Component ---
const FavoritesRail = ({ chats, onSelect }) => {
    // Filter online or pinned chats for this rail
    const favorites = chats.filter(c => c.pinned || c.isOnline).slice(0, 5);
    
    if (favorites.length === 0) return null;

    return (
        <View style={styles.railContainer}>
            <Text style={styles.sectionTitle}>Favorites</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
                {favorites.map((item, index) => (
                    <TouchableOpacity 
                        key={item.id} 
                        style={styles.favItem}
                        onPress={() => onSelect(item)}
                        activeOpacity={0.8}
                    >
                        <View style={styles.favAvatarContainer}>
                            {item.avatar ? (
                                <Image source={{ uri: item.avatar }} style={styles.favAvatar} />
                            ) : (
                                <LinearGradient colors={[Colors.primary, '#8E2DE2']} style={styles.favPlaceholder}>
                                    <Text style={styles.favInitials}>{item.name.charAt(0)}</Text>
                                </LinearGradient>
                            )}
                            {item.isOnline && <View style={styles.favOnlineBadge} />}
                        </View>
                        <Text style={styles.favName} numberOfLines={1}>{item.name.split(' ')[0]}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
};

const ChatListScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { showToast } = useAlert();
  
  const { 
      chats, isLoadingChats, loadChats, pinChat, toggleReadStatus, toggleMute, archiveChat, deleteChat 
  } = useChat();
  
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All'); 
  const [searchText, setSearchText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);

  useEffect(() => { loadChats(); }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadChats(true);
    setRefreshing(false);
  }, [loadChats]);

  const processedChats = useMemo(() => {
    let result = chats.filter(chat => {
      const matchesCategory = activeFilter === 'All' || chat.type.toLowerCase() === activeFilter.toLowerCase();
      const matchesSearch = chat.name.toLowerCase().includes(searchText.toLowerCase()) || 
                            chat.lastMessage.toLowerCase().includes(searchText.toLowerCase());
      return matchesCategory && matchesSearch;
    });
    return result.sort((a, b) => (b.pinned === a.pinned ? 0 : b.pinned ? 1 : -1));
  }, [activeFilter, searchText, chats]);

  const handleLongPress = (item) => {
    setSelectedChat(item);
    setModalVisible(true);
  };

  const performAction = (action) => {
    setModalVisible(false);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    switch (action) {
      case 'pin': pinChat(selectedChat.id); break;
      case 'read': toggleReadStatus(selectedChat.id); break;
      case 'mute': 
        toggleMute(selectedChat.id, false); 
        showToast("Notifications silenced", 'success');
        break;
      case 'archive': archiveChat(selectedChat.id); break;
      case 'delete': deleteChat(selectedChat.id); break;
    }
  };

  const renderChat = ({ item, index }) => (
    <AnimatedChatItem index={index}>
        <TouchableOpacity 
            style={[styles.chatCard, item.pinned && styles.chatCardPinned]} 
            activeOpacity={0.7}
            onPress={() => navigation.navigate('ChatDetail', { user: item })}
            onLongPress={() => handleLongPress(item)}
        >
            {/* Avatar - Squircle Shape */}
            <View style={styles.avatarContainer}>
                {item.avatar ? (
                    <Image source={{ uri: item.avatar }} style={styles.chatAvatar} />
                ) : (
                    <LinearGradient 
                        colors={item.type === 'group' ? ['#FF416C', '#FF4B2B'] : ['#2C3E50', '#4CA1AF']} 
                        style={styles.placeholderAvatar}
                    >
                        <Text style={styles.avatarLetter}>{item.name.charAt(0)}</Text>
                    </LinearGradient>
                )}
                {item.isOnline && <View style={styles.onlineBadge} />}
            </View>

            {/* Content */}
            <View style={styles.chatContentContainer}>
                <View style={styles.chatTopRow}>
                    <Text style={[styles.chatName, item.unread > 0 && styles.chatNameUnread]} numberOfLines={1}>
                        {item.name}
                    </Text>
                    <Text style={[styles.chatTime, item.unread > 0 && styles.chatTimeUnread]}>
                        {item.time}
                    </Text>
                </View>

                <View style={styles.chatBottomRow}>
                    <Text 
                        style={[styles.chatPreview, item.unread > 0 ? styles.chatPreviewUnread : null]} 
                        numberOfLines={1}
                    >
                        {item.type === 'group' && !item.lastMessage.includes(':') 
                            ? <Text style={{color: Colors.textSecondary}}>{item.lastMessage.split(':')[0]}: </Text> 
                            : null}
                        {item.lastMessage}
                    </Text>
                    
                    <View style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
                        {item.pinned && <Ionicons name="pin" size={12} color={Colors.primary} />}
                        {item.isMuted && <Ionicons name="volume-mute" size={12} color={Colors.textSecondary} />}
                        {item.unread > 0 && (
                            <LinearGradient colors={[Colors.primary, '#00C6FF']} style={styles.unreadBadge}>
                                <Text style={styles.unreadText}>{item.unread}</Text>
                            </LinearGradient>
                        )}
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    </AnimatedChatItem>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Background Ambient Glows */}
      <View style={styles.ambientGlowTop} />
      <View style={styles.ambientGlowBottom} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
        >
            <Ionicons name="chevron-back" size={24} color="#FFF" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Messages</Text>
        
        <TouchableOpacity style={styles.newChatBtn} onPress={() => navigation.navigate('Friends')}>
             <Ionicons name="add" size={26} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
            <Ionicons name="search" size={18} color="#666" />
            <TextInput 
                placeholder="Search conversations..."
                placeholderTextColor="#666"
                style={styles.searchInput}
                value={searchText}
                onChangeText={setSearchText}
            />
        </View>
      </View>

      {/* Categories */}
      <View style={styles.categoriesSection}>
        <FlatList 
          horizontal
          data={CATEGORIES}
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => item}
          contentContainerStyle={{ gap: 10, paddingHorizontal: 20 }}
          renderItem={({ item }) => (
            <TouchableOpacity 
              onPress={() => setActiveFilter(item)}
              style={[styles.filterPill, activeFilter === item && styles.filterPillActive]}
            >
                {activeFilter === item && (
                    <LinearGradient colors={[Colors.primary, '#00C6FF']} style={StyleSheet.absoluteFill} start={{x:0, y:0}} end={{x:1, y:1}} />
                )}
              <Text style={[styles.filterText, activeFilter === item && styles.filterTextActive]}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Chat List */}
      {isLoadingChats && !refreshing ? (
        <View style={styles.centerContainer}><ActivityIndicator size="large" color={Colors.primary} /></View>
      ) : (
        <FlatList
            data={processedChats}
            keyExtractor={item => item.id}
            renderItem={renderChat}
            ListHeaderComponent={
                <FavoritesRail 
                    chats={chats} 
                    onSelect={(chat) => navigation.navigate('ChatDetail', { user: chat })} 
                />
            }
            contentContainerStyle={{ paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
            ListEmptyComponent={
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No chats found</Text>
                </View>
            }
        />
      )}

      {/* Modern Action Modal */}
      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setModalVisible(false)}>
            <View style={styles.modalContent}>
                <View style={styles.modalHandle} />
                <Text style={styles.modalTitle}>{selectedChat?.name}</Text>
                <View style={styles.modalGrid}>
                     <TouchableOpacity style={styles.modalGridItem} onPress={() => performAction('pin')}>
                        <View style={styles.modalIconBg}><Ionicons name="pin" size={22} color="#FFF" /></View>
                        <Text style={styles.modalGridText}>{selectedChat?.pinned ? "Unpin" : "Pin"}</Text>
                     </TouchableOpacity>
                     <TouchableOpacity style={styles.modalGridItem} onPress={() => performAction('read')}>
                        <View style={styles.modalIconBg}><Ionicons name="mail-open" size={22} color="#FFF" /></View>
                        <Text style={styles.modalGridText}>{selectedChat?.unread > 0 ? "Read" : "Unread"}</Text>
                     </TouchableOpacity>
                     <TouchableOpacity style={styles.modalGridItem} onPress={() => performAction('mute')}>
                        <View style={styles.modalIconBg}><Ionicons name="volume-mute" size={22} color="#FFF" /></View>
                        <Text style={styles.modalGridText}>Mute</Text>
                     </TouchableOpacity>
                     <TouchableOpacity style={styles.modalGridItem} onPress={() => performAction('delete')}>
                        <View style={[styles.modalIconBg, {backgroundColor: 'rgba(255,59,48,0.2)'}]}><Ionicons name="trash" size={22} color="#FF3B30" /></View>
                        <Text style={[styles.modalGridText, {color: '#FF3B30'}]}>Delete</Text>
                     </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09090b' }, // Very Deep Dark Gray
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  // Ambient Background
  ambientGlowTop: { position: 'absolute', top: -100, left: -50, width: width, height: 400, backgroundColor: Colors.primary, opacity: 0.08, borderRadius: width, blurRadius: 100 },
  ambientGlowBottom: { position: 'absolute', bottom: -100, right: -50, width: width, height: 400, backgroundColor: '#00C6FF', opacity: 0.05, borderRadius: width, blurRadius: 100 },

  // Header
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 15 },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#FFF', letterSpacing: 0.5 },
  backButton: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.08)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  newChatBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center', shadowColor: Colors.primary, shadowOpacity: 0.4, shadowRadius: 10 },

  // Search
  searchSection: { paddingHorizontal: 20, marginBottom: 15 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', height: 46, borderRadius: 16, paddingHorizontal: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  searchInput: { flex: 1, marginLeft: 10, color: '#FFF', fontSize: 16 },

  // Categories
  categoriesSection: { marginBottom: 20 },
  filterPill: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.05)', marginRight: 0, overflow: 'hidden' },
  filterPillActive: { backgroundColor: 'transparent' }, 
  filterText: { color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: '600' },
  filterTextActive: { color: '#FFF', fontWeight: '800' },

  // Favorites Rail
  railContainer: { marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#FFF', marginLeft: 20, marginBottom: 12 },
  favItem: { alignItems: 'center', marginRight: 15, width: 64 },
  favAvatarContainer: { marginBottom: 6, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5 },
  favAvatar: { width: 60, height: 60, borderRadius: 22, borderWidth: 2, borderColor: '#1E1E1E' },
  favPlaceholder: { width: 60, height: 60, borderRadius: 22, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#1E1E1E' },
  favInitials: { fontSize: 24, fontWeight: 'bold', color: '#FFF' },
  favOnlineBadge: { position: 'absolute', bottom: -2, right: -2, width: 14, height: 14, borderRadius: 7, backgroundColor: '#34C759', borderWidth: 2, borderColor: '#09090b' },
  favName: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '500' },

  // Chat Card
  chatCard: { flexDirection: 'row', paddingVertical: 12, paddingHorizontal: 20, marginBottom: 2 },
  chatCardPinned: { backgroundColor: 'rgba(255,255,255,0.03)' },
  
  // Avatar - Squircle
  avatarContainer: { position: 'relative', marginRight: 15 },
  chatAvatar: { width: 54, height: 54, borderRadius: 18, backgroundColor: '#222' },
  placeholderAvatar: { width: 54, height: 54, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  avatarLetter: { fontSize: 22, fontWeight: 'bold', color: '#FFF' },
  onlineBadge: { position: 'absolute', bottom: -1, right: -1, width: 14, height: 14, borderRadius: 7, backgroundColor: '#34C759', borderWidth: 2, borderColor: '#09090b' },
  
  // Content
  chatContentContainer: { flex: 1, justifyContent: 'center', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)', paddingBottom: 12 },
  chatTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  chatName: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  chatNameUnread: { fontWeight: '800', fontSize: 17 },
  chatTime: { color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: '500' },
  chatTimeUnread: { color: Colors.primary, fontWeight: '700' },
  
  chatBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  chatPreview: { color: 'rgba(255,255,255,0.5)', fontSize: 14, flex: 1, marginRight: 10 },
  chatPreviewUnread: { color: '#FFF', fontWeight: '600' },
  
  unreadBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, minWidth: 20, justifyContent: 'center', alignItems: 'center' },
  unreadText: { color: '#FFF', fontSize: 11, fontWeight: 'bold' },

  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { color: '#666', fontSize: 16 },

  // Modern Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#18181b', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 25, paddingBottom: 40 },
  modalHandle: { width: 40, height: 5, backgroundColor: '#333', borderRadius: 2.5, alignSelf: 'center', marginBottom: 20 },
  modalTitle: { color: '#FFF', fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 30 },
  modalGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  modalGridItem: { alignItems: 'center', width: width / 5 },
  modalIconBg: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.08)', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  modalGridText: { color: '#FFF', fontSize: 12, fontWeight: '500' },
});

export default ChatListScreen;