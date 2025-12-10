import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@config/Colors';

const WelcomeBanner = ({ title, message }) => (
  <View style={styles.banner}>
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.message}>{message}</Text>
  </View>
);

const styles = StyleSheet.create({
  banner: { padding: 20, backgroundColor: Colors.surface, margin: 16, borderRadius: 12 },
  title: { color: Colors.text, fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  message: { color: Colors.textSecondary, fontSize: 15, lineHeight: 22 },
});

export default WelcomeBanner;