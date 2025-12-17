import React, { useState, useEffect } from 'react';
import { 
    View, Text, StyleSheet, ImageBackground, TouchableOpacity, 
    StatusBar, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform, Keyboard 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@config/Colors';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as ImagePicker from 'expo-image-picker'; 
import { useAlert } from '@context/other/AlertContext'; 
import { useProfile } from '@context/main/ProfileContext';
import { AnimatedInput } from '../components/ui/EditComponents';

const EditProfileScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { profile, updateProfile, uploadAvatar } = useProfile(); 
    const { showAlert, showToast } = useAlert();

    const [formData, setFormData] = useState({
        name: '', 
        handle: '', 
        bio: '', 
        location: '', 
        website: '', 
        avatarUrl: ''
    });

    const [isDirty, setIsDirty] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (profile) {
            setFormData({
                name: profile.name || '',
                handle: profile.handle || '',
                bio: profile.bio || '',
                location: profile.location || '',
                website: profile.website || '',
                avatarUrl: profile.avatarUrl || ''
            });
        }
    }, [profile]);

    useEffect(() => {
        if (!profile) return;
        const hasChanged = 
            formData.name !== profile.name || 
            formData.handle !== profile.handle || 
            formData.bio !== profile.bio ||
            formData.location !== (profile.location || '') ||
            formData.website !== (profile.website || '') ||
            formData.avatarUrl !== profile.avatarUrl;
        setIsDirty(hasChanged);
    }, [formData, profile]);

    const pickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.5,
            });
            if (!result.canceled) {
                setFormData(prev => ({ ...prev, avatarUrl: result.assets[0].uri }));
            }
        } catch (e) {
            // Mock behavior for simulators without gallery permissions set up
            setFormData(prev => ({ ...prev, avatarUrl: `https://i.pravatar.cc/300?u=${Date.now()}` }));
            showToast("Simulated: Image selected", 'info');
        }
    };

    const handleSave = async () => {
        Keyboard.dismiss();
        setErrors({});

        if (formData.name.length < 2) return setErrors({name: 'Too short'});
        if (formData.handle.length < 3) return setErrors({handle: 'Too short'});

        setIsSaving(true);

        // Upload Avatar if changed
        if (formData.avatarUrl !== profile.avatarUrl) {
            const success = await uploadAvatar(formData.avatarUrl);
            if (!success) {
                setIsSaving(false);
                return showToast("Avatar upload failed", 'error');
            }
        }

        const response = await updateProfile({
            name: formData.name,
            handle: formData.handle,
            bio: formData.bio,
            location: formData.location,
            website: formData.website
        });

        setIsSaving(false);

        if (response.success) {
            showToast("Profile updated!", 'success');
            navigation.goBack();
        } else {
            showAlert({ title: "Error", message: response.message, type: 'error' });
        }
    };

    if (!profile) return <View style={styles.loadingContainer}><ActivityIndicator color={Colors.primary} /></View>;

    return (
        <LinearGradient colors={[Colors.background, '#1a1a2e']} style={styles.container}>
            <StatusBar barStyle="light-content" />
            
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
                    <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Edit Profile</Text>
                <TouchableOpacity onPress={handleSave} disabled={!isDirty || isSaving} style={styles.headerButton}>
                    {isSaving ? (
                        <ActivityIndicator size="small" color={Colors.secondary} />
                    ) : (
                        <Text style={[styles.saveText, { color: isDirty ? Colors.secondary : Colors.textSecondary }]}>Done</Text>
                    )}
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                    
                    {/* Avatar Section */}
                    <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.avatarSection}>
                        <ImageBackground 
                            source={{ uri: formData.avatarUrl || 'https://via.placeholder.com/150' }} 
                            style={styles.avatar} imageStyle={{ borderRadius: 50 }}
                        >
                            <TouchableOpacity style={styles.camIcon} onPress={pickImage} activeOpacity={0.8}>
                                <Ionicons name="camera" size={20} color="#FFF" />
                            </TouchableOpacity>
                        </ImageBackground>
                        <Text style={styles.changePhotoText}>Change Profile Photo</Text>
                    </Animated.View>

                    {/* Form Fields */}
                    <Animated.View entering={FadeInDown.delay(200).springify()}>
                        
                        <View style={styles.section}>
                            <Text style={styles.sectionLabel}>Public Info</Text>
                            <AnimatedInput 
                                label="Display Name" 
                                value={formData.name} 
                                onChangeText={(t) => setFormData(prev => ({...prev, name: t}))} 
                                error={errors.name} 
                            />
                            <AnimatedInput 
                                label="Username" 
                                value={formData.handle} 
                                onChangeText={(t) => setFormData(prev => ({...prev, handle: t}))} 
                                error={errors.handle} 
                            />
                            <AnimatedInput 
                                label="Bio" 
                                value={formData.bio} 
                                onChangeText={(t) => setFormData(prev => ({...prev, bio: t}))} 
                                multiline 
                                maxLength={150} 
                            />
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionLabel}>Details</Text>
                            <AnimatedInput 
                                label="Location" 
                                value={formData.location} 
                                onChangeText={(t) => setFormData(prev => ({...prev, location: t}))} 
                                placeholder="e.g. Tokyo, Japan" 
                            />
                            <AnimatedInput 
                                label="Website" 
                                value={formData.website} 
                                onChangeText={(t) => setFormData(prev => ({...prev, website: t}))} 
                                placeholder="https://your-site.com" 
                            />
                        </View>

                    </Animated.View>

                </ScrollView>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15, paddingBottom: 15, borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    headerTitle: { fontFamily: 'Poppins_600SemiBold', color: Colors.text, fontSize: 16 },
    headerButton: { minWidth: 60, alignItems: 'center', justifyContent: 'center' },
    cancelText: { color: Colors.text, fontFamily: 'Poppins_400Regular', fontSize: 14 },
    saveText: { fontFamily: 'Poppins_600SemiBold', fontSize: 16 },
    
    scrollContainer: { padding: 20, paddingBottom: 50 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    
    avatarSection: { alignItems: 'center', marginBottom: 30 },
    avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 12, backgroundColor: Colors.surface },
    camIcon: { position: 'absolute', bottom: 0, right: 0, backgroundColor: Colors.secondary, width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: Colors.background },
    changePhotoText: { color: Colors.secondary, fontFamily: 'Poppins_500Medium', fontSize: 13 },
    
    section: { marginBottom: 25 },
    sectionLabel: { color: Colors.textSecondary, fontFamily: 'Poppins_600SemiBold', fontSize: 12, textTransform: 'uppercase', marginBottom: 15, marginLeft: 4, letterSpacing: 0.5 },
});

export default EditProfileScreen;