import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, 
  Image, TextInput, KeyboardAvoidingView, Platform, Keyboard, StatusBar, 
  ActivityIndicator, Share, Clipboard, LayoutAnimation, UIManager, 
  Alert, Vibration 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import PostCard from '../../components/PostCard'; 
import OptionsModal from '../../components/OptionsModal'; // IMPORT HERE
import { Colors } from '@config/Colors';
import { useCommunity } from '@context/main/CommunityContext'; 
import { useAlert } from '@context/other/AlertContext';

const CURRENT_USER_NAME = 'CurrentUser'; 

// Mock Data Generator (Keep existing)
const getMockSubReplies = (index) => {
  if (index % 2 !== 0) return []; 
  return [
    { id: `mock_${index}_1`, user: 'DesignLead', content: 'Totally agree!', time: '10m', isEdited: false },
    { id: `mock_${index}_2`, user: 'JuniorDev', content: 'Why though?', time: '5m', isEdited: true },
  ];
};

const ThreadScreen = ({ route, navigation }) => {
  const { post } = route.params; 
  const { showAlert, showToast } = useAlert();
  const { fetchReplies, submitReply, currentReplies, isLoadingReplies, togglePostLike } = useCommunity();
  
  // --- STATE ---
  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);
  
  // Interaction State
  const [replyingTo, setReplyingTo] = useState(null); 
  const [editingComment, setEditingComment] = useState(null); 
  
  // Menu State
  const [selectedItem, setSelectedItem] = useState(null); // Can be Post or Comment
  const [isPostContext, setIsPostContext] = useState(false); // Track if menu is for Main Post
  const [contextMenuVisible, setContextMenuVisible] = useState(false);

  // Data State
  const [likedReplies, setLikedReplies] = useState({});
  const [expandedThreads, setExpandedThreads] = useState({}); 
  
  // Local Stores
  const [localSubReplies, setLocalSubReplies] = useState({}); 
  const [editedStatus, setEditedStatus] = useState({}); 
  const [mockDataStore, setMockDataStore] = useState({}); 

  const flatListRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (post?.id) fetchReplies(post.id);
  }, [post?.id]);

  useEffect(() => {
    if (currentReplies && currentReplies.length > 0) {
      setMockDataStore(prev => {
        const newStore = { ...prev };
        let hasChanges = false;
        currentReplies.forEach((reply, index) => {
          if (!newStore[reply.id]) {
            newStore[reply.id] = getMockSubReplies(index);
            hasChanges = true;
          }
        });
        return hasChanges ? newStore : prev;
      });
    }
  }, [currentReplies]);

  // --- ACTIONS ---

  const initiateReply = (item, parentId = null) => {
    const targetParent = parentId || item.id;
    
    setReplyingTo({ 
      id: item.id, 
      user: item.user, 
      parentId: targetParent 
    });

    setEditingComment(null); 

    if (parentId && item.id !== parentId) {
      setReplyText(`@${item.user} `); 
    } else {
      setReplyText('');
    }
    
    inputRef.current?.focus();
    // Modal closes automatically via component logic
  };

  const resetInput = () => {
    setReplyingTo(null);
    setEditingComment(null);
    setReplyText('');
    Keyboard.dismiss();
  };

  const handleSend = async () => {
    if (!replyText.trim()) return;
    setIsSending(true);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    if (editingComment) {
      setEditedStatus(prev => ({ ...prev, [editingComment.id]: true }));
      showToast("Comment updated.",'success' );
      resetInput();
      setIsSending(false);
      return;
    }

    const newReplyObj = {
      id: `local_${Date.now()}`,
      postId: post.id,
      user: CURRENT_USER_NAME,
      avatar: 'https://ui-avatars.com/api/?name=Current+User&background=random',
      content: replyText,
      time: 'Just now',
      isEdited: false
    };

    if (replyingTo) {
      setLocalSubReplies(prev => {
        const parentId = replyingTo.parentId;
        const currentSubs = prev[parentId] || [];
        return { ...prev, [parentId]: [...currentSubs, newReplyObj] };
      });
      setExpandedThreads(prev => ({ ...prev, [replyingTo.parentId]: true }));
    } else {
      await submitReply(newReplyObj);
      setTimeout(() => {
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
      }, 300);
    }

    resetInput();
    setIsSending(false);
  };

  const openMenu = (item, isMainPost = false, parentId = null) => {
    Vibration.vibrate(50);
    setSelectedItem({ ...item, parentId });
    setIsPostContext(isMainPost);
    setContextMenuVisible(true);
  };

  // --- DYNAMIC OPTIONS GENERATOR ---
  const getMenuOptions = () => {
    if (!selectedItem) return [];

    const isOwner = selectedItem.user === CURRENT_USER_NAME;
    const options = [];

    // 1. Reply Option
    options.push({
      label: 'Reply',
      icon: 'arrow-undo-outline',
      onPress: () => {
        if (isPostContext) inputRef.current?.focus();
        else initiateReply(selectedItem, selectedItem.parentId);
      }
    });

    // 2. Copy Option
    options.push({
      label: 'Copy Text',
      icon: 'copy-outline',
      onPress: () => {
        Clipboard.setString(selectedItem.content);
        showToast("Text copied.", 'success' );
      }
    });

    // 3. Share Option
    options.push({
      label: 'Share',
      icon: 'share-social-outline',
      onPress: () => Share.share({ message: selectedItem.content })
    });

    // 4. Edit/Delete vs Hide/Report
    if (isOwner) {
      options.push({
        label: 'Edit',
        icon: 'create-outline',
        onPress: () => {
          setReplyText(selectedItem.content);
          setEditingComment(selectedItem);
          setReplyingTo(null); 
          inputRef.current?.focus();
        }
      });
      options.push({
        label: 'Delete',
        icon: 'trash-outline',
        color: Colors.danger,
        onPress: () => Alert.alert("Delete", "Are you sure?", [
          { text: "Cancel", style: "cancel" },
          { text: "Delete", style: "destructive", onPress: () => console.log("Deleted") }
        ])
      });
    } else {
      options.push({
        label: 'Hide',
        icon: 'eye-off-outline',
        onPress: () => showToast("Content hidden.",'info' )
      });
       options.push({
        label: 'Report',
        icon: 'flag-outline',
        color: Colors.danger,
        onPress: () => showAlert({ title: "Reported", message: "Content reported.", type: 'success' })
      });
    }

    return options;
  };

  // --- RENDERERS (Identical to before, mostly) ---

  const renderSubReply = (subItem, parentId) => {
    const isEdited = subItem.isEdited || editedStatus[subItem.id];
    
    return (
      <TouchableOpacity 
        key={subItem.id} 
        activeOpacity={0.7}
        onLongPress={() => openMenu(subItem, false, parentId)}
        style={styles.subReplyContainer}
      >
        <View style={styles.subReplyHeader}>
          <Text style={styles.subReplyUser}>{subItem.user}</Text>
          <Text style={styles.subReplyTime}>{subItem.time}</Text>
          {isEdited && <Text style={styles.editedText}>(edited)</Text>}
        </View>
        <Text style={styles.subReplyText}>{subItem.content}</Text>
      </TouchableOpacity>
    );
  };

  const renderReply = ({ item, index }) => {
    const isLast = index === currentReplies.length - 1;
    const isLiked = likedReplies[item.id] || false;
    const isEdited = item.isEdited || editedStatus[item.id];

    const existingMocks = mockDataStore[item.id] || [];
    const localSubs = localSubReplies[item.id] || [];
    const allSubReplies = [...existingMocks, ...localSubs];
    
    const isExpanded = expandedThreads[item.id];
    const hasSubs = allSubReplies.length > 0;

    return (
      <View style={styles.replyRow}>
        <View style={styles.leftColumn}>
          <Image source={{ uri: item.avatar }} style={styles.replyAvatar} />
          {!isLast && <View style={styles.threadConnector} />}
        </View>

        <View style={styles.replyContentWrapper}>
          <TouchableOpacity 
            activeOpacity={0.8}
            onLongPress={() => openMenu(item, false)}
            style={styles.replyBubble}
          >
            <View style={styles.replyHeader}>
              <Text style={styles.replyUser}>{item.user}</Text>
              <Text style={styles.replyTime}>{item.time}</Text>
              {isEdited && <Text style={styles.editedText}>(edited)</Text>}
            </View>
            <Text style={styles.replyText}>{item.content}</Text>
            
            <View style={styles.replyActions}>
              <TouchableOpacity 
                style={styles.actionBtn} 
                onPress={() => setLikedReplies(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
              >
                <Ionicons name={isLiked ? "heart" : "heart-outline"} size={14} color={isLiked ? Colors.danger : Colors.textSecondary} />
                <Text style={[styles.actionText, isLiked && { color: Colors.danger }]}>{isLiked ? '1' : 'Like'}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionBtn} onPress={() => initiateReply(item)}>
                <Ionicons name="arrow-undo-outline" size={14} color={Colors.textSecondary} />
                <Text style={styles.actionText}>Reply</Text>
              </TouchableOpacity>
            </View>

            {hasSubs && (
              <View style={styles.nestedContainer}>
                <View style={styles.nestedLine} />
                <View style={styles.nestedContent}>
                  {isExpanded ? (
                    <>
                      {allSubReplies.map((sub) => renderSubReply(sub, item.id))}
                      <TouchableOpacity 
                        onPress={() => {
                          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                          setExpandedThreads(prev => ({...prev, [item.id]: false}))
                        }}
                        style={styles.collapseBtn}
                      >
                        <Text style={styles.viewMoreText}>Show less</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <TouchableOpacity 
                      onPress={() => {
                        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                        setExpandedThreads(prev => ({...prev, [item.id]: true}))
                      }} 
                      style={styles.viewMoreBtn}
                    >
                      <View style={styles.viewMoreLine} />
                      <Text style={styles.viewMoreText}>View {allSubReplies.length} replies</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.navBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Thread</Text>
        <View style={{width: 40}} />
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
        style={{ flex: 1 }}
      >
        <FlatList
          ref={flatListRef}
          data={currentReplies}
          keyExtractor={item => item.id}
          renderItem={renderReply}
          ListHeaderComponent={
            <View style={styles.parentContainer}>
              <PostCard 
                item={post} 
                onPress={() => {}} 
                onLike={() => togglePostLike(post.id)} 
                onUserPress={() => {}} 
                onReply={() => inputRef.current?.focus()} 
                onShare={() => Share.share({ message: post.content })}
                onOptions={() => openMenu(post, true)} 
              />
              {currentReplies.length > 0 && <View style={styles.parentConnector} />}
            </View>
          }
          contentContainerStyle={styles.listContent}
        />

        {/* INPUT BAR */}
        <View style={styles.inputContainer}>
          {(replyingTo || editingComment) && (
            <View style={styles.statusContextBar}>
              <Text style={styles.statusContextText}>
                {editingComment 
                  ? "Editing comment" 
                  : <Text>Replying to <Text style={{fontWeight: 'bold'}}>{replyingTo.user}</Text></Text>
                }
              </Text>
              <TouchableOpacity onPress={resetInput}>
                <Ionicons name="close-circle" size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.inputInner}>
            <TextInput
              ref={inputRef}
              style={styles.textInput}
              placeholder={editingComment ? "Update your comment..." : (replyingTo ? "Write a mini reply..." : "Write a comment...")}
              placeholderTextColor={Colors.textSecondary}
              value={replyText}
              onChangeText={setReplyText}
              multiline
            />
            <TouchableOpacity 
              onPress={handleSend} 
              disabled={!replyText.trim() || isSending}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={(!replyText.trim() || isSending) ? ['#334155', '#334155'] : [Colors.primary, '#6366F1']}
                style={styles.sendBtn}
              >
                {isSending ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Ionicons name={editingComment ? "checkmark" : "arrow-up"} size={18} color="#FFF" />
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* NEW SHARED OPTIONS MODAL */}
      <OptionsModal
        visible={contextMenuVisible}
        onClose={() => setContextMenuVisible(false)}
        title={isPostContext ? 'Main Thread' : (selectedItem?.user === CURRENT_USER_NAME ? 'My Comment' : `${selectedItem?.user}'s Comment`)}
        options={getMenuOptions()}
      />

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  navBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 10, backgroundColor: Colors.background, zIndex: 10 },
  navTitle: { color: '#FFF', fontSize: 17, fontWeight: '700' },
  navBtn: { padding: 8, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.05)' },

  listContent: { paddingBottom: 100 },
  parentContainer: { marginBottom: 15 },
  parentConnector: { position: 'absolute', left: 38, bottom: -20, width: 2, height: 40, backgroundColor: '#334155', zIndex: -1 },

  replyRow: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 0 },
  leftColumn: { alignItems: 'center', width: 40, marginRight: 10 },
  replyAvatar: { width: 32, height: 32, borderRadius: 16, borderWidth: 1, borderColor: '#334155' },
  threadConnector: { width: 2, flex: 1, backgroundColor: '#334155', marginTop: 4 },
  
  replyContentWrapper: { flex: 1, paddingBottom: 12 },
  replyBubble: { backgroundColor: '#1E293B', borderRadius: 14, borderTopLeftRadius: 2, padding: 12, paddingBottom: 8 },
  replyHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  replyUser: { color: '#E2E8F0', fontWeight: '700', fontSize: 13, marginRight: 8 },
  replyTime: { color: Colors.textSecondary, fontSize: 11 },
  editedText: { color: Colors.textSecondary, fontSize: 10, fontStyle: 'italic', marginLeft: 6 },
  replyText: { color: '#CBD5E1', fontSize: 13, lineHeight: 18 },
  
  replyActions: { flexDirection: 'row', marginTop: 8, gap: 15 },
  actionBtn: { flexDirection: 'row', alignItems: 'center' },
  actionText: { fontSize: 11, fontWeight: '600', color: Colors.textSecondary, marginLeft: 4 },

  nestedContainer: { flexDirection: 'row', marginTop: 10 },
  nestedLine: { width: 2, backgroundColor: '#475569', borderRadius: 1, marginRight: 10, opacity: 0.5 },
  nestedContent: { flex: 1 },

  subReplyContainer: { marginBottom: 12, paddingVertical: 2 },
  subReplyHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  subReplyUser: { color: '#E2E8F0', fontWeight: '700', fontSize: 12, marginRight: 6 },
  subReplyTime: { color: Colors.textSecondary, fontSize: 10 },
  subReplyText: { color: '#94A3B8', fontSize: 12, lineHeight: 16 },

  viewMoreBtn: { flexDirection: 'row', alignItems: 'center', marginTop: 0 },
  viewMoreLine: { width: 20, height: 1, backgroundColor: Colors.primary, marginRight: 8, opacity: 0.7 },
  viewMoreText: { color: Colors.primary, fontSize: 11, fontWeight: '600' },
  collapseBtn: { marginTop: 4, alignSelf: 'flex-start' },

  inputContainer: { padding: 12, backgroundColor: Colors.surface, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)' },
  statusContextBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, paddingHorizontal: 4 },
  statusContextText: { color: Colors.textSecondary, fontSize: 12 },
  inputInner: { flexDirection: 'row', alignItems: 'flex-end', backgroundColor: '#0F172A', borderRadius: 20, padding: 4, borderWidth: 1, borderColor: '#334155' },
  textInput: { flex: 1, color: '#FFF', fontSize: 14, maxHeight: 100, paddingHorizontal: 12, paddingVertical: 10 },
  sendBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 3, marginRight: 3 },

  optionsOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  optionsContainer: { backgroundColor: '#1E293B', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  dragHandle: { width: 40, height: 5, backgroundColor: '#475569', borderRadius: 3, alignSelf: 'center', marginBottom: 15 },
  optionsHeader: { color: '#94A3B8', fontSize: 12, fontWeight: '700', marginBottom: 15, textAlign: 'center' },
  optionItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14 },
  optionLabel: { color: '#F1F5F9', fontSize: 16, fontWeight: '500', marginLeft: 15 },
  modalDivider: { height: 1, backgroundColor: '#334155', marginVertical: 10 },
  cancelLabel: { color: '#94A3B8', fontSize: 16, fontWeight: '600', textAlign: 'center', width: '100%' },
});

export default ThreadScreen;