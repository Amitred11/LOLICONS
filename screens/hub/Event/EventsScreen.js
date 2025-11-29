import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/Colors';
import { upcomingEventsData } from '../../../constants/mockData';

// Reusing your EventCard logic but styling it for a full list
const DirectoryEventCard = ({ item, onPress }) => (
    <TouchableOpacity style={styles.cardContainer} onPress={onPress} activeOpacity={0.9}>
        <View style={styles.cardImageContainer}>
            {/* Placeholder image logic */}
            <View style={[styles.cardImage, { backgroundColor: '#333' }]}> 
                <Ionicons name="calendar" size={30} color="#555" />
            </View>
        </View>
        <View style={styles.cardContent}>
            <Text style={styles.cardDate}>{item.time || 'Upcoming'}</Text>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={14} color={Colors.textSecondary} />
                <Text style={styles.cardLocation}> Main Stage</Text>
            </View>
        </View>
        <View style={styles.arrowContainer}>
             <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
        </View>
    </TouchableOpacity>
);

const EventsScreen = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>All Events</Text>
                <TouchableOpacity style={styles.iconButton}>
                    <Ionicons name="search" size={24} color={Colors.text} />
                </TouchableOpacity>
            </View>

            {/* List */}
            <FlatList
                data={upcomingEventsData}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => (
                    <DirectoryEventCard 
                        item={item} 
                        onPress={() => navigation.navigate('EventDetail', { eventData: item })} 
                    />
                )}
                ListHeaderComponent={
                    <Text style={styles.listHeader}>Upcoming ({upcomingEventsData.length})</Text>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.darkBackground },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
    headerTitle: { fontFamily: 'Poppins_600SemiBold', color: '#fff', fontSize: 18 },
    backButton: { padding: 5 },
    iconButton: { padding: 5 },
    listContent: { padding: 20 },
    listHeader: { fontFamily: 'Poppins_600SemiBold', color: Colors.textSecondary, fontSize: 14, marginBottom: 15, textTransform: 'uppercase' },
    
    // Card Styles
    cardContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, padding: 12, borderRadius: 16, marginBottom: 12 },
    cardImageContainer: { marginRight: 15 },
    cardImage: { width: 50, height: 50, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    cardContent: { flex: 1 },
    cardDate: { fontFamily: 'Poppins_600SemiBold', color: Colors.primary, fontSize: 12 },
    cardTitle: { fontFamily: 'Poppins_600SemiBold', color: '#fff', fontSize: 16 },
    cardLocation: { fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, fontSize: 12 },
    arrowContainer: { marginLeft: 10 },
});

export default EventsScreen;