import React, { useState, useEffect } from 'react';
import { 
    View, Text, StyleSheet, ImageBackground, TouchableOpacity, 
    StatusBar, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform, Keyboard, Dimensions 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@config/Colors';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import * as ImagePicker from 'expo-image-picker'; 
import { useAlert } from '@context/other/AlertContext'; 
import { useProfile } from '@context/main/ProfileContext';
import { AnimatedInput } from '../components/ui/EditComponents';
import { BlurView } from 'expo-blur';

const EditProfileScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { profile, updateProfile, uploadAvatar } = useProfile(); 
    const { showAlert, showToast } = useAlert();

    const [formData, setFormData] = useState({
        name: '', handle: '', bio: '', location: '', website: '', avatarUrl: '', coverPhotoUrl: ''
    });
    const [isSaving, setIsSaving] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [errors, setErrors] = useState({});

    // Fallback constants to prevent "Empty String" warnings
    const DEFAULT_AVATAR = 'https://via.placeholder.com/150';
    const DEFAULT_BANNER = 'https://via.placeholder.com/800x400';

    useEffect(() => {
        if (profile) {
            const currentBanner = profile.favoriteComicBanner?.uri || profile.favoriteComicBanner;
            setFormData({
                name: profile.name || '',
                handle: profile.handle || '',
                bio: profile.bio || '',
                location: profile.location || '',
                website: profile.website || '',
                avatarUrl: profile.avatarUrl || DEFAULT_AVATAR,
                coverPhotoUrl: currentBanner || DEFAULT_BANNER
            });
        }
    }, [profile]);

    useEffect(() => {
        if (!profile) return;
        const currentCover = profile.favoriteComicBanner?.uri || profile.favoriteComicBanner || '';
        const hasChanged = 
            formData.name !== profile.name || 
            formData.handle !== profile.handle || 
            formData.bio !== profile.bio ||
            formData.avatarUrl !== profile.avatarUrl ||
            formData.coverPhotoUrl !== currentCover;
        setIsDirty(hasChanged);
    }, [formData, profile]);

    // FIXED PICKER: Added Permission Check
    const pickImage = async (type) => {
        try {
            // 1. Request Permission
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                showAlert({
                    title: "Permission Denied",
                    message: "We need access to your photos to change your profile images.",
                    type: 'error'
                });
                return;
            }

            // 2. Launch Library
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'], // Updated syntax for newer Expo versions
                allowsEditing: true,
                aspect: type === 'avatar' ? [1, 1] : [16, 9],
                quality: 0.7,
            });

            // 3. Handle Result safely
            if (!result.canceled && result.assets && result.assets.length > 0) {
                const selectedUri = result.assets[0].uri;
                if (!selectedUri) throw new Error("No URI found");

                setFormData(prev => ({
                    ...prev,
                    [type === 'avatar' ? 'avatarUrl' : 'coverPhotoUrl']: selectedUri
                }));
            }
        } catch (e) {
            console.error("Picker Error: ", e);
            showToast("Failed to open gallery", 'error');
        }
    };

    const handleSave = async () => {
        Keyboard.dismiss();
        if (formData.name.length < 2) return setErrors({name: 'Too short'});
        
        setIsSaving(true);
        try {
            // Update Profile Info + Banner
            const response = await updateProfile({
                name: formData.name, 
                handle: formData.handle, 
                bio: formData.bio,
                location: formData.location, 
                website: formData.website,
                // Wrap in object to match API expectation
                favoriteComicBanner: { uri: formData.coverPhotoUrl }
            });

            // If avatar changed, upload it specifically
            if (formData.avatarUrl !== profile.avatarUrl && !formData.avatarUrl.includes('placeholder')) {
                await uploadAvatar(formData.avatarUrl);
            }

            if (response.success) {
                showToast("Profile synchronized", 'success');
                navigation.goBack();
            }
        } catch (err) {
            showAlert({ title: "Sync Failed", message: err.message, type: 'error' });
        } finally {
            setIsSaving(false);
        }
    };

    if (!profile) return <View style={styles.loadingContainer}><ActivityIndicator color={Colors.primary} /></View>;

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient colors={['#0F0F1E', '#1A1A2E']} style={StyleSheet.absoluteFill} />
            
            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
                    <Ionicons name="close" size={24} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Modify Profile</Text>
                <TouchableOpacity onPress={handleSave} disabled={!isDirty || isSaving} style={[styles.doneButton, { opacity: isDirty ? 1 : 0.5 }]}>
                    {isSaving ? <ActivityIndicator size="small" color={Colors.secondary} /> : <Text style={styles.doneText}>Save</Text>}
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                    
                    {/* Banner Edit */}
                    <Animated.View entering={FadeIn.duration(600)} style={styles.bannerContainer}>
                        <ImageBackground 
                            // Check for empty string and use fallback
                            source={{ uri: formData.coverPhotoUrl || DEFAULT_BANNER }} 
                            style={styles.bannerImage}
                            imageStyle={{ borderRadius: 20 }}
                        >
                            <LinearGradient colors={['transparent', 'rgba(0,0,0,0.6)']} style={[StyleSheet.absoluteFill, {borderRadius: 20}]} />
                            <TouchableOpacity style={styles.bannerEditButton} onPress={() => pickImage('banner')}>
                                <BlurView intensity={30} tint="dark" style={styles.bannerEditBlur}>
                                    <Ionicons name="image-outline" size={20} color="#FFF" />
                                    <Text style={styles.bannerEditText}>Change Cover</Text>
                                </BlurView>
                            </TouchableOpacity>
                        </ImageBackground>
                    </Animated.View>

                    {/* Avatar Edit */}
                    <Animated.View entering={FadeIn.duration(600)} style={styles.avatarSection}>
                        <View style={styles.avatarGlow}>
                            <ImageBackground 
                                source={{ uri: formData.avatarUrl || DEFAULT_AVATAR }}
                                style={styles.avatar} imageStyle={{ borderRadius: 60 }}
                            >
                                <TouchableOpacity style={styles.camOverlay} onPress={() => pickImage('avatar')} activeOpacity={0.9}>
                                    <View style={styles.camCircle}>
                                        <Ionicons name="camera" size={22} color="#FFF" />
                                    </View>
                                </TouchableOpacity>
                            </ImageBackground>
                        </View>
                        <Text style={styles.changePhotoText}>Change Profile Picture</Text>
                    </Animated.View>

                    {/* Form Cards... */}
                    <Animated.View entering={FadeInDown.delay(200).springify()}>
                        <View style={styles.formCard}>
                            <Text style={styles.cardHeader}>Identity</Text>
                            <AnimatedInput label="Display Name" icon="person-outline" value={formData.name} onChangeText={(t) => setFormData(p => ({...p, name: t}))} error={errors.name} />
                            <AnimatedInput label="Handle" icon="at-outline" value={formData.handle} onChangeText={(t) => setFormData(p => ({...p, handle: t}))} />
                            <AnimatedInput label="Biography" icon="reader-outline" value={formData.bio} onChangeText={(t) => setFormData(p => ({...p, bio: t}))} multiline />
                        </View>
                    </Animated.View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
};

