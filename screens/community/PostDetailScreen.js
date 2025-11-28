import React, { useState } from 'react';
import { View, StyleSheet, FlatList, TextInput, KeyboardAvoidingView, Platform, TouchableOpacity, Text } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { communityPostsData, commentsData } from '../../constants/mockData';
import { PostCard, CommentCard } from './components/CommunityUI';

const PostDetailScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const { postId } = route.params;

    const [commentText, setCommentText] = useState('');

    // Safe fallback if postId isn't found (prevents crash)
    const post = communityPostsData.find(p => p.id === postId) || communityPostsData[0];

    return (
        <KeyboardAvoidingView 
            style={styles.container} 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={0}
        >
            {/* Custom Header */}
            <View style={[styles.header, { paddingTop: insets.top }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Discussion</Text>
                <View style={{ width: 40 }} />
            </View>

            <FlatList
                data={commentsData}
                keyExtractor={item => item.id}
                ListHeaderComponent={<PostCard item={post} showCommunityInfo={true} />}
                renderItem={({ item }) => <CommentCard item={item} />}
                contentContainerStyle={{ paddingBottom: 20 }}
                showsVerticalScrollIndicator={false}
            />

            {/* Comment Input Bar */}
            <View style={[styles.inputContainer, { paddingBottom: Math.max(insets.bottom, 10) }]}>
                <TextInput
                    placeholder="Add a comment..."
                    placeholderTextColor={Colors.textSecondary}
                    style={styles.textInput}
                    value={commentText}
                    onChangeText={setCommentText}
                    multiline
                />
                <TouchableOpacity 
                    style={[styles.sendButton, !commentText.trim() && styles.sendButtonDisabled]}
                    disabled={!commentText.trim()}
                >
                    <Ionicons name="arrow-up" size={20} color={Colors.background} />
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingBottom: 15,
        backgroundColor: Colors.background,
        borderBottomWidth: 1,
        borderBottomColor: Colors.surface,
    },
    backButton: { padding: 5 },
    headerTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 18, color: Colors.text },

    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: 15,
        paddingTop: 12,
        backgroundColor: Colors.surface, // Slightly lighter background for input area
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.05)',
    },
    textInput: {
        flex: 1,
        backgroundColor: Colors.background,
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingTop: 10,
        paddingBottom: 10,
        minHeight: 40,
        maxHeight: 100,
        fontFamily: 'Poppins_400Regular',
        color: Colors.text,
        marginRight: 10,
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.secondary,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 2, // Align with single line text
    },
    sendButtonDisabled: {
        backgroundColor: Colors.textSecondary,
        opacity: 0.5,
    }
});

export default PostDetailScreen;