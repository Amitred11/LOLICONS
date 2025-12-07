import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
    View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, 
    ScrollView, Image, ImageBackground, Dimensions, StatusBar, Animated, ActivityIndicator, LayoutAnimation, Platform, UIManager
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useNavigation } from '@react-navigation/native';

import { useAlert } from '@context/other/AlertContext';
import { useMedia } from '@context/hub/MediaContext'; 

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width, height } = Dimensions.get('window');
const ITEM_WIDTH = width * 0.42; // Slightly wider for better text fit

const Theme = {
    background: '#09090b',
    surface: '#18181b',
    surfaceHighlight: '#27272a',
    primary: '#E50914',
    text: '#FFFFFF',
    textSecondary: '#A1A1AA',
    accent: '#3B82F6',
};

const CATEGORIES = ['All', 'Movies', 'TV Shows', 'K-Drama', 'Anime'];

// --- COMPONENT: Header with Solid/Blur Background ---
const GlassHeader = ({ scrollY, query, onQueryChange, insets }) => {
    const navigation = useNavigation();
    
    // Interpolate opacity for the background blur, but keep search bar visible
    const bgOpacity = scrollY.interpolate({ inputRange: [0, 100], outputRange: [0, 1], extrapolate: 'clamp' });

    return (
        <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
            {/* Background Blur Layer */}
            <Animated.View style={[StyleSheet.absoluteFill, { opacity: bgOpacity }]}>
                <BlurView intensity={90} tint="dark" style={StyleSheet.absoluteFill} />
                <View style={{...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(9,9,11,0.8)'}} />
            </Animated.View>

            <View style={styles.headerContent}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={Theme.text} />
                </TouchableOpacity>
                
                {/* Search Input - Now has a solid background */}
                <View style={[styles.searchPill, query.length > 0 && styles.searchPillActive]}>
                    <Ionicons name="search" size={18} color={query ? Theme.text : Theme.textSecondary} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search movies, shows..."
                        placeholderTextColor={Theme.textSecondary}
                        value={query}
                        onChangeText={onQueryChange}
                    />
                    {query.length > 0 && (
                        <TouchableOpacity onPress={() => onQueryChange('')}>
                            <Ionicons name="close-circle" size={18} color={Theme.textSecondary} />
                        </TouchableOpacity>
                    )}
                </View>

                {!query && (
                    <TouchableOpacity style={styles.avatarContainer}>
                        <Image source={{ uri: 'https://i.pravatar.cc/100?img=8' }} style={styles.avatar} />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

// --- COMPONENT: Empty State ---
const EmptyState = ({ message }) => (
    <View style={styles.emptyContainer}>
        <View style={styles.emptyIconCircle}>
            <Ionicons name="search-outline" size={40} color={Theme.textSecondary} />
        </View>
        <Text style={styles.emptyTitle}>No Results Found</Text>
        <Text style={styles.emptySubtitle}>{message || "Try adjusting your search or filters"}</Text>
    </View>
);

// --- COMPONENT: Grid Card (Portrait) ---
const PortraitCard = ({ item, onPress }) => (
    <TouchableOpacity style={styles.portraitCard} onPress={() => onPress(item)} activeOpacity={0.7}>
        <View style={styles.imageWrapper}>
            <Image source={item.poster} style={styles.portraitImage} />
            {item.tags.includes('New') && (
                <View style={styles.badgeNew}><Text style={styles.badgeText}>NEW</Text></View>
            )}
            <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={styles.cardGradient} />
        </View>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
        <View style={styles.cardMetaRow}>
            <Text style={styles.cardMeta}>{item.year}</Text>
            <Text style={styles.cardDot}>•</Text>
            <Text style={styles.cardMeta}>{item.type}</Text>
        </View>
    </TouchableOpacity>
);

// --- COMPONENT: List Card (Landscape) ---
const ListCard = ({ item, onPress }) => (
    <TouchableOpacity style={styles.listCard} onPress={() => onPress(item)} activeOpacity={0.7}>
        <Image source={item.poster} style={styles.listImage} />
        <View style={styles.listContent}>
            <View style={styles.listHeader}>
                <Text style={styles.listTitle} numberOfLines={1}>{item.title}</Text>
                {item.isFavorite && <Ionicons name="bookmark" size={16} color={Theme.primary} />}
            </View>
            <Text style={styles.listMeta}>{item.year} • {item.type} • <Text style={{color: '#46d369'}}>{item.match} Match</Text></Text>
            <Text style={styles.listDesc} numberOfLines={2}>{item.description}</Text>
            <View style={styles.listTags}>
                {item.tags.slice(0, 2).map((tag, index) => (
                    <View key={index} style={styles.miniTag}>
                        <Text style={styles.miniTagText}>{tag}</Text>
                    </View>
                ))}
            </View>
        </View>
        <View style={styles.listAction}>
             <Ionicons name="play-circle-outline" size={32} color={Theme.textSecondary} />
        </View>
    </TouchableOpacity>
);

// --- COMPONENT: Hero ---
const CinematicHero = ({ item, onPlay, onList }) => {
    if (!item) return null;
    return (
        <View style={styles.heroContainer}>
            <ImageBackground source={item.backdrop} style={styles.heroImage} resizeMode="cover">
                <LinearGradient 
                    colors={['transparent', 'rgba(9,9,11,0.2)', 'rgba(9,9,11,0.9)', Theme.background]} 
                    locations={[0, 0.4, 0.8, 1]}
                    style={styles.heroGradient}
                >
                    <View style={styles.heroContent}>
                        <View style={styles.tagRow}>
                            <View style={styles.hdBadge}><Text style={styles.hdText}>4K</Text></View>
                            <Text style={styles.heroMetaText}>{item.type} • {item.year} • {item.match} Match</Text>
                        </View>
                        <Text style={styles.heroTitle}>{item.title}</Text>
                        <Text style={styles.heroSubtitle} numberOfLines={2}>{item.description}</Text>
                        <View style={styles.heroActions}>
                            <TouchableOpacity style={styles.btnPrimary} onPress={onPlay} activeOpacity={0.85}>
                                <Ionicons name="play" size={20} color="#fff" />
                                <Text style={styles.btnTextPrimary}>Watch</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.btnGlass} onPress={onList} activeOpacity={0.85}>
                                <Ionicons name={item.isFavorite ? "checkmark" : "add"} size={22} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </LinearGradient>
            </ImageBackground>
        </View>
    );
};

const MediaScreen = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const { showAlert } = useAlert();
    const scrollY = useRef(new Animated.Value(0)).current;

    // Context
    const { mediaData, isLoading, searchResults, searchMedia, toggleFavorite, loadMedia } = useMedia();

    // Local State
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            loadMedia();
        });
        return unsubscribe;
    }, [navigation, loadMedia]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery.length > 1) {
                searchMedia(searchQuery);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery, searchMedia]);

    const handleHeroListToggle = async (id) => {
        const response = await toggleFavorite(id);
        if (response.success) {
            showAlert({ 
                title: response.isFavorite ? 'Saved' : 'Removed', 
                message: response.message, 
                type: 'success' 
            });
        }
    };

    const handleNavigation = (id) => navigation.navigate('MediaDetail', { mediaId: id });

    const toggleViewMode = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setViewMode(prev => prev === 'grid' ? 'list' : 'grid');
    };

    const filteredData = useMemo(() => {
        let data = mediaData;
        if (activeCategory !== 'All') {
            data = mediaData.filter(i => i.type === activeCategory || i.tags.includes(activeCategory));
        }
        return data;
    }, [activeCategory, mediaData]);

    const displayData = searchQuery.length > 0 ? searchResults : filteredData;
    const featuredItem = mediaData.find(i => i.tags.includes('Trending')) || mediaData[0];
    const trending = mediaData.filter(i => i.tags.includes('Trending'));

    if (isLoading && mediaData.length === 0) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={Theme.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            <Animated.ScrollView
                onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
                scrollEventThrottle={16}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
            >
                {/* --- HEADER SPACER (for hero) --- */}
                
                {searchQuery.length > 0 ? (
                    // --- SEARCH RESULTS STATE ---
                    <View style={{ marginTop: insets.top + 90, paddingHorizontal: 20 }}>
                         <Text style={styles.sectionHeader}>Results for "{searchQuery}"</Text>
                         {displayData.length === 0 ? (
                            <EmptyState message={`No matches for "${searchQuery}"`} />
                         ) : (
                            displayData.map(item => (
                                <ListCard key={item.id} item={item} onPress={() => handleNavigation(item.id)} />
                            ))
                         )}
                    </View>
                ) : (
                    // --- NORMAL BROWSING STATE ---
                    <>
                        <CinematicHero 
                            item={featuredItem} 
                            onPlay={() => navigation.navigate('VideoPlayer', { media: featuredItem })}
                            onList={() => handleHeroListToggle(featuredItem.id)}
                        />

                        {/* --- CONTROLS ROW (Chips + Toggle) --- */}
                        <View style={styles.controlsRow}>
                            <ScrollView 
                                horizontal 
                                showsHorizontalScrollIndicator={false} 
                                style={styles.chipScroll}
                            >
                                {CATEGORIES.map(cat => (
                                    <TouchableOpacity 
                                        key={cat} 
                                        onPress={() => setActiveCategory(cat)}
                                        style={[styles.chip, activeCategory === cat && styles.chipActive]}
                                    >
                                        <Text style={[styles.chipText, activeCategory === cat && styles.chipTextActive]}>{cat}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>

                            <TouchableOpacity style={styles.viewToggleBtn} onPress={toggleViewMode}>
                                <Ionicons 
                                    name={viewMode === 'grid' ? "list" : "grid"} 
                                    size={20} 
                                    color={Theme.textSecondary} 
                                />
                            </TouchableOpacity>
                        </View>

                        {/* --- CONTENT GRID/LIST --- */}
                        {activeCategory !== 'All' ? (
                            <View style={{ paddingHorizontal: 20, minHeight: 300 }}>
                                {displayData.length === 0 ? (
                                    <EmptyState message={`No ${activeCategory} found.`} />
                                ) : (
                                    viewMode === 'grid' ? (
                                        <View style={styles.gridContainer}>
                                            {displayData.map(item => (
                                                <PortraitCard key={item.id} item={item} onPress={() => handleNavigation(item.id)} />
                                            ))}
                                        </View>
                                    ) : (
                                        <View style={styles.listContainer}>
                                            {displayData.map(item => (
                                                <ListCard key={item.id} item={item} onPress={() => handleNavigation(item.id)} />
                                            ))}
                                        </View>
                                    )
                                )}
                            </View>
                        ) : (
                            <>
                                {/* Default Home View (Trending + Top Rated) */}
                                <View style={styles.section}>
                                    <Text style={styles.sectionHeader}>Trending Now</Text>
                                    <FlatList
                                        horizontal
                                        data={trending}
                                        renderItem={({ item }) => <PortraitCard item={item} onPress={() => handleNavigation(item.id)} />}
                                        keyExtractor={item => item.id}
                                        showsHorizontalScrollIndicator={false}
                                        contentContainerStyle={styles.rowContent}
                                    />
                                </View>
                                <View style={styles.section}>
                                    <Text style={styles.sectionHeader}>Top Rated</Text>
                                    <FlatList
                                        horizontal
                                        data={[...mediaData].sort((a,b) => b.rating - a.rating)}
                                        renderItem={({ item }) => <PortraitCard item={item} onPress={() => handleNavigation(item.id)} />}
                                        keyExtractor={item => item.id}
                                        showsHorizontalScrollIndicator={false}
                                        contentContainerStyle={styles.rowContent}
                                    />
                                </View>
                            </>
                        )}
                    </>
                )}
            </Animated.ScrollView>

            <GlassHeader scrollY={scrollY} query={searchQuery} onQueryChange={setSearchQuery} insets={insets} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Theme.background },
    
    // Header
    headerContainer: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100, height: 110, justifyContent: 'flex-end', paddingBottom: 15, paddingHorizontal: 20 },
    headerContent: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    backBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 16 },
    
    // Search Bar (Updated for Visibility)
    searchPill: { 
        flex: 1, flexDirection: 'row', alignItems: 'center', 
        backgroundColor: '#1E1E20', // Solid Dark Background
        height: 44, borderRadius: 22, paddingHorizontal: 15, 
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
        shadowColor: "#000", shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.2, shadowRadius: 4, elevation: 5
    },
    searchPillActive: { borderColor: Theme.primary, backgroundColor: '#000' },
    searchInput: { flex: 1, marginLeft: 10, color: Theme.text, fontSize: 14, fontWeight: '500' },
    avatarContainer: { width: 36, height: 36, borderRadius: 18, overflow: 'hidden', borderWidth: 1, borderColor: '#fff' },
    avatar: { width: '100%', height: '100%' },

    // Controls Row
    controlsRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, paddingRight: 20 },
    chipScroll: { paddingLeft: 20 },
    viewToggleBtn: { 
        width: 40, height: 40, borderRadius: 20, 
        backgroundColor: Theme.surface, alignItems: 'center', justifyContent: 'center',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', marginLeft: 10
    },

    // Chips
    chip: { paddingVertical: 8, paddingHorizontal: 18, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 30, marginRight: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    chipActive: { backgroundColor: '#fff', borderColor: '#fff' },
    chipText: { color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '600' },
    chipTextActive: { color: '#000' },

    // Hero
    heroContainer: { width: width, height: height * 0.7 },
    heroImage: { width: '100%', height: '100%' },
    heroGradient: { width: '100%', height: '100%', justifyContent: 'flex-end', paddingBottom: 60, paddingHorizontal: 24 },
    tagRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 10 },
    hdBadge: { borderWidth: 1, borderColor: Theme.textSecondary, paddingHorizontal: 4, borderRadius: 4 },
    hdText: { color: Theme.textSecondary, fontSize: 10, fontWeight: 'bold' },
    heroMetaText: { color: Theme.textSecondary, fontSize: 13, fontWeight: '600' },
    heroTitle: { color: Theme.text, fontSize: 42, fontWeight: '800', textAlign: 'center', marginBottom: 10, textShadowColor: 'rgba(0,0,0,0.8)', textShadowRadius: 10 },
    heroSubtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 14, textAlign: 'center', marginBottom: 25 },
    heroActions: { flexDirection: 'row', gap: 15 },
    btnPrimary: { flexDirection: 'row', backgroundColor: Theme.primary, paddingVertical: 12, paddingHorizontal: 28, borderRadius: 12, alignItems: 'center', gap: 8 },
    btnGlass: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
    btnTextPrimary: { color: '#fff', fontSize: 15, fontWeight: '700' },

    // Empty State
    emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 50 },
    emptyIconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: Theme.surface, alignItems: 'center', justifyContent: 'center', marginBottom: 15 },
    emptyTitle: { color: Theme.text, fontSize: 18, fontWeight: '700', marginBottom: 5 },
    emptySubtitle: { color: Theme.textSecondary, fontSize: 14 },

    // Cards (Portrait)
    gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    portraitCard: { width: ITEM_WIDTH, marginBottom: 25 },
    imageWrapper: { width: ITEM_WIDTH, height: ITEM_WIDTH * 1.5, borderRadius: 12, backgroundColor: Theme.surfaceHighlight, overflow: 'hidden', marginBottom: 10 },
    portraitImage: { width: '100%', height: '100%' },
    cardGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 40 },
    badgeNew: { position: 'absolute', top: 8, right: 8, backgroundColor: Theme.primary, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
    badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
    cardTitle: { color: Theme.text, fontSize: 14, fontWeight: '700', marginBottom: 2 },
    cardMetaRow: { flexDirection: 'row', alignItems: 'center' },
    cardMeta: { color: Theme.textSecondary, fontSize: 11 },
    cardDot: { color: Theme.textSecondary, fontSize: 11, marginHorizontal: 4 },

    // Cards (List)
    listContainer: { gap: 15 },
    listCard: { flexDirection: 'row', backgroundColor: Theme.surface, borderRadius: 12, padding: 10, alignItems: 'center' },
    listImage: { width: 80, height: 110, borderRadius: 8, backgroundColor: Theme.surfaceHighlight },
    listContent: { flex: 1, marginLeft: 15, height: 110, paddingVertical: 5 },
    listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    listTitle: { color: Theme.text, fontSize: 16, fontWeight: '700', flex: 1, marginRight: 10 },
    listMeta: { color: Theme.textSecondary, fontSize: 12, marginVertical: 4 },
    listDesc: { color: 'rgba(255,255,255,0.6)', fontSize: 12, lineHeight: 16, marginBottom: 8 },
    listTags: { flexDirection: 'row', gap: 6 },
    miniTag: { backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
    miniTagText: { color: Theme.textSecondary, fontSize: 10 },
    listAction: { paddingLeft: 10, justifyContent: 'center' },

    // Sections
    section: { marginBottom: 35 },
    sectionHeader: { color: Theme.text, fontSize: 20, fontWeight: '700', marginLeft: 20, marginBottom: 15 },
    rowContent: { paddingHorizontal: 20 },
});

export default MediaScreen;