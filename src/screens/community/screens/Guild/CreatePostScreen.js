import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, StyleSheet, SafeAreaView, TouchableOpacity, 
  Image, Keyboard, StatusBar, Platform, ActivityIndicator, ScrollView,
  Modal, Pressable
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker'; // Import Image Picker
import { useCommunity } from '@context/main/CommunityContext'; 
import { useAlert } from '@context/other/AlertContext';
import { Colors } from '@config/Colors';
import { useProfile } from '@context/main/ProfileContext';

const CreatePostScreen = ({ navigation, route }) => {
  const { showAlert, showToast } = useAlert();
  const { createPost } = useCommunity();
  
  const { guildName, guildId } = route.params || { guildName: 'Community', guildId: null };
  const { profile } = useProfile(); 
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null); // Changed to store URI string
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  // Link Modal State
  const [linkModalVisible, setLinkModalVisible] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');

  // Emoji Picker State
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Common Emojis (Lightweight implementation)
  const commonEmojis = ["😀", "😂", "🥰", "🔥", "👍", "👎", "🎉", "❤️", "😭", "👀", "🤔", "🚀", "💀", "🤡"];

  useEffect(() => {
    if (Platform.OS === 'android') {
      const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
        setKeyboardVisible(true);
        setShowEmojiPicker(false); // Hide custom emoji picker if keyboard opens
      });
      const hideSubscription = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
      return () => {
        showSubscription.remove();
        hideSubscription.remove();
      };
    }
  }, []);

  // --- FUNCTION: Handle Image Picking ---
  const handlePickImage = async () => {
    // Request permission
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      showAlert({ title: "Permission Required", message: "We need access to your photos to upload images.", type: 'error' });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      setHasImage(true); // Keep your logic logic consistent
    }
  };

  // --- FUNCTION: Handle Link Insertion ---
  const handleAddLink = () => {
    if (linkUrl) {
      // Append link to content
      const linkText = linkUrl.startsWith('http') ? linkUrl : `https://${linkUrl}`;
      setContent(prev => prev + (prev.length > 0 ? ' ' : '') + linkText + ' ');
      setLinkUrl('');
      setLinkModalVisible(false);
    }
  };

  // --- FUNCTION: Handle Emoji Insertion ---
  const handleAddEmoji = (emoji) => {
    setContent(prev => prev + emoji);
  };

  const handlePost = async () => {
    if (!content.trim() && !selectedImage) return;

    setIsSubmitting(true);
    
    // In a real app, you would upload the selectedImage URI to a bucket (S3/Cloudinary) here
    // For now, we pass the local URI.
    
    const newPostData = {
      user: profile?.name || 'User', 
      avatar: profile?.avatarUrl || 'https://ui-avatars.com/api/?name=User', 
      content, 
      time: 'Just now', 
      guild: guildName, 
      guildId, 
      image: selectedImage 
    };

    const success = await createPost(newPostData);

    if (success) {
      Keyboard.dismiss();
      navigation.goBack();
      showToast( "Your message is live.",  'success' );
    } else {
      showToast( "Could not create post.", 'error' );
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      
      {/* HEADER SECTION */}
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} disabled={isSubmitting} hitSlop={20}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Post</Text>
          <TouchableOpacity 
            style={[styles.postBtn, (!content.trim() && !selectedImage) && styles.postBtnDisabled]} 
            onPress={handlePost}
            disabled={(!content.trim() && !selectedImage) || isSubmitting}
          >
            {isSubmitting ? (
               <ActivityIndicator size="small" color="#FFF" />
            ) : (
               <Text style={styles.postBtnText}>Post</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* BODY SECTION */}
      <View style={styles.contentContainer}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.userInfo}>
            <Image 
              source={{ uri: profile?.avatarUrl || 'https://ui-avatars.com/api/?name=User' }}
              style={styles.avatar} 
            />
            <View>
              <Text style={styles.username}>{profile?.name || 'User'}</Text>
              <View style={styles.tagContainer}>
                <Text style={styles.tagText}>Posting in #{guildName}</Text>
              </View>
            </View>
          </View>

          <TextInput
            style={styles.textInput}
            placeholder="What's on your mind?"
            placeholderTextColor={Colors.textSecondary}
            multiline
            autoFocus={!showEmojiPicker} // Don't autofocus if picking emojis
            value={content}
            onChangeText={setContent}
            onFocus={() => setShowEmojiPicker(false)} // Hide emoji picker when typing
            textAlignVertical="top"
            editable={!isSubmitting}
          />

          {!!selectedImage && (
            <View style={styles.imagePreview}>
              <Image 
                source={{ uri: selectedImage }} 
                style={styles.previewImg} 
                resizeMode="cover"
              />
              <TouchableOpacity 
                style={styles.removeImgBtn} 
                onPress={() => setSelectedImage(null)}
              >
                <Ionicons name="close" size={16} color="#FFF" />
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </View>

      {/* CUSTOM EMOJI BAR (Shows when emoji button is toggled) */}
      {showEmojiPicker && (
        <View style={styles.emojiContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{paddingHorizontal: 10}}>
            {commonEmojis.map((emoji, index) => (
              <TouchableOpacity key={index} onPress={() => handleAddEmoji(emoji)} style={styles.emojiBtn}>
                <Text style={{fontSize: 24}}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* TOOLBAR SECTION */}
      {/* Hide toolbar only on Android if Keyboard is up AND we aren't using the custom emoji picker */}
      <View style={[styles.toolbar, isKeyboardVisible && Platform.OS === 'android' && { display: 'none' }]}>
        
        {/* IMAGE BUTTON */}
        <TouchableOpacity 
          style={[styles.toolIcon, selectedImage && styles.toolIconActive]} 
          onPress={handlePickImage}
        >
          <Ionicons name="image-outline" size={24} color={selectedImage ? Colors.primary : "#94A3B8"} />
        </TouchableOpacity>
        
        {/* LINK BUTTON */}
        <TouchableOpacity style={styles.toolIcon} onPress={() => setLinkModalVisible(true)}>
          <Ionicons name="link-outline" size={24} color="#94A3B8" />
        </TouchableOpacity>
        
        {/* EMOJI BUTTON */}
        <TouchableOpacity 
          style={[styles.toolIcon, showEmojiPicker && styles.toolIconActive]} 
          onPress={() => {
            Keyboard.dismiss();
            setShowEmojiPicker(!showEmojiPicker);
          }}
        >
          <Ionicons name="happy-outline" size={24} color={showEmojiPicker ? Colors.primary : "#94A3B8"} />
        </TouchableOpacity>
        
        <View style={{flex: 1}} />
        <Text style={[styles.charCount, content.length > 500 && {color: 'red'}]}>
          {content.length}/500
        </Text>
      </View>
      
      {/* Safe Area Buffer */}
      <SafeAreaView style={{ backgroundColor: Colors.surface }} />

      {/* LINK INPUT MODAL */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={linkModalVisible}
        onRequestClose={() => setLinkModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setLinkModalVisible(false)}>
          <Pressable style={styles.modalContent} onPress={() => {}}>
            <Text style={styles.modalTitle}>Add Link</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="https://example.com"
              placeholderTextColor="#64748B"
              value={linkUrl}
              onChangeText={setLinkUrl}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setLinkModalVisible(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalAddBtn} onPress={handleAddLink}>
                <Text style={styles.modalAddText}>Add</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  
  // Header Styles
  headerContainer: {
    backgroundColor: Colors.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    zIndex: 10,
  },
  header: {
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    paddingHorizontal: 20, 
    paddingVertical: Platform.OS === 'ios' ? 10 : 15,
    height: Platform.OS === 'ios' ? 60 : 70, 
    borderBottomWidth: 1, 
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  headerTitle: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  cancelText: { color: Colors.textSecondary, fontSize: 16 },
  postBtn: {
    backgroundColor: Colors.primary, paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20,
    minWidth: 70, alignItems: 'center', justifyContent: 'center'
  },
  postBtnDisabled: { backgroundColor: '#334155', opacity: 0.5 },
  postBtnText: { color: '#FFF', fontWeight: 'bold' },
  
  // Body Styles
  contentContainer: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 100 },

  userInfo: { flexDirection: 'row', marginBottom: 20 },
  avatar: { width: 46, height: 46, borderRadius: 23, marginRight: 12 },
  username: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  tagContainer: { 
    borderWidth: 1, borderColor: '#334155', borderRadius: 4, 
    paddingHorizontal: 6, paddingVertical: 2, marginTop: 4, alignSelf: 'flex-start'
  },
  tagText: { color: Colors.textSecondary, fontSize: 11 },
  
  textInput: {
    color: '#FFF', fontSize: 18, minHeight: 120, textAlignVertical: 'top'
  },
  
  imagePreview: { marginTop: 20, position: 'relative', width: '100%', height: 200, borderRadius: 12, overflow: 'hidden' },
  previewImg: { width: '100%', height: '100%' },
  removeImgBtn: {
    position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.6)', 
    width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center'
  },

  // Emoji Bar
  emojiContainer: {
    height: 50,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center'
  },
  emojiBtn: {
    padding: 10,
    marginHorizontal: 2
  },

  // Toolbar Styles
  toolbar: {
    flexDirection: 'row', 
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderTopWidth: 1, 
    borderTopColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center', 
    backgroundColor: Colors.surface,
  },
  toolIcon: { marginRight: 25, padding: 5 },
  toolIconActive: { backgroundColor: 'rgba(99, 102, 241, 0.2)', borderRadius: 8 },
  charCount: { color: '#475569', fontSize: 12 },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  modalContent: {
    backgroundColor: Colors.surface,
    width: '100%',
    maxWidth: 340,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)'
  },
  modalTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center'
  },
  modalInput: {
    backgroundColor: Colors.background,
    color: '#FFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#334155'
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  modalCancelBtn: {
    flex: 1,
    padding: 12,
    marginRight: 10,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#334155'
  },
  modalAddBtn: {
    flex: 1,
    padding: 12,
    marginLeft: 10,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: Colors.primary
  },
  modalCancelText: { color: '#CBD5E1', fontWeight: '600' },
  modalAddText: { color: '#FFF', fontWeight: 'bold' }
});

export default CreatePostScreen;