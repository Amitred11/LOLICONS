import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    FlatList, 
    TouchableOpacity, 
    ImageBackground, 
    TextInput,
    Dimensions,
    Platform,
    ActivityIndicator,
    RefreshControl
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';
import { Colors } from '@config/Colors';

// API
import { EventsService } from '@api/hub/MockEventsService';

const categories = ['All', 'Releases', 'Meetups', 'Contests', 'Conventions'];

// --- Component: Hero / Featured Event ---
const FeaturedEvent = ({ item, onPress }) => {
    if (!item) return null;
    return (
        <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={styles.heroContainer}>
            <ImageBackground 
                source={item.image} 
                style={styles.heroImage} 
                imageStyle={{ borderRadius: 24 }}
            >
                <LinearGradient 
                    colors={['transparent', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.95)']} 
                    style={styles.heroOverlay}
                >
                    <View style={styles.heroBadge}>
                        <Text style={styles.heroBadgeText}>FEATURED</Text>
                    </View>
                    <View>
                        <Text style={styles.heroDate}>
                            <Ionicons name="calendar-outline" size={14} /> {item.date} • {item.time}
                        </Text>
                        <Text style={styles.heroTitle}>{item.title}</Text>
                        <Text style={styles.heroLocation} numberOfLines={1}>
                            <Ionicons name="location" size={14} color={Colors.primary} /> {item.location || 'Main Hall'}
                        </Text>
                    </View>
                </LinearGradient>
            </ImageBackground>
        </TouchableOpacity>
    );
};

// --- Component: Category Filter ---
const CategoryFilter = ({ categories, selected, onSelect }) => (
    <FlatList
        data={categories}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContainer}
        keyExtractor={item => item}
        renderItem={({ item }) => {
            const isSelected = selected === item;
            return (
                <TouchableOpacity 
                    onPress={() => onSelect(item)}
                    style={[styles.filterPill, isSelected && styles.filterPillActive]}
                >
                    <Text style={[styles.filterText, isSelected && styles.filterTextActive]}>
                        {item}
                    </Text>
                </TouchableOpacity>
            );
        }}
    />
);

// --- Component: Standard Event Row ---
const EventRow = ({ item, onPress, index }) => {
    const dateParts = item.date && typeof item.date === 'string' 
        ? item.date.split(' ') 
        : ['?', '???'];
        
    const month = dateParts[0];
    const day = dateParts.length > 1 ? dateParts[1] : '';

    return (
    <Animated.View entering={FadeInDown.delay(index * 100).springify()} layout={Layout.springify()}>
        <TouchableOpacity style={styles.cardContainer} onPress={onPress} activeOpacity={0.7}>
            <View style={styles.dateBox}>
                <Text style={styles.dateDay}>{day}</Text> 
                <Text style={styles.dateMonth}>{month}</Text>
            </View>

            <View style={styles.cardContent}>
                <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.cardTime}>{item.time} • {item.category || 'General'}</Text>
                <View style={styles.locationRow}>
                    <Ionicons name="location-outline" size={12} color={Colors.textSecondary} />
                    <Text style={styles.cardLocation} numberOfLines={1}> {item.location || 'Online'}</Text>
                </View>
            </View>

            <View style={styles.arrowContainer}>
                 <View style={styles.iconCircle}>
                    <Ionicons name="chevron-forward" size={18} color="#FFF" />
                 </View>
            </View>
        </TouchableOpacity>
    </Animated.View>
   );
};

