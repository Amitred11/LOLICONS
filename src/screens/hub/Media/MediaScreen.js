import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
    View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, 
    ScrollView, Image, ImageBackground, Dimensions, StatusBar, Animated, 
    ActivityIndicator, LayoutAnimation, Platform 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useNavigation } from '@react-navigation/native';

// --- MOCK CONTEXTS ---
import { useAlert } from '@context/other/AlertContext';
import { useMedia } from '@context/hub/MediaContext'; 

const { width, height } = Dimensions.get('window');
const CATEGORIES = ['All', 'Movies', 'TV Shows', 'K-Drama', 'Anime', 'Documentary'];

const DESIGN_SYSTEM = {
    background: '#020204',
    surface: '#0A0A0C',
    surfaceLight: '#141418',
    primary: '#6366f1', // Modern Indigo/Violet
    accent: '#22d3ee', // Cyan
    text: '#FFFFFF',
    textSecondary: '#94a3b8',
    border: 'rgba(255,255,255,0.06)',
    glass: 'rgba(255,255,255,0.03)',
    cardRadius: 20,
};

const SCREEN_PADDING = 20;
const GAP = 14;
const CARD_WIDTH = (width - (SCREEN_PADDING * 2) - GAP) / 2;

// --- COMPONENT: Header ---
const ModernHeader = ({ scrollY, query, onQueryChange, insets }) => {
    const navigation = useNavigation();
    
    const headerTranslate = scrollY.interpolate({
        inputRange: [0, 100],
        outputRange: [0, -10],
        extrapolate: 'clamp',
    });

    return (
        <Animated.View style={[
            styles.headerWrapper, 
            { paddingTop: insets.top + 10, transform: [{ translateY: headerTranslate }] }
        ]}>
            <BlurView intensity={25} tint="dark" style={styles.headerBlur}>
                <View style={styles.headerInner}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.circleAction}>
                        <Ionicons name="chevron-back" size={20} color={DESIGN_SYSTEM.text} />
                    </TouchableOpacity>

                    <View style={[styles.searchContainer, query.length > 0 && styles.searchActive]}>
                        <Ionicons name="search-outline" size={18} color={DESIGN_SYSTEM.textSecondary} />
                        <TextInput
                            style={styles.headerInput}
                            placeholder="Discover..."
                            placeholderTextColor="#475569"
                            value={query}
                            onChangeText={onQueryChange}
                        />
                    </View>

                    <TouchableOpacity onPress={() => navigation.navigate('MediaProfile')}>
                        <Image source={{ uri: 'https://i.pravatar.cc/100?img=32' }} style={styles.headerProfile} />
                    </TouchableOpacity>
                </View>
            </BlurView>
        </Animated.View>
    );
};

// --- COMPONENT: Modern Card ---
const ModernGridCard = ({ item, onPress }) => (
    <TouchableOpacity style={styles.mGridCard} onPress={() => onPress(item)} activeOpacity={0.9}>
        <Image source={item.poster} style={styles.mGridImage} />
        <LinearGradient 
            colors={['transparent', 'rgba(0,0,0,0.9)']} 
            style={styles.mGridOverlay}
        >
            <View style={styles.mGridContent}>
                <Text style={styles.mGridTitle} numberOfLines={1}>{item.title}</Text>
                <View style={styles.mGridMetaRow}>
                    <Text style={styles.mGridYear}>{item.year}</Text>
                    <View style={styles.dot} />
                    <Text style={styles.mGridRating}>{item.match || '98%'}</Text>
                </View>
            </View>
        </LinearGradient>
        {item.tags?.includes('New') && (
            <BlurView intensity={50} style={styles.newFloatingBadge}>
                <Text style={styles.newBadgeText}>NEW</Text>
            </BlurView>
        )}
    </TouchableOpacity>
);

const ModernListCard = ({ item, onPress }) => (
    <TouchableOpacity style={styles.mListCard} onPress={() => onPress(item)} activeOpacity={0.8}>
        <Image source={item.poster} style={styles.mListImage} />
        <View style={styles.mListBody}>
            <Text style={styles.mListTitle} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.mListSub}>{item.year} • {item.type}</Text>
            <Text style={styles.mListDesc} numberOfLines={2}>{item.description}</Text>
        </View>
        <View style={styles.mListAction}>
            <Ionicons name="play-outline" size={18} color={DESIGN_SYSTEM.primary} />
        </View>
    </TouchableOpacity>
);

