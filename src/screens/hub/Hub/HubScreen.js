// screens/hub/HubScreen.js

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useSharedValue, useAnimatedScrollHandler } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { Colors } from '@config/Colors';
import { HEADER_EXPANDED_HEIGHT } from './components/constants';
import HubHeader from './components/HubHeader';

// Components
import { EventHeroCard, MediaPosterCard } from './components/HubComponents';

// Contexts
import { useEvents } from '@context/hub/EventsContext';
import { useMedia } from '@context/hub/MediaContext'; 

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

// Helper for formatted date
const getEventDateObject = (dateString) => {
    return { month: 'DEC', day: '24' }; 
};

const SectionHeader = ({ title, subtitle, onPressSeeAll }) => (
    <View style={styles.sectionHeaderContainer}>
        <View>
            <Text style={styles.sectionTitle}>{title}</Text>
            {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
        </View>
        {onPressSeeAll && (
            <TouchableOpacity onPress={onPressSeeAll} style={styles.seeAllButton}>
                <Text style={styles.seeAllText}>View All</Text>
                <Ionicons name="chevron-forward" size={14} color={Colors.primary} />
            </TouchableOpacity>
        )}
    </View>
);

const HubScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const scrollY = useSharedValue(0);

  // --- Consume Contexts ---
  const { events, isLoading: isEventsLoading } = useEvents();
  const { mediaData, isLoading: isMediaLoading } = useMedia();

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // Main Event Logic
  const mainEvent = events.length > 0 ? events[0] : { 
      id: 'placeholder',
      title: "Winter Championship", 
      desc: "The biggest community showdown of the year is finally here.",
      date: "2025-12-24", 
      image: { uri: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800' } // Reliable Gaming Image
  };

  // Featured Media Logic (Filter for 'Trending' or take top 5)
  // Ensure we have data to map
  const trendingMedia = mediaData && mediaData.length > 0 
    ? mediaData.filter(item => item.tags && item.tags.includes('Trending'))
    : [];
    
  const featuredMediaList = trendingMedia.length > 0 ? trendingMedia : (mediaData || []).slice(0, 5);

  const isGlobalLoading = (isEventsLoading && events.length === 0) || (isMediaLoading && (!mediaData || mediaData.length === 0));

  return (
    <View style={styles.container}>
      <HubHeader scrollY={scrollY} />

      {isGlobalLoading ? (
         <View style={[styles.loadingContainer, { paddingTop: HEADER_EXPANDED_HEIGHT }]}>
            <ActivityIndicator size="large" color={Colors.primary} />
         </View>
      ) : (
        <AnimatedScrollView
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingTop: HEADER_EXPANDED_HEIGHT + insets.top + 20,
            paddingBottom: insets.bottom + 90,
          }}
        >
          
          {/* --- SECTION 1: Trending Media (Horizontal Scroll) --- */}
          {featuredMediaList.length > 0 && (
            <View style={styles.carouselSection}>
                <View style={{ paddingHorizontal: 20 }}>
                    <SectionHeader 
                        title="Trending Now" 
                        subtitle="Movies, Shows & Anime" 
                        onPressSeeAll={() => navigation.navigate('Media')} 
                    />
                </View>
                
                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingLeft: 20, paddingRight: 4, paddingTop: 10, paddingBottom: 20 }}
                >
                    {featuredMediaList.map((item) => (
                        <MediaPosterCard
                            key={item.id}
                            title={item.title}
                            category={item.type}
                            image={item.poster}
                            onPress={() => navigation.navigate('MediaDetail', { mediaId: item.id })}
                        />
                    ))}
                </ScrollView>
            </View>
          )}

          {/* --- SECTION 2: Main Event (Hero Card) --- */}
          <View style={styles.sectionContainer}>
            <SectionHeader 
                title="Upcoming Highlight" 
                subtitle="Don't miss the action"
            />
            
            <EventHeroCard
              title={mainEvent.title}
              description={mainEvent.desc}
              image={mainEvent.image}
              date={getEventDateObject(mainEvent.date)} 
              onPress={() => navigation.navigate('EventDetail', { eventData: mainEvent })} 
            />

            <TouchableOpacity 
              style={styles.viewMoreEventsButton}
              onPress={() => navigation.navigate('Events', { eventsData: events })}
              activeOpacity={0.7}
            >
                <View style={styles.viewMoreLeft}>
                    <View style={styles.calendarIconBox}>
                         <Ionicons name="calendar" size={18} color={Colors.primary} />
                    </View>
                    <View>
                        <Text style={styles.viewMoreTitle}>View Schedule</Text>
                        <Text style={styles.viewMoreSubtitle}>
                            {events.length > 1 ? `+${events.length - 1} more events` : 'Check future dates'}
                        </Text>
                    </View>
                </View>
                <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

        </AnimatedScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.darkBackground },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  carouselSection: { marginBottom: 10 },
  sectionContainer: { marginBottom: 35, paddingHorizontal: 20 },
  
  sectionHeaderContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  sectionTitle: { fontFamily: 'Poppins_700Bold', color: Colors.text, fontSize: 22, letterSpacing: -0.5 },
  sectionSubtitle: { fontFamily: 'Poppins_500Medium', color: Colors.textSecondary, fontSize: 13, marginTop: -2 },
  
  seeAllButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 12 },
  seeAllText: { fontFamily: 'Poppins_600SemiBold', color: Colors.primary, fontSize: 12, marginRight: 2 },
  
  viewMoreEventsButton: { 
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      marginTop: 20, padding: 16, 
      backgroundColor: '#1E1E1E', 
      borderRadius: 18,
      borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)'
  },
  viewMoreLeft: { flexDirection: 'row', alignItems: 'center' },
  calendarIconBox: { 
      width: 40, height: 40, borderRadius: 12, 
      backgroundColor: 'rgba(255, 107, 107, 0.15)', 
      alignItems: 'center', justifyContent: 'center', 
      marginRight: 14 
  },
  viewMoreTitle: { fontFamily: 'Poppins_600SemiBold', color: '#fff', fontSize: 15 },
  viewMoreSubtitle: { fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, fontSize: 12 },
});

export default HubScreen;