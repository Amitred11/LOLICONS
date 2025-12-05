import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, 
  StatusBar, Dimensions, ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useCommunity } from '@context/CommunityContext'; // Import Hook
import { Colors } from '@config/Colors';

const { width } = Dimensions.get('window');

const GuildDetailScreen = ({ route, navigation }) => {
  const { guildId } = route.params;
  
  // 1. Use Context
  const { currentGuild, fetchGuildDetails, isLoadingGuilds } = useCommunity();
  const [isJoined, setIsJoined] = useState(false);

  // 2. Fetch Guild Data via Context
  useEffect(() => {
    fetchGuildDetails(guildId);
  }, [guildId, fetchGuildDetails]);

  // 3. Loading State
  if (isLoadingGuilds) {
    return (
      <View style={[styles.container, styles.center]}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // 4. Error/Not Found State (Check if currentGuild exists and matches ID)
  if (!currentGuild || currentGuild.id !== guildId) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={{ color: Colors.textSecondary }}>Guild not found</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20 }}>
          <Text style={{ color: Colors.primary }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleJoinAction = () => {
    if (isJoined) {
      navigation.navigate('Discussion', { guildId: currentGuild.id, guildName: currentGuild.name });
    } else {
      setIsJoined(true);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroContainer}>
          <Image source={{ uri: currentGuild.cover }} style={styles.heroImage} />
          <LinearGradient
            colors={['transparent', Colors.background]} 
            style={styles.heroGradient}
          />
          
          <TouchableOpacity 
            style={styles.backBtn} 
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>

        {/* Content Body */}
        <View style={styles.body}>
          {/* Header Info */}
          <View style={styles.headerContent}>
             <View style={[styles.iconBox, { backgroundColor: currentGuild.accent || Colors.primary }]}>
                <Ionicons name={currentGuild.icon} size={32} color="#FFF" />
             </View>
             <Text style={styles.title}>{currentGuild.name}</Text>
             <View style={styles.statBadge}>
                <Ionicons name="people" size={14} color={Colors.textSecondary} />
                <Text style={styles.statText}>{currentGuild.members} Members • Public Realm</Text>
             </View>
          </View>

          {/* Action Button */}
          <TouchableOpacity 
            activeOpacity={0.8}
            style={[styles.mainBtn, isJoined ? styles.btnEnter : styles.btnJoin]}
            onPress={handleJoinAction}
          >
            <Text style={[styles.btnText, isJoined && { color: '#000' }]}> 
              {isJoined ? 'Enter Realm' : 'Join Community'}
            </Text>
            <Ionicons 
              name={isJoined ? "arrow-forward" : "add-circle-outline"} 
              size={20} 
              color={isJoined ? '#000' : '#FFF'} 
              style={{ marginLeft: 8 }} 
            />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* About Section */}
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.description}>
            {currentGuild.desc || "A community dedicated to enthusiasts sharing knowledge, trading gear, and organizing meetups. Join us to get access to exclusive content and discussions."}
          </Text>

          {/* Rules / Info Grid */}
          <View style={styles.infoGrid}>
            <View style={styles.infoCard}>
              <Ionicons name="shield-checkmark-outline" size={24} color={Colors.secondary} />
              <Text style={styles.infoTitle}>Verified</Text>
              <Text style={styles.infoSub}>Official Guild</Text>
            </View>
            <View style={styles.infoCard}>
              <Ionicons name="flame-outline" size={24} color={Colors.primary} />
              <Text style={styles.infoTitle}>Active</Text>
              <Text style={styles.infoSub}>Daily Posts</Text>
            </View>
            <View style={styles.infoCard}>
              <Ionicons name="globe-outline" size={24} color="#A78BFA" />
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
  container: { flex: 1, backgroundColor: Colors.background },
  center: { justifyContent: 'center', alignItems: 'center' },
  heroContainer: { height: 320, width: width },
  heroImage: { width: '100%', height: '100%' },
  heroGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 150 },
  
  backBtn: {
    position: 'absolute', top: 50, left: 20,
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: Colors.border
  },

  body: { paddingHorizontal: 24, marginTop: -60 },
  
  headerContent: { alignItems: 'center', marginBottom: 25 },
  iconBox: {
    width: 64, height: 64, borderRadius: 20,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 15,
    borderWidth: 4, borderColor: Colors.background 
  },
  title: { fontSize: 28, fontWeight: '800', color: Colors.text, textAlign: 'center', marginBottom: 8 },
  statBadge: { 
    flexDirection: 'row', alignItems: 'center', 
    backgroundColor: Colors.surface, 
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 
  },
  statText: { color: Colors.textSecondary, fontSize: 13, marginLeft: 6, fontWeight: '500' },

  mainBtn: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    paddingVertical: 16, borderRadius: 16,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 5
  },
  btnJoin: { backgroundColor: Colors.primary },
  btnEnter: { backgroundColor: Colors.secondary }, 
  btnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },

  divider: { height: 1, backgroundColor: Colors.surface, marginVertical: 30 },

  sectionTitle: { color: Colors.text, fontSize: 20, fontWeight: '700', marginBottom: 12 },
  description: { color: Colors.textSecondary, fontSize: 15, lineHeight: 24, textAlign: 'left' },

  infoGrid: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 30 },
  infoCard: { 
    width: '31%', backgroundColor: Colors.surface, padding: 15, borderRadius: 16,
    alignItems: 'center', borderWidth: 1, borderColor: Colors.border
  },
  infoTitle: { color: Colors.text, fontWeight: 'bold', marginTop: 8, fontSize: 14 },
  infoSub: { color: Colors.textSecondary, fontSize: 11, marginTop: 2 }
});

export default GuildDetailScreen;