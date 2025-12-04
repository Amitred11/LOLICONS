import React, { useState, useRef, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, 
  KeyboardAvoidingView, Platform, Alert, Modal, Image
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient'; // Ensure this is installed
import * as ImagePicker from 'expo-image-picker'; // Ensure this is installed

import { Colors } from '@config/Colors';
import ChatBubble from './components/ChatBubble';

const ChatDetailScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();
  const flatListRef = useRef();

  const { user, initialMessage } = route.params || { 
    user: { name: 'Chat', type: 'direct' },
    initialMessage: '' 
  };
  
  const [msg, setMsg] = useState('');
  
  // Call State
  const [isCalling, setIsCalling] = useState(false);
  const [callType, setCallType] = useState('voice'); // voice or video

  useEffect(() => {
    if (initialMessage) {
      setMsg(initialMessage);
    }
  }, [initialMessage]);

  const [messages, setMessages] = useState([
    { id: '1', text: 'Bro, are we still on for the raid tonight?', sender: 'them', type: 'text', time: '10:00 AM', avatar: user.avatar, senderName: user.name },
    { id: '2', text: 'Always. I got the snacks ready 🍕', sender: 'me', type: 'text', time: '10:05 AM' },
    { id: '3', text: 'Lobby opens in 10 mins!', sender: 'them', type: 'text', time: '10:07 AM', avatar: user.avatar, senderName: user.name },
  ]);

  // --- Real Functions ---

  const sendMessage = (content = msg, type = 'text') => {
    if (!content || (typeof content === 'string' && !content.trim())) return;

    const newMessage = { 
        id: Date.now().toString(), 
        text: type === 'image' ? 'Image Sent' : content, 
        sender: 'me', 
        type: type,
        imageUri: type === 'image' ? content : null,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    };
    setMessages(prev => [newMessage, ...prev]);
    if(type === 'text') setMsg('');
  };

  const handlePickImage = async () => {
    // 1. Request Permissions
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert("Permission Required", "You need to allow access to photos.");
      return;
    }

    // 2. Launch Picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      sendMessage(result.assets[0].uri, 'image');
    }
  };

  const handleCamera = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert("Permission Required", "You need to allow camera access.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      sendMessage(result.assets[0].uri, 'image');
    }
  };

  const startCall = (type) => {
    setCallType(type);
    setIsCalling(true);
  };

  const handleSettings = () => {
    navigation.navigate('ChatSettings', { user });
  };

  // --- Call Modal UI ---
  const CallOverlay = () => (
    <Modal visible={isCalling} animationType="slide" transparent={false}>
      <LinearGradient colors={['#1a2a6c', '#b21f1f', '#fdbb2d']} style={styles.callContainer}>
        <View style={[styles.callHeader, { marginTop: insets.top + 40 }]}>
            <Image source={{ uri: user.avatar }} style={styles.callAvatar} />
            <Text style={styles.callName}>{user.name}</Text>
            <Text style={styles.callStatus}>
                {callType === 'video' ? 'Video Calling...' : 'Calling...'}
            </Text>
        </View>

        <View style={[styles.callActions, { marginBottom: insets.bottom + 40 }]}>
            <TouchableOpacity style={styles.callBtn}>
                <Ionicons name="mic-off" size={28} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity 
                style={[styles.callBtn, { backgroundColor: '#FF453A', width: 70, height: 70 }]}
                onPress={() => setIsCalling(false)}
            >
                <Ionicons name="call" size={32} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.callBtn}>
                <Ionicons name="volume-high" size={28} color="#FFF" />
            </TouchableOpacity>
        </View>
      </LinearGradient>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <CallOverlay />
      <View style={styles.bgGlow} />

      {/* Header */}
      <View style={[styles.header, { marginTop: insets.top + 15 }]}>
        <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.glassBtn}>
                <Ionicons name="chevron-back" size={24} color={Colors.text} />
            </TouchableOpacity>
            
            {/* Clickable Name for Settings */}
            <TouchableOpacity onPress={handleSettings} style={styles.headerInfo}>
                <Text style={styles.headerTitle}>{user.name}</Text>
                <Text style={styles.headerSub}>
                    {user.type === 'group' ? '5 Members • Active' : 'Tap for info'}
                </Text>
            </TouchableOpacity>
        </View>

        <View style={styles.headerRight}>
            <TouchableOpacity onPress={() => startCall('voice')} style={[styles.glassBtn, styles.actionBtn]}>
                <Ionicons name="call" size={20} color={Colors.text} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => startCall('video')} style={[styles.glassBtn, styles.actionBtn, { marginLeft: 10 }]}>
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

      {/* Input */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View style={[styles.inputWrapper, { marginBottom: insets.bottom + 10 }]}>
            <View style={styles.glassInputContainer}>
                
                <TouchableOpacity onPress={handlePickImage} style={styles.attachBtn}>
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
                
                {msg.length === 0 ? (
                  <>
                     <TouchableOpacity style={styles.iconBtn} onPress={() => setMsg(msg + '🔥')}>
                        <Ionicons name="happy-outline" size={24} color={Colors.textSecondary} />
                     </TouchableOpacity>
                     <TouchableOpacity style={styles.iconBtn} onPress={handleCamera}>
                        <Ionicons name="camera-outline" size={24} color={Colors.textSecondary} />
                     </TouchableOpacity>
                  </>
                ) : (
                  <TouchableOpacity onPress={() => sendMessage(msg, 'text')} style={styles.sendBtn}>
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

  // Input
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

  // Call UI
  callContainer: { flex: 1, alignItems: 'center', justifyContent: 'space-between' },
  callHeader: { alignItems: 'center' },
  callAvatar: { width: 120, height: 120, borderRadius: 60, marginBottom: 20, borderWidth: 3, borderColor: '#FFF' },
  callName: { fontSize: 30, color: '#FFF', fontWeight: 'bold' },
  callStatus: { fontSize: 16, color: 'rgba(255,255,255,0.7)', marginTop: 5 },
  callActions: { flexDirection: 'row', alignItems: 'center', gap: 30 },
  callBtn: {
    width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center'
  }
});

export default ChatDetailScreen;