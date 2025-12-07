// screens/profile/TrophyCaseScreen.js

import { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions, StatusBar, Modal, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';

import { Colors } from '@config/Colors';
import EmptyState from '../components/empty/EmptyState';
import { useProfile } from '@context/main/ProfileContext'; // IMPORT CONTEXT

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 3;
const ITEM_SIZE = (width - 40) / COLUMN_COUNT;

// --- Components ---

const FilterChip = ({ label, active, onPress }) => (
    <TouchableOpacity onPress={onPress} style={[styles.filterChip, active && styles.filterChipActive]}>
        <Text style={[styles.filterText, active && styles.filterTextActive]}>{label}</Text>
    </TouchableOpacity>
);

const TrophyItem = ({ item, index, onPress }) => {
    const scale = useSharedValue(1);
    const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
    const handlePressIn = () => { scale.value = withSpring(0.95); };
    const handlePressOut = () => { scale.value = withSpring(1); };

    return (
        <Animated.View entering={FadeInDown.delay(index * 50).springify()} style={styles.gridItemContainer}>
            <TouchableOpacity 
                activeOpacity={0.9}
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                style={styles.trophyTouchArea}
            >
                <Animated.View style={[styles.trophyWrapper, animatedStyle]}>
                    <LinearGradient
                        colors={item.unlocked ? [Colors.surface, Colors.surface + '40'] : [Colors.surface + '20', Colors.surface + '10']}
                        style={[styles.trophyCase, !item.unlocked && styles.trophyCaseLocked]}
                    >
                        <View style={[styles.iconGlow, item.unlocked && { backgroundColor: Colors.secondary + '20' }]} />
                        <Ionicons name={item.unlocked ? item.icon : 'lock-closed'} size={32} color={item.unlocked ? Colors.secondary : Colors.textSecondary + '60'} />
                    </LinearGradient>
                    <View style={styles.shelfBase} />
                    <Text style={[styles.trophyName, !item.unlocked && { color: Colors.textSecondary }]} numberOfLines={1}>{item.name}</Text>
                </Animated.View>
            </TouchableOpacity>
        </Animated.View>
    );
};

const TrophyDetailModal = ({ visible, item, onClose }) => {
    if (!item) return null;
    return (
        <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
                <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} />
                <Animated.View entering={FadeInDown.springify()} style={styles.modalContent}>
                    <View style={[styles.modalIconContainer, !item.unlocked && { borderColor: Colors.textSecondary }]}>
                        <Ionicons name={item.unlocked ? item.icon : 'lock-closed'} size={50} color={item.unlocked ? Colors.secondary : Colors.textSecondary} />
                    </View>
                    <Text style={styles.modalTitle}>{item.name}</Text>
                    <View style={[styles.rarityBadge, { backgroundColor: item.unlocked ? Colors.secondary : Colors.surface }]}>
                        <Text style={styles.rarityText}>{item.rarity.toUpperCase()}</Text>
                    </View>
                    <Text style={styles.modalDesc}>{item.description}</Text>
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}><Text style={styles.closeButtonText}>Close</Text></TouchableOpacity>
                </Animated.View>
            </View>
        </Modal>
    );
};

// --- Main Screen ---

const TrophyCaseScreen = () => {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    
    // 1. Get Data from Context
    const { profile, isLoading } = useProfile();
    const trophies = profile?.badges || [];

    const [filter, setFilter] = useState('All');
    const [selectedTrophy, setSelectedTrophy] = useState(null);

    const handlePressTrophy = (item) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setSelectedTrophy(item);
    };

    // Filter Logic
    const displayedTrophies = useMemo(() => {
        if (filter === 'Unlocked') return trophies.filter(t => t.unlocked);
        if (filter === 'Locked') return trophies.filter(t => !t.unlocked);
        return trophies;
    }, [filter, trophies]);

    const unlockedCount = trophies.filter(t => t.unlocked).length;
    const progress = trophies.length > 0 ? unlockedCount / trophies.length : 0;

    // Loading State
    if (isLoading && !profile) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={Colors.secondary} />
            </View>
        );
    }


    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Trophy Case</Text>
                <View style={{ width: 40 }} /> 
            </View>

            {/* Summary Card */}
            <View style={styles.summaryContainer}>
                <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
                <View style={styles.summaryContent}>
                    <View>
                        <Text style={styles.summaryLabel}>Total Progress</Text>
                        <Text style={styles.summaryValue}>{Math.round(progress * 100)}% <Text style={styles.summaryTotal}>({unlockedCount}/{trophies.length})</Text></Text>
                    </View>
                    <Ionicons name="trophy" size={40} color={Colors.secondary} />
                </View>
                <View style={styles.progressBarBg}>
                    <Animated.View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
                </View>
            </View>

            {/* Filters */}
            <View style={styles.filterContainer}>
                {['All', 'Unlocked', 'Locked'].map(f => (
                    <FilterChip key={f} label={f} active={filter === f} onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setFilter(f);
                    }} />
                ))}
            </View>

            {/* The Cabinet Grid */}
            <FlatList
                data={displayedTrophies}
                keyExtractor={item => item.id}
                numColumns={COLUMN_COUNT}
                contentContainerStyle={styles.gridContent}
                showsVerticalScrollIndicator={false}
                renderItem={({ item, index }) => (
                    <TrophyItem item={item} index={index} onPress={() => handlePressTrophy(item)} />
                )}
                ListEmptyComponent={
                    <View style={styles.emptyStateContainer}>
                        <EmptyState 
                            icon="trophy-outline"
                            title="Trophy Case Empty"
                            message="We couldn't find any achievements to display right now."
                        />
                    </View>
                }
            />

            <TrophyDetailModal visible={!!selectedTrophy} item={selectedTrophy} onClose={() => setSelectedTrophy(null)} />
        </View>
    );
};

