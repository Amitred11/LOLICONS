import React, { useState, useMemo, useRef } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    FlatList, 
    TextInput, 
    TouchableOpacity, 
    ScrollView, 
    Image, 
    ImageBackground, 
    Dimensions, 
    StatusBar,
    Animated,
    Platform
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useNavigation } from '@react-navigation/native';

// --- MOCK DATA & CONSTANTS ---
// Assuming these are passed from your project structure, but defined here for standalone safety
import { Colors } from '../../../constants/Colors';
import { mediaData as sourceData } from '../../../constants/mockData';

const { width, height } = Dimensions.get('window');
const ITEM_WIDTH = width * 0.35; // Portrait Card Width
const LANDSCAPE_WIDTH = width * 0.6; // Continue Watching Width

// Premium Color Palette
const Theme = {
    background: '#09090b', // Deep charcoal/black
    surface: '#18181b',
    surfaceHighlight: '#27272a',
    primary: '#E50914', // Brand Red
    text: '#FFFFFF',
    textSecondary: '#A1A1AA',
    accent: '#3B82F6', // Blue for "New" tags
    glass: 'rgba(20, 20, 20, 0.85)',
};

const CATEGORIES = ['All', 'Movies', 'TV Shows', 'K-Drama', 'Anime', 'My List'];

// --- SUB-COMPONENTS ---

