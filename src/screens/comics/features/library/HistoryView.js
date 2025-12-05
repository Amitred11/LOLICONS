// screens/comics/components/HistoryView.js

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SectionList, Dimensions, Pressable, Image, TouchableOpacity, ActivityIndicator, Animated as RNAnimated } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Colors } from '@config/Colors';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withDelay } from 'react-native-reanimated';
import { ComicService } from '@api/MockComicService'; 
import { Ionicons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';

const AnimatedSectionList = Animated.createAnimatedComponent(SectionList);
const { height } = Dimensions.get('window');
const PADDING = 15;

const HistoryItem = ({ item, index, onRemove }) => {
  const navigation = useNavigation();
  const swipeableRef = useRef(null); 
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

  const closeSwipeable = () => {
    swipeableRef.current?.close();
  };

  const handleRemove = () => {
    closeSwipeable();
    onRemove(item.id);
  };
  
  const renderRightActions = (progress, dragX) => {
    const trans = dragX.interpolate({
      inputRange: [-80, 0],
      outputRange: [0, 80],
      extrapolate: 'clamp',
    });
    return (
      <TouchableOpacity onPress={handleRemove} style={styles.deleteButton}>
        <RNAnimated.View style={{ transform: [{ translateX: trans }] }}>
          <Ionicons name="trash-outline" size={24} color={Colors.text} />
        </RNAnimated.View>
      </TouchableOpacity>
    );
  };

  return (
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
                <View style={[styles.progressBar, { width: `${(item.progress || 0) * 100}%` }]} />
            </View>
          </View>
        </Pressable>
      </Swipeable>
    </Animated.View>
  );
};

const HistoryView = ({ scrollHandler, headerHeight, searchQuery }) => {
  const [historySections, setHistorySections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Groups an array of history items into sections
  const groupHistoryByDate = (data) => {
    const sections = { Today: [], Yesterday: [], 'Last 7 Days': [], Older: [] };
    const now = new Date();
    
    data.forEach(item => {
      // Ensure lastRead is a Date object (if mocked JSON stored string)
      const dateObj = new Date(item.lastRead);
      const diffTime = now.getTime() - dateObj.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) sections.Today.push(item);
      else if (diffDays === 1) sections.Yesterday.push(item);
      else if (diffDays <= 7) sections['Last 7 Days'].push(item);
      else sections.Older.push(item);
    });

    return Object.keys(sections)
      .map(title => ({ title, data: sections[title] }))
      .filter(section => section.data.length > 0);
  };

  // Fetch History Function
  const loadHistory = async () => {
    // Only show loading indicator on initial load if list is empty
    if (historySections.length === 0) setIsLoading(true);
    try {
        // FIX: The service now supports filtering
        const response = await ComicService.getHistory(searchQuery);
        // FIX: Extract data from the response object
        if (response.success && response.data) {
            setHistorySections(groupHistoryByDate(response.data));
        }
    } catch (error) {
        console.error("Failed to load history", error);
    } finally {
        setIsLoading(false);
    }
  };

  // Fetch on mount and when query changes
  useEffect(() => {
    loadHistory();
  }, [searchQuery]);

  // Also fetch when tab comes into focus (in case history changed elsewhere)
  useFocusEffect(
      React.useCallback(() => {
          loadHistory();
      }, [])
  );
  
  const handleRemoveItem = async (itemId) => {
    // Optimistic Update
    const newSections = historySections.map(section => ({
        ...section,
        data: section.data.filter(item => item.id !== itemId)
    })).filter(section => section.data.length > 0);
    setHistorySections(newSections);

    // Call API
    try {
        await ComicService.removeFromHistory(itemId);
    } catch (error) {
        console.error("Failed to remove history item", error);
        // In a real app, revert the optimistic update here on error
        loadHistory(); 
    }
  };

  if (isLoading && historySections.length === 0) {
      return (
          <View style={[styles.emptyContainer, { paddingTop: headerHeight }]}>
              <ActivityIndicator size="large" color={Colors.secondary} />
          </View>
      );
  }

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
      ListHeaderComponent={() => <View style={{ height: 30 }}/>}
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