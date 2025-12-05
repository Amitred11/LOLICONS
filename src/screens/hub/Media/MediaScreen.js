import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
    View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, 
    ScrollView, Image, ImageBackground, Dimensions, StatusBar, Animated, ActivityIndicator 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useNavigation } from '@react-navigation/native';

import { useAlert } from '@context/AlertContext';
import { useMedia } from '@context/hub/MediaContext'; // IMPT: Import Context

const { width, height } = Dimensions.get('window');
const ITEM_WIDTH = width * 0.35;

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

// ... (Sub-components: GlassHeader, CinematicHero, PortraitCard, SearchResultItem remain same as original) ...
const GlassHeader = ({ scrollY, query, onQueryChange, insets }) => {
    const navigation = useNavigation();
    const headerOpacity = scrollY.interpolate({ inputRange: [0, 100], outputRange: [0, 1], extrapolate: 'clamp' });
    return (
        <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
            <Animated.View style={[StyleSheet.absoluteFill, { opacity: headerOpacity }]}>
                <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
                <View style={{...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)'}} />
            </Animated.View>
            <View style={styles.headerContent}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={26} color={Theme.text} />
                </TouchableOpacity>
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
                {!query && (
                    <TouchableOpacity style={styles.avatarContainer} onPress={() => navigation.navigate('MediaProfile')}>
                        <Image source={{ uri: 'https://i.pravatar.cc/100?img=8' }} style={styles.avatar} />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

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
                        <View style={styles.tagRow}>
                            <View style={styles.hdBadge}><Text style={styles.hdText}>4K</Text></View>
                            <Text style={styles.heroMetaText}>{item.type} • {item.year}</Text>
                        </View>
                        <Text style={styles.heroTitle}>{item.title}</Text>
                        <Text style={styles.heroSubtitle} numberOfLines={2}>{item.description}</Text>
                        <View style={styles.heroActions}>
                            <TouchableOpacity style={styles.btnPrimary} onPress={onPlay} activeOpacity={0.85}>
                                <Ionicons name="play" size={22} color="#fff" />
                                <Text style={styles.btnTextPrimary}>Watch Now</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.btnGlass} onPress={onList} activeOpacity={0.85}>
                                <Ionicons name={item.isFavorite ? "checkmark" : "add"} size={24} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </LinearGradient>
            </ImageBackground>
        </View>
    );
};

const PortraitCard = ({ item, onPress }) => (
    <TouchableOpacity style={styles.portraitCard} onPress={() => onPress(item)} activeOpacity={0.7}>
        <Image source={item.poster} style={styles.portraitImage} />
        {item.tags.includes('New') && (
            <View style={styles.badgeNew}><Text style={styles.badgeText}>NEW</Text></View>
        )}
    </TouchableOpacity>
);

const SearchResultItem = ({ item, onPress }) => (
    <TouchableOpacity style={styles.searchResultRow} onPress={() => onPress(item)}>
        <Image source={item.poster} style={styles.searchResultImg} />
        <View style={styles.searchResultInfo}>
            <Text style={styles.searchResultTitle}>{item.title}</Text>
            <Text style={styles.searchResultMeta}>{item.type} • {item.year}</Text>
        </View>
        <Ionicons name="play-circle-outline" size={32} color={Theme.primary} />
    </TouchableOpacity>
);

const MediaScreen = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const { showAlert } = useAlert();
    const scrollY = useRef(new Animated.Value(0)).current;

    // Consume Context
    const { mediaData, isLoading, searchResults, searchMedia, toggleFavorite, loadMedia } = useMedia();

    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');

    // Refresh data on focus (optional, usually context handles this)
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            loadMedia();
        });
        return unsubscribe;
    }, [navigation, loadMedia]);

    // Handle Search Debounce
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

    const filteredData = useMemo(() => {
        if (activeCategory === 'All') return mediaData;
        return mediaData.filter(i => i.type === activeCategory || i.tags.includes(activeCategory));
    }, [activeCategory, mediaData]);

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
                {searchQuery.length > 0 ? (
                    <View style={[styles.searchResultsContainer, { marginTop: insets.top + 70 }]}>
                        <Text style={styles.sectionHeader}>Results for "{searchQuery}"</Text>
                        {searchResults.length === 0 ? (
                            <Text style={{color: '#666', textAlign: 'center', marginTop: 20}}>No results found.</Text>
                        ) : (
                            searchResults.map(item => (
                                <SearchResultItem key={item.id} item={item} onPress={() => handleNavigation(item.id)} />
                            ))
                        )}
                    </View>
                ) : (
                    <>
                        <CinematicHero 
                            item={featuredItem} 
                            onPlay={() => navigation.navigate('VideoPlayer', { media: featuredItem })}
                            onList={() => handleHeroListToggle(featuredItem.id)}
                        />

                        {/* Category Filter */}
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll} style={{ marginTop: -30, marginBottom: 10 }}>
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

                        {activeCategory !== 'All' ? (
                            <View style={styles.gridContainer}>
                                {filteredData.map(item => (
                                    <PortraitCard key={item.id} item={item} onPress={() => handleNavigation(item.id)} />
                                ))}
                            </View>
                        ) : (
                            <>
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
    headerContainer: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100, height: 100, justifyContent: 'flex-end', paddingBottom: 15, paddingHorizontal: 20 },
    headerContent: { flexDirection: 'row', alignItems: 'center', gap: 15 },
    backBtn: { width: 30, alignItems: 'flex-start' },
    searchPill: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.08)', height: 40, borderRadius: 20, paddingHorizontal: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    searchPillActive: { backgroundColor: '#000', borderColor: Theme.primary },
    searchInput: { flex: 1, marginLeft: 10, color: Theme.text, fontSize: 13 },
    avatarContainer: { width: 36, height: 36, borderRadius: 18, overflow: 'hidden', borderWidth: 1, borderColor: '#fff' },
    avatar: { width: '100%', height: '100%' },
    heroContainer: { width: width, height: height * 0.75 },
    heroImage: { width: '100%', height: '100%' },
    heroGradient: { width: '100%', height: '100%', justifyContent: 'flex-end', paddingBottom: 50, paddingHorizontal: 24 },
    heroContent: { alignItems: 'center' },
    tagRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 10 },
    hdBadge: { borderWidth: 1, borderColor: Theme.textSecondary, paddingHorizontal: 4, borderRadius: 4 },
    hdText: { color: Theme.textSecondary, fontSize: 10, fontWeight: 'bold' },
    heroMetaText: { color: Theme.textSecondary, fontSize: 13, fontWeight: '600' },
    heroTitle: { color: Theme.text, fontSize: 42, fontWeight: '800', textAlign: 'center', marginBottom: 10 },
    heroSubtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 14, textAlign: 'center', marginBottom: 25 },
    heroActions: { flexDirection: 'row', gap: 15 },
    btnPrimary: { flexDirection: 'row', backgroundColor: Theme.primary, paddingVertical: 14, paddingHorizontal: 32, borderRadius: 12, alignItems: 'center', gap: 8 },
    btnGlass: { width: 52, height: 52, borderRadius: 26, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
    btnTextPrimary: { color: '#fff', fontSize: 16, fontWeight: '700' },
    filterScroll: { paddingHorizontal: 24, paddingRight: 10 },
    chip: { paddingVertical: 8, paddingHorizontal: 18, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 30, marginRight: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    chipActive: { backgroundColor: '#fff', borderColor: '#fff' },
    chipText: { color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '600' },
    chipTextActive: { color: '#000' },
    section: { marginBottom: 35 },
    sectionHeader: { color: Theme.text, fontSize: 20, fontWeight: '700', marginLeft: 24, marginBottom: 15 },
    rowContent: { paddingHorizontal: 24 },
    portraitCard: { width: ITEM_WIDTH, marginRight: 16, marginBottom: 20 },
    portraitImage: { width: ITEM_WIDTH, height: ITEM_WIDTH * 1.5, borderRadius: 12, backgroundColor: Theme.surfaceHighlight },
    badgeNew: { position: 'absolute', top: 8, right: 8, backgroundColor: Theme.primary, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
    badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
    gridContainer: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 24, justifyContent: 'space-between' },
    searchResultsContainer: { paddingHorizontal: 24 },
    searchResultRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: Theme.surface, borderRadius: 12, padding: 10, marginBottom: 12 },
    searchResultImg: { width: 60, height: 80, borderRadius: 8 },
    searchResultInfo: { flex: 1, marginLeft: 15, justifyContent: 'center' },
    searchResultTitle: { color: Theme.text, fontSize: 16, fontWeight: '600' },
    searchResultMeta: { color: Theme.textSecondary, fontSize: 12 },
});

export default MediaScreen;