// components/alerts/CustomPrompt.js
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Animated, Dimensions, TextInput } from 'react-native';
import { Colors } from '@config/Colors'; // Ensure your Colors path is correct

const { width } = Dimensions.get('window');

const CustomPrompt = ({
  visible,
  title,
  message,
  defaultValue = '',
  placeholder = 'Enter text here',
  onConfirm,
  onCancel,
}) => {
  const [inputValue, setInputValue] = useState(defaultValue);
  const scaleValue = useRef(new Animated.Value(0)).current;
  const opacityValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setInputValue(defaultValue); // Reset input value when visible
      Animated.parallel([
        Animated.spring(scaleValue, { toValue: 1, friction: 5, useNativeDriver: true }),
        Animated.timing(opacityValue, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.timing(opacityValue, { toValue: 0, duration: 200, useNativeDriver: true })
        .start(() => scaleValue.setValue(0));
    }
  }, [visible, defaultValue]);

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none">
      <View style={styles.overlay}>
        <Animated.View style={[styles.backdrop, { opacity: opacityValue }]} />
        
        <Animated.View style={[styles.promptContainer, { transform: [{ scale: scaleValue }] }]}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <TextInput
            style={styles.input}
            placeholder={placeholder}
            placeholderTextColor="#888"
            value={inputValue}
            onChangeText={setInputValue}
            autoFocus={true}
            returnKeyType="done"
            onSubmitEditing={() => onConfirm(inputValue)}
          />

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]} 
              onPress={onCancel}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.button, styles.confirmButton, { backgroundColor: Colors.primary || '#6200EE' }]} 
              onPress={() => onConfirm(inputValue)}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>Create</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0, 0, 0, 0.6)' },
  promptContainer: {
    width: width * 0.85,
    backgroundColor: '#1E1E1E',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    elevation: 10,
  },
  title: { fontSize: 20, fontWeight: '700', color: '#FFF', textAlign: 'center', marginBottom: 8 },
  message: { fontSize: 15, color: '#AAA', textAlign: 'center', marginBottom: 20, lineHeight: 22 },
  input: {
    width: '100%',
    backgroundColor: '#333',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    color: '#FFF',
    fontSize: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  buttonContainer: { flexDirection: 'row', width: '100%', justifyContent: 'space-between' },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    marginRight: 10,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  confirmButton: {
    marginLeft: 10,
  },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  cancelButtonText: { color: '#CCC', fontSize: 16, fontWeight: '600' },
});

export default CustomPrompt;