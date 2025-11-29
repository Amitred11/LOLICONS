// screens/comics/components/LibraryView.js

// Import essential modules from React, React Native, and third-party libraries.
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SectionList, Dimensions, Pressable, ImageBackground, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../../../constants/Colors';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withDelay } from 'react-native-reanimated';
import { comicsData as originalComicsData } from '../../../../constants/mockData';
// Import custom context hooks for managing global library and download state.
import { useLibrary } from '../../../../context/LibraryContext';
import { useDownloads } from '../../../../context/DownloadContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle } from 'react-native-svg';

// Create an animated version of SectionList for scroll-based animations.
const AnimatedSectionList = Animated.createAnimatedComponent(SectionList);
// --- Layout Constants ---
const { width, height } = Dimensions.get('window');
const NUM_COLUMNS = 3;
const PADDING = 15;
const GAP = 15;
const CARD_WIDTH = (width - (PADDING * 2) - (GAP * (NUM_COLUMNS - 1))) / NUM_COLUMNS;

/**
 * A reusable circular progress ring component to display download progress.
 * @param {object} props - The component's properties.
 * @param {number} props.progress - The progress value (0 to 1).
 * @param {number} [props.size=32] - The width and height of the ring.
 */
const ProgressRing = ({ progress, size = 32 }) => {
    const strokeWidth = 3;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference * (1 - progress);
    return (
        <View style={{width: size, height: size}}>
            <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                <Circle cx={size/2} cy={size/2} r={radius} stroke={Colors.surface + '80'} strokeWidth={strokeWidth} />
                <Circle cx={size/2} cy={size/2} r={radius} stroke={Colors.secondary} strokeWidth={strokeWidth} 
                    strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round"
                    transform={`rotate(-90 ${size/2} ${size/2})`}
                />
            </Svg>
        </View>
    )
}

/**
 * A component for rendering a single comic card in the library grid.
 * @param {object} props - The component's properties.
 * @param {object} props.item - The comic data object.
 * @param {number} props.index - The item's index for staggered entry animations.
 */
const LibraryCard = ({ item, index }) => {
  // If the item is an empty placeholder, render an empty view to maintain grid alignment.
  if (item.empty) { return <View style={{ width: CARD_WIDTH }} />; }

  const navigation = useNavigation();
  const { getDownloadInfo, getDownloadedCoverUri } = useDownloads();
  // Get download status for this specific comic from the context.
  const { downloadedCount, progress } = getDownloadInfo(item.id, item.chapters.length);
  
  // Determine the correct image source: use the local downloaded URI if available, otherwise use the bundled asset.
  const coverImageUri = getDownloadedCoverUri(item.id);
  const imageSource = coverImageUri ? { uri: coverImageUri } : item.localSource;
  
  // Shared values for the entry animation.
  const entryOpacity = useSharedValue(0);
  const entryTranslateY = useSharedValue(20);

  // Trigger the animation when the component mounts.
  useEffect(() => {
    entryOpacity.value = withDelay(index * 50, withSpring(1));
    entryTranslateY.value = withDelay(index * 50, withSpring(0));
  }, [index]);

  const animatedEntryStyle = useAnimatedStyle(() => ({
    opacity: entryOpacity.value,
    transform: [{ translateY: entryTranslateY.value }],
  }));

  return (
    <Animated.View style={[styles.cardContainer, animatedEntryStyle]}>
      <Pressable 
        onPress={() => navigation.navigate('ComicDetail', { comicId: item.id })}
        style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
      >
        <ImageBackground source={imageSource} style={styles.cardImage} imageStyle={{ borderRadius: 8 }}>
            <LinearGradient colors={['transparent', 'rgba(0,0,0,0.9)']} style={styles.cardOverlay}>
                <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
            </LinearGradient>
            
            {/* Display the download progress ring if any chapters are downloaded. */}
            {downloadedCount > 0 && (
                <View style={styles.downloadProgressContainer}>
                    <ProgressRing progress={progress} />
                    <Text style={styles.downloadProgressText}>{downloadedCount}</Text>
                </View>
            )}
        </ImageBackground>
      </Pressable>
    </Animated.View>
  );
};

/**
 * The main component for the "Library" view, displaying a grid of comics the user has saved.
 * @param {object} props - The component's properties passed from the parent tab screen.
 * @param {function} props.scrollHandler - The animated scroll handler for the collapsible header.
 * @param {number} props.headerHeight - The height of the header for initial padding.
 * @param {string} props.searchQuery - The current search query from the parent.
 * @param {object} props.filters - The current filter object from the parent.
 */
