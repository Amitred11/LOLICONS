// components/ui/StyledInput.js

import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@config/Colors';

/**
 * A reusable, styled text input component with a label, icon, and error handling.
 * Now supports a right-side icon (e.g., for password visibility toggling).
 * 
 * @param {object} props - The component props.
 * @param {string} props.label - The text label displayed above the input.
 * @param {string} props.icon - The name of the Ionicons icon to display on the left.
 * @param {string} [props.rightIcon] - The name of the Ionicons icon to display on the right.
 * @param {function} [props.onRightIconPress] - Function to handle presses on the right icon.
 * @param {string} [props.error] - An optional error message to display below the input.
 * @param {object} ...props - Any other standard TextInput props.
 */
const StyledInput = ({ label, icon, rightIcon, onRightIconPress, error, ...props }) => {
  return (
    <View style={styles.container}>
      {/* The label for the input field. */}
      <Text style={styles.label}>{label}</Text>
      
      {/* The container for the icon and the text input. */}
      <View style={[styles.inputContainer, error ? styles.errorBorder : null]}>
        {/* Left Icon */}
        <Ionicons name={icon} size={22} color={Colors.textSecondary} style={styles.icon} />
        
        {/* Text Input */}
        <TextInput
          style={styles.input}
          placeholderTextColor={Colors.textSecondary}
          {...props} 
        />

        {/* Right Icon (Optional) */}
        {rightIcon && (
          <TouchableOpacity onPress={onRightIconPress} style={styles.rightIconBtn}>
            <Ionicons name={rightIcon} size={22} color={Colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>
      
      {/* Conditionally render the error message if it exists. */}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    minHeight: 90, 
  },
  label: {
    fontFamily: 'Poppins_500Medium',
    color: Colors.textSecondary,
    fontSize: 14,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    height: 58,
  },
  icon: {
    marginLeft: 15,
    marginRight: 10,
  },
  input: {
    flex: 1, 
    fontFamily: 'Poppins_400Regular',
    fontSize: 16,
    color: Colors.text,
    height: '100%',
    // If there is no right icon, the input needs padding on the right. 
    // If there IS a right icon, the icon button provides the spacing.
    paddingRight: 10, 
  },
  rightIconBtn: {
    paddingHorizontal: 15,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorBorder: {
    borderColor: Colors.danger,
  },
  errorText: {
    fontFamily: 'Poppins_400Regular',
    color: Colors.danger,
    fontSize: 13,
    marginTop: 6,
    paddingLeft: 5,
  },
});

export default StyledInput;