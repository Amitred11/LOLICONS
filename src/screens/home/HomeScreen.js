// screens/home/HomeScreen.js
import React, { useMemo } from 'react'; // Removed useState, useEffect
import { View, Text, StyleSheet, Image, Dimensions, FlatList, TouchableOpacity, StatusBar, ActivityIndicator, RefreshControl } from 'react-native';
import { useAuth } from '@context/main/AuthContext';
import { useAlert } from '@context/other/AlertContext'; 
// Import the new Context
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

const friendlyActions = [
    { title: 'My Bookshelf', subtitle: 'Saved Comics', icon: 'bookmarks-outline', color: '#4A90E2', target: 'Comics' },
    { title: 'Discussions', subtitle: 'Join the talk', icon: 'chatbubbles-outline', color: '#8E44AD', target: 'Community' },
    { title: 'Inbox', subtitle: 'Messages', icon: 'mail-outline', color: '#FF5A5F', target: 'ChatList' },
    { title: 'Account', subtitle: 'Settings', icon: 'settings-outline', color: '#27AE60', target: 'Profile' },
];

const { width } = Dimensions.get('window');
const HEADER_HEIGHT = 100;
const COLLAPSED_HEADER_HEIGHT = 60;
const SCROLL_DISTANCE = HEADER_HEIGHT - COLLAPSED_HEADER_HEIGHT;
const CARD_MARGIN = 12;
const CARD_WIDTH = width - 48;
const SNAP_SIZE = CARD_WIDTH + CARD_MARGIN; 

const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
};

const HomeScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { user } = useAuth();
  const { showAlert } = useAlert();
  
  // --- CONNECT TO CONTEXT ---
  const { 
    isLoading, 
    isRefreshing, 
    featuredComics, 
    continueReading, 
    dailyGoals, 
    upcomingEvents, 
    refreshData 
  } = useHome();

  const scrollY = useSharedValue(0);
  const scrollX = useSharedValue(0);

  const greeting = getGreeting();
  
  const dailyProgress = useMemo(() => {
    if (!dailyGoals || dailyGoals.length === 0) return 0;
    const completedCount = dailyGoals.filter(g => (g.progress || 0) >= (g.total || 1)).length;
    return completedCount / dailyGoals.length;
  }, [dailyGoals]);
  
  const displayUser = user || { name: 'Guest', xp: 0, avatarUrl: null, username: 'Guest' };

  const showGoalAlert = () => {
    showAlert({
        title: "Keep it up!",
        message: "Tracking your daily goals helps you level up faster.",
        type: 'success',
        btnText: "Let's Go!"
    });
  };

  const handleActionPress = (item) => {
      navigation.navigate(item.target);
  };

  const scrollHandler = useAnimatedScrollHandler((event) => { scrollY.value = event.contentOffset.y; });
  const parallaxScrollHandler = useAnimatedScrollHandler((event) => { scrollX.value = event.contentOffset.x; });

  const animatedHeaderStyle = useAnimatedStyle(() => ({ 
      height: interpolate(scrollY.value, [0, SCROLL_DISTANCE], [insets.top + HEADER_HEIGHT, insets.top + COLLAPSED_HEADER_HEIGHT], 'clamp') 
  }));
  
  const animatedBlurStyle = useAnimatedStyle(() => ({ 
      opacity: interpolate(scrollY.value, [0, SCROLL_DISTANCE], [0, 1], 'clamp') 
  }));
  
  const animatedLargeHeaderStyle = useAnimatedStyle(() => ({
      opacity: interpolate(scrollY.value, [0, SCROLL_DISTANCE / 2], [1, 0], 'clamp'),
      transform: [{ translateY: interpolate(scrollY.value, [0, SCROLL_DISTANCE / 2], [0, -20], 'clamp') }]
  }));
  
  const animatedSearchAndCompactStyle = useAnimatedStyle(() => ({
      opacity: interpolate(scrollY.value, [SCROLL_DISTANCE / 2, SCROLL_DISTANCE], [0, 1], 'clamp'),
      transform: [{ translateY: interpolate(scrollY.value, [SCROLL_DISTANCE / 2, SCROLL_DISTANCE], [20, 0], 'clamp') }]
  }));

  const Avatar = ({ source, size = 48, onPress }) => (
      <TouchableOpacity onPress={onPress} style={[styles.avatarContainer, { width: size, height: size, borderRadius: size / 2 }]}>
          <Image source={source || { uri: 'https://via.placeholder.com/150' }} style={{ width: '100%', height: '100%' }} />
      </TouchableOpacity>
  );

  const NotificationButton = ({ style }) => (
      <TouchableOpacity onPress={() => navigation.navigate('Notifications')} style={[styles.notificationBtn, style]}>
          <Ionicons name="notifications-outline" size={24} color={Colors.text} />
      </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <Animated.View style={[styles.header, animatedHeaderStyle]}>
        <Animated.View style={[StyleSheet.absoluteFill, animatedBlurStyle]}>
            <BlurView intensity={90} tint="dark" style={StyleSheet.absoluteFill}/>
            <View style={styles.headerBorder}/>
        </Animated.View>
        
        <View style={[styles.headerContent, { paddingTop: insets.top }]}>
            <Animated.View style={[styles.largeHeaderContainer, animatedLargeHeaderStyle]}>
                <View>
                    <Text style={styles.headerSubtitle}>{greeting},</Text>
                    <Text style={styles.headerTitle}>{displayUser.username || displayUser.name}</Text>
                </View>
                <View style={styles.headerRightActions}>
                    <NotificationButton />
                    <Avatar source={displayUser.avatarUrl} onPress={() => navigation.navigate('Profile')} />
                </View>
            </Animated.View>

            <Animated.View style={[styles.compactHeaderContainer, animatedSearchAndCompactStyle]}>
                <TouchableOpacity style={styles.searchBar} onPress={() => navigation.navigate('Search')}>
                    <Ionicons name="search" size={18} color={Colors.textSecondary} />
                    <Text style={styles.searchPlaceholder}>Find a story...</Text>
                </TouchableOpacity>
                <View style={styles.headerRightActions}>
                    <NotificationButton />
                    <Avatar source={displayUser.avatarUrl} size={36} onPress={() => navigation.navigate('Profile')} />
                </View>
            </Animated.View>
        </View>
      </Animated.View>

      {isLoading ? (
          <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
              <ActivityIndicator size="large" color={Colors.primary} />
          </View>
      ) : (
        <Animated.ScrollView
            onScroll={scrollHandler}
            scrollEventThrottle={16}
            style={{ flex: 1 }} 
            contentContainerStyle={[
                styles.scrollContainer, 
                { paddingTop: insets.top + HEADER_HEIGHT, flexGrow: 1 }
            ]}
            showsVerticalScrollIndicator={false}
            // Add Refresh Control here
            refreshControl={
                <RefreshControl 
                    refreshing={isRefreshing} 
                    onRefresh={refreshData}
                    tintColor={Colors.primary}
                />
            }
        >
            {/* Featured Section */}
            <AnimatedSection index={0}>
                {featuredComics && featuredComics.length > 0 ? (
                    <Animated.FlatList 
                        data={featuredComics} 
                        renderItem={({ item, index }) => (
                            <FeaturedCard 
                                item={{...item, localSource: item.image}} 
                                index={index} 
                                scrollX={scrollX} 
                                onPress={() => navigation.navigate('ComicDetail', { comicId: item.id })} 
                            />
                        )} 
                        keyExtractor={item => item.id} 
                        horizontal 
                        onScroll={parallaxScrollHandler} 
                        showsHorizontalScrollIndicator={false} 
                        contentContainerStyle={{ paddingHorizontal: (width - CARD_WIDTH) / 2, paddingBottom: 15 }} 
                        snapToInterval={SNAP_SIZE} 
                        decelerationRate="fast"
                        snapToAlignment="center"
                        removeClippedSubviews={false} 
                    />
                ) : (
                    <View style={{ marginHorizontal: 20 }}>
                        <EmptyState 
                            icon="star-outline"
                            title="No Featured Comics"
                            message="We couldn't find any trending comics at the moment."
                            style={{ paddingVertical: 40 }}
                        />
                    </View>
                )}
            </AnimatedSection>
            
            {/* Continue Reading Section */}
            <AnimatedSection index={1}>
                <View style={styles.section}>
                    <View style={styles.sectionHeaderContainer}>
                        <View>
                            <Text style={styles.sectionTitle}>Jump Back In</Text>
                            <Text style={styles.sectionSubtitle}>Stories you're currently reading</Text>
                        </View>
                        <TouchableOpacity onPress={() => navigation.navigate('Comics')}>
                            <Text style={styles.seeAllText}>All</Text>
                        </TouchableOpacity>
                    </View>

                    {continueReading && continueReading.length > 0 ? (
                        <FlatList 
                            data={continueReading} 
                            renderItem={({ item }) => (
                                <ContinueReadingCard 
                                    item={{...item, localSource: item.image}} 
                                    onPress={() => navigation.navigate('ComicDetail', { comicId: item.id })} 
                                />
                            )} 
                            keyExtractor={item => item.id} 
                            horizontal 
                            showsHorizontalScrollIndicator={false} 
                            contentContainerStyle={{ paddingHorizontal: 20 }}
                        />
                    ) : (
                        <EmptyState 
                            icon="book-outline"
                            title="No History Yet"
                            message="Start reading a comic to see your progress here."
                            actionLabel="Explore Comics"
                            onAction={() => navigation.navigate('Comics')}
                            style={{ paddingVertical: 10 }}
                        />
                    )}
                </View>
            </AnimatedSection>

            {/* Daily Goals Widget */}
            <AnimatedSection index={2}>
                {dailyGoals && dailyGoals.length > 0 ? (
                    <DailyGoalsWidget 
                        goals={dailyGoals}
                        dailyProgress={dailyProgress}
                        onGoalPress={showGoalAlert}
                    />
                ) : (
                    <View style={styles.section}>
                        <EmptyState 
                            icon="trophy-outline"
                            title="No Active Goals"
                            message="You're all caught up! Check back later for new missions."
                        />
                    </View>
                )}
            </AnimatedSection>
            
            {/* Explore & Connect Actions */}
            <AnimatedSection index={3}>
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { paddingHorizontal: 20, marginBottom: 5 }]}>Explore & Connect</Text>
                    <QuickActions 
                        actions={friendlyActions} 
                        onActionPress={handleActionPress} 
                    />
                </View>
            </AnimatedSection>

            {/* Upcoming Events Section */}
            <AnimatedSection index={4}>
                <View style={styles.section}>
                    <View style={styles.sectionHeaderContainer}>
                        <Text style={styles.sectionTitle}>Upcoming Events</Text>
                    </View>
                    
                    {upcomingEvents && upcomingEvents.length > 0 ? (
                        <EventCard 
                        item={upcomingEvents[0]} 
                        onPress={() => navigation.navigate('EventDetail', { eventData: upcomingEvents[0] })} 
                        />
                    ) : (
                        <EmptyState 
                        icon="calendar-outline"
                        title="No Events Found"
                        message="Check back later for community meetups."
                    />
                    )}
                </View>
            </AnimatedSection>
        </Animated.ScrollView>
      )}
    </View>
  );
};

