import React, { useState } from 'react';
import { 
    View, Text, StyleSheet, ImageBackground, TouchableOpacity, 
    Modal, ActivityIndicator, Image, Dimensions, Platform
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInRight, ScaleInCenter } from 'react-native-reanimated';
import { Colors } from '@config/Colors';

const { width } = Dimensions.get('window');

// --- COMPONENT 1: MODERN DARK PAYMENT MODAL ---
export const PaymentModal = ({ visible, onClose, event, onConfirm }) => {
    const [step, setStep] = useState(1);
    const [paymentType, setPaymentType] = useState(null); 
    const [method, setMethod] = useState('gcash');

    const reset = () => { setStep(1); setPaymentType(null); onClose(); };

    const handleAction = () => {
        if (paymentType === 'venue') {
            // Logic for Reservation
            onConfirm({ 
                type: 'reservation', 
                method: 'Pay at Venue', 
                amount: event.price,
                label: 'RESERVATION SLOT' 
            });
        } else if (step === 1) {
            setStep(2);
        } else {
            setStep(3);
            // Logic for Ticket
            setTimeout(() => onConfirm({ 
                type: 'ticket', 
                method, 
                amount: event.price,
                label: 'OFFICIAL TICKET'
            }), 2000);
        }
    };

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={reset}>
            <View style={styles.modalOverlay}>
                <View style={styles.darkModalContainer}>
                    <View style={styles.modalHandle} />
                    
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Secure Entry</Text>
                        <TouchableOpacity onPress={reset} style={styles.closeCircle}>
                            <Ionicons name="close" size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    {step < 3 && (
                        <View style={styles.eventSummaryMini}>
                            <Image source={event?.image} style={styles.miniImg} />
                            <View style={{flex:1}}>
                                <Text style={styles.miniName} numberOfLines={1}>{event?.title}</Text>
                                <Text style={styles.miniPrice}>₱{event?.price?.toLocaleString()}</Text>
                            </View>
                            <View style={[styles.badge, { backgroundColor: paymentType === 'venue' ? 'rgba(255, 193, 7, 0.2)' : 'rgba(99, 102, 241, 0.2)' }]}>
                                <Text style={[styles.badgeText, { color: paymentType === 'venue' ? '#FFC107' : Colors.primary }]}>
                                    {paymentType === 'venue' ? 'SLOT' : 'TICKET'}
                                </Text>
                            </View>
                        </View>
                    )}

                    {step === 1 && (
                        <Animated.View entering={FadeInDown}>
                            <Text style={styles.label}>Select Entry Method</Text>
                            <TouchableOpacity 
                                style={[styles.optionCard, paymentType === 'online' && styles.optionActive]}
                                onPress={() => setPaymentType('online')}
                            >
                                <View style={styles.iconWrap}><Ionicons name="card" size={22} color={Colors.primary} /></View>
                                <View style={{flex:1, marginLeft: 15}}>
                                    <Text style={styles.optionTitle}>Buy Digital Ticket</Text>
                                    <Text style={styles.optionSub}>Instant entry & skip the line</Text>
                                </View>
                                <Ionicons name={paymentType === 'online' ? "radio-button-on" : "radio-button-off"} size={20} color={Colors.primary} />
                            </TouchableOpacity>

                            <TouchableOpacity 
                                style={[styles.optionCard, paymentType === 'venue' && styles.optionActive]}
                                onPress={() => setPaymentType('venue')}
                            >
                                <View style={styles.iconWrap}><Ionicons name="calendar" size={22} color="#00E676" /></View>
                                <View style={{flex:1, marginLeft: 15}}>
                                    <Text style={styles.optionTitle}>Reserve a Slot</Text>
                                    <Text style={styles.optionSub}>
                                        {event.price > 0 ? `Pay ₱${event.price} at the venue` : 'No payment required'}
                                    </Text>
                                </View>
                                <Ionicons name={paymentType === 'venue' ? "radio-button-on" : "radio-button-off"} size={20} color="#00E676" />
                            </TouchableOpacity>
                        </Animated.View>
                    )}

                    {step === 2 && (
                        <Animated.View entering={FadeInRight}>
                            <Text style={styles.label}>Online Payment Method</Text>
                            <View style={styles.methodGrid}>
                                {['gcash', 'card', 'maya'].map((m) => (
                                    <TouchableOpacity 
                                        key={m} 
                                        style={[styles.methodItem, method === m && styles.methodActive]}
                                        onPress={() => setMethod(m)}
                                    >
                                        <Text style={[styles.methodText, method === m && {color: '#fff'}]}>{m.toUpperCase()}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                            <View style={styles.qrSimulation}>
                                <MaterialCommunityIcons name="qrcode-scan" size={80} color={Colors.primary} />
                                <Text style={styles.qrText}>Scan to Pay ₱{event.price}</Text>
                            </View>
                        </Animated.View>
                    )}

                    {! (step === 3) && (
                        <TouchableOpacity 
                            disabled={!paymentType} 
                            style={[styles.mainActionBtn, !paymentType && {opacity: 0.5}]}
                            onPress={handleAction}
                        >
                            <LinearGradient colors={[Colors.primary, '#4F46E5']} style={styles.btnGradient}>
                                <Text style={styles.btnText}>
                                    {paymentType === 'venue' ? 'Confirm Reservation' : step === 1 ? 'Next' : 'Complete Purchase'}
                                </Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </Modal>
    );
};

// --- COMPONENT 2: MODERN FEATURED CARD ---
export const FeaturedEvent = ({ item, onPress }) => (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={styles.featContainer}>
        <ImageBackground source={item.image} style={styles.featImage}>
            <LinearGradient colors={['transparent', 'rgba(15,15,23,0.95)']} style={styles.featOverlay}>
                <View style={styles.featTop}>
                    <View style={styles.featBadge}><Text style={styles.featBadgeText}>HOT EVENT</Text></View>
                    <View style={styles.featPrice}><Text style={styles.featPriceText}>{item.price > 0 ? `₱${item.price.toLocaleString()}` : 'FREE'}</Text></View>
                </View>
                <View>
                    <Text style={styles.featTitle}>{item.title}</Text>
                    <View style={styles.featMeta}>
                        <Ionicons name="time-outline" size={14} color={Colors.primary} />
                        <Text style={styles.featMetaText}>{item.date} • {item.time}</Text>
                    </View>
                </View>
            </LinearGradient>
        </ImageBackground>
    </TouchableOpacity>
);

// --- COMPONENT 3: MODERN EVENT ROW ---
export const EventRow = ({ item, onPress, index }) => (
    <Animated.View entering={FadeInDown.delay(index * 100)}>
        <TouchableOpacity style={styles.rowContainer} onPress={onPress}>
            <Image source={item.image} style={styles.rowImg} />
            <View style={styles.rowInfo}>
                <Text style={styles.rowCat}>{item.category}</Text>
                <Text style={styles.rowTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.rowLoc}><Ionicons name="location" size={10} /> {item.location}</Text>
            </View>
            <View style={styles.rowPriceSide}>
                <Text style={[styles.rowPriceTxt, {color: item.price > 0 ? Colors.primary : '#00E676'}]}>
                    {item.price > 0 ? `₱${item.price.toLocaleString()}` : 'FREE'}
                </Text>
                <Ionicons name="chevron-forward" size={16} color="#444" />
            </View>
        </TouchableOpacity>
    </Animated.View>
);

const styles = StyleSheet.create({
    // Modal Styles
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
    darkModalContainer: { backgroundColor: '#161621', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    modalHandle: { width: 40, height: 4, backgroundColor: '#333', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
    modalTitle: { color: '#fff', fontSize: 22, fontWeight: '800' },
    closeCircle: { backgroundColor: '#252538', padding: 8, borderRadius: 20 },
    
    eventSummaryMini: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E1E2E', padding: 12, borderRadius: 16, marginBottom: 25 },
    miniImg: { width: 45, height: 45, borderRadius: 10 },
    miniName: { color: '#fff', fontSize: 15, fontWeight: '700', marginLeft: 12 },
    miniPrice: { color: Colors.primary, fontSize: 13, fontWeight: '600', marginLeft: 12 },
    badge: { backgroundColor: 'rgba(99, 102, 241, 0.2)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    badgeText: { color: Colors.primary, fontSize: 10, fontWeight: '800' },

    label: { color: '#aaa', fontSize: 13, fontWeight: '600', marginBottom: 15, textTransform: 'uppercase', letterSpacing: 1 },
    optionCard: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#1E1E2E', borderRadius: 18, marginBottom: 12, borderWidth: 1, borderColor: 'transparent' },
    optionActive: { borderColor: Colors.primary, backgroundColor: 'rgba(99, 102, 241, 0.05)' },
    iconWrap: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#252538', alignItems: 'center', justifyContent: 'center' },
    optionTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
    optionSub: { color: '#777', fontSize: 12 },

    mainActionBtn: { marginTop: 10, borderRadius: 16, overflow: 'hidden' },
    btnGradient: { paddingVertical: 18, alignItems: 'center' },
    btnText: { color: '#fff', fontSize: 16, fontWeight: '800' },

    methodGrid: { flexDirection: 'row', gap: 10, marginBottom: 20 },
    methodItem: { flex: 1, padding: 12, borderRadius: 12, backgroundColor: '#252538', alignItems: 'center' },
    methodActive: { backgroundColor: Colors.primary },
    methodText: { color: '#777', fontSize: 11, fontWeight: '800' },
    qrSimulation: { alignItems: 'center', padding: 30, backgroundColor: '#0F0F17', borderRadius: 20, borderDash: [5, 5], borderWidth: 1, borderColor: '#333' },
    qrText: { color: '#777', marginTop: 15, fontSize: 13 },
    loadingArea: { padding: 40, alignItems: 'center' },
    loadingText: { color: '#fff', marginTop: 20, fontWeight: '600' },

    // Featured Card
    featContainer: { width: '100%', height: 260, borderRadius: 24, overflow: 'hidden', marginBottom: 25 },
    featImage: { flex: 1 },
    featOverlay: { flex: 1, padding: 20, justifyContent: 'space-between' },
    featTop: { flexDirection: 'row', justifyContent: 'space-between' },
    featBadge: { backgroundColor: Colors.primary, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
    featBadgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },
    featPrice: { backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    featPriceText: { color: '#FFD700', fontSize: 12, fontWeight: '800' },
    featTitle: { color: '#fff', fontSize: 26, fontWeight: '800', marginBottom: 5 },
    featMeta: { flexDirection: 'row', alignItems: 'center' },
    featMetaText: { color: '#ccc', fontSize: 13, marginLeft: 6 },

    // Row Card
    rowContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#161621', padding: 12, borderRadius: 20, marginBottom: 12 },
    rowImg: { width: 70, height: 70, borderRadius: 15 },
    rowInfo: { flex: 1, marginLeft: 15 },
    rowCat: { color: Colors.primary, fontSize: 10, fontWeight: '800', marginBottom: 3 },
    rowTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
    rowLoc: { color: '#555', fontSize: 11, marginTop: 4 },
    rowPriceSide: { alignItems: 'flex-end', gap: 5 },
    rowPriceTxt: { fontSize: 13, fontWeight: '800' }
});