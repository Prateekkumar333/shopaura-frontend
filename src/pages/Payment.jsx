// src/pages/Payment.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiCreditCard, FiDollarSign, FiCheckCircle } from 'react-icons/fi';
import { paymentService } from '../services';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { clearCart } = useCart();
  
  const [paymentMethod, setPaymentMethod] = useState('online');
  const [processing, setProcessing] = useState(false);
  const [checkoutData, setCheckoutData] = useState(null);

  useEffect(() => {
    // Get checkout data from navigation state
    if (!location.state) {
      toast.error('Invalid checkout session');
      navigate('/checkout');
      return;
    }
    
    setCheckoutData(location.state);
  }, [location, navigate]);

  const handlePayment = async () => {
    if (!checkoutData) return;

    setProcessing(true);

    try {
      console.log('💳 Creating order with payment method:', paymentMethod);
      
      // Create order
      const response = await paymentService.createOrder(
        checkoutData.addressId,
        paymentMethod,
        checkoutData.couponCode
      );

      console.log('📦 Order created response:', response);
      console.log('📦 Order object:', response.order);
      console.log('📦 Order ID:', response.order?._id);

      if (!response.success) {
        throw new Error(response.message || 'Failed to create order');
      }

      // Validate order ID
      if (!response.order || !response.order._id) {
        console.error('❌ Order ID missing in response:', response);
        throw new Error('Order created but ID is missing');
      }
      
      if (paymentMethod === 'cod') {
        // COD - Order placed successfully
        console.log('✅ COD payment - Navigating to order:', response.order._id);
        
        // Clear cart
        try {
          await clearCart();
          console.log('✅ Cart cleared');
        } catch (cartError) {
          console.error('⚠️ Failed to clear cart (non-critical):', cartError);
        }
        
        toast.success('Order placed successfully!');
        
        // Navigate to order details
        navigate(`/orders/${response.order._id}`, {
          state: { orderPlaced: true }
        });
      } else {
        // Online Payment - Initialize Razorpay
        console.log('💳 Initializing online payment');
        await handleOnlinePayment(response);
      }
    } catch (error) {
      console.error('❌ Payment error:', error);
      toast.error(error.response?.data?.message || error.message || 'Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  const handleOnlinePayment = async (orderResponse) => {
    try {
      // ✅ CRITICAL FIX: Store order ID at the beginning
      const orderId = orderResponse.order._id;
      
      console.log('💰 Order ID for payment:', orderId);
      
      // Validate order response
      if (!orderId) {
        throw new Error('Invalid order response - missing order ID');
      }

      // Load Razorpay script
      const scriptLoaded = await paymentService.loadRazorpayScript();
      
      if (!scriptLoaded) {
        toast.error('Failed to load payment gateway');
        return;
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderResponse.razorpayOrder.amount,
        currency: orderResponse.razorpayOrder.currency,
        name: 'ShopAura',
        description: `Order #${orderResponse.order.orderNumber}`,
        order_id: orderResponse.razorpayOrder.id,
        handler: async (response) => {
          try {
            console.log('🔐 Verifying payment...');
            
            // Verify payment (use stored orderId)
            const verifyResponse = await paymentService.verifyPayment(
              response.razorpay_order_id,
              response.razorpay_payment_id,
              response.razorpay_signature,
              orderId  // ✅ Use the stored orderId
            );

            if (verifyResponse.success) {
              console.log('✅ Payment verified successfully');
              
              // Clear cart
              try {
                await clearCart();
                console.log('✅ Cart cleared');
              } catch (cartError) {
                console.error('⚠️ Failed to clear cart (non-critical):', cartError);
              }
              
              toast.success('Payment successful!');
              
              // ✅ Navigate using the stored orderId
              console.log('🚀 Navigating to order:', orderId);
              navigate(`/orders/${orderId}`, {
                state: { orderPlaced: true, paymentSuccess: true }
              });
            }
          } catch (error) {
            console.error('❌ Payment verification error:', error);
            toast.error('Payment verification failed');
            
            // Handle payment failure
            try {
              await paymentService.handlePaymentFailure(
                orderResponse.razorpayOrder.id,
                error.message
              );
            } catch (failureError) {
              console.error('Failed to record payment failure:', failureError);
            }
          }
        },
        prefill: {
          name: orderResponse.order.user?.name || '',
          email: orderResponse.order.user?.email || '',
          contact: orderResponse.order.shippingAddress?.phone || ''
        },
        theme: {
          color: '#4F46E5'
        },
        modal: {
          ondismiss: async () => {
            console.log('⚠️ Payment cancelled by user');
            toast.error('Payment cancelled');
            
            try {
              await paymentService.handlePaymentFailure(
                orderResponse.razorpayOrder.id,
                'Payment cancelled by user'
              );
            } catch (error) {
              console.error('Failed to record payment cancellation:', error);
            }
            
            setProcessing(false);
          }
        }
      };

      console.log('🚀 Opening Razorpay modal');
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('❌ Razorpay error:', error);
      toast.error('Failed to initialize payment');
      setProcessing(false);
    }
  };

  if (!checkoutData) {
    return <LoadingSpinner fullScreen message="Loading payment..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment</h1>
          <p className="text-gray-600">Choose your payment method</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Payment Methods */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Payment Method</h2>

              <div className="space-y-3">
                {/* Online Payment */}
                <label
                  className={`block border-2 rounded-xl p-4 cursor-pointer transition-all ${
                    paymentMethod === 'online'
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-200 hover:border-indigo-300'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <input
                      type="radio"
                      name="payment"
                      value="online"
                      checked={paymentMethod === 'online'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-5 h-5 text-indigo-600"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <FiCreditCard className="text-indigo-600" size={24} />
                        <span className="font-semibold text-gray-900">Online Payment</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Pay securely using Credit/Debit Card, UPI, Net Banking, or Wallets
                      </p>
                    </div>
                    {paymentMethod === 'online' && (
                      <FiCheckCircle className="text-indigo-600" size={24} />
                    )}
                  </div>
                </label>

                {/* Cash on Delivery */}
                <label
                  className={`block border-2 rounded-xl p-4 cursor-pointer transition-all ${
                    paymentMethod === 'cod'
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-200 hover:border-indigo-300'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-5 h-5 text-indigo-600"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <FiDollarSign className="text-green-600" size={24} />
                        <span className="font-semibold text-gray-900">Cash on Delivery</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Pay with cash when your order is delivered
                      </p>
                    </div>
                    {paymentMethod === 'cod' && (
                      <FiCheckCircle className="text-indigo-600" size={24} />
                    )}
                  </div>
                </label>
              </div>

              {/* Payment Info */}
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm text-blue-800">
                  <strong>Secure Payment:</strong> Your payment information is encrypted and secure.
                  We never store your card details.
                </p>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>

              <div className="space-y-3 border-b border-gray-200 pb-4 mb-4">
                <div className="flex items-center justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span className="font-semibold">₹{checkoutData.cartTotal.toLocaleString()}</span>
                </div>

                {checkoutData.discount > 0 && (
                  <div className="flex items-center justify-between text-green-600">
                    <span>Discount</span>
                    <span className="font-semibold">-₹{checkoutData.discount.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-gray-700">
                  <span>Shipping</span>
                  <span className="font-semibold">
                    {checkoutData.shipping === 0 ? (
                      <span className="text-green-600">FREE</span>
                    ) : (
                      `₹${checkoutData.shipping}`
                    )}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-lg font-bold text-gray-900 mb-6">
                <span>Total</span>
                <span>₹{checkoutData.total.toLocaleString()}</span>
              </div>

              <button
                onClick={handlePayment}
                disabled={processing}
                className="w-full py-3 bg-linear-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
              >
                {processing ? (
                  <>
                    <LoadingSpinner size="sm" />
                    Processing...
                  </>
                ) : (
                  <>
                    {paymentMethod === 'online' ? 'Pay Now' : 'Place Order'}
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                By placing this order, you agree to our Terms & Conditions
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
