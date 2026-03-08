/**
 * Email Settings Service
 * API calls for managing email configuration (superadmin only)
 * Supports Gmail, SMTP, and Microsoft 365
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
  },

  /**
   * Get Microsoft OAuth authorization URL
   */
  getMicrosoftAuthUrl: () => {
    return api.get('/settings/email/microsoft/auth-url');
  },

  /**
   * Revoke Microsoft authentication
   */
  revokeMicrosoftAuth: () => {
    return api.post('/settings/email/microsoft/revoke');
  }
};

export default emailSettingsService;
