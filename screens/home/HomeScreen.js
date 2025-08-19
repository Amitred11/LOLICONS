// Import necessary modules from React, React Native, and third-party libraries.
import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Image, ImageBackground, Dimensions, FlatList, TouchableOpacity, Alert, StatusBar, TextInput } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, useAnimatedProps, useAnimatedStyle, withTiming, withDelay, useAnimatedScrollHandler, interpolate, Extrapolate } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import GlitchEffect from '../profile/components/GlitchEffect';
// Import mock data for the dashboard.
import { dashboardMissions, upcomingEvents, comicsData, ranks, userData } from '../../constants/mockData';

// Get screen width for layout calculations.
const { width } = Dimensions.get('window');
// Constants for the collapsible header animation.
const HEADER_HEIGHT = 100;
const COLLAPSED_HEADER_HEIGHT = 60;
const SCROLL_DISTANCE = HEADER_HEIGHT - COLLAPSED_HEADER_HEIGHT;

// --- Helper & Animated Components ---

// Determines a greeting based on the current time of day.
const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
};
// Finds the user's current rank based on their XP.
const getCurrentRank = (xp) => { const foundRank = ranks.slice().reverse().find(rank => xp >= rank.minXp);
  // If a rank is found, return it. Otherwise, return the very first rank in the array (e.g., '凡').
  return foundRank || ranks[0];
};
// Create animated versions of components to apply animated props.
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

/**
 * A wrapper component that animates its children with a fade-in and slide-up effect.
 * The animation delay is staggered based on the component's index.
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The content to be animated.
 * @param {number} props.index - The index of the section, used for staggering the animation.
 */
const AnimatedSection = ({ children, index }) => {
    const opacity = useSharedValue(0);
    const translateY = useSharedValue(30);
    // Trigger the animation when the component mounts.
    useEffect(() => {
        opacity.value = withDelay(index * 150, withTiming(1, { duration: 400 }));
        translateY.value = withDelay(index * 150, withTiming(0, { duration: 400 }));
    }, []);
    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ translateY: translateY.value }],
    }));
    return <Animated.View style={animatedStyle}>{children}</Animated.View>;
};

// --- Core UI Components ---

/** A simple, circular avatar component. */
const Avatar = ({ source, size = 48, onPress }) => (
    <TouchableOpacity 
        onPress={onPress} 
        style={[styles.avatarContainer, { width: size, height: size, borderRadius: size / 2 }]}
    >
        <Image source={source} style={{ width: '100%', height: '100%' }} />
    </TouchableOpacity>
);

/** A circular progress chart component built with SVG and Reanimated. */
const CircularProgressChart = ({ size = 100, strokeWidth = 12, progress = 0.75 }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const progressValue = useSharedValue(0);
    // Animate the progress value when the component mounts or progress prop changes.
    useEffect(() => { progressValue.value = withDelay(500, withTiming(progress, { duration: 1000 })); }, [progress]);
    // Animate the 'strokeDashoffset' of the SVG circle to represent progress.
    const animatedCircleProps = useAnimatedProps(() => ({ strokeDashoffset: circumference * (1 - progressValue.value) }));
    // Animate the text inside the circle to count up.
    const animatedTextProps = useAnimatedProps(() => ({ text: `${Math.round(progressValue.value * 100)}%`, defaultValue: '0%' }));
    return (
        <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
            <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                <Circle cx={size / 2} cy={size / 2} r={radius} stroke={Colors.surface + '80'} strokeWidth={strokeWidth} />
                <AnimatedCircle cx={size / 2} cy={size / 2} r={radius} stroke={Colors.secondary} strokeWidth={strokeWidth} strokeDasharray={circumference} animatedProps={animatedCircleProps} strokeLinecap="round" transform={`rotate(-90 ${size / 2} ${size / 2})`}/>
            </Svg>
            <AnimatedTextInput style={styles.progressText} editable={false} animatedProps={animatedTextProps} />
        </View>
    );
};

