import API from './api';

// Settings Services
export const settingsService = {
  // Get user settings
  getSettings: async () => {
    const response = await API.get('/settings');
    return response.data;
  },

  // Update notification settings
  updateNotificationSettings: async (notificationSettings) => {
    const response = await API.put('/settings/notifications', notificationSettings);
    return response.data;
  },

  // Update privacy settings
  updatePrivacySettings: async (privacySettings) => {
    const response = await API.put('/settings/privacy', privacySettings);
    return response.data;
  },

  // Update preferences
  updatePreferences: async (preferences) => {
    const response = await API.put('/settings/preferences', preferences);
    return response.data;
  },

  // Delete account
  deleteAccount: async (password) => {
    const response = await API.delete('/settings/account', { data: { password } });
    return response.data;
  },

  // Export user data
  exportData: async () => {
    const response = await API.get('/settings/export-data');
    return response.data;
  }
};

export default settingsService;
