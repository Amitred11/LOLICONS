// screens/profile/PrivacyScreen.js

import React, { useState, useEffect } from 'react';
import { 
    View, Text, StyleSheet, TouchableOpacity, StatusBar, 
    ScrollView, Modal, FlatList, TextInput, ActivityIndicator 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@config/Colors';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAlert } from '@context/AlertContext'; 

// --- API Service Placeholders ---
// TODO: Replace these simulated promises with real Backend API calls (e.g., axios or fetch)
const PrivacyAPI = {
    getSettings: async () => {
        // Example: const res = await api.get('/user/privacy/settings'); return res.data;
        // Returning default empty state for now
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({ 
                    twoFactor: false, 
                    sessions: 1, // 1 usually implies 'current device'
                    blocked: []  // Empty list initially
                });
            }, 500);
        });
    },
    
    toggle2FA: async (currentStatus) => {
        // Example: await api.post('/user/privacy/2fa', { enabled: !currentStatus });
        return new Promise(resolve => setTimeout(() => resolve(!currentStatus), 500));
    },
    
    logoutOtherSessions: async () => {
        // Example: await api.post('/user/privacy/sessions/logout-all');
        return new Promise(resolve => setTimeout(() => resolve(true), 500));
    },
    
    unblockUser: async (userId) => {
        // Example: await api.delete(`/user/privacy/blocked/${userId}`);
        return new Promise(resolve => setTimeout(() => resolve(true), 500));
    },
    
    blockUser: async (username) => {
        // Example: const res = await api.post('/user/privacy/block', { username }); return res.data;
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (!username) reject("Invalid username");
                // Return a structure matching your backend user object
                resolve({ 
                    id: Math.random().toString(), 
                    name: username, 
                    date: new Date().toISOString().split('T')[0] 
                });
            }, 500);
        });
    }
};

const SettingsRow = ({ icon, label, details, onPress, isLast, color = Colors.text }) => (
    <TouchableOpacity onPress={onPress} style={[styles.row, !isLast && styles.rowBorder]}>
        <Ionicons name={icon} size={22} color={color} style={{ marginRight: 15 }} />
        <View style={styles.rowTextContainer}>
            <Text style={[styles.rowLabel, { color }]}>{label}</Text>
        </View>
        <Text style={styles.rowDetails}>{details}</Text>
        <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
    </TouchableOpacity>
);

const PrivacyScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { showAlert } = useAlert();

    const [isLoading, setIsLoading] = useState(true);
    const [settings, setSettings] = useState({ twoFactor: false, sessions: 1 });
    const [blockedUsers, setBlockedUsers] = useState([]);
    
    // Blocked Users Modal State
    const [isBlockModalVisible, setBlockModalVisible] = useState(false);
    const [newBlockName, setNewBlockName] = useState('');
    const [isBlockingLoader, setIsBlockingLoader] = useState(false);

    // Initial Data Fetch
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const data = await PrivacyAPI.getSettings();
            setSettings({ twoFactor: data.twoFactor, sessions: data.sessions });
            setBlockedUsers(data.blocked);
        } catch (error) {
            console.error(error);
            showAlert({ title: "Error", message: "Failed to load settings from server.", type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    // --- 2FA Handler ---
    const handleTwoFactor = () => {
        showAlert({
            title: "Two-Factor Authentication",
            message: settings.twoFactor 
                ? "Disabling 2FA makes your account less secure. Are you sure?" 
                : "Secure your account by enabling Two-Factor Authentication.",
            type: 'info',
            btnText: settings.twoFactor ? "Yes, Disable" : "Enable",
            secondaryBtnText: "Cancel",
            onClose: async () => {
                try {
                    const newState = await PrivacyAPI.toggle2FA(settings.twoFactor);
                    setSettings(prev => ({ ...prev, twoFactor: newState }));
                    showAlert({ 
                        title: "Success", 
                        message: `2FA has been ${newState ? 'enabled' : 'disabled'}.`, 
                        type: 'success' 
                    });
                } catch (err) {
                    showAlert({ title: "Error", message: "Could not update 2FA status.", type: 'error' });
                }
            }
        });
    };

    // --- Manage Sessions Handler ---
    const handleManageSessions = () => {
        if (settings.sessions <= 1) {
            showAlert({ title: "Secure", message: "Only this device is currently active.", type: 'success' });
            return;
        }

        showAlert({
            title: "Manage Sessions",
            message: `You have ${settings.sessions} active session(s). Do you want to log out all other devices?`,
            type: 'info',
            btnText: "Log Out Others",
            secondaryBtnText: "Cancel", 
            onSecondaryPress: () => {}, 
            onClose: async () => {
                try {
                    await PrivacyAPI.logoutOtherSessions();
                    setSettings(prev => ({ ...prev, sessions: 1 }));
                    showAlert({ title: "Success", message: "All other devices have been logged out.", type: 'success' });
                } catch (err) {
                    showAlert({ title: "Error", message: "Failed to log out sessions.", type: 'error' });
                }
            }
        });
    };

    // --- Blocked Users Handlers ---
    const handleOpenBlocked = () => {
        setBlockModalVisible(true);
    };

    const handleUnblock = (user) => {
        showAlert({
            title: "Unblock User",
            message: `Are you sure you want to unblock ${user.name}?`,
            btnText: "Unblock",
            secondaryBtnText: "Cancel",
            onClose: async () => {
                try {
                    await PrivacyAPI.unblockUser(user.id);
                    setBlockedUsers(prev => prev.filter(u => u.id !== user.id));
                    // Optional: Show success toast
                } catch (err) {
                    showAlert({ title: "Error", message: "Failed to unblock user.", type: 'error' });
                }
            }
        });
    };

    const handleAddBlock = async () => {
        if (!newBlockName.trim()) return;
        setIsBlockingLoader(true);
        try {
            const newUser = await PrivacyAPI.blockUser(newBlockName);
            setBlockedUsers(prev => [...prev, newUser]);
            setNewBlockName('');
        } catch (err) {
            showAlert({ title: "Error", message: "Could not block user. Please check the username.", type: 'error' });
        } finally {
            setIsBlockingLoader(false);
        }
    };

    // --- Render Blocked User Modal Content ---
    const renderBlockModal = () => (
        <Modal 
            visible={isBlockModalVisible} 
            animationType="slide" 
            transparent={true}
            onRequestClose={() => setBlockModalVisible(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, { marginTop: insets.top + 20, marginBottom: insets.bottom + 20 }]}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Blocked Users</Text>
                        <TouchableOpacity onPress={() => setBlockModalVisible(false)} style={styles.closeBtn}>
                            <Ionicons name="close" size={24} color={Colors.text} />
                        </TouchableOpacity>
                    </View>

                    {/* Add User Section */}
                    <View style={styles.addBlockContainer}>
                        <TextInput 
                            style={styles.input}
                            placeholder="Type username to block..."
                            placeholderTextColor={Colors.textSecondary}
                            value={newBlockName}
                            onChangeText={setNewBlockName}
                        />
                        <TouchableOpacity 
                            style={styles.addBtn} 
                            onPress={handleAddBlock}
                            disabled={isBlockingLoader}
                        >
                            {isBlockingLoader ? (
                                <ActivityIndicator color="#FFF" size="small" />
                            ) : (
                                <Text style={styles.addBtnText}>Block</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* List */}
                    <FlatList 
                        data={blockedUsers}
                        keyExtractor={item => item.id}
                        contentContainerStyle={{ paddingBottom: 20 }}
                        ListEmptyComponent={
                            <View style={styles.emptyState}>
                                <Ionicons name="people-outline" size={40} color={Colors.textSecondary} />
                                <Text style={styles.emptyText}>No blocked users found.</Text>
                            </View>
                        }
                        renderItem={({ item }) => (
                            <View style={styles.blockedUserRow}>
                                <View>
                                    <Text style={styles.blockedName}>{item.name}</Text>
                                    <Text style={styles.blockedDate}>Blocked on {item.date}</Text>
                                </View>
                                <TouchableOpacity 
                                    style={styles.unblockBtn} 
                                    onPress={() => handleUnblock(item)}
                                >
                                    <Text style={styles.unblockText}>Unblock</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    />
                </View>
            </View>
        </Modal>
    );

    return (
        <LinearGradient colors={[Colors.background, '#1a1a2e']} style={styles.container}>
            <StatusBar barStyle="light-content" />
            
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Privacy</Text>
                <View style={styles.headerButton} />
            </View>

            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    <View style={styles.introHeader}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="shield-checkmark-outline" size={40} color={Colors.secondary} />
                        </View>
                        <Text style={styles.introTitle}>Your Privacy Matters</Text>
                        <Text style={styles.introSubtitle}>Manage how your data is used and control your account's security.</Text>
                    </View>

                    <Text style={styles.sectionTitle}>Security</Text>
                    <View style={styles.card}>
                        <SettingsRow 
                            icon="lock-closed-outline" 
                            label="Two-Factor Authentication" 
                            details={settings.twoFactor ? "On" : "Off"} 
                            onPress={handleTwoFactor} 
                        />
                        <SettingsRow 
                            icon="keypad-outline" 
                            label="Manage Sessions" 
                            details={`${settings.sessions} Active`} 
                            onPress={handleManageSessions} 
                            isLast 
                        />
                    </View>

                    <Text style={styles.sectionTitle}>Community</Text>
                    <View style={styles.card}>
                        <SettingsRow 
                            icon="people-circle-outline" 
                            label="Blocked Users" 
                            details={`${blockedUsers.length}`} 
                            onPress={handleOpenBlocked} 
                            isLast 
                        />
                    </View>
                </ScrollView>
            )}

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
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    
    introHeader: { alignItems: 'center', marginBottom: 20 },
    iconContainer: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.surface, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
    introTitle: { fontFamily: 'Poppins_700Bold', color: Colors.text, fontSize: 24, textAlign: 'center' },
    introSubtitle: { fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, fontSize: 16, textAlign: 'center', marginTop: 10, maxWidth: '90%' },
    
    sectionTitle: { fontFamily: 'Poppins_600SemiBold', color: Colors.textSecondary, fontSize: 14, textTransform: 'uppercase', marginBottom: -10, marginLeft: 5 },
    card: { borderRadius: 16, overflow: 'hidden', backgroundColor: 'rgba(28,28,30,0.5)', borderWidth: StyleSheet.hairlineWidth, borderColor: Colors.surface + '80' },
    
    row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, paddingHorizontal: 15 },
    rowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(255,255,255,0.1)' },
    rowTextContainer: { flex: 1 },
    rowLabel: { fontFamily: 'Poppins_500Medium', fontSize: 16 },
    rowDetails: { fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, fontSize: 14, marginRight: 8 },

    // Modal Styles
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', paddingHorizontal: 20 },
    modalContent: { backgroundColor: '#1E1E1E', borderRadius: 20, flex: 1, padding: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 20, fontFamily: 'Poppins_700Bold', color: Colors.text },
    closeBtn: { padding: 5, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 20 },
    
    addBlockContainer: { flexDirection: 'row', gap: 10, marginBottom: 20 },
    input: { flex: 1, fontSize: 12, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, paddingHorizontal: 15, paddingVertical: 12, color: Colors.text, fontFamily: 'Poppins_400Regular' },
    addBtn: { backgroundColor: Colors.primary || '#6200EE', borderRadius: 12, paddingHorizontal: 20, justifyContent: 'center', alignItems: 'center' },
    addBtnText: { color: '#FFF', fontFamily: 'Poppins_600SemiBold' },

    blockedUserRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
    blockedName: { color: Colors.text, fontSize: 16, fontFamily: 'Poppins_500Medium' },
    blockedDate: { color: Colors.textSecondary, fontSize: 12 },
    unblockBtn: { backgroundColor: 'rgba(255,68,68,0.1)', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255,68,68,0.3)' },
    unblockText: { color: '#FF4444', fontSize: 12, fontFamily: 'Poppins_600SemiBold' },
    
    emptyState: { alignItems: 'center', marginTop: 50, opacity: 0.5 },
    emptyText: { color: Colors.textSecondary, marginTop: 10, fontFamily: 'Poppins_400Regular' }
});

export default PrivacyScreen;