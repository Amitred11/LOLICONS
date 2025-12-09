import React, { useRef, useState, useEffect, useMemo } from 'react';
import { 
  View, Text, StyleSheet, Image, TouchableOpacity, 
  Dimensions, Animated, StatusBar, Alert, ActivityIndicator 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@config/Colors'; 
import { ProfileAPI } from '@api/MockProfileService'; 
import { useAlert } from '@context/other/AlertContext'; 

// NEW: Import the Profile Context
import { useProfile } from '@context/main/ProfileContext'; 

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
  const { showToast } = useAlert();
  const { profile, blockUser, unblockUser } = useProfile();

  const { user: initialUser, userId } = route.params; 

  const [user, setUser] = useState(initialUser || null);
  const [isLoading, setIsLoading] = useState(true);
  
  const scrollY = useRef(new Animated.Value(0)).current;

  // 1. Determine Block Status
  // We check the logged-in user's profile settings to see if this friend is in the blocked list.
  const isBlocked = useMemo(() => {
    if (!profile || !user) return false;
    const blockedList = profile.settings?.privacy?.blockedUsers || [];
    return blockedList.some(blocked => blocked.id === user.id);
  }, [profile, user]);

  useEffect(() => {
    const loadProfile = async () => {
      const idToFetch = userId || initialUser?.id;
      
      if (!idToFetch) {
         setIsLoading(false);
         showToast("No user ID provided.", 'error');
         return;
      }

      setIsLoading(true);
      try {
        const response = await ProfileAPI.getFriendProfile(idToFetch);
        if (response.success && response.data) {
          setUser(prev => ({ ...prev, ...response.data }));
        } else {
          showToast(response.message || "Could not load user profile.", 'error');
        }
      } catch (error) {
        console.error("Failed to load friend profile", error);
        showToast("An error occurred while loading the profile.", 'error');
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [userId, initialUser]);

  // 2. Handle Block/Unblock Action
  const handleOptionPress = () => {
    if (isBlocked) {
        Alert.alert(
            "Unblock User",
            `Are you sure you want to unblock ${user.name}?`,
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Unblock", 
                    onPress: async () => {
                        try {
                            // Using ID for unblocking based on your Context signature
                            await unblockUser(user.id);
                            showToast(`You unblocked ${user.name}`, 'success');
                        } catch (error) {
                            showToast("Failed to unblock user", 'error');
                        }
                    } 
                }
            ]
        );
    } else {
        Alert.alert(
            "Block User",
            `Are you sure you want to block ${user.name}? They will no longer be able to message you.`,
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Block", 
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            // Using name based on your Context signature (though ID is safer if supported)
                            await blockUser(user.name); 
                            showToast(`${user.name} has been blocked`, 'info');
                            navigation.goBack(); // Optional: Go back after blocking
                        } catch (error) {
                            showToast("Failed to block user", 'error');
                        }
                    } 
                }
            ]
        );
    }
  };

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 150],
    outputRange: [0, 1],
    extrapolate: 'clamp'
  });

  const handleBadgePress = (badge) => {
    showToast(
      badge.name,
      `${badge.description}\n\nRarity: ${badge.rarity}`,
      'info'
    );
  };

  if (isLoading && !user) {
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

  const stats = user.stats || [];
  const badges = user.badges || [];
  const bannerUri = typeof user.favoriteComicBanner === 'string' ? user.favoriteComicBanner : user.favoriteComicBanner?.uri;
  
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
          
          {/* Action Buttons */}
          <View style={styles.actionRow}>
             {/* 3. Disable Message Button if Blocked */}
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
             
             {/* 4. Connect Option Press */}
             <TouchableOpacity 
                style={[styles.secondaryBtn, isBlocked && { backgroundColor: 'rgba(239, 68, 68, 0.2)' }]} 
                onPress={handleOptionPress}
             >
                <Ionicons 
                    name="ellipsis-horizontal" 
                    size={22} 
                    color={isBlocked ? '#ef4444' : Colors.textSecondary} 
                />
             </TouchableOpacity>
          </View>

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
  // Style for disabled message button
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
  emptyText: { color: Colors.textSecondary, fontStyle: 'italic' }
});

export default FriendProfileScreen;