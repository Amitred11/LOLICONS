import React, { useState, useEffect } from 'react';
import { 
    View, Text, StyleSheet, FlatList, TouchableOpacity, Image, 
    Dimensions, StatusBar, ActivityIndicator, ImageBackground, LayoutAnimation,
    Animated
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

// --- CONTEXT IMPORTS ---
import { useAlert } from '@context/other/AlertContext';
import { useMedia } from '@context/hub/MediaContext';
import { useProfile } from '@context/main/ProfileContext';

const { width } = Dimensions.get('window');

// --- DYNAMIC GRID SIZING ---
const PADDING = 20;
const NUM_COLUMNS = 3;
const ITEM_GAP = 12;
const GRID_ITEM_WIDTH = (width - (PADDING * 2) - (ITEM_GAP * (NUM_COLUMNS - 1))) / NUM_COLUMNS;
const POSTER_RATIO = 1.5;

const THEME = {
    background: '#050505',
    surface: '#0F0F12',
    surfaceLight: '#1A1A1E',
    primary: '#E50914',
    accent: '#6366f1',
    text: '#FFFFFF',
    textSecondary: '#94a3b8',
    border: 'rgba(255,255,255,0.06)',
    glass: 'rgba(255,255,255,0.04)',
};

// --- COMPONENT: Grid Card ---
const GridCard = ({ item, onPress, onDelete }) => (
    <TouchableOpacity style={styles.gridItem} onPress={onPress} activeOpacity={0.9}>
        <ImageBackground source={item.poster} style={styles.poster} imageStyle={{ borderRadius: 12 }}>
            <LinearGradient colors={['transparent', 'rgba(0,0,0,0.85)']} style={styles.gridGradient} />
            
            <TouchableOpacity style={styles.deleteGlassBtn} onPress={onDelete}>
                <BlurView intensity={20} tint="dark" style={styles.blurCircle}>
                    <Ionicons name="close" size={14} color="#fff" />
                </BlurView>
            </TouchableOpacity>

            <View style={styles.gridInfo}>
                <Text style={styles.gridTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.gridYear}>{item.year}</Text>
            </View>
        </ImageBackground>
    </TouchableOpacity>
);

// --- COMPONENT: List Card ---
const ListCard = ({ item, onPress, onDelete }) => (
    <TouchableOpacity style={styles.listItem} onPress={onPress} activeOpacity={0.7}>
        <Image source={item.poster} style={styles.listPoster} />
        <View style={styles.listContent}>
            <Text style={styles.listTitle} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.listMeta}>{item.year}  •  {item.type}</Text>
            <View style={styles.ratingBadge}>
                <Ionicons name="star" color="#fbbf24" size={10} />
                <Text style={styles.ratingText}>{item.rating}</Text>
            </View>
        </View>
        <TouchableOpacity style={styles.listDelete} onPress={onDelete}>
            <Ionicons name="trash-outline" size={18} color={THEME.textSecondary} />
        </TouchableOpacity>
    </TouchableOpacity>
);

