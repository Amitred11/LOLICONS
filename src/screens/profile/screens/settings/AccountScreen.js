import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, ScrollView, Clipboard, Dimensions, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@config/Colors';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAlert } from '@context/other/AlertContext'; 
import { useProfile } from '@context/main/ProfileContext';
import * as Haptics from 'expo-haptics';
import { AccountRow, ConnectedAccountRow } from '../../components/settings/AccountComponents';

const { width } = Dimensions.get('window');

const StatBox = ({ icon, value, label, color }) => (
    <View style={styles.statBox}>
        <View style={[styles.statIconContainer, { backgroundColor: `${color}20` }]}>
            <MaterialCommunityIcons name={icon} size={20} color={color} />
        </View>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
    </View>
);

const SectionHeader = ({ title, icon }) => (
    <View style={styles.sectionHeaderContainer}>
        <Ionicons name={icon} size={16} color={Colors.primary} />
        <Text style={styles.sectionTitle}>{title}</Text>
    </View>
);

const AccountScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { showAlert, showToast } = useAlert();
    const { profile, connectSocial, deleteAccount, getRankProgress } = useProfile();
    const [connectingProvider, setConnectingProvider] = useState(null); 
    
    // Fallback data if profile hasn't loaded fully or new schema isn't present
    const stats = profile?.extendedStats || { 
        reading: { comics: 0, chapters: 0, novels: 0, timeSpent: '0h' }, 
        entertainment: { movies: 0, kdrama: 0, anime: 0, series: 0 }, 
        community: { eventsJoined: 0, comments: 0, likesReceived: 0 } 
    };
    
    const connected = profile?.settings?.connectedAccounts || {};

    const handleCopyId = () => {
        Clipboard.setString(profile?.id || '');
        Haptics?.notificationAsync(Haptics.NotificationFeedbackType.Success);
        showToast("User ID copied to clipboard.", 'success' );
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
                    showToast(`${name} account linked successfully!`, 'success' );
                } catch (error) {
                    showToast( "Connection failed.", 'error' );
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
                try { await deleteAccount(); } catch (err) { showToast("Failed to delete account.",'error' ); }
            }
        });
    };

    // Calculate Rank Progress
    const progress = getRankProgress(); 
    const rankColor = profile?.currentRank?.color || Colors.primary;

    return (
        <LinearGradient colors={[Colors.background, '#121225']} style={styles.container}>
            <StatusBar barStyle="light-content" />
            
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Profile & Stats</Text>
                <TouchableOpacity onPress={() => navigation.navigate('EditProfile')} style={styles.editButton}>
                    <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                
                {/* 1. Main Profile Card */}
                <View style={styles.profileCard}>
                    <View style={styles.profileHeader}>
                        <LinearGradient colors={[rankColor, '#2c3e50']} style={styles.avatarBorder}>
                            <View style={styles.avatarContainer}>
                                {profile?.avatarUrl ? (
                                    <Image source={{ uri: profile.avatarUrl }} style={styles.avatarImage} />
                                ) : (
                                    <View style={styles.avatarPlaceholder}>
                                        <Ionicons name="person" size={30} color={Colors.textSecondary} />
                                    </View>
                                )}
                            </View>
                        </LinearGradient>
                        <View style={styles.profileInfo}>
                            <Text style={styles.profileName}>{profile?.name}</Text>
                            <Text style={styles.profileHandle}>@{profile?.handle}</Text>
                            <View style={styles.rankBadge}>
                                <Text style={[styles.rankText, { color: rankColor }]}>{profile?.currentRank?.name || 'Mortal'} Rank</Text>
                            </View>
                        </View>
                    </View>

                    {/* XP Progress */}
                    <View style={styles.progressSection}>
                        <View style={styles.progressLabels}>
                            <Text style={styles.xpText}>XP: {profile?.xp?.toLocaleString()}</Text>
                            <Text style={styles.xpText}>Next: {profile?.nextRank?.minXp?.toLocaleString()}</Text>
                        </View>
                        <View style={styles.progressBarBg}>
                            <LinearGradient 
                                colors={[rankColor, Colors.secondary]} 
                                start={{x:0, y:0}} end={{x:1, y:0}}
                                style={[styles.progressBarFill, { width: `${progress * 100}%` }]} 
                            />
                        </View>
                    </View>
                </View>

                {/* 2. Reading Statistics */}
                <SectionHeader title="Reading Journey" icon="book-outline" />
                <View style={styles.statsGrid}>
                    <StatBox icon="book-open-page-variant" value={stats.reading.comics} label="Comics" color="#3498db" />
                    <StatBox icon="layers-outline" value={stats.reading.chapters} label="Chapters" color="#9b59b6" />
                    <StatBox icon="clock-outline" value={stats.reading.timeSpent} label="Time Read" color="#e67e22" />
                    <StatBox icon="bookmark-check-outline" value={stats.reading.novels} label="Novels" color="#2ecc71" />
                </View>

                {/* 3. Entertainment Statistics */}
                <SectionHeader title="Watch History" icon="videocam-outline" />
                <View style={styles.statsGrid}>
                    <StatBox icon="movie-open-outline" value={stats.entertainment.movies} label="Movies" color="#e74c3c" />
                    <StatBox icon="television-classic" value={stats.entertainment.kdrama} label="KDrama" color="#f1c40f" />
                    <StatBox icon="animation-play-outline" value={stats.entertainment.anime} label="Anime" color="#1abc9c" />
                    <StatBox icon="ticket-confirmation-outline" value={stats.community.eventsJoined} label="Events" color="#ecf0f1" />
                </View>

                {/* 4. Account Settings */}
                <SectionHeader title="Account Details" icon="settings-outline" />
                <View style={styles.card}>
                    <AccountRow icon="finger-print-outline" label="User ID" value={profile?.id?.substring(0, 12) + "..."} onPress={handleCopyId} copyable />
                    <AccountRow icon="mail-outline" label="Email" value={profile?.email ? profile.email.replace(/(.{2})(.*)(@.*)/, "$1***$3") : 'N/A'} onPress={() => {}} />
                    <AccountRow icon="location-outline" label="Location" value={profile?.location || "Not Set"} onPress={() => {}} />
                    <AccountRow icon="key-outline" label="Password" value="Update" onPress={() => navigation.navigate('ChangePassword')} isLast />
                </View>

                {/* 5. Connections */}
                <SectionHeader title="Social Connections" icon="share-social-outline" />
                <View style={styles.card}>
                    <ConnectedAccountRow icon="logo-google" name="Google" isConnected={connected.google} isLoading={connectingProvider === 'google'} onConnect={() => handleConnect('google', 'Google')} />
                    <ConnectedAccountRow icon="logo-github" name="Github" isConnected={connected.github} isLoading={connectingProvider === 'github'} onConnect={() => handleConnect('github', 'Github')} />
                    <ConnectedAccountRow icon="logo-facebook" name="Facebook" isConnected={connected.facebook} isLoading={connectingProvider === 'facebook'} onConnect={() => handleConnect('facebook', 'Facebook')} isLast />
                </View>

                {/* 6. Danger Zone */}
                <View style={[styles.card, { borderColor: 'rgba(231, 76, 60, 0.3)', marginTop: 20 }]}>
                    <AccountRow icon="trash-outline" label="Delete Account" value="" onPress={handleDelete} isLast color={Colors.danger}/>
                </View>

                <Text style={styles.versionText}>v1.5.0 • Build 2024.12</Text>
            </ScrollView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15, paddingBottom: 10, borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    headerTitle: { fontFamily: 'Poppins_600SemiBold', color: Colors.text, fontSize: 17 },
    headerButton: { padding: 10 },
    editButton: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 20 },
    editButtonText: { fontFamily: 'Poppins_500Medium', color: Colors.text, fontSize: 12 },
    
    scrollContainer: { padding: 20, paddingBottom: 50 },
    
    // Profile Card
    profileCard: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 20, padding: 20, marginBottom: 25, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    profileHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    avatarBorder: { width: 84, height: 84, borderRadius: 42, padding: 3, justifyContent: 'center', alignItems: 'center' },
    avatarContainer: { width: 78, height: 78, borderRadius: 39, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
    avatarImage: { width: '100%', height: '100%' },
    avatarPlaceholder: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', backgroundColor: '#333' },
    profileInfo: { marginLeft: 15, flex: 1 },
    profileName: { fontFamily: 'Poppins_700Bold', color: Colors.text, fontSize: 20 },
    profileHandle: { fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, fontSize: 14 },
    rankBadge: { marginTop: 6, backgroundColor: 'rgba(0,0,0,0.3)', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
    rankText: { fontFamily: 'Poppins_600SemiBold', fontSize: 12 },
    
    progressSection: { marginTop: 5 },
    progressLabels: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
    xpText: { fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, fontSize: 11 },
    progressBarBg: { height: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' },
    progressBarFill: { height: '100%', borderRadius: 3 },

    // Stats Grid
    sectionHeaderContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12, marginTop: 10, marginLeft: 4 },
    sectionTitle: { fontFamily: 'Poppins_600SemiBold', color: Colors.textSecondary, fontSize: 13, textTransform: 'uppercase', letterSpacing: 1 },
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
    statBox: { width: (width - 60) / 2, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: 15, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    statIconContainer: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
    statValue: { fontFamily: 'Poppins_700Bold', color: Colors.text, fontSize: 18 },
    statLabel: { fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, fontSize: 12 },

    // General
    card: { borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)' },
    versionText: { textAlign: 'center', color: Colors.textSecondary, fontSize: 11, opacity: 0.4, marginTop: 20 }
});

export default AccountScreen;