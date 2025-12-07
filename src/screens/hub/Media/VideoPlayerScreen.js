import React, { useState, useEffect, useRef } from 'react';
import {
    View, Text, StyleSheet, StatusBar, TouchableOpacity, ActivityIndicator,
    Pressable, Dimensions
} from 'react-native';
import { Ionicons, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Slider from '@react-native-community/slider';
import { LinearGradient } from 'expo-linear-gradient';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useAlert } from '@context/other/AlertContext';

const Theme = { primary: '#E50914' };

const VideoPlayerScreen = () => {
    const navigation = useNavigation();
    const { params } = useRoute();
    const { showAlert } = useAlert();
    const insets = useSafeAreaInsets();
    const media = params?.media || { title: 'Unknown Title' };

    const [loading, setLoading] = useState(true);
    const [paused, setPaused] = useState(false);
    const [overlay, setOverlay] = useState(true);
    const [locked, setLocked] = useState(false);
    const [progress, setProgress] = useState(0);
    const [isLandscape, setIsLandscape] = useState(false);

    const overlayTimer = useRef(null);

    useEffect(() => {
        // Simulate buffering
        setTimeout(() => setLoading(false), 1500);
        resetTimer();
        return () => {
            ScreenOrientation.unlockAsync();
            clearTimeout(overlayTimer.current);
        };
    }, []);

    const resetTimer = () => {
        clearTimeout(overlayTimer.current);
        if (!paused && !locked) {
            overlayTimer.current = setTimeout(() => setOverlay(false), 4000);
        }
    };

    const handleTap = () => {
        if (locked) {
            setOverlay(true);
            setTimeout(() => setOverlay(false), 2000);
            return;
        }
        setOverlay(!overlay);
        resetTimer();
    };
    
    const onDoubleTap = (direction) => {
        if (locked) return;
        const newProgress = direction === 'forward'
            ? Math.min(1, progress + 0.1)
            : Math.max(0, progress - 0.1);
        setProgress(newProgress);
        resetTimer();
    };

    const toggleOrientation = async () => {
        if (isLandscape) {
            await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
        } else {
            await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
        }
        setIsLandscape(!isLandscape);
    };

    const togglePlay = () => {
        setPaused(!paused);
        resetTimer();
    };
    
    const handleFeature = (name) => {
        showAlert({ title: name, message: 'This feature is simulated.', type: 'info' });
        resetTimer();
    };

    return (
        <View style={styles.container}>
            <StatusBar hidden={isLandscape} barStyle="light-content" backgroundColor="#000" />
            
            <Pressable style={styles.videoSurface} onPress={handleTap}>
                {loading ? (
                    <ActivityIndicator size="large" color={Theme.primary} />
                ) : (
                    <>
                        <View style={styles.doubleTapContainer}>
                            <TouchableOpacity style={{flex: 1}} onPress={() => onDoubleTap('backward')} />
                            <TouchableOpacity style={{flex: 1}} onPress={() => onDoubleTap('forward')} />
                        </View>
                        <Text style={{color: '#333'}}>Video Rendering Surface</Text>
                    </>
                )}
            </Pressable>

            {overlay && locked && (
                <View style={styles.centerOverlay}>
                    <TouchableOpacity style={styles.lockBtn} onPress={() => setLocked(false)}>
                        <Ionicons name="lock-closed" size={28} color="#000" />
                        <Text style={styles.lockText}>Unlock</Text>
                    </TouchableOpacity>
                </View>
            )}

            {overlay && !locked && (
                <View style={styles.controlsContainer}>
                    <LinearGradient
                        colors={['rgba(0,0,0,0.8)', 'transparent']}
                        style={[styles.topControls, { paddingTop: isLandscape ? 20 : insets.top + 10 }]}
                    >
                        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={20}>
                            <Ionicons name="arrow-back" size={28} color="#fff" />
                        </TouchableOpacity>
                        <Text style={styles.mediaTitle} numberOfLines={1}>{media.title}</Text>
                        <View style={styles.topRightIcons}>
                            <TouchableOpacity onPress={toggleOrientation} style={styles.iconSpaced}>
                                <MaterialIcons name={isLandscape ? "fullscreen-exit" : "fullscreen"} size={28} color="#fff" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.iconSpaced} onPress={() => handleFeature('Settings')}>
                                <Ionicons name="settings-outline" size={24} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </LinearGradient>

                    <View style={styles.centerControls}>
                        <TouchableOpacity style={styles.skipBtn} onPress={() => onDoubleTap('backward')}>
                            <MaterialCommunityIcons name="rewind-10" size={36} color="#fff" />
                        </TouchableOpacity>
                        
                        <TouchableOpacity style={styles.playBtnMain} onPress={togglePlay} activeOpacity={0.8}>
                            <Ionicons name={paused ? "play" : "pause"} size={40} color="#000" style={{marginLeft: paused ? 4 : 0}} />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.skipBtn} onPress={() => onDoubleTap('forward')}>
                            <MaterialCommunityIcons name="fast-forward-10" size={36} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.9)']}
                        style={[styles.bottomControls, { paddingBottom: isLandscape ? 20 : insets.bottom + 10 }]}
                    >
                        <View style={styles.sliderRow}>
                            <Text style={styles.timeText}>04:20</Text>
                            <Slider
                                style={styles.slider}
                                minimumValue={0}
                                maximumValue={1}
                                value={progress}
                                onValueChange={(val) => { setProgress(val); resetTimer(); }}
                                minimumTrackTintColor={Theme.primary}
                                maximumTrackTintColor="rgba(255,255,255,0.3)"
                                thumbTintColor={Theme.primary}
                            />
                            <Text style={styles.timeText}>24:00</Text>
                        </View>

                        <View style={styles.actionRow}>
                            <TouchableOpacity style={styles.actionBtn} onPress={() => setLocked(true)}>
                                <Ionicons name="lock-open-outline" size={22} color="#fff" />
                                <Text style={styles.actionText}>Lock</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.actionBtn} onPress={() => handleFeature('Audio & CC')}>
                                <MaterialIcons name="subtitles" size={22} color="#fff" />
                                <Text style={styles.actionText}>Audio & CC</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.actionBtn} onPress={() => handleFeature('Episodes')}>
                                <MaterialIcons name="playlist-play" size={26} color="#fff" />
                                <Text style={styles.actionText}>Episodes</Text>
                            </TouchableOpacity>
                        </View>
                    </LinearGradient>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    videoSurface: { flex: 1, backgroundColor: '#111', justifyContent: 'center', alignItems: 'center' },
    doubleTapContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, flexDirection: 'row', zIndex: 1 },
    controlsContainer: { ...StyleSheet.absoluteFillObject, justifyContent: 'space-between' },
    topControls: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 40 },
    mediaTitle: { flex: 1, color: '#fff', fontSize: 16, fontWeight: '700', marginHorizontal: 15, textAlign: 'center' },
    topRightIcons: { flexDirection: 'row', alignItems: 'center' },
    iconSpaced: { marginLeft: 20 },
    centerControls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 40 },
    playBtnMain: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
    centerOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.2)' },
    lockBtn: { flexDirection: 'row', backgroundColor: '#fff', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 30, alignItems: 'center', gap: 8 },
    lockText: { fontWeight: '700', fontSize: 16 },
    bottomControls: { paddingHorizontal: 20, paddingTop: 40 },
    sliderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    slider: { flex: 1, marginHorizontal: 10, height: 40 },
    timeText: { color: '#fff', fontSize: 12, fontWeight: '600', width: 45, textAlign: 'center' },
    actionRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
    actionBtn: { alignItems: 'center', opacity: 0.9 },
    actionText: { color: '#fff', fontSize: 10, marginTop: 4 },
});

export default VideoPlayerScreen;