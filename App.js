// Import necessary modules from React, React Navigation, and other libraries.
import React from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { AuthProvider } from './context/AuthContext';
import { ModalProvider } from './context/ModalContext';
import AppNavigator from './navigation/AppNavigator';
// Import custom fonts for the application.
import { useFonts, Poppins_400Regular, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins';
import { View, ActivityIndicator } from 'react-native';
import { Colors } from './constants/Colors';
// Import root providers for gesture handling, safe areas, menus, etc.
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { MenuProvider } from 'react-native-popup-menu';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LibraryProvider } from './context/LibraryContext'; 
import { StatusBar } from 'expo-status-bar';
import { DownloadProvider } from './context/DownloadContext';

// Define a custom dark theme for React Navigation, using colors from the app's constants.
const AppDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: Colors.primary,
    background: Colors.background,
    card: Colors.surface,
    text: Colors.text,
    border: Colors.surface,
    notification: Colors.primary,
  },
};

/**
 * The root component of the entire application.
 * It sets up font loading, all necessary context providers, and the main navigation structure.
 */
export default function App() {
  // Load the custom Poppins fonts. `fontsLoaded` will be true once they are ready.
  let [fontsLoaded] = useFonts({ Poppins_400Regular, Poppins_600SemiBold, Poppins_700Bold });

  // While the fonts are loading, display a loading spinner to prevent the app from rendering with default fonts.
  if (!fontsLoaded) {
    return <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background}}><ActivityIndicator size="large" color={Colors.primary} /></View>;
  }

  // The main application structure.
  // The providers are nested so that inner components can access any of their contexts.
  return (
    // Required for react-native-gesture-handler to work on Android.
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* Provides safe area insets to all child components. */}
      <SafeAreaProvider>
        {/* Provides context for react-native-popup-menu. */}
        <MenuProvider>
          {/* Manages the state and logic for downloaded comics. */}
          <DownloadProvider>
          {/* Manages the state of the user's comic library. */}
          <LibraryProvider>
            {/* Provides a global system for showing and hiding modals. */}
            <ModalProvider>
              {/* Manages user authentication state and logic. */}
              <AuthProvider>
                {/* The main container for all navigation logic. */}
                <NavigationContainer theme={AppDarkTheme}>
                  <StatusBar style="light" />
                  <AppNavigator />
                </NavigationContainer>
              </AuthProvider>
            </ModalProvider>
          </LibraryProvider>
          </DownloadProvider>
        </MenuProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}