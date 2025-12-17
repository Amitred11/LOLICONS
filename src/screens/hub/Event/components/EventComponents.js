import React, { useState } from 'react';
import { 
    View, Text, StyleSheet, ImageBackground, TouchableOpacity, 
    Modal, ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Colors } from '@config/Colors';

// --- COMPONENT 1: PAYMENT MODAL ---
export const PaymentModal = ({ visible, onClose, event, onConfirm }) => {
    const [step, setStep] = useState(1); // 1: Method, 2: Gateway, 3: Processing
    const [method, setMethod] = useState('gcash');

    const handlePay = () => {
        setStep(3);
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

// --- COMPONENT 2: FEATURED EVENT CARD ---
export const FeaturedEvent = ({ item, onPress }) => {
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

// --- COMPONENT 3: EVENT LIST ROW ---
export const EventRow = ({ item, onPress, index }) => {
    const dateParts = item.date.split(' ');
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

const styles = StyleSheet.create({
    // Modal Styles
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
    gatewayTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 15 },

    // Featured Event Styles
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

    // Event Row Styles
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
});