/**
 * ASSET JOB REPORT SERVICE
 * API service for IT Asset Install, Move, and Transfer reports
 */

import apiClient from '../utils/apiClient';

const assetJobReportService = {
  /**
   * Get asset job reports with filters
   * @param {Object} params - Query parameters
   * @param {string} params.report_type - 'install' | 'move' | 'transfer' | 'all'
   * @param {string} params.date_from - Start date (YYYY-MM-DD)
   * @param {string} params.date_to - End date (YYYY-MM-DD)
   * @param {number} params.location_id - Filter by location
   * @param {number} params.department_id - Filter by department
   * @param {string} params.user_id - Filter by user
   * @param {number} params.category_id - Filter by asset category
   * @param {number} params.oem_id - Filter by OEM
   * @param {number} params.product_id - Filter by product
   * @param {string} params.search - Search term
   * @param {number} params.page - Page number
   * @param {number} params.limit - Items per page
   */
  getReports: async (params = {}) => {
    try {
      const response = await apiClient.get('/asset-reports/job-reports', { params });
      return response;
    } catch (error) {
      console.error('Error fetching asset job reports:', error);
      throw error;
    }
  },

  /**
   * Get single job report details
   * @param {number} id - Movement/Report ID
   */
  getReportById: async (id) => {
    try {
      const response = await apiClient.get(`/asset-reports/job-reports/${id}`);
      return response;
    } catch (error) {
      console.error('Error fetching job report:', error);
      throw error;
    }
  },

  /**
   * Download PDF for single job report
   * @param {number} id - Report ID
   * @param {string} assetTag - Asset tag for filename
   * @param {string} jobType - Job type for filename
   */
  downloadPDF: async (id, assetTag = '', jobType = 'Job') => {
    try {
      const response = await apiClient.get(`/asset-reports/job-reports/${id}/pdf`, {
        responseType: 'blob'
      });

      // Create download link
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      const typeMap = {
        install: 'Install',
        move: 'Move',
        transfer: 'Transfer'
      };
      const typeDisplay = typeMap[jobType] || 'Job';
      link.download = `IT_Asset_${typeDisplay}_Report_${assetTag}_${new Date().toISOString().split('T')[0]}.pdf`;

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
   * Download bulk PDF for multiple job reports
   * @param {number[]} reportIds - Array of report IDs
   */
  downloadBulkPDF: async (reportIds) => {
    try {
      const response = await apiClient.post('/asset-reports/job-reports/pdf/bulk', {
        report_ids: reportIds
      }, {
        responseType: 'blob'
      });

      // Create download link
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `IT_Asset_Job_Reports_Bulk_${new Date().toISOString().split('T')[0]}.pdf`;

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

  /**
   * Export job reports to Excel
   * @param {Object} params - Same as getReports params
   */
  exportToExcel: async (params = {}) => {
    try {
      const response = await apiClient.get('/asset-reports/job-reports/export/excel', {
        params,
        responseType: 'blob'
      });

      // Create download link
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      const typeMap = {
        install: 'Install',
        move: 'Move',
        transfer: 'Transfer',
        all: 'All'
      };
      const typeDisplay = typeMap[params.report_type] || 'All';
      link.download = `IT_Asset_${typeDisplay}_Job_Reports_${new Date().toISOString().split('T')[0]}.xlsx`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      throw error;
    }
  },

  // ==================== UTILITY FUNCTIONS ====================

  /**
   * Get job type display name
   */
  getJobTypeDisplayName: (jobType) => {
    const names = {
      install: 'Installation',
      move: 'Movement',
      transfer: 'Transfer'
    };
    return names[jobType] || jobType || 'N/A';
  },

  /**
   * Get job type color
   */
  getJobTypeColor: (jobType) => {
    const colors = {
      install: 'green',
      move: 'cyan',
      transfer: 'orange'
    };
    return colors[jobType] || 'default';
  },

  /**
   * Get job type icon name (Ant Design icons)
   */
  getJobTypeIcon: (jobType) => {
    const icons = {
      install: 'DownloadOutlined',
      move: 'SwapOutlined',
      transfer: 'UserSwitchOutlined'
    };
    return icons[jobType] || 'FileOutlined';
  }
};

export default assetJobReportService;
