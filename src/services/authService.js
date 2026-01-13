import API from './api';

// Authentication Services
export const authService = {
  // Register new user
  register: async (name, email, password) => {
    const response = await API.post('/auth/register', { name, email, password, role: 'buyer' });
    return response.data;
  },

  // Login user
  login: async (email, password) => {
    const response = await API.post('/auth/login', { email, password });
    return response.data;
  },

  // Logout user
  logout: async () => {
    const response = await API.post('/auth/logout');
    return response.data;
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await API.get('/auth/me');
    return response.data;
  },

  // Check auth status
  checkAuth: async () => {
    const response = await API.get('/auth/check');
    return response.data;
  },

  // Change password
  changePassword: async (currentPassword, newPassword) => {
    const response = await API.put('/auth/password', { currentPassword, newPassword });
    return response.data;
  }
};

export default authService;
