import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, ScrollView, Dimensions, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@config/Colors';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur'; 
import * as Clipboard from 'expo-clipboard'; // FIXED: Use expo-clipboard instead of react-native
import * as Haptics from 'expo-haptics';
import { useAlert } from '@context/other/AlertContext'; 
import { useProfile } from '@context/main/ProfileContext';

// Components
import { AccountRow, ConnectedAccountRow } from '../../components/settings/AccountComponents';
import Svg, { Path, Circle } from 'react-native-svg';
import RankInfoModal from '../../components/modals/RankInfoModal'; // FIXED: Usually a default import

const { width } = Dimensions.get('window');

// --- SUB-COMPONENTS ---

const CircularProgress = ({ size, strokeWidth, progress, color, children }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (progress || 0) * circumference;

    return (
        <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
            <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }], position: 'absolute' }}>
                <Circle cx={size / 2} cy={size / 2} r={radius} stroke="rgba(255,255,255,0.05)" strokeWidth={strokeWidth} fill="transparent" />
                <Circle 
                    cx={size / 2} cy={size / 2} r={radius} stroke={color} strokeWidth={strokeWidth} 
                    fill="transparent" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" 
                />
            </Svg>
            {children}
        </View>
    );
};

const ActivityChart = ({ color }) => {
    const points = "0,40 15,35 30,45 45,20 60,35 75,10 90,30 105,25 120,40 135,35 150,45 165,30 180,40 200,35";
    return (
        <View style={styles.chartContainer}>
            <View style={styles.chartHeader}>
                <Text style={styles.chartTitle}>Reading Pulse</Text>
                <Text style={styles.chartSub}>Weekly Activity</Text>
            </View>
            <Svg height="60" width={width - 80} viewBox="0 0 200 50">
                <Path d={`M ${points} L 200,50 L 0,50 Z`} fill={`${color}20`} />
                <Path d={`M ${points}`} fill="none" stroke={color} strokeWidth="2" />
            </Svg>
        </View>
    );
};

const StatCard = ({ icon, value, label, color }) => (
    <View style={styles.glassStatCard}>
        <View style={[styles.statIconWrapper, { backgroundColor: `${color}15` }]}>
            <MaterialCommunityIcons name={icon} size={22} color={color} />
        </View>
        <View>
            <Text style={styles.statCardValue}>{value}</Text>
            <Text style={styles.statCardLabel}>{label}</Text>
        </View>
    </View>
);

const AccountScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { showAlert, showToast } = useAlert();
    const { profile, connectSocial, deleteAccount, getRankProgress } = useProfile();
    
    const [connectingProvider, setConnectingProvider] = useState(null); 
    const [isRankModalVisible, setIsRankModalVisible] = useState(false); 
    
    const stats = profile?.extendedStats || { 
        reading: { comics: 0, chapters: 0, novels: 0, timeSpent: '0h' }, 
        entertainment: { movies: 0, kdrama: 0, anime: 0, series: 0 }, 
        community: { eventsJoined: 0, comments: 0, likesReceived: 0 } 
    };
    
    const connected = profile?.settings?.connectedAccounts || {};
    const progress = getRankProgress() || 0; 
    const currentRank = profile?.currentRank || { name: 'Mortal', color: '#A0A0A0' }; 
    const rankColor = currentRank.color;

    const handleCopyId = async () => {
        await Clipboard.setStringAsync(profile?.id || ''); // FIXED: setStringAsync
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        showToast("User ID copied to clipboard.", 'success' );
    };

    const handleConnect = (key, name) => {
        showAlert({
            title: `Connect ${name}`,
            message: `Do you want to link your ${name} account?`,
            btnText: "Link",
            secondaryBtnText: "Cancel",
            onClose: async () => {
                setConnectingProvider(key);
                try {
                    await connectSocial(key);
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    showToast(`${name} linked!`, 'success' );
                } catch (error) { 
                    showToast("Connection failed.", 'error' ); 
                } finally { 
                    setConnectingProvider(null); 
                }
            }
        });
    };

    const handleDelete = () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        showAlert({
            title: "Delete Account",
            message: "Permanent action. All data will be lost.",
            type: 'error',
            btnText: "Delete Forever",
            secondaryBtnText: "Cancel",
            onClose: async () => {
                try { await deleteAccount(); } catch (err) { showToast("Failed to delete.",'error' ); }
            }
        });
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient colors={['#1A1A2E', '#121225']} style={StyleSheet.absoluteFill} />

            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconCircle}>
                    <Ionicons name="chevron-back" size={22} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Account</Text>
                <TouchableOpacity onPress={() => navigation.navigate('EditProfile')} style={styles.iconCircle}>
                    <Ionicons name="options-outline" size={22} color={Colors.text} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                
                <View style={styles.heroSection}>
                    <CircularProgress size={120} strokeWidth={6} progress={progress} color={rankColor}>
                        <View style={styles.avatarContainer}>
                            {profile?.avatarUrl ? (
                                <Image source={{ uri: profile.avatarUrl }} style={styles.avatarImage} />
                            ) : (
                                <Ionicons name="person" size={40} color={Colors.textSecondary} />
                            )}
                        </View>
                    </CircularProgress>
                    
                    <View style={styles.heroInfo}>
                        <Text style={styles.profileName}>{profile?.name}</Text>
                        <Text style={styles.profileHandle}>@{profile?.handle}</Text>
                        
                        <TouchableOpacity style={styles.rankRealm} onPress={() => setIsRankModalVisible(true)}>
                            <View style={styles.crestContainer}>
                                <BlurView intensity={40} tint="dark" style={[styles.crestBlur, { borderColor: rankColor }]}>
                                    <Text style={[styles.crestText, { color: rankColor }]}>{currentRank.name} {currentRank.title}</Text>
                                </BlurView>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.glassCard}>
                    <ActivityChart color={rankColor} />
                    <View style={styles.xpRow}>
                        <View>
                            <Text style={styles.xpLabel}>CURRENT XP</Text>
                            <Text style={styles.xpValue}>{profile?.xp?.toLocaleString()}</Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                            <Text style={styles.xpLabel}>NEXT RANK</Text>
                            <Text style={styles.xpValue}>{profile?.nextRank?.minXp?.toLocaleString()}</Text>
                        </View>
                    </View>
                </View>

                <Text style={styles.sectionLabel}>Overview</Text>
                <View style={styles.statsGrid}>
                    <StatCard icon="book-open-page-variant" value={stats.reading.chapters} label="Chapters" color="#3498db" />
                    <StatCard icon="timer-outline" value={stats.reading.timeSpent} label="Time" color="#e67e22" />
                    <StatCard icon="television-play" value={stats.entertainment.anime} label="Anime" color="#1abc9c" />
                    <StatCard icon="heart-pulse" value={stats.community.likesReceived} label="Karma" color="#e74c3c" />
                </View>

                <Text style={styles.sectionLabel}>Account Settings</Text>
                <View style={styles.settingsCard}>
                    <AccountRow icon="finger-print-outline" label="Identity" value={profile?.id?.substring(0, 8).toUpperCase()} onPress={handleCopyId} copyable />
                    <AccountRow icon="mail-outline" label="Email" value={profile?.email ? profile.email.split('@')[0].substring(0,3) + '...@' + profile.email.split('@')[1] : 'N/A'} onPress={() => {}} />
                    <AccountRow icon="shield-checkmark-outline" label="Security" value="Secure" onPress={() => navigation.navigate('ChangePassword')} isLast />
                </View>

                <Text style={styles.sectionLabel}>Social Links</Text>
                <View style={styles.settingsCard}>
                    <ConnectedAccountRow icon="logo-google" name="Google" isConnected={connected.google} isLoading={connectingProvider === 'google'} onConnect={() => handleConnect('google', 'Google')} />
                    <ConnectedAccountRow icon="logo-github" name="Github" isConnected={connected.github} isLoading={connectingProvider === 'github'} onConnect={() => handleConnect('github', 'Github')} />
                    <ConnectedAccountRow icon="logo-facebook" name="Facebook" isConnected={connected.facebook} isLoading={connectingProvider === 'facebook'} onConnect={() => handleConnect('facebook', 'Facebook')} isLast />
                </View>

                <TouchableOpacity onPress={handleDelete} style={styles.dangerButton}>
                    <Ionicons name="trash-outline" size={18} color={Colors.danger} />
                    <Text style={styles.dangerButtonText}>Deactivate Account</Text>
                </TouchableOpacity>

                <Text style={styles.versionText}>LOLICONS v1.5.0 • Build 2024.12</Text>
            </ScrollView>

            <RankInfoModal 
                isVisible={isRankModalVisible} 
                onClose={() => setIsRankModalVisible(false)} 
                rank={currentRank} 
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#1A1A2E' },
    scrollContainer: { paddingHorizontal: 20, paddingBottom: 60 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 20 },
    headerTitle: { fontFamily: 'Poppins_600SemiBold', color: Colors.text, fontSize: 18, letterSpacing: 0.5 },
    iconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    heroSection: { alignItems: 'center', marginVertical: 10, flexDirection: 'row', gap: 20, paddingHorizontal: 10 },
    avatarContainer: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#252545', overflow: 'hidden', justifyContent: 'center', alignItems: 'center', borderWidth: 4, borderColor: '#1A1A2E' },
    avatarImage: { width: '100%', height: '100%' },
    heroInfo: { flex: 1 },
    profileName: { fontFamily: 'Poppins_700Bold', color: Colors.text, fontSize: 24 },
    profileHandle: { fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, fontSize: 14, marginTop: -2 },
    rankRealm: { marginTop: 8, alignSelf: 'flex-start' },
    crestContainer: { borderRadius: 12, overflow: 'hidden' },
    crestBlur: { paddingHorizontal: 12, paddingVertical: 4, borderWidth: 1, borderRadius: 12 },
    crestText: { fontFamily: 'Poppins_600SemiBold', fontSize: 12, textTransform: 'uppercase' },
    glassCard: { backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', marginBottom: 25 },
    chartContainer: { marginBottom: 15 },
    chartHeader: { marginBottom: 10 },
    chartTitle: { fontFamily: 'Poppins_600SemiBold', color: Colors.text, fontSize: 14 },
    chartSub: { fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, fontSize: 11 },
    xpRow: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)', paddingTop: 15 },
    xpLabel: { fontFamily: 'Poppins_600SemiBold', color: Colors.textSecondary, fontSize: 9, letterSpacing: 1 },
    xpValue: { fontFamily: 'Poppins_700Bold', color: Colors.text, fontSize: 16 },
    sectionLabel: { fontFamily: 'Poppins_600SemiBold', color: Colors.textSecondary, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 15, marginLeft: 5 },
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 25 },
    glassStatCard: { width: (width - 52) / 2, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 20, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    statIconWrapper: { width: 42, height: 42, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    statCardValue: { fontFamily: 'Poppins_700Bold', color: Colors.text, fontSize: 16 },
    statCardLabel: { fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, fontSize: 11 },
    settingsCard: { backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', marginBottom: 25 },
    dangerButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: `${Colors.danger}30`, backgroundColor: `${Colors.danger}10`, marginTop: 10 },
    dangerButtonText: { fontFamily: 'Poppins_600SemiBold', color: Colors.danger, fontSize: 14 },
    versionText: { textAlign: 'center', color: Colors.textSecondary, fontSize: 10, opacity: 0.3, marginTop: 30 }
});

export default AccountScreen;