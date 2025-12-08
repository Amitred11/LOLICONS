import React, { useEffect, useRef } from 'react';
import { Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const Toast = ({ message, type, onHide }) => {
  // FIX: Start slightly above natural position (relative animation)
  const translateY = useRef(new Animated.Value(-50)).current; 
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0, // Animate to its natural position in the stack
        friction: 6,
        tension: 100,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: -50, // Slide back up
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start(onHide);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const getStyle = () => {
    switch (type) {
      case 'error':
        return {
          icon: 'alert-circle-outline',
          iconColor: '#fff', // Changed for better contrast
          bg: '#ef4444', // Tailwind red-500
          border: '#b91c1c',
        };
      case 'success':
        return {
          icon: 'checkmark-circle-outline',
          iconColor: '#fff',
          bg: '#22c55e', // Tailwind green-500
          border: '#15803d',
        };
      case 'info':
        return {
          icon: 'information-circle-outline',
          iconColor: '#fff',
          bg: '#3b82f6', // Tailwind blue-500
          border: '#1d4ed8',
        };
      default:
        return {
          icon: 'information-circle-outline',
          iconColor: '#333',
          bg: '#ffffff',
          border: '#e5e5e5',
        };
    }
  };

  const theme = getStyle();
  // Determine text color based on background (simple logic)
  const textColor = type && type !== 'default' ? '#fff' : '#333';

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
          opacity,
          backgroundColor: theme.bg,
          borderColor: theme.border,
        },
      ]}
    >
      <Ionicons
        name={theme.icon}
        size={24}
        color={theme.iconColor}
        style={styles.icon}
      />

      <Text style={[styles.message, { color: textColor }]}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    // FIX: Removed position: 'absolute'. 
    // This allows Toasts to use the 'gap' from the container and stack vertically.
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,

    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,

    borderWidth: 1,

    // Shadow
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },

  icon: {
    // No specific margin needed due to 'gap' in container, 
    // but kept just in case gap isn't supported in older RN versions
  },

  message: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default Toast;