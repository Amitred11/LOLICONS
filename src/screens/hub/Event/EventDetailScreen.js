import React, { useState } from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, ScrollView, Dimensions, ActivityIndicator, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@config/Colors';

// API
import { EventsService } from '@api/MockEventsService';

const { width } = Dimensions.get('window');

// --- TICKET COMPONENT ---
const TicketView = ({ event }) => (
    <View style={styles.ticketContainer}>
        <View style={styles.ticketCard}>
            <LinearGradient colors={[Colors.primary, '#FF6B6B']} style={styles.ticketHeader}>
                <Text style={styles.ticketEventTitle}>{event?.title || "Event Name"}</Text>
                <Text style={styles.ticketType}>VIP ACCESS</Text>
            </LinearGradient>
            
            <View style={styles.ticketBody}>
                <View style={styles.qrContainer}>
                    <Ionicons name="qr-code-outline" size={120} color="#000" />
                </View>
                <Text style={styles.ticketName}>User 01</Text>
                <Text style={styles.ticketId}>ID: #8392-AB2</Text>
                
                <View style={styles.divider}>
                    <View style={[styles.circle, styles.circleLeft]} />
                    <View style={[styles.dashedLine]} />
                    <View style={[styles.circle, styles.circleRight]} />
                </View>

                <View style={styles.ticketInfoRow}>
                    <View><Text style={styles.label}>DATE</Text><Text style={styles.value}>{event?.date || "TBD"}</Text></View>
                    <View><Text style={styles.label}>TIME</Text><Text style={styles.value}>{event?.time || "18:00"}</Text></View>
                    <View><Text style={styles.label}>SEAT</Text><Text style={styles.value}>A-24</Text></View>
                </View>
            </View>
        </View>
        <TouchableOpacity style={styles.walletButton}>
            <Ionicons name="wallet-outline" size={20} color="#fff" />
            <Text style={styles.walletText}>Add to Apple Wallet</Text>
        </TouchableOpacity>
    </View>
);

// --- SCHEDULE COMPONENT ---
const ScheduleList = () => {
    // Mock schedule data (could be moved to API as well)
    const schedule = [
        { time: '18:00', title: 'Opening', location: 'Main Stage', status: 'done' },
        { time: '18:30', title: 'Keynote', location: 'Auditorium A', status: 'live' },
        { time: '20:00', title: 'Finals', location: 'Arena', status: 'upcoming' },
    ];
    return (
        <View style={styles.listContainer}>
            {schedule.map((item, index) => (
                <View key={index} style={styles.scheduleItem}>
                    <Text style={[styles.timeText, item.status === 'live' && { color: Colors.primary }]}>{item.time}</Text>
                    <View style={[styles.scheduleCard, item.status === 'live' && styles.activeScheduleCard]}>
                        <View>
                            <Text style={styles.scheduleTitle}>{item.title}</Text>
                            <Text style={styles.scheduleLoc}>{item.location}</Text>
                        </View>
                        {item.status === 'live' && <View style={styles.liveBadge}><Text style={styles.liveText}>LIVE</Text></View>}
                    </View>
                </View>
            ))}
        </View>
    );
};

// --- OVERVIEW COMPONENT ---
const OverviewTab = ({ event, isRegistered, isRegistering, onRegister }) => (
    <View style={styles.overviewContainer}>
        <Text style={styles.sectionHeader}>About Event</Text>
        <Text style={styles.description}>
            {event?.description || `Join us for ${event?.title}. Experience exclusive premieres and live tournaments.`}
        </Text>
        
        <View style={styles.statRow}>
            <View style={styles.statBox}><Ionicons name="people" size={24} color={Colors.primary} /><Text style={styles.statValue}>2.4k</Text><Text style={styles.statLabel}>Going</Text></View>
            <View style={styles.statBox}><Ionicons name="time" size={24} color="#4FACFE" /><Text style={styles.statValue}>4h</Text><Text style={styles.statLabel}>Duration</Text></View>
        </View>

        {!isRegistered ? (
            <TouchableOpacity 
                style={styles.registerButton} 
                onPress={onRegister}
                disabled={isRegistering}
            >
                <LinearGradient colors={[Colors.primary, '#8A2387']} style={styles.gradientBtn}>
                    {isRegistering ? (
                        <ActivityIndicator color="#fff" size="small" />
                    ) : (
                        <Text style={styles.registerText}>Get Ticket • Free</Text>
                    )}
                </LinearGradient>
            </TouchableOpacity>
        ) : (
            <View style={styles.registeredBox}>
                <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                <Text style={styles.registeredText}>You are registered!</Text>
            </View>
        )}
    </View>
);

