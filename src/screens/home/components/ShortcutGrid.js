import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@config/Colors';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 40 - 12) / 2; // Screen width - horizontal padding - gap

const ShortcutCard = ({ item, onPress }) => (
    <TouchableOpacity 
        onPress={onPress} 
        activeOpacity={0.7}
        style={[styles.card, { backgroundColor: Colors.surface }]}
    >
        <View style={[styles.iconWrapper, { backgroundColor: item.color + '15' }]}>
            <Ionicons name={item.icon} size={24} color={item.color} />
        </View>
        <View style={styles.textContainer}>
            <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.subtitle} numberOfLines={1}>{item.subtitle}</Text>
        </View>
        <View style={styles.arrowCircle}>
            <Ionicons name="arrow-forward" size={12} color={Colors.textSecondary} />
        </View>
    </TouchableOpacity>
);

const ShortcutGrid = memo(({ actions, onActionPress }) => {
    return (
        <View style={styles.gridContainer}>
            {actions.map((item) => (
                <ShortcutCard 
                    key={item.title} 
                    item={item} 
                    onPress={() => onActionPress(item)} 
                />
            ))}
        </View>
    );
});

const styles = StyleSheet.create({
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 20,
        justifyContent: 'space-between',
        rowGap: 12,
    },
    card: {
        width: COLUMN_WIDTH,
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'space-between',
        minHeight: 120,
    },
    iconWrapper: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    textContainer: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    title: {
        fontFamily: 'Poppins_600SemiBold',
        color: Colors.text,
        fontSize: 15,
        lineHeight: 20,
    },
    subtitle: {
        fontFamily: 'Poppins_400Regular',
        color: Colors.textSecondary,
        fontSize: 12,
        marginTop: 2,
    },
    arrowCircle: {
        position: 'absolute',
        top: 16,
        right: 16,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.03)',
        alignItems: 'center',
        justifyContent: 'center',
    }
});

export default ShortcutGrid;