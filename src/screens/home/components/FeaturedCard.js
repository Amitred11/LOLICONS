import React from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import Animated, { useAnimatedStyle, interpolate, Extrapolate } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@config/Colors'; // Adjust path based on your folder structure

const { width } = Dimensions.get('window');

const FeaturedCard = ({ item, onPress, index, scrollX }) => {
    const cardWidth = width - 40;
    
    // Parallax Logic
    const inputRange = [(index - 1) * cardWidth, index * cardWidth, (index + 1) * cardWidth];
    const animatedParallaxStyle = useAnimatedStyle(() => {
        const translateX = interpolate(
            scrollX.value, 
            inputRange, 
            [-cardWidth * 0.2, 0, cardWidth * 0.2], 
            Extrapolate.CLAMP
        );
        return { transform: [{ translateX }] };
    });

    return (
        <TouchableOpacity onPress={onPress} style={styles.featuredCard}>
            <Animated.View style={[StyleSheet.absoluteFill, { overflow: 'hidden', borderRadius: 24 }]}>
                <Animated.Image 
                    source={item.localSource} 
                    style={[styles.featuredBg, animatedParallaxStyle]} 
                />
            </Animated.View>
            <LinearGradient colors={['transparent', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0.8)']} style={styles.featuredOverlay}>
                <View style={styles.featuredTextContainer}>
                    <Text style={styles.featuredSubtitle}>RECOMMENDED FOR YOU</Text>
                    <Text style={styles.featuredTitle} numberOfLines={2}>{item.title}</Text>
                    <TouchableOpacity style={styles.readNowButton} onPress={onPress}>
                        <Text style={styles.readNowButtonText}>Read Now</Text>
                    </TouchableOpacity>
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    featuredCard: { width: width - 40, height: width * 0.55, borderRadius: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16 },
    featuredBg: { width: width * 1.5, height: '100%' }, 
    featuredOverlay: { ...StyleSheet.absoluteFillObject, flexDirection: 'row', alignItems: 'flex-end', padding: 20, borderRadius: 24 },
    featuredTextContainer: { flex: 1 },
    featuredSubtitle: { fontFamily: 'Poppins_700Bold', color: Colors.secondary, fontSize: 10, marginBottom: 4, letterSpacing: 1 },
    featuredTitle: { fontFamily: 'Poppins_700Bold', color: '#fff', fontSize: 24, lineHeight: 30, marginBottom: 12 },
    readNowButton: { backgroundColor: '#fff', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 30, alignSelf: 'flex-start' },
    readNowButtonText: { fontFamily: 'Poppins_600SemiBold', color: '#000', fontSize: 13 },
});

export default FeaturedCard;