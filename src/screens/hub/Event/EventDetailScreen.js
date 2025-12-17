import React, { useState } from 'react';
import { 
    View, Text, StyleSheet, ImageBackground, TouchableOpacity, ScrollView, 
    ActivityIndicator, Alert, Share, Linking, Platform 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@config/Colors';
import { useEvents } from '@context/hub/EventsContext';
import { useAlert } from '@context/other/AlertContext';
import { PaymentModal } from './components/EventComponents'; // IMPORT HERE

const EventDetailScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const insets = useSafeAreaInsets();
    const { eventData } = route.params || {}; 
    const { joinEvent, hasTicket } = useEvents();
    const { showAlert } = useAlert();
    
    const [activeTab, setActiveTab] = useState('Overview');
    const [isProcessing, setIsProcessing] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    const userHasTicket = hasTicket(eventData?.id);
    const isPaidEvent = eventData?.price && eventData?.price > 0;

    const handleShare = async () => {
        try {
            await Share.share({
                message: `Join me at ${eventData.title}! It's happening on ${eventData.date} at ${eventData.location}.`,
                title: eventData.title
            });
        } catch (error) {
            console.error(error);
        }
    };

    const handleOpenMap = () => {
        const query = eventData.coordinates 
            ? `${eventData.coordinates.lat},${eventData.coordinates.lng}` 
            : eventData.location;
        const url = Platform.select({
            ios: `maps:0,0?q=${eventData.title}@${eventData.coordinates.lat},${eventData.coordinates.lng}`,
            android: `geo:${eventData.coordinates.lat},${eventData.coordinates.lng}?q=${eventData.coordinates.lat},${eventData.coordinates.lng}(${eventData.title})`
        });

        Linking.openURL(url).catch(err => Alert.alert("Error", "Could not open maps."));
    };

    const initiateRegister = () => {
        if (isPaidEvent) {
            setShowPaymentModal(true);
        } else {
            finalizeRegistration(null);
        }
    };

    const finalizeRegistration = async (paymentDetails) => {
        if (!isPaidEvent) setIsProcessing(true); 
        
        const success = await joinEvent(eventData?.id, paymentDetails);
        
        setIsProcessing(false);
        setShowPaymentModal(false);

        if (success) {
            showAlert({
                type: 'success',
                title: "Success!",
                message: "You have secured your ticket for the event.",
                btnText: "View My Ticket",
                onClose: () => setActiveTab('Ticket') 
            });
        } else {
            showAlert({
                type: 'error',
                title: "Registration Failed",
                message: "We couldn't process your registration. Please try again."
            });
      }
    };

    return (
        <View style={styles.container}>
            {/* Header Image */}
            <ImageBackground source={eventData?.image} style={styles.headerImage}>
                <LinearGradient colors={['rgba(0,0,0,0.3)', Colors.darkBackground]} style={styles.headerGradient} />
                <View style={[styles.navbar, { marginTop: insets.top }]}>
                    <TouchableOpacity style={styles.glassBtn} onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.glassBtn} onPress={handleShare}>
                        <Ionicons name="share-social-outline" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>
                <View style={styles.titleContainer}>
                    {eventData?.isMainEvent && <View style={styles.mainBadge}><Text style={styles.mainBadgeText}>MAIN EVENT</Text></View>}
                    <Text style={styles.mainTitle}>{eventData?.title}</Text>
                    <Text style={styles.subtitleText}><Ionicons name="location" size={14} /> {eventData?.location}</Text>
                </View>
            </ImageBackground>

            {/* Tab Bar */}
            <View style={styles.tabContainer}>
                {['Overview', 'Ticket'].map((tab) => (
                    <TouchableOpacity key={tab} style={[styles.tabItem, activeTab === tab && styles.activeTabItem]} onPress={() => setActiveTab(tab)}>
                        <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
                        {activeTab === tab && <View style={styles.activeIndicator} />}
                    </TouchableOpacity>
                ))}
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {activeTab === 'Overview' && (
                    <View>
                        <View style={styles.infoRow}>
                            <View style={styles.infoBox}>
                                <Ionicons name="calendar" size={24} color={Colors.primary} />
                                <Text style={styles.infoValue}>{eventData?.date}</Text>
                                <Text style={styles.infoLabel}>{eventData?.time}</Text>
                            </View>
                            <TouchableOpacity style={styles.infoBox} onPress={handleOpenMap}>
                                <Ionicons name="map" size={24} color="#4FACFE" />
                                <Text style={styles.infoValue}>Map</Text>
                                <Text style={styles.infoLabel}>Directions</Text>
                            </TouchableOpacity>
                            <View style={styles.infoBox}>
                                <Ionicons name="pricetag" size={24} color="#FFD700" />
                                <Text style={styles.infoValue}>{isPaidEvent ? `₱${eventData.price}` : 'Free'}</Text>
                                <Text style={styles.infoLabel}>Entry</Text>
                            </View>
                        </View>

                        <Text style={styles.sectionHeader}>About Event</Text>
                        <Text style={styles.description}>{eventData?.description}</Text>

                        {!userHasTicket ? (
                            <TouchableOpacity style={styles.registerButton} onPress={initiateRegister} disabled={isProcessing}>
                                <LinearGradient colors={[Colors.primary, '#8A2387']} style={styles.gradientBtn}>
                                    {isProcessing ? <ActivityIndicator color="#fff" /> : (
                                        <Text style={styles.registerText}>
                                            {isPaidEvent ? `Get Ticket • ₱${eventData.price}` : 'Get Ticket • Free'}
                                        </Text>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>
                        ) : (
                            <View style={styles.registeredBox}>
                                <Ionicons name="ticket" size={24} color="#4CAF50" />
                                <Text style={styles.registeredText}>You have a ticket!</Text>
                            </View>
                        )}
                    </View>
                )}

                {activeTab === 'Ticket' && (
                    userHasTicket ? (
                        <View style={styles.ticketContainer}>
                            <View style={styles.ticketCard}>
                                <LinearGradient colors={[Colors.primary, '#8A2387']} style={styles.ticketHeader}>
                                    <Text style={styles.ticketTitle}>{eventData.title}</Text>
                                    <Text style={styles.ticketType}>{isPaidEvent ? 'VIP ACCESS' : 'GENERAL ADMISSION'}</Text>
                                </LinearGradient>
                                <View style={styles.ticketBody}>
                                    <View style={styles.qrArea}><Ionicons name="qr-code" size={120} color="#000" /></View>
                                    <Text style={styles.ticketId}>ID: #{Math.random().toString().slice(2,10)}</Text>
                                    <Text style={styles.ticketNote}>Present this QR code at the entrance.</Text>
                                </View>
                            </View>
                        </View>
                    ) : (
                        <View style={styles.emptyState}>
                            <Ionicons name="lock-closed-outline" size={50} color={Colors.textSecondary} />
                            <Text style={styles.emptyText}>Register to view your ticket</Text>
                        </View>
                    )
                )}
            </ScrollView>

            <PaymentModal 
                visible={showPaymentModal} 
                onClose={() => setShowPaymentModal(false)}
                event={eventData}
                onConfirm={finalizeRegistration}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.darkBackground },
    headerImage: { height: 300, justifyContent: 'space-between' },
    headerGradient: { ...StyleSheet.absoluteFillObject },
    navbar: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20 },
    glassBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' },
    titleContainer: { padding: 20 },
    mainBadge: { backgroundColor: Colors.primary, alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, marginBottom: 8 },
    mainBadgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
    mainTitle: { fontFamily: 'Poppins_700Bold', fontSize: 26, color: '#fff' },
    subtitleText: { fontFamily: 'Poppins_400Regular', color: 'rgba(255,255,255,0.9)', fontSize: 14 },
    tabContainer: { flexDirection: 'row', paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
    tabItem: { marginRight: 30, paddingVertical: 15 },
    tabText: { fontFamily: 'Poppins_500Medium', color: Colors.textSecondary, fontSize: 15 },
    activeTabText: { color: '#fff', fontFamily: 'Poppins_600SemiBold' },
    activeIndicator: { height: 3, backgroundColor: Colors.primary, marginTop: 4 },
    scrollContent: { padding: 20 },

    // Info Grid
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
    infoBox: { backgroundColor: Colors.surface, flex: 1, marginHorizontal: 4, borderRadius: 12, padding: 12, alignItems: 'center' },
    infoValue: { color: '#fff', fontWeight: 'bold', fontSize: 14, marginTop: 5 },
    infoLabel: { color: Colors.textSecondary, fontSize: 10 },

    sectionHeader: { fontFamily: 'Poppins_600SemiBold', color: '#fff', fontSize: 18, marginBottom: 10 },
    description: { fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, lineHeight: 22, marginBottom: 20 },
    registerButton: { borderRadius: 16, overflow: 'hidden', marginTop: 10 },
    gradientBtn: { paddingVertical: 18, alignItems: 'center', justifyContent: 'center' },
    registerText: { color: '#fff', fontFamily: 'Poppins_600SemiBold', fontSize: 16 },
    registeredBox: { backgroundColor: 'rgba(76, 175, 80, 0.15)', borderColor: '#4CAF50', borderWidth: 1, borderRadius: 12, padding: 20, alignItems: 'center', marginTop: 10 },
    registeredText: { color: '#4CAF50', fontWeight: 'bold', marginTop: 5 },

    // Ticket
    ticketContainer: { alignItems: 'center', marginTop: 10 },
    ticketCard: { backgroundColor: '#fff', width: '100%', borderRadius: 20, overflow: 'hidden' },
    ticketHeader: { padding: 15, alignItems: 'center' },
    ticketTitle: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    ticketType: { color: 'rgba(255,255,255,0.8)', fontSize: 10, letterSpacing: 1, marginTop: 2 },
    ticketBody: { padding: 30, alignItems: 'center' },
    qrArea: { padding: 10, borderWidth: 2, borderColor: '#000', borderRadius: 10, marginBottom: 15 },
    ticketId: { fontWeight: 'bold', fontSize: 16, color: '#333' },
    ticketNote: { color: '#666', fontSize: 12, marginTop: 5 },
    emptyState: { alignItems: 'center', marginTop: 50 },
    emptyText: { color: Colors.textSecondary, marginTop: 10 },
});

export default EventDetailScreen;