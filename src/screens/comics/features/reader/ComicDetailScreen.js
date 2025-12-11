// screens/comics/ComicDetailScreen.js

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { 
    View, Text, StyleSheet, ScrollView, TouchableOpacity, 
    StatusBar, Image, Share, ActivityIndicator,
} from 'react-native';
import { Colors } from '@config/Colors';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ComicService } from '@api/MockComicService';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useComic } from '@context/main/ComicContext';
import { useModal } from '@context/other/ModalContext';
import { useAlert } from '@context/other/AlertContext';
import { formatChapterDate } from '@utils/formatDate';
import Animated, { 
    useSharedValue, useAnimatedStyle, interpolate, 
    Extrapolate, useAnimatedScrollHandler, withTiming 
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import Svg, { Circle } from 'react-native-svg';

const HEADER_HEIGHT = 300;
const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

// --- HELPER & CHILD COMPONENTS ---

// This component shows the OVERALL comic rating
const StarRating = ({ rating, size = 16, style }) => {
    const totalStars = 5;
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = totalStars - fullStars - (halfStar ? 1 : 0);

    return (
        <View style={[styles.starRatingContainer, style]}>
            {[...Array(fullStars)].map((_, i) => <Ionicons key={`full_${i}`} name="star" size={size} color={Colors.secondary} />)}
            {halfStar && <Ionicons key="half" name="star-half-sharp" size={size} color={Colors.secondary} />}
            {[...Array(emptyStars)].map((_, i) => <Ionicons key={`empty_${i}`} name="star-outline" size={size} color={Colors.secondary} />)}
            <Text style={styles.statText}>{rating}</Text>
        </View>
    );
};

// REFACTOR: This new component shows the USER'S rating and acts as a button
const UserRatingTrigger = React.memo(({ userRating, onPress }) => (
    <TouchableOpacity style={styles.userRatingTrigger} onPress={onPress}>
        <Text style={styles.userRatingLabel}>Your Rating:</Text>
        <View style={styles.userRatingStars}>
            {userRating > 0 ? (
                [...Array(5)].map((_, i) => (
                    <Ionicons 
                        key={i}
                        name={i < userRating ? "star" : "star-outline"}
                        size={18} 
                        color={Colors.secondary} 
                    />
                ))
            ) : (
                <Text style={styles.tapToRateText}>Tap to Rate</Text>
            )}
        </View>
    </TouchableOpacity>
));

const ProgressRing = React.memo(({ progress, size = 28 }) => {
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

const DetailHeader = React.memo(({ scrollY, insets, comicTitle, onBack, onMore }) => {
    const animatedHeaderStyle = useAnimatedStyle(() => ({ opacity: interpolate(scrollY.value, [HEADER_HEIGHT / 1.5, HEADER_HEIGHT - insets.top], [0, 1], Extrapolate.CLAMP) }));
    const animatedTitleStyle = useAnimatedStyle(() => ({ opacity: interpolate(scrollY.value, [HEADER_HEIGHT - insets.top, HEADER_HEIGHT - insets.top + 20], [0, 1], Extrapolate.CLAMP) }));
    return (
        <View style={[styles.header, { height: insets.top + 60 }]}>
            <Animated.View style={[StyleSheet.absoluteFill, animatedHeaderStyle]}><BlurView intensity={25} tint="dark" style={StyleSheet.absoluteFill} /></Animated.View>
            <TouchableOpacity style={styles.headerButton} onPress={onBack}><Ionicons name="arrow-back-outline" size={28} color={Colors.text} /></TouchableOpacity>
            <Animated.View style={[styles.headerTitleContainer, animatedTitleStyle]}><Text style={styles.headerTitle} numberOfLines={1}>{comicTitle}</Text></Animated.View>
            <TouchableOpacity style={styles.headerButton} onPress={onMore}><Ionicons name="ellipsis-horizontal" size={24} color={Colors.text} /></TouchableOpacity>
        </View>
    );
});

const HeroSection = React.memo(({ imageSource, scrollY }) => {
    // ... (Component remains the same)
    const animatedHeroStyle = useAnimatedStyle(() => ({ transform: [{ scale: interpolate(scrollY.value, [-HEADER_HEIGHT, 0], [2, 1], Extrapolate.CLAMP) }] }));
    return (
        <View style={styles.heroContainer}>
            <Animated.Image source={imageSource} style={[styles.heroImage, animatedHeroStyle]} resizeMode="cover"/>
            <LinearGradient colors={['transparent', Colors.background]} style={styles.heroOverlay} locations={[0.5, 1]} />
        </View>
    );
});

// REFACTOR: ComicInfo now includes the UserRatingTrigger
const ComicInfo = React.memo(({ comic, imageSource, userRating, onRatePress }) => (
    <View style={styles.mainContent}>
      <Image source={imageSource} style={styles.coverImage} />
      <View style={styles.infoContainer}>
        <Text style={styles.title}>{comic.title}</Text>
        <Text style={styles.author}>by {comic.author}</Text>
        <View style={styles.statsContainer}>
            <View style={styles.statItem}><Text style={[styles.statText, styles.statusText(comic.status)]}>{comic.status}</Text></View>
            <StarRating rating={comic.rating} />
            <View style={styles.statItem}><Ionicons name="book-outline" size={14} color={Colors.textSecondary} /><Text style={styles.statText}>{comic.chapters?.length ?? 0} Chaps</Text></View>
        </View>
        <UserRatingTrigger userRating={userRating} onPress={onRatePress} />
      </View>
    </View>
));

const ActionButtons = React.memo(({ onRead, onFavorite, onLibrary, isFavorite, isInLibrary }) => (
    <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.readButton} onPress={onRead}><Ionicons name="book-outline" size={20} color={Colors.background} /><Text style={styles.readButtonText}>Start Reading</Text></TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={onFavorite}><Ionicons name={isFavorite ? "heart" : "heart-outline"} size={32} color={isFavorite ? Colors.danger : Colors.textSecondary} /></TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={onLibrary}><Ionicons name={isInLibrary ? "checkmark-circle" : "add-circle-outline"} size={32} color={isInLibrary ? Colors.secondary : Colors.textSecondary} /></TouchableOpacity>
    </View>
));

const SynopsisBlock = React.memo(({ synopsis, genres }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    return (
        <>
            <View style={styles.divider} />
            <Text style={styles.sectionHeader}>Synopsis</Text>
            <Text style={styles.synopsis} numberOfLines={isExpanded ? undefined : 3}>{synopsis}</Text>
            <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)}><Text style={styles.readMoreText}>{isExpanded ? "Show Less" : "Read More"}</Text></TouchableOpacity>
            <View style={styles.genreContainer}>{genres?.map(genre => (<View key={genre} style={styles.genreTag}><Text style={styles.genreTagText}>{genre}</Text></View>))}</View>
            <View style={styles.divider} />
        </>
    );
});

