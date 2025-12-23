/**
 * Audit Log Service
 * API service for audit log operations
 */

import api from './api';

const BASE_URL = '/audit-logs';

const auditLogService = {
  /**
   * Get audit logs with filters and pagination
   */
  getLogs: (params = {}) => {
    return api.get(BASE_URL, { params });
  },

  /**
   * Get a single audit log by ID
   */
  getLogById: (id) => {
    return api.get(`${BASE_URL}/${id}`);
  },

  /**
   * Get login audit logs
   */
  getLoginLogs: (params = {}) => {
    return api.get(`${BASE_URL}/login`, { params });
  },

  /**
   * Get audit statistics for dashboard
   */
  getStatistics: (days = 7) => {
    return api.get(`${BASE_URL}/statistics`, { params: { days } });
  },

  /**
   * Get daily summaries
   */
  getDailySummaries: (days = 30) => {
    return api.get(`${BASE_URL}/summaries`, { params: { days } });
  },

  /**
   * Get user activity timeline
   */
  getUserActivity: (userId, params = {}) => {
    return api.get(`${BASE_URL}/user/${userId}`, { params });
  },

  /**
   * Get resource history
   */
  getResourceHistory: (resourceType, resourceId, params = {}) => {
    return api.get(`${BASE_URL}/resource/${resourceType}/${resourceId}`, { params });
  },

  /**
   * Get filter options for dropdowns
   */
  getFilterOptions: () => {
    return api.get(`${BASE_URL}/filter-options`);
  },

  /**
   * Export audit logs
   */
  exportLogs: (params = {}, format = 'json') => {
    return api.get(`${BASE_URL}/export`, {
      params: { ...params, format },
      responseType: format === 'csv' ? 'blob' : 'json'
    });
  },

  /**
   * Get retention configuration
   */
  getRetentionConfig: () => {
    return api.get(`${BASE_URL}/retention`);
  },

  /**
   * Update retention configuration (superadmin only)
   */
  updateRetentionConfig: (category, data) => {
    return api.put(`${BASE_URL}/retention/${category}`, data);
  },

  /**
   * Run archive job manually (superadmin only)
   */
  runArchiveJob: () => {
    return api.post(`${BASE_URL}/archive`);
  },

  /**
   * Generate daily summary manually (superadmin only)
   * @param {string|null} date - Specific date to generate summary for
   * @param {boolean} generateAll - If true, generates summaries for all dates with logs
   */
  generateSummary: (date = null, generateAll = false) => {
    return api.post(`${BASE_URL}/generate-summary`, { date, generate_all: generateAll });
  },

  // Helper functions
  getStatusColor: (status) => {
    const colors = {
      success: 'green',
      failure: 'orange',
      error: 'red'
    };
    return colors[status] || 'default';
  },

  getActionTypeColor: (actionType) => {
    const colors = {
      CREATE: 'green',
      READ: 'blue',
      UPDATE: 'orange',
      DELETE: 'red',
      LOGIN: 'cyan',
      LOGOUT: 'purple',
      EXPORT: 'geekblue',
      IMPORT: 'lime',
      APPROVE: 'green',
      REJECT: 'red',
      ASSIGN: 'purple',
      EXECUTE: 'volcano'
    };
    return colors[actionType] || 'default';
  },

  getCategoryColor: (category) => {
    const colors = {
      auth: 'blue',
      user: 'purple',
      asset: 'green',
      ticket: 'orange',
      requisition: 'cyan',
      permission: 'red',
      master: 'geekblue',
      system: 'volcano',
      file: 'lime',
      job: 'gold',
      security: 'magenta',
      report: 'cyan'
    };
    return colors[category] || 'default';
  },

  getCategoryLabel: (category) => {
    const labels = {
      auth: 'Authentication',
      user: 'User Management',
      asset: 'Assets',
      ticket: 'Tickets',
      requisition: 'Requisitions',
      permission: 'Permissions',
      master: 'Master Data',
      system: 'System',
      file: 'Files',
      job: 'Jobs',
      security: 'Security',
      report: 'Reports'
    };
    return labels[category] || category;
  }
};

export default auditLogService;
