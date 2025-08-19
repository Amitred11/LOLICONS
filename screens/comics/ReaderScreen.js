// screens/comics/ReaderScreen.js

// Import essential modules from React, React Native, and third-party libraries.
import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, Dimensions, TouchableOpacity, StatusBar } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, runOnJS } from 'react-native-reanimated';
import Slider from '@react-native-community/slider';
import { comicsData, comicPagesData } from '../../constants/mockData';
// Import child modal components.
import ReaderSettingsModal from './components/ReaderSettingsModal';
import ChapterListModal from './components/ChapterListModal';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
// Import Gesture Handler for advanced tap detection.
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useDownloads } from '../../context/DownloadContext';
import { useNavigation } from '@react-navigation/native';
import { BlurView } from 'expo-blur';

// Get screen dimensions for layout calculations.
const { width, height } = Dimensions.get('window');

/**
 * The main screen for reading a comic chapter. It supports both horizontal (paginated)
 * and vertical (scroll) reading modes, lazy loading of pages, and interactive UI overlays.
 */
const ReaderScreen = ({ route }) => {
  // Get navigation parameters.
  const { comicId, chapterId } = route.params;
  const insets = useSafeAreaInsets();
  const flatListRef = useRef(null); // Ref to control the FlatList programmatically.
  const navigation = useNavigation();

  // --- CONTEXT HOOKS ---
  const { getDownloadedPages } = useDownloads();

  // --- STATE MANAGEMENT ---
  const [currentChapterId, setCurrentChapterId] = useState(chapterId);
  const [isUIVisible, setIsUIVisible] = useState(true); // Controls visibility of header/footer.
  const [currentPage, setCurrentPage] = useState(0); // Tracks the current page index in horizontal mode.
  const [isSettingsVisible, setIsSettingsVisible] = useState(false); // Controls the settings modal.
  const [isChapterListVisible, setIsChapterListVisible] = useState(false); // Controls the chapter list modal.
  const [settings, setSettings] = useState({ mode: 'horizontal', fit: 'contain' }); // Manages reader preferences.
  const [isLocked, setIsLocked] = useState(false); // Locks the UI, preventing taps from toggling overlays.

  // --- DERIVED/MEMOIZED VALUES ---
  // Memoize the comic data to avoid re-finding it on every render.
  const comic = useMemo(() => comicsData.find(c => c.id === comicId), [comicId]);
  
  // Memoize the page sources. This logic checks if downloaded pages exist first,
  // and falls back to online sources if they don't.
  const pages = useMemo(() => {
    const downloadedUris = getDownloadedPages(comicId, currentChapterId);
    if (downloadedUris && downloadedUris.length > 0) {
      return downloadedUris.map(uri => ({ source: { uri } })); // Use local URIs for offline reading.
    } else {
      const onlineSources = comicPagesData[comicId] || [];
      return onlineSources.map(source => ({ source })); // Use bundled assets.
    }
  }, [comicId, currentChapterId, getDownloadedPages]);

  // Memoize chapter-related calculations.
  const currentChapterIndex = useMemo(() => comic.chapters.findIndex(c => c.id === currentChapterId), [comic, currentChapterId]);
  const isFirstChapter = currentChapterIndex === 0;
  const isLastChapter = currentChapterIndex === comic.chapters.length - 1;

  // --- ANIMATIONS ---
  // Shared value to control the opacity of the UI overlays (header/footer).
  const uiOpacity = useSharedValue(1);
  const animatedUIStyle = useAnimatedStyle(() => ({ 
      opacity: uiOpacity.value, 
      pointerEvents: isUIVisible ? 'auto' : 'none' 
  }));
  // Shared value to control the opacity of the "Unlock" button.
  const unlockButtonOpacity = useSharedValue(0);
  const animatedUnlockButtonStyle = useAnimatedStyle(() => ({
    opacity: unlockButtonOpacity.value,
    pointerEvents: isLocked ? 'auto' : 'none',
  }));
  
  // Animate the unlock button in/out when the lock state changes.
  useEffect(() => {
    unlockButtonOpacity.value = withTiming(isLocked ? 1 : 0);
  }, [isLocked]);

  // --- CALLBACKS & HANDLERS ---
  // Memoized callbacks to prevent re-creation on each render.
  const closeSettings = useCallback(() => setIsSettingsVisible(false), []);
  const closeChapterList = useCallback(() => setIsChapterListVisible(false), []);

  // Toggles the visibility of the header and footer.
  const toggleUI = useCallback(() => {
    if (isLocked) return; // Do nothing if the UI is locked.
    setIsUIVisible(prev => {
      const newVisibility = !prev;
      uiOpacity.value = withTiming(newVisibility ? 1 : 0);
      // Automatically close any open modals when hiding the UI.
      if (!newVisibility) {
          closeSettings();
          closeChapterList();
      }
      return newVisibility;
    });
  }, [isLocked, uiOpacity, closeSettings, closeChapterList]);

  // Toggles the locked state of the UI.
  const toggleLock = () => {
    setIsLocked(current => {
      const newLockedState = !current;
      // If locking the UI, also ensure the overlays are hidden.
      if (newLockedState && isUIVisible) {
        setIsUIVisible(false);
        uiOpacity.value = withTiming(0);
      }
      return newLockedState;
    });
  };

  // Handlers for opening modals and changing settings.
  const openSettings = () => setIsSettingsVisible(true);
  const openChapterList = () => setIsChapterListVisible(true);
  const handleSettingChange = (key, value) => { setSettings(prev => ({ ...prev, [key]: value })); };
  
  // Programmatically navigates to a specific page (horizontal mode only).
  const goToPage = (index) => {
    if (index >= 0 && index < pages.length && settings.mode === 'horizontal') {
      flatListRef.current?.scrollToIndex({ index, animated: true });
    }
  };
  
  // Handles selecting a new chapter from the chapter list modal.
  const handleSelectChapter = (newChapterId) => {
    setCurrentChapterId(newChapterId);
    setCurrentPage(0);
    flatListRef.current?.scrollToOffset({ offset: 0, animated: false }); // Reset scroll position.
    closeChapterList();
  };

  // --- GESTURE DEFINITIONS ---
  // A simple tap gesture for vertical mode that toggles the UI.
  const tapGesture = Gesture.Tap().onEnd(() => {
    'worklet';
    runOnJS(toggleUI)();
  });

  // An advanced tap gesture for horizontal mode with distinct tap zones.
  const horizontalTapGesture = Gesture.Tap().onEnd((event) => {
    'worklet';
    const tapX = event.x;
    const zoneWidth = width / 4; // Left and right 25% of the screen are navigation zones.
    if (tapX < zoneWidth) {
      runOnJS(goToPage)(currentPage - 1); // Tap left to go to previous page.
    } else if (tapX > width - zoneWidth) {
      runOnJS(goToPage)(currentPage + 1); // Tap right to go to next page.
    } else {
      runOnJS(toggleUI)(); // Tap center to toggle UI.
    }
  });
  
  // Navigates to the next or previous chapter.
  const navigateChapter = (direction) => {
    const newChapterIndex = currentChapterIndex + direction;
    if (newChapterIndex >= 0 && newChapterIndex < comic.chapters.length) {
      const newChapter = comic.chapters[newChapterIndex];
      setCurrentChapterId(newChapter.id);
      setCurrentPage(0);
      flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
    }
  };
  
  // Updates the `currentPage` state based on scroll position in horizontal mode.
  const onScroll = (event) => {
    if (settings.mode === 'horizontal') {
      const newIndex = Math.round(event.nativeEvent.contentOffset.x / width);
      if (newIndex !== currentPage) setCurrentPage(newIndex);
    }
  };

  // Scrolls the FlatList when the user finishes sliding the page scrubber.
  const onSliderChange = (value) => {
    if (settings.mode === 'horizontal') {
      flatListRef.current?.scrollToIndex({ index: Math.floor(value), animated: false });
    }
  };
  
  // Define theme colors for overlays.
  const textColor = Colors.text;
  const overlayColor = '#1c1c1e';

  return (
    <View style={styles.container}>
      <StatusBar hidden={!isUIVisible} barStyle='light-content' animated />

      {/* The main content area, wrapped in a gesture detector to handle taps. */}
      <GestureDetector gesture={settings.mode === 'horizontal' ? horizontalTapGesture : tapGesture}>
        <Animated.FlatList
            ref={flatListRef}
            data={pages}
            key={settings.mode} // Changing the key forces a re-render, essential when switching between horizontal/vertical modes.
            keyExtractor={(item, index) => `${comicId}-${currentChapterId}-${index}`}
            renderItem={({ item }) => (
                <View style={[styles.pageContainer, settings.mode === 'vertical' && { height: 'auto'}]}>
                  <Image source={item.source} style={[styles.pageImage, settings.mode === 'vertical' && { width: width, height: undefined, aspectRatio: 3/4 }]} resizeMode={settings.fit} />
                </View>
            )}
            horizontal={settings.mode === 'horizontal'}
            pagingEnabled={settings.mode === 'horizontal'}
            onScroll={onScroll}
            scrollEventThrottle={16}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => settings.mode === 'vertical' ? <View style={{height: 10}} /> : null}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                  <Ionicons name="cloud-offline-outline" size={64} color={Colors.textSecondary} />
                  <Text style={styles.emptyText}>Chapter not downloaded</Text>
              </View>
            }
        />
      </GestureDetector>

      {/* Animated Header Overlay */}
      <Animated.View style={[styles.header, { height: insets.top + 60 }, animatedUIStyle]}>
        <LinearGradient colors={[`${overlayColor}`, `${overlayColor}e6`, 'transparent']} style={StyleSheet.absoluteFill} />
        <View style={[styles.headerContent, { paddingTop: insets.top }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}><Ionicons name="arrow-back-outline" size={28} color={textColor} /></TouchableOpacity>
          <TouchableOpacity onPress={openChapterList} style={{ alignItems: 'center' }}>
            <Text style={[styles.headerTitle, { color: textColor }]}>{comic.title}</Text>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text style={[styles.headerSubtitle, { color: textColor + 'aa' }]}>{comic.chapters.find(c => c.id === currentChapterId)?.title || `Chapter ${currentChapterId}`}</Text>
              <Ionicons name="chevron-down-outline" size={14} color={textColor + 'aa'} style={{marginLeft: 4}} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={openSettings} style={styles.headerButton}><Ionicons name="ellipsis-horizontal" size={24} color={textColor} /></TouchableOpacity>
        </View>
      </Animated.View>
      
      {/* Animated Footer Overlay */}
      <Animated.View style={[styles.footer, { height: insets.bottom + 80 }, animatedUIStyle]}>
        <LinearGradient colors={['transparent', `${overlayColor}e6`, `${overlayColor}`]} style={StyleSheet.absoluteFill} />
        <View style={[styles.footerContent, { paddingBottom: insets.bottom }]}>
          <TouchableOpacity onPress={() => navigateChapter(-1)} disabled={isFirstChapter} style={styles.footerButton}>
            <Ionicons name="chevron-back-outline" size={32} color={isFirstChapter ? textColor + '55' : textColor} />
          </TouchableOpacity>
          <View style={styles.sliderContainer}>
              <TouchableOpacity onPress={toggleLock} style={styles.lockButton}>
                <Ionicons name="lock-closed-outline" size={24} color={textColor} />
              </TouchableOpacity>
              <Slider
                  style={{ flex: 1, height: 40, opacity: settings.mode === 'horizontal' ? 1 : 0 }}
                  minimumValue={0}
                  maximumValue={pages.length > 1 ? pages.length - 1 : 0}
                  step={1}
                  value={currentPage}
                  onValueChange={(val) => setCurrentPage(Math.floor(val))}
                  onSlidingComplete={onSliderChange}
                  minimumTrackTintColor={Colors.secondary}
                  maximumTrackTintColor={textColor + '55'}
                  thumbTintColor={Colors.secondary}
              />
          </View>
          <TouchableOpacity onPress={() => navigateChapter(1)} disabled={isLastChapter} style={styles.footerButton}>
            <Ionicons name="chevron-forward-outline" size={32} color={isLastChapter ? textColor + '55' : textColor} />
          </TouchableOpacity>
        </View>
      </Animated.View>
      
      {/* The floating "Unlock" button, visible only when locked */}
      <Animated.View style={[styles.unlockButtonContainer, { bottom: insets.bottom + 20 }, animatedUnlockButtonStyle]}>
        <BlurView intensity={50} tint="dark" style={styles.blurView}>
            <TouchableOpacity onPress={toggleLock} style={styles.unlockButton}>
                <Ionicons name="lock-open-outline" size={26} color={Colors.text} />
            </TouchableOpacity>
        </BlurView>
      </Animated.View>
      
      {/* Conditionally render the modals */}
      {isSettingsVisible && <ReaderSettingsModal onClose={closeSettings} settings={settings} onSettingChange={handleSettingChange} />}
      {isChapterListVisible && <ChapterListModal onClose={closeChapterList} chapters={comic.chapters} currentChapterId={currentChapterId} onSelectChapter={handleSelectChapter} />}
    </View>
  );
};

// --- Stylesheet ---
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    header: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1 },
    headerContent: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 5 },
    headerButton: { padding: 10, zIndex: 1 },
    headerTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 16 },
    headerSubtitle: { fontFamily: 'Poppins_400Regular', fontSize: 12 },
    footer: { position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 1 },
    footerContent: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 5 },
    footerButton: { padding: 10, zIndex: 1 },
    pageContainer: { width, height, justifyContent: 'center' },
    pageImage: { width: '100%', height: '100%' },
    sliderContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', zIndex: 1, paddingHorizontal: 5 },
    lockButton: { padding: 8, height: 40, justifyContent: 'center' },
    emptyContainer: { width, height: height * 0.8, alignItems: 'center', justifyContent: 'center' },
    emptyText: { fontFamily: 'Poppins_600SemiBold', color: Colors.textSecondary, fontSize: 18, marginTop: 15, textAlign: 'center', paddingHorizontal: 20 },
    unlockButtonContainer: { position: 'absolute', right: 20, zIndex: 2 },
    blurView: { width: 56, height: 56, borderRadius: 28, overflow: 'hidden', justifyContent: 'center', alignItems: 'center' },
    unlockButton: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
});

export default ReaderScreen;