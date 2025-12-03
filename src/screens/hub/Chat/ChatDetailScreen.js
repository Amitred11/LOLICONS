import React, { useState, useRef } from 'react';
import { 
  View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, 
  KeyboardAvoidingView, Platform, Alert, Image 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Colors } from '@config/Colors';
import ChatBubble from './components/ChatBubble';

const ChatDetailScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();
  const flatListRef = useRef();

  const { user } = route.params || { user: { name: 'Chat', type: 'direct' } };
  const [msg, setMsg] = useState('');
  
  // Enhanced Mock Data
  const [messages, setMessages] = useState([
    { id: '1', text: 'Bro, are we still on for the raid tonight?', sender: 'them', type: 'text', time: '10:00 AM', avatar: user.avatar, senderName: user.name },
    { id: '2', text: 'Always. I got the snacks ready 🍕', sender: 'me', type: 'text', time: '10:05 AM' },
    { id: '3', text: 'Lobby opens in 10 mins!', sender: 'them', type: 'text', time: '10:07 AM', avatar: user.avatar, senderName: user.name },
  ]);

  // Actions
  const sendMessage = () => {
    if(!msg.trim()) return;
    const newMessage = { 
        id: Date.now().toString(), 
        text: msg, 
        sender: 'me', 
        type: 'text',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    };
    setMessages(prev => [newMessage, ...prev]);
    setMsg('');
  };

  const sendAttachment = () => {
    Alert.alert("Send Media", "Choose an option", [
      { text: "Camera", onPress: () => addImageMessage() },
      { text: "Gallery", onPress: () => addImageMessage() },
      { text: "Cancel", style: "cancel" }
    ]);
  };

  const addImageMessage = () => {
    const newMessage = { 
      id: Date.now().toString(), 
      text: 'Image Sent', 
      sender: 'me', 
      type: 'image', // New Type
      imageUri: 'https://images.unsplash.com/photo-1593642532973-d31b6557fa68?w=500', // Mock Image
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    };
    setMessages(prev => [newMessage, ...prev]);
  };

  const handleCall = (type) => {
    Alert.alert(type === 'video' ? "Video Call" : "Voice Call", `Calling ${user.name}...`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.bgGlow} />

      {/* Header with Calls and Spacing */}
      <View style={[styles.header, { marginTop: insets.top + 15 }]}>
        <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.glassBtn}>
                <Ionicons name="chevron-back" size={24} color={Colors.text} />
            </TouchableOpacity>
            
            <View style={styles.headerInfo}>
                <Text style={styles.headerTitle}>{user.name}</Text>
                <Text style={styles.headerSub}>
                    {user.type === 'group' ? '5 Members • Active' : 'Online'}
                </Text>
            </View>
        </View>

        <View style={styles.headerRight}>
            <TouchableOpacity onPress={() => handleCall('voice')} style={[styles.glassBtn, styles.actionBtn]}>
                <Ionicons name="call" size={20} color={Colors.text} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleCall('video')} style={[styles.glassBtn, styles.actionBtn, { marginLeft: 10 }]}>
                <Ionicons name="videocam" size={20} color={Colors.secondary} />
            </TouchableOpacity>
        </View>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        inverted
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20, paddingTop: 20 }}
        renderItem={({ item }) => (
          <ChatBubble 
            message={item} 
            isMe={item.sender === 'me'} 
            showSender={user.type === 'group'}
          />
        )}
      />

      {/* Advanced Input Bar */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View style={[styles.inputWrapper, { marginBottom: insets.bottom + 10 }]}>
            <View style={styles.glassInputContainer}>
                
                {/* Attachment Button */}
                <TouchableOpacity onPress={sendAttachment} style={styles.attachBtn}>
                    <Ionicons name="add" size={24} color={Colors.text} />
                </TouchableOpacity>

                <TextInput 
                    style={styles.input}
                    placeholder="Message..."
                    placeholderTextColor={Colors.textSecondary}
                    value={msg}
                    onChangeText={setMsg}
                    multiline
                />
                
                {/* Right Side Icons */}
                {msg.length === 0 ? (
                  <>
                     <TouchableOpacity style={styles.iconBtn} onPress={() => Alert.alert("Emoji", "Emoji picker opening...")}>
                        <Ionicons name="happy-outline" size={24} color={Colors.textSecondary} />
                     </TouchableOpacity>
                     <TouchableOpacity style={styles.iconBtn} onPress={() => Alert.alert("Camera", "Opening camera...")}>
                        <Ionicons name="camera-outline" size={24} color={Colors.textSecondary} />
                     </TouchableOpacity>
                  </>
                ) : (
                  <TouchableOpacity onPress={sendMessage} style={styles.sendBtn}>
                      <Ionicons name="arrow-up" size={20} color="#000" />
                  </TouchableOpacity>
                )}
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
    backgroundColor: Colors.primary, opacity: 0.1, borderRadius: 150, blurRadius: 100
  },
  
  // Header
  header: { 
    flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginBottom: 10,
    justifyContent: 'space-between', zIndex: 10
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  headerInfo: { marginLeft: 15 },
  headerTitle: { fontWeight: '700', color: Colors.text, fontSize: 16 },
  headerSub: { color: Colors.secondary, fontSize: 11, fontWeight: '500', marginTop: 2 },
  
  glassBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)'
  },
  actionBtn: { backgroundColor: 'rgba(255,255,255,0.05)' },

  // Input Area
  inputWrapper: { paddingHorizontal: 15, paddingTop: 10 },
  glassInputContainer: { 
    flexDirection: 'row', alignItems: 'center', 
    backgroundColor: Colors.surface, 
    borderRadius: 30, padding: 8,
    borderWidth: 1, borderColor: Colors.border || 'rgba(255,255,255,0.1)',
  },
  attachBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center', alignItems: 'center',
    marginRight: 8
  },
  input: { 
    flex: 1, color: Colors.text, maxHeight: 100, 
    fontSize: 15, paddingVertical: 10
  },
  iconBtn: { padding: 8 },
  sendBtn: { 
    width: 40, height: 40, borderRadius: 20, 
    backgroundColor: Colors.secondary, 
    justifyContent: 'center', alignItems: 'center',
    marginLeft: 5
  },
});

export default ChatDetailScreen;