import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@config/Colors';

const FriendItem = ({ item, onPress, type = 'friend' }) => {
  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={onPress} 
      activeOpacity={0.8}
    >
      <LinearGradient 
        colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.01)']} 
        style={styles.cardGradient}
      >
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        
        <View style={styles.info}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={[styles.status, { color: item.status === 'Online' ? Colors.secondary : Colors.textSecondary }]}>
            {item.status}
          </Text>
        </View>

        {type === 'friend' ? (
           <View style={styles.actionBtn}>
             <Ionicons name="chatbubble-sharp" size={16} color={Colors.background} />
           </View>
        ) : (
            <TouchableOpacity style={styles.addBtn}>
                <Ionicons name="add" size={20} color={Colors.text} />
            </TouchableOpacity>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: { 
    marginBottom: 12, borderRadius: 20, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)'
  },
  cardGradient: { flexDirection: 'row', alignItems: 'center', padding: 12 },
  
  avatar: { width: 50, height: 50, borderRadius: 16, backgroundColor: '#333' },
  info: { flex: 1, marginLeft: 15 },
  name: { color: Colors.text, fontFamily: 'Poppins_600SemiBold', fontSize: 15 },
  status: { fontFamily: 'Poppins_500Medium', fontSize: 12, marginTop: 2 },
  
  actionBtn: { 
    width: 36, height: 36, borderRadius: 12, 
    backgroundColor: Colors.primary, 
    justifyContent: 'center', alignItems: 'center',
    transform: [{ rotate: '5deg' }]
  },
  addBtn: {
    width: 36, height: 36, borderRadius: 12, 
    backgroundColor: 'rgba(255,255,255,0.1)', 
    justifyContent: 'center', alignItems: 'center',
  }
});

export default FriendItem;