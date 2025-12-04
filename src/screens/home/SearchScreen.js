import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, StatusBar, Image, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Colors } from '@config/Colors';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';

// API
import { HomeService } from '@api/MockHomeService';

// --- Static UI Recommendations ---
const popularSearches = ["Action", "Solo Leveling", "Fantasy", "Isekai", "Villainess"];
const topGenres = [
    { name: "Fantasy", icon: "sparkles-outline" },
    { name: "Sci-Fi", icon: "planet-outline" },
    { name: "Romance", icon: "heart-outline" },
    { name: "Horror", icon: "skull-outline" },
];

// --- Sub-components ---

const SearchResultItem = ({ item, onPress }) => {
    return (
        <TouchableOpacity style={styles.resultItem} onPress={onPress}>
            <Image source={item.cover} style={styles.resultImage} />
            <View style={styles.resultTextContainer}>
                <Text style={styles.resultTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.resultAuthor}>{item.author}</Text>
                <View style={styles.resultMeta}>
                    <Ionicons name="star" size={12} color={Colors.primary} />
                    <Text style={styles.resultRating}>{item.rating}</Text>
                    <Text style={styles.resultType}>• {item.tags[0]}</Text>
                </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
    );
};

const Recommendations = ({ onTagPress }) => {
    const opacity = useSharedValue(0);
    useEffect(() => { opacity.value = withTiming(1, { duration: 400 }); }, []);
    const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

    return (
        <Animated.ScrollView style={[styles.recommendationContainer, animatedStyle]}>
            <Text style={styles.recommendationTitle}>Popular Searches</Text>
            <View style={styles.tagContainer}>
                {popularSearches.map(tag => (
                    <TouchableOpacity key={tag} style={styles.tag} onPress={() => onTagPress(tag)}>
                        <Text style={styles.tagText}>{tag}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <Text style={styles.recommendationTitle}>Top Genres</Text>
            <View style={styles.genreContainer}>
                {topGenres.map(genre => (
                    <TouchableOpacity key={genre.name} style={styles.genreTag} onPress={() => onTagPress(genre.name)}>
                        <Ionicons name={genre.icon} size={22} color={Colors.secondary} />
                        <Text style={styles.genreText}>{genre.name}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </Animated.ScrollView>
    );
};

// --- Main Search Screen ---
const SearchScreen = () => {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState([]);
    const isTyping = searchQuery.trim().length > 0;

    const clearButtonOpacity = useSharedValue(0);

    useEffect(() => {
        const fetchResults = async () => {
            if (isTyping) {
                clearButtonOpacity.value = withTiming(1);
                const response = await HomeService.searchContent(searchQuery);
                if (response.success) {
                    setResults(response.data);
                }
            } else {
                clearButtonOpacity.value = withTiming(0);
                setResults([]);
            }
        };
        // Debounce simple impl
        const timer = setTimeout(fetchResults, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const animatedClearButtonStyle = useAnimatedStyle(() => ({
        opacity: clearButtonOpacity.value,
        transform: [{ scale: clearButtonOpacity.value }]
    }));

    return (
        <BlurView intensity={100} tint="dark" style={styles.container}>
            <StatusBar barStyle="light-content" />
            <View style={[styles.header, { paddingTop: insets.top }]}>
                <View style={styles.searchBarContainer}>
                    <Ionicons name="search" size={20} color={Colors.textSecondary} style={styles.searchIcon} />
                    <TextInput
                        style={styles.textInput}
                        placeholder="Search comics, creators..."
                        placeholderTextColor={Colors.textSecondary}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        autoFocus={true}
                        returnKeyType="search"
                    />
                    <Animated.View style={animatedClearButtonStyle}>
                        <TouchableOpacity style={styles.clearButton} onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={20} color={Colors.textSecondary} />
                        </TouchableOpacity>
                    </Animated.View>
                </View>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.cancelButtonContainer}>
                    <Text style={styles.cancelButton}>Cancel</Text>
                </TouchableOpacity>
            </View>

            {isTyping ? (
                <FlatList
                    data={results}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <SearchResultItem 
                            item={item} 
                            onPress={() => navigation.navigate('ComicDetail', { comicId: item.id })} 
                        />
                    )}
                    contentContainerStyle={{ paddingTop: 10, paddingBottom: 50 }}
                    ListEmptyComponent={() => (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="sad-outline" size={60} color={Colors.textSecondary} />
                            <Text style={styles.emptyText}>No results found for "{searchQuery}"</Text>
                        </View>
                    )}
                />
            ) : (
                <Recommendations onTagPress={setSearchQuery} />
            )}
        </BlurView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingBottom: 10, backgroundColor: 'rgba(0,0,0,0.3)' },
    searchBarContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: 12, height: 44 },
    searchIcon: { marginLeft: 12 },
    textInput: { flex: 1, color: Colors.text, fontSize: 14, paddingHorizontal: 10, fontFamily: 'Poppins_400Regular' },
    clearButton: { padding: 8 },
    cancelButtonContainer: { marginLeft: 10, padding: 5 },
    cancelButton: { color: Colors.secondary, fontSize: 16, fontFamily: 'Poppins_500Medium' },
    
    // Result Item
    resultItem: { flexDirection: 'row', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
    resultImage: { width: 50, height: 70, borderRadius: 6, backgroundColor: Colors.surface },
    resultTextContainer: { flex: 1, marginLeft: 15, justifyContent: 'center' },
    resultTitle: { color: Colors.text, fontFamily: 'Poppins_600SemiBold', fontSize: 14 },
    resultAuthor: { color: Colors.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 12 },
    resultMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
    resultRating: { color: Colors.text, fontSize: 12, marginLeft: 4, fontFamily: 'Poppins_600SemiBold' },
    resultType: { color: Colors.textSecondary, fontSize: 12, marginLeft: 4, fontFamily: 'Poppins_400Regular' },

    recommendationContainer: { flex: 1, padding: 20 },
    recommendationTitle: { fontFamily: 'Poppins_600SemiBold', color: Colors.text, fontSize: 18, marginBottom: 15 },
    tagContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 30 },
    tag: { backgroundColor: Colors.surface, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
    tagText: { color: Colors.textSecondary, fontFamily: 'Poppins_500Medium' },
    genreContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 15 },
    genreTag: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, gap: 10 },
    genreText: { color: Colors.text, fontSize: 15, fontFamily: 'Poppins_500Medium' },
    
    emptyContainer: { flex: 1, marginTop: 100, alignItems: 'center', justifyContent: 'center' },
    emptyText: { color: Colors.textSecondary, fontSize: 16, marginTop: 15, textAlign: 'center', paddingHorizontal: 40, fontFamily: 'Poppins_400Regular' },
});

export default SearchScreen;