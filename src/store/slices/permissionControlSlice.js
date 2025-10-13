import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import permissionControlService from '../../services/permissionControl'

// Initial state
const initialState = {
  // Permission Categories
  categories: {
    data: [],
    loading: false,
    error: null,
  },

  // Role Templates
  roleTemplates: {
    data: [],
    loading: false,
    error: null,
  },

  // User Permissions
  userPermissions: {
    data: {},
    currentUser: null,
    loading: false,
    error: null,
  },

  // Audit Logs
  auditLogs: {
    data: [],
    total: 0,
    loading: false,
    error: null,
    pagination: {
      page: 1,
      limit: 20,
      total: 0
    }
  },

  // Analytics
  analytics: {
    roleDistribution: [],
    permissionUsage: [],
    securityInsights: {},
    loading: false,
    error: null,
  },

  // Security Monitoring
  security: {
    alerts: [],
    accessPatterns: {},
    anomalies: [],
    loading: false,
    error: null,
  },

  // UI State
  ui: {
    selectedRole: null,
    selectedUser: null,
    activeTab: 'role-templates',
    filters: {
      role: 'all',
      permission: 'all',
      status: 'all',
      dateRange: null
    },
    modal: {
      visible: false,
      type: null,
      data: null
    }
  }
}

// Async thunks for permission categories
export const fetchPermissionCategories = createAsyncThunk(
  'permissionControl/fetchCategories',
  async (params, { rejectWithValue }) => {
    try {
      const response = await permissionControlService.getPermissionCategories(params)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch permission categories')
    }
  }
)

// Async thunks for role templates
export const fetchRoleTemplates = createAsyncThunk(
  'permissionControl/fetchRoleTemplates',
  async (params, { rejectWithValue }) => {
    try {
      const response = await permissionControlService.getRoleTemplates(params)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch role templates')
    }
  }
)

export const updateRoleTemplate = createAsyncThunk(
  'permissionControl/updateRoleTemplate',
  async ({ roleName, permissions }, { rejectWithValue }) => {
    try {
      const response = await permissionControlService.updateRoleTemplate(roleName, permissions)
      return { roleName, data: response.data }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update role template')
    }
  }
)

// Async thunks for user permissions
export const fetchUserPermissions = createAsyncThunk(
  'permissionControl/fetchUserPermissions',
  async ({ userId, ...params }, { rejectWithValue }) => {
    try {
      const response = await permissionControlService.getUserPermissions(userId, params)
      return { userId, data: response.data }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user permissions')
    }
  }
)

export const grantUserPermission = createAsyncThunk(
  'permissionControl/grantUserPermission',
  async ({ userId, permissionData }, { rejectWithValue }) => {
    try {
      const response = await permissionControlService.grantUserPermission(userId, permissionData)
      return { userId, data: response.data }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to grant permission')
    }
  }
)

export const revokeUserPermission = createAsyncThunk(
  'permissionControl/revokeUserPermission',
  async ({ userId, permissionData }, { rejectWithValue }) => {
    try {
      const response = await permissionControlService.revokeUserPermission(userId, permissionData)
      return { userId, data: response.data }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to revoke permission')
    }
  }
)

// Async thunks for audit logs
export const fetchAuditLogs = createAsyncThunk(
  'permissionControl/fetchAuditLogs',
  async (params, { rejectWithValue }) => {
    try {
      const response = await permissionControlService.getPermissionAuditLogs(params)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch audit logs')
    }
  }
)

// Async thunks for role distribution (real data)
export const fetchRoleDistribution = createAsyncThunk(
  'permissionControl/fetchRoleDistribution',
  async (params, { rejectWithValue }) => {
    try {
      const response = await permissionControlService.getRoleDistribution()
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch role distribution')
    }
  }
)

