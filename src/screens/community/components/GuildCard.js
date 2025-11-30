import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const GuildCard = ({ item, onPress }) => {
  return (
    <TouchableOpacity 
      activeOpacity={0.95}
      style={styles.cardContainer}
      onPress={onPress}
    >
      <ImageBackground 
        source={{ uri: item.cover }} 
        style={styles.cover}
        imageStyle={{ borderRadius: 24 }}
      >
        <LinearGradient
          colors={['transparent', 'rgba(15, 23, 42, 0.9)', '#0F172A']}
          locations={[0, 0.6, 1]}
          style={styles.gradientOverlay}
        >
          <View style={styles.cardContent}>
            
            <View style={styles.headerRow}>
              <View style={[styles.iconBubble, { backgroundColor: item.accent }]}>
                <Ionicons name={item.icon} size={20} color="#FFF" />
              </View>
              {/* Optional: Add a "Join" or "View" pill here */}
            </View>

            <View style={styles.bottomRow}>
              <View style={styles.textContainer}>
                <Text style={styles.title}>{item.name}</Text>
                <View style={styles.memberTag}>
                  <Ionicons name="people" size={12} color="#94A3B8" style={{marginRight: 4}} />
                  <Text style={styles.members}>{item.members} Members</Text>
                </View>
              </View>
              
              <TouchableOpacity style={styles.actionBtn}>
                <Ionicons name="arrow-forward" size={20} color="#FFF" />
              </TouchableOpacity>
            </View>

          </View>
        </LinearGradient>
      </ImageBackground>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: { 
    height: 220, 
    marginBottom: 24, 
    borderRadius: 24,
    // Shadow for depth
    backgroundColor: '#1E293B',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  cover: { 
    width: '100%', 
    height: '100%',
    justifyContent: 'flex-end',
  },
  gradientOverlay: {
    width: '100%',
    height: '100%',
    justifyContent: 'space-between', // Pushes content to top and bottom
    padding: 16,
    borderRadius: 24,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'space-between'
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  iconBubble: { 
    width: 40, 
    height: 40, 
    borderRadius: 14, 
    justifyContent: 'center', 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    backdropFilter: 'blur(10px)', // iOS only, adds glass effect
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10
  },
  textContainer: { 
    flex: 1,
    marginRight: 10
  },
  title: { 
    color: '#FFF', 
    fontSize: 20, 
    fontWeight: 'bold',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 10
  },
  memberTag: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  members: { 
    color: '#CBD5E1', 
    fontSize: 13, 
    fontWeight: '500' 
  },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  }
});

export default GuildCard;