import React, { useState, useMemo, useCallback } from 'react';
import { 
    View, Text, StyleSheet, FlatList, TouchableOpacity, 
    TextInput, ActivityIndicator, RefreshControl 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@config/Colors';
import { useEvents } from '@context/hub/EventsContext';
import { FeaturedEvent, EventRow } from './components/EventComponents'; // IMPORT HERE

const categories = ['All', 'Releases', 'Meetups', 'Contests', 'Conventions'];

const EventsScreen = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const { events, isLoading, loadEvents } = useEvents();
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadEvents(true);
        setRefreshing(false);
    }, [loadEvents]);

    const { mainEvent, listEvents } = useMemo(() => {
        let filtered = events.filter(event => {
            const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = selectedCategory === 'All' || (event.category === selectedCategory);
            return matchesSearch && matchesCategory;
        });

        const main = filtered.find(e => e.isMainEvent);
        const list = filtered.filter(e => e.id !== main?.id);

        return { mainEvent: main, listEvents: list };
    }, [searchQuery, selectedCategory, events]);

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.headerContainer}>
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={Colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Events Hub</Text>
                    <TouchableOpacity 
                        style={styles.iconButton}
                        onPress={() => navigation.navigate('Notifications')}
                    >
                        <Ionicons name="notifications-outline" size={24} color={Colors.text} />
                        <View style={styles.badge} /> 
                    </TouchableOpacity>
                </View>
                <View style={styles.searchBarContainer}>
                    <Ionicons name="search" size={20} color={Colors.textSecondary} style={{ marginRight: 10 }} />
                    <TextInput 
                        placeholder="Search events..." 
                        placeholderTextColor={Colors.textSecondary}
                        style={styles.searchInput}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            {/* Categories */}
            <View style={styles.categoryContainer}>
                <FlatList 
                    horizontal
                    data={categories}
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={item => item}
                    contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}
                    renderItem={({ item }) => (
                        <TouchableOpacity 
                            onPress={() => setSelectedCategory(item)}
                            style={[
                                styles.categoryChip, 
                                selectedCategory === item && styles.categoryChipActive
                            ]}
                        >
                            <Text style={[
                                styles.categoryText, 
                                selectedCategory === item && styles.categoryTextActive
                            ]}>
                                {item}
                            </Text>
                        </TouchableOpacity>
                    )}
                />
            </View>

            {isLoading && !refreshing ? (
                <View style={styles.loadingContainer}><ActivityIndicator size="large" color={Colors.primary} /></View>
            ) : (
                <FlatList
                    data={listEvents}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={Colors.primary} />}
                    ListHeaderComponent={
                        <View style={{ marginBottom: 15 }}>
                            {mainEvent && (
                                <View style={{ marginBottom: 20 }}>
                                    <Text style={styles.sectionTitle}>Featured Event</Text>
                                    <FeaturedEvent 
                                        item={mainEvent} 
                                        onPress={() => navigation.navigate('EventDetail', { eventData: mainEvent })} 
                                    />
                                </View>
                            )}
                            <Text style={styles.sectionTitle}>Upcoming</Text>
                        </View>
                    }
                    renderItem={({ item, index }) => (
                        <EventRow item={item} index={index} onPress={() => navigation.navigate('EventDetail', { eventData: item })} />
                    )}
                    ListEmptyComponent={<Text style={styles.emptyText}>No events found</Text>}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    
    // Header
    headerContainer: { paddingHorizontal: 20, paddingBottom: 15 },
    headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 15 },
    headerTitle: { fontFamily: 'Poppins_700Bold', color: '#fff', fontSize: 20 },
    backButton: { padding: 5 },
    iconButton: { padding: 8, backgroundColor: Colors.surface, borderRadius: 12 },
    badge: { position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary, borderWidth:1, borderColor: Colors.surface },
    searchBarContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, paddingHorizontal: 15, paddingVertical: 12, borderRadius: 12 },
    searchInput: { flex: 1, color: '#fff', fontFamily: 'Poppins_400Regular' },
    
    // Category Styles
    categoryContainer: { marginBottom: 15, height: 40 },
    categoryChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: Colors.surface, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    categoryChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
    categoryText: { fontFamily: 'Poppins_500Medium', color: Colors.textSecondary, fontSize: 13 },
    categoryTextActive: { color: '#FFF' },

    // List
    listContent: { paddingHorizontal: 20, paddingBottom: 40 },
    sectionTitle: { fontFamily: 'Poppins_700Bold', color: '#fff', fontSize: 18, marginBottom: 10 },
    emptyText: { textAlign: 'center', color: '#666', marginTop: 50 }
});

export default EventsScreen;