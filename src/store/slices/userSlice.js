import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import userService from '../../services/user'

// Initial state
const initialState = {
  // Users
  users: {
    data: [],
    total: 0,
    loading: false,
    error: null,
  },
  
  // Departments
  departments: {
    data: [],
    hierarchy: [],
    total: 0,
    loading: false,
    error: null,
  },
  
  // Currently selected items
  selectedUser: null,
  selectedDepartment: null,
  
  // Filters and search
  filters: {
    user: { search: '', status: 'active', role: '', department_id: '' },
    department: { search: '', status: 'active', parent_id: null },
  },
  
  // User roles and permissions
  roles: [
    { value: 'superadmin', label: 'Super Admin' },
    { value: 'admin', label: 'Admin' },
    { value: 'department_head', label: 'Department Head' },
    { value: 'coordinator', label: 'Coordinator' },
    { value: 'department_coordinator', label: 'Department Coordinator' },
    { value: 'engineer', label: 'Engineer' },
    { value: 'employee', label: 'Employee' },
  ],
}

// Async thunks for Users
export const fetchUsers = createAsyncThunk(
  'user/fetchUsers',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await userService.getUsers(params)
      return response.data
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to fetch users',
        errors: error.response?.data?.errors
      })
    }
  }
)

export const fetchUser = createAsyncThunk(
  'user/fetchUser',
  async (id, { rejectWithValue }) => {
    try {
      const response = await userService.getUser(id)
      return response.data
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to fetch user',
        errors: error.response?.data?.errors
      })
    }
  }
)

export const createUser = createAsyncThunk(
  'user/createUser',
  async (userData, { dispatch, rejectWithValue }) => {
    try {
      const response = await userService.createUser(userData)
      
      // Refresh users list
      dispatch(fetchUsers())
      
      return response.data
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to create user',
        errors: error.response?.data?.errors
      })
    }
  }
)

export const updateUser = createAsyncThunk(
  'user/updateUser',
  async ({ id, data }, { dispatch, rejectWithValue }) => {
    try {
      const response = await userService.updateUser(id, data)
      
      // Refresh users list
      dispatch(fetchUsers())
      
      return response.data
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to update user',
        errors: error.response?.data?.errors
      })
    }
  }
)

export const deleteUser = createAsyncThunk(
  'user/deleteUser',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      await userService.deleteUser(id)
      
      // Refresh users list
      dispatch(fetchUsers())
      
      return id
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to delete user'
      })
    }
  }
)

// Async thunks for Departments
export const fetchDepartments = createAsyncThunk(
  'user/fetchDepartments',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await userService.getDepartments(params)
      return response.data
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to fetch departments',
        errors: error.response?.data?.errors
      })
    }
  }
)

export const fetchDepartmentHierarchy = createAsyncThunk(
  'user/fetchDepartmentHierarchy',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await userService.getDepartmentHierarchy(params)
      return response.data
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to fetch department hierarchy'
      })
    }
  }
)

export const createDepartment = createAsyncThunk(
  'user/createDepartment',
  async (departmentData, { dispatch, rejectWithValue }) => {
    try {
      const response = await userService.createDepartment(departmentData)
      
      // Refresh departments list and hierarchy
      dispatch(fetchDepartments())
      dispatch(fetchDepartmentHierarchy())
      
      return response.data
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to create department',
        errors: error.response?.data?.errors
      })
    }
  }
)

// Create slice
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // Clear errors
    clearUserError: (state, action) => {
      const { module } = action.payload
      if (state[module]) {
        state[module].error = null
      }
    },
    
    clearAllUserErrors: (state) => {
      state.users.error = null
      state.departments.error = null
    },
    
    // Set selected items
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload
    },
    
    setSelectedDepartment: (state, action) => {
      state.selectedDepartment = action.payload
    },
    
    // Clear selections
    clearUserSelections: (state) => {
      state.selectedUser = null
      state.selectedDepartment = null
    },
    
    // Set filters
    setUserFilters: (state, action) => {
      const { module, filters } = action.payload
      if (state.filters[module]) {
        state.filters[module] = { ...state.filters[module], ...filters }
      }
    },
    
    clearUserFilters: (state, action) => {
      const { module } = action.payload
      if (state.filters[module]) {
        const defaultFilters = initialState.filters[module]
        state.filters[module] = { ...defaultFilters }
      }
    },
    
    // Reset user state
    resetUserState: (state) => {
      return { ...initialState }
    }
  },
  extraReducers: (builder) => {
    builder
      // Users
      .addCase(fetchUsers.pending, (state) => {
        state.users.loading = true
        state.users.error = null
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.users.loading = false
        state.users.data = action.payload.data?.users || []
        state.users.total = action.payload.data?.pagination?.totalItems || 0
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.users.loading = false
        state.users.error = action.payload?.message || 'Failed to fetch users'
      })
      
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.selectedUser = action.payload
      })
      
      // Departments
      .addCase(fetchDepartments.pending, (state) => {
        state.departments.loading = true
        state.departments.error = null
      })
      .addCase(fetchDepartments.fulfilled, (state, action) => {
        state.departments.loading = false
        state.departments.data = action.payload.data?.departments || []
        state.departments.total = action.payload.data?.pagination?.totalItems || 0
      })
      .addCase(fetchDepartments.rejected, (state, action) => {
        state.departments.loading = false
        state.departments.error = action.payload?.message || 'Failed to fetch departments'
      })
      
      .addCase(fetchDepartmentHierarchy.fulfilled, (state, action) => {
        state.departments.hierarchy = action.payload || []
      })
  }
})

// Export actions
export const {
  clearUserError,
  clearAllUserErrors,
  setSelectedUser,
  setSelectedDepartment,
  clearUserSelections,
  setUserFilters,
  clearUserFilters,
  resetUserState,
} = userSlice.actions

// Selectors
export const selectUsers = (state) => state.user.users
export const selectDepartments = (state) => state.user.departments
export const selectUserSelections = (state) => ({
  user: state.user.selectedUser,
  department: state.user.selectedDepartment,
})
export const selectUserFilters = (state) => state.user.filters
export const selectUserRoles = (state) => state.user.roles

export default userSlice.reducer