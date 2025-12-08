// ReaderScreen.js

import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import { 
    View, Text, StyleSheet, FlatList, Image, Dimensions, 
    TouchableOpacity, StatusBar, ActivityIndicator, Animated, Pressable 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAlert } from '@context/other/AlertContext';
import { useComic } from '@context/main/ComicContext';
import { ComicService } from '@api/MockComicService';
import ReaderSettingsModal from './ReaderSettingsModal';
import ChapterListModal from './ChapterListModal';

const { width, height } = Dimensions.get('window');

const Theme = {
    darkBg: '#121212',
    text: '#FFFFFF',
    textDim: '#9CA3AF',
    accent: '#5EEAD4',
    cardBg: '#1E2228', 
    btnBg: '#2A2E35'
};

// --- COMPONENT: End of Chapter Card ---
const ChapterEndFooter = ({ 
    comicTitle, 
    chapterLabel, 
    totalChapters, 
    coverUri, // <--- New Prop
    onPrevPage, 
    onPrevChapter, 
    onNextChapter, 
    onHome 
}) => {
    return (
        <View style={styles.footerContainer}>
            {/* Top Section */}
            <View style={styles.footerTopRow}>
                {/* Prev Page Button with Image Background */}
                <TouchableOpacity style={styles.navSquareBtn} onPress={onPrevPage} activeOpacity={0.7}>
                    {coverUri && (
                        <Image source={{ uri: coverUri }} style={styles.navSquareImage} />
                    )}
                    <View style={styles.navSquareOverlay} />
                </TouchableOpacity>

                {/* Center Info */}
                <View style={styles.footerInfo}>
                    <Text style={styles.footerTitle} numberOfLines={3}>{comicTitle}</Text>
                    <Text style={styles.footerChapterInfo}>
                        {chapterLabel} / {totalChapters || '?'}
                    </Text>
                    
                    <View style={styles.footerActions}>
                        <View style={styles.likeBtn}>
                            <Text style={styles.likeCount}>1</Text>
                            <Ionicons name="thumbs-up" size={18} color="#FFF" />
                        </View>
                        <TouchableOpacity style={styles.homeBtn} onPress={onHome}>
                            <Ionicons name="home" size={20} color="#FFF" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* Bottom Section */}
            <View style={styles.footerBottomRow}>
                <TouchableOpacity style={styles.splitBtn} onPress={onPrevChapter} activeOpacity={0.7}>
                    <Ionicons name="chevron-back" size={20} color={Theme.textDim} />
                    <Text style={[styles.splitBtnText, { color: Theme.textDim }]}>PREV</Text>
                </TouchableOpacity>
                
                <View style={styles.splitSeparator} />
                
                <TouchableOpacity style={styles.splitBtn} onPress={onNextChapter} activeOpacity={0.7}>
                    <Text style={[styles.splitBtnText, { color: '#FFF' }]}>NEXT</Text>
                    <Ionicons name="chevron-forward" size={20} color="#FFF" />
                </TouchableOpacity>
            </View>
        </View>
    );
};

