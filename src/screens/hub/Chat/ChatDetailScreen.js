import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, KeyboardAvoidingView, Platform, ImageBackground } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Colors } from '@config/Colors';
import ChatBubble from './components/ChatBubble'; // Ensure path is correct

const ChatDetailScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = route.params || { user: { name: 'Chat', type: 'direct' } };
  const [msg, setMsg] = useState('');
  
  const [messages, setMessages] = useState([
    { id: '1', text: 'Bro, are we still on for the raid tonight?', sender: 'them', time: '10:00 AM', avatar: user.avatar, senderName: user.name },
    { id: '2', text: 'Always. I got the snacks ready 🍕', sender: 'me', time: '10:05 AM' },
    { id: '3', text: 'Lobby opens in 10 mins!', sender: 'them', time: '10:07 AM', avatar: user.avatar, senderName: user.name },
  ]);

  const sendMessage = () => {
    if(!msg.trim()) return;
    setMessages([{ 
        id: Date.now().toString(), 
        text: msg, 
        sender: 'me', 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    }, ...messages]);
    setMsg('');
  };

  return (
    <View style={styles.container}>
      {/* Background Texture - optional, simulates depth */}
      <View style={styles.bgGlow} />

      {/* Floating Header */}
      <View style={[styles.header, { marginTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.glassBtn}>
            <Ionicons name="chevron-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        
        <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>{user.name}</Text>
            {user.type === 'group' && <Text style={styles.headerSub}>The Squad</Text>}
        </View>

        <TouchableOpacity style={[styles.glassBtn, { backgroundColor: 'rgba(5, 244, 183, 0.1)' }]}>
             <Ionicons name="videocam" size={20} color={Colors.secondary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={messages}
        inverted
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100, paddingTop: 20 }}
        renderItem={({ item }) => (
          <ChatBubble 
            message={item} 
            isMe={item.sender === 'me'} 
            showSender={user.type === 'group'}
          />
        )}
      />

      {/* Floating Input Capsule */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={10}>
        <View style={[styles.inputWrapper, { marginBottom: insets.bottom + 10 }]}>
            <View style={styles.glassInputContainer}>
                <TextInput 
                    style={styles.input}
                    placeholder="Drop a thought..."
                    placeholderTextColor={Colors.textSecondary}
                    value={msg}
                    onChangeText={setMsg}
                    multiline
                />
                <TouchableOpacity onPress={sendMessage} style={[styles.sendBtn, msg.length > 0 && styles.sendBtnActive]}>
                    <Ionicons name={msg.length > 0 ? "arrow-up" : "mic"} size={20} color="#fff" />
                </TouchableOpacity>
            </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  bgGlow: {
    position: 'absolute', top: -100, left: -100, width: 300, height: 300,
    backgroundColor: Colors.primary, opacity: 0.15, borderRadius: 150, blurRadius: 100
  },
  
  // Header
  header: { 
    flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginBottom: 10,
    justifyContent: 'space-between', zIndex: 10
  },
  headerInfo: { alignItems: 'center' },
  headerTitle: { fontFamily: 'Poppins_700Bold', color: Colors.text, fontSize: 18 },
  headerSub: { fontFamily: 'Poppins_500Medium', color: Colors.secondary, fontSize: 10, letterSpacing: 1 },
  
  glassBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)'
  },

  // Input Area
  inputWrapper: { paddingHorizontal: 15 },
  glassInputContainer: { 
    flexDirection: 'row', alignItems: 'center', 
    backgroundColor: '#1E1E1E', 
    borderRadius: 35, padding: 6,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20,
    elevation: 10
  },
  input: { 
    flex: 1, color: Colors.text, maxHeight: 100, 
    fontFamily: 'Poppins_400Regular', paddingHorizontal: 20, paddingVertical: 12, fontSize: 15
  },
  sendBtn: { 
    width: 42, height: 42, borderRadius: 21, 
    backgroundColor: 'rgba(255,255,255,0.1)', 
    justifyContent: 'center', alignItems: 'center' 
  },
  sendBtnActive: { backgroundColor: Colors.primary }
});

export default ChatDetailScreen;