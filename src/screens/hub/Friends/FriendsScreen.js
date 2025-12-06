import React, { useState, useMemo, useEffect } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, 
  Modal, Image, Alert, StatusBar, ActivityIndicator, LayoutAnimation, 
  Platform, UIManager, ScrollView
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@config/Colors';

// Components & Context
import FriendItem from './components/FriendItem'; 
import { useFriend } from '@context/hub/FriendContext'; // IMPT: Import Context
import { useAlert } from '@context/other/AlertContext'; // Assuming you have this from previous steps

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const FILTERS = ['All', 'Online', 'Offline'];

const FriendsScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { showAlert } = useAlert(); // Optional: if you want custom alerts instead of RN Alert
  
  // Consuming Context
  const { friends, onlineFriends, isLoading, loadFriends, createEntity } = useFriend();
  
  // UI State (Local)
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedFriends, setSelectedFriends] = useState(new Set());
  
  // Menu & Selection State
  const [showMenu, setShowMenu] = useState(false); 
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [pendingCreationType, setPendingCreationType] = useState(null); // 'Group' | 'Guild' | null
  
  // Creation Processing State
  const [isCreating, setIsCreating] = useState(false);

  // Load data on mount
  useEffect(() => { loadFriends(); }, [loadFriends]);

  // --- Actions ---

  // 1. Handle Menu Options
  const handleMenuOption = (type) => {
    setShowMenu(false);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    
    // Clear previous selection
    setSelectedFriends(new Set());
    setIsSelectionMode(true);

    if (type === 'Select') {
      setPendingCreationType(null); 
    } else {
      setPendingCreationType(type); // 'Group' or 'Guild'
    }
  };

  const cancelSelectionMode = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsSelectionMode(false);
    setSelectedFriends(new Set());
    setPendingCreationType(null);
  };

  // 2. Handle Item Press
  const handleFriendPress = (item) => {
    if (isSelectionMode) {
      const newSelection = new Set(selectedFriends);
      if (newSelection.has(item.id)) newSelection.delete(item.id);
      else newSelection.add(item.id);
      setSelectedFriends(newSelection);
    } else {
      navigation.navigate('FriendProfile', { user: item });
    }
  };

  // 3. Finalize Creation (FAB Press)
  const handleFabPress = () => {
    if (selectedFriends.size < 2) return Alert.alert("Select Friends", "Select at least 2 friends to proceed.");

    if (pendingCreationType) {
      promptForName(pendingCreationType);
    } else {
      Alert.alert(
        "Action",
        "What would you like to do with selected friends?",
        [
          { text: "Create Group", onPress: () => promptForName('Group') },
          { text: "Cancel", style: "cancel" }
        ]
      );
    }
  };

  const promptForName = (type) => {
    Alert.prompt(
      `Name your ${type}`,
      `Enter a name for the new ${type}:`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Create",
          onPress: (name) => executeCreation(type, name)
        }
      ],
      "plain-text"
    );
  };

  const executeCreation = async (type, name) => {
    setIsCreating(true);
    const memberIds = Array.from(selectedFriends);
    
    try {
        // Call Context Method
        const res = await createEntity(type, name || `New ${type}`, memberIds);
        
        setIsCreating(false);
        cancelSelectionMode();
        
        if(res.success) {
            // Navigate to ChatDetail with the new Chat Object
            navigation.navigate('ChatDetail', { user: res.data });
        }
    } catch (e) {
        setIsCreating(false);
        Alert.alert("Error", "Failed to create group.");
    }
  };

  // Filter Logic
  const filteredData = useMemo(() => {
    return friends.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = activeFilter === 'All' 
        ? true 
        : activeFilter === 'Online' ? item.status === 'Online' : item.status !== 'Online';
      return matchesSearch && matchesFilter;
    });
  }, [search, friends, activeFilter]);

  // Favorites (Top 5 Online from Context)
  const favoritesData = onlineFriends.slice(0, 5);

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* Top Bar */}
      <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
              <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          
          <View>
            <Text style={styles.headerTitle}>
              {isSelectionMode 
                ? pendingCreationType 
                  ? `New ${pendingCreationType}` 
                  : 'Select Friends' 
                : 'Connections'}
            </Text>
            {isSelectionMode && (
              <Text style={styles.headerSub}>{selectedFriends.size} selected</Text>
            )}
          </View>

          {/* Menu Button */}
          <View>
            <TouchableOpacity 
                onPress={() => isSelectionMode ? cancelSelectionMode() : setShowMenu(true)} 
                style={[styles.iconBtn, isSelectionMode && styles.activeIconBtn]}
            >
                <Ionicons 
                    name={isSelectionMode ? "close" : "ellipsis-vertical"} 
                    size={22} 
                    color={isSelectionMode ? '#FF453A' : Colors.text} 
                />
            </TouchableOpacity>

            {/* Dropdown Menu */}
            <Modal visible={showMenu} transparent animationType="fade" onRequestClose={() => setShowMenu(false)}>
              <TouchableOpacity style={styles.menuOverlay} activeOpacity={1} onPress={() => setShowMenu(false)}>
                <View style={[styles.menuDropdown, { top: insets.top + 50 }]}>
                  <Text style={styles.menuHeader}>Create & Manage</Text>
                  
                  <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuOption('Group')}>
                    <LinearGradient colors={['#4CD964', '#206030']} style={styles.menuIconBox}>
                       <Ionicons name="chatbubbles" size={18} color="#FFF" />
                    </LinearGradient>
                    <Text style={styles.menuText}>New Group Chat</Text>
                  </TouchableOpacity>

                  <View style={styles.menuDivider} />

                  <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuOption('Select')}>
                    <View style={[styles.menuIconBox, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
                       <Ionicons name="checkmark-circle" size={18} color="#FFF" />
                    </View>
                    <Text style={styles.menuText}>Select / Manage</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            </Modal>
          </View>
      </View>

      {/* Favorites & Search (Hidden in selection mode) */}
      {!isSelectionMode && (
        <>
            <View style={styles.favoritesSection}>
                <Text style={styles.sectionLabel}>FAVORITES</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: 0 }}>
                    <TouchableOpacity style={styles.favItem}>
                        <View style={styles.addStoryCircle}>
                            <Ionicons name="add" size={24} color={Colors.text} />
                        </View>
                        <Text style={styles.favName}>Add</Text>
                    </TouchableOpacity>

                    {favoritesData.map((fav) => (
                        <TouchableOpacity key={fav.id} style={styles.favItem} onPress={() => navigation.navigate('FriendProfile', { user: fav })}>
                            <LinearGradient colors={[Colors.primary, '#2E86DE']} style={styles.favRing}>
                                <Image source={{ uri: fav.avatar }} style={styles.favAvatar} />
                            </LinearGradient>
                            <Text style={styles.favName} numberOfLines={1}>{fav.name.split(' ')[0]}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <View style={styles.searchSection}>
                <View style={styles.searchBar}>
                    <Ionicons name="search" size={18} color={Colors.textSecondary} />
                    <TextInput 
                        placeholder="Search friends..." 
                        placeholderTextColor={Colors.textSecondary}
                        style={styles.searchInput}
                        value={search}
                        onChangeText={setSearch}
                    />
                </View>
                
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, marginTop: 15 }}>
                    {FILTERS.map(f => (
                        <TouchableOpacity 
                            key={f} 
                            onPress={() => setActiveFilter(f)}
                            style={[styles.filterChip, activeFilter === f && styles.filterChipActive]}
                        >
                            <Text style={[styles.filterText, activeFilter === f && { color: '#000', fontWeight: 'bold' }]}>{f}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
        </>
      )}
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />
      <View style={styles.bgGlow} />

      {isLoading ? (
          <View style={{flex:1, justifyContent:'center'}}><ActivityIndicator color={Colors.primary} /></View>
      ) : (
        <FlatList
            data={filteredData}
            keyExtractor={item => item.id}
            contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
            ListHeaderComponent={renderHeader}
            renderItem={({ item, index }) => (
            <FriendItem 
                item={item} 
                index={index}
                mode={isSelectionMode ? 'selection' : 'default'}
                isSelected={selectedFriends.has(item.id)}
                onPress={() => handleFriendPress(item)} 
                onQuickAction={() => navigation.navigate('ChatDetail', { user: item })}
            />
            )}
        />
      )}

      {/* Creation FAB */}
      {isSelectionMode && (
        <TouchableOpacity 
            style={[styles.fab, selectedFriends.size < 2 && { opacity: 0.5 }]} 
            onPress={handleFabPress}
            disabled={selectedFriends.size < 2 || isCreating}
        >
            <LinearGradient colors={[Colors.primary, '#2E86DE']} style={styles.fabGradient}>
                {isCreating ? <ActivityIndicator color="#FFF" /> : <Ionicons name="arrow-forward" size={28} color="#FFF" />}
            </LinearGradient>
        </TouchableOpacity>
      )}

    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  bgGlow: { position: 'absolute', top: -100, left: -50, width: 400, height: 400, backgroundColor: Colors.primary, opacity: 0.08, borderRadius: 200, blurRadius: 100 },
  
  headerContainer: { marginBottom: 10 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: Colors.text },
  headerSub: { fontSize: 12, color: Colors.primary, fontWeight: '600' },
  
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  activeIconBtn: { backgroundColor: 'rgba(255, 69, 58, 0.15)', borderColor: 'rgba(255, 69, 58, 0.3)' },

  menuOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.2)' },
  menuDropdown: {
    position: 'absolute', right: 20,
    width: 220,
    backgroundColor: 'rgba(30, 30, 30, 0.95)',
    borderRadius: 16,
    padding: 8,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.5, shadowRadius: 20, elevation: 10,
  },
  menuHeader: { color: Colors.textSecondary, fontSize: 11, fontWeight: '700', marginLeft: 10, marginBottom: 8, marginTop: 4, textTransform: 'uppercase' },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: 12 },
  menuIconBox: { width: 28, height: 28, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  menuText: { color: Colors.text, fontSize: 14, fontWeight: '600' },
  menuDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginVertical: 6, marginHorizontal: 10 },

  favoritesSection: { marginBottom: 25 },
  sectionLabel: { color: Colors.textSecondary, fontSize: 11, fontWeight: '700', marginLeft: 5, marginBottom: 12, letterSpacing: 1 },
  favItem: { alignItems: 'center', marginRight: 15 },
  favRing: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  favAvatar: { width: 58, height: 58, borderRadius: 29, borderWidth: 3, borderColor: Colors.background },
  favName: { color: Colors.text, fontSize: 11, fontWeight: '500' },
  addStoryCircle: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderStyle: 'dashed', marginBottom: 6 },

  searchSection: { marginTop: 5 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1C1C1E', height: 46, borderRadius: 16, paddingHorizontal: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  searchInput: { flex: 1, marginLeft: 10, color: Colors.text },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.05)', marginRight: 0, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  filterChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterText: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600' },

  fab: { position: 'absolute', bottom: 40, right: 30, shadowColor: Colors.primary, shadowOffset: {width:0, height:8}, shadowOpacity:0.4, shadowRadius:12, elevation: 8 },
  fabGradient: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center' },
});

export default FriendsScreen;