// 1. The Glass Header (Sticky & Blurry)
const GlassHeader = ({ scrollY, query, onQueryChange, insets }) => {
    // Animate background opacity based on scroll
    const headerOpacity = scrollY.interpolate({
        inputRange: [0, 100],
        outputRange: [0, 1],
        extrapolate: 'clamp'
    });
    const navigation = useNavigation();

    return (
        <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
            {/* Animated Blurred Background */}
            <Animated.View style={[StyleSheet.absoluteFill, { opacity: headerOpacity }]}>
                <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
                <View style={{...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)'}} />
            </Animated.View>

            <View style={styles.headerContent}>
                {/* Brand / Logo Area */}
                <Animated.View style={{ transform: [{ translateX: query.length > 0 ? 0 : 0 }] }}>
                     <TouchableOpacity style={styles.headerLogo} onPress={() => navigation.goBack()}><Ionicons name="arrow-back-outline" size={28} color={Colors.text} /></TouchableOpacity>
                </Animated.View>

                {/* Search Pill */}
                <View style={[styles.searchPill, query.length > 0 && styles.searchPillActive]}>
                    <Ionicons name="search" size={18} color={query ? Theme.text : Theme.textSecondary} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="What are you looking for?"
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

                {/* Profile Avatar */}
                {!query && (
                    <TouchableOpacity style={styles.avatarContainer}>
                        <Image 
                            source={{ uri: 'https://i.pravatar.cc/100?img=8' }} 
                            style={styles.avatar} 
                        />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

// 2. Cinematic Hero Section
const CinematicHero = ({ item, onPlay, onList }) => {
    if (!item) return null;

    return (
        <View style={styles.heroContainer}>
            <ImageBackground source={item.backdrop} style={styles.heroImage} resizeMode="cover">
                <LinearGradient 
                    colors={['transparent', 'rgba(9,9,11,0.1)', 'rgba(9,9,11,0.6)', Theme.background]} 
                    locations={[0, 0.4, 0.7, 1]}
                    style={styles.heroGradient}
                >
                    <View style={styles.heroContent}>
                        {/* Tags */}
                        <View style={styles.tagRow}>
                            <View style={styles.hdBadge}><Text style={styles.hdText}>4K</Text></View>
                            <Text style={styles.heroMetaText}>{item.type} • {item.year || '2024'}</Text>
                        </View>

                        {/* Title - Big & Bold */}
                        <Text style={styles.heroTitle}>{item.title}</Text>
                        <Text style={styles.heroSubtitle} numberOfLines={2}>
                            {item.description || "A cinematic experience awaiting your discovery. Watch the latest original series now."}
                        </Text>

                        {/* Actions */}
                        <View style={styles.heroActions}>
                            <TouchableOpacity style={styles.btnPrimary} onPress={onPlay} activeOpacity={0.85}>
                                <Ionicons name="play" size={22} color="#fff" />
                                <Text style={styles.btnTextPrimary}>Watch Now</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.btnGlass} onPress={onList} activeOpacity={0.85}>
                                <Ionicons name="add" size={24} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </LinearGradient>
            </ImageBackground>
        </View>
    );
};

// 3. Category Filter Chips
const CategoryFilter = ({ active, onChange }) => (
    <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={styles.filterScroll}
        style={styles.filterContainer}
    >
        {CATEGORIES.map((cat) => {
            const isActive = active === cat;
            return (
                <TouchableOpacity 
                    key={cat} 
                    onPress={() => onChange(cat)}
                    style={[styles.chip, isActive && styles.chipActive]}
                >
                    <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{cat}</Text>
                </TouchableOpacity>
            );
        })}
    </ScrollView>
);

// 4. Portrait Card (Movies/Series)
const PortraitCard = ({ item, onPress }) => (
    <TouchableOpacity style={styles.portraitCard} onPress={() => onPress(item)} activeOpacity={0.7}>
        <Image source={item.poster} style={styles.portraitImage} />
        {item.tags.includes('New') && (
            <View style={styles.badgeNew}>
                <Text style={styles.badgeText}>NEW</Text>
            </View>
        )}
    </TouchableOpacity>
);

// 5. Landscape Card (Continue Watching)
const LandscapeCard = ({ item, onPress }) => (
    <TouchableOpacity style={styles.landscapeCard} onPress={() => onPress(item)} activeOpacity={0.7}>
        <ImageBackground source={item.backdrop || item.poster} style={styles.landscapeImage} imageStyle={{borderRadius: 12}}>
            <View style={styles.landscapeOverlay}>
                <Ionicons name="play-circle" size={32} color="rgba(255,255,255,0.8)" />
            </View>
            <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${Math.random() * 60 + 20}%` }]} />
            </View>
        </ImageBackground>
        <Text style={styles.landscapeTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.landscapeSubtitle}>S1:E4 • 12m remaining</Text>
    </TouchableOpacity>
);

// 6. Search Result Row
const SearchResultItem = ({ item, onPress }) => (
    <TouchableOpacity style={styles.searchResultRow} onPress={() => onPress(item)}>
        <Image source={item.poster} style={styles.searchResultImg} />
        <View style={styles.searchResultInfo}>
            <Text style={styles.searchResultTitle}>{item.title}</Text>
            <Text style={styles.searchResultMeta}>{item.type} • {item.tags[0]}</Text>
            <View style={styles.ratingRow}>
                <Ionicons name="star" size={14} color={Theme.primary} />
                <Text style={styles.ratingText}>9.8</Text>
            </View>
        </View>
        <Ionicons name="play-circle-outline" size={32} color={Theme.primary} />
    </TouchableOpacity>
);


// --- MAIN SCREEN ---

const MediaScreen = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const scrollY = useRef(new Animated.Value(0)).current;

    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');

    // Filter Logic
    const filteredData = useMemo(() => {
        let data = sourceData;
        if (activeCategory !== 'All' && activeCategory !== 'My List') {
            data = data.filter(i => i.type === activeCategory || i.tags.includes(activeCategory));
        }
        // "My List" logic would go here
        
        if (searchQuery) {
            data = data.filter(i => i.title.toLowerCase().includes(searchQuery.toLowerCase()));
        }
        return data;
    }, [activeCategory, searchQuery]);

    const featuredItem = sourceData[0];
    const continueWatching = sourceData.slice(0, 3);
    const trending = sourceData.filter(i => i.tags.includes('Trending'));
    const kdrama = sourceData.filter(i => i.type === 'K-Drama');

    const handleNavigation = (id) => navigation.navigate('MediaDetail', { mediaId: id });

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            {/* MAIN CONTENT SCROLL */}
            <Animated.ScrollView
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: true }
                )}
                scrollEventThrottle={16}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
            >
                {searchQuery ? (
                    // --- SEARCH MODE ---
                    <View style={[styles.searchResultsContainer, { marginTop: insets.top + 70 }]}>
                        <Text style={styles.sectionHeader}>Results for "{searchQuery}"</Text>
                        {filteredData.map(item => (
                            <SearchResultItem key={item.id} item={item} onPress={() => handleNavigation(item.id)} />
                        ))}
                    </View>
                ) : (
                    // --- BROWSE MODE ---
                    <>
                        <CinematicHero 
                            item={featuredItem} 
                            onPlay={() => navigation.navigate('VideoPlayer', { mediaId: featuredItem.id })}
                            onList={() => console.log('Added')}
                        />

                        {/* Sticky-ish Category Filter (Visually below hero) */}
                        <View style={{ marginTop: -30, marginBottom: 10 }}>
                            <CategoryFilter active={activeCategory} onChange={setActiveCategory} />
                        </View>

                        {/* Filter Results (Grid) OR Standard Home Layout */}
                        {activeCategory !== 'All' ? (
                            <View style={styles.gridContainer}>
                                {filteredData.map(item => (
                                    <PortraitCard key={item.id} item={item} onPress={() => handleNavigation(item.id)} />
                                ))}
                            </View>
                        ) : (
                            <>
                                {/* Continue Watching Section */}
                                <View style={styles.section}>
                                    <Text style={styles.sectionHeader}>Continue Watching</Text>
                                    <FlatList
                                        horizontal
                                        data={continueWatching}
                                        renderItem={({ item }) => <LandscapeCard item={item} onPress={() => handleNavigation(item.id)} />}
                                        keyExtractor={item => item.id}
                                        showsHorizontalScrollIndicator={false}
                                        contentContainerStyle={styles.rowContent}
                                    />
                                </View>

                                {/* Trending Section */}
                                <View style={styles.section}>
                                    <View style={styles.sectionTitleRow}>
                                        <Text style={styles.sectionHeader}>Trending Now</Text>
                                        <TouchableOpacity><Text style={styles.seeAll}>See All</Text></TouchableOpacity>
                                    </View>
                                    <FlatList
                                        horizontal
                                        data={trending}
                                        renderItem={({ item }) => <PortraitCard item={item} onPress={() => handleNavigation(item.id)} />}
                                        keyExtractor={item => item.id}
                                        showsHorizontalScrollIndicator={false}
                                        contentContainerStyle={styles.rowContent}
                                    />
                                </View>

                                {/* K-Drama Section */}
                                <View style={styles.section}>
                                    <Text style={styles.sectionHeader}>Top K-Dramas</Text>
                                    <FlatList
                                        horizontal
                                        data={kdrama}
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

            {/* FIXED HEADER */}
            <GlassHeader 
                scrollY={scrollY} 
                query={searchQuery} 
                onQueryChange={setSearchQuery} 
                insets={insets} 
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Theme.background,
    },
    
    // --- Header Styles ---
    headerContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        height: 100, // Includes status bar area
        justifyContent: 'flex-end',
        paddingBottom: 15,
        paddingHorizontal: 20,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 15,
    },
    headerLogo: {
        fontSize: 22,
        fontWeight: '900',
        color: Theme.text,
        letterSpacing: 1,
    },
    searchPill: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.08)',
        height: 40,
        borderRadius: 20,
        paddingHorizontal: 15,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    searchPillActive: {
        backgroundColor: '#000',
        borderColor: Theme.primary,
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        color: Theme.text,
        fontSize: 11,
        fontWeight: '500',
    },
    avatarContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.2)',
        overflow: 'hidden',
    },
    avatar: {
        width: '100%',
        height: '100%',
    },

    // --- Hero Styles ---
    heroContainer: {
        width: width,
        height: height * 0.75,
    },
    heroImage: {
        width: '100%',
        height: '100%',
    },
    heroGradient: {
        width: '100%',
        height: '100%',
        justifyContent: 'flex-end',
        paddingBottom: 50,
        paddingHorizontal: 24,
    },
    heroContent: {
        alignItems: 'center',
    },
    tagRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 10,
    },
    hdBadge: {
        borderWidth: 1,
        borderColor: Theme.textSecondary,
        paddingHorizontal: 4,
        borderRadius: 4,
    },
    hdText: {
        color: Theme.textSecondary,
        fontSize: 10,
        fontWeight: 'bold',
    },
    heroMetaText: {
        color: Theme.textSecondary,
        fontSize: 13,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    heroTitle: {
        color: Theme.text,
        fontSize: 42,
        fontWeight: '800',
        textAlign: 'center',
        marginBottom: 10,
        lineHeight: 48,
        textShadowColor: 'rgba(0,0,0,0.75)',
        textShadowOffset: { width: 0, height: 4 },
        textShadowRadius: 10,
    },
    heroSubtitle: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 25,
        lineHeight: 20,
        maxWidth: '90%',
    },
    heroActions: {
        flexDirection: 'row',
        gap: 15,
        width: '100%',
        justifyContent: 'center',
    },
    btnPrimary: {
        flexDirection: 'row',
        backgroundColor: Theme.primary,
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 12,
        alignItems: 'center',
        gap: 8,
        shadowColor: Theme.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
    },
    btnGlass: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: 'rgba(255,255,255,0.15)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    btnTextPrimary: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },

    // --- Filters ---
    filterContainer: {
        paddingVertical: 10,
    },
    filterScroll: {
        paddingHorizontal: 24,
        paddingRight: 10,
    },
    chip: {
        paddingVertical: 8,
        paddingHorizontal: 18,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 30,
        marginRight: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    chipActive: {
        backgroundColor: '#fff',
        borderColor: '#fff',
    },
    chipText: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 13,
        fontWeight: '600',
    },
    chipTextActive: {
        color: '#000',
    },

    // --- Sections ---
    section: {
        marginBottom: 35,
    },
    sectionTitleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        paddingRight: 24,
    },
    sectionHeader: {
        color: Theme.text,
        fontSize: 20,
        fontWeight: '700',
        marginLeft: 24,
        marginBottom: 15,
        letterSpacing: 0.5,
    },
    seeAll: {
        color: Theme.primary,
        fontSize: 13,
        fontWeight: '600',
    },
    rowContent: {
        paddingHorizontal: 24,
    },

    // --- Cards ---
    portraitCard: {
        width: ITEM_WIDTH,
        marginRight: 16,
        marginBottom: 20, // For grid view
    },
    portraitImage: {
        width: ITEM_WIDTH,
        height: ITEM_WIDTH * 1.5,
        borderRadius: 12,
        backgroundColor: Theme.surfaceHighlight,
    },
    badgeNew: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: Theme.primary,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    badgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },

    landscapeCard: {
        width: LANDSCAPE_WIDTH,
        marginRight: 16,
    },
    landscapeImage: {
        width: '100%',
        height: LANDSCAPE_WIDTH * 0.56, // 16:9
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Theme.surfaceHighlight,
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 8,
    },
    landscapeOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    progressBarBg: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 3,
        backgroundColor: 'rgba(255,255,255,0.3)',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: Theme.primary,
    },
    landscapeTitle: {
        color: Theme.text,
        fontSize: 14,
        fontWeight: '600',
    },
    landscapeSubtitle: {
        color: Theme.textSecondary,
        fontSize: 12,
        marginTop: 2,
    },

    // --- Grid / Search Styles ---
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 24,
        justifyContent: 'space-between',
    },
    searchResultsContainer: {
        paddingHorizontal: 24,
    },
    searchResultRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Theme.surface,
        borderRadius: 12,
        padding: 10,
        marginBottom: 12,
    },
    searchResultImg: {
        width: 60,
        height: 80,
        borderRadius: 8,
        backgroundColor: Theme.surfaceHighlight,
    },
    searchResultInfo: {
        flex: 1,
        marginLeft: 15,
        justifyContent: 'center',
    },
    searchResultTitle: {
        color: Theme.text,
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    searchResultMeta: {
        color: Theme.textSecondary,
        fontSize: 12,
        marginBottom: 6,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    ratingText: {
        color: Theme.primary,
        fontSize: 12,
        fontWeight: 'bold',
    },
});

export default MediaScreen;