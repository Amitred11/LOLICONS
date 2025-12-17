import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar, ActivityIndicator, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAlert } from '@context/other/AlertContext';
import { useComic } from '@context/main/ComicContext';
import { ComicService } from '@api/MockComicService';
import ReaderSettingsModal from './ReaderSettingsModal';
import ChapterListModal from './ChapterListModal';
// Import extracted components
import { ChapterEndFooter, MemoizedPage } from '../../components/ReaderComponents';

const Theme = {
    text: '#FFFFFF',
    accent: '#5EEAD4',
};

const ReaderScreen = ({ route }) => {
    const { comicId, chapterId = 1 } = route.params || {};
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const flatListRef = useRef(null);
    const { showToast } = useAlert();

    const { getDownloadedPages, updateHistory } = useComic();
    const [currentChapterId, setCurrentChapterId] = useState(chapterId);
    const [currentPage, setCurrentPage] = useState(0); 
    const currentPageRef = useRef(0); 

    const [comic, setComic] = useState(null);
    const [pages, setPages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const [isSettingsVisible, setIsSettingsVisible] = useState(false);
    const [isChapterListVisible, setIsChapterListVisible] = useState(false);
    const [controlsVisible, setControlsVisible] = useState(true);
    const fadeAnim = useRef(new Animated.Value(1)).current; 

    const [settings, setSettings] = useState({
        mode: 'webtoon', bg: '#121212', margin: 0, progressBar: 'left', preload: 'some',
        fitWidth: true, fitHeight: false, greyscale: false, dim: false, limitWidth: false
    });
    
    const totalPages = pages.length;

    const loadReaderData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const comicDetails = await ComicService.getComicDetails(comicId);
            let chapterPages = getDownloadedPages(comicId, currentChapterId);
            if (!chapterPages) chapterPages = await ComicService.getChapterPages(comicId, currentChapterId);
            setComic(comicDetails);
            setPages(chapterPages);
            if (comicDetails) {
                const chapter = comicDetails.chapters.find(ch => ch.id === currentChapterId.toString());
                if (chapter) updateHistory(comicId, chapter.title);
            }
        } catch (e) { setError("Failed to load chapter data."); } finally { setIsLoading(false); }
    }, [comicId, currentChapterId, getDownloadedPages, updateHistory]); 

    useEffect(() => { loadReaderData(); }, [loadReaderData]);
    useEffect(() => { currentPageRef.current = 0; setCurrentPage(0); if (flatListRef.current && pages.length > 0) flatListRef.current.scrollToOffset({ offset: 0, animated: false }); }, [pages]);

    const getCurrentChapterIndex = () => comic?.chapters ? comic.chapters.findIndex(c => c.id.toString() === currentChapterId.toString()) : -1;
    const handlePrevChapter = () => { const idx = getCurrentChapterIndex(); if (idx !== -1 && idx < comic.chapters.length - 1) setCurrentChapterId(comic.chapters[idx + 1].id); else showToast("No previous chapter", 'info'); };
    const handleNextChapter = () => { const idx = getCurrentChapterIndex(); if (idx > 0) setCurrentChapterId(comic.chapters[idx - 1].id); else showToast("No next chapter", 'info'); };
    const handlePrevPage = () => { if (flatListRef.current && pages.length > 0) flatListRef.current.scrollToIndex({ index: Math.max(0, pages.length - 2), animated: true }); };
    const handleHome = () => navigation.navigate("Main", { screen: "Comics", params: { screen: "Library" }});

    const toggleControls = useCallback(() => {
        Animated.timing(fadeAnim, { toValue: controlsVisible ? 0 : 1, duration: 200, useNativeDriver: true }).start();
        setControlsVisible(!controlsVisible);
    }, [controlsVisible, fadeAnim]);
    
    const hideControls = useCallback(() => { if (controlsVisible) { Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(); setControlsVisible(false); } }, [controlsVisible, fadeAnim]);

    const onScrollHandler = useCallback((event) => {
        let index;
        if (settings.mode === 'single') index = Math.round(event.nativeEvent.contentOffset.x / Dimensions.get('window').width);
        else index = Math.max(0, Math.floor(event.nativeEvent.contentOffset.y / (settings.fitHeight ? Dimensions.get('window').height : Dimensions.get('window').width * 1.4)));
        if (index !== currentPageRef.current && index < pages.length) { currentPageRef.current = index; setCurrentPage(index); }
    }, [settings.mode, settings.fitHeight, pages.length]);

    const keyExtractor = useCallback((item) => item.id, []);
    const renderPage = useCallback(({ item }) => <MemoizedPage item={item} settings={settings} onTab={toggleControls} />, [settings, toggleControls]);
    const ItemSeparator = useCallback(() => (settings.mode === 'webtoon' && settings.margin > 0 ? <View style={{ height: 10 }} /> : null), [settings.mode, settings.margin]);
    const handleChapterSelect = (newChapterId) => { if (newChapterId && newChapterId !== currentChapterId) { setCurrentChapterId(newChapterId); setIsChapterListVisible(false); } };

    if (isLoading) return <View style={[styles.container, styles.centerContent, { backgroundColor: settings.bg }]}><StatusBar hidden /><ActivityIndicator size="large" color={Theme.accent} /></View>;
    if (error) return <View style={[styles.container, styles.centerContent, { backgroundColor: settings.bg }]}><StatusBar hidden /><Text style={styles.errorText}>{error}</Text><TouchableOpacity style={styles.retryButton} onPress={loadReaderData}><Text style={styles.retryButtonText}>Retry</Text></TouchableOpacity></View>;

    const progressPercent = totalPages > 0 ? ((currentPage + 1) / totalPages) * 100 : 0;
    const currentChapObj = comic?.chapters?.find(c => c.id.toString() === currentChapterId.toString());

    return (
        <View style={[styles.container, { backgroundColor: settings.bg }]}>
            <StatusBar hidden />
            <FlatList
                ref={flatListRef}
                data={pages}
                key={settings.mode}
                horizontal={settings.mode === 'single'}
                pagingEnabled={settings.mode === 'single'}
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                scrollEventThrottle={16}
                onScroll={onScrollHandler}
                onScrollBeginDrag={hideControls}
                keyExtractor={keyExtractor}
                renderItem={renderPage}
                ItemSeparatorComponent={ItemSeparator}
                initialNumToRender={5}
                windowSize={7}
                ListFooterComponent={
                    <ChapterEndFooter 
                        comicTitle={comic?.title || "Unknown Title"}
                        chapterLabel={currentChapObj ? currentChapObj.title : `Chapter ${currentChapterId}`}
                        totalChapters={comic?.chapters?.length || 0}
                        coverUri={comic?.cover?.uri || comic?.image?.uri}
                        onPrevPage={handlePrevPage}
                        onPrevChapter={handlePrevChapter}
                        onNextChapter={handleNextChapter}
                        onHome={handleHome}
                    />
                }
                ListFooterComponentStyle={{ paddingBottom: 100 }}
            />

            <Animated.View style={[ styles.topOverlay, { top: 0, paddingTop: insets.top + 10, opacity: fadeAnim } ]} pointerEvents={controlsVisible ? 'auto' : 'none'}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}><Ionicons name="chevron-back" size={24} color={Theme.text} /><Text style={styles.headerTitle} numberOfLines={1}>{comic?.title || "Comic"}</Text></TouchableOpacity>
                <View style={styles.topRightInfo}><Text style={styles.pageCounter}>{currentPage + 1}/{totalPages || 1}</Text><TouchableOpacity style={styles.menuBtn} onPress={() => setIsChapterListVisible(true)}><MaterialCommunityIcons name="menu" size={24} color={Theme.text} /></TouchableOpacity></View>
            </Animated.View>

            <Animated.View style={[ styles.bottomControls, { bottom: insets.bottom + 20, opacity: fadeAnim } ]} pointerEvents={controlsVisible ? 'auto' : 'none'}>
                <View style={styles.floatBubble}><View style={styles.progressCircle}><MaterialCommunityIcons name="brain" size={20} color="#c084fc" /></View><View style={styles.percentPill}><Text style={styles.percentText}>{Math.round(progressPercent)}%</Text></View></View>
                <TouchableOpacity style={styles.settingsFab} onPress={() => setIsSettingsVisible(true)} activeOpacity={0.8}><Ionicons name="settings-sharp" size={24} color={Theme.accent} /></TouchableOpacity>
            </Animated.View>

            <Animated.View style={[ styles.bottomProgressBarContainer, { opacity: fadeAnim } ]}><View style={[styles.bottomProgressBarFill, { width: `${progressPercent}%` }]} /></Animated.View>

            <ReaderSettingsModal visible={isSettingsVisible} onClose={() => setIsSettingsVisible(false)} settings={settings} onUpdateSettings={setSettings} />
            <ChapterListModal visible={isChapterListVisible} onClose={() => setIsChapterListVisible(false)} comicTitle={comic?.title} chapters={comic?.chapters || []} currentChapterId={currentChapterId} onChapterSelect={handleChapterSelect} />        
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    centerContent: { justifyContent: 'center', alignItems: 'center', padding: 20 },
    errorText: { color: '#9CA3AF', fontSize: 16, textAlign: 'center', marginBottom: 20 },
    retryButton: { backgroundColor: Theme.accent, paddingVertical: 12, paddingHorizontal: 30, borderRadius: 8 },
    retryButtonText: { color: '#000', fontWeight: 'bold', fontSize: 16 },
    topOverlay: { position: 'absolute', left: 0, right: 0, zIndex: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, backgroundColor: 'rgba(0,0,0,0.6)', paddingBottom: 15 },
    backButton: { flexDirection: 'row', alignItems: 'center', maxWidth: '60%' },
    headerTitle: { color: Theme.text, fontSize: 16, fontWeight: '600', marginLeft: 8, textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 4 },
    topRightInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    pageCounter: { color: Theme.text, fontSize: 13, fontFamily: 'monospace', textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 4 },
    menuBtn: { padding: 4 },
    bottomControls: { position: 'absolute', left: 20, right: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', zIndex: 10, },
    floatBubble: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2A2A2E', borderRadius: 30, padding: 4, paddingRight: 12, borderWidth: 1, borderColor: '#333', shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 2, elevation: 4 },
    progressCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#1a1a1a', alignItems: 'center', justifyContent: 'center', marginRight: 8 },
    percentPill: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    percentText: { color: Theme.text, fontSize: 12, fontWeight: 'bold' },
    settingsFab: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#2A2A2E', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#333', shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 5, },
    bottomProgressBarContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, backgroundColor: 'rgba(255,255,255,0.1)', zIndex: 9 },
    bottomProgressBarFill: { height: '100%', backgroundColor: Theme.accent, },
});

export default ReaderScreen;