// --- MAIN SCREEN ---
const MediaScreen = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const { showAlert } = useAlert();
    const scrollY = useRef(new Animated.Value(0)).current;

    const { mediaData, isLoading, searchResults, searchMedia, toggleFavorite, loadMedia } = useMedia();

    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [viewMode, setViewMode] = useState('grid');

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => loadMedia());
        return unsubscribe;
    }, [navigation, loadMedia]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery.length > 0) searchMedia(searchQuery);
        }, 400);
        return () => clearTimeout(timer);
    }, [searchQuery, searchMedia]);

    const handleToggleList = async (id) => {
        const response = await toggleFavorite(id);
        if (response.success) {
            showAlert({ title: response.isFavorite ? 'Saved' : 'Removed', message: response.message, type: 'success' });
        }
    };

    const toggleViewMode = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
        setViewMode(prev => prev === 'grid' ? 'list' : 'grid');
    };

    const filteredData = useMemo(() => {
        let data = searchQuery.length > 0 ? searchResults : mediaData;
        if (activeCategory !== 'All' && searchQuery.length === 0) {
            data = data.filter(i => i.type === activeCategory || i.tags?.includes(activeCategory));
        }
        return data;
    }, [activeCategory, mediaData, searchResults, searchQuery]);

    const featuredItem = mediaData.find(i => i.tags?.includes('Trending')) || mediaData[0];

    if (isLoading && mediaData.length === 0) {
        return <View style={styles.loading}><ActivityIndicator color={DESIGN_SYSTEM.primary} /></View>;
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            
            <Animated.ScrollView
                onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
                scrollEventThrottle={16}
                contentContainerStyle={{ paddingBottom: 100 }}
            >
                {/* HERO SECTION */}
                {searchQuery.length === 0 && (
                    <View style={styles.heroBox}>
                        <ImageBackground source={featuredItem?.backdrop} style={styles.heroImg}>
                            <LinearGradient colors={['rgba(2,2,4,0)', 'rgba(2,2,4,0.7)', DESIGN_SYSTEM.background]} style={styles.heroGrad}>
                                <Text style={styles.heroSub}>NOW TRENDING</Text>
                                <Text style={styles.heroTitle}>{featuredItem?.title}</Text>
                                <View style={styles.heroActions}>
                                    <TouchableOpacity style={styles.playBtn} onPress={() => navigation.navigate('VideoPlayer', { media: featuredItem })}>
                                        <Ionicons name="play" size={20} color="black" />
                                        <Text style={styles.playBtnText}>Watch Now</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.listBtn} onPress={() => handleToggleList(featuredItem.id)}>
                                        <Ionicons name={featuredItem?.isFavorite ? "checkmark" : "add"} size={22} color="white" />
                                    </TouchableOpacity>
                                </View>
                            </LinearGradient>
                        </ImageBackground>
                    </View>
                )}

                {/* CONTROLS */}
                <View style={[styles.controlRow, { marginTop: searchQuery.length > 0 ? insets.top + 90 : 0 }]}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipStack}>
                        {CATEGORIES.map(cat => (
                            <TouchableOpacity 
                                key={cat} 
                                style={[styles.pill, activeCategory === cat && styles.pillActive]}
                                onPress={() => setActiveCategory(cat)}
                            >
                                <Text style={[styles.pillText, activeCategory === cat && styles.pillTextActive]}>{cat}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                    <TouchableOpacity style={styles.modeToggle} onPress={toggleViewMode}>
                        <Ionicons name={viewMode === 'grid' ? "list" : "grid"} size={20} color={DESIGN_SYSTEM.text} />
                    </TouchableOpacity>
                </View>

                {/* CONTENT */}
                <View style={styles.contentSection}>
                    <Text style={styles.sectionTitle}>{searchQuery.length > 0 ? 'Results' : activeCategory}</Text>
                    {filteredData.length === 0 ? (
                        <View style={styles.empty}><Text style={{color: '#444'}}>No titles found.</Text></View>
                    ) : (
                        <View style={viewMode === 'grid' ? styles.gridWrap : styles.listWrap}>
                            {filteredData.map(item => (
                                viewMode === 'grid' 
                                ? <ModernGridCard key={item.id} item={item} onPress={() => navigation.navigate('MediaDetail', { mediaId: item.id })} />
                                : <ModernListCard key={item.id} item={item} onPress={() => navigation.navigate('MediaDetail', { mediaId: item.id })} />
                            ))}
                        </View>
                    )}
                </View>
            </Animated.ScrollView>

            <ModernHeader scrollY={scrollY} query={searchQuery} onQueryChange={setSearchQuery} insets={insets} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: DESIGN_SYSTEM.background },
    loading: { flex: 1, backgroundColor: DESIGN_SYSTEM.background, justifyContent: 'center' },

    // HEADER
    headerWrapper: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100, paddingHorizontal: 16 },
    headerBlur: { borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: DESIGN_SYSTEM.border },
    headerInner: { flexDirection: 'row', alignItems: 'center', padding: 8, gap: 10 },
    circleAction: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center' },
    searchContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', height: 40, borderRadius: 20, paddingHorizontal: 15 },
    searchActive: { borderColor: DESIGN_SYSTEM.primary, borderWidth: 1 },
    headerInput: { flex: 1, color: 'white', marginLeft: 8, fontSize: 14 },
    headerProfile: { width: 36, height: 36, borderRadius: 18, backgroundColor: DESIGN_SYSTEM.surfaceLight },

    // HERO
    heroBox: { width: width, height: height * 0.6 },
    heroImg: { width: '100%', height: '100%' },
    heroGrad: { flex: 1, justifyContent: 'flex-end', padding: 24, paddingBottom: 40 },
    heroSub: { color: DESIGN_SYSTEM.primary, fontWeight: '900', fontSize: 12, letterSpacing: 2, marginBottom: 8 },
    heroTitle: { color: 'white', fontSize: 42, fontWeight: '900', letterSpacing: -1, marginBottom: 20 },
    heroActions: { flexDirection: 'row', gap: 12 },
    playBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 16, gap: 8 },
    playBtnText: { color: 'black', fontWeight: '800', fontSize: 15 },
    listBtn: { width: 48, height: 48, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },

    // CONTROLS
    controlRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 20 },
    chipStack: { gap: 8, paddingRight: 20 },
    pill: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, backgroundColor: DESIGN_SYSTEM.surface, borderWith: 1, borderColor: DESIGN_SYSTEM.border },
    pillActive: { backgroundColor: DESIGN_SYSTEM.primary },
    pillText: { color: DESIGN_SYSTEM.textSecondary, fontWeight: '700', fontSize: 13 },
    pillTextActive: { color: 'white' },
    modeToggle: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },

    // GRID CARDS
    contentSection: { paddingHorizontal: 16 },
    sectionTitle: { color: 'white', fontSize: 22, fontWeight: '800', marginBottom: 16 },
    gridWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: GAP },
    mGridCard: { width: CARD_WIDTH, height: CARD_WIDTH * 1.5, borderRadius: DESIGN_SYSTEM.cardRadius, overflow: 'hidden', backgroundColor: DESIGN_SYSTEM.surface },
    mGridImage: { width: '100%', height: '100%' },
    mGridOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'flex-end', padding: 12 },
    mGridTitle: { color: 'white', fontWeight: '700', fontSize: 14 },
    mGridMetaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 6 },
    mGridYear: { color: DESIGN_SYSTEM.textSecondary, fontSize: 11 },
    mGridRating: { color: DESIGN_SYSTEM.accent, fontSize: 11, fontWeight: '700' },
    dot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: DESIGN_SYSTEM.textSecondary },
    newFloatingBadge: { position: 'absolute', top: 10, right: 10, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, overflow: 'hidden' },
    newBadgeText: { color: 'white', fontSize: 9, fontWeight: '900' },

    // LIST CARDS
    listWrap: { gap: 12 },
    mListCard: { flexDirection: 'row', backgroundColor: DESIGN_SYSTEM.surface, borderRadius: 20, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: DESIGN_SYSTEM.border },
    mListImage: { width: 70, height: 90, borderRadius: 14 },
    mListBody: { flex: 1, marginLeft: 15 },
    mListTitle: { color: 'white', fontWeight: '700', fontSize: 16, marginBottom: 2 },
    mListSub: { color: DESIGN_SYSTEM.textSecondary, fontSize: 12, marginBottom: 6 },
    mListDesc: { color: '#64748b', fontSize: 12, lineHeight: 16 },
    mListAction: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(99, 102, 241, 0.1)', alignItems: 'center', justifyContent: 'center' },

    empty: { alignItems: 'center', padding: 40 }
});

export default MediaScreen;