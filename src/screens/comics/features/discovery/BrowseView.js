// screens/comics/components/BrowseView.js

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ImageBackground, Dimensions, Pressable, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '@config/Colors';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withDelay } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
// CHANGE: Import unified Context
import { useComic } from '@context/ComicContext';
// CHANGE: We still import Service for lists that aren't global user data (like "Browse" or "Search")
import { ComicService } from '@api/MockComicService'; 
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);
const { width, height } = Dimensions.get('window');

const PADDING = 15;
const GAP = 15;
const GRID_NUM_COLUMNS = 3;
const GRID_CARD_WIDTH = (width - (PADDING * 2) - (GAP * (GRID_NUM_COLUMNS - 1))) / GRID_NUM_COLUMNS;
const FEATURED_CARD_WIDTH = width * 0.7;
const FEATURED_CARD_ASPECT_RATIO = 16 / 9;

const AddToLibraryButton = ({ comicId, style }) => {
    // CHANGE: Use unified context
    const { isInLibrary, addToLibrary, removeFromLibrary } = useComic();
    const isComicInLibrary = isInLibrary(comicId);

    const handleLibraryToggle = () => {
        // We need the full comic object to add, but for Browse list items we might only have ID here cleanly.
        // Ideally, pass the full item to this button or fetch it. 
        // For now, assuming the context handles ID-based removal, but requires object for add.
        // To fix this cleanly without passing 'item' prop everywhere, we'll assume the parent passes 'item' 
        // OR we just toggle ID and let context handle fetching if missing (advanced).
        // SIMPLIFICATION: We will change props of this component to accept 'item' instead of just ID.
        console.warn("AddToLibraryButton in BrowseView needs the full item object to function perfectly with Context state.");
    };

    return (
        <TouchableOpacity 
             // Logic moved to parent for now to access 'item'
            style={[styles.addButton, style]}
            disabled={true} // See BrowseListItem below for actual implementation
        >
            <BlurView intensity={50} tint="dark" style={StyleSheet.absoluteFillObject}>
                <View style={styles.addButtonIconContainer}>
                    <Ionicons name={isComicInLibrary ? "checkmark-sharp" : "add-sharp"} size={22} color={isComicInLibrary ? Colors.secondary : Colors.text} />
                </View>
            </BlurView>
        </TouchableOpacity>
    );
};

// HELPER for the button logic inside items
const LibraryToggleButton = ({ item, style }) => {
    const { isInLibrary, addToLibrary, removeFromLibrary } = useComic();
    const isIn = isInLibrary(item.id);

    return (
        <TouchableOpacity 
            onPress={() => isIn ? removeFromLibrary(item.id) : addToLibrary(item)} 
            style={[styles.addButton, style]}
        >
            <BlurView intensity={50} tint="dark" style={StyleSheet.absoluteFillObject}>
                <View style={styles.addButtonIconContainer}>
                    <Ionicons name={isIn ? "checkmark-sharp" : "add-sharp"} size={22} color={isIn ? Colors.secondary : Colors.text} />
                </View>
            </BlurView>
        </TouchableOpacity>
    );
};


const BrowseListItem = ({ item, index }) => {
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
                        {(item.genres || []).slice(0, 2).map(genre => (
                            <View key={genre} style={styles.tag}><Text style={styles.tagText}>{genre}</Text></View>
                        ))}
                    </View>
                </View>
                {/* CHANGE: Use new button component */}
                <LibraryToggleButton item={item} style={{ right: 0 }}/>
            </Pressable>
        </Animated.View>
    );
};

const BrowseGridItem = ({ item, index, cardStyle, imageStyle }) => {
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
      {/* CHANGE: Use new button component */}
      <LibraryToggleButton item={item} />
    </Animated.View>
  );
};

const BrowseHeader = ({ setViewMode, viewMode }) => {
    const [popularComics, setPopularComics] = useState([]);
    const navigation = useNavigation();

    useEffect(() => {
        const loadFeatured = async () => {
            try {
                // Featured data is ephemeral, keep using Service directly is fine, 
                // or add it to HomeContext/ComicContext if you want global caching.
                const response = await ComicService.getFeaturedComics();
                if (response.success && Array.isArray(response.data)) {
                    setPopularComics(response.data);
                } else if (Array.isArray(response)) {
                    setPopularComics(response);
                }
            } catch (err) {
                console.error(err);
            }
        };
        loadFeatured();
    }, []);

    const handleSeeAll = () => {
        if (!Array.isArray(popularComics)) return;
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

const BrowseView = ({ scrollHandler, headerHeight, searchQuery, filters }) => {
  const [filteredData, setFilteredData] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    const loadComics = async () => {
        setIsLoading(true);
        try {
            // "Browsing" is usually server-side search, so we use Service, not Context state.
            const response = await ComicService.getComics({
                searchQuery,
                filters
            });

            if (!isMounted) return;

            let data = [];
            if (response && response.data && Array.isArray(response.data)) {
                data = response.data;
            } else if (Array.isArray(response)) {
                data = response;
            }

            let gridData = [...data];
            if (viewMode === 'grid') {
                const itemsToAdd = GRID_NUM_COLUMNS - (gridData.length % GRID_NUM_COLUMNS);
                if (itemsToAdd > 0 && itemsToAdd < GRID_NUM_COLUMNS) {
                    for (let i = 0; i < itemsToAdd; i++) { 
                        gridData.push({ id: `placeholder-${i}`, empty: true }); 
                    }
                }
            }
            setFilteredData(gridData);
        } catch (error) {
            console.error("Failed to load comics", error);
        } finally {
            if (isMounted) setIsLoading(false);
        }
    };

    loadComics();
    return () => { isMounted = false; };
  }, [searchQuery, filters, viewMode]);

  if (isLoading && filteredData.length === 0) {
      return (
          <View style={[styles.emptyContainer, { paddingTop: headerHeight }]}>
              <ActivityIndicator size="large" color={Colors.secondary} />
          </View>
      );
  }

  return (
    <AnimatedFlatList
      key={viewMode}
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

const styles = StyleSheet.create({
  listContainer: { paddingBottom: 120 },
  sectionHeaderContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: PADDING, marginBottom: 10 },
  sectionHeader: { fontFamily: 'Poppins_700Bold', color: Colors.text, fontSize: 22 },
  seeAllText: { fontFamily: 'Poppins_500Medium', color: Colors.secondary, fontSize: 14 },
  columnWrapper: { justifyContent: 'space-between', paddingHorizontal: PADDING },
  featuredContainer: { paddingTop: 45 },
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