const ChapterList = React.memo(({ comic, sortedChapters, onChapterPress, onSortToggle, onDownloadAll, onSingleDownload }) => {
    const { getChapterStatus, getDownloadInfo } = useComic();
    const animatedProgress = useSharedValue(0);
    const { downloadedCount, progress } = useMemo(() => getDownloadInfo(comic.id, comic.chapters?.length ?? 0), [comic.id, comic.chapters, getDownloadInfo]);
    useEffect(() => { animatedProgress.value = withTiming(progress, { duration: 500 }); }, [progress]);
    const animatedProgressStyle = useAnimatedStyle(() => ({ width: `${animatedProgress.value * 100}%` }));
    return (
        <>
            <View style={styles.chaptersHeaderContainer}><Text style={styles.sectionHeader}>Chapters</Text><View style={{flexDirection: 'row', alignItems: 'center'}}><TouchableOpacity style={styles.headerActionButton} onPress={onDownloadAll}><Ionicons name="download-outline" size={22} color={Colors.textSecondary} /></TouchableOpacity><TouchableOpacity style={styles.headerActionButton} onPress={onSortToggle}><Ionicons name="swap-vertical" size={22} color={Colors.textSecondary} /></TouchableOpacity></View></View>
            {downloadedCount > 0 && (<View style={styles.downloadProgressContainer}><View style={styles.progressBarTrack}><Animated.View style={[styles.progressBarFill, animatedProgressStyle]} /></View><Text style={styles.downloadCountText}>{`${downloadedCount} / ${comic.chapters.length}`} Downloaded</Text></View>)}
            {sortedChapters.map((chapter) => {
              const { status, progress } = getChapterStatus(comic.id, chapter.id);
              const isProcessing = status === 'queued' || status === 'downloading';
              return (
                <View key={chapter.id} style={styles.chapterRow}>
                  <TouchableOpacity style={styles.chapterItem} onPress={() => onChapterPress(chapter)}><View><Text style={[styles.chapterTitle, { opacity: status === 'downloaded' ? 1 : 0.7 }]}>{chapter.title}</Text><Text style={styles.chapterDate}>{formatChapterDate(chapter.releaseDate)}</Text></View></TouchableOpacity>
                  <TouchableOpacity onPress={() => onSingleDownload(chapter.id)} style={styles.downloadButton} disabled={isProcessing}>{isProcessing ? <ProgressRing progress={progress} /> : <Ionicons name={status === 'downloaded' ? "trash-outline" : "arrow-down-circle-outline"} size={28} color={status === 'downloaded' ? Colors.error : Colors.textSecondary} />}</TouchableOpacity>
                </View>
              )
            })}
        </>
    );
});


