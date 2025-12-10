import React from 'react';
import { View, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@config/Colors';

const SearchBar = ({ value, onChangeText, isSearching, onClear }) => {
  return (
    <View style={styles.searchBar}>
      <Ionicons name="search" size={18} color={Colors.textSecondary} />
      
      <TextInput 
        placeholder="Search all users..." 
        placeholderTextColor={Colors.textSecondary} 
        style={styles.searchInput} 
        value={value} 
        onChangeText={onChangeText}
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
      />
      
      {value.length > 0 && isSearching && (
        <ActivityIndicator size="small" color={Colors.primary} />
      )}
      
      {value.length > 0 && !isSearching && (
        <TouchableOpacity onPress={onClear} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="close-circle" size={16} color={Colors.textSecondary} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  searchBar: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#1C1C1E', 
    height: 46, 
    borderRadius: 16, 
    paddingHorizontal: 15, 
    marginBottom: 15, 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.05)' 
  },
  searchInput: { 
    flex: 1, 
    marginLeft: 10, 
    color: Colors.text,
    fontSize: 15,
    height: '100%' // Ensures touch area is full height
  },
});

export default SearchBar;