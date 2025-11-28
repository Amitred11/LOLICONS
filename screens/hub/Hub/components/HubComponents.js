// hub/components/HubComponents.js

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../../../constants/Colors';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

// Primary Action Card (for Messages, Activity, etc.) - UNCHANGED
export const PrimaryActionCard = ({ icon, title, color, onPress }) => (
  <TouchableOpacity onPress={onPress} style={styles.primaryCardContainer} activeOpacity={0.8}>
    <LinearGradient colors={color} style={styles.primaryCard}>
      <Ionicons name={icon} size={60} color="rgba(255,255,255,0.1)" style={styles.primaryCardBgIcon} />
      <Ionicons name={icon} size={32} color="#fff" />
      <Text style={styles.primaryCardTitle}>{title}</Text>
    </LinearGradient>
  </TouchableOpacity>
);

// Event Card (for the "Upcoming Events" section) - UNCHANGED
export const EventCard = ({ title, time, gameIcon, onPress }) => {
    const scale = useSharedValue(1);
    const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

    return (
        <Animated.View style={animatedStyle}>
            <TouchableOpacity 
                onPress={onPress} 
                style={styles.eventCardContainer} 
                activeOpacity={1}
                onPressIn={() => scale.value = withSpring(0.95)}
                onPressOut={() => scale.value = withSpring(1)}
            >
                <View style={styles.eventIconContainer}>
                    <Ionicons name={gameIcon} size={24} color={Colors.primary} />
                </View>
                <View>
                    <Text style={styles.eventTitle}>{title}</Text>
                    <Text style={styles.eventTime}>{time}</Text>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
};


// --- DESIGN REFINED: FeaturedSectionCard ---
export const FeaturedSectionCard = ({ title, description, image, buttonText, onPress }) => (
    <TouchableOpacity onPress={onPress} style={styles.featuredCardContainer} activeOpacity={0.9}>
        <ImageBackground source={image} style={styles.featuredCardBg} imageStyle={{ borderRadius: 24 }}>
            {/* The gradient now starts higher and ends darker for better readability */}
            <LinearGradient colors={['transparent', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.95)']} style={styles.spotlightOverlay} />
            
            {/* All content is now wrapped in a single view for a clean vertical layout */}
            <View>
                <Text style={styles.featuredCardTitle}>{title}</Text>
                <Text style={styles.featuredCardDescription}>{description}</Text>
                <View style={styles.featuredCardButton}>
                    <Text style={styles.featuredCardButtonText}>{buttonText}</Text>
                    <Ionicons name="arrow-forward" size={16} color={Colors.darkBackground} />
                </View>
            </View>
        </ImageBackground>
    </TouchableOpacity>
);


const styles = StyleSheet.create({
    // PrimaryActionCard Styles
    primaryCardContainer: { marginRight: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 5 },
    primaryCard: { width: 130, height: 160, borderRadius: 24, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
    primaryCardBgIcon: { position: 'absolute', top: -10, left: -10, opacity: 0.5 },
    primaryCardTitle: { fontFamily: 'Poppins_600SemiBold', color: '#fff', fontSize: 17, marginTop: 12 },
  
    // EventCard Styles
    eventCardContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, padding: 12, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    eventIconContainer: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primary + '20', alignItems: 'center', justifyContent: 'center', marginRight: 15 },
    eventTitle: { fontFamily: 'Poppins_600SemiBold', color: Colors.text, fontSize: 16 },
    eventTime: { fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, fontSize: 13, marginTop: 2 },

    // --- REFINED STYLES for FeaturedSectionCard ---
    spotlightOverlay: { // Helper style for the gradient
        ...StyleSheet.absoluteFillObject, 
        borderRadius: 24 
    },
    featuredCardContainer: { 
        marginHorizontal: 20,
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: 8 }, 
        shadowOpacity: 0.3, 
        shadowRadius: 10, 
        elevation: 10 
    },
    featuredCardBg: { 
        height: 190, // Slightly taller for a more premium feel
        borderRadius: 24,
        justifyContent: 'flex-end', // Aligns all content to the bottom
        padding: 24, // Increased padding for better spacing
    },
    featuredCardTitle: { 
        fontFamily: 'Poppins_700Bold', 
        color: '#fff', 
        fontSize: 28, // Slightly larger title
        lineHeight: 34,
        textShadowColor: 'rgba(0, 0, 0, 0.75)', 
        textShadowOffset: { width: 0, height: 1 }, 
        textShadowRadius: 10 
    },
    featuredCardDescription: { 
        fontFamily: 'Poppins_500Medium', 
        color: 'rgba(255,255,255,0.85)', 
        fontSize: 15, 
        marginTop: 8, // Increased spacing from title
        maxWidth: '90%', // Prevents text from touching the edge
    },
    featuredCardButton: {
        backgroundColor: '#fff',
        paddingVertical: 10, // Slightly larger button
        paddingHorizontal: 20,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 16, // Increased spacing from description
        alignSelf: 'flex-start', // Aligns button to the left under the text
    },
    featuredCardButtonText: {
        fontFamily: 'Poppins_600SemiBold',
        color: Colors.darkBackground,
        marginRight: 8,
        fontSize: 14,
    },
});