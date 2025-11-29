import React, { useState, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Animated, { useSharedValue, useAnimatedStyle, useAnimatedScrollHandler, interpolate, Extrapolate } from 'react-native-reanimated';

import { Colors } from '../../../constants/Colors';
import { communityPostsData, userPresence } from '../../../constants/mockData';
import HomeFeedScreen from '../feeds/HomeFeedScreen';

const HEADER_HEIGHT = 100;

const CommunityScreen = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const scrollY = useSharedValue(0);
    
    const [posts, setPosts] = useState(communityPostsData);
    const [searchQuery, setSearchQuery] = useState('');

    const handleAddPost = (newPostData) => {
        const newPost = {
            id: `post_${Date.now()}`,
            author: userPresence?.name || "User",
            avatar: userPresence?.avatar || "https://via.placeholder.com/50",
            community: 'General Discussion',
            communityId: 'c1',
            upvotes: 0,
            comments: 0,
            ...newPostData,
        };
        setPosts(prevPosts => [newPost, ...prevPosts]);
    };

    const filteredPosts = useMemo(() => 
        posts.filter(post => 
            post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
            post.snippet.toLowerCase().includes(searchQuery.toLowerCase())
        )
    , [posts, searchQuery]);

    const scrollHandler = useAnimatedScrollHandler((event) => { scrollY.value = event.contentOffset.y; });

    const animatedHeaderStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: interpolate(scrollY.value, [0, HEADER_HEIGHT], [0, -HEADER_HEIGHT], Extrapolate.CLAMP) }],
        opacity: interpolate(scrollY.value, [0, HEADER_HEIGHT / 2], [1, 0], Extrapolate.CLAMP),
    }));

    return (
        <View style={styles.container}>
            <HomeFeedScreen 
                posts={filteredPosts} 
                scrollHandler={scrollHandler} 
                headerHeight={HEADER_HEIGHT + insets.top} 
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
            />

            {/* Collapsible Header */}
            <Animated.View style={[styles.header, { height: HEADER_HEIGHT + insets.top, paddingTop: insets.top }, animatedHeaderStyle]}>
                <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
                <View style={styles.headerContent}>
                    <Text style={styles.largeTitle}>Community</Text>
                    <TouchableOpacity 
                        style={styles.headerButton}
                        onPress={() => navigation.navigate('CreatePost', { onPostCreated: handleAddPost })}
                    >
                        <Ionicons name="create-outline" size={26} color={Colors.primary} />
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.darkBackground },
    header: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1 },
    headerContent: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 10 },
    largeTitle: { fontSize: 34, fontFamily: 'Poppins_700Bold', color: Colors.text },
    headerButton: { padding: 10, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.1)' }
});

export default CommunityScreen;