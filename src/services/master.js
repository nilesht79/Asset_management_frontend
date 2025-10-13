import api, { apiUtils } from './api'

const masterService = {
  // OEM Services
  getOEMs: (params = {}) => {
    const queryString = apiUtils.buildQueryString(params)
    return api.get(`/masters/oem${queryString ? `?${queryString}` : ''}`)
  },

  getOEM: (id) => {
    return api.get(`/masters/oem/${id}`)
  },

  createOEM: (data) => {
    return api.post('/masters/oem', data)
  },

  updateOEM: (id, data) => {
    return api.put(`/masters/oem/${id}`, data)
  },

  deleteOEM: (id) => {
    return api.delete(`/masters/oem/${id}`)
  },

  getOEMProducts: (id, params = {}) => {
    const queryString = apiUtils.buildQueryString(params)
    return api.get(`/masters/oem/${id}/products${queryString ? `?${queryString}` : ''}`)
  },

  exportOEMs: (params = {}) => {
    const queryString = apiUtils.buildQueryString(params)
    return api.get(`/masters/oem/export${queryString ? `?${queryString}` : ''}`, {
      responseType: 'blob'
    })
  },

  // Category Services
  getCategories: (params = {}) => {
    const queryString = apiUtils.buildQueryString(params)
    return api.get(`/masters/categories${queryString ? `?${queryString}` : ''}`)
  },

  getCategoryTree: (params = {}) => {
    const queryString = apiUtils.buildQueryString(params)
    return api.get(`/masters/categories/tree${queryString ? `?${queryString}` : ''}`)
  },

  getCategory: (id) => {
    return api.get(`/masters/categories/${id}`)
  },

  createCategory: (data) => {
    return api.post('/masters/categories', data)
  },

  updateCategory: (id, data) => {
    return api.put(`/masters/categories/${id}`, data)
  },

  deleteCategory: (id) => {
    return api.delete(`/masters/categories/${id}`)
  },

  getCategorySubcategories: (id) => {
    return api.get(`/masters/categories/${id}/subcategories`)
  },

  // Product Categories Services (using categories endpoint with parent_id=null)
  getProductCategories: (params = {}) => {
    const categoryParams = { ...params, parent_id: 'null' }
    const queryString = apiUtils.buildQueryString(categoryParams)
    return api.get(`/masters/categories${queryString ? `?${queryString}` : ''}`)
  },

  getProductCategory: (id) => {
    return api.get(`/masters/categories/${id}`)
  },

  createProductCategory: (data) => {
    const categoryData = { ...data }
    // Don't send parent_category_id for top-level categories
    delete categoryData.parent_category_id
    return api.post('/masters/categories', categoryData)
  },

  updateProductCategory: (id, data) => {
    const categoryData = { ...data }
    // Don't send parent_category_id for top-level categories
    delete categoryData.parent_category_id
    return api.put(`/masters/categories/${id}`, categoryData)
  },

  deleteProductCategory: (id) => {
    return api.delete(`/masters/categories/${id}`)
  },

  // Product Sub Categories Services (using categories endpoint with parent_id)
  getProductSubCategories: (params = {}) => {
    const queryString = apiUtils.buildQueryString(params)
    return api.get(`/masters/subcategories${queryString ? `?${queryString}` : ''}`)
  },

  getProductSubCategory: (id) => {
    return api.get(`/masters/subcategories/${id}`)
  },

  createProductSubCategory: (data) => {
    return api.post('/masters/subcategories', data)
  },

  updateProductSubCategory: (id, data) => {
    return api.put(`/masters/subcategories/${id}`, data)
  },

  deleteProductSubCategory: (id) => {
    return api.delete(`/masters/subcategories/${id}`)
  },

  // Product Types Services (using dedicated product-types endpoint)
  getProductTypes: (params = {}) => {
    const queryString = apiUtils.buildQueryString(params)
    return api.get(`/masters/product-types${queryString ? `?${queryString}` : ''}`)
  },

  getProductType: (id) => {
    return api.get(`/masters/product-types/${id}`)
  },

  createProductType: (data) => {
    return api.post('/masters/product-types', data)
  },

  updateProductType: (id, data) => {
    return api.put(`/masters/product-types/${id}`, data)
  },

  deleteProductType: (id) => {
    return api.delete(`/masters/product-types/${id}`)
  },

  // Product Series Services
  getProductSeries: (params = {}) => {
    const queryString = apiUtils.buildQueryString(params)
    return api.get(`/masters/product-series${queryString ? `?${queryString}` : ''}`)
  },

  getProductSeriesById: (id) => {
    return api.get(`/masters/product-series/${id}`)
  },

  createProductSeries: (data) => {
    return api.post('/masters/product-series', data)
  },

  updateProductSeries: (id, data) => {
    return api.put(`/masters/product-series/${id}`, data)
  },

  deleteProductSeries: (id) => {
    return api.delete(`/masters/product-series/${id}`)
  },

  // Product Services
  getProducts: (params = {}) => {
    const queryString = apiUtils.buildQueryString(params)
    return api.get(`/masters/products${queryString ? `?${queryString}` : ''}`)
  },

  getProduct: (id) => {
    return api.get(`/masters/products/${id}`)
  },

  createProduct: (data) => {
    return api.post('/masters/products', data)
  },

  updateProduct: (id, data) => {
    return api.put(`/masters/products/${id}`, data)
  },

  deleteProduct: (id) => {
    return api.delete(`/masters/products/${id}`)
  },

  // Location Services
  getLocations: (params = {}) => {
    const queryString = apiUtils.buildQueryString(params)
    return api.get(`/masters/locations${queryString ? `?${queryString}` : ''}`)
  },

  getLocationTree: (params = {}) => {
    const queryString = apiUtils.buildQueryString(params)
    return api.get(`/masters/locations/tree${queryString ? `?${queryString}` : ''}`)
  },

  getLocation: (id) => {
    return api.get(`/masters/locations/${id}`)
  },

  createLocation: (data) => {
    return api.post('/masters/locations', data)
  },

  updateLocation: (id, data) => {
    return api.put(`/masters/locations/${id}`, data)
  },

  deleteLocation: (id) => {
    return api.delete(`/masters/locations/${id}`)
  },

  getLocationSublocations: (id) => {
    return api.get(`/masters/locations/${id}/sub-locations`)
  },


  // Client Services
  getClients: (params = {}) => {
    const queryString = apiUtils.buildQueryString(params)
    return api.get(`/masters/clients${queryString ? `?${queryString}` : ''}`)
  },

  getClient: (id) => {
    return api.get(`/masters/clients/${id}`)
  },

  createClient: (data) => {
    return api.post('/masters/clients', data)
  },

  updateClient: (id, data) => {
    return api.put(`/masters/clients/${id}`, data)
  },

  deleteClient: (id) => {
    return api.delete(`/masters/clients/${id}`)
  },

  getClientsDropdown: () => {
    return api.get('/masters/clients/dropdown')
  },

  // Location Types Services
  getLocationTypes: (params = {}) => {
    const queryString = apiUtils.buildQueryString(params)
    return api.get(`/masters/location-types${queryString ? `?${queryString}` : ''}`)
  },

  getLocationType: (id) => {
    return api.get(`/masters/location-types/${id}`)
  },

  createLocationType: (data) => {
    return api.post('/masters/location-types', data)
  },

  updateLocationType: (id, data) => {
    return api.put(`/masters/location-types/${id}`, data)
  },

  deleteLocationType: (id) => {
    return api.delete(`/masters/location-types/${id}`)
  },

  getLocationTypesDropdown: () => {
    return api.get('/masters/location-types/dropdown')
  },

  // Pincode Lookup Service
  lookupPincode: (pincode) => {
    return api.get(`/masters/pincode-lookup/${pincode}`)
  },


  // Bulk operations
  bulkCreateOEMs: (data) => {
    return api.post('/masters/oem/bulk', { oems: data })
  },

  bulkCreateCategories: (data) => {
    return api.post('/masters/categories/bulk', { categories: data })
  },

  bulkCreateProducts: (data) => {
    return api.post('/masters/products/bulk', { products: data })
  },

  bulkCreateLocations: (data) => {
    return api.post('/masters/locations/bulk', { locations: data })
  },

  // Import/Export operations
  exportOEMs: (params = {}) => {
    const queryString = apiUtils.buildQueryString(params)
    return apiUtils.downloadFile(
      `/masters/oem/export${queryString ? `?${queryString}` : ''}`,
      `oems_export_${new Date().toISOString().split('T')[0]}.xlsx`
    )
  },

  exportCategories: (params = {}) => {
    const queryString = apiUtils.buildQueryString(params)
    return apiUtils.downloadFile(
      `/masters/categories/export${queryString ? `?${queryString}` : ''}`,
      `categories_export_${new Date().toISOString().split('T')[0]}.xlsx`
    )
  },

  exportProducts: (params = {}) => {
    const queryString = apiUtils.buildQueryString(params)
    return apiUtils.downloadFile(
      `/masters/products/export${queryString ? `?${queryString}` : ''}`,
      `products_export_${new Date().toISOString().split('T')[0]}.xlsx`
    )
  },

  exportLocations: (params = {}) => {
    const queryString = apiUtils.buildQueryString(params)
    return apiUtils.downloadFile(
      `/masters/locations/export${queryString ? `?${queryString}` : ''}`,
      `locations_export_${new Date().toISOString().split('T')[0]}.xlsx`
    )
  },

  importOEMs: (file, onProgress) => {
    return apiUtils.uploadFile('/masters/oem/import', file, onProgress)
  },

  importCategories: (file, onProgress) => {
    return apiUtils.uploadFile('/masters/categories/import', file, onProgress)
  },

  importProducts: (file, onProgress) => {
    return apiUtils.uploadFile('/masters/products/import', file, onProgress)
  },

  importLocations: (file, onProgress) => {
    return apiUtils.uploadFile('/masters/locations/import', file, onProgress)
  },

  // Validation and utility functions
  validateOEM: (data) => {
    const errors = {}
    
    if (!data.name?.trim()) {
      errors.name = 'OEM name is required'
    }
    
    if (data.email && !isValidEmail(data.email)) {
      errors.email = 'Please enter a valid email address'
    }
    
    if (data.phone && !isValidPhone(data.phone)) {
      errors.phone = 'Please enter a valid phone number'
    }
    
    if (data.website && !isValidURL(data.website)) {
      errors.website = 'Please enter a valid website URL'
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    }
  },

  validateCategory: (data) => {
    const errors = {}
    
    if (!data.name?.trim()) {
      errors.name = 'Category name is required'
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    }
  },

  validateProduct: (data) => {
    const errors = {}
    
    if (!data.name?.trim()) {
      errors.name = 'Product name is required'
    }
    
    if (!data.category_id) {
      errors.category_id = 'Category is required'
    }
    
    if (!data.oem_id) {
      errors.oem_id = 'OEM is required'
    }
    
    if (data.warranty_period && (data.warranty_period < 0 || data.warranty_period > 120)) {
      errors.warranty_period = 'Warranty period must be between 0 and 120 months'
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    }
  },

  validateLocation: (data) => {
    const errors = {}
    
    if (!data.name?.trim()) {
      errors.name = 'Location name is required'
    }
    
    if (!data.address?.trim()) {
      errors.address = 'Address is required'
    }
    
    if (!data.city?.trim()) {
      errors.city = 'City is required'
    }
    
    if (!data.state?.trim()) {
      errors.state = 'State is required'
    }
    
    if (!data.pincode?.trim()) {
      errors.pincode = 'Pincode is required'
    } else if (!/^\d{6}$/.test(data.pincode.trim())) {
      errors.pincode = 'Pincode must be 6 digits'
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    }
  },

  // Search and filter utilities
  buildSearchParams: (filters, pagination = {}) => {
    const params = {}
    
    // Add search filters
    if (filters.search) params.search = filters.search
    if (filters.status) params.status = filters.status
    if (filters.category_id) params.category_id = filters.category_id
    if (filters.oem_id) params.oem_id = filters.oem_id
    if (filters.parent_id !== undefined) params.parent_id = filters.parent_id
    if (filters.city) params.city = filters.city
    if (filters.state) params.state = filters.state
    
    // Add pagination
    if (pagination.page) params.page = pagination.page
    if (pagination.limit) params.limit = pagination.limit
    if (pagination.sortBy) params.sortBy = pagination.sortBy
    if (pagination.sortOrder) params.sortOrder = pagination.sortOrder
    
    return params
  }
}

// Helper validation functions
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const isValidPhone = (phone) => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))
}

const isValidURL = (url) => {
  try {
    new URL(url.startsWith('http') ? url : `https://${url}`)
    return true
  } catch {
    return false
  }
}

export default masterService