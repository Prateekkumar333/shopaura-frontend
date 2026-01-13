import API from './api';

// Notification Services
export const notificationService = {
  // Get all notifications
  getAllNotifications: async (page = 1, limit = 20, unreadOnly = false) => {
    const response = await API.get(`/notifications?page=${page}&limit=${limit}&unreadOnly=${unreadOnly}`);
    return response.data;
  },

  // Get unread count
  getUnreadCount: async () => {
    const response = await API.get('/notifications/unread-count');
    return response.data;
  },

  // Mark notification as read
  markAsRead: async (notificationId) => {
    const response = await API.put(`/notifications/${notificationId}/read`);
    return response.data;
  },

  // Mark all as read
  markAllAsRead: async () => {
    const response = await API.put('/notifications/read-all');
    return response.data;
  },

  // Delete notification
  deleteNotification: async (notificationId) => {
    const response = await API.delete(`/notifications/${notificationId}`);
    return response.data;
  },

  // Clear all notifications
  clearAll: async () => {
    const response = await API.delete('/notifications/clear-all');
    return response.data;
  }
};

export default notificationService;
