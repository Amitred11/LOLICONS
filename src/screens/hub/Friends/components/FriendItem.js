import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Animated, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@config/Colors';

const FriendItem = ({ 
  item, 
  index,
  onPress, 
  onLongPress, 
  onQuickAction,
  mode = 'default', 
  isSelected = false 
}) => {
  // Staggered Entrance Animation
  const slideAnim = useRef(new Animated.Value(50)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 350,
        delay: index * 50,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 350,
        delay: index * 50,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  const isOnline = item.status === 'Online';

  // Render the Right-side Icon based on mode
  const renderAction = () => {
    if (mode === 'selection') {
      return (
        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
          <Ionicons name="checkmark" size={14} color={isSelected ? "#FFF" : "transparent"} />
        </View>
      );
    }
    
    // Default: Quick Chat Button
    return (
      <TouchableOpacity style={styles.iconBtn} onPress={onQuickAction}>
        <Ionicons name="chatbubble-ellipses-outline" size={20} color={Colors.primary} />
      </TouchableOpacity>
    );
  };

  return (
    <Animated.View style={{ transform: [{ translateY: slideAnim }], opacity: opacityAnim }}>
      <Pressable 
        style={[styles.container, isSelected && styles.containerSelected]}
        onPress={onPress}
        onLongPress={onLongPress}
        delayLongPress={150}
        android_ripple={{ color: 'rgba(255,255,255,0.1)' }}
      >
        <LinearGradient
            colors={isSelected ? ['rgba(68, 108, 179, 0.2)', 'rgba(68, 108, 179, 0.05)'] : ['rgba(255,255,255,0.03)', 'transparent']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.cardContent}
        >
            {/* Avatar with Status Ring */}
            <View style={styles.avatarContainer}>
                <LinearGradient
                    colors={isOnline ? [Colors.secondary, '#2E86DE'] : ['#555', '#333']}
                    style={styles.avatarRing}
                >
                    <Image source={{ uri: item.avatar }} style={styles.avatar} />
                </LinearGradient>
            </View>

            {/* Info */}
            <View style={styles.info}>
                <Text style={[styles.name, isSelected && { color: Colors.primary }]}>{item.name}</Text>
                <Text style={styles.bio} numberOfLines={1}>
                    {isOnline ? 'Active Now' : item.bio || 'Offline'}
                </Text>
            </View>

            {/* Action */}
            {renderAction()}
            
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  containerSelected: {
    borderColor: Colors.primary,
    transform: [{ scale: 0.98 }]
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  avatarContainer: { marginRight: 15 },
  avatarRing: {
    width: 54, height: 54, borderRadius: 27,
    justifyContent: 'center', alignItems: 'center',
  },
  avatar: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: '#000', borderWidth: 2, borderColor: '#1A1A1A'
  },
  info: { flex: 1 },
  name: {
    fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 2,
    letterSpacing: 0.3
  },
  bio: {
    fontSize: 12, color: Colors.textSecondary, fontWeight: '500'
  },
  
  // Actions
  iconBtn: {
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center', alignItems: 'center',
  },
  checkbox: {
    width: 24, height: 24, borderRadius: 12,
    borderWidth: 2, borderColor: Colors.textSecondary,
    justifyContent: 'center', alignItems: 'center'
  },
  checkboxSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  }
});

export default FriendItem;