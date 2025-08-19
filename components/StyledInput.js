// Import necessary modules from React and React Native.
import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

/**
 * A reusable, styled text input component with a label, icon, and error handling.
 * @param {object} props - The component props.
 * @param {string} props.label - The text label displayed above the input.
 * @param {string} props.icon - The name of the Ionicons icon to display inside the input.
 * @param {string} [props.error] - An optional error message to display below the input.
 * @param {object} ...props - Any other standard TextInput props to be passed to the component.
 */
const StyledInput = ({ label, icon, error, ...props }) => {
  return (
    <View style={styles.container}>
      {/* The label for the input field. */}
      <Text style={styles.label}>{label}</Text>
      
      {/* The container for the icon and the text input. */}
      {/* Applies an error style if an error message is present. */}
      <View style={[styles.inputContainer, error ? styles.errorBorder : null]}>
        <Ionicons name={icon} size={22} color={Colors.textSecondary} style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholderTextColor={Colors.textSecondary}
          {...props} // Pass through all other props (e.g., value, onChangeText, etc.).
        />
      </View>
      
      {/* Conditionally render the error message if it exists. */}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

// Define the styles for the component.
const styles = StyleSheet.create({
  container: {
    width: '100%',
    minHeight: 90, // Set a minimum height to prevent layout shifts when error appears.
  },
  label: {
    fontFamily: 'Poppins_500Medium',
    color: Colors.textSecondary,
    fontSize: 14,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row', // Align icon and input field horizontally.
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    height: 58,
  },
  icon: {
    marginHorizontal: 15, // Add spacing around the icon.
  },
  input: {
    flex: 1, // Allow the input field to take up the remaining space.
    fontFamily: 'Poppins_400Regular',
    fontSize: 16,
    color: Colors.text,
    paddingRight: 15, // Add padding to the right to avoid text touching the edge.
  },
  errorBorder: {
    borderColor: Colors.danger, // Change border color to indicate an error.
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