// Memoized component for each page.
const MemoizedPage = memo(({ item, settings, onTab }) => {
    const isSingle = settings.mode === 'single';
    const imgHeight = isSingle ? height : (settings.fitHeight ? height : width * 1.4);
    const resizeMode = isSingle ? 'contain' : (settings.fitWidth ? 'cover' : 'contain');
    const imgWidth = settings.limitWidth ? width * 0.9 : width;
    const imageStyle = { opacity: settings.dim ? 0.7 : 1.0 };

    return (
        <Pressable 
            onPress={onTab}
            style={[ styles.pageContainer, isSingle ? { width, height } : { alignSelf: 'center', width: imgWidth, height: imgHeight } ]}
        >
            <Image source={{ uri: item.uri }} style={[ styles.pageImage, { resizeMode }, imageStyle ]} />
        </Pressable>
    );
});

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
            if (!chapterPages) {
                chapterPages = await ComicService.getChapterPages(comicId, currentChapterId);
            }

            setComic(comicDetails);
            setPages(chapterPages);

            if (comicDetails) {
                const chapter = comicDetails.chapters.find(ch => ch.id === currentChapterId.toString());
                if (chapter) {
                    updateHistory(comicId, chapter.title);
                }
            }
        } catch (e) {
            setError("Failed to load chapter data. Please try again.");
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }, [comicId, currentChapterId, getDownloadedPages, updateHistory]); 

    useEffect(() => { loadReaderData(); }, [loadReaderData]);

    useEffect(() => {
        currentPageRef.current = 0;
        setCurrentPage(0);
        if (flatListRef.current && pages.length > 0) {
            flatListRef.current.scrollToOffset({ offset: 0, animated: false });
        }
    }, [pages]);

    const getCurrentChapterIndex = () => {
        if (!comic || !comic.chapters) return -1;
        return comic.chapters.findIndex(c => c.id.toString() === currentChapterId.toString());
    };

    const handlePrevChapter = () => {
        const idx = getCurrentChapterIndex();
        if (idx !== -1 && idx < comic.chapters.length - 1) {
            const prevChap = comic.chapters[idx + 1];
            setCurrentChapterId(prevChap.id);
        } else {
            showToast("No previous chapter", 'info');
        }
    };

    const handleNextChapter = () => {
        const idx = getCurrentChapterIndex();
        if (idx > 0) {
            const nextChap = comic.chapters[idx - 1];
            setCurrentChapterId(nextChap.id);
        } else {
            showToast("No next chapter", 'info');
        }
    };

    const handlePrevPage = () => {
        if (flatListRef.current && pages.length > 0) {
            const target = Math.max(0, pages.length - 2); 
            flatListRef.current.scrollToIndex({ index: target, animated: true });
        }
    };

    const handleHome = () => {
        navigation.navigate("Main", { screen: "Comics", params: { screen: "Library" }});
    };

    const toggleControls = useCallback(() => {
        const toValue = controlsVisible ? 0 : 1;
        Animated.timing(fadeAnim, {
            toValue,
            duration: 200,
            useNativeDriver: true,
        }).start();
        setControlsVisible(!controlsVisible);
    }, [controlsVisible, fadeAnim]);

    const hideControls = useCallback(() => {
        if (controlsVisible) {
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }).start();
            setControlsVisible(false);
        }
    }, [controlsVisible, fadeAnim]);

    const onScrollHandler = useCallback((event) => {
        let index;
        if (settings.mode === 'single') {
            const offsetX = event.nativeEvent.contentOffset.x;
            index = Math.round(offsetX / width);
        } else {
            const offsetY = event.nativeEvent.contentOffset.y;
            const pageHeight = settings.fitHeight ? height : width * 1.4;
            index = Math.max(0, Math.floor(offsetY / pageHeight));
        }

        if (index !== currentPageRef.current && index < pages.length) {
            currentPageRef.current = index;
            setCurrentPage(index);
        }
    }, [settings.mode, settings.fitHeight, pages.length]);

    const keyExtractor = useCallback((item) => item.id, []);
    
    const renderPage = useCallback(({ item }) => (
        <MemoizedPage item={item} settings={settings} onTab={toggleControls} />
    ), [settings, toggleControls]);
    
    const ItemSeparator = useCallback(() => (settings.mode === 'webtoon' && settings.margin > 0 ? <View style={{ height: 10 }} /> : null), [settings.mode, settings.margin]);
    
    const handleChapterSelect = (newChapterId) => { 
        if (newChapterId && newChapterId !== currentChapterId) { 
            setCurrentChapterId(newChapterId); 
            setIsChapterListVisible(false); 
        } 
    };

    if (isLoading) return <View style={[styles.container, styles.centerContent, { backgroundColor: settings.bg }]}><StatusBar hidden /><ActivityIndicator size="large" color={Theme.accent} /></View>;
    if (error) return <View style={[styles.container, styles.centerContent, { backgroundColor: settings.bg }]}><StatusBar hidden /><Text style={styles.errorText}>{error}</Text><TouchableOpacity style={styles.retryButton} onPress={loadReaderData}><Text style={styles.retryButtonText}>Retry</Text></TouchableOpacity></View>;

    const progressPercent = totalPages > 0 ? ((currentPage + 1) / totalPages) * 100 : 0;
    const currentChapObj = comic?.chapters?.find(c => c.id.toString() === currentChapterId.toString());
    const chapterLabel = currentChapObj ? currentChapObj.title : `Chapter ${currentChapterId}`;

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
                maxToRenderPerBatch={5}
                ListFooterComponent={
                    <ChapterEndFooter 
                        comicTitle={comic?.title || "Unknown Title"}
                        chapterLabel={chapterLabel}
                        totalChapters={comic?.chapters?.length || 0}
                        coverUri={comic?.cover?.uri || comic?.image?.uri} // Pass Cover URI here
                        onPrevPage={handlePrevPage}
                        onPrevChapter={handlePrevChapter}
                        onNextChapter={handleNextChapter}
                        onHome={handleHome}
                    />
                }
                ListFooterComponentStyle={{ paddingBottom: 100 }}
            />

            <Animated.View style={[ styles.topOverlay, { top: 0, paddingTop: insets.top + 10, opacity: fadeAnim } ]} pointerEvents={controlsVisible ? 'auto' : 'none'}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color={Theme.text} />
                    <Text style={styles.headerTitle} numberOfLines={1}>{comic?.title || "Comic"}</Text>
                </TouchableOpacity>
                <View style={styles.topRightInfo}>
                    <Text style={styles.pageCounter}>{currentPage + 1}/{totalPages || 1}</Text>
                    <TouchableOpacity style={styles.menuBtn} onPress={() => setIsChapterListVisible(true)}>
                        <MaterialCommunityIcons name="menu" size={24} color={Theme.text} />
                    </TouchableOpacity>
                </View>
            </Animated.View>

            <Animated.View style={[ styles.bottomControls, { bottom: insets.bottom + 20, opacity: fadeAnim } ]} pointerEvents={controlsVisible ? 'auto' : 'none'}>
                <View style={styles.floatBubble}>
                    <View style={styles.progressCircle}><MaterialCommunityIcons name="brain" size={20} color="#c084fc" /></View>
                    <View style={styles.percentPill}><Text style={styles.percentText}>{Math.round(progressPercent)}%</Text></View>
                </View>
                <TouchableOpacity style={styles.settingsFab} onPress={() => setIsSettingsVisible(true)} activeOpacity={0.8}>
                    <Ionicons name="settings-sharp" size={24} color={Theme.accent} />
                </TouchableOpacity>
            </Animated.View>

            <Animated.View style={[ styles.bottomProgressBarContainer, { opacity: fadeAnim } ]}>
                <View style={[styles.bottomProgressBarFill, { width: `${progressPercent}%` }]} />
            </Animated.View>

            <ReaderSettingsModal visible={isSettingsVisible} onClose={() => setIsSettingsVisible(false)} settings={settings} onUpdateSettings={setSettings} />
            <ChapterListModal visible={isChapterListVisible} onClose={() => setIsChapterListVisible(false)} comicTitle={comic?.title} chapters={comic?.chapters || []} currentChapterId={currentChapterId} onChapterSelect={handleChapterSelect} />        
        </View>
    );
};

