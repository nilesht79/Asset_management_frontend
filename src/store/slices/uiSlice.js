import { createSlice } from '@reduxjs/toolkit'

// Initial state
const initialState = {
  theme: 'light', // 'light' | 'dark'
  sidebarCollapsed: false,
  loading: {}, // Object to track loading states for different operations
  notifications: [],
  modal: {
    visible: false,
    type: null, // 'confirm', 'info', 'warning', 'error'
    title: '',
    content: '',
    onOk: null,
    onCancel: null,
  },
  breadcrumbs: [],
  pageTitle: '',
  errors: {}, // Object to store form/component errors
  searchQuery: '',
  filters: {},
  pagination: {
    current: 1,
    pageSize: 10,
    total: 0,
  },
  tableSettings: {
    sortField: '',
    sortOrder: 'ascend', // 'ascend' | 'descend'
    selectedRowKeys: [],
  },
  preferences: {
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h', // '12h' | '24h'
    currency: 'INR',
    language: 'en',
    timezone: 'Asia/Kolkata',
    compactMode: false,
    showNotifications: true,
    soundEnabled: true,
  }
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Theme
    setTheme: (state, action) => {
      state.theme = action.payload
      localStorage.setItem('theme', action.payload)
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light'
      localStorage.setItem('theme', state.theme)
    },

    // Sidebar
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed
      localStorage.setItem('sidebarCollapsed', state.sidebarCollapsed.toString())
    },
    setSidebarCollapsed: (state, action) => {
      state.sidebarCollapsed = action.payload
      localStorage.setItem('sidebarCollapsed', action.payload.toString())
    },

    // Loading states
    setLoading: (state, action) => {
      const key = action.payload
      state.loading[key] = true
    },
    clearLoading: (state, action) => {
      const key = action.payload
      delete state.loading[key]
    },
    clearAllLoading: (state) => {
      state.loading = {}
    },

    // Notifications
    addNotification: (state, action) => {
      const notification = {
        id: Date.now() + Math.random(),
        timestamp: new Date().toISOString(),
        read: false,
        ...action.payload
      }
      state.notifications.unshift(notification)
      
      // Keep only last 50 notifications
      if (state.notifications.length > 50) {
        state.notifications = state.notifications.slice(0, 50)
      }
    },
    markNotificationAsRead: (state, action) => {
      const notification = state.notifications.find(n => n.id === action.payload)
      if (notification) {
        notification.read = true
      }
    },
    markAllNotificationsAsRead: (state) => {
      state.notifications.forEach(notification => {
        notification.read = true
      })
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload)
    },
    clearNotifications: (state) => {
      state.notifications = []
    },

    // Modal
    showModal: (state, action) => {
      state.modal = {
        visible: true,
        type: 'info',
        title: '',
        content: '',
        onOk: null,
        onCancel: null,
        ...action.payload
      }
    },
    hideModal: (state) => {
      state.modal = {
        visible: false,
        type: null,
        title: '',
        content: '',
        onOk: null,
        onCancel: null,
      }
    },

    // Breadcrumbs and page title
    setBreadcrumbs: (state, action) => {
      state.breadcrumbs = action.payload
    },
    setPageTitle: (state, action) => {
      state.pageTitle = action.payload
      document.title = action.payload ? `${action.payload} - Unified ITSM Platform` : 'Unified ITSM Platform'
    },

    // Errors
    setError: (state, action) => {
      const { key, error } = action.payload
      state.errors[key] = error
    },
    clearError: (state, action) => {
      const key = action.payload
      delete state.errors[key]
    },
    clearAllErrors: (state) => {
      state.errors = {}
    },

    // Search and filters
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearFilters: (state) => {
      state.filters = {}
      state.searchQuery = ''
    },
    removeFilter: (state, action) => {
      const key = action.payload
      delete state.filters[key]
    },

    // Pagination
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload }
    },
    resetPagination: (state) => {
      state.pagination = {
        current: 1,
        pageSize: 10,
        total: 0,
      }
    },

    // Table settings
    setTableSettings: (state, action) => {
      state.tableSettings = { ...state.tableSettings, ...action.payload }
    },
    setSorting: (state, action) => {
      const { field, order } = action.payload
      state.tableSettings.sortField = field
      state.tableSettings.sortOrder = order
    },
    setSelectedRows: (state, action) => {
      state.tableSettings.selectedRowKeys = action.payload
    },
    clearSelectedRows: (state) => {
      state.tableSettings.selectedRowKeys = []
    },

    // User preferences
    setPreferences: (state, action) => {
      state.preferences = { ...state.preferences, ...action.payload }
      localStorage.setItem('userPreferences', JSON.stringify(state.preferences))
    },
    loadPreferences: (state) => {
      try {
        const savedPreferences = localStorage.getItem('userPreferences')
        if (savedPreferences) {
          state.preferences = { ...state.preferences, ...JSON.parse(savedPreferences) }
        }
      } catch (error) {
        console.error('Failed to load user preferences:', error)
      }
    },

    // Reset UI state
    resetUIState: (state) => {
      return {
        ...initialState,
        theme: state.theme, // Keep theme preference
        preferences: state.preferences, // Keep user preferences
      }
    }
  }
})

// Export actions
export const {
  setTheme,
  toggleTheme,
  toggleSidebar,
  setSidebarCollapsed,
  setLoading,
  clearLoading,
  clearAllLoading,
  addNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  removeNotification,
  clearNotifications,
  showModal,
  hideModal,
  setBreadcrumbs,
  setPageTitle,
  setError,
  clearError,
  clearAllErrors,
  setSearchQuery,
  setFilters,
  clearFilters,
  removeFilter,
  setPagination,
  resetPagination,
  setTableSettings,
  setSorting,
  setSelectedRows,
  clearSelectedRows,
  setPreferences,
  loadPreferences,
  resetUIState,
} = uiSlice.actions

// Selectors
export const selectTheme = (state) => state.ui.theme
export const selectSidebarCollapsed = (state) => state.ui.sidebarCollapsed
export const selectLoading = (state, key) => state.ui.loading[key] || false
export const selectAnyLoading = (state) => Object.keys(state.ui.loading).length > 0
export const selectNotifications = (state) => state.ui.notifications
export const selectUnreadNotificationsCount = (state) => 
  state.ui.notifications.filter(n => !n.read).length
export const selectModal = (state) => state.ui.modal
export const selectBreadcrumbs = (state) => state.ui.breadcrumbs
export const selectPageTitle = (state) => state.ui.pageTitle
export const selectErrors = (state) => state.ui.errors
export const selectError = (state, key) => state.ui.errors[key]
export const selectSearchQuery = (state) => state.ui.searchQuery
export const selectFilters = (state) => state.ui.filters
export const selectPagination = (state) => state.ui.pagination
export const selectTableSettings = (state) => state.ui.tableSettings
export const selectPreferences = (state) => state.ui.preferences

export default uiSlice.reducer