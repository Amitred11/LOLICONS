import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, StatusBar, ActivityIndicator, Pressable, Platform } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Slider from '@react-native-community/slider';
import * as ScreenOrientation from 'expo-screen-orientation'; // Make sure to install this
import { Colors } from '../../../constants/Colors';

const VideoPlayerScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const insets = useSafeAreaInsets();
    
    // Params
    const { mode, media } = route.params || { mode: 'alone', media: { title: 'Unknown Title' } };

    // States
    const [isPlaying, setIsPlaying] = useState(true);
    const [progress, setProgress] = useState(0.3); // Mock progress 30%
    const [showControls, setShowControls] = useState(true);
    const [isLocked, setIsLocked] = useState(false); // New: Lock Screen State
    const [isLandscape, setIsLandscape] = useState(false); // New: Orientation State
    const [isCCEnabled, setIsCCEnabled] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    
    // Double Tap Logic Refs
    const lastTapTime = useRef(0);
    const controlTimeout = useRef(null);

    // Initial Load Simulation
    useEffect(() => {
        const loadTimer = setTimeout(() => setIsLoading(false), 1000);
        return () => clearTimeout(loadTimer);
    }, []);

    // Cleanup Orientation on Exit
    useEffect(() => {
        return () => {
            ScreenOrientation.unlockAsync(); // Reset when leaving
        };
    }, []);

    // Auto-hide controls timer
    useEffect(() => {
        resetControlTimeout();
        return () => clearTimeout(controlTimeout.current);
    }, [showControls, isPlaying]);

    const resetControlTimeout = () => {
        if (controlTimeout.current) clearTimeout(controlTimeout.current);
        if (showControls && isPlaying && !isLocked) {
            controlTimeout.current = setTimeout(() => {
                setShowControls(false);
            }, 5000); // Increased to 5 seconds for better UX
        }
    };

    // --- HANDLERS ---

    const handleScreenTap = () => {
        if (isLocked) {
            // If locked, only show the controls briefly to allow unlocking
            setShowControls(true);
            setTimeout(() => setShowControls(false), 2000);
            return;
        }
        
        setShowControls(!showControls);
        resetControlTimeout();
    };

    // Handle Landscape/Portrait Toggle
    const toggleOrientation = async () => {
        if (isLandscape) {
            await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
            setIsLandscape(false);
        } else {
            await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
            setIsLandscape(true);
        }
    };

    // Mock Double Tap to Seek
    const handleDoubleTap = (direction) => {
        const now = Date.now();
        const DOUBLE_TAP_DELAY = 300;
        
        if (now - lastTapTime.current < DOUBLE_TAP_DELAY) {
            // Double tap detected
            if (direction === 'left') console.log('Rewind 10s');
            if (direction === 'right') console.log('Forward 10s');
            // Show feedback animation (optional, logic omitted for brevity)
        } else {
            // Single tap: toggle controls
            handleScreenTap();
        }
        lastTapTime.current = now;
    };

    return (
        <View style={styles.container}>
            <StatusBar hidden={isLandscape} barStyle="light-content" />

            {/* --- VIDEO SURFACE (Interactive Background) --- */}
            <Pressable 
                style={styles.videoSurface} 
                onPress={() => handleScreenTap()}
            >
                {/* Simulated Video Content */}
                {isLoading ? (
                    <ActivityIndicator size="large" color={Colors.primary} />
                ) : (
                    <>
                        {/* Invisible touch zones for double-tap seeking */}
                        {!isLocked && (
                            <View style={styles.gestureContainer}>
                                <Pressable style={styles.gestureZone} onPress={() => handleDoubleTap('left')} />
                                <Pressable style={styles.gestureZone} onPress={() => handleDoubleTap('right')} />
                            </View>
                        )}
                        
                        {/* CC Overlay */}
                        {isCCEnabled && (
                            <View style={[styles.ccContainer, isLandscape && { bottom: 80 }]}>
                                <Text style={styles.ccText}>[Dramatic music swells...]</Text>
                            </View>
                        )}
                    </>
                )}
            </Pressable>

            {/* --- LOCKED STATE OVERLAY --- */}
            {showControls && isLocked && (
                <View style={[styles.overlay, { justifyContent: 'center', alignItems: 'center' }]}>
                    <TouchableOpacity 
                        style={styles.lockButtonBig} 
                        onPress={() => setIsLocked(false)}
                    >
                        <Ionicons name="lock-closed" size={32} color={Colors.darkBackground} />
                        <Text style={styles.unlockText}>Unlock</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* --- CONTROLS OVERLAY (Unlocked) --- */}
            {showControls && !isLocked && (
                <View style={[styles.overlay, { paddingTop: isLandscape ? 20 : insets.top, paddingBottom: isLandscape ? 20 : insets.bottom + 10 }]}>
                    
                    {/* Top Bar */}
                    <View style={styles.topBar}>
                        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={20}>
                            <Ionicons name="chevron-down" size={32} color="#fff" />
                        </TouchableOpacity>
                        
                        <View style={styles.mediaInfo}>
                            <Text style={styles.mediaTitle} numberOfLines={1}>{media.title}</Text>
                        </View>

                        <View style={styles.topRightControls}>
                            <TouchableOpacity onPress={toggleOrientation} style={styles.topIcon} hitSlop={10}>
                                <MaterialIcons name={isLandscape ? "screen-lock-portrait" : "screen-rotation"} size={24} color="#fff" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.topIcon} hitSlop={10}>
                                <Ionicons name="settings-outline" size={24} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Center Play/Pause */}
                    <View style={styles.centerControls}>
                        <TouchableOpacity style={styles.skipBtn} onPress={() => console.log('rewind')}>
                            <Ionicons name="play-back" size={30} color="#fff" />
                            <Text style={styles.skipText}>10s</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={styles.playPauseBtn} 
                            onPress={() => {
                                setIsPlaying(!isPlaying);
                                resetControlTimeout();
                            }}
                            activeOpacity={0.8}
                        >
                            <Ionicons name={isPlaying ? "pause" : "play"} size={42} color="#000" style={{ marginLeft: isPlaying ? 0 : 4 }} />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.skipBtn} onPress={() => console.log('forward')}>
                            <Ionicons name="play-forward" size={30} color="#fff" />
                            <Text style={styles.skipText}>10s</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Bottom Controls */}
                    <View style={styles.bottomControls}>
                        <View style={styles.sliderContainer}>
                            <Text style={styles.timeText}>12:30</Text>
                            <Slider
                                style={{ flex: 1, marginHorizontal: 12, height: 40 }}
                                minimumValue={0}
                                maximumValue={1}
                                value={progress}
                                onValueChange={(val) => {
                                    setProgress(val);
                                    resetControlTimeout();
                                }}
                                minimumTrackTintColor={Colors.primary}
                                maximumTrackTintColor="rgba(255,255,255,0.3)"
                                thumbTintColor={Colors.primary}
                            />
                            <Text style={styles.timeText}>45:00</Text>
                        </View>

                        <View style={styles.actionRow}>
                            <TouchableOpacity 
                                style={styles.iconButton}
                                onPress={() => setIsLocked(true)}
                            >
                                <Ionicons name="lock-open-outline" size={24} color="#fff" />
                                <Text style={styles.iconLabel}>Lock</Text>
                            </TouchableOpacity>

                            <TouchableOpacity 
                                style={styles.iconButton}
                                onPress={() => setIsCCEnabled(!isCCEnabled)}
                            >
                                <MaterialIcons name="closed-caption" size={24} color={isCCEnabled ? Colors.primary : "#fff"} />
                                <Text style={[styles.iconLabel, isCCEnabled && { color: Colors.primary }]}>Audio & CC</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.iconButton}>
                                <Ionicons name="chatbubbles-outline" size={24} color="#fff" />
                                <Text style={styles.iconLabel}>{mode === 'party' ? 'Party Chat' : 'Comments'}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.iconButton}>
                                <MaterialIcons name="playlist-play" size={28} color="#fff" />
                                <Text style={styles.iconLabel}>Next Ep</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    
    // Video Surface & Gestures
    videoSurface: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
    gestureContainer: { ...StyleSheet.absoluteFillObject, flexDirection: 'row' },
    gestureZone: { flex: 1, backgroundColor: 'transparent' }, // Left and Right halves

    // Overlays
    overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'space-between', paddingHorizontal: 20 },
    
    // Top Bar
    topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    topRightControls: { flexDirection: 'row', alignItems: 'center' },
    topIcon: { marginLeft: 20 },
    mediaInfo: { flex: 1, alignItems: 'center', paddingHorizontal: 20 },
    mediaTitle: { fontFamily: 'Poppins_600SemiBold', color: '#fff', fontSize: 16 },

    // Center Controls
    centerControls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 50 },
    playPauseBtn: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', elevation: 5 },
    skipBtn: { alignItems: 'center', padding: 10 },
    skipText: { color: '#fff', fontSize: 10, marginTop: 4, fontFamily: 'Poppins_600SemiBold' },

    // Bottom Controls
    bottomControls: { marginBottom: 10 },
    sliderContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    timeText: { color: '#fff', fontSize: 12, fontFamily: 'Poppins_500Medium', width: 40, textAlign: 'center' },
    
    // Action Row
    actionRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 10 },
    iconButton: { alignItems: 'center', minWidth: 60 },
    iconLabel: { color: '#fff', fontSize: 10, marginTop: 6, fontFamily: 'Poppins_500Medium' },

    // CC & Lock
    ccContainer: { position: 'absolute', bottom: 140, backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
    ccText: { color: '#fff', fontSize: 16, fontFamily: 'Poppins_500Medium' },
    
    // Lock Button (Big Center)
    lockButtonBig: { backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 30 },
    unlockText: { fontFamily: 'Poppins_600SemiBold', color: Colors.darkBackground, fontSize: 16, marginLeft: 8 },
});

export default VideoPlayerScreen;