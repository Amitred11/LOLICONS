// screens/comics/components/HistoryView.js

// Import essential modules from React, React Native, and third-party libraries.
import React, { useState, useEffect, useRef } from 'react';
// --- FIX: Import the original `Animated` API from react-native for compatibility with `Swipeable`. ---
import { View, Text, StyleSheet, SectionList, Dimensions, Pressable, Image, TouchableOpacity, Animated as RNAnimated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../../../constants/Colors';
// Import the NEW Reanimated API for modern animations.
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withDelay } from 'react-native-reanimated';
import { historyData as originalHistoryData } from '../../../../constants/mockData';
import { Ionicons } from '@expo/vector-icons';
// Import `Swipeable` from react-native-gesture-handler.
import { Swipeable } from 'react-native-gesture-handler';

// Create an animated version of SectionList using the NEW Reanimated API.
const AnimatedSectionList = Animated.createAnimatedComponent(SectionList);
const { height } = Dimensions.get('window');
const PADDING = 15;

/**
 * A component for rendering a single item in the reading history list.
 * It features a swipe-to-delete action and a staggered entry animation.
 * @param {object} props - The component's properties.
 * @param {object} props.item - The history item data object.
 * @param {number} props.index - The index of the item for animation staggering.
 * @param {function} props.onRemove - A callback function to remove the item from the list.
 */
const HistoryItem = ({ item, index, onRemove }) => {
  const navigation = useNavigation();
  const swipeableRef = useRef(null); // Ref to programmatically control the Swipeable component.
  // Shared values for the entry animation (NEW Reanimated API).
  const entryOpacity = useSharedValue(0);
  const entryTranslateY = useSharedValue(20);

  // Trigger the entry animation when the component mounts.
  useEffect(() => {
    entryOpacity.value = withDelay(index * 50, withSpring(1));
    entryTranslateY.value = withDelay(index * 50, withSpring(0));
  }, []);

  const animatedEntryStyle = useAnimatedStyle(() => ({
    opacity: entryOpacity.value,
    transform: [{ translateY: entryTranslateY.value }],
  }));

  // Closes the swipeable view programmatically.
  const closeSwipeable = () => {
    swipeableRef.current?.close();
  };

  // Handles the remove action, first closing the swipeable view then calling the parent's remove function.
  const handleRemove = () => {
    closeSwipeable();
    onRemove(item.id);
  };
  
  /**
   * Renders the "Delete" button that is revealed on swipe.
   * NOTE: This function uses the OLD `Animated` API because `react-native-gesture-handler`'s `Swipeable`
   * component provides progress and dragX values as legacy Animated values.
   */
  const renderRightActions = (progress, dragX) => {
    // Interpolate the drag distance to create a smooth "slide in" effect for the button content.
    const trans = dragX.interpolate({
      inputRange: [-80, 0],
      outputRange: [0, 80],
      extrapolate: 'clamp',
    });
    return (
      <TouchableOpacity onPress={handleRemove} style={styles.deleteButton}>
        {/* --- FIX: Use the original `RNAnimated.View` for compatibility with the interpolated value. --- */}
        <RNAnimated.View style={{ transform: [{ translateX: trans }] }}>
          <Ionicons name="trash-outline" size={24} color={Colors.text} />
        </RNAnimated.View>
      </TouchableOpacity>
    );
  };

  return (
    // This view uses the NEW Reanimated API for the initial entry animation.
    <Animated.View style={animatedEntryStyle}>
      <Swipeable ref={swipeableRef} renderRightActions={renderRightActions} overshootRight={false}>
        <Pressable 
          style={({ pressed }) => [styles.itemContainer, pressed && styles.itemPressed]}
          onPress={() => navigation.navigate('ComicDetail', { comicId: item.id })}
        >
          <Image source={item.image} style={styles.itemImage} />
          <View style={styles.itemTextContainer}>
            <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.itemSubtitle}>{item.lastChapterRead}</Text>
            <View style={styles.progressBarContainer}>
                <View style={[styles.progressBar, { width: `${item.progress * 100}%` }]} />
            </View>
          </View>
        </Pressable>
      </Swipeable>
    </Animated.View>
  );
};

/**
 * The main component for the "History" view, displaying comics grouped by the date they were last read.
 * @param {object} props - The component's properties passed from the parent tab screen.
 * @param {function} props.scrollHandler - The animated scroll handler for the collapsible header.
 * @param {number} props.headerHeight - The height of the header for initial padding.
 * @param {string} props.searchQuery - The current search query from the parent.
 */
