import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { Colors } from '@config/Colors';

export const AnimatedInput = ({ label, value, onChangeText, placeholder, multiline, maxLength, error }) => {
    const focused = useSharedValue(0);

    const animatedBorder = useAnimatedStyle(() => ({
        borderColor: error ? Colors.danger : withTiming(focused.value ? Colors.secondary : 'rgba(255,255,255,0.1)'),
        borderWidth: withTiming(focused.value ? 1 : StyleSheet.hairlineWidth),
    }));

    return (
        <View style={styles.inputGroup}>
            <Text style={[styles.label, error && { color: Colors.danger }]}>{error || label}</Text>
            <Animated.View style={[styles.inputContainer, animatedBorder]}>
                <TextInput
                    style={[styles.input, multiline && styles.bioInput]}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor={Colors.textSecondary}
                    multiline={multiline}
                    maxLength={maxLength}
                    onFocus={() => { focused.value = 1; }}
                    onBlur={() => { focused.value = 0; }}
                    autoCapitalize="none"
                />
            </Animated.View>
            {maxLength && (
                <Text style={styles.charCount}>{maxLength - (value ? value.length : 0)}</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    inputGroup: { marginBottom: 20 },
    label: { fontFamily: 'Poppins_500Medium', color: Colors.textSecondary, fontSize: 13, marginBottom: 8, marginLeft: 4 },
    inputContainer: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, overflow: 'hidden' },
    input: { paddingHorizontal: 15, paddingVertical: 14, fontFamily: 'Poppins_400Regular', fontSize: 16, color: Colors.text },
    bioInput: { height: 100, textAlignVertical: 'top', paddingTop: 15 },
    charCount: { fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, fontSize: 12, textAlign: 'right', marginTop: 6, marginRight: 4 },
});