// screens/profile/components/AchievementModal.js

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { Colors } from '../../../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';

const { height } = Dimensions.get('window');

// --- 1. HELPER FUNCTION ADDED ---
// This function maps a rarity string to a specific background color for the tag.
const getRarityColor = (rarity) => {
    switch (rarity) {
    case 'Common':
        return Colors.textSecondary + '66'; // Muted grey
    case 'Uncommon':
        return '#2ecc71' + '44'; // Green
    case 'Rare':
        return Colors.primary + '44'; // Blue/Purple
    case 'Epic':
        return '#8E24AA' + '55'; // Vibrant Purple
    case 'Legendary':
        return Colors.secondary + '66'; // Gold/Orange
    case 'Mythic':
        return '#00f3fcff' + '77'; // Ethereal Cyan

    // Exclusive rarities (less than 5 badges only)
    case 'Singular':
        return '#ff00ff' + '88'; // Unique Magenta Glow
    case 'Transcendent':
        return '#ffffff' + 'aa'; // Radiant White with Transparency
    case 'Eternal':
        return '#ffd700' + 'aa'; // Timeless Golden Shine
    case 'Absolute':
        return '#ff4500' + '99'; // Fierce Absolute Orange-Red
    case 'Primeval':
        return '#228b22' + '99'; // Ancient Forest Green

    default:
        return 'transparent'; // Fallback
    }
};

/**
 * A fully animated modal to display details of a selected achievement badge.
 * @param {object} props - The component's properties.
 * @param {object} props.badge - The badge data object to display.
 * @param {boolean} props.visible - Controls the visibility of the modal.
 * @param {function} props.onClose - A callback function to close the modal.
 */
const AchievementModal = ({ badge, visible, onClose }) => {
    // Shared values to control the modal's entry and exit animations.
    const scale = useSharedValue(0.9);
    const contentOpacity = useSharedValue(0);
    const overlayOpacity = useSharedValue(0);

    // This effect runs whenever the `visible` prop changes, triggering animations.
    useEffect(() => {
        if (visible) {
            overlayOpacity.value = withTiming(1, { duration: 200 });
            contentOpacity.value = withTiming(1, { duration: 200 });
            scale.value = withSpring(1, { damping: 15, stiffness: 150 });
        } else {
            contentOpacity.value = withTiming(0, { duration: 200 });
            overlayOpacity.value = withTiming(0, { duration: 250 });
            scale.value = withTiming(0.9, { duration: 200 });
        }
    }, [visible]);

    // Animated styles derived from the shared values.
    const animatedModalStyle = useAnimatedStyle(() => ({ opacity: contentOpacity.value, transform: [{ scale: scale.value }] }));
    const animatedOverlayStyle = useAnimatedStyle(() => ({ opacity: overlayOpacity.value }));

    if (!badge) return null; // Prevents rendering an empty modal.

    return (
        <Animated.View style={[styles.modalOverlay, animatedOverlayStyle]} pointerEvents={visible ? 'auto' : 'none'}>
            <Pressable style={styles.backdrop} onPress={onClose}>
                <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
            </Pressable>
            <Animated.View style={[styles.contentSheet, animatedModalStyle]} onStartShouldSetResponder={() => true}>
                <ScrollView showsVerticalScrollIndicator={false}>
                    <View style={styles.modalIconContainer}><Ionicons name={badge.icon} size={50} color={Colors.secondary} /></View>
                    <Text style={styles.modalTitle}>{badge.name}</Text>
                    {/* The rarity tag now works with the added styles and helper function. */}
                    <View style={[styles.rarityTag, { backgroundColor: getRarityColor(badge.rarity) }]}>
                        <Text style={styles.rarityText}>{badge.rarity}</Text>
                    </View>
                    <Text style={styles.modalDate}>Unlocked: {badge.unlockedDate}</Text>
                    <Text style={styles.modalDescription}>{badge.description}</Text>
                </ScrollView>
                <TouchableOpacity style={[styles.closeButton, { marginBottom: 20 }]} onPress={onClose}>
                    <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
            </Animated.View>
        </Animated.View>
    );
};

// --- Stylesheet for the Modal ---
const styles = StyleSheet.create({
  modalOverlay: { ...StyleSheet.absoluteFillObject, zIndex: 50, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  backdrop: { ...StyleSheet.absoluteFillObject },
  contentSheet: { backgroundColor: Colors.surface, borderRadius: 24, width: '100%', maxHeight: height * 0.8, padding: 20, paddingBottom: 0, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 20 },
  modalIconContainer: { width: 100, height: 100, borderRadius: 50, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center', alignSelf: 'center', marginBottom: 20, marginTop: 10, borderWidth: 1, borderColor: Colors.surface+'99' },
  modalTitle: { fontFamily: 'Poppins_700Bold', color: Colors.text, fontSize: 24, textAlign: 'center' },
  rarityTag: {
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 30,
    marginTop: 10,
    marginBottom: 4,
  },
  rarityText: {
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.text,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  modalDate: { fontFamily: 'Poppins_500Medium', color: Colors.secondary, fontSize: 14, textAlign: 'center', marginTop: 4, marginBottom: 15 },
  modalDescription: { fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, fontSize: 16, textAlign: 'center', lineHeight: 24, marginBottom: 25 },
  closeButton: { backgroundColor: Colors.secondary, paddingVertical: 15, borderRadius: 30, alignItems: 'center', marginTop: 10 },
  closeButtonText: { fontFamily: 'Poppins_600SemiBold', color: Colors.background, fontSize: 16 },
});

export default AchievementModal;