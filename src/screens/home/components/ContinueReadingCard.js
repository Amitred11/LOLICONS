import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@config/Colors';

const ContinueReadingCard = ({ item, onPress }) => {
    const progress = useSharedValue(0);

    useEffect(() => { 
        progress.value = withTiming(item.progress || 0.75, { duration: 500 }); 
    }, []);

    const animatedProgressStyle = useAnimatedStyle(() => ({ 
        width: `${progress.value * 100}%` 
    }));

    return (
        <TouchableOpacity onPress={onPress} style={styles.continueCard}>
            <Image source={item.localSource} style={styles.continueImage} />
            <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={styles.continueOverlay}>
                <Text style={styles.continueTitle} numberOfLines={2}>{item.title}</Text>
                <Text style={styles.continueChapter}>Chapter {item.chapters[0].id}</Text>
            </LinearGradient>
            <View style={styles.continueProgressBg}>
                <Animated.View style={[styles.continueProgressFill, animatedProgressStyle]} />
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    continueCard: { width: 130, height: 200, marginRight: 15, borderRadius: 12, overflow: 'hidden', backgroundColor: Colors.surface },
    continueImage: { width: '100%', height: '100%' },
    continueOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 10, paddingTop: 40 },
    continueTitle: { fontFamily: 'Poppins_600SemiBold', color: '#fff', fontSize: 14, lineHeight: 18 },
    continueChapter: { fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, fontSize: 11, marginTop: 2 },
    continueProgressBg: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, backgroundColor: 'rgba(255,255,255,0.2)' },
    continueProgressFill: { height: '100%', backgroundColor: Colors.secondary },
});

export default ContinueReadingCard;