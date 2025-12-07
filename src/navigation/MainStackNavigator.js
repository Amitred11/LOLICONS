import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Colors } from '@config/Colors';

// Import the Tabs
import BottomTabNavigator from './BottomTabNavigator';

// --- Screen Imports (Detail Screens) ---

// HOME
import SearchScreen from '@features/home/SearchScreen';
import NotificationScreen from '@features/notification/NotificationScreen'; 

// COMICS
import ComicDetailScreen from '@features/comics/features/reader/ComicDetailScreen';
import ReaderScreen from '@features/comics/features/reader/ReaderScreen';
import SeeAllScreen from '@features/comics/features/discovery/SeeAllScreen';

// COMMUNITY
import MarketplaceScreen from '@features/community/screens/Market/MarketplaceScreen';
import GuildDetailScreen from '@features/community/screens/Guild/GuildDetailScreen';
import MarketDetailScreen from '@features/community/screens/Market/MarketDetailScreen'; 
import DiscussionScreen from '@features/community/screens/Guild/DiscussionScreen';
import CreatePostScreen from '@features/community/screens/Guild/CreatePostScreen';
import ThreadScreen from '@features/community/screens/Guild/ThreadScreen';
// PROFILE SETTINGS
import EditProfileScreen from '@features/profile/screens/EditProfileScreen';
import AccountScreen from '@features/profile/screens/settings/AccountScreen';
import NotificationSettingScreen from '@features/profile/screens/settings/NotificationsScreen';
import HelpScreen from '@features/profile/screens/settings/HelpScreen';
import DataAndStorageScreen from '@features/profile/screens/settings/DataAndStorageScreen';
import PrivacyScreen from '@features/profile/screens/settings/PrivacyScreen';
import TrophyCaseScreen from '@features/profile/screens/TrophyCaseScreen';
import ChangePasswordScreen from '@features/profile/screens/settings/ChangePasswordScreen';
import FriendProfileScreen from '@features/profile/screens/FriendProfileScreen';
import ViewAllHFScreen from '@features/profile/screens/ViewAllHFScreen';

// HUB & MESSAGING
import FriendsScreen from '@features/hub/Friends/FriendsScreen';
import ChatListScreen from '@features/hub/Chat/ChatListScreen';
import ChatDetailScreen from '@features/hub/Chat/ChatDetailScreen';
import ChatSettingsScreen from '@features/hub/Chat/ChatSettingsScreen'

// MEDIA & EVENTS
import VideoPlayerScreen from '@features/hub/Media/VideoPlayerScreen';
import MediaScreen from '@features/hub/Media/MediaScreen';
import MediaDetailScreen from '@features/hub/Media/MediaDetailScreen';
import EventDetailScreen from '@features/hub/Event/EventDetailScreen';
import EventsScreen from '@features/hub/Event/EventsScreen';
import MediaProfileScreen from '@features/hub/Media/MediaProfileScreen';
import WatchPartyLobbyScreen from '@features/hub/Media/WatchPartyLobbyScreen';

const AppStack = createNativeStackNavigator();

const MainStackNavigator = () => {
  return (
    <AppStack.Navigator 
      screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.background } }}
    >
      {/* The Main Tabs */}
      <AppStack.Screen name="Main" component={BottomTabNavigator} />
      <AppStack.Screen name="Notifications" component={NotificationScreen} options={{ headerShown: false }} />

      {/* SETTINGS */}
      <AppStack.Screen name="EditProfile" component={EditProfileScreen} options={{ presentation: 'modal' }} />
      <AppStack.Screen name="Account" component={AccountScreen} options={{ animation: 'slide_from_right' }}/>
      <AppStack.Screen name="NotificationSettings" component={NotificationSettingScreen} options={{ animation: 'slide_from_right' }}/>
      <AppStack.Screen name="Help" component={HelpScreen} options={{ animation: 'slide_from_right' }}/>
      <AppStack.Screen name="DataAndStorage" component={DataAndStorageScreen} options={{ animation: 'slide_from_right' }}/>
      <AppStack.Screen name="Privacy" component={PrivacyScreen} options={{ animation: 'slide_from_right' }}/>
      <AppStack.Screen name="TrophyCase" component={TrophyCaseScreen} />
      <AppStack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      <AppStack.Screen name="ViewAllHF" component = {ViewAllHFScreen} />

      {/* COMICS */}
      <AppStack.Screen name="ComicDetail" component={ComicDetailScreen} />
      <AppStack.Screen name="Reader" component={ReaderScreen} />
      <AppStack.Screen name="SeeAll" component={SeeAllScreen} />

      {/* MEDIA AND COMMUNITY */}
      <AppStack.Screen name="EventDetail" component={EventDetailScreen} />
      <AppStack.Screen name="Events" component={EventsScreen} />
      <AppStack.Screen name="MediaDetail" component={MediaDetailScreen} />
      <AppStack.Screen name="Search" component={SearchScreen} options={{ presentation: 'modal', animation: 'fade_from_bottom' }} />
      <AppStack.Screen name="Media" component={MediaScreen} />
      <AppStack.Screen name="VideoPlayer" component={VideoPlayerScreen} />
      <AppStack.Screen name="WatchPartyLobby" component={WatchPartyLobbyScreen} /> 
      <AppStack.Screen name="MarketDetail" component={MarketDetailScreen} options={{ animation: 'slide_from_right' }}/>
      <AppStack.Screen name="MediaProfile" component={MediaProfileScreen} /> 
      <AppStack.Screen 
        name="Marketplace" 
        component={MarketplaceScreen} 
        options={{ animation: 'slide_from_right' }}
      />
      <AppStack.Screen 
        name="GuildDetail" 
        component={GuildDetailScreen} 
        options={{ animation: 'slide_from_right' }}
      />
      <AppStack.Screen 
        name="Discussion" 
        component={DiscussionScreen} 
        options={{ animation: 'slide_from_right' }}
      />
      <AppStack.Screen 
        name="CreatePost" 
        component={CreatePostScreen} 
        options={{ animation: 'slide_from_right' }}
      />
      <AppStack.Screen 
        name="Thread" 
        component={ThreadScreen} 
        options={{ animation: 'slide_from_right' }}
      />
      {/* CHATS */}
      <AppStack.Screen name="Friends" component={FriendsScreen} />
      <AppStack.Screen name="ChatList" component={ChatListScreen} />
      <AppStack.Screen name="ChatDetail" component={ChatDetailScreen} />
      <AppStack.Screen name="ChatSettings" component={ChatSettingsScreen} />    
      <AppStack.Screen name="FriendProfile" component={FriendProfileScreen} />    
    </AppStack.Navigator>
  );
};

export default MainStackNavigator;