/** A card for the featured items carousel with a parallax image effect. */
const FeaturedCard = ({ item, onPress, index, scrollX }) => {
    const cardWidth = width - 40;
    const inputRange = [(index - 1) * cardWidth, index * cardWidth, (index + 1) * cardWidth];
    // Interpolate the horizontal scroll position of the FlatList to create a parallax effect on the background image.
    const animatedParallaxStyle = useAnimatedStyle(() => {
        const translateX = interpolate(scrollX.value, inputRange, [-cardWidth * 0.2, 0, cardWidth * 0.2], Extrapolate.CLAMP);
        return { transform: [{ translateX }] };
    });
    return (
        <TouchableOpacity onPress={onPress} style={styles.featuredCard}>
            <Animated.View style={[StyleSheet.absoluteFill, { overflow: 'hidden', borderRadius: 24 }]}>
                <Animated.Image source={item.localSource} style={[styles.featuredBg, animatedParallaxStyle]} />
            </Animated.View>
            <LinearGradient colors={['transparent', 'rgba(0,0,0,0.2)', 'rgba(0,0,0,0.9)']} style={styles.featuredOverlay}>
                <Image source={item.localSource} style={styles.featuredCover} />
                <View style={styles.featuredTextContainer}>
                    <Text style={styles.featuredSubtitle}>Featured Comic</Text>
                    <Text style={styles.featuredTitle} numberOfLines={2}>{item.title}</Text>
                    <TouchableOpacity style={styles.readNowButton} onPress={onPress}>
                        <Text style={styles.readNowButtonText}>Read Now</Text>
                        <Ionicons name="arrow-forward-circle" size={22} color={Colors.background} />
                    </TouchableOpacity>
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );
};

/** A card for the "Continue Reading" section with a progress bar. */
const ContinueReadingCard = ({ item, onPress }) => {
    const progress = useSharedValue(0);
    // Animate the progress bar fill when the component mounts.
    useEffect(() => { progress.value = withTiming(item.progress || 0.75, { duration: 500 }); }, []);
    const animatedProgressStyle = useAnimatedStyle(() => ({ width: `${progress.value * 100}%` }));
    return (
        <TouchableOpacity onPress={onPress} style={styles.continueCard}>
            <Image source={item.localSource} style={styles.continueImage} />
            <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={styles.continueOverlay}>
                <Text style={styles.continueTitle} numberOfLines={2}>{item.title}</Text>
            </LinearGradient>
            <View style={styles.continueProgressBg}>
                <Animated.View style={[styles.continueProgressFill, animatedProgressStyle]} />
            </View>
        </TouchableOpacity>
    );
};

/** A card representing a single daily mission or quest. */
const MissionCard = ({ mission, index, onPress }) => {
    const isCompleted = mission.progress === 1;
    return (
        <TouchableOpacity onPress={onPress} style={[styles.missionCard, isCompleted && styles.missionCompleted]}>
            <View style={[styles.missionIcon, { backgroundColor: isCompleted ? Colors.secondary + '33' : Colors.surface }]}>
                <Ionicons name={mission.icon || 'book-outline'} size={20} color={isCompleted ? Colors.secondary : Colors.text} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.missionTitle}>{mission.title}</Text>
                <Text style={styles.missionReward}>{mission.reward}</Text>
            </View>
            {isCompleted && <Ionicons name={"checkmark-circle"} size={28} color={Colors.secondary} />}
        </TouchableOpacity>
    );
};

/** A card for the "Upcoming Events" section. */
const EventCard = ({ item }) => (
    <TouchableOpacity style={styles.eventCard}>
      <ImageBackground source={item.image} style={styles.eventImage} imageStyle={{borderRadius: 20}}>
          <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={styles.eventOverlay}>
            <Text style={styles.eventDate}>{item.date}</Text>
            <Text style={styles.eventTitle}>{item.title}</Text>
          </LinearGradient>
      </ImageBackground>
    </TouchableOpacity>
);

/** A grid item for the "Quick Actions" section. */
const GridItem = ({ item, onPress }) => (
    <TouchableOpacity onPress={onPress} style={styles.gridItem}>
        <LinearGradient colors={[item.color + '4D', item.color + '1A']} style={styles.gridGradient}>
            <View style={[styles.gridIconContainer, { backgroundColor: item.color + '33' }]}>
                <Ionicons name={item.icon} size={32} color={item.color} />
            </View>
            <Text style={styles.gridTitle}>{item.title}</Text>
        </LinearGradient>
    </TouchableOpacity>
);

