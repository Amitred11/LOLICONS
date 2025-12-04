import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, 
  Switch, StatusBar, Modal, ActivityIndicator 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Colors } from '@config/Colors'; 
import { ChatAPI } from '@api/MockChatService';

// IMPT: Import your Alert Hook
import { useAlert } from '@context/AlertContext';

const ChatSettingsScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = route.params;
  const { showAlert } = useAlert(); // Using the custom alert

  // --- State ---
  const [isMuted, setIsMuted] = useState(false);
  const [saveMedia, setSaveMedia] = useState(true);
  const [disappearingMessages, setDisappearingMessages] = useState(false);
  const [showEncryptionModal, setShowEncryptionModal] = useState(false);
  const [isLoadingAction, setIsLoadingAction] = useState(false);

  // --- Actions ---

  const handleMuteToggle = async () => {
    const newState = !isMuted;
    setIsMuted(newState); // Optimistic Update

    try {
      await ChatAPI.toggleMute(user.id, newState);
      showAlert({
        title: newState ? "Muted" : "Unmuted",
        message: newState 
          ? `Notifications from ${user.name} are now silenced.` 
          : "You will receive notifications again.",
        type: 'success',
        btnText: 'Okay'
      });
    } catch(e) {
      setIsMuted(!newState); // Revert
      showAlert({
        title: "Error",
        message: "Could not update notification settings.",
        type: 'error'
      });
    }
  };

  const handleDisappearingToggle = async () => {
    const newState = !disappearingMessages;
    setDisappearingMessages(newState);

    showAlert({
      title: newState ? "Timer Set" : "Timer Off",
      message: newState 
        ? "Messages will disappear 24 hours after they are sent." 
        : "Messages will remain in the chat history.",
      type: 'info'
    });
    
    // Simulate API call in background
    try {
        await ChatAPI.updatePrivacySettings({ disappearing: newState });
    } catch(e) {
        setDisappearingMessages(!newState); // Revert on fail
    }
  };

  const handleBlock = () => {
    showAlert({
      title: "Block User",
      message: `Are you sure you want to block ${user.name}? You won't receive any messages from them.`,
      type: 'error',
      btnText: 'Block User',
      secondaryBtnText: 'Cancel',
      onClose: async () => {
        // This runs on Primary Button (Block)
        setIsLoadingAction(true);
        try {
            await ChatAPI.blockUser(user.id);
            navigation.navigate('ChatList');
        } catch (e) {
            showAlert({ title: "Error", message: "Failed to block user.", type: 'error' });
        } finally {
            setIsLoadingAction(false);
        }
      }
    });
  };

  const handleReport = () => {
    // Simplified report flow since CustomAlert is a modal, not an action sheet
    showAlert({
      title: "Report User",
      message: "Do you want to report this user for spam or inappropriate content? We will review the last 5 messages.",
      type: 'error',
      btnText: 'Report',
      secondaryBtnText: 'Cancel',
      onClose: async () => {
        setIsLoadingAction(true);
        try {
            await ChatAPI.reportUser(user.id, 'general_abuse');
            setTimeout(() => {
                showAlert({ title: "Report Sent", message: "Thank you for keeping our community safe.", type: 'success' });
            }, 500);
        } catch (e) {
            showAlert({ title: "Error", message: "Could not submit report.", type: 'error' });
        } finally {
            setIsLoadingAction(false);
        }
      }
    });
  };

  const handleClearChat = () => {
    showAlert({
        title: "Clear Chat",
        message: "This will delete all messages in this conversation for you. This cannot be undone.",
        type: 'error',
        btnText: 'Delete All',
        secondaryBtnText: 'Cancel',
        onClose: async () => {
            setIsLoadingAction(true);
            try {
                // Simulate clearing chat
                await new Promise(r => setTimeout(r, 1000)); 
                showAlert({ title: "Success", message: "Chat history cleared.", type: 'success' });
            } catch(e) {
                showAlert({ title: "Error", message: "Failed to clear chat.", type: 'error' });
            } finally {
                setIsLoadingAction(false);
            }
        }
    });
  };

  const handleExportChat = () => {
    setIsLoadingAction(true);
    setTimeout(() => {
        setIsLoadingAction(false);
        showAlert({
            title: "Export Ready",
            message: "Your chat history has been exported to your downloads folder.",
            type: 'success'
        });
    }, 1500);
  };

  // --- Render Components ---

  const SettingRow = ({ icon, title, value, onToggle, isDestructive, onPress, hasArrow, subTitle }) => (
    <TouchableOpacity 
      activeOpacity={onPress || onToggle ? 0.7 : 1}
      onPress={onToggle ? () => onToggle(!value) : onPress}
      disabled={isLoadingAction}
      style={[styles.settingRow, isLoadingAction && { opacity: 0.5 }]}
    >
      <View style={styles.settingLeft}>
        <View style={[styles.iconBox, isDestructive && styles.destructiveIconBox]}>
            <Ionicons name={icon} size={20} color={isDestructive ? '#FF453A' : Colors.text} />
        </View>
        <View>
            <Text style={[styles.settingText, isDestructive && styles.destructiveText]}>{title}</Text>
            {subTitle && <Text style={styles.subTitle}>{subTitle}</Text>}
        </View>
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
      {/* Loading Overlay */}
      {isLoadingAction && (
          <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#FFF" />
              <Text style={{color:'#FFF', marginTop: 10}}>Processing...</Text>
          </View>
      )}

      {/* Encryption Modal (Keeping Native Modal for complex info) */}
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
        <View style={{width: 40}} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Profile Hero */}
        <View style={styles.profileContainer}>
          <Image source={{ uri: user.avatar }} style={styles.avatar} />
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userHandle}>Online • +1 (555) 000-0000</Text>
          
          <View style={styles.actionGrid}>
             <TouchableOpacity style={styles.actionBtn} onPress={handleMuteToggle}>
                <View style={[styles.actionIcon, isMuted && { backgroundColor: Colors.text }]}>
                   <Ionicons name={isMuted ? "notifications-off" : "notifications"} size={22} color={isMuted ? Colors.background : Colors.text} />
                </View>
                <Text style={styles.actionLabel}>{isMuted ? 'Unmute' : 'Mute'}</Text>
             </TouchableOpacity>

             <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('ChatDetail', { user })}>
                <View style={styles.actionIcon}>
                   <Ionicons name="chatbubble" size={22} color={Colors.text} />
                </View>
                <Text style={styles.actionLabel}>Message</Text>
             </TouchableOpacity>
          </View>
        </View>

        {/* Section: Privacy */}
        <Text style={styles.sectionHeader}>PRIVACY</Text>
        <View style={styles.card}>
            <SettingRow 
                icon="lock-closed" 
                title="Encryption" 
                subTitle="Messages are end-to-end encrypted"
                onPress={() => setShowEncryptionModal(true)} 
                hasArrow 
            />
            <View style={styles.divider} />
            <SettingRow 
                icon="timer" 
                title="Disappearing Messages" 
                subTitle={disappearingMessages ? "On (24 Hours)" : "Off"}
                value={disappearingMessages} 
                onToggle={handleDisappearingToggle} 
            />
        </View>

        {/* Section: Media & Storage */}
        <Text style={styles.sectionHeader}>MEDIA & STORAGE</Text>
        <View style={styles.card}>
            <SettingRow 
                icon="image" 
                title="Save to Camera Roll" 
                value={saveMedia} 
                onToggle={setSaveMedia} 
            />
            <View style={styles.divider} />
            <SettingRow 
                icon="download" 
                title="Export Chat" 
                onPress={handleExportChat}
                hasArrow 
            />
        </View>

        {/* Section: Danger Zone */}
        <Text style={styles.sectionHeader}>SUPPORT & ACTIONS</Text>
        <View style={[styles.card, { marginBottom: 30 }]}>
            <SettingRow 
                icon="trash" 
                title="Clear Chat History" 
                onPress={handleClearChat}
                isDestructive 
            />
            <View style={styles.divider} />
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
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  loadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', zIndex: 999 },
  
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 10 },
  headerTitle: { color: Colors.text, fontSize: 17, fontWeight: '600' },
  navBtn: { padding: 8 },

  scrollContent: { paddingBottom: 50 },

  // Profile
  profileContainer: { alignItems: 'center', marginTop: 10, marginBottom: 30 },
  avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 4, borderColor: Colors.background },
  userName: { color: Colors.text, fontSize: 24, fontWeight: '700', marginTop: 15 },
  userHandle: { color: Colors.textSecondary, fontSize: 14, marginTop: 5 },

  // Actions
  actionGrid: { flexDirection: 'row', marginTop: 25, gap: 25 },
  actionBtn: { alignItems: 'center', width: 60 },
  actionIcon: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.08)', justifyContent: 'center', alignItems: 'center', marginBottom: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  actionLabel: { color: Colors.textSecondary, fontSize: 11, fontWeight: '500' },

  // Sections
  sectionHeader: { color: Colors.textSecondary, fontSize: 12, fontWeight: '700', marginLeft: 25, marginBottom: 8, marginTop: 10 },
  sectionContainer: { paddingHorizontal: 20 },
  card: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 20, paddingVertical: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', marginHorizontal: 20 },
  
  // Rows
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16 },
  settingLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconBox: { width: 32, height: 32, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  destructiveIconBox: { backgroundColor: 'rgba(255, 69, 58, 0.15)' },
  settingText: { color: Colors.text, fontSize: 16, fontWeight: '500' },
  subTitle: { color: Colors.textSecondary, fontSize: 12, marginTop: 2 },
  destructiveText: { color: '#FF453A' },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.05)', marginLeft: 60 },

  // Encryption Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '80%', backgroundColor: '#1E1E1E', borderRadius: 24, padding: 30, alignItems: 'center' },
  modalTitle: { color: Colors.text, fontSize: 20, fontWeight: '700', marginTop: 15, marginBottom: 10 },
  modalText: { color: Colors.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: 25 },
  modalBtn: { backgroundColor: Colors.primary, paddingVertical: 12, paddingHorizontal: 40, borderRadius: 20 },
  modalBtnText: { color: '#000', fontWeight: 'bold', fontSize: 16 },
});

export default ChatSettingsScreen;