// Async thunks for analytics
export const fetchPermissionAnalytics = createAsyncThunk(
  'permissionControl/fetchAnalytics',
  async (params, { rejectWithValue }) => {
    try {
      const [roleDistribution, permissionUsage, securityInsights] = await Promise.all([
        permissionControlService.getRoleDistribution(),
        permissionControlService.getPermissionUsage(params),
        permissionControlService.getSecurityInsights(params)
      ])

      return {
        roleDistribution: roleDistribution.data,
        permissionUsage: permissionUsage.data,
        securityInsights: securityInsights.data
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch analytics')
    }
  }
)

// Async thunks for security monitoring
export const fetchSecurityAlerts = createAsyncThunk(
  'permissionControl/fetchSecurityAlerts',
  async (params, { rejectWithValue }) => {
    try {
      const response = await permissionControlService.getSecurityAlerts(params)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch security alerts')
    }
  }
)

export const checkPermissions = createAsyncThunk(
  'permissionControl/checkPermissions',
  async ({ permissions, userId }, { rejectWithValue }) => {
    try {
      const response = await permissionControlService.checkPermissions(permissions, userId)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to check permissions')
    }
  }
)

// Permission Control Slice
const permissionControlSlice = createSlice({
  name: 'permissionControl',
  initialState,
  reducers: {
    // UI Actions
    setSelectedRole: (state, action) => {
      state.ui.selectedRole = action.payload
    },
    setSelectedUser: (state, action) => {
      state.ui.selectedUser = action.payload
    },
    setActiveTab: (state, action) => {
      state.ui.activeTab = action.payload
    },
    setFilters: (state, action) => {
      state.ui.filters = { ...state.ui.filters, ...action.payload }
    },
    openModal: (state, action) => {
      state.ui.modal = {
        visible: true,
        type: action.payload.type,
        data: action.payload.data || null
      }
    },
    closeModal: (state) => {
      state.ui.modal = {
        visible: false,
        type: null,
        data: null
      }
    },

    // Clear specific states
    clearUserPermissions: (state) => {
      state.userPermissions = {
        data: {},
        currentUser: null,
        loading: false,
        error: null,
      }
    },
    clearAuditLogs: (state) => {
      state.auditLogs = {
        data: [],
        total: 0,
        loading: false,
        error: null,
        pagination: {
          page: 1,
          limit: 20,
          total: 0
        }
      }
    },

    // Real-time updates
    addAuditLog: (state, action) => {
      state.auditLogs.data.unshift(action.payload)
      state.auditLogs.total += 1
    },
    updatePermissionInRealTime: (state, action) => {
      const { userId, permission, granted } = action.payload
      if (state.userPermissions.data[userId]) {
        const userPerms = state.userPermissions.data[userId]
        if (granted) {
          if (!userPerms.effectivePermissions.includes(permission)) {
            userPerms.effectivePermissions.push(permission)
          }
        } else {
          userPerms.effectivePermissions = userPerms.effectivePermissions.filter(p => p !== permission)
        }
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Permission Categories
      .addCase(fetchPermissionCategories.pending, (state) => {
        state.categories.loading = true
        state.categories.error = null
      })
      .addCase(fetchPermissionCategories.fulfilled, (state, action) => {
        state.categories.loading = false
        state.categories.data = action.payload.data || action.payload
      })
      .addCase(fetchPermissionCategories.rejected, (state, action) => {
        state.categories.loading = false
        state.categories.error = action.payload
      })

      // Role Templates
      .addCase(fetchRoleTemplates.pending, (state) => {
        state.roleTemplates.loading = true
        state.roleTemplates.error = null
      })
      .addCase(fetchRoleTemplates.fulfilled, (state, action) => {
        state.roleTemplates.loading = false
        state.roleTemplates.data = action.payload.data || action.payload
      })
      .addCase(fetchRoleTemplates.rejected, (state, action) => {
        state.roleTemplates.loading = false
        state.roleTemplates.error = action.payload
      })

      // Update Role Template
      .addCase(updateRoleTemplate.pending, (state) => {
        state.roleTemplates.loading = true
        state.roleTemplates.error = null
      })
      .addCase(updateRoleTemplate.fulfilled, (state, action) => {
        state.roleTemplates.loading = false
        const { roleName } = action.payload
        const updatedRoleIndex = state.roleTemplates.data.findIndex(role => role.role_name === roleName)
        if (updatedRoleIndex !== -1) {
          // Refresh the role templates to get updated data
          state.roleTemplates.data[updatedRoleIndex] = { ...state.roleTemplates.data[updatedRoleIndex], ...action.payload.data }
        }
      })
      .addCase(updateRoleTemplate.rejected, (state, action) => {
        state.roleTemplates.loading = false
        state.roleTemplates.error = action.payload
      })

      // User Permissions
      .addCase(fetchUserPermissions.pending, (state) => {
        state.userPermissions.loading = true
        state.userPermissions.error = null
      })
      .addCase(fetchUserPermissions.fulfilled, (state, action) => {
        state.userPermissions.loading = false
        const { userId, data } = action.payload
        state.userPermissions.data[userId] = data
        state.userPermissions.currentUser = userId
      })
      .addCase(fetchUserPermissions.rejected, (state, action) => {
        state.userPermissions.loading = false
        state.userPermissions.error = action.payload
      })

      // Grant/Revoke User Permission
      .addCase(grantUserPermission.fulfilled, (state, action) => {
        const { userId } = action.payload
        // Refresh user permissions after grant/revoke
        if (state.userPermissions.data[userId]) {
          state.userPermissions.loading = false
        }
      })
      .addCase(revokeUserPermission.fulfilled, (state, action) => {
        const { userId } = action.payload
        // Refresh user permissions after grant/revoke
        if (state.userPermissions.data[userId]) {
          state.userPermissions.loading = false
        }
      })

      // Audit Logs
      .addCase(fetchAuditLogs.pending, (state) => {
        state.auditLogs.loading = true
        state.auditLogs.error = null
      })
      .addCase(fetchAuditLogs.fulfilled, (state, action) => {
        console.log('✅ fetchAuditLogs.fulfilled:', action.payload)
        state.auditLogs.loading = false

        // Backend returns { success: true, data: [...], pagination: {...} }
        // The thunk returns response.data which is the whole backend response
        const logs = action.payload.data || []
        const pagination = action.payload.pagination || { page: 1, limit: 20, total: 0, pages: 0 }

        state.auditLogs.data = Array.isArray(logs) ? logs : []
        state.auditLogs.total = pagination.total || 0
        state.auditLogs.pagination = pagination

        console.log('📊 Audit logs stored:', {
          dataLength: state.auditLogs.data.length,
          total: state.auditLogs.total,
          pagination: state.auditLogs.pagination
        })
      })
      .addCase(fetchAuditLogs.rejected, (state, action) => {
        console.error('❌ fetchAuditLogs.rejected:', action.payload)
        state.auditLogs.loading = false
        state.auditLogs.error = action.payload
      })

      // Role Distribution (real data)
      .addCase(fetchRoleDistribution.pending, (state) => {
        state.analytics.loading = true
        state.analytics.error = null
      })
      .addCase(fetchRoleDistribution.fulfilled, (state, action) => {
        state.analytics.loading = false
        state.analytics.roleDistribution = action.payload.data || action.payload
        state.analytics.meta = action.payload.meta
      })
      .addCase(fetchRoleDistribution.rejected, (state, action) => {
        state.analytics.loading = false
        state.analytics.error = action.payload
      })

      // Analytics
      .addCase(fetchPermissionAnalytics.pending, (state) => {
        state.analytics.loading = true
        state.analytics.error = null
      })
      .addCase(fetchPermissionAnalytics.fulfilled, (state, action) => {
        state.analytics.loading = false
        state.analytics.roleDistribution = action.payload.roleDistribution
        state.analytics.permissionUsage = action.payload.permissionUsage
        state.analytics.securityInsights = action.payload.securityInsights
      })
      .addCase(fetchPermissionAnalytics.rejected, (state, action) => {
        state.analytics.loading = false
        state.analytics.error = action.payload
      })

      // Security Alerts
      .addCase(fetchSecurityAlerts.pending, (state) => {
        state.security.loading = true
        state.security.error = null
      })
      .addCase(fetchSecurityAlerts.fulfilled, (state, action) => {
        state.security.loading = false
        state.security.alerts = action.payload.data || action.payload
      })
      .addCase(fetchSecurityAlerts.rejected, (state, action) => {
        state.security.loading = false
        state.security.error = action.payload
      })
  },
})

// Export actions
export const {
  setSelectedRole,
  setSelectedUser,
  setActiveTab,
  setFilters,
  openModal,
  closeModal,
  clearUserPermissions,
  clearAuditLogs,
  addAuditLog,
  updatePermissionInRealTime
} = permissionControlSlice.actions

// Selectors
export const selectPermissionCategories = (state) => state.permissionControl.categories
export const selectCategories = (state) => state.permissionControl.categories // Alias for compatibility
export const selectRoleTemplates = (state) => state.permissionControl.roleTemplates
export const selectUserPermissions = (state) => state.permissionControl.userPermissions
export const selectAuditLogs = (state) => state.permissionControl.auditLogs
export const selectAnalytics = (state) => state.permissionControl.analytics
export const selectSecurity = (state) => state.permissionControl.security
export const selectUI = (state) => state.permissionControl.ui
export const selectSelectedRole = (state) => state.permissionControl.ui.selectedRole
export const selectSelectedUser = (state) => state.permissionControl.ui.selectedUser
export const selectActiveTab = (state) => state.permissionControl.ui.activeTab
export const selectFilters = (state) => state.permissionControl.ui.filters
export const selectModal = (state) => state.permissionControl.ui.modal

export default permissionControlSlice.reducer