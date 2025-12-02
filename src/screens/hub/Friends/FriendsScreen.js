import React from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '@config/Colors';
import FriendItem from './components/FriendItem'; // Import from local component folder

const FRIENDS_DATA = [
  { id: '1', name: 'Jessica Parker', status: 'Online', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400' },
  { id: '2', name: 'David Miller', status: 'Offline', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400' },
  { id: '3', name: 'Sarah Connor', status: 'Playing: Halo', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400' },
];

const FriendsScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      
      {/* Playful Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>The Squad</Text>
        <View style={{ width: 24 }} /> 
      </View>

      {/* Modern Search */}
      <View style={styles.searchWrapper}>
        <Ionicons name="search" size={20} color={Colors.textSecondary} style={{ marginRight: 10 }} />
        <TextInput 
            placeholder="Find your people..." 
            placeholderTextColor={Colors.textSecondary}
            style={styles.searchInput}
        />
      </View>

      <FlatList
        data={FRIENDS_DATA}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 20 }}
        ListHeaderComponent={<Text style={styles.subHeader}>All Friends ({FRIENDS_DATA.length})</Text>}
        renderItem={({ item }) => (
          <FriendItem 
            item={item} 
            onPress={() => navigation.navigate('ChatDetail', { user: item })} 
          />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 20 },
  backBtn: { padding: 8, backgroundColor: Colors.surface, borderRadius: 12 },
  headerTitle: { fontFamily: 'Poppins_700Bold', color: Colors.text, fontSize: 20 },
  
  searchWrapper: { 
    flexDirection: 'row', alignItems: 'center', 
    backgroundColor: '#1E1E1E', 
    marginHorizontal: 20, padding: 15, borderRadius: 20, 
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
    marginBottom: 10
  },
  searchInput: { color: Colors.text, flex: 1, fontFamily: 'Poppins_500Medium', fontSize: 14 },
  
  subHeader: { color: Colors.primary, fontFamily: 'Poppins_600SemiBold', fontSize: 12, marginBottom: 15, textTransform: 'uppercase', letterSpacing: 1 }
});

export default FriendsScreen;