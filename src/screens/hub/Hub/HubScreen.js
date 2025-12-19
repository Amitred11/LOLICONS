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


const SectionHeader = ({ title, subtitle, onPress }) => (
    <TouchableOpacity 
        onPress={onPress} 
        style={styles.sectionHeaderContainer} 
        activeOpacity={0.7}
        disabled={!onPress}
    >
        <View style={{ flex: 1 }}>
            <Text style={styles.sectionTitle}>{title}</Text>
            {!!subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
        </View>
        {onPress && (
            <View style={styles.headerActionCircle}>
                <Ionicons name="chevron-forward" size={20} color={Colors.primary} />
            </View>
        )}
    </TouchableOpacity>
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
         <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
         </View>
      ) : (
        <AnimatedScrollView
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          contentContainerStyle={{
            paddingTop: HEADER_EXPANDED_HEIGHT + insets.top + 20,
            paddingBottom: insets.bottom + 100,
          }}
        >
        {/* --- NEW: QUICK NAVIGATION BAR --- */}
        <View style={styles.quickNavScrollContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
              <TouchableOpacity style={styles.navChip} onPress={() => navigation.navigate('Media')}>
                  <Ionicons name="film-outline" size={18} color={Colors.primary} />
                  <Text style={styles.navChipText}>Movies & TV</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.navChip} onPress={() => navigation.navigate('Events')}>
                  <Ionicons name="calendar-outline" size={18} color={Colors.primary} />
                  <Text style={styles.navChipText}>Schedule</Text>
              </TouchableOpacity>
          </ScrollView>
        </View>
          
          {/* --- SECTION 1: Trending Media --- */}
          <View style={styles.carouselSection}>
            <View style={styles.sectionHeaderPadding}>
                <SectionHeader 
                    title="Trending Now" 
                    subtitle="Most watched this week" 
                    onPressSeeAll={() => navigation.navigate('Media')} 
                />
            </View>
            
            <ScrollView 
                horizontal 
                snapToInterval={170} // Card width + margin
                decelerationRate="fast"
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingLeft: 30, paddingRight: 20 }}
            >
                {featuredMediaList.map((item, index) => (
                    <MediaPosterCard
                        key={item.id}
                        rank={index + 1} // Pass the rank
                        title={item.title}
                        category={item.type}
                        image={item.poster}
                        onPress={() => navigation.navigate('MediaDetail', { mediaId: item.id })}
                    />
                ))}
            </ScrollView>
          </View>

          {/* --- SECTION 2: Spotlight Event --- */}
          <View style={styles.spotlightSection}>
            <View style={styles.sectionHeaderPadding}>
                <SectionHeader title="Spotlight" subtitle="Featured community event" />
            </View>
            
            <EventHeroCard
              title={mainEvent.title}
              description={mainEvent.desc}
              image={mainEvent.image}
              date={getEventDateObject(mainEvent.date)} 
              onPress={() => navigation.navigate('EventDetail', { eventData: mainEvent })} 
            />

            {/* Compact Secondary Button */}
            <TouchableOpacity 
              style={styles.compactViewMore}
              onPress={() => navigation.navigate('Events')}
            >
                <Text style={styles.compactViewMoreText}>View Full Schedule</Text>
                <Ionicons name="calendar-outline" size={16} color={Colors.primary} />
            </TouchableOpacity>
          </View>

        </AnimatedScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' }, // Slightly deeper dark
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  carouselSection: { marginBottom: 40 },
  spotlightSection: { marginBottom: 20 },
  sectionHeaderPadding: { paddingHorizontal: 20, marginBottom: 15 },
  
  // Compact View More Refactor
  compactViewMore: {
      flexDirection: 'row', 
      alignSelf: 'center',
      alignItems: 'center',
      marginTop: 20,
      paddingVertical: 8,
      paddingHorizontal: 16,
      backgroundColor: 'rgba(255,255,255,0.05)',
      borderRadius: 20,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.1)'
  },
  compactViewMoreText: {
      fontFamily: 'Poppins_600SemiBold',
      color: '#fff',
      fontSize: 12,
      marginRight: 8
  },

  // Existing Header Styles...
  sectionTitle: { fontFamily: 'Poppins_700Bold', color: '#fff', fontSize: 24, letterSpacing: -0.5 },
  sectionSubtitle: { fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, fontSize: 13, marginTop: -4 },
  seeAllButton: { flexDirection: 'row', alignItems: 'center' },
  seeAllText: { fontFamily: 'Poppins_600SemiBold', color: Colors.primary, fontSize: 12, marginRight: 4 },
  quickNavScrollContainer: {
      marginBottom: 30,
      marginTop: 10,
  },
  navChip: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#1A1A1A',
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 25,
      marginRight: 10,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.08)'
  },
  navChipText: {
      color: '#fff',
      fontFamily: 'Poppins_500Medium',
      fontSize: 13,
      marginLeft: 8
  },

  // Interactive Header Styles
  sectionHeaderContainer: { 
      flexDirection: 'row', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      marginBottom: 15 
  },
  headerActionCircle: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: 'rgba(255,255,255,0.05)',
      justifyContent: 'center',
      alignItems: 'center'
  },
  
});

export default HubScreen;