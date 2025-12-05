import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, ScrollView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@config/Colors';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useProfile } from '@context/ProfileContext';

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

const DataAndStorageScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { profile, clearCache, clearDownloads } = useProfile();
    
    // Format helper since ProfileAPI does logic but we read from state now
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
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        Alert.alert(
            "Clear Cache",
            "Are you sure?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Clear", style: "destructive", onPress: clearCache }
            ]
        );
    };

    const handleClearDownloads = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        Alert.alert(
            "Clear All Downloads",
            "This will remove all downloaded comics. Continue?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Delete All", style: "destructive", onPress: clearDownloads }
            ]
        );
    };

    return (
        <LinearGradient colors={[Colors.background, '#1a1a2e']} style={styles.container}>
            <StatusBar barStyle="light-content" />
            <View style={[styles.header, { paddingTop: insets.top }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}><Ionicons name="arrow-back" size={24} color={Colors.text} /></TouchableOpacity>
                <Text style={styles.headerTitle}>Data & Storage</Text>
                <View style={styles.headerButton} />
            </View>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.storageCard}>
                    <Text style={styles.storageTitle}>Storage Usage</Text>
                    <View style={styles.progressBar}>
                        {totalSize > 0 ? (
                            <>
                                <View style={[styles.progressSegment, { flex: downloadFlex, backgroundColor: Colors.secondary }]} />
                                <View style={[styles.progressSegment, { flex: appDataFlex, backgroundColor: Colors.primary }]} />
                                <View style={[styles.progressSegment, { flex: cacheFlex, backgroundColor: Colors.textSecondary }]} />
                            </>
                        ) : (
                            <View style={[styles.progressSegment, { flex: 1, backgroundColor: Colors.surface, opacity: 0.5 }]} />
                        )}
                    </View>
                    <View style={styles.legendContainer}>
                        <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: Colors.secondary }]} /><Text style={styles.legendText}>Downloads ({downloadsLabel})</Text></View>
                        <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: Colors.primary }]} /><Text style={styles.legendText}>App Data ({appDataLabel})</Text></View>
                        <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: Colors.textSecondary }]} /><Text style={styles.legendText}>Cache ({cacheLabel})</Text></View>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>Manage Data</Text>
                <View style={styles.card}>
                    <SettingsRow icon="folder-open-outline" label="Manage Downloads" details="View by comic" onPress={() => {}} />
                    <SettingsRow icon="trash-bin-outline" label="Clear Cache" details={cacheLabel} onPress={handleClearCache} isLast />
                </View>
                
                <Text style={styles.sectionTitle}>Danger Zone</Text>
                <View style={styles.card}>
                    <SettingsRow icon="warning-outline" label="Clear All Downloads" onPress={handleClearDownloads} isLast color={Colors.danger} />
                </View>
            </ScrollView>
        </LinearGradient>
    );
};
// ... styles (same as provided)
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