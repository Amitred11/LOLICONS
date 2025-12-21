// screens/NotificationScreen.js

import React, { useMemo, useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  SectionList,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import { Colors } from '@config/Colors'; // Assuming Colors.background is #050505 or similar
import { useNotifications } from '@context/main/NotificationContext';
import { useAlert } from '@context/other/AlertContext';

const THEME = {
    background: '#050505',
    surface: '#121214',
    surfaceLight: '#1e1e21',
    border: 'rgba(255,255,255,0.06)',
    glass: 'rgba(255,255,255,0.03)',
};

// Helper function to group notifications by date (UNCHANGED)
const groupNotificationsByDate = (notifications) => {
  const groups = { Today: [], Yesterday: [], Earlier: [] };
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  notifications.forEach(item => {
    const itemDate = new Date(item.timestamp);
    if (itemDate.toDateString() === today.toDateString()) {
      groups.Today.push(item);
    } else if (itemDate.toDateString() === yesterday.toDateString()) {
      groups.Yesterday.push(item);
    } else {
      groups.Earlier.push(item);
    }
  });

  return Object.keys(groups)
    .map(key => ({ title: key, data: groups[key] }))
    .filter(section => section.data.length > 0);
};

const NotificationScreen = ({ navigation }) => {
  const {
    notifications,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    unreadCount,
    deleteMultipleNotifications,
  } = useNotifications();
  const { showAlert } = useAlert();

  const [selectedIds, setSelectedIds] = useState([]);

  const isSelectionMode = selectedIds.length > 0;

  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
      setSelectedIds([]);
    }, [fetchNotifications])
  );

  const groupedNotifications = useMemo(() => groupNotificationsByDate(notifications), [notifications]);

  // --- LOGIC HANDLERS (UNCHANGED) ---
  const handleLongPress = (id) => {
    if (!isSelectionMode) {
        setSelectedIds([id]);
    }
  };

  const handlePress = (item) => {
    if (isSelectionMode) {
      if (selectedIds.includes(item.id)) {
        setSelectedIds(selectedIds.filter(id => id !== item.id));
      } else {
        setSelectedIds([...selectedIds, item.id]);
      }
    } else {
        markAsRead(item.id);
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.length === notifications.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(notifications.map(n => n.id));
    }
  };

  const handleDeleteSelected = () => {
    showAlert({
        title: 'Delete Notifications',
        message: `Are you sure you want to remove ${selectedIds.length} item(s)?`,
        type: 'error',
        btnText: 'Delete',
        onClose: () => {
            deleteMultipleNotifications(selectedIds);
            setSelectedIds([]);
        },
        secondaryBtnText: 'Cancel',
    });
  };

  const getNotificationIcon = (type) => {
    switch (type) {
        case 'guild': return { name: 'shield-outline', color: '#818cf8' };
        case 'market': return { name: 'bag-handle-outline', color: '#fbbf24' };
        case 'system': return { name: 'cog-outline', color: '#94a3b8' };
        case 'social': return { name: 'chatbubbles-outline', color: Colors.primary };
        case 'alert': return { name: 'warning-outline', color: '#ef4444' };
        default: return { name: 'notifications-outline', color: '#94a3b8' };
    }
  };

  // --- RENDER COMPONENTS ---

  const renderDefaultHeader = () => (
    <View style={styles.headerOuter}>
        <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={styles.headerInner}>
            <TouchableOpacity style={styles.circleBtn} onPress={() => navigation.goBack()}>
                <Ionicons name="chevron-back" size={22} color={Colors.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Notif</Text>
            <TouchableOpacity 
                onPress={markAllAsRead} 
                disabled={unreadCount === 0}
                style={styles.actionBtn}
            >
                <Text style={[styles.markReadText, unreadCount === 0 && styles.disabledText]}>
                    Clear
                </Text>
            </TouchableOpacity>
        </View>
    </View>
  );

  const renderSelectionHeader = () => (
    <View style={[styles.headerOuter, { backgroundColor: Colors.primary + '15' }]}>
        <View style={styles.headerInner}>
            <TouchableOpacity style={styles.circleBtn} onPress={() => setSelectedIds([])}>
                <Ionicons name="close" size={22} color={Colors.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{selectedIds.length} selected</Text>
            <View style={styles.selectionActions}>
                <TouchableOpacity onPress={handleSelectAll} style={{ marginRight: 15 }}>
                    <Text style={styles.markReadText}>
                        {selectedIds.length === notifications.length ? 'None' : 'All'}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleDeleteSelected} style={styles.trashBtn}>
                    <Ionicons name="trash-outline" size={20} color="#ef4444" />
                </TouchableOpacity>
            </View>
        </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconCircle}>
        <Ionicons name="mail-open-outline" size={42} color={THEME.surfaceLight} />
      </View>
      <Text style={styles.emptyTitle}>No Notifications</Text>
      <Text style={styles.emptySubtitle}>We'll let you know when something important happens.</Text>
    </View>
  );

  const renderItem = ({ item }) => {
    const iconData = getNotificationIcon(item.type);
    const isSelected = selectedIds.includes(item.id);

    return (
        <TouchableOpacity
          activeOpacity={0.9}
          style={[
              styles.card, 
              isSelected && styles.cardSelected,
              item.unread && styles.cardUnread
          ]}
          onLongPress={() => handleLongPress(item.id)}
          onPress={() => handlePress(item)}
        >
          {item.unread && <View style={styles.unreadBar} />}
          
          <View style={[styles.iconBox, { backgroundColor: `${iconData.color}15` }]}>
            <Ionicons name={iconData.name} size={22} color={iconData.color} />
          </View>

          <View style={styles.content}>
            <View style={styles.row}>
              <Text style={[styles.title, item.unread ? styles.bold : styles.regular]} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={styles.time}>{item.time}</Text>
            </View>
            <Text style={styles.message} numberOfLines={2}>{item.message}</Text>
          </View>

          {isSelectionMode && (
              <View style={[styles.checkCircle, isSelected && styles.checkCircleActive]}>
                  {isSelected && <Ionicons name="checkmark" size={12} color="white" />}
              </View>
          )}
        </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      {/* List Content */}
      <View style={{ flex: 1 }}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={Colors.primary} />
          </View>
        ) : (
          <SectionList
            sections={groupedNotifications}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            renderSectionHeader={({ section: { title } }) => (
              <View style={styles.sectionHeaderBox}>
                 <Text style={styles.sectionHeaderText}>{title}</Text>
              </View>
            )}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={renderEmptyState}
            stickySectionHeadersEnabled={false}
          />
        )}
      </View>

      {/* Floating Header */}
      {isSelectionMode ? renderSelectionHeader() : renderDefaultHeader()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  // HEADER
  headerOuter: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight + 10,
    paddingBottom: 15,
    zIndex: 100,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  headerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  circleBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: THEME.glass,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: THEME.border
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: Colors.text, letterSpacing: -0.5 },
  selectionActions: { flexDirection: 'row', alignItems: 'center' },
  actionBtn: { paddingVertical: 6, paddingHorizontal: 12 },
  markReadText: { fontSize: 13, color: Colors.primary, fontWeight: '700' },
  disabledText: { color: Colors.textSecondary, opacity: 0.5 },
  trashBtn: { 
      width: 34, height: 34, borderRadius: 17, 
      backgroundColor: 'rgba(239, 68, 68, 0.1)', 
      alignItems: 'center', justifyContent: 'center' 
  },

  // LIST
  listContent: { paddingHorizontal: 16, paddingTop: 130, paddingBottom: 40 },
  sectionHeaderBox: { paddingVertical: 15, paddingLeft: 4 },
  sectionHeaderText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // CARD
  card: {
    flexDirection: 'row',
    backgroundColor: THEME.surface,
    borderRadius: 20,
    padding: 14,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.border,
    overflow: 'hidden'
  },
  cardUnread: {
    backgroundColor: '#16161a',
    borderColor: 'rgba(255,255,255,0.12)',
  },
  cardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '08',
  },
  unreadBar: {
    position: 'absolute',
    left: 0, top: '25%', bottom: '25%',
    width: 3,
    backgroundColor: Colors.primary,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  iconBox: {
    width: 48, height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  content: { flex: 1 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: { fontSize: 15, flex: 1, marginRight: 8 },
  bold: { fontWeight: '800', color: Colors.text },
  regular: { fontWeight: '600', color: Colors.textSecondary },
  time: { fontSize: 11, color: '#64748b', fontWeight: '600' },
  message: { fontSize: 13, color: '#94a3b8', lineHeight: 18, fontWeight: '500' },
  
  checkCircle: {
      width: 20, height: 20, borderRadius: 10,
      borderWidth: 2, borderColor: THEME.border,
      marginLeft: 10, alignItems: 'center', justifyContent: 'center'
  },
  checkCircleActive: {
      backgroundColor: Colors.primary,
      borderColor: Colors.primary,
  },

  // EMPTY
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 100 },
  emptyIconCircle: {
    width: 90, height: 90,
    borderRadius: 45,
    backgroundColor: THEME.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1, borderColor: THEME.border
  },
  emptyTitle: { fontSize: 20, fontWeight: '900', color: Colors.text, marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', paddingHorizontal: 40, lineHeight: 20 },
});

export default NotificationScreen;