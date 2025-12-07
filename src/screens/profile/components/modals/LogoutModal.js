import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Pressable, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming, runOnJS } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@config/Colors';

const { width } = Dimensions.get('window');

const LogoutModal = ({ visible, onClose, onLogout }) => {
    const opacity = useSharedValue(0);
    const scale = useSharedValue(0.8);

    useEffect(() => {
        if (visible) {
            opacity.value = withTiming(1, { duration: 200 });
            scale.value = withSpring(1, { damping: 12, stiffness: 100 });
        } else {
            opacity.value = withTiming(0, { duration: 200 });
            scale.value = withTiming(0.8, { duration: 200 });
        }
    }, [visible]);

    const handleLogout = () => {
        // Animate out before calling the actual logout function
        opacity.value = withTiming(0, { duration: 200 }, (finished) => {
            if (finished) {
                runOnJS(onLogout)();
            }
        });
    };

    const animatedBackdropStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
    const animatedContentStyle = useAnimatedStyle(() => ({ opacity: opacity.value, transform: [{ scale: scale.value }] }));

    if (!visible) return null;

    return (
        <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
            <View style={styles.container}>
                {/* Backdrop */}
                <Animated.View style={[styles.backdrop, animatedBackdropStyle]}>
                    <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
                        <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
                    </Pressable>
                </Animated.View>

                {/* Modal Content */}
                <Animated.View style={[styles.modalContent, animatedContentStyle]}>
                    <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
                    
                    <View style={styles.iconContainer}>
                        <Ionicons name="log-out" size={32} color={Colors.danger} />
                    </View>

                    <Text style={styles.title}>Log Out?</Text>
                    <Text style={styles.message}>
                        Are you sure you want to log out? You will need to sign in again to access your library.
                    </Text>

                    <View style={styles.buttonRow}>
                        <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                            <Text style={styles.logoutText}>Log Out</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        width: width * 0.85,
        borderRadius: 24,
        overflow: 'hidden',
        backgroundColor: Colors.surface + '80',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        padding: 24,
        alignItems: 'center',
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'rgba(255, 59, 48, 0.1)', // Red tint
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontFamily: 'Poppins_700Bold',
        fontSize: 20,
        color: Colors.text,
        marginBottom: 8,
    },
    message: {
        fontFamily: 'Poppins_400Regular',
        fontSize: 14,
        color: Colors.textSecondary,
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 20,
    },
    buttonRow: {
        flexDirection: 'row',
        width: '100%',
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.05)',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    cancelText: {
        fontFamily: 'Poppins_600SemiBold',
        color: Colors.text,
        fontSize: 14,
    },
    logoutButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 14,
        backgroundColor: Colors.danger,
        alignItems: 'center',
    },
    logoutText: {
        fontFamily: 'Poppins_600SemiBold',
        color: '#FFF',
        fontSize: 14,
    },
});

export default LogoutModal;