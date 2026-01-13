import PropTypes from 'prop-types';
import { FiInbox, FiShoppingBag, FiHeart, FiBell, FiPackage } from 'react-icons/fi';

const EmptyState = ({ 
  icon = 'inbox',
  title = 'Nothing here yet',
  description = 'Items will appear here when available',
  actionLabel,
  onAction
}) => {
  const icons = {
    inbox: FiInbox,
    cart: FiShoppingBag,
    heart: FiHeart,
    bell: FiBell,
    package: FiPackage
  };

  const Icon = icons[icon] || FiInbox;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="bg-gray-100 rounded-full p-6 mb-4">
        <Icon className="text-gray-400 text-5xl" />
      </div>
      
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {title}
      </h3>
      
      <p className="text-gray-500 text-center mb-6 max-w-md">
        {description}
      </p>
      
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

EmptyState.propTypes = {
  icon: PropTypes.oneOf(['inbox', 'cart', 'heart', 'bell', 'package']),
  title: PropTypes.string,
  description: PropTypes.string,
  actionLabel: PropTypes.string,
  onAction: PropTypes.func
};

export default EmptyState;
