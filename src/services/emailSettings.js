/**
 * Email Settings Service
 * API calls for managing email configuration (superadmin only)
 */

import api from './api';

const emailSettingsService = {
  /**
   * Get email configuration
   */
  getConfiguration: () => {
    return api.get('/settings/email');
  },

  /**
   * Save email configuration
   */
  saveConfiguration: (config) => {
    return api.post('/settings/email', config);
  },

  /**
   * Test email configuration
   */
  testConfiguration: (testEmail) => {
    return api.post('/settings/email/test', { test_email: testEmail });
  },

  /**
   * Get email statistics
   */
  getStats: () => {
    return api.get('/settings/email/stats');
  },

  /**
   * Toggle email service on/off
   */
  toggleService: (isEnabled) => {
    return api.post('/settings/email/toggle', { is_enabled: isEnabled });
  }
};

export default emailSettingsService;
