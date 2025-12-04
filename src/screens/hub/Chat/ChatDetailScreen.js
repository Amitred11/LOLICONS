import React, { useState, useRef, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, 
  KeyboardAvoidingView, Platform, Alert, Modal, Image, ActivityIndicator,
  Animated, Keyboard
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient'; 
import * as ImagePicker from 'expo-image-picker'; 
import * as DocumentPicker from 'expo-document-picker'; // New import

import { Colors } from '@config/Colors';
import ChatBubble from './components/ChatBubble';
import { ChatAPI } from '@api/MockChatService'; 

// --- Custom Emoji Selector Component ---
const EmojiPicker = ({ onSelect }) => {
  const emojis = ['😀','😂','😍','🔥','👍','🎉','❤️','😭','😡','👻','👽','🤖','💩','💀','👀','🧠','👋','🙏'];
  return (
    <View style={styles.emojiContainer}>
      <FlatList 
        data={emojis}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 10 }}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => onSelect(item)} style={styles.emojiBtn}>
            <Text style={{ fontSize: 24 }}>{item}</Text>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item}
      />
    </View>
  );
};

const ChatDetailScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();
  const flatListRef = useRef();

  const { user } = route.params || { user: { id: '0', name: 'Chat', type: 'direct' }};
  
  // State
  const [msg, setMsg] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAttachments, setShowAttachments] = useState(false); // Toggle "+" menu
  const [showEmojis, setShowEmojis] = useState(false); // Toggle Emoji bar
  
  // Call State
  const [isCalling, setIsCalling] = useState(false);
  const [callType, setCallType] = useState('voice'); 

  // Animations
  const attachmentHeight = useRef(new Animated.Value(0)).current;

  // --- 1. Load Data ---
  useEffect(() => {
    loadChatHistory();
    // Keyboard listener to close menus when typing
    const keyboardSub = Keyboard.addListener('keyboardDidShow', () => {
        setShowAttachments(false);
        setShowEmojis(false);
    });
    return () => keyboardSub.remove();
  }, []);

  // Animation Effect for Attachment Menu
  useEffect(() => {
    Animated.timing(attachmentHeight, {
        toValue: showAttachments ? 120 : 0,
        duration: 250,
        useNativeDriver: false
    }).start();
  }, [showAttachments]);

  const loadChatHistory = async () => {
    try {
      const response = await ChatAPI.fetchHistory(user.id);
      if (response.success) setMessages(response.data);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- 2. Message Handlers ---

  const handleSendMessage = async (content = msg, type = 'text', fileName = null) => {
    if (!content) return;

    // A. Optimistic Update
    const tempId = Date.now().toString();
    const tempMsg = { 
        id: tempId, 
        text: type === 'text' ? content : (fileName || 'Attachment'), 
        sender: 'me', 
        type: type,
        imageUri: (type === 'image' || type === 'video') ? content : null,
        fileUri: type === 'document' ? content : null,
        time: 'Just now',
        pending: true
    };

    setMessages(prev => [tempMsg, ...prev]);
    if(type === 'text') setMsg('');
    setShowAttachments(false);
    setShowEmojis(false);

    try {
      // B. Upload Media/Files
      let finalContent = content;
      if (type !== 'text') {
        const uploadRes = await ChatAPI.uploadMedia(content);
        if(uploadRes.success) finalContent = uploadRes.url;
        else throw new Error("Upload failed");
      }

      // C. Send to Backend
      const response = await ChatAPI.sendMessage(user.id, finalContent, type);
      
      if (response.success) {
        setMessages(prev => prev.map(m => m.id === tempId ? response.data : m));
      }
    } catch (error) {
      Alert.alert("Error", "Message failed to send");
      setMessages(prev => prev.filter(m => m.id !== tempId));
    }
  };

  // --- 3. Attachment Handlers ---

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled) handleSendMessage(result.assets[0].uri, 'image');
  };

  const handleCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) return Alert.alert("Permission", "Camera access needed.");
    
    const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    if (!result.canceled) handleSendMessage(result.assets[0].uri, 'image');
  };

  const handleDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*', // Allow all file types
        copyToCacheDirectory: true
      });

      if (result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        // Send URI as content, and pass filename for display
        handleSendMessage(file.uri, 'document', file.name); 
      }
    } catch (err) {
      console.log("Doc Picker Error", err);
    }
  };

  // --- 4. UI Actions ---

  const toggleAttachments = () => {
      Keyboard.dismiss();
      setShowEmojis(false);
      setShowAttachments(!showAttachments);
  };

  const toggleEmojis = () => {
      Keyboard.dismiss();
      setShowAttachments(false);
      setShowEmojis(!showEmojis);
  };

  const addEmoji = (emoji) => {
      setMsg(prev => prev + emoji);
  };

  // Call Modal
  const CallOverlay = () => (
    <Modal visible={isCalling} animationType="slide" transparent={false}>
      <LinearGradient colors={['#1a2a6c', '#b21f1f', '#fdbb2d']} style={styles.callContainer}>
        <View style={[styles.callHeader, { marginTop: insets.top + 40 }]}>
            <Image source={{ uri: user.avatar }} style={styles.callAvatar} />
            <Text style={styles.callName}>{user.name}</Text>
            <Text style={styles.callStatus}>{callType === 'video' ? 'Video Calling...' : 'Calling...'}</Text>
        </View>
        <View style={[styles.callActions, { marginBottom: insets.bottom + 40 }]}>
            <TouchableOpacity 
                style={[styles.callBtn, { backgroundColor: '#FF453A', width: 70, height: 70 }]}
                onPress={() => setIsCalling(false)}
            >
                <Ionicons name="call" size={32} color="#FFF" />
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
            
            <TouchableOpacity onPress={() => navigation.navigate('ChatSettings', { user })} style={styles.headerInfo}>
                <Text style={styles.headerTitle}>{user.name}</Text>
                <Text style={styles.headerSub}>{isLoading ? 'Connecting...' : 'Online'}</Text>
            </TouchableOpacity>
        </View>

        <View style={styles.headerRight}>
            <TouchableOpacity onPress={() => { setCallType('voice'); setIsCalling(true); }} style={[styles.glassBtn, styles.actionBtn]}>
                <Ionicons name="call" size={20} color={Colors.text} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setCallType('video'); setIsCalling(true); }} style={[styles.glassBtn, styles.actionBtn, { marginLeft: 10 }]}>
                <Ionicons name="videocam" size={20} color={Colors.secondary} />
            </TouchableOpacity>
        </View>
      </View>

      {/* Messages */}
      {isLoading ? (
          <View style={{flex:1, justifyContent:'center'}}><ActivityIndicator color={Colors.primary} /></View>
      ) : (
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
      )}

      {/* Footer Area: Input + Menus */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View style={{ marginBottom: insets.bottom }}>
            
            {/* Input Bar */}
            <View style={styles.inputWrapper}>
                <View style={styles.glassInputContainer}>
                    
                    {/* Attachment Toggle */}
                    <TouchableOpacity onPress={toggleAttachments} style={styles.attachBtn}>
                        <Animated.View style={{ transform: [{ rotate: showAttachments ? '45deg' : '0deg' }] }}>
                             <Ionicons name="add" size={28} color={Colors.text} />
                        </Animated.View>
                    </TouchableOpacity>

                    <TextInput 
                        style={styles.input}
                        placeholder="Message..."
                        placeholderTextColor={Colors.textSecondary}
                        value={msg}
                        onChangeText={setMsg}
                        multiline
                        onFocus={() => { setShowAttachments(false); setShowEmojis(false); }}
                    />
                    
                    {/* Right Side Icons */}
                    {msg.length === 0 ? (
                        <View style={{ flexDirection: 'row' }}>
                            <TouchableOpacity onPress={handleCamera} style={styles.iconBtn}>
                                <Ionicons name="camera-outline" size={24} color={Colors.textSecondary} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={toggleEmojis} style={styles.iconBtn}>
                                <Ionicons name={showEmojis ? "keypad-outline" : "happy-outline"} size={24} color={Colors.textSecondary} />
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity onPress={() => handleSendMessage(msg, 'text')} style={styles.sendBtn}>
                            <Ionicons name="arrow-up" size={20} color="#000" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
            
            {/* Emoji Selector (Slide up) */}
            {showEmojis && <EmojiPicker onSelect={addEmoji} />}

            {/* Attachment Menu (Animated Slide up) */}
            <Animated.View style={[styles.attachmentMenu, { height: attachmentHeight }]}>
                <View style={styles.attachmentGrid}>
                    <AttachmentItem icon="image" color="#FF2D55" label="Gallery" onPress={handlePickImage} />
                    <AttachmentItem icon="document-text" color="#5856D6" label="File" onPress={handleDocument} />
                    <AttachmentItem icon="location" color="#34C759" label="Location" onPress={() => Alert.alert("Loc", "Send location feature")} />
                    <AttachmentItem icon="person" color="#007AFF" label="Contact" onPress={() => Alert.alert("Contact", "Send contact feature")} />
                </View>
            </Animated.View>

        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

// Sub-component for Attachment Grid Item
const AttachmentItem = ({ icon, color, label, onPress }) => (
    <TouchableOpacity style={styles.attachItem} onPress={onPress}>
        <View style={[styles.attachIconBg, { backgroundColor: color }]}>
            <Ionicons name={icon} size={24} color="#FFF" />
        </View>
        <Text style={styles.attachLabel}>{label}</Text>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  bgGlow: { position: 'absolute', top: -100, left: -100, width: 300, height: 300, backgroundColor: Colors.primary, opacity: 0.1, borderRadius: 150, blurRadius: 100 },
  
  // Header
  header: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginBottom: 10, justifyContent: 'space-between', zIndex: 10 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  headerInfo: { marginLeft: 15 },
  headerTitle: { fontWeight: '700', color: Colors.text, fontSize: 16 },
  headerSub: { color: Colors.secondary, fontSize: 11, fontWeight: '500', marginTop: 2 },
  glassBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.08)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  actionBtn: { backgroundColor: 'rgba(255,255,255,0.05)' },

  // Input
  inputWrapper: { paddingHorizontal: 15, paddingVertical: 10 },
  glassInputContainer: { 
      flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, 
      borderRadius: 25, padding: 5, paddingHorizontal: 10,
      borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)'
  },
  attachBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center', marginRight: 5 },
  input: { flex: 1, color: Colors.text, maxHeight: 100, fontSize: 16, paddingVertical: 8 },
  iconBtn: { padding: 8 },
  sendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center', marginLeft: 5 },

  // Attachment Menu
  attachmentMenu: { overflow: 'hidden', backgroundColor: 'rgba(20,20,20,0.95)' },
  attachmentGrid: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', height: 120, paddingHorizontal: 20 },
  attachItem: { alignItems: 'center' },
  attachIconBg: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  attachLabel: { color: Colors.textSecondary, fontSize: 12 },

  // Emoji Menu
  emojiContainer: { height: 60, backgroundColor: '#111', justifyContent: 'center' },
  emojiBtn: { padding: 10 },

  // Call UI
  callContainer: { flex: 1, alignItems: 'center', justifyContent: 'space-between' },
  callHeader: { alignItems: 'center' },
  callAvatar: { width: 120, height: 120, borderRadius: 60, marginBottom: 20, borderWidth: 3, borderColor: '#FFF' },
  callName: { fontSize: 30, color: '#FFF', fontWeight: 'bold' },
  callStatus: { fontSize: 16, color: 'rgba(255,255,255,0.7)', marginTop: 5 },
  callActions: { flexDirection: 'row', alignItems: 'center', gap: 30 },
  callBtn: { width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' }
});

export default ChatDetailScreen;