// @api/MockNotificationService.js

// Change from 'const' to 'let' to make the array mutable
let NOTIFICATIONS_DATA = [
  {
    id: '1',
    type: 'guild',
    title: 'Guild Invitation',
    message: 'Dragon Slayers invited you to join their realm.',
    time: '2m ago',
    unread: true,
    timestamp: new Date(), // Today
  },
  {
    id: '2',
    type: 'market',
    title: 'Offer Received',
    message: 'xX_Shadow_Xx made an offer on your Mythic Sword.',
    time: '1h ago',
    unread: true,
    timestamp: new Date(new Date().setHours(new Date().getHours() - 1)), // Today
  },
  {
    id: '3',
    type: 'system',
    title: 'System Update',
    message: 'Maintenance scheduled for tonight at 00:00 UTC.',
    time: '5h ago',
    unread: false,
    timestamp: new Date(new Date().setDate(new Date().getDate() - 1)), // Yesterday
  },
  {
    id: '4',
    type: 'social',
    title: 'New Mention',
    message: 'Sarah replied to your discussion thread.',
    time: '1d ago',
    unread: false,
    timestamp: new Date(new Date().setDate(new Date().getDate() - 1)), // Yesterday
  },
  {
    id: '5',
    type: 'market',
    title: 'Item Sold',
    message: 'Your listing "Iron Helmet" was sold for 500 Gold.',
    time: '3d ago',
    unread: false,
    timestamp: new Date(new Date().setDate(new Date().getDate() - 3)), // Earlier
  },
];

export const NotificationAPI = {
  getNotifications: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Return a fresh, sorted copy of the potentially modified data
        const sortedData = [...NOTIFICATIONS_DATA].sort((a, b) => b.timestamp - a.timestamp);
        resolve(sortedData);
      }, 1000);
    });
  },

  markAllAsRead: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // FIX: Actually modify the source data
        NOTIFICATIONS_DATA = NOTIFICATIONS_DATA.map(n => ({ ...n, unread: false }));
        resolve({ success: true });
      }, 500);
    });
  },

  markAsRead: async (id) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // FIX: Find and modify the specific notification in the source data
        const notificationIndex = NOTIFICATIONS_DATA.findIndex(n => n.id === id);
        if (notificationIndex !== -1) {
          NOTIFICATIONS_DATA[notificationIndex].unread = false;
        }
        resolve({ success: true, id });
      }, 300);
    });
  },
  
  deleteNotification: async (id) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        NOTIFICATIONS_DATA = NOTIFICATIONS_DATA.filter(n => n.id !== id);
        console.log(`Mock Service: Deleted notification with id: ${id}`);
        resolve({ success: true, id });
      }, 400);
    });
  }
};