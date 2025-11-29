// screens/comics/components/DownloadModal.js

// Import essential modules from React, React Native, and third-party libraries.
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, TouchableOpacity, FlatList, Alert } from 'react-native';
import { Colors } from '../../../constants/Colors';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useDownloads } from '../../../context/DownloadContext'; // Context for download state and logic.
import Svg, { Circle } from 'react-native-svg';

/**
 * A circular progress ring component built with SVG.
 * @param {object} props - The component's properties.
 * @param {number} props.progress - The progress value (0 to 1).
 * @param {number} [props.size=24] - The width and height of the ring.
 */
const ProgressRing = ({ progress, size = 24 }) => {
    const strokeWidth = 2.5;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    // The `strokeDashoffset` property is used to create the progress effect.
    // A full offset means the stroke is invisible; a zero offset means it's fully visible.
    const strokeDashoffset = circumference * (1 - progress);
    return (
        <View style={{width: size, height: size}}>
            <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                {/* The background track of the ring */}
                <Circle cx={size/2} cy={size/2} r={radius} stroke={Colors.surface + '80'} strokeWidth={strokeWidth} />
                {/* The foreground progress indicator of the ring */}
                <Circle cx={size/2} cy={size/2} r={radius} stroke={Colors.secondary} strokeWidth={strokeWidth} 
                    strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round"
                    transform={`rotate(-90 ${size/2} ${size/2})`}
                />
            </Svg>
        </View>
    )
};

/**
 * A component for a single chapter item in the download selection list.
 * It displays the chapter's status (downloaded, queued, etc.) and allows for selection.
 * @param {object} props - The component's properties.
 * @param {object} props.item - The chapter data object.
 * @param {function} props.onToggle - Callback to toggle the selection state.
 * @param {boolean} props.isSelected - True if the chapter is currently selected.
 */
const ChapterDownloadItem = ({ item, onToggle, isSelected }) => {
    const { getChapterStatus } = useDownloads(); // Hook to get status from the context.
    const { status, progress } = getChapterStatus(item.comicId, item.id);
    const isDisabled = status !== 'none'; // Disable selection if already downloaded or in queue.

    return (
        <TouchableOpacity 
            style={[styles.chapterRow, isSelected && styles.chapterRowSelected, isDisabled && styles.chapterRowDisabled]} 
            onPress={onToggle}
            activeOpacity={0.7}
            disabled={isDisabled}
        >
            <Ionicons 
                name={isSelected ? "checkbox" : "square-outline"}
                size={24}
                color={isSelected ? Colors.secondary : Colors.text}
            />
            <Text style={[styles.chapterTitle, isSelected && styles.chapterTitleSelected]} numberOfLines={1}>{item.title}</Text>
            {/* Display the correct status indicator based on the chapter's state */}
            {status === 'downloaded' && <Ionicons name="checkmark-circle" size={24} color={Colors.secondary} />}
            {(status === 'queued' || status === 'downloading') && <ProgressRing progress={progress} size={24} />}
        </TouchableOpacity>
    );
};

/**
 * A modal for selecting and downloading comic chapters.
 * @param {object} props - The component's properties.
 * @param {boolean} props.isVisible - Controls the visibility of the modal.
 * @param {function} props.onClose - A callback function to close the modal.
 * @param {object} props.comic - The comic object containing chapters and other metadata.
 * @param {object} props.comicPages - The object containing the source data for the comic's pages, required for downloading.
 */
