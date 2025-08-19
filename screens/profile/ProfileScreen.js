// screens/profile/ProfileScreen.js

// Import essential modules from React, React Native, and third-party libraries.
import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Image, StatusBar, TouchableOpacity, Alert, ScrollView, FlatList, Dimensions, ImageBackground, Modal, Pressable } from 'react-native';
import { Colors } from '../../constants/Colors';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withDelay, withSpring, withTiming, useAnimatedScrollHandler, interpolate, Extrapolate } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { userData as mockUserData, ranks } from '../../constants/mockData';
import RankInfoModal from './components/RankInfoModal';
import AchievementModal from './components/AchievementModal';
import GlitchEffect from './components/GlitchEffect';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';

// --- Configuration & Data ---
// The original `mockUserData` is spread to ensure all properties are included.
const userData = { ...mockUserData };
const { width, height } = Dimensions.get('window');
// Constants defining the layout dimensions for animations.
const HEADER_BANNER_HEIGHT = 250;
const AVATAR_SIZE = 110;

// --- Helper Functions ---
// These functions perform calculations based on the mock data.
const getCurrentRank = (xp) => {
  // First, explicitly check for the special anomaly rank.
  if (xp < 0) {
    const anomalyRank = ranks.find(rank => rank.minXp < 0);
    if (anomalyRank) return anomalyRank;
  }
  // If not an anomaly, proceed with the normal logic for all positive XP ranks.
  const normalRanks = ranks.filter(rank => rank.minXp >= 0);
  const foundRank = normalRanks.slice().reverse().find(rank => xp >= rank.minXp);
  // Fallback to the lowest normal rank (Mortal).
  return foundRank || normalRanks.find(rank => rank.minXp === 0);
};
const getNextRank = (currentRank) => ranks[ranks.findIndex(r => r.name === currentRank.name) + 1];
const getStatusColor = (statusType) => ({ online: '#2ecc71', 'in-game': '#3498db', offline: '#95a5a6', reading: '#d47e2cff' }[statusType] || '#95a5a6');

// --- Reusable Components ---

/** A wrapper that animates its children with a staggered fade-in and slide-up effect. */
const AnimatedSection = ({ children, index }) => {
    const opacity = useSharedValue(0);
    const translateY = useSharedValue(20);
    useEffect(() => { opacity.value = withDelay(index * 150, withTiming(1)); translateY.value = withDelay(index * 150, withSpring(0)); }, []);
    const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value, transform: [{ translateY: translateY.value }] }));
    return <Animated.View style={animatedStyle}>{children}</Animated.View>;
};

/** A component for a single achievement badge with an animated entry. */
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

// --- Minor Presentational Components ---
const StatItem = ({ label, value }) => ( <View style={styles.statItem}><Text style={styles.statValue}>{value}</Text><Text style={styles.statLabel}>{label}</Text></View> );
const UserStatus = ({ status, style }) => ( <View style={[styles.statusContainer, style]}><View style={[styles.statusDot, { backgroundColor: getStatusColor(status.type) }]} /><Text style={styles.statusText}>{status.text}</Text></View> );
const FavoriteItem = ({ item }) => ( <TouchableOpacity style={styles.favoriteItem}><Image source={item.image} style={styles.favoriteImage} /></TouchableOpacity> );
const HistoryItem = ({ item }) => ( <TouchableOpacity style={styles.historyItem}><Image source={item.image} style={styles.historyImage} /><View style={styles.historyTextContainer}><Text style={styles.historyTitle} numberOfLines={1}>{item.title}</Text><Text style={styles.historySubtitle} numberOfLines={1}>{item.lastChapterRead}</Text></View><Ionicons name="chevron-forward-outline" size={22} color={Colors.textSecondary} /></TouchableOpacity> );
const RankCrest = ({ rank }) => ( <View style={styles.crestContainer}><BlurView intensity={50} tint="dark" style={[styles.crestBlur, { borderColor: rank.color }]}><Text style={[styles.crestText, { color: rank.color }]}>{rank.name}</Text></BlurView></View> );
const ProfileRow = ({ icon, label, onPress, color = Colors.text, isLast = false }) => ( <TouchableOpacity onPress={onPress} style={[styles.rowContainer, isLast && { borderBottomWidth: 0 }]}><View style={styles.rowLeft}><Ionicons name={icon} size={22} color={color} style={{ width: 25 }} /><Text style={[styles.rowLabel, { color }]}>{label}</Text></View><Ionicons name="chevron-forward-outline" size={22} color={Colors.textSecondary} /></TouchableOpacity> );

