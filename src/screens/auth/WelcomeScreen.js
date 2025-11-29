// Import necessary modules from React, React Native, and third-party libraries.
import React, { useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, Pressable } from 'react-native';
import { Colors } from '@config/Colors';
import StyledButton from '@components/StyledButton';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';

// A reusable component for creating floating, animated background shapes.
const AnimatedShape = ({ size, color, initialX, initialY, delay, rotation }) => {
  // Shared values for animating position, scale, and rotation.
  const translateX = useSharedValue(initialX);
  const translateY = useSharedValue(initialY);
  const scale = useSharedValue(1);
  const rotate = useSharedValue(0);

  // Effect to start the continuous, looping animations.
  useEffect(() => {
    // These animations create a slow, random-like floating effect.
    translateX.value = withDelay(delay, withRepeat(withSequence(withTiming(initialX + Math.random() * 40 - 20, { duration: 4000, easing: Easing.inOut(Easing.quad) }), withTiming(initialX - Math.random() * 40 - 20, { duration: 4000, easing: Easing.inOut(Easing.quad) }), withTiming(initialX, { duration: 4000, easing: Easing.inOut(Easing.quad) })), -1, true));
    translateY.value = withDelay(delay, withRepeat(withSequence(withTiming(initialY + Math.random() * 50 - 25, { duration: 3500, easing: Easing.inOut(Easing.quad) }), withTiming(initialY - Math.random() * 50 - 25, { duration: 3500, easing: Easing.inOut(Easing.quad) }), withTiming(initialY, { duration: 3500, easing: Easing.inOut(Easing.quad) })), -1, true));
    scale.value = withDelay(delay, withRepeat(withSequence(withTiming(1.2, { duration: 5000, easing: Easing.inOut(Easing.quad) }), withTiming(1, { duration: 5000, easing: Easing.inOut(Easing.quad) })), -1, true));
    if (rotation) {
        rotate.value = withDelay(delay, withRepeat(withTiming(360, { duration: 20000, easing: Easing.linear }), -1, false));
    }
  }, []);

  // Create the animated style object.
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }, { translateY: translateY.value }, { scale: scale.value }, { rotate: `${rotate.value}deg` }],
    position: 'absolute', width: size, height: size, backgroundColor: color, borderRadius: size / 2, opacity: 0.15,
  }));

  return <Animated.View style={animatedStyle} />;
};


/**
 * The initial welcome screen of the application.
 */
