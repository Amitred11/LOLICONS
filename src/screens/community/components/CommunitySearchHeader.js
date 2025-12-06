import React, { useEffect, useRef } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, 
  LayoutAnimation, Keyboard, Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@config/Colors'; // Adjust path as needed
import { useNotifications } from '@context/main/NotificationContext'; // Adjust path as needed

const CommunitySearchHeader = ({ 
  searchText, 
  setSearchText, 
  isFocused, 
  setIsFocused, 
  navigation 
}) => {
  const inputRef = useRef(null);
  const { unreadCount } = useNotifications();

  // Handle Animation when focus state changes
  useEffect(() => {
    LayoutAnimation.configureNext({
      duration: 250,
      create: { type: LayoutAnimation.Types.easeInEaseOut, property: LayoutAnimation.Properties.opacity },
      update: { type: LayoutAnimation.Types.easeInEaseOut },
      delete: { type: LayoutAnimation.Types.easeInEaseOut, property: LayoutAnimation.Properties.opacity },
    });
  }, [isFocused]);

  const handleCancel = () => {
    setSearchText('');
    Keyboard.dismiss();
    setIsFocused(false);
  };

  const handleFocus = () => setIsFocused(true);

  // Determine if we show the title/welcome text
  const showTitle = !isFocused && !searchText;

  return (
    <View style={styles.container}>
      {/* Top Header: Title & Notification (Collapses on Search) */}
      {showTitle && (
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.welcomeText}>Welcome back</Text>
            <Text style={styles.titleText}>Community Hub</Text>
          </View>
          <TouchableOpacity 
            style={styles.notifButton}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Ionicons name="notifications-outline" size={24} color={Colors.text} />
            {unreadCount > 0 && <View style={styles.notificationBadge} />} 
          </TouchableOpacity>
        </View>
      )}

      {/* Search Bar */}
      <View style={[styles.searchWrapper, !showTitle && styles.searchWrapperActive]}>
        <View style={[styles.searchContainer, isFocused && styles.searchContainerFocused]}>
          <Ionicons 
            name={isFocused ? "search" : "search-outline"} 
            size={20} 
            color={isFocused ? Colors.primary : Colors.textSecondary} 
          />
          <TextInput 
            ref={inputRef}
            placeholder="Find a Realm by name..." 
            placeholderTextColor={Colors.textSecondary}
            style={styles.searchInput}
            selectionColor={Colors.primary}
            value={searchText}
            onChangeText={setSearchText}
            onFocus={handleFocus}
            // We don't auto-blur on false to keep the keyboard up until user hits cancel or done
            returnKeyType="search"
            autoCorrect={false}
          />
          {(searchText.length > 0 || isFocused) && (
            <TouchableOpacity onPress={handleCancel} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    backgroundColor: Colors.background,
    zIndex: 10,
    paddingBottom: 10,
  },
  headerTop: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 20,
    height: 50, // Fixed height for smoother collapse
  },
  welcomeText: { color: Colors.textSecondary, fontSize: 14, fontWeight: '600', textTransform: 'uppercase' },
  titleText: { color: Colors.text, fontSize: 32, fontWeight: '800', letterSpacing: -0.5 },
  notifButton: { padding: 5 },
  notificationBadge: { position: 'absolute', top: 6, right: 6, width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.danger },
  
  searchWrapper: { width: '100%' },
  searchWrapperActive: { marginTop: 10 }, 
  searchContainer: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: 16, 
    paddingHorizontal: 16, height: 52, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
  },
  searchContainerFocused: {
    borderColor: Colors.primary,
    backgroundColor: Platform.OS === 'ios' ? 'rgba(30, 41, 59, 1)' : Colors.surface,
  },
  searchInput: { flex: 1, marginLeft: 12, color: Colors.text, fontSize: 16, height: '100%' },
  cancelText: { color: Colors.textSecondary, fontSize: 14, fontWeight: '500', marginLeft: 8 },
});

export default CommunitySearchHeader;