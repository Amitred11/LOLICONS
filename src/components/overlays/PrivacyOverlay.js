// components/PrivacyOverlay.js
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, AppState, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import * as ScreenCapture from 'expo-screen-capture';

const PrivacyOverlay = () => {
    const [appState, setAppState] = useState(AppState.currentState);

    useEffect(() => {
        const handleAppStateChange = async (nextAppState) => {
            if (nextAppState === 'active') {
                // App is back in foreground: Allow screenshots/recording
                await ScreenCapture.allowScreenCaptureAsync();
            } else {
                // App is inactive/backgrounded: Prevent screenshots/recording
                // On Android, this forces the 'Recents' screen to be black immediately
                await ScreenCapture.preventScreenCaptureAsync();
            }
            setAppState(nextAppState);
        };

        const subscription = AppState.addEventListener('change', handleAppStateChange);

        // Initial check on mount
        if (AppState.currentState !== 'active') {
            ScreenCapture.preventScreenCaptureAsync();
        }

        return () => {
            subscription.remove();
            // Cleanup: ensure we reset permission when component unmounts
            ScreenCapture.allowScreenCaptureAsync();
        };
    }, []);

    // If active, render nothing (allows interaction)
    if (appState === 'active') return null;

    return (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
            {/* 
              iOS: The BlurView looks nice and updates instantly.
              Android: The screen capture prevention above makes the screen black 
                       in the switcher, so this BlurView is a fallback 
                       if the JS thread catches up.
            */}
            <BlurView 
                intensity={90} 
                style={StyleSheet.absoluteFill} 
                tint="dark" 
                experimentalBlurMethod='dimezisBlurView' // Better performance on Android if available
            />
        </View>
    );
};

export default PrivacyOverlay;