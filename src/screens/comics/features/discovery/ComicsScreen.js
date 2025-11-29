// screens/comics/ComicsScreen.js

// Import essential modules from React, React Native, and third-party libraries.
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Keyboard } from 'react-native';
import { createMaterialTopTabNavigator, MaterialTopTabBar } from '@react-navigation/material-top-tabs';
import { Colors } from '@config/Colors';
import Animated, { useSharedValue, useAnimatedStyle, interpolate, Extrapolate, useAnimatedScrollHandler, withTiming, runOnJS } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
// Import custom hooks and child components (the tab screens).
import { useModal } from '@context/ModalContext';
import LibraryView from '../library/LibraryView';
import HistoryView from '../library/HistoryView';
import BrowseView from './BrowseView';
import { BlurView } from 'expo-blur';

// Initialize the top tab navigator.
const Tab = createMaterialTopTabNavigator();

// --- Animation & Layout Constants ---
const EXPANDED_HEADER_HEIGHT = 120;
const COLLAPSED_HEADER_HEIGHT = 60;
const SCROLL_DISTANCE = EXPANDED_HEADER_HEIGHT - COLLAPSED_HEADER_HEIGHT;
const PADDING = 15;

/**
 * The main screen for the "Comics" tab. It orchestrates a top tab navigator
 * with a shared, collapsible header that includes search and filter functionality.
 */
const ComicsScreen = () => {
  const insets = useSafeAreaInsets();
  // `scrollY` is a shared value updated by the active child tab's scroll position.
  const scrollY = useSharedValue(0);
  // `searchAnimation` controls the fade-in/out of the search overlay.
  const searchAnimation = useSharedValue(0);
  const modal = useModal();

  // State for search and filter functionality, which is passed down to child tabs.
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [filters, setFilters] = useState({ sort: 'az', status: 'All', type: 'All', genres: [] });

  // This single scroll handler is passed down to each tab screen.
  // It ensures that scrolling in any tab will affect the shared header animation.
  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollY.value = Math.max(0, event.contentOffset.y);
  });

  // --- Animation Style Definitions ---
  // Interpolates the header's height based on the scroll position.
  const animatedHeaderStyle = useAnimatedStyle(() => ({
    height: interpolate(scrollY.value, [0, SCROLL_DISTANCE], [EXPANDED_HEADER_HEIGHT + insets.top, COLLAPSED_HEADER_HEIGHT + insets.top], Extrapolate.CLAMP),
  }));
  // Fades in the header's blur effect as the user scrolls down.
  const animatedBlurStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, 50], [0, 1], Extrapolate.CLAMP),
  }));
  // Fades out and moves the large title up as the user scrolls.
  const animatedLargeTitleStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, SCROLL_DISTANCE / 2], [1, 0], Extrapolate.CLAMP),
    transform: [{ translateY: interpolate(scrollY.value, [0, SCROLL_DISTANCE], [0, -20], Extrapolate.CLAMP) }],
  }));
  // Fades in the small, centered title as the header collapses.
  const animatedSmallTitleStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [SCROLL_DISTANCE * 0.7, SCROLL_DISTANCE], [0, 1], Extrapolate.CLAMP),
  }));
  // Fades the search overlay in and out.
  const animatedSearchOverlayStyle = useAnimatedStyle(() => ({
    opacity: searchAnimation.value,
  }));

  // --- Event Handlers ---
  // Toggles the search UI overlay.
  const handleToggleSearch = (visible) => {
    if (visible) {
      setIsSearching(true);
      searchAnimation.value = withTiming(1, { duration: 200 });
    } else {
      Keyboard.dismiss();
      searchAnimation.value = withTiming(0, { duration: 200 }, () => {
        // `runOnJS` is used to update React state after the animation on the UI thread is complete.
        runOnJS(setIsSearching)(false);
        runOnJS(setSearchQuery)('');
      });
    }
  };

  // Opens the filter modal using the global modal context.
  const showFilterModal = () => {
    modal.show('filter', { onApplyFilters: setFilters, currentFilters: filters });
  };

  /**
   * A custom render function for the tab bar. This is the core of the component,
   * integrating the animated header elements with the standard tab bar.
   */
  const renderTabBar = (props) => {
    const currentRouteName = props.state.routes[props.state.index].name;

    return (
      <Animated.View style={[styles.headerContainer, animatedHeaderStyle]}>
        {/* The blurred background that fades in on scroll */}
        <Animated.View style={[StyleSheet.absoluteFill, animatedBlurStyle]}>
          <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
        </Animated.View>
        <View style={styles.borderBottom} />

        <View style={[styles.headerContent, { paddingTop: insets.top }]}>
          {/* Container for the large and small titles */}
          <View style={styles.titleContainer}>
            <Animated.View style={[styles.largeTitleWrapper, animatedLargeTitleStyle]}>
              <Text style={styles.largeTitle}>{currentRouteName}</Text>
            </Animated.View>
            <Animated.View style={[styles.smallTitleWrapper, animatedSmallTitleStyle]}>
              <Text style={styles.smallTitle}>{currentRouteName}</Text>
            </Animated.View>
            {/* Header action buttons */}
            <View style={styles.actionsWrapper}>
              <TouchableOpacity onPress={() => handleToggleSearch(true)} style={styles.actionButton}>
                <Ionicons name="search" size={20} color={Colors.text} />
              </TouchableOpacity>
              {/* The filter button is hidden on the "History" tab */}
              {currentRouteName !== 'History' && (
                <TouchableOpacity onPress={showFilterModal} style={styles.actionButton}>
                  <Ionicons name="options-outline" size={20} color={Colors.text} />
                </TouchableOpacity>
              )}
            </View>
          </View>
          
          {/* The actual Material Top Tab Bar is rendered here */}
          <MaterialTopTabBar {...props} style={styles.tabBar} />
        </View>

        {/* The search overlay, conditionally rendered and animated */}
        {isSearching && (
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
                  onChangeText={setSearchQuery}
                  autoFocus={true}
                  returnKeyType="search"
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
                    <Ionicons name="close-circle" size={20} color={Colors.textSecondary} />
                  </TouchableOpacity>
                )}
              </View>
              <TouchableOpacity onPress={() => handleToggleSearch(false)} style={styles.cancelButton}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}
      </Animated.View>
    );
  };

  return (
    <Tab.Navigator
      tabBar={renderTabBar}
      sceneContainerStyle={{ backgroundColor: Colors.background }}
      screenOptions={{
        tabBarIndicatorStyle: { backgroundColor: Colors.secondary, height: 3, borderRadius: 3 },
        tabBarLabelStyle: { fontFamily: 'Poppins_600SemiBold', textTransform: 'capitalize', fontSize: 16 },
        tabBarActiveTintColor: Colors.secondary,
        tabBarInactiveTintColor: Colors.textSecondary,
      }}
    >
      {/* Each screen is passed the necessary props (scroll handler, header height, etc.) */}
      <Tab.Screen name="Library">
        {() => <LibraryView scrollHandler={scrollHandler} headerHeight={EXPANDED_HEADER_HEIGHT} searchQuery={searchQuery} filters={filters} />}
      </Tab.Screen>
      <Tab.Screen name="History">
        {() => <HistoryView scrollHandler={scrollHandler} headerHeight={EXPANDED_HEADER_HEIGHT} searchQuery={searchQuery} />}
      </Tab.Screen>
      <Tab.Screen name="Browse">
        {() => <BrowseView scrollHandler={scrollHandler} headerHeight={EXPANDED_HEADER_HEIGHT} searchQuery={searchQuery} filters={filters} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

// --- Stylesheet ---
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

export default ComicsScreen;