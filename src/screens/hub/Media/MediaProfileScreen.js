import React, { useState, useEffect } from 'react';
import { 
    View, Text, StyleSheet, FlatList, TouchableOpacity, Image, 
    Dimensions, StatusBar, ScrollView 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

// API & Context
import { MediaService } from '@api/hub/MockMediaService';
import { useAlert } from '@context/AlertContext';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - 48) / 3; // 3 columns

const Theme = {
    background: '#09090b',
    surface: '#18181b',
    primary: '#E50914',
    text: '#FFFFFF',
    textSecondary: '#A1A1AA',
};

const MediaProfileScreen = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const { showAlert } = useAlert();

    const [activeTab, setActiveTab] = useState('mylist'); // 'mylist' | 'downloads'
    const [myList, setMyList] = useState([]);
    const [downloads, setDownloads] = useState([]);

    useEffect(() => {
        loadProfileData();
    }, []);

    const loadProfileData = async () => {
        // 1. Get "My List" from API (items marked isFavorite)
        const response = await MediaService.getAllMedia();
        if (response.success) {
            const favorites = response.data.filter(item => item.isFavorite);
            setMyList(favorites);
            
            // 2. Simulate Downloads (just picking a few random ones for demo)
            setDownloads(response.data.slice(0, 2)); 
        }
    };

    const handleClearDownloads = () => {
        if (downloads.length === 0) return;
        
        showAlert({
            title: 'Delete All Downloads?',
            message: 'This will remove all offline content from this device.',
            type: 'error',
            btnText: 'Delete',
            secondaryBtnText: 'Cancel',
            onClose: () => {
                setDownloads([]);
                showAlert({ title: 'Deleted', message: 'Downloads cleared.', type: 'success' });
            }
        });
    };

    const renderMediaItem = ({ item }) => (
        <TouchableOpacity 
            style={styles.gridItem} 
            onPress={() => navigation.push('MediaDetail', { mediaId: item.id })}
        >
            <Image source={item.poster} style={styles.poster} />
            {activeTab === 'downloads' && (
                <View style={styles.downloadBadge}>
                    <Ionicons name="checkmark-circle" size={16} color={Theme.primary} />
                </View>
            )}
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={Theme.background} />
            
            {/* Header */}
            <View style={[styles.header, { marginTop: insets.top }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Profile</Text>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
                {/* Profile Section */}
                <View style={styles.profileSection}>
                    <Image source={{ uri: 'https://i.pravatar.cc/100?img=8' }} style={styles.avatar} />
                    <Text style={styles.userName}>Alex Streamer</Text>
                    <Text style={styles.userHandle}>@alex_movies</Text>
                    
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

                {/* Tabs */}
                <View style={styles.tabContainer}>
                    <TouchableOpacity 
                        style={[styles.tab, activeTab === 'mylist' && styles.activeTab]} 
                        onPress={() => setActiveTab('mylist')}
                    >
                        <Ionicons name="add" size={20} color={activeTab === 'mylist' ? '#fff' : '#aaa'} />
                        <Text style={[styles.tabText, activeTab === 'mylist' && styles.activeTabText]}>My List</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[styles.tab, activeTab === 'downloads' && styles.activeTab]} 
                        onPress={() => setActiveTab('downloads')}
                    >
                        <Ionicons name="download-outline" size={20} color={activeTab === 'downloads' ? '#fff' : '#aaa'} />
                        <Text style={[styles.tabText, activeTab === 'downloads' && styles.activeTabText]}>Downloads</Text>
                    </TouchableOpacity>
                </View>

                {/* Content Grid */}
                <View style={styles.contentArea}>
                    {activeTab === 'downloads' && downloads.length > 0 && (
                        <TouchableOpacity style={styles.clearBtn} onPress={handleClearDownloads}>
                            <Text style={styles.clearBtnText}>Clear Downloads</Text>
                        </TouchableOpacity>
                    )}

                    {(activeTab === 'mylist' ? myList : downloads).length === 0 ? (
                        <View style={styles.emptyState}>
                            <MaterialCommunityIcons 
                                name={activeTab === 'mylist' ? "playlist-plus" : "download-off"} 
                                size={60} 
                                color="#333" 
                            />
                            <Text style={styles.emptyText}>
                                {activeTab === 'mylist' ? "Your list is empty." : "No downloads yet."}
                            </Text>
                        </View>
                    ) : (
                        <FlatList
                            data={activeTab === 'mylist' ? myList : downloads}
                            renderItem={renderMediaItem}
                            keyExtractor={item => item.id}
                            numColumns={3}
                            scrollEnabled={false} // Handled by parent ScrollView
                            columnWrapperStyle={{ gap: 12 }}
                            contentContainerStyle={{ gap: 12 }}
                        />
                    )}
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Theme.background },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 10 },
    headerTitle: { fontSize: 18, fontWeight: '600', color: '#fff', padding: 8, right: 120 },
    
    profileSection: { alignItems: 'center', marginTop: 20, marginBottom: 30 },
    avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 2, borderColor: Theme.primary, marginBottom: 16 },
    userName: { fontSize: 24, fontWeight: '700', color: '#fff' },
    userHandle: { fontSize: 14, color: Theme.textSecondary, marginBottom: 24 },
    
    statsRow: { flexDirection: 'row', backgroundColor: Theme.surface, paddingVertical: 16, paddingHorizontal: 30, borderRadius: 16, alignItems: 'center' },
    statItem: { alignItems: 'center', width: 70 },
    statValue: { fontSize: 18, fontWeight: '700', color: '#fff' },
    statLabel: { fontSize: 12, color: Theme.textSecondary, marginTop: 4 },
    divider: { width: 1, height: 30, backgroundColor: '#333', marginHorizontal: 10 },

    tabContainer: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 20 },
    tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: 'transparent', gap: 8 },
    activeTab: { borderBottomColor: Theme.primary },
    tabText: { fontSize: 15, color: '#aaa', fontWeight: '600' },
    activeTabText: { color: '#fff' },

    contentArea: { paddingHorizontal: 20 },
    gridItem: { width: ITEM_WIDTH, marginBottom: 12 },
    poster: { width: '100%', height: ITEM_WIDTH * 1.5, borderRadius: 8, backgroundColor: '#333' },
    downloadBadge: { position: 'absolute', top: 6, right: 6, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 10 },
    
    clearBtn: { alignSelf: 'flex-end', paddingVertical: 8, marginBottom: 10 },
    clearBtnText: { color: Theme.primary, fontSize: 13, fontWeight: '600' },

    emptyState: { alignItems: 'center', marginTop: 50, opacity: 0.5 },
    emptyText: { color: '#fff', marginTop: 10, fontSize: 16 },
});

export default MediaProfileScreen;