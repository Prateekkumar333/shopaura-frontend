import API from './api';

// Address Services
export const addressService = {
  // Get all addresses
  getAllAddresses: async () => {
    const response = await API.get('/addresses');
    return response.data;
  },

  // Get single address
  getAddress: async (addressId) => {
    const response = await API.get(`/addresses/${addressId}`);
    return response.data;
  },

  // Add new address
  addAddress: async (addressData) => {
    const response = await API.post('/addresses', addressData);
    return response.data;
  },

  // Update address
  updateAddress: async (addressId, addressData) => {
    const response = await API.put(`/addresses/${addressId}`, addressData);
    return response.data;
  },

  // Delete address
  deleteAddress: async (addressId) => {
    const response = await API.delete(`/addresses/${addressId}`);
    return response.data;
  },

  // Set default address
  setDefaultAddress: async (addressId) => {
    const response = await API.put(`/addresses/${addressId}/default`);
    return response.data;
  }
};

export default addressService;
