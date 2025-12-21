import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Colors } from '@config/Colors';

const THEME = {
    glass: 'rgba(255,255,255,0.05)',
    border: 'rgba(255,255,255,0.1)',
    cardBg: '#121214'
};

const GuildCard = ({ item, onPress, onActionPress }) => {
  return (
    <TouchableOpacity 
      activeOpacity={0.9}
      style={styles.cardContainer}
      onPress={onPress}
    >
      <ImageBackground 
        source={{ uri: item.cover }} 
        style={styles.cover}
        imageStyle={{ borderRadius: 24 }}
      >
        {/* Rim Light Effect */}
        <View style={styles.rimLight} />
        
        <View style={styles.topActions}>
            <BlurView intensity={20} tint="dark" style={styles.iconBadge}>
                <Ionicons name={item.icon} size={18} color={item.accent || Colors.primary} />
            </BlurView>
        </View>

        <View style={styles.footerContainer}>
            <BlurView intensity={30} tint="dark" style={styles.footerBlur}>
                <View style={styles.footerContent}>
                    <View style={styles.textContainer}>
                        <Text style={styles.title} numberOfLines={1}>{item.name}</Text>
                        <View style={styles.statRow}>
                            <View style={styles.indicator} />
                            <Text style={styles.members}>{item.members} members online</Text>
                        </View>
                    </View>
                    
                    <TouchableOpacity 
                        style={[styles.actionBtn, { backgroundColor: item.accent || Colors.primary }]} 
                        onPress={onActionPress || onPress}
                    >
                        <Ionicons name="chevron-forward" size={20} color="#FFF" />
                    </TouchableOpacity>
                </View>
            </BlurView>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: { 
    height: 240, 
    marginBottom: 20, 
    borderRadius: 24,
    backgroundColor: THEME.cardBg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  cover: { flex: 1, justifyContent: 'space-between' },
  rimLight: { ...StyleSheet.absoluteFillObject, borderRadius: 24, borderWidth: 1, borderColor: THEME.border },
  topActions: { padding: 16, alignItems: 'flex-start' },
  iconBadge: { padding: 10, borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: THEME.border },
  
  footerContainer: { padding: 12 },
  footerBlur: { borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: THEME.border },
  footerContent: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  textContainer: { flex: 1 },
  title: { color: '#FFF', fontSize: 18, fontWeight: '900', letterSpacing: -0.5 },
  statRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  indicator: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#4ade80', marginRight: 6 },
  members: { color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '600' },
  
  actionBtn: {
    width: 44, height: 44, borderRadius: 14, 
    justifyContent: 'center', alignItems: 'center',
    shadowColor: "#000", shadowOpacity: 0.3, shadowRadius: 5
  }
});

export default memo(GuildCard);