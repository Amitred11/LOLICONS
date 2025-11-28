// screens/social/FriendsScreen.js

import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, SectionList, Alert, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../../constants/Colors';
import { friendsPresence, groupsData } from '../../../constants/mockData';
import { useNavigation } from '@react-navigation/native';
import { ScreenHeader, SearchInput, FriendListItem, FriendRequestCard, SectionHeader } from './components/ChatUI';
import Animated, { FadeIn, FadeInDown, FadeOut, FadeOutDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

// A more visually engaging button to add friends, placed in the list header.
const AddFriendButton = ({ onPress }) => (
    <Animated.View style={styles.headerActionContainer} entering={FadeIn.duration(300)} exiting={FadeOut.duration(300)}>
        <TouchableOpacity style={styles.addFriendButton} onPress={onPress}>
            <View style={styles.addFriendIconContainer}>
                <Ionicons name="person-add" size={24} color={'#fff'} />
            </View>
            <View>
                <Text style={styles.addFriendButtonText}>Add New Friends</Text>
                <Text style={styles.addFriendButtonSubtext}>Connect with people you know</Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color={Colors.textSecondary} style={{ marginLeft: 'auto' }} />
        </TouchableOpacity>
    </Animated.View>
);

// An enhanced empty state component with an optional icon for better user feedback.
const EmptyListComponent = ({ message, subMessage, iconName }) => (
    <View style={styles.emptyContainer}>
        {iconName && <Ionicons name={iconName} size={48} color={Colors.surface} style={{ marginBottom: 16 }} />}
        <Text style={styles.emptyText}>{message}</Text>
        {subMessage && <Text style={styles.emptySubtext}>{subMessage}</Text>}
    </View>
);

const FriendsScreen = ({ route }) => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const [searchQuery, setSearchQuery] = useState('');

    const [friendRequests, setFriendRequests] = useState(friendsPresence.slice(3, 5).map(f => ({ ...f, mutualFriends: Math.floor(Math.random() * 10) + 2 })));
    const [onlineFriends, setOnlineFriends] = useState(friendsPresence.slice(0, 3));

    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedFriends, setSelectedFriends] = useState([]);

    // Effect to handle incoming new friend requests from other screens
    useEffect(() => {
        if (route.params?.newRequest) {
            const newRequest = route.params.newRequest;
            const isAlreadyFriend = onlineFriends.some(f => f.id === newRequest.id);
            const hasPendingRequest = friendRequests.some(f => f.id === newRequest.id);

            if (!isAlreadyFriend && !hasPendingRequest) {
                setFriendRequests(prev => [{ ...newRequest, mutualFriends: Math.floor(Math.random() * 5) }, ...prev]);
                Alert.alert("Request Sent!", `Your friend request to ${newRequest.name} has been sent.`);
            } else {
                Alert.alert("Already Connected", `You are already friends with ${newRequest.name} or have a pending request.`);
            }
            navigation.setParams({ newRequest: null }); // Clear the param
        }
    }, [route.params?.newRequest]);

    // Toggles group creation selection mode
    const toggleSelectionMode = () => {
        setIsSelectionMode(prev => !prev);
        setSelectedFriends([]); // Reset selection on toggle
    };

    // Handles selecting/deselecting a friend in selection mode
    const handleFriendSelect = (friendId) => {
        setSelectedFriends(prev =>
            prev.includes(friendId)
                ? prev.filter(id => id !== friendId)
                : [...prev, friendId]
        );
    };

    // Handles the final group creation action
    const handleCreateGroup = () => {
        if (selectedFriends.length < 2) {
            Alert.alert("Select More Friends", "You need to select at least 2 friends to create a group chat.");
            return;
        }
        const selectedFriendNames = onlineFriends.filter(f => selectedFriends.includes(f.id)).map(f => f.name).join(', ');

        Alert.prompt("New Group Chat", `Creating a group with:\n${selectedFriendNames}`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Create", onPress: (groupName) => {
                        if (!groupName || groupName.trim().length === 0) { Alert.alert("Invalid Name", "Please enter a name for your group."); return; }
                        navigation.navigate('Chat', { channelName: groupName, avatar: groupsData[0].avatar, isGroupChat: true });
                        toggleSelectionMode(); // Exit selection mode
                    }
                },
            ], 'plain-text', 'My Awesome Group');
    };

    // Handlers for friend requests
    const handleAcceptRequest = (friendId) => {
        const acceptedFriend = friendRequests.find(req => req.id === friendId);
        if (acceptedFriend) {
            setFriendRequests(prev => prev.filter(req => req.id !== friendId));
            setOnlineFriends(prev => [{ ...acceptedFriend, activityType: 'online' }, ...prev]);
        }
    };

    const handleDeclineRequest = (friendId) => {
        setFriendRequests(prev => prev.filter(req => req.id !== friendId));
    };

    const handleNavigateToAddFriend = () => {
        navigation.navigate('AddFriend');
    };

    // Handler to remove a friend with a confirmation dialog
    const handleRemoveFriend = (friendIdToRemove) => {
        const friendToRemove = onlineFriends.find(f => f.id === friendIdToRemove);
        if (!friendToRemove) return;
        Alert.alert("Remove Friend", `Are you sure you want to remove ${friendToRemove.name}?`,
            [
                { text: "Cancel", style: "cancel" },
                { text: "Remove", style: "destructive", onPress: () => setOnlineFriends(prev => prev.filter(f => f.id !== friendIdToRemove)) }
            ]);
    };

    // Memoize sections to prevent re-computation on every render
    const sections = useMemo(() => {
        // Use a placeholder item for empty sections to ensure the section header still renders
        const onlineSectionData = onlineFriends.length > 0 ? onlineFriends : [{ id: 'empty-friends', empty: true }];
        const requestSectionData = friendRequests.length > 0 ? friendRequests : [{ id: 'empty-requests', empty: true }];

        return [
            { type: 'requests', title: `Friend Requests - ${friendRequests.length}`, data: requestSectionData },
            { type: 'online', title: `All Friends - ${onlineFriends.length}`, data: onlineSectionData },
        ];
    }, [friendRequests, onlineFriends]);

    // Memoize filtered sections for search functionality
    const filteredSections = useMemo(() => {
        if (!searchQuery) return sections;
        return sections.map(section => ({ ...section, data: section.data[0]?.empty ? section.data : section.data.filter(item => item.name?.toLowerCase().includes(searchQuery.toLowerCase())) }))
            .filter(section => section.data.length > 0 && !section.data[0]?.empty);
    }, [searchQuery, sections]);

    // Unified renderItem function for the SectionList for better readability
    const renderItem = ({ item, section }) => {
        if (item.empty) {
            return section.type === 'requests'
                ? <EmptyListComponent message="No pending requests" iconName="mail-unread-outline" />
                : <EmptyListComponent message="It's quiet in here..." subMessage="Add some friends to get started!" iconName="people-circle-outline" />;
        }
        if (section.type === 'requests') {
            return <FriendRequestCard item={item} onAccept={handleAcceptRequest} onDecline={handleDeclineRequest} />;
        }
        if (section.type === 'online') {
            return <FriendListItem item={item} isSelectionMode={isSelectionMode} isSelected={selectedFriends.includes(item.id)} onSelect={handleFriendSelect} onRemoveFriend={handleRemoveFriend} />;
        }
        return null;
    };

    return (
        <View style={styles.container}>
            <View style={{ paddingTop: insets.top }}>
                <ScreenHeader
                    title={isSelectionMode ? `Selected (${selectedFriends.length})` : "Friends"}
                    onBack={isSelectionMode ? toggleSelectionMode : () => navigation.goBack()}
                    backButtonIcon={isSelectionMode ? 'close' : 'arrow-back'}
                    rightButtonIcon={isSelectionMode ? null : "people-outline"}
                    onRightButtonPress={isSelectionMode ? null : toggleSelectionMode}
                />
            </View>
            <SectionList
                sections={filteredSections}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                renderSectionHeader={({ section }) => <SectionHeader title={section.title} />}
                ListHeaderComponent={
                    <>
                        <SearchInput value={searchQuery} onChangeText={setSearchQuery} placeholder="Find Friends" />
                        {!isSelectionMode && <AddFriendButton onPress={handleNavigateToAddFriend} />}
                    </>
                }
                ListEmptyComponent={ <EmptyListComponent message="No results found" subMessage={`No friends match "${searchQuery}"`} iconName="search-outline" /> }
                contentContainerStyle={{ paddingBottom: isSelectionMode ? 100 : insets.bottom }}
                stickySectionHeadersEnabled={false}
                ItemSeparatorComponent={({ leadingItem }) => !leadingItem.empty ? <View style={styles.divider} /> : null}
            />
            {isSelectionMode && selectedFriends.length > 1 && (
                <Animated.View style={[styles.createGroupContainer, { paddingBottom: insets.bottom + 10 }]} entering={FadeInDown} exiting={FadeOutDown}>
                    <TouchableOpacity style={styles.createGroupButton} onPress={handleCreateGroup}>
                        <Text style={styles.createGroupButtonText}>Create Group Chat</Text>
                    </TouchableOpacity>
                </Animated.View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.darkBackground },
    divider: { height: 1, backgroundColor: Colors.surface, marginLeft: 75, }, // Aligned with the text next to avatar
    headerActionContainer: { paddingHorizontal: 15, paddingTop: 15, paddingBottom: 5, },
    addFriendButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, padding: 12, borderRadius: 12, },
    addFriendIconContainer: { width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center', marginRight: 15, },
    addFriendButtonText: { fontFamily: 'Poppins_500Medium', color: Colors.text, fontSize: 16, },
    addFriendButtonSubtext: { fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, fontSize: 13, },
    createGroupContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, backgroundColor: '#1C1C1E', borderTopColor: Colors.surface, borderTopWidth: 1, },
    createGroupButton: { backgroundColor: Colors.primary, padding: 15, borderRadius: 12, alignItems: 'center', },
    createGroupButtonText: { fontFamily: 'Poppins_600SemiBold', color: '#fff', fontSize: 16, },
    emptyContainer: { paddingVertical: 40, paddingHorizontal: 30, alignItems: 'center', justifyContent: 'center', },
    emptyText: { fontFamily: 'Poppins_600SemiBold', color: Colors.text, fontSize: 17, textAlign: 'center', },
    emptySubtext: { fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, fontSize: 14, marginTop: 4, textAlign: 'center', },
});

export default FriendsScreen;