import React, { useState, useEffect, useCallback, memo } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, StatusBar, Image, Keyboard, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Colors } from '@config/Colors';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, FadeInDown, Layout } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { useHome } from '@context/main/HomeContext';

// --- SUB COMPONENTS ---

// 1. Suggestion Row (Autocomplete)
const SuggestionItem = memo(({ item, onPress, onIconPress }) => (
    <TouchableOpacity style={styles.suggestionItem} onPress={onPress}>
        <View style={styles.suggestionIconWrapper}>
            <Ionicons 
                name={item.type === 'author' ? 'person-outline' : item.type === 'genre' ? 'pricetag-outline' : 'search-outline'} 
                size={18} 
                color={Colors.textSecondary} 
            />
        </View>
        <Text style={styles.suggestionText}>{item.text}</Text>
        <TouchableOpacity onPress={onIconPress} style={{ padding: 5 }}>
             <Ionicons name="arrow-forward-circle-outline" size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
    </TouchableOpacity>
));

// 2. Full Search Result Card
const SearchResultCard = memo(({ item, onPress }) => (
    <Animated.View entering={FadeInDown} layout={Layout}>
        <TouchableOpacity style={styles.resultItem} onPress={onPress}>
            <Image source={item.cover} style={styles.resultImage} />
            <View style={styles.resultTextContainer}>
                <Text style={styles.resultTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.resultAuthor}>{item.author}</Text>
                <View style={styles.resultMeta}>
                    <Ionicons name="star" size={12} color={Colors.primary} />
                    <Text style={styles.resultRating}>{item.rating}</Text>
                    <Text style={styles.resultType}>• {item.tags[0]}</Text>
                    <Text style={styles.resultType}>• {item.views} views</Text>
                </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
    </Animated.View>
));

