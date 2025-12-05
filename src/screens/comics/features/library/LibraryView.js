// screens/comics/components/LibraryView.js

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SectionList, Dimensions, Pressable, ImageBackground, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Colors } from '@config/Colors';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withDelay } from 'react-native-reanimated';
// REMOVE: import { comicsData as originalComicsData } from '@config/mockData';
import { ComicService } from '@api/MockComicService'; // Import Service
import { useLibrary } from '@context/LibraryContext';
import { useDownloads } from '@context/DownloadContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle } from 'react-native-svg';

const AnimatedSectionList = Animated.createAnimatedComponent(SectionList);
const { width, height } = Dimensions.get('window');
const NUM_COLUMNS = 3;
const PADDING = 15;
const GAP = 15;
const CARD_WIDTH = (width - (PADDING * 2) - (GAP * (NUM_COLUMNS - 1))) / NUM_COLUMNS;

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

const LibraryCard = ({ item, index }) => {
  if (item.empty) { return <View style={{ width: CARD_WIDTH }} />; }

  const navigation = useNavigation();
  const { getDownloadInfo, getDownloadedCoverUri } = useDownloads();
  const { downloadedCount, progress } = getDownloadInfo(item.id, item.chapters.length);
  
  const coverImageUri = getDownloadedCoverUri(item.id);
  const imageSource = coverImageUri ? { uri: coverImageUri } : item.localSource;
  
  const entryOpacity = useSharedValue(0);
  const entryTranslateY = useSharedValue(20);

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

const LibraryView = ({ scrollHandler, headerHeight, searchQuery, filters }) => {
  const { library } = useLibrary(); 
  const [librarySections, setLibrarySections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    let isMounted = true;
    
    const loadLibrary = async () => {
        setIsLoading(true);
        try {
            // Using the service to get comics that match the library
            // Note: Service filters by search/filters internally if passed, 
            // but assumes we might be passing the library IDs via context or the service manages it.
            // Since we updated MockComicService to handle internal library state, we call getLibrary directly.
            const data = await ComicService.getLibrary({
                searchQuery,
                filters
            });

            if (!isMounted) return;

            // Chunking for Grid
            const addPlaceholdersAndChunk = (data) => {
                const dataWithPlaceholders = [...data];
                const itemsToAdd = NUM_COLUMNS - (dataWithPlaceholders.length % NUM_COLUMNS);
                if (itemsToAdd > 0 && itemsToAdd < NUM_COLUMNS) { for (let i = 0; i < itemsToAdd; i++) { dataWithPlaceholders.push({ id: `placeholder-${i}`, empty: true }); } }
                const rows = [];
                for (let i = 0; i < dataWithPlaceholders.length; i += NUM_COLUMNS) { rows.push(dataWithPlaceholders.slice(i, i + NUM_COLUMNS)); }
                return rows;
            };
            
            if (data.length > 0) {
                setLibrarySections([{ title: 'My Library', data: addPlaceholdersAndChunk(data) }]);
            } else {
                setLibrarySections([]);
            }
        } catch (error) {
            console.error(error);
        } finally {
            if (isMounted) setIsLoading(false);
        }
    };

    loadLibrary();
    return () => { isMounted = false; };
  }, [searchQuery, filters, library]); // Re-run if library context changes

  if (isLoading && librarySections.length === 0) {
      return (
          <View style={[styles.emptyContainer, { paddingTop: headerHeight }]}>
              <ActivityIndicator size="large" color={Colors.secondary} />
          </View>
      );
  }

  return (
    <AnimatedSectionList
      sections={librarySections}
      keyExtractor={(item, index) => `row-${index}`}
      stickySectionHeadersEnabled={false}
      onScroll={scrollHandler}
      scrollEventThrottle={16}
      ListHeaderComponent={() => <View style={{ height: 40 }} />}
      contentContainerStyle={[styles.listContainer, { paddingTop: headerHeight }]}
      showsVerticalScrollIndicator={false}
      renderSectionHeader={({ section: { title } }) => (
        <Text style={styles.sectionHeader}>{title}</Text>
      )}
      renderItem={({ item: row, index: rowIndex }) => (
        <View style={styles.row}>
          {row.map((item, itemIndex) => {
            const globalIndex = rowIndex * NUM_COLUMNS + itemIndex; 
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