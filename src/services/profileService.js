import API from './api';

// Profile Services
export const profileService = {
  // Get user profile
  getProfile: async () => {
    const response = await API.get('/profile');
    return response.data;
  },

  // Update profile
  updateProfile: async (profileData) => {
    const response = await API.put('/profile', profileData);
    return response.data;
  },

  // Upload profile picture
  uploadProfilePicture: async (file) => {
    const formData = new FormData();
    formData.append('profilePicture', file);
    
    const response = await API.post('/profile/picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Delete profile picture
  deleteProfilePicture: async () => {
    const response = await API.delete('/profile/picture');
    return response.data;
  },

  // Change password (duplicate of auth service, but keeping for consistency)
  changePassword: async (currentPassword, newPassword) => {
    const response = await API.put('/profile/password', { currentPassword, newPassword });
    return response.data;
  }
};

export default profileService;
