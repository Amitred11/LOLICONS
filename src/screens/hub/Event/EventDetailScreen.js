import React, { useState } from 'react';
import { 
    View, Text, StyleSheet, ImageBackground, TouchableOpacity, ScrollView, 
    ActivityIndicator, Share, Linking, Platform 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEvents } from '@context/hub/EventsContext';
import { useAlert } from '@context/other/AlertContext';
import { PaymentModal } from './components/EventComponents';
import { Colors } from '@config/Colors';

const EventDetailScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const insets = useSafeAreaInsets();
    const { eventData } = route.params || {}; 
    const { joinEvent, hasTicket } = useEvents();
    const { showAlert } = useAlert();
    
    const [activeTab, setActiveTab] = useState('Overview');
    const [isProcessing, setIsProcessing] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [registrationData, setRegistrationData] = useState(null);

    const ticketOwned = hasTicket(eventData?.id);

    const openMaps = () => {
        const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
        const url = Platform.select({
            ios: `${scheme}${eventData.location}`,
            android: `${scheme}${eventData.location}`
        });
        Linking.openURL(url);
    };

    const handleJoinPress = () => {
        if (eventData.price === 0) {
            // If Free, skip modal and join directly
            handleFinalize({ type: 'free', method: 'Free Admission', label: 'FREE PASS' });
        } else {
            setShowModal(true);
        }
    };

    const handleFinalize = async (paymentDetails) => {
        setIsProcessing(true);
        const success = await joinEvent(eventData?.id, paymentDetails);
        setIsProcessing(false);
        
        if (success) {
            setRegistrationData(paymentDetails);
            setShowModal(false);
            showAlert({
                type: 'success',
                title: eventData.price === 0 ? "Registered!" : "Ticket Purchased!",
                message: eventData.price === 0 
                    ? "Your free spot is reserved. See you there!" 
                    : "Confirmation sent to your email. Check your Entry tab.",
                btnText: "View My Entry",
                onClose: () => setActiveTab('Entry') 
            });
        }
    };

    return (
        <View style={styles.container}>
            {/* HERO SECTION */}
            <ImageBackground source={eventData?.image} style={styles.hero}>
                <LinearGradient colors={['rgba(7,7,12,0.1)', 'rgba(7,7,12,0.6)', '#07070C']} style={styles.grad} />
                
                <View style={[styles.nav, { marginTop: insets.top + 10 }]}>
                    <TouchableOpacity style={styles.glassBtn} onPress={() => navigation.goBack()}>
                        <Ionicons name="chevron-back" size={22} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.glassBtn} onPress={() => Share.share({message: `Join me at ${eventData?.title}!`})}>
                        <Feather name="share" size={20} color="#fff" />
                    </TouchableOpacity>
                </View>

                <View style={styles.titleWrap}>
                    <View style={styles.categoryBadge}>
                        <Text style={styles.categoryText}>{eventData?.category?.toUpperCase()}</Text>
                    </View>
                    <Text style={styles.title}>{eventData?.title}</Text>
                </View>
            </ImageBackground>

            {/* TABS NAVIGATION */}
            <View style={styles.tabContainer}>
                {['Overview', 'Entry'].map((tab) => (
                    <TouchableOpacity 
                        key={tab} 
                        style={[styles.tabItem, activeTab === tab && styles.activeTabItem]} 
                        onPress={() => setActiveTab(tab)}
                    >
                        <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {activeTab === 'Overview' ? (
                    <View>
                        {/* PREMIUM INFO BAR */}
                        <View style={styles.infoBar}>
                            <View style={styles.infoItem}>
                                <Text style={styles.infoLabel}>DATE</Text>
                                <Text style={styles.infoValue}>{eventData?.date}</Text>
                            </View>
                            <View style={styles.infoDivider} />
                            <View style={styles.infoItem}>
                                <Text style={styles.infoLabel}>TIME</Text>
                                <Text style={styles.infoValue}>{eventData?.time}</Text>
                            </View>
                            <View style={styles.infoDivider} />
                            <View style={styles.infoItem}>
                                <Text style={styles.infoLabel}>ADMISSION</Text>
                                <Text style={[styles.infoValue, {color: eventData?.price > 0 ? Colors.primary : '#00E676'}]}>
                                    {eventData?.price > 0 ? `₱${eventData.price.toLocaleString()}` : 'FREE'}
                                </Text>
                            </View>
                        </View>

                        {/* EXPERIENCE SECTION */}
                        <Text style={styles.sectionHeader}>The Experience</Text>
                        <Text style={styles.desc}>{eventData?.description}</Text>

                        {/* VENUE CARD */}
                        <Text style={styles.sectionHeader}>Venue & Location</Text>
                        <TouchableOpacity style={styles.venueCard} onPress={openMaps}>
                            <View style={styles.venueIconContainer}>
                                <MaterialCommunityIcons name="map-marker-radius" size={28} color={Colors.primary} />
                            </View>
                            <View style={styles.venueInfo}>
                                <Text style={styles.venueName}>{eventData?.location}</Text>
                                <Text style={styles.venueSub}>Tap to open in Maps</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#333" />
                        </TouchableOpacity>

                        {/* CTA BUTTON */}
                        <View style={styles.ctaContainer}>
                            {!ticketOwned ? (
                                <TouchableOpacity 
                                    style={styles.mainBtn} 
                                    onPress={handleJoinPress}
                                    disabled={isProcessing}
                                >
                                    <LinearGradient 
                                        colors={eventData.price > 0 ? [Colors.primary, '#4F46E5'] : ['#00E676', '#00A354']} 
                                        style={styles.btnGrad}
                                    >
                                        {isProcessing ? (
                                            <ActivityIndicator color="#fff" />
                                        ) : (
                                            <View style={styles.btnContent}>
                                                <Text style={styles.btnTxt}>
                                                    {eventData.price > 0 ? 'SECURE ENTRY PASS' : 'GET FREE TICKET'}
                                                </Text>
                                                <Ionicons name="arrow-forward" size={18} color="#fff" style={{marginLeft: 8}} />
                                            </View>
                                        )}
                                    </LinearGradient>
                                </TouchableOpacity>
                            ) : (
                                <View style={styles.ownedBox}>
                                    <View style={styles.checkCircle}>
                                        <Ionicons name="checkmark" size={16} color="#fff" />
                                    </View>
                                    <Text style={styles.ownedTxt}>YOU ARE REGISTERED</Text>
                                </View>
                            )}
                        </View>
                    </View>
                ) : (
                   /* ENTRY TAB - FIXED QR CONTRAST */
                   <View style={styles.entrySection}>
                       {ticketOwned ? (
                            <View style={styles.ticketStub}>
                                <Text style={styles.stubType}>
                                    {eventData.price === 0 ? 'FREE ENTRY PASS' : registrationData?.label || 'OFFICIAL TICKET'}
                                </Text>
                                {/* QR Code fixed with high contrast: Black icon on White Background */}
                                <View style={styles.qrContainer}>
                                    <Ionicons name="qr-code" size={180} color="#000" />
                                </View>
                                <Text style={styles.stubId}>REF: EV-{eventData?.id?.toUpperCase()}</Text>
                                <Text style={styles.scanInst}>Please present this QR code to the usher</Text>
                            </View> 
                       ) : (
                            <View style={styles.emptyEntry}>
                                <MaterialCommunityIcons name="ticket-outline" size={80} color="#161621" />
                                <Text style={styles.noTicket}>Register in the Overview tab to get your QR code.</Text>
                            </View>
                       )}
                   </View>
                )}
            </ScrollView>

            <PaymentModal 
                visible={showModal} 
                onClose={() => setShowModal(false)} 
                event={eventData} 
                onConfirm={handleFinalize} 
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#07070C' },
    hero: { height: 380, justifyContent: 'space-between' },
    grad: { ...StyleSheet.absoluteFillObject },
    nav: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20 },
    glassBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
    
    titleWrap: { padding: 24, paddingBottom: 30 },
    categoryBadge: { backgroundColor: Colors.primary, alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, marginBottom: 12 },
    categoryText: { color: '#fff', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
    title: { color: '#fff', fontSize: 32, fontWeight: '900', lineHeight: 38 },
    qrContainer: { 
        padding: 20, 
        backgroundColor: '#FFFFFF', // Pure white for scanners
        borderRadius: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5
    },
    tabContainer: { flexDirection: 'row', paddingHorizontal: 24, backgroundColor: '#07070C' },
    tabItem: { marginRight: 30, paddingVertical: 15, opacity: 0.5 },
    activeTabItem: { opacity: 1, borderBottomWidth: 3, borderBottomColor: Colors.primary },
    tabText: { color: '#fff', fontWeight: '800', fontSize: 15 },
    activeTabText: { color: '#fff' },

    content: { padding: 24, paddingBottom: 100 },
    
    // NEW INFO BAR
    infoBar: { flexDirection: 'row', backgroundColor: '#11111A', borderRadius: 24, padding: 20, marginBottom: 32, borderWidth: 1, borderColor: '#1E1E2E', alignItems: 'center' },
    infoItem: { flex: 1, alignItems: 'center' },
    infoDivider: { width: 1, height: 30, backgroundColor: '#1E1E2E' },
    infoLabel: { color: '#555', fontSize: 10, fontWeight: '800', marginBottom: 6, letterSpacing: 0.5 },
    infoValue: { color: '#fff', fontSize: 14, fontWeight: '700' },

    sectionHeader: { color: '#fff', fontSize: 18, fontWeight: '900', marginBottom: 16, letterSpacing: -0.5 },
    desc: { color: '#999', lineHeight: 26, fontSize: 15, marginBottom: 32 },
    
    // VENUE CARD
    venueCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#11111A', padding: 16, borderRadius: 20, borderWidth: 1, borderColor: '#1E1E2E' },
    venueIconContainer: { width: 50, height: 50, backgroundColor: '#161621', borderRadius: 15, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
    venueInfo: { flex: 1 },
    venueName: { color: '#fff', fontSize: 15, fontWeight: '700', marginBottom: 4 },
    venueSub: { color: '#555', fontSize: 12, fontWeight: '600' },

    ctaContainer: { marginTop: 40 },
    mainBtn: { borderRadius: 20, overflow: 'hidden', elevation: 8, shadowColor: Colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20 },
    btnGrad: { paddingVertical: 20, alignItems: 'center' },
    btnContent: { flexDirection: 'row', alignItems: 'center' },
    btnTxt: { color: '#fff', fontSize: 16, fontWeight: '900', letterSpacing: 1 },
    
    ownedBox: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: 'rgba(16,185,129,0.05)', borderRadius: 20, borderWidth: 1, borderColor: '#10B981' },
    checkCircle: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#10B981', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    ownedTxt: { color: '#10B981', fontWeight: '900', fontSize: 14, letterSpacing: 1 },
    
    // ENTRY TAB POLISH
    entrySection: { alignItems: 'center' },
    ticketStub: { width: '100%', backgroundColor: '#11111A', borderRadius: 32, padding: 32, alignItems: 'center', borderStyle: 'dashed', borderWidth: 1, borderColor: '#333' },
    stubType: { color: '#555', fontWeight: '900', fontSize: 11, letterSpacing: 2, marginBottom: 30 },
    qrContainer: { padding: 20, backgroundColor: '#fff', borderRadius: 24 }, // High contrast for scanning
    stubId: { color: '#fff', marginTop: 30, fontWeight: '900', fontSize: 18, letterSpacing: 1 },
    scanInst: { color: '#555', fontSize: 12, marginTop: 10, textAlign: 'center' },
    emptyEntry: { alignItems: 'center', marginTop: 80 },
    noTicket: { color: '#333', textAlign: 'center', marginTop: 20, fontWeight: '700', fontSize: 16, width: '80%' }
});

export default EventDetailScreen;