// screens/profile/EditProfileScreen.js

// Import necessary modules from React and React Native.
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ImageBackground, TouchableOpacity, StatusBar, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { userData as mockUserData } from '../../../constants/mockData';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay } from 'react-native-reanimated';

/**
 * A wrapper component that animates its children with a staggered fade-in and slide-up effect.
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The content to animate.
 * @param {number} props.index - The index for staggering the animation delay.
 */
const AnimatedSection = ({ children, index }) => {
    const opacity = useSharedValue(0);
    const translateY = useSharedValue(20);
    // Trigger animation on mount.
    useEffect(() => {
        opacity.value = withDelay(index * 100, withTiming(1));
        translateY.value = withDelay(index * 100, withTiming(0));
    }, []);
    const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value, transform: [{ translateY: translateY.value }] }));
    return <Animated.View style={animatedStyle}>{children}</Animated.View>;
};

/**
 * A modal screen for editing user profile information.
 */
const EditProfileScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    // State to hold the form data, initialized with mock data.
    const [formData, setFormData] = useState({
        name: mockUserData.name,
        handle: mockUserData.handle,
        bio: mockUserData.bio,
    });
    const [isDirty, setIsDirty] = useState(false); // Tracks if the form has been changed.
    const [isSaving, setIsSaving] = useState(false); // Tracks the saving state for the API call simulation.

    // Effect to check if form data has changed from the initial mock data.
    // This is used to enable/disable the "Save" button.
    useEffect(() => {
        const hasChanged = formData.name !== mockUserData.name || formData.handle !== mockUserData.handle || formData.bio !== mockUserData.bio;
        setIsDirty(hasChanged);
    }, [formData]);

    // A generic handler to update the form data state.
    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // Simulates an API call to save the profile data.
    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            Alert.alert("Profile Saved", "Your changes have been saved successfully.");
            // In a real app, you would update the user context here.
            navigation.goBack();
        }, 1500);
    };
    
    // Placeholder function for changing the avatar.
    const handleAvatarChange = () => {
        Alert.alert("Change Avatar", "This would open the image picker.");
    };

    return (
        <LinearGradient colors={[Colors.background, '#1a1a2e']} style={styles.container}>
            <StatusBar barStyle="light-content" />
            {/* Screen Header */}
            <View style={[styles.header, { paddingTop: insets.top }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Edit Profile</Text>
                <TouchableOpacity onPress={handleSave} disabled={!isDirty || isSaving} style={styles.headerButton}>
                    {isSaving ? (
                        <ActivityIndicator size="small" color={Colors.secondary} />
                    ) : (
                        <Text style={[styles.saveButtonText, { opacity: isDirty ? 1 : 0.5 }]}>Save</Text>
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {/* Avatar Section */}
                <AnimatedSection index={0}>
                    <View style={styles.avatarSection}>
                        <ImageBackground source={{ uri: mockUserData.avatarUrl }} style={styles.avatar} imageStyle={{ borderRadius: 60 }}>
                            <TouchableOpacity style={styles.avatarEditOverlay} onPress={handleAvatarChange}>
                                <Ionicons name="camera-outline" size={30} color={Colors.text} />
                            </TouchableOpacity>
                        </ImageBackground>
                    </View>
                </AnimatedSection>

                {/* Name Input */}
                <AnimatedSection index={1}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Name</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.name}
                            onChangeText={(text) => handleInputChange('name', text)}
                            placeholder="Enter your full name"
                            placeholderTextColor={Colors.textSecondary}
                        />
                    </View>
                </AnimatedSection>
                
                {/* Username Input */}
                <AnimatedSection index={2}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Username</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.handle}
                            onChangeText={(text) => handleInputChange('handle', text)}
                            placeholder="Enter your username"
                            placeholderTextColor={Colors.textSecondary}
                            autoCapitalize="none"
                        />
                    </View>
                </AnimatedSection>
                
                {/* Bio Input */}
                <AnimatedSection index={3}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Bio</Text>
                        <TextInput
                            style={[styles.input, styles.bioInput]}
                            value={formData.bio}
                            onChangeText={(text) => handleInputChange('bio', text)}
                            placeholder="Tell us about yourself..."
                            placeholderTextColor={Colors.textSecondary}
                            multiline
                            maxLength={150}
                        />
                         <Text style={styles.charCount}>{150 - formData.bio.length}</Text>
                    </View>
                </AnimatedSection>
            </ScrollView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingBottom: 10,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderColor: Colors.surface + '80',
    },
    headerTitle: {
        fontFamily: 'Poppins_600SemiBold',
        color: Colors.text,
        fontSize: 18,
    },
    headerButton: {
        padding: 10,
        minWidth: 60,
        alignItems: 'center',
    },
    saveButtonText: {
        fontFamily: 'Poppins_600SemiBold',
        color: Colors.secondary,
        fontSize: 16,
    },
    scrollContainer: {
        padding: 20,
    },
    avatarSection: {
        alignItems: 'center',
        marginBottom: 40,
    },
    avatar: {
        width: 120,
        height: 120,
    },
    avatarEditOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 60,
    },
    inputGroup: {
        marginBottom: 25,
    },
    label: {
        fontFamily: 'Poppins_500Medium',
        color: Colors.textSecondary,
        fontSize: 14,
        marginBottom: 10,
    },
    input: {
        backgroundColor: Colors.surface,
        borderRadius: 12,
        paddingHorizontal: 15,
        paddingVertical: 15,
        fontFamily: 'Poppins_400Regular',
        fontSize: 16,
        color: Colors.text,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: Colors.surface + '80',
    },
    bioInput: {
        height: 120,
        textAlignVertical: 'top', // Ensures text starts from the top in multiline inputs.
        paddingTop: 15,
    },
    charCount: {
        fontFamily: 'Poppins_400Regular',
        color: Colors.textSecondary,
        fontSize: 12,
        textAlign: 'right',
        marginTop: 8,
    },
});

export default EditProfileScreen;