import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SectionList, Dimensions, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '@config/Colors';
import Animated from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useComic } from '@context/main/ComicContext';
// Import extracted component
import { LibraryCard } from '../../components/ListComponents';

const AnimatedSectionList = Animated.createAnimatedComponent(SectionList);
const { width, height } = Dimensions.get('window');
const NUM_COLUMNS = 3;
const PADDING = 15;
const GAP = 15;
const CARD_WIDTH = (width - (PADDING * 2) - (GAP * (NUM_COLUMNS - 1))) / NUM_COLUMNS;

const LibraryView = ({ scrollHandler, headerHeight, searchQuery, filters }) => {
    const { libraryComics, isLoadingUserData } = useComic(); 
    const [librarySections, setLibrarySections] = useState([]);
    const navigation = useNavigation();

    useEffect(() => {
        let filtered = [...libraryComics];
        if (searchQuery) filtered = filtered.filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase()));
        if (filters?.status && filters.status !== 'All') filtered = filtered.filter(c => c.status === filters.status);

        const addPlaceholdersAndChunk = (data) => {
            const dataWithPlaceholders = [...data];
            const itemsToAdd = NUM_COLUMNS - (data.length % NUM_COLUMNS);
            if (itemsToAdd > 0 && itemsToAdd < NUM_COLUMNS) {
                for (let i = 0; i < itemsToAdd; i++) dataWithPlaceholders.push({ id: `placeholder-${i}`, empty: true }); 
            }
            const rows = [];
            for (let i = 0; i < dataWithPlaceholders.length; i += NUM_COLUMNS) rows.push(dataWithPlaceholders.slice(i, i + NUM_COLUMNS)); 
            return rows;
        };
        setLibrarySections(filtered.length > 0 ? [{ title: 'My Library', data: addPlaceholdersAndChunk(filtered) }] : []);
    }, [searchQuery, filters, libraryComics]); 

    if (isLoadingUserData && librarySections.length === 0) return <View style={[styles.emptyContainer, { paddingTop: headerHeight }]}><ActivityIndicator size="large" color={Colors.secondary} /></View>;

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
            renderSectionHeader={({ section: { title } }) => <Text style={styles.sectionHeader}>{title}</Text>}
            renderItem={({ item: row, index: rowIndex }) => (
                <View style={styles.row}>
                    {row.map((item, itemIndex) => {
                        const globalIndex = rowIndex * NUM_COLUMNS + itemIndex; 
                        return <LibraryCard key={item.id} item={item} index={globalIndex} cardStyle={{ width: CARD_WIDTH }} />;
                    })}
                </View>
            )}
            ListEmptyComponent={
                <View style={[styles.emptyContainer, { paddingTop: headerHeight }]}>
                    <Ionicons name="library-outline" size={64} color={Colors.textSecondary} />
                    <Text style={styles.emptyText}>Your library is empty</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Browse')}><Text style={styles.emptySubtext}>Add comics from the Browse tab!</Text></TouchableOpacity>
                </View>
            }
        />
    );
};

const styles = StyleSheet.create({
  listContainer: { paddingHorizontal: PADDING, paddingBottom: 120 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  sectionHeader: { fontFamily: 'Poppins_700Bold', color: Colors.text, fontSize: 22, marginBottom: 15, marginTop: 10 },
  emptyContainer: { height: height * 0.7, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontFamily: 'Poppins_600SemiBold', color: Colors.textSecondary, fontSize: 18, marginTop: 15 },
  emptySubtext: { fontFamily: 'Poppins_500Medium', color: Colors.secondary, fontSize: 14, marginTop: 8, textDecorationLine: 'underline', padding: 5 },
});

export default LibraryView;