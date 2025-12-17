import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@config/Colors';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useProfile } from '@context/main/ProfileContext';
import { useAlert } from '@context/other/AlertContext'; 
// IMPORTS
import { SettingsRow } from '../../components/settings/SettingsShared';
import { StorageVisualizer } from '../../components/settings/StorageComponents';

const DataAndStorageScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { profile, clearCache, clearDownloads } = useProfile();
    const { showAlert, showToast } = useAlert();
    
    const storage = profile?.settings?.storage || { downloads: 0, appData: 0, cache: 0 };
    // Re-calculating format for display logic in handler (visualizer handles the bar)
    const format = (b) => {
        if(b === 0) return '0 B';
        const i = Math.floor(Math.log(b) / Math.log(1024));
        return (b / Math.pow(1024, i)).toFixed(1) + ' ' + ['B','KB','MB','GB'][i];
    };
    const cacheLabel = format(storage.cache);
    const downloadsLabel = format(storage.downloads);

    const handleClearCache = () => {
        if (storage.cache === 0) { showToast( "Cache is already empty.",  "info" ); return; }
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        showAlert({
            title: "Clear Cache?",
            message: `This will free up ${cacheLabel}. Your browsing history won't be affected.`,
            btnText: "Clear",
            secondaryBtnText: "Cancel",
            onClose: async () => {
                const success = await clearCache();
                if (success) { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); showToast("Cache cleared successfully.", "success" ); } 
                else { showToast("Failed to clear cache.", "error" ); }
            }
        });
    };

    const handleClearDownloads = () => {
        if (storage.downloads === 0) { showToast("You don't have any downloaded content.","info" ); return; }
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        showAlert({
            title: "Delete All Downloads?",
            message: `This will remove all downloaded chapters (${downloadsLabel}) from your device.`,
            btnText: "Delete",
            secondaryBtnText: "Cancel",
            type: "error",
            onClose: async () => {
                const success = await clearDownloads();
                if (success) { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); showToast( "All downloads removed.", "success" ); } 
                else { showToast( "Failed to delete downloads.",  "error" ); }
            }
        });
    };

    const handleManageDownloads = () => {
        if (storage.downloads === 0) { showToast( "No downloads to manage.", "info" ); } 
        else { showToast( "Detailed download manager is under construction.", "info" ); }
    };

    return (
        <LinearGradient colors={[Colors.background, '#1a1a2e']} style={styles.container}>
            <StatusBar barStyle="light-content" />
            <View style={[styles.header, { paddingTop: insets.top }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Data & Storage</Text>
                <View style={styles.headerButton} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                <StorageVisualizer storage={storage} />

                <Text style={styles.sectionTitle}>Manage Data</Text>
                <View style={styles.card}>
                    <SettingsRow icon="folder-open-outline" label="Manage Downloads" details="View Items" onPress={handleManageDownloads} />
                    <SettingsRow icon="trash-bin-outline" label="Clear Cache" details={cacheLabel} onPress={handleClearCache} isLast />
                </View>
                
                <Text style={styles.sectionTitle}>Danger Zone</Text>
                <View style={[styles.card, { borderColor: 'rgba(231, 76, 60, 0.3)' }]}>
                    <SettingsRow icon="warning-outline" label="Clear All Downloads" onPress={handleClearDownloads} isLast color={Colors.danger} />
                </View>
            </ScrollView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15, paddingBottom: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(255,255,255,0.1)' },
    headerTitle: { fontFamily: 'Poppins_600SemiBold', color: Colors.text, fontSize: 18 },
    headerButton: { padding: 10, minWidth: 40, alignItems: 'center' },
    scrollContainer: { padding: 20, gap: 20 },
    sectionTitle: { fontFamily: 'Poppins_600SemiBold', color: Colors.textSecondary, fontSize: 12, textTransform: 'uppercase', marginBottom: -10, marginLeft: 8, letterSpacing: 1 },
    card: { borderRadius: 16, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(255,255,255,0.1)' },
});

export default DataAndStorageScreen;