import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Colors } from '../constants/Colors';

// Import the Tabs
import BottomTabNavigator from './BottomTabNavigator';

// --- Screen Imports (Detail Screens) ---

// HOME
import SearchScreen from '../screens/home/SearchScreen';

// COMICS
import ComicDetailScreen from '../screens/comics/features/reader/ComicDetailScreen';
import ReaderScreen from '../screens/comics/features/reader/ReaderScreen';
import SeeAllScreen from '../screens/comics/features/discovery/SeeAllScreen';

// COMMUNITY
import PostDetailScreen from '../screens/community/screens/PostDetailScreen';
import CreatePostScreen from '../screens/community/screens/CreatePostScreen';

// PROFILE SETTINGS
import EditProfileScreen from '../screens/profile/screens/EditProfileScreen';
import AccountScreen from '../screens/profile/screens/settings/AccountScreen';
import NotificationsScreen from '../screens/profile/screens/settings/NotificationsScreen';
import HelpScreen from '../screens/profile/screens/settings/HelpScreen';
import DataAndStorageScreen from '../screens/profile/screens/settings/DataAndStorageScreen';
import PrivacyScreen from '../screens/profile/screens/settings/PrivacyScreen';
import TrophyCaseScreen from '../screens/profile/screens/TrophyCaseScreen';

// HUB & MESSAGING
import MessagesScreen from '../screens/hub/Messages/MessagesScreen';
import ChatScreen from '../screens/hub/Messages/ChatScreen';
import FriendsScreen from '../screens/hub/Messages/FriendsScreen';
import AddFriendScreen from '../screens/hub/Messages/AddFriendScreen';
import UserProfileScreen from '../screens/hub/Messages/UserProfileScreen';

// MEDIA & EVENTS
import VideoPlayerScreen from '../screens/hub/Media/VideoPlayerScreen';
import MediaScreen from '../screens/hub/Media/MediaScreen';
import MediaDetailScreen from '../screens/hub/Media/MediaDetailScreen';
import EventDetailScreen from '../screens/hub/Event/EventDetailScreen';
import EventsScreen from '../screens/hub/Event/EventsScreen';

const AppStack = createNativeStackNavigator();

const MainStackNavigator = () => {
  return (
    <AppStack.Navigator 
      screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.background } }}
    >
      {/* The Main Tabs */}
      <AppStack.Screen name="Main" component={BottomTabNavigator} />

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
};

export default MainStackNavigator;