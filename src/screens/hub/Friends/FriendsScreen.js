import React, { useState, useMemo } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, 
  Modal, Image, ScrollView, Alert, StatusBar 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@config/Colors';
import FriendItem from './components/FriendItem';

// Extended Data
const FRIENDS_DATA = [
  { id: '1', name: 'Jessica Parker', status: 'Online', bio: 'Digital Nomad 🌍 | React Native', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400' },
  { id: '2', name: 'David Miller', status: 'Offline', bio: 'Hardcore Gamer 🎮', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400' },
  { id: '3', name: 'Sarah Connor', status: 'Playing: Halo', bio: 'Saving the future, one commit at a time.', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400' },
  { id: '4', name: 'Mike Ross', status: 'Online', bio: 'Legal Tech Enthusiast', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400' },
  { id: '5', name: 'Jenny Wilson', status: 'In a meeting', bio: 'UI/UX Designer', avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400' },
];

const FriendsScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  
  // States
  const [search, setSearch] = useState('');
  const [selectedFriends, setSelectedFriends] = useState(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);

  // -- LOGIC --

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedFriends(new Set()); // Reset selection
  };

  const handleFriendPress = (item) => {
    if (isSelectionMode) {
      const newSelection = new Set(selectedFriends);
      if (newSelection.has(item.id)) {
        newSelection.delete(item.id);
      } else {
        newSelection.add(item.id);
      }
      setSelectedFriends(newSelection);
    } else {
      // Direct Navigation to Chat
      navigation.navigate('ChatDetail', { user: item });
    }
  };

  const handleLongPress = (item) => {
    if (!isSelectionMode) {
      setSelectedProfile(item);
      setProfileModalVisible(true);
    }
  };

  const createGroupChat = () => {
    if (selectedFriends.size < 2) {
      Alert.alert("Group Chat", "Please select at least 2 friends.");
      return;
    }
    
    // Logic to create group object
    const groupMembers = FRIENDS_DATA.filter(f => selectedFriends.has(f.id));
    const groupObject = {
      id: `group-${Date.now()}`,
      name: 'New Squad Group', // You'd typically ask for a name here
      type: 'group',
      avatar: null, // Default group avatar
      members: groupMembers
    };

    setIsSelectionMode(false);
    setSelectedFriends(new Set());
    navigation.navigate('ChatDetail', { user: groupObject });
  };

  const filteredData = useMemo(() => {
    return FRIENDS_DATA.filter(item => 
      item.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);


  // -- RENDERERS --

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        
        <View style={{ alignItems: 'center' }}>
            <Text style={styles.headerTitle}>{isSelectionMode ? 'Create Group' : 'The Squad'}</Text>
            {isSelectionMode && (
                <Text style={styles.headerSub}>{selectedFriends.size} selected</Text>
            )}
        </View>

        <TouchableOpacity onPress={toggleSelectionMode} style={styles.headerActionBtn}>
            <Ionicons 
                name={isSelectionMode ? "close" : "people-outline"} 
                size={24} 
                color={isSelectionMode ? Colors.danger : Colors.primary} 
            />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchWrapper}>
        <Ionicons name="search" size={20} color={Colors.textSecondary} style={{ marginRight: 10 }} />
        <TextInput 
            placeholder="Find your people..." 
            placeholderTextColor={Colors.textSecondary}
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
        />
      </View>

      {/* Friends List */}
      <FlatList
        data={filteredData}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
            <Text style={styles.subHeader}>
                {isSelectionMode ? 'Select Members' : `All Friends (${filteredData.length})`}
            </Text>
        }
        renderItem={({ item }) => (
          <FriendItem 
            item={item} 
            mode={isSelectionMode ? 'selection' : 'default'}
            isSelected={selectedFriends.has(item.id)}
            onPress={() => handleFriendPress(item)} 
            onLongPress={() => handleLongPress(item)}
          />
        )}
      />

      {/* Floating Action Button for Group Creation */}
      {isSelectionMode && selectedFriends.size > 0 && (
        <TouchableOpacity 
            style={styles.fab} 
            activeOpacity={0.9}
            onPress={createGroupChat}
        >
            <LinearGradient
                colors={[Colors.primary, '#2E86DE']}
                style={styles.fabGradient}
            >
                <Ionicons name="arrow-forward" size={28} color="#FFF" />
            </LinearGradient>
        </TouchableOpacity>
      )}

      {/* --- PROFILE MODAL --- */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={profileModalVisible}
        onRequestClose={() => setProfileModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
                {selectedProfile && (
                    <>
                        <View style={styles.modalHeader}>
                             <TouchableOpacity onPress={() => setProfileModalVisible(false)}>
                                <Ionicons name="close" size={24} color={Colors.textSecondary} />
                             </TouchableOpacity>
                        </View>
                        
                        <View style={styles.modalContent}>
                            <View style={styles.modalAvatarContainer}>
                                <Image source={{ uri: selectedProfile.avatar }} style={styles.modalAvatar} />
                                <View style={[styles.modalStatusBadge, { backgroundColor: selectedProfile.status === 'Online' ? Colors.secondary : '#555' }]} />
                            </View>
                            
                            <Text style={styles.modalName}>{selectedProfile.name}</Text>
                            <Text style={styles.modalBio}>{selectedProfile.bio}</Text>
                            
                            <View style={styles.modalStatsRow}>
                                <View style={styles.statItem}>
                                    <Text style={styles.statNum}>124</Text>
                                    <Text style={styles.statLabel}>Friends</Text>
                                </View>
                                <View style={styles.statSeparator} />
                                <View style={styles.statItem}>
                                    <Text style={styles.statNum}>12</Text>
                                    <Text style={styles.statLabel}>Groups</Text>
                                </View>
                            </View>

                            <TouchableOpacity 
                                style={styles.modalActionBtn}
                                onPress={() => {
                                    setProfileModalVisible(false);
                                    navigation.navigate('ChatDetail', { user: selectedProfile });
                                }}
                            >
                                <Text style={styles.modalBtnText}>Send Message</Text>
                                <Ionicons name="chatbubble-outline" size={20} color="#FFF" />
                            </TouchableOpacity>
                        </View>
                    </>
                )}
            </View>
        </View>
      </Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  
  // Header
  header: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', 
    paddingHorizontal: 20, marginBottom: 20, height: 50 
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-start' },
  headerActionBtn: { 
    width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.surface, 
    justifyContent: 'center', alignItems: 'center' 
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: Colors.text },
  headerSub: { fontSize: 12, color: Colors.secondary, marginTop: 2 },
  
  // Search
  searchWrapper: { 
    flexDirection: 'row', alignItems: 'center', 
    backgroundColor: Colors.surface, 
    marginHorizontal: 20, padding: 15, borderRadius: 20, 
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
    marginBottom: 10
  },
  searchInput: { color: Colors.text, flex: 1, fontSize: 15 },
  subHeader: { 
    color: Colors.textSecondary, fontSize: 12, 
    marginBottom: 15, textTransform: 'uppercase', letterSpacing: 1, fontWeight: '600' 
  },

  // FAB
  fab: {
    position: 'absolute', bottom: 40, right: 30,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4, shadowRadius: 10, elevation: 5
  },
  fabGradient: {
    width: 60, height: 60, borderRadius: 30,
    justifyContent: 'center', alignItems: 'center'
  },

  // --- MODAL STYLES ---
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end' // Bottom Sheet effect
  },
  modalContainer: {
    backgroundColor: '#1E1E1E',
    borderTopLeftRadius: 30, borderTopRightRadius: 30,
    padding: 25, minHeight: 450,
    borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.1)'
  },
  modalHeader: { alignItems: 'flex-end' },
  modalContent: { alignItems: 'center', marginTop: -20 },
  modalAvatarContainer: { marginBottom: 20 },
  modalAvatar: { width: 100, height: 100, borderRadius: 35, borderWidth: 4, borderColor: Colors.background },
  modalStatusBadge: { 
    position: 'absolute', bottom: 5, right: -5, 
    width: 24, height: 24, borderRadius: 12, borderWidth: 4, borderColor: '#1E1E1E' 
  },
  modalName: { fontSize: 24, fontWeight: 'bold', color: Colors.text, marginBottom: 5 },
  modalBio: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', marginBottom: 25 },
  
  modalStatsRow: { flexDirection: 'row', marginBottom: 30, backgroundColor: Colors.surface, padding: 15, borderRadius: 20 },
  statItem: { paddingHorizontal: 20, alignItems: 'center' },
  statNum: { color: Colors.text, fontSize: 18, fontWeight: 'bold' },
  statLabel: { color: Colors.textSecondary, fontSize: 12 },
  statSeparator: { width: 1, backgroundColor: 'rgba(255,255,255,0.1)' },

  modalActionBtn: {
    flexDirection: 'row', backgroundColor: Colors.primary,
    paddingVertical: 16, paddingHorizontal: 40, borderRadius: 20,
    alignItems: 'center', gap: 10, width: '100%', justifyContent: 'center'
  },
  modalBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' }
});

export default FriendsScreen;