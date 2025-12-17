import React, { useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Colors } from '@config/Colors'; 
import { useProfile } from '@context/main/ProfileContext';
// IMPORT COMPONENT
import { GridItem, ListItem } from '../components/ui/CollectionComponents';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 3;
const GAP = 10;

const ViewAllHFScreen = () => {
    const { profile, removeItem } = useProfile();
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const route = useRoute();
    const { type = 'favorites', title = 'Collection' } = route.params || {};
    const isGrid = type === 'favorites';
    const listData = type === 'favorites' ? profile?.favorites : profile?.history;

    const handleRemoveItem = useCallback((itemId) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        removeItem(type, itemId); 
    }, [type, removeItem]);

    const renderItem = useCallback(({ item, index }) => {
        if (isGrid) {
            return <GridItem item={item} index={index} onPress={() => navigation.navigate('ComicDetail', { comicId: item.id })} onRemove={() => handleRemoveItem(item.id)} />;
        }
        return <ListItem item={item} index={index} onPress={() => navigation.navigate('ComicDetail', { comicId: item.id })} onRemove={() => handleRemoveItem(item.id)} />;
    }, [isGrid, navigation, handleRemoveItem]);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <BlurView intensity={20} tint="dark" style={styles.blurButton}><Ionicons name="arrow-back" size={24} color={Colors.text} /></BlurView>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{title}</Text>
                <View style={{ width: 40 }} /> 
            </View>
            <FlatList
                key={isGrid ? 'grid' : 'list'}
                data={listData}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={[styles.listContainer, { paddingBottom: insets.bottom + 20 }]}
                numColumns={isGrid ? COLUMN_COUNT : 1}
                columnWrapperStyle={isGrid ? { gap: GAP } : null}
                showsVerticalScrollIndicator={false}
                initialNumToRender={12}
                maxToRenderPerBatch={10}
                windowSize={5}
                removeClippedSubviews={true}
                ListEmptyComponent={<View style={styles.emptyContainer}><Ionicons name={isGrid ? "heart-dislike-outline" : "library-outline"} size={64} color={Colors.textSecondary} /><Text style={styles.emptyText}>{isGrid ? "No favorites yet" : "No reading history"}</Text></View>}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 20, zIndex: 10 },
    backButton: { borderRadius: 20, overflow: 'hidden' },
    blurButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)' },
    headerTitle: { fontSize: 20, fontFamily: 'Poppins_600SemiBold', color: Colors.text },
    listContainer: { paddingHorizontal: 20, gap: 15 },
    emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingTop: 100, opacity: 0.5 },
    emptyText: { marginTop: 10, color: Colors.textSecondary, fontFamily: 'Poppins_500Medium' }
});

export default ViewAllHFScreen;