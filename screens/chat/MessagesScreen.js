// Import necessary modules from React, React Native, and third-party libraries.
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { directMessagesData } from '../../constants/mockData';
import { useNavigation } from '@react-navigation/native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';

// Create an animated version of FlatList for scroll animations.
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

/**
 * A helper function to format a date into a relative time string (e.g., "5m", "2h", "1d").
 * @param {Date} date - The date object to format.
 * @returns {string} The formatted relative time string.
 */
const formatRelativeTime = (date) => {
    const now = new Date();
    const diffSeconds = Math.round((now - date) / 1000);
    if (diffSeconds < 60) return `now`;
    const diffMinutes = Math.round(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes}m`;
    const diffHours = Math.round(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h`;
    const diffDays = Math.round(diffHours / 24);
    return `${diffDays}d`;
};

/**
 * A component that renders a single item in the chat list.
 * @param {object} props - The component props.
 * @param {object} props.item - The chat conversation data object.
 */
const ChatListItem = ({ item }) => {
    const navigation = useNavigation();
    // Shared value for a press-in/out scale animation.
    const scale = useSharedValue(1);
    const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
    
    return (
        <Animated.View style={[styles.chatItemContainer, animatedStyle]}>
            <TouchableOpacity 
                style={styles.chatItem}
                onPressIn={() => scale.value = withSpring(0.97)}
                onPressOut={() => scale.value = withSpring(1)}
                onPress={() => navigation.navigate('Chat', { channelName: item.friend.name })}
            >
                <BlurView intensity={20} tint="dark" style={styles.cardBlur}/>
                <Image source={{ uri: item.friend.avatar }} style={styles.chatAvatar} />
                <View style={styles.chatTextContainer}>
                    <View style={styles.chatHeader}>
                        <Text style={styles.chatName}>{item.friend.name}</Text>
                        <Text style={styles.chatTimestamp}>{formatRelativeTime(item.timestamp)}</Text>
                    </View>
                    <Text style={styles.chatLastMessage} numberOfLines={1}>{item.lastMessage}</Text>
                </View>
                {/* Conditionally render the unread messages badge. */}
                {item.unreadCount > 0 && (
                    <View style={styles.unreadBadge}>
                        <Text style={styles.unreadText}>{item.unreadCount}</Text>
                    </View>
                )}
            </TouchableOpacity>
        </Animated.View>
    );
};

/**
 * The main screen component for the "Messages" tab. Displays a list of direct messages.
 * This component is designed to work with a collapsible header.
 * @param {object} props - The component props.
 * @param {function} props.scrollHandler - The animated scroll handler from the parent screen.
 * @param {number} props.headerHeight - The height of the parent's header for initial padding.
 */
const MessagesScreen = ({ scrollHandler, headerHeight }) => {
    const insets = useSafeAreaInsets();
    
    return (
        <AnimatedFlatList
            data={directMessagesData}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <ChatListItem item={item} />}
            onScroll={scrollHandler} // Connect the list's scroll events to the parent's animated value.
            scrollEventThrottle={16} // Optimize scroll event frequency for animations.
            contentContainerStyle={{ 
                paddingTop: headerHeight + 15, // Add padding to account for the header and some extra space.
                paddingBottom: insets.bottom + 40, // Add padding for the safe area and tab bar.
                paddingHorizontal: 15 
            }}
            ItemSeparatorComponent={() => <View style={{height: 10}} />}
        />
    );
};

// Styles for the component.
const styles = StyleSheet.create({
    chatItemContainer: { borderRadius: 20, overflow: 'hidden' },
    chatItem: { flexDirection: 'row', alignItems: 'center', padding: 10 },
    cardBlur: { ...StyleSheet.absoluteFillObject },
    chatAvatar: { width: 50, height: 50, borderRadius: 25 },
    chatTextContainer: { flex: 1, marginLeft: 15 },
    chatHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    chatName: { fontFamily: 'Poppins_600SemiBold', color: Colors.text, fontSize: 16 },
    chatTimestamp: { fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, fontSize: 13 },
    chatLastMessage: { fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, fontSize: 15, marginTop: 2 },
    unreadBadge: { backgroundColor: Colors.danger, borderRadius: 10, minWidth: 20, height: 20, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6, marginLeft: 10 },
    unreadText: { color: Colors.text, fontFamily: 'Poppins_600SemiBold', fontSize: 12 },
});


export default MessagesScreen;