import { useState, useEffect } from 'react';
import { FiCheck, FiTrash2, FiPackage, FiShoppingBag, FiTruck, FiBell } from 'react-icons/fi';
import { useNotifications } from '../hooks';
import { formatDistanceToNow, isValid } from 'date-fns';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

const Notifications = () => {
  const {
    notifications,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll
  } = useNotifications();

  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case 'order':
        return <FiPackage className="text-blue-500" size={20} />;
      case 'product':
        return <FiShoppingBag className="text-green-500" size={20} />;
      case 'delivery':
        return <FiTruck className="text-purple-500" size={20} />;
      default:
        return <FiBell className="text-gray-500" size={20} />;
    }
  };

  const filterNotifications = () => {
    if (filter === 'all') return notifications;
    if (filter === 'unread') return notifications.filter((n) => !n.isRead);
    return notifications.filter((n) => n.type === filter);
  };

  const filteredNotifications = filterNotifications();

  const filters = [
    { value: 'all', label: 'All' },
    { value: 'unread', label: 'Unread' },
    { value: 'order', label: 'Orders' },
    { value: 'product', label: 'Products' },
    { value: 'delivery', label: 'Delivery' }
  ];

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading notifications..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Notifications</h1>
            <p className="text-gray-600">Stay updated with your activity</p>
          </div>

          {notifications.length > 0 && (
            <div className="flex gap-2">
              <button
                onClick={markAllAsRead}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors inline-flex items-center gap-2"
              >
                <FiCheck size={18} />
                Mark all read
              </button>
              <button
                onClick={clearAll}
                className="px-4 py-2 border border-red-300 text-red-600 rounded-lg font-medium hover:bg-red-50 transition-colors inline-flex items-center gap-2"
              >
                <FiTrash2 size={18} />
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {filters.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filter === f.value
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <EmptyState
            icon="bell"
            title="No notifications"
            description={
              filter === 'all'
                ? "You're all caught up! New notifications will appear here."
                : `No ${filter} notifications found.`
            }
          />
        ) : (
          <div className="bg-white rounded-xl shadow-sm divide-y divide-gray-100">
            {filteredNotifications.map((notification) => (
              <div
                key={notification._id || notification.id}
                className={`p-4 hover:bg-gray-50 transition-colors ${
                  !notification.isRead ? 'bg-indigo-50/30' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {getIcon(notification.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p
                        className={`text-sm ${
                          !notification.isRead
                            ? 'font-semibold text-gray-900'
                            : 'font-medium text-gray-700'
                        }`}
                      >
                        {notification.title}
                      </p>
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-indigo-600 rounded-full flex-shrink-0 mt-1" />
                      )}
                    </div>

                    <p className="text-sm text-gray-600 mb-2">
                      {notification.message}
                    </p>

                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-400">
                        {(() => {
                          const ts = notification.timestamp || notification.createdAt;
                          const d = ts ? new Date(ts) : null;
                          if (!d || !isValid(d)) return 'Just now';
                          return formatDistanceToNow(d, { addSuffix: true });
                        })()}
                      </p>

                      <div className="flex items-center gap-2">
                        {!notification.isRead && (notification._id || notification.id) && (
                          <button
                            onClick={() =>
                              markAsRead(notification._id || notification.id)
                            }
                            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                          >
                            Mark as read
                          </button>
                        )}
                        {(notification._id || notification.id) && (
                          <button
                            onClick={() =>
                              deleteNotification(notification._id || notification.id)
                            }
                            className="text-xs text-red-600 hover:text-red-800 font-medium"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
