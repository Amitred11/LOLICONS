// screens/comics/components/BrowseView.js

// Import essential modules from React, React Native, and third-party libraries.
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ImageBackground, Dimensions, Pressable, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../constants/Colors';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withDelay } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { comicsData as originalComicsData } from '../../constants/mockData';
import { useLibrary } from '../../context/LibraryContext';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

// Create an animated version of FlatList for scroll-based animations.
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);
// Get screen dimensions for layout calculations.
const { width, height } = Dimensions.get('window');

// --- Layout Constants ---
const PADDING = 15; // Global padding for the screen.
const GAP = 15; // Gap between grid items.
// Constants for Grid View
const GRID_NUM_COLUMNS = 3;
const GRID_CARD_WIDTH = (width - (PADDING * 2) - (GAP * (GRID_NUM_COLUMNS - 1))) / GRID_NUM_COLUMNS;
// Constants for Featured Carousel
const FEATURED_CARD_WIDTH = width * 0.7;
const FEATURED_CARD_ASPECT_RATIO = 16 / 9;

/**
 * A shared, reusable button for adding or removing a comic from the user's library.
 * It uses the LibraryContext to determine its state (add vs. checkmark icon).
 * @param {object} props - The component's properties.
 * @param {string} props.comicId - The ID of the comic associated with this button.
 * @param {object} [props.style] - Optional custom styles for the button.
 */
const AddToLibraryButton = ({ comicId, style }) => {
    const { isInLibrary, addToLibrary, removeFromLibrary } = useLibrary();
    const isComicInLibrary = isInLibrary(comicId);

    // Toggles the comic's presence in the library.
    const handleLibraryToggle = () => {
        isComicInLibrary ? removeFromLibrary(comicId) : addToLibrary(comicId);
    };

    return (
        <TouchableOpacity onPress={handleLibraryToggle} style={[styles.addButton, style]}>
            <BlurView intensity={50} tint="dark" style={StyleSheet.absoluteFillObject}>
                <View style={styles.addButtonIconContainer}>
                    <Ionicons name={isComicInLibrary ? "checkmark-sharp" : "add-sharp"} size={22} color={isComicInLibrary ? Colors.secondary : Colors.text} />
                </View>
            </BlurView>
        </TouchableOpacity>
    );
};

/**
 * A component to render a single comic item in the "list" view mode.
 * @param {object} props - The component's properties.
 * @param {object} props.item - The comic data object.
 * @param {number} props.index - The index of the item, used for staggered entry animations.
 */
const BrowseListItem = ({ item, index }) => {
    const navigation = useNavigation();
    // Shared values for the staggered entry animation.
    const entryOpacity = useSharedValue(0);
    const entryTranslateY = useSharedValue(20);

    // Trigger the animation when the component mounts.
    useEffect(() => {
        entryOpacity.value = withDelay(index * 50, withSpring(1));
        entryTranslateY.value = withDelay(index * 50, withSpring(0));
    }, []);

    const animatedEntryStyle = useAnimatedStyle(() => ({
        opacity: entryOpacity.value,
        transform: [{ translateY: entryTranslateY.value }],
    }));

    return (
        <Animated.View style={[styles.listItemWrapper, animatedEntryStyle]}>
            <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
            <Pressable 
                style={({ pressed }) => [styles.listItemContainer, pressed && styles.itemPressed]} 
                onPress={() => navigation.navigate('ComicDetail', { comicId: item.id })}
            >
                <ImageBackground source={item.image} style={styles.listItemImage} imageStyle={{ borderRadius: 8 }} />
                <View style={styles.listItemTextContainer}>
                    <Text style={styles.listItemTitle} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.listItemSynopsis} numberOfLines={2}>{item.synopsis}</Text>
                    <View style={styles.tagsContainer}>
                        <View style={[styles.tag, styles.statusTag(item.status)]}><Text style={styles.tagText}>{item.status}</Text></View>
                        <View style={styles.tag}><Text style={styles.tagText}>{item.type}</Text></View>
                        {/* --- CRASH FIX: Use optional chaining or an empty array fallback to prevent crashing if `item.genres` is undefined. --- */}
                        {(item.genres || []).slice(0, 2).map(genre => (
                            <View key={genre} style={styles.tag}><Text style={styles.tagText}>{genre}</Text></View>
                        ))}
                    </View>
                </View>
                <AddToLibraryButton comicId={item.id} style={{ right: 0 }}/>
            </Pressable>
        </Animated.View>
    );
};

/**
 * A component to render a single comic item in the "grid" view mode. Also used for the featured carousel.
 * @param {object} props - The component's properties.
 * @param {object} props.item - The comic data object.
 * @param {number} props.index - The index for staggered entry animations.
 * @param {object} props.cardStyle - Custom styles for the main container.
 * @param {object} props.imageStyle - Custom styles for the image itself.
 */
