import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, 
  SafeAreaView, StatusBar, Platform, ActivityIndicator, 
  LayoutAnimation, Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useCommunity } from '@context/main/CommunityContext';
import { Colors } from '@config/Colors'; 

// Components
import GuildCard from '../components/GuildCard';
import CommunitySearchHeader from '../components/CommunitySearchHeader';

const { width } = Dimensions.get('window');

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

  const displayedGuilds = useMemo(() => {
    if (searchText) {
      return guilds.filter(g => 
        g.name.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    return showAll ? guilds : guilds.slice(0, 4);
  }, [guilds, searchText, showAll]);

  const toggleShowAll = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
    setShowAll(prev => !prev);
  }, []);

  const renderListHeader = () => (
    <View style={styles.scrollHeaderContainer}>
      {!isSearchFocused && !searchText && (
        <TouchableOpacity 
          activeOpacity={0.9}
          onPress={() => navigation.navigate('CommunitySettings')}
          style={styles.bannerWrapper}
        >
          <LinearGradient
            colors={[Colors.primary, '#6366f1']} 
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={styles.banner}
          >
            <View style={styles.bannerContent}>
              <View style={styles.bannerTextContainer}>
                <Text style={styles.bannerLabel}>PRO FEATURES</Text>
                <Text style={styles.bannerTitle}>Marketplace</Text>
                <Text style={styles.bannerSub}>Trade rare gear & legendary items</Text>
              </View>
              <BlurView intensity={20} tint="light" style={styles.bannerIconBox}>
                <Ionicons name="storefront-outline" size={28} color="#FFF" />
              </BlurView>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      )}

      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>
            {searchText ? 'Search Results' : 'Popular Realms'}
        </Text>
        {!searchText && <View style={styles.badge}><Text style={styles.badgeText}>{guilds.length}</Text></View>}
      </View>
    </View>
  );

  const renderListFooter = () => {
    if (searchText || isLoadingGuilds || guilds.length <= 4) return <View style={styles.footerSpacer} />;

    return (
      <View style={styles.footerContainer}>
        <TouchableOpacity 
          style={styles.viewAllBtn} 
          onPress={toggleShowAll}
        >
          <Text style={styles.viewAllText}>{showAll ? "Collapse List" : "Explore All Realms"}</Text>
          <Ionicons name={showAll ? "chevron-up" : "chevron-down"} size={16} color={Colors.primary} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderEmptyState = () => {
    if (isLoadingGuilds) return (
        <View style={styles.loaderBox}>
            <ActivityIndicator size="small" color={Colors.primary} />
        </View>
    );
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyCircle}>
            <Ionicons name="search-outline" size={32} color="rgba(255,255,255,0.2)" />
        </View>
        <Text style={styles.emptyText}>
          {searchText ? `No realm named "${searchText}"` : "No communities available."}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <View style={[styles.stickyHeader, { paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 10 }]}>
        <CommunitySearchHeader 
          searchText={searchText}
          setSearchText={setSearchText}
          isFocused={isSearchFocused}
          setIsFocused={setIsSearchFocused}
          navigation={navigation}
        />
      </View>

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
        keyboardShouldPersistTaps="handled" 
        keyboardDismissMode="on-drag"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050505' },
  stickyHeader: { backgroundColor: '#050505', zIndex: 10 },
  scrollHeaderContainer: { marginBottom: 25, marginTop: 10 },
  
  // Banner Styles
  bannerWrapper: { borderRadius: 28, overflow: 'hidden', marginBottom: 30 },
  banner: { padding: 24 },
  bannerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bannerTextContainer: { flex: 1, marginRight: 15 },
  bannerLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 10, fontWeight: '900', letterSpacing: 1.5, marginBottom: 4 },
  bannerTitle: { color: '#FFF', fontSize: 24, fontWeight: '900', letterSpacing: -0.5 },
  bannerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: '500', marginTop: 4 },
  bannerIconBox: { width: 56, height: 56, borderRadius: 18, justifyContent: 'center', alignItems: 'center', overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  
  // Section Styles
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, paddingLeft: 4 },
  sectionTitle: { color: '#FFF', fontSize: 22, fontWeight: '900', letterSpacing: -0.5 },
  badge: { backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginLeft: 10 },
  badgeText: { color: Colors.primary, fontSize: 12, fontWeight: '800' },

  listContent: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 100 },
  
  // Footer
  footerContainer: { alignItems: 'center', marginVertical: 10 },
  footerSpacer: { height: 50 },
  viewAllBtn: { 
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: 14, paddingHorizontal: 24, 
    backgroundColor: '#121214', borderRadius: 20,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)'
  },
  viewAllText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  
  // States
  loaderBox: { padding: 40, alignItems: 'center' },
  emptyContainer: { alignItems: 'center', marginTop: 60, opacity: 0.5 },
  emptyCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#121214', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  emptyText: { color: 'rgba(255,255,255,0.5)', fontSize: 15, fontWeight: '600' },
});

export default CommunityScreen;