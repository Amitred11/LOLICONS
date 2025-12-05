// screens/profile/ViewAllHFScreen.js

import React, { useState, useCallback } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    FlatList, 
    TouchableOpacity, 
    ImageBackground, 
    Image, 
    Dimensions,
    StatusBar 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, { FadeInDown, Layout, FadeOut } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

// --- Imports ---
import { Colors } from '@config/Colors'; 
import { ComicService } from '@api/MockComicService'; 

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 3;
const GAP = 10;
const ITEM_WIDTH = (width - (40 + (GAP * (COLUMN_COUNT - 1)))) / COLUMN_COUNT;

// --- Grid Item (Favorites) ---
const GridItem = ({ item, index, onPress, onRemove }) => (
    <Animated.View 
        entering={FadeInDown.delay(index * 50).springify()} 
        exiting={FadeOut}
        layout={Layout.springify()} 
    >
        <TouchableOpacity 
            style={styles.gridItem} 
            onPress={onPress} 
            activeOpacity={0.8}
        >
            <ImageBackground 
                source={item.image} 
                style={styles.gridImage} 
                imageStyle={{ borderRadius: 12 }}
            >
                {/* Unlike/Remove Button */}
                <TouchableOpacity style={styles.favoriteBtn} onPress={onRemove}>
                    <BlurView intensity={30} tint="dark" style={styles.favoriteBtnBlur}>
                        <Ionicons name="heart" size={16} color={Colors.primary} />
                    </BlurView>
                </TouchableOpacity>

                <LinearGradient 
                    colors={['transparent', 'rgba(0,0,0,0.9)']} 
                    style={styles.gridOverlay}
                >
                    <Text style={styles.gridTitle} numberOfLines={2}>
                        {item.title}
                    </Text>
                    <View style={styles.ratingBadge}>
                        <Ionicons name="star" size={10} color="#FFD700" />
                        <Text style={styles.ratingText}>{item.rating || 'N/A'}</Text>
                    </View>
                </LinearGradient>
            </ImageBackground>
        </TouchableOpacity>
    </Animated.View>
);

// --- List Item (History) ---
const ListItem = ({ item, index, onPress, onRemove }) => (
    <Animated.View 
        entering={FadeInDown.delay(index * 50).springify()}
        exiting={FadeOut}
        layout={Layout.springify()}
    >
        <TouchableOpacity style={styles.listItem} onPress={onPress}>
            <Image source={item.image} style={styles.listImage} />
            <View style={styles.listContent}>
                <View style={styles.listHeader}>
                    <Text style={styles.listTitle} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.listTime}>Recently</Text> 
                </View>
                
                <Text style={styles.listSubtitle}>
                    {item.lastChapterRead ? `Continued from ${item.lastChapterRead}` : 'Start reading'}
                </Text>

                {/* Progress Bar */}
                <View style={styles.progressContainer}>
                    <View style={styles.progressBarBg}>
                        <View style={[styles.progressBarFill, { width: `${(item.progress || 0) * 100}%` }]} />
                    </View>
                    <Text style={styles.progressText}>{Math.round((item.progress || 0) * 100)}%</Text>
                </View>
            </View>

            {/* Remove Button */}
            <TouchableOpacity style={styles.removeHistoryBtn} onPress={onRemove}>
                <Ionicons name="trash-outline" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
        </TouchableOpacity>
    </Animated.View>
);