// 3. History & Trending Section
const RecommendationsView = memo(({ recentSearches, trendingKeywords, onSelect, onClearHistory }) => {
    if (recentSearches.length === 0 && trendingKeywords.length === 0) return null;

    return (
        <ScrollView style={styles.recommendationContainer} keyboardShouldPersistTaps="handled">
            {recentSearches.length > 0 && (
                <View style={styles.sectionContainer}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Recent Searches</Text>
                        <TouchableOpacity onPress={onClearHistory}>
                            <Text style={styles.clearText}>Clear</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.tagContainer}>
                        {recentSearches.map((term, index) => (
                            <TouchableOpacity key={`hist-${index}`} style={styles.historyTag} onPress={() => onSelect(term)}>
                                <Ionicons name="time-outline" size={14} color={Colors.textSecondary} style={{ marginRight: 6 }}/>
                                <Text style={styles.tagText}>{term}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            )}

            {trendingKeywords.length > 0 && (
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Trending Now</Text>
                    <View style={styles.tagContainer}>
                        {trendingKeywords.map((item) => (
                            <TouchableOpacity key={item.id} style={styles.trendingTag} onPress={() => onSelect(item.text)}>
                                <Ionicons name="flame" size={14} color={Colors.secondary} style={{ marginRight: 6 }}/>
                                <Text style={styles.tagText}>{item.text}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            )}
        </ScrollView>
    );
});

// --- MAIN SCREEN ---

const SearchScreen = () => {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    
    // Context
    const { searchComics, getSuggestions, recentSearches, trendingKeywords, addToHistory, clearHistory } = useHome();
    
    // State
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState('idle'); // 'idle' | 'suggesting' | 'results'
    const [suggestions, setSuggestions] = useState([]);
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Debounce for Autocomplete
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (searchQuery.trim().length > 1 && viewMode !== 'results') {
                setViewMode('suggesting');
                const response = await getSuggestions(searchQuery);
                if (response.success) setSuggestions(response.data);
            } else if (searchQuery.trim().length === 0) {
                setViewMode('idle');
                setSuggestions([]);
            }
        }, 200); // Fast debounce for typing
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Perform Full Search
    const handleSearchSubmit = async (queryOverride) => {
        const term = queryOverride || searchQuery;
        if (!term.trim()) return;

        Keyboard.dismiss();
        setSearchQuery(term);
        setIsLoading(true);
        setViewMode('results');
        
        // Save to history
        addToHistory(term);

        const response = await searchComics(term);
        if (response.success) setResults(response.data);
        setIsLoading(false);
    };

    const handleClear = () => {
        setSearchQuery('');
        setViewMode('idle');
        setResults([]);
        setSuggestions([]);
    };

    return (
        <BlurView intensity={100} tint="dark" style={styles.container}>
            <StatusBar barStyle="light-content" />
            
            {/* Header / Search Bar */}
            <View style={[styles.header, { paddingTop: insets.top }]}>
                <View style={styles.searchBarContainer}>
                    <Ionicons name="search" size={20} color={Colors.textSecondary} style={{ marginLeft: 12 }} />
                    <TextInput
                        style={styles.textInput}
                        placeholder="Search comics, authors, genres..."
                        placeholderTextColor={Colors.textSecondary}
                        value={searchQuery}
                        onChangeText={(t) => {
                            setSearchQuery(t);
                            if (viewMode === 'results') setViewMode('suggesting'); // Reset if typing after search
                        }}
                        autoFocus
                        returnKeyType="search"
                        onSubmitEditing={() => handleSearchSubmit()}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={handleClear} style={{ padding: 8 }}>
                            <Ionicons name="close-circle" size={20} color={Colors.textSecondary} />
                        </TouchableOpacity>
                    )}
                </View>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 10 }}>
                    <Text style={styles.cancelButton}>Cancel</Text>
                </TouchableOpacity>
            </View>

            {/* Content Area Based on Mode */}
            <View style={{ flex: 1 }}>
                
                {/* 1. IDLE: History & Trends */}
                {viewMode === 'idle' && (
                    <RecommendationsView 
                        recentSearches={recentSearches}
                        trendingKeywords={trendingKeywords}
                        onSelect={handleSearchSubmit}
                        onClearHistory={clearHistory}
                    />
                )}

                {/* 2. SUGGESTING: Autocomplete List */}
                {viewMode === 'suggesting' && (
                    <FlatList
                        data={suggestions}
                        keyExtractor={(item, index) => item.id || `sug-${index}`}
                        keyboardShouldPersistTaps="handled"
                        renderItem={({ item }) => (
                            <SuggestionItem 
                                item={item} 
                                onPress={() => handleSearchSubmit(item.text)}
                                onIconPress={() => setSearchQuery(item.text)} // Just fill text, don't submit
                            />
                        )}
                    />
                )}

                {/* 3. RESULTS: Full Cards */}
                {viewMode === 'results' && (
                    <FlatList
                        data={results}
                        keyExtractor={item => item.id}
                        contentContainerStyle={{ paddingTop: 10, paddingBottom: 50 }}
                        renderItem={({ item }) => (
                            <SearchResultCard 
                                item={item} 
                                onPress={() => navigation.navigate('ComicDetail', { comicId: item.id })} 
                            />
                        )}
                        ListEmptyComponent={!isLoading && (
                            <View style={styles.emptyContainer}>
                                <Ionicons name="sad-outline" size={60} color={Colors.textSecondary} />
                                <Text style={styles.emptyText}>No matches for "{searchQuery}"</Text>
                            </View>
                        )}
                    />
                )}
            </View>
        </BlurView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingBottom: 10, backgroundColor: 'rgba(0,0,0,0.3)' },
    searchBarContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: 12, height: 44 },
    textInput: { flex: 1, color: Colors.text, fontSize: 12, paddingHorizontal: 10, fontFamily: 'Poppins_400Regular' },
    cancelButton: { color: Colors.secondary, fontSize: 16, fontFamily: 'Poppins_500Medium' },
    
    // Suggestions
    suggestionItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
    suggestionIconWrapper: { width: 30, alignItems: 'center' },
    suggestionText: { flex: 1, color: Colors.text, fontFamily: 'Poppins_400Regular', fontSize: 15 },

    // Recommendations (Idle)
    recommendationContainer: { flex: 1, padding: 20 },
    sectionContainer: { marginBottom: 30 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    sectionTitle: { fontFamily: 'Poppins_600SemiBold', color: Colors.text, fontSize: 18, marginBottom: 10 },
    clearText: { color: Colors.textSecondary, fontFamily: 'Poppins_500Medium', fontSize: 12 },
    tagContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    
    historyTag: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    trendingTag: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, borderLeftWidth: 3, borderLeftColor: Colors.secondary },
    tagText: { color: Colors.textSecondary, fontFamily: 'Poppins_500Medium', fontSize: 13 },

    // Results
    resultItem: { flexDirection: 'row', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
    resultImage: { width: 50, height: 70, borderRadius: 6, backgroundColor: Colors.surface },
    resultTextContainer: { flex: 1, marginLeft: 15, justifyContent: 'center' },
    resultTitle: { color: Colors.text, fontFamily: 'Poppins_600SemiBold', fontSize: 14 },
    resultAuthor: { color: Colors.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 12 },
    resultMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
    resultRating: { color: Colors.text, fontSize: 12, marginLeft: 4, fontFamily: 'Poppins_600SemiBold' },
    resultType: { color: Colors.textSecondary, fontSize: 12, marginLeft: 4, fontFamily: 'Poppins_400Regular' },
    
    emptyContainer: { flex: 1, marginTop: 100, alignItems: 'center' },
    emptyText: { color: Colors.textSecondary, marginTop: 15, fontFamily: 'Poppins_400Regular' },
});

export default SearchScreen;