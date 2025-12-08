import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, 
  SafeAreaView, StatusBar, Platform, ActivityIndicator, 
  LayoutAnimation, UIManager
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useCommunity } from '@context/main/CommunityContext';
import { Colors } from '@config/Colors'; 

// Components
import GuildCard from '../components/GuildCard';
import CommunitySearchHeader from '../components/CommunitySearchHeader'; // Import the new component


const CommunityScreen = ({ navigation }) => {
  const { guilds, fetchGuilds, isLoadingGuilds } = useCommunity();
  
  const [searchText, setSearchText] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetchGuilds(); 
  }, [fetchGuilds]);

  const handleGuildPress = useCallback((guildId) => {
    navigation.navigate('GuildDetail', { guildId });
  }, [navigation]);

  // Filter Logic
  const displayedGuilds = useMemo(() => {
    if (searchText) {
      return guilds.filter(g => 
        g.name.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    return showAll ? guilds : guilds.slice(0, 4);
  }, [guilds, searchText, showAll]);

  // View All / Show Less Handlers
  const toggleShowAll = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowAll(prev => !prev);
  }, []);

  // Marketplace Banner & Section Title (Scrollable Header)
  const renderListHeader = () => (
    <View style={styles.scrollHeaderContainer}>
      {!isSearchFocused && !searchText && (
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
      )}

      <Text style={styles.sectionTitle}>
        {searchText ? 'Search Results' : 'Popular Realms'}
      </Text>
    </View>
  );

  // Footer (View All Button)
  const renderListFooter = () => {
    if (searchText || isLoadingGuilds || guilds.length <= 4) return <View style={styles.footerSpacer} />;

    return (
      <View style={styles.footerContainer}>
        <TouchableOpacity 
          style={styles.viewAllBtn} 
          onPress={toggleShowAll}
          activeOpacity={0.8}
        >
          <Text style={styles.viewAllText}>{showAll ? "Show Less" : "View All Realms"}</Text>
          <Ionicons name={showAll ? "chevron-up" : "chevron-down"} size={16} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderEmptyState = () => {
    if (isLoadingGuilds) return <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 50 }} />;
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="planet-outline" size={48} color={Colors.textSecondary} />
        <Text style={styles.emptyText}>
          {searchText ? `No realm named "${searchText}"` : "No communities available."}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      
      {/* 1. Static Header Component (Sticky) */}
      <View style={{ paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 0 }}>
        <CommunitySearchHeader 
          searchText={searchText}
          setSearchText={setSearchText}
          isFocused={isSearchFocused}
          setIsFocused={setIsSearchFocused}
          navigation={navigation}
        />
      </View>

      {/* 2. Scrollable Content */}
      <FlatList
        data={displayedGuilds} 
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <GuildCard 
            item={item} 
            onPress={() => handleGuildPress(item.id)}
            onActionPress={() => handleGuildPress(item.id)}
          />
        )}
        ListHeaderComponent={renderListHeader}
        ListFooterComponent={renderListFooter}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        // These props ensure smooth keyboard interaction
        keyboardShouldPersistTaps="handled" 
        keyboardDismissMode="on-drag"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollHeaderContainer: { marginBottom: 15, marginTop: 10 },
  sectionTitle: { color: Colors.text, fontSize: 22, fontWeight: '700', marginLeft: 4 },
  
  // Banner Styles
  banner: { borderRadius: 24, padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  bannerContent: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  bannerIconContainer: { width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  bannerTextContainer: { justifyContent: 'center' },
  bannerTitle: { color: '#FFF', fontSize: 18, fontWeight: '800' },
  bannerSub: { color: '#E0E7FF', fontSize: 13, fontWeight: '500' },
  arrowBtn: { backgroundColor: '#FFF', width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  
  listContent: { paddingHorizontal: 20, paddingBottom: 100 },
  
  // Footer
  footerContainer: { alignItems: 'center', marginVertical: 20, paddingBottom: 20 },
  footerSpacer: { height: 50 },
  viewAllBtn: { 
    flexDirection: 'row', alignItems: 'center', 
    paddingVertical: 12, paddingHorizontal: 20, 
    backgroundColor: Colors.surface, borderRadius: 24 
  },
  viewAllText: { color: Colors.textSecondary, fontSize: 14, fontWeight: '600', marginRight: 6 },
  
  emptyContainer: { alignItems: 'center', marginTop: 40 },
  emptyText: { color: Colors.textSecondary, marginTop: 10, fontSize: 16 },
});

export default CommunityScreen;