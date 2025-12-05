// screens/comics/components/HistoryView.js

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SectionList, Dimensions, Pressable, Image, TouchableOpacity, ActivityIndicator, Animated as RNAnimated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '@config/Colors';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withDelay } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';
// CHANGE: Context
import { useComic } from '@context/ComicContext';

const AnimatedSectionList = Animated.createAnimatedComponent(SectionList);
const { height } = Dimensions.get('window');
const PADDING = 15;

const HistoryItem = ({ item, index, onRemove }) => {
  // ... (Same rendering logic as before) ...
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
  // CHANGE: Get state and actions from Context
  const { history, isLoadingUserData, removeFromHistory } = useComic();
  const [historySections, setHistorySections] = useState([]);

  // Helper to group logic
  const groupHistoryByDate = (data) => {
    const sections = { Today: [], Yesterday: [], 'Last 7 Days': [], Older: [] };
    const now = new Date();
    
    data.forEach(item => {
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

  // React to changes in Context History or Search Query
  useEffect(() => {
    let filteredHistory = [...history];

    if (searchQuery) {
        const lowerQ = searchQuery.toLowerCase();
        filteredHistory = filteredHistory.filter(h => h.title.toLowerCase().includes(lowerQ));
    }
    // Context history should already be sorted by Service, but safe to sort again
    filteredHistory.sort((a, b) => new Date(b.lastRead) - new Date(a.lastRead));

    setHistorySections(groupHistoryByDate(filteredHistory));
  }, [history, searchQuery]);
  
  const handleRemoveItem = async (itemId) => {
    // Context handles removal
    await removeFromHistory(itemId);
  };

  if (isLoadingUserData && history.length === 0) {
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