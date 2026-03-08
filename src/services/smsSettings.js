/**
 * SMS Settings Service
 * API calls for managing SMS configuration (superadmin only)
 */

import api from './api';

const smsSettingsService = {
  /**
   * Get SMS configuration
   */
  getConfiguration: () => {
    return api.get('/settings/sms');
  },

  /**
   * Save SMS configuration
   */
  saveConfiguration: (config) => {
    return api.post('/settings/sms', config);
  },

  /**
   * Test SMS configuration
   */
  testConfiguration: (testPhone, testMessage) => {
    return api.post('/settings/sms/test', { test_phone: testPhone, test_message: testMessage || undefined });
  },

  /**
   * Get SMS statistics
   */
  getStats: () => {
    return api.get('/settings/sms/stats');
  },

  /**
   * Toggle SMS service on/off
   */
  toggleService: (isEnabled) => {
    return api.post('/settings/sms/toggle', { is_enabled: isEnabled });
  }
};

export default smsSettingsService;