// --- Main Screen ---
const EventsScreen = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    
    // State
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    // Load Data
    const loadEvents = useCallback(async () => {
        const result = await EventsService.getEvents();
        if (result.success) {
            setEvents(result.data);
        }
        setLoading(false);
        setRefreshing(false);
    }, []);

    useEffect(() => {
        loadEvents();
    }, [loadEvents]);

    const handleRefresh = () => {
        setRefreshing(true);
        loadEvents();
    };

    // Filter Logic
    const filteredEvents = useMemo(() => {
        return events.filter(event => {
            const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = selectedCategory === 'All' || (event.category === selectedCategory);
            return matchesSearch && matchesCategory;
        });
    }, [searchQuery, selectedCategory, events]);

    // Separate Featured vs List
    const showHero = selectedCategory === 'All' && searchQuery === '';
    const heroEvent = showHero ? filteredEvents[0] : null;
    const listEvents = showHero ? filteredEvents.slice(1) : filteredEvents;

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            
            {/* Header & Search */}
            <View style={styles.headerContainer}>
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={Colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Events</Text>
                    <TouchableOpacity style={styles.iconButton}>
                        <Ionicons name="notifications-outline" size={24} color={Colors.text} />
                    </TouchableOpacity>
                </View>
                
                <View style={styles.searchBarContainer}>
                    <Ionicons name="search" size={20} color={Colors.textSecondary} style={{ marginRight: 10 }} />
                    <TextInput 
                        placeholder="Find an event..." 
                        placeholderTextColor={Colors.textSecondary}
                        style={styles.searchInput}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            {/* Main Content */}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={listEvents}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={Colors.primary} />
                    }
                    ListHeaderComponent={
                        <View>
                            {heroEvent && (
                                <View style={{ marginBottom: 25 }}>
                                    <Text style={styles.sectionTitle}>Don't Miss</Text>
                                    <FeaturedEvent 
                                        item={heroEvent} 
                                        onPress={() => navigation.navigate('EventDetail', { eventData: heroEvent })} 
                                    />
                                </View>
                            )}
                            
                            <CategoryFilter 
                                categories={categories} 
                                selected={selectedCategory} 
                                onSelect={setSelectedCategory} 
                            />
                            
                            <View style={styles.listHeaderRow}>
                                <Text style={styles.sectionTitle}>
                                    {searchQuery ? 'Search Results' : 'Upcoming'}
                                </Text>
                                <Text style={styles.countText}>{listEvents.length} events</Text>
                            </View>
                        </View>
                    }
                    renderItem={({ item, index }) => (
                        <EventRow 
                            item={item} 
                            index={index}
                            onPress={() => navigation.navigate('EventDetail', { eventData: item })} 
                        />
                    )}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Ionicons name="calendar-outline" size={60} color={Colors.surface} />
                            <Text style={styles.emptyText}>No events found</Text>
                        </View>
                    }
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
    iconButton: { padding: 5, backgroundColor: Colors.surface, borderRadius: 12 },
    
    // Search
    searchBarContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, paddingHorizontal: 15, paddingVertical: Platform.OS === 'ios' ? 12 : 0, borderRadius: 12, height: 50 },
    searchInput: { flex: 1, color: '#fff', fontFamily: 'Poppins_400Regular' },

    // List Layout
    listContent: { paddingHorizontal: 20, paddingBottom: 40 },
    listHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, marginTop: 10 },
    sectionTitle: { fontFamily: 'Poppins_700Bold', color: '#fff', fontSize: 18, marginBottom: 10 },
    countText: { fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, fontSize: 12 },

    // Hero Section
    heroContainer: { width: '100%', height: 220, borderRadius: 24, overflow: 'hidden', marginBottom: 5 },
    heroImage: { flex: 1, justifyContent: 'flex-end' },
    heroOverlay: { padding: 20 },
    heroBadge: { backgroundColor: Colors.primary, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start', marginBottom: 10 },
    heroBadgeText: { fontFamily: 'Poppins_700Bold', color: '#fff', fontSize: 10 },
    heroDate: { fontFamily: 'Poppins_600SemiBold', color: Colors.secondary, fontSize: 12, marginBottom: 4 },
    heroTitle: { fontFamily: 'Poppins_700Bold', color: '#fff', fontSize: 22, marginBottom: 4 },
    heroLocation: { fontFamily: 'Poppins_400Regular', color: '#ddd', fontSize: 13 },

    // Filter Pills
    filterContainer: { paddingVertical: 10, marginBottom: 10 },
    filterPill: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, backgroundColor: Colors.surface, marginRight: 10, borderWidth: 1, borderColor: 'transparent' },
    filterPillActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
    filterText: { fontFamily: 'Poppins_500Medium', color: Colors.textSecondary, fontSize: 13 },
    filterTextActive: { color: '#fff' },

    // Event Row Card
    cardContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E1E2C', padding: 15, borderRadius: 18, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    dateBox: { width: 50, height: 50, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center', marginRight: 15 },
    dateDay: { fontFamily: 'Poppins_700Bold', color: '#fff', fontSize: 16 },
    dateMonth: { fontFamily: 'Poppins_500Medium', color: Colors.secondary, fontSize: 10, textTransform: 'uppercase' },
    cardContent: { flex: 1 },
    cardTitle: { fontFamily: 'Poppins_600SemiBold', color: '#fff', fontSize: 16, marginBottom: 2 },
    cardTime: { fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, fontSize: 12, marginBottom: 4 },
    locationRow: { flexDirection: 'row', alignItems: 'center' },
    cardLocation: { fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, fontSize: 12 },
    iconCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center' },

    // Empty State
    emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 50 },
    emptyText: { fontFamily: 'Poppins_500Medium', color: Colors.textSecondary, marginTop: 10 },
});

export default EventsScreen;