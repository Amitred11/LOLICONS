import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Image, TouchableOpacity, ImageBackground, Dimensions } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withDelay } from 'react-native-reanimated';
import { Swipeable } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle } from 'react-native-svg';
import { Colors } from '@config/Colors';
import { useNavigation } from '@react-navigation/native';
import { useComic } from '@context/main/ComicContext';
import { Animated as RNAnimated } from 'react-native';

const { width } = Dimensions.get('window');

// --- Shared: Progress Ring (Used in Library & Detail) ---
export const ProgressRing = React.memo(({ progress, size = 32 }) => {
    const strokeWidth = 3;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference * (1 - progress);
    return (
        <View style={{width: size, height: size}}>
            <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                <Circle cx={size/2} cy={size/2} r={radius} stroke={Colors.surface + '80'} strokeWidth={strokeWidth} />
                <Circle cx={size/2} cy={size/2} r={radius} stroke={Colors.secondary} strokeWidth={strokeWidth} 
                    strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round"
                    transform={`rotate(-90 ${size/2} ${size/2})`}
                />
            </Svg>
        </View>
    )
});

// --- History: List Item ---
export const HistoryItem = ({ item, index, onRemove }) => {
  const navigation = useNavigation();
  const swipeableRef = useRef(null); 
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

  const renderRightActions = (progress, dragX) => {
    const trans = dragX.interpolate({ inputRange: [-80, 0], outputRange: [0, 80], extrapolate: 'clamp' });
    return (
      <TouchableOpacity onPress={() => { swipeableRef.current?.close(); onRemove(item.id); }} style={styles.deleteButton}>
        <RNAnimated.View style={{ transform: [{ translateX: trans }] }}>
          <Ionicons name="trash-outline" size={24} color={Colors.text} />
        </RNAnimated.View>
      </TouchableOpacity>
    );
  };

  return (
    <Animated.View style={animatedEntryStyle}>
      <Swipeable ref={swipeableRef} renderRightActions={renderRightActions} overshootRight={false}>
        <Pressable 
          style={({ pressed }) => [styles.itemContainer, pressed && styles.itemPressed]}
          onPress={() => navigation.navigate('ComicDetail', { comicId: item.id })}
        >
          <Image source={item.image} style={styles.itemImage} />
          <View style={styles.itemTextContainer}>
            <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.itemSubtitle}>{item.lastChapterRead}</Text>
            <View style={styles.progressBarContainer}>
                <View style={[styles.progressBar, { width: `${(item.progress || 0) * 100}%` }]} />
            </View>
          </View>
        </Pressable>
      </Swipeable>
    </Animated.View>
  );
};

// --- Library: Grid Card ---
export const LibraryCard = ({ item, index, cardStyle, imageStyle }) => {
    if (item.empty) return <View style={[cardStyle]} />;

    const navigation = useNavigation();
    const { getDownloadInfo, getDownloadedCoverUri } = useComic();
    
    const { downloadedCount, progress } = getDownloadInfo(item.id, item.chapters?.length ?? 0);
    const coverImageUri = getDownloadedCoverUri(item.id);
    const imageSource = coverImageUri ? { uri: coverImageUri } : (item.cover || item.image);

    const entryOpacity = useSharedValue(0);
    const entryTranslateY = useSharedValue(20);
    
    useEffect(() => {
        entryOpacity.value = withDelay(index * 50, withSpring(1));
        entryTranslateY.value = withDelay(index * 50, withSpring(0));
    }, [index]);

    const animatedEntryStyle = useAnimatedStyle(() => ({
        opacity: entryOpacity.value,
        transform: [{ translateY: entryTranslateY.value }],
    }));

    return (
        <Animated.View style={[styles.cardContainer, cardStyle, animatedEntryStyle]}>
            <Pressable 
                onPress={() => navigation.navigate('ComicDetail', { comicId: item.id })}
                style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
            >
                <ImageBackground source={imageSource} style={[styles.cardImage, imageStyle]} imageStyle={{ borderRadius: 8 }}>
                    <LinearGradient colors={['transparent', 'rgba(0,0,0,0.9)']} style={styles.cardOverlay}>
                        <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
                    </LinearGradient>
                    {downloadedCount > 0 && (
                        <View style={styles.downloadProgressContainer}>
                            <ProgressRing progress={progress} />
                            <Text style={styles.downloadProgressText}>{downloadedCount}</Text>
                        </View>
                    )}
                </ImageBackground>
            </Pressable>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
  // History Item
  itemContainer: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderRadius: 12, backgroundColor: Colors.background, paddingHorizontal: 5 },
  itemPressed: { backgroundColor: Colors.surface + '80' },
  itemImage: { width: 50, height: 75, borderRadius: 6, backgroundColor: Colors.surface },
  itemTextContainer: { flex: 1, marginLeft: 15, justifyContent: 'center' },
  itemTitle: { fontFamily: 'Poppins_600SemiBold', color: Colors.text, fontSize: 16, marginBottom: 2 },
  itemSubtitle: { fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, fontSize: 14, marginBottom: 6 },
  progressBarContainer: { height: 4, backgroundColor: Colors.surface, borderRadius: 2, width: '80%' },
  progressBar: { height: '100%', backgroundColor: Colors.secondary, borderRadius: 2 },
  deleteButton: { backgroundColor: Colors.danger, justifyContent: 'center', alignItems: 'flex-end', width: 80, borderRadius: 12, paddingRight: 25 },
  
  // Library Card
  cardContainer: { marginBottom: 20 },
  cardImage: { width: '100%', aspectRatio: 2 / 3, backgroundColor: Colors.surface, justifyContent: 'flex-end' },
  cardOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'flex-end', padding: 8, borderRadius: 8 },
  cardTitle: { fontFamily: 'Poppins_600SemiBold', color: Colors.text, fontSize: 13, textShadowColor: 'rgba(0, 0, 0, 0.9)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 3 },
  downloadProgressContainer: { position: 'absolute', top: 6, left: 6, width: 32, height: 32, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 16 },
  downloadProgressText: { position: 'absolute', color: Colors.text, fontFamily: 'Poppins_600SemiBold', fontSize: 10 },
});