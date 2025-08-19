// screens/comics/components/ChapterListModal.js

// Import essential modules from React, React Native, and third-party libraries.
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, FlatList, TouchableOpacity } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming, runOnJS } from 'react-native-reanimated';
import { Colors } from '../../../constants/Colors';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

/**
 * A UI component for a single chapter item within the list.
 * @param {object} props - The component's properties.
 * @param {object} props.item - The chapter data object (e.g., { id, title }).
 * @param {boolean} props.isCurrent - True if this is the currently active chapter.
 * @param {function} props.onSelect - Callback function to execute when this chapter is selected.
 */
const ChapterItem = ({ item, isCurrent, onSelect }) => (
  <TouchableOpacity onPress={onSelect} style={styles.chapterButton}>
    <Text style={[styles.chapterLabel, isCurrent && styles.chapterLabelActive]} numberOfLines={1}>
      {item.title}
    </Text>
    {/* Display an icon to indicate the currently selected chapter. */}
    {isCurrent && <Ionicons name="radio-button-on" size={20} color={Colors.secondary} />}
  </TouchableOpacity>
);

/**
 * A modal that displays a scrollable list of a comic's chapters.
 * It animates in with a spring effect and allows the user to select a chapter.
 * @param {object} props - The component's properties.
 * @param {function} props.onClose - A callback function to close the modal.
 * @param {Array<object>} props.chapters - The array of chapter objects to display.
 * @param {string} props.currentChapterId - The ID of the currently active chapter to highlight.
 * @param {function} props.onSelectChapter - A callback that is fired with the selected chapter's ID.
 */
const ChapterListModal = ({ onClose, chapters, currentChapterId, onSelectChapter }) => {
  // Shared values to drive the modal's entry and exit animations.
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);

  // Trigger the "animate in" effect when the component first mounts.
  useEffect(() => {
    scale.value = withSpring(1, { damping: 18, stiffness: 250 });
    opacity.value = withTiming(1);
  }, []);

  // Animated styles that are derived from the shared values.
  const animatedModalStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));
  const animatedBackdropStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  // Function to animate the modal out and then call the onClose callback.
  const handleClose = (callback) => {
    scale.value = withSpring(0.8, { damping: 18, stiffness: 250 });
    opacity.value = withTiming(0, {}, () => {
      // `runOnJS` safely executes a JS-thread function (like a state update) after a UI-thread animation completes.
      runOnJS(onClose)();
      if (callback) runOnJS(callback)();
    });
  };
  
  // Handles selecting a chapter: closes the modal and then calls the parent's selection handler.
  const handleSelect = (chapterId) => {
    handleClose(() => {
      onSelectChapter(chapterId);
    });
  };

  return (
    // The `onLayout` prop is a necessary workaround to ensure the inner Pressable can be pressed.
    <View style={StyleSheet.absoluteFill} onLayout={() => {}}>
      {/* The backdrop that closes the modal when pressed. */}
      <Pressable onPress={() => handleClose()} style={StyleSheet.absoluteFill}>
        <Animated.View style={[styles.backdrop, animatedBackdropStyle]} />
      </Pressable>
      
      {/* A container to center the modal content. */}
      <View style={styles.centeredContainer} pointerEvents="box-none">
        <Animated.View style={[styles.modalContainer, animatedModalStyle]}>
          <BlurView intensity={100} tint="dark" style={StyleSheet.absoluteFill} />
          
          <View style={styles.header}>
            <Text style={styles.modalTitle}>Chapters</Text>
            <TouchableOpacity onPress={() => handleClose()} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* The scrollable list of chapters. */}
          <FlatList
            data={chapters}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ChapterItem 
                item={item} 
                isCurrent={item.id === currentChapterId} 
                onSelect={() => handleSelect(item.id)}
              />
            )}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
          />
        </Animated.View>
      </View>
    </View>
  );
};

// --- Stylesheet ---
const styles = StyleSheet.create({
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.7)',
    },
    centeredContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: { 
        width: '90%', 
        maxHeight: '70%', 
        borderRadius: 24, 
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: Colors.surface + '80',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: Colors.surface + '80',
    },
    modalTitle: { 
        fontFamily: 'Poppins_600SemiBold', 
        color: Colors.text, 
        fontSize: 18,
    },
    closeButton: {
        padding: 5,
    },
    chapterButton: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        paddingVertical: 16, 
        borderBottomWidth: StyleSheet.hairlineWidth, 
        borderBottomColor: Colors.surface + '80' 
    },
    chapterLabel: { 
        fontFamily: 'Poppins_400Regular', 
        color: Colors.textSecondary, 
        fontSize: 16,
        flex: 1, // Ensures text doesn't push the icon off-screen.
        marginRight: 10,
    },
    chapterLabelActive: { 
        fontFamily: 'Poppins_600SemiBold', 
        color: Colors.secondary 
    },
});

export default ChapterListModal;