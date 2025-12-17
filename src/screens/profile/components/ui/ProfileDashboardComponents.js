import React, { useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, useAnimatedStyle, withDelay, withSpring, withTiming } from 'react-native-reanimated';
import { Colors } from '@config/Colors';

export const BadgeItem = React.memo(({ item, index, onPress }) => {
    const entryProgress = useSharedValue(0);
    useEffect(() => { entryProgress.value = withDelay(index * 100, withSpring(1)); }, []);
    const animatedStyle = useAnimatedStyle(() => ({ opacity: entryProgress.value, transform: [{scale: entryProgress.value}] }));
    return (
        <Animated.View style={[styles.badgeContainer, animatedStyle]}>
            <TouchableOpacity onPress={onPress}>
                <LinearGradient colors={[Colors.surface + '99', 'rgba(0,0,0,0)']} style={styles.badgeIconContainer}>
                    <Ionicons name={item.icon} size={32} color={Colors.secondary} />
                </LinearGradient>
                <Text style={styles.badgeName} numberOfLines={2}>{item.name}</Text>
            </TouchableOpacity>
        </Animated.View>
    );
});

export const StatItem = React.memo(({ label, value }) => ( 
    <View style={styles.statItem}><Text style={styles.statValue}>{value}</Text><Text style={styles.statLabel}>{label}</Text></View> 
));

export const FavoriteItem = React.memo(({ item }) => {
    const title = item.title || item.name || 'Untitled';
    const imageUri = item.image?.uri || item.image || item.poster?.uri || item.poster;
    return ( 
        <TouchableOpacity style={styles.favoriteItem}>
            <Image source={typeof imageUri === 'string' ? { uri: imageUri } : imageUri} style={styles.favoriteImage} resizeMode="cover" />
            <LinearGradient colors={['transparent', 'rgba(0,0,0,0.9)']} style={styles.favoriteOverlay}>
                <Text style={styles.favoriteTitle} numberOfLines={1}>{title}</Text>
            </LinearGradient>
        </TouchableOpacity> 
    );
});

export const HistoryItem = React.memo(({ item }) => ( 
    <TouchableOpacity style={styles.historyItem}>
        <Image source={item.image} style={styles.historyImage} resizeMode="cover" />
        <View style={styles.historyTextContainer}>
            <Text style={styles.historyTitle} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.historySubtitle} numberOfLines={1}>{item.lastChapterRead}</Text>
        </View>
        <Ionicons name="chevron-forward-outline" size={22} color={Colors.textSecondary} />
    </TouchableOpacity> 
));

export const ProfileRow = React.memo(({ icon, label, onPress, color = Colors.text, isLast = false }) => ( 
    <TouchableOpacity onPress={onPress} style={[styles.rowContainer, isLast && { borderBottomWidth: 0 }]}>
        <View style={styles.rowLeft}>
            <Ionicons name={icon} size={22} color={color} style={{ width: 25 }} />
            <Text style={[styles.rowLabel, { color }]}>{label}</Text>
        </View>
        <Ionicons name="chevron-forward-outline" size={22} color={Colors.textSecondary} />
    </TouchableOpacity> 
));

export const AnimatedSection = ({ children, index }) => {
    const opacity = useSharedValue(0);
    const translateY = useSharedValue(20);
    useEffect(() => { 
        opacity.value = withDelay(index * 150, withTiming(1)); 
        translateY.value = withDelay(index * 150, withSpring(0)); 
    }, []);
    const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value, transform: [{ translateY: translateY.value }] }));
    return <Animated.View style={animatedStyle}>{children}</Animated.View>;
};

const styles = StyleSheet.create({
    badgeContainer: { alignItems: 'center', width: 100 },
    badgeIconContainer: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 8, overflow: 'hidden', borderWidth: StyleSheet.hairlineWidth, borderColor: Colors.surface + '80' },
    badgeName: { fontFamily: 'Poppins_500Medium', color: Colors.textSecondary, fontSize: 12, textAlign: 'center' },
    statItem: { alignItems: 'center', flex: 1 },
    statValue: { fontFamily: 'Poppins_700Bold', color: Colors.text, fontSize: 20 },
    statLabel: { fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, fontSize: 12, marginTop: 4 },
    favoriteItem: { width: 110, height: 165, marginRight: 15, borderRadius: 12, overflow: 'hidden', backgroundColor: Colors.surface },
    favoriteImage: { width: '100%', height: '100%', backgroundColor: Colors.surface },
    favoriteOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 60, justifyContent: 'flex-end', paddingHorizontal: 8, paddingBottom: 8 },
    favoriteTitle: { fontFamily: 'Poppins_600SemiBold', color: '#FFF', fontSize: 11, textShadowColor: 'rgba(0,0,0,0.7)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 },
    historyItem: { flexDirection: 'row', alignItems: 'center', padding: 15, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.surface + '80' },
    historyImage: { width: 50, height: 75, borderRadius: 8, backgroundColor: Colors.surface },
    historyTextContainer: { marginLeft: 15, flex: 1 },
    historyTitle: { fontFamily: 'Poppins_600SemiBold', color: Colors.text, fontSize: 16 },
    historySubtitle: { fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, fontSize: 13, marginTop: 2 },
    rowContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, paddingHorizontal: 15, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.surface + '80' },
    rowLeft: { flexDirection: 'row', alignItems: 'center' },
    rowLabel: { fontFamily: 'Poppins_500Medium', fontSize: 16, marginLeft: 15 },
});