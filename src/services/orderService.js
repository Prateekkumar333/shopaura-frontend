import API from './api';

// Order Services
export const orderService = {
  // Get all orders
  getAllOrders: async (page = 1, limit = 10) => {
    const response = await API.get(`/orders?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Get single order
  getOrder: async (orderId) => {
    const response = await API.get(`/orders/${orderId}`);
    return response.data;
  },

  // Track order
  trackOrder: async (orderId) => {
    const response = await API.get(`/orders/${orderId}/track`);
    return response.data;
  },

  // Cancel order
  cancelOrder: async (orderId, reason) => {
    const response = await API.put(`/orders/${orderId}/cancel`, { reason });
    return response.data;
  },

  // Download invoice
  downloadInvoice: async (orderId) => {
    const response = await API.get(`/orders/${orderId}/invoice`, {
      responseType: 'blob'
    });
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `invoice-${orderId}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    return { success: true, message: 'Invoice downloaded' };
  },

  // Return order item
  returnOrderItem: async (orderId, itemId, reason) => {
    const response = await API.post(`/orders/${orderId}/return`, { itemId, reason });
    return response.data;
  }
};

export default orderService;
