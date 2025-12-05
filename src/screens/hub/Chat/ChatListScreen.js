import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { 
  View, Text, StyleSheet, FlatList, Image, TouchableOpacity, 
  StatusBar, TextInput, Modal, LayoutAnimation, Platform, UIManager,
  ActivityIndicator, RefreshControl, Animated, Dimensions
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@config/Colors'; 
import { useAlert } from '@context/AlertContext';
import { useChat } from '@context/hub/ChatContext'; // IMPT: Import Context

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width } = Dimensions.get('window');
const CATEGORIES = ['All', 'Direct', 'Group', 'Community'];

// ... AnimatedChatItem Component remains the same ...
const AnimatedChatItem = ({ index, children }) => {
    const animatedValue = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        Animated.timing(animatedValue, { toValue: 1, duration: 400, delay: index * 100, useNativeDriver: true }).start();
    }, []);
    const translateY = animatedValue.interpolate({ inputRange: [0, 1], outputRange: [50, 0] });
    return (
        <Animated.View style={{ opacity: animatedValue, transform: [{ translateY }] }}>
            {children}
        </Animated.View>
    );
};

const ChatListScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { showAlert } = useAlert();
  
  // Consuming Context
  const { 
      chats, 
      isLoadingChats, 
      loadChats, 
      pinChat, 
      toggleReadStatus, 
      toggleMute, 
      archiveChat, 
      deleteChat 
  } = useChat();
  
  // Local UI State
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All'); 
  const [searchText, setSearchText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);

  // --- Data Loading ---
  useEffect(() => {
    loadChats();
  }, []);

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

  // --- Actions ---
  const handleLongPress = (item) => {
    setSelectedChat(item);
    setModalVisible(true);
  };

  const performAction = (action) => {
    setModalVisible(false);
    
    // Animate layout changes for list updates
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    switch (action) {
      case 'pin':
        pinChat(selectedChat.id);
        break;
      case 'read':
        toggleReadStatus(selectedChat.id);
        break;
      case 'mute':
        showAlert({
            title: "Mute Notification",
            message: `Mute notifications for ${selectedChat.name}?`,
            type: 'info',
            btnText: "Mute",
            secondaryBtnText: "Cancel",
            onClose: async () => {
                await toggleMute(selectedChat.id, false); // Assuming false = currently not muted
                showAlert({ title: "Muted", message: "Notifications silenced.", type: 'success' });
            }
        });
        break;
      case 'archive':
        showAlert({
            title: "Archive Chat",
            message: `Archive ${selectedChat.name}?`,
            type: 'info',
            btnText: "Archive",
            secondaryBtnText: "Cancel",
            onClose: async () => {
                await archiveChat(selectedChat.id);
            }
        });
        break;
      case 'delete':
        showAlert({
            title: "Delete Conversation",
            message: "This action cannot be undone.",
            type: 'error',
            btnText: "Delete",
            secondaryBtnText: "Cancel",
            onClose: async () => {
                await deleteChat(selectedChat.id);
            }
        });
        break;
    }
  };

  const renderChat = ({ item, index }) => (
    <AnimatedChatItem index={index}>
        <TouchableOpacity 
            style={[styles.chatCard, item.pinned && styles.pinnedCard]} 
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
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                        <Text style={styles.chatName}>{item.name}</Text>
                        {item.pinned && <Ionicons name="pin" size={12} color={Colors.primary} style={{marginLeft: 6}} />}
                    </View>
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
    </AnimatedChatItem>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.bgGlowTop} />
      <View style={styles.bgGlowBottom} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.headerLabel}>Good Morning,</Text>
            <Text style={styles.headerTitle}>Messages</Text>
        </View>
        <TouchableOpacity style={styles.fabHeader} onPress={() => navigation.navigate('Friends')}>
            <LinearGradient colors={[Colors.primary, '#2E86DE']} style={styles.fabGradient}>
                <Ionicons name="add" size={24} color="#000" />
            </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color={Colors.textSecondary} />
            <TextInput 
                placeholder="Search..."
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

      {/* Categories */}
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
              style={[styles.filterPill, activeFilter === item && styles.filterPillActive]}
            >
              <Text style={[styles.filterText, activeFilter === item && styles.filterTextActive]}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* List */}
      {isLoadingChats && !refreshing ? (
        <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
            data={processedChats}
            keyExtractor={item => item.id}
            renderItem={renderChat}
            contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 20 }}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
            ListEmptyComponent={
            <View style={styles.emptyContainer}>
                <Ionicons name="chatbubbles-outline" size={60} color={Colors.textSecondary} style={{ opacity: 0.3 }} />
                <Text style={styles.emptyText}>No messages found</Text>
            </View>
            }
        />
      )}

      {/* Action Modal */}
      <Modal animationType="fade" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setModalVisible(false)}>
            <View style={styles.modalContent}>
                <View style={styles.modalIndicator} />
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Actions for <Text style={{color: Colors.primary}}>{selectedChat?.name}</Text></Text>
                </View>
                <View style={styles.modalGrid}>
                    <TouchableOpacity style={styles.gridAction} onPress={() => performAction('pin')}>
                        <View style={styles.gridIconBox}><Ionicons name={selectedChat?.pinned ? "pin" : "pin-outline"} size={24} color={Colors.text} /></View>
                        <Text style={styles.gridLabel}>{selectedChat?.pinned ? "Unpin" : "Pin"}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.gridAction} onPress={() => performAction('read')}>
                        <View style={styles.gridIconBox}><Ionicons name={selectedChat?.unread > 0 ? "mail-open-outline" : "mail-unread-outline"} size={24} color={Colors.text} /></View>
                        <Text style={styles.gridLabel}>{selectedChat?.unread > 0 ? "Read" : "Unread"}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.gridAction} onPress={() => performAction('mute')}>
                        <View style={styles.gridIconBox}><Ionicons name="notifications-off-outline" size={24} color={Colors.text} /></View>
                        <Text style={styles.gridLabel}>Mute</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.gridAction} onPress={() => performAction('archive')}>
                        <View style={styles.gridIconBox}><Ionicons name="archive-outline" size={24} color={Colors.text} /></View>
                        <Text style={styles.gridLabel}>Archive</Text>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.dangerBtn} onPress={() => performAction('delete')}>
                    <Ionicons name="trash-outline" size={20} color="#FFF" />
                    <Text style={styles.dangerText}>Delete Conversation</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  bgGlowTop: { position: 'absolute', top: -100, right: -50, width: 300, height: 300, backgroundColor: Colors.primary, opacity: 0.1, borderRadius: 150, blurRadius: 100 },
  bgGlowBottom: { position: 'absolute', bottom: -100, left: -50, width: 300, height: 300, backgroundColor: Colors.secondary, opacity: 0.05, borderRadius: 150, blurRadius: 100 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 20 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center', marginRight: 5 },
  headerLabel: { color: Colors.textSecondary, fontSize: 14, fontWeight: '600', marginBottom: 4 },
  headerTitle: { fontSize: 32, fontWeight: '800', color: Colors.text, letterSpacing: -0.5 },
  fabHeader: { shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  fabGradient: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  searchContainer: { paddingHorizontal: 20, marginBottom: 20 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', height: 50, borderRadius: 16, paddingHorizontal: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  searchInput: { flex: 1, marginLeft: 10, color: Colors.text, fontSize: 16 },
  filterContainer: { marginBottom: 20, height: 40 },
  filterPill: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', marginRight: 0 },
  filterPillActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterText: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600' },
  filterTextActive: { color: '#000', fontWeight: '700' },
  chatCard: { marginBottom: 12, padding: 16, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.02)' },
  pinnedCard: { backgroundColor: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.1)' },
  chatRow: { flexDirection: 'row', alignItems: 'center' },
  chatAvatar: { width: 56, height: 56, borderRadius: 22 },
  groupAvatar: { width: 56, height: 56, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  onlineBadge: { position: 'absolute', bottom: -2, right: -2, width: 16, height: 16, borderRadius: 8, backgroundColor: '#4CD964', borderWidth: 3, borderColor: '#1E1E1E' },
  chatContent: { flex: 1, marginLeft: 16, justifyContent: 'center' },
  chatHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  chatName: { color: Colors.text, fontSize: 16, fontWeight: '700' },
  chatTime: { color: Colors.textSecondary, fontSize: 12, fontWeight: '500' },
  msgRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  chatMessage: { flex: 1, fontSize: 14, marginRight: 10 },
  unreadBadge: { backgroundColor: Colors.primary, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, minWidth: 24, alignItems: 'center' },
  unreadText: { color: '#000', fontSize: 11, fontWeight: '800' },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { color: Colors.textSecondary, marginTop: 20, fontSize: 16, fontWeight: '500' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#1C1C1E', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, paddingBottom: 40, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', shadowColor: '#000', shadowOffset: {width: 0, height: -5}, shadowOpacity: 0.5, shadowRadius: 20, elevation: 20 },
  modalIndicator: { width: 40, height: 5, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 2.5, alignSelf: 'center', marginBottom: 20 },
  modalHeader: { marginBottom: 25, alignItems: 'center' },
  modalTitle: { color: Colors.text, fontSize: 18, fontWeight: '600' },
  modalGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 25 },
  gridAction: { width: (width - 60) / 4, alignItems: 'center', marginBottom: 15 },
  gridIconBox: { width: 50, height: 50, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.08)', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  gridLabel: { color: Colors.textSecondary, fontSize: 12, fontWeight: '500' },
  dangerBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FF3B30', paddingVertical: 16, borderRadius: 18 },
  dangerText: { color: '#FFF', fontWeight: '700', fontSize: 16, marginLeft: 8 },
});

export default ChatListScreen;