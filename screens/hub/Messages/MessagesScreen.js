// screens/MessagesScreen.js

import React, { useState, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { Colors } from '../../../constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { directMessagesData, groupsData } from '../../../constants/mockData';
import { useNavigation } from '@react-navigation/native';
import { ScreenHeader, SearchInput, ChatListItem, GroupListItem } from './components/ChatUI';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp, FadeOutDown } from 'react-native-reanimated';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

// Initialize the Tab Navigator
const Tab = createMaterialTopTabNavigator();

// --- NEW COMPONENT: Tab for Direct Messages ---
const DirectMessagesTab = ({ searchQuery }) => {
  const filteredData = useMemo(() => {
    if (!searchQuery) return directMessagesData;
    return directMessagesData.filter(item =>
      item.friend.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  return (
    <FlatList
      data={filteredData}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <ChatListItem item={item} />}
      ItemSeparatorComponent={() => <View style={styles.divider} />}
      contentContainerStyle={styles.listContentContainer}
      style={styles.container}
    />
  );
};

// --- NEW COMPONENT: Tab for Groups ---
const GroupsTab = ({ searchQuery }) => {
  const filteredData = useMemo(() => {
    if (!searchQuery) return groupsData;
    return groupsData.filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  return (
    <FlatList
      data={filteredData}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <GroupListItem item={item} />}
      ItemSeparatorComponent={() => <View style={styles.divider} />}
      contentContainerStyle={styles.listContentContainer}
      style={styles.container}
    />
  );
};


// --- REFACTORED MAIN SCREEN ---
const MessagesScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');

  // This function will be called when the FAB is pressed.
  const handleCreateNewMessage = () => {
    navigation.navigate('Friends', { isSelecting: true });
  };

  return (
    <View style={styles.container}>
      <View style={{ paddingTop: insets.top, backgroundColor: Colors.darkBackground }}>
        <ScreenHeader 
            title="Messages" 
            onBack={() => navigation.goBack()}
        />
        <SearchInput 
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search DMs & Groups"
        />
      </View>

      {/* The Tab Navigator replaces the old SectionList */}
      <Tab.Navigator
        screenOptions={{
          tabBarStyle: { backgroundColor: Colors.darkBackground },
          tabBarLabelStyle: { fontFamily: 'Poppins_600SemiBold', textTransform: 'none', fontSize: 16 },
          tabBarIndicatorStyle: { backgroundColor: Colors.primary, height: 3 },
          tabBarActiveTintColor: Colors.text,
          tabBarInactiveTintColor: Colors.textSecondary,
        }}
      >
        <Tab.Screen name="Direct Messages">
          {() => <DirectMessagesTab searchQuery={searchQuery} />}
        </Tab.Screen>
        <Tab.Screen name="Groups">
          {() => <GroupsTab searchQuery={searchQuery} />}
        </Tab.Screen>
      </Tab.Navigator>

      {/* The FAB is now functional */}
      <Animated.View style={styles.fabContainer} entering={FadeInUp.delay(500)} exiting={FadeOutDown}>
        <TouchableOpacity style={styles.fab} activeOpacity={0.8} onPress={handleCreateNewMessage}>
            <Ionicons name="person-add-outline" size={28} color="#fff" />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.darkBackground },
  listContentContainer: { paddingBottom: 120 }, // Add padding for FAB visibility
  divider: { height: 1, backgroundColor: Colors.surface, marginLeft: 86, marginRight: 15 },
  fabContainer: { position: 'absolute', bottom: 30, right: 20 },
  fab: { 
    width: 60, height: 60, borderRadius: 30, 
    backgroundColor: Colors.primary, 
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.3, shadowRadius: 4.65, elevation: 8,
  },
});

export default MessagesScreen;