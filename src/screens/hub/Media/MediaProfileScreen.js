import React, { useState, useEffect } from 'react';
import { 
    View, Text, StyleSheet, FlatList, TouchableOpacity, Image, 
    Dimensions, StatusBar, ActivityIndicator, ImageBackground, LayoutAnimation
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

// --- CONTEXT IMPORTS ---
import { useAlert } from '@context/other/AlertContext';
import { useMedia } from '@context/hub/MediaContext';
import { useProfile } from '@context/main/ProfileContext';

const { width } = Dimensions.get('window');

// --- DYNAMIC GRID SIZING ---
const PADDING = 16;
const NUM_COLUMNS = 3;
const ITEM_GAP = 12;
const GRID_ITEM_WIDTH = (width - (PADDING * 2) - (ITEM_GAP * (NUM_COLUMNS - 1))) / NUM_COLUMNS;
const POSTER_RATIO = 1.5;

const Theme = {
    background: '#09090b',
    surface: '#18181b',
    surfaceLight: '#27272a',
    primary: '#E50914',
    text: '#FFFFFF',
    textSecondary: '#A1A1AA',
};

// --- COMPONENT: Grid Card with Delete Button ---
const GridCard = ({ item, onPress, onDelete }) => (
    <TouchableOpacity style={styles.gridItem} onPress={onPress} activeOpacity={0.8}>
        <ImageBackground
            source={item.poster}
            style={styles.poster}
            imageStyle={{ borderRadius: 8 }}
        >
            <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.8)']}
                style={styles.gridGradient}
            />
            <TouchableOpacity style={styles.deleteButtonGrid} onPress={onDelete}>
                <Ionicons name="trash-outline" size={16} color={Theme.text} />
            </TouchableOpacity>
            <View style={styles.gridTextContainer}>
                <Text style={styles.gridTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.gridYear}>{item.year}</Text>
            </View>
        </ImageBackground>
    </TouchableOpacity>
);

// --- COMPONENT: List Card with Delete Button ---
const ListCard = ({ item, onPress, onDelete }) => (
    <TouchableOpacity style={styles.listItem} onPress={onPress} activeOpacity={0.7}>
        <Image source={item.poster} style={styles.listPoster} />
        <View style={styles.listContent}>
            <Text style={styles.listTitle} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.listMeta}>{item.year} • {item.type}</Text>
            <View style={styles.listRating}>
                <Ionicons name="star" color="#FFD700" size={12} />
                <Text style={styles.listRatingText}>{item.rating}</Text>
            </View>
        </View>
        <TouchableOpacity style={styles.deleteButtonList} onPress={onDelete}>
            <Ionicons name="trash-outline" size={20} color={Theme.textSecondary} />
        </TouchableOpacity>
    </TouchableOpacity>
);


