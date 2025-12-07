import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Modal, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { MOCK_RANKS } from '@api/MockProfileService';
import { Colors } from '@config/Colors';

const GoalCompletionModal = ({ visible, goal, oldXp, newXp, onClose }) => {
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;
    const animatedXp = useRef(new Animated.Value(oldXp)).current;
    const rewardTextOpacity = useRef(new Animated.Value(0)).current;
    const rewardTextScale = useRef(new Animated.Value(0.5)).current;

    const [displayedXp, setDisplayedXp] = useState(oldXp);

    const rank = MOCK_RANKS.slice().reverse().find(r => newXp >= r.minXp) || MOCK_RANKS[0];
    const nextRankIndex = MOCK_RANKS.findIndex(r => r.name === rank.name) + 1;
    const nextRank = nextRankIndex < MOCK_RANKS.length ? MOCK_RANKS[nextRankIndex] : null;
    
    const rankMin = rank.minXp;
    const rankMax = nextRank ? nextRank.minXp : newXp;

    useEffect(() => {
        if (visible) {
            animatedXp.setValue(oldXp);
            
            const listener = animatedXp.addListener(({ value }) => {
                setDisplayedXp(Math.floor(value));
            });

            // Appear Animation
            Animated.parallel([
                Animated.spring(scaleAnim, { toValue: 1, friction: 5, useNativeDriver: true }),
                Animated.timing(opacityAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
            ]).start();

            // Reward Text & XP Bar Animation
            Animated.sequence([
                Animated.delay(300),
                Animated.parallel([
                    Animated.spring(rewardTextScale, { toValue: 1, friction: 4, useNativeDriver: true }),
                    Animated.timing(rewardTextOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
                ]),
                Animated.timing(animatedXp, { toValue: newXp, duration: 1500, useNativeDriver: false }),
                Animated.delay(500),
                 Animated.parallel([
                    Animated.timing(rewardTextOpacity, { toValue: 0, duration: 400, useNativeDriver: true }),
                    Animated.timing(opacityAnim, { toValue: 0, duration: 500, useNativeDriver: true })
                ]),
            ]).start(onClose);
            
            return () => animatedXp.removeListener(listener);
        } else {
            scaleAnim.setValue(0.8);
            opacityAnim.setValue(0);
            rewardTextScale.setValue(0.5);
        }
    }, [visible, oldXp, newXp, onClose]);

    const animatedProgressWidth = animatedXp.interpolate({
        inputRange: [rankMin, rankMax],
        outputRange: ['0%', '100%'],
        extrapolate: 'clamp',
    });

    return (
        <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
            <BlurView intensity={40} tint="dark" style={styles.overlay}>
                <Animated.View style={[styles.modalContainer, { opacity: opacityAnim, transform: [{ scale: scaleAnim }] }]}>
                    
                    <Animated.Text style={[styles.xpReward, { opacity: rewardTextOpacity, transform: [{ scale: rewardTextScale }] }]}>
                        +{goal?.xp} XP
                    </Animated.Text>
                    
                    <View style={styles.xpBarWrapper}>
                        <Text style={styles.xpCounter}>{displayedXp} / {rankMax} XP</Text>
                        
                        {nextRank && (
                            <View style={styles.progressBarContainer}>
                                <Animated.View style={{...StyleSheet.absoluteFillObject, width: animatedProgressWidth }}>
                                    <LinearGradient
                                        colors={[Colors.secondary, '#38E893']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={styles.progressBar}
                                    />
                                </Animated.View>
                            </View>
                        )}
                    </View>

                </Animated.View>
            </BlurView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    modalContainer: {
        width: '90%',
        backgroundColor: 'rgba(20, 20, 22, 0.85)',
        borderRadius: 30,
        paddingVertical: 40,
        paddingHorizontal: 28,
        borderWidth: 1.5,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 30,
    },
    xpReward: { 
        color: Colors.secondary, 
        fontSize: 48, 
        fontFamily: 'Poppins_700Bold', 
        marginBottom: 28,
        textShadowColor: 'rgba(4, 255, 154, 0.5)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 20,
    },
    xpBarWrapper: {
        width: '100%',
        alignItems: 'center',
    },
    xpCounter: { 
        color: 'rgba(255, 255, 255, 0.8)', 
        fontSize: 16, 
        fontFamily: 'Poppins_500Medium',
        alignSelf: 'flex-start',
        marginBottom: 8,
    },
    progressBarContainer: { 
        width: '100%', 
        height: 12, 
        backgroundColor: 'rgba(0, 0, 0, 0.4)', 
        borderRadius: 6,
        overflow: 'hidden',
    },
    progressBar: { 
        height: '100%',
        borderRadius: 6,
    },
});

export default GoalCompletionModal;