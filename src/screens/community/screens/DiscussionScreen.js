import React, { useCallback } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, 
  StatusBar, Image, Platform, ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import PostCard from '../components/PostCard';
import { useCommunity } from '@context/CommunityContext'; // Import Hook

const DiscussionScreen = ({ route, navigation }) => {
  const { guildName, guildId } = route.params;
  
  // 1. Use Context
  const { 
    posts, 
    fetchPosts, 
    togglePostLike, 
    isLoadingPosts 
  } = useCommunity();

  // 2. Load posts when screen focuses or guildId changes
  useFocusEffect(
    useCallback(() => {
      fetchPosts(guildId);
    }, [guildId, fetchPosts])
  );

  const navigateToCreate = () => {
    navigation.navigate('CreatePost', { guildName, guildId });
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backIcon}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
           <View>
             <Text style={styles.headerTitle}>#{guildName}</Text>
           </View>
           <View>
             <Text style={styles.headerSub}>General Discussion</Text>
           </View>
        </View>
        <TouchableOpacity style={styles.menuIcon}>
          <Ionicons name="information-circle-outline" size={26} color="#FFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.inputContainer}>
        <Image 
          source={{ uri: 'https://ui-avatars.com/api/?name=Current+User&background=random' }} 
          style={styles.inputAvatar} 
        />
        <TouchableOpacity 
          style={styles.inputBox} 
          activeOpacity={0.9}
          onPress={navigateToCreate} 
        >
          <Text style={styles.placeholderText}>Start a discussion...</Text>
          <Ionicons name="images-outline" size={20} color="#94A3B8" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
      
      {isLoadingPosts ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366F1" />
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <PostCard 
              item={item} 
              onLike={() => togglePostLike(item.id)} // Use Context Action
              onPress={() => {}} 
            />
          )}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
               <Text style={styles.emptyText}>No posts yet. Be the first!</Text>
            </View>
          }
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={navigateToCreate}>
        <Ionicons name="add" size={30} color="#FFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 10,
    paddingHorizontal: 20, paddingBottom: 20, backgroundColor: '#0F172A',
    borderBottomWidth: 1, borderBottomColor: '#1E293B'
  },
  headerTop: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    marginBottom: 20 
  },
  headerTitleContainer: {
    alignItems: 'center' 
  },  
  backIcon: { padding: 8, marginLeft: -8 },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  headerSub: { color: '#94A3B8', fontSize: 12, textAlign: 'center' },
  menuIcon: { padding: 8, marginRight: -8 },
  inputContainer: { flexDirection: 'row', alignItems: 'center' },
  inputAvatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
  inputBox: { 
    flex: 1, height: 44, backgroundColor: '#1E293B', borderRadius: 22, 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15,
    borderWidth: 1, borderColor: '#334155'
  },
  placeholderText: { color: '#64748B', fontSize: 14 },
  listContent: { paddingBottom: 100 },
  emptyContainer: { padding: 40, alignItems: 'center' },
  emptyText: { color: '#64748B', fontStyle: 'italic' },
  fab: {
    position: 'absolute', bottom: 30, right: 20, width: 56, height: 56, borderRadius: 28,
    backgroundColor: '#6366F1', justifyContent: 'center', alignItems: 'center',
    shadowColor: '#6366F1', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, elevation: 6
  }
});

export default DiscussionScreen;