// --- Main HomeScreen Component ---
const HomeScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { user } = useAuth(); // Auth context might be used for user data in a real app.
  const scrollY = useSharedValue(0); // Tracks vertical scroll of the main ScrollView.
  const scrollX = useSharedValue(0); // Tracks horizontal scroll of the featured carousel.

  // Memoize computed values to prevent recalculation on every render.
  const greeting = getGreeting();
  const dailyProgress = useMemo(() => (dashboardMissions || []).reduce((acc, mission) => acc + mission.progress, 0) / (dashboardMissions?.length || 1), []);
  const currentRank = useMemo(() => getCurrentRank(userData.xp), []);

  const dashboardItems = [
    { title: 'Library', icon: 'library-outline', color: Colors.secondary, target: 'Comics' },
    { title: 'Community', icon: 'people-outline', color: Colors.primary, target: 'Community' },
    { title: 'Chat', icon: 'chatbubbles-outline', color: '#FF5A5F', target: 'Chat' },
    { title: 'Profile', icon: 'person-circle-outline', color: '#4CAF50', target: 'Profile' },
  ];

  // Animated scroll handlers to update shared values.
  const scrollHandler = useAnimatedScrollHandler((event) => { scrollY.value = event.contentOffset.y; });
  const parallaxScrollHandler = useAnimatedScrollHandler((event) => { scrollX.value = event.contentOffset.x; });

  // Animation styles for the collapsible header.
  const animatedHeaderStyle = useAnimatedStyle(() => ({ height: interpolate(scrollY.value, [0, SCROLL_DISTANCE], [insets.top + HEADER_HEIGHT, insets.top + COLLAPSED_HEADER_HEIGHT], Extrapolate.CLAMP) }));
  const animatedBlurStyle = useAnimatedStyle(() => ({ opacity: interpolate(scrollY.value, [0, SCROLL_DISTANCE], [0, 1], Extrapolate.CLAMP) }));
  // Style for the large, expanded header content (fades and moves up on scroll).
  const animatedLargeHeaderStyle = useAnimatedStyle(() => ({
      opacity: interpolate(scrollY.value, [0, SCROLL_DISTANCE / 2], [1, 0], Extrapolate.CLAMP),
      transform: [{ translateY: interpolate(scrollY.value, [0, SCROLL_DISTANCE / 2], [0, -20], Extrapolate.CLAMP) }]
  }));
  // Style for the smaller, compact header content (fades and moves up into view).
  const animatedSearchAndCompactStyle = useAnimatedStyle(() => ({
      opacity: interpolate(scrollY.value, [SCROLL_DISTANCE / 2, SCROLL_DISTANCE], [0, 1], Extrapolate.CLAMP),
      transform: [{ translateY: interpolate(scrollY.value, [SCROLL_DISTANCE / 2, SCROLL_DISTANCE], [20, 0], Extrapolate.CLAMP) }]
  }));

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      {currentRank.name === '¿¿' && <GlitchEffect />}
      
      {/* Animated Header Component */}
      <Animated.View style={[styles.header, animatedHeaderStyle]}>
        <Animated.View style={[StyleSheet.absoluteFill, animatedBlurStyle]}>
            <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill}/>
            <View style={styles.headerBorder}/>
        </Animated.View>
        
        <View style={[styles.headerContent, { paddingTop: insets.top }]}>
            {/* Expanded Header Content */}
            <Animated.View style={[styles.largeHeaderContainer, animatedLargeHeaderStyle]}>
                <View>
                    <Text style={styles.headerSubtitle}>{greeting},</Text>
                    <Text style={styles.headerTitle}>{user?.username || userData.name}</Text>
                </View>
                <Avatar source={userData.avatarUrl} onPress={() => navigation.navigate('Profile')} />
            </Animated.View>

            {/* --- UPDATED COMPACT HEADER --- */}
            {/* Compact Header Content */}
            <Animated.View style={[styles.compactHeaderContainer, animatedSearchAndCompactStyle]}>
                <TouchableOpacity style={styles.searchBar} onPress={() => navigation.navigate('Search')}>
                    <Ionicons name="search" size={20} color={Colors.textSecondary} />
                    <Text style={styles.searchPlaceholder}>Search comics, creators...</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={[styles.compactRankBadge, { backgroundColor: currentRank.color + '20' }]}>
                    <Text style={[styles.compactRankText, { color: currentRank.color }]}>{currentRank.name}</Text>
                </TouchableOpacity>
                <Avatar source={userData.avatarUrl} size={36} onPress={() => navigation.navigate('Profile')} />
            </Animated.View>
        </View>
      </Animated.View>

      {/* Main Scrollable Content */}
      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={[styles.scrollContainer, { paddingTop: insets.top + HEADER_HEIGHT }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Featured Section */}
        <AnimatedSection index={0}>
            <Animated.FlatList data={comicsData.filter(c => c.isPopular)} renderItem={({ item, index }) => <FeaturedCard item={item} index={index} scrollX={scrollX} onPress={() => navigation.navigate('ComicDetail', { comicId: item.id })} />} keyExtractor={item => item.id} horizontal pagingEnabled onScroll={parallaxScrollHandler} showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 15 }} snapToInterval={width - 40} decelerationRate="fast"/>
        </AnimatedSection>
        
        {/* Continue Reading Section */}
        <AnimatedSection index={1}>
            <View style={styles.section}>
                <View style={styles.sectionHeaderContainer}><Text style={styles.sectionTitle}>Continue Reading</Text><TouchableOpacity onPress={() => navigation.navigate('HistoryTab')}><Text style={styles.seeAllText}>See All</Text></TouchableOpacity></View>
                <FlatList data={comicsData.slice(0, 4)} renderItem={({ item }) => <ContinueReadingCard item={item} onPress={() => navigation.navigate('Reader', { comicId: item.id, chapterId: item.chapters[0].id })} />} keyExtractor={item => item.id} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}/>
            </View>
        </AnimatedSection>

        {/* Today's Quest Section */}
        <AnimatedSection index={2}>
            <View style={styles.questCard}><BlurView intensity={25} tint="dark" style={styles.questCardBlur} /><View style={styles.cardHeader}><Text style={styles.sectionTitleNoPadding}>Today's Quest</Text><TouchableOpacity><Text style={styles.seeAllText}>View All</Text></TouchableOpacity></View><View style={styles.progressContainer}><CircularProgressChart progress={dailyProgress} /><View style={styles.statsTextContainer}><Text style={styles.progressTitle}>Almost There!</Text><Text style={styles.statsSubtitle}>You've completed {Math.round(dailyProgress * 100)}% of your daily goals.</Text></View></View><View style={styles.missionListContainer}>{dashboardMissions.slice(0, 2).map((mission, index) => (<MissionCard key={mission.id} mission={mission} index={index} onPress={() => Alert.alert("Mission Tapped", `You tapped on: ${mission.title}`)} />))}</View></View>
        </AnimatedSection>
        
        {/* Quick Actions Section */}
        <AnimatedSection index={3}>
            <View style={styles.section}><Text style={[styles.sectionTitle, { paddingHorizontal: 20, marginBottom: 15 }]}>Quick Actions</Text><View style={styles.grid}>{dashboardItems.map((item) => (<GridItem key={item.title} item={item} onPress={() => navigation.navigate(item.target)} />))}</View></View>
        </AnimatedSection>

        {/* Upcoming Events Section */}
        <AnimatedSection index={4}>
            <View style={styles.section}><View style={styles.sectionHeaderContainer}><Text style={styles.sectionTitle}>Upcoming Events</Text><TouchableOpacity onPress={() => Alert.alert("See All", `This would navigate to the full list of upcoming events.`)}><Text style={styles.seeAllText}>See All</Text></TouchableOpacity></View><FlatList data={upcomingEvents} renderItem={({ item }) => <EventCard item={item} />} keyExtractor={item => item.id} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}/></View>
        </AnimatedSection>
      </Animated.ScrollView>
    </View>
  );
};

