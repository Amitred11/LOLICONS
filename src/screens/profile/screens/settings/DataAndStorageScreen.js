import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@config/Colors';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useProfile } from '@context/main/ProfileContext';
import { useAlert } from '@context/other/AlertContext'; // Use custom Alert Context

const SettingsRow = ({ icon, label, details, onPress, isLast, color = Colors.text }) => (
    <TouchableOpacity 
        onPress={onPress} 
        style={[styles.row, !isLast && styles.rowBorder]}
        activeOpacity={0.7}
    >
        <View style={[styles.iconBox, { backgroundColor: color === Colors.danger ? 'rgba(231, 76, 60, 0.1)' : 'rgba(255,255,255,0.05)' }]}>
            <Ionicons name={icon} size={20} color={color} />
        </View>
        <View style={styles.rowTextContainer}>
            <Text style={[styles.rowLabel, { color }]}>{label}</Text>
        </View>
        {details && <Text style={styles.rowDetails}>{details}</Text>}
        <Ionicons name="chevron-forward" size={18} color={Colors.surface} />
    </TouchableOpacity>
);

const DataAndStorageScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { profile, clearCache, clearDownloads } = useProfile();
    const { showAlert, showToast } = useAlert(); // Access custom alert
    
    // Format helper
    const format = (b) => {
        if(b === 0) return '0 B';
        const i = Math.floor(Math.log(b) / Math.log(1024));
        return (b / Math.pow(1024, i)).toFixed(1) + ' ' + ['B','KB','MB','GB'][i];
    };

    const storage = profile?.settings?.storage || { downloads: 0, appData: 0, cache: 0 };
    const downloadsLabel = format(storage.downloads);
    const appDataLabel = format(storage.appData);
    const cacheLabel = format(storage.cache);

    const totalSize = storage.downloads + storage.appData + storage.cache;
    const downloadFlex = totalSize > 0 ? storage.downloads / totalSize : 0;
    const appDataFlex = totalSize > 0 ? storage.appData / totalSize : 0;
    const cacheFlex = totalSize > 0 ? storage.cache / totalSize : 0;

    const handleClearCache = () => {
        if (storage.cache === 0) {
            showToast( "Cache is already empty.",  "info" );
            return;
        }

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        
        showAlert({
            title: "Clear Cache?",
            message: `This will free up ${cacheLabel}. Your browsing history won't be affected.`,
            btnText: "Clear",
            secondaryBtnText: "Cancel",
            onClose: async () => {
                const success = await clearCache();
                if (success) {
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    showToast("Cache cleared successfully.", "success" );
                } else {
                    showToast("Failed to clear cache.", "error" );
                }
            }
        });
    };

    const handleClearDownloads = () => {
        if (storage.downloads === 0) {
            showToast("You don't have any downloaded content.","info" );
            return;
        }

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        
        showAlert({
            title: "Delete All Downloads?",
            message: `This will remove all downloaded chapters (${downloadsLabel}) from your device.`,
            btnText: "Delete",
            secondaryBtnText: "Cancel",
            type: "error", // Use error styling for destructive actions
            onClose: async () => {
                const success = await clearDownloads();
                if (success) {
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    showToast( "All downloads removed.", "success" );
                } else {
                    showToast( "Failed to delete downloads.",  "error" );
                }
            }
        });
    };

    const handleManageDownloads = () => {
        // Placeholder for future navigation to a detailed list
        if (storage.downloads === 0) {
            showToast( "No downloads to manage.", "info" );
        } else {
            showToast( "Detailed download manager is under construction.", "info" );
        }
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
                
                {/* Visual Storage Bar */}
                <View style={styles.storageCard}>
                    <View style={styles.storageHeader}>
                        <Text style={styles.storageTitle}>Device Storage</Text>
                        <Text style={styles.totalUsed}>{format(totalSize)} used</Text>
                    </View>
                    
                    <View style={styles.progressBar}>
                        {totalSize > 0 ? (
                            <>
                                <View style={[styles.progressSegment, { flex: downloadFlex, backgroundColor: Colors.secondary }]} />
                                <View style={[styles.progressSegment, { flex: appDataFlex, backgroundColor: Colors.primary }]} />
                                <View style={[styles.progressSegment, { flex: cacheFlex, backgroundColor: Colors.textSecondary }]} />
                            </>
                        ) : (
                            <View style={[styles.progressSegment, { flex: 1, backgroundColor: Colors.surface, opacity: 0.3 }]} />
                        )}
                    </View>

                    <View style={styles.legendContainer}>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: Colors.secondary }]} />
                            <Text style={styles.legendText}>Downloads ({downloadsLabel})</Text>
                        </View>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: Colors.primary }]} />
                            <Text style={styles.legendText}>App Data ({appDataLabel})</Text>
                        </View>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: Colors.textSecondary }]} />
                            <Text style={styles.legendText}>Cache ({cacheLabel})</Text>
                        </View>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>Manage Data</Text>
                <View style={styles.card}>
                    <SettingsRow 
                        icon="folder-open-outline" 
                        label="Manage Downloads" 
                        details="View Items" 
                        onPress={handleManageDownloads} 
                    />
                    <SettingsRow 
                        icon="trash-bin-outline" 
                        label="Clear Cache" 
                        details={cacheLabel} 
                        onPress={handleClearCache} 
                        isLast 
                    />
                </View>
                
                <Text style={styles.sectionTitle}>Danger Zone</Text>
                <View style={[styles.card, { borderColor: 'rgba(231, 76, 60, 0.3)' }]}>
                    <SettingsRow 
                        icon="warning-outline" 
                        label="Clear All Downloads" 
                        onPress={handleClearDownloads} 
                        isLast 
                        color={Colors.danger} 
                    />
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
    
    storageCard: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 20, borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(255,255,255,0.1)' },
    storageHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
    storageTitle: { fontFamily: 'Poppins_600SemiBold', color: Colors.text, fontSize: 16 },
    totalUsed: { fontFamily: 'Poppins_500Medium', color: Colors.textSecondary, fontSize: 14 },
    
    progressBar: { flexDirection: 'row', height: 12, borderRadius: 6, overflow: 'hidden', backgroundColor: 'rgba(0,0,0,0.3)', width: '100%' },
    progressSegment: { height: '100%' },
    
    legendContainer: { marginTop: 15, gap: 10 },
    legendItem: { flexDirection: 'row', alignItems: 'center' },
    legendDot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
    legendText: { fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, fontSize: 13 },
    
    sectionTitle: { fontFamily: 'Poppins_600SemiBold', color: Colors.textSecondary, fontSize: 12, textTransform: 'uppercase', marginBottom: -10, marginLeft: 8, letterSpacing: 1 },
    card: { borderRadius: 16, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(255,255,255,0.1)' },
    
    row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 16 },
    rowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(255,255,255,0.05)' },
    
    iconBox: { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    rowTextContainer: { flex: 1 },
    rowLabel: { fontFamily: 'Poppins_500Medium', fontSize: 15 },
    rowDetails: { fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, fontSize: 13, marginRight: 8, opacity: 0.7 },
});

export default DataAndStorageScreen;