const WelcomeScreen = ({ navigation }) => {
  // Shared values for animating each major UI element.
  const iconTranslateY = useSharedValue(-100);
  const iconScale = useSharedValue(0.5);
  const iconOpacity = useSharedValue(0);
  const titleWord1TranslateY = useSharedValue(50);
  const titleWord1Opacity = useSharedValue(0);
  const titleWord2TranslateY = useSharedValue(50);
  const titleWord2Opacity = useSharedValue(0);
  const subtitleTranslateY = useSharedValue(50);
  const subtitleOpacity = useSharedValue(0);
  const buttonsTranslateY = useSharedValue(100);
  const buttonsOpacity = useSharedValue(0);

  // useFocusEffect runs the animations every time the screen comes into view.
  // This is useful for replaying the entry animation if the user navigates back to this screen.
  useFocusEffect(
    useCallback(() => {
      // Reset all animations to their starting state on focus to ensure they run correctly.
      iconTranslateY.value = -100;
      iconScale.value = 0.5;
      iconOpacity.value = 0;
      titleWord1TranslateY.value = 50;
      titleWord1Opacity.value = 0;
      titleWord2TranslateY.value = 50;
      titleWord2Opacity.value = 0;
      subtitleTranslateY.value = 50;
      subtitleOpacity.value = 0;
      buttonsTranslateY.value = 100;
      buttonsOpacity.value = 0;

      // Configuration for animations.
      const baseDelay = 300;
      const floatDuration = 2500;
      const floatAmount = 5;

      // --- NEW ANIMATION LOGIC: Entry + Continuous Loop ---
      
      // Icon: Springs in, then starts a continuous floating and "breathing" (scaling) loop.
      iconOpacity.value = withDelay(baseDelay, withTiming(1, { duration: 500 }));
      iconTranslateY.value = withSequence(
          withDelay(baseDelay, withSpring(0, { damping: 15, stiffness: 90 })),
          withRepeat(withSequence(
              withTiming(floatAmount, { duration: floatDuration, easing: Easing.inOut(Easing.quad) }),
              withTiming(0, { duration: floatDuration, easing: Easing.inOut(Easing.quad) }),
          ), -1, true)
      );
      iconScale.value = withSequence(
          withDelay(baseDelay, withSpring(1)),
          withRepeat(withSequence(
              withTiming(1.05, { duration: 3000, easing: Easing.inOut(Easing.quad) }),
              withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.quad) }),
          ), -1, true)
      );

      // Title Word 1: Springs in, then starts a floating loop.
      titleWord1Opacity.value = withDelay(baseDelay + 200, withTiming(1, {duration: 600}));
      titleWord1TranslateY.value = withSequence(
          withDelay(baseDelay + 200, withSpring(0)),
          withRepeat(withSequence(
              withTiming(floatAmount, { duration: floatDuration + 200, easing: Easing.inOut(Easing.quad) }),
              withTiming(0, { duration: floatDuration + 200, easing: Easing.inOut(Easing.quad) }),
          ), -1, true)
      );
      
      // Title Word 2: Springs in after the first word, then starts its own floating loop.
      titleWord2Opacity.value = withDelay(baseDelay + 400, withTiming(1, {duration: 600}));
      titleWord2TranslateY.value = withSequence(
          withDelay(baseDelay + 400, withSpring(0)),
          withRepeat(withSequence(
              withTiming(floatAmount, { duration: floatDuration - 100, easing: Easing.inOut(Easing.quad) }),
              withTiming(0, { duration: floatDuration - 100, easing: Easing.inOut(Easing.quad) }),
          ), -1, true)
      );
      
      // Subtitle: Springs in, then starts a floating loop.
      subtitleOpacity.value = withDelay(baseDelay + 700, withTiming(1, {duration: 600}));
      subtitleTranslateY.value = withSequence(
          withDelay(baseDelay + 700, withSpring(0)),
          withRepeat(withSequence(
              withTiming(floatAmount, { duration: floatDuration + 400, easing: Easing.inOut(Easing.quad) }),
              withTiming(0, { duration: floatDuration + 400, easing: Easing.inOut(Easing.quad) }),
          ), -1, true)
      );

      // Buttons: Spring in and then stay static for better usability.
      buttonsOpacity.value = withDelay(baseDelay + 1000, withTiming(1, {duration: 600}));
      buttonsTranslateY.value = withDelay(baseDelay + 1000, withSpring(0));
    }, [])
  );

  // Animated style definitions.
  const iconAnimatedStyle = useAnimatedStyle(() => ({ opacity: iconOpacity.value, transform: [{ translateY: iconTranslateY.value }, { scale: iconScale.value }] }));
  const titleWord1AnimatedStyle = useAnimatedStyle(() => ({ opacity: titleWord1Opacity.value, transform: [{ translateY: titleWord1TranslateY.value }] }));
  const titleWord2AnimatedStyle = useAnimatedStyle(() => ({ opacity: titleWord2Opacity.value, transform: [{ translateY: titleWord2TranslateY.value }] }));
  const subtitleAnimatedStyle = useAnimatedStyle(() => ({ opacity: subtitleOpacity.value, transform: [{ translateY: subtitleTranslateY.value }] }));
  const buttonsAnimatedStyle = useAnimatedStyle(() => ({ opacity: buttonsOpacity.value, transform: [{ translateY: buttonsTranslateY.value }] }));

  return (
    <LinearGradient colors={[Colors.background, '#1a1a2e']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" />
        
        {/* Background animated shapes */}
        <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
          <AnimatedShape size={350} color={Colors.primary} initialX={-150} initialY={80} delay={0} rotation />
          <AnimatedShape size={280} color={Colors.secondary} initialX={200} initialY={-80} delay={500} />
          <AnimatedShape size={220} color={Colors.primary} initialX={40} initialY={550} delay={1000} rotation />
          <AnimatedShape size={180} color={Colors.secondary} initialX={-100} initialY={400} delay={1500} />
          <AnimatedShape size={150} color={Colors.primary} initialX={250} initialY={300} delay={2000} rotation />
        </View>

        {/* Main content container */}
        <View style={styles.content}>
          <Animated.View style={[styles.logoContainer, iconAnimatedStyle]}>
            <View style={styles.logoBackground}>
                <Ionicons name="bonfire-outline" size={80} color={Colors.primary} />
            </View>
          </Animated.View>
          
          {/* Title is split into two animated views for a staggered effect. */}
          <View style={styles.titleContainer}>
              <Animated.View style={titleWord1AnimatedStyle}>
                  <Text style={styles.title}>Be The</Text>
              </Animated.View>
              <Animated.View style={titleWord2AnimatedStyle}>
                  {/* The last part of the title has a different color. */}
                  <Text style={styles.title}>Next <Text style={{color: Colors.secondary}}>LOLI HUNTER</Text></Text>
              </Animated.View>
          </View>

          <Animated.Text style={[styles.subtitle, subtitleAnimatedStyle]}>
            Be a Creep to everyone and make new friends!
          </Animated.Text>
        </View>

        {/* Action buttons container at the bottom. */}
        <Animated.View style={[styles.buttonContainer, buttonsAnimatedStyle]}>
          <StyledButton
            title="Get Started"
            onPress={() => navigation.navigate('Register')}
            variant="primary"
            icon={<Ionicons name="rocket-outline" size={20} color={Colors.background} style={{ marginRight: 10 }} />}
          />
          <Pressable style={styles.loginPrompt} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginPromptText}>Already have an account? </Text>
            <Text style={styles.loginLinkText}>Log In</Text>
          </Pressable>
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );
};

// Styles for the component.
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logoContainer: {
    marginBottom: 40,
    alignItems: 'center',
  },
  logoBackground: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  titleContainer: {
    alignItems: 'center',
    overflow: 'hidden', // Hides the text as it animates in from the bottom.
    marginBottom: 15,
  },
  title: {
    fontSize: 48,
    color: Colors.text,
    fontFamily: 'Poppins_700Bold',
    textAlign: 'center',
    lineHeight: 58,
  },
  subtitle: {
    fontSize: 18,
    color: Colors.textSecondary,
    fontFamily: 'Poppins_400Regular',
    textAlign: 'center',
    maxWidth: '80%',
    lineHeight: 26,
  },
  buttonContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  loginPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 25,
  },
  loginPromptText: {
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
    fontSize: 16,
  },
  loginLinkText: {
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.secondary,
    fontSize: 16,
  },
});

export default WelcomeScreen;