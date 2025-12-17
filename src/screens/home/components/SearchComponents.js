import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';
import { Colors } from '@config/Colors';

// --- 1. Suggestion Row (Autocomplete) ---
export const SuggestionItem = memo(({ item, onPress, onIconPress }) => (
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

// --- 2. Full Search Result Card ---
export const SearchResultCard = memo(({ item, onPress }) => (
    <Animated.View entering={FadeInDown} layout={Layout}>
        <TouchableOpacity style={styles.resultItem} onPress={onPress}>
            <Image source={item.cover} style={styles.resultImage} />
            <View style={styles.resultTextContainer}>
                <Text style={styles.resultTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.resultAuthor}>{item.author}</Text>
                <View style={styles.resultMeta}>
                    <Ionicons name="star" size={12} color={Colors.primary} />
                    <Text style={styles.resultRating}>{item.rating}</Text>
                    <Text style={styles.resultType}>• {item.tags?.[0] || 'Comic'}</Text>
                    <Text style={styles.resultType}>• {item.views} views</Text>
                </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
    </Animated.View>
));

// --- 3. History & Trending Section ---
export const RecommendationsView = memo(({ recentSearches, trendingKeywords, onSelect, onClearHistory }) => {
    if ((!recentSearches || recentSearches.length === 0) && (!trendingKeywords || trendingKeywords.length === 0)) return null;

    return (
        <ScrollView style={styles.recommendationContainer} keyboardShouldPersistTaps="handled">
            {recentSearches && recentSearches.length > 0 && (
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

            {trendingKeywords && trendingKeywords.length > 0 && (
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

const styles = StyleSheet.create({
    // Suggestion Styles
    suggestionItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
    suggestionIconWrapper: { width: 30, alignItems: 'center' },
    suggestionText: { flex: 1, color: Colors.text, fontFamily: 'Poppins_400Regular', fontSize: 15 },

    // Result Card Styles
    resultItem: { flexDirection: 'row', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
    resultImage: { width: 50, height: 70, borderRadius: 6, backgroundColor: Colors.surface },
    resultTextContainer: { flex: 1, marginLeft: 15, justifyContent: 'center' },
    resultTitle: { color: Colors.text, fontFamily: 'Poppins_600SemiBold', fontSize: 14 },
    resultAuthor: { color: Colors.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 12 },
    resultMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
    resultRating: { color: Colors.text, fontSize: 12, marginLeft: 4, fontFamily: 'Poppins_600SemiBold' },
    resultType: { color: Colors.textSecondary, fontSize: 12, marginLeft: 4, fontFamily: 'Poppins_400Regular' },

    // Recommendations Styles
    recommendationContainer: { flex: 1, padding: 20 },
    sectionContainer: { marginBottom: 30 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    sectionTitle: { fontFamily: 'Poppins_600SemiBold', color: Colors.text, fontSize: 18, marginBottom: 10 },
    clearText: { color: Colors.textSecondary, fontFamily: 'Poppins_500Medium', fontSize: 12 },
    tagContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    historyTag: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    trendingTag: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, borderLeftWidth: 3, borderLeftColor: Colors.secondary },
    tagText: { color: Colors.textSecondary, fontFamily: 'Poppins_500Medium', fontSize: 13 },
});