// screens/profile/NotificationsScreen.js

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, StatusBar, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@config/Colors';
import { useModal } from '@context/ModalContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

// Import the API Service
import { ProfileAPI } from '@api/MockProfileService'; 

const NotificationRow = ({ label, description, value, onValueChange, isLast, disabled }) => (
    <View style={[styles.row, !isLast && styles.rowBorder, disabled && { opacity: 0.5 }]}>
        <View style={styles.textContainer}>
            <Text style={styles.rowLabel}>{label}</Text>
            {description && <Text style={styles.rowDescription}>{description}</Text>}
        </View>
        <Switch
            value={value}
            onValueChange={onValueChange}
            trackColor={{ false: Colors.surface, true: Colors.secondary }}
            thumbColor={value ? Colors.text : '#f4f3f4'}
            disabled={disabled}
            ios_backgroundColor={Colors.surface}
        />
    </View>
);

const QuietHoursRow = ({ onPress, currentSettings }) => (
    <TouchableOpacity onPress={onPress} style={styles.row}>
        <View style={styles.textContainer}>
            <Text style={styles.rowLabel}>Quiet Hours</Text>
            <Text style={styles.rowDescription}>Mute notifications during specific times.</Text>
        </View>
        <View style={styles.rowRight}>
            <Text style={styles.quietHoursValue}>
                {currentSettings.enabled ? `${currentSettings.start} - ${currentSettings.end}` : 'Off'}
            </Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
        </View>
    </TouchableOpacity>
);

const NotificationsScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { show: showModal } = useModal();
    
    // --- State Management ---
    const [isLoading, setIsLoading] = useState(true);

    // Master toggle state
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);
    
    // Quiet Hours state
    const [quietHours, setQuietHours] = useState({
        enabled: false,
        start: '10:00 PM',
        end: '8:00 AM',
    });

    // Individual categories state
    // Initializing with defaults to prevent render errors before API loads
    const [settings, setSettings] = useState({
        newChapters: false,
        recommendations: false,
        newFollowers: false,
        comments: false,
        dms: false,
        promotions: false,
    });

    /**
     * Effect to fetch notification preferences on mount using ProfileAPI.
     */
    useEffect(() => {
        const fetchPreferences = async () => {
            try {
                const response = await ProfileAPI.getNotificationSettings();
                
                if (response.success) {
                    const data = response.data;
                    setNotificationsEnabled(data.globalEnabled);
                    // FIX: Access 'preferences', not 'categories'
                    if (data.preferences) {
                        setSettings(data.preferences);
                    }
                    setQuietHours(data.quietHours);
                } else {
                    console.error("API Error:", response.message);
                }
            } catch (error) {
                console.error("Failed to load notification settings", error);
                Alert.alert("Error", "Could not load settings.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchPreferences();
    }, []);

    // Handler to toggle individual settings
    const toggleSetting = async (key) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); 
        
        // 1. Optimistic UI Update
        const newValue = !settings[key];
        setSettings(prev => ({ ...prev, [key]: newValue }));

        // 2. Persist to API
        try {
            // FIX: Using the singular update method defined in MockProfileService
            await ProfileAPI.updateNotificationSetting(key, newValue);
            console.log(`Updated ${key} to ${newValue}`);
        } catch (error) {
            console.error("Failed to update setting", error);
            // Revert on failure
            setSettings(prev => ({ ...prev, [key]: !newValue }));
        }
    };
    
    // Handler for the master toggle switch
    const handleMasterToggle = async (value) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        
        // 1. Optimistic Update
        setNotificationsEnabled(value);

        // 2. Persist to API
        try {
            // FIX: Sending 'global' as the key, as expected by MockProfileService
            await ProfileAPI.updateNotificationSetting('global', value);
            console.log(`Global notifications set to ${value}`);
        } catch (error) {
            console.error("Failed to update global toggle", error);
            setNotificationsEnabled(!value);
        }
    }
    
    const handleQuietHoursPress = () => {
        showModal('quietHours', {
            initialSettings: quietHours,
            onSave: async (newSettings) => {
                // Update Local State
                setQuietHours(newSettings);
                
                // Persist to API
                try {
                    // FIX: Using updateQuietHours method defined in MockProfileService
                    await ProfileAPI.updateQuietHours(newSettings);
                    console.log('Quiet Hours saved:', newSettings);
                } catch (error) {
                    console.error("Failed to save Quiet Hours", error);
                    Alert.alert("Error", "Failed to save Quiet Hours settings.");
                }
            }
        });
    };

    if (isLoading) {
        return (
            <LinearGradient colors={[Colors.background, '#1a1a2e']} style={[styles.container, styles.loadingContainer]}>
                <StatusBar barStyle="light-content" />
                <ActivityIndicator size="large" color={Colors.secondary} />
            </LinearGradient>
        );
    }

    return (
        <LinearGradient colors={[Colors.background, '#1a1a2e']} style={styles.container}>
            <StatusBar barStyle="light-content" />
            {/* Standard screen header */}
            <View style={[styles.header, { paddingTop: insets.top }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}><Ionicons name="arrow-back" size={24} color={Colors.text} /></TouchableOpacity>
                <Text style={styles.headerTitle}>Notifications</Text>
                <View style={styles.headerButton} />
            </View>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {/* Introductory section */}
                <View style={styles.introHeader}>
                    <View style={styles.iconContainer}><Ionicons name="notifications-outline" size={40} color={Colors.secondary} /></View>
                    <Text style={styles.introTitle}>Control Your Alerts</Text>
                    <Text style={styles.introSubtitle}>Choose what updates you receive to stay in the loop without the noise.</Text>
                </View>

                {/* General Notification Settings */}
                <View style={styles.card}>
                    <NotificationRow label="Allow Notifications" description="Receive all push notifications" value={notificationsEnabled} onValueChange={handleMasterToggle} />
                    <View style={styles.divider} />
                    <NotificationRow label="New Chapter Releases" value={settings.newChapters} onValueChange={() => toggleSetting('newChapters')} disabled={!notificationsEnabled} />
                    <NotificationRow label="Personalized Recommendations" value={settings.recommendations} onValueChange={() => toggleSetting('recommendations')} isLast disabled={!notificationsEnabled} />
                </View>
                
                {/* Social Notification Settings */}
                <Text style={styles.sectionTitle}>Social</Text>
                <View style={styles.card}>
                     <NotificationRow label="New Followers" value={settings.newFollowers} onValueChange={() => toggleSetting('newFollowers')} disabled={!notificationsEnabled} />
                     <NotificationRow label="Comments & Replies" value={settings.comments} onValueChange={() => toggleSetting('comments')} disabled={!notificationsEnabled} />
                     <NotificationRow label="Direct Messages" value={settings.dms} onValueChange={() => toggleSetting('dms')} isLast disabled={!notificationsEnabled} />
                </View>

                {/* Other Notification Settings */}
                <Text style={styles.sectionTitle}>Other</Text>
                <View style={styles.card}>
                    <QuietHoursRow onPress={handleQuietHoursPress} currentSettings={quietHours} />
                    <NotificationRow label="Promotions & Events" value={settings.promotions} onValueChange={() => toggleSetting('promotions')} isLast disabled={!notificationsEnabled} />
                </View>
            </ScrollView>
        </LinearGradient>
    );
};

