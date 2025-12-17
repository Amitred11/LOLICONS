import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, measure, runOnUI, useAnimatedRef } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Colors } from '@config/Colors';

export const FaqItem = ({ item }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const answerHeight = useSharedValue(0);
    const animatedRotation = useSharedValue(0);
    const answerRef = useAnimatedRef();

    const toggle = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        if (isExpanded) {
            animatedRotation.value = withTiming(0);
            answerHeight.value = withTiming(0);
        } else {
            animatedRotation.value = withTiming(180);
            runOnUI(() => { 
                'worklet'; 
                const measured = measure(answerRef);
                if (measured) {
                    answerHeight.value = withTiming(measured.height);
                }
            })();
        }
        setIsExpanded(!isExpanded);
    };

    const animatedAnswerStyle = useAnimatedStyle(() => ({ 
        height: answerHeight.value, 
        opacity: answerHeight.value > 0 ? 1 : 0 
    }));
    
    const animatedIconStyle = useAnimatedStyle(() => ({ 
        transform: [{ rotate: `${animatedRotation.value}deg` }] 
    }));

    return (
        <View style={styles.rowBorder}>
            <TouchableOpacity onPress={toggle} style={styles.row}>
                <Text style={styles.rowLabel}>{item.q}</Text>
                <Animated.View style={animatedIconStyle}>
                    <Ionicons name="chevron-down" size={20} color={Colors.textSecondary} />
                </Animated.View>
            </TouchableOpacity>
            <Animated.View style={[styles.answerContainer, animatedAnswerStyle]}>
                <View ref={answerRef} style={{ position: 'absolute', width: '100%' }}>
                    <Text style={styles.answerText}>{item.a}</Text>
                </View>
            </Animated.View>
        </View>
    );
};

export const TopicCard = ({ item, onPress }) => (
    <TouchableOpacity onPress={onPress} style={styles.topicCard}>
        <BlurView intensity={25} tint="dark" style={styles.glassEffect} />
        <Ionicons name={item.icon} size={28} color={Colors.secondary} />
        <Text style={styles.topicLabel}>{item.label}</Text>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15 },
    rowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(255,255,255,0.1)' },
    rowLabel: { fontFamily: 'Poppins_500Medium', color: Colors.text, fontSize: 16, flex: 1, marginRight: 10 },
    answerContainer: { overflow: 'hidden' },
    answerText: { fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, fontSize: 15, lineHeight: 22, paddingHorizontal: 15, paddingBottom: 15 },
    topicCard: { width: '48.5%', aspectRatio: 1, borderRadius: 16, overflow: 'hidden', borderWidth: StyleSheet.hairlineWidth, borderColor: Colors.surface + '80', marginBottom: '3%', justifyContent: 'center', alignItems: 'center', padding: 15, gap: 10 },
    glassEffect: { ...StyleSheet.absoluteFillObject },
    topicLabel: { fontFamily: 'Poppins_600SemiBold', color: Colors.text, fontSize: 15, textAlign: 'center' },
});