import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, StatusBar, Dimensions 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { GUILDS } from '../data/communityData';

const { width } = Dimensions.get('window');

const GuildDetailScreen = ({ route, navigation }) => {
  const { guildId } = route.params;
  const guild = GUILDS.find(g => g.id === guildId);
  
  // State to simulate database status
  const [isJoined, setIsJoined] = useState(false);

  if (!guild) return null;

  const handleJoinAction = () => {
    if (isJoined) {
      // Navigate to the Discussion/Feed Screen
      navigation.navigate('Discussion', { guildId: guild.id, guildName: guild.name });
    } else {
      // Simulate Joining
      setIsJoined(true);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroContainer}>
          <Image source={{ uri: guild.cover }} style={styles.heroImage} />
          <LinearGradient
            colors={['transparent', '#0F172A']}
            style={styles.heroGradient}
          />
          
          <TouchableOpacity 
            style={styles.backBtn} 
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* Content Body */}
        <View style={styles.body}>
          {/* Header Info */}
          <View style={styles.headerContent}>
             <View style={[styles.iconBox, { backgroundColor: guild.accent }]}>
                <Ionicons name={guild.icon} size={32} color="#FFF" />
             </View>
             <Text style={styles.title}>{guild.name}</Text>
             <View style={styles.statBadge}>
                <Ionicons name="people" size={14} color="#94A3B8" />
                <Text style={styles.statText}>{guild.members} Members • Public Realm</Text>
             </View>
          </View>

          {/* Action Button */}
          <TouchableOpacity 
            activeOpacity={0.8}
            style={[styles.mainBtn, isJoined ? styles.btnEnter : styles.btnJoin]}
            onPress={handleJoinAction}
          >
            <Text style={styles.btnText}>
              {isJoined ? 'Enter Realm' : 'Join Community'}
            </Text>
            <Ionicons 
              name={isJoined ? "arrow-forward" : "add-circle-outline"} 
              size={20} 
              color="#FFF" 
              style={{ marginLeft: 8 }} 
            />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* About Section */}
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.description}>
            {guild.desc || "A community dedicated to enthusiasts sharing knowledge, trading gear, and organizing meetups. Join us to get access to exclusive content and discussions."}
          </Text>

          {/* Rules / Info Grid */}
          <View style={styles.infoGrid}>
            <View style={styles.infoCard}>
              <Ionicons name="shield-checkmark-outline" size={24} color="#10B981" />
              <Text style={styles.infoTitle}>Verified</Text>
              <Text style={styles.infoSub}>Official Guild</Text>
            </View>
            <View style={styles.infoCard}>
              <Ionicons name="flame-outline" size={24} color="#F59E0B" />
              <Text style={styles.infoTitle}>Active</Text>
              <Text style={styles.infoSub}>Daily Posts</Text>
            </View>
            <View style={styles.infoCard}>
              <Ionicons name="globe-outline" size={24} color="#6366F1" />
              <Text style={styles.infoTitle}>Global</Text>
              <Text style={styles.infoSub}>Open to All</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  heroContainer: { height: 320, width: width },
  heroImage: { width: '100%', height: '100%' },
  heroGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 150 },
  
  backBtn: {
    position: 'absolute', top: 50, left: 20,
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)'
  },

  body: { paddingHorizontal: 24, marginTop: -60 },
  
  headerContent: { alignItems: 'center', marginBottom: 25 },
  iconBox: {
    width: 64, height: 64, borderRadius: 20,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 15,
    borderWidth: 4, borderColor: '#0F172A'
  },
  title: { fontSize: 28, fontWeight: '800', color: '#F8FAFC', textAlign: 'center', marginBottom: 8 },
  statBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E293B', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  statText: { color: '#94A3B8', fontSize: 13, marginLeft: 6, fontWeight: '500' },

  mainBtn: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    paddingVertical: 16, borderRadius: 16,
    shadowColor: '#6366F1', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 5
  },
  btnJoin: { backgroundColor: '#6366F1' },
  btnEnter: { backgroundColor: '#10B981' }, // Green when joined
  btnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },

  divider: { height: 1, backgroundColor: '#1E293B', marginVertical: 30 },

  sectionTitle: { color: '#F8FAFC', fontSize: 20, fontWeight: '700', marginBottom: 12 },
  description: { color: '#CBD5E1', fontSize: 15, lineHeight: 24, textAlign: 'left' },

  infoGrid: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 30 },
  infoCard: { 
    width: '31%', backgroundColor: '#1E293B', padding: 15, borderRadius: 16,
    alignItems: 'center', borderWidth: 1, borderColor: '#334155'
  },
  infoTitle: { color: '#FFF', fontWeight: 'bold', marginTop: 8, fontSize: 14 },
  infoSub: { color: '#64748B', fontSize: 11, marginTop: 2 }
});

export default GuildDetailScreen;