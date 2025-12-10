import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Colors } from '@config/Colors';
import { Ionicons } from '@expo/vector-icons';

const FeaturedLinks = ({ title, links }) => (
  <View style={styles.container}>
    <Text style={styles.title}>{title}</Text>
    {links.map((link, index) => (
      <TouchableOpacity key={index} style={styles.linkRow} onPress={() => Linking.openURL(link.url)}>
        <Ionicons name="link" size={20} color={Colors.primary} />
        <Text style={styles.linkLabel}>{link.label}</Text>
      </TouchableOpacity>
    ))}
  </View>
);

const styles = StyleSheet.create({
    container: { padding: 20, backgroundColor: Colors.surface, marginHorizontal: 16, marginBottom: 16, borderRadius: 12 },
    title: { color: Colors.text, fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
    linkRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
    linkLabel: { color: Colors.text, fontSize: 16, marginLeft: 12 }
});

export default FeaturedLinks;