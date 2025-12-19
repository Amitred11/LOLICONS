import React, { useState, useMemo } from 'react';
import { 
    View, Text, StyleSheet, FlatList, TouchableOpacity, 
    TextInput, ScrollView, StatusBar
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useEvents } from '@context/hub/EventsContext';
import { FeaturedEvent, EventRow } from './components/EventComponents';

const categories = ['All', 'Releases', 'Meetups', 'Contests', 'Conventions'];

const EventsScreen = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const { events } = useEvents();
    const [search, setSearch] = useState('');
    const [activeCat, setActiveCat] = useState('All');

    const { featured, others } = useMemo(() => {
        let filtered = events.filter(e => {
            const mS = e.title.toLowerCase().includes(search.toLowerCase());
            const mC = activeCat === 'All' || e.category === activeCat;
            return mS && mC;
        });
        return { 
            featured: filtered.find(e => e.isMainEvent), 
            others: filtered.filter(e => !e.isMainEvent) 
        };
    }, [search, activeCat, events]);

    return (
        <View style={[styles.container, { paddingTop: insets.top + 15 }]}>
            <StatusBar barStyle="light-content" />
            
            {/* Header Section */}
            <View style={styles.header}>
                <TouchableOpacity 
                    style={styles.headerBtn} 
                    onPress={() => navigation.goBack()} 
                    activeOpacity={0.7}
                >
                    <Ionicons name="chevron-back" size={24} color="#fff" />
                </TouchableOpacity>
                <View>
                    <Text style={styles.greet}>Good evening, Explorer</Text>
                    <Text style={styles.brand}>Events Hub</Text>
                </View>
                <TouchableOpacity style={styles.notifBtn} onPress={() => navigation.navigate('Notifications')}>
                    <Ionicons name="notifications-outline" size={24} color="#fff" />
                    <View style={styles.pulseDot} />
                </TouchableOpacity>
            </View>

            {/* Premium Search */}
            <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                    <Ionicons name="search-outline" size={20} color="#555" />
                    <TextInput 
                        placeholder="Search festivals or tournaments..." 
                        placeholderTextColor="#444" 
                        style={styles.searchInput}
                        value={search}
                        onChangeText={setSearch}
                    />
                </View>
            </View>

            {/* Horizontal Categories */}
            <View style={styles.catScroll}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{paddingHorizontal: 20}}>
                    {categories.map(c => (
                        <TouchableOpacity 
                            key={c} 
                            style={[styles.chip, activeCat === c && styles.chipActive]}
                            onPress={() => setActiveCat(c)}
                        >
                            <Text style={[styles.chipText, activeCat === c && {color: '#fff'}]}>{c}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Main Content List */}
            <FlatList
                data={others}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listPadding}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={
                    <View style={{ marginBottom: 15 }}>
                        {featured && (
                            <View style={{ marginBottom: 30 }}>
                                <Text style={styles.listLabel}>Featured Event</Text>
                                <FeaturedEvent 
                                    item={featured} 
                                    onPress={() => navigation.navigate('EventDetail', { eventData: featured })} 
                                />
                            </View>
                        )}
                        <Text style={styles.listLabel}>Discover More</Text>
                    </View>
                }
                renderItem={({ item, index }) => (
                    <EventRow item={item} index={index} onPress={() => navigation.navigate('EventDetail', { eventData: item })} />
                )}
                ListEmptyComponent={<Text style={styles.emptyTxt}>No events match your criteria.</Text>}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#07070C' },
    header: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        paddingHorizontal: 20, 
        marginBottom: 25 
    },
    headerTitleArea: {
        flex: 1,
        marginHorizontal: 15,
    },
    headerBtn: { 
        width: 48, 
        height: 48, 
        borderRadius: 16, 
        backgroundColor: '#11111A', 
        alignItems: 'center', 
        justifyContent: 'center', 
        borderWidth: 1, 
        borderColor: '#1E1E2E' 
    },
    greet: { color: '#666', fontSize: 13, fontWeight: '500' },
    brand: { color: '#fff', fontSize: 24, fontWeight: '900', letterSpacing: -1 },
    notifBtn: { width: 52, height: 52, borderRadius: 18, backgroundColor: '#11111A', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#1E1E2E' },
    pulseDot: { position: 'absolute', top: 16, right: 16, width: 8, height: 8, borderRadius: 4, backgroundColor: '#6366F1', borderWidth: 2, borderColor: '#11111A' },
    back: {
      width: 30,
      height: 30,
      marginRight: -50,
    },
    searchContainer: { paddingHorizontal: 22, marginBottom: 22 },
    searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#11111A', paddingHorizontal: 18, paddingVertical: 14, borderRadius: 20, borderWidth: 1, borderColor: '#1E1E2E' },
    searchInput: { flex: 1, marginLeft: 12, color: '#fff', fontSize: 15, fontWeight: '500' },

    catScroll: { marginBottom: 25 },
    chip: { paddingHorizontal: 22, paddingVertical: 12, borderRadius: 16, backgroundColor: '#11111A', marginRight: 12, borderWidth: 1, borderColor: '#1E1E2E' },
    chipActive: { backgroundColor: '#6366F1', borderColor: '#6366F1' },
    chipText: { color: '#555', fontWeight: '800', fontSize: 13 },

    listPadding: { paddingHorizontal: 22, paddingBottom: 100 },
    listLabel: { color: '#fff', fontSize: 19, fontWeight: '900', marginBottom: 18, letterSpacing: 0.2 },
    emptyTxt: { color: '#333', textAlign: 'center', marginTop: 60, fontWeight: '700' }
});

export default EventsScreen;