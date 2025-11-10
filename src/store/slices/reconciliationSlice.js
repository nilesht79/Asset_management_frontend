import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import reconciliationService from '../../services/reconciliation';

// ============================================================================
// Initial State
// ============================================================================
const initialState = {
  reconciliations: [],
  currentReconciliation: null,
  assets: [],
  statistics: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  },
  assetsPagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  },
  filters: {
    search: '',
    status: null,
    created_by: null
  }
};

// ============================================================================
// Async Thunks
// ============================================================================

/**
 * Fetch all reconciliations
 */
export const fetchReconciliations = createAsyncThunk(
  'reconciliation/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await reconciliationService.getReconciliations(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch reconciliations');
    }
  }
);

/**
 * Fetch single reconciliation
 */
export const fetchReconciliation = createAsyncThunk(
  'reconciliation/fetchOne',
  async (id, { rejectWithValue }) => {
    try {
      const response = await reconciliationService.getReconciliation(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch reconciliation');
    }
  }
);

/**
 * Create reconciliation
 */
export const createReconciliation = createAsyncThunk(
  'reconciliation/create',
  async (data, { rejectWithValue }) => {
    try {
      const response = await reconciliationService.createReconciliation(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create reconciliation');
    }
  }
);

/**
 * Start reconciliation
 */
export const startReconciliation = createAsyncThunk(
  'reconciliation/start',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await reconciliationService.startReconciliation(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to start reconciliation');
    }
  }
);

/**
 * Complete reconciliation
 */
export const completeReconciliation = createAsyncThunk(
  'reconciliation/complete',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await reconciliationService.completeReconciliation(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to complete reconciliation');
    }
  }
);

/**
 * Pause reconciliation
 */
export const pauseReconciliation = createAsyncThunk(
  'reconciliation/pause',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await reconciliationService.pauseReconciliation(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to pause reconciliation');
    }
  }
);

/**
 * Resume reconciliation
 */
export const resumeReconciliation = createAsyncThunk(
  'reconciliation/resume',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await reconciliationService.resumeReconciliation(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to resume reconciliation');
    }
  }
);

/**
 * Delete reconciliation
 */
