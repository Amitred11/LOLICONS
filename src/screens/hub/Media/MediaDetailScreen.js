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
    FadeIn,
    FadeInDown,
    useSharedValue,
    useAnimatedStyle,
    interpolate,
    Extrapolate,
    useAnimatedScrollHandler,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';

// Mock Component (Keep your import)
import WatchSelectionModal from './components/WatchSelectionModal';
import { useAlert } from '@context/other/AlertContext';
import { useMedia } from '@context/hub/MediaContext';
import { MediaService } from '@api/hub/MockMediaService';

const { width, height } = Dimensions.get('window');

const Theme = {
    background: '#09090b',
    surface: '#18181b',
    primary: '#E50914',
    text: '#f4f4f5',
    textSecondary: '#a1a1aa',
    textTertiary: '#52525b',
    success: '#22c55e',
    gold: '#facc15',
};

// --- RATING MODAL ---
const RatingModal = ({ visible, onClose, onRate }) => {
    const [selection, setSelection] = useState(0);

    const handleRate = (starValue) => {
        setSelection(starValue);
        setTimeout(() => {
            onRate(starValue);
            setSelection(0);
        }, 300);
    };

    return (
        <Modal transparent visible={visible} animationType="fade">
            <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
                <BlurView intensity={50} tint="dark" style={StyleSheet.absoluteFill} />
                <Animated.View entering={FadeInDown.duration(300)} style={styles.ratingContainer}>
                    <Text style={styles.ratingTitle}>How was it?</Text>
                    <Text style={styles.ratingSubtitle}>Your rating helps improve recommendations.</Text>
                    <View style={styles.starsRow}>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <TouchableOpacity key={star} onPress={() => handleRate(star)}>
                                <Ionicons
                                    name={star <= selection ? "star" : "star-outline"}
                                    size={36}
                                    color={star <= selection ? Theme.gold : Theme.textTertiary}
                                    style={styles.starIcon}
                                />
                            </TouchableOpacity>
                        ))}
                    </View>
                    <TouchableOpacity style={styles.closeRatingBtn} onPress={onClose}>
                        <Text style={styles.closeRatingText}>Maybe later</Text>
                    </TouchableOpacity>
                </Animated.View>
            </TouchableOpacity>
        </Modal>
    );
};

const MediaDetailScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const { showAlert, showToast } = useAlert();
    const { mediaId } = route.params;
    const scrollY = useSharedValue(0);

    const { getMediaById, getCast, toggleFavorite } = useMedia();

    const [loading, setLoading] = useState(true);
    const [mediaItem, setMediaItem] = useState(null);
    const [castMembers, setCastMembers] = useState([]);
    
    const [isFavorite, setIsFavorite] = useState(false);
    const [showWatchModal, setShowWatchModal] = useState(false);
    const [downloadStatus, setDownloadStatus] = useState('idle');
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [userRating, setUserRating] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            const [mediaRes, castRes] = await Promise.all([ getMediaById(mediaId), getCast(mediaId) ]);
            if (mediaRes.success) {
                setMediaItem(mediaRes.data);
                setIsFavorite(mediaRes.data.isFavorite);
            } else {
                showAlert({ title: 'Error', message: 'Content unavailable', type: 'error', onClose: () => navigation.goBack() });
            }
            if (castRes.success) setCastMembers(castRes.data);
            setLoading(false);
        };
        loadData();
    }, [mediaId]);
    
    // --- Action Handlers ---
    const handleToggleFavorite = async () => {
        setIsFavorite(!isFavorite);
        const res = await toggleFavorite(mediaId);
        if (!res.success) setIsFavorite(!isFavorite);
        showAlert({ title: res.isFavorite ? 'Saved' : 'Removed', message: res.message, type: 'success' });
    };

    const handleDownload = () => {
        if (downloadStatus === 'downloaded') return;
        setDownloadStatus('downloading');
        setTimeout(() => {
            setDownloadStatus('downloaded');
            showToast( `${mediaItem.title} is now available offline.`, 'success' );
        }, 2500);
    };

    const handleShare = async () => {
        try {
            await Share.share({ message: `Check out ${mediaItem.title}! https://myapp.com/media/${mediaItem.id}` });
        } catch (error) { console.error(error.message); }
    };

    const handleRate = async (stars) => {
        setShowRatingModal(false);
        setUserRating(stars);
        const res = await MediaService.rateMedia(mediaId, stars);
        if (res.success) {
            showToast(`Your review helps others discover this title.`, 'success' );
        }
    };

    const handleWatchOption = (option) => {
        setShowWatchModal(false);
        if (option === 'alone') {
            navigation.navigate('VideoPlayer', { media: mediaItem });
        } else if (option === 'party') {
            navigation.navigate('WatchPartyLobby', { media: mediaItem });
        } else if (option === 'cast') {
            showToast( `Now casting ${mediaItem.title} to Living Room TV.`, 'info' );
        }
    };

    // --- Animations ---
    const scrollHandler = useAnimatedScrollHandler(event => {
        scrollY.value = event.contentOffset.y;
    });

    const animatedCoverStyle = useAnimatedStyle(() => ({
        transform: [{ scale: interpolate(scrollY.value, [-200, 0], [1.2, 1], Extrapolate.CLAMP) }]
    }));

    if (loading || !mediaItem) {
        return <View style={[styles.container, styles.center]}><ActivityIndicator size="large" color={Theme.primary} /></View>;
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            <Animated.View style={[styles.coverContainer, animatedCoverStyle]}>
                <Image source={mediaItem.backdrop} style={styles.coverImage} />
                <LinearGradient colors={['transparent', 'rgba(9,9,11,0.6)', Theme.background]} style={styles.coverGradient}/>
            </Animated.View>

            <View style={[styles.header, { top: insets.top }]}>
                <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={22} color={Theme.text} />
                </TouchableOpacity>
            </View>

            <Animated.ScrollView 
                onScroll={scrollHandler}
                scrollEventThrottle={16}
                showsVerticalScrollIndicator={false} 
                contentContainerStyle={{ paddingBottom: insets.bottom + 50 }}
            >
                <View style={{ height: height * 0.5 }} />

                <Animated.View style={styles.contentBody} entering={FadeIn.duration(500).delay(200)}>
                    <Text style={styles.title}>{mediaItem.title}</Text>
                    
                    <View style={styles.metaContainer}>
                        <Text style={styles.matchText}>{mediaItem.match || '95%'} Match</Text><View style={styles.dot} />
                        <Text style={styles.metaText}>{mediaItem.year}</Text><View style={styles.dot} />
                        <Text style={styles.metaText}>{mediaItem.type}</Text><View style={styles.dot} />
                        <View style={styles.badgeHD}><Text style={styles.badgeHDText}>4K</Text></View>
                    </View>

                    <TouchableOpacity style={styles.playButton} activeOpacity={0.9} onPress={() => setShowWatchModal(true)}>
                        <Ionicons name="play" size={20} color="#000" /><Text style={styles.playText}>Play</Text>
                    </TouchableOpacity>
                    
                    <View style={styles.interactionRow}>
                        <TouchableOpacity style={styles.iconAction} onPress={handleToggleFavorite}>
                            <Ionicons name={isFavorite ? "checkmark" : "add"} size={24} color={isFavorite ? Theme.success : Theme.text} />
                            <Text style={styles.iconText}>My List</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.iconAction} onPress={() => setShowRatingModal(true)}>
                            <Ionicons name={userRating ? "star" : "star-outline"} size={24} color={userRating ? Theme.gold : Theme.text} />
                            {userRating ? (
                                <View style={styles.ratingStat}>
                                    <Text style={styles.ratingStatValue}>{userRating}</Text>
                                    <Text style={styles.ratingStatTotal}>/5</Text>
                                </View>
                            ) : (
                                <Text style={styles.iconText}>Rate</Text>
                            )}
                        </TouchableOpacity>

                         <TouchableOpacity style={styles.iconAction} onPress={handleShare}>
                            <Ionicons name="share-social-outline" size={24} color={Theme.text} />
                            <Text style={styles.iconText}>Share</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.iconAction, { opacity: downloadStatus === 'downloading' ? 0.5 : 1 }]} onPress={handleDownload} disabled={downloadStatus === 'downloading'}>
                            {downloadStatus === 'downloaded' 
                                ? <Ionicons name="checkmark-circle-outline" size={24} color={Theme.success} />
                                : downloadStatus === 'downloading'
                                    ? <ActivityIndicator color={Theme.textSecondary} size="small" />
                                    : <Ionicons name="download-outline" size={24} color={Theme.text} />
                            }
                            <Text style={styles.iconText}>{downloadStatus === 'downloaded' ? 'Downloaded' : 'Download'}</Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.description}>{mediaItem.description}</Text>
                    <Text style={styles.castPreview}>
                        <Text style={{color: Theme.textSecondary}}>Starring:</Text> {castMembers.slice(0,3).map(c => c.name).join(', ')}...
                    </Text>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Top Cast</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: 20 }}>
                            {castMembers.map((actor, index) => (
                                <Animated.View key={actor.id} style={styles.castCard} entering={FadeInDown.duration(400).delay(index * 100)}>
                                    <Image source={{ uri: actor.img }} style={styles.castImg} />
                                    <Text style={styles.castName} numberOfLines={1}>{actor.name}</Text>
                                </Animated.View>
                            ))}
                             <View style={styles.viewAllCard}><Text style={styles.castName}>View All</Text></View>
                        </ScrollView>
                    </View>
                </Animated.View>
            </Animated.ScrollView>

            <WatchSelectionModal visible={showWatchModal} onClose={() => setShowWatchModal(false)} onSelectOption={handleWatchOption} />
            <RatingModal visible={showRatingModal} onClose={() => setShowRatingModal(false)} onRate={handleRate} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Theme.background },
    center: { justifyContent: 'center', alignItems: 'center' },
    coverContainer: { position: 'absolute', top: 0, left: 0, right: 0, height: height * 0.7 },
    coverImage: { width: '100%', height: '100%' },
    coverGradient: { position: 'absolute', left: 0, right: 0, bottom: 0, height: '80%' },
    header: {
        position: 'absolute', left: 16, right: 16, zIndex: 1,
        flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', height: 44
    },
    headerButton: {
        width: 40, height: 40, borderRadius: 20,
        alignItems: 'center', justifyContent: 'center',
        backgroundColor: 'rgba(24, 24, 27, 0.5)',
    },
    contentBody: { paddingHorizontal: 20 },
    title: { fontSize: 32, fontWeight: '800', color: Theme.text, marginBottom: 8, letterSpacing: -0.5 },
    metaContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap' },
    matchText: { color: Theme.success, fontWeight: '700', fontSize: 13, letterSpacing: 0.5 },
    metaText: { color: Theme.textSecondary, fontSize: 13, fontWeight: '500' },
    dot: { width: 3, height: 3, borderRadius: 2, backgroundColor: Theme.textTertiary, marginHorizontal: 8 },
    badgeHD: { borderWidth: 1, borderColor: Theme.textTertiary, borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1, marginLeft: 8 },
    badgeHDText: { color: Theme.textTertiary, fontSize: 10, fontWeight: '600' },
    playButton: {
        flexDirection: 'row', backgroundColor: Theme.text, borderRadius: 8, height: 48,
        alignItems: 'center', justifyContent: 'center', marginBottom: 16,
    },
    playText: { color: '#000', fontSize: 16, fontWeight: '700', marginLeft: 8 },
    interactionRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-start', marginBottom: 24 },
    iconAction: { alignItems: 'center', flex: 1, paddingVertical: 8, minWidth: 60 },
    iconText: { color: Theme.textSecondary, fontSize: 11, fontWeight: '500', marginTop: 6, letterSpacing: 0.3 },
    ratingStat: { flexDirection: 'row', alignItems: 'baseline', marginTop: 6, },
    ratingStatValue: { color: Theme.gold, fontSize: 14, fontWeight: '700', },
    ratingStatTotal: { color: Theme.textSecondary, fontSize: 11, fontWeight: '500', },
    description: { color: Theme.textSecondary, fontSize: 14, lineHeight: 22, marginBottom: 8 },
    castPreview: { color: Theme.text, fontSize: 12, lineHeight: 20, marginBottom: 24 },
    section: { marginBottom: 30, marginLeft: -20 },
    sectionTitle: { color: Theme.text, fontSize: 18, fontWeight: '700', marginBottom: 12, paddingHorizontal: 20 },
    castCard: { width: 80, marginRight: 12, alignItems: 'center' },
    castImg: { width: 70, height: 70, borderRadius: 35, marginBottom: 8, backgroundColor: Theme.surface },
    castName: { color: Theme.text, fontSize: 12, fontWeight: '500', textAlign: 'center' },
    viewAllCard: { width: 70, height: 70, borderRadius: 35, backgroundColor: Theme.surface, justifyContent: 'center', alignItems: 'center' },
    modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    ratingContainer: {
        width: width * 0.85, backgroundColor: Theme.surface, padding: 24,
        borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)'
    },
    ratingTitle: { color: Theme.text, fontSize: 18, fontWeight: '700', marginBottom: 4 },
    ratingSubtitle: { color: Theme.textSecondary, fontSize: 13, marginBottom: 20, textAlign: 'center' },
    starsRow: { flexDirection: 'row', marginBottom: 20 },
    starIcon: { marginHorizontal: 6 },
    closeRatingBtn: { paddingTop: 10 },
    closeRatingText: { color: Theme.textSecondary, fontSize: 14 },
});

export default MediaDetailScreen;