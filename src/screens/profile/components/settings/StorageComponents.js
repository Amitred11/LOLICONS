import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@config/Colors';

export const StorageVisualizer = ({ storage }) => {
    // Format helper
    const format = (b) => {
        if(b === 0) return '0 B';
        const i = Math.floor(Math.log(b) / Math.log(1024));
        return (b / Math.pow(1024, i)).toFixed(1) + ' ' + ['B','KB','MB','GB'][i];
    };

    const downloadsLabel = format(storage.downloads);
    const appDataLabel = format(storage.appData);
    const cacheLabel = format(storage.cache);
    const totalSize = storage.downloads + storage.appData + storage.cache;
    const downloadFlex = totalSize > 0 ? storage.downloads / totalSize : 0;
    const appDataFlex = totalSize > 0 ? storage.appData / totalSize : 0;
    const cacheFlex = totalSize > 0 ? storage.cache / totalSize : 0;

    return (
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
    );
};

const styles = StyleSheet.create({
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
});