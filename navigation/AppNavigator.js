// Import necessary modules from React, React Native, and React Navigation.
import React from 'react';
import { View, ActivityIndicator } from 'react-native';
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
import ComicsScreen from '../screens/comics/ComicsScreen';
import CommunityScreen from '../screens/CommunityScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import ChatTabScreen from '../screens/chat/ChatTabScreen'; // The main "Social" tab screen.

// Stack screens (screens navigated to from other parts of the app).
import ComicDetailScreen from '../screens/comics/ComicDetailScreen';
import ReaderScreen from '../screens/comics/ReaderScreen';
import SeeAllScreen from '../screens/comics/SeeAllScreen';
import ChatScreen from '../screens/chat/ChatScreen'; // Screen for an individual chat conversation.
import SearchScreen from '../screens/home/SearchScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import AccountScreen from '../screens/profile/AccountScreen';
import NotificationsScreen from '../screens/profile/NotificationsScreen';
import HelpScreen from '../screens/profile/HelpScreen';
import DataAndStorageScreen from '../screens/profile/DataAndStorageScreen';
import PrivacyScreen from '../screens/profile/PrivacyScreen';

// Initialize navigators.
const AuthStackNav = createNativeStackNavigator();
const AppStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

/**
 * A stack navigator for the authentication flow (Welcome, Login, Register).
 * This is shown to users who are not logged in.
 */
const AuthStack = () => (
  <AuthStackNav.Navigator 
    screenOptions={{ 
      headerShown: false, // Hide the default header for all screens in this stack.
      animation: 'slide_from_right', // Default transition animation.
      contentStyle: { backgroundColor: Colors.background } // Apply a consistent background color.
    }}
  >
    {/* Using Math.random() as a key is unconventional; it forces a re-mount which might be intended to reset state when navigating back to Welcome. */}
    <AuthStackNav.Screen name="Welcome" component={WelcomeScreen} key={Math.random()} />
    <AuthStackNav.Screen name="Login" component={LoginScreen} />
    <AuthStackNav.Screen name="Register" component={RegisterScreen} />
    <AuthStackNav.Screen name="ForgotPassword" component={ForgotPasswordScreen} /> 
  </AuthStackNav.Navigator>
);

/**
 * A bottom tab navigator for the main application screens.
 * Uses a custom component for the tab bar UI.
 */
const MainTabs = () => (
  <Tab.Navigator
    screenOptions={{ headerShown: false }}
    // Replace the default tab bar with our custom animated one.
    tabBar={(props) => <CustomTabBar {...props} />} 
  >
    {/* Define each tab screen with custom props for the tab bar component. */}
    <Tab.Screen name="Dashboard" component={HomeScreen} options={{ customProps: { label: "Home", activeIcon: "home", inactiveIcon: "home-outline" }}} />
    <Tab.Screen name="Comics" component={ComicsScreen} options={{ customProps: { label: "Comics", activeIcon: "book", inactiveIcon: "book-outline" }}} />
    <Tab.Screen name="Community" component={CommunityScreen} options={{ customProps: { label: "Community", activeIcon: "people", inactiveIcon: "people-outline" }}} />
    <Tab.Screen name="Social" component={ChatTabScreen} options={{ customProps: { label: "Social", activeIcon: "chatbubbles", inactiveIcon: "chatbubbles-outline" }}} />
    <Tab.Screen name="Profile" component={ProfileScreen} options={{ customProps: { label: "Profile", activeIcon: "person-circle", inactiveIcon: "person-circle-outline" }}} />
  </Tab.Navigator>
);

/**
 * A stack navigator for the main application flow, including the tab navigator and other screens
 * that can be navigated to from within the tabs (e.g., ComicDetail, Reader).
 */
const AppStackScreens = () => (
  <AppStack.Navigator 
    screenOptions={{ 
      headerShown: false,
      contentStyle: { backgroundColor: Colors.background } 
    }}
  >
    {/* The main screen is the tab navigator itself. */}
    <AppStack.Screen name="Main" component={MainTabs} />
    {/* Other screens that can be pushed on top of the tab navigator. */}
    <AppStack.Screen name="ComicDetail" component={ComicDetailScreen} />
    <AppStack.Screen name="Reader" component={ReaderScreen} />
    <AppStack.Screen name="SeeAll" component={SeeAllScreen} />
    <AppStack.Screen name="Chat" component={ChatScreen} />
    {/* Modal screens with specific animations. */}
    <AppStack.Screen name="Search" component={SearchScreen} options={{ presentation: 'modal', animation: 'fade_from_bottom' }} />
    <AppStack.Screen name="EditProfile" component={EditProfileScreen} options={{ presentation: 'modal' }} />
    {/* Screens with a standard slide animation. */}
    <AppStack.Screen name="Account" component={AccountScreen} options={{ animation: 'slide_from_right' }}/>
    <AppStack.Screen name="Notifications" component={NotificationsScreen} options={{ animation: 'slide_from_right' }}/>
    <AppStack.Screen name="Help" component={HelpScreen} options={{ animation: 'slide_from_right' }}/>
    <AppStack.Screen name="DataAndStorage" component={DataAndStorageScreen} options={{ animation: 'slide_from_right' }}/>
    <AppStack.Screen name="Privacy" component={PrivacyScreen} options={{ animation: 'slide_from_right' }}/>
  </AppStack.Navigator>
);

/**
 * The root navigator component. It decides whether to show the authentication flow
 * or the main app flow based on the user's login status.
 */
const AppNavigator = () => {
  const { isLoggedIn, isLoading } = useAuth(); // Get auth state.

  // While the auth state is being determined (e.g., checking a token), show a loading indicator.
  if (isLoading) {
    return (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background}}>
            <ActivityIndicator size="large" color={Colors.primary} />
        </View>
    );
  }

  // Conditionally render the correct navigator.
  return isLoggedIn ? <AppStackScreens /> : <AuthStack />;
};

export default AppNavigator;