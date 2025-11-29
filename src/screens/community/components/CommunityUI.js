import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ImageBackground, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@config/Colors';

// --- Search Bar ---
export const SearchInput = ({ value, onChangeText, placeholder }) => (
    <View style={styles.searchContainer}>
      <Ionicons name="search" size={20} color={Colors.textSecondary} style={styles.searchIcon} />
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={Colors.textSecondary}
        style={styles.searchInput}
        value={value}
        onChangeText={onChangeText}
      />
    </View>
);

// --- Post Card (Feed Item) ---
export const PostCard = ({ item, index, showCommunityInfo = true }) => {
    const navigation = useNavigation();
    const [isUpvoted, setIsUpvoted] = React.useState(false);
    const [isBookmarked, setIsBookmarked] = React.useState(false);

    // Navigation Handlers
    const goToCommunity = () => navigation.navigate('CommunityDetail', { 
        communityId: item.communityId, 
        communityName: item.community, 
        bannerImage: item.bannerImage 
    });
    
    const goToDetail = () => navigation.navigate('PostDetail', { postId: item.id });

    return (
        <Animated.View style={styles.postCard} entering={FadeIn.duration(400).delay(index * 50)}>
            {showCommunityInfo && (
                <View style={styles.postHeader}>
                    <TouchableOpacity onPress={goToCommunity} style={styles.communityInfo}>
                        <Image source={typeof item.avatar === 'string' ? { uri: item.avatar } : item.avatar} style={styles.postAvatar} />
                        <View>
                            <Text style={styles.postCommunity}>{item.community}</Text>
                            <Text style={styles.postAuthor}>Posted by {item.author} • 2h ago</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.optionsButton}><Ionicons name="ellipsis-horizontal" size={24} color={Colors.textSecondary} /></TouchableOpacity>
                </View>
            )}
            
            <TouchableOpacity activeOpacity={0.9} onPress={goToDetail}>
                <Text style={[styles.postTitle, !showCommunityInfo && {marginTop: 0}]}>{item.title}</Text>
                {item.image && (
                    <Image source={typeof item.image === 'string' ? { uri: item.image } : item.image} style={styles.postImage} />
                )}
                <Text style={styles.postSnippet} numberOfLines={showCommunityInfo ? 3 : undefined}>{item.snippet}</Text>
            </TouchableOpacity>

            <View style={styles.postFooter}>
                <TouchableOpacity style={styles.postAction} onPress={() => setIsUpvoted(!isUpvoted)}>
                    <Ionicons name={isUpvoted ? "arrow-up-circle" : "arrow-up-circle-outline"} size={24} color={isUpvoted ? Colors.primary : Colors.textSecondary} />
                    <Text style={[styles.postActionText, isUpvoted && {color: Colors.primary}]}>{item.upvotes + (isUpvoted ? 1 : 0)}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.postAction} onPress={goToDetail}>
                    <Ionicons name="chatbubble-outline" size={22} color={Colors.textSecondary} />
                    <Text style={styles.postActionText}>{item.comments}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.postAction} onPress={() => setIsBookmarked(!isBookmarked)}>
                    <Ionicons name={isBookmarked ? "bookmark" : "bookmark-outline"} size={22} color={isBookmarked ? Colors.primary : Colors.textSecondary} />
                </TouchableOpacity>
            </View>
        </Animated.View>
    );
};

// --- Comment Card ---
export const CommentCard = ({ item }) => (
    <View style={styles.commentContainer}>
        <Image source={{ uri: item.avatar }} style={styles.commentAvatar} />
        <View style={styles.commentBody}>
            <Text style={styles.commentAuthor}>{item.author} <Text style={styles.commentTimestamp}>• 2h ago</Text></Text>
            <Text style={styles.commentText}>{item.text}</Text>
            <View style={styles.commentActions}>
                <TouchableOpacity style={styles.postAction}><Ionicons name="arrow-up-circle-outline" size={20} color={Colors.textSecondary} /></TouchableOpacity>
                <Text style={[styles.postActionText, {fontSize: 12}]}>{item.upvotes}</Text>
                <TouchableOpacity style={[styles.postAction, {marginLeft: 15}]}><Ionicons name="chatbubble-outline" size={18} color={Colors.textSecondary} /></TouchableOpacity>
            </View>
        </View>
    </View>
);