const HistoryView = ({ scrollHandler, headerHeight, searchQuery }) => {
  const [historySections, setHistorySections] = useState([]);

  // Groups an array of history items into sections like "Today", "Yesterday", etc.
  const groupHistoryByDate = (data) => {
    const sections = { Today: [], Yesterday: [], 'Last 7 Days': [], Older: [] };
    const now = new Date();
    
    data.forEach(item => {
      const diffTime = now.getTime() - item.lastRead.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) sections.Today.push(item);
      else if (diffDays === 1) sections.Yesterday.push(item);
      else if (diffDays <= 7) sections['Last 7 Days'].push(item);
      else sections.Older.push(item);
    });

    // Converts the sections object into an array format suitable for SectionList, filtering out empty sections.
    return Object.keys(sections)
      .map(title => ({ title, data: sections[title] }))
      .filter(section => section.data.length > 0);
  };

  // This effect filters and groups the history data whenever the search query changes.
  useEffect(() => {
    let data = [...originalHistoryData];
    if (searchQuery) {
      data = data.filter(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.lastChapterRead.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setHistorySections(groupHistoryByDate(data));
  }, [searchQuery]);
  
  // Handles removing an item from the local state to instantly update the UI.
  const handleRemoveItem = (itemId) => {
    const newSections = historySections.map(section => ({
        ...section,
        data: section.data.filter(item => item.id !== itemId)
    })).filter(section => section.data.length > 0); // Also remove the section if it becomes empty.
    setHistorySections(newSections);
  };

  return (
    <AnimatedSectionList
      sections={historySections}
      renderItem={({ item, index }) => <HistoryItem item={item} index={index} onRemove={handleRemoveItem} />}
      keyExtractor={(item) => item.id}
      onScroll={scrollHandler}
      scrollEventThrottle={16}
      contentContainerStyle={[styles.listContainer, { paddingTop: headerHeight }]}
      showsVerticalScrollIndicator={false}
      stickySectionHeadersEnabled={false}
      ListHeaderComponent={<View style={{ height: 20 }}/>}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      renderSectionHeader={({ section: { title } }) => (
        <Text style={styles.sectionHeader}>{title}</Text>
      )}
      ListEmptyComponent={
          <View style={[styles.emptyContainer, { paddingTop: headerHeight }]}>
              <Ionicons name="time-outline" size={64} color={Colors.textSecondary} />
              <Text style={styles.emptyText}>No reading history</Text>
              <Text style={styles.emptySubtext}>Comics you read will appear here.</Text>
          </View>
      }
    />
  );
};

// --- Stylesheet ---
const styles = StyleSheet.create({
  listContainer: { paddingHorizontal: PADDING, paddingBottom: 120 },
  sectionHeader: { fontFamily: 'Poppins_700Bold', color: Colors.text, fontSize: 22, marginBottom: 10, marginTop: 15 },
  itemContainer: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderRadius: 12, backgroundColor: Colors.background, paddingHorizontal: 5 },
  itemPressed: { backgroundColor: Colors.surface + '80' },
  itemImage: { width: 50, height: 75, borderRadius: 6, backgroundColor: Colors.surface },
  itemTextContainer: { flex: 1, marginLeft: 15, justifyContent: 'center' },
  itemTitle: { fontFamily: 'Poppins_600SemiBold', color: Colors.text, fontSize: 16, marginBottom: 2 },
  itemSubtitle: { fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, fontSize: 14, marginBottom: 6 },
  separator: { height: StyleSheet.hairlineWidth, backgroundColor: Colors.surface, marginLeft: 65 + 5 },
  progressBarContainer: { height: 4, backgroundColor: Colors.surface, borderRadius: 2, width: '80%' },
  progressBar: { height: '100%', backgroundColor: Colors.secondary, borderRadius: 2 },
  deleteButton: { backgroundColor: Colors.danger, justifyContent: 'center', alignItems: 'flex-end', width: 80, borderRadius: 12, paddingRight: 25 },
  emptyContainer: { height: height * 0.7, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontFamily: 'Poppins_600SemiBold', color: Colors.textSecondary, fontSize: 18, marginTop: 15 },
  emptySubtext: { fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, fontSize: 14, marginTop: 5 },
});

export default HistoryView;