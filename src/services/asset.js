import api, { apiUtils } from './api'

const assetService = {
  // Get all assets with pagination and filtering
  getAssets: (params = {}) => {
    const queryString = apiUtils.buildQueryString(params)
    return api.get(`/assets${queryString ? `?${queryString}` : ''}`)
  },

  // Get asset statistics for dashboard
  getAssetStatistics: () => {
    return api.get('/assets/statistics')
  },

  // Get single asset by ID
  getAsset: (id) => {
    return api.get(`/assets/${id}`)
  },

  // Create new asset
  createAsset: (data) => {
    return api.post('/assets', data)
  },

  // Update asset
  updateAsset: (id, data) => {
    return api.put(`/assets/${id}`, data)
  },

  // Delete asset (soft delete)
  deleteAsset: (id) => {
    return api.delete(`/assets/${id}`)
  },

  // Assign asset to user
  assignAsset: (id, data) => {
    return api.post(`/assets/${id}/assign`, data)
  },

  // Unassign asset from user
  unassignAsset: (id) => {
    return api.post(`/assets/${id}/unassign`)
  },

  // Get assets dropdown for forms
  getAssetsDropdown: (params = {}) => {
    const queryString = apiUtils.buildQueryString(params)
    return api.get(`/assets/dropdown${queryString ? `?${queryString}` : ''}`)
  },

  // Export assets
  exportAssets: (params = {}) => {
    const queryString = apiUtils.buildQueryString(params)
    return api.get(`/assets/export${queryString ? `?${queryString}` : ''}`, {
      responseType: 'blob'
    })
  },

  // Get deleted assets
  getDeletedAssets: (params = {}) => {
    const queryString = apiUtils.buildQueryString(params)
    return api.get(`/assets/deleted${queryString ? `?${queryString}` : ''}`)
  },

  // Restore deleted asset
  restoreAsset: (id) => {
    return api.post(`/assets/${id}/restore`)
  }
}

export default assetService