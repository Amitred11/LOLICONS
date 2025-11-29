// screens/profile/AccountScreen.js

// Import necessary modules from React and React Native.
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, ScrollView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@config/Colors';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { userData } from '@config/mockData';

/**
 * A reusable row component for displaying account information.
 * @param {object} props - The component props.
 * @param {string} props.icon - The name of the Ionicons icon.
 * @param {string} props.label - The main label for the row.
 * @param {string} [props.value] - A value to display on the right side.
 * @param {string} [props.subtitle] - A smaller subtitle below the main label.
 * @param {function} [props.onPress] - Function to execute on press. A chevron is shown if this is provided.
 * @param {boolean} [props.isLast] - If true, removes the bottom border.
 * @param {string} [props.color] - Custom color for the label text.
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
 * Shows a "Connected" status or a "Connect" button.
 */
const ConnectedAccountRow = ({ icon, name, isConnected, onConnect, isLast }) => (
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
            <TouchableOpacity style={styles.connectButton} onPress={onConnect}>
                <Text style={styles.connectButtonText}>Connect</Text>
            </TouchableOpacity>
        )}
    </View>
);

/**
 * The main screen for managing user account details.
 */
const AccountScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    // State to manage the connection status of social accounts (for demonstration).
    const [connectedAccounts, setConnectedAccounts] = useState({
        google: { name: 'Google', icon: 'logo-google', isConnected: true },
        apple: { name: 'Github', icon: 'logo-github', isConnected: true },
        facebook: { name: 'Facebook', icon: 'logo-facebook', isConnected: false },
    });
    const [isConnecting, setIsConnecting] = useState(null); // To prevent multiple connect clicks.

    // Simulates an API call to connect a social account.
    const handleConnect = (key) => {
        setIsConnecting(key);
        setTimeout(() => {
            setConnectedAccounts(prev => ({
                ...prev,
                [key]: { ...prev[key], isConnected: true }
            }));
            setIsConnecting(null);
        }, 1500);
    };

    // Shows a confirmation alert before performing the delete action.
    const handleDelete = () => {
        Alert.alert( "Delete Account", "Are you sure? This action is permanent and will erase all your data.",
            [ { text: "Cancel", style: "cancel" }, { text: "Delete", style: "destructive", onPress: () => console.log("Account Deleted") } ]
        );
    };

    return (
        <LinearGradient colors={[Colors.background, '#1a1a2e']} style={styles.container}>
            <StatusBar barStyle="light-content" />
            {/* Screen Header */}
            <View style={[styles.header, { paddingTop: insets.top }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}><Ionicons name="arrow-back" size={24} color={Colors.text} /></TouchableOpacity>
                <Text style={styles.headerTitle}>Account</Text>
                <View style={styles.headerButton} />{/* Placeholder for alignment */}
            </View>

            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {/* Profile Details Section */}
                <Text style={styles.sectionTitle}>Profile Details</Text>
                <View style={styles.card}>
                    <AccountRow icon="person-outline" label={userData.name} subtitle={userData.handle ? `@${userData.handle}` : ''} />
                    <AccountRow icon="id-card-outline" label="User ID" value={userData.id ? userData.id.substring(0, 12) + '...' : 'N/A'} />
                    <AccountRow icon="calendar-outline" label="Join Date" value="Jan 20, 2024" isLast />
                </View>

                {/* Login Credentials Section */}
                <Text style={styles.sectionTitle}>Login Credentials</Text>
                <View style={styles.card}>
                    <AccountRow icon="mail-outline" label="Email Address" value={userData.email ? userData.email.substring(0, 10) + '...': 'N/A'} onPress={() => Alert.alert("Change Email", "Navigate to change email screen.")} />
                    <AccountRow icon="lock-closed-outline" label="Password" value="Change" onPress={() => Alert.alert("Change Password", "Navigate to change password screen.")} isLast />
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
                            onConnect={() => isConnecting ? null : handleConnect(key)}
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
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15, paddingBottom: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: Colors.surface + '80' },
    headerTitle: { fontFamily: 'Poppins_600SemiBold', color: Colors.text, fontSize: 18 },
    headerButton: { padding: 10, minWidth: 40, alignItems: 'center' },
    scrollContainer: { padding: 20, gap: 15 },
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