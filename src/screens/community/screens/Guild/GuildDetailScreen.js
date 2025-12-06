import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, 
  StatusBar, Dimensions, ActivityIndicator, TextInput, KeyboardAvoidingView, 
  Platform, Keyboard, Modal, TouchableWithoutFeedback 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useCommunity } from '@context/main/CommunityContext'; 
import { Colors } from '@config/Colors';
import { useAlert } from '@context/other/AlertContext';

const { width } = Dimensions.get('window');

const GuildDetailScreen = ({ route, navigation }) => {
  const { guildId } = route.params;
  const { currentGuild, fetchGuildDetails, isLoadingGuilds, getSecurityLevel } = useCommunity();
  const { showAlert } = useAlert();

  // State
  const [isJoined, setIsJoined] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showInput, setShowInput] = useState(false); 
  const [accessCode, setAccessCode] = useState('');

  useEffect(() => {
    fetchGuildDetails(guildId);
  }, [guildId, fetchGuildDetails]);

  // Derived Security Level
  const security = currentGuild ? getSecurityLevel(currentGuild) : {};

  // --- Handlers ---

  const handleActionPress = () => {
    if (isJoined) {
      navigation.navigate('Discussion', { guildId: currentGuild.id, guildName: currentGuild.name });
      return;
    }

    if (security.type === 'OWNED') {
      enterRealm("Welcome back, Administrator.");
    } else if (security.type === 'PRIVATE') {
      setAccessCode(''); 
      setShowInput(true);
    } else {
      performSecurityCheck();
    }
  };

  const performSecurityCheck = () => {
    setIsVerifying(true);
    Keyboard.dismiss();
    setTimeout(() => {
      setIsVerifying(false);
      enterRealm("Identity verified. Access granted.");
    }, 1500);
  };

  const handlePrivateCodeSubmit = () => {
    if (accessCode.length > 0) { 
      setShowInput(false);
      performSecurityCheck();
    } else {
      showAlert({ title: "Access Denied", message: "Invalid Access Key provided.", type: 'error' });
    }
  };

  const enterRealm = (message) => {
    setIsJoined(true);
    showAlert({ title: "Access Granted", message: message, type: 'success' });
  };

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
      
      {/* Main Content */}
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
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

        <View style={styles.body}>
          <View style={styles.headerContent}>
             <View style={[styles.iconBox, { borderColor: security.type === 'OWNED' ? '#FBBF24' : Colors.background }]}>
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
                <View style={[styles.statBadge, { marginLeft: 8 }]}>
                  <Ionicons name="shield-checkmark" size={14} color={Colors.textSecondary} />
                  <Text style={styles.statText}>Secure</Text>
                </View>
             </View>
          </View>

          <TouchableOpacity 
            activeOpacity={0.9}
            style={[
              styles.mainBtn, 
              isJoined ? styles.btnEnter : (security.type === 'PRIVATE' ? styles.btnPrivate : styles.btnJoin)
            ]}
            onPress={handleActionPress}
            disabled={isVerifying}
          >
            {isVerifying ? (
              <>
                <ActivityIndicator size="small" color="#FFF" style={{ marginRight: 10 }} />
                <Text style={styles.btnText}>Verifying Credentials...</Text>
              </>
            ) : (
              <>
                <Text style={[styles.btnText, isJoined && { color: '#000' }]}> 
                  {isJoined ? 'Enter Realm' : (security.type === 'PRIVATE' ? 'Request Access' : 'Join Community')}
                </Text>
                <Ionicons 
                  name={isJoined ? "arrow-forward" : (security.type === 'PRIVATE' ? "lock-closed" : "add-circle-outline")} 
                  size={20} 
                  color={isJoined ? '#000' : '#FFF'} 
                  style={{ marginLeft: 8 }} 
                />
              </>
            )}
          </TouchableOpacity>

          <View style={styles.divider} />
          <Text style={styles.sectionTitle}>Manifesto</Text>
          <Text style={styles.description}>{currentGuild.desc}</Text>

          <View style={styles.infoGrid}>
            <InfoItem icon="finger-print" color={Colors.primary} title="Encrypted" sub="E2E Chat" />
            <InfoItem icon="server-outline" color={Colors.secondary} title="Low Latency" sub="US-East" />
            <InfoItem icon="ribbon-outline" color="#A78BFA" title="Reputation" sub="Tracked" />
          </View>
        </View>
      </ScrollView>

      {/* --- FIX: RESTRUCTURED MODAL HIERARCHY --- */}
      <Modal
        visible={showInput}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowInput(false)}
      >
        {/* 
          1. KeyboardAvoidingView is the ROOT. 
          2. It has the background color. 
          3. Behavior is disabled on Android to prevent black void (Android handles it natively).
        */}
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
          style={styles.modalOverlay}
        >
          {/* This handles tapping outside to dismiss keyboard */}
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalInnerContainer}>
              
              {/* This prevents tapping the CARD from dismissing keyboard */}
              <TouchableWithoutFeedback onPress={() => {}}>
                <View style={styles.modalCard}>
                  <View style={styles.modalHeader}>
                    <Ionicons name="shield-half" size={32} color={Colors.text} />
                    <TouchableOpacity onPress={() => setShowInput(false)}>
                      <Ionicons name="close" size={24} color={Colors.textSecondary} />
                    </TouchableOpacity>
                  </View>
                  
                  <Text style={styles.modalTitle}>Restricted Access</Text>
                  <Text style={styles.modalSub}>This realm is private. Please enter your unique access key to proceed.</Text>
                  
                  <TextInput 
                    style={styles.input}
                    placeholder="Enter Access Key"
                    placeholderTextColor={Colors.textSecondary}
                    secureTextEntry
                    autoFocus={true}
                    value={accessCode}
                    onChangeText={setAccessCode}
                    onSubmitEditing={handlePrivateCodeSubmit}
                    returnKeyType="go"
                  />
                  
                  <TouchableOpacity style={styles.modalBtn} onPress={handlePrivateCodeSubmit}>
                    <Text style={styles.modalBtnText}>Unlock Realm</Text>
                  </TouchableOpacity>
                </View>
              </TouchableWithoutFeedback>

            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>

    </View>
  );
};

