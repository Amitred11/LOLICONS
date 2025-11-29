// screens/comics/components/FilterModal.js

// Import essential modules from React and React Native.
import React, { useState, useEffect } from 'react';;
import { View, Text, StyleSheet, Pressable, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { Colors } from '@config/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';

// Get screen dimensions for modal sizing.
const { width, height } = Dimensions.get('window');

/**
 * A small, pressable "chip" component used for filter options.
 * @param {object} props - The component's properties.
 * @param {string} props.label - The text displayed on the chip.
 * @param {function} props.onPress - The function to call when the chip is pressed.
 * @param {boolean} props.isActive - If true, the chip is styled as active.
 */
const FilterChip = ({ label, onPress, isActive }) => (
  <TouchableOpacity onPress={onPress} style={[styles.chip, isActive && styles.chipActive]}>
    <Text style={[styles.chipLabel, isActive && styles.chipLabelActive]}>{label}</Text>
  </TouchableOpacity>
);

/**
 * A modal that allows users to filter and sort a list of items.
 * It manages its own local state and applies the changes only when the user confirms.
 * @param {object} props - The component's properties.
 * @param {boolean} props.isVisible - Controls the modal's visibility.
 * @param {function} props.onClose - A callback function to close the modal.
 * @param {function} props.onApplyFilters - A callback that passes the selected filters back to the parent.
 * @param {object} props.currentFilters - The current filter state from the parent component.
 */
const FilterModal = ({ isVisible, onClose, onApplyFilters, currentFilters }) => {
  const insets = useSafeAreaInsets();
  // `localFilters` holds the user's selections within the modal before they are applied.
  const [localFilters, setLocalFilters] = useState(currentFilters);
  const modalProgress = useSharedValue(0); // For the entry/exit animation.

  // This effect animates the modal in or out when `isVisible` changes,
  // and resets the local filter state to match the parent's state when opening.
  useEffect(() => {
    if (isVisible) {
      setLocalFilters(currentFilters);
    }
    modalProgress.value = withSpring(isVisible ? 1 : 0, { damping: 18, stiffness: 250 });
  }, [isVisible, currentFilters]);

  // Animated styles for the backdrop and the modal container.
  const animatedBackdropStyle = useAnimatedStyle(() => ({
    opacity: modalProgress.value,
  }));
  const animatedModalStyle = useAnimatedStyle(() => ({
    transform: [{ scale: modalProgress.value }],
    opacity: modalProgress.value,
  }));

  // Render nothing if the modal is not visible and its animation is complete.
  if (!isVisible && modalProgress.value === 0) return null;

  // Static data for filter options.
  const genres = ['Sci-Fi', 'Action', 'Fantasy', 'Horror', 'Cyberpunk', 'Adventure', 'Thriller', 'Space Opera'];

  // Calls the parent's onApplyFilters callback with the local state and closes the modal.
  const handleApply = () => {
    onApplyFilters(localFilters);
    onClose();
  };
  
  // Resets the filters to their default state and closes the modal.
  const handleReset = () => {
    const defaultFilters = { sort: 'az', status: 'All', type: 'All', genres: [] };
    onApplyFilters(defaultFilters);
    onClose();
  }

  return (
    <View style={[StyleSheet.absoluteFill, styles.container]} pointerEvents={isVisible ? 'auto' : 'none'}>
      <Pressable onPress={onClose} style={StyleSheet.absoluteFill}>
        <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.6)' }, animatedBackdropStyle]} />
      </Pressable>
      
      <Animated.View style={[styles.modalContent, animatedModalStyle]}>
        <BlurView intensity={100} tint="dark" style={StyleSheet.absoluteFillObject} />
        <Text style={styles.modalTitle}>Filter & Sort</Text>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Sort Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sort by</Text>
            <View style={styles.chipContainer}>
              <FilterChip label="A-Z" isActive={localFilters.sort === 'az'} onPress={() => setLocalFilters(prev => ({...prev, sort: 'az'}))} />
              <FilterChip label="Z-A" isActive={localFilters.sort === 'za'} onPress={() => setLocalFilters(prev => ({...prev, sort: 'za'}))} />
            </View>
          </View>
          {/* Status Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Status</Text>
            <View style={styles.chipContainer}>
              <FilterChip label="All" isActive={localFilters.status === 'All'} onPress={() => setLocalFilters(prev => ({...prev, status: 'All'}))} />
              <FilterChip label="Ongoing" isActive={localFilters.status === 'Ongoing'} onPress={() => setLocalFilters(prev => ({...prev, status: 'Ongoing'}))} />
              <FilterChip label="Completed" isActive={localFilters.status === 'Completed'} onPress={() => setLocalFilters(prev => ({...prev, status: 'Completed'}))} />
            </View>
          </View>
          {/* Type Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Type</Text>
            <View style={styles.chipContainer}>
              <FilterChip label="All" isActive={localFilters.type === 'All'} onPress={() => setLocalFilters(prev => ({...prev, type: 'All'}))} />
              <FilterChip label="Manga" isActive={localFilters.type === 'Manga'} onPress={() => setLocalFilters(prev => ({...prev, type: 'Manga'}))} />
              <FilterChip label="Manhwa" isActive={localFilters.type === 'Manhwa'} onPress={() => setLocalFilters(prev => ({...prev, type: 'Manhwa'}))} />
              <FilterChip label="Comic" isActive={localFilters.type === 'Comic'} onPress={() => setLocalFilters(prev => ({...prev, type: 'Comic'}))} />
            </View>
          </View>
          {/* Genres Section (multi-select) */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Genres</Text>
            <View style={styles.chipContainer}>
              {genres.map(genre => (
                  <FilterChip key={genre} label={genre} isActive={localFilters.genres.includes(genre)} onPress={() => setLocalFilters(prev => ({...prev, genres: prev.genres.includes(genre) ? prev.genres.filter(g => g !== genre) : [...prev.genres, genre]}))} />
              ))}
            </View>
          </View>
        </ScrollView>
        {/* Footer with Reset and Apply buttons */}
        <View style={[styles.footer, { paddingBottom: insets.bottom > 0 ? 10 : 20 }]}>
          <TouchableOpacity onPress={handleReset} style={[styles.footerButton, styles.resetButton]}><Text style={[styles.footerButtonText, styles.resetButtonText]}>Reset</Text></TouchableOpacity>
          <TouchableOpacity onPress={handleApply} style={[styles.footerButton, styles.applyButton]}><Text style={[styles.footerButtonText, styles.applyButtonText]}>Apply</Text></TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

// --- Stylesheet ---
const styles = StyleSheet.create({
    container: { justifyContent: 'center', alignItems: 'center', zIndex: 100 },
    modalContent: { width: width * 0.9, maxHeight: height * 0.75, borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: Colors.surface + '80' },
    modalTitle: { fontFamily: 'Poppins_600SemiBold', color: Colors.text, fontSize: 20, textAlign: 'center', paddingTop: 20, paddingHorizontal: 20 },
    section: { marginTop: 15, paddingHorizontal: 20 },
    sectionTitle: { fontFamily: 'Poppins_500Medium', color: Colors.textSecondary, fontSize: 14, marginBottom: 10 },
    chipContainer: { flexDirection: 'row', flexWrap: 'wrap' },
    chip: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 20, paddingHorizontal: 15, paddingVertical: 8, marginRight: 10, marginBottom: 10 },
    chipActive: { backgroundColor: Colors.secondary + '33', borderWidth: 1, borderColor: Colors.secondary },
    chipLabel: { fontFamily: 'Poppins_500Medium', color: Colors.textSecondary, fontSize: 14 },
    chipLabelActive: { color: Colors.secondary },
    footer: { flexDirection: 'row', paddingTop: 15, paddingHorizontal: 20, borderTopWidth: 1, borderTopColor: Colors.textSecondary + '22' },
    footerButton: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
    resetButton: { backgroundColor: 'rgba(255,255,255,0.1)', marginRight: 10 },
    applyButton: { backgroundColor: Colors.secondary },
    footerButtonText: { fontFamily: 'Poppins_600SemiBold', fontSize: 16 },
    resetButtonText: { color: Colors.textSecondary },
    applyButtonText: { color: Colors.background },
});

export default FilterModal;