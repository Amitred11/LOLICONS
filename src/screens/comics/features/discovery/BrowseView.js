import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions, ActivityIndicator } from 'react-native';
import Animated from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@config/Colors';
import { ComicService } from '@api/MockComicService'; 

// Imported Components
import { ComicListItem, ComicGridItem } from '../../components/ComicCards';
import { BrowseHeader } from '../../components/BrowseWidgets';

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);
const { width, height } = Dimensions.get('window');

const PADDING = 15;
const GAP = 15;
const GRID_NUM_COLUMNS = 3;
const GRID_CARD_WIDTH = (width - (PADDING * 2) - (GAP * (GRID_NUM_COLUMNS - 1))) / GRID_NUM_COLUMNS;

const BrowseView = ({ scrollHandler, headerHeight, searchQuery, filters }) => {
  const [filteredData, setFilteredData] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    const loadComics = async () => {
        setIsLoading(true);
        try {
            const response = await ComicService.getComics({ searchQuery, filters });
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
            ? <ComicGridItem item={item} index={index} style={{width: GRID_CARD_WIDTH}} />
            : <ComicListItem item={item} index={index} />
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
  columnWrapper: { justifyContent: 'space-between', paddingHorizontal: PADDING },
  emptyContainer: { height: height / 2, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontFamily: 'Poppins_600SemiBold', color: Colors.textSecondary, fontSize: 18, marginTop: 15 },
});

export default BrowseView;