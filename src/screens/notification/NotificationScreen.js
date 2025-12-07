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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Colors } from '@config/Colors';
import { useNotifications } from '@context/main/NotificationContext';
import { useAlert } from '@context/other/AlertContext';

// Helper function to group notifications by date
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

  // --- MODIFIED: Uses the new AlertContext structure ---
  const handleDeleteSelected = () => {
    showAlert({
        title: 'Confirm Deletion',
        message: `Are you sure you want to delete ${selectedIds.length} notification(s)? This action cannot be undone.`,
        type: 'error', // Use 'error' for the red icon
        btnText: 'Delete',
        onClose: () => { // Primary action
            deleteMultipleNotifications(selectedIds);
            setSelectedIds([]);
        },
        secondaryBtnText: 'Cancel', // Secondary action
        onSecondaryPress: () => {}, // Closes the alert by default
    });
  };

  const getNotificationIcon = (type) => {
    switch (type) {
        case 'guild': return { name: 'shield-checkmark-outline', color: Colors.primary };
        case 'market': return { name: 'cart-outline', color: Colors.secondary };
        case 'system': return { name: 'information-circle-outline', color: Colors.textSecondary };
        case 'social': return { name: 'chatbubble-ellipses-outline', color: Colors.primary };
        case 'alert': return { name: 'alert-circle-outline', color: Colors.danger };
        default: return { name: 'notifications-outline', color: Colors.textSecondary };
    }
  };

  const renderDefaultHeader = () => (
    <View style={styles.headerContainer}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color={Colors.text} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Notifications</Text>
      <TouchableOpacity onPress={markAllAsRead} disabled={unreadCount === 0}>
        <Text style={[styles.markReadText, unreadCount === 0 && styles.disabledText]}>
          Read All
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderSelectionHeader = () => (
    <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => setSelectedIds([])}>
            <Ionicons name="close" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{selectedIds.length} selected</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center'}}>
            <TouchableOpacity onPress={handleSelectAll}>
                <Text style={styles.markReadText}>
                {selectedIds.length === notifications.length ? 'Deselect All' : 'Select All'}
                </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDeleteSelected} style={{ marginLeft: 20 }}>
                <Ionicons name="trash-outline" size={24} color={Colors.danger} />
            </TouchableOpacity>
        </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconCircle}>
        <Ionicons name="notifications-off-outline" size={40} color={Colors.textSecondary} />
      </View>
      <Text style={styles.emptyTitle}>All Clear!</Text>
      <Text style={styles.emptySubtitle}>You have no new notifications.</Text>
    </View>
  );

  const renderItem = ({ item }) => {
    const iconData = getNotificationIcon(item.type);
    const isSelected = selectedIds.includes(item.id);

    return (
      // --- REMOVED Animated.View and style ---
      <View>
        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.card, isSelected && styles.cardSelected]}
          onLongPress={() => handleLongPress(item.id)}
          onPress={() => handlePress(item)}
        >
          {item.unread && <View style={styles.unreadIndicator} />}
          <View style={[styles.iconContainer, { backgroundColor: `${iconData.color}20` }]}>
            <Ionicons name={iconData.name} size={24} color={iconData.color} />
          </View>
          <View style={styles.textContainer}>
            <View style={styles.cardHeader}>
              <Text style={[styles.cardTitle, item.unread ? styles.titleUnread : styles.titleRead]} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={styles.timeText}>{item.time}</Text>
            </View>
            <Text style={styles.messageText} numberOfLines={2}>{item.message}</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      {isSelectionMode ? renderSelectionHeader() : renderDefaultHeader()}

      <View style={{ flex: 1 }}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : (
          <SectionList
            sections={groupedNotifications}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            renderSectionHeader={({ section: { title } }) => (
              <Text style={styles.sectionHeader}>{title}</Text>
            )}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={renderEmptyState}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 45,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surface,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: Colors.text },
  markReadText: { fontSize: 14, color: Colors.primary, fontWeight: '600' },
  disabledText: { color: Colors.textSecondary, opacity: 0.7 },
  listContent: { paddingHorizontal: 20, paddingBottom: 40, flexGrow: 1 },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    paddingVertical: 12,
    marginTop: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  cardSelected: {
    backgroundColor: Colors.primary + '20',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  unreadIndicator: {
    position: 'absolute',
    top: 18,
    left: 6,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: { flex: 1 },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardTitle: { fontSize: 16, flex: 1, marginRight: 10 },
  titleUnread: { fontWeight: 'bold', color: Colors.text },
  titleRead: { fontWeight: '500', color: Colors.textSecondary },
  timeText: { fontSize: 12, color: Colors.textSecondary },
  messageText: { fontSize: 13, color: Colors.textSecondary, lineHeight: 18 },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 50 },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: Colors.text, marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20 },
});

export default NotificationScreen;