// screens/profile/components/QuietHoursModal.js

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, TouchableOpacity, Switch } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming, runOnJS } from 'react-native-reanimated';
import { Colors } from '@config/Colors';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

/**
 * A modal for setting "Quiet Hours" (Do Not Disturb).
 * @param {object} props - The component's properties.
 * @param {boolean} props.isVisible - Controls whether the modal is visible.
 * @param {function} props.onClose - A callback function to close the modal.
 * @param {object} props.initialSettings - The initial quiet hours settings.
 * @param {function} props.onSave - A callback to save the new settings.
 */
const QuietHoursModal = ({ isVisible, onClose, initialSettings, onSave }) => {
  // Local state to manage changes within the modal before saving.
  const [isEnabled, setIsEnabled] = useState(initialSettings?.enabled || false);
  const [startTime, setStartTime] = useState(initialSettings?.start || '10:00 PM');
  const [endTime, setEndTime] = useState(initialSettings?.end || '8:00 AM');

  const scale = useSharedValue(0.9);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (isVisible) {
      scale.value = withSpring(1, { damping: 15, stiffness: 150 });
      opacity.value = withTiming(1, { duration: 200 });
    }
  }, [isVisible]);

  const animatedModalStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));
  
  const animatedBackdropStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const handleClose = (callback) => {
    scale.value = withTiming(0.9, { duration: 200 });
    opacity.value = withTiming(0, { duration: 200 }, (isFinished) => {
        if (isFinished) {
            runOnJS(onClose)();
            if (callback) runOnJS(callback)();
        }
    });
  };

  const handleSave = () => {
    onSave({ enabled: isEnabled, start: startTime, end: endTime });
    handleClose();
  };
  
  const toggleEnabled = (value) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setIsEnabled(value);
  }

  if (!isVisible && opacity.value === 0) return null;

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents={isVisible ? 'auto' : 'none'}>
      <Pressable onPress={() => handleClose()} style={StyleSheet.absoluteFill}>
        <Animated.View style={[styles.backdrop, animatedBackdropStyle]}>
            <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
        </Animated.View>
      </Pressable>
      
      <View style={styles.centeredContainer} pointerEvents="box-none">
        <Animated.View style={[styles.modalContainer, animatedModalStyle]}>
          <BlurView intensity={100} tint="dark" style={StyleSheet.absoluteFill} />
          
          <View style={styles.header}>
            <Ionicons name="moon-outline" size={24} color={Colors.textSecondary} />
            <Text style={styles.title}>Quiet Hours</Text>
            <View style={{width: 24}} />
          </View>
          
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Enable Quiet Hours</Text>
            <Switch
                value={isEnabled}
                onValueChange={toggleEnabled}
                trackColor={{ false: Colors.surface, true: Colors.secondary }}
                thumbColor={isEnabled ? Colors.text : '#f4f3f4'}
                ios_backgroundColor={Colors.surface}
            />
          </View>

          <View style={[styles.timeRowContainer, !isEnabled && {opacity: 0.5}]}>
            <TouchableOpacity style={styles.timeButton} disabled={!isEnabled}>
                <Text style={styles.timeLabel}>From</Text>
                <Text style={styles.timeValue}>{startTime}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.timeButton} disabled={!isEnabled}>
                <Text style={styles.timeLabel}>To</Text>
                <Text style={styles.timeValue}>{endTime}</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.description}>
            When Quiet Hours are enabled, you will not receive any push notifications.
          </Text>
          
          <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.7)',
    },
    centeredContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContainer: { 
        width: '100%', 
        borderRadius: 24, 
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: Colors.surface + '80',
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 20,
    },
    title: {
        fontFamily: 'Poppins_600SemiBold',
        color: Colors.text,
        fontSize: 18,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: Colors.surface,
        borderRadius: 12,
        padding: 15,
    },
    rowLabel: {
        fontFamily: 'Poppins_500Medium',
        color: Colors.text,
        fontSize: 16,
    },
    timeRowContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
        gap: 10,
    },
    timeButton: {
        flex: 1,
        backgroundColor: Colors.surface,
        borderRadius: 12,
        padding: 15,
    },
    timeLabel: {
        fontFamily: 'Poppins_400Regular',
        color: Colors.textSecondary,
        fontSize: 13,
    },
    timeValue: {
        fontFamily: 'Poppins_600SemiBold',
        color: Colors.text,
        fontSize: 18,
        marginTop: 4,
    },
    description: {
        fontFamily: 'Poppins_400Regular',
        color: Colors.textSecondary,
        fontSize: 13,
        textAlign: 'center',
        marginTop: 20,
        lineHeight: 20,
    },
    saveButton: {
        backgroundColor: Colors.secondary,
        borderRadius: 16,
        paddingVertical: 14,
        marginTop: 20,
        alignItems: 'center',
    },
    saveButtonText: {
        fontFamily: 'Poppins_600SemiBold',
        color: Colors.background,
        fontSize: 16,
    },
});

export default QuietHoursModal;