// screens/hub/components/HubHeader.js

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ImageBackground } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useAnimatedStyle, interpolate, Extrapolate, useSharedValue, withSpring } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

import { Colors } from '@config/Colors';
import { HEADER_EXPANDED_HEIGHT, HEADER_COLLAPSED_HEIGHT } from './constants';

// Use Context
import { useProfile } from '@context/main/ProfileContext';

const SCROLL_DISTANCE = HEADER_EXPANDED_HEIGHT - HEADER_COLLAPSED_HEIGHT;

const QuickActionButton = ({ icon, label, color, onPress }) => {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        style={styles.quickActionContainer}
        onPress={onPress} activeOpacity={0.8}
        onPressIn={() => (scale.value = withSpring(0.9))}
        onPressOut={() => (scale.value = withSpring(1))}
      >
        <LinearGradient colors={color} style={styles.quickActionIconCircle}>
          <Ionicons name={icon} size={24} color="#fff" />
        </LinearGradient>
        <Text style={styles.quickActionLabel}>{label}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const HubHeader = ({ scrollY }) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  // --- Consume Context ---
  const { profile } = useProfile();

  // Default fallback data
  const user = profile || { 
      name: 'User', 
      avatarUrl: 'https://via.placeholder.com/150' 
  };

  const animatedHeaderStyle = useAnimatedStyle(() => ({
    height: interpolate(scrollY.value, [0, SCROLL_DISTANCE], [HEADER_EXPANDED_HEIGHT + insets.top, HEADER_COLLAPSED_HEIGHT + insets.top], Extrapolate.CLAMP),
  }));

  const animatedHubStyle = useAnimatedStyle(() => ({
    // Fades out faster so it doesn't clash with the collapsed title
    opacity: interpolate(scrollY.value, [0, SCROLL_DISTANCE * 0.6], [1, 0], Extrapolate.CLAMP),
    // MOVES UP MORE: Changed from -50 to -150 to push content way up
    transform: [{ translateY: interpolate(scrollY.value, [0, SCROLL_DISTANCE], [0, -150], Extrapolate.CLAMP) }]
  }));

  const animatedBgOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, SCROLL_DISTANCE], [0.4, 0], Extrapolate.CLAMP),
  }));

  const animatedTitleStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [SCROLL_DISTANCE - 30, SCROLL_DISTANCE], [0, 1], Extrapolate.CLAMP),
    // Subtle slide up for the title appearance
    transform: [{ translateY: interpolate(scrollY.value, [SCROLL_DISTANCE - 30, SCROLL_DISTANCE], [10, 0], Extrapolate.CLAMP) }]
  }));

  return (
    <Animated.View style={[styles.headerContainer, animatedHeaderStyle]}>
      {/* Background Layer */}
      <View style={StyleSheet.absoluteFill}>
        <View style={{ flex: 1, backgroundColor: Colors.darkBackground }} />
        <Animated.View style={[StyleSheet.absoluteFill, animatedBgOpacity]}>
            <ImageBackground
            source={{ uri: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800' }}
            style={StyleSheet.absoluteFill}
            blurRadius={2}
            >
             <LinearGradient colors={['transparent', Colors.darkBackground]} style={StyleSheet.absoluteFill}/>
            </ImageBackground>
        </Animated.View>
      </View>

      <View style={[styles.headerContent, { paddingTop: insets.top }]}>
        {/* Expanded Content */}
        <Animated.View style={[styles.hubContainer, animatedHubStyle]}>
          <View style={styles.profileRow}>
            <TouchableOpacity 
              style={styles.profileButton}
              onPress={() => navigation.navigate('Profile')}
            >
              <Image source={{ uri: user.avatarUrl }} style={styles.profileImage} />
              <View style={styles.profileTextContainer}>
                  <Text style={styles.welcomeText}>Welcome back,</Text>
                  <Text style={styles.profileName}>
                      {user.name ? user.name.split(' ')[0] : 'User'}
                  </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.headerActionButton}
              onPress={() => navigation.navigate('Notifications')}
            >
              <Ionicons name="notifications-outline" size={22} color="#fff" />
              <View style={styles.notificationDot} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.quickActionsRow}>
            {/* 1. Explore (Unchanged) */}
            <QuickActionButton 
                icon="compass-outline" 
                label="Explore" 
                color={['#ff9966', '#ff5e62']} 
                onPress={() => navigation.navigate('Community')} 
            />
            
            {/* 2. Messages (New Style: Blue/Cyan) */}
            <QuickActionButton 
                icon="chatbox-ellipses-outline" 
                label="Chats" 
                color={['#4facfe', '#00f2fe']} 
                onPress={() => navigation.navigate('ChatList')} 
            />

            {/* 3. Friends/Social (New Style: Green/Teal) */}
            <QuickActionButton 
                icon="people-outline" 
                label="Social" 
                color={['#43e97b', '#38f9d7']} 
                onPress={() => navigation.navigate('Friends')} 
            />
          </View>
        </Animated.View>

        {/* Collapsed Title */}
        <Animated.View style={[styles.collapsedTitleContainer, animatedTitleStyle]}>
            <Text style={styles.collapsedTitle}>Hub</Text>
        </Animated.View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  headerContainer: { 
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1, 
    backgroundColor: Colors.darkBackground, 
    borderBottomWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(255,255,255,0.1)' 
  },
  headerContent: { flex: 1, justifyContent: 'flex-end', paddingHorizontal: 20, overflow: 'hidden' },
  
  hubContainer: { position: 'absolute', top: 70, bottom: 0, left: 0, right: 0, paddingHorizontal: 20, paddingBottom: 20 },
  
  profileRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 25 },
  profileButton: { flexDirection: 'row', alignItems: 'center' },
  profileImage: { width: 50, height: 50, borderRadius: 25, borderWidth: 2, borderColor: Colors.primary },
  profileTextContainer: { marginLeft: 12 },
  welcomeText: { fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, fontSize: 12 },
  profileName: { fontFamily: 'Poppins_700Bold', color: '#fff', fontSize: 22 },
  
  headerActionButton: { 
      height: 42, width: 42, borderRadius: 21, 
      backgroundColor: 'rgba(255,255,255,0.1)', 
      alignItems: 'center', justifyContent: 'center',
      borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)'
  },
  notificationDot: {
      position: 'absolute', top: 10, right: 11,
      width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary
  },

  quickActionsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  quickActionContainer: { alignItems: 'center' },
  quickActionIconCircle: { 
      width: 58, height: 58, borderRadius: 29, 
      alignItems: 'center', justifyContent: 'center', 
      shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 8 
  },
  quickActionLabel: { fontFamily: 'Poppins_500Medium', color: Colors.textSecondary, fontSize: 13, marginTop: 8 },
  
  collapsedTitleContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, height: HEADER_COLLAPSED_HEIGHT, justifyContent: 'center', alignItems: 'center' },
  collapsedTitle: { fontFamily: 'Poppins_600SemiBold', color: '#fff', fontSize: 18 },
});

export default HubHeader;