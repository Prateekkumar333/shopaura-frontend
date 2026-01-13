import { useNotification } from '../context/NotificationContext';

// Custom hook for easier notification access
export const useNotifications = () => {
  const context = useNotification();

  return {
    notifications: context.notifications,
    unreadCount: context.unreadCount,
    loading: context.loading,
    fetchNotifications: context.fetchNotifications,
    markAsRead: context.markAsRead,
    markAllAsRead: context.markAllAsRead,
    deleteNotification: context.deleteNotification,
    clearAll: context.clearAll
  };
};

export default useNotifications;
