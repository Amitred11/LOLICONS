import React, { useState } from 'react';
import { 
    View, Text, StyleSheet, TouchableOpacity, StatusBar, 
    ScrollView, ActivityIndicator, Clipboard 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@config/Colors';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAlert } from '@context/other/AlertContext'; 
import { useProfile } from '@context/main/ProfileContext';
import * as Haptics from 'expo-haptics';

// Row Component with Active Opacity control
const AccountRow = ({ icon, label, value, subtitle, onPress, isLast, color = Colors.text, copyable }) => (
    <TouchableOpacity 
        onPress={onPress} 
        style={[styles.row, !isLast && styles.rowBorder]} 
        disabled={!onPress}
        activeOpacity={onPress ? 0.6 : 1}
    >
        <View style={styles.rowLeft}>
            <View style={[styles.iconBox, { backgroundColor: color === Colors.danger ? 'rgba(231, 76, 60, 0.1)' : 'rgba(255,255,255,0.05)' }]}>
                <Ionicons name={icon} size={20} color={color === Colors.text ? Colors.textSecondary : color} />
            </View>
            <View>
                <Text style={[styles.rowLabel, { color }]}>{label}</Text>
                {subtitle && <Text style={styles.rowSubtitle}>{subtitle}</Text>}
            </View>
        </View>
        <View style={styles.rowRight}>
            <Text style={styles.rowValue}>{value}</Text>
            {copyable && <Ionicons name="copy-outline" size={16} color={Colors.textSecondary} style={{marginLeft: 8}} />}
            {onPress && !copyable && <Ionicons name="chevron-forward" size={18} color={Colors.surface} />}
        </View>
    </TouchableOpacity>
);

const ConnectedAccountRow = ({ icon, name, isConnected, onConnect, isLast, isLoading }) => (
     <View style={[styles.row, !isLast && styles.rowBorder]}>
        <View style={styles.rowLeft}>
            <Ionicons name={icon} size={24} color={Colors.textSecondary} />
            <Text style={[styles.rowLabel, { marginLeft: 10 }]}>{name}</Text>
        </View>
        {isConnected ? (
            <View style={styles.connectedContainer}>
                <Ionicons name="checkmark-circle" size={18} color={'#2ecc71'} />
                <Text style={styles.connectedText}>Linked</Text>
            </View>
        ) : (
            <TouchableOpacity 
                style={[styles.connectButton, isLoading && { opacity: 0.7 }]} 
                onPress={onConnect}
                disabled={isLoading}
            >
                {isLoading ? (
                    <ActivityIndicator size="small" color={Colors.background} />
                ) : (
                    <Text style={styles.connectButtonText}>Connect</Text>
                )}
            </TouchableOpacity>
        )}
    </View>
);

const AccountScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { showAlert } = useAlert();
    const { profile, connectSocial, deleteAccount } = useProfile();
    const [connectingProvider, setConnectingProvider] = useState(null); 

    const connected = profile?.settings?.connectedAccounts || {};

    // Functionality: Navigate to Edit
    const handleEditProfile = () => {
        navigation.navigate('EditProfile');
    };

    // Functionality: Copy ID
    const handleCopyId = () => {
        Clipboard.setString(profile?.id || '');
        Haptics?.notificationAsync(Haptics.NotificationFeedbackType.Success);
        showAlert({ title: "Copied", message: "User ID copied to clipboard.", type: 'success' });
    };

    const handleConnect = (key, name) => {
        showAlert({
            title: `Connect ${name}`,
            message: `Do you want to link your ${name} account for easier login?`,
            btnText: "Link Account",
            secondaryBtnText: "Cancel",
            onClose: async () => {
                setConnectingProvider(key);
                try {
                    await connectSocial(key);
                    Haptics?.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    showAlert({ title: "Success", message: `${name} account linked successfully!`, type: 'success' });
                } catch (error) {
                    showAlert({ title: "Error", message: "Connection failed.", type: 'error' });
                } finally {
                    setConnectingProvider(null);
                }
            }
        });
    };

    const handleDelete = () => {
        Haptics?.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        showAlert({
            title: "Delete Account",
            message: "This action is permanent and cannot be undone. All your data will be lost.",
            type: 'error',
            btnText: "Delete Forever",
            secondaryBtnText: "Cancel",
            onClose: async () => {
                try {
                    await deleteAccount();
                } catch (err) {
                    showAlert({ title: "Error", message: "Failed to delete account.", type: 'error' });
                }
            }
        });
    };

    return (
        <LinearGradient colors={[Colors.background, '#1a1a2e']} style={styles.container}>
            <StatusBar barStyle="light-content" />
            <View style={[styles.header, { paddingTop: insets.top }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}><Ionicons name="arrow-back" size={24} color={Colors.text} /></TouchableOpacity>
                <Text style={styles.headerTitle}>Account</Text>
                <View style={styles.headerButton} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                
                <Text style={styles.sectionTitle}>Identity</Text>
                <View style={styles.card}>
                    {/* CONNECTION: Clicking this now goes to EditProfile */}
                    <AccountRow 
                        icon="person-outline" 
                        label={profile?.name || "Unknown"} 
                        subtitle={profile?.handle ? `@${profile.handle}` : 'Set a username'} 
                        onPress={handleEditProfile}
                        value="Edit"
                    />
                    <AccountRow 
                        icon="finger-print-outline" 
                        label="User ID" 
                        value={profile?.id ? `${profile.id.substring(0, 8)}...` : 'N/A'} 
                        onPress={handleCopyId}
                        copyable
                    />
                    <AccountRow 
                        icon="calendar-number-outline" 
                        label="Member Since" 
                        value={profile?.joinDate || "N/A"} 
                        isLast 
                    />
                </View>

                <Text style={styles.sectionTitle}>Security</Text>
                <View style={styles.card}>
                    <AccountRow 
                        icon="mail-outline" 
                        label="Email" 
                        value={profile?.email ? profile.email.replace(/(.{2})(.*)(@.*)/, "$1***$3") : 'N/A'} 
                        onPress={() => {}} 
                    />
                    <AccountRow 
                        icon="key-outline" 
                        label="Password" 
                        value="Update" 
                        onPress={() => navigation.navigate('ChangePassword')} 
                        isLast 
                    />
                </View>

                <Text style={styles.sectionTitle}>Connections</Text>
                <View style={styles.card}>
                    <ConnectedAccountRow icon="logo-google" name="Google" isConnected={connected.google} isLoading={connectingProvider === 'google'} onConnect={() => handleConnect('google', 'Google')} />
                    <ConnectedAccountRow icon="logo-github" name="Github" isConnected={connected.github} isLoading={connectingProvider === 'github'} onConnect={() => handleConnect('github', 'Github')} />
                    <ConnectedAccountRow icon="logo-facebook" name="Facebook" isConnected={connected.facebook} isLoading={connectingProvider === 'facebook'} onConnect={() => handleConnect('facebook', 'Facebook')} isLast />
                </View>

                <Text style={styles.sectionTitle}>Danger Zone</Text>
                <View style={[styles.card, { borderColor: 'rgba(231, 76, 60, 0.3)' }]}>
                    <AccountRow icon="trash-outline" label="Delete Account" value="" onPress={handleDelete} isLast color={Colors.danger}/>
                </View>

                <Text style={styles.versionText}>Version 1.0.4 (Build 220)</Text>
            </ScrollView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15, paddingBottom: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(255,255,255,0.1)' },
    headerTitle: { fontFamily: 'Poppins_600SemiBold', color: Colors.text, fontSize: 18 },
    headerButton: { padding: 10, minWidth: 40, alignItems: 'center' },
    
    scrollContainer: { padding: 20, gap: 20, paddingBottom: 50 },
    
    sectionTitle: { fontFamily: 'Poppins_600SemiBold', color: Colors.textSecondary, fontSize: 12, textTransform: 'uppercase', marginBottom: 8, marginLeft: 8, letterSpacing: 1 },
    card: { borderRadius: 16, overflow: 'hidden', borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)' },
    
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
    rowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(255,255,255,0.05)' },
    
    rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
    iconBox: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
    
    rowRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    
    rowLabel: { fontFamily: 'Poppins_500Medium', color: Colors.text, fontSize: 15 },
    rowSubtitle: { fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, fontSize: 12, marginTop: 1 },
    rowValue: { fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, fontSize: 14 },
    
    connectedContainer: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(46, 204, 113, 0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    connectedText: { fontFamily: 'Poppins_600SemiBold', color: '#2ecc71', fontSize: 12 },
    
    connectButton: { backgroundColor: Colors.surface, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    connectButtonText: { fontFamily: 'Poppins_600SemiBold', color: Colors.text, fontSize: 12 },

    versionText: { textAlign: 'center', color: Colors.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 12, opacity: 0.5, marginTop: 10 }
});

export default AccountScreen;