// ... styles ...
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 20 },
    backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.surface, justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontFamily: 'Poppins_700Bold', color: Colors.text, fontSize: 20 },
    summaryContainer: { marginHorizontal: 20, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: Colors.surface, marginBottom: 20 },
    summaryContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
    summaryLabel: { fontFamily: 'Poppins_500Medium', color: Colors.textSecondary, fontSize: 14 },
    summaryValue: { fontFamily: 'Poppins_700Bold', color: Colors.text, fontSize: 24 },
    summaryTotal: { fontSize: 16, color: Colors.textSecondary, fontFamily: 'Poppins_500Medium' },
    progressBarBg: { height: 6, backgroundColor: Colors.background, width: '100%' },
    progressBarFill: { height: '100%', backgroundColor: Colors.secondary },
    filterContainer: { flexDirection: 'row', paddingHorizontal: 20, gap: 10, marginBottom: 15 },
    filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.surface },
    filterChipActive: { backgroundColor: Colors.secondary, borderColor: Colors.secondary },
    filterText: { fontFamily: 'Poppins_500Medium', color: Colors.textSecondary, fontSize: 13 },
    filterTextActive: { color: Colors.background },
    gridContent: { paddingHorizontal: 10, paddingBottom: 50, flexGrow: 1 },
    gridItemContainer: { width: ITEM_SIZE, alignItems: 'center', marginBottom: 25 },
    trophyTouchArea: { alignItems: 'center' },
    trophyWrapper: { alignItems: 'center', width: '100%' },
    trophyCase: { width: 80, height: 80, borderRadius: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', overflow: 'hidden' },
    trophyCaseLocked: { opacity: 0.6, borderColor: 'rgba(255,255,255,0.05)' },
    iconGlow: { position: 'absolute', width: 40, height: 40, borderRadius: 20, opacity: 0.5, filter: 'blur(10px)' },
    shelfBase: { width: 90, height: 4, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 2, marginTop: 10, marginBottom: 5 },
    trophyName: { fontFamily: 'Poppins_500Medium', color: Colors.text, fontSize: 11, textAlign: 'center', width: 90 },
    emptyStateContainer: { marginTop: 40, alignItems: 'center', justifyContent: 'center' },
    modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: 'rgba(0,0,0,0.6)' },
    modalContent: { width: '90%', backgroundColor: Colors.background, borderRadius: 24, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: Colors.surface },
    modalIconContainer: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.surface, justifyContent: 'center', alignItems: 'center', marginBottom: 16, borderWidth: 2, borderColor: Colors.secondary },
    modalTitle: { fontFamily: 'Poppins_700Bold', color: Colors.text, fontSize: 22, textAlign: 'center', marginBottom: 5 },
    rarityBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8, marginBottom: 15 },
    rarityText: { fontFamily: 'Poppins_700Bold', color: Colors.background, fontSize: 10, letterSpacing: 1 },
    modalDesc: { fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, fontSize: 14, textAlign: 'center', marginBottom: 20, lineHeight: 20 },
    closeButton: { width: '100%', paddingVertical: 14, backgroundColor: Colors.text, borderRadius: 16, alignItems: 'center' },
    closeButtonText: { fontFamily: 'Poppins_600SemiBold', color: Colors.background, fontSize: 16 },
});

export default TrophyCaseScreen;