const MediaProfileScreen = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const { showAlert, showToast } = useAlert();

    const { myList, mediaData, toggleFavorite } = useMedia();
    const { profile, isLoading: isProfileLoading } = useProfile();

    const [activeTab, setActiveTab] = useState('mylist');
    const [viewMode, setViewMode] = useState('grid');
    const [downloads, setDownloads] = useState([]);

    useEffect(() => {
        if (mediaData.length > 0 && downloads.length === 0) {
            setDownloads(mediaData.slice(0, 2));
        }
    }, [mediaData]);

    const handleDeleteItem = (itemToDelete) => {
        const isMyList = activeTab === 'mylist';
        const listName = isMyList ? "My List" : "Downloads";

        showAlert({
            title: `Remove Title?`,
            message: `Remove "${itemToDelete.title}" from your ${listName}?`,
            type: 'default',
            btnText: 'Remove',
            secondaryBtnText: 'Cancel',
            onClose: async () => {
                if (isMyList) {
                    await toggleFavorite(itemToDelete.id);
                } else {
                    setDownloads(current => current.filter(item => item.id !== itemToDelete.id));
                }
                showToast(`"${itemToDelete.title}" removed.`, 'success');
            }
        });
    };
    
    const toggleViewMode = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
        setViewMode(prev => (prev === 'grid' ? 'list' : 'grid'));
    };

    const dataToShow = activeTab === 'mylist' ? myList : downloads;

    if (isProfileLoading || !profile) {
        return (
            <View style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color={THEME.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            
            {/* MODERN FLOATING HEADER */}
            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
                    <Ionicons name="chevron-back" size={22} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Profile</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Main', {screen: 'Profile',})} style={styles.headerBtn}>
                     <Ionicons name="settings-outline" size={20} color="#fff" />
                </TouchableOpacity>
            </View>

            <FlatList
                ListHeaderComponent={
                    <View style={styles.topSection}>
                        <View style={styles.avatarWrapper}>
                            <Image source={{ uri: profile.avatarUrl }} style={styles.avatar} />
                            <LinearGradient colors={['transparent', THEME.primary]} style={styles.avatarRing} />
                        </View>
                        
                        <Text style={styles.userName}>{profile.name}</Text>
                        <Text style={styles.userHandle}>@{profile.handle}</Text>
                        
                        {/* BENTO STATS */}
                        <View style={styles.bentoStats}>
                            <View style={styles.statBox}>
                                <Text style={styles.statVal}>{myList.length}</Text>
                                <Text style={styles.statLab}>Saved</Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statBox}>
                                <Text style={styles.statVal}>{downloads.length}</Text>
                                <Text style={styles.statLab}>Offline</Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statBox}>
                                <Text style={styles.statVal}>124h</Text>
                                <Text style={styles.statLab}>Watched</Text>
                            </View>
                        </View>

                        {/* PILL TABS */}
                        <View style={styles.pillTabContainer}>
                            <TouchableOpacity 
                                style={[styles.pillTab, activeTab === 'mylist' && styles.pillTabActive]} 
                                onPress={() => setActiveTab('mylist')}
                            >
                                <Text style={[styles.pillTabText, activeTab === 'mylist' && styles.pillTabTextActive]}>My List</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.pillTab, activeTab === 'downloads' && styles.pillTabActive]} 
                                onPress={() => setActiveTab('downloads')}
                            >
                                <Text style={[styles.pillTabText, activeTab === 'downloads' && styles.pillTabTextActive]}>Downloads</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.listControls}>
                             <Text style={styles.countText}>{dataToShow.length} Titles</Text>
                             <TouchableOpacity onPress={toggleViewMode} style={styles.toggleBtn}>
                                <Ionicons name={viewMode === 'grid' ? 'reorder-three-outline' : 'grid-outline'} size={24} color={THEME.textSecondary} />
                            </TouchableOpacity>
                        </View>
                    </View>
                }
                data={dataToShow}
                key={viewMode}
                numColumns={viewMode === 'grid' ? NUM_COLUMNS : 1}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listPadding}
                columnWrapperStyle={viewMode === 'grid' ? { gap: ITEM_GAP } : null}
                renderItem={({ item }) => {
                    const pressHandler = () => navigation.push('MediaDetail', { mediaId: item.id });
                    const deleteHandler = () => handleDeleteItem(item);
                    return viewMode === 'grid' ? (
                        <GridCard item={item} onPress={pressHandler} onDelete={deleteHandler} />
                    ) : (
                        <ListCard item={item} onPress={pressHandler} onDelete={deleteHandler} />
                    );
                }}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <View style={styles.emptyIconCircle}>
                            <Ionicons 
                                name={activeTab === 'mylist' ? "bookmark-outline" : "cloud-offline-outline"} 
                                size={32} 
                                color={THEME.surfaceLight} 
                            />
                        </View>
                        <Text style={styles.emptyTitle}>Nothing here yet</Text>
                        <Text style={styles.emptySub}>Explore and add your favorite content to this list.</Text>
                    </View>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: THEME.background },
    center: { justifyContent: 'center', alignItems: 'center' },
    
    // HEADER
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: PADDING, paddingBottom: 15, backgroundColor: THEME.background },
    headerBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: THEME.glass, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: THEME.border },
    headerTitle: { fontSize: 17, fontWeight: '800', color: '#fff', letterSpacing: -0.5 },

    // PROFILE SECTION
    topSection: { alignItems: 'center', paddingTop: 20 },
    avatarWrapper: { width: 100, height: 100, marginBottom: 16, justifyContent: 'center', alignItems: 'center' },
    avatar: { width: 90, height: 90, borderRadius: 45 },
    avatarRing: { ...StyleSheet.absoluteFillObject, borderRadius: 50, borderWidth: 2, borderColor: 'transparent', opacity: 0.6 },
    userName: { fontSize: 24, fontWeight: '900', color: '#fff', letterSpacing: -0.5 },
    userHandle: { fontSize: 14, color: THEME.textSecondary, marginBottom: 25 },

    // BENTO STATS
    bentoStats: { flexDirection: 'row', backgroundColor: THEME.surface, paddingVertical: 18, borderRadius: 24, marginHorizontal: PADDING, borderWidth: 1, borderColor: THEME.border, marginBottom: 30 },
    statBox: { flex: 1, alignItems: 'center' },
    statVal: { fontSize: 18, fontWeight: '900', color: '#fff' },
    statLab: { fontSize: 11, color: THEME.textSecondary, marginTop: 4, fontWeight: '700', textTransform: 'uppercase' },
    statDivider: { width: 1, height: 25, backgroundColor: THEME.border },

    // TABS
    pillTabContainer: { flexDirection: 'row', backgroundColor: THEME.surface, padding: 4, borderRadius: 16, marginHorizontal: PADDING, marginBottom: 20 },
    pillTab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 12 },
    pillTabActive: { backgroundColor: THEME.surfaceLight, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
    pillTabText: { fontSize: 14, color: THEME.textSecondary, fontWeight: '700' },
    pillTabTextActive: { color: '#fff' },

    // CONTROLS
    listControls: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', paddingHorizontal: PADDING, marginBottom: 15 },
    countText: { color: THEME.textSecondary, fontSize: 13, fontWeight: '600' },
    toggleBtn: { padding: 4 },

    // LIST VIEW
    listPadding: { paddingHorizontal: PADDING, paddingBottom: 60 },
    gridItem: { width: GRID_ITEM_WIDTH, marginBottom: ITEM_GAP },
    poster: { width: '100%', height: GRID_ITEM_WIDTH * POSTER_RATIO, justifyContent: 'flex-end', overflow: 'hidden' },
    gridGradient: { ...StyleSheet.absoluteFillObject },
    gridInfo: { padding: 10 },
    gridTitle: { color: '#fff', fontSize: 11, fontWeight: '800' },
    gridYear: { color: THEME.textSecondary, fontSize: 9, marginTop: 2 },
    deleteGlassBtn: { position: 'absolute', top: 8, right: 8, zIndex: 10 },
    blurCircle: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },

    // LIST ITEM
    listItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: THEME.surface, padding: 10, borderRadius: 18, marginBottom: 12, borderWidth: 1, borderColor: THEME.border },
    listPoster: { width: 65, height: 90, borderRadius: 12, backgroundColor: THEME.surfaceLight },
    listContent: { flex: 1, marginLeft: 16 },
    listTitle: { color: '#fff', fontSize: 16, fontWeight: '800', marginBottom: 4 },
    listMeta: { color: THEME.textSecondary, fontSize: 12, marginBottom: 8 },
    ratingBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(251, 191, 36, 0.1)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, alignSelf: 'flex-start', gap: 4 },
    ratingText: { color: '#fbbf24', fontSize: 11, fontWeight: '900' },
    listDelete: { padding: 10 },

    // EMPTY STATE
    emptyContainer: { alignItems: 'center', marginTop: 60, paddingHorizontal: 40 },
    emptyIconCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: THEME.surface, alignItems: 'center', justifyContent: 'center', marginBottom: 20, borderWidth: 1, borderColor: THEME.border },
    emptyTitle: { color: '#fff', fontSize: 18, fontWeight: '800', marginBottom: 8 },
    emptySub: { color: THEME.textSecondary, fontSize: 14, textAlign: 'center', lineHeight: 20 },
});

export default MediaProfileScreen;