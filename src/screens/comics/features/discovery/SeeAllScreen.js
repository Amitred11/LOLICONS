import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Colors } from '@config/Colors';
import Animated from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Imported Components
import { ComicListItem, ComicGridItem } from '../../components/ComicCards';

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);
const { width } = Dimensions.get('window');
const PADDING = 10;
const GAP = 15;
const GRID_NUM_COLUMNS = 3;
const GRID_CARD_WIDTH = (width - (PADDING * 2) - (GAP * (GRID_NUM_COLUMNS - 1))) / GRID_NUM_COLUMNS;

const SeeAllScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const { title, data } = route.params;

  const [viewMode, setViewMode] = useState('grid');
  const [listData, setListData] = useState([]);

  useEffect(() => {
    let preparedData = Array.isArray(data) ? [...data] : [];
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
        <View style={[styles.header, { height: 130}]}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
                <Ionicons name="arrow-back-outline" size={28} color={Colors.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{title}</Text>
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
            key={viewMode} 
            data={listData}
            numColumns={viewMode === 'grid' ? GRID_NUM_COLUMNS : 1}
            renderItem={({ item, index }) => 
                viewMode === 'grid' 
                    ? <ComicGridItem item={item} index={index} style={{ width: GRID_CARD_WIDTH }} />
                    : <ComicListItem item={item} index={index} />
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { position: 'absolute', top: -5, left: 0, right: 0, zIndex: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: PADDING, backgroundColor: Colors.background + 'D9', borderBottomWidth: StyleSheet.hairlineWidth, borderColor: Colors.surface },
  headerButton: { paddingRight: 10 },
  headerTitle: { fontFamily: 'Poppins_600SemiBold', color: Colors.text, fontSize: 18, flex: 1, textAlign: 'center' },
  viewModeContainer: { flexDirection: 'row' },
  listContainer: { paddingBottom: 120 },
  columnWrapper: { justifyContent: 'space-between', paddingHorizontal: PADDING },
});

export default SeeAllScreen;