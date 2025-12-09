import React, { useState, useMemo, useEffect } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, 
  Modal, Image, Alert, StatusBar, ActivityIndicator, LayoutAnimation, 
  ScrollView
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@config/Colors';

// Components & Context
import FriendItem from './components/FriendItem'; 
import { useFriend } from '@context/hub/FriendContext';
import { useAlert } from '@context/other/AlertContext'; 
import { useProfile } from '@context/main/ProfileContext';

// MOCK DATA for "Suggestions" (Since API only returns friends)
const MOCK_SUGGESTIONS = [
    { id: 's1', name: 'Dr. Doom', handle: 'latveria_ruler', avatar: 'https://i.pravatar.cc/150?u=doom', bio: 'Looking for challengers.', status: { type: 'online' } },
    { id: 's2', name: 'Gwen Stacy', handle: 'ghost_spider', avatar: 'https://i.pravatar.cc/150?u=gwen', bio: 'Band practice later?', status: { type: 'offline' } },
    { id: 's3', name: 'Miles M.', handle: 'brooklyn_spidey', avatar: 'https://i.pravatar.cc/150?u=miles', bio: 'Doing my own thing.', status: { type: 'online' } },
];

const TABS = ['My Friends', 'Suggestions', 'Blocked'];

const FriendsScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { showAlert, showToast } = useAlert(); 
  
  // Contexts
  const { friends, onlineFriends, isLoading, loadFriends, createEntity } = useFriend();
  const { profile, blockUser, unblockUser } = useProfile();
  
  // UI State
  const [activeTab, setActiveTab] = useState('My Friends');
  const [search, setSearch] = useState('');
  const [selectedFriends, setSelectedFriends] = useState(new Set());
  
  // Pseudo-State for "Requests" (Mocking API behavior)
  const [pendingRequests, setPendingRequests] = useState(new Set()); 

  const [showMenu, setShowMenu] = useState(false); 
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [pendingCreationType, setPendingCreationType] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => { loadFriends(); }, [loadFriends]);

  // --- Logic Helpers ---

  // 1. Get Blocked Users from Profile Context
  const blockedUsers = useMemo(() => {
    return profile?.settings?.privacy?.blockedUsers || [];
  }, [profile]);

  // 2. Filter Data based on Tab & Search
  const filteredData = useMemo(() => {
    let sourceData = [];

    if (activeTab === 'My Friends') sourceData = friends;
    else if (activeTab === 'Suggestions') sourceData = MOCK_SUGGESTIONS;
    else if (activeTab === 'Blocked') sourceData = blockedUsers;

    return sourceData.filter(item => 
      item.name.toLowerCase().includes(search.toLowerCase()) || 
      (item.handle && item.handle.toLowerCase().includes(search.toLowerCase()))
    );
  }, [search, friends, activeTab, blockedUsers]);

  // 3. Status Determination for Item
  const getItemStatus = (item) => {
    if (activeTab === 'Blocked') return 'blocked';
    if (activeTab === 'My Friends') return 'friend';
    if (pendingRequests.has(item.id)) return 'pending';
    return 'none'; // For Suggestions
  };

  // --- Actions ---

  const handleAction = async (action, item) => {
    switch (action) {
        case 'chat':
            navigation.navigate('ChatDetail', { user: item });
            break;

        case 'add':
            // Simulate API Call
            setPendingRequests(prev => new Set(prev).add(item.id));
            showToast(`Friend request sent to ${item.name}`, 'success');
            break;

        case 'cancel':
            const newSet = new Set(pendingRequests);
            newSet.delete(item.id);
            setPendingRequests(newSet);
            showToast("Request cancelled", 'info');
            break;

        case 'unblock':
            try {
                await unblockUser(item.id);
                showToast(`${item.name} unblocked`, 'success');
            } catch(e) { showToast("Failed to unblock", 'error'); }
            break;
    }
  };

  const handleMoreOptions = (item) => {
    Alert.alert(
        item.name,
        "Manage friendship",
        [
            { text: "Cancel", style: "cancel" },
            { 
                text: "Block User", 
                style: 'destructive', 
                onPress: async () => {
                    await blockUser(item.name); // Using name or ID depending on API
                    showToast(`${item.name} blocked`, 'info');
                }
            },
            { 
                text: "Remove Friend", 
                style: 'destructive',
                onPress: () => {
                    // Call API to remove friend here
                    showToast(`${item.name} removed from friends`, 'info');
                }
            }
        ]
    );
  };

  // Selection Logic (Legacy from previous code)
  const handleItemPress = (item) => {
    if (isSelectionMode) {
        const newSelection = new Set(selectedFriends);
        if (newSelection.has(item.id)) newSelection.delete(item.id);
        else newSelection.add(item.id);
        setSelectedFriends(newSelection);
    } else {
        // Navigate to Profile
        navigation.navigate('FriendProfile', { user: item });
    }
  };

  const handleMenuOption = (type) => {
    setShowMenu(false);
    setActiveTab('My Friends'); // Force back to friends list
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelectedFriends(new Set());
    setIsSelectionMode(true);
    if (type === 'Select') setPendingCreationType(null); 
    else setPendingCreationType(type);
  };

  const cancelSelectionMode = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsSelectionMode(false);
    setSelectedFriends(new Set());
    setPendingCreationType(null);
  };

  // --- Renderers ---

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* Top Bar */}
      <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
              <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          
          <View>
            <Text style={styles.headerTitle}>
              {isSelectionMode ? (pendingCreationType ? `New ${pendingCreationType}` : 'Select') : 'Connections'}
            </Text>
            {isSelectionMode && <Text style={styles.headerSub}>{selectedFriends.size} selected</Text>}
          </View>

          {/* Menu Button (Only show in Default Mode) */}
          <TouchableOpacity 
             onPress={() => isSelectionMode ? cancelSelectionMode() : setShowMenu(true)} 
             style={[styles.iconBtn, isSelectionMode && styles.activeIconBtn]}
          >
             <Ionicons name={isSelectionMode ? "close" : "ellipsis-vertical"} size={22} color={isSelectionMode ? '#FF453A' : Colors.text} />
          </TouchableOpacity>
      </View>

      {/* Tabs & Search (Hidden during Selection) */}
      {!isSelectionMode && (
        <>
            <View style={styles.searchBar}>
                <Ionicons name="search" size={18} color={Colors.textSecondary} />
                <TextInput 
                    placeholder="Search..." 
                    placeholderTextColor={Colors.textSecondary}
                    style={styles.searchInput}
                    value={search}
                    onChangeText={setSearch}
                />
            </View>
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabContainer}>
                {TABS.map(tab => (
                    <TouchableOpacity 
                        key={tab} 
                        onPress={() => { setActiveTab(tab); setSearch(''); }}
                        style={[styles.tabChip, activeTab === tab && styles.tabChipActive]}
                    >
                        <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </>
      )}

      {/* Dropdown Modal */}
      <Modal visible={showMenu} transparent animationType="fade" onRequestClose={() => setShowMenu(false)}>
        <TouchableOpacity style={styles.menuOverlay} activeOpacity={1} onPress={() => setShowMenu(false)}>
           <View style={[styles.menuDropdown, { top: insets.top + 50 }]}>
             <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuOption('Group')}>
               <Ionicons name="chatbubbles" size={18} color="#FFF" style={{marginRight:10}} />
               <Text style={styles.menuText}>New Group</Text>
             </TouchableOpacity>
             <View style={styles.menuDivider} />
             <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuOption('Select')}>
               <Ionicons name="checkbox" size={18} color="#FFF" style={{marginRight:10}} />
               <Text style={styles.menuText}>Select Friends</Text>
             </TouchableOpacity>
           </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />
      <View style={styles.bgGlow} />

      <FlatList
          data={filteredData}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
          ListHeaderComponent={renderHeader}
          renderItem={({ item, index }) => (
            <FriendItem 
                item={item} 
                index={index}
                status={getItemStatus(item)}
                mode={isSelectionMode ? 'selection' : 'default'}
                isSelected={selectedFriends.has(item.id)}
                
                onPress={() => handleItemPress(item)}
                onAction={(type) => handleAction(type, item)}
                onMoreOptions={() => handleMoreOptions(item)}
            />
          )}
          ListEmptyComponent={
             <View style={{alignItems:'center', marginTop: 50}}>
                <Ionicons name="people-outline" size={40} color={Colors.textSecondary} />
                <Text style={styles.emptyText}>No users found in "{activeTab}"</Text>
             </View>
          }
      />
      
      {/* Reuse your FAB logic here for Group creation if needed */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  bgGlow: { position: 'absolute', top: -100, left: -50, width: 400, height: 400, backgroundColor: Colors.primary, opacity: 0.08, borderRadius: 200, blurRadius: 100 },
  
  headerContainer: { marginBottom: 10 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: Colors.text },
  headerSub: { fontSize: 12, color: Colors.primary, fontWeight: '600' },
  
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  activeIconBtn: { backgroundColor: 'rgba(255, 69, 58, 0.15)', borderColor: 'rgba(255, 69, 58, 0.3)' },

  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1C1C1E', height: 46, borderRadius: 16, paddingHorizontal: 15, marginBottom: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  searchInput: { flex: 1, marginLeft: 10, color: Colors.text },

  tabContainer: { gap: 10, paddingBottom: 5 },
  tabChip: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  tabChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  tabText: { color: Colors.textSecondary, fontWeight: '600', fontSize: 13 },
  tabTextActive: { color: '#FFF', fontWeight: '700' },

  menuOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.2)' },
  menuDropdown: { position: 'absolute', right: 20, width: 180, backgroundColor: '#222', borderRadius: 12, padding: 5, borderWidth: 1, borderColor: '#333' },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 12 },
  menuText: { color: '#FFF', fontWeight: '600' },
  menuDivider: { height: 1, backgroundColor: '#333', marginHorizontal: 10 },
  
  emptyText: { color: Colors.textSecondary, marginTop: 10 },
});

export default FriendsScreen;