// Styles
const styles = StyleSheet.create({
    container: { flex: 1 },
    centerContent: { justifyContent: 'center', alignItems: 'center', padding: 20 },
    errorText: { color: Theme.textDim, fontSize: 16, textAlign: 'center', marginBottom: 20 },
    retryButton: { backgroundColor: Theme.accent, paddingVertical: 12, paddingHorizontal: 30, borderRadius: 8 },
    retryButtonText: { color: '#000', fontWeight: 'bold', fontSize: 16 },
    
    // Top Overlay
    topOverlay: { position: 'absolute', left: 0, right: 0, zIndex: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, backgroundColor: 'rgba(0,0,0,0.6)', paddingBottom: 15 },
    backButton: { flexDirection: 'row', alignItems: 'center', maxWidth: '60%' },
    headerTitle: { color: Theme.text, fontSize: 16, fontWeight: '600', marginLeft: 8, textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 4 },
    topRightInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    pageCounter: { color: Theme.text, fontSize: 13, fontFamily: 'monospace', textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 4 },
    menuBtn: { padding: 4 },
    
    // Page
    pageContainer: { justifyContent: 'center', alignItems: 'center', backgroundColor: 'transparent', overflow: 'hidden' },
    pageImage: { width: '100%', height: '100%' },
    
    // Bottom Controls
    bottomControls: { position: 'absolute', left: 20, right: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', zIndex: 10, },
    floatBubble: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2A2A2E', borderRadius: 30, padding: 4, paddingRight: 12, borderWidth: 1, borderColor: '#333', shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 2, elevation: 4 },
    progressCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#1a1a1a', alignItems: 'center', justifyContent: 'center', marginRight: 8 },
    percentPill: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    percentText: { color: Theme.text, fontSize: 12, fontWeight: 'bold' },
    settingsFab: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#2A2A2E', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#333', shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 5, },
    bottomProgressBarContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, backgroundColor: 'rgba(255,255,255,0.1)', zIndex: 9 },
    bottomProgressBarFill: { height: '100%', backgroundColor: Theme.accent, },

    // Footer Styles
    footerContainer: {
        width: '94%',
        alignSelf: 'center',
        backgroundColor: Theme.cardBg,
        borderRadius: 12,
        marginTop: 40, 
        marginBottom: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#333'
    },
    footerTopRow: {
        flexDirection: 'row',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#2A2E35'
    },
    navSquareBtn: {
        width: 80,
        height: 80,
        borderRadius: 8,
        marginRight: 16,
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: Theme.btnBg // Fallback
    },
    navSquareImage: {
        width: '100%',
        height: '100%',
        position: 'absolute'
    },
    footerInfo: {
        flex: 1,
        justifyContent: 'center'
    },
    footerTitle: {
        color: Theme.text,
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 4,
        lineHeight: 20
    },
    footerChapterInfo: {
        color: Theme.textDim,
        fontSize: 12,
        marginBottom: 8
    },
    footerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 12
    },
    likeBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6
    },
    likeCount: {
        color: Theme.text,
        fontWeight: 'bold',
        fontSize: 12
    },
    homeBtn: {
        backgroundColor: Theme.btnBg,
        padding: 8,
        borderRadius: 8
    },
    footerBottomRow: {
        flexDirection: 'row',
        height: 60,
        alignItems: 'center'
    },
    splitBtn: {
        flex: 1,
        height: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: Theme.cardBg
    },
    splitBtnText: {
        fontWeight: 'bold',
        fontSize: 16,
        letterSpacing: 1
    },
    splitSeparator: {
        width: 1,
        height: '40%',
        backgroundColor: Theme.accent
    }
});

export default ReaderScreen;