import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, 
  TouchableWithoutFeedback, KeyboardAvoidingView, Platform, Keyboard 
} from 'react-native';
import { Colors } from '@config/Colors'; // Adjust path if needed

const CONDITIONS = ['Any', 'New', 'Mint', 'Used'];

const MarketFilterModal = ({ visible, onClose, onApply, initialFilters }) => {
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [condition, setCondition] = useState('Any');

  useEffect(() => {
    if (visible) {
      // Load current filters when opening
      setMinPrice(initialFilters?.minPrice || '');
      setMaxPrice(initialFilters?.maxPrice || '');
      setCondition(initialFilters?.condition || 'Any');
    }
  }, [visible, initialFilters]);

  const handleApply = () => {
    onApply({ minPrice, maxPrice, condition });
    onClose();
  };

  const handleReset = () => {
    setMinPrice('');
    setMaxPrice('');
    setCondition('Any');
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <KeyboardAvoidingView 
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.modalContainer}
            >
              <View style={styles.handle} />
              <View style={styles.header}>
                <Text style={styles.title}>Filter Items</Text>
                <TouchableOpacity onPress={handleReset}>
                  <Text style={styles.resetText}>Reset</Text>
                </TouchableOpacity>
              </View>

              {/* Price Range */}
              <Text style={styles.label}>Price Range (₱)</Text>
              <View style={styles.row}>
                <View style={styles.inputWrapper}>
                  <Text style={styles.currencyPrefix}>₱</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Min"
                    placeholderTextColor={Colors.textSecondary}
                    keyboardType="numeric"
                    value={minPrice}
                    onChangeText={setMinPrice}
                  />
                </View>
                <Text style={styles.dash}>-</Text>
                <View style={styles.inputWrapper}>
                  <Text style={styles.currencyPrefix}>₱</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Max"
                    placeholderTextColor={Colors.textSecondary}
                    keyboardType="numeric"
                    value={maxPrice}
                    onChangeText={setMaxPrice}
                  />
                </View>
              </View>

              {/* Condition */}
              <Text style={styles.label}>Condition</Text>
              <View style={styles.tagsContainer}>
                {CONDITIONS.map((c) => (
                  <TouchableOpacity
                    key={c}
                    onPress={() => setCondition(c)}
                    style={[
                      styles.tag,
                      condition === c && styles.tagActive
                    ]}
                  >
                    <Text style={[
                      styles.tagText,
                      condition === c && styles.tagTextActive
                    ]}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Buttons */}
              <TouchableOpacity style={styles.applyBtn} onPress={handleApply}>
                <Text style={styles.applyBtnText}>Show Results</Text>
              </TouchableOpacity>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#334155',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text, // Ensure Colors.text is white or light
  },
  resetText: {
    color: Colors.primary,
    fontWeight: '600',
    fontSize: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
    borderWidth: 1,
    borderColor: '#334155',
  },
  currencyPrefix: {
    color: Colors.textSecondary,
    fontSize: 16,
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: Colors.text,
    fontSize: 16,
    height: '100%',
  },
  dash: {
    color: Colors.textSecondary,
    marginHorizontal: 10,
    fontSize: 20,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 30,
  },
  tag: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: '#334155',
  },
  tagActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  tagText: {
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  tagTextActive: {
    color: '#FFF',
  },
  applyBtn: {
    backgroundColor: Colors.primary,
    height: 54,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    elevation: 4,
  },
  applyBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default MarketFilterModal;