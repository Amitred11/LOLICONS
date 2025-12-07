import React, { useState, useEffect, useRef } from 'react';
import { 
    View, Text, StyleSheet, TextInput, ImageBackground, TouchableOpacity, 
    StatusBar, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform, Keyboard
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@config/Colors';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay, FadeInDown } from 'react-native-reanimated';
import * as ImagePicker from 'expo-image-picker'; // Requires: npx expo install expo-image-picker
import { useAlert } from '@context/other/AlertContext'; 
import { useProfile } from '@context/main/ProfileContext'; 

const AnimatedInput = ({ label, value, onChangeText, placeholder, multiline, maxLength, error }) => {
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

const EditProfileScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { profile, updateProfile, uploadAvatar } = useProfile(); 
    const { showAlert } = useAlert();

    const [formData, setFormData] = useState({
        name: profile?.name || '',
        handle: profile?.handle || '',
        bio: profile?.bio || '',
        avatarUrl: profile?.avatarUrl || ''
    });

    const [errors, setErrors] = useState({});
    const [isDirty, setIsDirty] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (!profile) return;
        const hasChanged = 
            formData.name !== profile.name || 
            formData.handle !== profile.handle || 
            formData.bio !== profile.bio ||
            formData.avatarUrl !== profile.avatarUrl;
        setIsDirty(hasChanged);
    }, [formData, profile]);

    const pickImage = async () => {
        try {
            // Ask for permission
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (permissionResult.granted === false) {
                showAlert({ title: "Permission Required", message: "We need access to your gallery to change your avatar.", type: 'error' });
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.5,
            });

            if (!result.canceled) {
                setFormData(prev => ({ ...prev, avatarUrl: result.assets[0].uri }));
                // Trigger upload immediately or wait for save? 
                // Let's trigger strictly on save for better UX control, 
                // OR upload immediately if you prefer "live" avatars.
                // Here we just update local state to show preview.
            }
        } catch (e) {
            // Fallback for demo/web if ImagePicker fails
            showAlert({ title: "Simulation", message: "Image Picker simulation: Avatar updated.", type: 'success' });
            setFormData(prev => ({ ...prev, avatarUrl: 'https://i.pravatar.cc/300?img=' + Math.floor(Math.random() * 50) }));
        }
    };

    const validate = () => {
        let valid = true;
        let newErrors = {};

        if (formData.name.length < 2) {
            newErrors.name = "Name must be at least 2 characters";
            valid = false;
        }
        if (formData.handle.length < 3) {
            newErrors.handle = "Username must be at least 3 characters";
            valid = false;
        }
        // Simple regex for handle (no special chars allowed except underscore)
        if (!/^[a-zA-Z0-9_]+$/.test(formData.handle)) {
            newErrors.handle = "Username can only contain letters, numbers, and _";
            valid = false;
        }

        setErrors(newErrors);
        return valid;
    };

    const handleSave = async () => {
        Keyboard.dismiss();
        if (!validate()) {
            Haptics?.notificationAsync(Haptics.NotificationFeedbackType.Error);
            return;
        }

        setIsSaving(true);

        // 1. Upload Avatar if changed
        if (formData.avatarUrl !== profile.avatarUrl) {
            const uploadSuccess = await uploadAvatar(formData.avatarUrl);
            if (!uploadSuccess) {
                setIsSaving(false);
                showAlert({ title: "Error", message: "Failed to upload image.", type: 'error' });
                return;
            }
        }

        // 2. Update Text Data
        const response = await updateProfile({
            name: formData.name,
            handle: formData.handle,
            bio: formData.bio
        });

        setIsSaving(false);

        if (response.success) {
            showAlert({
                title: "Saved",
                message: "Profile updated successfully.",
                type: 'success',
                onClose: () => navigation.goBack()
            });
        } else {
            showAlert({ title: "Update Failed", message: response.message, type: 'error' });
        }
    };

    if (!profile) return <View style={styles.loadingContainer}><ActivityIndicator size="large" color={Colors.primary} /></View>;

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

            <KeyboardAvoidingView 
                behavior={Platform.OS === "ios" ? "padding" : "height"} 
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
            >
                <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                    
                    {/* Avatar Section */}
                    <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.avatarSection}>
                        <ImageBackground 
                            source={{ uri: formData.avatarUrl || 'https://via.placeholder.com/150' }} 
                            style={styles.avatar} 
                            imageStyle={{ borderRadius: 60 }}
                        >
                            <TouchableOpacity style={styles.avatarEditOverlay} onPress={pickImage} activeOpacity={0.7}>
                                <Ionicons name="camera" size={28} color="#FFF" />
                            </TouchableOpacity>
                        </ImageBackground>
                        <Text style={styles.changePhotoText}>Tap to change photo</Text>
                    </Animated.View>

                    {/* Inputs */}
                    <Animated.View entering={FadeInDown.delay(200).springify()}>
                        <AnimatedInput 
                            label="Display Name"
                            value={formData.name}
                            onChangeText={(t) => setFormData(prev => ({...prev, name: t}))}
                            placeholder="Your Name"
                            error={errors.name}
                        />
                        
                        <AnimatedInput 
                            label="Username"
                            value={formData.handle}
                            onChangeText={(t) => setFormData(prev => ({...prev, handle: t}))}
                            placeholder="username"
                            error={errors.handle}
                        />
                        
                        <AnimatedInput 
                            label="Bio"
                            value={formData.bio}
                            onChangeText={(t) => setFormData(prev => ({...prev, bio: t}))}
                            placeholder="Tell the world about yourself..."
                            multiline
                            maxLength={150}
                        />
                    </Animated.View>

                </ScrollView>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15, paddingBottom: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(255,255,255,0.1)' },
    headerTitle: { fontFamily: 'Poppins_600SemiBold', color: Colors.text, fontSize: 18 },
    headerButton: { padding: 10, minWidth: 60, alignItems: 'center' },
    saveButtonText: { fontFamily: 'Poppins_600SemiBold', color: Colors.secondary, fontSize: 16 },
    
    scrollContainer: { padding: 20, paddingBottom: 50 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },

    avatarSection: { alignItems: 'center', marginBottom: 30 },
    avatar: { width: 120, height: 120, backgroundColor: Colors.surface, elevation: 5, shadowColor: '#000', shadowOffset: {width:0, height:4}, shadowOpacity: 0.3, shadowRadius: 5, borderRadius: 60 },
    avatarEditOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center', borderRadius: 60 },
    changePhotoText: { marginTop: 12, color: Colors.secondary, fontFamily: 'Poppins_500Medium', fontSize: 14 },

    inputGroup: { marginBottom: 20 },
    label: { fontFamily: 'Poppins_500Medium', color: Colors.textSecondary, fontSize: 13, marginBottom: 8, marginLeft: 4 },
    inputContainer: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, overflow: 'hidden' },
    input: { paddingHorizontal: 15, paddingVertical: 14, fontFamily: 'Poppins_400Regular', fontSize: 16, color: Colors.text },
    bioInput: { height: 100, textAlignVertical: 'top', paddingTop: 15 },
    charCount: { fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, fontSize: 12, textAlign: 'right', marginTop: 6, marginRight: 4 },
});

export default EditProfileScreen;