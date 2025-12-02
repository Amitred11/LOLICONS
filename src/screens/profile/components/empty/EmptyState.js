import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@config/Colors'; // Ensure this path points to your Colors config

const EmptyState = ({ 
    icon = 'file-tray-outline', 
    title = 'Nothing to see here', 
    message = 'We couldn\'t find any data to display at the moment.', 
    actionLabel, 
    onAction,
    style 
}) => {
    return (
        <View style={[styles.container, style]}>
            <View style={styles.iconContainer}>
                <Ionicons name={icon} size={48} color={Colors.textSecondary} style={{ opacity: 0.5 }} />
            </View>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>
            
            {actionLabel && onAction && (
                <TouchableOpacity style={styles.button} onPress={onAction}>
                    <Text style={styles.buttonText}>{actionLabel}</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 30,
        paddingHorizontal: 20,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: Colors.surface, 
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    title: {
        fontFamily: 'Poppins_600SemiBold',
        fontSize: 16,
        color: Colors.text,
        marginBottom: 8,
        textAlign: 'center',
    },
    message: {
        fontFamily: 'Poppins_400Regular',
        fontSize: 14,
        color: Colors.textSecondary,
        textAlign: 'center',
        lineHeight: 20,
        maxWidth: '80%',
        marginBottom: 20,
    },
    button: {
        backgroundColor: Colors.secondary, 
        paddingHorizontal: 24,
        paddingVertical: 10,
        borderRadius: 20,
    },
    buttonText: {
        fontFamily: 'Poppins_600SemiBold',
        fontSize: 13,
        color: '#fff', 
    },
});

export default EmptyState;