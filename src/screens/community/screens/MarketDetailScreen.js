import React from 'react';
import { 
  View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, SafeAreaView, Dimensions, Alert, StatusBar 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const MarketDetailScreen = ({ route, navigation }) => {
  const { item } = route.params;

  const handleContact = () => {
    Alert.alert("Contact Seller", `Starting chat with @${item.seller}...`);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        
        {/* Product Image Area */}
        <View style={styles.imageHeader}>
          <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />
          
          <LinearGradient
             colors={['rgba(0,0,0,0.6)', 'transparent']}
             style={styles.gradientHeader}
          />

          <TouchableOpacity 
            style={styles.backBtn} 
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* Details Sheet */}
        <View style={styles.sheet}>
          <View style={styles.dragHandle} />

          {/* Title Section */}
          <View style={styles.titleRow}>
            <View style={{ flex: 1, paddingRight: 10 }}>
               <View style={styles.tagsRow}>
                 <View style={styles.tag}>
                   <Text style={styles.tagText}>{item.category || 'Gear'}</Text>
                 </View>
                 <View style={[styles.tag, styles.conditionTag]}>
                   <Text style={[styles.tagText, { color: '#60A5FA' }]}>Mint Condition</Text>
                 </View>
               </View>
              <Text style={styles.title}>{item.title}</Text>
            </View>
            <Text style={styles.price}>{item.price}</Text>
          </View>

          {/* Seller Card */}
          <TouchableOpacity style={styles.sellerCard} activeOpacity={0.8}>
            <View style={styles.sellerInfo}>
              <Image 
                source={{ uri: `https://ui-avatars.com/api/?name=${item.seller}&background=random` }} 
                style={styles.avatar} 
              />
              <View>
                <Text style={styles.sellerName}>@{item.seller}</Text>
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={12} color="#FBBF24" />
                  <Text style={styles.ratingText}>4.9 (120 sales)</Text>
                </View>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#64748B" />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Description */}
          <Text style={styles.sectionHeader}>About this item</Text>
          <Text style={styles.description}>
            This is a premium listing from a verified community member. 
            Excellent condition, kept in a smoke-free studio. 
            Includes original box and all accessories.
            {"\n\n"}
            Ready to ship within 24 hours. DM for more specs.
          </Text>

          {/* Safety Badge */}
          <View style={styles.safetyBox}>
            <Ionicons name="shield-checkmark" size={24} color="#10B981" />
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
            <TouchableOpacity style={styles.wishlistBtn}>
              <Ionicons name="heart-outline" size={26} color="#FFF" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.mainBtn} onPress={handleContact}>
              <Text style={styles.mainBtnText}>Contact Seller</Text>
              <Ionicons name="chatbubble-ellipses" size={20} color="#FFF" style={{ marginLeft: 8 }} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  
  // Header
  imageHeader: { 
    height: 400, 
    width: '100%',
    backgroundColor: '#1E293B' 
  },
  image: { width: '100%', height: '100%' },
  gradientHeader: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 100,
  },
  backBtn: {
    position: 'absolute', 
    top: 50, 
    left: 20,
    width: 44, 
    height: 44, 
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.4)', // Glass effect
    justifyContent: 'center', 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)'
  },

  // Content Sheet
  sheet: {
    flex: 1,
    marginTop: -40, // Overlap effect
    backgroundColor: '#0F172A',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#334155',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 25
  },

  // Title Section
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 25,
  },
  tagsRow: { flexDirection: 'row', marginBottom: 8, gap: 8 },
  tag: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155'
  },
  conditionTag: { borderColor: 'rgba(96, 165, 250, 0.3)', backgroundColor: 'rgba(96, 165, 250, 0.1)' },
  tagText: { color: '#94A3B8', fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  title: { fontSize: 24, fontWeight: '800', color: '#F8FAFC', lineHeight: 32 },
  price: { fontSize: 24, fontWeight: '700', color: '#10B981' },

  // Seller
  sellerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155'
  },
  sellerInfo: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 48, height: 48, borderRadius: 24, marginRight: 15 },
  sellerName: { color: '#FFF', fontWeight: 'bold', fontSize: 16, marginBottom: 4 },
  ratingRow: { flexDirection: 'row', alignItems: 'center' },
  ratingText: { color: '#94A3B8', fontSize: 12, marginLeft: 4 },

  divider: { height: 1, backgroundColor: '#1E293B', marginVertical: 25 },

  // Description
  sectionHeader: { color: '#F8FAFC', fontSize: 18, fontWeight: '700', marginBottom: 12 },
  description: { color: '#CBD5E1', fontSize: 15, lineHeight: 24, fontWeight: '400' },

  // Safety
  safetyBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    padding: 16,
    borderRadius: 20,
    marginTop: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)'
  },
  safetyContent: { marginLeft: 15, flex: 1 },
  safetyTitle: { color: '#10B981', fontWeight: '700', fontSize: 14, marginBottom: 2 },
  safetyDesc: { color: '#6EE7B7', fontSize: 12 },

  // Bottom Bar
  bottomBarWrapper: {
    position: 'absolute', bottom: 0, width: '100%',
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderTopWidth: 1, borderTopColor: '#334155',
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
    backgroundColor: '#1E293B',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: '#334155'
  },
  mainBtn: {
    flex: 1, height: 52, borderRadius: 20,
    backgroundColor: '#6366F1',
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 5
  },
  mainBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' }
});

export default MarketDetailScreen;