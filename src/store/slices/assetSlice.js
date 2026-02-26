import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import assetService from '../../services/asset'

// Initial state
const initialState = {
  // Assets
  assets: {
    data: [],
    total: 0,
    loading: false,
    error: null,
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 1
    }
  },

  // Asset statistics for dashboard
  statistics: {
    data: null,
    loading: false,
    error: null
  },

  // Currently selected asset
  selectedAsset: null,

  // Filters and search
  filters: {
    search: '',
    status: '',
    condition_status: '',
    location_id: '',
    assigned_to: '',
    employee_code: '',
    product_id: '',
    category_id: '',
    subcategory_id: '',
    oem_id: '',
    board_id: '',
    serial_number: '',
    warranty_expiring: false
  },

  // Asset assignment state
  assignment: {
    loading: false,
    error: null
  },

  // Dropdown data
  dropdown: {
    data: [],
    loading: false,
    error: null
  },

  // Component management state
  components: {
    data: [],
    loading: false,
    error: null,
    parentAsset: null
  },

  // Asset hierarchy state
  hierarchy: {
    data: null,
    loading: false,
    error: null
  },

  // Component operations (install/remove) state
  componentOperation: {
    loading: false,
    error: null,
    success: false
  }
}

// Async thunks
export const fetchAssets = createAsyncThunk(
  'asset/fetchAssets',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await assetService.getAssets(params)
      return response.data
    } catch (error) {
      console.error('fetchAssets error:', error)
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to fetch assets',
        errors: error.response?.data?.errors
      })
    }
  }
)

export const fetchAssetStatistics = createAsyncThunk(
  'asset/fetchAssetStatistics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await assetService.getAssetStatistics()
      return response.data
    } catch (error) {
      console.error('fetchAssetStatistics error:', error)
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to fetch asset statistics',
        errors: error.response?.data?.errors
      })
    }
  }
)

export const fetchAsset = createAsyncThunk(
  'asset/fetchAsset',
  async (id, { rejectWithValue }) => {
    try {
      const response = await assetService.getAsset(id)
      return response.data
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to fetch asset',
        errors: error.response?.data?.errors
      })
    }
  }
)

export const createAsset = createAsyncThunk(
  'asset/createAsset',
  async (assetData, { dispatch, rejectWithValue }) => {
    try {
      const response = await assetService.createAsset(assetData)

      // Refresh assets list and statistics
      dispatch(fetchAssets())
      dispatch(fetchAssetStatistics())

      return response.data
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to create asset',
        errors: error.response?.data?.errors
      })
    }
  }
)

export const updateAsset = createAsyncThunk(
  'asset/updateAsset',
  async ({ id, data }, { dispatch, rejectWithValue }) => {
    try {
      const response = await assetService.updateAsset(id, data)

      // Refresh assets list and statistics
      dispatch(fetchAssets())
      dispatch(fetchAssetStatistics())

      return response.data
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to update asset',
        errors: error.response?.data?.errors
      })
    }
  }
)

export const deleteAsset = createAsyncThunk(
  'asset/deleteAsset',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      await assetService.deleteAsset(id)

      // Refresh assets list and statistics
      dispatch(fetchAssets())
      dispatch(fetchAssetStatistics())

      return id
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to delete asset'
      })
    }
  }
)

export const assignAsset = createAsyncThunk(
  'asset/assignAsset',
  async ({ id, data }, { dispatch, rejectWithValue }) => {
    try {
      const response = await assetService.assignAsset(id, data)

      // Refresh assets list and statistics
      dispatch(fetchAssets())
      dispatch(fetchAssetStatistics())

      return response.data
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to assign asset',
        errors: error.response?.data?.errors
      })
    }
  }
)

export const unassignAsset = createAsyncThunk(
  'asset/unassignAsset',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      const response = await assetService.unassignAsset(id)

      // Refresh assets list and statistics
      dispatch(fetchAssets())
      dispatch(fetchAssetStatistics())

      return response.data
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to unassign asset'
      })
    }
  }
)

export const fetchAssetsDropdown = createAsyncThunk(
  'asset/fetchAssetsDropdown',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await assetService.getAssetsDropdown(params)
      return response.data
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to fetch assets dropdown'
      })
    }
  }
)

