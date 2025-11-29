import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

const Colors = {
    bg: '#1E2022',
    accent: '#5EEAD4',
    text: '#FFFFFF',
    textDim: '#9CA3AF',
    border: '#374151',
    inputBg: '#111827',
    primary: '#2563EB' 
};

const ChapterListModal = ({ visible, onClose, comicTitle, currentChapter, onChapterChange }) => {
    const [commentText, setCommentText] = useState('');

    return (
        <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
            <View style={styles.overlay}>
                {/* Backdrop closes modal */}
                <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
                    <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
                </Pressable>

                <View style={styles.modalContent}>
                    {/* --- HEADER --- */}
                    <View style={styles.header}>
                        <View style={styles.logoRow}>
                            <Ionicons name="flash-outline" size={20} color={Colors.accent} />
                            <Text style={styles.logoText}>COMIX</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <Ionicons name="close" size={20} color={Colors.textDim} />
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.comicTitle} numberOfLines={1}>{comicTitle || "Eternally Regressing Knight"}</Text>

                    {/* --- NAV CONTROLS --- */}
                    <View style={styles.navRow}>
                        <TouchableOpacity 
                            style={styles.navBtn} 
                            onPress={() => onChapterChange && onChapterChange('prev')}
                        >
                            <Ionicons name="chevron-back" size={20} color={Colors.text} />
                        </TouchableOpacity>
                        
                        <TouchableOpacity style={styles.chapterSelector}>
                            <Text style={styles.chapterText}>Ch {currentChapter || "1"}</Text>
                            <Ionicons name="chevron-down" size={16} color={Colors.text} />
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={styles.navBtn}
                            onPress={() => onChapterChange && onChapterChange('next')}
                        >
                            <Ionicons name="chevron-forward" size={20} color={Colors.text} />
                        </TouchableOpacity>
                    </View>

                    {/* --- META ACTIONS --- */}
                    <View style={styles.metaRow}>
                        <View style={styles.likeBox}>
                            <Ionicons name="thumbs-up" size={16} color={Colors.textDim} />
                            <Text style={styles.likeText}>Like this</Text>
                            <View style={styles.likeCountBadge}>
                                <Text style={styles.likeCountText}>2</Text>
                            </View>
                        </View>

                        <View style={styles.sourceBox}>
                            <Text style={styles.sourceText}>Asura Scans</Text>
                            <Ionicons name="chevron-down" size={16} color={Colors.accent} />
                        </View>
                    </View>

                    {/* --- COMMENTS SECTION --- */}
                    <View style={styles.commentsContainer}>
                        <View style={styles.commentHeader}>
                            <Text style={styles.commentCount}>1 comments</Text>
                            <View style={styles.sortRow}>
                                <Text style={[styles.sortText, styles.activeSort]}>Best</Text>
                                <Text style={styles.sortText}>Newest</Text>
                                <Text style={styles.sortText}>Oldest</Text>
                            </View>
                        </View>

                        {/* Input */}
                        <View style={styles.inputRow}>
                            <View style={styles.avatarPlaceholder} />
                            <TextInput 
                                style={styles.commentInput} 
                                placeholder="Write your message" 
                                placeholderTextColor={Colors.textDim}
                                value={commentText}
                                onChangeText={setCommentText}
                            />
                        </View>

                        {/* Sample Comment */}
                        <View style={styles.commentItem}>
                            <View style={[styles.avatarPlaceholder, { backgroundColor: '#2563EB' }]}>
                                <Ionicons name="power" size={16} color="#fff" />
                            </View>
                            <View style={styles.commentBody}>
                                <View style={styles.commentMeta}>
                                    <Text style={styles.userName}>shree00o</Text>
                                    <Text style={styles.timeText}>3 hours ago</Text>
                                </View>
                                <Text style={styles.commentText}>
                                    I know this is a weird comparison but reading this I can't help but be reminded of the skeleton knight who regressed the same way as this guy did
                                </Text>
                                <View style={styles.commentActions}>
                                    <View style={styles.actionIconRow}>
                                        <Ionicons name="thumbs-up" size={14} color={Colors.textDim} />
                                        <Text style={styles.actionText}>0</Text>
                                    </View>
                                    <View style={styles.actionIconRow}>
                                        <Ionicons name="thumbs-down" size={14} color={Colors.textDim} />
                                        <Text style={styles.actionText}>0</Text>
                                    </View>
                                    <View style={styles.actionIconRow}>
                                        <Ionicons name="arrow-undo" size={14} color={Colors.textDim} />
                                        <Text style={styles.actionText}>Reply</Text>
                                    </View>
                                    <Ionicons name="ellipsis-horizontal" size={14} color={Colors.textDim} />
                                </View>
                            </View>
                        </View>
                    </View>

                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)' },
    modalContent: { 
        width: '90%', maxHeight: '80%', backgroundColor: Colors.bg, 
        borderRadius: 8, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' 
    },
    header: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, alignItems: 'center' },
    logoRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    logoText: { color: Colors.text, fontWeight: '800', fontSize: 16, letterSpacing: 1 },
    closeBtn: { padding: 4, backgroundColor: Colors.border, borderRadius: 4 },
    comicTitle: { color: Colors.text, fontSize: 16, fontWeight: '700', paddingHorizontal: 16, marginBottom: 16 },
    navRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 12 },
    navBtn: { backgroundColor: Colors.inputBg, padding: 12, borderRadius: 4, alignItems: 'center', justifyContent: 'center' },
    chapterSelector: { 
        flex: 1, flexDirection: 'row', backgroundColor: '#111827', alignItems: 'center', 
        justifyContent: 'center', gap: 8, borderRadius: 4 
    },
    chapterText: { color: Colors.text, fontWeight: '600' },
    metaRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 20 },
    likeBox: { 
        flex: 1, flexDirection: 'row', backgroundColor: '#111827', alignItems: 'center', 
        paddingLeft: 12, borderRadius: 4, height: 40
    },
    likeText: { color: Colors.text, marginLeft: 8, fontSize: 13, flex: 1 },
    likeCountBadge: { 
        backgroundColor: '#1F2937', height: '100%', paddingHorizontal: 12, 
        justifyContent: 'center', borderLeftWidth: 1, borderLeftColor: Colors.border 
    },
    likeCountText: { color: Colors.accent, fontWeight: 'bold' },
    sourceBox: { 
        flex: 1, flexDirection: 'row', backgroundColor: '#111827', alignItems: 'center', 
        justifyContent: 'space-between', paddingHorizontal: 12, borderRadius: 4 
    },
    sourceText: { color: Colors.accent, fontSize: 13 },
    commentsContainer: { padding: 16, borderTopWidth: 1, borderTopColor: Colors.border, backgroundColor: '#161B22' },
    commentHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    commentCount: { color: Colors.textDim, fontSize: 13 },
    sortRow: { flexDirection: 'row', gap: 12 },
    sortText: { color: Colors.textDim, fontSize: 13, fontWeight: '600' },
    activeSort: { color: Colors.accent, textDecorationLine: 'underline' },
    inputRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
    avatarPlaceholder: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.textDim, alignItems: 'center', justifyContent: 'center' },
    commentInput: { flex: 1, backgroundColor: '#0D1117', borderRadius: 4, paddingHorizontal: 12, color: Colors.text, height: 40 },
    commentItem: { flexDirection: 'row', gap: 12 },
    commentBody: { flex: 1 },
    commentMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
    userName: { color: Colors.text, fontWeight: '700', fontSize: 13 },
    timeText: { color: Colors.textDim, fontSize: 11 },
    commentText: { color: Colors.textDim, fontSize: 13, lineHeight: 20, marginBottom: 8 },
    commentActions: { flexDirection: 'row', gap: 16 },
    actionIconRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    actionText: { color: Colors.textDim, fontSize: 11, fontWeight: '600' },
});

export default ChapterListModal;