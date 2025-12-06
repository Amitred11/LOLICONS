import React from 'react';
import { 
  Modal, 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@config/Colors'; // Adjust path based on your structure

const OptionsModal = ({ 
  visible, 
  onClose, 
  title = "Options", 
  options = [] 
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.overlay} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <View style={styles.container}>
          <View style={styles.handle} />
          <Text style={styles.title}>{title}</Text>

          {options.map((option, index) => {
            // Skip rendering if option is hidden/null
            if (!option) return null;

            return (
              <TouchableOpacity 
                key={index} 
                style={styles.optionRow} 
                onPress={() => {
                  onClose(); // Close modal first
                  // Small delay to allow animation to finish before action
                  setTimeout(() => {
                    option.onPress && option.onPress();
                  }, 200);
                }}
              >
                <Ionicons 
                  name={option.icon} 
                  size={22} 
                  color={option.color || '#FFF'} 
                />
                <Text style={[styles.optionText, { color: option.color || '#FFF' }]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}

          <View style={styles.divider} />

          <TouchableOpacity style={styles.optionRow} onPress={onClose}>
            <Ionicons name="close-circle-outline" size={22} color="#94A3B8" />
            <Text style={[styles.optionText, { color: '#94A3B8' }]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: Colors.surface, // Matches DiscussionScreen style
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 40,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#334155',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 15,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
  },
  optionText: {
    fontSize: 16,
    marginLeft: 15,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#334155',
    marginVertical: 10,
  },
});

export default OptionsModal;