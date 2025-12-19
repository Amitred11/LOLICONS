// screens/comics/components/ActionSheetModal.js

// Import necessary modules from React, React Native, and third-party libraries.
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, TouchableOpacity } from 'react-native';
import { Colors } from '@config/Colors';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, runOnJS } from 'react-native-reanimated';

/**
 * A reusable, animated action sheet modal that slides up from the bottom of the screen.
 * @param {object} props - The component props.
 * @param {function} props.onClose - A callback function to close the modal.
 * @param {string} [props.title] - An optional title displayed at the top of the action sheet.
 * @param {Array<object>} [props.options=[]] - An array of option objects to display.
 *   Each object can have: { label, icon, onPress, isDestructive, isCancel }.
 */
const ActionSheetModal = ({ onClose, title, options = [] }) => {
  const insets = useSafeAreaInsets(); // Hook to get safe area dimensions.

  // Shared values to control the modal's slide and backdrop fade animations.
  const translateY = useSharedValue(300); // Start off-screen at the bottom.
  const backdropOpacity = useSharedValue(0); // Start with a transparent backdrop.

  // Animated styles derived from the shared values.
  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));
  const animatedBackdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  // Function to animate the modal into view.
  const animateIn = () => {
    translateY.value = withTiming(0, { duration: 250 });
    backdropOpacity.value = withTiming(1, { duration: 250 });
  };

  // Function to animate the modal out of view, with an optional callback to run upon completion.
  const animateOut = (callback) => {
    translateY.value = withTiming(300, { duration: 200 });
    backdropOpacity.value = withTiming(0, { duration: 200 }, () => {
      // `runOnJS` is used to safely execute a non-worklet function (the callback) after the animation on the UI thread is done.
      if (callback) runOnJS(callback)();
    });
  };

  // Trigger the "animate in" effect when the component mounts.
  useEffect(() => {
    animateIn();
  }, []);

  // Handles pressing any option. It animates out, then calls the onClose and option-specific callbacks.
  const handleOptionPress = (onPressCallback) => {
    animateOut(() => {
      onClose(); // Always close the modal.
      if (onPressCallback) onPressCallback(); // Execute the specific action for the option.
    });
  };

  // Handles closing the modal, typically by pressing the backdrop or the cancel button.
  const handleClose = () => {
    const cancelOption = options.find(opt => opt.isCancel);
    handleOptionPress(cancelOption?.onPress);
  };
  
  // Separate the options into regular items and the cancel button for different layout rendering.
  const regularOptions = options.filter(opt => !opt.isCancel);
  const cancelOption = options.find(opt => opt.isCancel);

  return (
    <>
      {/* The blurred backdrop that covers the screen behind the modal */}
      <Animated.View style={[styles.backdrop, animatedBackdropStyle]}>
        <BlurView intensity={100} tint="dark" style={StyleSheet.absoluteFill} />
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
      </Animated.View>

      {/* The main container for the action sheet, which animates up from the bottom */}
      <Animated.View style={[styles.container, { paddingBottom: insets.bottom || 10 }, animatedContainerStyle]}>
        {/* The sheet containing the title and regular options */}
        <View style={styles.sheet}>
            {!!title && <Text style={styles.title}>{title}</Text>}
            {regularOptions.map((option, index) => (
                <TouchableOpacity 
                    key={index} 
                    style={[styles.option, index === 0 && !title && styles.firstOption, option.isDestructive && styles.destructiveOption]}
                    onPress={() => handleOptionPress(option.onPress)}
                >
                    <Text style={[styles.optionText, option.isDestructive && styles.destructiveText]}>{option.label}</Text>
                    {!!option.icon && <Ionicons name={option.icon} size={22} color={option.isDestructive ? Colors.danger : Colors.text} />}
                </TouchableOpacity>
            ))}
        </View>

        {/* The separate cancel button sheet */}
        {cancelOption && (
            <TouchableOpacity style={[styles.sheet, styles.cancelSheet]} onPress={() => handleOptionPress(cancelOption.onPress)}>
                <Text style={styles.cancelText}>{cancelOption.label}</Text>
            </TouchableOpacity>
        )}
      </Animated.View>
    </>
  );
};

// --- Stylesheet ---
const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, zIndex: 10 },
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    paddingHorizontal: 10,
  },
  sheet: {
    backgroundColor: Colors.surface + 'E6', // Semi-transparent background
    borderRadius: 14,
    overflow: 'hidden',
  },
  cancelSheet: {
    marginTop: 8,
  },
  title: {
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.background + '80',
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.background + '80',
  },
  firstOption: {
      borderTopWidth: 0, // The first option doesn't need a top border.
  },
  optionText: {
    fontFamily: 'Poppins_500Medium',
    color: Colors.textSecondary,
    fontSize: 18,
  },
  destructiveOption: {
    // No specific style needed, but class is here for potential future use.
  },
  destructiveText: {
    color: Colors.danger, // Style for destructive actions like "Delete".
  },
  cancelText: {
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.secondary,
    fontSize: 18,
    textAlign: 'center',
    padding: 16,
  },
});

export default ActionSheetModal;