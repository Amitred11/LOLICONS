import React from 'react';
import { View, Text, TouchableOpacity, ImageBackground, Image, Dimensions, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, { FadeInDown, Layout, FadeOut } from 'react-native-reanimated';
import { Colors } from '@config/Colors'; 

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 3;
const GAP = 10;
const ITEM_WIDTH = (width - (40 + (GAP * (COLUMN_COUNT - 1)))) / COLUMN_COUNT;

export const TypeBadge = ({ type }) => {
    if (!type) return null;
    return (
        <View style={styles.typeBadge}>
            <Text style={styles.typeText}>{type}</Text>
        </View>
    );
};

export const GridItem = React.memo(({ item, index, onPress, onRemove }) => {
    const title = item.title || item.name || 'Untitled';
    const imageUri = item.image?.uri || item.image || item.poster?.uri || item.poster;
    const type = item.type || 'Comic'; 

    return (
        <Animated.View entering={FadeInDown.delay(index * 30).springify()} exiting={FadeOut} layout={Layout.springify()}>
            <TouchableOpacity style={styles.gridItem} onPress={onPress} activeOpacity={0.8}>
                <ImageBackground source={typeof imageUri === 'string' ? { uri: imageUri } : imageUri} style={styles.gridImage} imageStyle={{ borderRadius: 12 }}>
                    <View style={styles.gridTopRow}>
                        <TypeBadge type={type} />
                        <TouchableOpacity style={styles.favoriteBtn} onPress={onRemove}>
                            <BlurView intensity={30} tint="dark" style={styles.favoriteBtnBlur}>
                                <Ionicons name="heart" size={14} color={Colors.primary} />
                            </BlurView>
                        </TouchableOpacity>
                    </View>
                    <LinearGradient colors={['transparent', 'rgba(0,0,0,0.95)']} style={styles.gridOverlay}>
                        <Text style={styles.gridTitle} numberOfLines={2}>{title}</Text>
                        <View style={styles.ratingBadge}>
                            <Ionicons name="star" size={10} color="#FFD700" />
                            <Text style={styles.ratingText}>{item.rating || item.match || 'N/A'}</Text>
                        </View>
                    </LinearGradient>
                </ImageBackground>
            </TouchableOpacity>
        </Animated.View>
    );
});

export const ListItem = React.memo(({ item, index, onPress, onRemove }) => {
    const title = item.title || item.name || 'Untitled';
    const imageUri = item.image?.uri || item.image || item.poster?.uri || item.poster;
    const subtitle = item.lastChapterRead 
        ? `Continued from ${item.lastChapterRead}` 
        : item.type ? `${item.type} • ${item.year || ''}` : 'Start reading';

    return (
        <Animated.View entering={FadeInDown.delay(index * 30).springify()} exiting={FadeOut} layout={Layout.springify()}>
            <TouchableOpacity style={styles.listItem} onPress={onPress}>
                <Image source={typeof imageUri === 'string' ? { uri: imageUri } : imageUri} style={styles.listImage} />
                <View style={styles.listContent}>
                    <View style={styles.listHeader}>
                        <Text style={styles.listTitle} numberOfLines={1}>{title}</Text>
                        <Text style={styles.listTime}>Recently</Text> 
                    </View>
                    <Text style={styles.listSubtitle} numberOfLines={1}>{subtitle}</Text>
                    {(item.progress !== undefined) && (
                        <View style={styles.progressContainer}>
                            <View style={styles.progressBarBg}><View style={[styles.progressBarFill, { width: `${(item.progress || 0) * 100}%` }]} /></View>
                            <Text style={styles.progressText}>{Math.round((item.progress || 0) * 100)}%</Text>
                        </View>
                    )}
                </View>
                <TouchableOpacity style={styles.removeHistoryBtn} onPress={onRemove}>
                    <Ionicons name="trash-outline" size={20} color={Colors.textSecondary} />
                </TouchableOpacity>
            </TouchableOpacity>
        </Animated.View>
    );
});

const styles = StyleSheet.create({
    gridItem: { width: ITEM_WIDTH, height: ITEM_WIDTH * 1.5, borderRadius: 12, marginBottom: 10 },
    gridImage: { width: '100%', height: '100%', backgroundColor: Colors.surface, justifyContent: 'space-between' },
    gridTopRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 6 },
    gridOverlay: { height: '50%', justifyContent: 'flex-end', padding: 8, borderRadius: 12, position: 'absolute', bottom: 0, left: 0, right: 0 },
    favoriteBtn: { borderRadius: 12, overflow: 'hidden', zIndex: 10 },
    favoriteBtnBlur: { width: 24, height: 24, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 12 },
    typeBadge: { backgroundColor: Colors.primary + 'CC', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, alignSelf: 'flex-start' },
    typeText: { color: '#FFF', fontSize: 8, fontFamily: 'Poppins_700Bold', textTransform: 'uppercase' },
    gridTitle: { fontFamily: 'Poppins_600SemiBold', color: Colors.text, fontSize: 11, marginBottom: 2, textShadowColor: 'rgba(0,0,0,0.8)', textShadowOffset: {width: 0, height: 1}, textShadowRadius: 2 },
    ratingBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    ratingText: { color: '#FFD700', fontSize: 10, fontFamily: 'Poppins_700Bold' },
    listItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface + '40', padding: 10, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    listImage: { width: 60, height: 85, borderRadius: 10, backgroundColor: Colors.surface },
    listContent: { flex: 1, paddingHorizontal: 15, justifyContent: 'center' },
    listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
    listTitle: { fontFamily: 'Poppins_600SemiBold', color: Colors.text, fontSize: 16, flex: 1, marginRight: 10 },
    listTime: { fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, fontSize: 12 },
    listSubtitle: { fontFamily: 'Poppins_400Regular', color: Colors.secondary, fontSize: 13, marginBottom: 8 },
    progressContainer: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    progressBarBg: { flex: 1, height: 4, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 2 },
    progressBarFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 2 },
    progressText: { fontFamily: 'Poppins_500Medium', color: Colors.textSecondary, fontSize: 12 },
    removeHistoryBtn: { padding: 10, justifyContent: 'center', alignItems: 'center' },
});