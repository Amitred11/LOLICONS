// Import necessary modules from React, React Native, and third-party libraries.
import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
import { Colors } from '@config/Colors';

/**
 * A single animated button for the custom tab bar.
 * It animates the icon and label based on whether it is focused.
 * @param {object} props - The component props.
 * @param {object} props.item - The tab item configuration (e.g., { activeIcon, label }).
 * @param {function} props.onPress - The function to execute when the button is pressed.
 * @param {boolean} props.isFocused - A boolean indicating if the tab is currently active.
 */
const AnimatedTabButton = ({ item, onPress, isFocused }) => {
  // Define the animated style for the icon.
  // When focused, the icon moves up and scales up with a spring effect.
  const animatedIconStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: withSpring(isFocused ? -5 : 0, { damping: 12, stiffness: 100 }) },
        { scale: withSpring(isFocused ? 1.2 : 1) },
      ],
    };
  });

  // Define the animated style for the label.
  // When focused, the label fades in and moves up slightly.
  const animatedLabelStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(isFocused ? 1 : 0, { duration: 200 }),
      transform: [
        { translateY: withTiming(isFocused ? 0 : 5, { duration: 200 }) },
      ],
    };
  });

  // Render the pressable tab button.
  return (
    <Pressable onPress={onPress} style={styles.container}>
      {/* Animated container for the icon */}
      <Animated.View style={animatedIconStyle}>
        <Ionicons
          name={item.activeIcon}
          size={28}
          color={isFocused ? Colors.secondary : Colors.textSecondary}
        />
      </Animated.View>

      {/* Animated text label, only visible when focused */}
      <Animated.Text style={[styles.label, animatedLabelStyle]}>
        {item.label}
      </Animated.Text>
    </Pressable>
  );
};

// Define the styles for the component.
const styles = StyleSheet.create({
  container: {
    flex: 1, // Each button takes up equal space in the tab bar.
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 10,
    color: Colors.secondary,
    position: 'absolute', // Position the label absolutely relative to the container.
    bottom: 6, // Place it near the bottom of the button area.
  },
});

export default AnimatedTabButton;