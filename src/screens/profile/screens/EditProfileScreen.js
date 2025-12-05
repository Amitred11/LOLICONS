// screens/profile/EditProfileScreen.js
import React, { useState, useEffect } from 'react';
import { 
    View, Text, StyleSheet, TextInput, ImageBackground, TouchableOpacity, 
    StatusBar, ActivityIndicator, ScrollView 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@config/Colors';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay } from 'react-native-reanimated';
import { useAlert } from '@context/AlertContext'; 
import { useProfile } from '@context/ProfileContext'; 

const AnimatedSection = ({ children, index }) => {
    const opacity = useSharedValue(0);
    const translateY = useSharedValue(20);
    useEffect(() => {
        opacity.value = withDelay(index * 100, withTiming(1));
        translateY.value = withDelay(index * 100, withTiming(0));
    }, []);
    const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value, transform: [{ translateY: translateY.value }] }));
    return <Animated.View style={animatedStyle}>{children}</Animated.View>;
};

const EditProfileScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { profile, updateProfile } = useProfile(); 
    const { showAlert } = useAlert();

    // 1. Handle loading state if profile context hasn't loaded yet
    if (!profile) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    const [formData, setFormData] = useState({
        name: profile.name || '',
        handle: profile.handle || '',
        bio: profile.bio || '',
        avatarUrl: profile.avatarUrl || ''
    });

    const [isDirty, setIsDirty] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const hasChanged = 
            formData.name !== profile.name || 
            formData.handle !== profile.handle || 
            formData.bio !== profile.bio;
        setIsDirty(hasChanged);
    }, [formData, profile]);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        const success = await updateProfile(formData);
        setIsSaving(false);

        if (success) {
            showAlert({
                title: "Profile Saved",
                message: "Your changes have been updated.",
                type: 'success',
                onClose: () => navigation.goBack() 
            });
        } else {
            showAlert({ title: "Error", message: "Failed to save profile.", type: 'error' });
        }
    };
    
    const handleAvatarChange = () => {
        showAlert({ title: "Coming Soon", message: "Image upload functionality is under construction.", type: 'info' });
    };

    return (
        <LinearGradient colors={[Colors.background, '#1a1a2e']} style={styles.container}>
            <StatusBar barStyle="light-content" />
            
            <View style={[styles.header, { paddingTop: insets.top }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Edit Profile</Text>
                <TouchableOpacity 
                    onPress={handleSave} 
                    disabled={!isDirty || isSaving} 
                    style={styles.headerButton}
                >
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
                        <ImageBackground 
                            source={{ uri: formData.avatarUrl || 'https://via.placeholder.com/150' }} 
                            style={styles.avatar} 
                            imageStyle={{ borderRadius: 60 }}
                        >
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
                            <Text style={styles.charCount}>{150 - (formData.bio ? formData.bio.length : 0)}</Text>
                    </View>
                </AnimatedSection>
            </ScrollView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15, paddingBottom: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: Colors.surface + '80' },
    headerTitle: { fontFamily: 'Poppins_600SemiBold', color: Colors.text, fontSize: 18 },
    headerButton: { padding: 10, minWidth: 60, alignItems: 'center' },
    saveButtonText: { fontFamily: 'Poppins_600SemiBold', color: Colors.secondary, fontSize: 16 },
    
    scrollContainer: { padding: 20 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }, // Added background

    avatarSection: { alignItems: 'center', marginBottom: 40 },
    avatar: { width: 120, height: 120, backgroundColor: Colors.surface }, // Added bg
    avatarEditOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', borderRadius: 60 },
    
    inputGroup: { marginBottom: 25 },
    label: { fontFamily: 'Poppins_500Medium', color: Colors.textSecondary, fontSize: 14, marginBottom: 10 },
    input: { backgroundColor: Colors.surface, borderRadius: 12, paddingHorizontal: 15, paddingVertical: 15, fontFamily: 'Poppins_400Regular', fontSize: 16, color: Colors.text, borderWidth: StyleSheet.hairlineWidth, borderColor: Colors.surface + '80' },
    bioInput: { height: 120, textAlignVertical: 'top', paddingTop: 15 },
    charCount: { fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, fontSize: 12, textAlign: 'right', marginTop: 8 },
});

export default EditProfileScreen;