// api/MockNotificationService.js

// The raw data provided
const NOTIFICATIONS_DATA = [
  {
    id: '1',
    type: 'guild',
    title: 'Guild Invitation',
    message: 'Dragon Slayers invited you to join their realm.',
    time: '2m ago',
    unread: true,
  },
  {
    id: '2',
    type: 'market',
    title: 'Offer Received',
    message: 'xX_Shadow_Xx made an offer on your Mythic Sword.',
    time: '1h ago',
    unread: true,
  },
  {
    id: '3',
    type: 'system',
    title: 'System Update',
    message: 'Maintenance scheduled for tonight at 00:00 UTC.',
    time: '5h ago',
    unread: false,
  },
  {
    id: '4',
    type: 'social',
    title: 'New Mention',
    message: 'Sarah replied to your discussion thread.',
    time: '1d ago',
    unread: false,
  },
  {
    id: '5',
    type: 'market',
    title: 'Item Sold',
    message: 'Your listing "Iron Helmet" was sold for 500 Gold.',
    time: '2d ago',
    unread: false,
  },
];

export const NotificationAPI = {
  /**
   * Simulates fetching notifications from a backend.
   * Returns a promise that resolves after a short delay.
   */
  getNotifications: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Return a fresh copy of the data
        resolve([...NOTIFICATIONS_DATA]);
      }, 1000); // 1 second simulated network delay
    });
  },

  /**
   * Simulates marking all items as read.
   */
  markAllAsRead: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true });
      }, 500);
    });
  },

  /**
   * Simulates marking a specific item as read.
   */
  markAsRead: async (id) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, id });
      }, 300);
    });
  }
};