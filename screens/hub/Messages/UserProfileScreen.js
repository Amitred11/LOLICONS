// screens/social/UserProfileScreen.js

import React from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../../constants/Colors';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, useAnimatedStyle, interpolate, Extrapolate, useAnimatedScrollHandler, FadeInUp } from 'react-native-reanimated';

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

// --- Reusable Sub-Components for this Screen ---

const DetailsCard = ({ icon, title, children, delay = 0 }) => (
  <Animated.View entering={FadeInUp.duration(500).delay(delay)}>
    <BlurView intensity={25} tint="dark" style={styles.detailsCard}>
      <View style={styles.cardHeader}>
        <Ionicons name={icon} size={20} color={Colors.textSecondary} />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {children}
    </BlurView>
  </Animated.View>
);

const StatItem = ({ value, label }) => (
  <View style={styles.statItem}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

// --- Main Profile Screen Component ---

const UserProfileScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = route.params;

  // --- Animation Setup ---
  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  const animatedHeaderImageStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: interpolate(scrollY.value, [-200, 0], [1.5, 1], Extrapolate.CLAMP),
      },
    ],
  }));

  // --- Mock Data ---
  const mutualFriendsCount = Math.floor(Math.random() * 20) + 5;
  const connectionsCount = Math.floor(Math.random() * 500) + 100;
  // Use games from the user object for more dynamic content
  const gamesPlayed = user.gamesPlayed || ['Valorant', 'Apex Legends'];

  // --- Handlers for Functional Buttons ---
  const handleMessagePress = () => {
    navigation.navigate('Chat', { channelName: user.name, avatar: user.avatar });
  };
  
  const handleMoreOptions = () => {
      Alert.alert("More Options", "Actions like Block or Report would go here.");
  };

  return (
    <View style={styles.container}>
      {/* --- Floating Header with Controls --- */}
      <BlurView intensity={25} tint="dark" style={[styles.floatingHeader, { paddingTop: insets.top }]}>
        <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{user.name}</Text>
        <TouchableOpacity style={styles.headerButton} onPress={handleMoreOptions}>
          <Ionicons name="ellipsis-horizontal" size={24} color={Colors.text} />
        </TouchableOpacity>
      </BlurView>

      <AnimatedScrollView onScroll={scrollHandler} scrollEventThrottle={16} contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}>
        {/* --- Parallax Header Image --- */}
        <Animated.View style={[styles.headerImageContainer, animatedHeaderImageStyle]}>
          <ImageBackground source={{ uri: user.avatar }} style={styles.headerImage}>
            <LinearGradient colors={['transparent', '#161618']} style={styles.headerOverlay} />
          </ImageBackground>
        </Animated.View>

        {/* --- Profile Info Section --- */}
        <View style={styles.profileInfoContainer}>
          <ImageBackground source={{ uri: user.avatar }} style={styles.avatar} imageStyle={{ borderRadius: 60 }} />
          <Text style={styles.username}>{user.name}</Text>
          <Text style={styles.statusText}>{user.activityType === 'game' ? `Playing ${user.activityName}` : 'Online'}</Text>
          
          <View style={styles.actionsContainer}>
            <TouchableOpacity style={styles.actionButtonSecondary}>
              <Ionicons name="person-add-outline" size={20} color={Colors.text} />
              <Text style={styles.actionButtonTextSecondary}>Follow</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButtonPrimary} onPress={handleMessagePress}>
              <Ionicons name="chatbubble-ellipses-outline" size={20} color="#fff" />
              <Text style={styles.actionButtonTextPrimary}>Message</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* --- Details Section with Animated Cards --- */}
        <View style={styles.detailsSection}>
          <DetailsCard icon="person-outline" title="About Me" delay={100}>
            <Text style={styles.aboutText}>Just a casual gamer enjoying life. Hit me up for some Valorant or Apex! Currently grinding ranked.</Text>
          </DetailsCard>
          
          <DetailsCard icon="people-outline" title="Connections" delay={200}>
            <View style={styles.statsContainer}>
              <StatItem value={mutualFriendsCount} label="Mutuals" />
              <StatItem value={connectionsCount} label="Connections" />
            </View>
          </DetailsCard>

          <DetailsCard icon="game-controller-outline" title="Common Games" delay={300}>
            <View style={styles.gamesContainer}>
              {gamesPlayed.map(game => (
                <View key={game} style={styles.gameTag}>
                  <Text style={styles.gameTagText}>{game}</Text>
                </View>
              ))}
            </View>
          </DetailsCard>
        </View>
      </AnimatedScrollView>
    </View>
  );
};

// --- Refined Stylesheet ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#161618' },
  floatingHeader: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15, height: 60 },
  headerButton: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', fontFamily: 'Poppins_600SemiBold', color: Colors.text, fontSize: 17 },
  headerImageContainer: { height: 280, width: '100%' },
  headerImage: { flex: 1 },
  headerOverlay: { ...StyleSheet.absoluteFillObject },
  profileInfoContainer: { alignItems: 'center', marginTop: -70, zIndex: 1 },
  avatar: { width: 120, height: 120, borderRadius: 60, borderWidth: 4, borderColor: '#161618' },
  username: { fontFamily: 'Poppins_700Bold', color: Colors.text, fontSize: 28, marginTop: 15 },
  statusText: { fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, fontSize: 16, marginTop: 2 },
  actionsContainer: { flexDirection: 'row', marginTop: 25, paddingHorizontal: 20, width: '100%', justifyContent: 'center' },
  actionButtonPrimary: { flex: 1, flexDirection: 'row', backgroundColor: Colors.primary, paddingVertical: 14, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginLeft: 10 },
  actionButtonTextPrimary: { fontFamily: 'Poppins_600SemiBold', color: '#fff', fontSize: 16, marginLeft: 8 },
  actionButtonSecondary: { flex: 1, flexDirection: 'row', backgroundColor: Colors.surface, paddingVertical: 14, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  actionButtonTextSecondary: { fontFamily: 'Poppins_600SemiBold', color: Colors.text, fontSize: 16, marginLeft: 8 },
  detailsSection: { padding: 20, paddingTop: 25 },
  detailsCard: { padding: 18, borderRadius: 16, overflow: 'hidden', marginBottom: 15 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontFamily: 'Poppins_600SemiBold', color: Colors.text, fontSize: 16, marginLeft: 8 },
  aboutText: { fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, fontSize: 15, lineHeight: 24 },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-around' },
  statItem: { alignItems: 'center' },
  statValue: { fontFamily: 'Poppins_700Bold', color: Colors.text, fontSize: 22 },
  statLabel: { fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, fontSize: 13, marginTop: 2 },
  gamesContainer: { flexDirection: 'row', flexWrap: 'wrap' },
  gameTag: { backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginRight: 10, marginBottom: 10 },
  gameTagText: { fontFamily: 'Poppins_500Medium', color: Colors.textSecondary, fontSize: 13 },
});

export default UserProfileScreen;