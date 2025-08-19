// screens/CommunityScreen.js

// Import necessary modules from React, React Native, and third-party libraries.
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image, FlatList, Dimensions } from 'react-native';
import { Colors } from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withDelay, withSpring, useAnimatedScrollHandler, interpolate, Extrapolate } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { communityPostsData } from '../constants/mockData';
import { useNavigation } from '@react-navigation/native';

// Get screen width for layout purposes.
const { width } = Dimensions.get('window');
// Constants for the collapsible header animation.
const HEADER_HEIGHT = 120;
const COLLAPSED_HEADER_HEIGHT = 60;
const SCROLL_DISTANCE = HEADER_HEIGHT - COLLAPSED_HEADER_HEIGHT;

// Create an animated version of FlatList for scroll-based animations.
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

/**
 * A component that displays a single community post in a card format.
 * @param {object} props - The component props.
 * @param {object} props.item - The post data object.
 * @param {number} props.index - The index of the post in the list, used for staggered animations.
 */
const PostCard = ({ item, index }) => {
    // Shared values for the entry animation (fade in and slide up).
    const opacity = useSharedValue(0);
    const translateY = useSharedValue(20);

    // Trigger the entry animation when the component mounts.
    React.useEffect(() => {
        opacity.value = withDelay(index * 100, withSpring(1));
        translateY.value = withDelay(index * 100, withSpring(0));
    }, []);

    // Create the animated style object from the shared values.
    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ translateY: translateY.value }],
    }));

    return (
        <Animated.View style={[styles.postCard, animatedStyle]}>
            <TouchableOpacity onPress={() => Alert.alert("View Post", item.title)}>
                {/* Post header with avatar and author info */}
                <View style={styles.postHeader}>
                    <Image source={typeof item.avatar === 'string' ? { uri: item.avatar } : item.avatar} style={styles.postAvatar} />
                    <View>
                        <Text style={styles.postCommunity}>{item.community}</Text>
                        <Text style={styles.postAuthor}>Posted by {item.author}</Text>
                    </View>
                </View>
                {/* Post content */}
                <Text style={styles.postTitle}>{item.title}</Text>
                {item.image && <Image source={item.image} style={styles.postImage} />}
                <Text style={styles.postSnippet} numberOfLines={4}>{item.snippet}</Text>
                {/* Post footer with action buttons (upvotes, comments, share) */}
                <View style={styles.postFooter}>
                    <View style={styles.postAction}>
                        <Ionicons name="arrow-up-outline" size={20} color={Colors.textSecondary} />
                        <Text style={styles.postActionText}>{item.upvotes}</Text>
                    </View>
                    <View style={styles.postAction}>
                        <Ionicons name="chatbubble-outline" size={20} color={Colors.textSecondary} />
                        <Text style={styles.postActionText}>{item.comments}</Text>
                    </View>
                    <View style={styles.postAction}>
                        <Ionicons name="share-social-outline" size={20} color={Colors.textSecondary} />
                        <Text style={styles.postActionText}>Share</Text>
                    </View>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
};

/**
 * The main screen for the Community tab, featuring a collapsible header and a feed of posts.
 */
