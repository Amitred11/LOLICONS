import React, { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Share, Clipboard } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useCommunity } from '@context/main/CommunityContext';
import { useAlert } from '@context/other/AlertContext'; // Assuming path
import PostCard from '../PostCard';
import OptionsModal from '../OptionsModal';
import { Colors } from '@config/Colors';
import { Ionicons } from '@expo/vector-icons';

const DiscussionFeed = () => {
    const navigation = useNavigation();
    const { posts, isLoadingPosts, togglePostLike } = useCommunity();
    const { showAlert, showToast } = useAlert();

    // --- State for the three-dots options menu ---
    const [optionsModalVisible, setOptionsModalVisible] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);

    // --- Handlers for Post Interactions ---
    const handleUserPress = (user) => {
        navigation.navigate('FriendProfile', { userId: user.id || 'mock_id', username: user.name || user.user });
    };

    const handlePostPress = (post) => {
        navigation.navigate('Thread', { post: post });
    };

    const handleShare = async (post) => {
        try {
            await Share.share({ message: `Check out this post from ${post.user}: "${post.content}"` });
        } catch (error) {
            showToast(error.message, 'error');
        }
    };

    const handleOpenOptions = (post) => {
        setSelectedPost(post);
        setOptionsModalVisible(true);
    };

    // --- Dynamic Menu Options ---
    const menuOptions = selectedPost ? [
        { label: 'Share Post', icon: 'share-outline', onPress: () => handleShare(selectedPost) },
        { label: 'Copy Text', icon: 'copy-outline', onPress: () => { Clipboard.setString(selectedPost.content || ""); showToast("Text copied.", 'success'); } },
        { label: 'Block User', icon: 'person-remove-outline', onPress: () => showToast(`You blocked ${selectedPost.user}.`, 'info') },
        { label: 'Report Post', icon: 'flag-outline', color: '#EF4444', onPress: () => showAlert({ title: "Reported", message: "This post has been flagged.", type: 'success' }) }
    ] : [];

    if (isLoadingPosts && posts.length === 0) {
        return <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />;
    }

    if (posts.length === 0) {
        return (
             <View style={styles.emptyContainer}>
                <Ionicons name="chatbubbles-outline" size={50} color={Colors.primary} />
                <Text style={styles.emptyTitle}>It's quiet in here...</Text>
                <Text style={styles.emptyText}>Be the first to start a discussion!</Text>
            </View>
        );
    }

    return (
        <View>
            {posts.map(item => (
                <PostCard
                    key={item.id}
                    item={item}
                    onLike={() => togglePostLike(item.id)}
                    onUserPress={() => handleUserPress({ name: item.user, id: item.userId })}
                    onPress={() => handlePostPress(item)}
                    onReply={() => handlePostPress(item)}
                    onShare={() => handleShare(item)}
                    onOptions={() => handleOpenOptions(item)}
                />
            ))}
            <OptionsModal
                visible={optionsModalVisible}
                onClose={() => setOptionsModalVisible(false)}
                title="Post Options"
                options={menuOptions}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    emptyContainer: { alignItems: 'center', justifyContent: 'center', padding: 40, marginTop: 20 },
    emptyTitle: { color: Colors.text, fontSize: 18, fontWeight: 'bold', marginBottom: 8, marginTop: 15 },
    emptyText: { color: Colors.textSecondary, fontSize: 14, textAlign: 'center' },
});

export default DiscussionFeed;