// Styles for all components in this file.
const styles = StyleSheet.create({
  // Container & Header Styles
  container: { flex: 1, backgroundColor: Colors.background },
  header: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1, justifyContent: 'flex-end' },
  headerBorder: { position: 'absolute', bottom: 0, left: 0, right: 0, height: StyleSheet.hairlineWidth, backgroundColor: Colors.surface + '80' },
  headerContent: { width: '100%', paddingHorizontal: 20, paddingBottom: 15, height: '100%', justifyContent: 'flex-end' },
  largeHeaderContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerSubtitle: { fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, fontSize: 16 },
  headerTitle: { fontFamily: 'Poppins_700Bold', color: Colors.text, fontSize: 28 },
  avatarContainer: { borderWidth: 2, borderColor: Colors.secondary, padding: 2, backgroundColor: Colors.surface, overflow: 'hidden' },
  // --- UPDATED STYLES FOR COMPACT HEADER ---
  compactHeaderContainer: { position: 'absolute', left: 0, right: 0, bottom: 0, height: COLLAPSED_HEADER_HEIGHT, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, gap: 10 },
  searchBar: { flex: 1, height: 38, backgroundColor: Colors.surface, borderRadius: 19, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15 },
  searchPlaceholder: { color: Colors.textSecondary, marginLeft: 10, fontFamily: 'Poppins_400Regular' },
  compactRankBadge: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  compactRankText: { fontFamily: 'Poppins_700Bold', fontSize: 18 },
  // --- END UPDATED STYLES ---
  scrollContainer: { paddingBottom: 120, gap: 15 },
  section: { paddingVertical: 10 },
  sectionHeaderContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 15 },
  sectionTitle: { fontFamily: 'Poppins_600SemiBold', color: Colors.text, fontSize: 20 },
  sectionTitleNoPadding: { fontFamily: 'Poppins_600SemiBold', color: Colors.text, fontSize: 20 },
  seeAllText: { fontFamily: 'Poppins_500Medium', color: Colors.secondary, fontSize: 14 },
  
  // Featured Card Styles
  featuredCard: { width: width - 40, height: width * 0.6, borderRadius: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20 },
  featuredBg: { width: width * 1.5, height: '100%' }, // Wider image for parallax effect
  featuredOverlay: { ...StyleSheet.absoluteFillObject, flexDirection: 'row', alignItems: 'flex-end', padding: 20, borderRadius: 24 },
  featuredCover: { width: 100, height: 150, borderRadius: 12, borderWidth: 2, borderColor: 'rgba(255,255,255,0.8)', shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.5, shadowRadius: 10 },
  featuredTextContainer: { flex: 1, marginLeft: 15, marginBottom: 5 },
  featuredSubtitle: { fontFamily: 'Poppins_500Medium', color: Colors.textSecondary, fontSize: 13, marginBottom: 2 },
  featuredTitle: { fontFamily: 'Poppins_700Bold', color: Colors.text, fontSize: 22, lineHeight: 28, textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 5 },
  readNowButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.secondary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, alignSelf: 'flex-start', marginTop: 10 },
  readNowButtonText: { fontFamily: 'Poppins_600SemiBold', color: Colors.background, fontSize: 14, marginRight: 8 },

  // Continue Reading Card Styles
  continueCard: { width: 140, height: 210, marginRight: 15, borderRadius: 16, overflow: 'hidden', backgroundColor: Colors.surface, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
  continueImage: { width: '100%', height: '100%' },
  continueOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 12, paddingTop: 30 },
  continueTitle: { fontFamily: 'Poppins_600SemiBold', color: Colors.text, fontSize: 15, lineHeight: 19 },
  continueProgressBg: { position: 'absolute', bottom: 0, left: 4, right: 4, height: 5, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 2.5 },
  continueProgressFill: { height: '100%', backgroundColor: Colors.secondary, borderRadius: 2.5 },

  // Quest & Mission Styles
  questCard: { borderRadius: 24, padding: 20, marginHorizontal: 20, overflow: 'hidden', borderWidth: StyleSheet.hairlineWidth, borderColor: Colors.surface + '80' },
  questCardBlur: { ...StyleSheet.absoluteFillObject, borderRadius: 24 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  progressContainer: { flexDirection: 'row', alignItems: 'center' },
  statsTextContainer: { flex: 1, marginLeft: 20 },
  progressTitle: { fontFamily: 'Poppins_700Bold', color: Colors.text, fontSize: 18, marginBottom: 5 },
  statsSubtitle: { fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, fontSize: 14, lineHeight: 20 },
  progressText: { position: 'absolute', fontFamily: 'Poppins_700Bold', fontSize: 22, color: Colors.text },
  missionListContainer: { marginTop: 20, borderTopWidth: StyleSheet.hairlineWidth, borderColor: Colors.surface+'80', paddingTop: 15, gap: 10 },
  missionCard: { flexDirection: 'row', alignItems: 'center' },
  missionCompleted: {},
  missionIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  missionTitle: { fontFamily: 'Poppins_500Medium', color: Colors.text, fontSize: 15 },
  missionReward: { fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, fontSize: 12, marginTop: 2 },
  
  // Grid & Event Styles
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 20 },
  gridItem: { width: (width - 60) / 2, height: 130, borderRadius: 20, marginBottom: 20, overflow: 'hidden', borderWidth: StyleSheet.hairlineWidth, borderColor: Colors.surface + '80' },
  gridGradient: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', padding: 20, gap: 12 },
  gridIconContainer: { width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center' },
  gridTitle: { fontFamily: 'Poppins_600SemiBold', color: Colors.text, fontSize: 16 },
  eventCard: { width: width * 0.7, height: width * 0.4, marginRight: 15, borderRadius: 20, overflow: 'hidden' },
  eventImage: { flex: 1, justifyContent: 'flex-end' },
  eventOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'flex-end', padding: 15, backgroundColor: 'rgba(0,0,0,0.4)' },
  eventDate: { fontFamily: 'Poppins_600SemiBold', color: Colors.secondary, fontSize: 12 },
  eventTitle: { fontFamily: 'Poppins_700Bold', color: Colors.text, fontSize: 20, marginTop: 4 },
});

export default HomeScreen;