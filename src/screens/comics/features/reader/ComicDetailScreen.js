// screens/comics/ComicDetailScreen.js

import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Image, Share, ActivityIndicator } from 'react-native'; 
import { Colors } from '@config/Colors';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ComicService } from '@api/MockComicService'; 
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics'; // Optional: for haptic feedback

import { useLibrary } from '@context/LibraryContext';
import { useDownloads } from '@context/DownloadContext';
import { useModal } from '@context/ModalContext';
import { useAlert } from '@context/AlertContext'; 

import { formatChapterDate } from '@utils/formatDate';
import Animated, { useSharedValue, useAnimatedStyle, interpolate, Extrapolate, useAnimatedScrollHandler, withTiming } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import Svg, { Circle } from 'react-native-svg';

const HEADER_HEIGHT = 300; 
const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

const ProgressRing = ({ progress, size = 28 }) => {
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
};

const ComicDetailScreen = ({ route, navigation }) => {
  const { comicId } = route.params;
  
  // --- HOOKS ---
  
  const [comic, setComic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSynopsisExpanded, setIsSynopsisExpanded] = useState(false);
  const [chapterSortOrder, setChapterSortOrder] = useState('desc');
  const [isFavorite, setIsFavorite] = useState(false); // NEW STATE

  const { showAlert } = useAlert(); 
  const insets = useSafeAreaInsets();
  const { isInLibrary, addToLibrary, removeFromLibrary } = useLibrary();
  const modal = useModal();
  const { getChapterStatus, downloadChapters, deleteChapter, getDownloadInfo, getDownloadedCoverUri } = useDownloads();

  const scrollY = useSharedValue(0); 
  const downloadProgress = useSharedValue(0);

  // --- DERIVED STATE ---
  
  const downloadInfo = useMemo(() => {
      if (!comic) return { downloadedCount: 0, progress: 0 };
      return getDownloadInfo(comic.id, comic.chapters ? comic.chapters.length : 0);
  }, [comic, getDownloadInfo]);

  const { downloadedCount, progress } = downloadInfo;

  // --- EFFECTS ---

  useEffect(() => {
    let isMounted = true;
    const loadComic = async () => {
        try {
            const data = await ComicService.getComicDetails(comicId);
            const favStatus = ComicService.isFavorite(comicId); // Check favorite status
            if (isMounted) {
                setComic(data);
                setIsFavorite(favStatus);
            }
        } catch (error) {
            console.error("Error loading comic details", error);
        } finally {
            if (isMounted) setLoading(false);
        }
    };
    loadComic();
    return () => { isMounted = false; };
  }, [comicId]);

  useEffect(() => {
    downloadProgress.value = withTiming(progress, { duration: 500 });
  }, [progress]);

  // --- ANIMATIONS ---
  
  const animatedProgressStyle = useAnimatedStyle(() => ({
    width: `${downloadProgress.value * 100}%`,
  }));

  const scrollHandler = useAnimatedScrollHandler((event) => { scrollY.value = event.contentOffset.y; });
  
  const animatedHeroStyle = useAnimatedStyle(() => ({ 
      transform: [{ scale: interpolate(scrollY.value, [-HEADER_HEIGHT, 0], [2, 1], Extrapolate.CLAMP) }] 
  }));
  
  const animatedHeaderStyle = useAnimatedStyle(() => ({ 
      opacity: interpolate(scrollY.value, [HEADER_HEIGHT / 1.5, HEADER_HEIGHT - insets.top], [0, 1], Extrapolate.CLAMP) 
  }));
  
  const animatedTitleStyle = useAnimatedStyle(() => ({ 
      opacity: interpolate(scrollY.value, [HEADER_HEIGHT - insets.top, HEADER_HEIGHT - insets.top + 20], [0, 1], Extrapolate.CLAMP) 
  }));

  const sortedChapters = useMemo(() => {
    if (!comic?.chapters) return [];
    const chaptersCopy = [...comic.chapters];
    return chapterSortOrder === 'asc' 
        ? chaptersCopy.sort((a,b) => parseInt(a.id) - parseInt(b.id)) 
        : chaptersCopy.sort((a,b) => parseInt(b.id) - parseInt(a.id));
  }, [comic?.chapters, chapterSortOrder]);

  // --- RENDER HELPERS ---

  if (loading) {
      return (
          <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
              <ActivityIndicator size="large" color={Colors.secondary} />
          </View>
      );
  }

  if (!comic) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={styles.errorText}>Comic not found!</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{marginTop: 20}}>
            <Text style={{color: Colors.secondary}}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isComicInLibrary = isInLibrary(comic.id);
  const coverImageUri = getDownloadedCoverUri(comic.id);
  const imageSource = coverImageUri 
    ? { uri: coverImageUri } 
    : (comic.cover || comic.image);

  // --- ACTIONS ---

  const handleLibraryToggle = async () => { 
      // Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); // Optional
      if (isComicInLibrary) {
          removeFromLibrary(comic.id);
          await ComicService.removeFromLibrary(comic.id);
      } else {
          addToLibrary(comic.id);
          await ComicService.addToLibrary(comic.id);
          showAlert({ title: "Added to Library", message: "Track reading progress here.", type: "success" });
      }
  };

  const handleFavoriteToggle = async () => {
    // Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); // Optional
    if (isFavorite) {
        await ComicService.removeFromFavorites(comic.id);
        setIsFavorite(false);
    } else {
        await ComicService.addToFavorites(comic.id);
        setIsFavorite(true);
        showAlert({ title: "Favorited!", message: "Added to your favorites collection.", type: "success" });
    }
  };

  const handleReadPress = () => { 
      if (sortedChapters.length > 0) { 
          ComicService.updateHistory(comic.id, sortedChapters[0].title);
          navigation.navigate('Reader', { comicId: comic.id, chapterId: sortedChapters[0].id }); 
      } 
  };
  
  const toggleSortOrder = () => { setChapterSortOrder(prev => (prev === 'desc' ? 'asc' : 'desc')); }; 
  
  const showDownloadModal = async () => { 
      try {
          const pages = await ComicService.getChapterPages(comic.id, '1');
          const comicPagesMap = { [comic.id]: pages };
          modal.show('download', { comic, comicPages: comicPagesMap }); 
      } catch (e) {
          console.error("Failed to fetch pages for download modal", e);
          showAlert({ title: "Error", message: "Could not load download options.", type: "error" });
      }
  };
  
  const handleSingleChapterDownloadToggle = async (chapterId) => {
    const { status } = getChapterStatus(comic.id, chapterId);
    if (status === 'downloaded') {
        deleteChapter(comic.id, chapterId);
    } else if (status === 'none') {
        try {
            const pages = await ComicService.getChapterPages(comic.id, chapterId);
            const comicPagesMap = { [comic.id]: pages };
            downloadChapters(comic.id, [chapterId], { 
                cover: comic.cover || comic.image, 
                pages: comicPagesMap 
            });
        } catch (e) {
            console.error("Failed to fetch pages for download", e);
            showAlert({ title: "Error", message: "Could not start download.", type: "error" });
        }
    }
  };

  const showMoreOptions = () => {
    modal.show('actionSheet', {
      title: comic.title,
      options: [
        { 
            label: 'Share', 
            onPress: async () => { 
                try { await Share.share({ message: `Check out this comic: ${comic.title}!` }); } 
                catch (error) { 
                    showAlert({ title: "Error", message: error.message, type: "error" }); 
                }
            }, 
            icon: 'share-social-outline' 
        },
        { 
            label: 'Report', 
            onPress: () => showAlert({ 
                title: 'Reported', 
                message: 'Thank you for your feedback.', 
                type: 'success' 
            }), 
            icon: 'alert-circle-outline', 
            isDestructive: true 
        },
        { label: 'Cancel', onPress: () => {}, isCancel: true },
      ]
    });
  };

  const showChapterListModal = () => {
    const handleSelectChapter = (selectedChapterId) => {
        const ch = comic.chapters.find(c => c.id === selectedChapterId);
        if(ch) ComicService.updateHistory(comic.id, ch.title);
        navigation.navigate('Reader', { comicId: comic.id, chapterId: selectedChapterId });
    };
    modal.show('chapterList', { chapters: comic.chapters, currentChapterId: sortedChapters[0]?.id, onSelectChapter: handleSelectChapter });
  };
  
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <Animated.View style={[styles.header, { height: insets.top + 60 }, animatedHeaderStyle]}>
        <BlurView intensity={25} tint="dark" style={StyleSheet.absoluteFill} />
        <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}><Ionicons name="arrow-back-outline" size={28} color={Colors.text} /></TouchableOpacity>
        <Animated.View style={[styles.headerTitleContainer, animatedTitleStyle]}><Text style={styles.headerTitle} numberOfLines={1}>{comic.title}</Text></Animated.View>
        <TouchableOpacity style={styles.headerButton} onPress={showMoreOptions}><Ionicons name="ellipsis-horizontal" size={24} color={Colors.text} /></TouchableOpacity>
      </Animated.View>
      
      <AnimatedScrollView onScroll={scrollHandler} scrollEventThrottle={16} contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}>
        {/* Hero Section */}
        <View style={styles.heroContainer}>
            <Animated.Image source={imageSource} style={[styles.heroImage, animatedHeroStyle]} resizeMode="cover"/>
            <LinearGradient colors={['transparent', Colors.background]} style={styles.heroOverlay} locations={[0.5, 1]} />
        </View>
        
        {/* Main Info */}
        <View style={styles.mainContent}>
          <Image source={imageSource} style={styles.coverImage} />
          <View style={styles.infoContainer}>
            <Text style={styles.title}>{comic.title}</Text>
            <Text style={styles.author}>by {comic.author}</Text>
            <View style={styles.statsContainer}>
                <View style={styles.statItem}><Text style={[styles.statText, styles.statusText(comic.status)]}>{comic.status}</Text></View>
                <View style={styles.statItem}><Ionicons name="star" size={14} color={Colors.secondary} /><Text style={styles.statText}>{comic.rating}</Text></View>
                <View style={styles.statItem}><Ionicons name="book-outline" size={14} color={Colors.textSecondary} /><Text style={styles.statText}>{comic.chapters ? comic.chapters.length : 0} Chaps</Text></View>
            </View>
          </View>
        </View>

        <View style={styles.actionsContainer}>
            <TouchableOpacity style={styles.readButton} onPress={handleReadPress}>
                <Ionicons name="book-outline" size={20} color={Colors.background} />
                <Text style={styles.readButtonText}>Start Reading</Text>
            </TouchableOpacity>

            {/* Favorite Button */}
            <TouchableOpacity style={styles.iconButton} onPress={handleFavoriteToggle}>
                <Ionicons 
                    name={isFavorite ? "heart" : "heart-outline"} 
                    size={32} 
                    color={isFavorite ? Colors.danger : Colors.textSecondary} 
                />
            </TouchableOpacity>

            {/* Library Button */}
            <TouchableOpacity style={styles.iconButton} onPress={handleLibraryToggle}>
                <Ionicons 
                    name={isComicInLibrary ? "checkmark-circle" : "add-circle-outline"} 
                    size={32} 
                    color={isComicInLibrary ? Colors.secondary : Colors.textSecondary} 
                />
            </TouchableOpacity>
        </View>
        
        {/* Details & Chapters */}
        <View style={styles.detailsContainer}>
          <Text style={styles.sectionHeader}>Synopsis</Text>
          <Text style={styles.synopsis} numberOfLines={isSynopsisExpanded ? undefined : 3}>{comic.synopsis}</Text>
          <TouchableOpacity onPress={() => setIsSynopsisExpanded(!isSynopsisExpanded)}><Text style={styles.readMoreText}>{isSynopsisExpanded ? "Show Less" : "Read More"}</Text></TouchableOpacity>
          
          <View style={styles.genreContainer}>
              {comic.genres && comic.genres.map(genre => (<View key={genre} style={styles.genreTag}><Text style={styles.genreTagText}>{genre}</Text></View>))}
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.chaptersHeaderContainer}>
            <TouchableOpacity onPress={showChapterListModal} style={{flexDirection: 'row', gap: 10, alignItems: 'center'}}>
              <Text style={styles.sectionHeader}>Chapters</Text>
              <Ionicons name="chevron-down-outline" size={22} color={Colors.textSecondary} />
            </TouchableOpacity>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <TouchableOpacity style={styles.headerActionButton} onPress={showDownloadModal}><Ionicons name="download-outline" size={22} color={Colors.textSecondary} /></TouchableOpacity>
                <TouchableOpacity style={styles.headerActionButton} onPress={toggleSortOrder}><Ionicons name="swap-vertical" size={22} color={Colors.textSecondary} /></TouchableOpacity>
            </View>
          </View>

          {downloadedCount > 0 && (
            <View style={styles.downloadProgressContainer}>
                <View style={styles.progressBarTrack}><Animated.View style={[styles.progressBarFill, animatedProgressStyle]} /></View>
                <Text style={styles.downloadCountText}>{`${downloadedCount} / ${comic.chapters.length}`} Downloaded</Text>
            </View>
          )}
          
          {sortedChapters.map((chapter) => {
            const { status, progress } = getChapterStatus(comic.id, chapter.id);
            const isProcessing = status === 'queued' || status === 'downloading';
            return (
              <View key={chapter.id} style={styles.chapterRow}>
                <TouchableOpacity 
                    style={styles.chapterItem} 
                    onPress={() => {
                        ComicService.updateHistory(comic.id, chapter.title);
                        navigation.navigate('Reader', { comicId: comic.id, chapterId: chapter.id });
                    }}
                >
                  <View>
                    <Text style={[styles.chapterTitle, { opacity: status === 'downloaded' ? 1 : 0.7 }]}>{chapter.title}</Text>
                    <Text style={styles.chapterDate}>{formatChapterDate(chapter.releaseDate)}</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleSingleChapterDownloadToggle(chapter.id)} style={styles.downloadButton} disabled={isProcessing}>
                    {isProcessing ? (<ProgressRing progress={progress} size={28} />) : (<Ionicons name={status === 'downloaded' ? "trash-outline" : "arrow-down-circle-outline"} size={28} color={status === 'downloaded' ? Colors.error : Colors.textSecondary} />)}
                </TouchableOpacity>
              </View>
            )
          })}
        </View>
      </AnimatedScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    errorText: { fontFamily: 'Poppins_600SemiBold', color: Colors.text, fontSize: 24, textAlign: 'center' },
    header: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(255,255,255,0.1)' },
    headerButton: { padding: 10 },
    headerTitleContainer: { flex: 1, alignItems: 'center', paddingHorizontal: 10 },
    headerTitle: { fontFamily: 'Poppins_600SemiBold', color: Colors.text, fontSize: 18 },
    heroContainer: { height: HEADER_HEIGHT, overflow: 'hidden', borderBottomWidth: 1, borderColor: Colors.background },
    heroImage: { width: '100%', height: '100%' },
    heroOverlay: { ...StyleSheet.absoluteFillObject },
    mainContent: { flexDirection: 'row', paddingHorizontal: 20, marginTop: -60, zIndex: 1, alignItems: 'flex-end' },
    coverImage: { width: 120, height: 180, borderRadius: 12, borderWidth: 3, borderColor: Colors.background },
    infoContainer: { flex: 1, marginLeft: 20, marginBottom: 5 },
    title: { fontFamily: 'Poppins_700Bold', color: Colors.text, fontSize: 24, lineHeight: 32 },
    author: { fontFamily: 'Poppins_500Medium', color: Colors.textSecondary, fontSize: 15, marginTop: 4 },
    statsContainer: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginTop: 10 },
    statItem: { flexDirection: 'row', alignItems: 'center', marginRight: 15, marginBottom: 5 },
    statText: { fontFamily: 'Poppins_500Medium', color: Colors.textSecondary, fontSize: 14, marginLeft: 5 },
    statusText: (status) => ({ color: status === 'Ongoing' ? '#4caf50' : Colors.primary, fontFamily: 'Poppins_600SemiBold' }),
    actionsContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginTop: 20, justifyContent: 'space-between', gap: 15 },
    readButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.secondary, paddingVertical: 12, borderRadius: 25 },
    readButtonText: { fontFamily: 'Poppins_600SemiBold', color: Colors.background, fontSize: 16, marginLeft: 8 },
    iconButton: { padding: 8 }, // Renamed from libraryButton for reuse
    detailsContainer: { paddingHorizontal: 20, marginTop: 25 },
    sectionHeader: { fontFamily: 'Poppins_600SemiBold', color: Colors.text, fontSize: 20, marginBottom: 5 },
    synopsis: { fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, fontSize: 15, lineHeight: 24 },
    readMoreText: { fontFamily: 'Poppins_600SemiBold', color: Colors.secondary, fontSize: 14, marginTop: 5 },
    genreContainer: { flexDirection: 'row', flexWrap: 'wrap', marginVertical: 20 },
    genreTag: { backgroundColor: Colors.surface, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginRight: 10, marginBottom: 10 },
    genreTagText: { fontFamily: 'Poppins_500Medium', color: Colors.textSecondary, fontSize: 12 },
    divider: { height: StyleSheet.hairlineWidth, backgroundColor: Colors.surface, marginVertical: 15 },
    chaptersHeaderContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    headerActionButton: { padding: 5, marginLeft: 10 },
    downloadProgressContainer: { marginBottom: 15, marginTop: 10 },
    progressBarTrack: { height: 8, backgroundColor: Colors.surface, borderRadius: 4, overflow: 'hidden' },
    progressBarFill: { height: '100%', backgroundColor: Colors.secondary, borderRadius: 4 },
    downloadCountText: { fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, fontSize: 12, marginTop: 5, alignSelf: 'flex-end' },
    chapterRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: 10, marginBottom: 10, },
    chapterItem: { flex: 1, paddingVertical: 15, paddingLeft: 15 },
    chapterTitle: { fontFamily: 'Poppins_500Medium', color: Colors.text, fontSize: 16 },
    chapterDate: { fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, fontSize: 12, marginTop: 2 },
    downloadButton: { padding: 15 },
});

export default ComicDetailScreen;