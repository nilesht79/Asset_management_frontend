import api from './api';

const reconciliationService = {
  // ============================================================================
  // Reconciliation Process APIs
  // ============================================================================

  /**
   * Get all reconciliation processes with pagination and filters
   */
  getReconciliations: (params = {}) => {
    return api.get('/reconciliations', { params });
  },

  /**
   * Get single reconciliation process by ID
   */
  getReconciliation: (id) => {
    return api.get(`/reconciliations/${id}`);
  },

  /**
   * Create new reconciliation process
   */
  createReconciliation: (data) => {
    return api.post('/reconciliations', data);
  },

  /**
   * Start a reconciliation process
   */
  startReconciliation: (id, data = {}) => {
    return api.put(`/reconciliations/${id}/start`, data);
  },

  /**
   * Complete a reconciliation process
   */
  completeReconciliation: (id, data = {}) => {
    return api.put(`/reconciliations/${id}/complete`, data);
  },

  /**
   * Pause a reconciliation process
   */
  pauseReconciliation: (id, data = {}) => {
    return api.put(`/reconciliations/${id}/pause`, data);
  },

  /**
   * Resume a paused reconciliation process
   */
  resumeReconciliation: (id, data = {}) => {
    return api.put(`/reconciliations/${id}/resume`, data);
  },

  /**
   * Delete a reconciliation process
   */
  deleteReconciliation: (id) => {
    return api.delete(`/reconciliations/${id}`);
  },

  // ============================================================================
  // Reconciliation Assets/Records APIs
  // ============================================================================

  /**
   * Get all assets for a reconciliation with pagination and filters
   */
  getReconciliationAssets: (reconciliationId, params = {}) => {
    return api.get(`/reconciliations/${reconciliationId}/assets`, { params });
  },

  /**
   * Add multiple assets to reconciliation
   */
  bulkAddAssets: (reconciliationId, assetIds) => {
    return api.post(`/reconciliations/${reconciliationId}/assets/bulk`, {
      asset_ids: assetIds
    });
  },

  /**
   * Reconcile a single asset
   */
  reconcileAsset: (reconciliationId, assetId, data) => {
    return api.put(`/reconciliations/${reconciliationId}/assets/${assetId}/reconcile`, data);
  },

  /**
   * Bulk reconcile multiple assets
   */
  bulkReconcileAssets: (reconciliationId, assetIds, data) => {
    return api.post(`/reconciliations/${reconciliationId}/assets/reconcile-bulk`, {
      asset_ids: assetIds,
      ...data
    });
  },

  /**
   * Get reconciliation statistics
   */
  getReconciliationStatistics: (reconciliationId) => {
    return api.get(`/reconciliations/${reconciliationId}/statistics`);
  },

  // ============================================================================
  // Discrepancy Export APIs
  // ============================================================================

  /**
   * Export discrepancies to CSV
   */
  exportDiscrepancies: (reconciliationId, format = 'csv') => {
    return api.get(`/reconciliations/${reconciliationId}/discrepancies/export`, {
      params: { format },
      responseType: 'blob' // Important for file download
    });
  }
};

export default reconciliationService;