export const exportAssets = createAsyncThunk(
  'asset/exportAssets',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await assetService.exportAssets(params)
      return response.data
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to export assets'
      })
    }
  }
)

// ============================================================================
// Component Management Async Thunks
// ============================================================================

// Fetch components installed in an asset
export const fetchAssetComponents = createAsyncThunk(
  'asset/fetchAssetComponents',
  async ({ assetId, includeRemoved = false }, { rejectWithValue }) => {
    try {
      const response = await assetService.getAssetComponents(assetId, { include_removed: includeRemoved })
      return response.data
    } catch (error) {
      console.error('fetchAssetComponents error:', error)
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to fetch asset components',
        errors: error.response?.data?.errors
      })
    }
  }
)

// Fetch asset hierarchy tree
export const fetchAssetHierarchy = createAsyncThunk(
  'asset/fetchAssetHierarchy',
  async (assetId, { rejectWithValue }) => {
    try {
      const response = await assetService.getAssetHierarchy(assetId)
      return response.data
    } catch (error) {
      console.error('fetchAssetHierarchy error:', error)
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to fetch asset hierarchy',
        errors: error.response?.data?.errors
      })
    }
  }
)

// Install a component into an asset
export const installComponent = createAsyncThunk(
  'asset/installComponent',
  async ({ parentAssetId, componentAssetId, installationNotes, installedBy }, { rejectWithValue }) => {
    try {
      const response = await assetService.installComponent(parentAssetId, {
        component_asset_id: componentAssetId,
        installation_notes: installationNotes,
        installed_by: installedBy
      })
      return response.data
    } catch (error) {
      console.error('installComponent error:', error)
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to install component',
        errors: error.response?.data?.errors
      })
    }
  }
)

// Remove a component from an asset
export const removeComponent = createAsyncThunk(
  'asset/removeComponent',
  async ({ parentAssetId, componentId, removalNotes }, { rejectWithValue }) => {
    try {
      const response = await assetService.removeComponent(parentAssetId, componentId, {
        removal_notes: removalNotes
      })
      return response.data
    } catch (error) {
      console.error('removeComponent error:', error)
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to remove component',
        errors: error.response?.data?.errors
      })
    }
  }
)

// Reinstall a previously removed component
export const reinstallComponent = createAsyncThunk(
  'asset/reinstallComponent',
  async ({ parentAssetId, componentId, installationNotes, installedBy }, { rejectWithValue }) => {
    try {
      const response = await assetService.reinstallComponent(parentAssetId, componentId, {
        installation_notes: installationNotes,
        installed_by: installedBy
      })
      return response.data
    } catch (error) {
      console.error('reinstallComponent error:', error)
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to reinstall component',
        errors: error.response?.data?.errors
      })
    }
  }
)

