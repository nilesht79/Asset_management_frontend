import api, { apiUtils } from './api'

const consumableService = {
  // =====================
  // CONSUMABLE CATEGORIES
  // =====================
  getCategories: (params = {}) => {
    const queryString = apiUtils.buildQueryString(params)
    return api.get(`/consumables/categories${queryString ? `?${queryString}` : ''}`)
  },

  createCategory: (data) => {
    return api.post('/consumables/categories', data)
  },

  updateCategory: (id, data) => {
    return api.put(`/consumables/categories/${id}`, data)
  },

  deleteCategory: (id) => {
    return api.delete(`/consumables/categories/${id}`)
  },

  // =====================
  // CONSUMABLES (MASTER)
  // =====================
  getConsumables: (params = {}) => {
    const queryString = apiUtils.buildQueryString(params)
    return api.get(`/consumables${queryString ? `?${queryString}` : ''}`)
  },

  getConsumable: (id) => {
    return api.get(`/consumables/${id}`)
  },

  createConsumable: (data) => {
    return api.post('/consumables', data)
  },

  updateConsumable: (id, data) => {
    return api.put(`/consumables/${id}`, data)
  },

  deleteConsumable: (id) => {
    return api.delete(`/consumables/${id}`)
  },

  getConsumablesForAsset: (assetId) => {
    return api.get(`/consumables/for-asset/${assetId}`)
  },

  // =====================
  // COMPATIBILITY
  // =====================
  getCompatibility: (consumableId) => {
    return api.get(`/consumables/${consumableId}/compatibility`)
  },

  addCompatibility: (consumableId, productIds) => {
    return api.post(`/consumables/${consumableId}/compatibility`, { product_ids: productIds })
  },

  removeCompatibility: (consumableId, productId) => {
    return api.delete(`/consumables/${consumableId}/compatibility/${productId}`)
  },

  // =====================
  // INVENTORY MANAGEMENT
  // =====================
  getInventory: (params = {}) => {
    const queryString = apiUtils.buildQueryString(params)
    return api.get(`/consumables/inventory${queryString ? `?${queryString}` : ''}`)
  },

  stockIn: (data) => {
    return api.post('/consumables/inventory/stock-in', data)
  },

  adjustStock: (data) => {
    return api.post('/consumables/inventory/adjust', data)
  },

  getLowStock: (params = {}) => {
    const queryString = apiUtils.buildQueryString(params)
    return api.get(`/consumables/inventory/low-stock${queryString ? `?${queryString}` : ''}`)
  },

  getTransactions: (params = {}) => {
    const queryString = apiUtils.buildQueryString(params)
    return api.get(`/consumables/transactions${queryString ? `?${queryString}` : ''}`)
  },

  // =====================
  // CONSUMABLE REQUESTS
  // =====================
  getRequests: (params = {}) => {
    const queryString = apiUtils.buildQueryString(params)
    return api.get(`/consumables/requests${queryString ? `?${queryString}` : ''}`)
  },

  getMyRequests: (params = {}) => {
    const queryString = apiUtils.buildQueryString(params)
    return api.get(`/consumables/requests/my-requests${queryString ? `?${queryString}` : ''}`)
  },

  getRequest: (id) => {
    return api.get(`/consumables/requests/${id}`)
  },

  createRequest: (data) => {
    return api.post('/consumables/requests', data)
  },

  approveRequest: (id, data = {}) => {
    return api.put(`/consumables/requests/${id}/approve`, data)
  },

  rejectRequest: (id, data) => {
    return api.put(`/consumables/requests/${id}/reject`, data)
  },

  issueRequest: (id, data = {}) => {
    return api.put(`/consumables/requests/${id}/issue`, data)
  },

  deliverRequest: (id, data = {}) => {
    return api.put(`/consumables/requests/${id}/deliver`, data)
  },

  cancelRequest: (id, data = {}) => {
    return api.put(`/consumables/requests/${id}/cancel`, data)
  },

  getRequestStats: () => {
    return api.get('/consumables/requests/statistics/summary')
  },

  // Get engineers for approval assignment
  getEngineers: () => {
    return api.get('/consumables/requests/engineers')
  },

  // Get stock info for a specific request (for approval modal)
  getRequestStockInfo: (requestId) => {
    return api.get(`/consumables/requests/${requestId}/stock-info`)
  },

  // =====================
  // CONSUMPTION REPORTS
  // =====================
  getConsumptionReport: (params = {}) => {
    const queryString = apiUtils.buildQueryString(params)
    return api.get(`/consumables/consumption-report${queryString ? `?${queryString}` : ''}`)
  },

  exportConsumptionReport: async (params = {}) => {
    const queryString = apiUtils.buildQueryString(params)
    const response = await api.get(`/consumables/consumption-report/export${queryString ? `?${queryString}` : ''}`, {
      responseType: 'blob'
    })

    // Create download link
    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `consumables_consumption_${new Date().toISOString().split('T')[0]}.xlsx`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    return response
  }
}

export default consumableService
