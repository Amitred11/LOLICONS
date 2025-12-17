import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, ScrollView, Modal, FlatList, TextInput, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@config/Colors';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAlert } from '@context/other/AlertContext'; 
import { useProfile } from '@context/main/ProfileContext';
import * as Haptics from 'expo-haptics';
// IMPORTS
import { SettingsRow } from '../../components/settings/SettingsShared';
import { UserListItem } from '../../components/settings/PrivacyComponents';

const PrivacyScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { showAlert, showToast } = useAlert();
    const { profile, toggleTwoFactor, logoutAllSessions, blockUser, unblockUser, searchUsers } = useProfile();

    const [isBlockModalVisible, setBlockModalVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    
    const settings = profile?.settings?.privacy || { twoFactor: false, activeSessions: 1, blockedUsers: [] };
    const blockedUsers = settings.blockedUsers || [];

    useEffect(() => {
        const delayDebounce = setTimeout(async () => {
            if (searchQuery.length > 0) {
                setIsSearching(true);
                const results = await searchUsers(searchQuery);
                setSearchResults(results);
                setIsSearching(false);
            } else { setSearchResults([]); }
        }, 500);
        return () => clearTimeout(delayDebounce);
    }, [searchQuery, searchUsers]);

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
                    setSearchResults(prev => prev.filter(u => u.id !== user.id));
                    showToast(`${user.name} has been blocked.`, 'success' );
                } catch (err) { showToast( err.message, 'error' ); }
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
                try { await unblockUser(user.id); } catch (err) { showToast( "Failed to unblock user.",  'error' ); }
            }
        });
    };

    const handleTwoFactor = () => {
        showAlert({
            title: "Two-Factor Authentication",
            message: settings.twoFactor ? "Disabling 2FA makes your account less secure. Are you sure?" : "Secure your account by enabling Two-Factor Authentication.",
            type: 'info',
            btnText: settings.twoFactor ? "Disable" : "Enable",
            secondaryBtnText: "Cancel",
            onClose: async () => {
                try {
                    const newState = await toggleTwoFactor(settings.twoFactor);
                    showToast(`2FA ${newState ? 'enabled' : 'disabled'}.`, 'success' );
                } catch (err) { showToast("Could not update 2FA.",'error' ); }
            }
        });
    };

    const handleManageSessions = () => {
        if (settings.activeSessions <= 1) { showToast( "Only this device is currently active.", 'success' ); return; }
        showAlert({
            title: "Log Out Other Devices?",
            message: `You have ${settings.activeSessions} active session(s).`,
            type: 'info',
            btnText: "Log Out Others",
            secondaryBtnText: "Cancel", 
            onClose: async () => {
                try { await logoutAllSessions(); showToast( "All other devices logged out.", 'success' ); } 
                catch (err) { showToast( "Failed.", 'error' ); }
            }
        });
    };

    const renderBlockModal = () => (
        <Modal visible={isBlockModalVisible} animationType="slide" transparent={true} onRequestClose={() => setBlockModalVisible(false)}>
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, { marginTop: insets.top + 40, marginBottom: insets.bottom + 20 }]}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Manage Blocks</Text>
                        <TouchableOpacity onPress={() => setBlockModalVisible(false)} style={styles.closeBtn}><Ionicons name="close" size={24} color={Colors.text} /></TouchableOpacity>
                    </View>

                    <View style={styles.searchContainer}>
                        <Ionicons name="search" size={20} color={Colors.textSecondary} />
                        <TextInput style={styles.input} placeholder="Find users to block..." placeholderTextColor={Colors.textSecondary} value={searchQuery} onChangeText={setSearchQuery} autoCapitalize="none" />
                        {isSearching && <ActivityIndicator size="small" color={Colors.secondary} />}
                    </View>

                    {searchQuery.length > 0 ? (
                        <View style={{ flex: 1 }}>
                            <Text style={styles.listHeader}>Search Results</Text>
                            <FlatList data={searchResults} keyExtractor={item => item.id} ListEmptyComponent={!isSearching && <Text style={styles.emptyText}>No users found.</Text>} renderItem={({ item }) => (<UserListItem user={item} onPress={() => handleBlockUser(item)} buttonText="Block" buttonColor={Colors.danger} isDestructive={true} />)} />
                        </View>
                    ) : (
                        <View style={{ flex: 1 }}>
                            <Text style={styles.listHeader}>Blocked List ({blockedUsers.length})</Text>
                            <FlatList data={blockedUsers} keyExtractor={item => item.id} ListEmptyComponent={<View style={styles.emptyState}><Ionicons name="shield-checkmark-outline" size={48} color={Colors.textSecondary} /><Text style={styles.emptyText}>No blocked users.</Text></View>} renderItem={({ item }) => (<UserListItem user={item} onPress={() => handleUnblock(item)} buttonText="Unblock" isDestructive={false} />)} />
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );

    return (
        <LinearGradient colors={[Colors.background, '#1a1a2e']} style={styles.container}>
            <StatusBar barStyle="light-content" />
            <View style={[styles.header, { paddingTop: insets.top }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}><Ionicons name="arrow-back" size={24} color={Colors.text} /></TouchableOpacity>
                <Text style={styles.headerTitle}>Privacy</Text>
                <View style={styles.headerButton} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.introHeader}>
                    <View style={styles.iconContainer}><Ionicons name="finger-print-outline" size={40} color={Colors.secondary} /></View>
                    <Text style={styles.introTitle}>Privacy Center</Text>
                    <Text style={styles.introSubtitle}>Control who can see your activity and secure your account.</Text>
                </View>
                <Text style={styles.sectionTitle}>Account Security</Text>
                <View style={styles.card}>
                    <SettingsRow icon="shield-outline" label="Two-Factor Auth" details={settings.twoFactor ? "Enabled" : "Disabled"} onPress={handleTwoFactor} />
                    <SettingsRow icon="phone-portrait-outline" label="Active Sessions" details={`${settings.activeSessions} Device(s)`} onPress={handleManageSessions} isLast />
                </View>
                <Text style={styles.sectionTitle}>Interactions</Text>
                <View style={styles.card}>
                    <SettingsRow icon="ban-outline" label="Blocked Users" details={`${blockedUsers.length}`} onPress={() => setBlockModalVisible(true)} isLast />
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
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#151515', borderTopLeftRadius: 24, borderTopRightRadius: 24, flex: 1, padding: 20 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 20, fontFamily: 'Poppins_700Bold', color: Colors.text },
    closeBtn: { padding: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 20 },
    searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 12, paddingHorizontal: 15, paddingVertical: 12, marginBottom: 20 },
    input: { flex: 1, fontSize: 14, color: Colors.text, fontFamily: 'Poppins_400Regular', marginLeft: 10 },
    listHeader: { fontFamily: 'Poppins_600SemiBold', color: Colors.textSecondary, fontSize: 12, textTransform: 'uppercase', marginBottom: 10 },
    emptyState: { alignItems: 'center', marginTop: 80, opacity: 0.5 },
    emptyText: { color: Colors.textSecondary, marginTop: 15, fontFamily: 'Poppins_400Regular' }
});

export default PrivacyScreen;