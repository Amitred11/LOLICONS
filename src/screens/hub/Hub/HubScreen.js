import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useSharedValue, useAnimatedScrollHandler } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { Colors } from '@config/Colors';
import { upcomingEventsData } from '@config/mockData';
import { HEADER_EXPANDED_HEIGHT } from './components/constants';
import HubHeader from './components/HubHeader';
import { FeaturedSectionCard } from './components/HubComponents';

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

  // Get the first event to display as the "Main Event"
  const mainEvent = upcomingEventsData[0];

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  return (
    <View style={styles.container}>
      <HubHeader scrollY={scrollY} />

      <AnimatedScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={{
          paddingTop: HEADER_EXPANDED_HEIGHT + insets.top + 20,
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

        {/* --- Main Event Section (Single Highlight) --- */}
        <Section 
            title="Live Events" 
            onPressSeeAll={() => navigation.navigate('Events')} // Go to the List Screen
        >
          {/* Highlight only the MAIN event here */}
          <FeaturedSectionCard
            title={mainEvent?.title || "Global Event"}
            description={mainEvent?.date || "Coming Soon"}
            buttonText="Event Details"
            image={{ uri: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800' }}
            onPress={() => navigation.navigate('EventDetail', { eventData: mainEvent })} 
          />
          
          {/* Quick link below to show there is more */}
          <TouchableOpacity 
            style={styles.moreEventsButton}
            onPress={() => navigation.navigate('Events')}
          >
            <Text style={styles.moreEventsText}>View {upcomingEventsData.length - 1}+ more upcoming events</Text>
          </TouchableOpacity>
        </Section>

      </AnimatedScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.darkBackground },
  sectionContainer: { marginBottom: 25, marginTop: 20, paddingHorizontal: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { fontFamily: 'Poppins_600SemiBold', color: Colors.text, fontSize: 22 },
  seeAllButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 15 },
  seeAllText: { fontFamily: 'Poppins_500Medium', color: Colors.primary, fontSize: 12, marginRight: 5 },
  moreEventsButton: { alignItems: 'center', marginTop: 15, padding: 10 },
  moreEventsText: { fontFamily: 'Poppins_500Medium', color: Colors.textSecondary, fontSize: 14 },
});

export default HubScreen;