const BrowseGridItem = ({ item, index, cardStyle, imageStyle }) => {
  // If the item is an empty placeholder for grid alignment, render an empty view.
  if (item.empty) { return <View style={[{ width: GRID_CARD_WIDTH, marginBottom: 20 }, cardStyle]} />; }
  
  const navigation = useNavigation();
  const entryOpacity = useSharedValue(0);
  const entryTranslateY = useSharedValue(20);

  useEffect(() => {
    entryOpacity.value = withDelay(index * 50, withSpring(1));
    entryTranslateY.value = withDelay(index * 50, withSpring(0));
  }, []);

  const animatedEntryStyle = useAnimatedStyle(() => ({
    opacity: entryOpacity.value,
    transform: [{ translateY: entryTranslateY.value }],
  }));

  return (
    <Animated.View style={[styles.gridItemContainer, cardStyle, animatedEntryStyle]}>
      <Pressable onPress={() => navigation.navigate('ComicDetail', { comicId: item.id })}>
        <ImageBackground source={item.image} style={[styles.gridItemImage, imageStyle]} imageStyle={{ borderRadius: 12 }}>
          <LinearGradient colors={['transparent', 'rgba(0,0,0,0.9)']} style={styles.gridItemOverlay}>
            <Text style={styles.gridItemType}>{item.type}</Text>
            <Text style={styles.gridItemTitle} numberOfLines={2}>{item.title}</Text>
          </LinearGradient>
        </ImageBackground>
      </Pressable>
      <AddToLibraryButton comicId={item.id} />
    </Animated.View>
  );
};

/**
 * A component that serves as the header for the main list, containing the featured carousel
 * and the "All Comics" title with view mode toggles.
 * @param {object} props - The component's properties.
 * @param {function} props.setViewMode - A state setter function from the parent to change the view mode.
 * @param {string} props.viewMode - The current view mode ('grid' or 'list').
 */
const BrowseHeader = ({ setViewMode, viewMode }) => {
    const popularComics = originalComicsData.filter(c => c.isPopular);
    const navigation = useNavigation();

    // Navigates to the "SeeAll" screen with the popular comics data.
    const handleSeeAll = () => {
        // A simple serialization step to ensure no non-serializable data (like Date objects) is passed in navigation params.
        const serializableData = popularComics.map(comic => {
            const newComic = { ...comic };
            if (newComic.lastRead instanceof Date) {
                newComic.lastRead = newComic.lastRead.toISOString();
            }
            return newComic;
        });

        navigation.navigate('SeeAll', { 
            title: 'Popular This Week', 
            data: serializableData
        });
    };

    return (
        <>
            {/* Featured Carousel Section */}
            <View style={styles.featuredContainer}>
                <View style={styles.sectionHeaderContainer}>
                    <Text style={styles.sectionHeader}>Popular This Week</Text>
                    <TouchableOpacity onPress={handleSeeAll}>
                        <Text style={styles.seeAllText}>See All</Text>
                    </TouchableOpacity>
                </View>
                <FlatList
                    data={popularComics}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={item => item.id}
                    renderItem={({ item, index }) => 
                        // Reuses the GridItem component with custom styling for the carousel.
                        <BrowseGridItem 
                            item={item} 
                            index={index} 
                            cardStyle={{ width: FEATURED_CARD_WIDTH, marginRight: GAP }}
                            imageStyle={{ aspectRatio: FEATURED_CARD_ASPECT_RATIO }}
                        />
                    }
                    contentContainerStyle={{ paddingHorizontal: PADDING }}
                />
            </View>

            {/* "All Comics" Header and View Mode Toggles */}
            <View style={styles.listHeaderContainer}>
                <Text style={styles.sectionHeader}>All Comics</Text>
                <View style={styles.viewModeContainer}>
                    <TouchableOpacity onPress={() => setViewMode('grid')}>
                        <Ionicons name="grid" size={22} color={viewMode === 'grid' ? Colors.secondary : Colors.textSecondary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setViewMode('list')} style={{ marginLeft: 15 }}>
                        <Ionicons name="list" size={26} color={viewMode === 'list' ? Colors.secondary : Colors.textSecondary} />
                    </TouchableOpacity>
                </View>
            </View>
        </>
    );
}

/**
 * The main component for the "Browse" view, which is part of the Comics tab.
 * It manages filtering, sorting, and switching between grid and list layouts.
 * @param {object} props - The component's properties, passed from the parent tab screen.
 * @param {function} props.scrollHandler - The animated scroll handler for the collapsible header.
 * @param {number} props.headerHeight - The height of the header for initial padding.
 * @param {string} props.searchQuery - The current search query from the parent.
 * @param {object} props.filters - The current filter object from the parent.
 */
