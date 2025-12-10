import React, { useState, useRef, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, 
  KeyboardAvoidingView, Platform, Alert, Animated, Keyboard, ActivityIndicator
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker'; 
import * as DocumentPicker from 'expo-document-picker'; 

import { Colors } from '@config/Colors';
import ChatBubble from './components/ChatBubble';
import CallOverlay from './components/CallOverlay'; // <--- Import here
import { useChat } from '@context/hub/ChatContext';
import { useAlert } from '@context/other/AlertContext';

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
  const { showToast } = useAlert();

  const { user } = route.params || { user: { id: '0', name: 'Chat', type: 'direct' }};

  const { loadMessages, currentMessages, isLoadingMessages, sendMessage } = useChat();

  const [msg, setMsg] = useState('');
  const [showAttachments, setShowAttachments] = useState(false); 
  const [showEmojis, setShowEmojis] = useState(false); 
  
  // Call State
  const [isCalling, setIsCalling] = useState(false);
  const [callType, setCallType] = useState('voice'); 

  const attachmentHeight = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadMessages(user.id);
    const keyboardSub = Keyboard.addListener('keyboardDidShow', () => {
        setShowAttachments(false);
        setShowEmojis(false);
    });
    return () => keyboardSub.remove();
  }, [user.id]);

  useEffect(() => {
    Animated.timing(attachmentHeight, {
        toValue: showAttachments ? 120 : 0,
        duration: 250,
        useNativeDriver: false
    }).start();
  }, [showAttachments]);

  const handleSend = async (content = msg, type = 'text', fileName = null) => {
    if (!content) return;
    if(type === 'text') setMsg('');
    setShowAttachments(false);
    setShowEmojis(false);
    try {
      await sendMessage(user.id, content, type, fileName);
    } catch (error) {
      showToast("Message failed to send", 'error');
    }
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled) handleSend(result.assets[0].uri, 'image');
  };

  const handleCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) return Alert.alert("Permission", "Camera access needed.");
    
    const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    if (!result.canceled) handleSend(result.assets[0].uri, 'image');
  };

  const handleDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true
      });
      if (result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        handleSend(file.uri, 'document', file.name); 
      }
    } catch (err) {
      console.log("Doc Picker Error", err);
    }
  };

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

  const startCall = (type) => {
      setCallType(type);
      setIsCalling(true);
  };

  const messages = currentMessages(user.id);
  
  const renderContent = () => {
    if (isLoadingMessages) {
        return (
            <View style={styles.emptyListContainer}>
                <ActivityIndicator color={Colors.primary} size="large" />
            </View>
        );
    }

    if (messages.length === 0) {
        return (
            <View style={styles.emptyListContainer}>
                <Ionicons name="chatbubbles-outline" size={60} color={Colors.textSecondary} style={{ opacity: 0.5 }} />
                <Text style={styles.emptyText}>No messages yet.</Text>
                <Text style={styles.emptySubText}>
                    {user.type === 'group' ? `Be the first to chat in ${user.name}!` : 'Start the conversation!'}
                </Text>
            </View>
        );
    }

    return (
        <FlatList
            ref={flatListRef}
            data={messages}
            inverted
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContentContainer}
            renderItem={({ item }) => (
                <ChatBubble 
                    message={item} 
                    isMe={item.sender === 'me'} 
                    showSender={user.type === 'group'}
                />
            )}
        />
    );
  };

  return (
    <View style={styles.container}>
      {/* Updated Call Overlay Component */}
      <CallOverlay 
        visible={isCalling} 
        user={user} 
        type={callType} 
        onClose={() => setIsCalling(false)} 
      />

      <View style={styles.bgGlow} />

      <View style={[styles.header, { marginTop: insets.top + 15 }]}>
        <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.glassBtn}>
                <Ionicons name="chevron-back" size={24} color={Colors.text} />
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => navigation.navigate('ChatSettings', { user })} style={styles.headerInfo}>
                <Text style={styles.headerTitle}>{user.name}</Text>
                <Text style={styles.headerSub}>{isLoadingMessages ? 'Connecting...' : 'Online'}</Text>
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

      <View style={{ flex: 1 }}>
          {renderContent()}
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View style={{ marginBottom: insets.bottom }}>
            <View style={styles.inputWrapper}>
                <View style={styles.glassInputContainer}>
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
                        <TouchableOpacity onPress={() => handleSend(msg, 'text')} style={styles.sendBtn}>
                            <Ionicons name="arrow-up" size={20} color="#000" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
            {showEmojis && <EmojiPicker onSelect={addEmoji} />}
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
  header: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginBottom: 10, justifyContent: 'space-between', zIndex: 10 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  headerInfo: { marginLeft: 15 },
  headerTitle: { fontWeight: '700', color: Colors.text, fontSize: 16 },
  headerSub: { color: Colors.secondary, fontSize: 11, fontWeight: '500', marginTop: 2 },
  glassBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.08)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  actionBtn: { backgroundColor: 'rgba(255,255,255,0.05)' },
  listContentContainer: { flexGrow: 1, justifyContent: 'flex-end', paddingHorizontal: 20, paddingBottom: 20, paddingTop: 20 },
  emptyListContainer: {
    flex: 1, 
    justifyContent: 'center',
    alignItems: 'center'
  },
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
  attachmentMenu: { overflow: 'hidden', backgroundColor: 'rgba(20,20,20,0.95)' },
  attachmentGrid: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', height: 120, paddingHorizontal: 20 },
  attachItem: { alignItems: 'center' },
  attachIconBg: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  attachLabel: { color: Colors.textSecondary, fontSize: 12 },
  emojiContainer: { height: 60, backgroundColor: '#111', justifyContent: 'center' },
  emojiBtn: { padding: 10 },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginTop: 20,
  },
  emptySubText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 8,
    opacity: 0.7,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});

export default ChatDetailScreen;