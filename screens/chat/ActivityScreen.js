// Import necessary modules from React, React Native, and third-party libraries.
import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList, Alert, ImageBackground } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
// Import mock data for demonstration purposes.
import { gamesData, comicsData, friendsPresence, userPresence } from '../../constants/mockData';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Create an animated version of FlatList to be able to apply animated props.
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

/**
 * A card component that displays the current user's activity status ("Now Playing").
 * @param {object} props - The component props.
 * @param {object} props.presence - The user's presence object from mock data.
 */
const NowPlayingCard = ({ presence }) => {
    const navigation = useNavigation();
    // Find the corresponding game or comic data based on the user's activity.
    const data = presence.activityType === 'game' 
        ? gamesData.find(g => g.id === presence.activityId) 
        : comicsData.find(c => c.id === presence.activityId);

    // Shared value for a press-in/out scale animation.
    const scale = useSharedValue(1);
    const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
    
    // If the user is idle (no activity data found), render a special Idle card.
    if (!data) {
        return (
            <View style={styles.nowPlayingCard}>
                {/* A blurred background for a glassy effect. */}
                <BlurView intensity={20} tint="dark" style={styles.cardBlur}/>
                <Ionicons name="moon-outline" size={32} color={Colors.textSecondary} style={{marginRight: 15}}/>
                <View>
                    <Text style={styles.nowPlayingTitle}>Idle</Text>
                    <Text style={styles.nowPlayingSubtitle}>Taking a break</Text>
                </View>
            </View>
        );
    }
    
    // Render the active "Now Playing" card.
    return (
        <Animated.View style={animatedStyle}>
            <TouchableOpacity 
                activeOpacity={1} // Disable default opacity feedback to use our scale animation instead.
                onPressIn={() => scale.value = withSpring(0.97)}
                onPressOut={() => scale.value = withSpring(1)}
                onPress={() => navigation.navigate(presence.activityType === 'game' ? 'Games' : 'ComicDetail', { comicId: data.id })}
            >
                <ImageBackground source={data.image || data.localSource} style={styles.nowPlayingCard} imageStyle={{ borderRadius: 24 }}>
                    {/* A gradient overlay to ensure text is readable over the image. */}
                    <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={styles.nowPlayingOverlay}>
                        <Image source={data.image || data.localSource} style={styles.nowPlayingImage}/>
                        <View style={styles.nowPlayingTextContainer}>
                            <Text style={styles.nowPlayingTitle} numberOfLines={1}>{presence.status}</Text>
                            <Text style={styles.nowPlayingSubtitle} numberOfLines={1}>{presence.details}</Text>
                        </View>
                    </LinearGradient>
                </ImageBackground>
            </TouchableOpacity>
        </Animated.View>
    );
};

/**
 * A card component that displays a friend's current activity.
 * @param {object} props - The component props.
 * @param {object} props.item - A friend's presence object from the FlatList data.
 */
const FriendActivityCard = ({ item }) => {
    const navigation = useNavigation();
    // Find the corresponding game or comic data for the friend's activity.
    const data = item.activityType === 'game' 
        ? gamesData.find(g => g.id === item.activityId) 
        : comicsData.find(c => c.id === item.activityId);

    // Function to handle the "Join" or "Read Along" button press.
    const handleJumpIn = () => {
        if (item.activityType === 'game') Alert.alert("Join Game", `Joining ${item.name} in ${data.title}...`);
        if (item.activityType === 'comic') navigation.navigate('ComicDetail', { comicId: data.id });
    };
    
    return (
        <View style={styles.friendCard}>
            <BlurView intensity={20} tint="dark" style={styles.cardBlur}/>
            <ImageBackground source={{ uri: item.avatar }} style={styles.friendAvatar} imageStyle={{ borderRadius: 25 }}>
                {/* Show a green online indicator if the friend is not idle. */}
                {item.activityType !== 'idle' && <View style={styles.onlineIndicator}/>}
            </ImageBackground>
            <View style={styles.friendTextContainer}>
                <Text style={styles.friendName}>{item.name}</Text>
                <Text style={styles.friendStatus} numberOfLines={2}>
                    {item.activityType !== 'idle' ? (
                        // Display rich status text if active.
                        <>
                            <Text style={{color: Colors.text}}>{item.status} </Text>
                            <Text>({item.details})</Text>
                        </>
                    ) : (
                        // Display simple status if idle.
                        <Text>{item.status}</Text>
                    )}
                </Text>
            </View>
            {/* Show the "Jump In" button only if the friend is active. */}
            {item.activityType !== 'idle' && (
                 <TouchableOpacity style={styles.jumpInButton} onPress={handleJumpIn}>
                    <Text style={styles.jumpInText}>
                        {item.activityType === 'game' ? 'Join' : 'Read Along'}
                    </Text>
                 </TouchableOpacity>
            )}
        </View>
    );
};

