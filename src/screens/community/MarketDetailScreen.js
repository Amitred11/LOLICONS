// src/features/community/screens/MarketDetailScreen.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Colors } from '@config/Colors';

const MarketDetailScreen = ({ route, navigation }) => {
  const { item } = route.params;

  return (
    <View style={styles.container}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={styles.details}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.price}>{item.price}</Text>
        <Text style={styles.description}>
          Sold by a member of the {item.guild} guild. 
          Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        </Text>
        
        <TouchableOpacity style={styles.buyBtn}>
          <Text style={styles.buyText}>Contact Seller</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()} style={{marginTop: 20}}>
          <Text style={{color: '#888'}}>Go Back</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background || '#121212' },
  image: { width: '100%', height: 300, backgroundColor: '#333' },
  details: { padding: 20 },
  title: { color: '#FFF', fontSize: 24, fontWeight: 'bold' },
  price: { color: '#4CAF50', fontSize: 20, marginVertical: 10 },
  description: { color: '#CCC', lineHeight: 22, marginBottom: 20 },
  buyBtn: { backgroundColor: '#FF4500', padding: 15, borderRadius: 8, alignItems: 'center' },
  buyText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});

export default MarketDetailScreen;