// Create slice
const assetSlice = createSlice({
  name: 'asset',
  initialState,
  reducers: {
    // Clear errors
    clearAssetError: (state, action) => {
      const { module } = action.payload || {}
      if (module && state[module]) {
        state[module].error = null
      } else {
        // Clear all errors if no module specified
        state.assets.error = null
        state.statistics.error = null
        state.assignment.error = null
        state.dropdown.error = null
        state.components.error = null
        state.hierarchy.error = null
        state.componentOperation.error = null
      }
    },

    clearAllAssetErrors: (state) => {
      state.assets.error = null
      state.statistics.error = null
      state.assignment.error = null
      state.dropdown.error = null
      state.components.error = null
      state.hierarchy.error = null
      state.componentOperation.error = null
    },

    // Set selected asset
    setSelectedAsset: (state, action) => {
      state.selectedAsset = action.payload
    },

    clearSelectedAsset: (state) => {
      state.selectedAsset = null
    },

    // Set filters
    setAssetFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },

    clearAssetFilters: (state) => {
      state.filters = { ...initialState.filters }
    },

    // Reset asset state
    resetAssetState: (state) => {
      return { ...initialState }
    },

    // Set pagination
    setAssetPagination: (state, action) => {
      state.assets.pagination = { ...state.assets.pagination, ...action.payload }
    },

    // Component management actions
    clearComponentError: (state) => {
      state.components.error = null
      state.hierarchy.error = null
      state.componentOperation.error = null
    },

    clearComponentOperationState: (state) => {
      state.componentOperation.loading = false
      state.componentOperation.error = null
      state.componentOperation.success = false
    },

    clearComponentsData: (state) => {
      state.components.data = []
      state.components.parentAsset = null
      state.components.error = null
    },

    clearHierarchyData: (state) => {
      state.hierarchy.data = null
      state.hierarchy.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Assets
      .addCase(fetchAssets.pending, (state) => {
        state.assets.loading = true
        state.assets.error = null
      })
      .addCase(fetchAssets.fulfilled, (state, action) => {
        state.assets.loading = false
        const assetsArray = action.payload.data?.assets || action.payload.assets || []
        state.assets.data = Array.isArray(assetsArray) ? assetsArray : []
        state.assets.total = action.payload.data?.pagination?.total || action.payload.pagination?.total || 0
        state.assets.pagination = action.payload.data?.pagination || action.payload.pagination || {}
      })
      .addCase(fetchAssets.rejected, (state, action) => {
        state.assets.loading = false
        state.assets.error = action.payload?.message || 'Failed to fetch assets'
      })

      // Fetch Asset Statistics
      .addCase(fetchAssetStatistics.pending, (state) => {
        state.statistics.loading = true
        state.statistics.error = null
      })
      .addCase(fetchAssetStatistics.fulfilled, (state, action) => {
        state.statistics.loading = false
        state.statistics.data = action.payload.data || action.payload
      })
      .addCase(fetchAssetStatistics.rejected, (state, action) => {
        state.statistics.loading = false
        state.statistics.error = action.payload?.message || 'Failed to fetch asset statistics'
      })

      // Fetch Single Asset
      .addCase(fetchAsset.fulfilled, (state, action) => {
        state.selectedAsset = action.payload.data || action.payload
      })
      .addCase(fetchAsset.rejected, (state, action) => {
        state.assets.error = action.payload?.message || 'Failed to fetch asset'
      })

      // Create Asset
      .addCase(createAsset.pending, (state) => {
        state.assets.loading = true
        state.assets.error = null
      })
      .addCase(createAsset.fulfilled, (state) => {
        state.assets.loading = false
      })
      .addCase(createAsset.rejected, (state, action) => {
        state.assets.loading = false
        state.assets.error = action.payload?.message || 'Failed to create asset'
      })

      // Update Asset
      .addCase(updateAsset.pending, (state) => {
        state.assets.loading = true
        state.assets.error = null
      })
      .addCase(updateAsset.fulfilled, (state) => {
        state.assets.loading = false
      })
      .addCase(updateAsset.rejected, (state, action) => {
        state.assets.loading = false
        state.assets.error = action.payload?.message || 'Failed to update asset'
      })

      // Delete Asset
      .addCase(deleteAsset.pending, (state) => {
        state.assets.loading = true
        state.assets.error = null
      })
      .addCase(deleteAsset.fulfilled, (state) => {
        state.assets.loading = false
      })
      .addCase(deleteAsset.rejected, (state, action) => {
        state.assets.loading = false
        state.assets.error = action.payload?.message || 'Failed to delete asset'
      })

      // Assign Asset
      .addCase(assignAsset.pending, (state) => {
        state.assignment.loading = true
        state.assignment.error = null
      })
      .addCase(assignAsset.fulfilled, (state) => {
        state.assignment.loading = false
      })
      .addCase(assignAsset.rejected, (state, action) => {
        state.assignment.loading = false
        state.assignment.error = action.payload?.message || 'Failed to assign asset'
      })

      // Unassign Asset
      .addCase(unassignAsset.pending, (state) => {
        state.assignment.loading = true
        state.assignment.error = null
      })
      .addCase(unassignAsset.fulfilled, (state) => {
        state.assignment.loading = false
      })
      .addCase(unassignAsset.rejected, (state, action) => {
        state.assignment.loading = false
        state.assignment.error = action.payload?.message || 'Failed to unassign asset'
      })

      // Fetch Assets Dropdown
      .addCase(fetchAssetsDropdown.pending, (state) => {
        state.dropdown.loading = true
        state.dropdown.error = null
      })
      .addCase(fetchAssetsDropdown.fulfilled, (state, action) => {
        state.dropdown.loading = false
        state.dropdown.data = action.payload.data || action.payload || []
      })
      .addCase(fetchAssetsDropdown.rejected, (state, action) => {
        state.dropdown.loading = false
        state.dropdown.error = action.payload?.message || 'Failed to fetch assets dropdown'
      })

      // ============================================================================
      // Component Management Reducers
      // ============================================================================

      // Fetch Asset Components
      .addCase(fetchAssetComponents.pending, (state) => {
        state.components.loading = true
        state.components.error = null
      })
      .addCase(fetchAssetComponents.fulfilled, (state, action) => {
        state.components.loading = false
        state.components.data = action.payload.data?.components || action.payload.components || []
        state.components.parentAsset = action.payload.data?.parent_asset || action.payload.parent_asset || null
      })
      .addCase(fetchAssetComponents.rejected, (state, action) => {
        state.components.loading = false
        state.components.error = action.payload?.message || 'Failed to fetch asset components'
      })

      // Fetch Asset Hierarchy
      .addCase(fetchAssetHierarchy.pending, (state) => {
        state.hierarchy.loading = true
        state.hierarchy.error = null
      })
      .addCase(fetchAssetHierarchy.fulfilled, (state, action) => {
        state.hierarchy.loading = false
        state.hierarchy.data = action.payload.data?.hierarchy || action.payload.hierarchy || null
      })
      .addCase(fetchAssetHierarchy.rejected, (state, action) => {
        state.hierarchy.loading = false
        state.hierarchy.error = action.payload?.message || 'Failed to fetch asset hierarchy'
      })

      // Install Component
      .addCase(installComponent.pending, (state) => {
        state.componentOperation.loading = true
        state.componentOperation.error = null
        state.componentOperation.success = false
      })
      .addCase(installComponent.fulfilled, (state) => {
        state.componentOperation.loading = false
        state.componentOperation.success = true
      })
      .addCase(installComponent.rejected, (state, action) => {
        state.componentOperation.loading = false
        state.componentOperation.error = action.payload?.message || 'Failed to install component'
        state.componentOperation.success = false
      })

      // Remove Component
      .addCase(removeComponent.pending, (state) => {
        state.componentOperation.loading = true
        state.componentOperation.error = null
        state.componentOperation.success = false
      })
      .addCase(removeComponent.fulfilled, (state) => {
        state.componentOperation.loading = false
        state.componentOperation.success = true
      })
      .addCase(removeComponent.rejected, (state, action) => {
        state.componentOperation.loading = false
        state.componentOperation.error = action.payload?.message || 'Failed to remove component'
        state.componentOperation.success = false
      })

      // Reinstall Component
      .addCase(reinstallComponent.pending, (state) => {
        state.componentOperation.loading = true
        state.componentOperation.error = null
        state.componentOperation.success = false
      })
      .addCase(reinstallComponent.fulfilled, (state) => {
        state.componentOperation.loading = false
        state.componentOperation.success = true
      })
      .addCase(reinstallComponent.rejected, (state, action) => {
        state.componentOperation.loading = false
        state.componentOperation.error = action.payload?.message || 'Failed to reinstall component'
        state.componentOperation.success = false
      })
  }
})

// Export actions
export const {
  clearAssetError,
  clearAllAssetErrors,
  setSelectedAsset,
  clearSelectedAsset,
  setAssetFilters,
  clearAssetFilters,
  resetAssetState,
  setAssetPagination,
  clearComponentError,
  clearComponentOperationState,
  clearComponentsData,
  clearHierarchyData
} = assetSlice.actions

// Selectors
export const selectAssets = (state) => state.asset.assets
export const selectAssetStatistics = (state) => state.asset.statistics
export const selectSelectedAsset = (state) => state.asset.selectedAsset
export const selectAssetFilters = (state) => state.asset.filters
export const selectAssetAssignment = (state) => state.asset.assignment
export const selectAssetsDropdown = (state) => state.asset.dropdown

// Component management selectors
export const selectAssetComponents = (state) => state.asset.components
export const selectAssetHierarchy = (state) => state.asset.hierarchy
export const selectComponentOperation = (state) => state.asset.componentOperation

export default assetSlice.reducer