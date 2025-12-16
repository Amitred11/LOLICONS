import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, PanResponder, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const Toast = ({ title, message, type, onHide }) => {
  // 1. Vertical value for Entry/Exit animations
  const translateY = useRef(new Animated.Value(-50)).current; 
  // 2. Horizontal value for Swipe gestures
  const translateX = useRef(new Animated.Value(0)).current; 
  
  const opacity = useRef(new Animated.Value(0)).current;
  const timerRef = useRef(null);

  // --- Auto Hide Timer Logic ---
  const startHideTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      animateOut();
    }, 3000);
  };

  const animateOut = () => {
    // Standard Auto-Hide: Slide UP and Fade Out
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: -50,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
        if (onHide) onHide();
    });
  };

  useEffect(() => {
    // Animation In: Slide DOWN
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        friction: 6,
        tension: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      startHideTimer();
    });

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // --- Swipe Logic (Left/Right) ---
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only activate if horizontal movement > vertical movement (user is trying to swipe sideways)
        return Math.abs(gestureState.dx) > 10 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
      },
      onPanResponderGrant: () => {
        // Pause timer on touch
        if (timerRef.current) clearTimeout(timerRef.current);
        
        // Stop current animations
        translateX.stopAnimation();
        opacity.stopAnimation();

        translateX.setOffset(translateX._value);
        translateX.setValue(0);
      },
      onPanResponderMove: (_, gestureState) => {
        translateX.setValue(gestureState.dx);
      },
      onPanResponderRelease: (_, gestureState) => {
        translateX.flattenOffset();

        // Thresholds:
        // 1. Swiped more than 30% of screen width
        // 2. Flicked quickly (velocity > 0.5)
        const isSwipeLeft = gestureState.dx < -SCREEN_WIDTH * 0.25 || gestureState.vx < -0.5;
        const isSwipeRight = gestureState.dx > SCREEN_WIDTH * 0.25 || gestureState.vx > 0.5;

        if (isSwipeLeft || isSwipeRight) {
          // Determine direction to fly out
          const direction = isSwipeRight ? 1 : -1;
          
          Animated.parallel([
            Animated.timing(translateX, {
              toValue: direction * SCREEN_WIDTH, // Fly off screen
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            })
          ]).start(onHide);
        } else {
          // Snap Back to Center
          Animated.spring(translateX, {
            toValue: 0,
            friction: 5,
            tension: 50,
            useNativeDriver: true,
          }).start();
          
          startHideTimer();
        }
      },
    })
  ).current;

  const getStyle = () => {
    switch (type) {
      case 'error':
        return { icon: 'alert-circle-outline', bg: '#ef4444', border: '#b91c1c', text: '#fff' };
      case 'success':
        return { icon: 'checkmark-circle-outline', bg: '#22c55e', border: '#15803d', text: '#fff' };
      case 'info':
        return { icon: 'information-circle-outline', bg: '#3b82f6', border: '#1d4ed8', text: '#fff' };
      case 'badge' :
        return { icon: 'ribbon-outline', bg: '#fef3c7', border: '#f59e0b', text: '#92400e' };
        default:
        return { icon: 'information-circle-outline', bg: '#ffffff', border: '#e5e5e5', text: '#333' };
    }
  };

  const theme = getStyle();

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[
        styles.container,
        {
          // Apply both vertical (entry) and horizontal (swipe) transforms
          transform: [
            { translateY }, 
            { translateX } 
          ],
          opacity,
          backgroundColor: theme.bg,
          borderColor: theme.border,
        },
      ]}
    >
      <Ionicons
        name={theme.icon}
        size={24}
        color={theme.text}
      />

      <View style={styles.textContainer}>
        {title ? (
          <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
        ) : null}
        
        <Text style={[styles.message, { color: theme.text }]}>{message}</Text>
      </View>

    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  textContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  message: {
    fontSize: 13,
    fontWeight: '400',
  },
});

export default Toast;