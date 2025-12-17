import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SectionList, Dimensions, ActivityIndicator } from 'react-native';
import { Colors } from '@config/Colors';
import Animated from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useComic } from '@context/main/ComicContext';
// Import extracted component
import { HistoryItem } from '../../components/ListComponents';

const AnimatedSectionList = Animated.createAnimatedComponent(SectionList);
const { height } = Dimensions.get('window');
const PADDING = 15;

const HistoryView = ({ scrollHandler, headerHeight, searchQuery }) => {
  const { history, isLoadingUserData, removeFromHistory } = useComic();
  const [historySections, setHistorySections] = useState([]);

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
    return Object.keys(sections).map(title => ({ title, data: sections[title] })).filter(section => section.data.length > 0);
  };

  useEffect(() => {
    let filteredHistory = [...history];
    if (searchQuery) filteredHistory = filteredHistory.filter(h => h.title.toLowerCase().includes(searchQuery.toLowerCase()));
    filteredHistory.sort((a, b) => new Date(b.lastRead) - new Date(a.lastRead));
    setHistorySections(groupHistoryByDate(filteredHistory));
  }, [history, searchQuery]);
  
  const handleRemoveItem = async (itemId) => { await removeFromHistory(itemId); };

  if (isLoadingUserData && history.length === 0) return <View style={[styles.emptyContainer, { paddingTop: headerHeight }]}><ActivityIndicator size="large" color={Colors.secondary} /></View>;

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
      renderSectionHeader={({ section: { title } }) => <Text style={styles.sectionHeader}>{title}</Text>}
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
  separator: { height: StyleSheet.hairlineWidth, backgroundColor: Colors.surface, marginLeft: 65 + 5 },
  emptyContainer: { height: height * 0.7, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontFamily: 'Poppins_600SemiBold', color: Colors.textSecondary, fontSize: 18, marginTop: 15 },
  emptySubtext: { fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, fontSize: 14, marginTop: 5 },
});

export default HistoryView;