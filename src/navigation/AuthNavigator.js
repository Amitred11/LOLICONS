import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Colors } from '@config/Colors';

// Auth Screens
import WelcomeScreen from '@features/auth/WelcomeScreen';
import LoginScreen from '@features/auth/LoginScreen';
import RegisterScreen from '@features/auth/RegisterScreen';
import ForgotPasswordScreen from '@features/auth/ForgotPasswordScreen'; 

const AuthStack = createNativeStackNavigator();

const AuthNavigator = () => {
  return (
    <AuthStack.Navigator 
      screenOptions={{ 
        headerShown: false, 
        animation: 'slide_from_right', 
        contentStyle: { backgroundColor: Colors.background } 
      }}
    >
      <AuthStack.Screen name="Welcome" component={WelcomeScreen} />
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
      <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} /> 
    </AuthStack.Navigator>
  );
};

export default AuthNavigator;