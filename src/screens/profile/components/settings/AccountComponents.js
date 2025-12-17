import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@config/Colors';

export const AccountRow = ({ icon, label, value, subtitle, onPress, isLast, color = Colors.text, copyable }) => (
    <TouchableOpacity 
        onPress={onPress} 
        style={[styles.row, !isLast && styles.rowBorder]} 
        disabled={!onPress}
        activeOpacity={onPress ? 0.6 : 1}
    >
        <View style={styles.rowLeft}>
            <View style={[styles.iconBox, { backgroundColor: color === Colors.danger ? 'rgba(231, 76, 60, 0.1)' : 'rgba(255,255,255,0.05)' }]}>
                <Ionicons name={icon} size={20} color={color === Colors.text ? Colors.textSecondary : color} />
            </View>
            <View>
                <Text style={[styles.rowLabel, { color }]}>{label}</Text>
                {subtitle && <Text style={styles.rowSubtitle}>{subtitle}</Text>}
            </View>
        </View>
        <View style={styles.rowRight}>
            <Text style={styles.rowValue}>{value}</Text>
            {copyable && <Ionicons name="copy-outline" size={16} color={Colors.textSecondary} style={{marginLeft: 8}} />}
            {onPress && !copyable && <Ionicons name="chevron-forward" size={18} color={Colors.surface} />}
        </View>
    </TouchableOpacity>
);

export const ConnectedAccountRow = ({ icon, name, isConnected, onConnect, isLast, isLoading }) => (
     <View style={[styles.row, !isLast && styles.rowBorder]}>
        <View style={styles.rowLeft}>
            <Ionicons name={icon} size={24} color={Colors.textSecondary} />
            <Text style={[styles.rowLabel, { marginLeft: 10 }]}>{name}</Text>
        </View>
        {isConnected ? (
            <View style={styles.connectedContainer}>
                <Ionicons name="checkmark-circle" size={18} color={'#2ecc71'} />
                <Text style={styles.connectedText}>Linked</Text>
            </View>
        ) : (
            <TouchableOpacity 
                style={[styles.connectButton, isLoading && { opacity: 0.7 }]} 
                onPress={onConnect}
                disabled={isLoading}
            >
                {isLoading ? (
                    <ActivityIndicator size="small" color={Colors.text} />
                ) : (
                    <Text style={styles.connectButtonText}>Connect</Text>
                )}
            </TouchableOpacity>
        )}
    </View>
);

const styles = StyleSheet.create({
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
    rowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(255,255,255,0.05)' },
    rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
    iconBox: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
    rowRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    rowLabel: { fontFamily: 'Poppins_500Medium', color: Colors.text, fontSize: 15 },
    rowSubtitle: { fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, fontSize: 12, marginTop: 1 },
    rowValue: { fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, fontSize: 14 },
    connectedContainer: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(46, 204, 113, 0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    connectedText: { fontFamily: 'Poppins_600SemiBold', color: '#2ecc71', fontSize: 12 },
    connectButton: { backgroundColor: 'rgba(255,255,255,0.08)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    connectButtonText: { fontFamily: 'Poppins_600SemiBold', color: Colors.text, fontSize: 12 },
});