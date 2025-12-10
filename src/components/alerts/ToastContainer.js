import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // Import this
import Toast from './Toast';

const ToastContainer = ({ toasts, onHide }) => {
  const insets = useSafeAreaInsets();

  return (
    <View 
      style={[styles.wrapper, { paddingTop: insets.top }]} 
      pointerEvents="box-none" // Allows clicks to pass through empty spaces
    >
      {/* 
        FIX: Added pointerEvents="none" 
        This prevents the transparent gradient from blocking clicks on your Header 
      */}
      <LinearGradient
        colors={['rgba(0,0,0,0.25)', 'transparent']}
        style={styles.background}
        pointerEvents="none" 
      />

      <View style={styles.container} pointerEvents="box-none">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            {...toast}
            onHide={() => onHide(toast.id)}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    elevation: 2000,
    // Removed fixed height so it doesn't block bottom interaction
  },

  background: {
    height: 120,
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },

  container: {
    paddingHorizontal: 12,
    paddingTop: 10, // Small buffer from the status bar
    gap: 8,
    // Ensures the container itself allows clicks to pass through to the header
    // strictly where there are no toasts
  },
});

export default ToastContainer;