// screens/profile/components/InfoModal.js

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, TouchableOpacity, ScrollView } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming, runOnJS } from 'react-native-reanimated';
import { Colors } from '../../../../constants/Colors';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

/**
 * A generic, animated modal for displaying information with a title, message, and icon.
 * @param {object} props - The component's properties.
 * @param {boolean} props.isVisible - Controls whether the modal is visible.
 * @param {function} props.onClose - A callback function to close the modal.
 * @param {string} props.icon - The name of the Ionicons icon to display.
 * @param {string} props.title - The title of the modal.
 * @param {string} props.message - The main body text of the modal.
 */
const InfoModal = ({ isVisible, onClose, icon, title, message }) => {
  const scale = useSharedValue(0.9);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (isVisible) {
      scale.value = withSpring(1, { damping: 15, stiffness: 150 });
      opacity.value = withTiming(1, { duration: 200 });
    }
  }, [isVisible]);

  const animatedModalStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));
  
  const animatedBackdropStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const handleClose = () => {
    scale.value = withTiming(0.9, { duration: 200 });
    opacity.value = withTiming(0, { duration: 200 }, (isFinished) => {
        if (isFinished) {
            runOnJS(onClose)();
        }
    });
  };

  if (!isVisible && opacity.value === 0) return null;

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents={isVisible ? 'auto' : 'none'}>
      <Pressable onPress={handleClose} style={StyleSheet.absoluteFill}>
        <Animated.View style={[styles.backdrop, animatedBackdropStyle]}>
            <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
        </Animated.View>
      </Pressable>
      
      <View style={styles.centeredContainer} pointerEvents="box-none">
        <Animated.View style={[styles.modalContainer, animatedModalStyle]}>
          <BlurView intensity={100} tint="dark" style={StyleSheet.absoluteFill} />
          
          {icon && (
            <View style={styles.iconContainer}>
                <Ionicons name={icon} size={40} color={Colors.secondary} />
            </View>
          )}

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Got it</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.7)',
    },
    centeredContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContainer: { 
        width: '100%', 
        borderRadius: 24, 
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: Colors.surface + '80',
        alignItems: 'center',
        padding: 25,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        marginBottom: 20,
    },
    title: {
        fontFamily: 'Poppins_700Bold',
        color: Colors.text,
        fontSize: 22,
        textAlign: 'center',
    },
    message: {
        fontFamily: 'Poppins_400Regular',
        color: Colors.textSecondary,
        fontSize: 15,
        textAlign: 'center',
        marginTop: 10,
        lineHeight: 22,
    },
    closeButton: {
        backgroundColor: Colors.secondary,
        borderRadius: 20,
        paddingVertical: 12,
        paddingHorizontal: 40,
        marginTop: 25,
        alignSelf: 'stretch',
    },
    closeButtonText: {
        fontFamily: 'Poppins_600SemiBold',
        color: Colors.background,
        fontSize: 16,
        textAlign: 'center',
    },
});

export default InfoModal;