import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, SafeAreaView, Alert, StatusBar 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@config/Colors'; 
import { useAlert } from '@context/AlertContext';

const MarketDetailScreen = ({ route, navigation }) => {
  const { item } = route.params;
  const [isWishlisted, setIsWishlisted] = useState(false);

  // --- Functions ---
  
  const handleStartChat = () => {
    // Logic to open chat channel
    console.log(`Starting chat with ID: ${item.seller}`);
    
    // Simulating Navigation to Chat Screen
    Alert.alert(
      "Connect with Seller",
      `Opening secure channel with @${item.seller}...`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Open Chat", 
          onPress: () => console.log("Navigating to ChatScreen...") // navigation.navigate('Chat', { user: item.seller })
        }
      ]
    );
  };

  const handleToggleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    // Logic to call API to save to wishlist
  };

  const handleSellerProfile = () => {
    Alert.alert("Seller Profile", `Viewing profile of @${item.seller}`);
  };

  // ----------------

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        
        {/* Product Image */}
        <View style={styles.imageHeader}>
          <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />
          <LinearGradient
             colors={['rgba(0,0,0,0.8)', 'transparent']}
             style={styles.gradientHeader}
          />
          <TouchableOpacity 
            style={styles.backBtn} 
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>

        {/* Details Sheet */}
        <View style={styles.sheet}>
          <View style={styles.dragHandle} />

          {/* Title & Price */}
          <View style={styles.titleRow}>
            <View style={{ flex: 1, paddingRight: 10 }}>
               <View style={styles.tagsRow}>
                 <View style={styles.tag}>
                   <Text style={styles.tagText}>{item.category || 'Gear'}</Text>
                 </View>
                 <View style={[styles.tag, styles.conditionTag]}>
                   <Text style={styles.conditionText}>{item.condition || 'Mint Condition'}</Text>
                 </View>
               </View>
              <Text style={styles.title}>{item.title}</Text>
            </View>
            <Text style={styles.price}>{item.price}</Text>
          </View>

          {/* Seller Card */}
          <TouchableOpacity 
            style={styles.sellerCard} 
            activeOpacity={0.8}
            onPress={handleSellerProfile}
          >
            <View style={styles.sellerInfo}>
              <Image 
                source={{ uri: item.sellerAvatar || `https://ui-avatars.com/api/?name=${item.seller}` }} 
                style={styles.avatar} 
              />
              <View>
                <Text style={styles.sellerName}>@{item.seller}</Text>
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={12} color="#FBBF24" />
                  <Text style={styles.ratingText}>
                    {item.rating || 4.9} ({item.sales || 10} sales)
                  </Text>
                </View>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Description */}
          <Text style={styles.sectionHeader}>About this item</Text>
          <Text style={styles.description}>
            {item.description || "No description provided."}
          </Text>

          {/* Safety Badge */}
          <View style={styles.safetyBox}>
            <Ionicons name="shield-checkmark" size={24} color={Colors.secondary} />
            <View style={styles.safetyContent}>
              <Text style={styles.safetyTitle}>Buyer Protection</Text>
              <Text style={styles.safetyDesc}>Verified purchase with 30-day refund policy.</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Action Bar */}
      <View style={styles.bottomBarWrapper}>
        <SafeAreaView>
          <View style={styles.bottomBarInner}>
            <TouchableOpacity 
              style={styles.wishlistBtn} 
              onPress={handleToggleWishlist}
            >
              <Ionicons 
                name={isWishlisted ? "heart" : "heart-outline"} 
                size={26} 
                color={isWishlisted ? Colors.danger : Colors.text} 
              />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.mainBtn} 
              onPress={handleStartChat}
              activeOpacity={0.9}
            >
              <Text style={styles.mainBtnText}>Contact Seller</Text>
              <Ionicons name="chatbubble-ellipses" size={20} color={Colors.text} style={{ marginLeft: 8 }} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  imageHeader: { 
    height: 400, 
    width: '100%',
    backgroundColor: Colors.surface 
  },
  image: { width: '100%', height: '100%' },
  gradientHeader: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 120,
  },
  backBtn: {
    position: 'absolute', 
    top: 50, 
    left: 20,
    width: 44, 
    height: 44, 
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)', 
    justifyContent: 'center', 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)'
  },
  sheet: {
    flex: 1,
    marginTop: -40,
    backgroundColor: Colors.background,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.surface,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 25
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 25,
  },
  tagsRow: { flexDirection: 'row', marginBottom: 8, gap: 8 },
  tag: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  conditionTag: { 
    backgroundColor: `${Colors.primary}20`, 
    borderWidth: 1,
    borderColor: `${Colors.primary}40`,
  },
  conditionText: {
    color: Colors.primary, 
    fontSize: 11, 
    fontWeight: '700', 
    textTransform: 'uppercase'
  },
  tagText: { color: Colors.textSecondary, fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  title: { fontSize: 24, fontWeight: '800', color: Colors.text, lineHeight: 32 },
  price: { fontSize: 24, fontWeight: '700', color: Colors.secondary },
  sellerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent'
  },
  sellerInfo: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 48, height: 48, borderRadius: 24, marginRight: 15 },
  sellerName: { color: Colors.text, fontWeight: 'bold', fontSize: 16, marginBottom: 4 },
  ratingRow: { flexDirection: 'row', alignItems: 'center' },
  ratingText: { color: Colors.textSecondary, fontSize: 12, marginLeft: 4 },
  divider: { height: 1, backgroundColor: Colors.surface, marginVertical: 25 },
  sectionHeader: { color: Colors.text, fontSize: 18, fontWeight: '700', marginBottom: 12 },
  description: { color: Colors.textSecondary, fontSize: 15, lineHeight: 24, fontWeight: '400' },
  safetyBox: {
    flexDirection: 'row',
    backgroundColor: `${Colors.secondary}15`,
    padding: 16,
    borderRadius: 20,
    marginTop: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: `${Colors.secondary}30`
  },
  safetyContent: { marginLeft: 15, flex: 1 },
  safetyTitle: { color: Colors.secondary, fontWeight: '700', fontSize: 14, marginBottom: 2 },
  safetyDesc: { color: Colors.textSecondary, fontSize: 12 },
  bottomBarWrapper: {
    position: 'absolute', bottom: 0, width: '100%',
    backgroundColor: Colors.background,
    borderTopWidth: 1, borderTopColor: Colors.surface,
  },
  bottomBarInner: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    alignItems: 'center',
    gap: 15
  },
  wishlistBtn: {
    width: 52, height: 52, borderRadius: 20,
    backgroundColor: Colors.surface,
    justifyContent: 'center', alignItems: 'center',
  },
  mainBtn: {
    flex: 1, height: 52, borderRadius: 20,
    backgroundColor: Colors.primary,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 5
  },
  mainBtnText: { color: Colors.text, fontSize: 16, fontWeight: 'bold' }
});

export default MarketDetailScreen;