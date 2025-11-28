import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ScrollView, Image, ImageBackground } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/Colors';
import { mediaData } from '../../../constants/mockData'; // Make sure you have the new mediaData
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

// Added "My List" to the filters for the new favorites feature
const FILTERS = ['All', 'My List', 'K-Drama', 'Movies', 'Trending', 'New'];

// --- Sub-Components for a Cleaner Structure ---

const Header = ({ onBackPress }) => (
    <View style={styles.header}>
        <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Shows & Movies</Text>
        <View style={{ width: 40 }} />
    </View>
);

const SearchBar = ({ query, onQueryChange }) => (
    <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={Colors.textSecondary} style={styles.searchIcon} />
        <TextInput
            style={styles.searchInput}
            placeholder="Search titles, genres..."
            placeholderTextColor={Colors.textSecondary}
            value={query}
            onChangeText={onQueryChange}
        />
        {query.length > 0 && (
            <TouchableOpacity onPress={() => onQueryChange('')} style={styles.clearButton}>
                <Ionicons name="close-circle" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
        )}
    </View>
);

const FilterTabs = ({ activeFilter, onFilterPress }) => (
    <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScrollView}>
            {FILTERS.map((filter) => (
                <TouchableOpacity
                    key={filter}
                    style={[styles.filterButton, activeFilter === filter && styles.activeFilterButton]}
                    onPress={() => onFilterPress(filter)}
                >
                    <Text style={[styles.filterText, activeFilter === filter && styles.activeFilterText]}>{filter}</Text>
                </TouchableOpacity>
            ))}
        </ScrollView>
    </View>
);

const SpotlightCard = ({ item, onPress }) => (
    <TouchableOpacity onPress={onPress} style={styles.spotlightContainer} activeOpacity={0.9}>
        <ImageBackground source={item.backdrop} style={styles.spotlightBg} imageStyle={{ borderRadius: 18 }}>
            <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={styles.spotlightOverlay} />
            <Text style={styles.spotlightTag}>FEATURED</Text>
            <Text style={styles.spotlightTitle}>{item.title}</Text>
        </ImageBackground>
    </TouchableOpacity>
);

const MediaPosterCard = ({ item, isFavorite, onFavoritePress, onPress }) => (
    <TouchableOpacity onPress={onPress} style={styles.posterContainer} activeOpacity={0.8}>
        <Image source={item.poster} style={styles.posterImage} />
        <TouchableOpacity onPress={onFavoritePress} style={styles.favoriteButton}>
            <Ionicons 
                name={isFavorite ? "heart" : "heart-outline"} 
                size={22} 
                color={isFavorite ? Colors.primary : '#fff'} 
            />
        </TouchableOpacity>
    </TouchableOpacity>
);

const EmptyState = ({ message }) => (
    <View style={styles.emptyContainer}>
        <Ionicons name="film-outline" size={60} color={Colors.textSecondary} />
        <Text style={styles.emptyText}>{message}</Text>
    </View>
);


// --- Main MediaScreen Component ---

const MediaScreen = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');
    const [favorites, setFavorites] = useState(['media3', 'media5']); // Default favorites for demo

    const handleToggleFavorite = (mediaId) => {
        setFavorites(prev => 
            prev.includes(mediaId) 
                ? prev.filter(id => id !== mediaId)
                : [...prev, mediaId]
        );
    };

    const filteredData = useMemo(() => {
        let data = mediaData;
        
        // Apply filter first
        if (activeFilter === 'My List') {
            data = data.filter(item => favorites.includes(item.id));
        } else if (activeFilter === 'K-Drama' || activeFilter === 'Movies') {
            data = data.filter(item => item.type === activeFilter);
        } else if (activeFilter === 'Trending' || activeFilter === 'New') {
            data = data.filter(item => item.tags.includes(activeFilter));
        }

        // Then apply search query on the filtered data
        if (searchQuery.length > 0) {
            const lowercasedQuery = searchQuery.toLowerCase();
            return data.filter(item =>
                item.title.toLowerCase().includes(lowercasedQuery)
            );
        }
        
        return data;
    }, [activeFilter, searchQuery, favorites]);

    // Show spotlight only when not searching and not on "My List"
    const showSpotlight = searchQuery.length === 0 && activeFilter !== 'My List';

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <Header onBackPress={() => navigation.goBack()} />
            <SearchBar query={searchQuery} onQueryChange={setSearchQuery} />
            <FilterTabs activeFilter={activeFilter} onFilterPress={setActiveFilter} />

            <FlatList
                data={filteredData}
                keyExtractor={(item) => item.id}
                numColumns={3}
                contentContainerStyle={styles.gridContainer}
                ListHeaderComponent={
                    showSpotlight && mediaData[0] ? (
                        <SpotlightCard 
                            item={mediaData[0]} 
                            onPress={() => navigation.navigate('MediaDetail', { mediaId: mediaData[0].id })} 
                        />
                    ) : null
                }
                ListEmptyComponent={
                    <EmptyState message={activeFilter === 'My List' && searchQuery.length === 0 ? "Your list is empty" : "No results found"} />
                }
                renderItem={({ item }) => (
                    <MediaPosterCard
                        item={item}
                        isFavorite={favorites.includes(item.id)}
                        onFavoritePress={() => handleToggleFavorite(item.id)}
                        onPress={() => navigation.navigate('MediaDetail', { mediaId: item.id })}
                    />
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.darkBackground },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15, height: 55, borderBottomWidth: 1, borderBottomColor: Colors.surface },
    backButton: { padding: 5 },
    headerTitle: { fontFamily: 'Poppins_600SemiBold', color: Colors.text, fontSize: 18 },
    searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: 12, marginHorizontal: 15, marginTop: 15, paddingHorizontal: 15 },
    searchIcon: { marginRight: 10 },
    searchInput: { flex: 1, height: 48, color: Colors.text, fontFamily: 'Poppins_400Regular', fontSize: 15 },
    clearButton: { padding: 5 },
    filterScrollView: { paddingHorizontal: 15, paddingVertical: 15 },
    filterButton: { paddingVertical: 8, paddingHorizontal: 18, backgroundColor: Colors.surface, borderRadius: 20, marginRight: 10 },
    activeFilterButton: { backgroundColor: Colors.primary },
    filterText: { color: Colors.textSecondary, fontFamily: 'Poppins_500Medium' },
    activeFilterText: { color: '#fff' },
    gridContainer: { paddingHorizontal: 10, paddingBottom: 20 },
    posterContainer: { flex: 1/3, aspectRatio: 2/3, margin: 5, borderRadius: 12, backgroundColor: Colors.surface },
    posterImage: { width: '100%', height: '100%', borderRadius: 12 },
    favoriteButton: { position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 15, width: 30, height: 30, justifyContent: 'center', alignItems: 'center' },
    spotlightContainer: { marginBottom: 20, marginHorizontal: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 10 },
    spotlightBg: { aspectRatio: 16/9, justifyContent: 'flex-end', padding: 15 },
    spotlightOverlay: { ...StyleSheet.absoluteFillObject, borderRadius: 18 },
    spotlightTag: { fontFamily: 'Poppins_600SemiBold', color: 'rgba(255,255,255,0.8)', fontSize: 12, letterSpacing: 1 },
    spotlightTitle: { fontFamily: 'Poppins_700Bold', color: '#fff', fontSize: 22, marginTop: 4 },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 80 },
    emptyText: { fontFamily: 'Poppins_500Medium', color: Colors.textSecondary, fontSize: 16, marginTop: 15 },
});

export default MediaScreen;