import React, { useState } from 'react';
import { 
    View, Text, StyleSheet, ImageBackground, TouchableOpacity, ScrollView, 
    Dimensions, ActivityIndicator, Alert, Share, Linking, Modal, Platform 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@config/Colors';
import { useEvents } from '@context/hub/EventsContext';
import { useAlert } from '@context/other/AlertContext';

const { width } = Dimensions.get('window');

// --- PAYMENT MODAL COMPONENT ---
const PaymentModal = ({ visible, onClose, event, onConfirm }) => {
    const [step, setStep] = useState(1); // 1: Method, 2: Gateway, 3: Processing
    const [method, setMethod] = useState('gcash');

    const handlePay = () => {
        setStep(3);
        // Pass payment details back
        onConfirm({ method, amount: event.price });
    };

    const reset = () => { setStep(1); onClose(); };

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={reset}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Secure Checkout</Text>
                        <TouchableOpacity onPress={reset}><Ionicons name="close" size={24} color="#000" /></TouchableOpacity>
                    </View>
                    
                    <View style={styles.summaryBox}>
                        <Text style={styles.summaryTitle}>{event?.title}</Text>
                        <Text style={styles.summaryPrice}>Total: ₱{event?.price?.toLocaleString()}</Text>
                    </View>

                    {step === 1 && (
                        <View style={{ width: '100%' }}>
                            <Text style={styles.sectionLabel}>Select Payment Method</Text>
                            <TouchableOpacity style={[styles.payMethod, method === 'gcash' && styles.payMethodActive]} onPress={() => setMethod('gcash')}>
                                <View style={{flexDirection:'row', alignItems:'center'}}>
                                    <View style={[styles.iconBox, {backgroundColor:'#007AFF'}]}><Ionicons name="phone-portrait-outline" size={20} color="#fff" /></View>
                                    <Text style={styles.payText}>GCash / E-Wallet</Text>
                                </View>
                                {method === 'gcash' && <Ionicons name="checkmark-circle" size={22} color="#007AFF" />}
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.payMethod, method === 'card' && styles.payMethodActive]} onPress={() => setMethod('card')}>
                                <View style={{flexDirection:'row', alignItems:'center'}}>
                                    <View style={[styles.iconBox, {backgroundColor:'#FF9500'}]}><Ionicons name="card-outline" size={20} color="#fff" /></View>
                                    <Text style={styles.payText}>Credit/Debit Card</Text>
                                </View>
                                {method === 'card' && <Ionicons name="checkmark-circle" size={22} color="#FF9500" />}
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.payBtnMain} onPress={() => setStep(2)}>
                                <Text style={styles.payBtnText}>Next</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {step === 2 && (
                        <View style={{ alignItems: 'center', width: '100%' }}>
                            {method === 'gcash' ? (
                                <>
                                    <Text style={styles.gatewayTitle}>Scan to Pay</Text>
                                    <View style={styles.qrContainer}>
                                        <Ionicons name="qr-code" size={140} color="#000" />
                                    </View>
                                    <Text style={styles.qrNumber}>0917-123-4567</Text>
                                    <Text style={styles.qrNote}>Please attach reference no. automatically.</Text>
                                </>
                            ) : (
                                <View style={styles.cardForm}>
                                    <Ionicons name="card" size={40} color="#666" style={{marginBottom:10}}/>
                                    <Text>Card Payment Simulator</Text>
                                    <Text style={{color:'#999', fontSize:12}}>Ending in **** 4242</Text>
                                </View>
                            )}
                            <TouchableOpacity style={styles.payBtnMain} onPress={handlePay}>
                                <Text style={styles.payBtnText}>Confirm Payment ₱{event?.price}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setStep(1)} style={{marginTop: 15}}>
                                <Text style={{color:'#666'}}>Back</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {step === 3 && (
                        <View style={{ alignItems: 'center', padding: 40 }}>
                            <ActivityIndicator size="large" color={Colors.primary} />
                            <Text style={{ marginTop: 20, fontWeight: '600' }}>Processing Transaction...</Text>
                            <Text style={{ color:'#999', fontSize:12 }}>Please do not close this window.</Text>
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );
};

// --- MAIN SCREEN ---
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

    // --- ACTIONS ---

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
        // Use coordinates if available, otherwise query
        const query = eventData.coordinates 
            ? `${eventData.coordinates.lat},${eventData.coordinates.lng}` 
            : eventData.location;
        const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
        const latLng = Platform.select({ ios: `${eventData.title}@${query}`, android: query });
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
        if (!isPaidEvent) setIsProcessing(true); // Only show spinner here for free events, modal handles it for paid
        
        const success = await joinEvent(eventData?.id, paymentDetails);
        
        setIsProcessing(false);
        setShowPaymentModal(false);

        if (success) {
        // --- FIXED: Replaced Alert.alert with the custom showAlert ---
        showAlert({
            type: 'success',
            title: "Success!",
            message: "You have secured your ticket for the event.",
            btnText: "View My Ticket",
            // The onClose callback is triggered when the main button is pressed
            onClose: () => setActiveTab('Ticket') 
        });
        } else {
        // Optionally handle the failure case with another alert
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

    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
    modalContainer: { backgroundColor: '#fff', borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 25, minHeight: 450 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 20, fontWeight: 'bold' },
    summaryBox: { backgroundColor: '#f5f5f5', padding: 15, borderRadius: 10, marginBottom: 20 },
    summaryTitle: { fontSize: 14, color: '#666' },
    summaryPrice: { fontSize: 18, fontWeight: 'bold', color: Colors.primary, marginTop: 5 },
    sectionLabel: { fontSize: 14, fontWeight: '600', marginBottom: 10, color: '#333' },
    payMethod: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 15, borderRadius: 12, borderWidth: 1, borderColor: '#eee', marginBottom: 10 },
    payMethodActive: { borderColor: '#007AFF', backgroundColor: '#eff6ff' },
    iconBox: { width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
    payText: { fontWeight: '500' },
    payBtnMain: { backgroundColor: Colors.primary, padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 20 },
    payBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    qrContainer: { padding: 10, borderWidth: 1, borderColor: '#ddd', borderRadius: 10, marginBottom: 10 },
    qrNumber: { fontSize: 20, fontWeight: 'bold', letterSpacing: 1 },
    qrNote: { fontSize: 12, color: '#999', marginTop: 5 },
    cardForm: { width: '100%', padding: 20, backgroundColor: '#f0f0f0', borderRadius: 10, alignItems: 'center', marginBottom: 10 },
    gatewayTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 15 }
});

export default EventDetailScreen;