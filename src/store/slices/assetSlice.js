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
    product_id: '',
    category_id: '',
    oem_id: '',
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
      }
    },

    clearAllAssetErrors: (state) => {
      state.assets.error = null
      state.statistics.error = null
      state.assignment.error = null
      state.dropdown.error = null
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
  setAssetPagination
} = assetSlice.actions

// Selectors
export const selectAssets = (state) => state.asset.assets
export const selectAssetStatistics = (state) => state.asset.statistics
export const selectSelectedAsset = (state) => state.asset.selectedAsset
export const selectAssetFilters = (state) => state.asset.filters
export const selectAssetAssignment = (state) => state.asset.assignment
export const selectAssetsDropdown = (state) => state.asset.dropdown

export default assetSlice.reducer