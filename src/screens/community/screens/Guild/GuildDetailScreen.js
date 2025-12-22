import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, 
  StatusBar, Dimensions, ActivityIndicator, Share, RefreshControl 
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useCommunity } from '@context/main/CommunityContext'; 
import { Colors } from '@config/Colors';
import { useAlert } from '@context/other/AlertContext';

const { width } = Dimensions.get('window');

const GuildDetailScreen = ({ route, navigation }) => {
  const { guildId } = route.params;
  const { 
    currentGuild, 
    fetchGuildDetails, 
    isLoadingGuilds, 
    getSecurityLevel,
    joinGuildPublic,
    requestGuildAccess
  } = useCommunity();
  
  const { showToast } = useAlert();
  const [isProcessing, setIsProcessing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // --- Existing Logic ---
  useEffect(() => {
    fetchGuildDetails(guildId);
  }, [guildId]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchGuildDetails(guildId);
    setRefreshing(false);
  }, [guildId]);

  const security = currentGuild ? getSecurityLevel(currentGuild) : {};
  const status = currentGuild?.membershipStatus || 'guest';

  const handleMainAction = async () => {
    if (isProcessing) return;
    if (status === 'member' || status === 'owner') {
      navigation.navigate('Discussion', { guildId: currentGuild.id, guildName: currentGuild.name });
      return;
    }
    if (status === 'pending') {
      showToast("The admins are reviewing your request.", 'info');
      return;
    }

    setIsProcessing(true);
    if (security.type === 'PUBLIC') {
      const success = await joinGuildPublic(currentGuild.id);
      if (success) showToast(`Welcome to ${currentGuild.name}!`, 'success');
      else showToast("Could not join the Realm.", 'error');
    } else {
      const success = await requestGuildAccess(currentGuild.id);
      if (success) showToast("Request sent for approval.", 'success');
      else showToast("Could not send request.", 'error');
    }
    setIsProcessing(false);
  };

  // --- New Functions ---
  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join the ${currentGuild.name} realm on our platform! Security: ${security.label}`,
        url: `https://yourapp.link/guild/${currentGuild.id}`,
      });
    } catch (error) {
      showToast("Could not open share sheet", "error");
    }
  };

  const getButtonConfig = () => {
    if (status === 'owner') return { text: "Manage Realm", icon: "settings-outline", style: styles.btnEnter, disabled: false };
    if (status === 'member') return { text: "Enter Realm", icon: "arrow-forward", style: styles.btnEnter, disabled: false };
    if (status === 'pending') return { text: "Request Pending", icon: "time-outline", style: styles.btnPending, disabled: true };
    
    if (security.type === 'PUBLIC') {
      return { text: "Join Community", icon: "add-circle-outline", style: styles.btnJoin, disabled: false };
    } else {
      return { text: "Request Access", icon: "lock-closed", style: styles.btnPrivate, disabled: false };
    }
  };

  const btnConfig = getButtonConfig();

  if (isLoadingGuilds || !currentGuild) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent />
      
      <ScrollView 
        contentContainerStyle={{ paddingBottom: 60 }} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
      >
        {/* Hero Section */}
        <View style={styles.heroContainer}>
          <Image source={{ uri: currentGuild.cover }} style={styles.heroImage} />
          <LinearGradient 
            colors={['rgba(13,13,17,0.2)', 'rgba(13,13,17,0.7)', Colors.background]} 
            style={styles.heroGradient} 
          />
          
          <View style={styles.navHeader}>
            <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
              <Ionicons name="chevron-back" size={22} color={Colors.text} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.iconBtn} onPress={handleShare}>
              <Ionicons name="share-social-outline" size={20} color={Colors.text} />
            </TouchableOpacity>
          </View>

          <View style={[styles.securityBadge, { borderColor: `${security.color}40` }]}>
            <Ionicons name={security.icon || 'shield'} size={12} color={security.color} />
            <Text style={[styles.securityText, { color: security.color }]}>{security.label}</Text>
          </View>
        </View>

        {/* Profile Content */}
        <View style={styles.body}>
          <View style={styles.headerContent}>
             <View style={[styles.iconOuterRing, { shadowColor: currentGuild.accent || Colors.primary }]}>
                <View style={styles.iconBox}>
                    <View style={[styles.iconInner, { backgroundColor: currentGuild.accent || Colors.primary }]}>
                        <Ionicons name={currentGuild.icon} size={40} color="#FFF" />
                    </View>
                </View>
             </View>
             
             <Text style={styles.title}>{currentGuild.name}</Text>
             
             <View style={styles.creatorRow}>
               <Text style={styles.creatorLabel}>Founded by </Text>
               <Text style={[styles.creatorName, { color: currentGuild.accent || Colors.primary }]}>
                 {currentGuild.creatorName || 'Elder Admin'}
               </Text>
             </View>

             <View style={styles.statRow}>
                <View style={styles.statBadge}>
                  <Ionicons name="people-outline" size={14} color={Colors.textSecondary} />
                  <Text style={styles.statText}>{currentGuild.members} Members</Text>
                </View>
                <View style={[styles.statBadge, { marginLeft: 10 }]}>
                   <View style={[styles.statusDot, { backgroundColor: status === 'guest' ? Colors.textSecondary : security.color }]} />
                   <Text style={[styles.statText, { color: status === 'guest' ? Colors.textSecondary : '#FFF' }]}>
                    {status.toUpperCase()}
                  </Text>
                </View>
             </View>
          </View>

          {/* Members Preview Section */}
          <View style={styles.memberPreviewContainer}>
              <View style={styles.avatarStack}>
                  {[1,2,3,4].map((_, i) => (
                    <View key={i} style={[styles.avatarOverlap, { zIndex: 10 - i, marginLeft: i === 0 ? 0 : -12 }]}>
                        <Image source={{ uri: `https://i.pravatar.cc/100?u=${currentGuild.id + i}` }} style={styles.avatarImg} />
                    </View>
                  ))}
                  <View style={[styles.avatarOverlap, styles.avatarCount, { marginLeft: -12 }]}>
                      <Text style={styles.avatarCountText}>+{currentGuild.members > 4 ? currentGuild.members - 4 : 0}</Text>
                  </View>
              </View>
              <Text style={styles.activeInfo}>Active now in the realm</Text>
          </View>

          {/* Main Action */}
          <TouchableOpacity 
            activeOpacity={0.9}
            style={[styles.mainBtn, btnConfig.style, isProcessing && { opacity: 0.7 }]}
            onPress={handleMainAction}
            disabled={btnConfig.disabled || isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <>
                <Text style={[styles.btnText, (status === 'member' || status === 'owner') && { color: '#000' }]}> 
                  {btnConfig.text}
                </Text>
                <Ionicons 
                  name={btnConfig.icon} 
                  size={20} 
                  color={(status === 'member' || status === 'owner') ? '#000' : '#FFF'} 
                  style={{ marginLeft: 10 }} 
                />
              </>
            )}
          </TouchableOpacity>
          
          {status === 'guest' && security.type !== 'PUBLIC' && (
            <View style={styles.lockedNotice}>
               <Ionicons name="lock-closed-outline" size={14} color={Colors.textSecondary} />
               <Text style={styles.accessNote}> Gatekeeper approval required to view discussion.</Text>
            </View>
          )}

          {/* About Section */}
          <SectionHeader title="Manifesto" />
          <Text style={styles.description}>{currentGuild.desc || "No description provided for this realm."}</Text>

          {/* Quick Info Grid */}
          <View style={styles.infoGrid}>
            <InfoItem icon="shield-checkmark-outline" color="#34D399" title="Secure" sub="End-to-End" />
            <InfoItem icon="flash-outline" color="#FBBF24" title="Latency" sub="PH-Node" />
            <InfoItem icon="ribbon-outline" color="#A78BFA" title="Rank" sub="Verified" />
          </View>

          {/* Rules Section */}
          <SectionHeader title="Realm Rules" />
          <View style={styles.rulesCard}>
              <RuleItem index="01" text="Maintain mutual respect at all times." />
              <RuleItem index="02" text="No spamming or commercial advertising." />
              <RuleItem index="03" text="Keep discussions relevant to the guild's purpose." />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