export const deleteReconciliation = createAsyncThunk(
  'reconciliation/delete',
  async (id, { rejectWithValue }) => {
    try {
      await reconciliationService.deleteReconciliation(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete reconciliation');
    }
  }
);

/**
 * Fetch reconciliation assets
 */
export const fetchReconciliationAssets = createAsyncThunk(
  'reconciliation/fetchAssets',
  async ({ reconciliationId, params }, { rejectWithValue }) => {
    try {
      const response = await reconciliationService.getReconciliationAssets(reconciliationId, params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch assets');
    }
  }
);

/**
 * Bulk add assets to reconciliation
 */
export const bulkAddAssets = createAsyncThunk(
  'reconciliation/bulkAddAssets',
  async ({ reconciliationId, assetIds }, { rejectWithValue }) => {
    try {
      const response = await reconciliationService.bulkAddAssets(reconciliationId, assetIds);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add assets');
    }
  }
);

/**
 * Reconcile single asset
 */
export const reconcileAsset = createAsyncThunk(
  'reconciliation/reconcileAsset',
  async ({ reconciliationId, assetId, data }, { rejectWithValue }) => {
    try {
      const response = await reconciliationService.reconcileAsset(reconciliationId, assetId, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to reconcile asset');
    }
  }
);

/**
 * Bulk reconcile assets
 */
export const bulkReconcileAssets = createAsyncThunk(
  'reconciliation/bulkReconcile',
  async ({ reconciliationId, assetIds, data }, { rejectWithValue }) => {
    try {
      const response = await reconciliationService.bulkReconcileAssets(reconciliationId, assetIds, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to bulk reconcile assets');
    }
  }
);

/**
 * Fetch reconciliation statistics
 */
export const fetchReconciliationStatistics = createAsyncThunk(
  'reconciliation/fetchStatistics',
  async (reconciliationId, { rejectWithValue }) => {
    try {
      const response = await reconciliationService.getReconciliationStatistics(reconciliationId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch statistics');
    }
  }
);

// ============================================================================
// Slice
// ============================================================================
const reconciliationSlice = createSlice({
  name: 'reconciliation',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    setAssetsPagination: (state, action) => {
      state.assetsPagination = { ...state.assetsPagination, ...action.payload };
    },
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentReconciliation: (state) => {
      state.currentReconciliation = null;
      state.assets = [];
      state.statistics = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch reconciliations
      .addCase(fetchReconciliations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReconciliations.fulfilled, (state, action) => {
        state.loading = false;
        state.reconciliations = action.payload.data.reconciliations;
        state.pagination = action.payload.data.pagination;
      })
      .addCase(fetchReconciliations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch single reconciliation
      .addCase(fetchReconciliation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReconciliation.fulfilled, (state, action) => {
        state.loading = false;
        state.currentReconciliation = action.payload.data;
      })
      .addCase(fetchReconciliation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create reconciliation
      .addCase(createReconciliation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createReconciliation.fulfilled, (state, action) => {
        state.loading = false;
        state.reconciliations.unshift(action.payload.data);
      })
      .addCase(createReconciliation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Start reconciliation
      .addCase(startReconciliation.fulfilled, (state, action) => {
        const index = state.reconciliations.findIndex(r => r.id === action.payload.data.id);
        if (index !== -1) {
          state.reconciliations[index] = action.payload.data;
        }
        if (state.currentReconciliation?.id === action.payload.data.id) {
          state.currentReconciliation = action.payload.data;
        }
      })

      // Complete reconciliation
      .addCase(completeReconciliation.fulfilled, (state, action) => {
        const index = state.reconciliations.findIndex(r => r.id === action.payload.data.id);
        if (index !== -1) {
          state.reconciliations[index] = action.payload.data;
        }
        if (state.currentReconciliation?.id === action.payload.data.id) {
          state.currentReconciliation = action.payload.data;
        }
      })

      // Pause reconciliation
      .addCase(pauseReconciliation.fulfilled, (state, action) => {
        const index = state.reconciliations.findIndex(r => r.id === action.payload.data.id);
        if (index !== -1) {
          state.reconciliations[index] = action.payload.data;
        }
        if (state.currentReconciliation?.id === action.payload.data.id) {
          state.currentReconciliation = action.payload.data;
        }
      })

      // Resume reconciliation
      .addCase(resumeReconciliation.fulfilled, (state, action) => {
        const index = state.reconciliations.findIndex(r => r.id === action.payload.data.id);
        if (index !== -1) {
          state.reconciliations[index] = action.payload.data;
        }
        if (state.currentReconciliation?.id === action.payload.data.id) {
          state.currentReconciliation = action.payload.data;
        }
      })

      // Delete reconciliation
      .addCase(deleteReconciliation.fulfilled, (state, action) => {
        state.reconciliations = state.reconciliations.filter(r => r.id !== action.payload);
      })

      // Fetch assets
      .addCase(fetchReconciliationAssets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReconciliationAssets.fulfilled, (state, action) => {
        state.loading = false;
        state.assets = action.payload.data.assets;
        state.assetsPagination = action.payload.data.pagination;
      })
      .addCase(fetchReconciliationAssets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch statistics
      .addCase(fetchReconciliationStatistics.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchReconciliationStatistics.fulfilled, (state, action) => {
        state.loading = false;
        state.statistics = action.payload.data;
      })
      .addCase(fetchReconciliationStatistics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

// ============================================================================
// Exports
// ============================================================================
export const {
  setFilters,
  clearFilters,
  setPagination,
  setAssetsPagination,
  clearError,
  clearCurrentReconciliation
} = reconciliationSlice.actions;

// Selectors
export const selectReconciliations = (state) => state.reconciliation.reconciliations;
export const selectCurrentReconciliation = (state) => state.reconciliation.currentReconciliation;
export const selectReconciliationAssets = (state) => state.reconciliation.assets;
export const selectReconciliationStatistics = (state) => state.reconciliation.statistics;
export const selectReconciliationLoading = (state) => state.reconciliation.loading;
export const selectReconciliationError = (state) => state.reconciliation.error;
export const selectReconciliationPagination = (state) => state.reconciliation.pagination;
export const selectReconciliationAssetsPagination = (state) => state.reconciliation.assetsPagination;
export const selectReconciliationFilters = (state) => state.reconciliation.filters;

export default reconciliationSlice.reducer;
