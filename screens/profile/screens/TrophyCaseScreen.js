import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions, Image, StatusBar, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';

import { Colors } from '../../../constants/Colors';
import { userData } from '../../../constants/mockData';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 3;
const ITEM_SIZE = (width - 40) / COLUMN_COUNT;

// --- Mock Data for "All Possible Trophies" ---
// In a real app, this would come from a backend defining all available achievements.
const ALL_TROPHIES = [
    { id: '1', name: 'First Step', icon: 'footsteps', description: 'Read your first chapter.', rarity: 'Common', xp: 50 },
    { id: '2', name: 'Bookworm', icon: 'book', description: 'Read 50 chapters.', rarity: 'Rare', xp: 200 },
    { id: '3', name: 'Night Owl', icon: 'moon', description: 'Read past 2 AM.', rarity: 'Epic', xp: 500 },
    { id: '4', name: 'Socialite', icon: 'chatbubbles', description: 'Post 10 comments.', rarity: 'Common', xp: 100 },
    { id: '5', name: 'Collector', icon: 'library', description: 'Add 20 series to favorites.', rarity: 'Rare', xp: 300 },
    { id: '6', name: 'Trendsetter', icon: 'flame', description: 'Read a #1 Trending comic.', rarity: 'Common', xp: 150 },
    { id: '7', name: 'Supporter', icon: 'heart', description: 'Donate to a creator.', rarity: 'Legendary', xp: 1000 },
    { id: '8', name: 'Speedster', icon: 'flash', description: 'Finish a series in one day.', rarity: 'Epic', xp: 600 },
    { id: '9', name: 'Veteran', icon: 'shield-checkmark', description: 'Account active for 1 year.', rarity: 'Legendary', xp: 2000 },
];

// Merge user data to determine lock status
const getMergedTrophies = () => {
    const userBadgeIds = userData.badges.map(b => b.id);
    return ALL_TROPHIES.map(trophy => ({
        ...trophy,
        unlocked: userBadgeIds.includes(trophy.id) || ['1', '2', '6'].includes(trophy.id), // Simulating some unlocked
    }));
};

// --- Components ---

const FilterChip = ({ label, active, onPress }) => (
    <TouchableOpacity onPress={onPress} style={[styles.filterChip, active && styles.filterChipActive]}>
        <Text style={[styles.filterText, active && styles.filterTextActive]}>{label}</Text>
    </TouchableOpacity>
);

const TrophyItem = ({ item, index, onPress }) => {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }]
    }));

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
                    {/* The "Glass" Case Background for the item */}
                    <LinearGradient
                        colors={item.unlocked 
                            ? [Colors.surface, Colors.surface + '40'] 
                            : [Colors.surface + '20', Colors.surface + '10']}
                        style={[styles.trophyCase, !item.unlocked && styles.trophyCaseLocked]}
                    >
                        <View style={[styles.iconGlow, item.unlocked && { backgroundColor: Colors.secondary + '20' }]} />
                        <Ionicons 
                            name={item.unlocked ? item.icon : 'lock-closed'} 
                            size={32} 
                            color={item.unlocked ? Colors.secondary : Colors.textSecondary + '60'} 
                        />
                    </LinearGradient>
                    
                    {/* Shelf Reflection */}
                    <View style={styles.shelfBase} />
                    
                    <Text style={[styles.trophyName, !item.unlocked && { color: Colors.textSecondary }]} numberOfLines={1}>
                        {item.name}
                    </Text>
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
                        <Ionicons 
                            name={item.unlocked ? item.icon : 'lock-closed'} 
                            size={50} 
                            color={item.unlocked ? Colors.secondary : Colors.textSecondary} 
                        />
                    </View>
                    
                    <Text style={styles.modalTitle}>{item.name}</Text>
                    <View style={[styles.rarityBadge, { backgroundColor: item.unlocked ? Colors.secondary : Colors.surface }]}>
                        <Text style={styles.rarityText}>{item.rarity.toUpperCase()}</Text>
                    </View>

                    <Text style={styles.modalDesc}>{item.description}</Text>
                    
                    <View style={styles.modalStats}>
                        <View style={styles.modalStatItem}>
                            <Text style={styles.modalStatLabel}>Status</Text>
                            <Text style={[styles.modalStatValue, { color: item.unlocked ? '#4CAF50' : Colors.textSecondary }]}>
                                {item.unlocked ? 'Unlocked' : 'Locked'}
                            </Text>
                        </View>
                        <View style={styles.modalStatDivider} />
                        <View style={styles.modalStatItem}>
                            <Text style={styles.modalStatLabel}>XP Value</Text>
                            <Text style={styles.modalStatValue}>{item.xp}</Text>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Text style={styles.closeButtonText}>Close</Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </Modal>
    );
};