// --- MAIN COMPONENT ---

const ComicDetailScreen = ({ route, navigation }) => {
  const { comicId } = route.params;
  const [comic, setComic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chapterSortOrder, setChapterSortOrder] = useState('desc');

  const insets = useSafeAreaInsets();
  const modal = useModal();
  const {showToast} = useAlert();
  const scrollY = useSharedValue(0);
  
  const { 
    isInLibrary, addToLibrary, removeFromLibrary, 
    isFavorite, toggleFavorite,
    updateHistory, getChapterStatus, downloadChapters, deleteChapter, 
    getDownloadedCoverUri,
    rateComic, getUserRating
  } = useComic();

  const isComicInLibrary = isInLibrary(comicId);
  const isComicFavorite = isFavorite(comicId);
  const userRating = getUserRating(comicId);

  // --- DATA FETCHING ---
  useEffect(() => {
    let isMounted = true;
    const loadComic = async () => {
        setLoading(true);
        try {
            const data = await ComicService.getComicDetails(comicId);
            if (isMounted) setComic(data);
        } catch (error) { console.error("Error loading comic details", error); } 
        finally { if (isMounted) setLoading(false); }
    };
    loadComic();
    return () => { isMounted = false; };
  }, [comicId]);

  // --- MEMOIZED VALUES ---
  const sortedChapters = useMemo(() => {
    if (!comic?.chapters) return [];
    return [...comic.chapters].sort((a,b) => chapterSortOrder === 'asc' ? parseInt(a.id) - parseInt(b.id) : parseInt(b.id) - parseInt(a.id));
  }, [comic?.chapters, chapterSortOrder]);

  const imageSource = useMemo(() => {
    const coverUri = getDownloadedCoverUri(comic?.id);
    return coverUri ? { uri: coverUri } : (comic?.cover || comic?.image);
  }, [comic, getDownloadedCoverUri]);

  // --- HANDLERS ---
  const handleReadPress = useCallback((chapter) => { 
      const chapterToRead = chapter || sortedChapters[0];
      if (chapterToRead) { 
          updateHistory(comic.id, chapterToRead.title);
          navigation.navigate('Reader', { comicId: comic.id, chapterId: chapterToRead.id }); 
      } 
  }, [comic, sortedChapters, navigation, updateHistory]);

  const showRatingModal = useCallback(() => {
    if (!comic) return;
    // This assumes you have a modal named 'rating' registered in your ModalProvider
    modal.show('rating', {
        comicId: comic.id,
        currentRating: userRating,
        onRate: (newRating) => {
            rateComic(comic.id, newRating);
            modal.hide();
        }
    });
  }, [comic, modal, userRating, rateComic]);

  const handleSingleChapterDownload = useCallback(async (chapterId) => {
    const { status } = getChapterStatus(comic.id, chapterId);
    if (status === 'downloaded') {
        deleteChapter(comic.id, chapterId);
    } else if (status === 'none') {
        try {
            const pages = await ComicService.getChapterPages(comic.id, chapterId);
            downloadChapters(comic.id, [chapterId], { cover: comic.cover || comic.image, pages: { [comic.id]: pages } });
        } catch (e) { showToast( "Could not start download.", "error" ); }
    }
  }, [comic, getChapterStatus, deleteChapter, downloadChapters, showToast]);

  const showMoreOptions = useCallback(() => {
    modal.show('actionSheet', {
      title: comic.title,
      options: [
        { label: 'Share', icon: 'share-social-outline', onPress: async () => { 
            try { await Share.share({ message: `Check out this comic: ${comic.title}!` }); } 
            catch (error) { showToast( error.message, "error" ); }
        }},
        { label: 'Report', icon: 'alert-circle-outline', isDestructive: true, onPress: () => showToast( 
            'Thank you for your feedback.', 'success' 
        )},
        { label: 'Cancel', isCancel: true },
      ]
    });
  }, [comic, modal, showToast]);

  const showDownloadModal = useCallback(async () => {
    try {
        const pages = await ComicService.getChapterPages(comic.id, '1');
        modal.show('download', { comic, comicPages: { [comic.id]: pages } }); 
    } catch (e) { showToast("Could not load download options.", "error" ); }
  }, [comic, modal, showToast]);
  
  const scrollHandler = useAnimatedScrollHandler((event) => { scrollY.value = event.contentOffset.y; });
  
  // --- RENDER ---
  if (loading) return <View style={styles.centeredContainer}><ActivityIndicator size="large" color={Colors.secondary} /></View>;

  if (!comic) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.errorText}>Comic not found!</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{marginTop: 20}}><Text style={{color: Colors.secondary}}>Go Back</Text></TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <DetailHeader scrollY={scrollY} insets={insets} comicTitle={comic.title} onBack={() => navigation.goBack()} onMore={showMoreOptions} />
      
      <AnimatedScrollView onScroll={scrollHandler} scrollEventThrottle={16} contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}>
        <HeroSection imageSource={imageSource} scrollY={scrollY} />
        
        <View style={{ paddingHorizontal: 20 }}>
            <ComicInfo 
                comic={comic} 
                imageSource={imageSource}
                userRating={userRating}
                onRatePress={showRatingModal}
            />
            <ActionButtons 
                onRead={() => handleReadPress()}
                onFavorite={() => toggleFavorite(comic)}
                onLibrary={() => isComicInLibrary ? removeFromLibrary(comic.id) : addToLibrary(comic)}
                isFavorite={isComicFavorite}
                isInLibrary={isComicInLibrary}
            />
        </View>
        
        <View style={styles.detailsContainer}>
            <SynopsisBlock synopsis={comic.synopsis} genres={comic.genres} />
            <ChapterList 
                comic={comic}
                sortedChapters={sortedChapters}
                onChapterPress={handleReadPress}
                onSortToggle={() => setChapterSortOrder(p => p === 'desc' ? 'asc' : 'desc')}
                onDownloadAll={showDownloadModal}
                onSingleDownload={handleSingleChapterDownload}
            />
        </View>
      </AnimatedScrollView>
    </View>
  );
};

