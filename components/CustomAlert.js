import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  Modal, 
  TouchableOpacity, 
  StyleSheet, 
  Animated, 
  Dimensions 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Assuming you use Expo or vector-icons
import { Colors } from '../constants/Colors'; // Your colors file

const { width } = Dimensions.get('window');

const CustomAlert = ({ visible, title, message, type = 'info', onClose, btnText = 'Got it' }) => {
  const scaleValue = useRef(new Animated.Value(0)).current;
  const opacityValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleValue, {
          toValue: 1,
          friction: 5,
          useNativeDriver: true,
        }),
        Animated.timing(opacityValue, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.timing(opacityValue, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => scaleValue.setValue(0));
    }
  }, [visible]);

  // Dynamic Styles based on type
  const getIcon = () => {
    switch(type) {
      case 'construction': return { name: 'construct', color: '#FFD700' };
      case 'error': return { name: 'alert-circle', color: '#FF4444' };
      case 'success': return { name: 'checkmark-circle', color: '#00C851' };
      default: return { name: 'information-circle', color: Colors.primary };
    }
  };

  const iconData = getIcon();

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none">
      <View style={styles.overlay}>
        <Animated.View style={[styles.backdrop, { opacity: opacityValue }]} />
        
        <Animated.View style={[styles.alertContainer, { transform: [{ scale: scaleValue }] }]}>
          <View style={styles.iconCircle}>
            <Ionicons name={iconData.name} size={40} color={iconData.color} />
          </View>
          
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <TouchableOpacity 
            style={[styles.button, { backgroundColor: Colors.primary || '#6200EE' }]} 
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>{btnText}</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  alertContainer: {
    width: width * 0.85,
    backgroundColor: '#1E1E1E', // Dark mode card background (Change to white if needed)
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)'
  },
  iconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF', // Change to black for light mode
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 15,
    color: '#AAA', // Change to gray for light mode
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  button: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CustomAlert;