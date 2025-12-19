// ChapterListModal.js

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
    View, Text, StyleSheet, Modal, TouchableOpacity, 
    TextInput, Pressable, FlatList, KeyboardAvoidingView, Platform, ScrollView 
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

const Colors = {
    bg: '#1E2022',
    bgDark: '#161B22',
    accent: '#5EEAD4',
    text: '#FFFFFF',
    textDim: '#9CA3AF',
    border: '#374151',
    inputBg: '#0D1117',
    primary: '#2563EB',
    danger: '#EF4444'
};

// Mock Data for Sources
const MOCK_SOURCES = ['Asura Scans', 'Flame Scans', 'Reaper Scans'];

// Mock Data for Comments
const INITIAL_COMMENTS = [
    {
        id: 'c1', user: 'shree00o', time: '3 hours ago', likes: 12,
        text: "I know this is a weird comparison but reading this I can't help but be reminded of the skeleton knight who regressed the same way as this guy did.",
        replies: []
    },
    {
        id: 'c2', user: 'SoloReader', time: '5 hours ago', likes: 45,
        text: "Finally a new chapter! The art style specifically in the fight scenes is getting better.",
        replies: [
            { id: 'c2-r1', user: 'ArtCritic', time: '1 hour ago', text: "Totally agree, the shading is top tier." }
        ]
    }
];

