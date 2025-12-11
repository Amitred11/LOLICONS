import React, { useEffect, useState } from 'react';
import { 
  View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, 
  StatusBar, Dimensions, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
  
  // --- UPDATED: Using showToast from the AlertContext ---
  const { showToast } = useAlert();
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchGuildDetails(guildId);
  }, [guildId, fetchGuildDetails]);

  // Derived Security & Status
  const security = currentGuild ? getSecurityLevel(currentGuild) : {};
  const status = currentGuild?.membershipStatus || 'guest'; // 'guest', 'pending', 'member', 'owner'

  // --- Handlers ---

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
      if (success) {
        showToast(`Welcome to ${currentGuild.name}!`, 'success');
      } else {
        showToast("Could not join the Realm. Please try again.", 'error');
      }
    } else {
      const success = await requestGuildAccess(currentGuild.id);
      if (success) {
        showToast("Your request has been sent for approval.", 'success');
      } else {
        showToast("Could not send your request. Please try again.", 'error');
      }
    }

    setIsProcessing(false);
  };

  // Helper to determine Button Style & Text
  const getButtonConfig = () => {
    if (status === 'owner') return { text: "Manage Realm", icon: "settings-outline", style: styles.btnEnter, disabled: false };
    if (status === 'member') return { text: "Enter Realm", icon: "arrow-forward", style: styles.btnEnter, disabled: false };
    if (status === 'pending') return { text: "Request Pending", icon: "time-outline", style: styles.btnPending, disabled: true };
    
    // Not joined yet
    if (security.type === 'PUBLIC') {
      return { text: "Join Community", icon: "add-circle-outline", style: styles.btnJoin, disabled: false };
    } else {
      return { text: "Request Access", icon: "lock-closed", style: styles.btnPrivate, disabled: false };
    }
  };

  const btnConfig = getButtonConfig();

  // --- Renders ---

  if (isLoadingGuilds || !currentGuild) {
    return (
      <View style={[styles.container, styles.center]}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroContainer}>
          <Image source={{ uri: currentGuild.cover }} style={styles.heroImage} resizeMode="cover" />
          <LinearGradient colors={['transparent', Colors.background]} style={styles.heroGradient} />
          
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>

          <View style={styles.securityBadge}>
            <Ionicons name={security.icon || 'shield'} size={14} color={security.color} />
            <Text style={[styles.securityText, { color: security.color }]}>{security.label}</Text>
          </View>
        </View>

        {/* Body Section */}
        <View style={styles.body}>
          <View style={styles.headerContent}>
             <View style={[styles.iconBox, { borderColor: security.color }]}>
                <View style={[styles.iconInner, { backgroundColor: currentGuild.accent || Colors.primary }]}>
                  <Ionicons name={currentGuild.icon} size={32} color="#FFF" />
                </View>
             </View>
             
             <Text style={styles.title}>{currentGuild.name}</Text>
             
             <View style={styles.statRow}>
                <View style={styles.statBadge}>
                  <Ionicons name="people" size={14} color={Colors.textSecondary} />
                  <Text style={styles.statText}>{currentGuild.members} Members</Text>
                </View>
                {/* Status Badge */}
                <View style={[styles.statBadge, { marginLeft: 8, borderColor: status === 'guest' ? Colors.border : security.color }]}>
                  <Text style={[styles.statText, { marginLeft: 0, color: status === 'guest' ? Colors.textSecondary : security.color }]}>
                    {status === 'owner' ? 'Owner' : status === 'member' ? 'Member' : status === 'pending' ? 'Pending' : 'Guest'}
                  </Text>
                </View>
             </View>
          </View>

          {/* Action Button */}
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
                  style={{ marginLeft: 8 }} 
                />
              </>
            )}
          </TouchableOpacity>
          
          {/* Explanation Text for Private Realms */}
          {status === 'guest' && security.type !== 'PUBLIC' && (
            <Text style={styles.accessNote}>
              This is a restricted realm. Your request must be approved by an administrator before you can view content.
            </Text>
          )}

          <View style={styles.divider} />
          <Text style={styles.sectionTitle}>Manifesto</Text>
          <Text style={styles.description}>{currentGuild.desc}</Text>

          <View style={styles.infoGrid}>
            <InfoItem icon="finger-print" color={Colors.primary} title="Encrypted" sub="E2E Chat" onPress={() => showToast("Encrypted", "All chat is secured", "info")} />
            <InfoItem icon="server-outline" color={Colors.secondary} title="Low Latency" sub="PH" onPress={() => showToast("Low Latency", "Faster Connection and No Lagging", "info")} />
            <InfoItem icon="ribbon-outline" color="#A78BFA" title="Reputation" sub="Tracked" onPress={() => showToast("Reputation", "Is Secured and Will not take your data.", "info")} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const InfoItem = ({ icon, color, title, sub, onPress }) => (
  <TouchableOpacity style={styles.infoCard} onPress={onPress}>
    <Ionicons name={icon} size={24} color={color} />
    <Text style={styles.infoTitle}>{title}</Text>
    <Text style={styles.infoSub}>{sub}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { justifyContent: 'center', alignItems: 'center' },
  
  heroContainer: { height: 320, width: width },
  heroImage: { width: '100%', height: '100%' },
  heroGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 160 },
  backBtn: { position: 'absolute', top: 50, left: 20, width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  
  securityBadge: { position: 'absolute', top: 50, right: 20, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', gap: 6 },
  securityText: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  
  body: { paddingHorizontal: 24, marginTop: -60 },
  headerContent: { alignItems: 'center', marginBottom: 25 },
  iconBox: { width: 72, height: 72, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 15, backgroundColor: Colors.background, borderWidth: 4 },
  iconInner: { width: '100%', height: '100%', borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 28, fontWeight: '800', color: Colors.text, textAlign: 'center', marginBottom: 10, letterSpacing: -0.5 },
  
  statRow: { flexDirection: 'row', alignItems: 'center' },
  statBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: Colors.border },
  statText: { color: Colors.textSecondary, fontSize: 12, marginLeft: 6, fontWeight: '600' },

  // Updated Button Styles
  mainBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 18, borderRadius: 18, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  
  btnJoin: { backgroundColor: Colors.primary },      // Public Join
  btnPrivate: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.textSecondary }, // Request Access (Neutral)
  btnEnter: { backgroundColor: Colors.secondary },   // Enter (Success)
  btnPending: { backgroundColor: '#334155' },        // Pending (Disabled)

  btnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold', letterSpacing: 0.5 },
  accessNote: { color: Colors.textSecondary, fontSize: 13, textAlign: 'center', marginTop: 15, marginHorizontal: 20, fontStyle: 'italic' },

  divider: { height: 1, backgroundColor: Colors.surface, marginVertical: 30 },
  sectionTitle: { color: Colors.text, fontSize: 20, fontWeight: '700', marginBottom: 12 },
  description: { color: Colors.textSecondary, fontSize: 15, lineHeight: 24, textAlign: 'left' },

  infoGrid: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 30 },
  infoCard: { width: '32%', backgroundColor: Colors.surface, padding: 15, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  infoTitle: { color: Colors.text, fontWeight: 'bold', marginTop: 8, fontSize: 10 },
  infoSub: { color: Colors.textSecondary, fontSize: 9, marginTop: 2 },
});

export default GuildDetailScreen;