// --- Sub-Components ---

const SectionHeader = ({ title }) => (
  <View style={styles.sectionDivider}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.accentLine} />
  </View>
);

const RuleItem = ({ index, text }) => (
  <View style={styles.ruleItem}>
    <Text style={styles.ruleIndex}>{index}</Text>
    <Text style={styles.ruleText}>{text}</Text>
  </View>
);

const InfoItem = ({ icon, color, title, sub }) => (
  <View style={styles.infoCard}>
    <View style={[styles.infoIconCircle, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon} size={20} color={color} />
    </View>
    <Text style={styles.infoTitle}>{title}</Text>
    <Text style={styles.infoSub}>{sub}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { justifyContent: 'center', alignItems: 'center' },
  
  heroContainer: { height: 380, width: width },
  heroImage: { width: '100%', height: '100%' },
  heroGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 300 },
  
  navHeader: { 
    position: 'absolute', top: 55, left: 0, right: 0, 
    flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20 
  },
  iconBtn: { 
    width: 42, height: 42, borderRadius: 12, 
    backgroundColor: 'rgba(15, 15, 20, 0.7)', 
    justifyContent: 'center', alignItems: 'center', 
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' 
  },
  
  securityBadge: { 
    position: 'absolute', bottom: 100, alignSelf: 'center', 
    flexDirection: 'row', alignItems: 'center', 
    backgroundColor: 'rgba(15, 15, 20, 0.8)', 
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, 
    borderWidth: 1, gap: 6 
  },
  securityText: { fontSize: 10, fontWeight: '800', letterSpacing: 1.2, textTransform: 'uppercase' },
  
  body: { paddingHorizontal: 24, marginTop: -80 },
  headerContent: { alignItems: 'center', marginBottom: 20 },
  
  iconOuterRing: {
    padding: 4, borderRadius: 35, marginBottom: 15,
    shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 12
  },
  iconBox: { 
    width: 94, height: 94, borderRadius: 30, 
    justifyContent: 'center', alignItems: 'center', 
    backgroundColor: Colors.background, padding: 4
  },
  iconInner: { width: '100%', height: '100%', borderRadius: 26, justifyContent: 'center', alignItems: 'center' },
  
  title: { fontSize: 30, fontWeight: '900', color: Colors.text, textAlign: 'center', marginBottom: 6, letterSpacing: -0.5 },
  
  creatorRow: { flexDirection: 'row', marginBottom: 15 },
  creatorLabel: { color: Colors.textSecondary, fontSize: 13 },
  creatorName: { fontSize: 13, fontWeight: '700' },

  statRow: { flexDirection: 'row', alignItems: 'center' },
  statBadge: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.06)', 
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, 
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' 
  },
  statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 8 },
  statText: { color: Colors.textSecondary, fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },

  memberPreviewContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 25 },
  avatarStack: { flexDirection: 'row', alignItems: 'center', marginRight: 12 },
  avatarOverlap: { width: 32, height: 32, borderRadius: 16, borderWidth: 2, borderColor: Colors.background, overflow: 'hidden' },
  avatarImg: { width: '100%', height: '100%' },
  avatarCount: { backgroundColor: '#334155', justifyContent: 'center', alignItems: 'center' },
  avatarCountText: { color: '#FFF', fontSize: 10, fontWeight: '700' },
  activeInfo: { color: Colors.textSecondary, fontSize: 12, fontWeight: '500' },

  mainBtn: { 
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', 
    paddingVertical: 18, borderRadius: 20, 
    shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, 
    shadowOpacity: 0.3, shadowRadius: 10, elevation: 6 
  },
  btnJoin: { backgroundColor: Colors.primary },
  btnPrivate: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  btnEnter: { backgroundColor: Colors.secondary },
  btnPending: { backgroundColor: '#1e293b', opacity: 0.8 },
  btnText: { color: '#FFF', fontSize: 17, fontWeight: '800' },
  
  lockedNotice: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 15 },
  accessNote: { color: Colors.textSecondary, fontSize: 12, marginLeft: 6 },

  sectionDivider: { flexDirection: 'row', alignItems: 'center', marginTop: 35, marginBottom: 15, gap: 12 },
  sectionTitle: { color: Colors.text, fontSize: 16, fontWeight: '800', letterSpacing: 0.5, textTransform: 'uppercase' },
  accentLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.08)' },
  
  description: { color: 'rgba(255,255,255,0.6)', fontSize: 15, lineHeight: 24 },

  infoGrid: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 25 },
  infoCard: { 
    width: '31%', backgroundColor: 'rgba(255,255,255,0.03)', 
    paddingVertical: 16, borderRadius: 20, 
    alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' 
  },
  infoIconCircle: { width: 40, height: 40, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  infoTitle: { color: Colors.text, fontWeight: '700', fontSize: 11 },
  infoSub: { color: Colors.textSecondary, fontSize: 9, marginTop: 2 },

  rulesCard: { 
    backgroundColor: 'rgba(255,255,255,0.03)', padding: 20, borderRadius: 24, 
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' 
  },
  ruleItem: { flexDirection: 'row', marginBottom: 12 },
  ruleIndex: { color: Colors.primary, fontWeight: '900', fontSize: 12, marginRight: 15, marginTop: 2 },
  ruleText: { color: 'rgba(255,255,255,0.7)', fontSize: 14, flex: 1, lineHeight: 20 }
});

export default GuildDetailScreen;