import React, { useState } from 'react';
import { 
    View, Text, StyleSheet, ScrollView, ImageBackground, TouchableOpacity, 
    Dimensions, StatusBar, Image 
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, { FadeInDown } from 'react-native-reanimated';

// Import your modal
import WatchSelectionModal from './components/WatchSelectionModal'; 
import { mediaData } from '@config/mockData';

const { width, height } = Dimensions.get('window');

// Theme Constants (keeping consistent)
const Theme = {
    background: '#09090b',
    surface: '#18181b',
    primary: '#E50914',
    text: '#FFFFFF',
    textSecondary: '#A1A1AA',
};

const MediaDetailScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const { mediaId } = route.params;

    const [isFavorite, setIsFavorite] = useState(false);
    const [showWatchModal, setShowWatchModal] = useState(false);

    const mediaItem = mediaData.find(item => item.id === mediaId) || mediaData[0];
    const recommendations = mediaData.filter(i => i.id !== mediaId).slice(0, 5);

    // Mock Cast Data
    const castMembers = [1,2,3,4].map(i => ({ id: i, name: 'Actor Name', img: `https://i.pravatar.cc/100?img=${i+10}` }));

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            <ScrollView 
                showsVerticalScrollIndicator={false} 
                contentContainerStyle={{ paddingBottom: 100 }}
                bounces={false}
            >
                {/* --- IMMERSIVE BACKDROP --- */}
                <View style={styles.posterContainer}>
                    <ImageBackground source={mediaItem.backdrop} style={styles.posterImage} resizeMode="cover">
                        <LinearGradient 
                            colors={['rgba(0,0,0,0.1)', Theme.background]} 
                            style={styles.posterGradient}
                            locations={[0.4, 1]}
                        />
                    </ImageBackground>
                    
                    {/* Header Buttons (Absolute) */}
                    <View style={[styles.headerActions, { top: insets.top }]}>
                        <TouchableOpacity 
                            style={styles.glassIconBtn} 
                            onPress={() => navigation.goBack()}
                        >
                            <Ionicons name="arrow-back" size={24} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.glassIconBtn}>
                            <Ionicons name="share-social-outline" size={22} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* --- CONTENT INFO --- */}
                <View style={styles.contentBody}>
                    {/* Title Area */}
                    <Animated.View entering={FadeInDown.duration(600).delay(100)}>
                        <Text style={styles.title}>{mediaItem.title}</Text>
                        
                        <View style={styles.metaRow}>
                            <Text style={styles.matchScore}>98% Match</Text>
                            <Text style={styles.metaText}>2024</Text>
                            <View style={styles.qualityBadge}><Text style={styles.qualityText}>4K</Text></View>
                            <View style={styles.qualityBadge}><Text style={styles.qualityText}>HDR</Text></View>
                            <Text style={styles.metaText}>{mediaItem.type}</Text>
                        </View>
                    </Animated.View>

                    {/* Action Buttons */}
                    <Animated.View style={styles.actionRow} entering={FadeInDown.duration(600).delay(200)}>
                        <TouchableOpacity 
                            style={styles.playButton} 
                            activeOpacity={0.9}
                            onPress={() => setShowWatchModal(true)}
                        >
                            <Ionicons name="play" size={24} color="#fff" />
                            <Text style={styles.playText}>Play</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.downloadButton} activeOpacity={0.7}>
                            <Ionicons name="download-outline" size={24} color="#fff" />
                            <Text style={styles.downloadText}>Download</Text>
                        </TouchableOpacity>
                    </Animated.View>

                    {/* Description */}
                    <Text style={styles.description} numberOfLines={4}>
                        {mediaItem.description || "In a world where technology rules, one hero rises to challenge the system. Experience the journey of a lifetime in this critically acclaimed masterpiece."}
                    </Text>

                    {/* Secondary Actions Grid */}
                    <View style={styles.iconGrid}>
                        <TouchableOpacity style={styles.gridAction} onPress={() => setIsFavorite(!isFavorite)}>
                            <Ionicons name={isFavorite ? "checkmark" : "add"} size={26} color="#fff" />
                            <Text style={styles.gridText}>My List</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.gridAction}>
                            <Ionicons name="thumbs-up-outline" size={24} color="#fff" />
                            <Text style={styles.gridText}>Rate</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.gridAction}>
                            <Ionicons name="paper-plane-outline" size={24} color="#fff" />
                            <Text style={styles.gridText}>Share</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Cast Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Cast & Crew</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.castScroll}>
                            {castMembers.map(actor => (
                                <View key={actor.id} style={styles.castCard}>
                                    <Image source={{ uri: actor.img }} style={styles.castImg} />
                                    <Text style={styles.castName} numberOfLines={1}>{actor.name}</Text>
                                </View>
                            ))}
                        </ScrollView>
                    </View>

                    {/* More Like This */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>More Like This</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recScroll}>
                            {recommendations.map(item => (
                                <TouchableOpacity 
                                    key={item.id} 
                                    style={styles.recCard}
                                    onPress={() => navigation.push('MediaDetail', { mediaId: item.id })}
                                >
                                    <Image source={item.poster} style={styles.recImg} />
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </ScrollView>

            <WatchSelectionModal 
                visible={showWatchModal} 
                onClose={() => setShowWatchModal(false)}
                onSelectOption={(option) => {
                    setShowWatchModal(false);
                    setTimeout(() => navigation.navigate('VideoPlayer', { mode: option, media: mediaItem }), 300);
                }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Theme.background },
    
    // Header & Poster
    posterContainer: { width: width, height: height * 0.6 },
    posterImage: { width: '100%', height: '100%' },
    posterGradient: { position: 'absolute', left: 0, right: 0, bottom: 0, height: '60%' },
    headerActions: { position: 'absolute', left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20 },
    glassIconBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },

    // Body
    contentBody: { paddingHorizontal: 20, marginTop: -60 },
    title: { fontSize: 36, fontWeight: '800', color: '#fff', marginBottom: 12, lineHeight: 40, textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: {width: 0, height: 2}, textShadowRadius: 4 },
    
    // Meta
    metaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 10 },
    matchScore: { color: '#46d369', fontWeight: 'bold', fontSize: 14 },
    metaText: { color: Theme.textSecondary, fontSize: 14 },
    qualityBadge: { borderWidth: 1, borderColor: Theme.textSecondary, borderRadius: 4, paddingHorizontal: 4, paddingTop: 1 },
    qualityText: { color: Theme.textSecondary, fontSize: 10, fontWeight: 'bold' },

    // Primary Actions
    actionRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
    playButton: { flex: 1, flexDirection: 'row', backgroundColor: '#fff', paddingVertical: 14, borderRadius: 4, alignItems: 'center', justifyContent: 'center', gap: 8 },
    playText: { color: '#000', fontSize: 16, fontWeight: '700' },
    downloadButton: { flex: 1, flexDirection: 'row', backgroundColor: '#27272a', paddingVertical: 14, borderRadius: 4, alignItems: 'center', justifyContent: 'center', gap: 8 },
    downloadText: { color: '#fff', fontSize: 16, fontWeight: '600' },

    description: { color: '#fff', fontSize: 14, lineHeight: 22, marginBottom: 24 },

    // Grid Icons
    iconGrid: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 30 },
    gridAction: { alignItems: 'center', gap: 6 },
    gridText: { color: Theme.textSecondary, fontSize: 12 },

    // Sections
    section: { marginBottom: 30 },
    sectionTitle: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 15 },
    
    // Cast
    castScroll: { gap: 15 },
    castCard: { width: 80, alignItems: 'center' },
    castImg: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#333', marginBottom: 6 },
    castName: { color: Theme.textSecondary, fontSize: 11, textAlign: 'center' },

    // Recommendations
    recScroll: { gap: 12 },
    recCard: { width: 110 },
    recImg: { width: 110, height: 160, borderRadius: 6, backgroundColor: '#333' },
});

export default MediaDetailScreen;