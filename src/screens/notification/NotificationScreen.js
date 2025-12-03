import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar, 
  Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NOTIFICATIONS } from '../../constants/mockData'; // Import the new data

const NotificationScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState(NOTIFICATIONS);

  // Helper to get icon based on notification type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'guild': return { name: 'shield-checkmark', color: '#8B5CF6' }; // Violet
      case 'market': return { name: 'cart', color: '#10B981' }; // Emerald
      case 'system': return { name: 'information-circle', color: '#3B82F6' }; // Blue
      case 'social': return { name: 'chatbubble-ellipses', color: '#F59E0B' }; // Amber
      default: return { name: 'notifications', color: '#94A3B8' };
    }
  };

  const handleMarkAllRead = () => {
    const updated = notifications.map(n => ({ ...n, unread: false }));
    setNotifications(updated);
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="#F8FAFC" />
      </TouchableOpacity>
      
      <Text style={styles.headerTitle}>Notifications</Text>
      
      <TouchableOpacity onPress={handleMarkAllRead}>
        <Text style={styles.markReadText}>Read All</Text>
      </TouchableOpacity>
    </View>
  );

  const renderItem = ({ item }) => {
    const iconData = getNotificationIcon(item.type);

    return (
      <TouchableOpacity activeOpacity={0.7} style={[styles.card, item.unread && styles.unreadCard]}>
        {/* Icon Container */}
        <View style={[styles.iconContainer, { backgroundColor: `${iconData.color}20` }]}>
          <Ionicons name={iconData.name} size={22} color={iconData.color} />
          {item.unread && <View style={styles.unreadDot} />}
        </View>

        {/* Text Content */}
        <View style={styles.textContainer}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, item.unread && styles.unreadText]}>
              {item.title}
            </Text>
            <Text style={styles.timeText}>{item.time}</Text>
          </View>
          <Text style={styles.messageText} numberOfLines={2}>
            {item.message}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
      
      {/* Header */}
      {renderHeader()}

      {/* List */}
      <FlatList
        data={notifications}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off-outline" size={48} color="#334155" />
            <Text style={styles.emptyText}>No new notifications</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#0F172A' 
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 20 : 10,
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  markReadText: {
    fontSize: 14,
    color: '#6366F1', // Indigo
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#1E293B', // Slate 800
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  unreadCard: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
    borderLeftWidth: 4,
    borderLeftColor: '#6366F1', // Accent color on left for unread
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    position: 'relative',
  },
  unreadDot: {
    position: 'absolute',
    top: 10,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444', // Red dot
    borderWidth: 1.5,
    borderColor: '#1E293B',
  },
  textContainer: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E2E8F0',
  },
  unreadText: {
    color: '#F8FAFC', // Brighter white for unread
    fontWeight: '700',
  },
  timeText: {
    fontSize: 12,
    color: '#64748B',
  },
  messageText: {
    fontSize: 14,
    color: '#94A3B8',
    lineHeight: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  emptyText: {
    marginTop: 10,
    color: '#64748B',
    fontSize: 16,
  }
});

export default NotificationScreen;