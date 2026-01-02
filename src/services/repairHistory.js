/**
 * REPAIR HISTORY SERVICE
 * API service for asset repair history and fault tracking
 */

import apiClient from '../utils/apiClient';

const repairHistoryService = {
  // ============================================
  // REPAIR HISTORY METHODS
  // ============================================

  /**
   * Get all repairs with filters
   */
  getAllRepairs: async (params = {}) => {
    try {
      const response = await apiClient.get('/repair-history', { params });
      return response;
    } catch (error) {
      console.error('Error fetching repairs:', error);
      throw error;
    }
  },

  /**
   * Get repair entry by ID
   */
  getRepairById: async (repairId) => {
    try {
      const response = await apiClient.get(`/repair-history/${repairId}`);
      return response;
    } catch (error) {
      console.error('Error fetching repair:', error);
      throw error;
    }
  },

  /**
   * Get repair history for an asset
   */
  getAssetRepairHistory: async (assetId, params = {}) => {
    try {
      const response = await apiClient.get(`/assets/${assetId}/repair-history`, { params });
      return response;
    } catch (error) {
      console.error('Error fetching asset repair history:', error);
      throw error;
    }
  },

  /**
   * Get repair statistics for an asset
   */
  getAssetRepairStats: async (assetId) => {
    try {
      const response = await apiClient.get(`/assets/${assetId}/repair-stats`);
      return response;
    } catch (error) {
      console.error('Error fetching asset repair stats:', error);
      throw error;
    }
  },

  /**
   * Create a new repair entry
   */
  createRepairEntry: async (repairData) => {
    try {
      const response = await apiClient.post('/repair-history', repairData);
      return response;
    } catch (error) {
      console.error('Error creating repair entry:', error);
      throw error;
    }
  },

  /**
   * Update repair entry
   */
  updateRepairEntry: async (repairId, updateData) => {
    try {
      const response = await apiClient.put(`/repair-history/${repairId}`, updateData);
      return response;
    } catch (error) {
      console.error('Error updating repair entry:', error);
      throw error;
    }
  },

  /**
   * Delete repair entry
   */
  deleteRepairEntry: async (repairId) => {
    try {
      const response = await apiClient.delete(`/repair-history/${repairId}`);
      return response;
    } catch (error) {
      console.error('Error deleting repair entry:', error);
      throw error;
    }
  },

  /**
   * Create repair entries from ticket closure
   */
  createFromTicketClosure: async (ticketId, closureData) => {
    try {
      const response = await apiClient.post(`/repair-history/from-ticket/${ticketId}`, closureData);
      return response;
    } catch (error) {
      console.error('Error creating repairs from ticket:', error);
      throw error;
    }
  },

  /**
   * Get repair cost summary
   */
  getRepairCostSummary: async (params = {}) => {
    try {
      const response = await apiClient.get('/repair-history/cost-summary', { params });
      return response;
    } catch (error) {
      console.error('Error fetching cost summary:', error);
      throw error;
    }
  },

  // ============================================
  // FAULT TYPES METHODS
  // ============================================

  /**
   * Get all fault types
   */
  getFaultTypes: async (params = {}) => {
    try {
      const response = await apiClient.get('/repair-history/fault-types', { params });
      return response;
    } catch (error) {
      console.error('Error fetching fault types:', error);
      throw error;
    }
  },

  /**
   * Get fault types grouped by category
   */
  getFaultTypesByCategory: async () => {
    try {
      const response = await apiClient.get('/repair-history/fault-types', {
        params: { grouped: true }
      });
      return response;
    } catch (error) {
      console.error('Error fetching fault types by category:', error);
      throw error;
    }
  },

  /**
   * Create a new fault type
   */
  createFaultType: async (faultTypeData) => {
    try {
      const response = await apiClient.post('/repair-history/fault-types', faultTypeData);
      return response;
    } catch (error) {
      console.error('Error creating fault type:', error);
      throw error;
    }
  },

  /**
   * Update fault type
   */
  updateFaultType: async (faultTypeId, updateData) => {
    try {
      const response = await apiClient.put(`/repair-history/fault-types/${faultTypeId}`, updateData);
      return response;
    } catch (error) {
      console.error('Error updating fault type:', error);
      throw error;
    }
  },

  /**
   * Delete fault type
   */
  deleteFaultType: async (faultTypeId) => {
    try {
      const response = await apiClient.delete(`/repair-history/fault-types/${faultTypeId}`);
      return response;
    } catch (error) {
      console.error('Error deleting fault type:', error);
      throw error;
    }
  },

  /**
   * Get fault type statistics
   */
  getFaultTypeStats: async () => {
    try {
      const response = await apiClient.get('/repair-history/fault-types/stats');
      return response;
    } catch (error) {
      console.error('Error fetching fault type stats:', error);
      throw error;
    }
  },

  // ============================================
  // HELPER METHODS
  // ============================================

  /**
   * Get repair status color
   */
  getStatusColor: (status) => {
    const colors = {
      pending: 'gold',
      in_progress: 'blue',
      completed: 'green',
      failed: 'red',
      cancelled: 'default'
    };
    return colors[status] || 'default';
  },

  /**
   * Get repair status display name
   */
  getStatusDisplayName: (status) => {
    const names = {
      pending: 'Pending',
      in_progress: 'In Progress',
      completed: 'Completed',
      failed: 'Failed',
      cancelled: 'Cancelled'
    };
    return names[status] || status;
  },

  /**
   * Format currency in INR
   */
  formatCurrency: (amount) => {
    if (amount === null || amount === undefined) return 'N/A';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  },

  /**
   * Format date
   * Database stores UTC, so we parse as UTC and display in local time
   */
  formatDate: (dateString) => {
    if (!dateString) return 'N/A';

    // Ensure the date is parsed as UTC by appending 'Z' if no timezone indicator exists
    let utcDateString = dateString;
    if (typeof dateString === 'string' && !dateString.endsWith('Z') && !dateString.includes('+')) {
      utcDateString = dateString + 'Z';
    }

    return new Date(utcDateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
};

export default repairHistoryService;
