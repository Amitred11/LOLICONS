import React, { useState, useMemo, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, Dimensions, TouchableOpacity, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

// --- IMPORTS ---
import { comicsData, comicPagesData } from '../../../../constants/mockData'; 
import ReaderSettingsModal from './ReaderSettingsModal';
import ChapterListModal from './ChapterListModal'; 
import { Colors } from '../../../../constants/Colors'; 

const { width, height } = Dimensions.get('window');

// Theme Constants
const Theme = {
    darkBg: '#121212',
    text: '#FFFFFF',
    textDim: '#9CA3AF',
    accent: '#5EEAD4',
};

const ReaderScreen = ({ route }) => {
    // Default fallback if params are missing
    const { comicId, chapterId = 1 } = route.params || {}; 
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const flatListRef = useRef(null);

    // --- STATE ---
    const [currentChapterId, setCurrentChapterId] = useState(chapterId);
    const [currentPage, setCurrentPage] = useState(0);
    
    // Modal States
    const [isSettingsVisible, setIsSettingsVisible] = useState(false);
    const [isChapterListVisible, setIsChapterListVisible] = useState(false);
    
    // Reader Settings
    const [settings, setSettings] = useState({
        mode: 'webtoon', // 'webtoon' | 'single'
        bg: '#121212',
        margin: 0,
        progressBar: 'left',
        preload: 'some',
        fitWidth: true,
        fitHeight: false,
        greyscale: false,
        dim: false,
        limitWidth: false 
    });

    // --- DATA ---
    const comic = useMemo(() => comicsData.find(c => c.id === comicId), [comicId]);
    // Fallback to empty array if data missing
    const pages = useMemo(() => comicPagesData[comicId] || [], [comicId]);
    const totalPages = pages.length;

    // --- EFFECTS ---
    // Reset page to 0 when chapter changes
    useEffect(() => {
        setCurrentPage(0);
        if(flatListRef.current) {
            flatListRef.current.scrollToOffset({ offset: 0, animated: false });
        }
    }, [currentChapterId]);

    // --- SCROLL HANDLERS ---
    const handleScroll = (event) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        const pageHeight = width * 1.4; 
        const index = Math.floor(offsetY / pageHeight);
        if (index !== currentPage && index >= 0 && index < totalPages) {
            setCurrentPage(index);
        }
    };

    const handleHorizontalScroll = (event) => {
        const offsetX = event.nativeEvent.contentOffset.x;
        const index = Math.round(offsetX / width);
        setCurrentPage(index);
    };

    // --- HELPER: FLATLIST PROPS BASED ON SETTINGS ---
    const getPerformanceProps = () => {
        switch(settings.preload) {
            case 'all': return { initialNumToRender: 20, windowSize: 21, maxToRenderPerBatch: 20 };
            case 'none': return { initialNumToRender: 1, windowSize: 3, maxToRenderPerBatch: 1 };
            default: return { initialNumToRender: 3, windowSize: 5, maxToRenderPerBatch: 3 }; // 'some'
        }
    };

    const handleChapterChange = (direction) => {
        if(direction === 'next') setCurrentChapterId(prev => parseInt(prev) + 1);
        if(direction === 'prev' && currentChapterId > 1) setCurrentChapterId(prev => parseInt(prev) - 1);
    };

    return (
        <View style={[styles.container, { backgroundColor: settings.bg }]}>
            <StatusBar hidden />

            {/* --- TOP HEADER --- */}
            <View style={[styles.topOverlay, { top: insets.top + 10 }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color={Theme.text} />
                    <Text style={styles.headerTitle} numberOfLines={1}>{comic?.title || "Comic Reader"}</Text>
                </TouchableOpacity>

                <View style={styles.topRightInfo}>
                    <Text style={styles.pageCounter}>{currentPage + 1}/{totalPages || 1}</Text>
                    
                    <TouchableOpacity 
                        style={styles.menuBtn}
                        onPress={() => setIsChapterListVisible(true)}
                    >
                        <MaterialCommunityIcons name="message-text-outline" size={20} color={Theme.text} />
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.menuBtn} 
                        onPress={() => setIsChapterListVisible(true)}
                    >
                        <MaterialCommunityIcons name="menu" size={24} color={Theme.text} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* --- MAIN READER LIST --- */}
            <FlatList
                ref={flatListRef}
                data={pages}
                key={settings.mode} 
                keyExtractor={(item, index) => index.toString()}
                horizontal={settings.mode === 'single'}
                pagingEnabled={settings.mode === 'single'}
                showsVerticalScrollIndicator={settings.progressBar !== 'none'}
                showsHorizontalScrollIndicator={false}
                onScroll={settings.mode === 'single' ? handleHorizontalScroll : handleScroll}
                scrollEventThrottle={16}
                {...getPerformanceProps()} // Apply preload settings
                
                contentContainerStyle={{ 
                    paddingVertical: settings.mode === 'webtoon' ? settings.margin : 0,
                    alignItems: 'center' // centers limited width images
                }}
                ItemSeparatorComponent={() => 
                    settings.mode === 'webtoon' && settings.margin > 0 ? <View style={{height: 10}} /> : null
                }
                
                renderItem={({ item }) => {
                    // Logic for image sizing
                    const isSingle = settings.mode === 'single';
                    const imgHeight = isSingle ? height : (settings.fitHeight ? height : width * 1.4);
                    const resizeMode = isSingle ? 'contain' : (settings.fitWidth ? 'cover' : 'contain');
                    const imgWidth = settings.limitWidth ? width * 0.9 : width;

                    return (
                        <View style={[
                            styles.pageContainer, 
                            isSingle ? { width: width, height: height } : { width: imgWidth, height: imgHeight }
                        ]}>
                            <Image 
                                source={item} 
                                style={[
                                    styles.pageImage, 
                                    { resizeMode: resizeMode },
                                    settings.greyscale && { tintColor: 'gray' },
                                    settings.dim && { opacity: 0.6 }
                                ]} 
                            />
                        </View>
                    );
                }}
            />

            {/* --- BOTTOM FLOATING CONTROLS --- */}
            <View style={[styles.bottomControls, { bottom: insets.bottom + 20 }]}>
                <View style={styles.floatBubble}>
                    <View style={styles.progressCircle}>
                        <MaterialCommunityIcons name="brain" size={20} color="#c084fc" />
                    </View>
                    <View style={styles.percentPill}>
                         <Text style={styles.percentText}>{totalPages > 0 ? Math.round(((currentPage + 1) / totalPages) * 100) : 0}%</Text>
                    </View>
                </View>

                <TouchableOpacity 
                    style={styles.settingsFab} 
                    onPress={() => setIsSettingsVisible(true)}
                    activeOpacity={0.8}
                >
                    <Ionicons name="settings-sharp" size={24} color={Theme.accent} />
                </TouchableOpacity>
            </View>

            {/* --- MODALS --- */}
            
            <ReaderSettingsModal 
                visible={isSettingsVisible} 
                onClose={() => setIsSettingsVisible(false)}
                settings={settings}
                onUpdate={setSettings}
            />

            <ChapterListModal 
                visible={isChapterListVisible}
                onClose={() => setIsChapterListVisible(false)}
                comicTitle={comic?.title}
                currentChapter={currentChapterId}
                onChapterChange={handleChapterChange} // Passed function
            />

        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    topOverlay: {
        position: 'absolute', left: 0, right: 0, zIndex: 10,
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: 16,
    },
    backButton: { flexDirection: 'row', alignItems: 'center', maxWidth: '60%', paddingVertical: 8 },
    headerTitle: { color: Theme.textDim, fontSize: 14, fontWeight: '600', marginLeft: 4, textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 4 },
    topRightInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    pageCounter: { color: Theme.textDim, fontSize: 13, fontFamily: 'monospace', textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 4 },
    menuBtn: { padding: 4, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 20 },
    pageContainer: { justifyContent: 'center', alignItems: 'center', backgroundColor: 'transparent', overflow: 'hidden' },
    pageImage: { width: '100%', height: '100%' },
    bottomControls: {
        position: 'absolute', left: 20, right: 20,
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
        zIndex: 10,
    },
    floatBubble: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#2A2A2E', borderRadius: 30, padding: 4, paddingRight: 12,
        borderWidth: 1, borderColor: '#333',
    },
    progressCircle: {
        width: 36, height: 36, borderRadius: 18, backgroundColor: '#1a1a1a',
        alignItems: 'center', justifyContent: 'center', marginRight: 8,
    },
    percentPill: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    percentText: { color: Theme.text, fontSize: 12, fontWeight: 'bold' },
    settingsFab: {
        width: 48, height: 48, borderRadius: 24,
        backgroundColor: '#2A2A2E',
        alignItems: 'center', justifyContent: 'center',
        borderWidth: 1, borderColor: '#333',
        shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3, shadowRadius: 4, elevation: 5,
    },
});

export default ReaderScreen;