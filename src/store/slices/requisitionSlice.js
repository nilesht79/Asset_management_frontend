import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async thunks
export const fetchMyRequisitions = createAsyncThunk(
  'requisitions/fetchMyRequisitions',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/requisitions/my-requisitions', { params });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch requisitions' });
    }
  }
);

export const fetchAllRequisitions = createAsyncThunk(
  'requisitions/fetchAllRequisitions',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/requisitions/all-requisitions', { params });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch requisitions' });
    }
  }
);

export const fetchRequisitionById = createAsyncThunk(
  'requisitions/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/requisitions/${id}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch requisition' });
    }
  }
);

export const createRequisition = createAsyncThunk(
  'requisitions/create',
  async (requisitionData, { rejectWithValue }) => {
    try {
      const response = await api.post('/requisitions', requisitionData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to create requisition' });
    }
  }
);

export const cancelRequisition = createAsyncThunk(
  'requisitions/cancel',
  async ({ id, cancellation_reason }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/requisitions/${id}/cancel`, { cancellation_reason });
      return { id, ...response.data.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to cancel requisition' });
    }
  }
);

export const confirmDelivery = createAsyncThunk(
  'requisitions/confirmDelivery',
  async ({ id, signature_data }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/requisitions/${id}/confirm-delivery`, signature_data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to confirm delivery' });
    }
  }
);

// Department Head actions
export const fetchPendingDeptApprovals = createAsyncThunk(
  'requisitions/fetchPendingDeptApprovals',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/requisitions/pending-dept-approvals', { params });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch pending approvals' });
    }
  }
);

export const approveDeptHead = createAsyncThunk(
  'requisitions/approveDeptHead',
  async ({ id, comments }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/requisitions/${id}/dept-head-approve`, { comments });
      return { id, ...response.data.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to approve requisition' });
    }
  }
);

export const rejectDeptHead = createAsyncThunk(
  'requisitions/rejectDeptHead',
  async ({ id, comments }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/requisitions/${id}/dept-head-reject`, { comments });
      return { id, ...response.data.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to reject requisition' });
    }
  }
);

// IT Head actions
export const fetchPendingITApprovals = createAsyncThunk(
  'requisitions/fetchPendingITApprovals',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/requisitions/pending-it-approvals', { params });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch pending approvals' });
    }
  }
);

export const approveITHead = createAsyncThunk(
  'requisitions/approveITHead',
  async ({ id, comments }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/requisitions/${id}/it-head-approve`, { comments });
      return { id, ...response.data.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to approve requisition' });
    }
  }
);

export const rejectITHead = createAsyncThunk(
  'requisitions/rejectITHead',
  async ({ id, comments }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/requisitions/${id}/it-head-reject`, { comments });
      return { id, ...response.data.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to reject requisition' });
    }
  }
);

// Coordinator / Asset Assignment actions
export const fetchPendingAssignments = createAsyncThunk(
  'requisitions/fetchPendingAssignments',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/requisitions/pending-assignments', { params });
      return {
        requisitions: response.data.data,
        pagination: response.data.pagination
      };
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch pending assignments' });
    }
  }
);

export const assignAsset = createAsyncThunk(
  'requisitions/assignAsset',
  async (assignmentData, { rejectWithValue }) => {
    try {
      const response = await api.post('/requisitions/assign-asset', assignmentData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to assign asset' });
    }
  }
);

const initialState = {
  requisitions: [],
  currentRequisition: null,
  pendingApprovals: [],
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  },
  loading: false,
  error: null,
  filters: {
    status: '',
    urgency: '',
    search: ''
  }
};

