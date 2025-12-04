// screens/hub/HubScreen.js

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useSharedValue, useAnimatedScrollHandler } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { Colors } from '@config/Colors';
import { HEADER_EXPANDED_HEIGHT } from './components/constants';
import HubHeader from './components/HubHeader';
import { FeaturedSectionCard } from './components/HubComponents';

// Import the Service
import { EventsService } from '@api/hub/MockEventsService';

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

const Section = ({ title, children, onPressSeeAll }) => (
  <View style={styles.sectionContainer}>
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {onPressSeeAll && (
        <TouchableOpacity onPress={onPressSeeAll} style={styles.seeAllButton}>
            <Text style={styles.seeAllText}>All Events</Text>
            <Ionicons name="arrow-forward" size={14} color={Colors.primary} />
        </TouchableOpacity>
      )}
    </View>
    {children}
  </View>
);

const HubScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const scrollY = useSharedValue(0);

  // --- State for Events ---
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- Fetch Data ---
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await EventsService.getEvents();
        if (response.success) {
          setEvents(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // Calculate main event for display
  // We use a fallback object to prevent "undefined" errors if the array is empty
  const mainEvent = events.length > 0 
    ? events[0] 
    : { 
        title: "No Events Available", 
        date: "Check back later", 
        image: { uri: 'https://via.placeholder.com/800x600' } // Fallback image
      };

  return (
    <View style={styles.container}>
      <HubHeader scrollY={scrollY} />

      {/* Loading Indicator Layer */}
      {loading ? (
         <View style={[styles.loadingContainer, { paddingTop: HEADER_EXPANDED_HEIGHT + insets.top }]}>
            <ActivityIndicator size="large" color={Colors.primary} />
         </View>
      ) : (
        <AnimatedScrollView
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          contentContainerStyle={{
            paddingTop: (HEADER_EXPANDED_HEIGHT || 200) + insets.top + 20,
            paddingBottom: insets.bottom + 90,
          }}
        >
          {/* --- Shows & Movies Section --- */}
          <Section title="Featured Media">
            <FeaturedSectionCard
              title="Media Hub"
              description="Discover your next favorite show or movie"
              buttonText="Explore"
              image={{ uri: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=800' }}
              onPress={() => navigation.navigate('Media')}
            />
          </Section>

          {/* --- Main Event Section --- */}
          <Section 
              title="Live Events" 
              onPressSeeAll={() => navigation.navigate('Events', { eventsData: events })} 
          >
            <FeaturedSectionCard
              title={mainEvent.title}
              description={mainEvent.date}
              buttonText="Event Details"
              image={mainEvent.image}
              onPress={() => navigation.navigate('EventDetail', { eventData: mainEvent })} 
            />
            
            <TouchableOpacity 
              style={styles.moreEventsButton}
              onPress={() => navigation.navigate('Events', { eventsData: events })}
            >
              <Text style={styles.moreEventsText}>
                  View {events.length > 1 ? events.length - 1 : 0}+ more upcoming events
              </Text>
            </TouchableOpacity>
          </Section>

        </AnimatedScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.darkBackground },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  sectionContainer: { marginBottom: 25, marginTop: 20, paddingHorizontal: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { fontFamily: 'Poppins_600SemiBold', color: Colors.text, fontSize: 22 },
  seeAllButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 15 },
  seeAllText: { fontFamily: 'Poppins_500Medium', color: Colors.primary, fontSize: 12, marginRight: 5 },
  moreEventsButton: { alignItems: 'center', marginTop: 15, padding: 10 },
  moreEventsText: { fontFamily: 'Poppins_500Medium', color: Colors.textSecondary, fontSize: 14 },
});

export default HubScreen;