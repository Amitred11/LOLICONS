// screens/home/SearchScreen.js

// Import essential modules from React, React Native, and third-party libraries.
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, StatusBar, Image, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { comicsData } from '../../constants/mockData';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay } from 'react-native-reanimated';

// --- Mock Data for Recommendations ---
// This data is shown when the search bar is empty.
const popularSearches = ["Action", "Solo Leveling", "Fantasy", "Isekai", "Villainess"];
const topGenres = [
    { name: "Fantasy", icon: "sparkles-outline" },
    { name: "Sci-Fi", icon: "planet-outline" },
    { name: "Romance", icon: "heart-outline" },
    { name: "Horror", icon: "skull-outline" },
];

// --- Sub-components ---

/**
 * A component to render a single item in the search results list.
 * It animates in with a staggered fade and slide effect.
 * @param {object} props - The component props.
 * @param {object} props.item - The comic data for the list item.
 * @param {number} props.index - The index of the item, used for staggering animations.
 * @param {object} props.navigation - The navigation object for handling presses.
 */
const SearchResultItem = ({ item, index, navigation }) => {
    // Shared values for the entry animation.
    const opacity = useSharedValue(0);
    const translateY = useSharedValue(20);

    // Trigger the animation when the component mounts.
    useEffect(() => {
        opacity.value = withDelay(index * 50, withTiming(1));
        translateY.value = withDelay(index * 50, withTiming(0));
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ translateY: translateY.value }],
    }));

    return (
        <Animated.View style={animatedStyle}>
            <TouchableOpacity 
                style={styles.resultItem} 
                onPress={() => navigation.navigate('ComicDetail', { comicId: item.id })}
            >
                <Image source={item.localSource} style={styles.resultImage} />
                <View style={styles.resultTextContainer}>
                    <Text style={styles.resultTitle} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.resultAuthor}>{item.author}</Text>
                </View>
                <Ionicons name="chevron-forward" size={22} color={Colors.textSecondary} />
            </TouchableOpacity>
        </Animated.View>
    );
};

/**
 * A component that displays search recommendations (popular searches, top genres).
 * This is shown when the search input is empty.
 * @param {object} props - The component props.
 * @param {function} props.onTagPress - A function to call when a tag is pressed, which populates the search bar.
 */
const Recommendations = ({ onTagPress }) => {
    // Animate the entire recommendations section fading in.
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
/**
 * A modal screen for searching comics and creators. It displays recommendations
 * when empty and a list of results as the user types.
 */
const SearchScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState([]);
    const isTyping = searchQuery.trim().length > 0;

    // A shared value to control the animation of the "clear text" button.
    const clearButtonOpacity = useSharedValue(0);

    // This effect runs whenever the search query changes to filter the data.
    useEffect(() => {
        if (isTyping) {
            // Animate the clear button into view.
            clearButtonOpacity.value = withTiming(1);
            // Filter the mock data based on the query.
            const filteredData = comicsData.filter(comic => 
                comic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                comic.author.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setResults(filteredData);
        } else {
            // Animate the clear button out and clear the results.
            clearButtonOpacity.value = withTiming(0);
            setResults([]);
        }
    }, [searchQuery]);

    // Animated style for the clear button's fade and scale effect.
    const animatedClearButtonStyle = useAnimatedStyle(() => ({
        opacity: clearButtonOpacity.value,
        transform: [{ scale: clearButtonOpacity.value }]
    }));

    return (
        <BlurView intensity={100} tint="dark" style={styles.container}>
            <StatusBar barStyle="light-content" />
            {/* The header containing the search bar and cancel button */}
            <View style={[styles.header, { paddingTop: insets.top }]}>
                <View style={styles.searchBarContainer}>
                    <Ionicons name="search" size={20} color={Colors.textSecondary} style={styles.searchIcon} />
                    <TextInput
                        style={styles.textInput}
                        placeholder="Search comics, creators..."
                        placeholderTextColor={Colors.textSecondary}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        autoFocus={true} // Automatically focus the input when the screen loads.
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

            {/* Conditionally render the results list or the recommendations view. */}
            {isTyping ? (
                <FlatList
                    data={results}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item, index }) => <SearchResultItem item={item} index={index} navigation={navigation} />}
                    contentContainerStyle={{ paddingTop: 10 }}
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

// --- Stylesheet ---
const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingBottom: 10,
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    searchBarContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        borderRadius: 12,
        height: 44,
    },
    searchIcon: {
        marginLeft: 12,
    },
    textInput: {
        flex: 1,
        color: Colors.text,
        fontSize: 12,
        paddingHorizontal: 10,
        fontFamily: 'Poppins_400Regular',
    },
    clearButton: {
        padding: 8,
    },
    cancelButtonContainer: {
        marginLeft: 10,
        padding: 5,
    },
    cancelButton: {
        color: Colors.secondary,
        fontSize: 16,
        fontFamily: 'Poppins_500Medium',
    },
    recommendationContainer: {
        flex: 1,
        padding: 20,
    },
    recommendationTitle: {
        fontFamily: 'Poppins_600SemiBold',
        color: Colors.text,
        fontSize: 18,
        marginBottom: 15,
    },
    tagContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 30,
    },
    tag: {
        backgroundColor: Colors.surface,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    tagText: {
        color: Colors.textSecondary,
        fontFamily: 'Poppins_500Medium',
    },
    genreContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 15,
    },
    genreTag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 12,
        gap: 10,
    },
    genreText: {
        color: Colors.text,
        fontSize: 15,
        fontFamily: 'Poppins_500Medium',
    },
    emptyContainer: {
        flex: 1,
        marginTop: 100,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        color: Colors.textSecondary,
        fontSize: 16,
        marginTop: 15,
        textAlign: 'center',
        paddingHorizontal: 40,
        fontFamily: 'Poppins_400Regular',
    },
    resultItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    resultImage: {
        width: 50,
        height: 75,
        borderRadius: 8,
    },
    resultTextContainer: {
        flex: 1,
        marginLeft: 15,
    },
    resultTitle: {
        color: Colors.text,
        fontSize: 16,
        fontFamily: 'Poppins_600SemiBold',
    },
    resultAuthor: {
        color: Colors.textSecondary,
        fontSize: 14,
        fontFamily: 'Poppins_400Regular',
        marginTop: 2,
    },
});

export default SearchScreen;