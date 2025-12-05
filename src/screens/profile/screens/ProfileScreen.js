// screens/profile/ProfileScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, StatusBar, TouchableOpacity, FlatList, Dimensions, ImageBackground, ActivityIndicator } from 'react-native';
import { Colors } from '@config/Colors';
import { useAuth } from '@context/AuthContext';
import { useProfile } from '@context/ProfileContext'; // IMPORT CONTEXT
import { Ionicons } from '@expo/vector-icons';
import Animated, { 
    useSharedValue, useAnimatedStyle, withDelay, withSpring, withTiming, 
    useAnimatedScrollHandler, interpolate, Extrapolate, useAnimatedReaction, runOnJS
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

// --- Components ---
import RankInfoModal from '../components/modals/RankInfoModal';
import AchievementModal from '../components/modals/AchievementModal';
import GlitchEffect from '../components/ui/GlitchEffect';
import EmptyState from '../components/empty/EmptyState';

const { width } = Dimensions.get('window');
const HEADER_BANNER_HEIGHT = 250;
const AVATAR_SIZE = 110;
// --- Helper Functions ---
const getStatusColor = (statusType) => ({ online: '#2ecc71', 'in-game': '#3498db', offline: '#95a5a6', reading: '#d47e2cff' }[statusType] || '#95a5a6');

// --- Reusable Components ---
const AnimatedSection = ({ children, index }) => {
    const opacity = useSharedValue(0);
    const translateY = useSharedValue(20);
    useEffect(() => { opacity.value = withDelay(index * 150, withTiming(1)); translateY.value = withDelay(index * 150, withSpring(0)); }, []);
    const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value, transform: [{ translateY: translateY.value }] }));
    return <Animated.View style={animatedStyle}>{children}</Animated.View>;
};

const BadgeItem = ({ item, index, onPress }) => {
    const entryProgress = useSharedValue(0);
    useEffect(() => { entryProgress.value = withDelay(index * 100, withSpring(1)); }, []);
    const animatedStyle = useAnimatedStyle(() => ({ opacity: entryProgress.value, transform: [{scale: entryProgress.value}] }));
    return (
        <Animated.View style={[styles.badgeContainer, animatedStyle]}>
            <TouchableOpacity onPress={onPress}>
                <LinearGradient colors={[Colors.surface + '99', 'rgba(0,0,0,0)']} style={styles.badgeIconContainer}>
                    <Ionicons name={item.icon} size={32} color={Colors.secondary} />
                </LinearGradient>
                <Text style={styles.badgeName} numberOfLines={2}>{item.name}</Text>
            </TouchableOpacity>
        </Animated.View>
    );
};

const StatItem = ({ label, value }) => ( <View style={styles.statItem}><Text style={styles.statValue}>{value}</Text><Text style={styles.statLabel}>{label}</Text></View> );
const UserStatus = ({ status, style }) => ( <View style={[styles.statusContainer, style]}><View style={[styles.statusDot, { backgroundColor: getStatusColor(status.type) }]} /><Text style={styles.statusText}>{status.text}</Text></View> );
const FavoriteItem = ({ item }) => ( <TouchableOpacity style={styles.favoriteItem}><Image source={item.image} style={styles.favoriteImage} /></TouchableOpacity> );
const HistoryItem = ({ item }) => ( <TouchableOpacity style={styles.historyItem}><Image source={item.image} style={styles.historyImage} /><View style={styles.historyTextContainer}><Text style={styles.historyTitle} numberOfLines={1}>{item.title}</Text><Text style={styles.historySubtitle} numberOfLines={1}>{item.lastChapterRead}</Text></View><Ionicons name="chevron-forward-outline" size={22} color={Colors.textSecondary} /></TouchableOpacity> );
const RankCrest = ({ rank }) => ( <View style={styles.crestContainer}><BlurView intensity={50} tint="dark" style={[styles.crestBlur, { borderColor: rank.color }]}><Text style={[styles.crestText, { color: rank.color }]}>{rank.name}</Text></BlurView></View> );
const ProfileRow = ({ icon, label, onPress, color = Colors.text, isLast = false }) => ( <TouchableOpacity onPress={onPress} style={[styles.rowContainer, isLast && { borderBottomWidth: 0 }]}><View style={styles.rowLeft}><Ionicons name={icon} size={22} color={color} style={{ width: 25 }} /><Text style={[styles.rowLabel, { color }]}>{label}</Text></View><Ionicons name="chevron-forward-outline" size={22} color={Colors.textSecondary} /></TouchableOpacity> );