const CommunityScreen = () => {
    const insets = useSafeAreaInsets();
    // A shared value to track the scroll position of the list.
    const scrollY = useSharedValue(0);
    const navigation = useNavigation();

    // An animated scroll handler that connects the FlatList's scroll events to the `scrollY` shared value.
    const scrollHandler = useAnimatedScrollHandler((event) => { scrollY.value = event.contentOffset.y; });

    // Animated style to interpolate the header's height based on scroll position.
    const animatedHeaderStyle = useAnimatedStyle(() => ({
        height: interpolate(scrollY.value, [0, SCROLL_DISTANCE], [HEADER_HEIGHT + insets.top, COLLAPSED_HEADER_HEIGHT + insets.top], Extrapolate.CLAMP),
    }));
    // Animated style to fade out the large title as the user scrolls up.
    const animatedLargeTitleStyle = useAnimatedStyle(() => ({
        opacity: interpolate(scrollY.value, [0, SCROLL_DISTANCE / 2], [1, 0], Extrapolate.CLAMP),
    }));
    // Animated style to fade in the small, centered title as the header collapses.
    const animatedSmallTitleStyle = useAnimatedStyle(() => ({
        opacity: interpolate(scrollY.value, [SCROLL_DISTANCE / 2, SCROLL_DISTANCE], [0, 1], Extrapolate.CLAMP),
    }));
    
    return (
        <View style={styles.container}>
            {/* The animated header that sits on top of the list */}
            <Animated.View style={[styles.header, animatedHeaderStyle]}>
                <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
                <View style={styles.headerBorder} />
                <View style={[styles.headerContent, { paddingTop: insets.top }]}>
                    {/* The large title, visible when scrolled to the top */}
                    <Animated.View style={[styles.titleContainer, animatedLargeTitleStyle]}>
                        <Text style={styles.largeTitle}>Community</Text>
                    </Animated.View>
                    {/* The small title, visible when the header is collapsed */}
                    <Animated.View style={[styles.smallTitleContainer, animatedSmallTitleStyle]}>
                        <Text style={styles.smallTitle}>Community</Text>
                    </Animated.View>
                    {/* Action buttons on the right side of the header */}
                    <View style={styles.headerActions}>
                        <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('ChatList')}>
                            <Ionicons name="chatbubbles-outline" size={20} color={Colors.text} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionButton} onPress={() => Alert.alert("Create Post")}>
                            <Ionicons name="add" size={24} color={Colors.text} />
                        </TouchableOpacity>
                    </View>
                </View>
            </Animated.View>

            {/* The list of community posts */}
            <AnimatedFlatList
                data={communityPostsData}
                keyExtractor={(item) => item.id}
                renderItem={({ item, index }) => <PostCard item={item} index={index} />}
                onScroll={scrollHandler} // Connect the scroll handler
                scrollEventThrottle={16} // Optimize scroll event frequency for smooth animations
                contentContainerStyle={{ 
                    paddingTop: HEADER_HEIGHT + insets.top, // Add padding to avoid content being hidden behind the absolute-positioned header
                    paddingBottom: insets.bottom + 40 
                }}
            />
        </View>
    );
};

// --- Stylesheet ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1 },
  headerBorder: { position: 'absolute', bottom: 0, left: 0, right: 0, height: StyleSheet.hairlineWidth, backgroundColor: Colors.surface + '80' },
  headerContent: { flex: 1, justifyContent: 'flex-end', paddingHorizontal: 20 },
  titleContainer: { position: 'absolute', bottom: 15, left: 20 },
  largeTitle: { fontSize: 34, fontFamily: 'Poppins_700Bold', color: Colors.text },
  smallTitleContainer: { position: 'absolute', left: 0, right: 0, bottom: 0, height: COLLAPSED_HEADER_HEIGHT, alignItems: 'center', justifyContent: 'center' },
  smallTitle: { fontSize: 18, fontFamily: 'Poppins_600SemiBold', color: Colors.text },
  headerActions: { position: 'absolute', right: 20, bottom: 12, flexDirection: 'row' },
  actionButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.surface + '90', alignItems: 'center', justifyContent: 'center', marginLeft: 10 },
  postCard: { backgroundColor: Colors.surface, borderRadius: 16, marginHorizontal: 15, marginBottom: 15, padding: 15 },
  postHeader: { flexDirection: 'row', alignItems: 'center' },
  postAvatar: { width: 40, height: 40, borderRadius: 20 },
  postCommunity: { fontFamily: 'Poppins_600SemiBold', color: Colors.text, fontSize: 14, marginLeft: 10 },
  postAuthor: { fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, fontSize: 12, marginLeft: 10 },
  postTitle: { fontFamily: 'Poppins_700Bold', color: Colors.text, fontSize: 18, marginVertical: 10 },
  postImage: { width: '100%', height: 200, borderRadius: 12, marginBottom: 10 },
  postSnippet: { fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, fontSize: 15, lineHeight: 22 },
  postFooter: { flexDirection: 'row', alignItems: 'center', marginTop: 15, paddingTop: 10, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: Colors.background },
  postAction: { flexDirection: 'row', alignItems: 'center', marginRight: 20 },
  postActionText: { fontFamily: 'Poppins_500Medium', color: Colors.textSecondary, fontSize: 14, marginLeft: 6 },
});

export default CommunityScreen;