import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Animated, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@config/Colors';

const FriendItem = ({ 
  item, 
  index,
  status = 'friend', // 'friend' | 'none' | 'pending' | 'blocked'
  onPress, 
  onLongPress, 
  onAction,      // Primary action (Chat, Add, Unblock)
  onMoreOptions, // The "More" (...) button
  mode = 'default', 
  isSelected = false 
}) => {
  const slideAnim = useRef(new Animated.Value(50)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: 0, duration: 350, delay: index * 50, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 350, delay: index * 50, useNativeDriver: true })
    ]).start();
  }, [index]);

  const isOnline = item.status?.type === 'online';

  // --- Render the Action Button (Right Side) ---
  const renderRightSide = () => {
    // 1. Selection Mode (Checkbox)
    if (mode === 'selection') {
      return (
        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
          <Ionicons name="checkmark" size={14} color={isSelected ? "#FFF" : "transparent"} />
        </View>
      );
    }

    // 2. Blocked State
    if (status === 'blocked') {
        return (
            <TouchableOpacity style={[styles.actionBtn, styles.btnError]} onPress={() => onAction('unblock')}>
                <Text style={styles.btnTextSmall}>Unblock</Text>
            </TouchableOpacity>
        );
    }

    // 3. Not a Friend (Add Button)
    if (status === 'none') {
        return (
            <TouchableOpacity style={[styles.actionBtn, styles.btnAdd]} onPress={() => onAction('add')}>
                <Ionicons name="person-add" size={16} color="#FFF" />
                <Text style={styles.btnTextSmall}>Add</Text>
            </TouchableOpacity>
        );
    }

    // 4. Pending Request
    if (status === 'pending') {
        return (
            <TouchableOpacity style={[styles.actionBtn, styles.btnPending]} onPress={() => onAction('cancel')}>
                <Text style={[styles.btnTextSmall, { color: Colors.textSecondary }]}>Sent</Text>
            </TouchableOpacity>
        );
    }

    // 5. Existing Friend (Chat + More)
    return (
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => onAction('chat')}>
          <Ionicons name="chatbubble-ellipses-outline" size={20} color={Colors.primary} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.iconBtn} onPress={onMoreOptions}>
          <Ionicons name="ellipsis-vertical" size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>
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
            {/* Avatar */}
            <View style={styles.avatarContainer}>
                <LinearGradient
                    colors={status === 'friend' && isOnline ? [Colors.secondary, '#2E86DE'] : ['#555', '#333']}
                    style={styles.avatarRing}
                >
                    <Image source={{ uri: item.avatar || item.avatarUrl }} style={styles.avatar} />
                </LinearGradient>
            </View>

            {/* Info */}
            <View style={styles.info}>
                <Text style={[styles.name, isSelected && { color: Colors.primary }]}>{item.name}</Text>
                
                {status === 'blocked' ? (
                    <Text style={[styles.bio, { color: '#ef4444' }]}>Blocked User</Text>
                ) : (
                    <Text style={styles.bio} numberOfLines={1}>
                        {status === 'friend' && isOnline ? 'Active Now' : item.bio || item.handle || 'No bio'}
                    </Text>
                )}
            </View>

            {/* Dynamic Actions */}
            {renderRightSide()}
            
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 10, borderRadius: 18, overflow: 'hidden',
    backgroundColor: '#1A1A1A', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
  },
  containerSelected: { borderColor: Colors.primary, transform: [{ scale: 0.98 }] },
  cardContent: { flexDirection: 'row', alignItems: 'center', padding: 12 },
  
  avatarContainer: { marginRight: 15 },
  avatarRing: { width: 54, height: 54, borderRadius: 27, justifyContent: 'center', alignItems: 'center' },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#000', borderWidth: 2, borderColor: '#1A1A1A' },
  
  info: { flex: 1, paddingRight: 10 },
  name: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 2 },
  bio: { fontSize: 12, color: Colors.textSecondary, fontWeight: '500' },
  
  // Buttons
  iconBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center' },
  
  actionBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 6 },
  btnAdd: { backgroundColor: Colors.primary },
  btnError: { backgroundColor: 'rgba(239, 68, 68, 0.2)', borderWidth: 1, borderColor: '#ef4444' },
  btnPending: { backgroundColor: 'rgba(255,255,255,0.1)' },
  
  btnTextSmall: { color: '#FFF', fontSize: 12, fontWeight: '700' },

  checkbox: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: Colors.textSecondary, justifyContent: 'center', alignItems: 'center' },
  checkboxSelected: { backgroundColor: Colors.primary, borderColor: Colors.primary }
});

export default FriendItem;