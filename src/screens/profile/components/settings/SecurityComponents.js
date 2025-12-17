import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@config/Colors';

export const PasswordInput = ({ label, value, onChangeText, placeholder, isSecure, onToggleSecurity }) => (
    <View style={styles.inputGroup}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color={Colors.textSecondary} style={styles.inputIcon} />
            <TextInput
                style={styles.input}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor={Colors.textSecondary + '80'}
                secureTextEntry={isSecure}
                autoCapitalize="none"
            />
            <TouchableOpacity onPress={onToggleSecurity} style={styles.eyeIcon}>
                <Ionicons 
                    name={isSecure ? "eye-off-outline" : "eye-outline"} 
                    size={20} 
                    color={Colors.textSecondary} 
                />
            </TouchableOpacity>
        </View>
    </View>
);

const styles = StyleSheet.create({
    inputGroup: { marginBottom: 20 },
    label: { fontFamily: 'Poppins_500Medium', color: Colors.text, marginBottom: 8, fontSize: 14 },
    inputContainer: { 
        flexDirection: 'row', alignItems: 'center', 
        backgroundColor: 'rgba(255,255,255,0.05)', 
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', 
        borderRadius: 12, paddingHorizontal: 15, height: 50 
    },
    inputIcon: { marginRight: 10 },
    input: { flex: 1, color: Colors.text, fontFamily: 'Poppins_400Regular', height: '100%' },
    eyeIcon: { padding: 5 },
});