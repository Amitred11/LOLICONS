import React from 'react';
import { View, Text, Switch, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@config/Colors';

export const NotificationRow = ({ label, description, value, onValueChange, isLast, disabled }) => (
    <View style={[styles.row, !isLast && styles.rowBorder, disabled && { opacity: 0.5 }]}>
        <View style={styles.textContainer}>
            <Text style={styles.rowLabel}>{label}</Text>
            {description && <Text style={styles.rowDescription}>{description}</Text>}
        </View>
        <Switch
            value={value}
            onValueChange={onValueChange}
            trackColor={{ false: Colors.surface, true: Colors.secondary }}
            thumbColor={value ? Colors.text : '#f4f3f4'}
            disabled={disabled}
        />
    </View>
);

export const QuietHoursRow = ({ onPress, currentSettings }) => (
    <TouchableOpacity onPress={onPress} style={styles.row}>
        <View style={styles.textContainer}>
            <Text style={styles.rowLabel}>Quiet Hours</Text>
            <Text style={styles.rowDescription}>Mute notifications during specific times.</Text>
        </View>
        <View style={styles.rowRight}>
            <Text style={styles.quietHoursValue}>
                {currentSettings?.enabled ? `${currentSettings.start} - ${currentSettings.end}` : 'Off'}
            </Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
        </View>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 15 },
    rowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(255,255,255,0.1)' },
    textContainer: { flex: 1, marginRight: 15 },
    rowLabel: { fontFamily: 'Poppins_500Medium', color: Colors.text, fontSize: 16 },
    rowDescription: { fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, fontSize: 13, marginTop: 3 },
    rowRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    quietHoursValue: { fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, fontSize: 16 },
});