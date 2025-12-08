import React, { useState, useMemo, useCallback } from 'react';
import { 
    View, Text, StyleSheet, FlatList, TouchableOpacity, ImageBackground, 
    TextInput, Platform, ActivityIndicator, RefreshControl 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Colors } from '@config/Colors';
import { useEvents } from '@context/hub/EventsContext';

const categories = ['All', 'Releases', 'Meetups', 'Contests', 'Conventions'];

// --- SUB COMPONENTS ---

const FeaturedEvent = ({ item, onPress }) => {
    if (!item) return null;
    return (
        <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={styles.heroContainer}>
            <ImageBackground source={item.image} style={styles.heroImage} imageStyle={{ borderRadius: 24 }}>
                <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={styles.heroOverlay}>
                    <View style={styles.heroTopRow}>
                        <View style={styles.mainEventBadge}>
                            <Text style={styles.mainEventText}>MAIN EVENT</Text>
                        </View>
                        {item.price > 0 && (
                            <View style={styles.heroPriceBadge}>
                                <Text style={styles.heroPriceText}>₱{item.price}</Text>
                            </View>
                        )}
                    </View>
                    <View>
                        <Text style={styles.heroDate}><Ionicons name="calendar-outline" size={14} /> {item.date} • {item.time}</Text>
                        <Text style={styles.heroTitle}>{item.title}</Text>
                        <Text style={styles.heroLocation} numberOfLines={1}>
                            <Ionicons name="location" size={14} color={Colors.primary} /> {item.location}
                        </Text>
                    </View>
                </LinearGradient>
            </ImageBackground>
        </TouchableOpacity>
    );
};

const EventRow = ({ item, onPress, index }) => {
    const dateParts = item.date.split(' ');
    // Safe Price Check: Treated as free if 0 or undefined
    const isFree = !item.price || item.price === 0;

    return (
    <Animated.View entering={FadeInDown.delay(index * 100).springify()}>
        <TouchableOpacity style={styles.cardContainer} onPress={onPress} activeOpacity={0.7}>
            <View style={styles.dateBox}>
                <Text style={styles.dateDay}>{dateParts[1] || ''}</Text> 
                <Text style={styles.dateMonth}>{dateParts[0]}</Text>
            </View>
            <View style={styles.cardContent}>
                <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                <View style={styles.metaRow}>
                    <Text style={styles.cardTime}>{item.time}</Text>
                    <View style={styles.dotSeparator} />
                    <Text style={[styles.priceText, { color: isFree ? '#4CAF50' : Colors.primary }]}>
                        {isFree ? 'FREE' : `₱${item.price}`}
                    </Text>
                </View>
                <View style={styles.locationRow}>
                    <Ionicons name="location-outline" size={12} color={Colors.textSecondary} />
                    <Text style={styles.cardLocation} numberOfLines={1}> {item.location}</Text>
                </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
        </TouchableOpacity>
    </Animated.View>
   );
};

// --- MAIN COMPONENT ---
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

    // Separate Main Event from List
    const { mainEvent, listEvents } = useMemo(() => {
        let filtered = events.filter(event => {
            const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = selectedCategory === 'All' || (event.category === selectedCategory);
            return matchesSearch && matchesCategory;
        });

        // Find the designated Main Event
        const main = filtered.find(e => e.isMainEvent);
        // Exclude the main event from the standard list to avoid duplication
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

            {/* --- ADDED: CATEGORIES LIST UI --- */}
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
    
    // --- ADDED: Category Styles ---
    categoryContainer: { marginBottom: 15, height: 40 },
    categoryChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: Colors.surface, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    categoryChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
    categoryText: { fontFamily: 'Poppins_500Medium', color: Colors.textSecondary, fontSize: 13 },
    categoryTextActive: { color: '#FFF' },

    // List
    listContent: { paddingHorizontal: 20, paddingBottom: 40 },
    sectionTitle: { fontFamily: 'Poppins_700Bold', color: '#fff', fontSize: 18, marginBottom: 10 },
    
    // Hero Styles
    heroContainer: { width: '100%', height: 240, borderRadius: 24, overflow: 'hidden' },
    heroImage: { flex: 1, justifyContent: 'space-between' },
    heroOverlay: { flex: 1, padding: 20, justifyContent: 'space-between' },
    heroTopRow: { flexDirection: 'row', justifyContent: 'space-between' },
    mainEventBadge: { backgroundColor: Colors.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
    mainEventText: { fontFamily: 'Poppins_700Bold', color: '#fff', fontSize: 10 },
    heroPriceBadge: { backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
    heroPriceText: { fontFamily: 'Poppins_700Bold', color: '#FFD700', fontSize: 12 },
    heroDate: { fontFamily: 'Poppins_600SemiBold', color: Colors.secondary, fontSize: 12, marginBottom: 4 },
    heroTitle: { fontFamily: 'Poppins_700Bold', color: '#fff', fontSize: 24, marginBottom: 4 },
    heroLocation: { fontFamily: 'Poppins_400Regular', color: '#ddd', fontSize: 13 },

    // Card Styles
    cardContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E1E2C', padding: 15, borderRadius: 18, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    dateBox: { width: 50, height: 50, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center', marginRight: 15 },
    dateDay: { fontFamily: 'Poppins_700Bold', color: '#fff', fontSize: 16 },
    dateMonth: { fontFamily: 'Poppins_500Medium', color: Colors.secondary, fontSize: 10, textTransform: 'uppercase' },
    cardContent: { flex: 1, marginRight: 10 },
    cardTitle: { fontFamily: 'Poppins_600SemiBold', color: '#fff', fontSize: 16 },
    metaRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 4 },
    cardTime: { fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, fontSize: 12 },
    dotSeparator: { width: 4, height: 4, borderRadius: 2, backgroundColor: Colors.textSecondary, marginHorizontal: 6 },
    priceText: { fontFamily: 'Poppins_700Bold', fontSize: 12 },
    locationRow: { flexDirection: 'row', alignItems: 'center' },
    cardLocation: { fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, fontSize: 12 },
    emptyText: { textAlign: 'center', color: '#666', marginTop: 50 }
});

export default EventsScreen;