import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TouchableWithoutFeedback, Dimensions } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

const OptionItem = ({ icon, title, subtitle, color, onPress, isMaterial }) => (
    <TouchableOpacity style={styles.optionContainer} onPress={onPress} activeOpacity={0.7}>
        <View style={[styles.iconBox, { backgroundColor: color + '20' }]}>
            {isMaterial ? (
                <MaterialIcons name={icon} size={26} color={color} />
            ) : (
                <Ionicons name={icon} size={26} color={color} />
            )}
        </View>
        <View style={styles.textContainer}>
            <Text style={styles.optionTitle}>{title}</Text>
            <Text style={styles.optionSubtitle}>{subtitle}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#52525b" />
    </TouchableOpacity>
);

const WatchSelectionModal = ({ visible, onClose, onSelectOption }) => {
    return (
        <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay}>
                    <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
                    <View style={styles.modalContent}>
                        <View style={styles.handle} />
                        <Text style={styles.headerTitle}>Watch Options</Text>
                        
                        <OptionItem 
                            icon="play-circle" 
                            title="Watch Now" 
                            subtitle="Resume where you left off" 
                            color="#fff" 
                            onPress={() => onSelectOption('alone')}
                        />
                        
                        <OptionItem 
                            icon="people" 
                            title="Watch Party" 
                            subtitle="Stream with friends in real-time" 
                            color="#E50914" 
                            onPress={() => onSelectOption('party')}
                        />
                        
                        <OptionItem 
                            icon="cast-connected" 
                            title="Cast to Device" 
                            subtitle="Living Room TV • Chromecast" 
                            color="#3B82F6" 
                            isMaterial
                            onPress={() => onSelectOption('cast')}
                        />

                        <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                            <Text style={styles.cancelText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
    modalContent: { backgroundColor: '#18181b', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40, width: width },
    handle: { width: 40, height: 4, backgroundColor: '#3f3f46', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
    headerTitle: { fontSize: 20, fontWeight: '700', color: '#fff', marginBottom: 24, textAlign: 'center' },
    optionContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#27272a', padding: 16, borderRadius: 16, marginBottom: 12 },
    iconBox: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
    textContainer: { flex: 1 },
    optionTitle: { fontSize: 16, fontWeight: '600', color: '#fff' },
    optionSubtitle: { fontSize: 13, color: '#a1a1aa', marginTop: 2 },
    cancelButton: { marginTop: 12, alignItems: 'center', padding: 12 },
    cancelText: { color: '#71717a', fontSize: 15, fontWeight: '500' },
});

export default WatchSelectionModal;