import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import CustomTabBar from '@components/navigation/CustomTabBar'; 
// import { useAlert } from '@context/AlertContext'; // No longer needed for this tab

// Core Tab Screens
import HomeScreen from '@features/home/HomeScreen';
import ComicsScreen from '@features/comics/features/discovery/ComicsScreen';
import HubScreen from '@features/hub/Hub/HubScreen';
import ProfileScreen from '@features/profile/screens/ProfileScreen';
import CommunityScreen from '@features/community/screens/CommunityScreen'; 

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
  // const { showAlert } = useAlert(); 

  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false, tabBarHideOnKeyboard: true, keyboardHidesTabBar: true   }}
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
      
      {/* UPDATED: Connected the real screen */}
      <Tab.Screen 
          name="Community" 
          component={CommunityScreen} 
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
};

export default BottomTabNavigator;