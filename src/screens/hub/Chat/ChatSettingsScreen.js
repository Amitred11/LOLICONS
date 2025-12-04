import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, 
  Switch, Alert, StatusBar, Modal, TextInput, Platform
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient'; 
import { Colors } from '@config/Colors'; 

const ChatSettingsScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = route.params;

  // --- State ---
  const [isMuted, setIsMuted] = useState(false);
  const [saveMedia, setSaveMedia] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [showEncryptionModal, setShowEncryptionModal] = useState(false);

  // --- Mock Data ---
  const sharedMedia = [
    'https://images.unsplash.com/photo-1593642532973-d31b6557fa68?w=300',
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=300',
    'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=300',
    'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=300',
    'https://images.unsplash.com/photo-1519669556867-639a61115b69?w=300',
  ];

  // --- Actions ---

  const handleSearchToggle = () => {
    setIsSearching(!isSearching);
    if (isSearching) setSearchText(''); // Clear on close
  };

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
    Alert.alert(
      !isMuted ? "Notifications Muted" : "Notifications Unmuted", 
      !isMuted ? `You won't receive push notifications from ${user.name}.` : "You will now receive notifications."
    );
  };

  const handleBlock = () => {
    Alert.alert(
      "Block User", 
      `Are you sure you want to block ${user.name}? They won't be able to message you.`, 
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Block", 
          style: "destructive", 
          onPress: () => {
            // Mock backend call
            navigation.navigate('ChatList'); 
            Alert.alert("Blocked", `${user.name} has been blocked.`);
          } 
        }
      ]
    );
  };

  const handleReport = () => {
    Alert.alert(
      "Report User", 
      "Please select a reason:",
      [
        { text: "Spam", onPress: () => Alert.alert("Thank you", "Report submitted.") },
        { text: "Harassment", onPress: () => Alert.alert("Thank you", "Report submitted.") },
        { text: "Cancel", style: "cancel" }
      ]
    );
  };

  const handleViewMedia = (uri) => {
    // In a real app, navigate to a full screen ImageViewer
    Alert.alert("View Image", "Opening full screen media viewer...");
  };

  // --- Render Components ---

  const SettingRow = ({ icon, title, value, onToggle, isDestructive, onPress, hasArrow }) => (
    <TouchableOpacity 
      activeOpacity={onPress || onToggle ? 0.7 : 1}
      onPress={onToggle ? () => onToggle(!value) : onPress}
      style={styles.settingRow}
    >
      <View style={styles.settingLeft}>
        <View style={[styles.iconBox, isDestructive && styles.destructiveIconBox]}>
            <Ionicons name={icon} size={20} color={isDestructive ? '#FF453A' : Colors.text} />
        </View>
        <Text style={[styles.settingText, isDestructive && styles.destructiveText]}>{title}</Text>
      </View>
      
      {onToggle !== undefined ? (
        <Switch 
          value={value} 
          onValueChange={onToggle}
          trackColor={{ false: '#333', true: Colors.primary }}
          thumbColor={'#FFF'}
        />
      ) : (
        hasArrow && <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Encryption Modal */}
      <Modal visible={showEncryptionModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Ionicons name="lock-closed" size={48} color={Colors.primary} />
            <Text style={styles.modalTitle}>End-to-End Encrypted</Text>
            <Text style={styles.modalText}>
              Messages and calls are secured with end-to-end encryption. No one outside of this chat, not even us, can read or listen to them.
            </Text>
            <TouchableOpacity onPress={() => setShowEncryptionModal(false)} style={styles.modalBtn}>
              <Text style={styles.modalBtnText}>Got it</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Header */}
      <View style={[styles.header, { marginTop: insets.top + 15 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.navBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Details</Text>
        <TouchableOpacity style={styles.navBtn} onPress={() => Alert.alert("Edit", "Edit Contact")}>
           <Text style={styles.editText}>Edit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Profile Hero */}
        <View style={styles.profileContainer}>
          <View style={styles.avatarWrapper}>
             <LinearGradient 
                colors={[Colors.primary, Colors.secondary]} 
                style={styles.avatarGlow} 
             />
             <Image source={{ uri: user.avatar }} style={styles.avatar} />
          </View>
          
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userHandle}>@{user.name.replace(/\s+/g, '').toLowerCase()}</Text>
          <Text style={styles.userStatus}>Online • Mobile</Text>

          {/* Action Grid */}
          <View style={styles.actionGrid}>
             <TouchableOpacity style={styles.actionBtn} onPress={handleSearchToggle}>
                <View style={styles.actionIcon}>
                   <Ionicons name="search" size={22} color={Colors.text} />
                </View>
                <Text style={styles.actionLabel}>Search</Text>
             </TouchableOpacity>

             <TouchableOpacity style={styles.actionBtn} onPress={handleMuteToggle}>
                <View style={[styles.actionIcon, isMuted && { backgroundColor: Colors.text }]}>
                   <Ionicons name={isMuted ? "notifications-off" : "notifications"} size={22} color={isMuted ? Colors.background : Colors.text} />
                </View>
                <Text style={styles.actionLabel}>{isMuted ? 'Unmute' : 'Mute'}</Text>
             </TouchableOpacity>

             <TouchableOpacity style={styles.actionBtn} onPress={() => Alert.alert("More", "Options: Share Contact, Export Chat")}>
                <View style={styles.actionIcon}>
                   <Ionicons name="ellipsis-horizontal" size={22} color={Colors.text} />
                </View>
                <Text style={styles.actionLabel}>More</Text>
             </TouchableOpacity>
          </View>

          {/* Search Bar (Collapsible) */}
          {isSearching && (
             <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color={Colors.textSecondary} />
                <TextInput 
                   style={styles.searchInput}
                   placeholder="Search in conversation..."
                   placeholderTextColor={Colors.textSecondary}
                   autoFocus
                   value={searchText}
                   onChangeText={setSearchText}
                />
                <TouchableOpacity onPress={() => setSearchText('')}>
                  <Ionicons name="close-circle" size={18} color={Colors.textSecondary} />
                </TouchableOpacity>
             </View>
          )}
        </View>

        {/* Sections */}
        <View style={styles.sectionContainer}>
            
            {/* Media Gallery */}
            <View style={styles.mediaHeader}>
                <Text style={styles.sectionTitle}>Shared Media</Text>
                <TouchableOpacity onPress={() => Alert.alert("Gallery", "Opening all media")}>
                    <Text style={styles.seeAll}>See All</Text>
                </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.mediaScroll}>
                {sharedMedia.map((uri, index) => (
                    <TouchableOpacity key={index} onPress={() => handleViewMedia(uri)}>
                        <Image source={{ uri }} style={styles.mediaImg} />
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Privacy & Settings */}
            <View style={styles.card}>
               <SettingRow 
                  icon="lock-closed" 
                  title="Encryption" 
                  onPress={() => setShowEncryptionModal(true)} 
                  hasArrow 
               />
               <View style={styles.divider} />
               <SettingRow 
                  icon="image" 
                  title="Save to Camera Roll" 
                  value={saveMedia} 
                  onToggle={setSaveMedia} 
               />
               <View style={styles.divider} />
               <SettingRow 
                  icon="time" 
                  title="Disappearing Messages" 
                  onPress={() => Alert.alert("Timer", "Set messages to disappear after 24 hours.")}
                  hasArrow 
               />
            </View>

            {/* Danger Zone */}
            <View style={[styles.card, { marginTop: 20 }]}>
               <SettingRow 
                  icon="warning" 
                  title="Report User" 
                  onPress={handleReport}
                  isDestructive 
                  hasArrow
               />
               <View style={styles.divider} />
               <SettingRow 
                  icon="ban" 
                  title="Block User" 
                  onPress={handleBlock}
                  isDestructive 
               />
            </View>
        </View>
        
        <Text style={styles.footerText}>Chat ID: {user.id || '882-991-002'}</Text>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  
  // Header
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingBottom: 10 
  },
  headerTitle: { color: Colors.text, fontSize: 17, fontWeight: '600' },
  navBtn: { padding: 8 },
  editText: { color: Colors.primary, fontSize: 16, fontWeight: '600' },

  scrollContent: { paddingBottom: 50 },

  // Profile Section
  profileContainer: { alignItems: 'center', marginTop: 10, marginBottom: 30 },
  avatarWrapper: { marginBottom: 15, justifyContent: 'center', alignItems: 'center' },
  avatarGlow: { 
    position: 'absolute', width: 110, height: 110, borderRadius: 55, opacity: 0.6, blurRadius: 20 
  },
  avatar: { 
    width: 100, height: 100, borderRadius: 50, borderWidth: 4, borderColor: Colors.background 
  },
  userName: { color: Colors.text, fontSize: 24, fontWeight: '700', letterSpacing: 0.5 },
  userHandle: { color: Colors.textSecondary, fontSize: 14, marginTop: 4, fontWeight: '500' },
  userStatus: { color: Colors.secondary, fontSize: 12, marginTop: 6, fontWeight: '600' },

  // Action Grid
  actionGrid: { flexDirection: 'row', marginTop: 25, gap: 25 },
  actionBtn: { alignItems: 'center', width: 60 },
  actionIcon: { 
    width: 50, height: 50, borderRadius: 25, 
    backgroundColor: 'rgba(255,255,255,0.08)', 
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)'
  },
  actionLabel: { color: Colors.textSecondary, fontSize: 11, fontWeight: '500' },

  // Search Bar
  searchContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface,
    width: '90%', height: 44, borderRadius: 12,
    marginTop: 20, paddingHorizontal: 12
  },
  searchInput: { flex: 1, color: Colors.text, marginLeft: 10, fontSize: 14 },

  // Sections
  sectionContainer: { paddingHorizontal: 20 },
  
  // Media
  mediaHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { color: Colors.textSecondary, fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  seeAll: { color: Colors.primary, fontSize: 13, fontWeight: '600' },
  mediaScroll: { gap: 10, paddingBottom: 30 },
  mediaImg: { width: 90, height: 90, borderRadius: 16, backgroundColor: Colors.surface },

  // Settings Card
  card: { 
    backgroundColor: 'rgba(255,255,255,0.05)', 
    borderRadius: 20, 
    paddingVertical: 8,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)'
  },
  settingRow: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    paddingVertical: 14, paddingHorizontal: 16 
  },
  settingLeft: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { 
    width: 32, height: 32, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.1)', 
    justifyContent: 'center', alignItems: 'center', marginRight: 12 
  },
  destructiveIconBox: { backgroundColor: 'rgba(255, 69, 58, 0.15)' },
  settingText: { color: Colors.text, fontSize: 16, fontWeight: '500' },
  destructiveText: { color: '#FF453A' },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.05)', marginLeft: 60 },

  footerText: { textAlign: 'center', color: Colors.textSecondary, fontSize: 11, marginTop: 40, opacity: 0.5 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '80%', backgroundColor: '#1E1E1E', borderRadius: 24, padding: 30, alignItems: 'center' },
  modalTitle: { color: Colors.text, fontSize: 20, fontWeight: '700', marginTop: 15, marginBottom: 10 },
  modalText: { color: Colors.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: 25 },
  modalBtn: { backgroundColor: Colors.primary, paddingVertical: 12, paddingHorizontal: 40, borderRadius: 20 },
  modalBtnText: { color: '#000', fontWeight: 'bold', fontSize: 16 },
});

export default ChatSettingsScreen;