import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Toast = ({ message, type, onHide }) => {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: insets.top + 10,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.parallel([
         Animated.timing(opacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
         }),
         Animated.timing(translateY, {
            toValue: -100,
            duration: 300,
            useNativeDriver: true,
         }),
      ]).start(onHide);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const getIcon = () => {
    switch (type) {
      case 'error': return { name: 'alert-circle-outline', color: '#FF4444' };
      case 'success': return { name: 'checkmark-circle-outline', color: '#00C851' };
      default: return { name: 'information-circle-outline', color: '#FFFFFF' };
    }
  };

  const iconData = getIcon();

  return (
    <Animated.View style={[styles.container, { transform: [{ translateY }], opacity }]}>
      <Ionicons name={iconData.name} size={22} color={iconData.color} style={styles.icon} />
      <Text style={styles.message}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    backgroundColor: '#2F2F2F',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  icon: {
    marginRight: 12,
  },
  message: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },
});

// Ensure this export line exists
export default Toast;