const BrowseView = ({ scrollHandler, headerHeight, searchQuery, filters }) => {
  const [filteredData, setFilteredData] = useState([]);
  const [viewMode, setViewMode] = useState('grid');

  // This effect re-calculates the displayed data whenever the search query, filters, or view mode change.
  useEffect(() => {
    let data = [...originalComicsData];
    
    // Apply filtering and sorting based on props.
    if (searchQuery) { data = data.filter(item => item.title.toLowerCase().includes(searchQuery.toLowerCase())); }
    if (filters.status !== 'All') { data = data.filter(item => item.status === filters.status); }
    if (filters.type !== 'All') { data = data.filter(item => item.type === filters.type); }
    if (filters.genres && filters.genres.length > 0) {
      data = data.filter(item => filters.genres.every(genre => item.genres.includes(genre)));
    }
    switch (filters.sort) {
      case 'az': data.sort((a, b) => a.title.localeCompare(a.title)); break;
      case 'za': data.sort((a, b) => b.title.localeCompare(a.title)); break;
      default: break;
    }
    
    // If in grid view, add empty placeholder items to ensure the last row aligns correctly.
    if (viewMode === 'grid') {
        const itemsToAdd = GRID_NUM_COLUMNS - (data.length % GRID_NUM_COLUMNS);
        if (itemsToAdd > 0 && itemsToAdd < GRID_NUM_COLUMNS) {
            for (let i = 0; i < itemsToAdd; i++) { data.push({ id: `placeholder-${i}`, empty: true }); }
        }
    }
    setFilteredData(data);
  }, [searchQuery, filters, viewMode]);

  return (
    <AnimatedFlatList
      key={viewMode} // Using `key` forces a re-render of the FlatList when the view mode changes, which is necessary when switching `numColumns`.
      data={filteredData}
      numColumns={viewMode === 'grid' ? GRID_NUM_COLUMNS : 1}
      renderItem={({ item, index }) => 
        viewMode === 'grid' 
            ? <BrowseGridItem item={item} index={index} cardStyle={{width: GRID_CARD_WIDTH}} imageStyle={{aspectRatio: 2/3}}/>
            : <BrowseListItem item={item} index={index} />
      }
      keyExtractor={(item) => item.id}
      onScroll={scrollHandler}
      scrollEventThrottle={16}
      contentContainerStyle={[styles.listContainer, { paddingTop: headerHeight }]}
      columnWrapperStyle={viewMode === 'grid' ? styles.columnWrapper : null}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={<BrowseHeader setViewMode={setViewMode} viewMode={viewMode}/>}
      ListEmptyComponent={
          <View style={styles.emptyContainer}>
              <Ionicons name="sad-outline" size={64} color={Colors.textSecondary} />
              <Text style={styles.emptyText}>No results found</Text>
          </View>
      }
    />
  );
};

// --- Stylesheet ---
const styles = StyleSheet.create({
  listContainer: { paddingBottom: 120 },
  sectionHeaderContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: PADDING, marginBottom: 10 },
  sectionHeader: { fontFamily: 'Poppins_700Bold', color: Colors.text, fontSize: 22 },
  seeAllText: { fontFamily: 'Poppins_500Medium', color: Colors.secondary, fontSize: 14 },
  columnWrapper: { justifyContent: 'space-between', paddingHorizontal: PADDING },
  featuredContainer: { paddingTop: 20 },
  gridItemContainer: { marginBottom: 20 },
  gridItemImage: { width: '100%', backgroundColor: Colors.surface, justifyContent: 'flex-end' },
  gridItemOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'flex-end', padding: 10, borderRadius: 12 },
  gridItemType: { fontFamily: 'Poppins_600SemiBold', color: Colors.text, fontSize: 10, backgroundColor: Colors.secondary + 'B3', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, overflow: 'hidden', alignSelf: 'flex-start', marginBottom: 4 },
  gridItemTitle: { fontFamily: 'Poppins_600SemiBold', color: Colors.text, fontSize: 14, textShadowColor: 'rgba(0,0,0,0.9)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 3 },
  listItemWrapper: { borderRadius: 12, overflow: 'hidden', marginHorizontal: PADDING, marginBottom: 15 },
  listItemContainer: { flexDirection: 'row', padding: 10, alignItems: 'center' },
  itemPressed: { backgroundColor: Colors.surface + '80' },
  listItemImage: { width: 80, height: 120, backgroundColor: Colors.surface },
  listItemTextContainer: { flex: 1, marginLeft: PADDING, height: 120, justifyContent: 'space-between', paddingVertical: 2 },
  listItemTitle: { fontFamily: 'Poppins_600SemiBold', color: Colors.text, fontSize: 17 },
  listItemSynopsis: { fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, fontSize: 13, lineHeight: 18 },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' },
  tag: { backgroundColor: Colors.surface, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginRight: 6, marginTop: 6 },
  tagText: { fontFamily: 'Poppins_500Medium', color: Colors.textSecondary, fontSize: 11 },
  statusTag: (status) => ({ backgroundColor: status === 'Ongoing' ? Colors.success + '40' : Colors.primary + '40' }),
  addButton: { position: 'absolute', top: 8, right: 8, width: 36, height: 36, borderRadius: 18, overflow: 'hidden' },
  addButtonIconContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  listHeaderContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 20, paddingHorizontal: PADDING },
  viewModeContainer: { flexDirection: 'row' },
  emptyContainer: { height: height / 2, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontFamily: 'Poppins_600SemiBold', color: Colors.textSecondary, fontSize: 18, marginTop: 15 },
});

export default BrowseView;