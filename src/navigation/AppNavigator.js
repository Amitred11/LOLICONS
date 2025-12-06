import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Colors } from '../constants/Colors';
import { useAuth } from '@context/main/AuthContext';

// Import Separated Navigators
import AuthNavigator from './AuthNavigator';
import MainStackNavigator from './MainStackNavigator';

const AppNavigator = () => {
  const { isLoggedIn, isLoading } = useAuth();

  if (isLoading) {
    return (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background}}>
            <ActivityIndicator size="large" color={Colors.primary} />
        </View>
    );
  }

  return isLoggedIn ? <MainStackNavigator /> : <AuthNavigator />;
};

export default AppNavigator;