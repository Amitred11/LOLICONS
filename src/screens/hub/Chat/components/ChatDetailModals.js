import React from 'react';
import {
  View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity,
  KeyboardAvoidingView, Platform, Animated,
  Modal, Image, ScrollView, Dimensions
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Colors } from '@config/Colors';
import CallOverlay from './CallOverlay';
import GroupCallOverlay from './GroupCallOverlay';

const SCREEN_HEIGHT = Dimensions.get('window').height;

const ChatDetailModals = ({
  // State & Data
  user,
  isGroup,
  isCalling,
  callType,
  isCallMinimized,
  fullScreenImage,
  showReportModal,
  reportReason,
  
  // POLL PROPS
  showPollModal,
  pollData,
  activePollMessage, 
  
  addOptionModal,
  showPinnedModal,
  pinnedMessages,
  reactorsModal,
  votersModal,
  selectedMessage,
  messages, 
  MY_USER_ID,

  // Setters & Handlers
  handleCallEnded,
  setIsCallMinimized,
  setFullScreenImage,
  setShowReportModal,
  setReportReason,
  handleSubmitReport,
  
  // Poll Handlers
  closePollModal,
  setPollData,
  updatePollOption,
  addCreatePollOption,
  handleCreatePoll,
  handleVote, 
  handleAddOptionToExisting, 
  
  closeAddOptionModal,
  setAddOptionModal,
  submitNewOption,
  closePinnedModal,
  handleGoToPinnedMessage,
  setReactorsModal,
  setVotersModal,
  setSelectedMessage,
  handleReactionPress,
  handlePinAction,
  setMsg,
  setEditingMessageId,
  handleReportAction,
  handleDeleteAction,

  // Animations & Pan Responders
  panY,
  pollPanResponder,
  addOptionPanY,
  addOptionPanResponder,
  pinnedPanY,
  pinnedPanResponder,
}) => {
  const insets = useSafeAreaInsets();

  // --- RENDERER: Poll Detail/Voting Mode ---
  const renderPollDetailMode = () => {
      const liveMessage = activePollMessage 
          ? messages.find(m => m.id === activePollMessage.id) 
          : null;
      
      const poll = liveMessage ? liveMessage.poll : (activePollMessage?.poll);

      if (!poll) return null;

      return (
          <View>
              {/* Question Header */}
              <View style={styles.detailQuestionContainer}>
                  <Text style={styles.detailQuestionText} numberOfLines={2}>{poll.question}</Text>
                  <View style={styles.detailMetaRow}>
                      <Text style={styles.detailMetaText}>
                          By {activePollMessage.sender === 'me' ? 'You' : activePollMessage.senderName}
                      </Text>
                      <Text style={styles.detailMetaText}>• {poll.totalVotes} votes</Text>
                  </View>
              </View>

              {/* Scrollable Options */}
              <ScrollView 
                  style={{ maxHeight: 300 }} // Increased height for better visibility
                  contentContainerStyle={{ paddingBottom: 20 }}
                  showsVerticalScrollIndicator={true} 
                  indicatorStyle="white"
                  nestedScrollEnabled={true} 
              >
                  {poll.options.map((opt) => {
                      const percentage = poll.totalVotes > 0 ? (opt.votes / poll.totalVotes) * 100 : 0;
                      const isVotedByMe = opt.voters && opt.voters.some(v => v.id === MY_USER_ID);

                      return (
                          <View key={opt.id} style={styles.detailOptionContainer}>
                              <View style={[styles.detailProgressBar, { width: `${percentage}%` }]} />
                              <View style={styles.detailOptionContent}>
                                  <View style={{flex: 1, paddingRight: 8}}>
                                      <Text numberOfLines={1} style={[styles.detailOptionText, isVotedByMe && {fontWeight:'700', color: Colors.primary}]}>
                                          {opt.text}
                                      </Text>
                                      {opt.voters && opt.voters.length > 0 && (
                                          <View style={styles.voterAvatarRow}>
                                              {opt.voters.slice(0, 5).map((v, i) => (
                                                  <View key={i} style={[styles.miniAvatar, { left: i * -6, zIndex: 10 - i }]}>
                                                      <Text style={{fontSize:6, color:'#FFF'}}>{v.name[0]}</Text>
                                                  </View>
                                              ))}
                                              {opt.voters.length > 5 && (
                                                  <Text style={[styles.moreVotersText, {marginLeft: (opt.voters.length > 5 ? (5 * -6) + 4 : 0)}]}>
                                                      +{opt.voters.length - 5}
                                                  </Text>
                                              )}
                                          </View>
                                      )}
                                  </View>

                                  <View style={{alignItems:'flex-end', minWidth: 50}}>
                                      <Text style={styles.detailPercentText}>{Math.round(percentage)}%</Text>
                                      <TouchableOpacity 
                                          activeOpacity={0.7}
                                          style={[styles.voteBtn, isVotedByMe ? styles.voteBtnSelected : styles.voteBtnUnselected]}
                                          onPress={() => handleVote(activePollMessage.id, opt.id)}
                                      >
                                          <Text style={styles.voteBtnText}>{isVotedByMe ? 'Voted' : 'Vote'}</Text>
                                      </TouchableOpacity>
                                  </View>
                              </View>
                          </View>
                      );
                  })}
                  
                  <TouchableOpacity style={styles.detailAddOptionBtn} onPress={() => handleAddOptionToExisting(activePollMessage.id)}>
                      <Ionicons name="add" size={16} color={Colors.primary} />
                      <Text style={styles.detailAddOptionText}>Add option</Text>
                  </TouchableOpacity>
              </ScrollView>
          </View>
      );
  };

  // --- RENDERER: Poll Creation Mode ---
  const renderPollCreationMode = () => (
      <View>
          <Text style={styles.sectionLabel}>QUESTION</Text>
          <View style={styles.questionInputContainer}>
              <TextInput
                  style={styles.pollInputReset}
                  placeholder="Ask a question..."
                  placeholderTextColor={Colors.textSecondary}
                  value={pollData.question}
                  onChangeText={(t) => setPollData({...pollData, question: t})}
              />
          </View>

          <Text style={[styles.sectionLabel, { marginTop: 15 }]}>OPTIONS</Text>
          
          <ScrollView 
              style={{ maxHeight: 250 }} 
              contentContainerStyle={{ paddingBottom: 20 }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={true}
              indicatorStyle="white"
              nestedScrollEnabled={true}
          >
              {pollData.options.map((opt, idx) => (
                  <View key={idx} style={styles.pollOptionRow}>
                      <View style={styles.optionNumberBadge}>
                          <Text style={styles.optionNumberText}>{idx + 1}</Text>
                      </View>
                      <TextInput
                          style={styles.pollOptionInput}
                          placeholder={`Option ${idx + 1}`}
                          placeholderTextColor={Colors.textSecondary}
                          value={opt}
                          onChangeText={(t) => updatePollOption(t, idx)}
                      />
                  </View>
              ))}

              {pollData.options.length < 5 && (
                  <TouchableOpacity style={styles.dashedAddBtn} onPress={addCreatePollOption}>
                      <Ionicons name="add" size={16} color={Colors.primary} />
                      <Text style={styles.dashedAddText}>Add option</Text>
                  </TouchableOpacity>
              )}
          </ScrollView>

          <TouchableOpacity style={styles.createPollBtn} onPress={handleCreatePoll}>
              <Text style={styles.createPollText}>Create Poll</Text>
          </TouchableOpacity>
      </View>
  );

  return (
    <>
      {/* 1. CALL OVERLAYS */}
      {isCalling && !isGroup && (
        <View style={[StyleSheet.absoluteFill, { zIndex: 999 }]} pointerEvents="box-none">
           <CallOverlay visible={isCalling} user={user} type={callType} onClose={handleCallEnded} isMinimized={isCallMinimized} onMinimize={() => setIsCallMinimized(true)} />
        </View>
      )}
      <Modal visible={isCalling && isGroup} transparent={true} animationType="fade">
        <View style={{ flex: 1, backgroundColor: '#000' }}>
            <GroupCallOverlay visible={isCalling} user={user} onClose={handleCallEnded} />
        </View>
      </Modal>

      {/* 2. FULL SCREEN IMAGE */}
      <Modal visible={!!fullScreenImage} transparent={true} animationType="fade">
        <View style={styles.fullScreenContainer}>
            <TouchableOpacity style={styles.closeImageBtn} onPress={() => setFullScreenImage(null)}>
                <Ionicons name="close-circle" size={40} color="#FFF" />
            </TouchableOpacity>
            {fullScreenImage && <Image source={{ uri: fullScreenImage }} style={styles.fullScreenImage} resizeMode="contain" />}
        </View>
      </Modal>

      {/* 3. REPORT MODAL */}
      <Modal visible={showReportModal} transparent={true} animationType="slide">
          <View style={styles.centerModalOverlay}>
              <View style={styles.centerModalContent}>
                  <Text style={styles.modalTitle}>Report Content</Text>
                  <Text style={styles.modalSub}>Why are you reporting this message?</Text>
                  <TextInput
                      style={styles.modalInput}
                      placeholder="Reason (e.g., spam, harassment)"
                      placeholderTextColor={Colors.textSecondary}
                      multiline
                      value={reportReason}
                      onChangeText={setReportReason}
                  />
                  <View style={styles.modalButtons}>
                      <TouchableOpacity style={styles.modalBtnCancel} onPress={() => setShowReportModal(false)}>
                          <Text style={{color: Colors.text}}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.modalBtnConfirm} onPress={handleSubmitReport}>
                          <Text style={{color: '#FFF', fontWeight:'bold'}}>Report</Text>
                      </TouchableOpacity>
                  </View>
              </View>
          </View>
      </Modal>

      {/* 4. POLL MODAL - FIX APPLIED HERE */}
      <Modal visible={showPollModal} transparent={true} animationType="fade" onRequestClose={closePollModal}>
          <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={closePollModal}>
              <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ width: '100%' }}>
                  <Animated.View 
                      style={[styles.bottomSheetContent, { transform: [{ translateY: panY }] }]}
                      // FIX: REMOVED panHandlers from here so the body is touchable
                  >
                      {/* FIX: Attach PanResponder ONLY to the header container */}
                      <View {...pollPanResponder.panHandlers} style={{ width: '100%', backgroundColor: 'transparent' }}>
                          <View style={styles.sheetHandle} />
                          <View style={styles.sheetHeader}>
                              <Text style={styles.modalTitle}>
                                  {activePollMessage ? 'Poll Details' : 'Create Poll'}
                              </Text>
                              <TouchableOpacity onPress={closePollModal} style={styles.closeBtn}>
                                  <Ionicons name="close" size={20} color={Colors.textSecondary} />
                              </TouchableOpacity>
                          </View>
                      </View>

                      {activePollMessage ? renderPollDetailMode() : renderPollCreationMode()}
                      
                      <View style={{ height: insets.bottom + 10 }} />
                  </Animated.View>
              </KeyboardAvoidingView>
          </TouchableOpacity>
      </Modal>

      {/* 5. ADD OPTION INPUT MODAL - FIX APPLIED HERE */}
      <Modal visible={addOptionModal.visible} transparent={true} animationType="fade" onRequestClose={closeAddOptionModal}>
          <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={closeAddOptionModal}>
              <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ width: '100%' }}>
                  <Animated.View 
                      style={[styles.bottomSheetContent, { transform: [{ translateY: addOptionPanY }] }]}
                      // FIX: REMOVED panHandlers from here
                  >
                      {/* FIX: Attach PanResponder ONLY to the header container */}
                      <View {...addOptionPanResponder.panHandlers} style={{ width: '100%', backgroundColor: 'transparent' }}>
                          <View style={styles.sheetHandle} />
                          <View style={styles.sheetHeader}>
                              <Text style={styles.modalTitle}>Add Option</Text>
                              <TouchableOpacity onPress={closeAddOptionModal} style={styles.closeBtn}>
                                  <Ionicons name="close" size={20} color={Colors.textSecondary} />
                              </TouchableOpacity>
                          </View>
                      </View>

                      <View style={styles.questionInputContainer}>
                          <TextInput
                              style={[styles.pollInputReset, { width: '100%' }]}
                              placeholder="New option text..."
                              placeholderTextColor={Colors.textSecondary}
                              autoFocus={true}
                              value={addOptionModal.text}
                              onChangeText={(t) => setAddOptionModal({...addOptionModal, text: t})}
                          />
                      </View>

                      <TouchableOpacity style={styles.createPollBtn} onPress={submitNewOption}>
                          <Text style={styles.createPollText}>Add to Poll</Text>
                      </TouchableOpacity>

                      <View style={{ height: insets.bottom + 10 }} />
                  </Animated.View>
              </KeyboardAvoidingView>
          </TouchableOpacity>
      </Modal>

      {/* 6. PINNED MESSAGES LIST MODAL - FIX APPLIED HERE */}
      <Modal visible={showPinnedModal} transparent={true} animationType="fade" onRequestClose={closePinnedModal}>
          <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={closePinnedModal}>
               <Animated.View 
                   style={[styles.bottomSheetContent, { transform: [{ translateY: pinnedPanY }] }]}
                   // FIX: REMOVED panHandlers from here
               >
                   {/* FIX: Attach PanResponder ONLY to the header container */}
                   <View {...pinnedPanResponder.panHandlers} style={{ width: '100%', backgroundColor: 'transparent' }}>
                       <View style={styles.sheetHandle} />
                       <View style={styles.sheetHeader}>
                           <View style={{flexDirection: 'row', alignItems: 'center'}}>
                               <Ionicons name="push" size={18} color={Colors.primary} style={{marginRight: 8}} />
                               <Text style={styles.modalTitle}>Pinned Messages</Text>
                           </View>
                           <TouchableOpacity onPress={closePinnedModal} style={styles.closeBtn}>
                               <Ionicons name="close" size={20} color={Colors.textSecondary} />
                           </TouchableOpacity>
                       </View>
                   </View>

                   {pinnedMessages.length === 0 ? (
                       <View style={{padding: 30, alignItems: 'center', opacity: 0.6}}>
                           <Ionicons name="push-outline" size={40} color={Colors.textSecondary} style={{marginBottom: 10}} />
                           <Text style={{color: Colors.textSecondary}}>No pinned messages.</Text>
                       </View>
                   ) : (
                       <FlatList
                           data={pinnedMessages}
                           keyExtractor={item => item.id}
                           style={{maxHeight: SCREEN_HEIGHT * 0.5}}
                           renderItem={({item}) => (
                               <TouchableOpacity style={styles.pinnedItem} onPress={() => handleGoToPinnedMessage(item.id)}>
                                   <View style={styles.pinnedItemContent}>
                                       <Text style={styles.pinnedSender} numberOfLines={1}>{item.senderName || (item.sender === 'me' ? 'You' : 'User')}</Text>
                                       <Text style={styles.pinnedText} numberOfLines={2}>
                                           {item.type === 'image' ? '📷 Image' : item.type === 'poll' ? `📊 ${item.poll?.question || 'Poll'}` : item.text}
                                       </Text>
                                   </View>
                                   <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} />
                               </TouchableOpacity>
                           )}
                       />
                   )}
                   <View style={{ height: insets.bottom + 10 }} />
               </Animated.View>
          </TouchableOpacity>
      </Modal>

      {/* 7. REACTORS LIST MODAL */}
      <Modal visible={reactorsModal.visible} transparent={true} animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setReactorsModal({ ...reactorsModal, visible: false })}>
            <View style={styles.reactorsPopup}>
                <View style={styles.reactorsHeader}>
                    <Text style={styles.reactorsTitle}>Reactions {reactorsModal.emoji}</Text>
                    <TouchableOpacity onPress={() => setReactorsModal({ ...reactorsModal, visible: false })}>
                        <Ionicons name="close-circle" size={24} color={Colors.textSecondary} />
                    </TouchableOpacity>
                </View>
                <FlatList
                    data={reactorsModal.users}
                    keyExtractor={item => item.id}
                    style={{ maxHeight: 200 }}
                    renderItem={({ item }) => (
                        <View style={styles.reactorRow}>
                            <View style={styles.reactorAvatar}><Text style={{color:'#FFF', fontWeight:'bold'}}>{item.name[0]}</Text></View>
                            <Text style={styles.reactorName}>{item.name}</Text>
                        </View>
                    )}
                />
            </View>
        </TouchableOpacity>
      </Modal>

      {/* 8. MESSAGE CONTEXT MENU */}
      <Modal visible={!!selectedMessage} transparent={true} animationType="fade">
          <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setSelectedMessage(null)}>
              <View style={styles.contextMenu}>
                   <View style={styles.reactionRow}>
                       {['❤️','👍','😂','😮','😡','🙏'].map(emoji => (
                           <TouchableOpacity key={emoji} onPress={() => { handleReactionPress(selectedMessage.id, emoji, false); setSelectedMessage(null); }} style={styles.emojiBtn}>
                               <Text style={{fontSize:28}}>{emoji}</Text>
                           </TouchableOpacity>
                       ))}
                   </View>
                   <View style={styles.actionsList}>
                       <TouchableOpacity style={styles.actionRow} onPress={() => setSelectedMessage(null)}>
                           <Text style={styles.actionText}>Copy</Text>
                           <Ionicons name="copy-outline" size={20} color={Colors.text} />
                       </TouchableOpacity>
                       <TouchableOpacity style={styles.actionRow} onPress={handlePinAction}>
                           <Text style={styles.actionText}>{selectedMessage?.isPinned ? "Unpin Message" : "Pin Message"}</Text>
                           <Ionicons name={selectedMessage?.isPinned ? "pin" : "pin-outline"} size={20} color={Colors.text} />
                       </TouchableOpacity>
                       {selectedMessage?.sender === 'me' && selectedMessage?.type === 'text' && (
                           <TouchableOpacity style={styles.actionRow} onPress={() => { setMsg(selectedMessage.text); setEditingMessageId(selectedMessage.id); setSelectedMessage(null); }}>
                               <Text style={styles.actionText}>Edit</Text>
                               <Ionicons name="pencil-outline" size={20} color={Colors.text} />
                           </TouchableOpacity>
                       )}
                       {selectedMessage?.sender !== 'me' && (
                           <TouchableOpacity style={styles.actionRow} onPress={handleReportAction}>
                               <Text style={styles.actionText}>Report Message</Text>
                               <Ionicons name="flag-outline" size={20} color={Colors.text} />
                           </TouchableOpacity>
                       )}
                       <TouchableOpacity style={styles.actionRow} onPress={() => handleDeleteAction('for_me')}>
                           <Text style={[styles.actionText, {color: '#FF453A'}]}>Delete for me</Text>
                           <Ionicons name="trash-outline" size={20} color="#FF453A" />
                       </TouchableOpacity>
                       {selectedMessage?.sender === 'me' && (
                            <TouchableOpacity style={styles.actionRow} onPress={() => handleDeleteAction('everyone')}>
                                <Text style={[styles.actionText, {color: '#FF453A'}]}>Delete for everyone</Text>
                                <Ionicons name="trash-bin-outline" size={20} color="#FF453A" />
                            </TouchableOpacity>
                       )}
                   </View>
              </View>
          </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  bottomSheetContent: { backgroundColor: '#1C1C1E', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingVertical: 16, width: '100%', shadowColor: '#000', shadowOffset: {width: 0, height: -2}, shadowOpacity: 0.3, shadowRadius: 10, elevation: 15 },
  sheetHandle: { width: 36, height: 4, backgroundColor: '#3A3A3C', borderRadius: 2, alignSelf: 'center', marginBottom: 15 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  modalTitle: { color: '#FFF', fontSize: 18, fontWeight: '700' }, 
  closeBtn: { padding: 4, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 15 },
  
  // Create Poll Styles
  sectionLabel: { color: Colors.textSecondary, fontSize: 10, fontWeight: '700', marginBottom: 6, letterSpacing: 0.5 },
  questionInputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2C2C2E', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 2 },
  pollInputReset: { flex: 1, color: '#FFF', fontSize: 14, paddingVertical: 10 },
  pollOptionRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  optionNumberBadge: { width: 20, height: 20, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  optionNumberText: { color: Colors.textSecondary, fontSize: 10, fontWeight: '700' },
  pollOptionInput: { flex: 1, backgroundColor: '#2C2C2E', borderRadius: 10, color: '#FFF', paddingHorizontal: 12, paddingVertical: 10, fontSize: 13 },
  dashedAddBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderWidth: 1, borderColor: Colors.primary, borderStyle: 'dashed', borderRadius: 10, marginTop: 4, backgroundColor: 'rgba(52, 199, 89, 0.05)' },
  dashedAddText: { color: Colors.primary, fontSize: 13, fontWeight: '600', marginLeft: 6 },
  createPollBtn: { backgroundColor: Colors.primary, paddingVertical: 12, borderRadius: 12, alignItems: 'center', marginTop: 15, shadowColor: Colors.primary, shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.2, shadowRadius: 4 },
  createPollText: { color: '#000', fontWeight: 'bold', fontSize: 14 },

  // Detail/Viewing Poll Styles
  detailQuestionContainer: { marginBottom: 15, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)' },
  detailQuestionText: { fontSize: 16, fontWeight: '700', color: '#FFF', marginBottom: 4 }, 
  detailMetaRow: { flexDirection: 'row', alignItems: 'center' },
  detailMetaText: { color: Colors.textSecondary, fontSize: 11, marginRight: 8 },
  detailOptionContainer: { marginBottom: 8, backgroundColor: '#2C2C2E', borderRadius: 10, overflow: 'hidden', minHeight: 46, justifyContent: 'center' }, 
  detailProgressBar: { position: 'absolute', top: 0, left: 0, bottom: 0, backgroundColor: 'rgba(52, 199, 89, 0.15)' },
  detailOptionContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 8 },
  detailOptionText: { color: '#FFF', fontSize: 13, marginBottom: 2 },
  voterAvatarRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2, height: 16 },
  miniAvatar: { width: 14, height: 14, borderRadius: 7, backgroundColor: '#555', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#2C2C2E' },
  moreVotersText: { fontSize: 9, color: Colors.textSecondary, marginLeft: 4 },
  detailPercentText: { fontSize: 11, color: Colors.textSecondary, fontWeight: '700', marginBottom: 2 },
  voteBtn: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 6, borderWidth: 1 },
  voteBtnSelected: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  voteBtnUnselected: { backgroundColor: 'transparent', borderColor: 'rgba(255,255,255,0.3)' },
  voteBtnText: { fontSize: 10, fontWeight: '700', color: '#FFF' },
  detailAddOptionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, marginTop: 5, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' },
  detailAddOptionText: { color: Colors.primary, fontWeight: '600', marginLeft: 6, fontSize: 13 },

  // Report Modal
  centerModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 25 },
  centerModalContent: { backgroundColor: '#1C1C1E', width: '100%', borderRadius: 20, padding: 24 },
  modalSub: { color: Colors.textSecondary, fontSize: 14, marginBottom: 15 },
  modalInput: { backgroundColor: '#2C2C2E', borderRadius: 12, color: '#FFF', padding: 15, height: 120, textAlignVertical: 'top', marginBottom: 20, fontSize: 15 },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  modalBtnCancel: { paddingVertical: 10, paddingHorizontal: 15 },
  modalBtnConfirm: { backgroundColor: '#FF453A', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 10 },

  // Full Screen Image
  fullScreenContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', alignItems: 'center' },
  fullScreenImage: { width: '100%', height: '80%' },
  closeImageBtn: { position: 'absolute', top: 50, right: 20, zIndex: 10 },

  // Pinned Items
  pinnedItem: { flexDirection: 'row', alignItems: 'center', padding: 14, backgroundColor: '#2C2C2E', borderRadius: 16, marginBottom: 10 },
  pinnedItemContent: { flex: 1 },
  pinnedSender: { color: Colors.primary, fontSize: 12, fontWeight: '700', marginBottom: 4 },
  pinnedText: { color: '#FFF', fontSize: 15 },

  // Reactors Popup
  reactorsPopup: { backgroundColor: '#1C1C1E', width: '85%', alignSelf: 'center', borderRadius: 20, padding: 16, marginBottom: 'auto', marginTop: 'auto', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  reactorsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#2C2C2E', paddingBottom: 12 },
  reactorsTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  reactorRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  reactorAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  reactorName: { color: Colors.text, fontSize: 16, fontWeight: '500' },

  // Context Menu
  contextMenu: { backgroundColor: '#1C1C1E', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  reactionRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24, backgroundColor: '#2C2C2E', padding: 12, borderRadius: 16 },
  emojiBtn: { padding: 5 },
  actionsList: { backgroundColor: '#2C2C2E', borderRadius: 16, overflow: 'hidden' },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 18, borderBottomWidth: 1, borderBottomColor: '#3A3A3C' },
  actionText: { color: '#FFF', fontSize: 16, fontWeight: '500' },
});

export default ChatDetailModals;