/**
 * The main screen component for the "Activity" tab. Displays user and friend activities.
 * This component is designed to work with a collapsible header.
 * @param {object} props - The component props.
 * @param {function} props.scrollHandler - The animated scroll handler from the parent screen.
 * @param {number} props.headerHeight - The height of the parent's header for initial padding.
 */
const ActivityScreen = ({ scrollHandler, headerHeight }) => {
  const insets = useSafeAreaInsets(); // Hook to get safe area dimensions.
  
  // A component to render at the top of the FlatList.
  const ListHeader = () => (
    <>
        <View style={{marginTop: 15}}>
            <Text style={styles.sectionTitle}>Now Playing</Text>
            <NowPlayingCard presence={userPresence} />
        </View>
        <View style={{ marginTop: 30 }}>
            <Text style={styles.sectionTitle}>Friends' Activity</Text>
        </View>
    </>
  );

  return (
      <AnimatedFlatList
        data={friendsPresence}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <FriendActivityCard item={item} />}
        ListHeaderComponent={ListHeader}
        ItemSeparatorComponent={() => <View style={{height: 10}} />}
        onScroll={scrollHandler} // Connect the list's scroll events to the parent's animated value.
        scrollEventThrottle={16} // How often the onScroll event is fired (in ms). 16 is optimal for 60fps animations.
        contentContainerStyle={{ 
            paddingTop: headerHeight, // Add top padding to account for the overlying header.
            paddingBottom: insets.bottom + 40, // Add bottom padding for the safe area and tab bar.
            paddingHorizontal: 20 
        }}
        // Component to show if the friends list is empty.
        ListEmptyComponent={
            <View style={styles.emptyContainer}>
                <Ionicons name="people-outline" size={64} color={Colors.textSecondary} />
                <Text style={styles.emptyText}>No Friends Online</Text>
            </View>
        }
      />
  );
};

// Styles for the components.
const styles = StyleSheet.create({
  sectionTitle: { fontFamily: 'Poppins_600SemiBold', color: Colors.text, fontSize: 22, marginBottom: 15 },
  nowPlayingCard: { height: 150, borderRadius: 24, overflow: 'hidden' },
  nowPlayingOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'flex-end', padding: 20, flexDirection: 'row', alignItems: 'center' },
  nowPlayingImage: { width: 60, height: 60, borderRadius: 12, backgroundColor: Colors.surface, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  nowPlayingTextContainer: { flex: 1, marginLeft: 15 },
  nowPlayingTitle: { fontFamily: 'Poppins_600SemiBold', color: Colors.text, fontSize: 16 },
  nowPlayingSubtitle: { fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, fontSize: 14 },
  
  friendCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 20, padding: 10, overflow: 'hidden', borderWidth: StyleSheet.hairlineWidth, borderColor: Colors.surface + '80' },
  cardBlur: { ...StyleSheet.absoluteFillObject, borderRadius: 20 },
  friendAvatar: { width: 50, height: 50, justifyContent: 'flex-end', alignItems: 'flex-end' },
  onlineIndicator: { width: 15, height: 15, borderRadius: 7.5, backgroundColor: Colors.success, borderWidth: 2, borderColor: Colors.surface },
  friendTextContainer: { flex: 1, marginLeft: 15 },
  friendName: { fontFamily: 'Poppins_600SemiBold', color: Colors.text, fontSize: 16 },
  friendStatus: { fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, fontSize: 14, marginTop: 2 },
  jumpInButton: { backgroundColor: Colors.secondary + '22', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 16 },
  jumpInText: { fontFamily: 'Poppins_600SemiBold', color: Colors.secondary, fontSize: 14 },
  
  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 50 },
  emptyText: { fontFamily: 'Poppins_600SemiBold', color: Colors.textSecondary, fontSize: 18, marginTop: 15 },
});

export default ActivityScreen;