// Import necessary modules from React, React Native, and React Navigation.
import React from 'react';
import { View, ActivityIndicator, Alert } from 'react-native'; // Added Alert here
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import CustomTabBar from '../components/CustomTabBar'; // Custom component for the tab bar UI.
import { Colors } from '../constants/Colors';
import { useAuth } from '../context/AuthContext'; // Hook to access authentication state.

// --- Screen Imports ---

// Authentication screens.
import WelcomeScreen from '../screens/auth/WelcomeScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen'; 

// Core Tab screens (main sections of the app).
import HomeScreen from '../screens/home/HomeScreen';
import ComicsScreen from '../screens/comics/features/discovery/ComicsScreen';
import CommunityScreen from '../screens/community/screens/CommunityScreen';
import ProfileScreen from '../screens/profile/screens/ProfileScreen';
import HubScreen from '../screens/hub/Hub/HubScreen'; // The main "Social" tab screen.

// Stack screens (screens navigated to from other parts of the app).
// COMICS
import ComicDetailScreen from '../screens/comics/features/reader/ComicDetailScreen';
import ReaderScreen from '../screens/comics/features/reader/ReaderScreen';
import SeeAllScreen from '../screens/comics/features/discovery/SeeAllScreen';

// HOME
import SearchScreen from '../screens/home/SearchScreen';
import PostDetailScreen from '../screens/community/screens/PostDetailScreen';
import CreatePostScreen from '../screens/community/screens/CreatePostScreen';
// PROFILE
import EditProfileScreen from '../screens/profile/screens/EditProfileScreen';
import AccountScreen from '../screens/profile/screens/settings/AccountScreen';
import NotificationsScreen from '../screens/profile/screens/settings/NotificationsScreen';
import HelpScreen from '../screens/profile/screens/settings/HelpScreen';
import DataAndStorageScreen from '../screens/profile/screens/settings/DataAndStorageScreen';
import PrivacyScreen from '../screens/profile/screens/settings/PrivacyScreen';
import TrophyCaseScreen from '../screens/profile/screens/TrophyCaseScreen';
// HUB
import MessagesScreen from '../screens/hub/Messages/MessagesScreen';
import ChatScreen from '../screens/hub/Messages/ChatScreen';
import FriendsScreen from '../screens/hub/Messages/FriendsScreen';
import AddFriendScreen from '../screens/hub/Messages/AddFriendScreen';
import UserProfileScreen from '../screens/hub/Messages/UserProfileScreen';
// MEDIA
import VideoPlayerScreen from '../screens/hub/Media/VideoPlayerScreen';
import MediaScreen from '../screens/hub/Media/MediaScreen';
import MediaDetailScreen from '../screens/hub/Media/MediaDetailScreen';
//EVENTS
import EventDetailScreen from '../screens/hub/Event/EventDetailScreen';
import EventsScreen from '../screens/hub/Event/EventsScreen';

