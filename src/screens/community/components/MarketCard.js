import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 55) / 2; 

const MarketCard = ({ item, onPress }) => {
  return (
    <TouchableOpacity 
      activeOpacity={0.9} 
      style={styles.card} 
      onPress={onPress}
    >
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />
        <View style={styles.priceTag}>
          <Text style={styles.priceText}>{item.price}</Text>
        </View>
      </View>
      
      <View style={styles.info}>
        <Text numberOfLines={1} style={styles.title}>{item.title}</Text>
        
        <View style={styles.footer}>
          <View style={styles.sellerInfo}>
             <Ionicons name="person-circle" size={14} color="#94A3B8" />
             <Text style={[styles.seller, { maxWidth: 70 }]} numberOfLines={1}>@{item.seller}</Text>   
        </View>
          
          <View style={styles.addBtn}>
            <Ionicons name="add" size={16} color="#FFF" />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: { 
    width: CARD_WIDTH, 
    backgroundColor: '#1E293B', 
    borderRadius: 24, 
    marginBottom: 15, 
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
    overflow: 'hidden'
  },
  imageContainer: {
    position: 'relative',
    height: 150,
    width: '100%',
    backgroundColor: '#0F172A',
  },
  image: { width: '100%', height: '100%' },
  priceTag: {
    position: 'absolute', top: 10, right: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12,
  },
  priceText: { color: '#10B981', fontWeight: '800', fontSize: 12 },
  info: { padding: 12 },
  title: { color: '#F8FAFC', fontSize: 14, fontWeight: '600', marginBottom: 8 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sellerInfo: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  seller: { color: '#94A3B8', fontSize: 11, fontWeight: '500' },
  addBtn: { 
    width: 28, height: 28, borderRadius: 14, backgroundColor: '#334155',
    justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#475569'
  }
});

export default memo(MarketCard);