const ChapterListModal = ({ 
    visible, 
    onClose, 
    comicTitle = "Unknown Comic", 
    chapters = [], 
    currentChapterId, 
    onChapterSelect 
}) => {
    // --- State ---
    const [viewMode, setViewMode] = useState('comments'); // 'comments' or 'list'
    const [sourceIndex, setSourceIndex] = useState(0);
    const [commentText, setCommentText] = useState('');
    const [comments, setComments] = useState(INITIAL_COMMENTS);
    const [replyingTo, setReplyingTo] = useState(null); // { id, user }
    
    const inputRef = useRef(null);
    const listRef = useRef(null);

    // --- Derived Data ---
    const currentChapterIndex = useMemo(() => chapters.findIndex(c => c.id.toString() === currentChapterId?.toString()), [chapters, currentChapterId]);
    const currentChapter = chapters[currentChapterIndex];
    
    // Calculate Progress (Assumes chapters are sorted Newest -> Oldest usually, but handling both)
    // If index 0 is latest, progress is (total - index) / total
    const progressPercent = chapters.length > 0 
        ? ((chapters.length - currentChapterIndex) / chapters.length) * 100 
        : 0;

    // --- Actions ---

    const handleNext = () => {
        // "Next" usually means the next chronological chapter (e.g. Ch 1 -> Ch 2)
        // If array is [Ch 10, Ch 9 ... Ch 1], Next is index - 1
        if (currentChapterIndex > 0) {
            onChapterSelect(chapters[currentChapterIndex - 1].id);
        }
    };

    const handlePrev = () => {
        // "Prev" is index + 1
        if (currentChapterIndex < chapters.length - 1) {
            onChapterSelect(chapters[currentChapterIndex + 1].id);
        }
    };

    const toggleSource = () => {
        setSourceIndex((prev) => (prev + 1) % MOCK_SOURCES.length);
    };

    const handleReply = (commentId, username) => {
        setReplyingTo({ id: commentId, user: username });
        setCommentText(`@${username} `);
        inputRef.current?.focus();
    };

    const handlePostComment = () => {
        if (!commentText.trim()) return;

        const newComment = {
            id: Date.now().toString(),
            user: 'You',
            time: 'Just now',
            likes: 0,
            text: commentText.replace(`@${replyingTo?.user} `, ''), // Remove tag for clean storage
            replies: []
        };

        if (replyingTo) {
            // Add as reply
            setComments(prev => prev.map(c => {
                if (c.id === replyingTo.id) {
                    return { ...c, replies: [...c.replies, newComment] };
                }
                return c;
            }));
        } else {
            // Add as new comment
            setComments(prev => [newComment, ...prev]);
        }

        setCommentText('');
        setReplyingTo(null);
    };

    // Scroll to active chapter when list opens
    useEffect(() => {
        if (viewMode === 'list' && visible && listRef.current && currentChapterIndex >= 0) {
            setTimeout(() => {
                listRef.current?.scrollToIndex({ index: currentChapterIndex, viewOffset: 60 });
            }, 100);
        }
    }, [viewMode, visible, currentChapterIndex]);

    // --- Render Items ---

    const renderChapterItem = ({ item, index }) => {
        const isActive = item.id.toString() === currentChapterId?.toString();
        return (
            <TouchableOpacity 
                style={[styles.chapterItem, isActive && styles.chapterItemActive]}
                onPress={() => {
                    onChapterSelect(item.id);
                    setViewMode('comments'); // Close list on select
                    onClose();
                }}
            >
                <Text style={[styles.chapterItemText, isActive && styles.chapterItemTextActive]}>
                    {item.title}
                </Text>
                {isActive && <Ionicons name="checkmark-circle" size={16} color={Colors.accent} />}
                {!isActive && <Text style={styles.dateText}>{item.releaseDate ? new Date(item.releaseDate).toLocaleDateString() : 'Unknown date'}</Text>}
            </TouchableOpacity>
        );
    };

    const renderComment = ({ item }) => (
        <View style={styles.commentContainer}>
            <View style={styles.commentItem}>
                <View style={[styles.avatarPlaceholder, { backgroundColor: item.user === 'You' ? Colors.accent : Colors.primary }]}>
                    <Text style={styles.avatarText}>{item.user[0].toUpperCase()}</Text>
                </View>
                <View style={styles.commentBody}>
                    <View style={styles.commentMeta}>
                        <Text style={styles.userName}>{item.user}</Text>
                        <Text style={styles.timeText}>{item.time}</Text>
                    </View>
                    <Text style={styles.commentText}>{item.text}</Text>
                    
                    <View style={styles.commentActions}>
                        <TouchableOpacity style={styles.actionIconRow}>
                            <Ionicons name="thumbs-up-outline" size={14} color={Colors.textDim} />
                            <Text style={styles.actionText}>{item.likes || 0}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionIconRow} onPress={() => handleReply(item.id, item.user)}>
                            <Ionicons name="arrow-undo" size={14} color={Colors.textDim} />
                            <Text style={styles.actionText}>Reply</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* Nested Replies */}
            {item.replies && item.replies.map(reply => (
                <View key={reply.id} style={[styles.commentItem, styles.replyItem]}>
                     <View style={[styles.avatarPlaceholder, { width: 24, height: 24, backgroundColor: '#4B5563' }]}>
                        <Text style={[styles.avatarText, { fontSize: 10 }]}>{reply.user[0]}</Text>
                    </View>
                    <View style={styles.commentBody}>
                        <View style={styles.commentMeta}>
                            <Text style={styles.userName}>{reply.user}</Text>
                            <Text style={styles.timeText}>{reply.time}</Text>
                        </View>
                        <Text style={styles.commentText}>{reply.text}</Text>
                    </View>
                </View>
            ))}
        </View>
    );

    return (
        <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
            <View style={styles.overlay}>
                <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
                    <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
                </Pressable>

                <KeyboardAvoidingView 
                    behavior={Platform.OS === "ios" ? "padding" : "height"} 
                    style={styles.modalContent}
                >
                    {/* --- HEADER --- */}
                    <View style={styles.progressBarContainer}>
                        <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
                    </View>
                    
                    <View style={styles.header}>
                        <View style={styles.logoRow}>
                            <Ionicons name="book" size={20} color={Colors.accent} />
                            <Text style={styles.logoText} numberOfLines={1}>{comicTitle}</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <Ionicons name="close" size={20} color={Colors.textDim} />
                        </TouchableOpacity>
                    </View>

                    {/* --- NAV CONTROLS --- */}
                    <View style={styles.navRow}>
                        <TouchableOpacity 
                            style={[styles.navBtn, currentChapterIndex >= chapters.length - 1 && styles.disabledBtn]} 
                            onPress={handlePrev}
                            disabled={currentChapterIndex >= chapters.length - 1}
                        >
                            <Ionicons name="chevron-back" size={20} color={currentChapterIndex >= chapters.length - 1 ? Colors.textDim : Colors.text} />
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                            style={[styles.chapterSelector, viewMode === 'list' && styles.chapterSelectorActive]}
                            onPress={() => setViewMode(prev => prev === 'list' ? 'comments' : 'list')}
                        >
                            <Text style={styles.chapterText}>
                                {currentChapter?.title || `Chapter ${currentChapterId}`}
                            </Text>
                            <Ionicons name={viewMode === 'list' ? "chevron-up" : "chevron-down"} size={16} color={Colors.text} />
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={[styles.navBtn, currentChapterIndex <= 0 && styles.disabledBtn]}
                            onPress={handleNext}
                            disabled={currentChapterIndex <= 0}
                        >
                            <Ionicons name="chevron-forward" size={20} color={currentChapterIndex <= 0 ? Colors.textDim : Colors.text} />
                        </TouchableOpacity>
                    </View>

                    {/* --- CONTENT AREA --- */}
                    <View style={{ flex: 1 }}>
                        {viewMode === 'list' ? (
                            <FlatList
                                ref={listRef}
                                data={chapters}
                                keyExtractor={(item) => item.id.toString()}
                                renderItem={renderChapterItem}
                                initialNumToRender={10}
                                getItemLayout={(data, index) => ({ length: 50, offset: 50 * index, index })}
                                style={styles.listContainer}
                            />
                        ) : (
                            <View style={{ flex: 1 }}>
                                <View style={styles.metaRow}>
                                    <View style={styles.likeBox}>
                                        <Ionicons name="heart" size={16} color={Colors.danger} />
                                        <Text style={styles.likeText}>2.4k Likes</Text>
                                    </View>

                                    <TouchableOpacity style={styles.sourceBox} onPress={toggleSource}>
                                        <Text style={styles.sourceText}>{MOCK_SOURCES[sourceIndex]}</Text>
                                        <Ionicons name="swap-vertical" size={16} color={Colors.accent} />
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.commentsContainer}>
                                    <View style={styles.commentHeader}>
                                        <Text style={styles.commentCount}>{comments.length} Comments</Text>
                                        <View style={styles.sortRow}>
                                            <Text style={[styles.sortText, styles.activeSort]}>Top</Text>
                                            <Text style={styles.sortText}>New</Text>
                                        </View>
                                    </View>
                                    
                                    <FlatList
                                        data={comments}
                                        keyExtractor={item => item.id}
                                        renderItem={renderComment}
                                        showsVerticalScrollIndicator={false}
                                        contentContainerStyle={{ paddingBottom: 60 }}
                                    />
                                </View>
                            </View>
                        )}
                    </View>

                    {/* --- INPUT FOOTER (Only in Comment Mode) --- */}
                    {viewMode === 'comments' && (
                        <View style={styles.footerInput}>
                            <TextInput 
                                ref={inputRef}
                                style={styles.commentInput} 
                                placeholder={replyingTo ? `Replying to ${replyingTo.user}...` : "Join the discussion..."}
                                placeholderTextColor={Colors.textDim}
                                value={commentText}
                                onChangeText={setCommentText}
                            />
                            <TouchableOpacity 
                                style={[styles.sendBtn, !commentText.trim() && styles.disabledSend]} 
                                onPress={handlePostComment}
                                disabled={!commentText.trim()}
                            >
                                <Ionicons name="send" size={18} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    )}

                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
    modalContent: { 
        width: '100%', height: '85%', backgroundColor: Colors.bg, 
        borderTopLeftRadius: 16, borderTopRightRadius: 16, 
        borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' 
    },
    
    // Header
    progressBarContainer: { width: '100%', height: 3, backgroundColor: '#111' },
    progressBarFill: { height: '100%', backgroundColor: Colors.accent },
    header: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: Colors.border },
    logoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
    logoText: { color: Colors.text, fontWeight: '700', fontSize: 16, maxWidth: '85%' },
    closeBtn: { padding: 4, backgroundColor: Colors.border, borderRadius: 12 },
    
    // Navigation
    navRow: { flexDirection: 'row', padding: 12, gap: 8, backgroundColor: Colors.bgDark },
    navBtn: { backgroundColor: Colors.border, width: 40, height: 40, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    disabledBtn: { opacity: 0.3 },
    chapterSelector: { 
        flex: 1, flexDirection: 'row', backgroundColor: Colors.border, alignItems: 'center', 
        justifyContent: 'center', gap: 8, borderRadius: 8
    },
    chapterSelectorActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
    chapterText: { color: Colors.text, fontWeight: '600', fontSize: 14 },

    // Lists
    listContainer: { backgroundColor: Colors.bgDark },
    chapterItem: { flexDirection: 'row', padding: 16, alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#2A2A2E' },
    chapterItemActive: { backgroundColor: '#1F2937' },
    chapterItemText: { color: Colors.textDim, fontSize: 14 },
    chapterItemTextActive: { color: Colors.accent, fontWeight: 'bold' },
    dateText: { color: '#555', fontSize: 12 },

    // Meta (Likes/Source)
    metaRow: { flexDirection: 'row', padding: 12, gap: 12 },
    likeBox: { 
        flex: 1, flexDirection: 'row', backgroundColor: Colors.bgDark, alignItems: 'center', 
        justifyContent: 'center', borderRadius: 8, height: 44, gap: 8, borderWidth: 1, borderColor: Colors.border
    },
    likeText: { color: Colors.text, fontSize: 13, fontWeight: '600' },
    sourceBox: { 
        flex: 1, flexDirection: 'row', backgroundColor: Colors.bgDark, alignItems: 'center', 
        justifyContent: 'center', borderRadius: 8, height: 44, gap: 8, borderWidth: 1, borderColor: Colors.accent 
    },
    sourceText: { color: Colors.accent, fontSize: 13, fontWeight: '700' },

    // Comments
    commentsContainer: { flex: 1, paddingHorizontal: 16, backgroundColor: Colors.bg },
    commentHeader: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 12 },
    commentCount: { color: Colors.textDim, fontSize: 13, fontWeight: '600' },
    sortRow: { flexDirection: 'row', gap: 12 },
    sortText: { color: Colors.textDim, fontSize: 13 },
    activeSort: { color: Colors.text, fontWeight: 'bold', textDecorationLine: 'underline' },
    
    commentContainer: { marginBottom: 20 },
    commentItem: { flexDirection: 'row', gap: 12 },
    replyItem: { marginTop: 12, marginLeft: 44, opacity: 0.9 },
    avatarPlaceholder: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
    avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
    commentBody: { flex: 1 },
    commentMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
    userName: { color: Colors.text, fontWeight: '700', fontSize: 13 },
    timeText: { color: Colors.textDim, fontSize: 11 },
    commentText: { color: '#E5E7EB', fontSize: 13, lineHeight: 20, marginBottom: 8 },
    commentActions: { flexDirection: 'row', gap: 16 },
    actionIconRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    actionText: { color: Colors.textDim, fontSize: 11, fontWeight: '600' },

    // Footer
    footerInput: { 
        padding: 12, borderTopWidth: 1, borderTopColor: Colors.border, backgroundColor: Colors.bgDark,
        flexDirection: 'row', alignItems: 'center', gap: 10
    },
    commentInput: { 
        flex: 1, backgroundColor: '#0D1117', borderRadius: 20, paddingHorizontal: 16, 
        color: Colors.text, height: 40, borderWidth: 1, borderColor: Colors.border
    },
    sendBtn: { 
        width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.accent, 
        alignItems: 'center', justifyContent: 'center' 
    },
    disabledSend: { backgroundColor: Colors.border, opacity: 0.5 },
});

export default ChapterListModal;