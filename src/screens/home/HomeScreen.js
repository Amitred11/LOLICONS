import React, { useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, Image, Dimensions, TouchableOpacity, StatusBar, ActivityIndicator, RefreshControl } from 'react-native';
import { useAuth } from '@context/main/AuthContext';
import { useAlert } from '@context/other/AlertContext'; 
import { useHome } from '@context/main/HomeContext';
import { Colors } from '@config/Colors';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, useAnimatedScrollHandler, interpolate } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { BlurView } from 'expo-blur';

import AnimatedSection from './components/AnimatedSection';
import FeaturedCard from './components/FeaturedCard';
import ContinueReadingCard from './components/ContinueReadingCard';
import DailyGoalsWidget from './components/DailyGoalsWidget';
import QuickActions from './components/QuickActions';
import EventCard from './components/EventCard';
import EmptyState from './components/empty/EmptyState';

const { width } = Dimensions.get('window');
const HEADER_HEIGHT = 100;
const COLLAPSED_HEADER_HEIGHT = 60;
const SCROLL_DISTANCE = HEADER_HEIGHT - COLLAPSED_HEADER_HEIGHT;
const CARD_WIDTH = width - 48;
const SNAP_SIZE = CARD_WIDTH + 12;

const HomeScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { showAlert, showToast } = useAlert(); 
  const { user } = useAuth();
  
  const { isLoading, isRefreshing, featuredComics, continueReading, dailyGoals, upcomingEvents, refreshData, logVisitHistory, logMissionCompleted } = useHome();
  
  const scrollY = useSharedValue(0);
  const scrollX = useSharedValue(0);
  
  const displayUser = useMemo(() => user || { name: 'Guest', xp: 0, avatarUrl: null, username: 'Guest' }, [user]);
  
  const dailyProgress = useMemo(() => {
    if (!dailyGoals || dailyGoals.length === 0) return 0;
    return dailyGoals.filter(g => (g.progress || 0) >= (g.total || 1)).length / dailyGoals.length;
  }, [dailyGoals]);

  const handleGoalPress = useCallback((goal) => {
    if (goal.completed || goal.progress >= goal.total) {
        return;
    }

    switch (goal.type) {
        case 'read':
        case 'explore_featured': // Also navigates to explore comics
            navigation.navigate('Comics');
            break;
        case 'rate':
            navigation.navigate('Comics', { screen: 'MyBookshelf' });
            break;
        case 'library':
            navigation.navigate('Search');
            break;
        case 'comment':
            showToast("Find any comic and leave a comment on a chapter to complete this goal!", 'info' );
            navigation.navigate('Comics');
            break;
        case 'share':
            showToast( "Navigate to any comic's detail page and use the share button.", 'info' );
            break;
        case 'explore_genre':
            navigation.navigate('Search', { focus: 'genres' });
            break;
        case 'history':
            // This action can be completed right here
            logVisitHistory();
            break;
        // --- NEW: Handle the 'mission' goal type ---
        case 'mission':
            showToast("You completed the special mission! Your reward has been granted.", 'info' );
            logMissionCompleted();
            break;
        case 'time':
            showToast( "This goal progresses automatically as you spend time reading.", 'info' );
            break;
        default:
            showToast("No specific action is tied to this goal. It may update automatically.", 'info' );
            break;
    }
  }, [navigation, showToast, logVisitHistory, logMissionCompleted]);

  const handleScroll = useAnimatedScrollHandler((e) => { scrollY.value = e.contentOffset.y; });
  const handleParallaxScroll = useAnimatedScrollHandler((e) => { scrollX.value = e.contentOffset.x; });

  // Animation Styles
  const headerStyle = useAnimatedStyle(() => ({ height: interpolate(scrollY.value, [0, SCROLL_DISTANCE], [insets.top + HEADER_HEIGHT, insets.top + COLLAPSED_HEADER_HEIGHT], 'clamp') }));
  const blurStyle = useAnimatedStyle(() => ({ opacity: interpolate(scrollY.value, [0, SCROLL_DISTANCE], [0, 1], 'clamp') }));
  const largeHeaderStyle = useAnimatedStyle(() => ({ 
      opacity: interpolate(scrollY.value, [0, SCROLL_DISTANCE / 2], [1, 0], 'clamp'),
      transform: [{ translateY: interpolate(scrollY.value, [0, SCROLL_DISTANCE / 2], [0, -20], 'clamp') }]
  }));
  const compactHeaderStyle = useAnimatedStyle(() => ({
      opacity: interpolate(scrollY.value, [SCROLL_DISTANCE / 2, SCROLL_DISTANCE], [0, 1], 'clamp'),
      transform: [{ translateY: interpolate(scrollY.value, [SCROLL_DISTANCE / 2, SCROLL_DISTANCE], [20, 0], 'clamp') }]
  }));

  const renderFeatured = useCallback(({ item, index }) => (
    <FeaturedCard item={item} index={index} scrollX={scrollX} onPress={() => navigation.navigate('ComicDetail', { comicId: item.id })} />
  ), []);

  const renderContinue = useCallback(({ item }) => (
    <ContinueReadingCard item={item} onPress={() => navigation.navigate('ComicDetail', { comicId: item.id })} />
  ), []);

  // --- NEW: Notification Button Component ---
  const NotificationBtn = () => (
    <TouchableOpacity 
        onPress={() => navigation.navigate('Notifications')} 
        style={styles.iconBtn}
    >
        <Ionicons name="notifications-outline" size={24} color={Colors.text} />
        {/* Red Dot for unread notifications */}
        <View style={styles.notificationDot} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <Animated.View style={[styles.header, headerStyle]}>
        <Animated.View style={[StyleSheet.absoluteFill, blurStyle]}>
            <BlurView intensity={90} tint="dark" style={StyleSheet.absoluteFill}/>
            <View style={styles.headerBorder}/>
        </Animated.View>
        
        <View style={[styles.headerContent, { paddingTop: insets.top }]}>
            
            {/* LARGE HEADER (Expanded) */}
            <Animated.View style={[styles.largeHeaderContainer, largeHeaderStyle]}>
                <View>
                    <Text style={styles.headerSubtitle}>Welcome Back,</Text>
                    <Text style={styles.headerTitle}>{displayUser.username || displayUser.name}</Text>
                </View>
                
                {/* Right Side: Bell + Avatar */}
                <View style={styles.headerRightActions}>
                    <NotificationBtn />
                    <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={styles.avatarBtn}>
                        <Image source={displayUser.avatarUrl ? { uri: displayUser.avatarUrl } : { uri: 'https://via.placeholder.com/150' }} style={styles.avatarImg} />
                    </TouchableOpacity>
                </View>
            </Animated.View>

            {/* COMPACT HEADER (Collapsed) */}
            <Animated.View style={[styles.compactHeaderContainer, compactHeaderStyle]}>
                <TouchableOpacity style={styles.searchBar} onPress={() => navigation.navigate('Search')}>
                    <Ionicons name="search" size={18} color={Colors.textSecondary} />
                    <Text style={styles.searchPlaceholder}>Find a story...</Text>
                </TouchableOpacity>

                {/* Right Side: Bell (Avatar removed to save space or kept small) */}
                <View style={styles.headerRightActions}>
                    <NotificationBtn />
                </View>
            </Animated.View>
        </View>
      </Animated.View>

      {isLoading ? (
          <View style={styles.loadingContainer}><ActivityIndicator size="large" color={Colors.primary} /></View>
      ) : (
        <Animated.ScrollView
            onScroll={handleScroll}
            scrollEventThrottle={16}
            contentContainerStyle={[styles.scrollContainer, { paddingTop: insets.top + HEADER_HEIGHT }]}
            showsVerticalScrollIndicator={false}
            refreshControl={
                <RefreshControl 
                    refreshing={isRefreshing} 
                    onRefresh={refreshData} 
                    tintColor={Colors.primary}
                    progressBackgroundColor={Colors.surface}
                    colors={[Colors.primary]} 
                />
            }
        >
            <AnimatedSection index={0}>
                {featuredComics && featuredComics.length > 0 ? (
                    <Animated.FlatList 
                        data={featuredComics} 
                        renderItem={renderFeatured} 
                        keyExtractor={item => item.id} 
                        horizontal 
                        onScroll={handleParallaxScroll} 
                        showsHorizontalScrollIndicator={false} 
                        contentContainerStyle={styles.featuredList}
                        snapToInterval={SNAP_SIZE} 
                        decelerationRate="fast"
                        snapToAlignment="center"
                    />
                ) : (
                    <EmptyState icon="star-outline" title="No Featured Comics" message="We couldn't find any trending comics." style={{ paddingVertical: 40 }} />
                )}
            </AnimatedSection>
            
            <AnimatedSection index={1}>
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Jump Back In</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Comics')}><Text style={styles.seeAllText}>All</Text></TouchableOpacity>
                    </View>
                    {continueReading && continueReading.length > 0 ? (
                        <Animated.FlatList 
                            data={continueReading} 
                            renderItem={renderContinue} 
                            keyExtractor={item => item.id} 
                            horizontal 
                            showsHorizontalScrollIndicator={false} 
                            contentContainerStyle={styles.hList}
                        />
                    ) : (
                        <EmptyState icon="book-outline" title="No History Yet" message="Start reading to see progress here." actionLabel="Explore" onAction={() => navigation.navigate('Comics')} style={{ paddingVertical: 10 }} />
                    )}
                </View>
            </AnimatedSection>

            <AnimatedSection index={2}>
                {dailyGoals && dailyGoals.length > 0 ? (
                    <DailyGoalsWidget 
                        goals={dailyGoals} 
                        dailyProgress={dailyProgress} 
                        onGoalPress={handleGoalPress} 
                    />
                ) : (
                    <View style={styles.section}><EmptyState icon="trophy-outline" title="No Active Goals" message="You're all caught up!" /></View>
                )}
            </AnimatedSection>
            
            <AnimatedSection index={3}>
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { paddingHorizontal: 20 }]}>Explore</Text>
                    <QuickActions actions={[
                        { title: 'My Bookshelf', subtitle: 'Saved Comics', icon: 'bookmarks-outline', color: '#4A90E2', target: 'Comics' },
                        { title: 'Discussions', subtitle: 'Join the talk', icon: 'chatbubbles-outline', color: '#8E44AD', target: 'Community' },
                        { title: 'Inbox', subtitle: 'Messages', icon: 'mail-outline', color: '#FF5A5F', target: 'ChatList' },
                        { title: 'Account', subtitle: 'Settings', icon: 'settings-outline', color: '#27AE60', target: 'Profile' },
                    ]} onActionPress={(item) => navigation.navigate(item.target)} />
                </View>
            </AnimatedSection>

            <AnimatedSection index={4}>
                <View style={styles.section}>
                    <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Upcoming Events</Text></View>
                    {upcomingEvents && upcomingEvents.length > 0 ? (
                        <EventCard item={upcomingEvents[0]} onPress={() => navigation.navigate('EventDetail', { eventData: upcomingEvents[0] })} />
                    ) : (
                        <EmptyState icon="calendar-outline" title="No Events Found" message="Check back later." />
                    )}
                </View>
            </AnimatedSection>
        </Animated.ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1, justifyContent: 'flex-end' },
  headerBorder: { position: 'absolute', bottom: 0, left: 0, right: 0, height: StyleSheet.hairlineWidth, backgroundColor: Colors.surface + '80' },
  headerContent: { width: '100%', paddingHorizontal: 20, paddingBottom: 15, height: '100%', justifyContent: 'flex-end' },
  largeHeaderContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  compactHeaderContainer: { position: 'absolute', left: 0, right: 0, bottom: 0, height: COLLAPSED_HEADER_HEIGHT, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, gap: 15 },
  headerSubtitle: { fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, fontSize: 16 },
  headerTitle: { fontFamily: 'Poppins_700Bold', color: Colors.text, fontSize: 28 },
  
  // Right Actions (Bell + Avatar)
  headerRightActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  
  // Icon Button Style
  iconBtn: { 
    width: 40, 
    height: 40, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: Colors.surface, 
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)'
  },
  
  // Red Dot Style
  notificationDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary, // Or red
    borderWidth: 1.5,
    borderColor: Colors.surface
  },

  avatarBtn: { width: 48, height: 48, borderRadius: 24, borderWidth: 2, borderColor: Colors.surface, overflow: 'hidden' },
  avatarImg: { width: '100%', height: '100%' },
  
  searchBar: { flex: 1, height: 40, backgroundColor: Colors.surface, borderRadius: 12, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15 },
  searchPlaceholder: { color: Colors.textSecondary, marginLeft: 10, fontFamily: 'Poppins_400Regular', fontSize: 14 },
  
  scrollContainer: { paddingBottom: 120, gap: 25 },
  section: { paddingVertical: 5 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingHorizontal: 20, marginBottom: 15 },
  sectionTitle: { fontFamily: 'Poppins_600SemiBold', color: Colors.text, fontSize: 20 },
  seeAllText: { fontFamily: 'Poppins_500Medium', color: Colors.secondary, fontSize: 14, marginBottom: 2 },
  featuredList: { paddingHorizontal: (width - CARD_WIDTH) / 2, paddingBottom: 15 },
  hList: { paddingHorizontal: 20 },
});

export default HomeScreen;