import React, { useState, useEffect } from 'react';
import { 
    View, Text, StyleSheet, ScrollView, TouchableOpacity, 
    Dimensions, StatusBar, Image, ActivityIndicator, Share, Modal 
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
    FadeInDown, 
    useSharedValue, 
    useAnimatedStyle, 
    interpolate, 
    Extrapolate, 
    useAnimatedScrollHandler,
    withSpring 
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';

import WatchSelectionModal from './components/WatchSelectionModal'; 
import { useAlert } from '@context/other/AlertContext';
import { useMedia } from '@context/hub/MediaContext';
import { MediaService } from '@api/hub/MockMediaService';

const { width, height } = Dimensions.get('window');

const Theme = {
    background: '#000000',
    primary: '#E50914', // Netflix Red
    text: '#FFFFFF',
    textSecondary: '#A1A1AA',
    success: '#46d369',
};

// --- Rating Modal Component ---
const RatingModal = ({ visible, onClose, onRate }) => {
    return (
        <Modal transparent visible={visible} animationType="fade">
            <View style={styles.modalOverlay}>
                <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
                <View style={styles.ratingContainer}>
                    <Text style={styles.ratingTitle}>Rate this title</Text>
                    <View style={styles.starsRow}>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <TouchableOpacity key={star} onPress={() => onRate(star)}>
                                <Ionicons name="star-outline" size={32} color="#FFD700" style={{ marginHorizontal: 5 }} />
                            </TouchableOpacity>
                        ))}
                    </View>
                    <TouchableOpacity style={styles.closeRatingBtn} onPress={onClose}>
                        <Text style={styles.closeRatingText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const MediaDetailScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const { showAlert } = useAlert();
    const { mediaId } = route.params;
    const scrollY = useSharedValue(0);

    // Context & Service
    const { getMediaById, getCast, toggleFavorite } = useMedia();

    // Data State
    const [loading, setLoading] = useState(true);
    const [mediaItem, setMediaItem] = useState(null);
    const [castMembers, setCastMembers] = useState([]);
    
    // Interaction State
    const [isFavorite, setIsFavorite] = useState(false);
    const [showWatchModal, setShowWatchModal] = useState(false);
    
    // Download State
    const [downloadStatus, setDownloadStatus] = useState('idle'); // idle, downloading, downloaded
    
    // Rating State
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [userRating, setUserRating] = useState(null);

    useEffect(() => {
        loadData();
    }, [mediaId]);

    const loadData = async () => {
        setLoading(true);
        const [mediaRes, castRes] = await Promise.all([
            getMediaById(mediaId),
            getCast(mediaId)
        ]);

        if (mediaRes.success) {
            setMediaItem(mediaRes.data);
            setIsFavorite(mediaRes.data.isFavorite);
        } else {
            showAlert({ title: 'Error', message: 'Content unavailable', type: 'error', onClose: () => navigation.goBack() });
        }

        if (castRes.success) setCastMembers(castRes.data);
        setLoading(false);
    };

    // --- Action Handlers ---

    const handleToggleFavorite = async () => {
        setIsFavorite(!isFavorite); // Optimistic
        const res = await toggleFavorite(mediaId);
        if (!res.success) setIsFavorite(!isFavorite); // Revert
        
        showAlert({ 
            title: !isFavorite ? 'Added to My List' : 'Removed from List', 
            message: res.message, 
            type: 'success' 
        });
    };

    const handleDownload = () => {
        if (downloadStatus === 'downloaded') {
            showAlert({ title: 'Downloaded', message: 'This item is already available offline.', type: 'info' });
            return;
        }

        setDownloadStatus('downloading');
        
        // Simulate Download Process
        setTimeout(() => {
            setDownloadStatus('downloaded');
            showAlert({ title: 'Download Complete', message: `${mediaItem.title} is now available offline.`, type: 'success' });
        }, 2500);
    };

    const handleShare = async () => {
        try {
            await Share.share({
                message: `Check out ${mediaItem.title}! It's amazing. Watch it here: https://myapp.com/media/${mediaItem.id}`,
                title: `Watch ${mediaItem.title}`
            });
        } catch (error) {
            console.error(error.message);
        }
    };

    const handleRate = async (stars) => {
        setShowRatingModal(false);
        const res = await MediaService.rateMedia(mediaId, stars);
        if (res.success) {
            setUserRating(stars);
            showAlert({ title: 'Rated!', message: `You rated this ${stars} stars.`, type: 'success' });
        }
    };

    const handleWatchOption = (option) => {
        setShowWatchModal(false);
        if (option === 'alone') {
            setTimeout(() => navigation.navigate('VideoPlayer', { media: mediaItem }), 300);
        } else {
            showAlert({ title: 'Feature Coming Soon', message: 'This mode is under development.', type: 'info' });
        }
    };

    // --- Animations ---
    const scrollHandler = useAnimatedScrollHandler(event => {
        scrollY.value = event.contentOffset.y;
    });

    const imageStyle = useAnimatedStyle(() => ({
        transform: [
            { scale: interpolate(scrollY.value, [-height, 0, height], [1.5, 1, 1.2], Extrapolate.CLAMP) },
            { translateY: interpolate(scrollY.value, [-height, 0, height], [-height * 0.1, 0, height * 0.3], Extrapolate.CLAMP) }
        ]
    }));

    if (loading || !mediaItem) {
        return (
            <View style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color={Theme.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            {/* --- HEADER --- */}
            <View style={[styles.header, { top: insets.top + 10 }]}>
                <TouchableOpacity 
                    style={styles.glassButton} 
                    onPress={() => navigation.goBack()}
                    activeOpacity={0.8}
                >
                    <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            <Animated.ScrollView 
                onScroll={scrollHandler}
                scrollEventThrottle={16}
                showsVerticalScrollIndicator={false} 
                contentContainerStyle={{ paddingBottom: 100 }}
                bounces={true}
            >
                {/* --- HERO SECTION --- */}
                <View style={styles.posterContainer}>
                    <Animated.Image 
                        source={mediaItem.backdrop} 
                        style={[styles.posterImage, imageStyle]} 
                        resizeMode="cover" 
                    />
                    <LinearGradient 
                        colors={['transparent', 'rgba(0,0,0,0.3)', '#000000']} 
                        style={styles.posterGradient}
                        locations={[0, 0.5, 1]}
                    />
                </View>

                {/* --- CONTENT SECTION --- */}
                <View style={styles.contentBody}>
                    
                    {/* Title & Tags */}
                    <Animated.View entering={FadeInDown.duration(600).delay(100)}>
                        <Text style={styles.tagline}>{String(mediaItem.type || 'Media').toUpperCase()}</Text>
                        <Text style={styles.title}>{mediaItem.title}</Text>
                        
                        <View style={styles.metaContainer}>
                            <Text style={styles.matchText}>{mediaItem.match || '95%'} Match</Text>
                            <Text style={styles.metaText}>{mediaItem.year}</Text>
                            <View style={styles.badge}><Text style={styles.badgeText}>4K</Text></View>
                            <View style={styles.badge}><Text style={styles.badgeText}>HDR</Text></View>
                            <View style={styles.badge}><Text style={styles.badgeText}>5.1</Text></View>
                        </View>
                    </Animated.View>

                    {/* Primary Actions (Play / Download) */}
                    <Animated.View style={styles.mainActions} entering={FadeInDown.duration(600).delay(200)}>
                        <TouchableOpacity 
                            style={styles.playButton} 
                            activeOpacity={0.9} 
                            onPress={() => setShowWatchModal(true)}
                        >
                            <Ionicons name="play" size={28} color="#000" />
                            <Text style={styles.playText}>Play</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                            style={[styles.downloadButton, downloadStatus === 'downloaded' && styles.downloadedButton]} 
                            activeOpacity={0.7} 
                            onPress={handleDownload}
                            disabled={downloadStatus === 'downloading'}
                        >
                            {downloadStatus === 'downloading' ? (
                                <ActivityIndicator color="#fff" />
                            ) : downloadStatus === 'downloaded' ? (
                                <>
                                    <Ionicons name="checkmark-circle" size={26} color={Theme.primary} />
                                    <Text style={styles.downloadText}>Downloaded</Text>
                                </>
                            ) : (
                                <>
                                    <Ionicons name="download-outline" size={26} color="#fff" />
                                    <Text style={styles.downloadText}>Download</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </Animated.View>

                    {/* Description */}
                    <Animated.View entering={FadeInDown.duration(600).delay(300)}>
                        <Text style={styles.description}>{mediaItem.description}</Text>
                        <Text style={styles.castPreview}>
                            Starring: {castMembers.slice(0,3).map(c => c.name).join(', ')}
                        </Text>
                    </Animated.View>

                    {/* Secondary Actions (List, Rate, Share) */}
                    <View style={styles.interactionRow}>
                        <TouchableOpacity style={styles.iconAction} onPress={handleToggleFavorite}>
                            <Ionicons name={isFavorite ? "checkmark-circle" : "add-circle-outline"} size={30} color={isFavorite ? Theme.success : "#fff"} />
                            <Text style={[styles.iconText, isFavorite && { color: Theme.success }]}>My List</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.iconAction} onPress={() => setShowRatingModal(true)}>
                            <Ionicons name={userRating ? "star" : "thumbs-up-outline"} size={28} color={userRating ? "#FFD700" : "#fff"} />
                            <Text style={[styles.iconText, userRating && { color: "#FFD700" }]}>{userRating ? 'Rated' : 'Rate'}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.iconAction} onPress={handleShare}>
                            <Ionicons name="share-social-outline" size={28} color="#fff" />
                            <Text style={styles.iconText}>Share</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Cast Carousel */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <View style={styles.sectionIndicator} />
                            <Text style={styles.sectionTitle}>Top Cast</Text>
                        </View>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.castScroll}>
                            {castMembers.map((actor, index) => (
                                <Animated.View 
                                    key={actor.id} 
                                    style={styles.castCard}
                                    entering={FadeInDown.duration(500).delay(index * 100 + 400)}
                                >
                                    <View style={styles.castImgContainer}>
                                        <Image source={{ uri: actor.img }} style={styles.castImg} />
                                    </View>
                                    <Text style={styles.castName} numberOfLines={2}>{actor.name}</Text>
                                    <Text style={styles.castRole} numberOfLines={1}>Actor</Text>
                                </Animated.View>
                            ))}
                        </ScrollView>
                    </View>

                </View>
            </Animated.ScrollView>

            {/* --- MODALS --- */}
            <WatchSelectionModal 
                visible={showWatchModal} 
                onClose={() => setShowWatchModal(false)}
                onSelectOption={handleWatchOption}
            />

            <RatingModal 
                visible={showRatingModal}
                onClose={() => setShowRatingModal(false)}
                onRate={handleRate}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Theme.background },
    center: { justifyContent: 'center', alignItems: 'center' },
    
    // Header
    header: { position: 'absolute', left: 20, right: 20, zIndex: 50, flexDirection: 'row', justifyContent: 'space-between' },
    glassButton: { 
        width: 44, height: 44, borderRadius: 22, overflow: 'hidden', 
        alignItems: 'center', justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)', borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1
    },

    // Poster / Hero
    posterContainer: { width: width, height: height * 0.65 },
    posterImage: { width: '100%', height: '100%' },
    posterGradient: { position: 'absolute', left: 0, right: 0, bottom: 0, height: '60%' }, // Increased gradient height for smoothness

    // Content
    contentBody: { paddingHorizontal: 20, marginTop: -90 }, // Pull content up more
    
    // Typography
    tagline: { color: Theme.textSecondary, fontSize: 12, fontWeight: '700', letterSpacing: 1.5, marginBottom: 8 },
    title: { 
        fontSize: 42, fontWeight: '800', color: Theme.text, marginBottom: 16, 
        lineHeight: 46, textShadowColor: 'rgba(0,0,0,0.7)', textShadowOffset: {width: 0, height: 2}, textShadowRadius: 10 
    },
    
    // Meta Data
    metaContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
    matchText: { color: Theme.success, fontWeight: 'bold', fontSize: 14, marginRight: 12 },
    metaText: { color: Theme.textSecondary, fontSize: 14, marginRight: 12 },
    badge: { 
        borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.4)', borderRadius: 4, 
        paddingHorizontal: 6, paddingVertical: 2, marginRight: 8 
    },
    badgeText: { color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: '700' },

    // Buttons
    mainActions: { marginBottom: 20 },
    playButton: { 
        flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, 
        height: 56, alignItems: 'center', justifyContent: 'center', marginBottom: 12,
        shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4.65, elevation: 8,
    },
    playText: { color: '#000', fontSize: 18, fontWeight: '700', marginLeft: 8 },
    downloadButton: { 
        flexDirection: 'row', backgroundColor: 'rgba(40, 40, 40, 0.8)', borderRadius: 12, 
        height: 56, alignItems: 'center', justifyContent: 'center',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)'
    },
    downloadedButton: { backgroundColor: 'rgba(30, 30, 30, 0.5)', borderColor: Theme.primary },
    downloadText: { color: '#fff', fontSize: 18, fontWeight: '600', marginLeft: 8 },

    // Info
    description: { color: 'rgba(255,255,255,0.9)', fontSize: 15, lineHeight: 24, marginBottom: 12 },
    castPreview: { color: Theme.textSecondary, fontSize: 13, fontStyle: 'italic', marginBottom: 24 },

    // Icons Row
    interactionRow: { 
        flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 10,
        marginBottom: 30, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 16
    },
    iconAction: { alignItems: 'center' },
    iconText: { color: Theme.textSecondary, fontSize: 12, marginTop: 6, fontWeight: '500' },

    // Cast Section
    section: { marginBottom: 30 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    sectionIndicator: { width: 4, height: 18, backgroundColor: Theme.primary, marginRight: 10, borderRadius: 2 },
    sectionTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
    
    castScroll: { paddingRight: 20 },
    castCard: { width: 100, marginRight: 16, alignItems: 'center' },
    castImgContainer: { 
        width: 80, height: 80, borderRadius: 40, marginBottom: 10, 
        borderWidth: 2, borderColor: '#333', overflow: 'hidden',
        backgroundColor: '#222'
    },
    castImg: { width: '100%', height: '100%' },
    castName: { color: '#fff', fontSize: 13, fontWeight: '600', textAlign: 'center', lineHeight: 18 },
    castRole: { color: Theme.textSecondary, fontSize: 11, textAlign: 'center' },

    // Modal Styles
    modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
    ratingContainer: { 
        width: width * 0.8, backgroundColor: '#1c1c1e', padding: 24, borderRadius: 20, 
        alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' 
    },
    ratingTitle: { color: '#fff', fontSize: 20, fontWeight: '700', marginBottom: 20 },
    starsRow: { flexDirection: 'row', marginBottom: 25 },
    closeRatingBtn: { paddingVertical: 10, paddingHorizontal: 20 },
    closeRatingText: { color: Theme.textSecondary, fontSize: 16 },
});

export default MediaDetailScreen;