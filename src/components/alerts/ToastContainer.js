import React from 'react';
import { View, StyleSheet } from 'react-native';
import Toast from './Toast';

const ToastContainer = ({ toasts, onHide }) => {
  return (
    <View style={styles.container}>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          {...toast}
          onHide={() => onHide(toast.id)}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 2000,
  },
});

// Ensure this export line exists
export default ToastContainer;