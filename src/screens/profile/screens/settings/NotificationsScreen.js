// screens/profile/NotificationsScreen.js

// Import essential modules from React, React Native, and Expo libraries.
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, StatusBar, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@config/Colors';
import { useModal } from '@context/ModalContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

/**
 * A reusable UI component for a single setting row with a label, description, and toggle switch.
 * @param {object} props - The component's properties.
 * @param {string} props.label - The primary text label for the setting.
 * @param {string} [props.description] - Optional secondary text for more detail.
 * @param {boolean} props.value - The current boolean state of the switch.
 * @param {function} props.onValueChange - Callback function when the switch is toggled.
 * @param {boolean} [props.isLast=false] - If true, the bottom border is omitted.
 * @param {boolean} [props.disabled=false] - If true, the row is visually disabled (faded) and the switch is non-interactive.
 */
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

/**
 * A specialized row component for the "Quiet Hours" setting, which leads to another screen.
 * It displays a text value ("Off") and a chevron icon instead of a switch.
 * @param {object} props - The component's properties.
 * @param {function} props.onPress - Callback function for when the row is pressed.
 */
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


/**
 * The main screen for managing all notification-related preferences.
 */
const NotificationsScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { show: showModal } = useModal();
    
    // --- State Management ---
    // Loading state for fetching initial preferences
    const [isLoading, setIsLoading] = useState(true);

    // A master state to enable or disable all notifications globally.
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);
    
    const [quietHours, setQuietHours] = useState({
        enabled: false,
        start: '10:00 PM',
        end: '8:00 AM',
    });

    // State to manage individual notification categories. Initialized to defaults.
    const [settings, setSettings] = useState({
        newChapters: false,
        recommendations: false,
        newFollowers: false,
        comments: false,
        dms: false,
        promotions: false,
    });

    /**
     * Effect to fetch notification preferences on mount.
     */
    useEffect(() => {
        const fetchPreferences = async () => {
            try {
                // TODO: Connect to Backend API to get user notification settings
                // Example:
                // const data = await api.get('/user/notifications');
                // setNotificationsEnabled(data.globalEnabled);
                // setSettings(data.preferences);
                // setQuietHours(data.quietHours);
                
                // Simulating network request
                setTimeout(() => {
                    // Simulating a user who has notifications enabled
                    setNotificationsEnabled(true);
                    setSettings({
                        newChapters: true,
                        recommendations: true,
                        newFollowers: true,
                        comments: true,
                        dms: false,
                        promotions: false,
                    });
                    setIsLoading(false);
                }, 1000);
            } catch (error) {
                console.error("Failed to load notification settings", error);
                setIsLoading(false);
            }
        };

        fetchPreferences();
    }, []);

    // A generic handler to toggle the state of an individual setting.
    const toggleSetting = (key) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); // Provides gentle haptic feedback.
        
        // Optimistic UI Update
        const newValue = !settings[key];
        setSettings(prev => ({ ...prev, [key]: newValue }));

        // TODO: Send API request to update specific setting
        // api.patch('/user/notifications', { [key]: newValue });
        console.log(`Toggled ${key} to ${newValue}`);
    };
    
    // A handler for the master toggle switch.
    const handleMasterToggle = (value) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); // Provides a more noticeable haptic feedback.
        setNotificationsEnabled(value);

        // TODO: Send API request to update global setting
        // api.patch('/user/notifications/global', { enabled: value });
        console.log(`Global notifications set to ${value}`);
    }
    
    const handleQuietHoursPress = () => {
        showModal('quietHours', {
            initialSettings: quietHours,
            onSave: (newSettings) => {
                // This callback receives the new settings from the modal
                setQuietHours(newSettings);
                
                // TODO: Send API request to update quiet hours
                // api.patch('/user/notifications/quiet-hours', newSettings);
                console.log('Quiet Hours saved:', newSettings);
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
                <View style={styles.headerButton} />{/* Empty view for spacing */}
            </View>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {/* Introductory section with an icon and description */}
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
                    <QuietHoursRow onPress={handleQuietHoursPress}currentSettings={quietHours} />
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