import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import { MenuProvider } from 'react-native-popup-menu';
import { useFonts, Poppins_400Regular, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins';

// Import Contexts
import { AuthProvider } from './context/AuthContext';
import { ModalProvider } from './context/ModalContext';
import { LibraryProvider } from './context/LibraryContext'; 
import { DownloadProvider } from './context/DownloadContext';

// Import App Logic
import AppNavigator from './navigation/AppNavigator';
import { Colors } from './constants/Colors';

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
 * A single component that composes all the app's context providers.
 * This keeps the main App component clean.
 */
const AppProviders = ({ children }) => (
  <GestureHandlerRootView style={{ flex: 1 }}>
    <SafeAreaProvider>
      <ActionSheetProvider>
        <MenuProvider>
          <DownloadProvider>
            <LibraryProvider>
              <ModalProvider>
                <AuthProvider>
                  {children}
                </AuthProvider>
              </ModalProvider>
            </LibraryProvider>
          </DownloadProvider>
        </MenuProvider>
      </ActionSheetProvider>
    </SafeAreaProvider>
  </GestureHandlerRootView>
);

/**
 * The root component of the entire application.
 */
export default function App() {
  let [fontsLoaded] = useFonts({ Poppins_400Regular, Poppins_600SemiBold, Poppins_700Bold });

  if (!fontsLoaded) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background}}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <AppProviders>
      <NavigationContainer theme={AppDarkTheme}>
        <StatusBar style="light" />
        <AppNavigator />
      </NavigationContainer>
    </AppProviders>
  );
}