// --- MAIN SCREEN ---
const EventDetailScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const insets = useSafeAreaInsets();
    
    // Data from navigation
    const { eventData } = route.params || {}; 
    
    // Local State
    const [activeTab, setActiveTab] = useState('Overview');
    const [isRegistered, setIsRegistered] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);

    const handleRegister = async () => {
        setIsRegistering(true);
        const response = await EventsService.joinEvent(eventData?.id);
        setIsRegistering(false);
        
        if (response.success) {
            setIsRegistered(true);
            setTimeout(() => setActiveTab('Ticket'), 800);
        } else {
            Alert.alert("Error", "Could not register for event");
        }
    };

    return (
        <View style={styles.container}>
            <ImageBackground source={eventData?.image || { uri: 'https://via.placeholder.com/800x400' }} style={styles.headerImage}>
                <LinearGradient colors={['rgba(0,0,0,0.1)', Colors.darkBackground]} style={styles.headerGradient} />
                <View style={[styles.navbar, { marginTop: insets.top }]}>
                    <TouchableOpacity style={styles.glassBtn} onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={24} color="#fff" /></TouchableOpacity>
                    <TouchableOpacity style={styles.glassBtn}><Ionicons name="share-social-outline" size={24} color="#fff" /></TouchableOpacity>
                </View>
                <View style={styles.titleContainer}>
                    <Text style={styles.mainTitle}>{eventData?.title || "Event Name"}</Text>
                    <Text style={styles.subtitleText}>{eventData?.location || "Unknown Location"}</Text>
                </View>
            </ImageBackground>

            <View style={styles.tabContainer}>
                {['Overview', 'Schedule', 'Ticket'].map((tab) => (
                    <TouchableOpacity key={tab} style={[styles.tabItem, activeTab === tab && styles.activeTabItem]} onPress={() => setActiveTab(tab)}>
                        <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
                        {activeTab === tab && <View style={styles.activeIndicator} />}
                    </TouchableOpacity>
                ))}
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {activeTab === 'Overview' && (
                    <OverviewTab 
                        event={eventData} 
                        isRegistered={isRegistered} 
                        isRegistering={isRegistering}
                        onRegister={handleRegister} 
                    />
                )}
                {activeTab === 'Schedule' && <ScheduleList />}
                {activeTab === 'Ticket' && (
                    isRegistered ? <TicketView event={eventData} /> : <View style={styles.emptyTicketState}><Text style={styles.emptyText}>Register to view ticket</Text></View>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.darkBackground },
    headerImage: { height: 280, justifyContent: 'space-between' },
    headerGradient: { ...StyleSheet.absoluteFillObject },
    navbar: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20 },
    glassBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.3)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    titleContainer: { padding: 20 },
    mainTitle: { fontFamily: 'Poppins_700Bold', fontSize: 24, color: '#fff' },
    subtitleText: { fontFamily: 'Poppins_400Regular', color: 'rgba(255,255,255,0.8)', fontSize: 14 },
    tabContainer: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 20 },
    tabItem: { marginRight: 30, paddingVertical: 15 },
    tabText: { fontFamily: 'Poppins_500Medium', color: Colors.textSecondary, fontSize: 15 },
    activeTabText: { color: '#fff', fontFamily: 'Poppins_600SemiBold' },
    activeIndicator: { height: 3, backgroundColor: Colors.primary, marginTop: 4, borderRadius: 2 },
    scrollContent: { padding: 20, paddingBottom: 50 },
    
    // Overview
    overviewContainer: { },
    sectionHeader: { fontFamily: 'Poppins_600SemiBold', color: '#fff', fontSize: 18, marginBottom: 10 },
    description: { fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, marginBottom: 20, lineHeight: 22 },
    statRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
    statBox: { backgroundColor: Colors.surface, flex: 1, marginHorizontal: 5, borderRadius: 12, padding: 15, alignItems: 'center' },
    statValue: { color: '#fff', fontFamily: 'Poppins_700Bold' },
    statLabel: { color: Colors.textSecondary, fontSize: 12 },
    registerButton: { borderRadius: 16, overflow: 'hidden' },
    gradientBtn: { paddingVertical: 16, alignItems: 'center', height: 56, justifyContent: 'center' },
    registerText: { color: '#fff', fontFamily: 'Poppins_600SemiBold' },
    registeredBox: { backgroundColor: 'rgba(76, 175, 80, 0.1)', borderColor: '#4CAF50', borderWidth: 1, borderRadius: 12, padding: 20, alignItems: 'center' },
    registeredText: { color: '#4CAF50', fontFamily: 'Poppins_600SemiBold' },

    // Schedule
    listContainer: { marginTop: 10 },
    scheduleItem: { flexDirection: 'row', marginBottom: 20, alignItems: 'center' },
    timeText: { width: 50, fontFamily: 'Poppins_600SemiBold', color: Colors.textSecondary },
    scheduleCard: { flex: 1, backgroundColor: Colors.surface, borderRadius: 12, padding: 15, flexDirection: 'row', justifyContent: 'space-between' },
    activeScheduleCard: { backgroundColor: '#2A2A2A', borderColor: Colors.primary, borderWidth: 1 },
    scheduleTitle: { color: '#fff', fontFamily: 'Poppins_600SemiBold' },
    scheduleLoc: { color: Colors.textSecondary, fontSize: 12 },
    liveBadge: { backgroundColor: Colors.primary, paddingHorizontal: 6, borderRadius: 4 },
    liveText: { fontSize: 10, fontFamily: 'Poppins_700Bold' },

    // Ticket
    ticketContainer: { alignItems: 'center' },
    ticketCard: { width: '100%', backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden' },
    ticketHeader: { padding: 20, alignItems: 'center' },
    ticketEventTitle: { color: '#fff', fontFamily: 'Poppins_700Bold' },
    ticketType: { color: 'rgba(255,255,255,0.8)', fontSize: 10, letterSpacing: 2 },
    ticketBody: { padding: 20, alignItems: 'center' },
    qrContainer: { padding: 10, borderWidth: 2, borderColor: '#000', borderRadius: 8, marginBottom: 15 },
    ticketName: { fontSize: 18, fontFamily: 'Poppins_700Bold', color: '#000' },
    ticketId: { fontSize: 12, color: '#666' },
    divider: { flexDirection: 'row', alignItems: 'center', width: '120%', marginBottom: 15 },
    circle: { width: 20, height: 20, borderRadius: 10, backgroundColor: Colors.darkBackground },
    circleLeft: { marginLeft: 0 }, circleRight: { marginRight: 0 },
    dashedLine: { flex: 1, height: 1, borderWidth: 1, borderColor: '#ccc', borderStyle: 'dashed' },
    ticketInfoRow: { flexDirection: 'row', width: '100%', justifyContent: 'space-between' },
    label: { fontSize: 10, color: '#999' }, value: { fontSize: 14, color: '#000', fontFamily: 'Poppins_600SemiBold' },
    walletButton: { marginTop: 20, backgroundColor: '#000', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 25, flexDirection: 'row' },
    walletText: { color: '#fff', marginLeft: 8 },
    emptyTicketState: { alignItems: 'center', marginTop: 50 },
    emptyText: { color: Colors.textSecondary },
});

export default EventDetailScreen;