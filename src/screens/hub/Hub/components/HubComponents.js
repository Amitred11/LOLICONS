import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@config/Colors';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { BlurView } from 'expo-blur'; // Ensure expo-blur is installed

const { width } = Dimensions.get('window');

// --- Refactored Media Card (with Rank Number) ---
export const MediaPosterCard = ({ title, category, image, onPress, rank }) => {
    const scale = useSharedValue(1);
    const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

    return (
        <Animated.View style={[styles.posterContainer, animatedStyle]}>
            <TouchableOpacity 
                onPress={onPress} 
                onPressIn={() => (scale.value = withSpring(0.96))}
                onPressOut={() => (scale.value = withSpring(1))}
                activeOpacity={1}
            >
                {/* Ranking Number Overlay */}
                {rank && (
                    <Text style={styles.rankNumber}>{rank}</Text>
                )}
                
                <ImageBackground source={image} style={styles.posterImage} imageStyle={{ borderRadius: 12 }}>
                    <LinearGradient colors={['transparent', 'rgba(0,0,0,0.9)']} style={styles.posterGradient} />
                    <View style={styles.posterContent}>
                        <Text style={styles.posterTitle} numberOfLines={1}>{title}</Text>
                        <Text style={styles.posterCategory}>{category}</Text>
                    </View>
                </ImageBackground>
            </TouchableOpacity>
        </Animated.View>
    );
};

// --- Refactored Event Hero (Spotlight Style) ---
export const EventHeroCard = ({ title, description, image, date, onPress }) => {
    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={styles.heroWrapper}>
            <ImageBackground source={image} style={styles.heroImage} imageStyle={{ borderRadius: 28 }}>
                <LinearGradient 
                    colors={['rgba(0,0,0,0.2)', 'transparent', 'rgba(0,0,0,0.8)']} 
                    style={StyleSheet.absoluteFill} 
                />
                
                {/* Modern Date Badge */}
                <View style={styles.modernBadge}>
                    <Text style={styles.modernBadgeDay}>{date?.day}</Text>
                    <Text style={styles.modernBadgeMonth}>{date?.month}</Text>
                </View>

                {/* Glassmorphic Info Panel */}
                <BlurView intensity={40} tint="dark" style={styles.glassInfoPanel}>
                    <View style={styles.infoRow}>
                        <View style={{ flex: 1 }}>
                            <View style={styles.liveIndicator}>
                                <View style={styles.liveDot} />
                                <Text style={styles.liveText}>FEATURED EVENT</Text>
                            </View>
                            <Text style={styles.heroTitle} numberOfLines={1}>{title}</Text>
                            <Text style={styles.heroDesc} numberOfLines={1}>{description}</Text>
                        </View>
                        <View style={styles.heroGoButton}>
                            <Ionicons name="arrow-forward" size={24} color="#fff" />
                        </View>
                    </View>
                </BlurView>
            </ImageBackground>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    // --- Media Card Styles ---
    posterContainer: { width: 150, marginRight: 20, height: 230, justifyContent: 'flex-end' },
    posterImage: { width: 150, height: 210, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.5, shadowRadius: 10 },
    posterGradient: { ...StyleSheet.absoluteFillObject },
    posterContent: { padding: 10, backgroundColor: '#00000083' },
    posterTitle: { fontFamily: 'Poppins_600SemiBold', color: '#fff', fontSize: 13 },
    posterCategory: { fontFamily: 'Poppins_400Regular', color: Colors.primary, fontSize: 10, textTransform: 'uppercase' },
    rankNumber: {
        position: 'absolute', left: -15, bottom: -10, zIndex: 2,
        fontSize: 80, fontFamily: 'Poppins_900Black', color: 'rgba(250, 250, 250, 1)',
        textShadowColor: 'rgba(0,0,0,0.8)', textShadowOffset: { width: 2, height: 2 }, textShadowRadius: 1,
    },

    // --- Hero Card Styles ---
    heroWrapper: { marginHorizontal: 20, height: 320, borderRadius: 28, elevation: 10, shadowColor: Colors.primary, shadowOpacity: 0.3, shadowRadius: 20 },
    heroImage: { flex: 1, justifyContent: 'flex-end', padding: 15 },
    modernBadge: {
        position: 'absolute', top: 20, left: 20,
        backgroundColor: Colors.primary, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 15, alignItems: 'center'
    },
    modernBadgeDay: { fontFamily: 'Poppins_700Bold', color: '#fff', fontSize: 18, lineHeight: 20 },
    modernBadgeMonth: { fontFamily: 'Poppins_700Bold', color: '#fff', fontSize: 10, marginTop: -2 },
    
    glassInfoPanel: {
        borderRadius: 20, padding: 16, overflow: 'hidden',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
    },
    infoRow: { flexDirection: 'row', alignItems: 'center' },
    liveIndicator: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
    liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.primary, marginRight: 6 },
    liveText: { fontFamily: 'Poppins_700Bold', color: Colors.primary, fontSize: 10, letterSpacing: 1 },
    heroTitle: { fontFamily: 'Poppins_700Bold', color: '#fff', fontSize: 20 },
    heroDesc: { fontFamily: 'Poppins_400Regular', color: 'rgba(255,255,255,0.7)', fontSize: 12 },
    heroGoButton: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center', marginLeft: 15 },
});