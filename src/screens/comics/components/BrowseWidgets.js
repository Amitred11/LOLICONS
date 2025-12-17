import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@config/Colors';
import { ComicService } from '@api/MockComicService';
import { ComicGridItem } from './ComicCards';

const { width } = Dimensions.get('window');
const PADDING = 15;
const GAP = 15;
const FEATURED_CARD_WIDTH = width * 0.7;
const FEATURED_CARD_ASPECT_RATIO = 16 / 9;

export const BrowseHeader = ({ setViewMode, viewMode }) => {
    const [popularComics, setPopularComics] = useState([]);
    const navigation = useNavigation();

    useEffect(() => {
        const loadFeatured = async () => {
            try {
                const response = await ComicService.getFeaturedComics();
                if (response.success && Array.isArray(response.data)) {
                    setPopularComics(response.data);
                } else if (Array.isArray(response)) {
                    setPopularComics(response);
                }
            } catch (err) {
                console.error(err);
            }
        };
        loadFeatured();
    }, []);

    const handleSeeAll = () => {
        if (!Array.isArray(popularComics)) return;
        const serializableData = popularComics.map(comic => {
            const newComic = { ...comic };
            if (newComic.lastRead instanceof Date) {
                newComic.lastRead = newComic.lastRead.toISOString();
            }
            return newComic;
        });
        navigation.navigate('SeeAll', { 
            title: 'Popular This Week', 
            data: serializableData
        });
    };

    return (
        <>
            <View style={styles.featuredContainer}>
                <View style={styles.sectionHeaderContainer}>
                    <Text style={styles.sectionHeader}>Popular This Week</Text>
                    <TouchableOpacity onPress={handleSeeAll}>
                        <Text style={styles.seeAllText}>See All</Text>
                    </TouchableOpacity>
                </View>
                <FlatList
                    data={popularComics}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={item => item.id}
                    renderItem={({ item, index }) => 
                        <ComicGridItem 
                            item={item} 
                            index={index} 
                            style={{ width: FEATURED_CARD_WIDTH, marginRight: GAP }}
                            imageStyle={{ aspectRatio: FEATURED_CARD_ASPECT_RATIO }}
                        />
                    }
                    contentContainerStyle={{ paddingHorizontal: PADDING }}
                />
            </View>

            <View style={styles.listHeaderContainer}>
                <Text style={styles.sectionHeader}>All Comics</Text>
                <View style={styles.viewModeContainer}>
                    <TouchableOpacity onPress={() => setViewMode('grid')}>
                        <Ionicons name="grid" size={22} color={viewMode === 'grid' ? Colors.secondary : Colors.textSecondary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setViewMode('list')} style={{ marginLeft: 15 }}>
                        <Ionicons name="list" size={26} color={viewMode === 'list' ? Colors.secondary : Colors.textSecondary} />
                    </TouchableOpacity>
                </View>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
  featuredContainer: { paddingTop: 45 },
  sectionHeaderContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: PADDING, marginBottom: 10 },
  sectionHeader: { fontFamily: 'Poppins_700Bold', color: Colors.text, fontSize: 22 },
  seeAllText: { fontFamily: 'Poppins_500Medium', color: Colors.secondary, fontSize: 14 },
  listHeaderContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 20, paddingHorizontal: PADDING },
  viewModeContainer: { flexDirection: 'row' },
});