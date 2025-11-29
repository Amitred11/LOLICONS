import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur'; // Ensure you have expo-blur installed
import { Colors } from '../../../../constants/Colors';

const OptionItem = ({ icon, title, subtitle, color, onPress }) => (
    <TouchableOpacity style={styles.optionContainer} onPress={onPress} activeOpacity={0.7}>
        <View style={[styles.iconBox, { backgroundColor: color + '20' }]}>
            <Ionicons name={icon} size={28} color={color} />
        </View>
        <View style={styles.textContainer}>
            <Text style={styles.optionTitle}>{title}</Text>
            <Text style={styles.optionSubtitle}>{subtitle}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
    </TouchableOpacity>
);

const WatchSelectionModal = ({ visible, onClose, onSelectOption }) => {
    return (
        <Modal visible={visible} transparent animationType="fade">
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay}>
                    <BlurView intensity={20} style={StyleSheet.absoluteFill} tint="dark" />
                    
                    <View style={styles.modalContent}>
                        <View style={styles.handle} />
                        <Text style={styles.headerTitle}>How do you want to watch?</Text>
                        
                        <OptionItem 
                            icon="play-circle" 
                            title="Watch Alone" 
                            subtitle="Resume from where you left off" 
                            color="#4FACFE" 
                            onPress={() => onSelectOption('alone')}
                        />
                        
                        <OptionItem 
                            icon="people" 
                            title="Watch Party" 
                            subtitle="Invite friends and watch together" 
                            color="#FF6B6B" 
                            onPress={() => onSelectOption('party')}
                        />
                        
                        <OptionItem 
                            icon="radio" 
                            title="Join Live Premiere" 
                            subtitle="Watch with the global community" 
                            color="#A742F5" 
                            onPress={() => onSelectOption('live')}
                        />
                        
                        <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#1A1A1A', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24, paddingBottom: 40 },
    handle: { width: 40, height: 5, backgroundColor: '#333', borderRadius: 3, alignSelf: 'center', marginBottom: 20 },
    headerTitle: { fontFamily: 'Poppins_600SemiBold', color: '#fff', fontSize: 18, marginBottom: 20, textAlign: 'center' },
    optionContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#252525', padding: 16, borderRadius: 16, marginBottom: 12 },
    iconBox: { width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
    textContainer: { flex: 1 },
    optionTitle: { fontFamily: 'Poppins_600SemiBold', color: '#fff', fontSize: 16 },
    optionSubtitle: { fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, fontSize: 12, marginTop: 2 },
    cancelButton: { marginTop: 10, alignItems: 'center', padding: 15 },
    cancelText: { fontFamily: 'Poppins_500Medium', color: Colors.textSecondary, fontSize: 15 },
});

export default WatchSelectionModal;