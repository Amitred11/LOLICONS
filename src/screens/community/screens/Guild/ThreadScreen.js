import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, 
  Image, TextInput, KeyboardAvoidingView, Platform, Keyboard, StatusBar, 
  ActivityIndicator, Share, Clipboard, Modal 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PostCard from '../../components/PostCard'; 
import { Colors } from '@config/Colors';
import { useCommunity } from '@context/main/CommunityContext'; 
import { useAlert } from '@context/other/AlertContext';

const ThreadScreen = ({ route, navigation }) => {
  const { post } = route.params; 
  const { showAlert } = useAlert();
  
  const { fetchReplies, submitReply, currentReplies, isLoadingReplies } = useCommunity();
  
  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const inputRef = useRef(null);

  // Options Modal State
  const [optionsModalVisible, setOptionsModalVisible] = useState(false);

  useEffect(() => {
    if (post?.id) {
      fetchReplies(post.id);
    }
  }, [post?.id]);

  const handleSendReply = async () => {
    if (!replyText.trim()) return;

    setIsSending(true);
    const newReplyData = {
      postId: post.id,
      user: 'CurrentUser',
      avatar: 'https://ui-avatars.com/api/?name=Current+User&background=random',
      content: replyText,
      time: 'Just now'
    };

    const success = await submitReply(newReplyData);
    if (success) {
      setReplyText('');
      Keyboard.dismiss();
    } else {
      showAlert({ title: "Error", message: "Failed to post reply.", type: 'error' });
    }
    setIsSending(false);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this post from ${post.user}: "${post.content}"`
      });
    } catch (error) {
      console.log(error);
    }
  };

  // When "Reply" is clicked on the parent card, focus the input
  const handleFocusReply = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleOptionAction = (action) => {
    setOptionsModalVisible(false);
    setTimeout(() => {
      if (action === 'report') {
        showAlert({ title: "Reported", message: "Post reported.", type: 'success' });
      } else if (action === 'block') {
        showAlert({ title: "Blocked", message: `Blocked ${post.user}.`, type: 'info' });
      } else if (action === 'copy') {
        Clipboard.setString(post.content || "");
        showAlert({ title: "Copied", message: "Text copied.", type: 'success' });
      } else if (action === 'share') {
        handleShare();
      }
    }, 300);
  };

  const renderReply = ({ item }) => (
    <View style={styles.replyContainer}>
      <Image source={{ uri: item.avatar }} style={styles.replyAvatar} />
      <View style={styles.replyContentBox}>
        <View style={styles.replyHeader}>
          <Text style={styles.replyUser}>{item.user}</Text>
          <Text style={styles.replyTime}>{item.time}</Text>
        </View>
        <Text style={styles.replyText}>{item.content}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thread</Text>
        <View style={{ width: 40 }} /> 
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <FlatList
          data={currentReplies}
          keyExtractor={item => item.id}
          renderItem={renderReply}
          ListHeaderComponent={
            <View style={styles.parentPostContainer}>
              <PostCard 
                item={post} 
                onPress={() => {}} // Already on thread, do nothing on body press
                onLike={() => {}} 
                onUserPress={() => {}}
                onReply={handleFocusReply} // Focus input
                onShare={handleShare}      // Native Share
                onOptions={() => setOptionsModalVisible(true)} // Open local modal
              />
              <View style={styles.divider}>
                <Text style={styles.dividerText}>Replies</Text>
              </View>
              {isLoadingReplies && (
                <ActivityIndicator size="small" color={Colors.primary} style={{ marginTop: 20 }} />
              )}
            </View>
          }
          ListEmptyComponent={!isLoadingReplies && (
            <Text style={styles.emptyText}>No replies yet. Be the first!</Text>
          )}
          contentContainerStyle={styles.listContent}
        />

        {/* Input Bar */}
        <View style={styles.inputContainer}>
          <Image source={{ uri: 'https://ui-avatars.com/api/?name=Current+User&background=random' }} style={styles.inputAvatar} />
          <View style={styles.inputWrapper}>
            <TextInput
              ref={inputRef}
              style={styles.textInput}
              placeholder="Post a reply..."
              placeholderTextColor="#94A3B8"
              value={replyText}
              onChangeText={setReplyText}
              multiline
              editable={!isSending}
            />
            <TouchableOpacity 
              onPress={handleSendReply} 
              disabled={!replyText.trim() || isSending}
              style={[styles.sendBtn, (!replyText.trim() || isSending) && styles.sendBtnDisabled]}
            >
              {isSending ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Ionicons name="send" size={18} color="#FFF" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* OPTIONS MODAL (Duplicate for Thread View) */}
      <Modal
        visible={optionsModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setOptionsModalVisible(false)}
      >
        <TouchableOpacity style={styles.optionsOverlay} activeOpacity={1} onPress={() => setOptionsModalVisible(false)}>
          <View style={styles.optionsContainer}>
            <View style={styles.optionsHandle} />
            <Text style={styles.optionsTitle}>Thread Options</Text>
            
            <TouchableOpacity style={styles.optionRow} onPress={() => handleOptionAction('share')}>
              <Ionicons name="share-outline" size={22} color="#FFF" />
              <Text style={styles.optionText}>Share Post</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionRow} onPress={() => handleOptionAction('copy')}>
              <Ionicons name="copy-outline" size={22} color="#FFF" />
              <Text style={styles.optionText}>Copy Text</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionRow} onPress={() => handleOptionAction('block')}>
              <Ionicons name="person-remove-outline" size={22} color="#FFF" />
              <Text style={styles.optionText}>Block User</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.optionRow} onPress={() => handleOptionAction('report')}>
              <Ionicons name="flag-outline" size={22} color="#EF4444" />
              <Text style={[styles.optionText, { color: '#EF4444' }]}>Report Post</Text>
            </TouchableOpacity>

            <View style={{ height: 1, backgroundColor: '#334155', marginVertical: 10 }} />

            <TouchableOpacity style={styles.optionRow} onPress={() => setOptionsModalVisible(false)}>
              <Ionicons name="close-circle-outline" size={22} color="#94A3B8" />
              <Text style={[styles.optionText, { color: '#94A3B8' }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 15, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 10,
  },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  backBtn: { padding: 8 },
  listContent: { paddingBottom: 20 },
  parentPostContainer: { marginBottom: 10 },
  divider: { paddingHorizontal: 20, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)', marginBottom: 10 },
  dividerText: { color: Colors.textSecondary, fontSize: 13, fontWeight: '700', textTransform: 'uppercase' },
  emptyText: { color: Colors.textSecondary, textAlign: 'center', marginTop: 20, fontStyle: 'italic' },
  replyContainer: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 20 },
  replyAvatar: { width: 36, height: 36, borderRadius: 18, marginRight: 12 },
  replyContentBox: { flex: 1, backgroundColor: Colors.surface, borderRadius: 12, padding: 12, borderTopLeftRadius: 2 },
  replyHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  replyUser: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  replyTime: { color: Colors.textSecondary, fontSize: 12 },
  replyText: { color: '#E2E8F0', fontSize: 14, lineHeight: 20 },
  inputContainer: { flexDirection: 'row', alignItems: 'flex-end', padding: 15, backgroundColor: Colors.surface, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' },
  inputAvatar: { width: 36, height: 36, borderRadius: 18, marginRight: 10, marginBottom: 4 },
  inputWrapper: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.background, borderRadius: 24, paddingHorizontal: 15, minHeight: 44, paddingVertical: 5 },
  textInput: { flex: 1, color: '#FFF', maxHeight: 100, fontSize: 15, marginRight: 10 },
  sendBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { backgroundColor: '#334155' },
  
  // Options Modal Styles (Duplicated from DiscussionScreen for self-containment)
  optionsOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  optionsContainer: { backgroundColor: Colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 40 },
  optionsHandle: { width: 40, height: 4, backgroundColor: '#334155', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  optionsTitle: { color: Colors.textSecondary, fontSize: 13, fontWeight: 'bold', marginBottom: 15, textTransform: 'uppercase', letterSpacing: 1 },
  optionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15 },
  optionText: { color: '#FFF', fontSize: 16, marginLeft: 15, fontWeight: '500' }
});

export default ThreadScreen;