import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, interpolateColor } from 'react-native-reanimated';
import { Colors } from '@config/Colors';
import { Ionicons } from '@expo/vector-icons';

export const AnimatedInput = ({ label, value, onChangeText, placeholder, multiline, maxLength, error, icon }) => {
    const focused = useSharedValue(0);

    const animatedContainerStyle = useAnimatedStyle(() => ({
        borderColor: error 
            ? Colors.danger 
            : withTiming(focused.value ? Colors.secondary : 'rgba(255,255,255,0.08)'),
        backgroundColor: withTiming(focused.value ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)'),
        transform: [{ scale: withTiming(focused.value ? 1.01 : 1) }]
    }));

    return (
        <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
                {icon && <Ionicons name={icon} size={14} color={error ? Colors.danger : Colors.textSecondary} style={{marginRight: 6}} />}
                <Text style={[styles.label, error && { color: Colors.danger }]}>{error || label}</Text>
            </View>
            
            <Animated.View style={[styles.inputContainer, animatedContainerStyle]}>
                <TextInput
                    style={[styles.input, multiline && styles.bioInput]}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    multiline={multiline}
                    maxLength={maxLength}
                    onFocus={() => { focused.value = 1; }}
                    onBlur={() => { focused.value = 0; }}
                    autoCapitalize="none"
                    selectionColor={Colors.secondary}
                />
            </Animated.View>
            {maxLength && (
                <Text style={styles.charCount}>{maxLength - (value ? value.length : 0)} characters left</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    inputGroup: { marginBottom: 22 },
    labelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, marginLeft: 4 },
    label: { fontFamily: 'Poppins_500Medium', color: Colors.textSecondary, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
    inputContainer: { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
    input: { paddingHorizontal: 16, paddingVertical: 14, fontFamily: 'Poppins_400Regular', fontSize: 15, color: Colors.text },
    bioInput: { height: 110, textAlignVertical: 'top', paddingTop: 15 },
    charCount: { fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, fontSize: 10, textAlign: 'right', marginTop: 6, opacity: 0.6 },
});