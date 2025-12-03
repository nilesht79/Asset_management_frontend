/**
 * FAULT ANALYSIS SERVICE
 * API service for fault analysis and problematic asset tracking
 */

import apiClient from '../utils/apiClient';

const faultAnalysisService = {
  // ============================================
  // FLAG METHODS
  // ============================================

  /**
   * Get all active fault flags
   */
  getActiveFlags: async (params = {}) => {
    try {
      const response = await apiClient.get('/fault-analysis/flags', { params });
      return response;
    } catch (error) {
      console.error('Error fetching active flags:', error);
      throw error;
    }
  },

  /**
   * Get flags for a specific asset
   */
  getAssetFlags: async (assetId) => {
    try {
      const response = await apiClient.get(`/fault-analysis/assets/${assetId}/flags`);
      return response;
    } catch (error) {
      console.error('Error fetching asset flags:', error);
      throw error;
    }
  },

  /**
   * Get flags for a product model
   */
  getProductFlags: async (productId) => {
    try {
      const response = await apiClient.get(`/fault-analysis/products/${productId}/flags`);
      return response;
    } catch (error) {
      console.error('Error fetching product flags:', error);
      throw error;
    }
  },

  /**
   * Create a manual fault flag
   */
  createFlag: async (flagData) => {
    try {
      const response = await apiClient.post('/fault-analysis/flags', flagData);
      return response;
    } catch (error) {
      console.error('Error creating flag:', error);
      throw error;
    }
  },

  /**
   * Resolve a fault flag
   */
  resolveFlag: async (flagId, resolutionData) => {
    try {
      const response = await apiClient.put(`/fault-analysis/flags/${flagId}/resolve`, resolutionData);
      return response;
    } catch (error) {
      console.error('Error resolving flag:', error);
      throw error;
    }
  },

  /**
   * Deactivate a fault flag
   */
  deactivateFlag: async (flagId) => {
    try {
      const response = await apiClient.delete(`/fault-analysis/flags/${flagId}`);
      return response;
    } catch (error) {
      console.error('Error deactivating flag:', error);
      throw error;
    }
  },

  // ============================================
  // ANALYSIS METHODS
  // ============================================

  /**
   * Run automatic fault analysis
   */
  runAutoAnalysis: async (options = {}) => {
    try {
      const response = await apiClient.post('/fault-analysis/run', options);
      return response;
    } catch (error) {
      console.error('Error running auto analysis:', error);
      throw error;
    }
  },

  /**
   * Analyze faults for all assets
   */
  analyzeAllAssets: async (params = {}) => {
    try {
      const response = await apiClient.get('/fault-analysis/analyze/assets', { params });
      return response;
    } catch (error) {
      console.error('Error analyzing asset faults:', error);
      throw error;
    }
  },

  /**
   * Analyze faults for a specific asset
   */
  analyzeAsset: async (assetId, params = {}) => {
    try {
      const response = await apiClient.get(`/fault-analysis/analyze/asset/${assetId}`, { params });
      return response;
    } catch (error) {
      console.error('Error analyzing asset:', error);
      throw error;
    }
  },

  /**
   * Analyze faults for product models/OEMs
   */
  analyzeModels: async (params = {}) => {
    try {
      const response = await apiClient.get('/fault-analysis/analyze/models', { params });
      return response;
    } catch (error) {
      console.error('Error analyzing model faults:', error);
      throw error;
    }
  },

  // ============================================
  // STATISTICS & REPORTS
  // ============================================

  /**
   * Get flag statistics
   */
  getFlagStats: async () => {
    try {
      const response = await apiClient.get('/fault-analysis/stats');
      return response;
    } catch (error) {
      console.error('Error fetching flag stats:', error);
      throw error;
    }
  },

  /**
   * Get resolved flags history
   */
  getResolvedFlags: async (params = {}) => {
    try {
      const response = await apiClient.get('/fault-analysis/flags/history', { params });
      return response;
    } catch (error) {
      console.error('Error fetching resolved flags history:', error);
      throw error;
    }
  },

  /**
   * Get problematic assets report
   */
  getProblematicAssetsReport: async () => {
    try {
      const response = await apiClient.get('/fault-analysis/reports/problematic-assets');
      return response;
    } catch (error) {
      console.error('Error fetching problematic assets report:', error);
      throw error;
    }
  },

  // ============================================
  // HELPER METHODS
  // ============================================

  /**
   * Get severity color
   */
  getSeverityColor: (severity) => {
    const colors = {
      warning: 'gold',
      critical: 'orange',
      severe: 'red'
    };
    return colors[severity] || 'default';
  },

  /**
   * Get severity icon
   */
  getSeverityIcon: (severity) => {
    const icons = {
      warning: 'exclamation-circle',
      critical: 'warning',
      severe: 'close-circle'
    };
    return icons[severity] || 'info-circle';
  },

  /**
   * Get flag type display name
   */
  getFlagTypeDisplayName: (flagType) => {
    const names = {
      asset: 'Individual Asset',
      product_model: 'Product Model',
      oem: 'Manufacturer (OEM)'
    };
    return names[flagType] || flagType;
  },

  /**
   * Get resolution action display name
   */
  getResolutionActionDisplayName: (action) => {
    const names = {
      replaced: 'Asset Replaced',
      repaired: 'Asset Repaired',
      retired: 'Asset Retired',
      vendor_notified: 'Vendor Notified',
      monitoring: 'Under Monitoring',
      dismissed: 'Dismissed',
      other: 'Other'
    };
    return names[action] || action;
  },

  /**
   * Format threshold rule for display
   */
  formatThresholdRule: (rule) => {
    if (!rule) return 'N/A';
    // e.g., "3 faults in 6 months" -> "3+ faults within 6 months"
    return rule.replace(' faults in ', '+ faults within ');
  }
};

export default faultAnalysisService;