const InfoItem = ({ icon, color, title, sub }) => (
  <View style={styles.infoCard}>
    <Ionicons name={icon} size={24} color={color} />
    <Text style={styles.infoTitle}>{title}</Text>
    <Text style={styles.infoSub}>{sub}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { justifyContent: 'center', alignItems: 'center' },
  
  // Hero & Header
  heroContainer: { height: 320, width: width },
  heroImage: { width: '100%', height: '100%' },
  heroGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 160 },
  backBtn: { position: 'absolute', top: 50, left: 20, width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  
  securityBadge: { position: 'absolute', top: 50, right: 20, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', gap: 6 },
  securityText: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  
  // Body
  body: { paddingHorizontal: 24, marginTop: -60 },
  headerContent: { alignItems: 'center', marginBottom: 25 },
  iconBox: { width: 72, height: 72, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 15, backgroundColor: Colors.background, borderWidth: 4 },
  iconInner: { width: '100%', height: '100%', borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 28, fontWeight: '800', color: Colors.text, textAlign: 'center', marginBottom: 10, letterSpacing: -0.5 },
  
  statRow: { flexDirection: 'row', alignItems: 'center' },
  statBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: Colors.border },
  statText: { color: Colors.textSecondary, fontSize: 12, marginLeft: 6, fontWeight: '600' },

  // Buttons
  mainBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 18, borderRadius: 18, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  btnJoin: { backgroundColor: Colors.primary },
  btnPrivate: { backgroundColor: Colors.danger },
  btnEnter: { backgroundColor: Colors.secondary }, 
  btnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold', letterSpacing: 0.5 },

  divider: { height: 1, backgroundColor: Colors.surface, marginVertical: 30 },
  sectionTitle: { color: Colors.text, fontSize: 20, fontWeight: '700', marginBottom: 12 },
  description: { color: Colors.textSecondary, fontSize: 15, lineHeight: 24, textAlign: 'left' },

  // Info Grid
  infoGrid: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 30 },
  infoCard: { width: '31%', backgroundColor: Colors.surface, padding: 15, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  infoTitle: { color: Colors.text, fontWeight: 'bold', marginTop: 8, fontSize: 13 },
  infoSub: { color: Colors.textSecondary, fontSize: 11, marginTop: 2 },

  // --- MODAL STYLES (Fixed) ---
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)', // Background color IS HERE now
  },
  modalInnerContainer: {
    flex: 1,
    justifyContent: 'flex-end', // Pushes content to bottom
  },
  modalCard: { 
    backgroundColor: '#1E293B', 
    borderTopLeftRadius: 30, 
    borderTopRightRadius: 30, 
    padding: 24, 
    paddingBottom: Platform.OS === 'ios' ? 40 : 30, // Safe padding
    borderTopWidth: 1, 
    borderTopColor: '#334155',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 20
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { color: '#FFF', fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  modalSub: { color: '#94A3B8', fontSize: 14, marginBottom: 20, lineHeight: 20 },
  input: { 
    backgroundColor: '#0F172A', 
    color: '#FFF', 
    padding: 16, 
    borderRadius: 12, 
    fontSize: 16, 
    borderWidth: 1, 
    borderColor: '#334155', 
    marginBottom: 20 
  },
  modalBtn: { backgroundColor: Colors.primary, padding: 16, borderRadius: 14, alignItems: 'center' },
  modalBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});

export default GuildDetailScreen;