// --- Community Detail Header ---
export const CommunityHeader = ({ communityInfo, onBack }) => {
    const [isJoined, setIsJoined] = React.useState(true);
    return (
        <ImageBackground source={{ uri: communityInfo.bannerImage || 'https://via.placeholder.com/500' }} style={styles.banner}>
            <LinearGradient colors={['rgba(0,0,0,0.6)', 'transparent', 'rgba(0,0,0,0.9)']} style={styles.bannerOverlay}/>
            <TouchableOpacity onPress={onBack} style={styles.backButton}><Ionicons name="arrow-back" size={24} color="#fff" /></TouchableOpacity>
            <View style={styles.communityDetails}>
                <Image source={{ uri: `https://i.pravatar.cc/150?u=${communityInfo.communityId}` }} style={styles.communityAvatar} />
                <Text style={styles.communityName}>{communityInfo.communityName}</Text>
                <Text style={styles.communityMembers}>1.2k Members • 150 Online</Text>
            </View>
            <TouchableOpacity onPress={() => setIsJoined(p => !p)} style={[styles.joinButton, isJoined && styles.joinedButton]}>
                <Text style={[styles.joinButtonText, isJoined && styles.joinedButtonText]}>{isJoined ? 'Joined' : 'Join'}</Text>
            </TouchableOpacity>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: 12, marginHorizontal: 15, marginVertical: 10, paddingHorizontal: 15 },
    searchIcon: { marginRight: 10 },
    searchInput: { flex: 1, height: 44, fontFamily: 'Poppins_400Regular', fontSize: 15, color: Colors.text },
    postCard: { backgroundColor: Colors.surface, marginBottom: 8, paddingVertical: 15 },
    postHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15 },
    communityInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    postAvatar: { width: 40, height: 40, borderRadius: 12, marginRight: 12 },
    postCommunity: { fontFamily: 'Poppins_600SemiBold', color: Colors.text, fontSize: 15 },
    postAuthor: { fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, fontSize: 13 },
    postTitle: { fontFamily: 'Poppins_600SemiBold', color: Colors.text, fontSize: 18, marginTop: 15, marginBottom: 10, paddingHorizontal: 15 },
    postImage: { width: '100%', height: 250, marginBottom: 10, resizeMode: 'cover' },
    postSnippet: { fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, fontSize: 15, lineHeight: 24, paddingHorizontal: 15 },
    postFooter: { flexDirection: 'row', alignItems: 'center', marginTop: 15, paddingHorizontal: 15 },
    postAction: { flexDirection: 'row', alignItems: 'center', marginRight: 25 },
    postActionText: { fontFamily: 'Poppins_500Medium', color: Colors.textSecondary, fontSize: 14, marginLeft: 8 },
    banner: { height: 280, justifyContent: 'center', alignItems: 'center' },
    bannerOverlay: { ...StyleSheet.absoluteFillObject },
    backButton: { position: 'absolute', top: 50, left: 20, backgroundColor: 'rgba(0,0,0,0.4)', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
    communityDetails: { alignItems: 'center', paddingTop: 40 },
    communityAvatar: { width: 80, height: 80, borderRadius: 40, borderWidth: 3, borderColor: '#fff' },
    communityName: { fontFamily: 'Poppins_700Bold', color: '#fff', fontSize: 24, marginTop: 10 },
    communityMembers: { fontFamily: 'Poppins_400Regular', color: '#ccc', fontSize: 14 },
    joinButton: { position: 'absolute', bottom: -20, backgroundColor: Colors.primary, paddingVertical: 10, paddingHorizontal: 30, borderRadius: 25 },
    joinedButton: { backgroundColor: '#fff' },
    joinButtonText: { fontFamily: 'Poppins_600SemiBold', color: '#fff' },
    joinedButtonText: { color: Colors.darkBackground },
    commentContainer: { flexDirection: 'row', padding: 15, borderBottomWidth: 1, borderBottomColor: Colors.surface },
    commentAvatar: { width: 36, height: 36, borderRadius: 18, marginRight: 12 },
    commentBody: { flex: 1 },
    commentAuthor: { fontFamily: 'Poppins_600SemiBold', color: Colors.text, fontSize: 14 },
    commentTimestamp: { fontFamily: 'Poppins_400Regular', color: Colors.textSecondary },
    commentText: { fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, fontSize: 15, lineHeight: 22, marginTop: 4 },
    commentActions: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
});