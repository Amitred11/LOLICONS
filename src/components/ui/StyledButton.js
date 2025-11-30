// Import necessary modules from React, React Native, and third-party libraries.
import React from 'react';
import { Text, StyleSheet, Pressable } from 'react-native';
import { Colors } from '@config/Colors';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

// Create an animated version of the Pressable component to apply animated styles.
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * A reusable, animated button with primary and secondary variants.
 * @param {object} props - The component props.
 * @param {string} props.title - The text to display on the button.
 * @param {function} props.onPress - The function to call when the button is pressed.
 * @param {object} [props.style] - Optional custom styles for the button container.
 * @param {object} [props.textStyle] - Optional custom styles for the button text.
 * @param {string} [props.variant='primary'] - The button style variant ('primary' or 'secondary').
 */
const StyledButton = ({ title, onPress, style, textStyle, variant = 'primary' }) => {
  // Create a shared value for the button's scale, initialized to 1 (normal size).
  const scale = useSharedValue(1);

  // Define the animated style for the button.
  // The transform will dynamically change based on the 'scale' shared value.
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  // Function to handle the press-in event.
  // It animates the button to a slightly smaller size with a spring effect.
  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };

  // Function to handle the press-out event.
  // It animates the button back to its original size.
  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  // Combine base styles with variant-specific styles and any custom styles passed in props.
  const buttonStyles = [
    styles.button,
    variant === 'primary' ? styles.primaryButton : styles.secondaryButton,
    style,
  ];

  // Combine base text styles with variant-specific styles and any custom text styles.
  const textStyles = [
    styles.text,
    variant === 'primary' ? styles.primaryText : styles.secondaryText,
    textStyle,
  ];

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[animatedStyle, buttonStyles]}>
      <Text style={textStyles}>{title}</Text>
    </AnimatedPressable>
  );
};

// Define the styles for the component.
const styles = StyleSheet.create({
  // Base styles applicable to all button variants.
  button: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  // Styles specific to the 'primary' variant.
  primaryButton: {
    backgroundColor: Colors.primary,
  },
  // Styles specific to the 'secondary' variant.
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  // Base text styles for the button.
  text: {
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
  },
  // Text color for the 'primary' variant.
  primaryText: {
    color: Colors.background,
  },
  // Text color for the 'secondary' variant.
  secondaryText: {
    color: Colors.primary,
  },
});

export default StyledButton;