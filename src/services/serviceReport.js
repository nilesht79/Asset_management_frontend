/**
 * SERVICE REPORT SERVICE
 * API service for service reports (repair/replace)
 */

import apiClient from '../utils/apiClient';

const serviceReportService = {
  /**
   * Create a new service report
   */
  createReport: async (reportData) => {
    try {
      const response = await apiClient.post('/service-reports', reportData);
      return response;
    } catch (error) {
      console.error('Error creating service report:', error);
      throw error;
    }
  },

  /**
   * Create a draft service report (for close request workflow)
   */
  createDraftReport: async (reportData) => {
    try {
      const response = await apiClient.post('/service-reports/draft', reportData);
      return response;
    } catch (error) {
      console.error('Error creating draft service report:', error);
      throw error;
    }
  },

  /**
   * Get draft service report by ticket ID
   */
  getDraftReportByTicketId: async (ticketId) => {
    try {
      const response = await apiClient.get(`/service-reports/draft/ticket/${ticketId}`);
      return response;
    } catch (error) {
      console.error('Error fetching draft service report:', error);
      throw error;
    }
  },

  /**
   * Get service report by ID
   */
  getReportById: async (reportId) => {
    try {
      const response = await apiClient.get(`/service-reports/${reportId}`);
      return response;
    } catch (error) {
      console.error('Error fetching service report:', error);
      throw error;
    }
  },

  /**
   * Get service report by ticket ID
   */
  getReportByTicketId: async (ticketId) => {
    try {
      const response = await apiClient.get(`/service-reports/ticket/${ticketId}`);
      return response;
    } catch (error) {
      console.error('Error fetching service report by ticket:', error);
      throw error;
    }
  },

  /**
   * Get all service reports with filters
   */
  getReports: async (params = {}) => {
    try {
      const response = await apiClient.get('/service-reports', { params });
      return response;
    } catch (error) {
      console.error('Error fetching service reports:', error);
      throw error;
    }
  },

  /**
   * Get detailed service reports with granular filters
   */
  getDetailedReports: async (params = {}) => {
    try {
      const response = await apiClient.get('/service-reports/detailed', { params });
      return response;
    } catch (error) {
      console.error('Error fetching detailed service reports:', error);
      throw error;
    }
  },

  /**
   * Get spare parts consumption report
   */
  getPartsConsumptionReport: async (params = {}) => {
    try {
      const response = await apiClient.get('/service-reports/parts-consumption', { params });
      return response;
    } catch (error) {
      console.error('Error fetching parts consumption report:', error);
      throw error;
    }
  },

  /**
   * Get available spare parts (component assets)
   */
  getAvailableSpareParts: async (params = {}) => {
    try {
      const response = await apiClient.get('/service-reports/available-parts', { params });
      return response;
    } catch (error) {
      console.error('Error fetching available spare parts:', error);
      throw error;
    }
  },

  /**
   * Get available replacement assets (standalone/parent assets)
   */
  getAvailableReplacementAssets: async (params = {}) => {
    try {
      const response = await apiClient.get('/service-reports/available-replacement-assets', { params });
      return response;
    } catch (error) {
      console.error('Error fetching available replacement assets:', error);
      throw error;
    }
  },

  /**
   * Download PDF for a single service report
   */
  downloadPDF: async (reportId, reportNumber, hideCost = false) => {
    try {
      const response = await apiClient.get(`/service-reports/${reportId}/pdf`, {
        params: { hideCost: hideCost ? 'true' : 'false' },
        responseType: 'blob'
      });

      // Create download link
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ServiceReport_${reportNumber || reportId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      console.error('Error downloading PDF:', error);
      throw error;
    }
  },

  /**
   * Download bulk PDF for multiple service reports
   */
  downloadBulkPDF: async (reportIds, hideCost = false) => {
    try {
      const response = await apiClient.post('/service-reports/pdf/bulk', {
        report_ids: reportIds,
        hideCost: hideCost
      }, {
        responseType: 'blob'
      });

      // Create download link
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ServiceReports_Bulk_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      console.error('Error downloading bulk PDF:', error);
      throw error;
    }
  },

  // ==================== UTILITY FUNCTIONS ====================

  /**
   * Get service type display name
   */
  getServiceTypeDisplayName: (serviceType) => {
    const names = {
      general: 'General Support',
      repair: 'Repair Service',
      replace: 'Replacement Service'
    };
    return names[serviceType] || serviceType || 'N/A';
  },

  /**
   * Get service type color
   */
  getServiceTypeColor: (serviceType) => {
    const colors = {
      general: 'blue',
      repair: 'orange',
      replace: 'purple'
    };
    return colors[serviceType] || 'default';
  },

  /**
   * Get condition status display name
   */
  getConditionDisplayName: (condition) => {
    const names = {
      excellent: 'Excellent',
      good: 'Good',
      fair: 'Fair',
      poor: 'Poor',
      new: 'New',
      damaged: 'Damaged',
      non_functional: 'Non-Functional'
    };
    return names[condition] || condition;
  },

  /**
   * Get condition status color
   */
  getConditionColor: (condition) => {
    const colors = {
      excellent: 'green',
      good: 'cyan',
      fair: 'gold',
      poor: 'orange',
      new: 'blue',
      damaged: 'red',
      non_functional: 'volcano'
    };
    return colors[condition] || 'default';
  }
};

export default serviceReportService;