// Styles remain the same...
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1, justifyContent: 'flex-end' },
  headerBorder: { position: 'absolute', bottom: 0, left: 0, right: 0, height: StyleSheet.hairlineWidth, backgroundColor: Colors.surface + '80' },
  headerContent: { width: '100%', paddingHorizontal: 20, paddingBottom: 15, height: '100%', justifyContent: 'flex-end' },
  largeHeaderContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerSubtitle: { fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, fontSize: 16 },
  headerTitle: { fontFamily: 'Poppins_700Bold', color: Colors.text, fontSize: 28 },
  avatarContainer: { borderWidth: 2, borderColor: Colors.surface, padding: 2, backgroundColor: Colors.surface, overflow: 'hidden' },
  headerRightActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  notificationBtn: { padding: 4, justifyContent: 'center', alignItems: 'center' },
  compactHeaderContainer: { position: 'absolute', left: 0, right: 0, bottom: 0, height: COLLAPSED_HEADER_HEIGHT, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, gap: 15 },
  searchBar: { flex: 1, height: 40, backgroundColor: Colors.surface, borderRadius: 12, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15 },
  searchPlaceholder: { color: Colors.textSecondary, marginLeft: 10, fontFamily: 'Poppins_400Regular', fontSize: 14 },
  scrollContainer: { paddingBottom: 120, gap: 25 },
  section: { paddingVertical: 5 },
  sectionHeaderContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingHorizontal: 20, marginBottom: 15 },
  sectionTitle: { fontFamily: 'Poppins_600SemiBold', color: Colors.text, fontSize: 20 },
  sectionSubtitle: { fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, fontSize: 13, marginTop: 2 },
  seeAllText: { fontFamily: 'Poppins_500Medium', color: Colors.secondary, fontSize: 14, marginBottom: 2 },
});

export default HomeScreen;