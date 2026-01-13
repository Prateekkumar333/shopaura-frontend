import API from './api';

// Checkout Services
export const checkoutService = {
  // Get checkout details
  getCheckoutDetails: async () => {
    const response = await API.get('/checkout');
    return response.data;
  },

  // Validate coupon
  validateCoupon: async (code, itemsPrice) => {
    const response = await API.post('/checkout/validate-coupon', { code, itemsPrice });
    return response.data;
  },

  // Calculate order summary
  calculateOrderSummary: async (couponCode = null) => {
    const response = await API.post('/checkout/calculate', { couponCode });
    return response.data;
  },

  // Apply coupon
  applyCoupon: async (code) => {
    const response = await API.post('/checkout/apply-coupon', { code });
    return response.data;
  },

  // Remove coupon
  removeCoupon: async () => {
    const response = await API.post('/checkout/remove-coupon');
    return response.data;
  }
};

export default checkoutService;
