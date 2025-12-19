import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Image, StatusBar, TouchableOpacity, Dimensions, ImageBackground, ActivityIndicator, ScrollView } from 'react-native';
import { Colors } from '@config/Colors';
import { useAuth } from '@context/main/AuthContext';
import { useProfile } from '@context/main/ProfileContext';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withDelay, withSpring, withTiming, useAnimatedScrollHandler, interpolate, Extrapolate, useAnimatedReaction, runOnJS } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

import RankInfoModal from '../components/modals/RankInfoModal';
import AchievementModal from '../components/modals/AchievementModal';
import LogoutModal from '../components/modals/LogoutModal';
import GlitchEffect from '../components/ui/GlitchEffect';
import EmptyState from '../components/empty/EmptyState';

// IMPORT COMPONENTS
import { BadgeItem, StatItem, FavoriteItem, HistoryItem, ProfileRow, AnimatedSection } from '../components/ui/ProfileDashboardComponents';

const { width } = Dimensions.get('window');
const HEADER_BANNER_HEIGHT = 250;
const AVATAR_SIZE = 110;

const ProfileScreen = () => {
    const { profile, isLoading, fetchProfile, getRankProgress } = useProfile();
    const { logout } = useAuth();
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();

    const [activeTab, setActiveTab] = useState(0);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedBadge, setSelectedBadge] = useState(null);
    const [isRankModalVisible, setIsRankModalVisible] = useState(false);
    const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);
    const [isHeaderInteractive, setIsHeaderInteractive] = useState(false);

    const scrollY = useSharedValue(0);
    const tabIndicatorPos = useSharedValue(0);
    const xpFill = useSharedValue(0);

    const currentRank = profile?.currentRank || { name: 'Loading', color: Colors.textSecondary, minXp: 0 };
    const nextRank = profile?.nextRank;

    useFocusEffect(useCallback(() => { fetchProfile(true); }, [fetchProfile]));

    useEffect(() => { 
        if (profile && !isLoading) {
            const progress = getRankProgress();
            xpFill.value = withDelay(500, withSpring(progress)); 
        }
    }, [profile, isLoading, getRankProgress]);

    useAnimatedReaction(
        () => scrollY.value > 150,
        (isInteractive, prev) => { if (isInteractive !== prev) runOnJS(setIsHeaderInteractive)(isInteractive); }
    );

    const scrollHandler = useAnimatedScrollHandler((event) => { scrollY.value = event.contentOffset.y; });

    const handleTabPress = useCallback((index) => { 
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); 
        setActiveTab(index); 
        const tabWidth = (width - 40 - 10) / 2; 
        tabIndicatorPos.value = withTiming(index * tabWidth + (index * 10)); 
    }, []);

    const handleSeeAll = useCallback(() => {
        if (!profile) return;
        const type = activeTab === 0 ? 'favorites' : 'history';
        const title = activeTab === 0 ? 'My Collection' : 'Reading History';
        navigation.navigate('ViewAllHF', { type, title });
    }, [activeTab, profile, navigation]);

    const animatedXpFillStyle = useAnimatedStyle(() => ({ width: `${xpFill.value * 100}%` }));
    const animatedHeaderBannerStyle = useAnimatedStyle(() => ({ transform: [{ scale: interpolate(scrollY.value, [-HEADER_BANNER_HEIGHT, 0], [1.5, 1], Extrapolate.CLAMP) }] }));
    const animatedAvatarContainerStyle = useAnimatedStyle(() => ({ transform: [{ translateY: interpolate(scrollY.value, [0, 120], [0, -60], Extrapolate.CLAMP) }], opacity: interpolate(scrollY.value, [100, 150], [1, 0], Extrapolate.CLAMP) }));
    const animatedCompactHeaderStyle = useAnimatedStyle(() => ({ opacity: interpolate(scrollY.value, [180, 210], [0, 1], Extrapolate.CLAMP) }));
    const animatedTabIndicatorStyle = useAnimatedStyle(() => ({ transform: [{ translateX: tabIndicatorPos.value }] }));

    if (isLoading || !profile) {
        return <View style={[styles.container, styles.centered]}><ActivityIndicator size="large" color={Colors.secondary} /></View>;
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            {currentRank.name === '¿¿' && <GlitchEffect />}
            
            <Animated.View pointerEvents={isHeaderInteractive ? 'auto' : 'none'} style={[styles.compactHeader, { height: insets.top + 60, paddingTop: insets.top }, animatedCompactHeaderStyle]}>
                <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
                <View style={styles.compactLeft}>
                    <View style={styles.compactAvatarWrapper}>
                        <Image source={{ uri: profile.avatarUrl }} style={styles.compactAvatar} />
                        <TouchableOpacity onPress={() => setIsRankModalVisible(true)} style={[styles.compactRankBadge, { borderColor: currentRank.color }]}>
                             <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
                             <Text style={[styles.compactRankText, { color: currentRank.color }]}>{currentRank.name}</Text>
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.compactUserName} numberOfLines={1}>{profile.name}</Text>
                </View>
                <View style={styles.compactActions}>
                    <TouchableOpacity style={styles.compactButton} onPress={() => navigation.navigate('Account')}><Ionicons name="people-outline" size={20} color={Colors.text} /></TouchableOpacity>
                    <TouchableOpacity style={styles.compactButton} onPress={() => navigation.navigate('EditProfile')}><Ionicons name="create-outline" size={20} color={Colors.text} /></TouchableOpacity>
                </View>
            </Animated.View>
            
            <Animated.ScrollView onScroll={scrollHandler} scrollEventThrottle={16} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}>
                <View style={styles.header}>
                    <Animated.View style={[styles.headerBannerWrapper, animatedHeaderBannerStyle]}>
                        <ImageBackground source={profile.favoriteComicBanner} style={styles.headerBanner} resizeMode="cover">
                            <LinearGradient colors={['transparent', 'rgba(0,0,0,0.6)', Colors.background]} locations={[0, 0.6, 1]} style={StyleSheet.absoluteFill} />
                        </ImageBackground>
                    </Animated.View>
                    <View style={styles.headerActions}>
                        <TouchableOpacity style={styles.headerButton} onPress={() => navigation.navigate('Account')}><Ionicons name="people-outline" size={22} color={Colors.text} /></TouchableOpacity>
                        <TouchableOpacity style={styles.headerButton} onPress={() => navigation.navigate('EditProfile')}><Ionicons name="create-outline" size={22} color={Colors.text} /></TouchableOpacity>
                    </View>
                    <Animated.View style={[styles.avatarContainer, animatedAvatarContainerStyle]}>
                        <View style={styles.avatarWrapper}>
                            <Image source={{ uri: profile.avatarUrl }} style={styles.avatar} />
                            <TouchableOpacity style={styles.rankRealm} onPress={() => setIsRankModalVisible(true)}>
                                <View style={styles.crestContainer}>
                                    <BlurView intensity={40} tint="dark" style={[styles.crestBlur, { borderColor: currentRank.color }]}>
                                        <Text style={[styles.crestText, { color: currentRank.color }]}>{currentRank.name}</Text>
                                    </BlurView>
                                </View>
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.userName}>{profile.name}</Text>
                        {!!profile.bio && <Text style={styles.bioText}>{profile.bio}</Text>}
                        <View style={styles.statsContainer}>{profile.stats.map(stat => <StatItem key={stat.label} {...stat} />)}</View>
                    </Animated.View>
                </View>

                <View style={styles.contentContainer}>
                    <AnimatedSection index={1}>
                        <View style={styles.rankCard}>
                            <BlurView intensity={25} tint="dark" style={styles.glassEffect} />
                            <View style={styles.xpHeader}>
                                <Text style={styles.xpLabel}>Next Rank: {nextRank?.name || 'Max'}</Text>
                                <Text style={styles.xpValue}>{`${profile.xp} / ${nextRank?.minXp || profile.xp}`}</Text>
                            </View>
                            <View style={styles.xpBarTrack}><Animated.View style={[styles.xpBarFill, animatedXpFillStyle, {backgroundColor: currentRank.color}]} /></View>
                        </View>
                    </AnimatedSection>
                    
                    <AnimatedSection index={2}>
                        <View style={styles.section}>
                            <View style={styles.tabContainer}>
                                <BlurView intensity={25} tint="dark" style={styles.glassEffect} />
                                <Animated.View style={[styles.tabIndicator, animatedTabIndicatorStyle]}/>
                                <TouchableOpacity onPress={() => handleTabPress(0)} style={styles.tabButton}>
                                    <Ionicons name="heart-outline" size={20} color={activeTab === 0 ? Colors.text : Colors.textSecondary} />
                                    <Text style={[styles.tabLabel, activeTab === 0 && styles.tabLabelActive]}>Favorites ({profile.favorites.length})</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => handleTabPress(1)} style={styles.tabButton}>
                                    <Ionicons name="time-outline" size={20} color={activeTab === 1 ? Colors.text : Colors.textSecondary} />
                                    <Text style={[styles.tabLabel, activeTab === 1 && styles.tabLabelActive]}>History ({profile.history.length})</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.subSectionHeader}>
                                <Text style={styles.subSectionTitle}>{activeTab === 0 ? 'Your Collection' : 'Recently Read'}</Text>
                                {((activeTab === 0 && profile.favorites.length > 0) || (activeTab === 1 && profile.history.length > 0)) && (
                                    <TouchableOpacity onPress={handleSeeAll}><Text style={styles.seeAllText}>See All</Text></TouchableOpacity>
                                )}
                            </View>
                            
                            {activeTab === 0 ? ( 
                                profile.favorites.length > 0 ? (
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 15 }}>
                                        {profile.favorites.slice(0, 5).map((item) => <FavoriteItem key={item.id} item={item} />)}
                                    </ScrollView>
                                ) : (
                                    <EmptyState icon="heart-outline" title="No Favorites Yet" message="Save comics to your library to see them here." actionLabel="Browse Comics" onAction={() => navigation.navigate('Comics')}/>
                                )
                            ) : ( 
                                profile.history.length > 0 ? (
                                    <View>{profile.history.slice(0, 3).map(item => <HistoryItem key={item.id} item={item}/>)}</View> 
                                ) : (
                                    <EmptyState icon="time-outline" title="No Reading History" message="Start reading to track your progress." />
                                )
                            )}
                        </View>
                    </AnimatedSection>
                    
                    <AnimatedSection index={3}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Trophy Case</Text>
                            <TouchableOpacity onPress={() => navigation.navigate('TrophyCase')}><Text style={styles.seeAllText}>See All</Text></TouchableOpacity>
                        </View>
                        {profile.badges.length > 0 ? (
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: 10 }}>
                                {profile.badges.map((item, index) => (
                                    <BadgeItem key={item.id} item={item} index={index} onPress={() => { setSelectedBadge(item); setModalVisible(true); }} />
                                ))}
                            </ScrollView>
                        ) : (
                             <EmptyState icon="trophy-outline" title="No Trophies" message="Complete achievements to earn trophies." style={{ paddingVertical: 10 }} />
                        )}
                    </AnimatedSection>

                    <AnimatedSection index={4}><Text style={[styles.sectionTitle, {marginBottom: 12}]}>Settings & Support</Text><View style={styles.glassCard}><BlurView intensity={25} tint="dark" style={styles.glassEffect} /><ProfileRow icon="notifications-outline" label="Notifications" onPress={() => navigation.navigate('NotificationSettings')} /><ProfileRow icon="server-outline" label="Data & Storage" onPress={() => navigation.navigate('DataAndStorage')} /><ProfileRow icon="shield-checkmark-outline" label="Privacy" onPress={() => navigation.navigate('Privacy')} /><ProfileRow icon="help-circle-outline" label="Help & Support" onPress={() => navigation.navigate('Help')} isLast /></View></AnimatedSection>
                    <AnimatedSection index={5}>
                        <View style={[styles.glassCard, { marginBottom: insets.bottom + 90 }]}>
                            <BlurView intensity={25} tint="dark" style={styles.glassEffect} />
                            <ProfileRow icon="log-out-outline" label="Log Out" onPress={() => setIsLogoutModalVisible(true)} color={Colors.danger} isLast />
                        </View>
                    </AnimatedSection>                
                </View>
            </Animated.ScrollView>

            <AchievementModal badge={selectedBadge} visible={modalVisible} onClose={() => setModalVisible(false)} />
            <RankInfoModal isVisible={isRankModalVisible} onClose={() => setIsRankModalVisible(false)} rank={currentRank} />
            <LogoutModal visible={isLogoutModalVisible} onClose={() => setIsLogoutModalVisible(false)} onLogout={logout} />
        </View>
    );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  centered: { justifyContent: 'center', alignItems: 'center' },
  header: { alignItems: 'center' },
  headerBannerWrapper: { width: '100%', height: HEADER_BANNER_HEIGHT, alignItems: 'center', overflow: 'hidden' },
  headerBanner: { width: '100%', height: '100%' },
  headerActions: { position: 'absolute', top: 50, right: 20, flexDirection: 'row', gap: 10, zIndex: 2 },
  headerButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
  avatarContainer: { alignItems: 'center', marginTop: -HEADER_BANNER_HEIGHT/2, zIndex: 1, width: '100%', paddingHorizontal: 20 },
  avatarWrapper: { position: 'relative', alignItems: 'center', justifyContent: 'center' },
  avatar: { width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: AVATAR_SIZE / 2, borderWidth: 4, borderColor: Colors.background, backgroundColor: Colors.surface },
  crestContainer: { position: 'absolute', bottom: -5, right: -10, zIndex: 2 },
  crestBlur: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', overflow: 'hidden', borderWidth: 2 },
  crestText: { fontFamily: 'Poppins_700Bold', fontSize: 20 },
  userName: { fontFamily: 'Poppins_700Bold', color: Colors.text, fontSize: 28, marginTop: 12 },
  bioText: { fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, fontSize: 14, textAlign: 'center', marginTop: 10, lineHeight: 20 },
  compactHeader: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(0,0,0,0.5)' },
  compactLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 10 },
  compactAvatarWrapper: { position: 'relative', marginRight: 12 },
  compactAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.surface },
  compactRankBadge: { position: 'absolute', bottom: -2, right: -4, width: 18, height: 18, borderRadius: 9, borderWidth: 1.5, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background, overflow: 'hidden' },
  compactRankText: { fontSize: 10, fontFamily: 'Poppins_700Bold', lineHeight: 12 },
  compactUserName: { fontFamily: 'Poppins_600SemiBold', color: Colors.text, fontSize: 16 },
  compactActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  compactButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  contentContainer: { paddingHorizontal: 20, gap: 25, paddingTop: 20 },
  glassCard: { borderRadius: 20, overflow: 'hidden', borderWidth: StyleSheet.hairlineWidth, borderColor: Colors.surface + '80' },
  glassEffect: { ...StyleSheet.absoluteFillObject },
  rankCard: { borderRadius: 20, overflow: 'hidden', borderWidth: StyleSheet.hairlineWidth, borderColor: Colors.surface + '80', padding: 15 },
  rankRealm: { left: 45 },
  section: {},
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, paddingHorizontal: 5 },
  sectionTitle: { fontFamily: 'Poppins_600SemiBold', color: Colors.text, fontSize: 18 },
  subSectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15, marginBottom: 10, paddingHorizontal: 5 },
  subSectionTitle: { fontFamily: 'Poppins_500Medium', color: Colors.textSecondary, fontSize: 14 },
  seeAllText: { fontFamily: 'Poppins_500Medium', color: Colors.secondary, fontSize: 14 },
  xpHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  xpLabel: { fontFamily: 'Poppins_500Medium', color: Colors.textSecondary, fontSize: 14 },
  xpValue: { fontFamily: 'Poppins_600SemiBold', color: Colors.text, fontSize: 14 },
  xpBarTrack: { height: 10, backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 5, overflow: 'hidden' },
  xpBarFill: { height: '100%', borderRadius: 5 },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginTop: 20, paddingVertical: 15, borderRadius: 16, overflow: 'hidden' },
  tabContainer: { flexDirection: 'row', borderRadius: 16, overflow: 'hidden', borderWidth: StyleSheet.hairlineWidth, borderColor: Colors.surface + '80', padding: 5, gap: 10 },
  tabButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 12, zIndex: 2, gap: 8 },
  tabLabel: { fontFamily: 'Poppins_500Medium', color: Colors.textSecondary, fontSize: 16 },
  tabLabelActive: { color: Colors.text },
  tabIndicator: { height: '100%', width: (width - 40 - 10) / 2, backgroundColor: Colors.surface, borderRadius: 12, position: 'absolute', top: 5, left: 5 },
});

export default ProfileScreen;