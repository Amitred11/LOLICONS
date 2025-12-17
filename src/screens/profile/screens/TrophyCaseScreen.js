import { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions, StatusBar, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Animated from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { Colors } from '@config/Colors';
import EmptyState from '../components/empty/EmptyState';
import { useProfile } from '@context/main/ProfileContext'; 
// IMPORT COMPONENT
import { FilterChip, TrophyItem, TrophyDetailModal } from '../components/ui/TrophyComponents';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 3;

const TrophyCaseScreen = () => {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const { profile, isLoading } = useProfile();
    const trophies = profile?.badges || [];
    const [filter, setFilter] = useState('All');
    const [selectedTrophy, setSelectedTrophy] = useState(null);

    const handlePressTrophy = (item) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setSelectedTrophy(item);
    };

    const displayedTrophies = useMemo(() => {
        if (filter === 'Unlocked') return trophies.filter(t => t.unlocked);
        if (filter === 'Locked') return trophies.filter(t => !t.unlocked);
        return trophies;
    }, [filter, trophies]);

    const unlockedCount = trophies.filter(t => t.unlocked).length;
    const progress = trophies.length > 0 ? unlockedCount / trophies.length : 0;

    if (isLoading && !profile) return <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}><ActivityIndicator size="large" color={Colors.secondary} /></View>;

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <View style={[styles.header, { paddingTop: insets.top }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Trophy Case</Text>
                <View style={{ width: 40 }} /> 
            </View>

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

            <View style={styles.filterContainer}>
                {['All', 'Unlocked', 'Locked'].map(f => (
                    <FilterChip key={f} label={f} active={filter === f} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setFilter(f); }} />
                ))}
            </View>

            <FlatList
                data={displayedTrophies}
                keyExtractor={item => item.id}
                numColumns={COLUMN_COUNT}
                contentContainerStyle={styles.gridContent}
                showsVerticalScrollIndicator={false}
                renderItem={({ item, index }) => (<TrophyItem item={item} index={index} onPress={() => handlePressTrophy(item)} />)}
                ListEmptyComponent={<View style={styles.emptyStateContainer}><EmptyState icon="trophy-outline" title="Trophy Case Empty" message="We couldn't find any achievements to display right now." /></View>}
            />
            <TrophyDetailModal visible={!!selectedTrophy} item={selectedTrophy} onClose={() => setSelectedTrophy(null)} />
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
    gridContent: { paddingHorizontal: 10, paddingBottom: 50, flexGrow: 1 },
    emptyStateContainer: { marginTop: 40, alignItems: 'center', justifyContent: 'center' },
});

export default TrophyCaseScreen;