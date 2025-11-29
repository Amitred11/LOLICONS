// screens/profile/components/GlitchEffect.js
import React, { useEffect } from 'react';
import { StyleSheet, Dimensions, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';

const { height: screenHeight, width: screenWidth } = Dimensions.get('window');

/* ---------- GLITCH LINE ---------- */
const GlitchLine = ({ delay }) => {
  const top = useSharedValue(0);
  const height = useSharedValue(0);
  const opacity = useSharedValue(0);
  const tx = [useSharedValue(0), useSharedValue(0), useSharedValue(0)];

  const triggerGlitch = () => {
    'worklet';
    top.value = Math.random() * screenHeight;
    height.value = Math.random() * 80 + 5;
    tx.forEach((val) => (val.value = (Math.random() - 0.5) * 200));
    opacity.value = withSequence(
      withTiming(1, { duration: 20 }),
      withTiming(0, { duration: 60 }),
      withTiming(1, { duration: 30 }),
      withTiming(0, { duration: 100 })
    );
    runOnJS(setTimeout)(triggerGlitch, Math.random() * 800 + 100);
  };

  useEffect(() => {
    const t = setTimeout(() => triggerGlitch(), delay);
    return () => clearTimeout(t);
  }, []);

  const makeStyle = (val) =>
    useAnimatedStyle(() => ({
      top: top.value,
      height: height.value,
      opacity: opacity.value,
      transform: [{ translateX: val.value }],
    }));

  return (
    <>
      <Animated.View style={[styles.line, { backgroundColor: 'rgba(255,0,0,0.6)' }, makeStyle(tx[0])]} />
      <Animated.View style={[styles.line, { backgroundColor: 'rgba(0,255,0,0.6)' }, makeStyle(tx[1])]} />
      <Animated.View style={[styles.line, { backgroundColor: 'rgba(0,0,255,0.6)' }, makeStyle(tx[2])]} />
    </>
  );
};

/* ---------- FLASH OVERLAY ---------- */
const FlashOverlay = () => {
  const opacity = useSharedValue(0);

  useEffect(() => {
    const flicker = () => {
      opacity.value = withSequence(
        withTiming(Math.random() * 0.8, { duration: 50 }),
        withTiming(0, { duration: 80 })
      );
      setTimeout(flicker, Math.random() * 2000 + 500);
    };
    flicker();
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return <Animated.View style={[styles.flash, style]} />;
};

/* ---------- PIXEL BLOCK ---------- */
const PixelBlock = ({ delay }) => {
  const left = useSharedValue(0);
  const top = useSharedValue(0);
  const size = useSharedValue(0);
  const opacity = useSharedValue(0);

  const trigger = () => {
    'worklet';
    size.value = Math.random() * 80 + 20;
    left.value = Math.random() * (screenWidth - size.value);
    top.value = Math.random() * (screenHeight - size.value);
    opacity.value = withSequence(
      withTiming(1, { duration: 40 }),
      withTiming(0, { duration: 100 })
    );
    runOnJS(setTimeout)(trigger, Math.random() * 1500 + 300);
  };

  useEffect(() => {
    const t = setTimeout(() => trigger(), delay);
    return () => clearTimeout(t);
  }, []);

  const style = useAnimatedStyle(() => ({
    left: left.value,
    top: top.value,
    width: size.value,
    height: size.value,
    opacity: opacity.value,
  }));

  return <Animated.View style={[styles.pixel, style]} />;
};

/* ---------- FULL-SCREEN SHAKE ---------- */
const ScreenShake = ({ children }) => {
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);

  useEffect(() => {
    const loop = () => {
      tx.value = withSequence(
        withTiming((Math.random() - 0.5) * 30, { duration: 60 }),
        withTiming(0, { duration: 60 })
      );
      ty.value = withSequence(
        withTiming((Math.random() - 0.5) * 20, { duration: 60 }),
        withTiming(0, { duration: 60 })
      );
      setTimeout(loop, Math.random() * 600 + 200);
    };
    loop();
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.value }, { translateY: ty.value }],
  }));

  return <Animated.View style={style}>{children}</Animated.View>;
};

/* ---------- MAIN GLITCH EFFECT ---------- */
const GlitchEffect = () => {
  return (
    <ScreenShake>
      {/* tearing lines */}
      <GlitchLine delay={0} />
      <GlitchLine delay={200} />
      <GlitchLine delay={400} />
      <GlitchLine delay={600} />
      <GlitchLine delay={800} />

      {/* pixel corruption */}
      <PixelBlock delay={100} />
      <PixelBlock delay={400} />
      <PixelBlock delay={700} />
      <PixelBlock delay={1000} />

      {/* flashing overlay */}
      <FlashOverlay />
    </ScreenShake>
  );
};

const styles = StyleSheet.create({
  line: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 10,
  },
  flash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,255,0,0.3)', // hacker green flash
    zIndex: 50,
  },
  pixel: {
    position: 'absolute',
    backgroundColor: 'limegreen',
    zIndex: 20,
  },
});

export default GlitchEffect;
