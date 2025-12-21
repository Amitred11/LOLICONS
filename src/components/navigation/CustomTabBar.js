import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Platform, Keyboard, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // Essential for modern screens
import AnimatedTabButton from './AnimatedTabButton';
import { Colors } from '@config/Colors';

/**
 * A custom tab bar component that displays and manages navigation tabs.
 */
const CustomTabBar = ({ state, descriptors, navigation }) => {
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const { width: SCREEN_WIDTH } = useWindowDimensions(); // Updates on orientation change
  const insets = useSafeAreaInsets(); // Handles notches/home indicators

  const TAB_BAR_WIDTH = SCREEN_WIDTH * 0.9;
  const TAB_BAR_HEIGHT = 65;

  // --- KEYBOARD AVOIDANCE LOGIC ---
  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const onKeyboardShow = () => setKeyboardVisible(true);
    const onKeyboardHide = () => setKeyboardVisible(false);

    const showSubscription = Keyboard.addListener(showEvent, onKeyboardShow);
    const hideSubscription = Keyboard.addListener(hideEvent, onKeyboardHide);

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  // Hide the tab bar when the keyboard is open (cleaner UI)
  if (isKeyboardVisible) return null;

  return (
    <View 
      style={[
        styles.container, 
        { 
          width: TAB_BAR_WIDTH, 
          height: TAB_BAR_HEIGHT,
          // Dynamically calculate bottom spacing based on safe area
          bottom: Platform.OS === 'ios' ? Math.max(insets.bottom, 20) : 20 
        }
      ]}
      accessibilityRole="tablist"
    >
      <View style={styles.backgroundPill}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const { options } = descriptors[route.key];
          
          // Fallback to label if customProps isn't defined
          const item = options.customProps || { label: route.name };

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          return (
            <AnimatedTabButton
              key={route.key} // Using route.key is more performant than index
              item={item}
              isFocused={isFocused}
              onPress={onPress}
              onLongPress={onLongPress}
            />
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignSelf: 'center',
    // Elevation/Shadow container
    zIndex: 1000,
  },
  backgroundPill: {
    flex: 1, 
    flexDirection: 'row', 
    backgroundColor: Colors.surface || '#FFFFFF',
    borderRadius: 40, 
    // Shadow for iOS
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    // Shadow for Android
    elevation: 8, 
    overflow: 'hidden', // Ensures ripple effects don't bleed out
  },
});

export default CustomTabBar;