const requisitionSlice = createSlice({
  name: 'requisitions',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    clearCurrentRequisition: (state) => {
      state.currentRequisition = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch My Requisitions
      .addCase(fetchMyRequisitions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyRequisitions.fulfilled, (state, action) => {
        state.loading = false;
        state.requisitions = Array.isArray(action.payload.requisitions) ? action.payload.requisitions : [];
        state.pagination = action.payload.pagination || initialState.pagination;
      })
      .addCase(fetchMyRequisitions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch requisitions';
      })

      // Fetch All Requisitions
      .addCase(fetchAllRequisitions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllRequisitions.fulfilled, (state, action) => {
        state.loading = false;
        state.requisitions = Array.isArray(action.payload.requisitions) ? action.payload.requisitions : [];
        state.pagination = action.payload.pagination || initialState.pagination;
      })
      .addCase(fetchAllRequisitions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch requisitions';
      })

      // Fetch Requisition By ID
      .addCase(fetchRequisitionById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRequisitionById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentRequisition = action.payload;
      })
      .addCase(fetchRequisitionById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch requisition';
      })

      // Create Requisition
      .addCase(createRequisition.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createRequisition.fulfilled, (state, action) => {
        state.loading = false;
        state.requisitions.unshift(action.payload);
      })
      .addCase(createRequisition.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to create requisition';
      })

      // Cancel Requisition
      .addCase(cancelRequisition.fulfilled, (state, action) => {
        const index = state.requisitions.findIndex(r => r.requisition_id === action.payload.id);
        if (index !== -1) {
          state.requisitions[index].status = 'cancelled';
        }
        if (state.currentRequisition?.requisition_id === action.payload.id) {
          state.currentRequisition.status = 'cancelled';
        }
      })

      // Fetch Pending Dept Approvals
      .addCase(fetchPendingDeptApprovals.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPendingDeptApprovals.fulfilled, (state, action) => {
        state.loading = false;
        state.pendingApprovals = Array.isArray(action.payload.requisitions) ? action.payload.requisitions : [];
        state.pagination = action.payload.pagination || initialState.pagination;
      })
      .addCase(fetchPendingDeptApprovals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch pending approvals';
      })

      // Approve/Reject Dept Head
      .addCase(approveDeptHead.fulfilled, (state, action) => {
        state.pendingApprovals = state.pendingApprovals.filter(r => r.requisition_id !== action.payload.id);
      })
      .addCase(rejectDeptHead.fulfilled, (state, action) => {
        state.pendingApprovals = state.pendingApprovals.filter(r => r.requisition_id !== action.payload.id);
      })

      // Fetch Pending IT Approvals
      .addCase(fetchPendingITApprovals.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPendingITApprovals.fulfilled, (state, action) => {
        state.loading = false;
        state.pendingApprovals = Array.isArray(action.payload.requisitions) ? action.payload.requisitions : [];
        state.pagination = action.payload.pagination || initialState.pagination;
      })
      .addCase(fetchPendingITApprovals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch pending approvals';
      })

      // Approve/Reject IT Head
      .addCase(approveITHead.fulfilled, (state, action) => {
        state.pendingApprovals = state.pendingApprovals.filter(r => r.requisition_id !== action.payload.id);
      })
      .addCase(rejectITHead.fulfilled, (state, action) => {
        state.pendingApprovals = state.pendingApprovals.filter(r => r.requisition_id !== action.payload.id);
      })

      // Fetch Pending Assignments
      .addCase(fetchPendingAssignments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPendingAssignments.fulfilled, (state, action) => {
        state.loading = false;
        state.pendingApprovals = Array.isArray(action.payload.requisitions) ? action.payload.requisitions : [];
        state.pagination = action.payload.pagination || initialState.pagination;
      })
      .addCase(fetchPendingAssignments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch pending assignments';
      })

      // Assign Asset
      .addCase(assignAsset.fulfilled, (state, action) => {
        state.pendingApprovals = state.pendingApprovals.filter(r => r.requisition_id !== action.payload.requisition_id);
      });
  }
});

export const { setFilters, clearFilters, clearCurrentRequisition, clearError } = requisitionSlice.actions;
export default requisitionSlice.reducer;