const LibraryView = ({ scrollHandler, headerHeight, searchQuery, filters }) => {
  const { library } = useLibrary(); // Get the list of comic IDs in the user's library.
  const [librarySections, setLibrarySections] = useState([]);
  const navigation = useNavigation();

  // This effect filters, sorts, and structures the library data for rendering whenever dependencies change.
  useEffect(() => {
    // 1. Start with the full comic dataset and filter it to only include comics in the user's library.
    let baseData = originalComicsData.filter(comic => library.includes(comic.id));
    // 2. Apply search and filter criteria from the parent screen.
    if (searchQuery) { baseData = baseData.filter(item => item.title.toLowerCase().includes(searchQuery.toLowerCase())); }
    if (filters.status !== 'All') { baseData = baseData.filter(item => item.status === filters.status); }
    if (filters.type !== 'All') { baseData = baseData.filter(item => item.type === filters.type); }
    if (filters.genres && filters.genres.length > 0) {
        baseData = baseData.filter(item => filters.genres.every(genre => item.genres.includes(genre)));
    }
    // 3. Apply sorting.
    switch (filters.sort) {
        case 'az': baseData.sort((a, b) => a.title.localeCompare(a.title)); break;
        case 'za': baseData.sort((a, b) => b.title.localeCompare(a.title)); break;
        default: break;
    }

    // 4. A helper function to chunk the data into rows and add placeholders for grid alignment.
    const addPlaceholdersAndChunk = (data) => {
        const dataWithPlaceholders = [...data];
        const itemsToAdd = NUM_COLUMNS - (dataWithPlaceholders.length % NUM_COLUMNS);
        if (itemsToAdd > 0 && itemsToAdd < NUM_COLUMNS) { for (let i = 0; i < itemsToAdd; i++) { dataWithPlaceholders.push({ id: `placeholder-${i}`, empty: true }); } }
        const rows = [];
        for (let i = 0; i < dataWithPlaceholders.length; i += NUM_COLUMNS) { rows.push(dataWithPlaceholders.slice(i, i + NUM_COLUMNS)); }
        return rows;
    };
    
    // 5. Set the final, structured data to state for the SectionList.
    setLibrarySections([{ title: 'My Library', data: addPlaceholdersAndChunk(baseData) }]);

  }, [searchQuery, filters, library]);

  return (
    <AnimatedSectionList
      sections={librarySections}
      keyExtractor={(item, index) => `row-${index}`}
      stickySectionHeadersEnabled={false}
      onScroll={scrollHandler}
      scrollEventThrottle={16}
      contentContainerStyle={[styles.listContainer, { paddingTop: headerHeight }]}
      showsVerticalScrollIndicator={false}
      renderSectionHeader={({ section: { title } }) => (
        <Text style={styles.sectionHeader}>{title}</Text>
      )}
      // `renderItem` receives a row of items. We then map over the row to render each card.
      renderItem={({ item: row, index: rowIndex }) => (
        <View style={styles.row}>
          {row.map((item, itemIndex) => {
            const globalIndex = rowIndex * NUM_COLUMNS + itemIndex; // Calculate a unique index for staggered animations.
            return <LibraryCard key={item.id} item={item} index={globalIndex} />;
          })}
        </View>
      )}
      ListEmptyComponent={
        <View style={[styles.emptyContainer, { paddingTop: headerHeight }]}>
          <Ionicons name="library-outline" size={64} color={Colors.textSecondary} />
          <Text style={styles.emptyText}>Your library is empty</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Browse')}>
            <Text style={styles.emptySubtext}>Add comics from the Browse tab!</Text>
          </TouchableOpacity>
        </View>
      }
    />
  );
};

// --- Stylesheet ---
const styles = StyleSheet.create({
  listContainer: { paddingHorizontal: PADDING, paddingBottom: 120 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  sectionHeader: { fontFamily: 'Poppins_700Bold', color: Colors.text, fontSize: 22, marginBottom: 15, marginTop: 10 },
  cardContainer: { width: CARD_WIDTH },
  cardImage: { width: '100%', aspectRatio: 2 / 3, backgroundColor: Colors.surface, justifyContent: 'flex-end' },
  cardOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'flex-end', padding: 8, borderRadius: 8 },
  cardTitle: { fontFamily: 'Poppins_600SemiBold', color: Colors.text, fontSize: 13, textShadowColor: 'rgba(0, 0, 0, 0.9)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 3 },
  downloadProgressContainer: { position: 'absolute', top: 6, left: 6, width: 32, height: 32, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 16 },
  downloadProgressText: { position: 'absolute', color: Colors.text, fontFamily: 'Poppins_600SemiBold', fontSize: 10 },
  emptyContainer: { height: height * 0.7, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontFamily: 'Poppins_600SemiBold', color: Colors.textSecondary, fontSize: 18, marginTop: 15 },
  emptySubtext: { fontFamily: 'Poppins_500Medium', color: Colors.secondary, fontSize: 14, marginTop: 8, textDecorationLine: 'underline', padding: 5 },
});

export default LibraryView;