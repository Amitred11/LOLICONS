// @components/modals/GoalCompletionModal.js

import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Modal, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@config/Colors';
import { MOCK_RANKS } from '@api/MockProfileService';
import { BlurView } from 'expo-blur';

const AnimatedText = Animated.createAnimatedComponent(Text);

const GoalCompletionModal = ({ visible, goal, oldXp, newXp, onClose }) => {
    const scaleAnim = useRef(new Animated.Value(0.9)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;
    const animatedXp = useRef(new Animated.Value(oldXp)).current;
    
    // --- NEW: Animations for the sliding "+XP" text ---
    const rewardTextOpacity = useRef(new Animated.Value(0)).current;
    const rewardTextTranslateY = useRef(new Animated.Value(20)).current;
    
    // State to hold the number being displayed for the counter
    const [displayedXp, setDisplayedXp] = useState(oldXp);

    const rank = MOCK_RANKS.slice().reverse().find(r => newXp >= r.minXp) || MOCK_RANKS[0];
    const nextRankIndex = MOCK_RANKS.findIndex(r => r.name === rank.name) + 1;
    const nextRank = nextRankIndex < MOCK_RANKS.length ? MOCK_RANKS[nextRankIndex] : null;
    
    const rankMin = rank.minXp;
    const rankMax = nextRank ? nextRank.minXp : newXp; // Use newXp if it's the max rank

    useEffect(() => {
        if (visible) {
            animatedXp.setValue(oldXp);
            
            // Listener for the text counter
            const listener = animatedXp.addListener(({ value }) => {
                setDisplayedXp(Math.floor(value));
            });

            // Main Animation Sequence
            Animated.sequence([
                // 1. Modal appears
                Animated.parallel([
                    Animated.spring(scaleAnim, { toValue: 1, friction: 6, useNativeDriver: true }),
                    Animated.timing(opacityAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
                ]),
                // 2. "+XP" text slides up and fades in
                Animated.parallel([
                    Animated.timing(rewardTextOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
                    Animated.timing(rewardTextTranslateY, { toValue: 0, duration: 400, useNativeDriver: true }),
                ]),
                // 3. Main XP counter and progress bar animate
                Animated.timing(animatedXp, { toValue: newXp, duration: 1200, useNativeDriver: false }),
                // 4. "+XP" text fades out
                Animated.timing(rewardTextOpacity, { toValue: 0, duration: 400, useNativeDriver: true }),
            ]).start();
            
            // Cleanup listener on unmount
            return () => animatedXp.removeListener(listener);
        } else {
            // Reset animations when not visible
            scaleAnim.setValue(0.9);
            opacityAnim.setValue(0);
            rewardTextTranslateY.setValue(20);
        }
    }, [visible, oldXp, newXp]);

    // --- NEW: Interpolate progress bar width based on the animated XP value ---
    const animatedProgressWidth = animatedXp.interpolate({
        inputRange: [rankMin, rankMax],
        outputRange: ['0%', '100%'],
        extrapolate: 'clamp',
    });

    return (
        <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
            <BlurView intensity={30} tint="dark" style={styles.overlay}>
                <Animated.View style={[styles.modalContainer, { opacity: opacityAnim, transform: [{ scale: scaleAnim }] }]}>
                    <View style={styles.header}>
                        <View style={styles.goalIcon}><Ionicons name={goal?.icon || 'help'} size={24} color={Colors.secondary} /></View>
                        <Text style={styles.headerTitle}>Goal Complete!</Text>
                    </View>

                    <Text style={styles.goalTitle}>{goal?.title}</Text>
                    
                    {/* --- NEW: Animated "+XP" text --- */}
                    <Animated.Text style={[styles.xpReward, { opacity: rewardTextOpacity, transform: [{ translateY: rewardTextTranslateY }] }]}>
                        +{goal?.xp} XP
                    </Animated.Text>

                    <View style={styles.xpSection}>
                        <View style={styles.rankIconContainer}><Text style={[styles.rankIconText, {color: rank.color}]}>{rank.name}</Text></View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.rankTitle}>{rank.title}</Text>
                            {/* --- FIX: Display state which is updated by listener --- */}
                            <Text style={styles.xpCounter}>{displayedXp} XP</Text>
                        </View>
                    </View>
                    
                    {nextRank && (
                        <View style={styles.progressBarContainer}>
                            <Animated.View style={[styles.progressBar, { width: animatedProgressWidth }]} />
                        </View>
                    )}

                    <TouchableOpacity style={styles.closeButton} onPress={onClose}><Text style={styles.closeButtonText}>Continue</Text></TouchableOpacity>
                </Animated.View>
            </BlurView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    modalContainer: {
        width: '85%',
        backgroundColor: '#2C2C2E',
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        alignItems: 'center',
    },
    header: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    goalIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.secondary + '20', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    headerTitle: { color: '#FFF', fontSize: 22, fontFamily: 'Poppins_700Bold' },
    goalTitle: { color: '#E0E0E0', fontSize: 16, fontFamily: 'Poppins_500Medium', textAlign: 'center', marginBottom: 8 },
    xpReward: { color: Colors.secondary, fontSize: 24, fontFamily: 'Poppins_600SemiBold', marginBottom: 24 },
    xpSection: { flexDirection: 'row', width: '100%', alignItems: 'center', marginBottom: 8 },
    rankIconContainer: { width: 50, height: 50, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    rankIconText: { fontSize: 24, fontFamily: 'Poppins_700Bold'},
    rankTitle: { color: '#AEAEB2', fontSize: 13, fontFamily: 'Poppins_400Regular' },
    xpCounter: { color: '#FFF', fontSize: 18, fontFamily: 'Poppins_600SemiBold' },
    progressBarContainer: { width: '100%', height: 6, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 3, marginTop: 4, marginBottom: 24 },
    progressBar: { height: '100%', backgroundColor: Colors.secondary, borderRadius: 3 },
    closeButton: { backgroundColor: Colors.primary, paddingVertical: 12, paddingHorizontal: 32, borderRadius: 16 },
    closeButtonText: { color: '#FFF', fontSize: 16, fontFamily: 'Poppins_600SemiBold' },
});

export default GoalCompletionModal;