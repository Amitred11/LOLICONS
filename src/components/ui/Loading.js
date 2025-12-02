import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native'; // Added Text import
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  withDelay,
  Easing,
  interpolate,
  FadeIn
} from 'react-native-reanimated';
import { Colors } from '../../constants/Colors';

const { width } = Dimensions.get('window');

// --- Configuration ---
const CONFIG = {
  iconSize: 40,
  baseColor: Colors.primary,
  rippleCount: 3,
  duration: 2500,
};

// --- Sub-Component: A Single Expanding Ring ---
const PulseRing = ({ delay, index }) => {
  const ringParams = useSharedValue(0);

  useEffect(() => {
    ringParams.value = withDelay(
      delay,
      withRepeat(
        withTiming(1, { duration: CONFIG.duration, easing: Easing.out(Easing.ease) }),
        -1,
        false
      )
    );
  }, []);

  const ringStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(ringParams.value, [0, 0.7, 1], [0.8, 0.2, 0]),
      transform: [
        { scale: interpolate(ringParams.value, [0, 1], [0.8, 4]) },
      ],
    };
  });

  return <Animated.View style={[styles.ring, ringStyle]} />;
};

const Loading = ({ message = "Loading" }) => {
  // Shared Values
  const float = useSharedValue(0);
  const glow = useSharedValue(0);

  useEffect(() => {
    // 1. Floating Effect
    float.value = withRepeat(
      withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );

    // 2. Glow Intensity Pulse
    glow.value = withRepeat(
      withTiming(1, { duration: 1500, easing: Easing.linear }),
      -1,
      true
    );
  }, []);

  // Animated Styles
  const iconContainerStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(float.value, [0, 1], [0, -10]) },
      { scale: interpolate(float.value, [0, 1], [1, 1.05]) }
    ],
    shadowOpacity: interpolate(glow.value, [0, 1], [0.3, 0.8]),
    shadowRadius: interpolate(glow.value, [0, 1], [10, 25]),
  }));

  // This style now applies to the WRAPPER View, not the Text directly
  const textWrapperStyle = useAnimatedStyle(() => ({
    opacity: interpolate(float.value, [0, 1], [0.5, 1]),
  }));

  return (
    <View style={styles.container}>
      <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.4)' }]} />

      <View style={styles.contentWrapper}>
        
        <View style={styles.rippleContainer}>
            {[...Array(CONFIG.rippleCount)].map((_, i) => (
                <PulseRing key={i} delay={i * 400} index={i} />
            ))}
        </View>

        <Animated.View style={[styles.iconContainer, iconContainerStyle]}>
          <Ionicons name="planet" size={CONFIG.iconSize} color={Colors.text} />
        </Animated.View>

        {/* --- FIX START: Wrapped Text in Animated.View --- */}
        <Animated.View 
          entering={FadeIn.delay(500)} 
          style={[styles.textWrapper, textWrapperStyle]}
        >
          <Text style={styles.text}>
            {message}
          </Text>
        </Animated.View>
        {/* --- FIX END --- */}

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  contentWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  rippleContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1.5,
    borderColor: CONFIG.baseColor,
    zIndex: 0,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    elevation: 15,
  },
  // New wrapper style for positioning
  textWrapper: {
    marginTop: 40, 
    alignItems: 'center',
  },
  // Text style strictly for fonts
  text: {
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.text,
    fontSize: 16,
    letterSpacing: 4,
    textTransform: 'uppercase',
  },
});

export default Loading;