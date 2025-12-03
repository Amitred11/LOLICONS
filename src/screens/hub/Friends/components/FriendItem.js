import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@config/Colors';

const FriendItem = ({ 
  item, 
  onPress, 
  onLongPress, 
  mode = 'default', // 'default' | 'selection' | 'add'
  isSelected = false 
}) => {

  const isOnline = item.status === 'Online';

  const renderRightAction = () => {
    if (mode === 'selection') {
      return (
        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
          {isSelected && <Ionicons name="checkmark" size={16} color="#FFF" />}
        </View>
      );
    }

    if (mode === 'add') {
      return (
        <TouchableOpacity style={styles.addBtn}>
          <Ionicons name="person-add" size={18} color={Colors.text} />
        </TouchableOpacity>
      );
    }

    // Default Chat Icon
    return (
      <View style={styles.actionBtn}>
        <Ionicons name="chatbubble-ellipses" size={18} color={Colors.background} />
      </View>
    );
  };

  return (
    <Pressable 
      style={styles.card} 
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={200}
    >
      {({ pressed }) => (
        <LinearGradient 
          colors={
            isSelected 
              ? [Colors.primary + '20', Colors.primary + '10'] // Highlight if selected
              : pressed 
                ? ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.04)'] 
                : ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.01)']
          } 
          style={styles.cardGradient}
        >
          <View>
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
            {isOnline && <View style={styles.onlineBadge} />}
          </View>
          
          <View style={styles.info}>
            <Text style={styles.name}>{item.name}</Text>
            <Text 
              numberOfLines={1} 
              style={[
                styles.status, 
                { color: isOnline ? Colors.secondary : Colors.textSecondary }
              ]}
            >
              {item.status}
            </Text>
          </View>

          {renderRightAction()}
        </LinearGradient>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: { 
    marginBottom: 12, borderRadius: 20, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)'
  },
  cardGradient: { flexDirection: 'row', alignItems: 'center', padding: 12 },
  
  avatar: { width: 50, height: 50, borderRadius: 18, backgroundColor: '#333' },
  onlineBadge: {
    position: 'absolute', bottom: 0, right: 0,
    width: 14, height: 14, borderRadius: 7,
    backgroundColor: Colors.secondary,
    borderWidth: 2, borderColor: '#1E1E1E'
  },
  
  info: { flex: 1, marginLeft: 15, marginRight: 10 },
  name: { color: Colors.text, fontSize: 15, fontWeight: '600' },
  status: { fontSize: 12, marginTop: 2 },
  
  actionBtn: { 
    width: 40, height: 40, borderRadius: 14, 
    backgroundColor: Colors.primary, 
    justifyContent: 'center', alignItems: 'center',
    transform: [{ rotate: '-5deg' }]
  },
  addBtn: {
    width: 40, height: 40, borderRadius: 14, 
    backgroundColor: 'rgba(255,255,255,0.1)', 
    justifyContent: 'center', alignItems: 'center',
  },
  
  // Selection Mode Styles
  checkbox: {
    width: 24, height: 24, borderRadius: 8,
    borderWidth: 2, borderColor: Colors.textSecondary,
    justifyContent: 'center', alignItems: 'center'
  },
  checkboxSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary
  }
});

export default FriendItem;