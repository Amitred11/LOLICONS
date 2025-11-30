import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar, 
  Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient'; // Ensure you have expo-linear-gradient installed
import GuildCard from '../components/GuildCard';
import { GUILDS } from '../data/communityData';

const CommunityScreen = ({ navigation }) => {
  
  const renderHeader = () => (
    <View style={styles.headerContainer}>
      
      {/* Top Header Section */}
      <View style={styles.headerTop}>
        <View>
          <Text style={styles.welcomeText}>Welcome back</Text>
          <Text style={styles.titleText}>Community Hub</Text>
        </View>
        <TouchableOpacity 
          style={styles.iconButton}
          onPress={() => navigation.navigate('Notifications')}
        >
          <Ionicons name="notifications-outline" size={24} color="#E2E8F0" />
          <View style={styles.notificationBadge} />
        </TouchableOpacity>
      </View>

      {/* Modern Marketplace Banner */}
      <TouchableOpacity 
        activeOpacity={0.9}
        onPress={() => navigation.navigate('Marketplace')}
      >
        <LinearGradient
          colors={['#6366F1', '#4F46E5']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.banner}
        >
          <View style={styles.bannerContent}>
            <View style={styles.bannerIconContainer}>
              <Ionicons name="storefront" size={24} color="#FFF" />
            </View>
            <View style={styles.bannerTextContainer}>
              <Text style={styles.bannerTitle}>Marketplace</Text>
              <Text style={styles.bannerSub}>Trade rare gear & items</Text>
            </View>
          </View>
          
          <View style={styles.arrowBtn}>
             <Ionicons name="arrow-forward" size={20} color="#4F46E5" />
          </View>
        </LinearGradient>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Popular Realms</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
      <FlatList
        data={GUILDS}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <GuildCard 
            item={item} 
            onPress={() => navigation.navigate('GuildDetail', { guildId: item.id })} 
          />
        )}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#0F172A' 
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  headerContainer: { 
    // Fix for Header Spacing
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 20 : 10,
    marginBottom: 20 
  },
  headerTop: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 30 
  },
  welcomeText: { 
    color: '#94A3B8', 
    fontSize: 14, 
    fontWeight: '600', 
    letterSpacing: 0.5,
    textTransform: 'uppercase' 
  },
  titleText: { 
    color: '#F8FAFC', 
    fontSize: 32, 
    fontWeight: '800',
    letterSpacing: -0.5
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155'
  },
  notificationBadge: {
    position: 'absolute',
    top: 12,
    right: 14,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    borderWidth: 1,
    borderColor: '#1E293B'
  },
  
  // Banner Styles
  banner: { 
    borderRadius: 24, 
    padding: 20, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: 35,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  bannerIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerTextContainer: {
    justifyContent: 'center',
  },
  bannerTitle: { 
    color: '#FFF', 
    fontSize: 18, 
    fontWeight: '800' 
  },
  bannerSub: { 
    color: '#E0E7FF', 
    fontSize: 13,
    fontWeight: '500'
  },
  arrowBtn: { 
    backgroundColor: '#FFF', 
    width: 36, 
    height: 36, 
    borderRadius: 18,
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  
  sectionTitle: { 
    color: '#F8FAFC', 
    fontSize: 22, 
    fontWeight: '700', 
    marginBottom: 15 
  }
});

export default CommunityScreen;