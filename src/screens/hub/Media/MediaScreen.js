import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
    View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, 
    ScrollView, Image, ImageBackground, Dimensions, StatusBar, Animated, 
    ActivityIndicator, LayoutAnimation, Platform, UIManager
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useNavigation } from '@react-navigation/native';

// --- MOCK CONTEXTS (Replace with your actual imports) ---
import { useAlert } from '@context/other/AlertContext';
import { useMedia } from '@context/hub/MediaContext'; 

const { width, height } = Dimensions.get('window');

// --- GRID MATH ---
const SCREEN_PADDING = 16;
const GAP = 12;
const COLUMNS = 2;
const CARD_WIDTH = (width - (SCREEN_PADDING * 2) - (GAP * (COLUMNS - 1))) / COLUMNS;
const POSTER_RATIO = 1.5;

const Theme = {
    background: '#09090b', // Deep Zinc
    surface: '#18181b',    // Slightly lighter
    surfaceLight: '#27272a',
    primary: '#E50914',
    accent: '#46D369',
    text: '#FFFFFF',
    textSecondary: '#A1A1AA',
    border: '#3f3f46',     // Distinct border color
};

const CATEGORIES = ['All', 'Movies', 'TV Shows', 'K-Drama', 'Anime', 'Documentary'];

// --- COMPONENT: Header ---
const GlassHeader = ({ scrollY, query, onQueryChange, insets }) => {
    const navigation = useNavigation();
    
    // Background opacity
    const bgOpacity = scrollY.interpolate({ 
        inputRange: [50, 150], 
        outputRange: [0, 1], 
        extrapolate: 'clamp' 
    });

    return (
        <View style={[styles.headerContainer, { height: 60 + insets.top }]}>
            {/* Animated Solid/Blur Background */}
            <Animated.View style={[StyleSheet.absoluteFill, { opacity: bgOpacity }]}>
                <BlurView intensity={90} tint="dark" style={StyleSheet.absoluteFill} />
                <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(9,9,11,0.9)' }} />
                <View style={styles.headerBorderBottom} />
            </Animated.View>

            <View style={[styles.headerContent, { paddingTop: insets.top }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
                    <Ionicons name="arrow-back" size={24} color={Theme.text} />
                </TouchableOpacity>
                
                {/* Search Bar - Solid & Bordered */}
                <View style={[styles.searchBar, query.length > 0 && styles.searchBarActive]}>
                    <Ionicons name="search" size={18} color={Theme.textSecondary} style={{ marginRight: 8 }} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search titles..."
                        placeholderTextColor={Theme.textSecondary}
                        value={query}
                        onChangeText={onQueryChange}
                        returnKeyType="search"
                    />
                    {query.length > 0 && (
                        <TouchableOpacity onPress={() => onQueryChange('')}>
                            <Ionicons name="close-circle" size={18} color={Theme.textSecondary} />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Avatar -> Navigate to Profile */}
                {query.length === 0 && (
                    <TouchableOpacity 
                        style={styles.avatarContainer}
                        onPress={() => navigation.navigate('MediaProfile')}
                    >
                        <Image source={{ uri: 'https://i.pravatar.cc/100?img=12' }} style={styles.avatar} />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

// --- COMPONENT: Control Bar ---
const ControlBar = ({ activeCategory, setActiveCategory, viewMode, toggleViewMode }) => {
    return (
        <View style={styles.controlBarContainer}>
            <View style={styles.filterWrapper}>
                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false} 
                    contentContainerStyle={styles.filterContent}
                >
                    {CATEGORIES.map(cat => {
                        const isActive = activeCategory === cat;
                        return (
                            <TouchableOpacity 
                                key={cat} 
                                onPress={() => setActiveCategory(cat)}
                                style={[styles.chip, isActive && styles.chipActive]}
                                activeOpacity={0.7}
                            >
                                <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                                    {cat}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>

            <View style={styles.toggleWrapper}>
                <TouchableOpacity 
                    style={styles.viewToggleBtn} 
                    onPress={toggleViewMode}
                    activeOpacity={0.6}
                >
                    <Ionicons 
                        name={viewMode === 'grid' ? "list" : "grid"} 
                        size={20} 
                        color={Theme.text} 
                    />
                </TouchableOpacity>
            </View>
        </View>
    );
};

// --- COMPONENT: Grid Card ---
const GridCard = ({ item, onPress }) => (
    <TouchableOpacity style={styles.gridCard} onPress={() => onPress(item)} activeOpacity={0.8}>
        <ImageBackground 
            source={item.poster} 
            style={styles.gridImage} 
            imageStyle={{ borderRadius: 8 }}
        >
            <LinearGradient 
                colors={['transparent', 'rgba(0,0,0,0.9)']} 
                style={styles.gridGradient} 
            />
            {item.tags?.includes('New') && (
                <View style={styles.badgeNew}><Text style={styles.badgeText}>NEW</Text></View>
            )}
            <View style={styles.gridContent}>
                <Text style={styles.gridTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.gridMeta}>{item.year}</Text>
            </View>
        </ImageBackground>
    </TouchableOpacity>
);

// --- COMPONENT: List Card ---
const ListCard = ({ item, onPress }) => (
    <TouchableOpacity style={styles.listCard} onPress={() => onPress(item)} activeOpacity={0.7}>
        <Image source={item.poster} style={styles.listImage} />
        <View style={styles.listContent}>
            <View style={styles.listHeader}>
                <Text style={styles.listTitle} numberOfLines={1}>{item.title}</Text>
                {!!item.isFavorite && <Ionicons name="bookmark" size={16} color={Theme.primary} />}
            </View>
            <Text style={styles.listMeta}>{item.year} • {item.type} • <Text style={{color: Theme.accent}}>{item.match || '95%'} Match</Text></Text>
            <Text style={styles.listDesc} numberOfLines={2}>{item.description}</Text>
        </View>
        <Ionicons name="play-circle-outline" size={32} color={Theme.textSecondary} />
    </TouchableOpacity>
);

// --- COMPONENT: Hero ---
const CinematicHero = ({ item, onPlay, onToggleList }) => {
    if (!item) return null;
    return (
        <View style={styles.heroContainer}>
            <ImageBackground source={item.backdrop} style={styles.heroImage}>
                <LinearGradient 
                    colors={['transparent', 'rgba(0,0,0,0.1)', Theme.background]} 
                    locations={[0, 0.5, 1]}
                    style={styles.heroGradient}
                >
                    <View style={styles.heroContent}>
                        <View style={styles.heroTags}>
                            <View style={styles.badgeHD}><Text style={styles.badgeHDText}>4K</Text></View>
                            <Text style={styles.heroMetaText}>{item.type} • {item.year}</Text>
                        </View>
                        <Text style={styles.heroTitle}>{item.title}</Text>
                        <View style={styles.heroActions}>
                            <TouchableOpacity style={styles.btnPrimary} onPress={onPlay}>
                                <Ionicons name="play" size={20} color="#fff" />
                                <Text style={styles.btnTextPrimary}>Play</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.btnGlass} onPress={onToggleList}>
                                <Ionicons name={item.isFavorite ? "checkmark" : "add"} size={22} color="#fff" />
                                <Text style={styles.btnTextGlass}>List</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </LinearGradient>
            </ImageBackground>
        </View>
    );
};

const EmptyState = ({ message }) => (
    <View style={styles.emptyContainer}>
        <Ionicons name="search" size={40} color={Theme.surfaceLight} />
        <Text style={styles.emptyText}>{message}</Text>
    </View>
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
            showAlert({ 
                title: response.isFavorite ? 'Saved' : 'Removed', 
                message: response.message, 
                type: 'success' 
            });
        }
    };

    const toggleViewModeAnimation = () => {
        // Safe to call even if no-op
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setViewMode(prev => prev === 'grid' ? 'list' : 'grid');
    };

    // --- DATA PREPARATION ---
    const filteredData = useMemo(() => {
        let data = searchQuery.length > 0 ? searchResults : mediaData;
        if (activeCategory !== 'All' && searchQuery.length === 0) {
            data = data.filter(i => i.type === activeCategory || i.tags?.includes(activeCategory));
        }
        return data;
    }, [activeCategory, mediaData, searchResults, searchQuery]);

    const featuredItem = mediaData.find(i => i.tags?.includes('Trending')) || mediaData[0];
    const topRated = useMemo(() => [...mediaData].sort((a,b) => b.rating - a.rating).slice(0, 5), [mediaData]);

    // Renders the list or grid based on current viewMode
    const renderContentBody = (data) => {
        if (data.length === 0) return <EmptyState message="No content found" />;

        if (viewMode === 'grid') {
            return (
                <View style={styles.gridContainer}>
                    {data.map(item => (
                        <GridCard key={item.id} item={item} onPress={() => navigation.navigate('MediaDetail', { mediaId: item.id })} />
                    ))}
                </View>
            );
        } else {
            return (
                <View style={styles.listContainer}>
                    {data.map(item => (
                        <ListCard key={item.id} item={item} onPress={() => navigation.navigate('MediaDetail', { mediaId: item.id })} />
                    ))}
                </View>
            );
        }
    };

    if (isLoading && mediaData.length === 0) {
        return (
            <View style={[styles.container, styles.center]}>
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
                {searchQuery.length > 0 ? (
                    // Search Mode
                    <View style={{ marginTop: insets.top + 80, paddingHorizontal: SCREEN_PADDING }}>
                        <Text style={styles.sectionHeader}>Results</Text>
                        {filteredData.length === 0 ? <EmptyState message="No results." /> : (
                            <View style={styles.listContainer}>
                                {filteredData.map(item => <ListCard key={item.id} item={item} onPress={() => navigation.navigate('MediaDetail', { mediaId: item.id })} />)}
                            </View>
                        )}
                    </View>
                ) : (
                    // Browse Mode
                    <>
                        <CinematicHero 
                            item={featuredItem} 
                            onPlay={() => navigation.navigate('VideoPlayer', { media: featuredItem })}
                            onToggleList={() => handleToggleList(featuredItem.id)}
                        />

                        <ControlBar 
                            activeCategory={activeCategory} 
                            setActiveCategory={setActiveCategory}
                            viewMode={viewMode}
                            toggleViewMode={toggleViewModeAnimation}
                        />

                        <View style={styles.contentBody}>
                            {activeCategory === 'All' ? (
                                <>
                                    {/* Horizontal Rail for Top Rated (Always Horizontal) */}
                                    <Text style={styles.sectionHeader}>Top Rated</Text>
                                    <FlatList
                                        horizontal
                                        data={topRated}
                                        renderItem={({ item }) => (
                                            <GridCard item={item} onPress={() => navigation.navigate('MediaDetail', { mediaId: item.id })} />
                                        )}
                                        keyExtractor={item => item.id}
                                        showsHorizontalScrollIndicator={false}
                                        contentContainerStyle={styles.horizontalList}
                                        ItemSeparatorComponent={() => <View style={{ width: GAP }} />}
                                    />

                                    <Text style={[styles.sectionHeader, { marginTop: 25 }]}>Trending Now</Text>
                                    {/* Trending List respects the Toggle */}
                                    {renderContentBody(mediaData)}
                                </>
                            ) : (
                                <>
                                    <Text style={styles.sectionHeader}>{activeCategory}</Text>
                                    {renderContentBody(filteredData)}
                                </>
                            )}
                        </View>
                    </>
                )}
            </Animated.ScrollView>

            <GlassHeader scrollY={scrollY} query={searchQuery} onQueryChange={setSearchQuery} insets={insets} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Theme.background },
    center: { justifyContent: 'center', alignItems: 'center' },
    contentBody: { flex: 1 },

    // --- HEADER ---
    headerContainer: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100, justifyContent: 'flex-end', overflow: 'hidden' },
    headerBorderBottom: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 1, backgroundColor: 'rgba(255,255,255,0.1)' },
    headerContent: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: SCREEN_PADDING, paddingBottom: 10 },
    iconButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    
    // UPDATED SEARCH BAR
    searchBar: {
        flex: 1, flexDirection: 'row', alignItems: 'center',
        height: 40, 
        backgroundColor: Theme.surface, // Solid background
        borderRadius: 8, // Standard rounded corners
        paddingHorizontal: 12,
        borderWidth: 1, 
        borderColor: Theme.border, // Distinct border
    },
    searchBarActive: { borderColor: Theme.primary },
    searchInput: { flex: 1, color: Theme.text, fontSize: 15, padding: 0 },
    
    avatarContainer: { marginLeft: 12, width: 36, height: 36, borderRadius: 18, overflow: 'hidden', borderWidth: 1, borderColor: Theme.border },
    avatar: { width: '100%', height: '100%' },

    // --- HERO ---
    heroContainer: { width: width, height: height * 0.60, marginBottom: 20 },
    heroImage: { width: '100%', height: '100%' },
    heroGradient: { width: '100%', height: '100%', justifyContent: 'flex-end', paddingBottom: 30, paddingHorizontal: SCREEN_PADDING },
    heroContent: { alignItems: 'center' },
    heroTags: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    badgeHD: { borderWidth: 1, borderColor: Theme.textSecondary, borderRadius: 4, paddingHorizontal: 6, marginRight: 8 },
    badgeHDText: { color: Theme.textSecondary, fontSize: 10, fontWeight: 'bold' },
    heroMetaText: { color: Theme.textSecondary, fontSize: 13, fontWeight: '600' },
    heroTitle: { color: Theme.text, fontSize: 32, fontWeight: '800', textAlign: 'center', marginBottom: 20 },
    heroActions: { flexDirection: 'row', width: '100%', justifyContent: 'center', gap: 16 },
    btnPrimary: { flex: 1, maxWidth: 140, height: 44, backgroundColor: Theme.primary, borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
    btnGlass: { flex: 1, maxWidth: 140, height: 44, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
    btnTextPrimary: { color: '#fff', fontSize: 15, fontWeight: '700' },
    btnTextGlass: { color: '#fff', fontSize: 15, fontWeight: '600' },

    // --- CONTROLS ---
    controlBarContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, paddingHorizontal: SCREEN_PADDING },
    filterWrapper: { flex: 1 },
    filterContent: { paddingRight: 10 },
    toggleWrapper: { paddingLeft: 10 },
    chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: Theme.surface, marginRight: 8, borderWidth: 1, borderColor: Theme.border },
    chipActive: { backgroundColor: Theme.text, borderColor: Theme.text },
    chipText: { color: Theme.textSecondary, fontSize: 13, fontWeight: '600' },
    chipTextActive: { color: Theme.background },
    viewToggleBtn: { 
        width: 38, height: 38, borderRadius: 8, 
        backgroundColor: Theme.surface, alignItems: 'center', justifyContent: 'center',
        borderWidth: 1, borderColor: Theme.border
    },

    // --- CARDS ---
    gridContainer: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: SCREEN_PADDING, gap: GAP },
    gridCard: { width: CARD_WIDTH, marginBottom: 20 },
    gridImage: { width: CARD_WIDTH, height: CARD_WIDTH * POSTER_RATIO, justifyContent: 'flex-end', borderRadius: 8, overflow: 'hidden', backgroundColor: Theme.surfaceLight },
    gridGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%' },
    gridContent: { padding: 10 },
    gridTitle: { color: Theme.text, fontSize: 13, fontWeight: '700', marginBottom: 2 },
    gridMeta: { color: Theme.textSecondary, fontSize: 11 },
    badgeNew: { position: 'absolute', top: 6, right: 6, backgroundColor: Theme.primary, paddingHorizontal: 5, paddingVertical: 2, borderRadius: 3 },
    badgeText: { color: '#fff', fontSize: 8, fontWeight: 'bold' },

    listContainer: { paddingHorizontal: SCREEN_PADDING, gap: 16 },
    listCard: { flexDirection: 'row', backgroundColor: Theme.surface, borderRadius: 8, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    listImage: { width: 70, height: 100, borderRadius: 6, backgroundColor: Theme.surfaceLight },
    listContent: { flex: 1, marginLeft: 12, height: 100, justifyContent: 'center' },
    listHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    listTitle: { color: Theme.text, fontSize: 15, fontWeight: '700' },
    listMeta: { color: Theme.textSecondary, fontSize: 12, marginBottom: 6 },
    listDesc: { color: Theme.textSecondary, fontSize: 11, lineHeight: 15 },

    sectionHeader: { color: Theme.text, fontSize: 18, fontWeight: '700', marginBottom: 15, paddingHorizontal: SCREEN_PADDING },
    horizontalList: { paddingHorizontal: SCREEN_PADDING },
    emptyContainer: { alignItems: 'center', marginTop: 50, opacity: 0.5 },
    emptyText: { color: Theme.textSecondary, marginTop: 10, fontSize: 15 },
});

export default MediaScreen;