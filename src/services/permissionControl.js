import api, { apiUtils } from './api'

const permissionControlService = {
  // Permission Categories Management
  getPermissionCategories: (params = {}) => {
    const queryString = apiUtils.buildQueryString(params)
    return api.get(`/admin/permission-control/categories${queryString ? `?${queryString}` : ''}`)
  },

  // Role Permission Templates Management
  getRoleTemplates: (params = {}) => {
    const queryString = apiUtils.buildQueryString(params)
    return api.get(`/admin/permission-control/role-templates${queryString ? `?${queryString}` : ''}`)
  },

  updateRoleTemplate: (roleName, permissions) => {
    return api.put(`/admin/permission-control/role-templates/${roleName}`, {
      permissions
    })
  },

  getRolePermissions: (roleName) => {
    return api.get(`/admin/permission-control/role-templates/${roleName}`)
  },

  // User Permission Management
  getUserPermissions: (userId, params = {}) => {
    const queryString = apiUtils.buildQueryString(params)
    return api.get(`/permissions/user/${userId}${queryString ? `?${queryString}` : ''}`)
  },

  grantUserPermission: (userId, permissionData) => {
    return api.post(`/permissions/user/${userId}`, permissionData)
  },

  revokeUserPermission: (userId, permissionData) => {
    return api.post(`/permissions/user/${userId}`, {
      ...permissionData,
      granted: false
    })
  },

  updateUserPermissions: (userId, permissions) => {
    return api.put(`/permissions/user/${userId}`, {
      permissions
    })
  },

  // Permission Validation
  checkPermissions: (permissions, userId = null) => {
    return api.post('/permissions/check', {
      permissions,
      userId: userId
    })
  },

  checkUserPermission: (userId, permission) => {
    return api.post('/permissions/check', {
      permissions: [permission],
      userId: userId
    })
  },

  // Audit and Analytics
  getPermissionAuditLogs: (params = {}) => {
    const queryString = apiUtils.buildQueryString(params)
    return api.get(`/admin/permissions/audit${queryString ? `?${queryString}` : ''}`)
  },

  getUserAuditLogs: (userId, params = {}) => {
    const queryString = apiUtils.buildQueryString(params)
    return api.get(`/permissions/audit/${userId}${queryString ? `?${queryString}` : ''}`)
  },

  // Analytics and Reporting
  getPermissionAnalytics: (params = {}) => {
    const queryString = apiUtils.buildQueryString(params)
    return api.get(`/admin/permission-control/analytics${queryString ? `?${queryString}` : ''}`)
  },

  getRoleDistribution: () => {
    return api.get('/admin/permission-control/analytics/role-distribution')
  },

  getPermissionUsage: (params = {}) => {
    const queryString = apiUtils.buildQueryString(params)
    return api.get(`/admin/permission-control/analytics/permission-usage${queryString ? `?${queryString}` : ''}`)
  },

  getSecurityInsights: (params = {}) => {
    const queryString = apiUtils.buildQueryString(params)
    return api.get(`/admin/permission-control/analytics/security-insights${queryString ? `?${queryString}` : ''}`)
  },

  // Bulk Operations
  bulkUpdateRolePermissions: (operations) => {
    return api.post('/admin/permission-control/bulk/role-permissions', {
      operations
    })
  },

  bulkUpdateUserPermissions: (operations) => {
    return api.post('/admin/permission-control/bulk/user-permissions', {
      operations
    })
  },

  importPermissionTemplate: (templateData) => {
    return api.post('/admin/permission-control/import/template', templateData)
  },

  exportPermissionTemplate: (templateType = 'all', params = {}) => {
    const queryString = apiUtils.buildQueryString({
      ...params,
      type: templateType
    })
    return api.get(`/admin/permission-control/export/template${queryString ? `?${queryString}` : ''}`, {
      responseType: 'blob'
    })
  },

  // Permission Simulation
  simulateUserAccess: (userId, permissions) => {
    return api.post('/admin/permission-control/simulate', {
      user_id: userId,
      permissions
    })
  },

  // Real-time Permission Updates
  invalidateUserCache: (userId) => {
    return api.post(`/admin/permission-control/cache/invalidate/${userId}`)
  },

  invalidateAllCache: () => {
    return api.post('/admin/permission-control/cache/invalidate-all')
  },

  // Permission Recommendations
  getPermissionRecommendations: (userId) => {
    return api.get(`/admin/permission-control/recommendations/${userId}`)
  },

  getRoleRecommendations: (roleName) => {
    return api.get(`/admin/permission-control/recommendations/role/${roleName}`)
  },

  // Security Monitoring
  getSecurityAlerts: (params = {}) => {
    const queryString = apiUtils.buildQueryString(params)
    return api.get(`/admin/permission-control/security/alerts${queryString ? `?${queryString}` : ''}`)
  },

  getAccessPatterns: (userId, params = {}) => {
    const queryString = apiUtils.buildQueryString(params)
    return api.get(`/admin/permission-control/security/access-patterns/${userId}${queryString ? `?${queryString}` : ''}`)
  },

  detectAnomalies: (params = {}) => {
    const queryString = apiUtils.buildQueryString(params)
    return api.get(`/admin/permission-control/security/anomalies${queryString ? `?${queryString}` : ''}`)
  }
}

export default permissionControlService