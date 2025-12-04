// screens/hub/components/HubHeader.js

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ImageBackground } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useAnimatedStyle, interpolate, Extrapolate, useSharedValue, withSpring } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useIsFocused } from '@react-navigation/native';

import { Colors } from '@config/Colors';
import { HEADER_EXPANDED_HEIGHT, HEADER_COLLAPSED_HEIGHT } from './constants';

// Use the Service instead of direct mock import
import { ProfileAPI } from '@api/MockProfileService';

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
          <Ionicons name={icon} size={26} color="#fff" />
        </LinearGradient>
        <Text style={styles.quickActionLabel}>{label}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const HubHeader = ({ scrollY }) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const isFocused = useIsFocused(); // Hook to trigger refresh when returning to screen

  // Local state for user data
  const [user, setUser] = useState({ 
      name: 'Loading...', 
      avatarUrl: 'https://via.placeholder.com/150' // Default placeholder
  });

  // Fetch user data on mount and when screen is focused
  useEffect(() => {
      const fetchUser = async () => {
          try {
              const response = await ProfileAPI.getProfile();
              if (response.success) {
                  setUser(response.data);
              }
          } catch (e) {
              console.error("HubHeader profile fetch error", e);
          }
      };

      if (isFocused) {
          fetchUser();
      }
  }, [isFocused]);

  const animatedHeaderStyle = useAnimatedStyle(() => ({
    height: interpolate(scrollY.value, [0, SCROLL_DISTANCE], [HEADER_EXPANDED_HEIGHT + insets.top, HEADER_COLLAPSED_HEIGHT + insets.top], Extrapolate.CLAMP),
  }));

  const animatedHubStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, SCROLL_DISTANCE / 2], [1, 0], Extrapolate.CLAMP),
    transform: [{ translateY: interpolate(scrollY.value, [0, SCROLL_DISTANCE], [0, -50], Extrapolate.CLAMP) }]
  }));

  const animatedBgOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, SCROLL_DISTANCE], [0.3, 0], Extrapolate.CLAMP),
  }));

  const animatedTitleStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [SCROLL_DISTANCE - 30, SCROLL_DISTANCE], [0, 1], Extrapolate.CLAMP),
  }));

  return (
    <Animated.View style={[styles.headerContainer, animatedHeaderStyle]}>
      <Animated.View style={[StyleSheet.absoluteFill, animatedBgOpacity]}>
        <ImageBackground
          source={{ uri: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800' }}
          style={StyleSheet.absoluteFill}
        />
        <LinearGradient colors={['transparent', Colors.background]} style={StyleSheet.absoluteFill}/>
      </Animated.View>

      <View style={[styles.headerContent, { paddingTop: insets.top }]}>
        {/* Expanded Content */}
        <Animated.View style={[styles.hubContainer, animatedHubStyle]}>
          <View style={styles.profileRow}>
            <TouchableOpacity 
              style={styles.profileButton}
              onPress={() => navigation.navigate('Profile')}
            >
              <Image source={{ uri: user.avatarUrl }} style={styles.profileImage} />
              <Text style={styles.profileName}>
                  {user.name ? `Hi, ${user.name.split(' ')[0]}` : 'Your Hub'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.headerActionButton}
              onPress={() => navigation.navigate('Notifications')}
            >
              <Ionicons name="notifications-outline" size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.quickActionsRow}>
            <QuickActionButton 
                icon="compass-outline" 
                label="Explore" 
                color={['#ff7e5f', '#feb47b']} 
                onPress={() => navigation.navigate('Community')} 
            />
            <QuickActionButton 
                icon="chatbubbles-outline" 
                label="Messages" 
                color={['#7b4397', '#dc2430']} 
                onPress={() => navigation.navigate('ChatList')} 
            />
            <QuickActionButton 
                icon="person-add-outline" 
                label="Friends" 
                color={['#8A2387', '#E94057', '#F27121']} 
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
  headerContainer: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1, backgroundColor: Colors.darkBackground, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(255,255,255,0.1)' },
  headerContent: { flex: 1, justifyContent: 'flex-end', paddingHorizontal: 20, overflow: 'hidden' },
  hubContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 20, paddingBottom: 20 },
  profileRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 25 },
  profileButton: { flexDirection: 'row', alignItems: 'center' },
  profileImage: { width: 48, height: 48, borderRadius: 24, borderWidth: 2, borderColor: '#fff' },
  profileName: { fontFamily: 'Poppins_700Bold', color: Colors.text, fontSize: 24, marginLeft: 15 },
  headerActionButton: { height: 44, width: 44, borderRadius: 22, backgroundColor: 'rgba(30,30,30,0.7)', alignItems: 'center', justifyContent: 'center' },
  quickActionsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  quickActionContainer: { alignItems: 'center' },
  quickActionIconCircle: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 10 },
  quickActionLabel: { fontFamily: 'Poppins_500Medium', color: Colors.textSecondary, fontSize: 13, marginTop: 10 },
  collapsedTitleContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, height: HEADER_COLLAPSED_HEIGHT, justifyContent: 'center', alignItems: 'center' },
  collapsedTitle: { fontFamily: 'Poppins_600SemiBold', color: Colors.text, fontSize: 17 },
});

export default HubHeader;