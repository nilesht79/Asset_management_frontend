import api, { apiUtils } from './api'

const licenseService = {
  // =====================
  // LICENSE CRUD
  // =====================

  // Get all licenses with pagination and filters
  getLicenses: (params = {}) => {
    const queryString = apiUtils.buildQueryString(params)
    return api.get(`/licenses${queryString ? `?${queryString}` : ''}`)
  },

  // Get single license with installation details
  getLicense: (id) => {
    return api.get(`/licenses/${id}`)
  },

  // Create new license
  createLicense: (data) => {
    return api.post('/licenses', data)
  },

  // Update license
  updateLicense: (id, data) => {
    return api.put(`/licenses/${id}`, data)
  },

  // Delete license
  deleteLicense: (id) => {
    return api.delete(`/licenses/${id}`)
  },

  // =====================
  // UTILIZATION & REPORTS
  // =====================

  // Get license utilization report (Purchased vs Allocated)
  getUtilizationReport: () => {
    return api.get('/licenses/utilization-report')
  },

  // Get license usage analytics - Purchased vs Peak Usage (Monthly/Quarterly)
  // params: { period: 'monthly' | 'quarterly', months: number }
  getUsageAnalytics: (params = {}) => {
    const queryString = apiUtils.buildQueryString(params)
    return api.get(`/licenses/usage-analytics${queryString ? `?${queryString}` : ''}`)
  },

  // Get expiration alerts - warranty, EOL, EOS, license expiration
  // params: { days: number, type: 'all' | 'warranty' | 'eol' | 'eos' | 'license' | 'support' }
  getExpirationAlerts: (params = {}) => {
    const queryString = apiUtils.buildQueryString(params)
    return api.get(`/licenses/expiration-alerts${queryString ? `?${queryString}` : ''}`)
  },

  // Get available licenses for a specific product (for software installation dropdown)
  // includeLicenseId: optional - include a specific license even if fully allocated (for editing)
  getLicensesForProduct: (productId, includeLicenseId = null) => {
    const params = includeLicenseId ? { include_license_id: includeLicenseId } : {}
    return api.get(`/licenses/for-product/${productId}`, { params })
  },

  // =====================
  // LICENSE KEYS
  // =====================

  // Get all license keys for a license
  getLicenseKeys: (licenseId) => {
    return api.get(`/licenses/${licenseId}/keys`)
  },

  // Add license keys (single or bulk)
  addLicenseKeys: (licenseId, licenseKeys) => {
    return api.post(`/licenses/${licenseId}/keys`, { license_keys: licenseKeys })
  },

  // Delete a license key
  deleteLicenseKey: (licenseId, keyId) => {
    return api.delete(`/licenses/${licenseId}/keys/${keyId}`)
  },

  // Get next available license key
  getAvailableLicenseKey: (licenseId) => {
    return api.get(`/licenses/${licenseId}/keys/available`)
  },

  // =====================
  // BULK UPLOAD
  // =====================

  // Bulk upload licenses with their keys
  bulkUploadLicenses: (licenses) => {
    return api.post('/licenses/bulk-upload', { licenses })
  },

  // Get bulk upload template
  getBulkUploadTemplate: () => {
    return api.get('/licenses/bulk-upload/template')
  },

  // =====================
  // UTILITY FUNCTIONS
  // =====================

  // License type display names
  getLicenseTypeLabel: (type) => {
    const labels = {
      'per_user': 'Per User',
      'per_device': 'Per Device',
      'concurrent': 'Concurrent',
      'site': 'Site License',
      'volume': 'Volume License'
    }
    return labels[type] || type
  },

  // License type color for tags
  getLicenseTypeColor: (type) => {
    const colors = {
      'per_user': 'blue',
      'per_device': 'green',
      'concurrent': 'purple',
      'site': 'gold',
      'volume': 'cyan'
    }
    return colors[type] || 'default'
  },

  // Get utilization status color
  getUtilizationColor: (percent) => {
    if (percent >= 90) return '#ff4d4f'  // Red - critical
    if (percent >= 75) return '#faad14'  // Yellow - warning
    return '#52c41a'  // Green - healthy
  },

  // Check if license is expiring soon (within 30 days)
  isExpiringSoon: (expirationDate) => {
    if (!expirationDate) return false
    const expDate = new Date(expirationDate)
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
    return expDate <= thirtyDaysFromNow
  },

  // Check if license is expired
  isExpired: (expirationDate) => {
    if (!expirationDate) return false
    return new Date(expirationDate) < new Date()
  },

  // Format license count display
  formatLicenseCount: (allocated, total) => {
    const available = total - allocated
    const percent = total > 0 ? Math.round((allocated / total) * 100) : 0
    return {
      allocated,
      total,
      available,
      percent,
      display: `${allocated} / ${total}`,
      status: percent >= 100 ? 'full' : percent >= 90 ? 'critical' : percent >= 75 ? 'warning' : 'healthy'
    }
  },

  // Validation
  validateLicense: (data) => {
    const errors = {}

    if (!data.product_id) {
      errors.product_id = 'Software product is required'
    }

    if (!data.license_name?.trim()) {
      errors.license_name = 'License name is required'
    }

    if (data.total_licenses === undefined || data.total_licenses < 0) {
      errors.total_licenses = 'Total licenses must be a non-negative number'
    }

    const validTypes = ['per_user', 'per_device', 'concurrent', 'site', 'volume']
    if (data.license_type && !validTypes.includes(data.license_type)) {
      errors.license_type = 'Invalid license type'
    }

    if (data.purchase_cost !== undefined && data.purchase_cost < 0) {
      errors.purchase_cost = 'Purchase cost cannot be negative'
    }

    if (data.expiration_date && data.purchase_date) {
      if (new Date(data.expiration_date) < new Date(data.purchase_date)) {
        errors.expiration_date = 'Expiration date must be after purchase date'
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    }
  }
}

export default licenseService
