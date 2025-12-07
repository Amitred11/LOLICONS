// App.js
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
import { AuthProvider } from '@context/main/AuthContext';
import { ModalProvider } from '@context/other/ModalContext';
import { AlertProvider } from '@context/other/AlertContext';
import { RewardProvider } from '@context/other/RewardContext';
import { CommunityProvider } from '@context/main/CommunityContext';
import { ComicProvider } from '@context/main/ComicContext'; 
import { HomeProvider } from '@context/main/HomeContext';
import { ProfileProvider } from '@context/main/ProfileContext';
import { NotificationProvider } from '@context/main/NotificationContext';

// Hub Contexts
import { ChatProvider } from '@context/hub/ChatContext';
import { EventsProvider } from '@context/hub/EventsContext';
import { FriendProvider } from '@context/hub/FriendContext';
import { MediaProvider } from '@context/hub/MediaContext';

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
          <AuthProvider>
            <RewardProvider>
            <ProfileProvider>
              {/* Hub Contexts */}
              <ChatProvider>
                <EventsProvider>
                  <FriendProvider>
                    <MediaProvider>
                      {/* Feature Contexts */}
                      <NotificationProvider>
                        <ComicProvider>
                          <HomeProvider>
                            <CommunityProvider>
                              <ModalProvider>
                                {children}
                              </ModalProvider>
                            </CommunityProvider>
                          </HomeProvider>
                        </ComicProvider>
                      </NotificationProvider>
                    </MediaProvider>
                  </FriendProvider>
                </EventsProvider>
              </ChatProvider>
            </ProfileProvider>
            </RewardProvider>
          </AuthProvider>
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
        
        {/* VISUAL PRIVACY: 
            pointerEvents="box-none" allows the PrivacyOverlay to block touches 
            only when it is visible/active, while letting clicks pass through to the 
            App when it is hidden. 
        */}
        <View style={styles.privacyContainer} pointerEvents="box-none">
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
    zIndex: 99999, 
    elevation: 99999, 
  }
});