import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const Toast = ({ title, message, type, onHide }) => {
  const translateY = useRef(new Animated.Value(-50)).current; 
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animation In
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
    ]).start();

    // Auto Hide Timer
    const timer = setTimeout(() => {
      // Animation Out
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
      ]).start(onHide);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const getStyle = () => {
    switch (type) {
      case 'error':
        return { icon: 'alert-circle-outline', bg: '#ef4444', border: '#b91c1c', text: '#fff' };
      case 'success':
        return { icon: 'checkmark-circle-outline', bg: '#22c55e', border: '#15803d', text: '#fff' };
      case 'info':
        return { icon: 'information-circle-outline', bg: '#3b82f6', border: '#1d4ed8', text: '#fff' };
      default:
        return { icon: 'information-circle-outline', bg: '#ffffff', border: '#e5e5e5', text: '#333' };
    }
  };

  const theme = getStyle();

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
        color={theme.text}
      />

      {/* 
         FIX: Wrapped Texts in a View with flex: 1.
         This ensures the text stacks vertically next to the icon.
      */}
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
    flexDirection: 'row', // Icon and TextContainer side-by-side
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
    flex: 1, // Takes up remaining space
    flexDirection: 'column', // Title and Message stacked
    justifyContent: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2, // Space between title and message
  },
  message: {
    fontSize: 13,
    fontWeight: '400',
  },
});

export default Toast;