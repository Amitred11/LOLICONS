import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, 
  Switch, StatusBar, Modal, ActivityIndicator, FlatList, Alert 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Colors } from '@config/Colors'; 
import { useAlert } from '@context/other/AlertContext';
import { useChat } from '@context/hub/ChatContext';
import { ChatAPI } from '@api/hub/MockChatService';
import CustomPrompt from '@components/alerts/CustomPrompt'; // Ensure this path matches your file structure
import { 
    MemberPreview
} from './components/ChatComponents';

const ChatSettingsScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = route.params;

  // Context & Hooks
  const { showAlert, showToast } = useAlert(); 
  const { 
    toggleMute, blockUser, reportUser, clearChatHistory, 
    leaveGroup, setDisappearingMessages, addMembersToGroup,
    updateGroupInfo, kickMember, setNickname
  } = useChat();
  
  // State
  const [chatDetails, setChatDetails] = useState(user);
  const [isMuted, setIsMuted] = useState(chatDetails.isMuted || false);
  const [disappearingMessages, setDisappearingMessagesState] = useState(chatDetails.disappearingMessages?.enabled || false);
  const [isLoadingAction, setIsLoadingAction] = useState(false);
  const [showEncryptionModal, setShowEncryptionModal] = useState(false);

  // --- Group Edit State ---
  const [showRenamePrompt, setShowRenamePrompt] = useState(false);
  
  // --- Member Management State ---
  const [showManageMembers, setShowManageMembers] = useState(false);
  const [memberActionSheet, setMemberActionSheet] = useState(null); // Selected member for actions
  const [showNicknamePrompt, setShowNicknamePrompt] = useState(false);
  
  // --- Add Member Modal State ---
  const [showAddModal, setShowAddModal] = useState(false);
  const [friendList, setFriendList] = useState([]);
  const [isLoadingFriends, setIsLoadingFriends] = useState(false);
  const [selectedFriends, setSelectedFriends] = useState(new Set());

  const isGroup = chatDetails.type === 'group';
  // Mock current user ID - in real app, get from AuthContext
  const currentUserId = 'usr_a1b2c3d4e5f6g7h8'; 
  // Mock Admin ID - assume creator is admin or list is provided
  const isAdmin = isGroup; // For demo, let's say we are admin of this group

  // --- 1. General Settings Actions ---

  const handleMuteToggle = async () => {
    try {
      const newState = await toggleMute(chatDetails.id, isMuted);
      setIsMuted(newState);
    } catch(e) { showToast("Error updating settings", 'error'); }
  };

  const handleDisappearingToggle = async () => {
    const newState = !disappearingMessages;
    setDisappearingMessagesState(newState);
    try { await setDisappearingMessages(chatDetails.id, newState); }
    catch(e) { setDisappearingMessagesState(!newState); }
  };

  // --- 2. Group Profile Actions ---

  const handleChangeImage = () => {
    if (!isGroup) return;
    // Mock Image Picker
    Alert.alert("Change Group Photo", "Choose a source", [
        { text: "Cancel", style: "cancel" },
        { text: "Camera", onPress: () => simulateImageUpdate() },
        { text: "Gallery", onPress: () => simulateImageUpdate() }
    ]);
  };

  const simulateImageUpdate = async () => {
      setIsLoadingAction(true);
      // Simulate upload delay and new URL
      setTimeout(async () => {
        const newAvatar = `https://picsum.photos/200?random=${Date.now()}`;
        await updateGroupInfo(chatDetails.id, { avatar: newAvatar });
        setChatDetails(prev => ({ ...prev, avatar: newAvatar }));
        setIsLoadingAction(false);
        showToast("Group photo updated", "success");
      }, 1500);
  };

  const handleRenameGroup = async (newName) => {
      setShowRenamePrompt(false);
      if(!newName.trim()) return;
      setIsLoadingAction(true);
      try {
          await updateGroupInfo(chatDetails.id, { name: newName });
          setChatDetails(prev => ({ ...prev, name: newName }));
          showToast("Group name updated", "success");
      } catch(e) {
          showToast("Failed to rename group", "error");
      } finally {
          setIsLoadingAction(false);
      }
  };

  // --- 3. Member Management Actions ---

  const openAddMembersModal = async () => {
    setShowAddModal(true);
    setIsLoadingFriends(true);
    try {
        const response = await ChatAPI.fetchFriends();
        if(response.success) {
            const currentIds = (chatDetails.members || []).map(m => m.id || m);
            setFriendList(response.data.filter(f => !currentIds.includes(f.id)));
        }
    } finally { setIsLoadingFriends(false); }
  };

  const submitAddMembers = async () => {
      if(selectedFriends.size === 0) return;
      try {
          const ids = Array.from(selectedFriends);
          const updatedMembers = await addMembersToGroup(chatDetails.id, ids);
          setChatDetails(prev => ({ ...prev, members: updatedMembers }));
          setShowAddModal(false);
          setSelectedFriends(new Set());
          showToast("Members added", 'success');
      } catch(e) { showToast("Failed to add members", 'error'); }
  };

  const handleMemberAction = (member) => {
      // Don't show actions for self
      if((member.id || member) === currentUserId) return; 
      setMemberActionSheet(member);
  };

  const performKick = () => {
      const member = memberActionSheet;
      setMemberActionSheet(null); // Close sheet
      
      showAlert({
          title: "Remove Member?",
          message: `Are you sure you want to remove ${member.name || member}?`,
          type: 'error',
          btnText: "Remove",
          onClose: async () => {
              try {
                  const success = await kickMember(chatDetails.id, member.id || member);
                  if(success) {
                      setChatDetails(prev => ({
                          ...prev,
                          members: prev.members.filter(m => (m.id || m) !== (member.id || member))
                      }));
                      showToast("Member removed", "info");
                  }
              } catch(e) { showToast("Failed to remove member", "error"); }
          }
      });
  };

  const performSetNickname = async (newNickname) => {
      setShowNicknamePrompt(false);
      const member = memberActionSheet;
      if(!member) return;

      try {
          await setNickname(chatDetails.id, member.id || member, newNickname);
          // Update local state
          const updatedMembers = chatDetails.members.map(m => {
              if((m.id || m) === (member.id || member)) {
                  return { ...(typeof m === 'object' ? m : {id: m, name: m}), nickname: newNickname };
              }
              return m;
          });
          setChatDetails(prev => ({ ...prev, members: updatedMembers }));
          setMemberActionSheet(null);
          showToast("Nickname set", "success");
      } catch(e) { showToast("Failed to set nickname", "error"); }
  };

  // --- Render Helpers ---

  const SettingRow = ({ icon, title, value, onToggle, isDestructive, onPress, hasArrow, subTitle }) => (
    <TouchableOpacity activeOpacity={onPress || onToggle ? 0.7 : 1} onPress={onPress || (onToggle ? () => onToggle(!value) : undefined)} disabled={isLoadingAction} style={[styles.settingRow, isLoadingAction && { opacity: 0.5 }]}>
      <View style={styles.settingLeft}>
        <View style={[styles.iconBox, isDestructive && styles.destructiveIconBox]}><Ionicons name={icon} size={20} color={isDestructive ? '#FF453A' : Colors.text} /></View>
        <View><Text style={[styles.settingText, isDestructive && styles.destructiveText]}>{title}</Text>{subTitle && <Text style={styles.subTitle}>{subTitle}</Text>}</View>
      </View>
      {onToggle !== undefined && <Switch value={value} onValueChange={onToggle} trackColor={{ false: '#333', true: Colors.primary }} thumbColor={'#FFF'} />}
      {hasArrow && onToggle === undefined && <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {isLoadingAction && <View style={styles.loadingOverlay}><ActivityIndicator size="large" color="#FFF" /></View>}
      
      <CustomPrompt 
          visible={showRenamePrompt} 
          title="Group Name" 
          defaultValue={chatDetails.name}
          onConfirm={handleRenameGroup} 
          onCancel={() => setShowRenamePrompt(false)} 
      />

      <CustomPrompt 
          visible={showNicknamePrompt} 
          title="Set Nickname" 
          placeholder={memberActionSheet?.name || "Enter nickname"}
          defaultValue={memberActionSheet?.nickname || ""}
          onConfirm={performSetNickname} 
          onCancel={() => setShowNicknamePrompt(false)} 
          icon="pricetag-outline"
      />

      {/* --- Management Modal --- */}
      <Modal visible={showManageMembers} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowManageMembers(false)}>
        <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
                <Text style={styles.modalHeaderTitle}>Manage Members</Text>
                <TouchableOpacity onPress={() => setShowManageMembers(false)}><Text style={styles.modalCancel}>Done</Text></TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.addMemberRow} onPress={openAddMembersModal}>
                <View style={styles.addMemberIcon}><Ionicons name="person-add" size={20} color="#FFF" /></View>
                <Text style={styles.addMemberText}>Add Members</Text>
            </TouchableOpacity>
            <FlatList 
                data={chatDetails.members}
                keyExtractor={(item, index) => item.id || index.toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.manageMemberRow} onPress={() => handleMemberAction(item)} disabled={!isAdmin}>
                        <Image source={{ uri: item.avatar || `https://i.pravatar.cc/150?u=${item.id}` }} style={styles.manageMemberAvatar} />
                        <View style={{flex:1}}>
                            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                <Text style={styles.manageMemberName}>{item.nickname || item.name || item}</Text>
                                {/* Mock admin check */}
                                {(item.id === currentUserId) && <View style={styles.adminBadge}><Text style={styles.adminText}>Admin</Text></View>}
                            </View>
                            {item.nickname && <Text style={styles.realNameText}>~ {item.name}</Text>}
                        </View>
                        {isAdmin && item.id !== currentUserId && <Ionicons name="ellipsis-horizontal" size={20} color={Colors.textSecondary} />}
                    </TouchableOpacity>
                )}
            />
        </View>
        {/* Simple Action Sheet Overlay for selected member */}
        {memberActionSheet && (
            <TouchableOpacity style={styles.sheetOverlay} activeOpacity={1} onPress={() => setMemberActionSheet(null)}>
                <View style={styles.sheetContainer}>
                    <Text style={styles.sheetTitle}>Actions for {memberActionSheet.name || memberActionSheet}</Text>
                    <TouchableOpacity style={styles.sheetBtn} onPress={() => { setMemberActionSheet(null); setShowNicknamePrompt(true); }}>
                        <Ionicons name="pencil" size={20} color={Colors.text} />
                        <Text style={styles.sheetBtnText}>Set Nickname</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.sheetBtn, { borderBottomWidth:0 }]} onPress={performKick}>
                        <Ionicons name="remove-circle" size={20} color="#FF453A" />
                        <Text style={[styles.sheetBtnText, { color: '#FF453A' }]}>Remove from Group</Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        )}
      </Modal>

      {/* --- Add Friends Modal (Recycled logic) --- */}
      <Modal visible={showAddModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowAddModal(false)}>
         <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
                <Text style={styles.modalHeaderTitle}>Add Friends</Text>
                <TouchableOpacity onPress={() => setShowAddModal(false)}><Text style={styles.modalCancel}>Cancel</Text></TouchableOpacity>
            </View>
            {isLoadingFriends ? <ActivityIndicator style={{marginTop: 20}} /> :
            <FlatList 
                data={friendList}
                keyExtractor={item => item.id}
                renderItem={({item}) => (
                    <TouchableOpacity style={styles.friendRow} onPress={() => {
                        const newSet = new Set(selectedFriends);
                        if(newSet.has(item.id)) newSet.delete(item.id); else newSet.add(item.id);
                        setSelectedFriends(newSet);
                    }}>
                        <Image source={{uri: item.avatar}} style={styles.friendAvatar} />
                        <Text style={[styles.friendName, {flex:1}]}>{item.name}</Text>
                        <View style={[styles.checkbox, selectedFriends.has(item.id) && styles.checkboxSelected]}>
                             {selectedFriends.has(item.id) && <Ionicons name="checkmark" size={16} color="#000" />}
                        </View>
                    </TouchableOpacity>
                )}
            />}
            <View style={[styles.modalFooter, { paddingBottom: insets.bottom + 20 }]}>
                <TouchableOpacity style={[styles.modalBtn, selectedFriends.size===0 && styles.modalBtnDisabled]} disabled={selectedFriends.size===0} onPress={submitAddMembers}>
                    <Text style={styles.modalBtnText}>Add ({selectedFriends.size})</Text>
                </TouchableOpacity>
            </View>
         </View>
      </Modal>

      {/* --- Main Screen Content --- */}
      
      <View style={[styles.header, { marginTop: insets.top + 15 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.navBtn}><Ionicons name="arrow-back" size={24} color={Colors.text} /></TouchableOpacity>
        <Text style={styles.headerTitle}>Details</Text>
        <View style={{width: 40}} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Profile Section */}
        <View style={styles.profileContainer}>
          <TouchableOpacity onPress={handleChangeImage} activeOpacity={0.8} disabled={!isGroup}>
              {isGroup ? (
                  <View>
                    <Image source={{ uri: chatDetails.avatar }} style={styles.avatar} /> 
                    <View style={styles.editBadge}><Ionicons name="camera" size={16} color="#FFF" /></View>
                  </View>
              ) : (
                  <Image source={{ uri: chatDetails.avatar }} style={styles.avatar} />
              )}
          </TouchableOpacity>

          <View style={styles.nameRow}>
             <Text style={styles.userName}>{chatDetails.name}</Text>
             {isGroup && (
                 <TouchableOpacity onPress={() => setShowRenamePrompt(true)} style={styles.editNameBtn}>
                     <Ionicons name="pencil" size={16} color={Colors.textSecondary} />
                 </TouchableOpacity>
             )}
          </View>
          <Text style={styles.userHandle}>{isGroup ? 'Group Chat' : 'Online'}</Text>
        </View>

        <Text style={styles.sectionHeader}>SETTINGS</Text>
        <View style={styles.card}>
            <SettingRow icon={isMuted ? "notifications-off" : "notifications"} title="Mute Notifications" value={isMuted} onToggle={handleMuteToggle} />
        </View>

        {isGroup && (
            <>
                <MemberPreview members={chatDetails.members} onManage={() => setShowManageMembers(true)} />
                <View style={{height: 20}} />
            </>
        )}

        <Text style={styles.sectionHeader}>PRIVACY</Text>
        <View style={styles.card}>
            <SettingRow icon="lock-closed" title="Encryption" subTitle="Messages are end-to-end encrypted" onPress={() => setShowEncryptionModal(true)} hasArrow />
            <View style={styles.divider} />
            <SettingRow icon="timer" title="Disappearing Messages" subTitle={disappearingMessages ? "On (24 Hours)" : "Off"} value={disappearingMessages} onToggle={handleDisappearingToggle} />
        </View>

        <Text style={styles.sectionHeader}>DANGER ZONE</Text>
        <View style={styles.card}>
             <SettingRow icon="trash" title="Clear Chat History" onPress={() => clearChatHistory(chatDetails.id)} isDestructive />
            <View style={styles.divider} />
            {isGroup ? <SettingRow icon="exit" title="Leave Group" onPress={() => leaveGroup(chatDetails.id)} isDestructive /> : <SettingRow icon="ban" title="Block User" onPress={() => blockUser(chatDetails.id)} isDestructive />}
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
  profileContainer: { alignItems: 'center', marginTop: 10, marginBottom: 30, paddingHorizontal: 20 },
  avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 4, borderColor: Colors.background, backgroundColor: '#333' },
  editBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: Colors.primary, width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: Colors.background },
  nameRow: { flexDirection: 'row', alignItems: 'center', marginTop: 15, gap: 8 },
  userName: { color: Colors.text, fontSize: 24, fontWeight: '700', textAlign: 'center' },
  editNameBtn: { padding: 5, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12 },
  userHandle: { color: Colors.textSecondary, fontSize: 14, marginTop: 5 },

  // Settings
  sectionHeader: { color: Colors.textSecondary, fontSize: 12, fontWeight: '700', marginLeft: 25, marginBottom: 8, marginTop: 20 },
  card: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 20, paddingVertical: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', marginHorizontal: 20 },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16 },
  settingLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconBox: { width: 32, height: 32, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  destructiveIconBox: { backgroundColor: 'rgba(255, 69, 58, 0.15)' },
  settingText: { color: Colors.text, fontSize: 16, fontWeight: '500' },
  subTitle: { color: Colors.textSecondary, fontSize: 12, marginTop: 2 },
  destructiveText: { color: '#FF453A' },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.05)', marginLeft: 60 },
  
  // Member Preview
  memberListContainer: { marginTop: 20, paddingLeft: 20 },
  memberListHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingRight: 20, marginBottom: 12 },
  memberCount: { color: Colors.textSecondary, fontSize: 12, fontWeight: '700' },
  seeAllText: { color: Colors.primary, fontSize: 12, fontWeight: '600' },
  memberItem: { alignItems: 'center', width: 60 },
  memberAvatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#333' },
  memberName: { color: Colors.textSecondary, fontSize: 11, marginTop: 6, fontWeight: '500' },
  addMemberBtn: { justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.08)', width: 50, height: 50, borderRadius: 25 },
  moreMembersText: { color: Colors.textSecondary, fontSize: 14, fontWeight: '700' },

  // Management Modal
  modalContainer: { flex: 1, backgroundColor: Colors.background },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
  modalHeaderTitle: { color: Colors.text, fontSize: 18, fontWeight: '700' },
  modalCancel: { color: Colors.primary, fontSize: 16 },
  addMemberRow: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  addMemberIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  addMemberText: { color: Colors.primary, fontSize: 16, fontWeight: '600' },
  manageMemberRow: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  manageMemberAvatar: { width: 44, height: 44, borderRadius: 22, marginRight: 15, backgroundColor: '#333' },
  manageMemberName: { color: Colors.text, fontSize: 16, fontWeight: '600' },
  realNameText: { color: Colors.textSecondary, fontSize: 12, marginTop: 2 },
  adminBadge: { backgroundColor: 'rgba(255,215,0,0.2)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginLeft: 8, borderWidth: 1, borderColor: 'rgba(255,215,0,0.5)' },
  adminText: { color: '#FFD700', fontSize: 10, fontWeight: '700' },
  
  // Sheet
  sheetOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheetContainer: { backgroundColor: '#1E1E1E', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 40 },
  sheetTitle: { color: Colors.textSecondary, fontSize: 13, textAlign: 'center', marginBottom: 20, fontWeight: '600' },
  sheetBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)', gap: 15 },
  sheetBtnText: { color: Colors.text, fontSize: 16, fontWeight: '500' },

  // General Modal bits (Recycled)
  friendRow: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  friendAvatar: { width: 40, height: 40, borderRadius: 20, marginRight: 15, backgroundColor: '#333' },
  friendName: { color: Colors.text, fontSize: 16 },
  checkbox: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: Colors.textSecondary, justifyContent: 'center', alignItems: 'center' },
  checkboxSelected: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  modalFooter: { padding: 20, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)' },
  modalBtn: { backgroundColor: Colors.primary, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  modalBtnText: { color: '#000', fontSize: 16, fontWeight: '700' },
  modalBtnDisabled: { opacity: 0.5 },
  
  // Encryption Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '80%', backgroundColor: '#1E1E1E', borderRadius: 24, padding: 30, alignItems: 'center' },
  modalTitle: { color: Colors.text, fontSize: 20, fontWeight: '700', marginTop: 15, marginBottom: 10 },
  modalText: { color: Colors.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: 25 },
});

export default ChatSettingsScreen;