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
import GlitchEffect from '../profile/components/GlitchEffect'; // Un-commented and restored
import { upcomingEvents, comicsData, ranks, userData } from '../../constants/mockData';

// --- REFINE MOCK DATA FOR CLARITY ---
const friendlyGoals = [
    { id: '1', title: 'Read for 15 Minutes', icon: 'time-outline', progress: 0.75, target: '15m' },
    { id: '2', title: 'Finish 1 Chapter', icon: 'book-outline', progress: 0, target: '1 Ch' },
];

const friendlyActions = [
    { title: 'My Bookshelf', subtitle: 'Saved Comics', icon: 'bookmarks-outline', color: '#4A90E2', target: 'Comics' },
    { title: 'Discussions', subtitle: 'Join the talk', icon: 'chatbubbles-outline', color: '#8E44AD', target: 'Community' },
    { title: 'Inbox', subtitle: 'Messages', icon: 'mail-outline', color: '#FF5A5F', target: 'Chat' },
    { title: 'Account', subtitle: 'Settings', icon: 'settings-outline', color: '#27AE60', target: 'Profile' },
];

// Get screen width for layout calculations.
const { width } = Dimensions.get('window');
const HEADER_HEIGHT = 100;
const COLLAPSED_HEADER_HEIGHT = 60;
const SCROLL_DISTANCE = HEADER_HEIGHT - COLLAPSED_HEADER_HEIGHT;

// --- Helper & Animated Components ---

const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
};

// RESTORED: This function is required to determine if the Glitch should show
const getCurrentRank = (xp) => { 
    const foundRank = ranks.slice().reverse().find(rank => xp >= rank.minXp);
    return foundRank || ranks[0];
};

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

const AnimatedSection = ({ children, index }) => {
    const opacity = useSharedValue(0);
    const translateY = useSharedValue(30);
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

const Avatar = ({ source, size = 48, onPress }) => (
    <TouchableOpacity 
        onPress={onPress} 
        style={[styles.avatarContainer, { width: size, height: size, borderRadius: size / 2 }]}
    >
        <Image source={source} style={{ width: '100%', height: '100%' }} />
    </TouchableOpacity>
);

const CircularProgressChart = ({ size = 80, strokeWidth = 8, progress = 0.75 }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const progressValue = useSharedValue(0);
    useEffect(() => { progressValue.value = withDelay(500, withTiming(progress, { duration: 1000 })); }, [progress]);
    const animatedCircleProps = useAnimatedProps(() => ({ strokeDashoffset: circumference * (1 - progressValue.value) }));
    
    return (
        <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
            <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                <Circle cx={size / 2} cy={size / 2} r={radius} stroke={Colors.surface} strokeWidth={strokeWidth} />
                <AnimatedCircle cx={size / 2} cy={size / 2} r={radius} stroke={Colors.secondary} strokeWidth={strokeWidth} strokeDasharray={circumference} animatedProps={animatedCircleProps} strokeLinecap="round" transform={`rotate(-90 ${size / 2} ${size / 2})`}/>
            </Svg>
            <Ionicons name="flame" size={24} color={Colors.secondary} style={{ position: 'absolute' }} />
        </View>
    );
};

const FeaturedCard = ({ item, onPress, index, scrollX }) => {
    const cardWidth = width - 40;
    const inputRange = [(index - 1) * cardWidth, index * cardWidth, (index + 1) * cardWidth];
    const animatedParallaxStyle = useAnimatedStyle(() => {
        const translateX = interpolate(scrollX.value, inputRange, [-cardWidth * 0.2, 0, cardWidth * 0.2], Extrapolate.CLAMP);
        return { transform: [{ translateX }] };
    });
    return (
        <TouchableOpacity onPress={onPress} style={styles.featuredCard}>
            <Animated.View style={[StyleSheet.absoluteFill, { overflow: 'hidden', borderRadius: 24 }]}>
                <Animated.Image source={item.localSource} style={[styles.featuredBg, animatedParallaxStyle]} />
            </Animated.View>
            <LinearGradient colors={['transparent', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0.8)']} style={styles.featuredOverlay}>
                <View style={styles.featuredTextContainer}>
                    <Text style={styles.featuredSubtitle}>RECOMMENDED FOR YOU</Text>
                    <Text style={styles.featuredTitle} numberOfLines={2}>{item.title}</Text>
                    <TouchableOpacity style={styles.readNowButton} onPress={onPress}>
                        <Text style={styles.readNowButtonText}>Read Now</Text>
                    </TouchableOpacity>
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );
};

const ContinueReadingCard = ({ item, onPress }) => {
    const progress = useSharedValue(0);
    useEffect(() => { progress.value = withTiming(item.progress || 0.75, { duration: 500 }); }, []);
    const animatedProgressStyle = useAnimatedStyle(() => ({ width: `${progress.value * 100}%` }));
    return (
        <TouchableOpacity onPress={onPress} style={styles.continueCard}>
            <Image source={item.localSource} style={styles.continueImage} />
            <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={styles.continueOverlay}>
                <Text style={styles.continueTitle} numberOfLines={2}>{item.title}</Text>
                <Text style={styles.continueChapter}>Chapter {item.chapters[0].id}</Text>
            </LinearGradient>
            <View style={styles.continueProgressBg}>
                <Animated.View style={[styles.continueProgressFill, animatedProgressStyle]} />
            </View>
        </TouchableOpacity>
    );
};

const GoalRow = ({ goal, onPress }) => {
    const isCompleted = goal.progress >= 1;
    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.goalRow}>
            <View style={[styles.goalIcon, { backgroundColor: isCompleted ? Colors.secondary + '20' : Colors.surface }]}>
                <Ionicons name={goal.icon} size={20} color={isCompleted ? Colors.secondary : Colors.textSecondary} />
            </View>
            <View style={{ flex: 1, paddingHorizontal: 12 }}>
                <Text style={[styles.goalTitle, isCompleted && { textDecorationLine: 'line-through', opacity: 0.6 }]}>{goal.title}</Text>
            </View>
            {isCompleted ? (
                <Ionicons name="checkmark-circle" size={24} color={Colors.secondary} />
            ) : (
                <View style={styles.radioButton} />
            )}
        </TouchableOpacity>
    );
};

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

