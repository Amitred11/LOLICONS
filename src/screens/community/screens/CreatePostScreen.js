import React, { useState } from 'react';
import { 
  View, Text, TextInput, StyleSheet, SafeAreaView, TouchableOpacity, 
  Image, Keyboard, StatusBar, Platform, ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCommunity } from '@context/CommunityContext'; // Import Hook
import { useAlert } from '@context/AlertContext';

const CreatePostScreen = ({ navigation, route }) => {
  const { showAlert } = useAlert();
  const { createPost } = useCommunity(); // Use Context Action
  
  const { guildName, guildId } = route.params || { guildName: 'Community', guildId: null };
  
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePost = async () => {
    if (!content.trim()) {
      showAlert({
        title: "Empty Post", 
        message: "Please write something to start a discussion.",  
        type: 'error'
      });
      return;
    }

    setIsSubmitting(true);

    const newPostData = {
      user: 'CurrentUser', 
      avatar: 'https://ui-avatars.com/api/?name=Current+User&background=random',
      content: content,
      time: 'Just now',
      guild: guildName,
      guildId: guildId, 
    };

    // Use Context Action instead of direct API call
    const success = await createPost(newPostData);

    if (success) {
      Keyboard.dismiss();
      navigation.goBack();
    } else {
      showAlert({
        title: "Error", 
        message: "Could not create post. Please try again.", 
        type: 'error'
      });
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} disabled={isSubmitting}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.postBtn, (!content.trim() || isSubmitting) && styles.postBtnDisabled]} 
          onPress={handlePost}
          disabled={!content.trim() || isSubmitting}
        >
          {isSubmitting ? (
             <ActivityIndicator size="small" color="#FFF" />
          ) : (
             <Text style={styles.postBtnText}>Post</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Input Area */}
      <View style={styles.inputContainer}>
        <View style={styles.userInfo}>
          <Image 
            source={{ uri: 'https://ui-avatars.com/api/?name=Current+User&background=random' }} 
            style={styles.avatar} 
          />
          <View>
            <Text style={styles.username}>CurrentUser</Text>
            <View style={styles.tagContainer}>
              <Text style={styles.tagText}>Posting in #{guildName}</Text>
            </View>
          </View>
        </View>

        <TextInput
          style={styles.textInput}
          placeholder="What's on your mind?"
          placeholderTextColor="#64748B"
          multiline
          autoFocus
          value={content}
          onChangeText={setContent}
          textAlignVertical="top"
          editable={!isSubmitting}
        />
      </View>

      {/* Toolbar */}
      <View style={styles.toolbar}>
        <TouchableOpacity style={styles.toolIcon}>
          <Ionicons name="image-outline" size={24} color="#6366F1" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolIcon}>
          <Ionicons name="link-outline" size={24} color="#6366F1" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolIcon}>
          <Ionicons name="happy-outline" size={24} color="#6366F1" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: Platform.OS === 'android' ? 40 : 10, paddingBottom: 15,
    borderBottomWidth: 1, borderBottomColor: '#1E293B'
  },
  cancelText: { color: '#FFF', fontSize: 16 },
  postBtn: {
    backgroundColor: '#6366F1', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20,
    minWidth: 70, alignItems: 'center', justifyContent: 'center'
  },
  postBtnDisabled: { backgroundColor: '#334155' },
  postBtnText: { color: '#FFF', fontWeight: 'bold' },
  
  inputContainer: { flex: 1, padding: 20 },
  userInfo: { flexDirection: 'row', marginBottom: 20 },
  avatar: { width: 46, height: 46, borderRadius: 23, marginRight: 12 },
  username: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  tagContainer: { 
    borderWidth: 1, borderColor: '#334155', borderRadius: 4, 
    paddingHorizontal: 6, paddingVertical: 2, marginTop: 4, alignSelf: 'flex-start'
  },
  tagText: { color: '#94A3B8', fontSize: 11 },
  
  textInput: {
    color: '#FFF', fontSize: 18, flex: 1, textAlignVertical: 'top'
  },
  
  toolbar: {
    flexDirection: 'row', padding: 15, borderTopWidth: 1, borderTopColor: '#1E293B',
    paddingBottom: Platform.OS === 'ios' ? 0 : 15
  },
  toolIcon: { marginRight: 25, padding: 5 }
});

export default CreatePostScreen;