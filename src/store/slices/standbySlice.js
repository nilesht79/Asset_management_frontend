/**
 * Redux Slice: Standby Assets Pool Management
 * Handles standby asset pool operations and statistics
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Initial state
const initialState = {
  assets: [],
  statistics: {
    total: 0,
    available: 0,
    assigned: 0,
    under_repair: 0,
    retired: 0
  },
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  },
  filters: {
    status: null,
    availability: null,
    category_id: null,
    product_type_id: null,
    search: ''
  },
  loading: false,
  error: null,
  operationLoading: false,
  operationError: null
};

// Async Thunks

/**
 * Fetch standby assets with filters
 */
export const fetchStandbyAssets = createAsyncThunk(
  'standby/fetchAssets',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/standby/assets', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch standby assets');
    }
  }
);

/**
 * Get standby pool statistics
 */
export const fetchStandbyStatistics = createAsyncThunk(
  'standby/fetchStatistics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/standby/assets/statistics');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch statistics');
    }
  }
);

/**
 * Add asset to standby pool
 */
export const addToStandbyPool = createAsyncThunk(
  'standby/addToPool',
  async (assetId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/standby/assets/${assetId}/add`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add asset to standby pool');
    }
  }
);

/**
 * Remove asset from standby pool
 */
export const removeFromStandbyPool = createAsyncThunk(
  'standby/removeFromPool',
  async (assetId, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/standby/assets/${assetId}/remove`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove asset from standby pool');
    }
  }
);

// Slice
const standbySlice = createSlice({
  name: 'standby',
  initialState,
  reducers: {
    // Set filters
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },

    // Clear filters
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },

    // Set pagination
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },

    // Clear operation error
    clearOperationError: (state) => {
      state.operationError = null;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    // Reset state
    resetStandbyState: () => initialState
  },

  extraReducers: (builder) => {
    // Fetch Standby Assets
    builder
      .addCase(fetchStandbyAssets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStandbyAssets.fulfilled, (state, action) => {
        state.loading = false;
        state.assets = action.payload.data?.assets || [];
        state.statistics = action.payload.data?.statistics || state.statistics;
        state.pagination = action.payload.data?.pagination || state.pagination;
      })
      .addCase(fetchStandbyAssets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch Statistics
    builder
      .addCase(fetchStandbyStatistics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStandbyStatistics.fulfilled, (state, action) => {
        state.loading = false;
        state.statistics = action.payload.data || state.statistics;
      })
      .addCase(fetchStandbyStatistics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Add to Standby Pool
    builder
      .addCase(addToStandbyPool.pending, (state) => {
        state.operationLoading = true;
        state.operationError = null;
      })
      .addCase(addToStandbyPool.fulfilled, (state) => {
        state.operationLoading = false;
        // Update statistics (increment total and available)
        state.statistics.total += 1;
        state.statistics.available += 1;
      })
      .addCase(addToStandbyPool.rejected, (state, action) => {
        state.operationLoading = false;
        state.operationError = action.payload;
      });

    // Remove from Standby Pool
    builder
      .addCase(removeFromStandbyPool.pending, (state) => {
        state.operationLoading = true;
        state.operationError = null;
      })
      .addCase(removeFromStandbyPool.fulfilled, (state, action) => {
        state.operationLoading = false;
        // Remove from assets list
        const removedAssetId = action.payload.data?.asset_id;
        state.assets = state.assets.filter(asset => asset.id !== removedAssetId);
        // Update statistics
        state.statistics.total -= 1;
        state.statistics.available -= 1;
      })
      .addCase(removeFromStandbyPool.rejected, (state, action) => {
        state.operationLoading = false;
        state.operationError = action.payload;
      });
  }
});

// Export actions
export const {
  setFilters,
  clearFilters,
  setPagination,
  clearOperationError,
  clearError,
  resetStandbyState
} = standbySlice.actions;

// Export selectors
export const selectStandbyAssets = (state) => state.standby.assets;
export const selectStandbyStatistics = (state) => state.standby.statistics;
export const selectStandbyPagination = (state) => state.standby.pagination;
export const selectStandbyFilters = (state) => state.standby.filters;
export const selectStandbyLoading = (state) => state.standby.loading;
export const selectStandbyError = (state) => state.standby.error;
export const selectStandbyOperationLoading = (state) => state.standby.operationLoading;
export const selectStandbyOperationError = (state) => state.standby.operationError;

// Export reducer
export default standbySlice.reducer;
