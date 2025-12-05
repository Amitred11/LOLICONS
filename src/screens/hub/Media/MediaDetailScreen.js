import React, { useState, useEffect } from 'react';
import { 
    View, Text, StyleSheet, ScrollView, ImageBackground, TouchableOpacity, 
    Dimensions, StatusBar, Image, ActivityIndicator 
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';

import WatchSelectionModal from './components/WatchSelectionModal'; 
import { useAlert } from '@context/AlertContext';
import { useMedia } from '@context/hub/MediaContext'; // IMPT: Import Context

const { width, height } = Dimensions.get('window');

const Theme = {
    background: '#09090b',
    primary: '#E50914',
    textSecondary: '#A1A1AA',
};

const MediaDetailScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const { showAlert } = useAlert();
    const { mediaId } = route.params;

    // Use Context
    const { getMediaById, getCast, toggleFavorite } = useMedia();

    const [loading, setLoading] = useState(true);
    const [mediaItem, setMediaItem] = useState(null);
    const [castMembers, setCastMembers] = useState([]);
    const [isFavorite, setIsFavorite] = useState(false);
    const [showWatchModal, setShowWatchModal] = useState(false);

    useEffect(() => {
        loadData();
    }, [mediaId]);

    const loadData = async () => {
        setLoading(true);
        // Parallel fetching via Context actions
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

    const handleToggleFavorite = async () => {
        const res = await toggleFavorite(mediaId);
        if (res.success) {
            setIsFavorite(res.isFavorite);
            showAlert({ title: res.isFavorite ? 'Saved' : 'Removed', message: res.message, type: 'success' });
        }
    };

    const handleDownload = () => {
        showAlert({ 
            title: 'Download Queued', 
            message: `Downloading ${mediaItem.title} over Wi-Fi.`, 
            type: 'info',
            secondaryBtnText: 'Cancel',
            onSecondaryPress: () => console.log('Cancelled download')
        });
    };

    const handleWatchOption = (option) => {
        setShowWatchModal(false);
        if (option === 'alone') {
            setTimeout(() => navigation.navigate('VideoPlayer', { media: mediaItem }), 300);
        } else if (option === 'party') {
            showAlert({ title: 'Watch Party', message: 'Inviting friends...', type: 'construction' });
        } else if (option === 'cast') {
            showAlert({ title: 'Casting', message: 'Searching for devices...', type: 'construction' });
        }
    };

    if (loading || !mediaItem) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={Theme.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }} bounces={false}>
                {/* BACKDROP */}
                <View style={styles.posterContainer}>
                    <ImageBackground source={mediaItem.backdrop} style={styles.posterImage} resizeMode="cover">
                        <LinearGradient 
                            colors={['rgba(0,0,0,0.1)', Theme.background]} 
                            style={styles.posterGradient}
                            locations={[0.4, 1]}
                        />
                    </ImageBackground>
                    <View style={[styles.headerActions, { top: insets.top }]}>
                        <TouchableOpacity style={styles.glassIconBtn} onPress={() => navigation.goBack()}>
                            <Ionicons name="arrow-back" size={24} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* CONTENT */}
                <View style={styles.contentBody}>
                    <Animated.View entering={FadeInDown.duration(600).delay(100)}>
                        <Text style={styles.title}>{mediaItem.title}</Text>
                        <View style={styles.metaRow}>
                            <Text style={styles.matchScore}>{mediaItem.match} Match</Text>
                            <Text style={styles.metaText}>{mediaItem.year}</Text>
                            <View style={styles.qualityBadge}><Text style={styles.qualityText}>4K</Text></View>
                            <Text style={styles.metaText}>{mediaItem.type}</Text>
                        </View>
                    </Animated.View>

                    <Animated.View style={styles.actionRow} entering={FadeInDown.duration(600).delay(200)}>
                        <TouchableOpacity style={styles.playButton} activeOpacity={0.9} onPress={() => setShowWatchModal(true)}>
                            <Ionicons name="play" size={24} color="#000" />
                            <Text style={styles.playText}>Play</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.downloadButton} activeOpacity={0.7} onPress={handleDownload}>
                            <Ionicons name="download-outline" size={24} color="#fff" />
                            <Text style={styles.downloadText}>Download</Text>
                        </TouchableOpacity>
                    </Animated.View>

                    <Text style={styles.description} numberOfLines={4}>{mediaItem.description}</Text>

                    <View style={styles.iconGrid}>
                        <TouchableOpacity style={styles.gridAction} onPress={handleToggleFavorite}>
                            <Ionicons name={isFavorite ? "checkmark" : "add"} size={26} color="#fff" />
                            <Text style={styles.gridText}>My List</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.gridAction} onPress={() => showAlert({title:'Rated', message:'Thanks for rating!', type:'success'})}>
                            <Ionicons name="thumbs-up-outline" size={24} color="#fff" />
                            <Text style={styles.gridText}>Rate</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.gridAction} onPress={() => showAlert({title:'Shared', message:'Link copied to clipboard.', type:'success'})}>
                            <Ionicons name="paper-plane-outline" size={24} color="#fff" />
                            <Text style={styles.gridText}>Share</Text>
                        </TouchableOpacity>
                    </View>

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
                </View>
            </ScrollView>

            <WatchSelectionModal 
                visible={showWatchModal} 
                onClose={() => setShowWatchModal(false)}
                onSelectOption={handleWatchOption}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Theme.background },
    posterContainer: { width: width, height: height * 0.6 },
    posterImage: { width: '100%', height: '100%' },
    posterGradient: { position: 'absolute', left: 0, right: 0, bottom: 0, height: '60%' },
    headerActions: { position: 'absolute', left: 20, zIndex: 10 },
    glassIconBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    contentBody: { paddingHorizontal: 20, marginTop: -60 },
    title: { fontSize: 36, fontWeight: '800', color: '#fff', marginBottom: 12, lineHeight: 40, textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: {width: 0, height: 2}, textShadowRadius: 4 },
    metaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 10 },
    matchScore: { color: '#46d369', fontWeight: 'bold', fontSize: 14 },
    metaText: { color: Theme.textSecondary, fontSize: 14 },
    qualityBadge: { borderWidth: 1, borderColor: Theme.textSecondary, borderRadius: 4, paddingHorizontal: 4 },
    qualityText: { color: Theme.textSecondary, fontSize: 10, fontWeight: 'bold' },
    actionRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
    playButton: { flex: 1, flexDirection: 'row', backgroundColor: '#fff', paddingVertical: 14, borderRadius: 4, alignItems: 'center', justifyContent: 'center', gap: 8 },
    playText: { color: '#000', fontSize: 16, fontWeight: '700' },
    downloadButton: { flex: 1, flexDirection: 'row', backgroundColor: '#27272a', paddingVertical: 14, borderRadius: 4, alignItems: 'center', justifyContent: 'center', gap: 8 },
    downloadText: { color: '#fff', fontSize: 16, fontWeight: '600' },
    description: { color: '#fff', fontSize: 14, lineHeight: 22, marginBottom: 24 },
    iconGrid: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 30 },
    gridAction: { alignItems: 'center', gap: 6 },
    gridText: { color: Theme.textSecondary, fontSize: 12 },
    section: { marginBottom: 30 },
    sectionTitle: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 15 },
    castScroll: { gap: 15 },
    castCard: { width: 80, alignItems: 'center' },
    castImg: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#333', marginBottom: 6 },
    castName: { color: Theme.textSecondary, fontSize: 11, textAlign: 'center' },
});

export default MediaDetailScreen;