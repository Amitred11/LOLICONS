import React, { useState, useMemo } from 'react';
import { 
  View, Text, StyleSheet, FlatList, Image, TouchableOpacity, 
  Alert, StatusBar, TextInput, Modal, LayoutAnimation, Platform, UIManager 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@config/Colors'; 

// Enable LayoutAnimation for Android
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

// Initial Mock Data
const INITIAL_CHATS = [
  { id: '1', type: 'direct', name: 'Jessica Parker', lastMessage: 'See you at the event!', time: '2m', unread: 2, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400', isOnline: true },
  { id: '2', type: 'group', name: 'Camping Trip 🏕️', lastMessage: 'David: I brought the tent', time: '1h', unread: 5, isOnline: false }, 
  { id: '3', type: 'community', name: 'React Native Devs', lastMessage: 'New version released!', time: '4h', unread: 0, isOnline: false },
  { id: '4', type: 'direct', name: 'Mike Ross', lastMessage: 'Sent an attachment', time: '1d', unread: 0, avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400', isOnline: true },
  { id: '5', type: 'direct', name: 'Sarah Connor', lastMessage: 'The future is not set.', time: '2d', unread: 0, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400', isOnline: false },
];

const CATEGORIES = ['All', 'Direct', 'Group', 'Community'];

const ChatListScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  
  // State
  const [chats, setChats] = useState(INITIAL_CHATS);
  const [activeFilter, setActiveFilter] = useState('All'); 
  const [searchText, setSearchText] = useState('');
  
  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);

  // --- Logic ---

  const filteredChats = useMemo(() => {
    return chats.filter(chat => {
      // 1. Filter by Category
      const matchesCategory = activeFilter === 'All' || chat.type.toLowerCase() === activeFilter.toLowerCase();
      // 2. Filter by Search
      const matchesSearch = chat.name.toLowerCase().includes(searchText.toLowerCase()) || 
                            chat.lastMessage.toLowerCase().includes(searchText.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeFilter, searchText, chats]);

  const handleLongPress = (item) => {
    setSelectedChat(item);
    setModalVisible(true);
  };

  const performAction = (action) => {
    setModalVisible(false);
    setTimeout(() => {
      if (action === 'delete') {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setChats(prev => prev.filter(c => c.id !== selectedChat.id));
      } else if (action === 'archive') {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setChats(prev => prev.filter(c => c.id !== selectedChat.id));
        Alert.alert("Archived", `${selectedChat.name} moved to archives.`);
      } else if (action === 'mute') {
        Alert.alert("Muted", `Notifications from ${selectedChat.name} muted.`);
      }
    }, 300);
  };

  // --- Render Items ---

  const renderChat = ({ item }) => (
    <TouchableOpacity 
        style={styles.chatCard} 
        activeOpacity={0.7}
        onPress={() => navigation.navigate('ChatDetail', { user: item })}
        onLongPress={() => handleLongPress(item)}
    >
      <View style={styles.chatRow}>
        <View>
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
            {item.isOnline && <View style={styles.onlineBadge} />}
        </View>
        
        <View style={styles.chatContent}>
            <View style={styles.chatHeader}>
                <Text style={styles.chatName}>{item.name}</Text>
                <Text style={styles.chatTime}>{item.time}</Text>
            </View>
            <View style={styles.msgRow}>
                <Text 
                  style={[styles.chatMessage, item.unread > 0 ? { color: Colors.text, fontWeight: '600' } : { color: Colors.textSecondary }]} 
                  numberOfLines={1}
                >
                    {item.type === 'group' && !item.lastMessage.includes(':') ? `Member: ${item.lastMessage}` : item.lastMessage}
                </Text>
                {item.unread > 0 && (
                    <View style={styles.unreadBadge}>
                        <Text style={styles.unreadText}>{item.unread}</Text>
                    </View>
                )}
            </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Background Gradient Spot */}
      <View style={styles.bgGlow} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            style={styles.iconBtn}
        >
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Messages</Text>

        <TouchableOpacity 
            style={styles.iconBtn}
            onPress={() => navigation.navigate('Friends')} // Or Create Chat
        >
            <Ionicons name="add" size={28} color={Colors.text} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color={Colors.textSecondary} />
            <TextInput 
                placeholder="Search conversations..."
                placeholderTextColor={Colors.textSecondary}
                style={styles.searchInput}
                value={searchText}
                onChangeText={setSearchText}
            />
            {searchText.length > 0 && (
                <TouchableOpacity onPress={() => setSearchText('')}>
                    <Ionicons name="close-circle" size={18} color={Colors.textSecondary} />
                </TouchableOpacity>
            )}
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <FlatList 
          horizontal
          data={CATEGORIES}
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => item}
          contentContainerStyle={{ gap: 12, paddingHorizontal: 20 }}
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

      {/* Chat List */}
      <FlatList
        data={filteredChats}
        keyExtractor={item => item.id}
        renderItem={renderChat}
        contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 20 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={60} color={Colors.textSecondary} style={{ opacity: 0.3 }} />
            <Text style={styles.emptyText}>No messages found</Text>
          </View>
        }
      />

      {/* Action Modal (Long Press) */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity 
            style={styles.modalOverlay} 
            activeOpacity={1} 
            onPress={() => setModalVisible(false)}
        >
            <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Options for {selectedChat?.name}</Text>
                </View>
                
                <TouchableOpacity style={styles.modalOption} onPress={() => performAction('mute')}>
                    <Ionicons name="notifications-off-outline" size={22} color={Colors.text} />
                    <Text style={styles.modalText}>Mute Notifications</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.modalOption} onPress={() => performAction('archive')}>
                    <Ionicons name="archive-outline" size={22} color={Colors.text} />
                    <Text style={styles.modalText}>Archive Chat</Text>
                </TouchableOpacity>

                <View style={styles.divider} />

                <TouchableOpacity style={styles.modalOption} onPress={() => performAction('delete')}>
                    <Ionicons name="trash-outline" size={22} color="#FF453A" />
                    <Text style={[styles.modalText, { color: '#FF453A' }]}>Delete Conversation</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
      </Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  bgGlow: {
    position: 'absolute', top: -50, right: -50, width: 200, height: 200,
    backgroundColor: Colors.primary, opacity: 0.15, borderRadius: 100, blurRadius: 80
  },
  
  // Header
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    marginBottom: 15 
  },
  headerTitle: { fontSize: 28, fontWeight: '700', color: Colors.text },
  iconBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)'
  },

  // Search
  searchContainer: { paddingHorizontal: 20, marginBottom: 20 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#1E1E1E', 
    height: 46, borderRadius: 14, paddingHorizontal: 15,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)'
  },
  searchInput: { flex: 1, marginLeft: 10, color: Colors.text, fontSize: 15 },

  // Filters
  filterContainer: { marginBottom: 20, height: 35 },
  filterPill: { 
    paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20, 
    backgroundColor: 'transparent', 
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' 
  },
  filterPillActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterText: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600' },
  filterTextActive: { color: '#000', fontWeight: '700' },

  // List Item
  chatCard: { 
    marginBottom: 16,
    padding: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  chatRow: { flexDirection: 'row', alignItems: 'center' },
  chatAvatar: { width: 56, height: 56, borderRadius: 28 },
  groupAvatar: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
  onlineBadge: {
    position: 'absolute', bottom: 2, right: 2,
    width: 14, height: 14, borderRadius: 7,
    backgroundColor: '#4CD964', borderWidth: 2, borderColor: Colors.background
  },
  
  chatContent: { flex: 1, marginLeft: 15, justifyContent: 'center' },
  chatHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  chatName: { color: Colors.text, fontSize: 16, fontWeight: '700' },
  chatTime: { color: Colors.textSecondary, fontSize: 12 },
  
  msgRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  chatMessage: { flex: 1, fontSize: 14, marginRight: 10 },
  unreadBadge: { 
    backgroundColor: Colors.primary, paddingHorizontal: 6, paddingVertical: 2, 
    borderRadius: 10, minWidth: 20, alignItems: 'center' 
  },
  unreadText: { color: '#000', fontSize: 10, fontWeight: 'bold' },

  emptyContainer: { alignItems: 'center', marginTop: 80 },
  emptyText: { color: Colors.textSecondary, marginTop: 15, fontSize: 16 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { 
    backgroundColor: '#1E1E1E', 
    borderTopLeftRadius: 25, borderTopRightRadius: 25, 
    padding: 25, paddingBottom: 40,
    borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.1)'
  },
  modalHeader: { marginBottom: 20, alignItems: 'center' },
  modalTitle: { color: Colors.textSecondary, fontSize: 14, fontWeight: '600' },
  modalOption: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15 },
  modalText: { color: Colors.text, fontSize: 17, marginLeft: 15, fontWeight: '500' },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginVertical: 10 },
});

export default ChatListScreen;