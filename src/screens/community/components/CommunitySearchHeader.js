import React, { useEffect, useRef } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, 
  LayoutAnimation, Keyboard, Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Colors } from '@config/Colors'; 
import { useNotifications } from '@context/main/NotificationContext'; 

const THEME = {
    background: '#050505',
    surface: 'rgba(255,255,255,0.04)',
    surfaceFocused: 'rgba(255,255,255,0.08)',
    border: 'rgba(255,255,255,0.08)',
    textSecondary: '#94a3b8',
    rimLight: 'rgba(255,255,255,0.12)'
};

const CommunitySearchHeader = ({ 
  searchText, 
  setSearchText, 
  isFocused, 
  setIsFocused, 
  navigation 
}) => {
  const inputRef = useRef(null);
  const { unreadCount } = useNotifications();

  // Handle Animation when focus state changes (UNCHANGED)
  useEffect(() => {
    LayoutAnimation.configureNext({
      duration: 300,
      create: { type: LayoutAnimation.Types.easeInEaseOut, property: LayoutAnimation.Properties.opacity },
      update: { type: LayoutAnimation.Types.spring, springDamping: 0.7 },
      delete: { type: LayoutAnimation.Types.easeInEaseOut, property: LayoutAnimation.Properties.opacity },
    });
  }, [isFocused]);

  const handleCancel = () => {
    setSearchText('');
    Keyboard.dismiss();
    setIsFocused(false);
  };

  const handleFocus = () => setIsFocused(true);

  const showTitle = !isFocused && !searchText;

  return (
    <View style={styles.container}>
      {/* Top Header: Title & Notification */}
      {showTitle && (
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.welcomeText}>Welcome back</Text>
            <Text style={styles.titleText}>Community Hub</Text>
          </View>
          <TouchableOpacity 
            activeOpacity={0.7}
            style={styles.notifButton}
            onPress={() => navigation.navigate('Notifications')}
          >
            <View style={styles.iconCircle}>
                <Ionicons name="notifications-outline" size={22} color={Colors.text} />
                {unreadCount > 0 && (
                    <View style={styles.glowContainer}>
                        <View style={styles.notifBadge} />
                        <View style={styles.notifPulse} />
                    </View>
                )} 
            </View>
          </TouchableOpacity>
        </View>
      )}

      {/* Search Bar - Modern Glass style */}
      <View style={[styles.searchWrapper, !showTitle && styles.searchWrapperActive]}>
        <View style={[
            styles.searchContainer, 
            isFocused && styles.searchContainerFocused,
            !showTitle && styles.searchContainerFull
        ]}>
          <Ionicons 
            name="search-outline" 
            size={18} 
            color={isFocused ? Colors.primary : THEME.textSecondary} 
          />
          <TextInput 
            ref={inputRef}
            placeholder="Search realms, guilds, items..." 
            placeholderTextColor="#475569"
            style={styles.searchInput}
            selectionColor={Colors.primary}
            value={searchText}
            onChangeText={setSearchText}
            onFocus={handleFocus}
            returnKeyType="search"
            autoCorrect={false}
          />
          
          {(searchText.length > 0 || isFocused) && (
            <TouchableOpacity 
                onPress={handleCancel} 
                style={styles.cancelBtn}
                hitSlop={{top: 15, bottom: 15, left: 15, right: 15}}
            >
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
    backgroundColor: 'transparent',
    zIndex: 100,
    paddingBottom: 12,
  },
  headerTop: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 24,
    height: 60,
  },
  welcomeText: { 
    color: THEME.textSecondary, 
    fontSize: 11, 
    fontWeight: '800', 
    textTransform: 'uppercase', 
    letterSpacing: 1.5,
    marginBottom: 2
  },
  titleText: { 
    color: '#FFF', 
    fontSize: 34, 
    fontWeight: '900', 
    letterSpacing: -1 
  },
  
  // Notification Icon Styling
  notifButton: { position: 'relative' },
  iconCircle: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: THEME.surface,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: THEME.border
  },
  glowContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifBadge: { 
    width: 8, 
    height: 8, 
    borderRadius: 4, 
    backgroundColor: Colors.primary,
    zIndex: 2
  },
  notifPulse: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.primary,
    opacity: 0.3,
  },
  
  // Search Bar Styling
  searchWrapper: { width: '100%' },
  searchWrapperActive: { marginTop: Platform.OS === 'ios' ? 0 : 10 }, 
  searchContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: THEME.surface, 
    borderRadius: 20, 
    paddingHorizontal: 16, 
    height: 54, 
    borderWidth: 1, 
    borderColor: THEME.border,
  },
  searchContainerFocused: {
    borderColor: Colors.primary,
    backgroundColor: THEME.surfaceFocused,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  searchContainerFull: {
      height: 50,
      borderRadius: 25,
  },
  searchInput: { 
    flex: 1, 
    marginLeft: 10, 
    color: '#FFF', 
    fontSize: 15, 
    fontWeight: '600',
    height: '100%' 
  },
  cancelBtn: {
      paddingLeft: 10,
      borderLeftWidth: 1,
      borderLeftColor: THEME.border,
      marginLeft: 10,
  },
  cancelText: { 
    color: Colors.primary, 
    fontSize: 13, 
    fontWeight: '800', 
    textTransform: 'uppercase'
  },
});

export default CommunitySearchHeader;