// --- STYLES ---

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    centeredContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
    errorText: { fontFamily: 'Poppins_600SemiBold', color: Colors.text, fontSize: 24, textAlign: 'center' },
    header: { position: 'absolute', top: 20, left: 0, right: 0, zIndex: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15 },
    headerButton: { padding: 10 },
    headerTitleContainer: { flex: 1, alignItems: 'center', paddingHorizontal: 10 },
    headerTitle: { fontFamily: 'Poppins_600SemiBold', color: Colors.text, fontSize: 18 },
    heroContainer: { height: HEADER_HEIGHT, overflow: 'hidden', borderBottomWidth: 1, borderColor: Colors.background },
    heroImage: { width: '100%', height: '100%' },
    heroOverlay: { ...StyleSheet.absoluteFillObject },
    mainContent: { flexDirection: 'row', marginTop: -60, zIndex: 1, alignItems: 'flex-end' },
    coverImage: { width: 120, height: 180, borderRadius: 12, borderWidth: 3, borderColor: Colors.background },
    infoContainer: { flex: 1, marginTop: 20, marginLeft: 20, marginBottom: 5, justifyContent: 'flex-end' },
    title: { fontFamily: 'Poppins_700Bold', color: Colors.text, fontSize: 24, lineHeight: 30 },
    author: { fontFamily: 'Poppins_500Medium', color: Colors.textSecondary, fontSize: 15, marginTop: 4 },
    statsContainer: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginTop: 10 },
    statItem: { flexDirection: 'row', alignItems: 'center', marginRight: 15, marginBottom: 5 },
    statText: { fontFamily: 'Poppins_500Medium', color: Colors.textSecondary, fontSize: 14, marginLeft: 5 },
    statusText: (status) => ({ color: status === 'Ongoing' ? '#4caf50' : Colors.primary, fontFamily: 'Poppins_600SemiBold' }),
    starRatingContainer: { flexDirection: 'row', alignItems: 'center', marginRight: 15, bottom: 20},
    // User Rating Trigger Styles
    userRatingTrigger: { backgroundColor: Colors.surface + '80', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, marginTop: 10, alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center' },
    userRatingLabel: { fontFamily: 'Poppins_500Medium', color: Colors.textSecondary, fontSize: 13, marginRight: 8 },
    userRatingStars: { flexDirection: 'row' },
    tapToRateText: { fontFamily: 'Poppins_600SemiBold', color: Colors.secondary, fontSize: 13 },
    // Actions
    actionsContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 20, justifyContent: 'space-between', gap: 15 },
    readButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.secondary, paddingVertical: 12, borderRadius: 25 },
    readButtonText: { fontFamily: 'Poppins_600SemiBold', color: Colors.background, fontSize: 16, marginLeft: 8 },
    iconButton: { padding: 8 },
    // Details
    detailsContainer: { paddingHorizontal: 20, marginTop: 25 },
    sectionHeader: { fontFamily: 'Poppins_600SemiBold', color: Colors.text, fontSize: 20, marginBottom: 5 },
    synopsis: { fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, fontSize: 15, lineHeight: 24 },
    readMoreText: { fontFamily: 'Poppins_600SemiBold', color: Colors.secondary, fontSize: 14, marginTop: 5 },
    genreContainer: { flexDirection: 'row', flexWrap: 'wrap', marginVertical: 20 },
    genreTag: { backgroundColor: Colors.surface, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginRight: 10, marginBottom: 10 },
    genreTagText: { fontFamily: 'Poppins_500Medium', color: Colors.textSecondary, fontSize: 12 },
    divider: { height: StyleSheet.hairlineWidth, backgroundColor: Colors.surface, marginVertical: 15, width: '100%' },
    // Chapters
    chaptersHeaderContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    headerActionButton: { padding: 5, marginLeft: 10 },
    downloadProgressContainer: { marginBottom: 15, marginTop: 10 },
    progressBarTrack: { height: 8, backgroundColor: Colors.surface, borderRadius: 4, overflow: 'hidden' },
    progressBarFill: { height: '100%', backgroundColor: Colors.secondary, borderRadius: 4 },
    downloadCountText: { fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, fontSize: 12, marginTop: 5, alignSelf: 'flex-end' },
    chapterRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: 10, marginBottom: 10 },
    chapterItem: { flex: 1, paddingVertical: 15, paddingLeft: 15 },
    chapterTitle: { fontFamily: 'Poppins_500Medium', color: Colors.text, fontSize: 16 },
    chapterDate: { fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, fontSize: 12, marginTop: 2 },
    downloadButton: { padding: 15 },
});

export default ComicDetailScreen;