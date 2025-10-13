import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async thunks
export const fetchComponentFieldTemplates = createAsyncThunk(
  'componentFieldTemplates/fetchAll',
  async (productTypeId = null, { rejectWithValue }) => {
    try {
      const url = productTypeId
        ? `/masters/component-field-templates?product_type_id=${productTypeId}`
        : '/masters/component-field-templates';
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchFieldTemplatesByProductType = createAsyncThunk(
  'componentFieldTemplates/fetchByProductType',
  async (productTypeId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/masters/component-field-templates/product-type/${productTypeId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createFieldTemplate = createAsyncThunk(
  'componentFieldTemplates/create',
  async (templateData, { rejectWithValue }) => {
    try {
      const response = await api.post('/masters/component-field-templates', templateData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateFieldTemplate = createAsyncThunk(
  'componentFieldTemplates/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/masters/component-field-templates/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteFieldTemplate = createAsyncThunk(
  'componentFieldTemplates/delete',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/masters/component-field-templates/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createFieldOption = createAsyncThunk(
  'componentFieldTemplates/createOption',
  async ({ fieldTemplateId, data }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/masters/component-field-templates/${fieldTemplateId}/options`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateFieldOption = createAsyncThunk(
  'componentFieldTemplates/updateOption',
  async ({ optionId, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/masters/component-field-templates/options/${optionId}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteFieldOption = createAsyncThunk(
  'componentFieldTemplates/deleteOption',
  async (optionId, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/masters/component-field-templates/options/${optionId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  templates: [],
  currentProductTypeTemplates: [],
  loading: false,
  error: null,
  success: false,
};

const componentFieldTemplatesSlice = createSlice({
  name: 'componentFieldTemplates',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
    clearCurrentTemplates: (state) => {
      state.currentProductTypeTemplates = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all templates
      .addCase(fetchComponentFieldTemplates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchComponentFieldTemplates.fulfilled, (state, action) => {
        state.loading = false;
        state.templates = action.payload.data;
      })
      .addCase(fetchComponentFieldTemplates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch templates';
      })

      // Fetch templates by product type
      .addCase(fetchFieldTemplatesByProductType.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFieldTemplatesByProductType.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProductTypeTemplates = action.payload.data;
      })
      .addCase(fetchFieldTemplatesByProductType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch templates';
      })

      // Create template
      .addCase(createFieldTemplate.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createFieldTemplate.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(createFieldTemplate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to create template';
      })

      // Update template
      .addCase(updateFieldTemplate.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateFieldTemplate.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(updateFieldTemplate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to update template';
      })

      // Delete template
      .addCase(deleteFieldTemplate.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(deleteFieldTemplate.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(deleteFieldTemplate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to delete template';
      })

      // Create option
      .addCase(createFieldOption.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createFieldOption.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(createFieldOption.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to create option';
      })

      // Update option
      .addCase(updateFieldOption.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateFieldOption.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(updateFieldOption.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to update option';
      })

      // Delete option
      .addCase(deleteFieldOption.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(deleteFieldOption.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(deleteFieldOption.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to delete option';
      });
  },
});

export const { clearError, clearSuccess, clearCurrentTemplates } = componentFieldTemplatesSlice.actions;

export default componentFieldTemplatesSlice.reducer;