const ViewAllHFScreen = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const route = useRoute();

    // Params: type ('favorites' | 'history'), data (Array), title (String)
    const { type = 'favorites', data = [], title = 'Collection' } = route.params || {};
    
    // Local state to handle UI updates immediately
    const [listData, setListData] = useState(data);

    const isGrid = type === 'favorites';

    // Handler to remove item
    const handleRemoveItem = useCallback(async (itemId) => {
        // 1. Haptic Feedback
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        // 2. Update Local UI immediately (Optimistic Update)
        setListData(currentData => currentData.filter(item => item.id !== itemId));

        // 3. Update Backend/Service
        try {
            if (type === 'favorites') {
                await ComicService.removeFromFavorites(itemId);
            } else {
                await ComicService.removeFromHistory(itemId);
            }
        } catch (error) {
            console.error("Failed to remove item", error);
            // Optional: Revert state if API fails
        }
    }, [type]);

    const renderItem = ({ item, index }) => {
        if (isGrid) {
            return (
                <GridItem 
                    item={item} 
                    index={index} 
                    onPress={() => navigation.navigate('ComicDetail', { comicId: item.id })}
                    onRemove={() => handleRemoveItem(item.id)}
                />
            );
        }
        return (
            <ListItem 
                item={item} 
                index={index} 
                onPress={() => navigation.navigate('ComicDetail', { comicId: item.id })}
                onRemove={() => handleRemoveItem(item.id)}
            />
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <TouchableOpacity 
                    onPress={() => navigation.goBack()} 
                    style={styles.backButton}
                >
                    <BlurView intensity={20} tint="dark" style={styles.blurButton}>
                        <Ionicons name="arrow-back" size={24} color={Colors.text} />
                    </BlurView>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{title}</Text>
                <View style={{ width: 40 }} /> 
            </View>

            {/* Content */}
            <FlatList
                key={isGrid ? 'grid' : 'list'}
                data={listData}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={[
                    styles.listContainer, 
                    { paddingBottom: insets.bottom + 20 }
                ]}
                numColumns={isGrid ? COLUMN_COUNT : 1}
                columnWrapperStyle={isGrid ? { gap: GAP } : null}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name={isGrid ? "heart-dislike-outline" : "library-outline"} size={64} color={Colors.textSecondary} />
                        <Text style={styles.emptyText}>
                            {isGrid ? "No favorites yet" : "No reading history"}
                        </Text>
                    </View>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 20,
        zIndex: 10,
    },
    backButton: {
        borderRadius: 20,
        overflow: 'hidden',
    },
    blurButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    headerTitle: {
        fontSize: 20,
        fontFamily: 'Poppins_600SemiBold',
        color: Colors.text,
    },
    listContainer: {
        paddingHorizontal: 20,
        gap: 15, 
    },
    gridItem: {
        width: ITEM_WIDTH,
        height: ITEM_WIDTH * 1.5,
        borderRadius: 12,
        marginBottom: 10,
    },
    gridImage: {
        width: '100%',
        height: '100%',
        backgroundColor: Colors.surface,
        justifyContent: 'space-between', 
    },
    gridOverlay: {
        height: '60%',
        justifyContent: 'flex-end',
        padding: 8,
        borderRadius: 12,
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    favoriteBtn: {
        alignSelf: 'flex-end',
        margin: 6,
        borderRadius: 12,
        overflow: 'hidden',
        zIndex: 10,
    },
    favoriteBtnBlur: {
        width: 28,
        height: 28,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    gridTitle: {
        fontFamily: 'Poppins_600SemiBold',
        color: Colors.text,
        fontSize: 12,
        marginBottom: 4,
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    ratingText: {
        color: '#FFD700',
        fontSize: 10,
        fontFamily: 'Poppins_700Bold',
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface + '40',
        padding: 10,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    listImage: {
        width: 60,
        height: 85,
        borderRadius: 10,
        backgroundColor: Colors.surface,
    },
    listContent: {
        flex: 1,
        paddingHorizontal: 15,
        justifyContent: 'center',
    },
    listHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    listTitle: {
        fontFamily: 'Poppins_600SemiBold',
        color: Colors.text,
        fontSize: 16,
        flex: 1,
        marginRight: 10,
    },
    listTime: {
        fontFamily: 'Poppins_400Regular',
        color: Colors.textSecondary,
        fontSize: 12,
    },
    listSubtitle: {
        fontFamily: 'Poppins_400Regular',
        color: Colors.secondary,
        fontSize: 13,
        marginBottom: 8,
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    progressBarBg: {
        flex: 1,
        height: 4,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 2,
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: Colors.primary,
        borderRadius: 2,
    },
    progressText: {
        fontFamily: 'Poppins_500Medium',
        color: Colors.textSecondary,
        fontSize: 12,
    },
    removeHistoryBtn: {
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 100,
        opacity: 0.5,
    },
    emptyText: {
        marginTop: 10,
        color: Colors.textSecondary,
        fontFamily: 'Poppins_500Medium',
    }
});

export default ViewAllHFScreen;