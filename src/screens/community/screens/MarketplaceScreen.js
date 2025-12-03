import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  SafeAreaView, 
  TextInput, 
  StatusBar, 
  Platform,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient'; 
import MarketCard from '../components/MarketCard'; // Assumed component
import { Colors } from '@config/Colors'; 

const CATEGORIES = ['All', 'Hardware', 'Digital', 'Services', 'Merch'];

// 1. Single Mock Data Item
const INITIAL_ITEMS = [
  {
    id: 'm1',
    title: 'Legendary Sword',
    price: '1,500 Gold',
    image: 'https://images.unsplash.com/photo-1589252084795-356c8db2778e?auto=format&fit=crop&w=800&q=80', // Placeholder image
    category: 'Hardware',
    seller: 'KnightWalker',
    sellerAvatar: 'https://ui-avatars.com/api/?name=KnightWalker&background=0D8ABC&color=fff',
    condition: 'Mint',
    rating: 5.0,
    sales: 42,
    description: 'A handcrafted replica sword. Perfect for cosplay or display. Forged from high-quality steel.',
  }
];

const MarketplaceScreen = ({ navigation }) => {
  const [searchText, setSearchText] = useState('');
  const [activeCat, setActiveCat] = useState('All');
  const [filteredItems, setFilteredItems] = useState(INITIAL_ITEMS);

  // 2. Filter Logic (Search + Category)
  useEffect(() => {
    let result = INITIAL_ITEMS;

    // Filter by Category
    if (activeCat !== 'All') {
      result = result.filter(item => item.category === activeCat);
    }

    // Filter by Search Text
    if (searchText) {
      result = result.filter(item => 
        item.title.toLowerCase().includes(searchText.toLowerCase()) ||
        item.seller.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    setFilteredItems(result);
  }, [searchText, activeCat]);

  // --- Functions ---
  const handleFilterPress = () => {
    Alert.alert("Filters", "Opening advanced filter options...");
  };

  const handleItemPress = (item) => {
    navigation.navigate('MarketDetail', { item });
  };

  // ----------------

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.navBar}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.circleBtn}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        
        <Text style={styles.screenTitle}>Marketplace</Text>
        
        <TouchableOpacity style={styles.circleBtn} onPress={handleFilterPress}>
          <Ionicons name="filter" size={20} color={Colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchWrapper}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={Colors.textSecondary} />
          <TextInput 
            placeholder="Search items, sellers, gear..." 
            placeholderTextColor={Colors.textSecondary}
            style={styles.input}
            selectionColor={Colors.primary}
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <Ionicons name="close-circle" size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

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
                    colors={[Colors.primary, '#0090D8']}
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

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconCircle}>
        <Ionicons name="cart-outline" size={50} color={Colors.textSecondary} />
      </View>
      <Text style={styles.emptyTitle}>
        {searchText ? "No matches found" : "Market is Quiet"}
      </Text>
      <Text style={styles.emptySubtitle}>
        {searchText 
          ? `We couldn't find anything for "${searchText}".` 
          : "Be the first to list something in this category!"}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      <FlatList
        data={filteredItems}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <MarketCard 
            item={item} 
            onPress={() => handleItemPress(item)} 
          />
        )}
        numColumns={2}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
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
    color: Colors.text, 
    fontSize: 20, 
    fontWeight: '700',
    letterSpacing: 0.5 
  },
  circleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchWrapper: { paddingHorizontal: 20, marginBottom: 20 },
  searchContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: Colors.surface, 
    borderRadius: 16, 
    paddingHorizontal: 16, 
    height: 52, 
    borderWidth: 1, 
    borderColor: 'transparent',
  },
  input: { 
    flex: 1, 
    marginLeft: 12, 
    color: Colors.text, 
    fontSize: 16,
    fontWeight: '500' 
  },
  catContainer: { marginBottom: 10 },
  catWrapper: { marginRight: 10 },
  catChip: { 
    paddingHorizontal: 20, 
    paddingVertical: 10, 
    borderRadius: 24, 
    backgroundColor: Colors.surface,
  },
  catChipActive: { 
    paddingHorizontal: 22, 
    paddingVertical: 11, 
    borderRadius: 24, 
    justifyContent: 'center',
    alignItems: 'center'
  },
  catText: { color: Colors.textSecondary, fontWeight: '600', fontSize: 14 },
  catTextActive: { color: Colors.text, fontWeight: '700', fontSize: 14 },
  listContent: { flexGrow: 1, paddingBottom: 100 },
  columnWrapper: { justifyContent: 'space-between', paddingHorizontal: 20 },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
    paddingHorizontal: 40,
  },
  emptyIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
});

export default MarketplaceScreen;