const DownloadModal = ({ isVisible, onClose, comic, comicPages }) => {
  const { downloadChapters, getChapterStatus } = useDownloads();
  const [selectedChapters, setSelectedChapters] = useState([]);
  const modalProgress = useSharedValue(0); // For the entry/exit animation.

  // Animate the modal in or out when `isVisible` changes.
  useEffect(() => {
    if (isVisible) setSelectedChapters([]); // Reset selection when modal opens.
    modalProgress.value = withSpring(isVisible ? 1 : 0, { damping: 18, stiffness: 200 });
  }, [isVisible]);

  // Animated styles for the backdrop and the modal container.
  const animatedBackdropStyle = useAnimatedStyle(() => ({ opacity: modalProgress.value }));
  const animatedModalStyle = useAnimatedStyle(() => ({
    opacity: modalProgress.value,
    transform: [{ scale: 0.9 + modalProgress.value * 0.1 }],
  }));

  // Toggles a single chapter's selection state.
  const toggleChapterSelection = (chapterId) => {
    setSelectedChapters(prev => 
        prev.includes(chapterId) ? prev.filter(id => id !== chapterId) : [...prev, chapterId]
    );
  };

  // Initiates the download process with the selected chapters.
  const handleDownload = () => {
    if (selectedChapters.length > 0) {
      if (!comicPages) {
        console.error("DownloadModal: `comicPages` prop is missing.");
        Alert.alert("Error", "Could not start download. Page data is missing.");
        onClose();
        return;
      }
      downloadChapters(comic.id, selectedChapters, { cover: comic.localSource, pages: comicPages });
    }
    onClose();
  };
  
  // Selects all chapters that are not already downloaded or queued.
  const handleSelectAll = () => {
      const allUndownloadedIds = comic.chapters
        .filter(c => getChapterStatus(comic.id, c.id).status === 'none')
        .map(c => c.id);
      setSelectedChapters(allUndownloadedIds);
  };
  
  // Selects all available chapters between the first and last selected chapters.
  const handleSelectRange = () => {
      if (selectedChapters.length < 2) {
          Alert.alert("Select Range", "Please select at least two chapters to define a range.");
          return;
      }
      // Create a map of chapter IDs to their index for efficient lookups.
      const chapterIndexMap = new Map(comic.chapters.map((c, i) => [c.id, i]));
      const selectedIndices = selectedChapters.map(id => chapterIndexMap.get(id)).filter(index => index !== undefined);
      // Find the min and max indices from the current selection.
      const minIndex = Math.min(...selectedIndices);
      const maxIndex = Math.max(...selectedIndices);
      // Get all chapters within that range.
      const chaptersInRange = comic.chapters.slice(minIndex, maxIndex + 1);
      // Filter for chapters that are available to download and add them to the selection.
      const availableIdsInRange = chaptersInRange.filter(c => getChapterStatus(comic.id, c.id).status === 'none').map(c => c.id);
      const updatedSelection = new Set([...selectedChapters, ...availableIdsInRange]);
      setSelectedChapters(Array.from(updatedSelection));
  };

  // To prevent the modal from rendering when invisible, which can improve performance.
  if (!isVisible && modalProgress.value === 0) return null;

  return (
    <View style={[StyleSheet.absoluteFill, styles.backdrop]} pointerEvents={isVisible ? 'auto' : 'none'}>
        <Pressable onPress={onClose} style={StyleSheet.absoluteFill}>
            <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.7)' }, animatedBackdropStyle]} />
        </Pressable>
        
        <Pressable>{/* Prevents touches from passing through the modal content. */}
            <Animated.View style={[styles.modalContainer, animatedModalStyle]}>
                <BlurView intensity={100} tint="dark" style={StyleSheet.absoluteFillObject} />
                <View style={styles.header}>
                    <Text style={styles.modalTitle}>Download Chapters</Text>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}><Ionicons name="close" size={28} color={Colors.textSecondary} /></TouchableOpacity>
                </View>

                {/* Header with selection helper buttons */}
                <View style={styles.selectionHeader}>
                    <TouchableOpacity onPress={handleSelectAll}><Text style={styles.headerActionText}>Select All</Text></TouchableOpacity>
                    <TouchableOpacity onPress={handleSelectRange}><Text style={styles.headerActionText}>Select Range</Text></TouchableOpacity>
                    <TouchableOpacity onPress={() => setSelectedChapters([])}><Text style={styles.headerActionText}>Clear</Text></TouchableOpacity>
                </View>

                <FlatList
                    data={comic.chapters.map(c => ({...c, comicId: comic.id}))} // Pass comicId to each item
                    keyExtractor={item => item.id}
                    renderItem={({item}) => 
                        <ChapterDownloadItem 
                            item={item}
                            isSelected={selectedChapters.includes(item.id)}
                            onToggle={() => toggleChapterSelection(item.id)}
                        />
                    }
                    contentContainerStyle={{ paddingHorizontal: 24 }}
                />

                <View style={styles.footer}>
                    <TouchableOpacity 
                        onPress={handleDownload} 
                        style={[styles.footerButton, { opacity: selectedChapters.length === 0 ? 0.5 : 1 }]} 
                        disabled={selectedChapters.length === 0}
                    >
                        <Ionicons name="download-outline" size={22} color={Colors.background} />
                        <Text style={styles.footerButtonText}>Download ({selectedChapters.length})</Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </Pressable>
    </View>
  );
};

// --- Stylesheet ---
const styles = StyleSheet.create({
    backdrop: { justifyContent: 'center', alignItems: 'center', zIndex: 100 },
    modalContainer: { borderRadius: 28, width: '92%', maxHeight: '90%', overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 30, elevation: 20, borderWidth: 1, borderColor: Colors.text + '22' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 24, paddingHorizontal: 24, paddingBottom: 16 },
    modalTitle: { fontFamily: 'Poppins_600SemiBold', color: Colors.text, fontSize: 22 },
    closeButton: { padding: 4, bottom: 4, left: 10 },
    selectionHeader: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', marginHorizontal: 24, marginBottom: 16, paddingVertical: 10, backgroundColor: Colors.text + '0A', borderRadius: 12 },
    headerActionText: { fontFamily: 'Poppins_500Medium', color: Colors.secondary, fontSize: 14 },
    chapterRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.textSecondary + '1A', borderRadius: 12, paddingHorizontal: 12, marginVertical: 2 },
    chapterRowSelected: { backgroundColor: Colors.secondary + '2A', borderColor: Colors.secondary + '88', borderWidth: 1 },
    chapterRowDisabled: { opacity: 0.5 },
    chapterTitle: { fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, fontSize: 17, marginLeft: 16, flex: 1 },
    chapterTitleSelected: { fontFamily: 'Poppins_500Medium', color: Colors.text },
    footer: { padding: 24, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: Colors.textSecondary + '22', backgroundColor: Colors.text + '11' },
    footerButton: { backgroundColor: Colors.secondary, paddingVertical: 16, borderRadius: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', shadowColor: Colors.secondary, shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 4}, elevation: 8 },
    footerButtonText: { fontFamily: 'Poppins_600SemiBold', fontSize: 17, color: Colors.background, marginLeft: 10 },
});

export default DownloadModal;