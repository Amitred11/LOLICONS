import React, { useRef, useState, useEffect } from 'react';
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

const { width } = Dimensions.get('window');

const RarityColors = {
  Common: ['#A0A0A0', '#505050'],
  Uncommon: ['#4CD964', '#206030'],
  Rare: ['#007AFF', '#004080'],
  Epic: ['#BF5AF2', '#602080'],
  Primeval: ['#FFD700', '#FF8C00'], // Gold/Orange
  Absolute: ['#FF3B30', '#000000'], // Red/Black
};

const FriendProfileScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();
  
  // Accept either a full/partial user object or just an ID
  const { user: initialUser, userId } = route.params; 

  const [user, setUser] = useState(initialUser || null);
  const [isLoading, setIsLoading] = useState(true);
  
  const scrollY = useRef(new Animated.Value(0)).current;

  // Fetch full profile data
  useEffect(() => {
    const loadProfile = async () => {
      const idToFetch = userId || initialUser?.id;
      
      if (!idToFetch) {
         setIsLoading(false);
         return;
      }

      setIsLoading(true);
      try {
        const response = await ProfileAPI.getFriendProfile(idToFetch);
        if (response.success && response.data) {
          // Merge existing data with new data (to keep avatars visible while loading details)
          setUser(prev => ({ ...prev, ...response.data }));
        }
      } catch (error) {
        console.error("Failed to load friend profile", error);
        Alert.alert("Error", "Could not load user profile.");
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [userId, initialUser]);

  // Header Animation
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 150],
    outputRange: [0, 1],
    extrapolate: 'clamp'
  });

  const handleBadgePress = (badge) => {
    Alert.alert(
      badge.name,
      `${badge.description}\n\nRarity: ${badge.rarity}`,
      [{ text: "Awesome" }]
    );
  };

  // Loading State
  if (isLoading && !user) {
    return (
      <View style={[styles.container, styles.center]}>
        <StatusBar barStyle="light-content" />
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // Error/Empty State
  if (!user) {
     return (
        <View style={[styles.container, styles.center]}>
           <StatusBar barStyle="light-content" />
           <Text style={{color: Colors.textSecondary}}>User not found</Text>
           <TouchableOpacity onPress={() => navigation.goBack()} style={{marginTop: 20}}>
               <Text style={{color: Colors.primary}}>Go Back</Text>
           </TouchableOpacity>
        </View>
     );
  }

  // Safe Accessors
  const stats = user.stats || [];
  const badges = user.badges || [];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Animated Sticky Header */}
      <Animated.View style={[styles.stickyHeader, { height: insets.top + 50, opacity: headerOpacity }]}>
        <LinearGradient colors={['rgba(0,0,0,0.9)', 'rgba(0,0,0,0.6)']} style={StyleSheet.absoluteFill} />
        <View style={[styles.stickyHeaderContent, { marginTop: insets.top }]}>
          <Text style={styles.stickyTitle}>{user.name}</Text>
        </View>
      </Animated.View>

      {/* Back Button (Fixed) */}
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
        {/* Banner Hero */}
        <View style={styles.heroContainer}>
          <Image 
            source={{ uri: user.banner || 'https://via.placeholder.com/800' }} 
            style={styles.banner} 
            resizeMode="cover"
          />
          <LinearGradient colors={['transparent', Colors.background]} style={styles.bannerFade} />
        </View>

        {/* Profile Info */}
        <View style={styles.profileContent}>
          <View style={styles.avatarWrapper}>
             <Image 
                source={{ uri: user.avatar || 'https://via.placeholder.com/150' }} 
                style={styles.avatar} 
             />
             <View style={[styles.statusIndicator, { backgroundColor: user.status === 'Online' ? '#4CD964' : '#666' }]} />
          </View>

          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userHandle}>@{user.handle}</Text>
          
          {/* Action Buttons */}
          <View style={styles.actionRow}>
             <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.navigate('ChatDetail', { user })}>
                <Ionicons name="chatbubble-ellipses" size={20} color="#FFF" />
                <Text style={styles.btnText}>Message</Text>
             </TouchableOpacity>
             
             {/* Optional: Add Friend / Block Button logic here */}
             <TouchableOpacity style={styles.secondaryBtn} onPress={() => Alert.alert("Coming Soon", "Block/Report feature in progress.")}>
                <Ionicons name="alert-circle-outline" size={22} color={Colors.textSecondary} />
             </TouchableOpacity>
          </View>

          {user.bio ? <Text style={styles.bio}>{user.bio}</Text> : null}

          {/* Stats Grid */}
          <View style={styles.statsContainer}>
            {stats.map((stat, index) => (
              <View key={index} style={styles.statBox}>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>

          {/* Badges / Trophies Section */}
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
                            <Ionicons name={badge.icon} size={28} color="#FFF" />
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
  
  stickyHeader: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
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
  btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  secondaryBtn: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },

  bio: { fontSize: 15, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: 30 },

  statsContainer: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,0.05)', padding: 20, borderRadius: 20, marginBottom: 30 },
  statBox: { alignItems: 'center', flex: 1 },
  statValue: { fontSize: 20, fontWeight: '800', color: '#FFF' },
  statLabel: { fontSize: 12, color: Colors.textSecondary, textTransform: 'uppercase', marginTop: 4 },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 10 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.text },

  badgesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 15 },
  badgeCard: { width: (width - 55) / 3, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  badgeIconBg: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginBottom: 10, shadowColor: '#000', shadowOffset: {width:0, height:4}, shadowOpacity: 0.3, shadowRadius: 5 },
  badgeName: { color: Colors.text, fontSize: 12, fontWeight: '600', textAlign: 'center', marginBottom: 4 },
  badgeRarity: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  
  emptyState: { alignItems: 'center', padding: 20 },
  emptyText: { color: Colors.textSecondary, fontStyle: 'italic' }
});

export default FriendProfileScreen;