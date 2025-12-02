// screens/profile/DataAndStorageScreen.js

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, ScrollView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@config/Colors';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

/**
 * A reusable row component for a single setting option.
 * @param {object} props - The component's properties.
 * @param {string} props.icon - The name of the Ionicons icon.
 * @param {string} props.label - The main text label for the setting.
 * @param {string} [props.details] - Optional smaller text for details (e.g., storage amount).
 * @param {function} props.onPress - The function to call when the row is pressed.
 * @param {boolean} [props.isLast=false] - If true, omits the bottom border.
 * @param {string} [props.color] - Custom color for the label text.
 */
const SettingsRow = ({ icon, label, details, onPress, isLast, color = Colors.text }) => (
    <TouchableOpacity onPress={onPress} style={[styles.row, !isLast && styles.rowBorder]}>
        <Ionicons name={icon} size={22} color={color} style={{ marginRight: 15 }} />
        <View style={styles.rowTextContainer}>
            <Text style={[styles.rowLabel, { color }]}>{label}</Text>
        </View>
        <Text style={styles.rowDetails}>{details}</Text>
        <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
    </TouchableOpacity>
);

/**
 * The main screen for managing app data and storage.
 */
const DataAndStorageScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();

    // --- State Management for Storage Data ---
    // Initialized to Empty/Zero values.
    // Connect this state to your backend or FileSystem API in the useEffect below.
    const [storageUsage, setStorageUsage] = useState({
        downloads: 0, // In Bytes
        appData: 0,   // In Bytes
        cache: 0,     // In Bytes
        downloadsLabel: '0 B',
        appDataLabel: '0 B',
        cacheLabel: '0 B'
    });

    /**
     * Effect to fetch storage details on mount.
     */
    useEffect(() => {
        const fetchStorageData = async () => {
            try {
                // TODO: Replace with actual FileSystem.getInfoAsync() or Backend API call
                // For now, it remains empty as requested.
                // Example:
                // const cacheSize = await getCacheSize();
                // setStorageUsage(prev => ({ ...prev, cache: cacheSize, cacheLabel: formatBytes(cacheSize) }));
            } catch (error) {
                console.error("Failed to load storage data", error);
            }
        };

        fetchStorageData();
    }, []);

    // Helper to calculate flex ratios for the progress bar
    const totalSize = storageUsage.downloads + storageUsage.appData + storageUsage.cache;
    const downloadFlex = totalSize > 0 ? storageUsage.downloads / totalSize : 0;
    const appDataFlex = totalSize > 0 ? storageUsage.appData / totalSize : 0;
    const cacheFlex = totalSize > 0 ? storageUsage.cache / totalSize : 0;

    const handleClearCache = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        Alert.alert(
            "Clear Cache",
            "This will clear temporary data but won't delete your downloads. Are you sure?",
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Clear", 
                    style: "destructive", 
                    onPress: () => {
                        // TODO: Connect to backend/filesystem to actually delete cache
                        console.log("Cache Cleared");
                        // Simulating UI update
                        setStorageUsage(prev => ({ ...prev, cache: 0, cacheLabel: '0 B' }));
                    } 
                }
            ]
        );
    };

    const handleClearDownloads = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        Alert.alert(
            "Clear All Downloads",
            "This action is permanent and will remove all downloaded comics from this device.",
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Delete All", 
                    style: "destructive", 
                    onPress: () => {
                        // TODO: Connect to backend/filesystem to delete downloads
                        console.log("All Downloads Cleared");
                        // Simulating UI update
                        setStorageUsage(prev => ({ ...prev, downloads: 0, downloadsLabel: '0 B' }));
                    } 
                }
            ]
        );
    };

    return (
        <LinearGradient colors={[Colors.background, '#1a1a2e']} style={styles.container}>
            <StatusBar barStyle="light-content" />
            {/* Standard screen header */}
            <View style={[styles.header, { paddingTop: insets.top }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}><Ionicons name="arrow-back" size={24} color={Colors.text} /></TouchableOpacity>
                <Text style={styles.headerTitle}>Data & Storage</Text>
                <View style={styles.headerButton} />{/* Empty view for spacing */}
            </View>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {/* Storage Usage Visual Card */}
                <View style={styles.storageCard}>
                    <Text style={styles.storageTitle}>Storage Usage</Text>
                    
                    {/* Visual Progress Bar */}
                    <View style={styles.progressBar}>
                        {totalSize > 0 ? (
                            <>
                                <View style={[styles.progressSegment, { flex: downloadFlex, backgroundColor: Colors.secondary }]} />
                                <View style={[styles.progressSegment, { flex: appDataFlex, backgroundColor: Colors.primary }]} />
                                <View style={[styles.progressSegment, { flex: cacheFlex, backgroundColor: Colors.textSecondary }]} />
                            </>
                        ) : (
                            // Empty state for the bar
                            <View style={[styles.progressSegment, { flex: 1, backgroundColor: Colors.surface, opacity: 0.5 }]} />
                        )}
                    </View>
                    
                    <View style={styles.legendContainer}>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: Colors.secondary }]} />
                            <Text style={styles.legendText}>Downloads ({storageUsage.downloadsLabel})</Text>
                        </View>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: Colors.primary }]} />
                            <Text style={styles.legendText}>App Data ({storageUsage.appDataLabel})</Text>
                        </View>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: Colors.textSecondary }]} />
                            <Text style={styles.legendText}>Cache ({storageUsage.cacheLabel})</Text>
                        </View>
                    </View>
                </View>

                {/* Settings Actions */}
                <Text style={styles.sectionTitle}>Manage Data</Text>
                <View style={styles.card}>
                    <SettingsRow icon="folder-open-outline" label="Manage Downloads" details="View by comic" onPress={() => {}} />
                    <SettingsRow 
                        icon="trash-bin-outline" 
                        label="Clear Cache" 
                        details={storageUsage.cacheLabel} 
                        onPress={handleClearCache} 
                        isLast 
                    />
                </View>
                
                <Text style={styles.sectionTitle}>Danger Zone</Text>
                <View style={styles.card}>
                    <SettingsRow icon="warning-outline" label="Clear All Downloads" onPress={handleClearDownloads} isLast color={Colors.danger} />
                </View>
            </ScrollView>
        </LinearGradient>
    );
};

