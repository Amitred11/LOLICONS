import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  SafeAreaView, 
  TextInput, 
  StatusBar, 
  Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient'; // Make sure this is installed
import MarketCard from '../components/MarketCard';
import { MARKET_ITEMS } from '../data/communityData';

const CATEGORIES = ['All', 'Hardware', 'Digital', 'Services', 'Merch'];

const MarketplaceScreen = ({ navigation }) => {
  const [activeCat, setActiveCat] = useState('All');

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* Top Nav */}
      <View style={styles.navBar}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.circleBtn}
        >
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        
        <Text style={styles.screenTitle}>Marketplace</Text>
        
        <TouchableOpacity style={styles.circleBtn}>
          <Ionicons name="filter" size={22} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Search Input */}
      <View style={styles.searchWrapper}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#94A3B8" />
          <TextInput 
            placeholder="Search items, sellers, gear..." 
            placeholderTextColor="#64748B"
            style={styles.input}
            selectionColor="#6366F1"
          />
        </View>
      </View>

      {/* Categories */}
      <View style={styles.catContainer}>
        <FlatList 
          horizontal 
          data={CATEGORIES}
          keyExtractor={item => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20 }}
          renderItem={({ item }) => {
            const isActive = activeCat === item;
            return (
              <TouchableOpacity 
                activeOpacity={0.8}
                onPress={() => setActiveCat(item)}
                style={styles.catWrapper}
              >
                {isActive ? (
                  <LinearGradient
                    colors={['#6366F1', '#4F46E5']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.catChipActive}
                  >
                    <Text style={styles.catTextActive}>{item}</Text>
                  </LinearGradient>
                ) : (
                  <View style={styles.catChip}>
                    <Text style={styles.catText}>{item}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          }}
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
      <FlatList
        data={MARKET_ITEMS}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <MarketCard 
            item={item} 
            onPress={() => navigation.navigate('MarketDetail', { item })} 
          />
        )}
        numColumns={2}
        ListHeaderComponent={renderHeader}
        columnWrapperStyle={styles.columnWrapper}
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
  headerContainer: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 10,
    paddingBottom: 10,
  },
  navBar: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20,
    marginBottom: 20 
  },
  screenTitle: { 
    color: '#F8FAFC', 
    fontSize: 20, 
    fontWeight: '700',
    letterSpacing: 0.5 
  },
  circleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155'
  },

  // Search
  searchWrapper: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#1E293B', 
    borderRadius: 16, 
    paddingHorizontal: 16, 
    height: 52, 
    borderWidth: 1, 
    borderColor: '#334155',
    // Subtle shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3
  },
  input: { 
    flex: 1, 
    marginLeft: 12, 
    color: '#FFF', 
    fontSize: 16,
    fontWeight: '500' 
  },

  // Categories
  catContainer: {
    marginBottom: 10,
  },
  catWrapper: {
    marginRight: 10,
  },
  catChip: { 
    paddingHorizontal: 20, 
    paddingVertical: 10, 
    borderRadius: 24, 
    backgroundColor: 'transparent',
    borderWidth: 1, 
    borderColor: '#334155' 
  },
  catChipActive: { 
    paddingHorizontal: 22, 
    paddingVertical: 11, 
    borderRadius: 24, 
    justifyContent: 'center',
    alignItems: 'center'
  },
  catText: { 
    color: '#94A3B8', 
    fontWeight: '600', 
    fontSize: 14 
  },
  catTextActive: { 
    color: '#FFF', 
    fontWeight: '700', 
    fontSize: 14 
  },

  // List
  listContent: {
    paddingBottom: 100,
  },
  columnWrapper: { 
    justifyContent: 'space-between', 
    paddingHorizontal: 20 
  }
});

export default MarketplaceScreen;