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

const Theme = { primary: '#E50914' };

const VideoPlayerScreen = () => {
    const navigation = useNavigation();
    const { params } = useRoute();
    const insets = useSafeAreaInsets();
    const media = params?.media || { title: 'Unknown' };

    const [loading, setLoading] = useState(true);
    const [paused, setPaused] = useState(false);
    const [overlay, setOverlay] = useState(true);
    const [locked, setLocked] = useState(false);
    const [progress, setProgress] = useState(0.25);
    const [isLandscape, setIsLandscape] = useState(false);

    const overlayTimer = useRef(null);

    useEffect(() => {
        setTimeout(() => setLoading(false), 1500); // Sim loading
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
        setOverlay(!overlay);
        resetTimer();
    };

    const toggleOrientation = async () => {
        if (isLandscape) {
            await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
            setIsLandscape(false);
        } else {
            await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
            setIsLandscape(true);
        }
    };

    const togglePlay = () => {
        setPaused(!paused);
        resetTimer();
    };

    return (
        <View style={styles.container}>
            <StatusBar hidden={isLandscape} barStyle="light-content" backgroundColor="#000" />
            
            {/* VIDEO SURFACE */}
            <Pressable style={styles.videoSurface} onPress={handleTap}>
                {loading ? (
                    <ActivityIndicator size="large" color={Theme.primary} />
                ) : (
                    // In a real app, <Video /> goes here. 
                    // We simulate the video frame with empty space.
                    null
                )}
            </Pressable>

            {/* LOCKED OVERLAY */}
            {overlay && locked && (
                <View style={styles.centerOverlay}>
                    <TouchableOpacity style={styles.lockBtn} onPress={() => setLocked(false)}>
                        <Ionicons name="lock-closed" size={28} color="#000" />
                        <Text style={styles.lockText}>Unlock</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* CONTROLS OVERLAY */}
            {overlay && !locked && (
                <View style={styles.controlsContainer}>
                    {/* Top Gradient Area */}
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
                            <TouchableOpacity style={styles.iconSpaced}>
                                <Ionicons name="settings-outline" size={24} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </LinearGradient>

                    {/* Center Play/Pause */}
                    <View style={styles.centerControls}>
                        <TouchableOpacity style={styles.skipBtn}>
                            <MaterialCommunityIcons name="rewind-10" size={36} color="#fff" />
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                            style={styles.playBtnMain} 
                            onPress={togglePlay}
                            activeOpacity={0.8}
                        >
                            <Ionicons name={paused ? "play" : "pause"} size={40} color="#000" style={{marginLeft: paused ? 4 : 0}} />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.skipBtn}>
                            <MaterialCommunityIcons name="fast-forward-10" size={36} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    {/* Bottom Gradient Area */}
                    <LinearGradient 
                        colors={['transparent', 'rgba(0,0,0,0.9)']} 
                        style={[styles.bottomControls, { paddingBottom: isLandscape ? 20 : insets.bottom + 10 }]}
                    >
                        <View style={styles.sliderRow}>
                            <Text style={styles.timeText}>14:20</Text>
                            <Slider
                                style={styles.slider}
                                minimumValue={0}
                                maximumValue={1}
                                value={progress}
                                minimumTrackTintColor={Theme.primary}
                                maximumTrackTintColor="rgba(255,255,255,0.3)"
                                thumbTintColor={Theme.primary}
                            />
                            <Text style={styles.timeText}>42:00</Text>
                        </View>

                        <View style={styles.actionRow}>
                            <TouchableOpacity style={styles.actionBtn} onPress={() => setLocked(true)}>
                                <Ionicons name="lock-open-outline" size={22} color="#fff" />
                                <Text style={styles.actionText}>Lock</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.actionBtn}>
                                <MaterialIcons name="subtitles" size={22} color="#fff" />
                                <Text style={styles.actionText}>Audio & CC</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.actionBtn}>
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
    videoSurface: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
    
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