// ... Styles remain the same
const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 20 },
    headerTitle: { fontFamily: 'Poppins_600SemiBold', color: Colors.text, fontSize: 17 },
    closeButton: { padding: 8 },
    doneButton: { paddingVertical: 6, paddingHorizontal: 16, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)' },
    doneText: { fontFamily: 'Poppins_600SemiBold', color: Colors.secondary },
    scrollContainer: { padding: 20, paddingBottom: 60 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    bannerContainer: { width: '100%', height: 160, marginBottom: -60 },
    bannerImage: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
    bannerEditButton: { borderRadius: 12, overflow: 'hidden' },
    bannerEditBlur: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 16, gap: 8 },
    bannerEditText: { color: '#FFF', fontFamily: 'Poppins_600SemiBold', fontSize: 12 },
    avatarSection: { alignItems: 'center', marginBottom: 30 },
    avatarGlow: { padding: 4, borderRadius: 65, backgroundColor: '#1A1A2E', borderWidth: 4, borderColor: '#1A1A2E' },
    avatar: { width: 120, height: 120, borderRadius: 60, overflow: 'hidden' },
    camOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.25)', justifyContent: 'center', alignItems: 'center' },
    camCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.secondary, justifyContent: 'center', alignItems: 'center' },
    changePhotoText: { color: Colors.textSecondary, fontSize: 12, marginTop: 15, textTransform: 'uppercase' },
    formCard: { backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', marginBottom: 25 },
    cardHeader: { color: Colors.secondary, fontSize: 11, textTransform: 'uppercase', marginBottom: 20 },
});

export default EditProfileScreen;