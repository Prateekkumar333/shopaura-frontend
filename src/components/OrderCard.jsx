// src/components/OrderCard.jsx
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { FiPackage, FiTruck, FiCheck, FiX, FiEye, FiDownload } from 'react-icons/fi';
import { format } from 'date-fns';

const OrderCard = ({ order }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-purple-100 text-purple-800';
      case 'shipped':
        return 'bg-indigo-100 text-indigo-800';
      case 'out_for_delivery':
        return 'bg-cyan-100 text-cyan-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered':
        return <FiCheck />;
      case 'shipped':
      case 'out_for_delivery':
        return <FiTruck />;
      case 'cancelled':
        return <FiX />;
      default:
        return <FiPackage />;
    }
  };

  const formatStatus = (status) => {
    if (!status) return 'Unknown';
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
        <div>
          <p className="text-sm text-gray-500">Order #{order.orderNumber}</p>
          <p className="text-xs text-gray-400 mt-1">
            Placed on {format(new Date(order.createdAt), 'MMM dd, yyyy')}
          </p>
        </div>
        
        <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${getStatusColor(order.orderStatus)}`}>
          {getStatusIcon(order.orderStatus)}
          {formatStatus(order.orderStatus)}
        </span>
      </div>

      {/* Items */}
      <div className="space-y-3 mb-4">
        {order.items.slice(0, 2).map((item, index) => (
          <div key={item._id || index} className="flex items-center gap-3">
            <img
              src={
                item.product?.images?.[0]?.url ||
                item.images?.[0]?.url ||
                item.image ||
                '/placeholder.png'
              }
              alt={item.product?.name || item.name}
              className="w-16 h-16 object-cover rounded-lg"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {item.product?.name || item.name}
              </p>
              <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
            </div>
            <p className="text-sm font-semibold text-gray-900">
              ₹{item.price.toLocaleString()}
            </p>
          </div>
        ))}
        
        {order.items.length > 2 && (
          <p className="text-sm text-gray-500">
            +{order.items.length - 2} more item{order.items.length - 2 > 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
        <div>
          <p className="text-xs text-gray-500">Total Amount</p>
          <p className="text-lg font-bold text-gray-900">
            ₹{order.totalPrice.toLocaleString()}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={`/orders/${order._id}`}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            <FiEye size={16} />
            View Details
          </Link>
          
          {order.orderStatus === 'delivered' && (
            <Link
              to={`/orders/${order._id}/invoice`}
              className="p-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
              title="Download Invoice"
            >
              <FiDownload size={16} />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

OrderCard.propTypes = {
  order: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    orderNumber: PropTypes.string.isRequired,
    orderStatus: PropTypes.string.isRequired,
    items: PropTypes.arrayOf(PropTypes.shape({
      _id: PropTypes.string,
      name: PropTypes.string,
      product: PropTypes.object,
      image: PropTypes.string,
      images: PropTypes.array,
      quantity: PropTypes.number.isRequired,
      price: PropTypes.number.isRequired
    })).isRequired,
    totalPrice: PropTypes.number.isRequired,
    createdAt: PropTypes.string.isRequired
  }).isRequired
};

export default OrderCard;