// Initialize navigators.
const AuthStackNav = createNativeStackNavigator();
const AppStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const AuthStack = () => (
  <AuthStackNav.Navigator 
    screenOptions={{ headerShown: false, animation: 'slide_from_right', contentStyle: { backgroundColor: Colors.background } }}
  >
    <AuthStackNav.Screen name="Welcome" component={WelcomeScreen} />
    <AuthStackNav.Screen name="Login" component={LoginScreen} />
    <AuthStackNav.Screen name="Register" component={RegisterScreen} />
    <AuthStackNav.Screen name="ForgotPassword" component={ForgotPasswordScreen} /> 
  </AuthStackNav.Navigator>
);

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={{ headerShown: false }}
    tabBar={(props) => <CustomTabBar {...props} />} 
  >
    <Tab.Screen 
        name="Dashboard" 
        component={HomeScreen} 
        options={{ customProps: { label: "Home", activeIcon: "home", inactiveIcon: "home-outline" }}} 
    />
    <Tab.Screen 
        name="Comics" 
        component={ComicsScreen} 
        options={{ customProps: { label: "Comics", activeIcon: "book", inactiveIcon: "book-outline" }}} 
    />
    
    {/* --- COMMUNITY TAB (Under Construction) --- */}
    <Tab.Screen 
        name="Community" 
        component={CommunityScreen} 
        listeners={{
            tabPress: (e) => {
                // Prevent default action (navigation)
                e.preventDefault();
                // Show Alert
                Alert.alert(
                    "Under Construction 🚧",
                    "The Community feature is currently being built by our engineering team.\n\nCheck back soon!",
                    [{ text: "Got it", style: "default" }]
                );
            },
        }}
        options={{ customProps: { label: "Community", activeIcon: "people", inactiveIcon: "people-outline" }}} 
    />

    <Tab.Screen 
        name="Social" 
        component={HubScreen} 
        options={{ customProps: { label: "Social", activeIcon: "chatbubbles", inactiveIcon: "chatbubbles-outline" }}} 
    />
    <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ customProps: { label: "Profile", activeIcon: "person-circle", inactiveIcon: "person-circle-outline" }}} 
    />
  </Tab.Navigator>
);

const AppStackScreens = () => (
  <AppStack.Navigator 
    screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.background } }}
  >
    <AppStack.Screen name="Main" component={MainTabs} />
    {/* SETTINGS */}
    <AppStack.Screen name="EditProfile" component={EditProfileScreen} options={{ presentation: 'modal' }} />
    <AppStack.Screen name="Account" component={AccountScreen} options={{ animation: 'slide_from_right' }}/>
    <AppStack.Screen name="Notifications" component={NotificationsScreen} options={{ animation: 'slide_from_right' }}/>
    <AppStack.Screen name="Help" component={HelpScreen} options={{ animation: 'slide_from_right' }}/>
    <AppStack.Screen name="DataAndStorage" component={DataAndStorageScreen} options={{ animation: 'slide_from_right' }}/>
    <AppStack.Screen name="Privacy" component={PrivacyScreen} options={{ animation: 'slide_from_right' }}/>
    <AppStack.Screen name="UserProfile" component={UserProfileScreen} />
    <AppStack.Screen name="TrophyCase" component={TrophyCaseScreen} />

    {/* COMICS */}
    <AppStack.Screen name="ComicDetail" component={ComicDetailScreen} />
    <AppStack.Screen name="Reader" component={ReaderScreen} />
    <AppStack.Screen name="SeeAll" component={SeeAllScreen} />

    {/* MEDIA AND COMMUNITY */}
    <AppStack.Screen name="EventDetail" component={EventDetailScreen} />
    <AppStack.Screen name="Events" component={EventsScreen} />
    <AppStack.Screen name="MediaDetail" component={MediaDetailScreen} />
    <AppStack.Screen name="PostDetail" component={PostDetailScreen} />
    <AppStack.Screen name="CreatePost" component={CreatePostScreen} options={{ presentation: 'modal'}} />
    <AppStack.Screen name="Search" component={SearchScreen} options={{ presentation: 'modal', animation: 'fade_from_bottom' }} />
    <AppStack.Screen name="Media" component={MediaScreen} />
    <AppStack.Screen name="VideoPlayer" component={VideoPlayerScreen} />

    {/* CHATS */}
    <AppStack.Screen name="Chat" component={ChatScreen} />
    <AppStack.Screen name="Messages" component={MessagesScreen} />
    <AppStack.Screen name="Friends" component={FriendsScreen} />
    <AppStack.Screen name="AddFriend" component={AddFriendScreen} />
  </AppStack.Navigator>
);

const AppNavigator = () => {
  const { isLoggedIn, isLoading } = useAuth();

  if (isLoading) {
    return (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background}}>
            <ActivityIndicator size="large" color={Colors.primary} />
        </View>
    );
  }

  return isLoggedIn ? <AppStackScreens /> : <AuthStack />;
};

export default AppNavigator;