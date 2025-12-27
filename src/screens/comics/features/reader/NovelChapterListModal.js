import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
    View, Text, StyleSheet, Modal, TouchableOpacity, 
    TextInput, Pressable, FlatList, KeyboardAvoidingView, Platform 
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

const Colors = {
    bg: '#121212',
    bgDark: '#0A0A0A',
    accent: '#5EEAD4',
    text: '#FFFFFF',
    textDim: '#9CA3AF',
    border: '#262626',
    inputBg: '#1A1A1A',
    primary: '#2563EB',
};

const NovelChapterListModal = ({ 
    visible, 
    onClose, 
    comic, // Full comic object
    chapters = [], 
    currentChapterId, 
    onChapterSelect 
}) => {
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'comments'
    const [searchQuery, setSearchQuery] = useState('');
    const [commentText, setCommentText] = useState('');
    const listRef = useRef(null);

    // Filter chapters based on search
    const filteredChapters = useMemo(() => {
        return chapters.filter(c => 
            c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.id.toString().includes(searchQuery)
        );
    }, [chapters, searchQuery]);

    const currentChapterIndex = useMemo(() => 
        chapters.findIndex(c => c.id.toString() === currentChapterId?.toString()), 
    [chapters, currentChapterId]);

    // Scroll to current chapter when opening the list
    useEffect(() => {
        if (visible && viewMode === 'list' && currentChapterIndex !== -1) {
            setTimeout(() => {
                listRef.current?.scrollToIndex({ 
                    index: currentChapterIndex, 
                    viewPosition: 0.3,
                    animated: false 
                });
            }, 200);
        }
    }, [visible, viewMode]);

    const renderChapterItem = ({ item }) => {
        const isActive = item.id.toString() === currentChapterId?.toString();
        return (
            <TouchableOpacity 
                style={[styles.chapterItem, isActive && styles.chapterItemActive]}
                onPress={() => {
                    onChapterSelect(item.id);
                    onClose();
                }}
            >
                <View style={styles.chapterInfo}>
                    <Text style={[styles.chapterTitle, isActive && styles.chapterTitleActive]}>
                        {item.title}
                    </Text>
                    <Text style={styles.chapterDate}>
                        {item.releaseDate || '2 days ago'} • 1.2k words
                    </Text>
                </View>
                {isActive ? (
                    <Ionicons name="play-circle" size={24} color={Colors.accent} />
                ) : (
                    <Ionicons name="chevron-forward" size={18} color={Colors.border} />
                )}
            </TouchableOpacity>
        );
    };

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
                    <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
                </Pressable>

                <KeyboardAvoidingView 
                    behavior={Platform.OS === "ios" ? "padding" : "height"} 
                    style={styles.modalContent}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.headerTop}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.novelTitle} numberOfLines={1}>{comic?.title}</Text>
                                <Text style={styles.authorText}>{comic?.author || 'Web Novel'}</Text>
                            </View>
                            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                                <Ionicons name="close" size={24} color={Colors.text} />
                            </TouchableOpacity>
                        </View>

                        {/* Tabs */}
                        <View style={styles.tabBar}>
                            <TouchableOpacity 
                                style={[styles.tab, viewMode === 'list' && styles.activeTab]} 
                                onPress={() => setViewMode('list')}
                            >
                                <MaterialCommunityIcons 
                                    name="format-list-bulleted" 
                                    size={20} 
                                    color={viewMode === 'list' ? Colors.accent : Colors.textDim} 
                                />
                                <Text style={[styles.tabText, viewMode === 'list' && styles.activeTabText]}>Chapters</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.tab, viewMode === 'comments' && styles.activeTab]} 
                                onPress={() => setViewMode('comments')}
                            >
                                <MaterialCommunityIcons 
                                    name="comment-text-outline" 
                                    size={20} 
                                    color={viewMode === 'comments' ? Colors.accent : Colors.textDim} 
                                />
                                <Text style={[styles.tabText, viewMode === 'comments' && styles.activeTabText]}>Discussion</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Content */}
                    <View style={styles.contentContainer}>
                        {viewMode === 'list' ? (
                            <>
                                <View style={styles.searchContainer}>
                                    <Ionicons name="search" size={18} color={Colors.textDim} />
                                    <TextInput 
                                        style={styles.searchInput}
                                        placeholder="Jump to chapter..."
                                        placeholderTextColor={Colors.textDim}
                                        value={searchQuery}
                                        onChangeText={setSearchQuery}
                                        keyboardType="numeric"
                                    />
                                    {searchQuery !== '' && (
                                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                                            <Ionicons name="close-circle" size={18} color={Colors.textDim} />
                                        </TouchableOpacity>
                                    )}
                                </View>
                                <FlatList
                                    ref={listRef}
                                    data={filteredChapters}
                                    keyExtractor={item => item.id.toString()}
                                    renderItem={renderChapterItem}
                                    contentContainerStyle={styles.listPadding}
                                    initialNumToRender={15}
                                    getItemLayout={(data, index) => ({ length: 70, offset: 70 * index, index })}
                                />
                            </>
                        ) : (
                            <View style={styles.placeholderView}>
                                <Ionicons name="chatbubbles-outline" size={60} color={Colors.border} />
                                <Text style={styles.placeholderText}>Comments for this chapter</Text>
                                <Text style={styles.placeholderSubText}>Connect with other readers</Text>
                            </View>
                        )}
                    </View>

                    {/* Footer for Comments */}
                    {viewMode === 'comments' && (
                        <View style={styles.commentInputContainer}>
                            <TextInput 
                                style={styles.commentInput}
                                placeholder="Write a comment..."
                                placeholderTextColor={Colors.textDim}
                                value={commentText}
                                onChangeText={setCommentText}
                                multiline
                            />
                            <TouchableOpacity style={styles.sendBtn}>
                                <Ionicons name="send" size={20} color={Colors.accent} />
                            </TouchableOpacity>
                        </View>
                    )}
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: { flex: 1, justifyContent: 'flex-end' },
    modalContent: { 
        height: '85%', 
        backgroundColor: Colors.bg, 
        borderTopLeftRadius: 25, 
        borderTopRightRadius: 25, 
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: Colors.border
    },
    header: { padding: 20, backgroundColor: Colors.bgDark, borderBottomWidth: 1, borderBottomColor: Colors.border },
    headerTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 20 },
    novelTitle: { color: Colors.text, fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
    authorText: { color: Colors.textDim, fontSize: 13 },
    closeBtn: { padding: 4 },
    tabBar: { flexDirection: 'row', gap: 20 },
    tab: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingBottom: 10, borderBottomWidth: 2, borderBottomColor: 'transparent' },
    activeTab: { borderBottomColor: Colors.accent },
    tabText: { color: Colors.textDim, fontWeight: '600' },
    activeTabText: { color: Colors.accent },
    
    contentContainer: { flex: 1 },
    searchContainer: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        backgroundColor: Colors.inputBg, 
        margin: 15, 
        paddingHorizontal: 15, 
        borderRadius: 12, 
        height: 45,
        borderWidth: 1,
        borderColor: Colors.border
    },
    searchInput: { flex: 1, color: Colors.text, marginLeft: 10, fontSize: 14 },
    
    chapterItem: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        paddingVertical: 15, 
        paddingHorizontal: 20, 
        borderBottomWidth: 1, 
        borderBottomColor: Colors.border,
        height: 70
    },
    chapterItemActive: { backgroundColor: 'rgba(94, 234, 212, 0.05)' },
    chapterInfo: { flex: 1 },
    chapterTitle: { color: Colors.textDim, fontSize: 15, fontWeight: '500' },
    chapterTitleActive: { color: Colors.accent, fontWeight: 'bold' },
    chapterDate: { color: '#555', fontSize: 12, marginTop: 4 },
    listPadding: { paddingBottom: 30 },

    placeholderView: { flex: 1, justifyContent: 'center', alignItems: 'center', opacity: 0.5 },
    placeholderText: { color: Colors.text, fontSize: 16, fontWeight: 'bold', marginTop: 15 },
    placeholderSubText: { color: Colors.textDim, fontSize: 14, marginTop: 5 },

    commentInputContainer: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        padding: 15, 
        paddingBottom: Platform.OS === 'ios' ? 35 : 15,
        backgroundColor: Colors.bgDark,
        borderTopWidth: 1,
        borderTopColor: Colors.border
    },
    commentInput: { 
        flex: 1, 
        backgroundColor: Colors.inputBg, 
        borderRadius: 20, 
        paddingHorizontal: 15, 
        paddingVertical: 10, 
        color: Colors.text,
        maxHeight: 100
    },
    sendBtn: { marginLeft: 15, padding: 5 }
});

export default NovelChapterListModal;