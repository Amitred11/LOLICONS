import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ImageBackground, TouchableOpacity, Dimensions, StatusBar, Modal } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Colors } from '../../../constants/Colors';
import { mediaData } from '../../../constants/mockData';
import WatchSelectionModal from './components/WatchSelectionModal'; // Create this file next

const { width, height } = Dimensions.get('window');
const BACKDROP_HEIGHT = height * 0.55;

// --- Smooth Touch Component ---
const ScaleButton = ({ onPress, style, children }) => {
    const scale = useSharedValue(1);
    const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

    return (
        <Animated.View style={[style, animatedStyle]}>
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={onPress}
                onPressIn={() => (scale.value = withSpring(0.96))}
                onPressOut={() => (scale.value = withSpring(1))}
            >
                {children}
            </TouchableOpacity>
        </Animated.View>
    );
};

const RecommendationCard = ({ item, onPress }) => (
    <TouchableOpacity onPress={onPress} style={styles.recCard} activeOpacity={0.7}>
        <ImageBackground source={item.poster} style={styles.recImage} imageStyle={{ borderRadius: 12 }} />
        <Text style={styles.recTitle} numberOfLines={1}>{item.title}</Text>
    </TouchableOpacity>
);

const MediaDetailScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const { mediaId } = route.params;
    
    const [isFavorite, setIsFavorite] = useState(false);
    const [showWatchModal, setShowWatchModal] = useState(false); // State for the new modal

    const mediaItem = mediaData.find(item => item.id === mediaId);
    
    // Recommendations Logic
    const recommendations = mediaData.filter(
        item => item.type === mediaItem?.type && item.id !== mediaItem?.id
    ).slice(0, 5);

    if (!mediaItem) return null;

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
            
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 50 }}>
                {/* Immersive Backdrop */}
                <ImageBackground source={mediaItem.backdrop} style={styles.backdrop}>
                    <LinearGradient
                        colors={['rgba(0,0,0,0.3)', 'transparent', Colors.darkBackground]}
                        style={styles.backdropGradient}
                        locations={[0, 0.5, 1]}
                    />
                    
                    {/* Header Controls */}
                    <View style={[styles.headerBar, { marginTop: insets.top }]}>
                        <TouchableOpacity style={styles.glassButton} onPress={() => navigation.goBack()}>
                            <Ionicons name="arrow-back" size={24} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.glassButton}>
                            <Ionicons name="share-outline" size={24} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </ImageBackground>

                <View style={styles.contentContainer}>
                    {/* Title & Metadata */}
                    <Text style={styles.title}>{mediaItem.title}</Text>
                    
                    <View style={styles.metaRow}>
                        <View style={styles.ratingTag}>
                            <Ionicons name="star" size={14} color={Colors.darkBackground} />
                            <Text style={styles.ratingText}>{mediaItem.rating}</Text>
                        </View>
                        <Text style={styles.metaText}>2024 • {mediaItem.type} • 2h 14m</Text>
                    </View>

                    {/* Smooth Play Button */}
                    <ScaleButton 
                        style={styles.playButtonWrapper} 
                        onPress={() => setShowWatchModal(true)} // Open the modal
                    >
                        <LinearGradient 
                            colors={[Colors.primary, '#FF6B6B']} 
                            start={{x: 0, y: 0}} end={{x: 1, y: 0}}
                            style={styles.playButtonGradient}
                        >
                            <Ionicons name="play" size={24} color="#fff" style={{ marginRight: 8 }} />
                            <Text style={styles.playButtonText}>Watch Now</Text>
                        </LinearGradient>
                    </ScaleButton>

                    <Text style={styles.description}>{mediaItem.description}</Text>

                    {/* Action Grid */}
                    <View style={styles.actionGrid}>
                        <TouchableOpacity style={styles.actionItem} onPress={() => setIsFavorite(!isFavorite)}>
                            <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={26} color={isFavorite ? Colors.primary : Colors.textSecondary} />
                            <Text style={styles.actionText}>My List</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionItem}>
                            <Ionicons name="download-outline" size={26} color={Colors.textSecondary} />
                            <Text style={styles.actionText}>Download</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionItem}>
                            <Ionicons name="chatbubble-ellipses-outline" size={26} color={Colors.textSecondary} />
                            <Text style={styles.actionText}>Reviews</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Recommendations */}
                    {recommendations.length > 0 && (
                        <View style={styles.sectionContainer}>
                            <Text style={styles.sectionTitle}>More Like This</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                {recommendations.map(item => (
                                    <RecommendationCard 
                                        key={item.id} 
                                        item={item} 
                                        onPress={() => navigation.push('MediaDetail', { mediaId: item.id })}
                                    />
                                ))}
                            </ScrollView>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* The Watch Options Modal */}
            <WatchSelectionModal 
                visible={showWatchModal} 
                onClose={() => setShowWatchModal(false)}
                onSelectOption={(option) => {
                    setShowWatchModal(false);
                    // Navigate to player with the selected mode
                    setTimeout(() => navigation.navigate('VideoPlayer', { mode: option, media: mediaItem }), 300);
                }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.darkBackground },
    backdrop: { width: width, height: BACKDROP_HEIGHT, justifyContent: 'space-between' },
    backdropGradient: { ...StyleSheet.absoluteFillObject },
    headerBar: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10 },
    glassButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.3)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    contentContainer: { paddingHorizontal: 24, marginTop: -80 },
    title: { fontFamily: 'Poppins_700Bold', color: '#fff', fontSize: 36, lineHeight: 42, marginBottom: 10, textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: {width: 0, height: 2}, textShadowRadius: 4 },
    metaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
    ratingTag: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.primary, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginRight: 12 },
    ratingText: { fontFamily: 'Poppins_700Bold', color: Colors.darkBackground, fontSize: 12, marginLeft: 4 },
    metaText: { color: 'rgba(255,255,255,0.7)', fontFamily: 'Poppins_500Medium', fontSize: 14 },
    playButtonWrapper: { width: '100%', marginBottom: 24, borderRadius: 16, shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 10 },
    playButtonGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, borderRadius: 16 },
    playButtonText: { fontFamily: 'Poppins_600SemiBold', color: '#fff', fontSize: 18, letterSpacing: 0.5 },
    description: { fontFamily: 'Poppins_400Regular', color: 'rgba(255,255,255,0.8)', fontSize: 15, lineHeight: 24, marginBottom: 24 },
    actionGrid: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 20, borderTopWidth: 1, borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.1)', marginBottom: 30 },
    actionItem: { alignItems: 'center' },
    actionText: { color: Colors.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 12, marginTop: 6 },
    sectionContainer: { marginBottom: 30 },
    sectionTitle: { fontFamily: 'Poppins_600SemiBold', color: '#fff', fontSize: 20, marginBottom: 15 },
    recCard: { width: 120, marginRight: 15 },
    recImage: { width: 120, height: 180, marginBottom: 8, backgroundColor: '#333' },
    recTitle: { color: '#fff', fontFamily: 'Poppins_500Medium', fontSize: 13 },
});

export default MediaDetailScreen;