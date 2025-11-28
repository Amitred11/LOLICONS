import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  withSequence,
  Easing,
  ZoomIn,
  FadeIn
} from 'react-native-reanimated';
import { Colors } from '../../constants/Colors';

const { width } = Dimensions.get('window');

const Loading = () => {
  // Shared values for animations
  const rotation = useSharedValue(0);
  const pulse = useSharedValue(1);
  const textOpacity = useSharedValue(0.5);

  useEffect(() => {
    // 1. Infinite Rotation for the outer ring
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 1500,
        easing: Easing.linear,
      }),
      -1 // Infinite loop
    );

    // 2. Pulse effect for the center icon
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 800 }),
        withTiming(1, { duration: 800 })
      ),
      -1,
      true // Reverse the animation (yoyo)
    );

    // 3. Breathing effect for text
    textOpacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1000 }),
        withTiming(0.4, { duration: 1000 })
      ),
      -1,
      true
    );
  }, []);

  // Animated Styles
  const rotateStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const textAnimStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  return (
    <Animated.View entering={FadeIn.duration(300)} style={styles.container}>
      {/* 1. High Intensity Blur Background */}
      <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
      
      {/* Optional: Subtle background gradient overlay for atmosphere */}
      <LinearGradient
        colors={['rgba(0,0,0,0.2)', 'rgba(0,0,0,0.8)']}
        style={StyleSheet.absoluteFill}
      />

      {/* 2. The Glass Card with Entrance Animation */}
      <Animated.View entering={ZoomIn.springify().damping(15)} style={styles.card}>
        
        {/* Subtle Gradient Border */}
        <LinearGradient
          colors={[Colors.surface + '90', Colors.surface + '10']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardBorder}
        />

        {/* 3. The Custom Loader Graphic */}
        <View style={styles.loaderContainer}>
          {/* Outer Rotating Gradient Ring */}
          <Animated.View style={[styles.spinnerRing, rotateStyle]}>
            <LinearGradient
              colors={[Colors.primary, 'transparent']}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.spinnerGradient}
            />
          </Animated.View>

          {/* Center Pulsing Icon */}
          <Animated.View style={[styles.centerIcon, pulseStyle]}>
            {/* You can change this icon to your app logo */}
            <Ionicons name="sparkles" size={24} color={Colors.primary} />
          </Animated.View>
        </View>

        {/* 4. Loading Text */}
        <Animated.Text style={[styles.text, textAnimStyle]}>
          Loading...
        </Animated.Text>
        
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  card: {
    width: width * 0.45,
    height: width * 0.45,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface + '80', // Hex opacity
    borderRadius: 30,
    // Modern Shadow/Glow
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 25,
    elevation: 10,
    overflow: 'hidden',
  },
  cardBorder: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  loaderContainer: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  spinnerRing: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
    borderWidth: 3,
    borderColor: 'transparent', 
    position: 'absolute',
  },
  spinnerGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
  },
  centerIcon: {
    width: 50,
    height: 50,
    backgroundColor: Colors.surface,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
    // Inner shadow feel
    borderWidth: 1,
    borderColor: Colors.surface,
  },
  text: {
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.text,
    fontSize: 14,
    letterSpacing: 2, // Widespacing looks more "premium"
    textTransform: 'uppercase',
  },
});

export default Loading;