const ActionButton = ({ item, onPress }) => (
    <TouchableOpacity onPress={onPress} style={styles.actionButton}>
        <View style={[styles.actionIconContainer, { backgroundColor: item.color + '15' }]}>
            <Ionicons name={item.icon} size={28} color={item.color} />
        </View>
        <View style={styles.actionTextContainer}>
            <Text style={styles.actionTitle}>{item.title}</Text>
            <Text style={styles.actionSubtitle}>{item.subtitle}</Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} style={{ opacity: 0.5 }}/>
    </TouchableOpacity>
);

// --- Main HomeScreen Component ---
const HomeScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { user } = useAuth();
  const scrollY = useSharedValue(0);
  const scrollX = useSharedValue(0);

  const greeting = getGreeting();
  const dailyProgress = 0.75; 
  
  // FIXED: Ensure getCurrentRank is available
  const currentRank = useMemo(() => getCurrentRank(userData.xp), []);

  const scrollHandler = useAnimatedScrollHandler((event) => { scrollY.value = event.contentOffset.y; });
  const parallaxScrollHandler = useAnimatedScrollHandler((event) => { scrollX.value = event.contentOffset.x; });

  const animatedHeaderStyle = useAnimatedStyle(() => ({ height: interpolate(scrollY.value, [0, SCROLL_DISTANCE], [insets.top + HEADER_HEIGHT, insets.top + COLLAPSED_HEADER_HEIGHT], Extrapolate.CLAMP) }));
  const animatedBlurStyle = useAnimatedStyle(() => ({ opacity: interpolate(scrollY.value, [0, SCROLL_DISTANCE], [0, 1], Extrapolate.CLAMP) }));
  
  const animatedLargeHeaderStyle = useAnimatedStyle(() => ({
      opacity: interpolate(scrollY.value, [0, SCROLL_DISTANCE / 2], [1, 0], Extrapolate.CLAMP),
      transform: [{ translateY: interpolate(scrollY.value, [0, SCROLL_DISTANCE / 2], [0, -20], Extrapolate.CLAMP) }]
  }));
  
  const animatedSearchAndCompactStyle = useAnimatedStyle(() => ({
      opacity: interpolate(scrollY.value, [SCROLL_DISTANCE / 2, SCROLL_DISTANCE], [0, 1], Extrapolate.CLAMP),
      transform: [{ translateY: interpolate(scrollY.value, [SCROLL_DISTANCE / 2, SCROLL_DISTANCE], [20, 0], Extrapolate.CLAMP) }]
  }));

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {currentRank.name === '¿¿' && (
          <View style={styles.glitchContainer} pointerEvents="none">
             <GlitchEffect />
          </View>
      )}
      
      {/* Animated Header */}
      <Animated.View style={[styles.header, animatedHeaderStyle]}>
        <Animated.View style={[StyleSheet.absoluteFill, animatedBlurStyle]}>
            <BlurView intensity={90} tint="dark" style={StyleSheet.absoluteFill}/>
            <View style={styles.headerBorder}/>
        </Animated.View>
        
        <View style={[styles.headerContent, { paddingTop: insets.top }]}>
            {/* Expanded Header */}
            <Animated.View style={[styles.largeHeaderContainer, animatedLargeHeaderStyle]}>
                <View>
                    <Text style={styles.headerSubtitle}>{greeting},</Text>
                    <Text style={styles.headerTitle}>{user?.username || userData.name}</Text>
                </View>
                <Avatar source={userData.avatarUrl} onPress={() => navigation.navigate('Profile')} />
            </Animated.View>

            {/* Compact Header */}
            <Animated.View style={[styles.compactHeaderContainer, animatedSearchAndCompactStyle]}>
                <TouchableOpacity style={styles.searchBar} onPress={() => navigation.navigate('Search')}>
                    <Ionicons name="search" size={18} color={Colors.textSecondary} />
                    <Text style={styles.searchPlaceholder}>Find a story...</Text>
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
            <Animated.FlatList 
                data={comicsData.filter(c => c.isPopular)} 
                renderItem={({ item, index }) => <FeaturedCard item={item} index={index} scrollX={scrollX} onPress={() => navigation.navigate('ComicDetail', { comicId: item.id })} />} 
                keyExtractor={item => item.id} 
                horizontal 
                pagingEnabled 
                onScroll={parallaxScrollHandler} 
                showsHorizontalScrollIndicator={false} 
                contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 15 }} 
                snapToInterval={width - 40} 
                decelerationRate="fast"
            />
        </AnimatedSection>
        
        {/* Continue Reading Section */}
        <AnimatedSection index={1}>
            <View style={styles.section}>
                <View style={styles.sectionHeaderContainer}>
                    <View>
                        <Text style={styles.sectionTitle}>Jump Back In</Text>
                        <Text style={styles.sectionSubtitle}>Stories you're currently reading</Text>
                    </View>
                    <TouchableOpacity onPress={() => navigation.navigate('HistoryTab')}><Text style={styles.seeAllText}>All</Text></TouchableOpacity>
                </View>
                <FlatList data={comicsData.slice(0, 4)} renderItem={({ item }) => <ContinueReadingCard item={item} onPress={() => navigation.navigate('Reader', { comicId: item.id, chapterId: item.chapters[0].id })} />} keyExtractor={item => item.id} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}/>
            </View>
        </AnimatedSection>

        {/* Daily Goals (Friendly Version) */}
        <AnimatedSection index={2}>
            <View style={styles.goalCard}>
                <View style={styles.goalCardHeader}>
                    <View>
                        <Text style={styles.sectionTitleNoPadding}>Daily Goals</Text>
                        <Text style={styles.goalCardSubtitle}>Build your reading habit</Text>
                    </View>
                    <CircularProgressChart progress={dailyProgress} size={50} strokeWidth={6} />
                </View>
                
                <View style={styles.goalsList}>
                    {friendlyGoals.map((goal) => (
                        <GoalRow key={goal.id} goal={goal} onPress={() => Alert.alert("Goal Update", "This would track your reading progress!")} />
                    ))}
                </View>
            </View>
        </AnimatedSection>
        
        {/* Explore & Connect (Friendly Version) */}
        <AnimatedSection index={3}>
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { paddingHorizontal: 20, marginBottom: 5 }]}>Explore & Connect</Text>
                <View style={styles.actionGrid}>
                    {friendlyActions.map((item) => (
                        <ActionButton key={item.title} item={item} onPress={() => navigation.navigate(item.target)} />
                    ))}
                </View>
            </View>
        </AnimatedSection>

        {/* Upcoming Events Section */}
        <AnimatedSection index={4}>
            <View style={styles.section}>
                <View style={styles.sectionHeaderContainer}>
                    <Text style={styles.sectionTitle}>Upcoming Events</Text>
                </View>
                <FlatList data={upcomingEvents} renderItem={({ item }) => <EventCard item={item} />} keyExtractor={item => item.id} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}/>
            </View>
        </AnimatedSection>
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  // Glitch container ensures it overlays but doesn't block touches if configured that way
  glitchContainer: { ...StyleSheet.absoluteFillObject, zIndex: 999, elevation: 10 },
  
  header: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1, justifyContent: 'flex-end' },
  headerBorder: { position: 'absolute', bottom: 0, left: 0, right: 0, height: StyleSheet.hairlineWidth, backgroundColor: Colors.surface + '80' },
  headerContent: { width: '100%', paddingHorizontal: 20, paddingBottom: 15, height: '100%', justifyContent: 'flex-end' },
  largeHeaderContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerSubtitle: { fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, fontSize: 16 },
  headerTitle: { fontFamily: 'Poppins_700Bold', color: Colors.text, fontSize: 28 },
  avatarContainer: { borderWidth: 2, borderColor: Colors.surface, padding: 2, backgroundColor: Colors.surface, overflow: 'hidden' },
  
  compactHeaderContainer: { position: 'absolute', left: 0, right: 0, bottom: 0, height: COLLAPSED_HEADER_HEIGHT, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, gap: 15 },
  searchBar: { flex: 1, height: 40, backgroundColor: Colors.surface, borderRadius: 12, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15 },
  searchPlaceholder: { color: Colors.textSecondary, marginLeft: 10, fontFamily: 'Poppins_400Regular', fontSize: 14 },
  
  scrollContainer: { paddingBottom: 120, gap: 25 },
  section: { paddingVertical: 5 },
  sectionHeaderContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingHorizontal: 20, marginBottom: 15 },
  sectionTitle: { fontFamily: 'Poppins_600SemiBold', color: Colors.text, fontSize: 20 },
  sectionSubtitle: { fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, fontSize: 13, marginTop: 2 },
  sectionTitleNoPadding: { fontFamily: 'Poppins_600SemiBold', color: Colors.text, fontSize: 20 },
  seeAllText: { fontFamily: 'Poppins_500Medium', color: Colors.secondary, fontSize: 14, marginBottom: 2 },
  
  // Featured Card
  featuredCard: { width: width - 40, height: width * 0.55, borderRadius: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16 },
  featuredBg: { width: width * 1.5, height: '100%' }, 
  featuredOverlay: { ...StyleSheet.absoluteFillObject, flexDirection: 'row', alignItems: 'flex-end', padding: 20, borderRadius: 24 },
  featuredTextContainer: { flex: 1 },
  featuredSubtitle: { fontFamily: 'Poppins_700Bold', color: Colors.secondary, fontSize: 10, marginBottom: 4, letterSpacing: 1 },
  featuredTitle: { fontFamily: 'Poppins_700Bold', color: '#fff', fontSize: 24, lineHeight: 30, marginBottom: 12 },
  readNowButton: { backgroundColor: '#fff', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 30, alignSelf: 'flex-start' },
  readNowButtonText: { fontFamily: 'Poppins_600SemiBold', color: '#000', fontSize: 13 },

  // Continue Reading Card
  continueCard: { width: 130, height: 200, marginRight: 15, borderRadius: 12, overflow: 'hidden', backgroundColor: Colors.surface },
  continueImage: { width: '100%', height: '100%' },
  continueOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 10, paddingTop: 40 },
  continueTitle: { fontFamily: 'Poppins_600SemiBold', color: '#fff', fontSize: 14, lineHeight: 18 },
  continueChapter: { fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, fontSize: 11, marginTop: 2 },
  continueProgressBg: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, backgroundColor: 'rgba(255,255,255,0.2)' },
  continueProgressFill: { height: '100%', backgroundColor: Colors.secondary },

  // Goals
  goalCard: { backgroundColor: Colors.surface + '40', borderRadius: 20, padding: 20, marginHorizontal: 20, borderWidth: 1, borderColor: Colors.surface },
  goalCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  goalCardSubtitle: { fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, fontSize: 14 },
  goalsList: { gap: 12 },
  goalRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.background, padding: 12, borderRadius: 12 },
  goalIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  goalTitle: { fontFamily: 'Poppins_500Medium', color: Colors.text, fontSize: 14 },
  radioButton: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: Colors.textSecondary + '40' },
  
  // Actions
  actionGrid: { flexDirection: 'column', paddingHorizontal: 20, gap: 10, marginTop: 10 },
  actionButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, padding: 16, borderRadius: 16 },
  actionIconContainer: { width: 50, height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  actionTextContainer: { flex: 1 },
  actionTitle: { fontFamily: 'Poppins_600SemiBold', color: Colors.text, fontSize: 16 },
  actionSubtitle: { fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, fontSize: 13 },
  
  eventCard: { width: width * 0.7, height: width * 0.4, marginRight: 15, borderRadius: 20, overflow: 'hidden' },
  eventImage: { flex: 1, justifyContent: 'flex-end' },
  eventOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'flex-end', padding: 15, backgroundColor: 'rgba(0,0,0,0.4)' },
  eventDate: { fontFamily: 'Poppins_600SemiBold', color: Colors.secondary, fontSize: 12 },
  eventTitle: { fontFamily: 'Poppins_700Bold', color: '#fff', fontSize: 18, marginTop: 4 },
});

export default HomeScreen;