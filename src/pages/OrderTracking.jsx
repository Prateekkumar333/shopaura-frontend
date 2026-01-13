import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiPackage, FiTruck, FiCheckCircle, FiClock, FiMapPin } from 'react-icons/fi';
import { orderService } from '../services';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import { format } from 'date-fns';

const OrderTracking = () => {
  const { id } = useParams();
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTracking();
  }, [id]);

  const fetchTracking = async () => {
    try {
      setLoading(true);
      const response = await orderService.trackOrder(id);
      
      if (response.success) {
        setTracking(response.tracking);
      }
    } catch (error) {
      console.error('Failed to fetch tracking:', error);
      toast.error('Failed to load tracking information');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <FiClock className="text-yellow-600" size={24} />;
      case 'confirmed':
      case 'processing':
        return <FiPackage className="text-blue-600" size={24} />;
      case 'shipped':
      case 'out_for_delivery':
        return <FiTruck className="text-indigo-600" size={24} />;
      case 'delivered':
        return <FiCheckCircle className="text-green-600" size={24} />;
      default:
        return <FiClock className="text-gray-600" size={24} />;
    }
  };

  const trackingSteps = [
    { status: 'pending', label: 'Order Placed' },
    { status: 'confirmed', label: 'Order Confirmed' },
    { status: 'processing', label: 'Processing' },
    { status: 'shipped', label: 'Shipped' },
    { status: 'out_for_delivery', label: 'Out for Delivery' },
    { status: 'delivered', label: 'Delivered' }
  ];

  const getCurrentStepIndex = () => {
    if (!tracking) return 0;
    return trackingSteps.findIndex(step => step.status === tracking.order.status);
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading tracking information..." />;
  }

  if (!tracking) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <p className="text-gray-600">Failed to load tracking information</p>
          <Link
            to="/orders"
            className="inline-block mt-4 px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  const currentStep = getCurrentStepIndex();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Track Your Order</h1>
          <p className="text-gray-600">Order #{tracking.order.orderNumber}</p>
        </div>

        {/* Current Status Card */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-lg p-6 mb-6 text-white">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-4 rounded-xl">
              {getStatusIcon(tracking.order.status)}
            </div>
            <div>
              <p className="text-sm opacity-90">Current Status</p>
              <p className="text-2xl font-bold capitalize">
                {tracking.order.status.replace(/_/g, ' ')}
              </p>
              {tracking.estimatedDelivery && (
                <p className="text-sm opacity-90 mt-1">
                  Estimated Delivery: {format(new Date(tracking.estimatedDelivery), 'PPP')}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Progress Timeline */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Timeline</h2>

          <div className="relative">
            {/* Progress Line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />
            <div 
              className="absolute left-6 top-0 w-0.5 bg-indigo-600 transition-all duration-500"
              style={{ height: `${(currentStep / (trackingSteps.length - 1)) * 100}%` }}
            />

            {/* Timeline Steps */}
            <div className="space-y-8">
              {trackingSteps.map((step, index) => {
                const isCompleted = index <= currentStep;
                const isCurrent = index === currentStep;

                return (
                  <div key={step.status} className="relative flex items-start gap-4">
                    {/* Icon */}
                    <div className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-4 transition-all ${
                      isCompleted 
                        ? 'bg-indigo-600 border-white shadow-lg' 
                        : 'bg-white border-gray-300'
                    }`}>
                      {isCompleted ? (
                        <FiCheckCircle className="text-white" size={24} />
                      ) : (
                        <div className="w-3 h-3 bg-gray-300 rounded-full" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 pt-2">
                      <p className={`font-semibold ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                        {step.label}
                      </p>
                      
                      {tracking.timeline?.[step.status] && (
                        <p className="text-sm text-gray-600 mt-1">
                          {format(new Date(tracking.timeline[step.status]), 'PPp')}
                        </p>
                      )}

                      {isCurrent && tracking.currentLocation && (
                        <div className="flex items-center gap-2 mt-2 text-sm text-indigo-600">
                          <FiMapPin size={14} />
                          <span>{tracking.currentLocation}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Delivery Address */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Delivery Address</h2>
          
          <div className="space-y-2 text-gray-700">
            <p className="font-semibold">{tracking.order.shippingAddress.fullName}</p>
            <p>{tracking.order.shippingAddress.addressLine1}</p>
            {tracking.order.shippingAddress.addressLine2 && (
              <p>{tracking.order.shippingAddress.addressLine2}</p>
            )}
            <p>
              {tracking.order.shippingAddress.city}, {tracking.order.shippingAddress.state} - {tracking.order.shippingAddress.pincode}
            </p>
            <p>{tracking.order.shippingAddress.country}</p>
            <p className="flex items-center gap-2 pt-2">
              <FiMapPin size={16} />
              {tracking.order.shippingAddress.phone}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Link
            to={`/orders/${id}`}
            className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors text-center"
          >
            View Order Details
          </Link>
          <Link
            to="/orders"
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors text-center"
          >
            All Orders
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
