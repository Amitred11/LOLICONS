import React, { useEffect } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, 
  SafeAreaView, StatusBar, Platform, ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import GuildCard from '../components/GuildCard';
import { useCommunity } from '@context/main/CommunityContext'; // Import Hook
import { Colors } from '@config/Colors'; 
import { useNotifications } from '@context/main/NotificationContext';


const CommunityScreen = ({ navigation }) => {
  // 1. Use Context instead of local state
  const { guilds, fetchGuilds, isLoadingGuilds } = useCommunity();
  const { unreadCount } = useNotifications();
  // 2. Fetch data via context on mount
  useEffect(() => {
    fetchGuilds(); 
  }, [fetchGuilds]);

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      
      {/* Top Header Section */}
      <View style={styles.headerTop}>
        <View>
          <Text style={styles.welcomeText}>Welcome back</Text>
          <Text style={styles.titleText}>Community Hub</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
          <Ionicons name="notifications-outline" size={24} color={Colors.text} />
          {unreadCount > 0 && <View style={styles.notificationBadge} />} 
        </TouchableOpacity>
      </View>

      {/* Marketplace Banner */}
      <TouchableOpacity 
        activeOpacity={0.9}
        onPress={() => navigation.navigate('Marketplace')}
      >
        <LinearGradient
          colors={[Colors.primary, '#007BB8']} 
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
             <Ionicons name="arrow-forward" size={20} color={Colors.primary} />
          </View>
        </LinearGradient>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Popular Realms</Text>
    </View>
  );

  // 3. Render Loading State from Context
  if (isLoadingGuilds) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      <FlatList
        data={guilds} 
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
    backgroundColor: Colors.background 
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  headerContainer: { 
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
    color: Colors.textSecondary, 
    fontSize: 14, 
    fontWeight: '600', 
    letterSpacing: 0.5,
    textTransform: 'uppercase' 
  },
  titleText: { 
    color: Colors.text, 
    fontSize: 32, 
    fontWeight: '800',
    letterSpacing: -0.5
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border
  },
  notificationBadge: {
    position: 'absolute',
    top: 12,
    right: 14,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.danger,
    borderWidth: 1,
    borderColor: Colors.surface
  },
  banner: { 
    borderRadius: 24, 
    padding: 20, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: 35,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
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
    color: Colors.text, 
    fontSize: 22, 
    fontWeight: '700', 
    marginBottom: 15 
  }
});

export default CommunityScreen;