// --- Main Screen ---

const TrophyCaseScreen = () => {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const [filter, setFilter] = useState('All'); // All, Unlocked, Locked
    const [selectedTrophy, setSelectedTrophy] = useState(null);

    const mergedTrophies = useMemo(() => getMergedTrophies(), []);
    
    const displayedTrophies = useMemo(() => {
        if (filter === 'Unlocked') return mergedTrophies.filter(t => t.unlocked);
        if (filter === 'Locked') return mergedTrophies.filter(t => !t.unlocked);
        return mergedTrophies;
    }, [filter, mergedTrophies]);

    const unlockedCount = mergedTrophies.filter(t => t.unlocked).length;
    const progress = unlockedCount / mergedTrophies.length;

    const handlePressTrophy = (item) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setSelectedTrophy(item);
    };

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
                        <Text style={styles.summaryValue}>{Math.round(progress * 100)}% <Text style={styles.summaryTotal}>({unlockedCount}/{mergedTrophies.length})</Text></Text>
                    </View>
                    <Ionicons name="trophy" size={40} color={Colors.secondary} />
                </View>
                {/* Progress Bar */}
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
                    <View style={styles.emptyState}>
                        <Ionicons name="file-tray-outline" size={40} color={Colors.textSecondary} />
                        <Text style={styles.emptyStateText}>No trophies found.</Text>
                    </View>
                }
            />

            <TrophyDetailModal 
                visible={!!selectedTrophy} 
                item={selectedTrophy} 
                onClose={() => setSelectedTrophy(null)} 
            />
        </View>
    );
};

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

    gridContent: { paddingHorizontal: 10, paddingBottom: 50 },
    gridItemContainer: { width: ITEM_SIZE, alignItems: 'center', marginBottom: 25 },
    trophyTouchArea: { alignItems: 'center' },
    trophyWrapper: { alignItems: 'center', width: '100%' },
    trophyCase: { width: 80, height: 80, borderRadius: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', overflow: 'hidden' },
    trophyCaseLocked: { opacity: 0.6, borderColor: 'rgba(255,255,255,0.05)' },
    iconGlow: { position: 'absolute', width: 40, height: 40, borderRadius: 20, opacity: 0.5, filter: 'blur(10px)' }, // Note: basic filter doesn't work in standard RN without libs, transparency handles the look
    shelfBase: { width: 90, height: 4, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 2, marginTop: 10, marginBottom: 5 },
    trophyName: { fontFamily: 'Poppins_500Medium', color: Colors.text, fontSize: 11, textAlign: 'center', width: 90 },

    emptyState: { alignItems: 'center', marginTop: 50 },
    emptyStateText: { fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, marginTop: 10 },

    // Modal Styles
    modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: 'rgba(0,0,0,0.6)' },
    modalContent: { width: '90%', backgroundColor: Colors.background, borderRadius: 24, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: Colors.surface },
    modalIconContainer: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.surface, justifyContent: 'center', alignItems: 'center', marginBottom: 16, borderWidth: 2, borderColor: Colors.secondary },
    modalTitle: { fontFamily: 'Poppins_700Bold', color: Colors.text, fontSize: 22, textAlign: 'center', marginBottom: 5 },
    rarityBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8, marginBottom: 15 },
    rarityText: { fontFamily: 'Poppins_700Bold', color: Colors.background, fontSize: 10, letterSpacing: 1 },
    modalDesc: { fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, fontSize: 14, textAlign: 'center', marginBottom: 20, lineHeight: 20 },
    
    modalStats: { flexDirection: 'row', width: '100%', backgroundColor: Colors.surface, borderRadius: 12, padding: 15, marginBottom: 20 },
    modalStatItem: { flex: 1, alignItems: 'center' },
    modalStatLabel: { fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, fontSize: 12 },
    modalStatValue: { fontFamily: 'Poppins_600SemiBold', color: Colors.text, fontSize: 16, marginTop: 2 },
    modalStatDivider: { width: 1, backgroundColor: Colors.textSecondary + '40' },

    closeButton: { width: '100%', paddingVertical: 14, backgroundColor: Colors.text, borderRadius: 16, alignItems: 'center' },
    closeButtonText: { fontFamily: 'Poppins_600SemiBold', color: Colors.background, fontSize: 16 },
});

export default TrophyCaseScreen;