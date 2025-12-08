// @features/comics/common/RatingModal.js

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@config/Colors';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, runOnJS } from 'react-native-reanimated';

// The props (isVisible, onClose, ...) are passed directly from your ModalProvider's switch statement.
const RatingModal = ({ isVisible, onClose, comicId, currentRating, onRate }) => {
    const [selectedRating, setSelectedRating] = useState(currentRating || 0);
    
    const backdropOpacity = useSharedValue(0);
    const contentScale = useSharedValue(0.9);

    // Animate the modal content on entry and exit based on the isVisible prop.
    useEffect(() => {
        if (isVisible) {
            backdropOpacity.value = withTiming(1, { duration: 300 });
            contentScale.value = withTiming(1, { duration: 250 });
        }
    }, [isVisible]);

    const animatedBackdropStyle = useAnimatedStyle(() => ({
        opacity: backdropOpacity.value,
    }));

    const animatedContentStyle = useAnimatedStyle(() => ({
        transform: [{ scale: contentScale.value }],
        opacity: backdropOpacity.value, // Link opacity to backdrop for simplicity
    }));

    // This function handles the closing animation and then calls the onClose from the provider.
    const handleClose = () => {
        backdropOpacity.value = withTiming(0, { duration: 200 });
        contentScale.value = withTiming(0.9, { duration: 200 }, () => {
            // runOnJS is crucial to call React state updates after a UI thread animation.
            runOnJS(onClose)();
        });
    };

    const handleRate = () => {
        if (selectedRating > 0 && onRate) {
            // The onRate function is the rateComic function passed from ComicDetailScreen.
            onRate(selectedRating);
        }
        handleClose();
    };
    
    // Since your provider renders this directly, we must return null if not visible.
    if (!isVisible) {
        return null;
    }

    return (
        <View style={styles.container}>
            <Animated.View style={[StyleSheet.absoluteFill, animatedBackdropStyle]}>
                <Pressable style={StyleSheet.absoluteFill} onPress={handleClose}>
                    <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
                </Pressable>
            </Animated.View>

            <Animated.View style={[styles.modalContent, animatedContentStyle]}>
                <Text style={styles.title}>Rate this Comic</Text>
                <Text style={styles.subtitle}>Let others know what you think!</Text>

                <View style={styles.starsContainer}>
                    {[...Array(5)].map((_, i) => {
                        const ratingValue = i + 1;
                        return (
                            <Pressable key={i} onPress={() => setSelectedRating(ratingValue)}>
                                <Ionicons
                                    name={ratingValue <= selectedRating ? "star" : "star-outline"}
                                    size={40}
                                    color={Colors.secondary}
                                    style={styles.star}
                                />
                            </Pressable>
                        );
                    })}
                </View>

                <Pressable
                    style={({ pressed }) => [styles.submitButton, pressed && styles.buttonPressed]}
                    onPress={handleRate}
                    disabled={selectedRating === 0}
                >
                    <Text style={styles.submitButtonText}>
                        {selectedRating > 0 ? `Submit ${selectedRating}-Star Rating` : 'Select a Rating'}
                    </Text>
                </Pressable>
                
                <Pressable onPress={handleClose} style={styles.closeButton}>
                    <Text style={styles.closeButtonText}>Cancel</Text>
                </Pressable>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    // The container MUST be an absolute overlay to cover the screen.
    container: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000, // Ensure it's on top of everything
    },
    modalContent: {
        backgroundColor: Colors.surface,
        borderRadius: 20,
        padding: 25,
        alignItems: 'center',
        width: '85%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
        borderWidth: 1,
        borderColor: Colors.surface + '80',
    },
    title: {
        fontFamily: 'Poppins_700Bold',
        fontSize: 22,
        color: Colors.text,
        marginBottom: 8,
    },
    subtitle: {
        fontFamily: 'Poppins_400Regular',
        fontSize: 15,
        color: Colors.textSecondary,
        marginBottom: 25,
        textAlign: 'center',
    },
    starsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 30,
    },
    star: {
        marginHorizontal: 5,
    },
    submitButton: {
        backgroundColor: Colors.secondary,
        borderRadius: 25,
        paddingVertical: 14,
        paddingHorizontal: 20,
        width: '100%',
        alignItems: 'center',
    },
    buttonPressed: {
        opacity: 0.8,
    },
    submitButtonText: {
        fontFamily: 'Poppins_600SemiBold',
        fontSize: 16,
        color: Colors.background,
    },
    closeButton: {
        marginTop: 15,
        padding: 10,
    },
    closeButtonText: {
        fontFamily: 'Poppins_500Medium',
        fontSize: 14,
        color: Colors.textSecondary,
    },
});

export default RatingModal;