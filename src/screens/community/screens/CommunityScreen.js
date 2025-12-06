import React, { useEffect, useState, useMemo, useRef } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, 
  SafeAreaView, StatusBar, Platform, ActivityIndicator, TextInput, 
  LayoutAnimation, UIManager, Keyboard
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import GuildCard from '../components/GuildCard';
import { useCommunity } from '@context/main/CommunityContext';
import { Colors } from '@config/Colors'; 
import { useNotifications } from '@context/main/NotificationContext';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const CommunityScreen = ({ navigation }) => {
  const { guilds, fetchGuilds, isLoadingGuilds } = useCommunity();
  const { unreadCount } = useNotifications();
  
  const [searchText, setSearchText] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetchGuilds(); 
  }, [fetchGuilds]);

  // Handle Search Bar Focus/Blur Animation
  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [isSearchFocused, searchText]);

  const handleGuildPress = (guildId) => {
    navigation.navigate('GuildDetail', { guildId });
  };

  // 2. FIXED: Filter strictly by Name & Local Performance optimization
  const displayedGuilds = useMemo(() => {
    if (searchText) {
      // Only search by realm name
      return guilds.filter(g => 
        g.name.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    // If showing all, return all, otherwise slice first 4
    return showAll ? guilds : guilds.slice(0, 4);
  }, [guilds, searchText, showAll]);

  // Toggle "View All"
  const handleViewAll = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowAll(true);
  };

  const handleShowLess = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowAll(false);
  };

  const renderHeader = () => (
    <View style={styles.scrollHeaderContainer}>
      {/* Hide Banner when searching to give more space to results */}
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

  // 3. FIXED: View All is now a Footer Component
  const renderFooter = () => {
    // Hide footer if searching or loading
    if (searchText || isLoadingGuilds) return <View style={styles.footerSpacer} />;

    return (
      <View style={styles.footerContainer}>
        {!showAll && guilds.length > 4 ? (
          <TouchableOpacity 
            style={styles.viewAllBtn} 
            onPress={handleViewAll}
            activeOpacity={0.8}
          >
            <Text style={styles.viewAllText}>View All Realms</Text>
            <Ionicons name="chevron-down" size={16} color={Colors.textSecondary} />
          </TouchableOpacity>
        ) : showAll && guilds.length > 4 ? (
          <TouchableOpacity 
            style={styles.viewAllBtn} 
            onPress={handleShowLess}
            activeOpacity={0.8}
          >
            <Text style={styles.viewAllText}>Show Less</Text>
            <Ionicons name="chevron-up" size={16} color={Colors.textSecondary} />
          </TouchableOpacity>
        ) : null}
      </View>
    );
  };

  const renderEmptyState = () => {
    if (isLoadingGuilds) return null;
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="planet-outline" size={48} color={Colors.textSecondary} />
        <Text style={styles.emptyText}>
          {searchText ? `No realm named "${searchText}"` : "No communities available."}
        </Text>
      </View>
    );
  };

  // Determine if header title should be shown
  const showTopHeader = !isSearchFocused && !searchText;

  return (
    <SafeAreaView style={styles.container}>
      {/* No KeyboardAvoidingView needed here since TabBar handles it now */}
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      
      {/* Static Header Section */}
      <View style={styles.staticHeaderContainer}>
        
        {/* 1. FIXED: This section collapses when searching */}
        {showTopHeader && (
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
        )}

        {/* Search Bar - Moves up automatically when headerTop is removed */}
        <View style={[styles.searchWrapper, !showTopHeader && styles.searchWrapperActive]}>
          <View style={[styles.searchContainer, isSearchFocused && styles.searchContainerFocused]}>
            <Ionicons 
              name={isSearchFocused ? "search" : "search-outline"} 
              size={20} 
              color={isSearchFocused ? Colors.primary : Colors.textSecondary} 
            />
            <TextInput 
              placeholder="Find a Realm by name..." 
              placeholderTextColor={Colors.textSecondary}
              style={styles.searchInput}
              selectionColor={Colors.primary}
              value={searchText}
              onChangeText={setSearchText}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              returnKeyType="search"
              autoCorrect={false}
            />
            {(searchText.length > 0 || isSearchFocused) && (
              <TouchableOpacity onPress={() => {
                setSearchText('');
                Keyboard.dismiss();
                setIsSearchFocused(false);
              }}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* Content List */}
      {isLoadingGuilds && guilds.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
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
          ListHeaderComponent={renderHeader}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmptyState}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled" 
          keyboardDismissMode="on-drag"
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  staticHeaderContainer: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 15 : 10,
    paddingHorizontal: 20,
    backgroundColor: Colors.background,
    zIndex: 10,
    paddingBottom: 5,
  },
  headerTop: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 20,
    overflow: 'hidden' // Important for animation
  },
  welcomeText: { color: Colors.textSecondary, fontSize: 14, fontWeight: '600', textTransform: 'uppercase' },
  titleText: { color: Colors.text, fontSize: 32, fontWeight: '800', letterSpacing: -0.5 },
  notificationBadge: { position: 'absolute', top: 12, right: 14, width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.danger },
  
  searchWrapper: { marginBottom: 10 },
  searchWrapperActive: { marginTop: 10 }, // Add some margin when it hits top
  searchContainer: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: 16, 
    paddingHorizontal: 16, height: 52, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
  },
  searchContainerFocused: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(30, 41, 59, 1)', // Slightly lighter when focused
  },
  searchInput: { flex: 1, marginLeft: 12, color: Colors.text, fontSize: 16 },
  cancelText: { color: Colors.textSecondary, fontSize: 14, fontWeight: '500', marginLeft: 8 },

  scrollHeaderContainer: { marginBottom: 15, marginTop: 10 },
  sectionTitle: { color: Colors.text, fontSize: 22, fontWeight: '700', marginLeft: 4 },

  banner: { borderRadius: 24, padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  bannerContent: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  bannerIconContainer: { width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  bannerTextContainer: { justifyContent: 'center' },
  bannerTitle: { color: '#FFF', fontSize: 18, fontWeight: '800' },
  bannerSub: { color: '#E0E7FF', fontSize: 13, fontWeight: '500' },
  arrowBtn: { backgroundColor: '#FFF', width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  
  listContent: { paddingHorizontal: 20, paddingBottom: 100 },
  
  // Footer Styles
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