const MediaProfileScreen = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const { showAlert, showToast } = useAlert();

    // --- CONTEXTS ---
    const { myList, mediaData, toggleFavorite } = useMedia(); // Added toggleFavorite for removing from list
    const { profile, isLoading: isProfileLoading } = useProfile();

    // --- STATE ---
    const [activeTab, setActiveTab] = useState('mylist');
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
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
            title: `Remove from ${listName}?`,
            message: `This will remove "${itemToDelete.title}" from your ${listName}.`,
            type: 'default',
            btnText: 'Remove',
            secondaryBtnText: 'Cancel',
            onClose: async () => {
                if (isMyList) {
                    // Use the context function to remove item from the global "My List" state
                    await toggleFavorite(itemToDelete.id);
                } else {
                    // Update the local downloads state
                    setDownloads(current => current.filter(item => item.id !== itemToDelete.id));
                }
                showToast( `"${itemToDelete.title}" was removed.`,  'success');
            }
        });
    };
    
    const toggleViewMode = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setViewMode(prev => (prev === 'grid' ? 'list' : 'grid'));
    };

    const dataToShow = activeTab === 'mylist' ? myList : downloads;

    // --- LOADING STATE ---
    if (isProfileLoading || !profile) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <StatusBar barStyle="light-content" backgroundColor={Theme.background} />
                <ActivityIndicator size="large" color={Theme.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={Theme.background} />
            
            <View style={[styles.header, { marginTop: insets.top + 10 }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>@{profile.handle}</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={styles.iconBtn}>
                     <Ionicons name="person-outline" size={22} color="#fff" />
                </TouchableOpacity>
            </View>

            <FlatList
                ListHeaderComponent={
                    <>
                        <View style={styles.profileSection}>
                            <Image source={{ uri: profile.avatarUrl }} style={styles.avatar} />
                            <Text style={styles.userName}>{profile.name}</Text>
                            <Text style={styles.userHandle}>@{profile.handle}</Text>
                            
                            <View style={styles.statsRow}>
                                <View style={styles.statItem}>
                                    <Text style={styles.statValue}>{myList.length}</Text>
                                    <Text style={styles.statLabel}>My List</Text>
                                </View>
                                <View style={styles.divider} />
                                <View style={styles.statItem}>
                                    <Text style={styles.statValue}>{downloads.length}</Text>
                                    <Text style={styles.statLabel}>Downloaded</Text>
                                </View>
                                <View style={styles.divider} />
                                <View style={styles.statItem}>
                                    <Text style={styles.statValue}>124h</Text>
                                    <Text style={styles.statLabel}>Watched</Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.tabContainer}>
                            <TouchableOpacity style={[styles.tab, activeTab === 'mylist' && styles.activeTab]} onPress={() => setActiveTab('mylist')}>
                                <Ionicons name="bookmark-outline" size={18} color={activeTab === 'mylist' ? '#fff' : Theme.textSecondary} />
                                <Text style={[styles.tabText, activeTab === 'mylist' && styles.activeTabText]}>My List</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.tab, activeTab === 'downloads' && styles.activeTab]} onPress={() => setActiveTab('downloads')}>
                                <Ionicons name="download-outline" size={18} color={activeTab === 'downloads' ? '#fff' : Theme.textSecondary} />
                                <Text style={[styles.tabText, activeTab === 'downloads' && styles.activeTabText]}>Downloads</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.controlsHeader}>
                             <Text style={styles.itemCount}>{dataToShow.length} Titles</Text>
                             <TouchableOpacity onPress={toggleViewMode} style={styles.viewToggleBtn}>
                                <Ionicons name={viewMode === 'grid' ? 'list' : 'grid'} size={20} color={Theme.textSecondary} />
                            </TouchableOpacity>
                        </View>
                    </>
                }
                data={dataToShow}
                key={viewMode}
                numColumns={viewMode === 'grid' ? NUM_COLUMNS : 1}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.contentArea}
                columnWrapperStyle={viewMode === 'grid' ? { gap: ITEM_GAP } : null}
                ItemSeparatorComponent={viewMode === 'grid' ? () => <View style={{ height: ITEM_GAP }} /> : null}
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
                    <View style={styles.emptyState}>
                        <MaterialCommunityIcons 
                            name={activeTab === 'mylist' ? "playlist-plus" : "download-off-outline"} 
                            size={50} 
                            color={Theme.surfaceLight} 
                        />
                        <Text style={styles.emptyText}>
                            {activeTab === 'mylist' ? "Your list is empty" : "No downloads yet"}
                        </Text>
                        <Text style={styles.emptySubText}>
                            {activeTab === 'mylist' ? "Save movies and shows to see them here." : "Content you download will appear here."}
                        </Text>
                    </View>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Theme.background },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: PADDING, paddingBottom: 10 },
    iconBtn: { padding: 4, width: 28, alignItems: 'center' },
    headerTitle: { flex: 1, fontSize: 16, fontWeight: '600', color: '#fff', textAlign: 'center' },
    profileSection: { alignItems: 'center', marginTop: 20, marginBottom: 30, paddingHorizontal: PADDING },
    avatar: { width: 90, height: 90, borderRadius: 45, borderWidth: 2, borderColor: Theme.primary, marginBottom: 16 },
    userName: { fontSize: 22, fontWeight: '700', color: '#fff' },
    userHandle: { fontSize: 14, color: Theme.textSecondary, marginBottom: 24 },
    statsRow: { flexDirection: 'row', backgroundColor: Theme.surface, paddingVertical: 16, borderRadius: 16, alignItems: 'center', width: '100%', justifyContent: 'center' },
    statItem: { alignItems: 'center', width: 90 },
    statValue: { fontSize: 18, fontWeight: '700', color: '#fff' },
    statLabel: { fontSize: 12, color: Theme.textSecondary, marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
    divider: { width: 1, height: 30, backgroundColor: Theme.surfaceLight },
    tabContainer: { flexDirection: 'row', paddingHorizontal: PADDING, borderBottomWidth: 1, borderBottomColor: Theme.surface },
    tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: 'transparent', gap: 8, marginBottom: -1 },
    activeTab: { borderBottomColor: Theme.primary },
    tabText: { fontSize: 15, color: Theme.textSecondary, fontWeight: '600' },
    activeTabText: { color: Theme.text },
    controlsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: PADDING, paddingVertical: 16 },
    itemCount: { color: Theme.textSecondary, fontSize: 13 },
    viewToggleBtn: { padding: 4 },
    contentArea: { paddingHorizontal: PADDING, paddingBottom: 40 },
    gridItem: { width: GRID_ITEM_WIDTH },
    poster: { width: '100%', height: GRID_ITEM_WIDTH * POSTER_RATIO, justifyContent: 'flex-end', backgroundColor: Theme.surfaceLight },
    gridGradient: { ...StyleSheet.absoluteFillObject, borderRadius: 8 },
    gridTextContainer: { padding: 8 },
    gridTitle: { color: Theme.text, fontSize: 12, fontWeight: '600' },
    gridYear: { color: Theme.textSecondary, fontSize: 10 },
    listItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: Theme.surface, padding: 8, borderRadius: 8, marginBottom: 12 },
    listPoster: { width: 60, height: 60 * POSTER_RATIO, borderRadius: 6, backgroundColor: Theme.surfaceLight },
    listContent: { flex: 1, marginLeft: 12, gap: 4 },
    listTitle: { color: Theme.text, fontSize: 15, fontWeight: '600' },
    listMeta: { color: Theme.textSecondary, fontSize: 12 },
    listRating: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    listRatingText: { color: '#FFD700', fontSize: 12, fontWeight: 'bold' },
    emptyState: { alignItems: 'center', marginTop: 50, opacity: 0.8 },
    emptyText: { color: Theme.text, marginTop: 16, fontSize: 16, fontWeight: '600' },
    emptySubText: { color: Theme.textSecondary, marginTop: 4, fontSize: 13, textAlign: 'center' },
    
    // --- DELETE BUTTON STYLES ---
    deleteButtonGrid: {
        position: 'absolute',
        top: 6,
        right: 6,
        backgroundColor: 'rgba(229, 9, 20, 0.8)', // Semi-transparent red
        borderRadius: 12,
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    deleteButtonList: {
        padding: 8,
        marginLeft: 8,
    },
});

export default MediaProfileScreen;