import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, ActivityIndicator, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar'; // Better than react-native StatusBar
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ComicService } from '@api/MockComicService';
import NovelSettingsModal from './NovelSettingsModal';
import NovelChapterListModal from './NovelChapterListModal';

const Theme = { accent: '#5EEAD4', text: '#FFFFFF' };

const NovelReaderScreen = ({ route, navigation }) => {
    const { comicId, chapterId = 1 } = route.params;
    const insets = useSafeAreaInsets();
    
    const [isLoading, setIsLoading] = useState(true);
    const [chapter, setChapter] = useState(null);
    const [comic, setComic] = useState(null);
    const [currentChapterId, setCurrentChapterId] = useState(chapterId);
    
    const [controlsVisible, setControlsVisible] = useState(true);
    const fadeAnim = useRef(new Animated.Value(1)).current;
    
    const [isSettingsVisible, setIsSettingsVisible] = useState(false);
    const [isChapterListVisible, setIsChapterListVisible] = useState(false);
    
    // Settings state
    const [settings, setSettings] = useState({
        bg: '#121212',
        fontSize: 18,
        lineHeightMultiplier: 1.6,
        fontFamily: 'Serif',
        margin: 20
    });

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                const comicData = await ComicService.getComicDetails(comicId);
                const chapterData = await ComicService.getNovelChapter(comicId, currentChapterId);
                setComic(comicData);
                setChapter(chapterData);
            } catch (err) { console.error(err); }
            finally { setIsLoading(false); }
        };
        loadData();
    }, [currentChapterId]);

    const toggleControls = () => {
        const toValue = controlsVisible ? 0 : 1;
        Animated.timing(fadeAnim, {
            toValue,
            duration: 250,
            useNativeDriver: true
        }).start();
        setControlsVisible(!controlsVisible);
    };

    const getFontFamily = () => {
        if (settings.fontFamily === 'Serif') return Platform.OS === 'ios' ? 'Georgia' : 'serif';
        if (settings.fontFamily === 'Monospace') return Platform.OS === 'ios' ? 'Courier' : 'monospace';
        return Platform.OS === 'ios' ? 'System' : 'sans-serif';
    };

    // Determine text color based on background
    const isLightBg = settings.bg === '#FFFFFF' || settings.bg === '#F4ECD8';
    const textColor = isLightBg ? '#1A1A1A' : '#E5E7EB';
    const statusBarStyle = isLightBg ? 'dark' : 'light';

    if (isLoading) return (
        <View style={[styles.container, styles.center, { backgroundColor: settings.bg }]}>
            <ActivityIndicator color={Theme.accent} size="large" />
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: settings.bg }]}>
            {/* Auto-switching Status Bar style */}
            <StatusBar style={statusBarStyle} hidden={!controlsVisible} />
            
            <ScrollView 
                contentContainerStyle={[styles.scrollContent, { paddingHorizontal: settings.margin }]}
                onScrollBeginDrag={() => { if(controlsVisible) toggleControls(); }}
                scrollEventThrottle={16}
            >
                <TouchableOpacity activeOpacity={1} onPress={toggleControls}>
                    <Text style={[styles.chapterTitle, { color: Theme.accent, marginTop: insets.top + 70 }]}>
                        {chapter?.title}
                    </Text>
                    
                    <Text style={[styles.novelText, { 
                        fontSize: settings.fontSize,
                        lineHeight: settings.fontSize * settings.lineHeightMultiplier,
                        fontFamily: getFontFamily(),
                        color: textColor
                    }]}>
                        {chapter?.content}
                    </Text>

                    <View style={styles.novelFooter}>
                        <View style={styles.divider} />
                        <Text style={[styles.endText, { color: isLightBg ? '#666' : '#999' }]}>End of Chapter</Text>
                        <TouchableOpacity 
                            style={styles.nextBtn}
                            onPress={() => setCurrentChapterId(prev => (parseInt(prev) + 1).toString())}
                        >
                            <Text style={styles.nextBtnText}>Next Chapter</Text>
                            <Ionicons name="arrow-forward" size={18} color="#000" />
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </ScrollView>

            {/* Top Bar */}
            <Animated.View 
                style={[styles.topOverlay, { paddingTop: insets.top + 10, opacity: fadeAnim }]} 
                pointerEvents={controlsVisible ? 'auto' : 'none'}
            >
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color="#fff" />
                    <Text style={styles.headerTitle} numberOfLines={1}>{comic?.title}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setIsChapterListVisible(true)}>
                    <MaterialCommunityIcons name="menu" size={26} color="#fff" />
                </TouchableOpacity>
            </Animated.View>

            {/* Bottom Floating Controls */}
            <Animated.View 
                style={[styles.bottomControls, { bottom: insets.bottom + 20, opacity: fadeAnim }]} 
                pointerEvents={controlsVisible ? 'auto' : 'none'}
            >
                <View style={styles.progressPill}>
                    <Text style={styles.progressText}>{chapter?.title}</Text>
                </View>
                <TouchableOpacity style={styles.fab} onPress={() => setIsSettingsVisible(true)}>
                    <Ionicons name="text-outline" size={24} color={Theme.accent} />
                </TouchableOpacity>
            </Animated.View>

            <NovelSettingsModal
                visible={isSettingsVisible} 
                onClose={() => setIsSettingsVisible(false)} 
                settings={settings} 
                onUpdateSettings={setSettings}
            />
            
            <NovelChapterListModal
                visible={isChapterListVisible} 
                onClose={() => setIsChapterListVisible(false)} 
                chapters={comic?.chapters}
                currentChapterId={currentChapterId}
                onChapterSelect={(id) => setCurrentChapterId(id)}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { justifyContent: 'center', alignItems: 'center' },
    scrollContent: { paddingBottom: 120 },
    chapterTitle: { fontSize: 26, fontWeight: '800', marginBottom: 30 },
    novelText: { letterSpacing: 0.2 },
    novelFooter: { marginTop: 60, alignItems: 'center', paddingBottom: 60 },
    divider: { width: 40, height: 3, backgroundColor: Theme.accent, borderRadius: 2, marginBottom: 15 },
    endText: { fontSize: 14, marginBottom: 25 },
    nextBtn: { backgroundColor: Theme.accent, flexDirection: 'row', paddingHorizontal: 28, paddingVertical: 14, borderRadius: 30, alignItems: 'center', gap: 10, elevation: 4 },
    nextBtnText: { color: '#000', fontWeight: 'bold', fontSize: 16 },
    topOverlay: { position: 'absolute', top: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.85)', flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 15, alignItems: 'center', zIndex: 10 },
    backButton: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 0.8 },
    headerTitle: { color: '#fff', fontSize: 16, fontWeight: '600' },
    bottomControls: { position: 'absolute', left: 20, right: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    progressPill: { backgroundColor: 'rgba(26,26,26,0.9)', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 25, borderWidth: 1, borderColor: '#333' },
    progressText: { color: '#fff', fontSize: 13, fontWeight: '600' },
    fab: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#1A1A1A', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#333', elevation: 8 }
});

export default NovelReaderScreen;