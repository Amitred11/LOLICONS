import React, { useCallback, useState } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, 
  StatusBar, Image, Platform, ActivityIndicator, Modal, RefreshControl,
  Share, Clipboard, ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import PostCard from '../../components/PostCard'; 
import OptionsModal from '../../components/OptionsModal'; // IMPORT HERE
import { useCommunity } from '@context/main/CommunityContext';
import { useAlert } from '@context/other/AlertContext'; 
import { Colors } from '@config/Colors'; 
import { useProfile } from '@context/main/ProfileContext';

const DiscussionScreen = ({ route, navigation }) => {
  const { guildName, guildId } = route.params;
  const { 
    posts, fetchPosts, togglePostLike, isLoadingPosts, 
    fetchGuildDetails, currentGuild 
  } = useCommunity();
  const { showAlert, showToast } = useAlert();
  const { profile } = useProfile();

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
      showToast(error.message,  'error' );
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
        showToast("Text copied to clipboard.",'success' );
      }
    },
    {
      label: 'Block User',
      icon: 'person-remove-outline',
      onPress: () => showToast( `You blocked ${selectedPostForOptions?.user}.`,'info' )
    },
    {
      label: 'Report Post',
      icon: 'flag-outline',
      color: '#EF4444',
      onPress: () => showAlert({ title: "Reported", message: "This post has been flagged for review.", type: 'success' })
    }
  ];

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
          source={{ uri: profile?.avatarUrl || 'https://ui-avatars.com/api/?name=User' }}
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

      <Modal visible={showInfoModal} transparent={true} animationType="slide" onRequestClose={() => setShowInfoModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.infoModalContainer}>
            <View style={styles.modalHandle} />
            
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
              <View style={styles.modalHeaderHero}>
                <LinearGradient colors={['rgba(99, 102, 241, 0.2)', 'transparent']} style={styles.heroGradient} />
                <View style={styles.guildIconLarge}>
                  <Text style={styles.guildInitial}>{guildName.charAt(0).toUpperCase()}</Text>
                </View>
                <Text style={styles.modalTitle}>#{guildName}</Text>
                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>1.2k</Text>
                    <Text style={styles.statLabel}>Members</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{posts.length}</Text>
                    <Text style={styles.statLabel}>Discussions</Text>
                  </View>
                </View>
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.sectionTitle}>About this Guild</Text>
                <Text style={styles.modalDesc}>
                  {currentGuild?.desc || "Welcome to the official community channel. Connect, share, and discuss with fellow members of this guild."}
                </Text>
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.sectionTitle}>Community Rules</Text>
                {[
                  { icon: 'shield-checkmark', title: 'Respectful behavior', desc: 'Treat everyone with kindness.' },
                  { icon: 'chatbox-ellipses', title: 'Stay on topic', desc: 'Keep content relevant to this guild.' },
                  { icon: 'hand-left', title: 'No Spam', desc: 'Avoid excessive self-promotion.' },
                ].map((rule, idx) => (
                  <View key={idx} style={styles.ruleItem}>
                    <View style={styles.ruleIconBox}>
                      <Ionicons name={rule.icon} size={18} color={Colors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.ruleTitle}>{rule.title}</Text>
                      <Text style={styles.ruleDesc}>{rule.desc}</Text>
                    </View>
                  </View>
                ))}
              </View>

              <TouchableOpacity style={styles.closeModalBtn} onPress={() => setShowInfoModal(false)}>
                <Text style={styles.closeModalText}>Got it, thanks!</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
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
  
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  infoModalContainer: {
    backgroundColor: Colors.surface, // Ensure this is a dark shade like #1E293B
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    maxHeight: '85%',
    paddingTop: 12,
  },
  modalHandle: {
    width: 40,
    height: 5,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 10,
  },

  // --- HERO SECTION ---
  modalHeaderHero: {
    alignItems: 'center',
    paddingVertical: 30,
    position: 'relative',
    overflow: 'hidden',
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  guildIconLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  guildInitial: {
    color: '#FFF',
    fontSize: 32,
    fontWeight: 'bold',
  },
  modalTitle: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },

  // --- STATS ROW ---
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 25,
  },
  statValue: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },

  // --- SECTIONS & RULES ---
  modalSection: {
    paddingHorizontal: 24,
    marginTop: 24,
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  modalDesc: {
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: 12,
    borderRadius: 16,
  },
  ruleIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  ruleTitle: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  ruleDesc: {
    color: Colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },

  // --- FOOTER BUTTON ---
  closeModalBtn: {
    marginHorizontal: 24,
    marginTop: 20,
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  closeModalText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default DiscussionScreen;