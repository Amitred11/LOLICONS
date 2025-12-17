import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Keyboard } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, interpolate, Extrapolate, withTiming, runOnJS } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { MaterialTopTabBar } from '@react-navigation/material-top-tabs';
import { Colors } from '@config/Colors';

const EXPANDED_HEADER_HEIGHT = 120;
const COLLAPSED_HEADER_HEIGHT = 60;
const SCROLL_DISTANCE = EXPANDED_HEADER_HEIGHT - COLLAPSED_HEADER_HEIGHT;
const PADDING = 15;

export const SearchOverlay = ({ isVisible, insets, searchQuery, onSearchQueryChange, onCancel, currentRouteName }) => {
    if (!isVisible) return null;

    const searchAnimation = useSharedValue(1); 

    const animatedSearchOverlayStyle = useAnimatedStyle(() => ({
        opacity: searchAnimation.value,
    }));

    const handleCancel = () => {
        Keyboard.dismiss();
        searchAnimation.value = withTiming(0, { duration: 200 }, () => {
            runOnJS(onCancel)();
        });
    };

    return (
        <Animated.View style={[styles.searchOverlay, animatedSearchOverlayStyle]}>
            <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
            <View style={[styles.searchBarContainer, { paddingTop: insets.top }]}>
                <View style={styles.searchBar}>
                    <Ionicons name="search" size={20} color={Colors.textSecondary} style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder={`Search ${currentRouteName}...`}
                        placeholderTextColor={Colors.textSecondary}
                        value={searchQuery}
                        onChangeText={onSearchQueryChange}
                        autoFocus={true}
                        returnKeyType="search"
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => onSearchQueryChange('')} style={styles.clearButton}>
                            <Ionicons name="close-circle" size={20} color={Colors.textSecondary} />
                        </TouchableOpacity>
                    )}
                </View>
                <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
            </View>
        </Animated.View>
    );
};

export const CollapsibleHeader = ({ scrollY, insets, onToggleSearch, onShowFilters, currentRouteName, ...tabBarProps }) => {
    const animatedHeaderStyle = useAnimatedStyle(() => ({
        height: interpolate(scrollY.value, [0, SCROLL_DISTANCE], [EXPANDED_HEADER_HEIGHT + insets.top, COLLAPSED_HEADER_HEIGHT + insets.top], Extrapolate.CLAMP),
    }));
    const animatedBlurStyle = useAnimatedStyle(() => ({
        opacity: interpolate(scrollY.value, [0, 50], [0, 1], Extrapolate.CLAMP),
    }));
    const animatedLargeTitleStyle = useAnimatedStyle(() => ({
        opacity: interpolate(scrollY.value, [0, SCROLL_DISTANCE / 2], [1, 0], Extrapolate.CLAMP),
        transform: [{ translateY: interpolate(scrollY.value, [0, SCROLL_DISTANCE], [0, -20], Extrapolate.CLAMP) }],
    }));
    const animatedSmallTitleStyle = useAnimatedStyle(() => ({
        opacity: interpolate(scrollY.value, [SCROLL_DISTANCE * 0.7, SCROLL_DISTANCE], [0, 1], Extrapolate.CLAMP),
    }));

    return (
        <Animated.View style={[styles.headerContainer, animatedHeaderStyle]}>
            <Animated.View style={[StyleSheet.absoluteFill, animatedBlurStyle]}>
                <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
            </Animated.View>
            <View style={styles.borderBottom} />

            <View style={[styles.headerContent, { paddingTop: insets.top }]}>
                <View style={styles.titleContainer}>
                    <Animated.View style={[styles.largeTitleWrapper, animatedLargeTitleStyle]}>
                        <Text style={styles.largeTitle}>{currentRouteName}</Text>
                    </Animated.View>
                    <Animated.View style={[styles.smallTitleWrapper, animatedSmallTitleStyle]}>
                        <Text style={styles.smallTitle}>{currentRouteName}</Text>
                    </Animated.View>
                    <View style={styles.actionsWrapper}>
                        <TouchableOpacity onPress={onToggleSearch} style={styles.actionButton}>
                            <Ionicons name="search" size={20} color={Colors.text} />
                        </TouchableOpacity>
                        {currentRouteName !== 'History' && (
                            <TouchableOpacity onPress={onShowFilters} style={styles.actionButton}>
                                <Ionicons name="options-outline" size={20} color={Colors.text} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
                <MaterialTopTabBar {...tabBarProps} style={styles.tabBar} />
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
  headerContainer: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
  borderBottom: { position: 'absolute', bottom: 0, left: 0, right: 0, height: StyleSheet.hairlineWidth, backgroundColor: Colors.surface + '80' },
  headerContent: { flex: 1, flexDirection: 'column', bottom: 4 },
  titleContainer: { flex: 1, justifyContent: 'center', paddingHorizontal: PADDING, overflow: 'hidden' },
  largeTitleWrapper: { position: 'absolute', left: PADDING, bottom: 1 },
  largeTitle: { fontFamily: 'Poppins_700Bold', color: Colors.text, fontSize: 34 },
  smallTitleWrapper: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  smallTitle: { fontFamily: 'Poppins_600SemiBold', color: Colors.text, fontSize: 17 },
  actionsWrapper: { position: 'absolute', right: PADDING, top: 0, bottom: 0, flexDirection: 'row', alignItems: 'center' },
  actionButton: { marginLeft: 8, height: 36, width: 36, borderRadius: 18, backgroundColor: Colors.surface + '90', alignItems: 'center', justifyContent: 'center' },
  tabBar: { backgroundColor: 'transparent', height: 50 },
  searchOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 20 },
  searchBarContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'black', paddingHorizontal: PADDING, height: COLLAPSED_HEADER_HEIGHT },
  searchBar: { backgroundColor: Colors.surface, borderRadius: 10, height: 45, flexDirection: 'row', alignItems: 'center', flex: 1 },
  searchIcon: { paddingHorizontal: 10 },
  searchInput: { flex: 1, height: '100%', color: Colors.text, fontFamily: 'Poppins_400Regular', fontSize: 15, paddingRight: 40, top: 4 },
  clearButton: { position: 'absolute', right: 8, padding: 5 },
  cancelButton: { paddingLeft: 15, height: 44, justifyContent: 'center' },
  cancelButtonText: { color: Colors.secondary, fontFamily: 'Poppins_500Medium', fontSize: 16 },
});