// --- Stylesheet ---
const styles = StyleSheet.create({
    container: { flex: 1, paddingBottom: 5 },
    loadingContainer: { justifyContent: 'center', alignItems: 'center' },
    header: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15, alignItems: 'center', paddingHorizontal: 15, paddingBottom: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: Colors.surface + '80' },
    headerTitle: { fontFamily: 'Poppins_600SemiBold', color: Colors.text, fontSize: 18 },
    headerButton: { padding: 10, minWidth: 40, alignItems: 'center' },
    scrollContainer: { padding: 20, gap: 20 },
    introHeader: { alignItems: 'center', marginBottom: 20 },
    iconContainer: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.surface, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
    introTitle: { fontFamily: 'Poppins_700Bold', color: Colors.text, fontSize: 24, textAlign: 'center' },
    introSubtitle: { fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, fontSize: 16, textAlign: 'center', marginTop: 10, maxWidth: '90%' },
    sectionTitle: { fontFamily: 'Poppins_600SemiBold', color: Colors.textSecondary, fontSize: 14, textTransform: 'uppercase', marginBottom: -10, marginLeft: 5 },
    card: { borderRadius: 16, overflow: 'hidden', backgroundColor: 'rgba(28,28,30,0.5)', borderWidth: StyleSheet.hairlineWidth, borderColor: Colors.surface + '80' },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 15 },
    rowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(255,255,255,0.1)' },
    textContainer: { flex: 1, marginRight: 15 },
    rowLabel: { fontFamily: 'Poppins_500Medium', color: Colors.text, fontSize: 16 },
    rowDescription: { fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, fontSize: 13, marginTop: 3 },
    divider: { height: StyleSheet.hairlineWidth, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 5 },
    rowRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    quietHoursValue: { fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, fontSize: 16 },
});

export default NotificationsScreen;