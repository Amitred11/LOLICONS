import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, ActivityIndicator, Share } from 'react-native';
import { Colors } from '@config/Colors';
import { ComicService } from '@api/MockComicService';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useComic } from '@context/main/ComicContext';
import { useModal } from '@context/other/ModalContext';
import { useAlert } from '@context/other/AlertContext';
import Animated, { useSharedValue, useAnimatedScrollHandler } from 'react-native-reanimated';

// Import extracted components
import { DetailHeader, HeroSection, ComicInfo, ActionButtons, SynopsisBlock, ChapterList } from '../../components/DetailComponents';

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

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
    isFavorite, toggleFavorite, updateHistory, 
    downloadChapters, deleteChapter, getChapterStatus,
    getDownloadedCoverUri, rateComic, getUserRating
  } = useComic();

  const isComicInLibrary = isInLibrary(comicId);
  const isComicFavorite = isFavorite(comicId);
  const userRating = getUserRating(comicId);

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

  const sortedChapters = useMemo(() => {
    if (!comic?.chapters) return [];
    return [...comic.chapters].sort((a,b) => chapterSortOrder === 'asc' ? parseInt(a.id) - parseInt(b.id) : parseInt(b.id) - parseInt(a.id));
  }, [comic?.chapters, chapterSortOrder]);

  const imageSource = useMemo(() => {
    const coverUri = getDownloadedCoverUri(comic?.id);
    return coverUri ? { uri: coverUri } : (comic?.cover || comic?.image);
  }, [comic, getDownloadedCoverUri]);

  const handleReadPress = useCallback((chapter) => { 
    const chapterToRead = chapter || sortedChapters[0];
    
    if (chapterToRead && comic) { 
        // 1. Log to history (works for both comics and novels)
        updateHistory(comic.id, chapterToRead.title);
        
        // 2. Determine which screen to go to based on the isNovel flag
        const targetRoute = comic.isNovel ? 'NovelReader' : 'Reader';
        
        // 3. Navigate with the same params
        navigation.navigate(targetRoute, { 
            comicId: comic.id, 
            chapterId: chapterToRead.id 
        }); 
    } 
  }, [comic, sortedChapters, navigation, updateHistory]);

  const showRatingModal = useCallback(() => {
    if (!comic) return;
    modal.show('rating', {
        comicId: comic.id,
        currentRating: userRating,
        onRate: (newRating) => { rateComic(comic.id, newRating); modal.hide(); }
    });
  }, [comic, modal, userRating, rateComic]);

  const handleSingleChapterDownload = useCallback(async (chapterId) => {
    const { status } = getChapterStatus(comic.id, chapterId);
    if (status === 'downloaded') deleteChapter(comic.id, chapterId);
    else if (status === 'none') {
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
        { label: 'Share', icon: 'share-social-outline', onPress: async () => { try { await Share.share({ message: `Check out this comic: ${comic.title}!` }); } catch (e) { showToast(e.message, "error"); } }},
        { label: 'Report', icon: 'alert-circle-outline', isDestructive: true, onPress: () => showToast('Thank you for your feedback.', 'success') },
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
  
  if (loading) return <View style={styles.centeredContainer}><ActivityIndicator size="large" color={Colors.secondary} /></View>;
  if (!comic) return <View style={styles.centeredContainer}><Text style={styles.errorText}>Comic not found!</Text><TouchableOpacity onPress={() => navigation.goBack()} style={{marginTop: 20}}><Text style={{color: Colors.secondary}}>Go Back</Text></TouchableOpacity></View>;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <DetailHeader scrollY={scrollY} insets={insets} comicTitle={comic.title} onBack={() => navigation.goBack()} onMore={showMoreOptions} />
      
      <AnimatedScrollView onScroll={scrollHandler} scrollEventThrottle={16} contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}>
        <HeroSection imageSource={imageSource} scrollY={scrollY} />
        
        <View style={{ paddingHorizontal: 20 }}>
            <ComicInfo comic={comic} imageSource={imageSource} userRating={userRating} onRatePress={showRatingModal} />
            <ActionButtons 
                onRead={() => handleReadPress(sortedChapters[sortedChapters.length - 1])}
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

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    centeredContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
    errorText: { fontFamily: 'Poppins_600SemiBold', color: Colors.text, fontSize: 24, textAlign: 'center' },
    detailsContainer: { paddingHorizontal: 20, marginTop: 25 },
});

export default ComicDetailScreen;