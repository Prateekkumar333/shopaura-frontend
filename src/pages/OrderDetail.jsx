import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { FiPackage, FiTruck, FiMapPin, FiPhone, FiMail, FiDownload, FiX } from 'react-icons/fi';
import { orderService } from '../services';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import ConfirmDialog from '../components/ConfirmDialog';
import { format } from 'date-fns';

const OrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    console.log('📦 Order ID from URL:', orderId);
    
    if (orderId) {
      fetchOrder(orderId);
      
      // Show success message if redirected from payment
      if (location.state?.orderPlaced) {
        toast.success(location.state.paymentSuccess 
          ? 'Order placed & payment successful!' 
          : 'Order placed successfully!');
      }
    } else {
      console.error('❌ No order ID in URL');
      toast.error('Invalid order');
      navigate('/orders');
    }
  }, [orderId]);

  const fetchOrder = async (id) => {
    try {
      setLoading(true);
      console.log('🔍 Fetching order with ID:', id);
      
      const response = await orderService.getOrder(id);
      
      if (response.success) {
        setOrder(response.order);
      }
    } catch (error) {
      console.error('Failed to fetch order:', error);
      toast.error('Failed to load order details');
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) {
      toast.error('Please provide a cancellation reason');
      return;
    }

    try {
      const response = await orderService.cancelOrder(orderId, cancelReason);
      
      if (response.success) {
        toast.success('Order cancelled successfully');
        setShowCancelConfirm(false);
        setCancelReason('');
        fetchOrder(orderId);
      }
    } catch (error) {
      console.error('Cancel order error:', error);
      toast.error(error.response?.data?.message || 'Failed to cancel order');
    }
  };

  const handleDownloadInvoice = async () => {
    try {
      await orderService.downloadInvoice(orderId);
    } catch (error) {
      console.error('Download invoice error:', error);
      toast.error('Failed to download invoice');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-purple-100 text-purple-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      out_for_delivery: 'bg-cyan-100 text-cyan-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const canCancelOrder = () => {
    return order && ['pending', 'confirmed', 'processing'].includes(order.status);
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading order details..." />;
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">Order not found</p>
          <Link to="/orders" className="text-indigo-600 hover:underline">
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Details</h1>
            <p className="text-gray-600">Order #{order?.orderNumber}</p>
          </div>

          <div className="flex gap-3">
            <Link
              to={`/orders/${orderId}/track`}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors inline-flex items-center gap-2"
            >
              <FiTruck size={18} />
              Track Order
            </Link>
            
            {order?.status === 'delivered' && (
              <button
                onClick={handleDownloadInvoice}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors inline-flex items-center gap-2"
              >
                <FiDownload size={18} />
                Invoice
              </button>
            )}

            {canCancelOrder() && (
              <button
                onClick={() => setShowCancelConfirm(true)}
                className="px-4 py-2 border border-red-300 text-red-600 rounded-lg font-medium hover:bg-red-50 transition-colors inline-flex items-center gap-2"
              >
                <FiX size={18} />
                Cancel Order
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Status */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Order Status</h2>
                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(order?.status)}`}>
                  {order?.status?.replace(/_/g, ' ').toUpperCase()}
                </span>
              </div>
              
              <p className="text-sm text-gray-600">
                Ordered on {order?.createdAt && format(new Date(order.createdAt), 'PPP')}
              </p>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Items</h2>
              
              <div className="space-y-4">
                {order?.items?.map((item) => (
                  <div key={item._id} className="flex items-center gap-4 pb-4 border-b border-gray-200 last:border-0">
                    <img
                      src={item.product?.images?.[0]?.url || '/placeholder.png'}
                      alt={item.product?.name || 'Product'}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                    
                    <div className="flex-1">
                      <Link
                        to={`/product/${item.product?._id}`}
                        className="text-lg font-semibold text-gray-900 hover:text-indigo-600"
                      >
                        {item.product?.name}
                      </Link>
                      <p className="text-sm text-gray-600 mt-1">Quantity: {item.quantity}</p>
                      <p className="text-sm text-gray-600">
                        Price: ₹{item.price?.toLocaleString()} × {item.quantity}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">
                        ₹{((item.price || 0) * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <FiMapPin className="text-indigo-600" size={24} />
                <h2 className="text-xl font-semibold text-gray-900">Shipping Address</h2>
              </div>
              
              <div className="space-y-2 text-gray-700">
                <p className="font-semibold">{order?.shippingAddress?.fullName}</p>
                <p>{order?.shippingAddress?.addressLine1}</p>
                {order?.shippingAddress?.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                <p>{order?.shippingAddress?.city}, {order?.shippingAddress?.state} - {order?.shippingAddress?.pincode}</p>
                <p>{order?.shippingAddress?.country}</p>
                <div className="flex items-center gap-2 pt-2">
                  <FiPhone size={16} />
                  <span>{order?.shippingAddress?.phone}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>

              <div className="space-y-3 border-b border-gray-200 pb-4 mb-4">
                <div className="flex items-center justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span className="font-semibold">₹{order?.itemsPrice?.toLocaleString()}</span>
                </div>

                {order?.discount > 0 && (
                  <div className="flex items-center justify-between text-green-600">
                    <span>Discount</span>
                    <span className="font-semibold">-₹{order.discount.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-gray-700">
                  <span>Shipping</span>
                  <span className="font-semibold">
                    {order?.shippingPrice === 0 ? (
                      <span className="text-green-600">FREE</span>
                    ) : (
                      `₹${order?.shippingPrice}`
                    )}
                  </span>
                </div>

                <div className="flex items-center justify-between text-gray-700">
                  <span>Tax</span>
                  <span className="font-semibold">₹{order?.taxPrice?.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-lg font-bold text-gray-900 mb-4">
                <span>Total</span>
                <span>₹{order?.totalPrice?.toLocaleString()}</span>
              </div>

              {/* Payment Info */}
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm font-semibold text-gray-900 mb-2">Payment Method</p>
                <p className="text-sm text-gray-600 capitalize">{order?.paymentMethod}</p>
                
                <p className="text-sm font-semibold text-gray-900 mt-3 mb-2">Payment Status</p>
                <p className="text-sm text-gray-600 capitalize">{order?.paymentStatus}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Cancel Order Dialog */}
        <ConfirmDialog
          isOpen={showCancelConfirm}
          onClose={() => {
            setShowCancelConfirm(false);
            setCancelReason('');
          }}
          onConfirm={handleCancelOrder}
          title="Cancel Order"
          message="Are you sure you want to cancel this order?"
          confirmText="Cancel Order"
          variant="danger"
        >
          <textarea
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="Please provide a reason for cancellation..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 mt-4"
            rows={3}
          />
        </ConfirmDialog>
      </div>
    </div>
  );
};

export default OrderDetail;
