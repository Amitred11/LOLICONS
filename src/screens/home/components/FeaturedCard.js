import React from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import Animated, { useAnimatedStyle, interpolate, Extrapolate } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons'; 
import { Colors } from '@config/Colors';

const { width } = Dimensions.get('window');

// --- Configuration ---
const CARD_MARGIN = 12;
const CARD_WIDTH = width - 48; 
const SNAP_SIZE = CARD_WIDTH + CARD_MARGIN;

const FeaturedCard = ({ item, onPress, index, scrollX }) => {
    
    // Parallax Logic
    const inputRange = [
        (index - 1) * SNAP_SIZE,
        index * SNAP_SIZE,
        (index + 1) * SNAP_SIZE
    ];

    const animatedParallaxStyle = useAnimatedStyle(() => {
        const translateX = interpolate(
            scrollX.value, 
            inputRange, 
            [-width * 0.25, 0, width * 0.25], 
            Extrapolate.CLAMP
        );
        return { transform: [{ translateX }] };
    });

    const animatedScaleStyle = useAnimatedStyle(() => {
        const scale = interpolate(
            scrollX.value,
            inputRange,
            [0.95, 1, 0.95], 
            Extrapolate.CLAMP
        );
        return { transform: [{ scale }] };
    });

    return (
        <Animated.View style={[styles.container, animatedScaleStyle]}>
            <TouchableOpacity 
                activeOpacity={0.9} 
                onPress={onPress} 
                style={styles.cardContainer}
            >
                {/* Parallax Image Background */}
                <Animated.View style={styles.imageContainer}>
                    <Animated.Image 
                        source={item.localSource} 
                        style={[styles.parallaxImage, animatedParallaxStyle]} 
                        resizeMode="cover"
                    />
                </Animated.View>

                {/* Gradient Overlay */}
                <LinearGradient 
                    colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.9)']} 
                    style={styles.gradientOverlay}
                >
                    <View style={styles.contentContainer}>
                        
                        {/* Top Badge */}
                        <View style={styles.badgeContainer}>
                            <Text style={styles.badgeText}>TRENDING</Text>
                        </View>

                        {/* Title & Button */}
                        <View>
                            <Text style={styles.title} numberOfLines={2}>
                                {item.title}
                            </Text>
                            
                            <TouchableOpacity style={styles.actionButton} onPress={onPress}>
                                <Text style={styles.actionButtonText}>Read Now</Text>
                                <Ionicons name="arrow-forward" size={16} color="#FFF" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </LinearGradient>

                {/* Border Overlay */}
                <View style={styles.borderOverlay} pointerEvents="none" />
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: CARD_WIDTH,
        marginRight: CARD_MARGIN,
        justifyContent: 'center', 
    },
    cardContainer: {
        width: '100%',
        height: width * 0.6, 
        borderRadius: 24,
        overflow: 'hidden',
        backgroundColor: '#1a1a1a', 
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
    },
    imageContainer: {
        ...StyleSheet.absoluteFillObject,
        overflow: 'hidden',
    },
    parallaxImage: {
        width: CARD_WIDTH * 1.4, // Wider than card for parallax
        height: '100%',
    },
    gradientOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'flex-end',
        padding: 20,
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'space-between',
    },
    badgeContainer: {
        alignSelf: 'flex-start',
        backgroundColor: Colors.secondary || '#FF5A5F',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        marginTop: 10,
        marginLeft: 4,
    },
    badgeText: {
        color: '#FFF',
        fontFamily: 'Poppins_700Bold',
        fontSize: 10,
        letterSpacing: 1,
    },
    title: {
        fontFamily: 'Poppins_700Bold',
        color: '#FFF',
        fontSize: 26,
        lineHeight: 32,
        marginBottom: 16,
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 30,
        alignSelf: 'flex-start',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    actionButtonText: {
        fontFamily: 'Poppins_600SemiBold',
        color: '#FFF',
        fontSize: 14,
        marginRight: 8,
    },
    borderOverlay: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
});

export default FeaturedCard;