import React, { useRef, useState, useEffect, useMemo } from 'react';
import { 
  View, Text, StyleSheet, Image, TouchableOpacity, 
  Dimensions, Animated, StatusBar, ActivityIndicator, Modal, Pressable 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@config/Colors'; 
import { ProfileAPI } from '@api/MockProfileService'; 
import { useAlert } from '@context/other/AlertContext'; 

// Import Profile & Friend Contexts
import { useProfile } from '@context/main/ProfileContext'; 
import { useFriend } from '@context/hub/FriendContext';

const { width } = Dimensions.get('window');

const RarityColors = {
  Common: ['#A0A0A0', '#505050'],
  Uncommon: ['#4CD964', '#206030'],
  Rare: ['#007AFF', '#004080'],
  Epic: ['#BF5AF2', '#602080'],
  Primeval: ['#FFD700', '#FF8C00'], 
  Absolute: ['#FF3B30', '#000000'], 
};

const FriendProfileScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();
  
  // Contexts
  const { showAlert, showToast } = useAlert();
  const { profile, blockUser, unblockUser } = useProfile();
  const { friends, addFriend, removeFriend } = useFriend();

  const { user: initialUser, userId } = route.params; 

  const [user, setUser] = useState(initialUser || null);
  const [isLoading, setIsLoading] = useState(!initialUser);
  const [actionSheetVisible, setActionSheetVisible] = useState(false);
  
  const scrollY = useRef(new Animated.Value(0)).current;

  // --- STATUS CHECKS ---
  const isBlocked = useMemo(() => {
    if (!profile || !user) return false;
    const blockedList = profile.settings?.privacy?.blockedUsers || [];
    return blockedList.some(blocked => blocked.id === user.id || blocked.name === user.name);
  }, [profile, user]);

  const isFriend = useMemo(() => {
    if (!friends || !user) return false;
    return friends.some(friend => friend.id === user.id);
  }, [friends, user]);

  const isSelf = useMemo(() => {
      if(!profile || !user) return false;
      return profile.id === user.id;
  }, [profile, user]);

  // --- DATA LOADING ---
  useEffect(() => {
    const loadProfile = async () => {
      const idToFetch = userId || initialUser?.id;
      if (!idToFetch) {
         if (isLoading) setIsLoading(false);
         showToast("No user ID provided.", 'error');
         return;
      }

      try {
        const response = await ProfileAPI.getFriendProfile(idToFetch);
        if (response.success && response.data) {
          setUser(response.data); 
        } else {
          showToast(response.message || "Could not load user profile.", 'error');
        }
      } catch (error) {
        console.error("Failed to load friend profile", error);
        showToast("An error occurred while loading the profile.", 'error');
      } finally {
        if (isLoading) setIsLoading(false);
      }
    };

    loadProfile();
  }, [userId, initialUser]);

  // --- ACTION HANDLERS ---
  const handleBlock = () => {
    setActionSheetVisible(false);
    showAlert({
      title: `Block ${user.name}?`,
      message: "They won't be able to send you messages or requests. You can unblock them later.",
      type: 'error',
      btnText: 'Block',
      onClose: async () => {
        try {
          await blockUser(user.name); 
          showToast(`${user.name} has been blocked`, 'info');
          navigation.goBack();
        } catch (error) {
          showToast("Failed to block user", 'error');
        }
      },
      secondaryBtnText: 'Cancel'
    });
  };

  const handleUnblock = () => {
    setActionSheetVisible(false);
    showAlert({
      title: `Unblock ${user.name}?`,
      message: 'They will be able to contact you again.',
      type: 'info',
      btnText: 'Unblock',
      onClose: async () => {
        try {
          await unblockUser(user.id);
          showToast(`You unblocked ${user.name}`, 'success');
        } catch (error) {
          showToast("Failed to unblock user", 'error');
        }
      },
      secondaryBtnText: 'Cancel'
    });
  };
  
  const handleUnfriend = () => {
    setActionSheetVisible(false);
    showAlert({
        title: `Unfriend ${user.name}?`,
        message: 'They will be removed from your friends list.',
        type: 'error',
        btnText: 'Unfriend',
        onClose: async () => {
            try {
                await removeFriend(user.id);
                showToast(`${user.name} removed from friends`, 'info');
            } catch {
                showToast('Failed to remove friend', 'error');
            }
        },
        secondaryBtnText: 'Cancel'
    });
  };

  const handleAddFriend = () => {
    setActionSheetVisible(false);
    // This is now just a toast, the real action is in FriendContext
    showToast(`Friend request sent to ${user.name}`, 'success');
    addFriend(user.id).catch(() => {
        showToast('Failed to send request', 'error');
    });
  };

  const handleReport = () => {
     setActionSheetVisible(false);
     showAlert({
        title: `Report ${user.name}?`,
        message: 'Your report will be reviewed by our moderation team. Thank you for helping keep the community safe.',
        type: 'info',
        btnText: 'Submit Report',
        onClose: () => {
            showToast('Report submitted', 'success');
        },
        secondaryBtnText: 'Cancel'
    });
  };

  const handleBadgePress = (badge) => {
    showToast(
      badge.name,
      `${badge.description}\n\nRarity: ${badge.rarity}`,
      'info'
    );
  };

  // --- RENDER LOGIC ---
  if (isLoading) {
    return (
      <View style={[styles.container, styles.center]}>
        <StatusBar barStyle="light-content" />
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!user) {
     return (
        <View style={[styles.container, styles.center]}>
           <StatusBar barStyle="light-content" />
           <Ionicons name="alert-circle-outline" size={48} color={Colors.textSecondary} />
           <Text style={{color: Colors.textSecondary, marginTop: 10}}>User not found</Text>
           <TouchableOpacity onPress={() => navigation.goBack()} style={styles.goBackButton}>
               <Text style={{color: Colors.text}}>Go Back</Text>
           </TouchableOpacity>
        </View>
     );
  }

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 150],
    outputRange: [0, 1],
    extrapolate: 'clamp'
  });

  const stats = user.stats || [];
  const badges = user.badges || [];
  const bannerUri = typeof user.favoriteComicBanner === 'string' ? user.favoriteComicBanner : user.favoriteComicBanner?.uri;
  
  const renderActionRow = () => {
    if (isSelf) {
      return (
        <View style={styles.actionRow}>
          <TouchableOpacity 
            style={styles.primaryBtn} 
            onPress={() => navigation.navigate('EditProfile')}
          >
            <Ionicons name="pencil" size={20} color="#FFF" />
            <Text style={styles.btnText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <View style={styles.actionRow}>
         <TouchableOpacity 
            style={[styles.primaryBtn, isBlocked && styles.disabledBtn]} 
            onPress={() => !isBlocked && navigation.navigate('ChatDetail', { user })}
            activeOpacity={isBlocked ? 1 : 0.7}
         >
            <Ionicons name={isBlocked ? "ban" : "chatbubble-ellipses"} size={20} color={isBlocked ? Colors.textSecondary : "#FFF"} />
            <Text style={[styles.btnText, isBlocked && { color: Colors.textSecondary }]}>
                {isBlocked ? "Blocked" : "Message"}
            </Text>
         </TouchableOpacity>
         <TouchableOpacity style={styles.secondaryBtn} onPress={() => setActionSheetVisible(true)}>
            <Ionicons name="ellipsis-horizontal" size={22} color={Colors.textSecondary} />
         </TouchableOpacity>
      </View>
    );
  };

  const renderActionSheet = () => (
    <Modal
      transparent
      visible={actionSheetVisible}
      animationType="fade"
      onRequestClose={() => setActionSheetVisible(false)}
    >
      <Pressable style={styles.actionSheetOverlay} onPress={() => setActionSheetVisible(false)}>
        <View style={styles.actionSheetContainer}>
            {isFriend ? (
                 <TouchableOpacity style={styles.actionSheetButton} onPress={handleUnfriend}>
                    <Ionicons name="person-remove-outline" size={20} color={'#FF453A'} />
                    <Text style={[styles.actionSheetText, {color: '#FF453A'}]}>Unfriend</Text>
                </TouchableOpacity>
            ) : (
                <TouchableOpacity style={styles.actionSheetButton} onPress={handleAddFriend}>
                    <Ionicons name="person-add-outline" size={20} color={Colors.primary} />
                    <Text style={styles.actionSheetText}>Add Friend</Text>
                </TouchableOpacity>
            )}

            {isBlocked ? (
                <TouchableOpacity style={styles.actionSheetButton} onPress={handleUnblock}>
                    <Ionicons name="shield-checkmark-outline" size={20} color={'#34C759'} />
                    <Text style={[styles.actionSheetText, {color: '#34C759'}]}>Unblock</Text>
                </TouchableOpacity>
            ) : (
                <TouchableOpacity style={styles.actionSheetButton} onPress={handleBlock}>
                    <Ionicons name="shield-outline" size={20} color={'#FF453A'} />
                    <Text style={[styles.actionSheetText, {color: '#FF453A'}]}>Block User</Text>
                </TouchableOpacity>
            )}

             <TouchableOpacity style={styles.actionSheetButton} onPress={handleReport}>
                <Ionicons name="flag-outline" size={20} color={'#FF9500'} />
                <Text style={[styles.actionSheetText, {color: '#FF9500'}]}>Report User</Text>
            </TouchableOpacity>
        </View>

        <TouchableOpacity style={[styles.actionSheetContainer, {marginTop: 10}]} onPress={() => setActionSheetVisible(false)}>
             <View style={styles.actionSheetButton}>
                <Text style={[styles.actionSheetText, {fontWeight: 'bold'}]}>Cancel</Text>
            </View>
        </TouchableOpacity>
      </Pressable>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <Animated.View style={[styles.stickyHeader, { height: insets.top + 50, opacity: headerOpacity }]}>
        <LinearGradient colors={['rgba(0,0,0,0.9)', 'rgba(0,0,0,0.6)']} style={StyleSheet.absoluteFill} />
        <View style={[styles.stickyHeaderContent, { marginTop: insets.top }]}>
          <Text style={styles.stickyTitle}>{user.name}</Text>
        </View>
      </Animated.View>

      <TouchableOpacity 
        style={[styles.backBtn, { top: insets.top + 10 }]} 
        onPress={() => navigation.goBack()}
        activeOpacity={0.8}
      >
        <Ionicons name="arrow-back" size={24} color="#FFF" />
      </TouchableOpacity>

      <Animated.ScrollView 
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 50 }}
      >
        <View style={styles.heroContainer}>
          <Image 
            source={{ uri: bannerUri || 'https://via.placeholder.com/800' }} 
            style={styles.banner} 
            resizeMode="cover"
          />
          <LinearGradient colors={['transparent', Colors.background]} style={styles.bannerFade} />
        </View>

        <View style={styles.profileContent}>
          <View style={styles.avatarWrapper}>
             <Image 
                source={{ uri: user.avatarUrl || 'https://via.placeholder.com/150' }} 
                style={styles.avatar} 
             />
             <View style={[styles.statusIndicator, { backgroundColor: user.status?.type === 'online' ? '#4CD964' : '#666' }]} />
          </View>

          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userHandle}>@{user.handle}</Text>
          
          {renderActionRow()}

          {user.bio ? <Text style={styles.bio}>{user.bio}</Text> : null}

          <View style={styles.statsContainer}>
            {stats.map((stat, index) => (
              <View key={index} style={styles.statBox}>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>

          <View style={styles.sectionHeader}>
            <Ionicons name="trophy" size={20} color="#FFD700" />
            <Text style={styles.sectionTitle}>Trophies & Badges</Text>
          </View>

          {badges.length > 0 ? (
            <View style={styles.badgesGrid}>
                {badges.map((badge) => {
                const colors = RarityColors[badge.rarity] || RarityColors.Common;
                return (
                    <TouchableOpacity key={badge.id} style={styles.badgeCard} onPress={() => handleBadgePress(badge)}>
                        <LinearGradient colors={colors} style={styles.badgeIconBg} start={{x:0, y:0}} end={{x:1, y:1}}>
                            <Ionicons name={badge.icon || 'ribbon-outline'} size={28} color="#FFF" />
                        </LinearGradient>
                        <Text style={styles.badgeName} numberOfLines={1}>{badge.name}</Text>
                        <Text style={[styles.badgeRarity, { color: colors[0] }]}>{badge.rarity}</Text>
                    </TouchableOpacity>
                );
                })}
            </View>
          ) : (
            <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No trophies yet.</Text>
            </View>
          )}
        </View>
      </Animated.ScrollView>
      {!isSelf && renderActionSheet()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
  goBackButton: { marginTop: 20, paddingHorizontal: 20, paddingVertical: 10, backgroundColor: Colors.surface, borderRadius: 20 },
  
  stickyHeader: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, elevation: 10 },
  stickyHeaderContent: { alignItems: 'center', justifyContent: 'center', height: 44 },
  stickyTitle: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  backBtn: { 
    position: 'absolute', left: 20, zIndex: 20, width: 40, height: 40, 
    borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' 
  },

  heroContainer: { height: 250 },
  banner: { width: '100%', height: '100%' },
  bannerFade: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 100 },

  profileContent: { paddingHorizontal: 20, marginTop: -60 },
  avatarWrapper: { alignSelf: 'center', marginBottom: 15 },
  avatar: { width: 120, height: 120, borderRadius: 60, borderWidth: 4, borderColor: Colors.background, backgroundColor: Colors.surface },
  statusIndicator: { position: 'absolute', bottom: 5, right: 5, width: 24, height: 24, borderRadius: 12, borderWidth: 4, borderColor: Colors.background },

  userName: { fontSize: 28, fontWeight: '800', color: Colors.text, textAlign: 'center' },
  userHandle: { fontSize: 14, color: Colors.primary, textAlign: 'center', marginBottom: 20, fontWeight: '600' },

  actionRow: { flexDirection: 'row', justifyContent: 'center', gap: 15, marginBottom: 25 },
  primaryBtn: { flexDirection: 'row', backgroundColor: Colors.primary, paddingVertical: 12, paddingHorizontal: 30, borderRadius: 25, alignItems: 'center', gap: 8 },
  disabledBtn: { backgroundColor: Colors.surface, opacity: 0.8 }, 
  
  btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  secondaryBtn: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },

  bio: { fontSize: 15, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: 30 },

  statsContainer: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: Colors.surface, padding: 20, borderRadius: 20, marginBottom: 30 },
  statBox: { alignItems: 'center', flex: 1 },
  statValue: { fontSize: 20, fontWeight: '800', color: '#FFF' },
  statLabel: { fontSize: 12, color: Colors.textSecondary, textTransform: 'uppercase', marginTop: 4 },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 10, paddingLeft: 5 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.text },

  badgesGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -5 },
  badgeCard: { width: (width - 70) / 3, backgroundColor: Colors.surface, borderRadius: 16, padding: 12, alignItems: 'center', margin: 5},
  badgeIconBg: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  badgeName: { color: Colors.text, fontSize: 12, fontWeight: '600', textAlign: 'center', marginBottom: 4 },
  badgeRarity: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  
  emptyState: { alignItems: 'center', padding: 20, backgroundColor: Colors.surface, borderRadius: 16 },
  emptyText: { color: Colors.textSecondary, fontStyle: 'italic' },
  actionSheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
    padding: 20,
  },
  actionSheetContainer: {
    backgroundColor: '#2C2C2E',
    borderRadius: 14,
    overflow: 'hidden',
  },
  actionSheetButton: {
    paddingVertical: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  actionSheetText: {
    color: Colors.primary,
    fontSize: 17,
    fontWeight: '500',
  },
});

export default FriendProfileScreen;