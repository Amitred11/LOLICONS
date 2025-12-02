import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import { MenuProvider } from 'react-native-popup-menu';
import { useFonts, Poppins_400Regular, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins';

// Import Contexts
import { AuthProvider } from '@context/AuthContext';
import { ModalProvider } from '@context/ModalContext';
import { LibraryProvider } from '@context/LibraryContext'; 
import { DownloadProvider } from '@context/DownloadContext';
import { AlertProvider } from '@context/AlertContext';
import { CommunityProvider } from '@context/CommunityContext'; 


// Import App Logic
import AppNavigator from '@navigation/AppNavigator';
import { Colors } from '@config/Colors';

// SECURITY IMPORT
import PrivacyOverlay from '@components/overlays/PrivacyOverlay';

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

const AppProviders = ({ children }) => (
  <SafeAreaProvider>
    <ActionSheetProvider>
      <MenuProvider>
        <AlertProvider>
          <ModalProvider>
            <AuthProvider>
              <CommunityProvider>
                <LibraryProvider>
                  <DownloadProvider>
                    {children}
                  </DownloadProvider>
                </LibraryProvider>
              </CommunityProvider>
            </AuthProvider>
          </ModalProvider>
        </AlertProvider> 
      </MenuProvider>
    </ActionSheetProvider>
  </SafeAreaProvider>
);

export default function App() {
  let [fontsLoaded] = useFonts({ Poppins_400Regular, Poppins_600SemiBold, Poppins_700Bold });

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
        <AppProviders>
          <NavigationContainer theme={AppDarkTheme}>
            <StatusBar style="light" />
            <AppNavigator />
          </NavigationContainer>
        </AppProviders>
        
        {/* VISUAL PRIVACY: High z-index ensures it covers Modals too */}
        <View style={styles.privacyContainer} pointerEvents="none">
           <PrivacyOverlay />
        </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: Colors.background
  },
  privacyContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 99999, // Ensure this is above everything, including Alerts/Modals
    elevation: 99999, // Android elevation
  }
});