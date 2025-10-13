import api from './api'

const dashboardService = {
  // Get SuperAdmin dashboard data
  getSuperAdminDashboard: () => {
    return api.get('/dashboard/superadmin')
  },

  // Get Admin dashboard data
  getAdminDashboard: () => {
    return api.get('/dashboard/admin')
  },

  // Get system health metrics
  getSystemHealth: () => {
    return api.get('/dashboard/system-health')
  },

  // Get recent activities
  getRecentActivities: (params = {}) => {
    return api.get('/dashboard/activities', { params })
  },

  // Get pending approvals
  getPendingApprovals: (params = {}) => {
    return api.get('/dashboard/approvals', { params })
  },

  // Approve/Reject items
  approveItem: (id, type) => {
    return api.post(`/dashboard/approvals/${id}/approve`, { type })
  },

  rejectItem: (id, type, reason = '') => {
    return api.post(`/dashboard/approvals/${id}/reject`, { type, reason })
  },

  // Get master data statistics
  getMasterDataStats: () => {
    return api.get('/dashboard/master-stats')
  }
}

export default dashboardService