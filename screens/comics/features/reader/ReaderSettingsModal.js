// screens/comics/components/ReaderSettingsModal.js

// Import essential modules from React and React Native.
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, withSpring, withTiming, useSharedValue, runOnJS } from 'react-native-reanimated';
import { Colors } from '../../../../constants/Colors';
import { BlurView } from 'expo-blur';

/**
 * A pressable button component used within the settings modal.
 * @param {object} props - The component's properties.
 * @param {string} props.icon - The name of the Ionicons icon to display.
 * @param {string} props.label - The text label for the button.
 * @param {boolean} props.isActive - If true, the button is styled as active.
 * @param {function} props.onPress - The function to call when the button is pressed.
 */
const SettingButton = ({ icon, label, isActive, onPress }) => (
  <Pressable
    onPress={onPress}
    style={[styles.settingButton, isActive && styles.settingButtonActive]}
  >
    <Ionicons name={icon} size={26} color={isActive ? Colors.secondary : Colors.textSecondary} />
    <Text style={[styles.settingLabel, isActive && styles.settingLabelActive]}>{label}</Text>
  </Pressable>
);

/**
 * A modal that displays settings for the comic reader, such as reading mode and page fit.
 * This is a "controlled component" where the parent screen manages the state.
 * @param {object} props - The component's properties.
 * @param {function} props.onClose - A callback function to close the modal.
 * @param {object} props.settings - The current settings state object from the parent.
 * @param {function} props.onSettingChange - A callback function to notify the parent of a setting change. It receives the setting key and new value.
 */
const ReaderSettingsModal = ({ onClose, settings, onSettingChange }) => {
  // Shared values for the modal's entry and exit animations.
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);

  // Trigger the "animate in" effect when the component mounts.
  useEffect(() => {
    scale.value = withSpring(1, { damping: 18, stiffness: 250 });
    opacity.value = withTiming(1);
  }, []);

  // Animated styles driven by the shared values.
  const animatedModalStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));
  const animatedBackdropStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  // Function to animate the modal out and then call the onClose callback.
  const handleClose = () => {
    scale.value = withSpring(0.8, { damping: 18, stiffness: 250 });
    opacity.value = withTiming(0, {}, () => {
      // `runOnJS` safely executes the `onClose` function on the JS thread after the animation is complete.
      runOnJS(onClose)();
    });
  };

  return (
    // The onLayout prop is a necessary workaround for Pressable inside an absolute view.
    <View style={StyleSheet.absoluteFill} onLayout={() => {}}>
      {/* The backdrop that closes the modal when pressed. */}
      <Pressable onPress={handleClose} style={StyleSheet.absoluteFill}>
        <Animated.View style={[styles.backdrop, animatedBackdropStyle]} />
      </Pressable>

      <View style={styles.centeredContainer} pointerEvents="box-none">
        <Animated.View style={[styles.modalContainer, animatedModalStyle]}>
          <BlurView intensity={100} tint="dark" style={StyleSheet.absoluteFill} />

          <View style={styles.header}>
            <Text style={styles.modalTitle}>Reader Settings</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.content}>
            {/* Reading Mode Setting Group */}
            <View style={styles.settingGroup}>
              <Text style={styles.groupTitle}>Reading Mode</Text>
              <View style={styles.buttonRow}>
                <SettingButton icon="swap-horizontal-outline" label="Horizontal" isActive={settings.mode === 'horizontal'} onPress={() => onSettingChange('mode', 'horizontal')} />
                <SettingButton icon="swap-vertical-outline" label="Vertical" isActive={settings.mode === 'vertical'} onPress={() => onSettingChange('mode', 'vertical')} />
              </View>
            </View>

            {/* Page Fit Setting Group */}
            <View style={styles.settingGroup}>
              <Text style={styles.groupTitle}>Page Fit</Text>
              <View style={styles.buttonRow}>
                <SettingButton icon="scan-outline" label="Fit" isActive={settings.fit === 'contain'} onPress={() => onSettingChange('fit', 'contain')} />
                <SettingButton icon="expand-outline" label="Fill" isActive={settings.fit === 'cover'} onPress={() => onSettingChange('fit', 'cover')} />
              </View>
            </View>
          </View>
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
    content: {
        padding: 20,
    },
    settingGroup: { 
        marginBottom: 20, 
    },
    groupTitle: { 
        fontFamily: 'Poppins_500Medium', 
        color: Colors.textSecondary, 
        fontSize: 14, 
        marginBottom: 10, 
    },
    buttonRow: { 
        flexDirection: 'row', 
        flexWrap: 'wrap',
    },
    settingButton: { 
        flex: 1, // Make buttons take up equal space in the row.
        alignItems: 'center', 
        justifyContent: 'center', 
        backgroundColor: 'rgba(255,255,255,0.05)', 
        borderRadius: 12, 
        paddingVertical: 12, 
        margin: 5,
        minHeight: 80,
    },
    settingButtonActive: { 
        backgroundColor: Colors.secondary + '22',
        borderColor: Colors.secondary,
        borderWidth: 1,
    },
    settingLabel: { 
        fontFamily: 'Poppins_400Regular', 
        color: Colors.textSecondary, 
        fontSize: 12, 
        marginTop: 6 
    },
    settingLabelActive: { 
        color: Colors.secondary,
        fontFamily: 'Poppins_500Medium',
    },
});

export default ReaderSettingsModal;