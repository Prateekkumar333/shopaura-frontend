import API from './api';

// Payment Services
export const paymentService = {
  // Create order (COD or Online)
  createOrder: async (addressId, paymentMethod, couponCode = null) => {
    const response = await API.post('/payment/create-order', {
      addressId,
      paymentMethod,
      couponCode
    });
    return response.data;
  },

  // Verify Razorpay payment
  verifyPayment: async (razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId) => {
    const response = await API.post('/payment/verify', {
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: razorpayPaymentId,
      razorpay_signature: razorpaySignature,
      orderId
    });
    return response.data;
  },

  // Handle payment failure
  handlePaymentFailure: async (orderId, error) => {
    const response = await API.post('/payment/failure', { orderId, error });
    return response.data;
  },

  // Get payment status
  getPaymentStatus: async (orderId) => {
    const response = await API.get(`/payment/status/${orderId}`);
    return response.data;
  },

  // Load Razorpay script
  loadRazorpayScript: () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }
};

export default paymentService;
