import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ImageBackground, TouchableOpacity, Dimensions } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withDelay } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@config/Colors';
import { useComic } from '@context/main/ComicContext';

const { width } = Dimensions.get('window');
const PADDING = 15;

// --- Unified Add Button ---
export const LibraryToggleButton = ({ item, style }) => {
    const { isInLibrary, addToLibrary, removeFromLibrary } = useComic();
    const isIn = isInLibrary(item.id);

    return (
        <TouchableOpacity 
            onPress={() => isIn ? removeFromLibrary(item.id) : addToLibrary(item)} 
            style={[styles.addButton, style]}
        >
            <BlurView intensity={50} tint="dark" style={StyleSheet.absoluteFillObject}>
                <View style={styles.addButtonIconContainer}>
                    <Ionicons name={isIn ? "checkmark-sharp" : "add-sharp"} size={22} color={isIn ? Colors.secondary : Colors.text} />
                </View>
            </BlurView>
        </TouchableOpacity>
    );
};

// --- List View Item ---
export const ComicListItem = ({ item, index }) => {
    const navigation = useNavigation();
    const entryOpacity = useSharedValue(0);
    const entryTranslateY = useSharedValue(20);

    useEffect(() => {
        entryOpacity.value = withDelay(index * 50, withSpring(1));
        entryTranslateY.value = withDelay(index * 50, withSpring(0));
    }, []);

    const animatedEntryStyle = useAnimatedStyle(() => ({
        opacity: entryOpacity.value,
        transform: [{ translateY: entryTranslateY.value }],
    }));

    return (
        <Animated.View style={[styles.listItemWrapper, animatedEntryStyle]}>
            <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
            <Pressable 
                style={({ pressed }) => [styles.listItemContainer, pressed && styles.itemPressed]} 
                onPress={() => navigation.navigate('ComicDetail', { comicId: item.id })}
            >
                <ImageBackground source={item.image} style={styles.listItemImage} imageStyle={{ borderRadius: 8 }} />
                <View style={styles.listItemTextContainer}>
                    <Text style={styles.listItemTitle} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.listItemSynopsis} numberOfLines={2}>{item.synopsis}</Text>
                    <View style={styles.tagsContainer}>
                        <View style={[styles.tag, styles.statusTag(item.status)]}><Text style={styles.tagText}>{item.status}</Text></View>
                        <View style={styles.tag}><Text style={styles.tagText}>{item.type}</Text></View>
                        {(item.genres || []).slice(0, 2).map(genre => (
                            <View key={genre} style={styles.tag}><Text style={styles.tagText}>{genre}</Text></View>
                        ))}
                    </View>
                </View>
                <LibraryToggleButton item={item} style={{ right: 0 }}/>
            </Pressable>
        </Animated.View>
    );
};

// --- Grid View Item ---
export const ComicGridItem = ({ item, index, style, imageStyle }) => {
  // Handle empty placeholders for grid alignment
  if (item.empty) { 
      return <View style={[style, { marginBottom: 20 }]} />; 
  }
  
  const navigation = useNavigation();
  const entryOpacity = useSharedValue(0);
  const entryTranslateY = useSharedValue(20);

  useEffect(() => {
    entryOpacity.value = withDelay(index * 50, withSpring(1));
    entryTranslateY.value = withDelay(index * 50, withSpring(0));
  }, []);

  const animatedEntryStyle = useAnimatedStyle(() => ({
    opacity: entryOpacity.value,
    transform: [{ translateY: entryTranslateY.value }],
  }));

  return (
    <Animated.View style={[styles.gridItemContainer, style, animatedEntryStyle]}>
      <Pressable onPress={() => navigation.navigate('ComicDetail', { comicId: item.id })}>
        <ImageBackground source={item.image} style={[styles.gridItemImage, imageStyle]} imageStyle={{ borderRadius: 12 }}>
          <LinearGradient colors={['transparent', 'rgba(0,0,0,0.9)']} style={styles.gridItemOverlay}>
            <Text style={styles.gridItemType}>{item.type}</Text>
            <Text style={styles.gridItemTitle} numberOfLines={2}>{item.title}</Text>
          </LinearGradient>
        </ImageBackground>
      </Pressable>
      <LibraryToggleButton item={item} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  // Button
  addButton: { position: 'absolute', top: 8, right: 8, width: 36, height: 36, borderRadius: 18, overflow: 'hidden' },
  addButtonIconContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  
  // List Styles
  listItemWrapper: { borderRadius: 12, overflow: 'hidden', marginHorizontal: PADDING, marginBottom: 15 },
  listItemContainer: { flexDirection: 'row', padding: 10, alignItems: 'center' },
  itemPressed: { backgroundColor: Colors.surface + '80' },
  listItemImage: { width: 80, height: 120, backgroundColor: Colors.surface },
  listItemTextContainer: { flex: 1, marginLeft: PADDING, height: 120, justifyContent: 'space-between', paddingVertical: 2 },
  listItemTitle: { fontFamily: 'Poppins_600SemiBold', color: Colors.text, fontSize: 17 },
  listItemSynopsis: { fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, fontSize: 13, lineHeight: 18 },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' },
  tag: { backgroundColor: Colors.surface, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginRight: 6, marginTop: 6 },
  tagText: { fontFamily: 'Poppins_500Medium', color: Colors.textSecondary, fontSize: 11 },
  statusTag: (status) => ({ backgroundColor: status === 'Ongoing' ? Colors.success + '40' : Colors.primary + '40' }),

  // Grid Styles
  gridItemContainer: { marginBottom: 20 },
  gridItemImage: { width: '100%', aspectRatio: 2/3, backgroundColor: Colors.surface, justifyContent: 'flex-end' },
  gridItemOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'flex-end', padding: 10, borderRadius: 12 },
  gridItemType: { fontFamily: 'Poppins_600SemiBold', color: Colors.text, fontSize: 10, backgroundColor: Colors.secondary + 'B3', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, overflow: 'hidden', alignSelf: 'flex-start', marginBottom: 4 },
  gridItemTitle: { fontFamily: 'Poppins_600SemiBold', color: Colors.text, fontSize: 14, textShadowColor: 'rgba(0,0,0,0.9)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 3 },
});