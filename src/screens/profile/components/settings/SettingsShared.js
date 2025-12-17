import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@config/Colors';

export const SettingsRow = ({ icon, label, details, onPress, isLast, color = Colors.text }) => (
    <TouchableOpacity 
        onPress={onPress} 
        style={[styles.row, !isLast && styles.rowBorder]}
        activeOpacity={0.7}
    >
        <View style={[styles.iconBox, { backgroundColor: color === Colors.danger ? 'rgba(231, 76, 60, 0.1)' : 'rgba(255,255,255,0.05)' }]}>
            <Ionicons name={icon} size={20} color={color} />
        </View>
        <View style={styles.rowTextContainer}>
            <Text style={[styles.rowLabel, { color }]}>{label}</Text>
        </View>
        {details && <Text style={styles.rowDetails}>{details}</Text>}
        <Ionicons name="chevron-forward" size={18} color={Colors.surface} />
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 16 },
    rowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(255,255,255,0.05)' },
    iconBox: { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    rowTextContainer: { flex: 1 },
    rowLabel: { fontFamily: 'Poppins_500Medium', fontSize: 15 },
    rowDetails: { fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, fontSize: 13, marginRight: 8, opacity: 0.7 },
});