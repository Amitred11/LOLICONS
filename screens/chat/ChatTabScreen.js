// Import necessary modules from React, React Native, and third-party libraries.
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { createMaterialTopTabNavigator, MaterialTopTabBar } from '@react-navigation/material-top-tabs';
import { Colors } from '../../constants/Colors';
import Animated, { useSharedValue, useAnimatedStyle, useAnimatedScrollHandler, interpolate, Extrapolate } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
// Import the screens that will be used as tabs.
import ActivityScreen from './ActivityScreen';
import MessagesScreen from './MessagesScreen';

// Initialize the top tab navigator.
const Tab = createMaterialTopTabNavigator();

// Constants for the collapsible header animation.
const HEADER_HEIGHT = 120; // The expanded height of the header.
const COLLAPSED_HEADER_HEIGHT = 60; // The collapsed height of the header.
const SCROLL_DISTANCE = HEADER_HEIGHT - COLLAPSED_HEADER_HEIGHT; // The distance the user needs to scroll to collapse the header.

/**
 * A screen that contains a top tab navigator for "Activity" and "Messages",
 * featuring a large, collapsible header animation.
 */
const ChatTabScreen = () => {
  const insets = useSafeAreaInsets(); // Hook for safe area values.
  const scrollY = useSharedValue(0); // A shared animated value to track the scroll position.

  // This single scroll handler will be passed down to BOTH child tab screens (ActivityScreen and MessagesScreen).
  // It listens to their scroll events and updates the shared `scrollY` value.
  const scrollHandler = useAnimatedScrollHandler((event) => {
    // We only care about vertical scroll, and don't want negative values from bounce.
    scrollY.value = Math.max(0, event.contentOffset.y);
  });

  // --- Animation Styles ---
  // Animate the header's height based on the scroll position.
  const animatedHeaderStyle = useAnimatedStyle(() => ({
    height: interpolate(
      scrollY.value,
      [0, SCROLL_DISTANCE], // Input range: from scroll 0 to the full scroll distance.
      [HEADER_HEIGHT + insets.top, COLLAPSED_HEADER_HEIGHT + insets.top], // Output range: from expanded height to collapsed height.
      Extrapolate.CLAMP // Clamp the value to prevent it from going beyond the defined range.
    ),
  }));

  // Animate the opacity and position of the large title ("Social").
  const animatedLargeTitleStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, SCROLL_DISTANCE / 2], [1, 0], Extrapolate.CLAMP), // Fades out quickly.
    transform: [{ translateY: interpolate(scrollY.value, [0, SCROLL_DISTANCE], [0, -20], Extrapolate.CLAMP) }], // Moves up as it fades.
  }));

  // Animate the opacity of the small title (the current tab name).
  const animatedSmallTitleStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [SCROLL_DISTANCE * 0.7, SCROLL_DISTANCE], [0, 1], Extrapolate.CLAMP), // Fades in near the end of the scroll.
  }));

  /**
   * A custom render function for the tab bar. This allows us to integrate the
   * tab bar into our animated header component.
   */
  const renderTabBar = (props) => {
    // Get the name of the currently active route to display in the small header and change action buttons.
    const currentRouteName = props.state.routes[props.state.index].name;

    return (
      // The main header container that changes height.
      <Animated.View style={[styles.headerContainer, animatedHeaderStyle]}>
        <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={styles.headerBorder} />

        <View style={[styles.headerContent, { paddingTop: insets.top }]}>
          <View style={styles.titleContainer}>
            {/* The large title that fades out on scroll */}
            <Animated.View style={[styles.largeTitleWrapper, animatedLargeTitleStyle]}>
              <Text style={styles.largeTitle}>Social</Text>
            </Animated.View>
            {/* The small title that fades in on scroll */}
            <Animated.View style={[styles.smallTitleWrapper, animatedSmallTitleStyle]}>
              <Text style={styles.smallTitle}>{currentRouteName}</Text>
            </Animated.View>

            {/* Action buttons on the right side of the header */}
            <View style={styles.actionsWrapper}>
              {currentRouteName === 'Activity' ? (
                <TouchableOpacity style={styles.actionButton} onPress={() => Alert.alert("Find Friends")}>
                  <Ionicons name="person-add-outline" size={20} color={Colors.text} />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.actionButton} onPress={() => Alert.alert("New Chat")}>
                  <Ionicons name="create-outline" size={22} color={Colors.text} />
                </TouchableOpacity>
              )}
            </View>
          </View>
          {/* Render the actual material top tab bar inside our animated container. */}
          <MaterialTopTabBar {...props} style={styles.tabBar} />
        </View>
      </Animated.View>
    );
  };

  return (
    <Tab.Navigator
      tabBar={renderTabBar} // Use our custom render function.
      sceneContainerStyle={{ backgroundColor: Colors.background }}
      screenOptions={{
        tabBarIndicatorStyle: { backgroundColor: Colors.secondary, height: 3, borderRadius: 3, width: '40%', marginLeft: '5%' },
        tabBarLabelStyle: { fontFamily: 'Poppins_600SemiBold', textTransform: 'capitalize', fontSize: 16 },
        tabBarActiveTintColor: Colors.text,
        tabBarInactiveTintColor: Colors.textSecondary,
      }}
    >
      {/* Pass the scrollHandler and headerHeight as props to each screen component. */}
      <Tab.Screen name="Activity">
        {(props) => <ActivityScreen {...props} scrollHandler={scrollHandler} headerHeight={HEADER_HEIGHT} />}
      </Tab.Screen>
      <Tab.Screen name="Messages">
        {(props) => <MessagesScreen {...props} scrollHandler={scrollHandler} headerHeight={HEADER_HEIGHT} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

// Styles for the component.
const styles = StyleSheet.create({
  headerContainer: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
  headerBorder: { position: 'absolute', bottom: 0, left: 0, right: 0, height: StyleSheet.hairlineWidth, backgroundColor: Colors.surface + '80' },
  headerContent: { flex: 1, flexDirection: 'column' },
  titleContainer: { flex: 1, justifyContent: 'center', paddingHorizontal: 20, overflow: 'hidden' },
  largeTitleWrapper: { position: 'absolute', left: 20, bottom: 50 },
  largeTitle: { fontFamily: 'Poppins_700Bold', color: Colors.text, fontSize: 34 },
  smallTitleWrapper: { position: 'absolute', left: 0, right: 0, bottom: 50, alignItems: 'center' },
  smallTitle: { fontFamily: 'Poppins_600SemiBold', color: Colors.text, fontSize: 17 },
  actionsWrapper: { position: 'absolute', right: 20, bottom: 58, flexDirection: 'row' },
  actionButton: { height: 36, width: 36, borderRadius: 18, backgroundColor: Colors.surface + '90', alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
  tabBar: { backgroundColor: 'transparent', position: 'absolute', bottom: 0, left: 0, right: 0 },
});

export default ChatTabScreen;