import React from 'react';
import { Text, StyleSheet, ImageBackground, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../../constants/Colors';

const { width } = Dimensions.get('window');

const EventCard = ({ item }) => (
    <TouchableOpacity style={styles.eventCard}>
      <ImageBackground source={item.image} style={styles.eventImage} imageStyle={{borderRadius: 20}}>
          <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={styles.eventOverlay}>
            <Text style={styles.eventDate}>{item.date}</Text>
            <Text style={styles.eventTitle}>{item.title}</Text>
          </LinearGradient>
      </ImageBackground>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    eventCard: { width: width * 0.7, height: width * 0.4, marginRight: 15, borderRadius: 20, overflow: 'hidden' },
    eventImage: { flex: 1, justifyContent: 'flex-end' },
    eventOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'flex-end', padding: 15, backgroundColor: 'rgba(0,0,0,0.4)' },
    eventDate: { fontFamily: 'Poppins_600SemiBold', color: Colors.secondary, fontSize: 12 },
    eventTitle: { fontFamily: 'Poppins_700Bold', color: '#fff', fontSize: 18, marginTop: 4 },
});

export default EventCard;