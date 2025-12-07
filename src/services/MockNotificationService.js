// @api/MockNotificationService.js

let NOTIFICATIONS_DATA = [
  {
    id: '1',
    type: 'guild',
    title: 'Guild Invitation',
    message: 'Dragon Slayers invited you to join their realm.',
    time: '2m ago',
    unread: true,
    timestamp: new Date(),
  },
  {
    id: '2',
    type: 'market',
    title: 'Offer Received',
    message: 'xX_Shadow_Xx made an offer on your Mythic Sword.',
    time: '1h ago',
    unread: true,
    timestamp: new Date(new Date().setHours(new Date().getHours() - 1)),
  },
  {
    id: '3',
    type: 'system',
    title: 'System Update',
    message: 'Maintenance scheduled for tonight at 00:00 UTC.',
    time: '5h ago',
    unread: false,
    timestamp: new Date(new Date().setDate(new Date().getDate() - 1)),
  },
  {
    id: '4',
    type: 'social',
    title: 'New Mention',
    message: 'Sarah replied to your discussion thread.',
    time: '1d ago',
    unread: false,
    timestamp: new Date(new Date().setDate(new Date().getDate() - 1)),
  },
  {
    id: '5',
    type: 'market',
    title: 'Item Sold',
    message: 'Your listing "Iron Helmet" was sold for 500 Gold.',
    time: '3d ago',
    unread: false,
    timestamp: new Date(new Date().setDate(new Date().getDate() - 3)),
  },
];

export const NotificationAPI = {
  getNotifications: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const sortedData = [...NOTIFICATIONS_DATA].sort((a, b) => b.timestamp - a.timestamp);
        resolve(sortedData);
      }, 1000);
    });
  },

  markAllAsRead: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        NOTIFICATIONS_DATA = NOTIFICATIONS_DATA.map(n => ({ ...n, unread: false }));
        resolve({ success: true });
      }, 500);
    });
  },

  markAsRead: async (id) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const notificationIndex = NOTIFICATIONS_DATA.findIndex(n => n.id === id);
        if (notificationIndex !== -1) {
          NOTIFICATIONS_DATA[notificationIndex].unread = false;
        }
        resolve({ success: true, id });
      }, 300);
    });
  },

  deleteMultipleNotifications: async (ids) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        NOTIFICATIONS_DATA = NOTIFICATIONS_DATA.filter(n => !ids.includes(n.id));
        console.log(`Mock Service: Deleted notifications with ids: ${ids.join(', ')}`);
        resolve({ success: true, ids });
      }, 400);
    });
  }
};