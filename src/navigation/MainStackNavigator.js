import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Colors } from '@config/Colors';

// Import the Tabs
import BottomTabNavigator from './BottomTabNavigator';

// --- Screen Imports (Detail Screens) ---

// HOME
import SearchScreen from '@features/home/SearchScreen';

// COMICS
import ComicDetailScreen from '@features/comics/features/reader/ComicDetailScreen';
import ReaderScreen from '@features/comics/features/reader/ReaderScreen';
import SeeAllScreen from '@features/comics/features/discovery/SeeAllScreen';

// COMMUNITY
import MarketDetailScreen from '@features/community/MarketDetailScreen'; 

// PROFILE SETTINGS
import EditProfileScreen from '@features/profile/screens/EditProfileScreen';
import AccountScreen from '@features/profile/screens/settings/AccountScreen';
import NotificationsScreen from '@features/profile/screens/settings/NotificationsScreen';
import HelpScreen from '@features/profile/screens/settings/HelpScreen';
import DataAndStorageScreen from '@features/profile/screens/settings/DataAndStorageScreen';
import PrivacyScreen from '@features/profile/screens/settings/PrivacyScreen';
import TrophyCaseScreen from '@features/profile/screens/TrophyCaseScreen';

// HUB & MESSAGING

// MEDIA & EVENTS
import VideoPlayerScreen from '@features/hub/Media/VideoPlayerScreen';
import MediaScreen from '@features/hub/Media/MediaScreen';
import MediaDetailScreen from '@features/hub/Media/MediaDetailScreen';
import EventDetailScreen from '@features/hub/Event/EventDetailScreen';
import EventsScreen from '@features/hub/Event/EventsScreen';

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
      <AppStack.Screen name="TrophyCase" component={TrophyCaseScreen} />
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
      <AppStack.Screen name="MarketDetail" component={MarketDetailScreen} options={{ animation: 'slide_from_right' }}/>

      {/* CHATS */}
    </AppStack.Navigator>
  );
};

export default MainStackNavigator;