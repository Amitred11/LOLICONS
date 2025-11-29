import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import CustomTabBar from '@components/CustomTabBar'; 
import { useAlert } from '@context/AlertContext'; 

// Core Tab Screens
import HomeScreen from '@features/home/HomeScreen';
import ComicsScreen from '@features/comics/features/discovery/ComicsScreen';
import CommunityScreen from '@features/community/screens/CommunityScreen';
import HubScreen from '@features/hub/Hub/HubScreen';
import ProfileScreen from '@features/profile/screens/ProfileScreen';

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
  const { showAlert } = useAlert(); 

  return (
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
      
      {/* Community Tab with Construction Alert */}
      <Tab.Screen 
          name="Community" 
          component={CommunityScreen} 
          listeners={{
              tabPress: (e) => {
                  e.preventDefault();
                  showAlert({
                    title: "Coming Soon!",
                    message: "The Community feature is currently being built by our engineering team.\nCheck back soon!",
                    type: "construction",
                    btnText: "Can't Wait!"
                  });
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
};

export default BottomTabNavigator;