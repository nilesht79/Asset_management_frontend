/**
 * SLA SERVICE
 * API service for SLA management
 */

import apiClient from '../utils/apiClient';

const slaService = {
  // ==================== SLA RULES ====================

  /**
   * Get all SLA rules
   */
  getRules: async (params = {}) => {
    try {
      const response = await apiClient.get('/sla/rules', { params });
      return response;
    } catch (error) {
      console.error('Error fetching SLA rules:', error);
      throw error;
    }
  },

  /**
   * Get SLA rule by ID
   */
  getRuleById: async (ruleId) => {
    try {
      const response = await apiClient.get(`/sla/rules/${ruleId}`);
      return response;
    } catch (error) {
      console.error('Error fetching SLA rule:', error);
      throw error;
    }
  },

  /**
   * Create SLA rule
   */
  createRule: async (ruleData) => {
    try {
      const response = await apiClient.post('/sla/rules', ruleData);
      return response;
    } catch (error) {
      console.error('Error creating SLA rule:', error);
      throw error;
    }
  },

  /**
   * Update SLA rule
   */
  updateRule: async (ruleId, ruleData) => {
    try {
      const response = await apiClient.put(`/sla/rules/${ruleId}`, ruleData);
      return response;
    } catch (error) {
      console.error('Error updating SLA rule:', error);
      throw error;
    }
  },

  /**
   * Delete SLA rule
   */
  deleteRule: async (ruleId) => {
    try {
      const response = await apiClient.delete(`/sla/rules/${ruleId}`);
      return response;
    } catch (error) {
      console.error('Error deleting SLA rule:', error);
      throw error;
    }
  },

  // ==================== BUSINESS HOURS ====================

  /**
   * Get all business hours schedules
   */
  getBusinessHoursSchedules: async () => {
    try {
      const response = await apiClient.get('/sla/business-hours');
      return response;
    } catch (error) {
      console.error('Error fetching business hours schedules:', error);
      throw error;
    }
  },

  /**
   * Get business hours schedule details
   */
  getBusinessHoursDetails: async (scheduleId) => {
    try {
      const response = await apiClient.get(`/sla/business-hours/${scheduleId}`);
      return response;
    } catch (error) {
      console.error('Error fetching business hours details:', error);
      throw error;
    }
  },

  /**
   * Save business hours schedule
   */
  saveBusinessHoursSchedule: async (scheduleData) => {
    try {
      const response = await apiClient.post('/sla/business-hours', scheduleData);
      return response;
    } catch (error) {
      console.error('Error saving business hours schedule:', error);
      throw error;
    }
  },

  /**
   * Delete business hours schedule
   */
  deleteBusinessHoursSchedule: async (scheduleId) => {
    try {
      const response = await apiClient.delete(`/sla/business-hours/${scheduleId}`);
      return response;
    } catch (error) {
      console.error('Error deleting business hours schedule:', error);
      throw error;
    }
  },

  // ==================== HOLIDAY CALENDARS ====================

  /**
   * Get all holiday calendars
   */
  getHolidayCalendars: async () => {
    try {
      const response = await apiClient.get('/sla/holidays');
      return response;
    } catch (error) {
      console.error('Error fetching holiday calendars:', error);
      throw error;
    }
  },

  /**
   * Get holiday dates for a calendar
   */
  getHolidayDates: async (calendarId) => {
    try {
      const response = await apiClient.get(`/sla/holidays/${calendarId}/dates`);
      return response;
    } catch (error) {
      console.error('Error fetching holiday dates:', error);
      throw error;
    }
  },

  /**
   * Save holiday calendar
   */
  saveHolidayCalendar: async (calendarData) => {
    try {
      const response = await apiClient.post('/sla/holidays', calendarData);
      return response;
    } catch (error) {
      console.error('Error saving holiday calendar:', error);
      throw error;
    }
  },

  /**
   * Delete holiday calendar
   */
  deleteHolidayCalendar: async (calendarId) => {
    try {
      const response = await apiClient.delete(`/sla/holidays/${calendarId}`);
      return response;
    } catch (error) {
      console.error('Error deleting holiday calendar:', error);
      throw error;
    }
  },

  // ==================== ESCALATION RULES ====================

  /**
   * Get escalation rules for an SLA rule
   */
  getEscalationRules: async (slaRuleId) => {
    try {
      const response = await apiClient.get(`/sla/rules/${slaRuleId}/escalations`);
      return response;
    } catch (error) {
      console.error('Error fetching escalation rules:', error);
      throw error;
    }
  },

  /**
   * Save escalation rule
   */
  saveEscalationRule: async (escalationData) => {
    try {
      const response = await apiClient.post('/sla/escalation-rules', escalationData);
      return response;
    } catch (error) {
      console.error('Error saving escalation rule:', error);
      throw error;
    }
  },

  /**
   * Delete escalation rule
   */
  deleteEscalationRule: async (escalationRuleId) => {
    try {
      const response = await apiClient.delete(`/sla/escalation-rules/${escalationRuleId}`);
      return response;
    } catch (error) {
      console.error('Error deleting escalation rule:', error);
      throw error;
    }
  },

  /**
   * Get available designations for escalation rules
   */
  getDesignations: async () => {
    try {
      const response = await apiClient.get('/sla/designations');
      return response;
    } catch (error) {
      console.error('Error fetching designations:', error);
      throw error;
    }
  },

  /**
   * Get available roles for escalation rules
   */
  getRoles: async () => {
    try {
      const response = await apiClient.get('/sla/roles');
      return response;
    } catch (error) {
      console.error('Error fetching roles:', error);
      throw error;
    }
  },

  // ==================== SLA TRACKING ====================

  /**
   * Get SLA tracking for a ticket
   */
  getTicketSlaTracking: async (ticketId) => {
    try {
      const response = await apiClient.get(`/sla/tracking/${ticketId}`);
      return response;
    } catch (error) {
      console.error('Error fetching ticket SLA tracking:', error);
      throw error;
    }
  },

  /**
   * Pause SLA timer
   */
  pauseSlaTimer: async (ticketId, reason) => {
    try {
      const response = await apiClient.post(`/sla/tracking/${ticketId}/pause`, { reason });
      return response;
    } catch (error) {
      console.error('Error pausing SLA timer:', error);
      throw error;
    }
  },

  /**
   * Resume SLA timer
   */
  resumeSlaTimer: async (ticketId) => {
    try {
      const response = await apiClient.post(`/sla/tracking/${ticketId}/resume`);
      return response;
    } catch (error) {
      console.error('Error resuming SLA timer:', error);
      throw error;
    }
  },

  // ==================== DASHBOARD & METRICS ====================

  /**
   * Get SLA dashboard data
   */
  getDashboard: async (params = {}) => {
    try {
      const response = await apiClient.get('/sla/dashboard', { params });
      return response;
    } catch (error) {
      console.error('Error fetching SLA dashboard:', error);
      throw error;
    }
  },

  /**
   * Get SLA metrics
   */
  getMetrics: async (params = {}) => {
    try {
      const response = await apiClient.get('/sla/metrics', { params });
      return response;
    } catch (error) {
      console.error('Error fetching SLA metrics:', error);
      throw error;
    }
  },

  /**
   * Get bulk SLA summary for multiple tickets
   */
  getBulkSlaSummary: async (ticketIds) => {
    try {
      const response = await apiClient.post('/sla/bulk-summary', { ticketIds });
      return response;
    } catch (error) {
      console.error('Error fetching bulk SLA summary:', error);
      throw error;
    }
  },

  // ==================== REPORTS ====================

  /**
   * Get SLA Compliance Report
   * @param {Object} params - Filter parameters
   * @param {string} params.date_from - Start date (required)
   * @param {string} params.date_to - End date (required)
   * @param {string} params.location_id - Filter by location
   * @param {string} params.department_id - Filter by department
   * @param {string} params.asset_category_id - Filter by asset category
   * @param {string} params.oem_id - Filter by OEM
   * @param {string} params.product_model - Filter by product model
   * @param {string} params.frequency - Group by: daily, weekly, monthly, quarterly
   */
  getComplianceReport: async (params = {}) => {
    try {
      const response = await apiClient.get('/sla/compliance-report', { params });
      return response;
    } catch (error) {
      console.error('Error fetching SLA compliance report:', error);
      throw error;
    }
  },

  /**
   * Export SLA Compliance Report to Excel
   */
  exportComplianceReport: async (params = {}) => {
    try {
      const response = await apiClient.get('/sla/compliance-report/export', {
        params,
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `SLA_Compliance_Report_${params.date_from}_to_${params.date_to}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      console.error('Error exporting SLA compliance report:', error);
      throw error;
    }
  },

  // ==================== UTILITY FUNCTIONS ====================

  /**
   * Format minutes to human readable string
   */
  formatDuration: (minutes) => {
    if (minutes == null || isNaN(minutes)) return '-';

    const absMinutes = Math.abs(minutes);

    if (absMinutes < 60) {
      return `${absMinutes}m`;
    }

    const hours = Math.floor(absMinutes / 60);
    const mins = absMinutes % 60;

    if (hours < 24) {
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }

    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;

    if (remainingHours === 0 && mins === 0) {
      return `${days}d`;
    }

    if (remainingHours === 0) {
      return `${days}d ${mins}m`;
    }

    return mins > 0 ? `${days}d ${remainingHours}h` : `${days}d ${remainingHours}h`;
  },

  /**
   * Get status color based on SLA status
   */
  getStatusColor: (status) => {
    const colors = {
      on_track: 'green',
      warning: 'gold',
      critical: 'orange',
      breached: 'red',
      paused: 'blue'
    };
    return colors[status] || 'default';
  },

  /**
   * Get status display name
   */
  getStatusDisplayName: (status) => {
    const names = {
      on_track: 'On Track',
      warning: 'Warning',
      critical: 'Critical',
      breached: 'Breached',
      paused: 'Paused'
    };
    return names[status] || status;
  },

  /**
   * Get priority color
   */
  getPriorityColor: (priority) => {
    const colors = {
      critical: 'red',
      high: 'orange',
      medium: 'gold',
      low: 'green'
    };
    return colors[priority] || 'default';
  },

  /**
   * Calculate percentage used
   */
  calculatePercentage: (elapsed, max) => {
    if (!max || max === 0) return 0;
    return Math.min(100, Math.round((elapsed / max) * 100));
  },

  /**
   * Get zone color for progress bar
   */
  getZoneColor: (percentage) => {
    if (percentage >= 100) return '#ff4d4f'; // red - breached
    if (percentage >= 75) return '#fa8c16'; // orange - critical
    if (percentage >= 50) return '#faad14'; // gold - warning
    return '#52c41a'; // green - on track
  }
};

export default slaService;
