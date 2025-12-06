import React, { useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar, 
  Platform,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@config/Colors'; 
import { useNotifications } from '@context/main/NotificationContext'; // Import Hook

const NotificationScreen = ({ navigation }) => {
  // 1. Use Context
  const { 
    notifications, 
    isLoading, 
    fetchNotifications, 
    markAsRead, 
    markAllAsRead 
  } = useNotifications();

  // 2. Fetch on mount
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'guild': return { name: 'shield-checkmark', color: Colors.primary };
      case 'market': return { name: 'cart', color: Colors.secondary };
      case 'system': return { name: 'information-circle', color: Colors.textSecondary };
      case 'social': return { name: 'chatbubble-ellipses', color: Colors.primary };
      case 'alert': return { name: 'alert-circle', color: Colors.danger };
      default: return { name: 'notifications', color: Colors.textSecondary };
    }
  };

  const handleMarkAllRead = () => {
    if (notifications.length > 0) {
      markAllAsRead();
    }
  };

  const handleNotificationPress = (id) => {
    markAsRead(id);
    // You could also navigate to specific screens here based on notification type
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color={Colors.text} />
      </TouchableOpacity>
      
      <Text style={styles.headerTitle}>Notifications</Text>
      
      <TouchableOpacity 
        onPress={handleMarkAllRead} 
        disabled={notifications.length === 0 || isLoading}
      >
        <Text style={[
          styles.markReadText, 
          (notifications.length === 0 || isLoading) && styles.disabledText
        ]}>
          Read All
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconCircle}>
        <Ionicons name="notifications-off" size={40} color={Colors.textSecondary} />
      </View>
      <Text style={styles.emptyTitle}>No Notifications</Text>
      <Text style={styles.emptySubtitle}>
        You're all caught up! Check back later for updates.
      </Text>
    </View>
  );

  const renderItem = ({ item }) => {
    const iconData = getNotificationIcon(item.type);

    return (
      <TouchableOpacity 
        activeOpacity={0.8} 
        style={[styles.card, item.unread && styles.unreadCard]}
        onPress={() => handleNotificationPress(item.id)}
      >
        {/* Icon */}
        <View style={[styles.iconContainer, { borderColor: iconData.color }]}>
          <Ionicons name={iconData.name} size={20} color={iconData.color} />
        </View>

        {/* Content */}
        <View style={styles.textContainer}>
          <View style={styles.cardHeader}>
            <Text 
              style={[styles.cardTitle, item.unread ? styles.titleUnread : styles.titleRead]}
              numberOfLines={1}
            >
              {item.title}
            </Text>
            <Text style={styles.timeText}>{item.time}</Text>
          </View>
          
          <Text style={styles.messageText} numberOfLines={2}>
            {item.message}
          </Text>
        </View>

        {/* Unread Dot */}
        {item.unread && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      
      {renderHeader()}

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: Colors.background 
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 20 : 10,
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    letterSpacing: 0.5,
  },
  markReadText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  disabledText: {
    color: Colors.textSecondary,
    opacity: 0.5,
  },
  listContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent', 
  },
  unreadCard: {
    borderColor: `${Colors.primary}40`,
    backgroundColor: Colors.surface,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    backgroundColor: `${Colors.background}80`,
    borderWidth: 1,
  },
  textContainer: {
    flex: 1,
    marginRight: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 16,
    flex: 1,
    marginRight: 10,
  },
  titleUnread: {
    fontWeight: '700',
    color: Colors.text,
  },
  titleRead: {
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  timeText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '400',
  },
  messageText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
    opacity: 0.8,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.secondary,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    maxWidth: '70%',
    lineHeight: 20,
  }
});

export default NotificationScreen;