// --- Main Profile Screen Component ---
const ProfileScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { logout } = useAuth();
  // State for the UI, such as the active tab and modal visibility.
  const [activeTab, setActiveTab] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState(null);
  // Shared values to drive animations based on user interaction.
  const scrollY = useSharedValue(0);
  const tabIndicatorPos = useSharedValue(0);

  const [isRankModalVisible, setIsRankModalVisible] = useState(false);

  // useMemo prevents expensive calculations from running on every render.
  const currentRank = useMemo(() => getCurrentRank(userData.xp), []);
  const nextRank = useMemo(() => getNextRank(currentRank), []);
  const rankProgress = nextRank ? (userData.xp - currentRank.minXp) / (nextRank.minXp - currentRank.minXp) : 1;
  const xpFill = useSharedValue(0);

  // Trigger the XP bar animation when the component mounts or progress changes.
  useEffect(() => { xpFill.value = withDelay(500, withSpring(rankProgress)); }, [rankProgress]);

  // Event handlers
  const scrollHandler = useAnimatedScrollHandler((event) => { scrollY.value = event.contentOffset.y; });
  const handleTabPress = (index) => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setActiveTab(index); const tabWidth = (width - 40 - 10) / 2; tabIndicatorPos.value = withTiming(index * tabWidth + (index * 10)); };
  const handleBadgePress = (badge) => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setSelectedBadge(badge); setModalVisible(true); };
  const handleCloseModal = () => setModalVisible(false);
  const handleOpenRankModal = () => setIsRankModalVisible(true);
  const handleCloseRankModal = () => setIsRankModalVisible(false);

  // Animated style definitions based on shared values.
  const animatedXpFillStyle = useAnimatedStyle(() => ({ width: `${xpFill.value * 100}%` }));
  const animatedHeaderBannerStyle = useAnimatedStyle(() => ({ transform: [{ scale: interpolate(scrollY.value, [-HEADER_BANNER_HEIGHT, 0], [1.5, 1], Extrapolate.CLAMP) }] }));
  const animatedAvatarContainerStyle = useAnimatedStyle(() => ({ transform: [{ translateY: interpolate(scrollY.value, [0, 120], [0, -60], Extrapolate.CLAMP) }], opacity: interpolate(scrollY.value, [100, 150], [1, 0], Extrapolate.CLAMP) }));
  const animatedCompactHeaderStyle = useAnimatedStyle(() => ({ opacity: interpolate(scrollY.value, [180, 210], [0, 1], Extrapolate.CLAMP) }));
  const animatedTabIndicatorStyle = useAnimatedStyle(() => ({ transform: [{ translateX: tabIndicatorPos.value }] }));

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      {currentRank.name === '¿¿' && <GlitchEffect />}
      
      {/* A compact header that appears when the user scrolls down */}
      <Animated.View style={[styles.compactHeader, { height: insets.top + 60 }, animatedCompactHeaderStyle]}>
        <BlurView intensity={25} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={{ position: 'relative' }}><Image source={{ uri: userData.avatarUrl }} style={styles.compactAvatar} /><TouchableOpacity onPress={handleOpenRankModal}><RankCrest rank={currentRank} /></TouchableOpacity></View>
        <View><Text style={styles.compactUserName}>{userData.name}</Text>{userData.status && <UserStatus status={userData.status} style={{ marginLeft: 2, marginTop: -5 }} />}</View>
      </Animated.View>
      
      <Animated.ScrollView onScroll={scrollHandler} scrollEventThrottle={16} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}>
        {/* The main, large header section that animates on scroll */}
        <View style={styles.header}>
            <Animated.View style={[styles.headerBannerWrapper, animatedHeaderBannerStyle]}><ImageBackground source={userData.favoriteComicBanner} style={styles.headerBanner}><LinearGradient colors={['transparent', 'rgba(0,0,0,0.6)', Colors.background]} locations={[0, 0.6, 1]} style={StyleSheet.absoluteFill} /></ImageBackground></Animated.View>
            <View style={styles.headerActions}><TouchableOpacity style={styles.headerButton} onPress={() => navigation.navigate('Account')}><Ionicons name="people-outline" size={22} color={Colors.text} /></TouchableOpacity><TouchableOpacity style={styles.headerButton} onPress={() => navigation.navigate('EditProfile')}><Ionicons name="create-outline" size={22} color={Colors.text} /></TouchableOpacity></View>
            <Animated.View style={[styles.avatarContainer, animatedAvatarContainerStyle]}><View style={styles.avatarWrapper}><Image source={{ uri: userData.avatarUrl }} style={styles.avatar} /><TouchableOpacity style={styles.rankRealm}  onPress={handleOpenRankModal}><RankCrest rank={currentRank} /></TouchableOpacity></View><Text style={styles.userName}>{userData.name}</Text>{userData.status && <UserStatus status={userData.status} />}{userData.bio && <Text style={styles.bioText}>{userData.bio}</Text>}<View style={styles.statsContainer}>{userData.stats.map(stat => <StatItem key={stat.label} {...stat} />)}</View></Animated.View>
        </View>

        {/* The main content area below the header */}
        <View style={styles.contentContainer}>
            <AnimatedSection index={1}><View style={styles.rankCard}><BlurView intensity={25} tint="dark" style={styles.glassEffect} /><View style={styles.xpHeader}><Text style={styles.xpLabel}>Next Rank: {nextRank?.name || 'Max'}</Text><Text style={styles.xpValue}>{`${userData.xp} / ${nextRank?.minXp || userData.xp}`}</Text></View><View style={styles.xpBarTrack}><Animated.View style={[styles.xpBarFill, animatedXpFillStyle, {backgroundColor: currentRank.color}]} /></View></View></AnimatedSection>
            <AnimatedSection index={2}><View style={styles.section}><View style={styles.tabContainer}><BlurView intensity={25} tint="dark" style={styles.glassEffect} /><Animated.View style={[styles.tabIndicator, animatedTabIndicatorStyle]}/><TouchableOpacity onPress={() => handleTabPress(0)} style={styles.tabButton}><Ionicons name="heart-outline" size={20} color={activeTab === 0 ? Colors.text : Colors.textSecondary} /><Text style={[styles.tabLabel, activeTab === 0 && styles.tabLabelActive]}>Favorites ({userData.favorites.length})</Text></TouchableOpacity><TouchableOpacity onPress={() => handleTabPress(1)} style={styles.tabButton}><Ionicons name="time-outline" size={20} color={activeTab === 1 ? Colors.text : Colors.textSecondary} /><Text style={[styles.tabLabel, activeTab === 1 && styles.tabLabelActive]}>History ({userData.history.length})</Text></TouchableOpacity></View>{activeTab === 0 ? ( <FlatList data={userData.favorites} renderItem={FavoriteItem} keyExtractor={item => item.id} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ marginTop: 20 }} /> ) : ( <View style={{marginTop: 20}}>{userData.history.slice(0, 3).map(item => <HistoryItem key={item.id} item={item}/>)}</View> )}</View></AnimatedSection>
            <AnimatedSection index={3}><View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Trophy Case</Text><TouchableOpacity><Text style={styles.seeAllText}>See All</Text></TouchableOpacity></View><FlatList data={userData.badges} renderItem={({ item, index }) => <BadgeItem item={item} index={index} onPress={() => handleBadgePress(item)} />} keyExtractor={item => item.id} horizontal showsHorizontalScrollIndicator={false} /></AnimatedSection>
            <AnimatedSection index={4}><Text style={[styles.sectionTitle, {marginBottom: 12}]}>Settings & Support</Text><View style={styles.glassCard}><BlurView intensity={25} tint="dark" style={styles.glassEffect} /><ProfileRow icon="notifications-outline" label="Notifications" onPress={() => navigation.navigate('Notifications')} /><ProfileRow icon="server-outline" label="Data & Storage" onPress={() => navigation.navigate('DataAndStorage')} /><ProfileRow icon="shield-checkmark-outline" label="Privacy" onPress={() => navigation.navigate('Privacy')} /><ProfileRow icon="help-circle-outline" label="Help & Support" onPress={() => navigation.navigate('Help')} isLast /></View></AnimatedSection>
            <AnimatedSection index={5}><View style={[styles.glassCard, { marginBottom: insets.bottom + 90 }]}><BlurView intensity={25} tint="dark" style={styles.glassEffect} /><ProfileRow icon="log-out-outline" label="Log Out" onPress={logout} color={Colors.danger} isLast /></View></AnimatedSection>
        </View>
      </Animated.ScrollView>

      {/* The Modals is placed at the root level to overlay all other screen content. */}
      <AchievementModal badge={selectedBadge} visible={modalVisible} onClose={handleCloseModal} />
      <RankInfoModal isVisible={isRankModalVisible} onClose={handleCloseRankModal} rank={currentRank} />
    </View>
  );
};

// --- Stylesheet ---
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