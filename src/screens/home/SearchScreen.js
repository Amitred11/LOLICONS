import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, StatusBar, Keyboard } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Colors } from '@config/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useHome } from '@context/main/HomeContext';

// Import Extracted Components
import { SuggestionItem, SearchResultCard, RecommendationsView } from './components/SearchComponents';

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
        }, 200);
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
                            if (viewMode === 'results') setViewMode('suggesting');
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
                                onIconPress={() => setSearchQuery(item.text)}
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
    emptyContainer: { flex: 1, marginTop: 100, alignItems: 'center' },
    emptyText: { color: Colors.textSecondary, marginTop: 15, fontFamily: 'Poppins_400Regular' },
});

export default SearchScreen;