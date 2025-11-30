// screens/comics/SeeAllScreen.js

// Import essential modules from React, React Native, and third-party libraries.
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ImageBackground, Dimensions, Pressable, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Colors } from '@config/Colors';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withDelay } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useLibrary } from '@context/LibraryContext';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Create an animated version of FlatList for potential future animations.
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);
// --- Layout Constants ---
const { width, height } = Dimensions.get('window');
const PADDING = 15;
const GAP = 15;
// Grid layout calculations.
const GRID_NUM_COLUMNS = 3;
const GRID_CARD_WIDTH = (width - (PADDING * 2) - (GAP * (GRID_NUM_COLUMNS - 1))) / GRID_NUM_COLUMNS;

// --- Reusable Component: Add to Library Button ---
/**
 * A shared button for adding/removing a comic from the user's library.
 * It connects to the LibraryContext to manage its state.
 * @param {object} props - The component's properties.
 * @param {string} props.comicId - The ID of the comic.
 * @param {object} [props.style] - Optional custom styles.
 */
const AddToLibraryButton = ({ comicId, style }) => {
    const { isInLibrary, addToLibrary, removeFromLibrary } = useLibrary();
    const isComicInLibrary = isInLibrary(comicId);

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

// --- Reusable Component: List View Item ---
/**
 * A component for rendering a single comic item in the "list" view mode.
 * @param {object} props - The component's properties.
 * @param {object} props.item - The comic data object.
 * @param {number} props.index - The index for staggered entry animations.
 */
const BrowseListItem = ({ item, index }) => {
    const navigation = useNavigation();
    const entryOpacity = useSharedValue(0);
    const entryTranslateY = useSharedValue(20);

    // Trigger a staggered fade-in and slide-up animation.
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

// --- Reusable Component: Grid View Item ---
/**
 * A component for rendering a single comic item in the "grid" view mode.
 * @param {object} props - The component's properties.
 * @param {object} props.item - The comic data object.
 * @param {number} props.index - The index for staggered entry animations.
 */
const BrowseGridItem = ({ item, index }) => {
  // Render an empty placeholder to maintain grid alignment on the last row.
  if (item.empty) { return <View style={{ width: GRID_CARD_WIDTH, marginBottom: 20 }} />; }
  
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
    <Animated.View style={[styles.gridItemContainer, animatedEntryStyle]}>
      <Pressable onPress={() => navigation.navigate('ComicDetail', { comicId: item.id })}>
        <ImageBackground source={item.image} style={styles.gridItemImage} imageStyle={{ borderRadius: 12 }}>
          <LinearGradient colors={['transparent', 'rgba(0,0,0,0.9)']} style={styles.gridItemOverlay}>
            <Text style={styles.gridItemTitle} numberOfLines={2}>{item.title}</Text>
          </LinearGradient>
        </ImageBackground>
      </Pressable>
      <AddToLibraryButton comicId={item.id} />
    </Animated.View>
  );
};


/**
 * A generic screen to display a full list of comics, typically navigated to from a "See All" button.
 * It receives the title and data as navigation parameters.
 */
const SeeAllScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  // Destructure `title` and `data` passed from the previous screen.
  const { title, data } = route.params;

  const [viewMode, setViewMode] = useState('grid');
  const [listData, setListData] = useState([]);

  // This effect prepares the data for display whenever the view mode or original data changes.
  useEffect(() => {
    let preparedData = [...data];
    // If in grid view, add empty placeholder items to ensure the last row aligns correctly.
    if (viewMode === 'grid') {
        const itemsToAdd = GRID_NUM_COLUMNS - (preparedData.length % GRID_NUM_COLUMNS);
        if (itemsToAdd > 0 && itemsToAdd < GRID_NUM_COLUMNS) {
            for (let i = 0; i < itemsToAdd; i++) { preparedData.push({ id: `placeholder-${i}`, empty: true }); }
        }
    }
    setListData(preparedData);
  }, [data, viewMode]);

  return (
    <View style={styles.container}>
        {/* The screen header, which is always visible. */}
        <View style={[styles.header, { height: 130}]}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
                <Ionicons name="arrow-back-outline" size={28} color={Colors.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{title}</Text>
            {/* View mode toggle buttons (grid/list) */}
            <View style={styles.viewModeContainer}>
                <TouchableOpacity onPress={() => setViewMode('grid')}>
                    <Ionicons name="grid" size={22} color={viewMode === 'grid' ? Colors.secondary : Colors.textSecondary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setViewMode('list')} style={{ marginLeft: 15 }}>
                    <Ionicons name="list" size={26} color={viewMode === 'list' ? Colors.secondary : Colors.textSecondary} />
                </TouchableOpacity>
            </View>
        </View>

        <AnimatedFlatList
            key={viewMode} // Changing the key forces a re-render, necessary when toggling `numColumns`.
            data={listData}
            numColumns={viewMode === 'grid' ? GRID_NUM_COLUMNS : 1}
            renderItem={({ item, index }) => 
                viewMode === 'grid' 
                    ? <BrowseGridItem item={item} index={index} />
                    : <BrowseListItem item={item} index={index} />
            }
            keyExtractor={(item) => item.id}
            scrollEventThrottle={16}
            contentContainerStyle={[styles.listContainer, { paddingTop: 80 + insets.top }]}
            columnWrapperStyle={viewMode === 'grid' ? styles.columnWrapper : null}
            showsVerticalScrollIndicator={false}
        />
    </View>
  );
};

// --- Stylesheet ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: PADDING, backgroundColor: Colors.background + 'D9', borderBottomWidth: StyleSheet.hairlineWidth, borderColor: Colors.surface },
  headerButton: { paddingRight: 10 },
  headerTitle: { fontFamily: 'Poppins_600SemiBold', color: Colors.text, fontSize: 18, flex: 1, textAlign: 'center' },
  viewModeContainer: { flexDirection: 'row' },
  listContainer: { paddingBottom: 120 },
  columnWrapper: { justifyContent: 'space-between', paddingHorizontal: PADDING },
  gridItemContainer: { width: GRID_CARD_WIDTH, marginBottom: 20 },
  gridItemImage: { width: '100%', aspectRatio: 2/3, backgroundColor: Colors.surface, justifyContent: 'flex-end' },
  gridItemOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'flex-end', padding: 10, borderRadius: 12 },
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
});

export default SeeAllScreen;