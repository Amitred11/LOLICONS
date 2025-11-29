import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@config/Colors';

const ActionButton = ({ item, onPress }) => (
    <TouchableOpacity onPress={onPress} style={styles.actionButton}>
        <View style={[styles.actionIconContainer, { backgroundColor: item.color + '15' }]}>
            <Ionicons name={item.icon} size={28} color={item.color} />
        </View>
        <View style={styles.actionTextContainer}>
            <Text style={styles.actionTitle}>{item.title}</Text>
            <Text style={styles.actionSubtitle}>{item.subtitle}</Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} style={{ opacity: 0.5 }}/>
    </TouchableOpacity>
);

const QuickActions = ({ actions, onActionPress }) => {
    return (
        <View style={styles.actionGrid}>
            {actions.map((item) => (
                <ActionButton 
                    key={item.title} 
                    item={item} 
                    onPress={() => onActionPress(item)} 
                />
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    actionGrid: { flexDirection: 'column', paddingHorizontal: 20, gap: 10, marginTop: 10 },
    actionButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, padding: 16, borderRadius: 16 },
    actionIconContainer: { width: 50, height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
    actionTextContainer: { flex: 1 },
    actionTitle: { fontFamily: 'Poppins_600SemiBold', color: Colors.text, fontSize: 16 },
    actionSubtitle: { fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, fontSize: 13 },
});

export default QuickActions;