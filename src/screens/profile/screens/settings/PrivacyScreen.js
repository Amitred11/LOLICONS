import React, { useState, useEffect, useCallback } from 'react';
import { 
    View, Text, StyleSheet, TouchableOpacity, StatusBar, 
    ScrollView, Modal, FlatList, TextInput, ActivityIndicator, Image 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@config/Colors';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAlert } from '@context/other/AlertContext'; 
import { useProfile } from '@context/main/ProfileContext';
import * as Haptics from 'expo-haptics';

// --- Components ---

const SettingsRow = ({ icon, label, details, onPress, isLast, color = Colors.text }) => (
    <TouchableOpacity onPress={onPress} style={[styles.row, !isLast && styles.rowBorder]} activeOpacity={0.7}>
        <View style={[styles.iconBox, { backgroundColor: 'rgba(255,255,255,0.05)' }]}>
            <Ionicons name={icon} size={20} color={color} />
        </View>
        <View style={styles.rowTextContainer}>
            <Text style={[styles.rowLabel, { color }]}>{label}</Text>
        </View>
        <Text style={styles.rowDetails}>{details}</Text>
        <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
    </TouchableOpacity>
);

const UserListItem = ({ user, onPress, buttonText, buttonColor, isDestructive }) => (
    <View style={styles.userItem}>
        <Image source={{ uri: user.avatar || 'https://via.placeholder.com/150' }} style={styles.userAvatar} />
        <View style={styles.userInfo}>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userHandle}>@{user.handle}</Text>
            {user.blockedDate && <Text style={styles.blockedDate}>Blocked: {user.blockedDate}</Text>}
        </View>
        <TouchableOpacity 
            style={[styles.actionBtn, { backgroundColor: isDestructive ? 'rgba(255,68,68,0.1)' : Colors.primary }]} 
            onPress={onPress}
        >
            <Text style={[styles.actionBtnText, { color: isDestructive ? '#FF4444' : '#FFF' }]}>{buttonText}</Text>
        </TouchableOpacity>
    </View>
);

// --- Main Screen ---

const PrivacyScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { showAlert } = useAlert();
    const { profile, toggleTwoFactor, logoutAllSessions, blockUser, unblockUser, searchUsers } = useProfile();

    // Block Modal State
    const [isBlockModalVisible, setBlockModalVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    
    // Derived State
    const settings = profile?.settings?.privacy || { twoFactor: false, activeSessions: 1, blockedUsers: [] };
    const blockedUsers = settings.blockedUsers || [];

    // --- Search Logic ---
    useEffect(() => {
        const delayDebounce = setTimeout(async () => {
            if (searchQuery.length > 0) {
                setIsSearching(true);
                const results = await searchUsers(searchQuery);
                setSearchResults(results);
                setIsSearching(false);
            } else {
                setSearchResults([]);
            }
        }, 500); // Debounce search 500ms

        return () => clearTimeout(delayDebounce);
    }, [searchQuery, searchUsers]);

    // --- Handlers ---

    const handleBlockUser = (user) => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        showAlert({
            title: `Block ${user.name}?`,
            message: "They won't be able to message you or see your profile.",
            btnText: "Block",
            secondaryBtnText: "Cancel",
            type: 'error',
            onClose: async () => {
                try {
                    await blockUser(user);
                    // Remove from search results instantly for UI smoothness
                    setSearchResults(prev => prev.filter(u => u.id !== user.id));
                    showAlert({ title: "Blocked", message: `${user.name} has been blocked.`, type: 'success' });
                } catch (err) {
                    showAlert({ title: "Error", message: err.message, type: 'error' });
                }
            }
        });
    };

    const handleUnblock = (user) => {
        showAlert({
            title: "Unblock User",
            message: `Unblock ${user.name}? They will be able to see your profile again.`,
            btnText: "Unblock",
            secondaryBtnText: "Cancel",
            onClose: async () => {
                try {
                    await unblockUser(user.id);
                } catch (err) {
                    showAlert({ title: "Error", message: "Failed to unblock user.", type: 'error' });
                }
            }
        });
    };

    const handleTwoFactor = () => {
        showAlert({
            title: "Two-Factor Authentication",
            message: settings.twoFactor 
                ? "Disabling 2FA makes your account less secure. Are you sure?" 
                : "Secure your account by enabling Two-Factor Authentication.",
            type: 'info',
            btnText: settings.twoFactor ? "Disable" : "Enable",
            secondaryBtnText: "Cancel",
            onClose: async () => {
                try {
                    const newState = await toggleTwoFactor(settings.twoFactor);
                    showAlert({ title: "Success", message: `2FA ${newState ? 'enabled' : 'disabled'}.`, type: 'success' });
                } catch (err) {
                    showAlert({ title: "Error", message: "Could not update 2FA.", type: 'error' });
                }
            }
        });
    };

    const handleManageSessions = () => {
        if (settings.activeSessions <= 1) {
            showAlert({ title: "Secure", message: "Only this device is currently active.", type: 'success' });
            return;
        }
        showAlert({
            title: "Log Out Other Devices?",
            message: `You have ${settings.activeSessions} active session(s).`,
            type: 'info',
            btnText: "Log Out Others",
            secondaryBtnText: "Cancel", 
            onClose: async () => {
                try {
                    await logoutAllSessions();
                    showAlert({ title: "Success", message: "All other devices logged out.", type: 'success' });
                } catch (err) {
                    showAlert({ title: "Error", message: "Failed.", type: 'error' });
                }
            }
        });
    };

    // --- Modal Renderer ---

    const renderBlockModal = () => (
        <Modal 
            visible={isBlockModalVisible} 
            animationType="slide" 
            transparent={true}
            onRequestClose={() => setBlockModalVisible(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, { marginTop: insets.top + 40, marginBottom: insets.bottom + 20 }]}>
                    
                    {/* Modal Header */}
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Manage Blocks</Text>
                        <TouchableOpacity onPress={() => setBlockModalVisible(false)} style={styles.closeBtn}>
                            <Ionicons name="close" size={24} color={Colors.text} />
                        </TouchableOpacity>
                    </View>

                    {/* Search Bar */}
                    <View style={styles.searchContainer}>
                        <Ionicons name="search" size={20} color={Colors.textSecondary} />
                        <TextInput 
                            style={styles.input}
                            placeholder="Find users to block..."
                            placeholderTextColor={Colors.textSecondary}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            autoCapitalize="none"
                        />
                        {isSearching && <ActivityIndicator size="small" color={Colors.secondary} />}
                    </View>

                    {/* Content Switcher: Search Results vs Blocked List */}
                    {searchQuery.length > 0 ? (
                        <View style={{ flex: 1 }}>
                            <Text style={styles.listHeader}>Search Results</Text>
                            <FlatList 
                                data={searchResults}
                                keyExtractor={item => item.id}
                                ListEmptyComponent={!isSearching && <Text style={styles.emptyText}>No users found.</Text>}
                                renderItem={({ item }) => (
                                    <UserListItem 
                                        user={item} 
                                        onPress={() => handleBlockUser(item)} 
                                        buttonText="Block"
                                        buttonColor={Colors.danger}
                                        isDestructive={true}
                                    />
                                )}
                            />
                        </View>
                    ) : (
                        <View style={{ flex: 1 }}>
                            <Text style={styles.listHeader}>Blocked List ({blockedUsers.length})</Text>
                            <FlatList 
                                data={blockedUsers}
                                keyExtractor={item => item.id}
                                ListEmptyComponent={
                                    <View style={styles.emptyState}>
                                        <Ionicons name="shield-checkmark-outline" size={48} color={Colors.textSecondary} />
                                        <Text style={styles.emptyText}>No blocked users.</Text>
                                    </View>
                                }
                                renderItem={({ item }) => (
                                    <UserListItem 
                                        user={item} 
                                        onPress={() => handleUnblock(item)} 
                                        buttonText="Unblock"
                                        isDestructive={false}
                                    />
                                )}
                            />
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );

    // --- Main Render ---

    return (
        <LinearGradient colors={[Colors.background, '#1a1a2e']} style={styles.container}>
            <StatusBar barStyle="light-content" />
            <View style={[styles.header, { paddingTop: insets.top }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Privacy</Text>
                <View style={styles.headerButton} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.introHeader}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="finger-print-outline" size={40} color={Colors.secondary} />
                    </View>
                    <Text style={styles.introTitle}>Privacy Center</Text>
                    <Text style={styles.introSubtitle}>Control who can see your activity and secure your account.</Text>
                </View>

                <Text style={styles.sectionTitle}>Account Security</Text>
                <View style={styles.card}>
                    <SettingsRow 
                        icon="shield-outline" 
                        label="Two-Factor Auth" 
                        details={settings.twoFactor ? "Enabled" : "Disabled"} 
                        onPress={handleTwoFactor} 
                    />
                    <SettingsRow 
                        icon="phone-portrait-outline" 
                        label="Active Sessions" 
                        details={`${settings.activeSessions} Device(s)`} 
                        onPress={handleManageSessions} 
                        isLast 
                    />
                </View>

                <Text style={styles.sectionTitle}>Interactions</Text>
                <View style={styles.card}>
                    <SettingsRow 
                        icon="ban-outline" 
                        label="Blocked Users" 
                        details={`${blockedUsers.length}`} 
                        onPress={() => setBlockModalVisible(true)} 
                        isLast 
                    />
                </View>
            </ScrollView>

            {renderBlockModal()}
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15, paddingHorizontal: 15, paddingBottom: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: Colors.surface + '80' },
    headerTitle: { fontFamily: 'Poppins_600SemiBold', color: Colors.text, fontSize: 18 },
    headerButton: { padding: 10, minWidth: 40, alignItems: 'center' },
    
    scrollContainer: { padding: 20, gap: 20 },
    
    introHeader: { alignItems: 'center', marginBottom: 20 },
    iconContainer: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    introTitle: { fontFamily: 'Poppins_700Bold', color: Colors.text, fontSize: 24, textAlign: 'center' },
    introSubtitle: { fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, fontSize: 14, textAlign: 'center', marginTop: 8, maxWidth: '80%' },
    
    sectionTitle: { fontFamily: 'Poppins_600SemiBold', color: Colors.textSecondary, fontSize: 12, textTransform: 'uppercase', marginBottom: -10, marginLeft: 8, letterSpacing: 1 },
    card: { borderRadius: 16, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: StyleSheet.hairlineWidth, borderColor: Colors.surface + '80' },
    
    row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 16 },
    rowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(255,255,255,0.05)' },
    iconBox: { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    rowTextContainer: { flex: 1 },
    rowLabel: { fontFamily: 'Poppins_500Medium', fontSize: 15 },
    rowDetails: { fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, fontSize: 13, marginRight: 8, opacity: 0.7 },

    // Modal Styles
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#151515', borderTopLeftRadius: 24, borderTopRightRadius: 24, flex: 1, padding: 20 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 20, fontFamily: 'Poppins_700Bold', color: Colors.text },
    closeBtn: { padding: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 20 },
    
    searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 12, paddingHorizontal: 15, paddingVertical: 12, marginBottom: 20 },
    input: { flex: 1, fontSize: 14, color: Colors.text, fontFamily: 'Poppins_400Regular', marginLeft: 10 },
    
    listHeader: { fontFamily: 'Poppins_600SemiBold', color: Colors.textSecondary, fontSize: 12, textTransform: 'uppercase', marginBottom: 10 },
    
    // User Item Styles
    userItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
    userAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.surface },
    userInfo: { flex: 1, marginLeft: 12 },
    userName: { color: Colors.text, fontSize: 15, fontFamily: 'Poppins_500Medium' },
    userHandle: { color: Colors.textSecondary, fontSize: 13 },
    blockedDate: { color: Colors.danger, fontSize: 11, marginTop: 2 },
    
    actionBtn: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 8 },
    actionBtnText: { fontSize: 12, fontFamily: 'Poppins_600SemiBold' },
    
    emptyState: { alignItems: 'center', marginTop: 80, opacity: 0.5 },
    emptyText: { color: Colors.textSecondary, marginTop: 15, fontFamily: 'Poppins_400Regular' }
});

export default PrivacyScreen;