import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { FiX, FiPackage, FiShoppingBag, FiTruck, FiBell } from 'react-icons/fi';
import { useNotifications } from '../hooks';
import { formatDistanceToNow, isValid } from 'date-fns';
import EmptyState from './EmptyState';
import LoadingSpinner from './LoadingSpinner';

const NotificationDropdown = ({ onClose }) => {
  const dropdownRef = useRef(null);
  const { notifications, loading, markAsRead, markAllAsRead } = useNotifications();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const getIcon = (type) => {
    switch (type) {
      case 'order':
        return <FiPackage className="text-blue-500" />;
      case 'product':
        return <FiShoppingBag className="text-green-500" />;
      case 'delivery':
        return <FiTruck className="text-purple-500" />;
      default:
        return <FiBell className="text-gray-500" />;
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.isRead && notification._id) {
      markAsRead(notification._id);
    }
    onClose();
  };

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-[600px] overflow-hidden flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900">Notifications</h3>
        <div className="flex items-center gap-2">
          {notifications.length > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
            >
              Mark all read
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiX size={18} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="overflow-y-auto flex-1">
        {loading ? (
          <div className="py-8">
            <LoadingSpinner size="md" message="Loading notifications..." />
          </div>
        ) : notifications.length === 0 ? (
          <EmptyState
            icon="bell"
            title="No notifications"
            description="You're all caught up! New notifications will appear here."
          />
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.slice(0, 10).map((notification) => (
              <button
                key={notification._id || notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`w-full px-4 py-3 hover:bg-gray-50 transition-colors text-left ${
                  !notification.isRead ? 'bg-indigo-50/50' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {getIcon(notification.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
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

                    <p className="text-sm text-gray-600 mt-1">
                      {notification.message}
                    </p>

                    <p className="text-xs text-gray-400 mt-1">
                      {(() => {
                        const ts = notification.timestamp || notification.createdAt;
                        const d = ts ? new Date(ts) : null;
                        if (!d || !isValid(d)) return 'Just now';
                        return formatDistanceToNow(d, { addSuffix: true });
                      })()}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="border-t border-gray-200 px-4 py-3">
          <Link
            to="/notifications"
            onClick={onClose}
            className="block text-center text-sm text-indigo-600 hover:text-indigo-800 font-medium"
          >
            View all notifications
          </Link>
        </div>
      )}
    </div>
  );
};

NotificationDropdown.propTypes = {
  onClose: PropTypes.func.isRequired
};

export default NotificationDropdown;
