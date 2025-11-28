import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useSharedValue, useAnimatedScrollHandler } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';

// CORRECTED IMPORT PATHS
import { Colors } from '../../../constants/Colors';
import { upcomingEventsData } from '../../../constants/mockData'; // Removed 'forYouData'
import { HEADER_EXPANDED_HEIGHT } from './components/constants';
import HubHeader from './components/HubHeader';
import { FeaturedSectionCard, EventCard } from './components/HubComponents';

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

// A small helper component to keep the JSX clean
const Section = ({ title, children }) => (
  <View>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

const HubScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const scrollY = useSharedValue(0);

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
          paddingTop: HEADER_EXPANDED_HEIGHT + insets.top + 20, // Added padding here instead of wrapper view
          paddingBottom: insets.bottom + 90,
        }}
      >
        {/* --- Shows & Movies Section --- */}
        <Section title="Shows & Movies">
          <FeaturedSectionCard
            title="Media Hub"
            description="Discover your next favorite show or movie"
            buttonText="Explore"
            image={{ uri: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=800' }}
            onPress={() => navigation.navigate('Media')} // Navigate to the new screen
          />
        </Section>


        {/* Single column vertical feed */}
        <View style={styles.verticalFeedContainer}>
          <Section title="Upcoming Events">
            {upcomingEventsData.map(event => (
              <EventCard key={event.id} {...event} onPress={() => navigation.navigate('EventDetail', { eventId: event.id })} />
            ))}
          </Section>

          {/* --- "FOR YOU" SECTION REMOVED --- */}

        </View>
      </AnimatedScrollView>
    </View>
  );
};

// Polished Styles
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: Colors.darkBackground 
  },
  // 'horizontalScroll' style removed as it's no longer used
  sectionTitle: { 
    fontFamily: 'Poppins_600SemiBold', 
    color: Colors.text, 
    fontSize: 22, // Slightly larger for better hierarchy
    marginBottom: 15, 
    marginTop: 30, // Increased spacing between sections
    paddingHorizontal: 20 
  },
  verticalFeedContainer: { 
    paddingHorizontal: 20 
  },
});

export default HubScreen;