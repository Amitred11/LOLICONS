// screens/social/AddFriendScreen.js

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@config/Colors';
import { friendsPresence } from '@config/mockData';
import { useNavigation } from '@react-navigation/native';
import { ScreenHeader, FriendListItem } from './components/ChatUI'; // Re-use our components
import { Ionicons } from '@expo/vector-icons';

const AddFriendScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [username, setUsername] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [feedback, setFeedback] = useState({ message: 'Search for a user by their exact username.', type: 'info' });
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = () => {
    if (username.trim().length === 0) return;
    
    setIsLoading(true);
    setSearchResult(null);

    // Simulate a network request
    setTimeout(() => {
      const userFound = friendsPresence.find(f => f.name.toLowerCase() === username.trim().toLowerCase());
      
      if (userFound) {
        setSearchResult(userFound);
        setFeedback({ message: '', type: 'none' });
      } else {
        setFeedback({ message: `No user found with the name "${username}".`, type: 'error' });
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleSendRequest = () => {
    // Navigate back to the Friends screen and pass the new request as a parameter.
    // The FriendsScreen will listen for this parameter and update its state.
    navigation.navigate('Friends', { newRequest: searchResult });
  };

  const getFeedbackColor = () => {
      if(feedback.type === 'error') return Colors.danger;
      if(feedback.type === 'success') return Colors.success;
      return Colors.textSecondary;
  }

  return (
    <View style={styles.container}>
      <View style={{ paddingTop: insets.top }}>
        <ScreenHeader title="Add Friend" onBack={() => navigation.goBack()} />
      </View>
      
      <View style={styles.content}>
        <Text style={styles.instructions}>You can add a friend with their username. It's case-sensitive!</Text>
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter a username"
            placeholderTextColor={Colors.textSecondary}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch} disabled={isLoading}>
            <Ionicons name="search" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.resultContainer}>
          {isLoading && <ActivityIndicator size="large" color={Colors.primary} />}
          
          {feedback.message && !isLoading && (
            <Text style={[styles.feedbackText, { color: getFeedbackColor() }]}>{feedback.message}</Text>
          )}

          {searchResult && !isLoading && (
            <View style={styles.resultCard}>
              <FriendListItem item={searchResult} />
              <TouchableOpacity style={styles.sendRequestButton} onPress={handleSendRequest}>
                <Text style={styles.sendRequestButtonText}>Send Friend Request</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.darkBackground },
  content: { padding: 20 },
  instructions: { fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, fontSize: 15, textAlign: 'center', marginBottom: 20 },
  inputContainer: { flexDirection: 'row', backgroundColor: Colors.surface, borderRadius: 12, alignItems: 'center' },
  input: { flex: 1, height: 50, paddingHorizontal: 15, fontFamily: 'Poppins_500Medium', color: Colors.text, fontSize: 16 },
  searchButton: { padding: 12, backgroundColor: Colors.primary, borderTopRightRadius: 12, borderBottomRightRadius: 12 },
  resultContainer: { marginTop: 30, minHeight: 150, justifyContent: 'center' },
  resultCard: { backgroundColor: Colors.surface, borderRadius: 12, overflow: 'hidden' },
  feedbackText: { fontFamily: 'Poppins_500Medium', textAlign: 'center', fontSize: 15 },
  sendRequestButton: { backgroundColor: Colors.primary, padding: 15, alignItems: 'center', borderBottomLeftRadius: 12, borderBottomRightRadius: 12 },
  sendRequestButtonText: { fontFamily: 'Poppins_600SemiBold', color: '#fff', fontSize: 16 },
});

export default AddFriendScreen;