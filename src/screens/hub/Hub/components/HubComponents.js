import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@config/Colors';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withSequence, withTiming } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

// --- HELPER: Glass Button ---
const GlassButton = ({ text, icon, onPress }) => (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        <View style={styles.glassButton}>
            <Text style={styles.glassButtonText}>{text}</Text>
            {icon && <Ionicons name={icon} size={16} color="#fff" style={{ marginLeft: 6 }} />}
        </View>
    </TouchableOpacity>
);

// --- COMPONENT 1: Media Poster Card (Portrait - For Horizontal Scroll) ---
export const MediaPosterCard = ({ title, category, image, onPress }) => {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const onPressIn = () => { scale.value = withSpring(0.95); };
    const onPressOut = () => { scale.value = withSpring(1); };

    return (
        <Animated.View style={[styles.posterContainer, animatedStyle]}>
            <TouchableOpacity 
                onPress={onPress} 
                onPressIn={onPressIn} 
                onPressOut={onPressOut} 
                activeOpacity={1}
            >
                <ImageBackground 
                    source={image} 
                    style={styles.posterImage} 
                    imageStyle={{ borderRadius: 16 }}
                >
                    <LinearGradient 
                        colors={['transparent', 'rgba(0,0,0,0.8)']} 
                        style={styles.posterGradient} 
                    />
                    <View style={styles.posterContent}>
                        <Text style={styles.posterCategory}>{category}</Text>
                        <Text style={styles.posterTitle} numberOfLines={2}>{title}</Text>
                    </View>
                    
                    {/* Play Icon Overlay */}
                    <View style={styles.playIconContainer}>
                        <Ionicons name="play" size={12} color="#fff" style={{ marginLeft: 2 }} />
                    </View>
                </ImageBackground>
            </TouchableOpacity>
        </Animated.View>
    );
};

// --- COMPONENT 2: Event Hero Card (Landscape - Premium Look) ---
export const EventHeroCard = ({ title, description, image, date, onPress }) => {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    return (
        <Animated.View style={[styles.heroCardWrapper, animatedStyle]}>
            <TouchableOpacity 
                onPress={onPress} 
                activeOpacity={0.9}
                onPressIn={() => scale.value = withSpring(0.98)}
                onPressOut={() => scale.value = withSpring(1)}
            >
                <ImageBackground 
                    source={image} 
                    style={styles.heroCardBg} 
                    imageStyle={{ borderRadius: 24 }}
                >
                    {/* Darker gradient for better text readability */}
                    <LinearGradient 
                        colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.6)', '#000']} 
                        style={styles.heroOverlay} 
                    />

                    {/* Hanging Date Badge (Top Right) */}
                    <View style={styles.floatingBadge}>
                        <View style={styles.badgeTop}>
                            <Text style={styles.badgeMonth}>{date?.month || 'DEC'}</Text>
                        </View>
                        <View style={styles.badgeBottom}>
                            <Text style={styles.badgeDay}>{date?.day || '24'}</Text>
                        </View>
                    </View>

                    {/* Bottom Content Area */}
                    <View style={styles.heroContent}>
                        <View style={styles.liveTagRow}>
                            <View style={styles.liveDot} />
                            <Text style={styles.liveText}>UPCOMING</Text>
                        </View>
                        
                        <Text style={styles.heroTitle} numberOfLines={2}>{title}</Text>
                        <Text style={styles.heroDesc} numberOfLines={1}>{description}</Text>
                        
                        <View style={{ marginTop: 16 }}>
                            <GlassButton text="Event Details" icon="arrow-forward" onPress={onPress} />
                        </View>
                    </View>
                </ImageBackground>
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    // --- Glass Button Styles ---
    glassButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.15)', // Glassy effect
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 30,
        alignSelf: 'flex-start',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    glassButtonText: {
        fontFamily: 'Poppins_600SemiBold',
        color: '#fff',
        fontSize: 13,
    },

    // --- Media Poster Styles ---
    posterContainer: {
        width: 140,
        marginRight: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 5,
    },
    posterImage: {
        width: 140,
        height: 210, // Tall aspect ratio
        justifyContent: 'flex-end',
        borderRadius: 16,
        overflow: 'hidden',
    },
    posterGradient: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 16,
    },
    posterContent: {
        padding: 12,
    },
    posterCategory: {
        fontFamily: 'Poppins_500Medium',
        color: Colors.primary,
        fontSize: 10,
        textTransform: 'uppercase',
        marginBottom: 2,
    },
    posterTitle: {
        fontFamily: 'Poppins_600SemiBold',
        color: '#fff',
        fontSize: 14,
        lineHeight: 18,
    },
    playIconContainer: {
        position: 'absolute',
        top: 10,
        right: 10,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: 'rgba(0,0,0,0.5)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },

    // --- Event Hero Styles ---
    heroCardWrapper: {
        width: '100%',
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 8,
    },
    heroCardBg: {
        height: 280, // Very tall, immersive card
        justifyContent: 'flex-end',
        borderRadius: 24,
        overflow: 'hidden', // Keeps the gradient inside
    },
    heroOverlay: {
        ...StyleSheet.absoluteFillObject,
    },
    heroContent: {
        padding: 24,
    },
    liveTagRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    liveDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: Colors.primary,
        marginRight: 6,
    },
    liveText: {
        fontFamily: 'Poppins_700Bold',
        color: Colors.primary,
        fontSize: 10,
        letterSpacing: 1,
    },
    heroTitle: {
        fontFamily: 'Poppins_700Bold',
        color: '#fff',
        fontSize: 26,
        lineHeight: 32,
        marginBottom: 6,
    },
    heroDesc: {
        fontFamily: 'Poppins_400Regular',
        color: 'rgba(255,255,255,0.7)',
        fontSize: 14,
    },

    // --- Badge Styles ---
    floatingBadge: {
        position: 'absolute',
        top: 20,
        right: 20,
        width: 50,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 6,
    },
    badgeTop: {
        backgroundColor: Colors.primary,
        alignItems: 'center',
        paddingVertical: 4,
    },
    badgeMonth: {
        fontFamily: 'Poppins_700Bold',
        color: '#fff',
        fontSize: 10,
        textTransform: 'uppercase',
    },
    badgeBottom: {
        backgroundColor: '#fff',
        alignItems: 'center',
        paddingVertical: 6,
    },
    badgeDay: {
        fontFamily: 'Poppins_700Bold',
        color: '#000',
        fontSize: 18,
    },
});