// --- Stylesheet ---
const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15, paddingBottom: 10, marginTop: 15, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: Colors.surface + '80' },
    headerTitle: { fontFamily: 'Poppins_600SemiBold', color: Colors.text, fontSize: 18 },
    headerButton: { padding: 10, minWidth: 40, alignItems: 'center' },
    scrollContainer: { padding: 20, gap: 20 },
    storageCard: { backgroundColor: Colors.surface, borderRadius: 16, padding: 20 },
    storageTitle: { fontFamily: 'Poppins_600SemiBold', color: Colors.text, fontSize: 16, marginBottom: 15 },
    progressBar: { flexDirection: 'row', height: 12, borderRadius: 6, overflow: 'hidden', backgroundColor: Colors.background },
    progressSegment: {},
    legendContainer: { marginTop: 15, gap: 8 },
    legendItem: { flexDirection: 'row', alignItems: 'center' },
    legendDot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
    legendText: { fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, fontSize: 14 },
    sectionTitle: { fontFamily: 'Poppins_600SemiBold', color: Colors.textSecondary, fontSize: 14, textTransform: 'uppercase', marginBottom: -10, marginLeft: 5 },
    card: { borderRadius: 16, overflow: 'hidden', backgroundColor: 'rgba(28,28,30,0.5)', borderWidth: StyleSheet.hairlineWidth, borderColor: Colors.surface + '80' },
    row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, paddingHorizontal: 15 },
    rowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(255,255,255,0.1)' },
    rowTextContainer: { flex: 1 },
    rowLabel: { fontFamily: 'Poppins_500Medium', fontSize: 16 },
    rowDetails: { fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, fontSize: 14, marginRight: 8 },
});

export default DataAndStorageScreen;