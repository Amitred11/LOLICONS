// screens/profile/components/RankInfoModal.js

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, TouchableOpacity } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
import { Colors } from '@config/Colors';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

/**
 * A modal that displays detailed information about a user's current rank.
 * @param {object} props - The component's properties.
 * @param {boolean} props.isVisible - Controls whether the modal is visible.
 * @param {function} props.onClose - A callback function to close the modal.
 * @param {object} props.rank - The rank object containing name, color, minXp, and description.
 */
const RankInfoModal = ({ isVisible, onClose, rank }) => {
  const scale = useSharedValue(0.9);
  const opacity = useSharedValue(0);

  // Animate the modal in or out when the `isVisible` prop changes.
  useEffect(() => {
    if (isVisible) {
      scale.value = withSpring(1, { damping: 15, stiffness: 150 });
      opacity.value = withTiming(1, { duration: 200 });
    } else {
      scale.value = withTiming(0.9, { duration: 200 });
      opacity.value = withTiming(0, { duration: 200 });
    }
  }, [isVisible]);

  const animatedModalStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));
  
  const animatedBackdropStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  
  if (!rank) return null; // Don't render if no rank data is provided.

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents={isVisible ? 'auto' : 'none'}>
      <Pressable onPress={onClose} style={StyleSheet.absoluteFill}>
        <Animated.View style={[styles.backdrop, animatedBackdropStyle]}>
            <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
        </Animated.View>
      </Pressable>
      
      <View style={styles.centeredContainer} pointerEvents="box-none">
        <Animated.View style={[styles.modalContainer, animatedModalStyle]}>
          <BlurView intensity={100} tint="dark" style={StyleSheet.absoluteFill} />
          
          <View style={[styles.rankCrest, { backgroundColor: rank.color + '20', borderColor: rank.color }]}>
            <Text style={[styles.rankCharacter, { color: rank.color }]}>{rank.name}</Text>
          </View>

          {/* Use the new `title` property from mockData */}
          <Text style={styles.rankName}>{rank.title}</Text>
          <Text style={styles.rankDescription}>{rank.description}</Text>
          <Text style={styles.rankXp}>Unlocked at {rank.minXp.toLocaleString()} XP</Text>
          
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Close</Text>
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
    rankCrest: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        marginBottom: 20,
    },
    rankCharacter: {
        fontFamily: 'Poppins_700Bold',
        fontSize: 50,
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowRadius: 10,
    },
    rankName: {
        fontFamily: 'Poppins_700Bold',
        color: Colors.text,
        fontSize: 24,
    },
    rankDescription: {
        fontFamily: 'Poppins_400Regular',
        color: Colors.textSecondary,
        fontSize: 15,
        textAlign: 'center',
        marginTop: 10,
        lineHeight: 22,
    },
    rankXp: {
        fontFamily: 'Poppins_600SemiBold',
        color: Colors.secondary,
        fontSize: 13,
        marginTop: 15,
        backgroundColor: Colors.surface,
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 15,
        overflow: 'hidden',
    },
    closeButton: {
        backgroundColor: Colors.surface,
        borderRadius: 20,
        paddingVertical: 12,
        paddingHorizontal: 40,
        marginTop: 25,
    },
    closeButtonText: {
        fontFamily: 'Poppins_600SemiBold',
        color: Colors.text,
        fontSize: 16,
    },
});

export default RankInfoModal;