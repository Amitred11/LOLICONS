import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity,
  Modal, StatusBar, ActivityIndicator, LayoutAnimation,
  ScrollView, Pressable
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '@config/Colors';

// Components & Context
import FriendItem from './components/FriendItem';
import { useFriend } from '@context/hub/FriendContext';
import { useAlert } from '@context/other/AlertContext'; 
import { useProfile } from '@context/main/ProfileContext';
import { useChat } from '@context/hub/ChatContext';

const TABS = ['My Friends', 'Suggestions', 'Blocked'];

const FriendsScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { showAlert, showToast, showAlertPrompt } = useAlert(); 

  // Contexts
  const { 
    friends = [],        // Default to empty array
    suggestions = [],    // Default to empty array
    isLoading, 
    loadFriends, 
    loadSuggestions, 
    addFriend, 
    removeFriend,
    searchDirectory,
    searchResults = [],  // Default to empty array to prevent filter error
    isSearching
  } = useFriend();
  
  const { profile, blockUser, unblockUser } = useProfile();
  const { createGroupChat } = useChat();

  // UI State
  const [activeTab, setActiveTab] = useState('My Friends');
  const [search, setSearch] = useState('');
  const [selectedFriends, setSelectedFriends] = useState(new Set());
  const [pendingRequests, setPendingRequests] = useState(new Set());
  const [showMenu, setShowMenu] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [actionSheetVisible, setActionSheetVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    // Ensure functions exist before calling
    if (loadFriends) loadFriends();
    if (loadSuggestions) loadSuggestions();
  }, [loadFriends, loadSuggestions]);

  // --- Global Search Effect ---
  useEffect(() => {
    const timer = setTimeout(() => {
        if (search.length > 0 && searchDirectory) {
            searchDirectory(search);
        }
    }, 500); 

    return () => clearTimeout(timer);
  }, [search, searchDirectory]);

  // --- Logic Helpers ---
  const blockedUsers = useMemo(() => profile?.settings?.privacy?.blockedUsers || [], [profile]);

  // Modified Data Source Logic with Safety Checks
  const dataToDisplay = useMemo(() => {
    // 1. If searching, return global search results (excluding self)
    if (search.length > 0) {
        const results = searchResults || []; 
        return results.filter(u => u.id !== profile?.id);
    }
    
    // 2. Otherwise, return the specific tab data
    if (activeTab === 'My Friends') return friends || [];
    if (activeTab === 'Suggestions') return suggestions || [];
    return blockedUsers || [];
  }, [search, searchResults, friends, suggestions, activeTab, blockedUsers, profile]);

  // Helper to determine the relationship status
  const getItemStatus = (item) => {
    if (!item) return 'none';
    if (blockedUsers.some(bu => bu.id === item.id)) return 'blocked';
    
    // Check against the loaded friends list
    const currentFriends = friends || [];
    if (currentFriends.some(friend => friend.id === item.id)) return 'friend';
    
    if (pendingRequests.has(item.id)) return 'pending';
    
    return 'none';
  };

  // --- Actions ---
  const handleAction = useCallback(async (action, item) => {
    switch (action) {
        case 'chat':
            navigation.navigate('ChatDetail', { user: item });
            break;
        case 'add':
            setPendingRequests(prev => new Set(prev).add(item.id));
            try {
                await addFriend(item.id);
                showToast(`Friend request sent to ${item.name}`, 'success');
            } catch {
                showToast(`Failed to add ${item.name}`, 'error');
                setPendingRequests(prev => { const n = new Set(prev); n.delete(item.id); return n; });
            }
            break;
        case 'cancel':
            setPendingRequests(prev => { const n = new Set(prev); n.delete(item.id); return n; });
            showToast("Request cancelled", 'info');
            break;
        case 'unblock':
            try {
                await unblockUser(item.id);
                showToast(`${item.name} unblocked`, 'success');
            } catch(e) { showToast("Failed to unblock", 'error'); }
            break;
    }
  }, [addFriend, unblockUser, navigation, showToast]);

  const handleMoreOptions = (item) => {
    setSelectedUser(item);
    setActionSheetVisible(true);
  };

  const confirmRemoveFriend = useCallback(() => {
    if (!selectedUser) return;
    setActionSheetVisible(false);
    showAlert({
        title: `Remove ${selectedUser.name}?`,
        message: 'They will be removed from your friends list.',
        type: 'error', btnText: 'Remove',
        onClose: async () => {
            try {
                await removeFriend(selectedUser.id);
                showToast(`${selectedUser.name} removed`, 'info');
                setSelectedUser(null);
            } catch { showToast('Failed to remove friend', 'error'); }
        },
        secondaryBtnText: 'Cancel',
    });
  }, [selectedUser, removeFriend, showAlert, showToast]);

  const confirmBlockUser = useCallback(() => {
    if (!selectedUser) return;
    setActionSheetVisible(false);
    showAlert({
        title: `Block ${selectedUser.name}?`, message: 'They won\'t be able to send you messages or requests.',
        type: 'error', btnText: 'Block User',
        onClose: async () => {
            await blockUser(selectedUser.name);
            showToast(`${selectedUser.name} blocked`, 'info');
            setSelectedUser(null);
        },
        secondaryBtnText: 'Cancel'
    });
  }, [selectedUser, blockUser, showAlert, showToast]);

  const handleItemPress = (item) => {
    if (isSelectionMode && activeTab === 'My Friends') {
        const newSelection = new Set(selectedFriends);
        if (newSelection.has(item.id)) newSelection.delete(item.id);
        else newSelection.add(item.id);
        setSelectedFriends(newSelection);
    } else {
        navigation.navigate('FriendProfile', { user: item });
    }
  };

  const handleMenuOption = (type) => {
    setShowMenu(false);
    if (type === 'Group') {
        setActiveTab('My Friends');
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setSelectedFriends(new Set());
        setIsSelectionMode(true);
    } else if (type === 'Invite') {
        showAlert({ title: "Invite Friends", message: "This feature can be linked to a share sheet.", type: 'info' });
    }
  };

  const cancelSelectionMode = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsSelectionMode(false);
    setSelectedFriends(new Set());
  };

  const handleCreateGroup = useCallback(() => {
    showAlertPrompt({
      title: 'New Group',
      message: 'Enter a name for your group chat.',
      placeholder: 'Group name',
      onConfirm: async (groupName) => {
        if (!groupName || groupName.trim().length < 3) {
          showToast('Group name must be at least 3 characters', 'error');
          return;
        }
        setIsCreating(true);
        try {
          const memberIds = [profile.id, ...Array.from(selectedFriends)];
          const response = await createGroupChat(groupName, memberIds);
          if (response.success && response.data) {
            showToast(`Group "${groupName}" created!`, 'success');
            navigation.navigate('ChatDetail', { user: response.data });
            cancelSelectionMode();
          } else {
            throw new Error(response.message || 'Failed to create group');
          }
        } catch (e) {
          showToast(e.message, 'error');
        } finally {
          setIsCreating(false);
        }
      },
      onCancel: () => {
        showToast('Group creation cancelled', 'info');
      },
    });
  }, [selectedFriends, profile, createGroupChat, navigation, showToast, showAlertPrompt, cancelSelectionMode]);

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
              <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>{isSelectionMode ? 'New Group' : 'Connections'}</Text>
            {isSelectionMode && <Text style={styles.headerSub}>{selectedFriends.size} selected</Text>}
          </View>
          <TouchableOpacity onPress={isSelectionMode ? cancelSelectionMode : () => setShowMenu(true)} style={[styles.iconBtn, isSelectionMode && styles.activeIconBtn]}>
             <Ionicons name={isSelectionMode ? "close" : "ellipsis-vertical"} size={22} color={isSelectionMode ? '#FF453A' : Colors.text} />
          </TouchableOpacity>
      </View>
      {!isSelectionMode && (
        <>
            <View style={styles.searchBar}>
                <Ionicons name="search" size={18} color={Colors.textSecondary} />
                <TextInput 
                    placeholder="Search all users..." 
                    placeholderTextColor={Colors.textSecondary} 
                    style={styles.searchInput} 
                    value={search} 
                    onChangeText={setSearch}
                    returnKeyType="search"
                />
                {search.length > 0 && isSearching && <ActivityIndicator size="small" color={Colors.primary} />}
                {search.length > 0 && !isSearching && (
                    <TouchableOpacity onPress={() => setSearch('')}>
                        <Ionicons name="close-circle" size={16} color={Colors.textSecondary} />
                    </TouchableOpacity>
                )}
            </View>
            
            {search.length === 0 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabContainer}>
                    {TABS.map(tab => (
                        <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)} style={[styles.tabChip, activeTab === tab && styles.tabChipActive]}>
                            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            )}
            
            {search.length > 0 && (
                <Text style={styles.searchResultHeader}>
                    Global Search Results
                </Text>
            )}
        </>
      )}
      <Modal visible={showMenu} transparent animationType="fade" onRequestClose={() => setShowMenu(false)}>
        <TouchableOpacity style={styles.menuOverlay} activeOpacity={1} onPress={() => setShowMenu(false)}>
           <View style={[styles.menuDropdown, { top: insets.top + 50 }]}>
             <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuOption('Group')}>
               <Ionicons name="chatbubbles" size={18} color="#FFF" style={{marginRight:10}} />
               <Text style={styles.menuText}>New Group</Text>
             </TouchableOpacity>
             <View style={styles.menuDivider} />
             <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuOption('Invite')}>
               <Ionicons name="person-add" size={18} color="#FFF" style={{marginRight:10}} />
               <Text style={styles.menuText}>Invite Friends</Text>
             </TouchableOpacity>
           </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );

  const renderActionSheet = () => (
    <Modal transparent visible={actionSheetVisible} animationType="fade" onRequestClose={() => setActionSheetVisible(false)}>
      <Pressable style={styles.actionSheetOverlay} onPress={() => setActionSheetVisible(false)}>
        <View style={styles.actionSheetContainer}>
            <Text style={styles.actionSheetTitle}>{selectedUser?.name}</Text>
            <TouchableOpacity style={styles.actionSheetButton} onPress={confirmBlockUser}>
                <Ionicons name="shield-outline" size={20} color={'#FF453A'} />
                <Text style={[styles.actionSheetText, {color: '#FF453A'}]}>Block User</Text>
            </TouchableOpacity>
             <TouchableOpacity style={styles.actionSheetButton} onPress={confirmRemoveFriend}>
                <Ionicons name="person-remove-outline" size={20} color={'#FF453A'} />
                <Text style={[styles.actionSheetText, {color: '#FF453A'}]}>Remove Friend</Text>
            </TouchableOpacity>
        </View>
        <TouchableOpacity style={[styles.actionSheetContainer, {marginTop: 10}]} onPress={() => setActionSheetVisible(false)}>
             <View style={styles.actionSheetButton}><Text style={styles.actionSheetText}>Cancel</Text></View>
        </TouchableOpacity>
      </Pressable>
    </Modal>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />
      <View style={styles.bgGlow} />
      <FlatList
          data={dataToDisplay}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
          ListHeaderComponent={renderHeader}
          renderItem={({ item, index }) => (
            <FriendItem
                item={item} index={index}
                status={getItemStatus(item)}
                mode={isSelectionMode && activeTab === 'My Friends' && search.length === 0 ? 'selection' : 'default'}
                isSelected={selectedFriends.has(item.id)}
                onPress={() => handleItemPress(item)}
                onAction={(type) => handleAction(type, item)}
                onMoreOptions={() => handleMoreOptions(item)}
            />
          )}
          ListEmptyComponent={
             <View style={styles.emptyContainer}>
                {(isLoading || isSearching) ? <ActivityIndicator color={Colors.primary} size="large" />
                 : <>
                      <Ionicons name={search.length > 0 ? "search-outline" : "people-outline"} size={40} color={Colors.textSecondary} />
                      <Text style={styles.emptyText}>
                          {search.length > 0 ? `No users found for "${search}"` : `No users found in "${activeTab}"`}
                      </Text>
                   </>
                }
             </View>
          }
      />
      {isSelectionMode && selectedFriends.size > 0 && search.length === 0 && (
        <TouchableOpacity style={styles.fab} onPress={handleCreateGroup} disabled={isCreating}>
            {isCreating ? <ActivityIndicator color="#FFF" /> : <Ionicons name="arrow-forward" size={24} color="#FFF" />}
        </TouchableOpacity>
      )}
      {renderActionSheet()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  bgGlow: { position: 'absolute', top: -100, left: -50, width: 400, height: 400, backgroundColor: Colors.primary, opacity: 0.08, borderRadius: 200 },
  headerContainer: { marginBottom: 10 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: Colors.text },
  headerSub: { fontSize: 12, color: Colors.primary, fontWeight: '600' },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  activeIconBtn: { backgroundColor: 'rgba(255, 69, 58, 0.15)', borderColor: 'rgba(255, 69, 58, 0.3)' },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1C1C1E', height: 46, borderRadius: 16, paddingHorizontal: 15, marginBottom: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  searchInput: { flex: 1, marginLeft: 10, color: Colors.text },
  searchResultHeader: { color: Colors.primary, fontSize: 13, fontWeight: '700', marginBottom: 10, paddingLeft: 5 },
  tabContainer: { gap: 10, paddingBottom: 5 },
  tabChip: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  tabChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  tabText: { color: Colors.textSecondary, fontWeight: '600', fontSize: 13 },
  tabTextActive: { color: '#FFF', fontWeight: '700' },
  menuOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.2)' },
  menuDropdown: { position: 'absolute', right: 20, width: 180, backgroundColor: '#2C2C2E', borderRadius: 12, padding: 5, borderWidth: 1, borderColor: '#333' },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 12 },
  menuText: { color: '#FFF', fontWeight: '600' },
  menuDivider: { height: 1, backgroundColor: '#333', marginHorizontal: 10 },
  emptyContainer: { alignItems:'center', marginTop: 50 },
  emptyText: { color: Colors.textSecondary, marginTop: 10 },
  fab: { position: 'absolute', bottom: 30, right: 30, width: 60, height: 60, borderRadius: 30, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 8 },
  actionSheetOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end', padding: 20 },
  actionSheetContainer: { backgroundColor: '#2C2C2E', borderRadius: 14, overflow: 'hidden' },
  actionSheetTitle: { color: Colors.textSecondary, fontSize: 13, textAlign: 'center', paddingVertical: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(255,255,255,0.1)' },
  actionSheetButton: { paddingVertical: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 10 },
  actionSheetText: { color: Colors.primary, fontSize: 17, fontWeight: '600' },
});

export default FriendsScreen;