const ProfileScreen = () => {
    // 1. Use the Bridge (Context)
    const { profile, isLoading, fetchProfile, getRankProgress } = useProfile();
    const { logout } = useAuth();
    
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();

    // 2. UI State
    const [activeTab, setActiveTab] = useState(0);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedBadge, setSelectedBadge] = useState(null);
    const [isRankModalVisible, setIsRankModalVisible] = useState(false);
    const [isHeaderInteractive, setIsHeaderInteractive] = useState(false);

    // 3. Animation Values
    const scrollY = useSharedValue(0);
    const tabIndicatorPos = useSharedValue(0);
    const currentRank = profile?.currentRank || { name: 'Loading', color: Colors.textSecondary, minXp: 0 };
    const nextRank = profile?.nextRank;
    const xp = profile?.xp || 0;
  
    const rankProgress = nextRank 
      ? (xp - currentRank.minXp) / (nextRank.minXp - currentRank.minXp) 
      : 1;

    const xpFill = useSharedValue(0);

    useEffect(() => { 
      if (!isLoading) {
        xpFill.value = withDelay(500, withSpring(Math.max(0, Math.min(1, rankProgress)))); 
      }
    }, [rankProgress, isLoading]);

    useAnimatedReaction(
      () => scrollY.value > 150,
      (isInteractive, prev) => {
        if (isInteractive !== prev) {
            runOnJS(setIsHeaderInteractive)(isInteractive);
        }
      }
    );
    
    const handleOpenRankModal = () => setIsRankModalVisible(true);
    const handleCloseRankModal = () => setIsRankModalVisible(false);
    const handleBadgePress = (badge) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setSelectedBadge(badge);
        setModalVisible(true);
    };
    
    const handleCloseModal = () => setModalVisible(false);
    // 4. Refresh data when screen focuses (e.g. returning from reading a chapter)
    useFocusEffect(
        React.useCallback(() => {
            fetchProfile(true); // Pass true to fetch quietly (background)
        }, [fetchProfile])
    );
    
    // 5. Update XP bar when profile changes
    useEffect(() => { 
        if (profile && !isLoading) {
            const progress = getRankProgress();
            xpFill.value = withDelay(500, withSpring(progress)); 
        }
    }, [profile, isLoading, getRankProgress]);

    // Handle Header Interactivity
    useAnimatedReaction(
        () => scrollY.value > 150,
        (isInteractive, prev) => {
            if (isInteractive !== prev) {
                runOnJS(setIsHeaderInteractive)(isInteractive);
            }
        }
    );

    const scrollHandler = useAnimatedScrollHandler((event) => { scrollY.value = event.contentOffset.y; });

    // Handlers
    const handleTabPress = (index) => { 
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); 
        setActiveTab(index); 
        const tabWidth = (width - 40 - 10) / 2; 
        tabIndicatorPos.value = withTiming(index * tabWidth + (index * 10)); 
    };

    const handleSeeAll = () => {
        if (!profile) return;
        const type = activeTab === 0 ? 'favorites' : 'history';
        const title = activeTab === 0 ? 'My Collection' : 'Reading History';
        // Note: We pass the type so ViewAllHFScreen knows which Context method to call
        navigation.navigate('ViewAllHF', { type, title });
    };

    // Animated Styles
    const animatedXpFillStyle = useAnimatedStyle(() => ({ width: `${xpFill.value * 100}%` }));
    const animatedHeaderBannerStyle = useAnimatedStyle(() => ({ transform: [{ scale: interpolate(scrollY.value, [-HEADER_BANNER_HEIGHT, 0], [1.5, 1], Extrapolate.CLAMP) }] }));
    const animatedAvatarContainerStyle = useAnimatedStyle(() => ({ transform: [{ translateY: interpolate(scrollY.value, [0, 120], [0, -60], Extrapolate.CLAMP) }], opacity: interpolate(scrollY.value, [100, 150], [1, 0], Extrapolate.CLAMP) }));
    const animatedCompactHeaderStyle = useAnimatedStyle(() => ({ opacity: interpolate(scrollY.value, [180, 210], [0, 1], Extrapolate.CLAMP) }));
    const animatedTabIndicatorStyle = useAnimatedStyle(() => ({ transform: [{ translateX: tabIndicatorPos.value }] }));

  if (isLoading) {
      return (
          <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
              <ActivityIndicator size="large" color={Colors.secondary} />
          </View>
      );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      {currentRank.name === '¿¿' && <GlitchEffect />}
      
      {/* Compact Header */}
      <Animated.View 
        pointerEvents={isHeaderInteractive ? 'auto' : 'none'}
        style={[styles.compactHeader, { height: insets.top + 60 }, animatedCompactHeaderStyle]}
      >
        <BlurView intensity={25} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={{ position: 'relative' }}><Image source={{ uri: profile.avatarUrl }} style={styles.compactAvatar} /><TouchableOpacity onPress={handleOpenRankModal}><RankCrest rank={currentRank} /></TouchableOpacity></View>
        <View><Text style={styles.compactUserName}>{profile.name}</Text>{profile.status && <UserStatus status={profile.status} style={{ marginLeft: 2, marginTop: -5 }} />}</View>
      </Animated.View>
      
      <Animated.ScrollView onScroll={scrollHandler} scrollEventThrottle={16} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}>
        {/* Large Header */}
        <View style={styles.header}>
            <Animated.View style={[styles.headerBannerWrapper, animatedHeaderBannerStyle]}><ImageBackground source={profile.favoriteComicBanner} style={styles.headerBanner}><LinearGradient colors={['transparent', 'rgba(0,0,0,0.6)', Colors.background]} locations={[0, 0.6, 1]} style={StyleSheet.absoluteFill} /></ImageBackground></Animated.View>
            <View style={styles.headerActions}><TouchableOpacity style={styles.headerButton} onPress={() => navigation.navigate('Account')}><Ionicons name="people-outline" size={22} color={Colors.text} /></TouchableOpacity><TouchableOpacity style={styles.headerButton} onPress={() => navigation.navigate('EditProfile')}><Ionicons name="create-outline" size={22} color={Colors.text} /></TouchableOpacity></View>
            <Animated.View style={[styles.avatarContainer, animatedAvatarContainerStyle]}><View style={styles.avatarWrapper}><Image source={{ uri: profile.avatarUrl }} style={styles.avatar} /><TouchableOpacity style={styles.rankRealm}  onPress={handleOpenRankModal}><RankCrest rank={currentRank} /></TouchableOpacity></View><Text style={styles.userName}>{profile.name}</Text>{profile.status && <UserStatus status={profile.status} />}{profile.bio && <Text style={styles.bioText}>{profile.bio}</Text>}<View style={styles.statsContainer}>{profile.stats.map(stat => <StatItem key={stat.label} {...stat} />)}</View></Animated.View>
        </View>

        <View style={styles.contentContainer}>
            {/* Rank Card */}
            <AnimatedSection index={1}><View style={styles.rankCard}><BlurView intensity={25} tint="dark" style={styles.glassEffect} /><View style={styles.xpHeader}><Text style={styles.xpLabel}>Next Rank: {nextRank?.name || 'Max'}</Text><Text style={styles.xpValue}>{`${profile.xp} / ${nextRank?.minXp || profile.xp}`}</Text></View><View style={styles.xpBarTrack}><Animated.View style={[styles.xpBarFill, animatedXpFillStyle, {backgroundColor: currentRank.color}]} /></View></View></AnimatedSection>
            
            {/* Tabs Section (Favorites / History) */}
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

                    {/* NEW: Section Sub-Header with See All */}
                    <View style={styles.subSectionHeader}>
                        <Text style={styles.subSectionTitle}>
                            {activeTab === 0 ? 'Your Collection' : 'Recently Read'}
                        </Text>
                        {((activeTab === 0 && profile.favorites.length > 0) || (activeTab === 1 && profile.history.length > 0)) && (
                            <TouchableOpacity onPress={handleSeeAll}>
                                <Text style={styles.seeAllText}>See All</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                    
                    {activeTab === 0 ? ( 
                        profile.favorites.length > 0 ? (
                            <FlatList 
                                data={profile.favorites.slice(0, 5)} // Limit preview
                                renderItem={FavoriteItem} 
                                keyExtractor={item => item.id} 
                                horizontal 
                                showsHorizontalScrollIndicator={false} 
                            /> 
                        ) : (
                            <EmptyState 
                                icon="heart-outline" 
                                title="No Favorites Yet" 
                                message="Save comics to your library to see them here." 
                                actionLabel="Browse Comics"
                                onAction={() => navigation.navigate('Comics')}
                            />
                        )
                    ) : ( 
                        profile.history.length > 0 ? (
                            <View>{profile.history.slice(0, 3).map(item => <HistoryItem key={item.id} item={item}/>)}</View> 
                        ) : (
                            <EmptyState 
                                icon="time-outline" 
                                title="No Reading History" 
                                message="Start reading to track your progress." 
                            />
                        )
                    )}
                </View>
            </AnimatedSection>
            
            {/* Trophy Case */}
            <AnimatedSection index={3}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Trophy Case</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('TrophyCase')}><Text style={styles.seeAllText}>See All</Text></TouchableOpacity>
                </View>
                {profile.badges.length > 0 ? (
                    <FlatList data={profile.badges} renderItem={({ item, index }) => <BadgeItem item={item} index={index} onPress={() => handleBadgePress(item)} />} keyExtractor={item => item.id} horizontal showsHorizontalScrollIndicator={false} />
                ) : (
                     <EmptyState 
                        icon="trophy-outline" 
                        title="No Trophies" 
                        message="Complete achievements to earn trophies." 
                        style={{ paddingVertical: 10 }}
                    />
                )}
            </AnimatedSection>

            {/* Settings */}
            <AnimatedSection index={4}><Text style={[styles.sectionTitle, {marginBottom: 12}]}>Settings & Support</Text><View style={styles.glassCard}><BlurView intensity={25} tint="dark" style={styles.glassEffect} /><ProfileRow icon="notifications-outline" label="Notifications" onPress={() => navigation.navigate('NotificationSettings')} /><ProfileRow icon="server-outline" label="Data & Storage" onPress={() => navigation.navigate('DataAndStorage')} /><ProfileRow icon="shield-checkmark-outline" label="Privacy" onPress={() => navigation.navigate('Privacy')} /><ProfileRow icon="help-circle-outline" label="Help & Support" onPress={() => navigation.navigate('Help')} isLast /></View></AnimatedSection>
            
            {/* Logout */}
            <AnimatedSection index={5}><View style={[styles.glassCard, { marginBottom: insets.bottom + 90 }]}><BlurView intensity={25} tint="dark" style={styles.glassEffect} /><ProfileRow icon="log-out-outline" label="Log Out" onPress={logout} color={Colors.danger} isLast /></View></AnimatedSection>
        </View>
      </Animated.ScrollView>

      <AchievementModal badge={selectedBadge} visible={modalVisible} onClose={handleCloseModal} />
      <RankInfoModal isVisible={isRankModalVisible} onClose={handleCloseRankModal} rank={currentRank} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { alignItems: 'center' },
  headerBannerWrapper: { width: '100%', height: HEADER_BANNER_HEIGHT, alignItems: 'center', overflow: 'hidden' },
  headerBanner: { width: '100%', height: '100%' },
  headerActions: { position: 'absolute', top: 50, right: 20, flexDirection: 'row', gap: 10, zIndex: 2 },
  headerButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
  avatarContainer: { alignItems: 'center', marginTop: -HEADER_BANNER_HEIGHT/2, zIndex: 1, width: '100%', paddingHorizontal: 20 },
  avatarWrapper: { position: 'relative', alignItems: 'center', justifyContent: 'center' },
  avatar: { width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: AVATAR_SIZE / 2, borderWidth: 4, borderColor: Colors.background },
  crestContainer: { position: 'absolute', bottom: -5, right: -10, zIndex: 2 },
  crestBlur: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', overflow: 'hidden', borderWidth: 2 },
  crestText: { fontFamily: 'Poppins_700Bold', fontSize: 20 },
  userName: { fontFamily: 'Poppins_700Bold', color: Colors.text, fontSize: 28, marginTop: 12 },
  statusContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  statusText: { fontFamily: 'Poppins_500Medium', color: Colors.textSecondary, fontSize: 14 },
  bioText: { fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, fontSize: 14, textAlign: 'center', marginTop: 10, lineHeight: 20 },
  compactHeader: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 20, paddingBottom: 10, overflow: 'hidden', borderBottomWidth: StyleSheet.hairlineWidth, borderColor: Colors.surface + '80', gap: 12, backgroundColor: Colors.background },
  compactAvatar: { width: 36, height: 36, borderRadius: 18 },
  compactUserName: { fontFamily: 'Poppins_600SemiBold', color: Colors.text, fontSize: 18 },
  contentContainer: { paddingHorizontal: 20, gap: 25, paddingTop: 20 },
  glassCard: { borderRadius: 20, overflow: 'hidden', borderWidth: StyleSheet.hairlineWidth, borderColor: Colors.surface + '80' },
  glassEffect: { ...StyleSheet.absoluteFillObject },
  rankCard: { borderRadius: 20, overflow: 'hidden', borderWidth: StyleSheet.hairlineWidth, borderColor: Colors.surface + '80', padding: 15 },
  rankRealm: { left: 45 },
  section: {},
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, paddingHorizontal: 5 },
  sectionTitle: { fontFamily: 'Poppins_600SemiBold', color: Colors.text, fontSize: 18,  },
  
  // New Styles for the Tab sub-header
  subSectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15, marginBottom: 10, paddingHorizontal: 5 },
  subSectionTitle: { fontFamily: 'Poppins_500Medium', color: Colors.textSecondary, fontSize: 14 },

  seeAllText: { fontFamily: 'Poppins_500Medium', color: Colors.secondary, fontSize: 14 },
  xpHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  xpLabel: { fontFamily: 'Poppins_500Medium', color: Colors.textSecondary, fontSize: 14 },
  xpValue: { fontFamily: 'Poppins_600SemiBold', color: Colors.text, fontSize: 14 },
  xpBarTrack: { height: 10, backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 5, overflow: 'hidden' },
  xpBarFill: { height: '100%', borderRadius: 5 },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginTop: 20, paddingVertical: 15, borderRadius: 16, overflow: 'hidden' },
  statItem: { alignItems: 'center', flex: 1 },
  statValue: { fontFamily: 'Poppins_700Bold', color: Colors.text, fontSize: 20 },
  statLabel: { fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, fontSize: 12, marginTop: 4 },
  tabContainer: { flexDirection: 'row', borderRadius: 16, overflow: 'hidden', borderWidth: StyleSheet.hairlineWidth, borderColor: Colors.surface + '80', padding: 5, gap: 10 },
  tabButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 12, zIndex: 2, gap: 8 },
  tabLabel: { fontFamily: 'Poppins_500Medium', color: Colors.textSecondary, fontSize: 16 },
  tabLabelActive: { color: Colors.text },
  tabIndicator: { height: '100%', width: (width - 40 - 10) / 2, backgroundColor: Colors.surface, borderRadius: 12, position: 'absolute', top: 5, left: 5 },
  favoriteItem: { width: 110, height: 165, marginRight: 15, borderRadius: 12, overflow: 'hidden' },
  favoriteImage: { width: '100%', height: '100%', backgroundColor: Colors.surface },
  historyItem: { flexDirection: 'row', alignItems: 'center', padding: 15, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.surface + '80' },
  historyImage: { width: 50, height: 75, borderRadius: 8, backgroundColor: Colors.surface },
  historyTextContainer: { marginLeft: 15, flex: 1 },
  historyTitle: { fontFamily: 'Poppins_600SemiBold', color: Colors.text, fontSize: 16 },
  historySubtitle: { fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, fontSize: 13, marginTop: 2 },
  badgeContainer: { alignItems: 'center', width: 100 },
  badgeIconContainer: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 8, overflow: 'hidden', borderWidth: StyleSheet.hairlineWidth, borderColor: Colors.surface + '80' },
  badgeName: { fontFamily: 'Poppins_500Medium', color: Colors.textSecondary, fontSize: 12, textAlign: 'center' },
  rowContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, paddingHorizontal: 15, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.surface + '80' },
  rowLeft: { flexDirection: 'row', alignItems: 'center' },
  rowLabel: { fontFamily: 'Poppins_500Medium', fontSize: 16, marginLeft: 15 },
});

export default ProfileScreen;
 