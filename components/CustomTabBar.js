// Import necessary modules from React and React Native.
import React from 'react';
import { View, StyleSheet, Dimensions, Platform } from 'react-native';
import AnimatedTabButton from './AnimatedTabButton';
import { Colors } from '../constants/Colors';

// Get the screen width to calculate the tab bar width dynamically.
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TAB_BAR_WIDTH = SCREEN_WIDTH * 0.9;
// Define the height of the tab bar for a sleek look.
const TAB_BAR_HEIGHT = 65;

/**
 * A custom tab bar component that displays and manages navigation tabs.
 * It's designed to be used with React Navigation's bottom tabs navigator.
 * @param {object} props - The props provided by React Navigation.
 * @param {object} props.state - The navigation state, including routes and the active index.
 * @param {object} props.descriptors - An object containing options for each screen.
 * @param {object} props.navigation - The navigation object to handle screen transitions.
 */
const CustomTabBar = ({ state, descriptors, navigation }) => {
  return (
    // Main container that positions the tab bar at the bottom of the screen.
    <View style={styles.container}>
      {/* The styled background view for the tab bar, creating the "pill" shape. */}
      <View style={styles.backgroundPill}>
        {/* Map through the navigation routes to create a button for each tab. */}
        {state.routes.map((route, index) => {
          // Determine if the current tab is the focused one.
          const isFocused = state.index === index;
          // Get the options for the current route, including custom props.
          const { options } = descriptors[route.key];
          const item = options.customProps;

          // Render an animated tab button for each route.
          return (
            <AnimatedTabButton
              key={index}
              item={item}
              isFocused={isFocused}
              onPress={() => navigation.navigate(route.name)}
            />
          );
        })}
      </View>
    </View>
  );
};

// Define the styles for the component.
const styles = StyleSheet.create({
  container: {
    position: 'absolute', // Position the tab bar over other content.
    bottom: Platform.OS === 'ios' ? 30 : 20, // Adjust bottom spacing based on OS.
    width: TAB_BAR_WIDTH,
    height: TAB_BAR_HEIGHT,
    alignSelf: 'center', // Center the tab bar horizontally.
  },
  backgroundPill: {
    flex: 1, // Take up the full space of the container.
    flexDirection: 'row', // Align tab buttons horizontally.
    backgroundColor: Colors.surface,
    borderRadius: 40, // Create the rounded pill shape.
    // Add shadow for a floating effect.
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 10, // Elevation for Android shadow.
  },
});

export default CustomTabBar;