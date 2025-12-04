// screens/profile/AccountScreen.js

import React, { useState, useEffect } from 'react';
import { 
    View, Text, StyleSheet, TouchableOpacity, StatusBar, 
    ScrollView, ActivityIndicator 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@config/Colors';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAlert } from '@context/AlertContext'; 

// --- ADDED: Import the API Service ---
import { ProfileAPI } from '@api/MockProfileService';

/**
 * A reusable row component for displaying account information.
 */
const AccountRow = ({ icon, label, value, subtitle, onPress, isLast, color = Colors.text }) => (
    <TouchableOpacity onPress={onPress} style={[styles.row, !isLast && styles.rowBorder]} disabled={!onPress}>
        <View style={styles.rowLeft}>
            <Ionicons name={icon} size={22} color={color === Colors.text ? Colors.textSecondary : color} />
            <View>
                <Text style={[styles.rowLabel, { color }]}>{label}</Text>
                {subtitle && <Text style={styles.rowSubtitle}>{subtitle}</Text>}
            </View>
        </View>
        <View style={styles.rowRight}>
            <Text style={styles.rowValue}>{value}</Text>
            {onPress && <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />}
        </View>
    </TouchableOpacity>
);

/**
 * A reusable row component specifically for displaying connected social accounts.
 */
const ConnectedAccountRow = ({ icon, name, isConnected, onConnect, isLast, isLoading }) => (
     <View style={[styles.row, !isLast && styles.rowBorder]}>
        <View style={styles.rowLeft}>
            <Ionicons name={icon} size={22} color={Colors.textSecondary} />
            <Text style={styles.rowLabel}>{name}</Text>
        </View>
        {isConnected ? (
            <View style={styles.connectedContainer}>
                <Ionicons name="checkmark-circle" size={20} color={'#2ecc71'} />
                <Text style={styles.connectedText}>Connected</Text>
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

/**
 * The main screen for managing user account details.
 */
const AccountScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { showAlert } = useAlert();

    // State for loading initial data
    const [isLoading, setIsLoading] = useState(true);
    
    // State for user profile data (Initialized as empty/null)
    const [profile, setProfile] = useState({
        name: '',
        handle: '',
        id: '',
        joinDate: '',
        email: ''
    });

    // State to manage the connection status of social accounts.
    const [connectedAccounts, setConnectedAccounts] = useState({
        google: { name: 'Google', icon: 'logo-google', isConnected: false },
        github: { name: 'Github', icon: 'logo-github', isConnected: false }, 
        facebook: { name: 'Facebook', icon: 'logo-facebook', isConnected: false },
    });

    const [connectingProvider, setConnectingProvider] = useState(null); 

    // Fetch account data on mount
    useEffect(() => {
        fetchAccountData();
    }, []);

    const fetchAccountData = async () => {
        setIsLoading(true);
        try {
            // --- UPDATED: Use ProfileAPI ---
            const response = await ProfileAPI.getAccountDetails();
            
            if (response.success) {
                const data = response.data;
                setProfile({
                    name: data.name,
                    handle: data.handle,
                    id: data.id,
                    joinDate: data.joinDate,
                    email: data.email
                });
                
                // Update social states based on backend response
                setConnectedAccounts(prev => ({
                    google: { ...prev.google, isConnected: data.connected.google },
                    github: { ...prev.github, isConnected: data.connected.github },
                    facebook: { ...prev.facebook, isConnected: data.connected.facebook },
                }));
            }
        } catch (error) {
            console.error(error);
            showAlert({ title: "Error", message: "Failed to load account details.", type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleConnect = (key) => {
        showAlert({
            title: `Connect ${connectedAccounts[key].name}`,
            message: `You are about to connect your ${connectedAccounts[key].name} account. Continue?`,
            btnText: "Connect",
            secondaryBtnText: "Cancel",
            onClose: async () => {
                setConnectingProvider(key);
                try {
                    // --- UPDATED: Use ProfileAPI ---
                    const response = await ProfileAPI.connectSocialAccount(key);
                    
                    if (response.success) {
                        setConnectedAccounts(prev => ({
                            ...prev,
                            [key]: { ...prev[key], isConnected: true }
                        }));
                        showAlert({ title: "Success", message: `${connectedAccounts[key].name} connected successfully!`, type: 'success' });
                    }
                } catch (error) {
                    showAlert({ title: "Error", message: "Connection failed.", type: 'error' });
                } finally {
                    setConnectingProvider(null);
                }
            }
        });
    };

    const handleChangeEmail = () => {
        showAlert({
            title: "Update Email",
            message: "To update your email, we will send a verification link to your current address.",
            btnText: "Send Link",
            secondaryBtnText: "Cancel",
            onClose: () => {
                showAlert({ title: "Sent", message: "Check your inbox for instructions.", type: 'success' });
            }
        });
    };

    const handleChangePassword = () => {
        navigation.navigate('ChangePassword');
    };

    const handleDelete = () => {
        showAlert({
            title: "Delete Account",
            message: "Are you sure? This action is permanent and will erase all your data.",
            type: 'error',
            btnText: "Delete Forever",
            secondaryBtnText: "Cancel",
            onClose: async () => {
                try {
                    // --- UPDATED: Use ProfileAPI ---
                    await ProfileAPI.deleteAccount();
                    // Navigate to Auth stack or Login screen
                    console.log("Account Deleted");
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

            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    {/* Profile Details Section */}
                    <Text style={styles.sectionTitle}>Profile Details</Text>
                    <View style={styles.card}>
                        <AccountRow icon="person-outline" label={profile.name || "Unknown"} subtitle={profile.handle ? `@${profile.handle}` : ''} />
                        <AccountRow icon="id-card-outline" label="User ID" value={profile.id ? profile.id.substring(0, 12) + '...' : 'N/A'} />
                        <AccountRow icon="calendar-outline" label="Join Date" value={profile.joinDate} isLast />
                    </View>

                    {/* Login Credentials Section */}
                    <Text style={styles.sectionTitle}>Login Credentials</Text>
                    <View style={styles.card}>
                        <AccountRow 
                            icon="mail-outline" 
                            label="Email Address" 
                            value={profile.email && profile.email.length > 3 ? profile.email.replace(/(.{2})(.*)(@.*)/, "$1***$3").substring(0, 7) + '...' : 'N/A'} 
                            onPress={handleChangeEmail} 
                        />
                        <AccountRow 
                            icon="lock-closed-outline" 
                            label="Password" 
                            value="Change" 
                            onPress={handleChangePassword} 
                            isLast 
                        />
                    </View>

                    {/* Connected Accounts Section */}
                    <Text style={styles.sectionTitle}>Connected Accounts</Text>
                    <View style={styles.card}>
                        {Object.keys(connectedAccounts).map((key, index, arr) => (
                            <ConnectedAccountRow 
                                key={key}
                                name={connectedAccounts[key].name}
                                icon={connectedAccounts[key].icon}
                                isConnected={connectedAccounts[key].isConnected}
                                isLoading={connectingProvider === key}
                                onConnect={() => connectingProvider ? null : handleConnect(key)}
                                isLast={index === arr.length - 1}
                            />
                        ))}
                    </View>

                    {/* Danger Zone Section */}
                    <Text style={styles.sectionTitle}>Danger Zone</Text>
                    <View style={styles.card}>
                        <AccountRow icon="trash-outline" label="Delete Account" value="" onPress={handleDelete} isLast color={Colors.danger}/>
                    </View>
                </ScrollView>
            )}
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15, paddingBottom: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: Colors.surface + '80' },
    headerTitle: { fontFamily: 'Poppins_600SemiBold', color: Colors.text, fontSize: 18 },
    headerButton: { padding: 10, minWidth: 40, alignItems: 'center' },
    
    scrollContainer: { padding: 20, gap: 15 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    
    sectionTitle: { fontFamily: 'Poppins_600SemiBold', color: Colors.textSecondary, fontSize: 14, textTransform: 'uppercase', marginBottom: 5, marginLeft: 5 },
    card: { borderRadius: 16, overflow: 'hidden', borderWidth: StyleSheet.hairlineWidth, borderColor: Colors.surface + '80', backgroundColor: 'rgba(28,28,30,0.5)' },
    
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15 },
    rowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(255,255,255,0.1)' },
    rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 15 },
    rowRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    rowLabel: { fontFamily: 'Poppins_500Medium', color: Colors.text, fontSize: 16 },
    rowSubtitle: { fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, fontSize: 13, marginTop: 2 },
    rowValue: { fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, fontSize: 14 },
    
    connectedContainer: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    connectedText: { fontFamily: 'Poppins_500Medium', color: '#2ecc71', fontSize: 14 },
    connectButton: { backgroundColor: Colors.secondary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
    connectButtonText: { fontFamily: 'Poppins_600SemiBold', color: Colors.background, fontSize: 14 },
});

export default AccountScreen;