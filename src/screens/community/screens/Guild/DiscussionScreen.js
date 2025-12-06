import React, { useCallback, useState } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, 
  StatusBar, Image, Platform, ActivityIndicator, Modal, RefreshControl,
  Share, Clipboard 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import PostCard from '../../components/PostCard'; 
import OptionsModal from '../../components/OptionsModal'; // IMPORT HERE
import { useCommunity } from '@context/main/CommunityContext';
import { useAlert } from '@context/other/AlertContext'; 
import { Colors } from '@config/Colors'; 

const DiscussionScreen = ({ route, navigation }) => {
  const { guildName, guildId } = route.params;
  const { 
    posts, fetchPosts, togglePostLike, isLoadingPosts, 
    fetchGuildDetails, currentGuild 
  } = useCommunity();
  const { showAlert } = useAlert();

  const [refreshing, setRefreshing] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  
  // -- Three Dots Menu State --
  const [optionsModalVisible, setOptionsModalVisible] = useState(false);
  const [selectedPostForOptions, setSelectedPostForOptions] = useState(null);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [guildId])
  );

  const loadData = async () => {
    await fetchPosts(guildId);
    await fetchGuildDetails(guildId); 
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const navigateToCreate = () => navigation.navigate('CreatePost', { guildName, guildId });
  
  const handleUserPress = (user) => {
    navigation.navigate('FriendProfile', { 
      userId: user.id || 'mock_id', 
      username: user.name || user.user
    });
  };

  const handlePostPress = (post) => {
    navigation.navigate('Thread', { post: post });
  };

  const handleShare = async (post) => {
    try {
      const result = await Share.share({
        message: `Check out this post from ${post.user}: "${post.content}"`,
      });
    } catch (error) {
      showAlert({ title: "Error", message: error.message, type: 'error' });
    }
  };

  const handleOpenOptions = (post) => {
    setSelectedPostForOptions(post);
    setOptionsModalVisible(true);
  };

  // --- BUILD MENU OPTIONS ---
  const menuOptions = [
    {
      label: 'Share Post',
      icon: 'share-outline',
      onPress: () => handleShare(selectedPostForOptions)
    },
    {
      label: 'Copy Text',
      icon: 'copy-outline',
      onPress: () => {
        Clipboard.setString(selectedPostForOptions?.content || "");
        showAlert({ title: "Copied", message: "Text copied to clipboard.", type: 'success' });
      }
    },
    {
      label: 'Block User',
      icon: 'person-remove-outline',
      onPress: () => showAlert({ title: "Blocked", message: `You blocked ${selectedPostForOptions?.user}.`, type: 'info' })
    },
    {
      label: 'Report Post',
      icon: 'flag-outline',
      color: '#EF4444',
      onPress: () => showAlert({ title: "Reported", message: "This post has been flagged for review.", type: 'success' })
    }
  ];

  // ... (Keep renderHeader and renderEmptyState same as your code) ...
  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.headerTop}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        
        <View style={styles.headerTitleContainer}>
           <Text style={styles.headerTitle}>#{guildName}</Text>
           <Text style={styles.headerSub}>General Discussion</Text>
        </View>

        <TouchableOpacity onPress={() => setShowInfoModal(true)} style={styles.iconBtn}>
          <Ionicons name="information-circle-outline" size={26} color="#FFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.inputWrapper}>
        <Image 
          source={{ uri: 'https://ui-avatars.com/api/?name=Current+User&background=random' }} 
          style={styles.inputAvatar} 
        />
        <TouchableOpacity style={styles.inputBox} activeOpacity={0.9} onPress={navigateToCreate}>
          <Text style={styles.placeholderText}>Start a discussion...</Text>
          <View style={styles.miniIcon}>
            <Ionicons name="add" size={16} color="#FFF" />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyState = () => {
    if (isLoadingPosts) return null;
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconContainer}>
          <Ionicons name="chatbubbles-outline" size={50} color={Colors.primary} />
        </View>
        <Text style={styles.emptyTitle}>It's quiet in here...</Text>
        <Text style={styles.emptyText}>
          No discussions yet in #{guildName}. {"\n"}
          Be the first to start a topic!
        </Text>
        <TouchableOpacity style={styles.emptyBtn} onPress={navigateToCreate}>
          <Text style={styles.emptyBtnText}>Create First Post</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      
      {isLoadingPosts && !refreshing && posts.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <PostCard 
              item={item} 
              onLike={() => togglePostLike(item.id)} 
              onUserPress={() => handleUserPress({ name: item.user, id: item.userId })}
              onPress={() => handlePostPress(item)} 
              onReply={() => handlePostPress(item)} 
              onShare={() => handleShare(item)}     
              onOptions={() => handleOpenOptions(item)} 
            />
          )}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmptyState}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
          }
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={navigateToCreate} activeOpacity={0.8}>
        <LinearGradient colors={[Colors.primary, '#818CF8']} style={styles.fabGradient}>
          <Ionicons name="create-outline" size={28} color="#FFF" />
        </LinearGradient>
      </TouchableOpacity>

      {/* Info Modal (Kept as is for now, or you can refactor this too if needed) */}
      <Modal visible={showInfoModal} transparent={true} animationType="fade" onRequestClose={() => setShowInfoModal(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowInfoModal(false)}>
          <View style={styles.modalContent}>
            {/* ... Modal Content ... */}
             <Text style={styles.modalTitle}>{currentGuild?.name || guildName}</Text>
             <Text style={styles.modalDesc}>{currentGuild?.desc || "Welcome!"}</Text>
             {/* ... Close Btn ... */}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* NEW SHARED OPTIONS MODAL */}
      <OptionsModal
        visible={optionsModalVisible}
        onClose={() => setOptionsModalVisible(false)}
        title="Post Options"
        options={menuOptions}
      />

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerContainer: { backgroundColor: Colors.background, paddingBottom: 15 },
  headerTop: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', 
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 10,
    paddingHorizontal: 15, marginBottom: 15
  },
  iconBtn: { padding: 8, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 20 },
  headerTitleContainer: { alignItems: 'center' },  
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  headerSub: { color: Colors.textSecondary, fontSize: 12 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20 },
  inputAvatar: { width: 42, height: 42, borderRadius: 21, marginRight: 12, borderWidth: 1, borderColor: '#334155' },
  inputBox: { 
    flex: 1, height: 46, backgroundColor: Colors.surface, borderRadius: 24, 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', 
    paddingHorizontal: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' 
  },
  placeholderText: { color: Colors.textSecondary, fontSize: 14 },
  miniIcon: { width: 24, height: 24, borderRadius: 12, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center' },
  listContent: { paddingBottom: 100, paddingTop: 10, flexGrow: 1 }, // Added flexGrow to help centering empty state
  
  // --- EMPTY STATE STYLES ---
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, marginTop: 60 },
  emptyIconContainer: { 
    width: 90, height: 90, borderRadius: 45, 
    backgroundColor: 'rgba(99, 102, 241, 0.1)', // Light primary color
    justifyContent: 'center', alignItems: 'center', marginBottom: 20 
  },
  emptyTitle: { color: Colors.text, fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  emptyText: { color: Colors.textSecondary, fontSize: 14, textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  emptyBtn: { 
    paddingVertical: 12, paddingHorizontal: 24, 
    backgroundColor: Colors.surface, borderRadius: 24, 
    borderWidth: 1, borderColor: Colors.primary 
  },
  emptyBtnText: { color: Colors.primary, fontSize: 14, fontWeight: '700' },

  fab: { position: 'absolute', bottom: 30, right: 20, shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, elevation: 8, zIndex: 999 },
  fabGradient: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#1E293B', borderRadius: 24, padding: 24, alignItems: 'center' },
  modalHeader: { alignItems: 'center', marginBottom: 20 },
  modalIconBox: { width: 64, height: 64, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  modalTitle: { color: '#FFF', fontSize: 22, fontWeight: 'bold' },
  modalSubTitle: { color: Colors.textSecondary, fontSize: 14, marginTop: 4 },
  modalBody: { width: '100%' },
  sectionLabel: { color: Colors.textSecondary, fontSize: 12, fontWeight: '700', marginBottom: 8 },
  modalDesc: { color: '#E2E8F0', fontSize: 15, lineHeight: 22, textAlign: 'center', marginBottom: 20 },
  closeModalBtn: { paddingVertical: 12, width: '100%', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: 16 },
  closeModalText: { color: '#FFF', fontWeight: 'bold' },
  optionsOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  optionsContainer: { backgroundColor: Colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 40 },
  optionsHandle: { width: 40, height: 4, backgroundColor: '#334155', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  optionsTitle: { color: Colors.textSecondary, fontSize: 13, fontWeight: 'bold', marginBottom: 15, textTransform: 'uppercase', letterSpacing: 1 },
  optionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15 },
  optionText: { color: '#FFF', fontSize: 16, marginLeft: 15, fontWeight: '500' }
});

export default DiscussionScreen;