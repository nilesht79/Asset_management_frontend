import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import masterService from '../../services/master'
import boardService from '../../services/board'

// Initial state
const initialState = {
  // Boards
  boards: {
    data: [],
    total: 0,
    loading: false,
    error: null,
  },

  // OEMs
  oems: {
    data: [],
    total: 0,
    loading: false,
    error: null,
  },
  
  // Pagination
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1
  },
  
  // Categories
  categories: {
    data: [],
    tree: [],
    total: 0,
    loading: false,
    error: null,
  },
  
  // Products
  products: {
    data: [],
    total: 0,
    loading: false,
    error: null,
  },

  // Product Categories
  productCategories: {
    data: [],
    total: 0,
    loading: false,
    error: null,
    pagination: {
      page: 1,
      limit: 10,
      total: 0
    }
  },

  // Product Sub Categories
  productSubCategories: {
    data: [],
    total: 0,
    loading: false,
    error: null,
    pagination: {
      page: 1,
      limit: 10,
      total: 0
    }
  },

  // Product Types
  productTypes: {
    data: [],
    total: 0,
    loading: false,
    error: null,
    pagination: {
      page: 1,
      limit: 10,
      total: 0
    }
  },

  // Product Series
  productSeries: {
    data: [],
    total: 0,
    loading: false,
    error: null,
    pagination: {
      page: 1,
      limit: 10,
      total: 0
    }
  },
  
  // Locations
  locations: {
    data: [],
    tree: [],
    states: [],
    cities: [],
    total: 0,
    loading: false,
    error: null,
    pagination: {
      page: 1,
      limit: 10,
      total: 0
    }
  },

  // Clients
  clients: {
    data: [],
    total: 0,
    loading: false,
    error: null,
    pagination: {
      page: 1,
      limit: 10,
      total: 0
    }
  },

  // Location Types
  locationTypes: {
    data: [],
    total: 0,
    loading: false,
    error: null,
    pagination: {
      page: 1,
      limit: 10,
      total: 0
    }
  },

  // Vendors
  vendors: {
    data: [],
    total: 0,
    loading: false,
    error: null,
    pagination: {
      page: 1,
      limit: 10,
      total: 0
    }
  },

  // Currently selected items
  selectedOem: null,
  selectedCategory: null,
  selectedProduct: null,
  selectedLocation: null,
  
  // Filters and search
  filters: {
    oem: { search: '', status: 'active' },
    category: { search: '', status: 'active', parent_id: null },
    product: { search: '', status: 'active', category_id: null, oem_id: null },
    location: { search: '', status: 'active', city: '', state: '', parent_id: null },
  },
}

// Async thunks for OEMs
export const fetchOEMs = createAsyncThunk(
  'master/fetchOEMs',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await masterService.getOEMs(params)
      return response.data
    } catch (error) {
      console.error('fetchOEMs error:', error)
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to fetch OEMs',
        errors: error.response?.data?.errors
      })
    }
  }
)

export const createOEM = createAsyncThunk(
  'master/createOEM',
  async (oemData, { dispatch, rejectWithValue }) => {
    try {
      const response = await masterService.createOEM(oemData)
      
      // Refresh OEMs list
      dispatch(fetchOEMs())
      
      return response.data
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to create OEM',
        errors: error.response?.data?.errors
      })
    }
  }
)

export const updateOEM = createAsyncThunk(
  'master/updateOEM',
  async ({ id, data }, { dispatch, rejectWithValue }) => {
    try {
      const response = await masterService.updateOEM(id, data)
      
      // Refresh OEMs list
      dispatch(fetchOEMs())
      
      return response.data
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to update OEM',
        errors: error.response?.data?.errors
      })
    }
  }
)

export const deleteOEM = createAsyncThunk(
  'master/deleteOEM',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      await masterService.deleteOEM(id)
      
      // Refresh OEMs list
      dispatch(fetchOEMs())
      
      return id
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to delete OEM'
      })
    }
  }
)

export const exportOEMs = createAsyncThunk(
  'master/exportOEMs',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await masterService.exportOEMs(params)
      return response.data
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to export OEMs'
      })
    }
  }
)

// Async thunks for Vendors
export const fetchVendors = createAsyncThunk(
  'master/fetchVendors',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await masterService.getVendors(params)
      return response.data
    } catch (error) {
      console.error('fetchVendors error:', error)
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to fetch vendors',
        errors: error.response?.data?.errors
      })
    }
  }
)

export const createVendor = createAsyncThunk(
  'master/createVendor',
  async (vendorData, { dispatch, rejectWithValue }) => {
    try {
      const response = await masterService.createVendor(vendorData)
      dispatch(fetchVendors())
      return response.data
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to create vendor',
        errors: error.response?.data?.errors
      })
    }
  }
)

export const updateVendor = createAsyncThunk(
  'master/updateVendor',
  async ({ id, data }, { dispatch, rejectWithValue }) => {
    try {
      const response = await masterService.updateVendor(id, data)
      dispatch(fetchVendors())
      return response.data
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to update vendor',
        errors: error.response?.data?.errors
      })
    }
  }
)

export const deleteVendor = createAsyncThunk(
  'master/deleteVendor',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      await masterService.deleteVendor(id)
      dispatch(fetchVendors())
      return id
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to delete vendor'
      })
    }
  }
)

// Async thunks for Boards
export const fetchBoards = createAsyncThunk(
  'master/fetchBoards',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await boardService.getBoards(params)
      return response.data
    } catch (error) {
      console.error('fetchBoards error:', error)
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to fetch boards',
        errors: error.response?.data?.errors
      })
    }
  }
)

export const fetchBoardById = createAsyncThunk(
  'master/fetchBoardById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await boardService.getBoardById(id)
      return response.data
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to fetch board details',
        errors: error.response?.data?.errors
      })
    }
  }
)

export const createBoard = createAsyncThunk(
  'master/createBoard',
  async (boardData, { dispatch, rejectWithValue }) => {
    try {
      const response = await boardService.createBoard(boardData)

      // Refresh boards list
      dispatch(fetchBoards())

      return response.data
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to create board',
        errors: error.response?.data?.errors
      })
    }
  }
)

export const updateBoard = createAsyncThunk(
  'master/updateBoard',
  async ({ id, data }, { dispatch, rejectWithValue }) => {
    try {
      const response = await boardService.updateBoard(id, data)

      // Refresh boards list
      dispatch(fetchBoards())

      return response.data
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to update board',
        errors: error.response?.data?.errors
      })
    }
  }
)

export const deleteBoard = createAsyncThunk(
  'master/deleteBoard',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      await boardService.deleteBoard(id)

      // Refresh boards list
      dispatch(fetchBoards())

      return id
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to delete board'
      })
    }
  }
)

// Async thunks for Categories
export const fetchCategories = createAsyncThunk(
  'master/fetchCategories',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await masterService.getCategories(params)
      return response.data
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to fetch categories',
        errors: error.response?.data?.errors
      })
    }
  }
)

export const fetchCategoryTree = createAsyncThunk(
  'master/fetchCategoryTree',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await masterService.getCategoryTree(params)
      return response.data
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to fetch category tree'
      })
    }
  }
)

export const createCategory = createAsyncThunk(
  'master/createCategory',
  async (categoryData, { dispatch, rejectWithValue }) => {
    try {
      const response = await masterService.createCategory(categoryData)
      
      // Refresh categories list and tree
      dispatch(fetchCategories())
      dispatch(fetchCategoryTree())
      
      return response.data
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to create category',
        errors: error.response?.data?.errors
      })
    }
  }
)

export const updateCategory = createAsyncThunk(
  'master/updateCategory',
  async ({ id, data }, { dispatch, rejectWithValue }) => {
    try {
      const response = await masterService.updateCategory(id, data)
      
      // Refresh categories list and tree
      dispatch(fetchCategories())
      dispatch(fetchCategoryTree())
      
      return response.data
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to update category',
        errors: error.response?.data?.errors
      })
    }
  }
)

export const deleteCategory = createAsyncThunk(
  'master/deleteCategory',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      await masterService.deleteCategory(id)
      
      // Refresh categories list and tree
      dispatch(fetchCategories())
      dispatch(fetchCategoryTree())
      
      return id
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to delete category'
      })
    }
  }
)

// Async thunks for Products
export const fetchProducts = createAsyncThunk(
  'master/fetchProducts',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await masterService.getProducts(params)
      return response.data
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to fetch products',
        errors: error.response?.data?.errors
      })
    }
  }
)

export const createProduct = createAsyncThunk(
  'master/createProduct',
  async (productData, { dispatch, rejectWithValue }) => {
    try {
      const response = await masterService.createProduct(productData)
      
      // Refresh products list
      dispatch(fetchProducts())
      
      return response.data
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to create product',
        errors: error.response?.data?.errors
      })
    }
  }
)

export const updateProduct = createAsyncThunk(
  'master/updateProduct',
  async ({ id, data }, { dispatch, rejectWithValue }) => {
    try {
      const response = await masterService.updateProduct(id, data)
      
      // Refresh products list
      dispatch(fetchProducts())
      
      return response.data
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to update product',
        errors: error.response?.data?.errors
      })
    }
  }
)

export const deleteProduct = createAsyncThunk(
  'master/deleteProduct',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      await masterService.deleteProduct(id)

      // Refresh products list
      dispatch(fetchProducts())

      return id
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to delete product'
      })
    }
  }
)

// Async thunks for Locations
export const fetchLocations = createAsyncThunk(
  'master/fetchLocations',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await masterService.getLocations(params)
      return response.data
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to fetch locations',
        errors: error.response?.data?.errors
      })
    }
  }
)

export const fetchLocationTree = createAsyncThunk(
  'master/fetchLocationTree',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await masterService.getLocationTree(params)
      return response.data
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to fetch location tree'
      })
    }
  }
)

export const fetchStates = createAsyncThunk(
  'master/fetchStates',
  async (_, { rejectWithValue }) => {
    try {
      const response = await masterService.getStates()
      return response.data
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to fetch states'
      })
    }
  }
)

export const fetchCities = createAsyncThunk(
  'master/fetchCities',
  async (state = null, { rejectWithValue }) => {
    try {
      const response = await masterService.getCities(state)
      return response.data
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to fetch cities'
      })
    }
  }
)

export const createLocation = createAsyncThunk(
  'master/createLocation',
  async (locationData, { dispatch, rejectWithValue }) => {
    try {
      const response = await masterService.createLocation(locationData)
      
      // Refresh locations list and tree
      dispatch(fetchLocations())
      dispatch(fetchLocationTree())
      
      return response.data
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to create location',
        errors: error.response?.data?.errors
      })
    }
  }
)

export const updateLocation = createAsyncThunk(
  'master/updateLocation',
  async ({ id, data }, { dispatch, rejectWithValue }) => {
    try {
      const response = await masterService.updateLocation(id, data)
      
      // Refresh locations list and tree
      dispatch(fetchLocations())
      dispatch(fetchLocationTree())
      
      return response.data
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to update location',
        errors: error.response?.data?.errors
      })
    }
  }
)

export const deleteLocation = createAsyncThunk(
  'master/deleteLocation',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      await masterService.deleteLocation(id)
      
      // Refresh locations list and tree
      dispatch(fetchLocations())
      dispatch(fetchLocationTree())
      
      return id
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to delete location'
      })
    }
  }
)

// Async thunks for Product Categories
export const fetchProductCategories = createAsyncThunk(
  'master/fetchProductCategories',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await masterService.getProductCategories(params)
      return response.data
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to fetch product categories',
        errors: error.response?.data?.errors
      })
    }
  }
)

export const createProductCategory = createAsyncThunk(
  'master/createProductCategory',
  async (categoryData, { rejectWithValue }) => {
    try {
      const response = await masterService.createProductCategory(categoryData)
      return response.data
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to create product category',
        errors: error.response?.data?.errors
      })
    }
  }
)

export const updateProductCategory = createAsyncThunk(
  'master/updateProductCategory',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await masterService.updateProductCategory(id, data)
      return response.data
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to update product category',
        errors: error.response?.data?.errors
      })
    }
  }
)

export const deleteProductCategory = createAsyncThunk(
  'master/deleteProductCategory',
  async (id, { rejectWithValue }) => {
    try {
      await masterService.deleteProductCategory(id)
      return id
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to delete product category'
      })
    }
  }
)

// Async thunks for Product Sub Categories
export const fetchProductSubCategories = createAsyncThunk(
  'master/fetchProductSubCategories',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await masterService.getProductSubCategories(params)
      return response.data
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to fetch product sub categories',
        errors: error.response?.data?.errors
      })
    }
  }
)

export const createProductSubCategory = createAsyncThunk(
  'master/createProductSubCategory',
  async (subCategoryData, { rejectWithValue }) => {
    try {
      const response = await masterService.createProductSubCategory(subCategoryData)
      return response.data
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to create product sub category',
        errors: error.response?.data?.errors
      })
    }
  }
)

export const updateProductSubCategory = createAsyncThunk(
  'master/updateProductSubCategory',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await masterService.updateProductSubCategory(id, data)
      return response.data
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to update product sub category',
        errors: error.response?.data?.errors
      })
    }
  }
)

export const deleteProductSubCategory = createAsyncThunk(
  'master/deleteProductSubCategory',
  async (id, { rejectWithValue }) => {
    try {
      await masterService.deleteProductSubCategory(id)
      return id
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to delete product sub category'
      })
    }
  }
)

// Async thunks for Product Types
export const fetchProductTypes = createAsyncThunk(
  'master/fetchProductTypes',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await masterService.getProductTypes(params)
      return response.data
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to fetch product types',
        errors: error.response?.data?.errors
      })
    }
  }
)

export const createProductType = createAsyncThunk(
  'master/createProductType',
  async (typeData, { rejectWithValue }) => {
    try {
      const response = await masterService.createProductType(typeData)
      return response.data
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to create product type',
        errors: error.response?.data?.errors
      })
    }
  }
)

export const updateProductType = createAsyncThunk(
  'master/updateProductType',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await masterService.updateProductType(id, data)
      return response.data
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to update product type',
        errors: error.response?.data?.errors
      })
    }
  }
)

export const deleteProductType = createAsyncThunk(
  'master/deleteProductType',
  async (id, { rejectWithValue }) => {
    try {
      await masterService.deleteProductType(id)
      return id
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to delete product type'
      })
    }
  }
)

// Async thunks for Product Series
export const fetchProductSeries = createAsyncThunk(
  'master/fetchProductSeries',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await masterService.getProductSeries(params)
      return response.data
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to fetch product series',
        errors: error.response?.data?.errors
      })
    }
  }
)

export const createProductSeries = createAsyncThunk(
  'master/createProductSeries',
  async (seriesData, { rejectWithValue }) => {
    try {
      const response = await masterService.createProductSeries(seriesData)
      return response.data
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to create product series',
        errors: error.response?.data?.errors
      })
    }
  }
)

export const updateProductSeries = createAsyncThunk(
  'master/updateProductSeries',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await masterService.updateProductSeries(id, data)
      return response.data
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to update product series',
        errors: error.response?.data?.errors
      })
    }
  }
)

export const deleteProductSeries = createAsyncThunk(
  'master/deleteProductSeries',
  async (id, { rejectWithValue }) => {
    try {
      await masterService.deleteProductSeries(id)
      return id
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to delete product series'
      })
    }
  }
)

// Async thunks for Clients
export const fetchClients = createAsyncThunk(
  'master/fetchClients',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await masterService.getClients(params)
      return response.data
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to fetch clients',
        errors: error.response?.data?.errors
      })
    }
  }
)

export const createClient = createAsyncThunk(
  'master/createClient',
  async (clientData, { rejectWithValue }) => {
    try {
      const response = await masterService.createClient(clientData)
      return response.data
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to create client',
        errors: error.response?.data?.errors
      })
    }
  }
)

export const updateClient = createAsyncThunk(
  'master/updateClient',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await masterService.updateClient(id, data)
      return response.data
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to update client',
        errors: error.response?.data?.errors
      })
    }
  }
)

export const deleteClient = createAsyncThunk(
  'master/deleteClient',
  async (id, { rejectWithValue }) => {
    try {
      await masterService.deleteClient(id)
      return id
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to delete client'
      })
    }
  }
)

// Async thunks for Location Types
export const fetchLocationTypes = createAsyncThunk(
  'master/fetchLocationTypes',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await masterService.getLocationTypes(params)
      return response.data
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to fetch location types',
        errors: error.response?.data?.errors
      })
    }
  }
)

export const createLocationType = createAsyncThunk(
  'master/createLocationType',
  async (locationTypeData, { rejectWithValue }) => {
    try {
      const response = await masterService.createLocationType(locationTypeData)
      return response.data
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to create location type',
        errors: error.response?.data?.errors
      })
    }
  }
)

export const updateLocationType = createAsyncThunk(
  'master/updateLocationType',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await masterService.updateLocationType(id, data)
      return response.data
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to update location type',
        errors: error.response?.data?.errors
      })
    }
  }
)

export const deleteLocationType = createAsyncThunk(
  'master/deleteLocationType',
  async (id, { rejectWithValue }) => {
    try {
      await masterService.deleteLocationType(id)
      return id
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to delete location type'
      })
    }
  }
)


// Create slice
const masterSlice = createSlice({
  name: 'master',
  initialState,
  reducers: {
    // Clear errors
    clearMasterError: (state, action) => {
      const { module } = action.payload
      if (state[module]) {
        state[module].error = null
      }
    },
    
    clearAllMasterErrors: (state) => {
      Object.keys(state).forEach(key => {
        if (state[key] && typeof state[key] === 'object' && 'error' in state[key]) {
          state[key].error = null
        }
      })
    },
    
    // Set selected items
    setSelectedOem: (state, action) => {
      state.selectedOem = action.payload
    },
    
    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload
    },
    
    setSelectedProduct: (state, action) => {
      state.selectedProduct = action.payload
    },
    
    setSelectedLocation: (state, action) => {
      state.selectedLocation = action.payload
    },
    
    // Clear selections
    clearSelections: (state) => {
      state.selectedOem = null
      state.selectedCategory = null
      state.selectedProduct = null
      state.selectedLocation = null
    },
    
    // Set filters
    setMasterFilters: (state, action) => {
      const { module, filters } = action.payload
      if (state.filters[module]) {
        state.filters[module] = { ...state.filters[module], ...filters }
      }
    },
    
    clearMasterFilters: (state, action) => {
      const { module } = action.payload
      if (state.filters[module]) {
        const defaultFilters = initialState.filters[module]
        state.filters[module] = { ...defaultFilters }
      }
    },
    
    clearAllMasterFilters: (state) => {
      state.filters = { ...initialState.filters }
    },
    
    // Reset master state
    resetMasterState: (state) => {
      return { ...initialState }
    }
  },
  extraReducers: (builder) => {
    builder
      // OEMs
      .addCase(fetchOEMs.pending, (state) => {
        state.oems.loading = true
        state.oems.error = null
      })
      .addCase(fetchOEMs.fulfilled, (state, action) => {
        state.oems.loading = false
        
        // Fix: Access the correct nested structure
        const oemsArray = action.payload.data?.oems || action.payload.oems || []
        state.oems.data = Array.isArray(oemsArray) ? oemsArray : []
        
        state.oems.total = action.payload.data?.pagination?.total || action.payload.pagination?.total || 0
        state.pagination = action.payload.data?.pagination || action.payload.pagination || {}
      })
      .addCase(fetchOEMs.rejected, (state, action) => {
        state.oems.loading = false
        state.oems.error = action.payload?.message || 'Failed to fetch OEMs'
      })

      // Vendors
      .addCase(fetchVendors.pending, (state) => {
        state.vendors.loading = true
        state.vendors.error = null
      })
      .addCase(fetchVendors.fulfilled, (state, action) => {
        state.vendors.loading = false
        const vendorsArray = action.payload.data?.vendors || action.payload.vendors || []
        state.vendors.data = Array.isArray(vendorsArray) ? vendorsArray : []
        state.vendors.total = action.payload.data?.pagination?.total || action.payload.pagination?.total || 0
        state.vendors.pagination = action.payload.data?.pagination || action.payload.pagination || {}
      })
      .addCase(fetchVendors.rejected, (state, action) => {
        state.vendors.loading = false
        state.vendors.error = action.payload?.message || 'Failed to fetch vendors'
      })
      .addCase(createVendor.pending, (state) => {
        state.vendors.loading = true
        state.vendors.error = null
      })
      .addCase(createVendor.fulfilled, (state) => {
        state.vendors.loading = false
      })
      .addCase(createVendor.rejected, (state, action) => {
        state.vendors.loading = false
        state.vendors.error = action.payload?.message || 'Failed to create vendor'
      })
      .addCase(updateVendor.pending, (state) => {
        state.vendors.loading = true
        state.vendors.error = null
      })
      .addCase(updateVendor.fulfilled, (state) => {
        state.vendors.loading = false
      })
      .addCase(updateVendor.rejected, (state, action) => {
        state.vendors.loading = false
        state.vendors.error = action.payload?.message || 'Failed to update vendor'
      })
      .addCase(deleteVendor.pending, (state) => {
        state.vendors.loading = true
        state.vendors.error = null
      })
      .addCase(deleteVendor.fulfilled, (state) => {
        state.vendors.loading = false
      })
      .addCase(deleteVendor.rejected, (state, action) => {
        state.vendors.loading = false
        state.vendors.error = action.payload?.message || 'Failed to delete vendor'
      })

      // Boards
      .addCase(fetchBoards.pending, (state) => {
        state.boards.loading = true
        state.boards.error = null
      })
      .addCase(fetchBoards.fulfilled, (state, action) => {
        state.boards.loading = false
        const boardsArray = action.payload.data?.boards || action.payload.boards || []
        state.boards.data = Array.isArray(boardsArray) ? boardsArray : []
        state.boards.total = action.payload.data?.pagination?.total || action.payload.pagination?.total || 0
        state.boards.pagination = action.payload.data?.pagination || action.payload.pagination || {}
      })
      .addCase(fetchBoards.rejected, (state, action) => {
        state.boards.loading = false
        state.boards.error = action.payload?.message || 'Failed to fetch boards'
      })

      .addCase(createBoard.pending, (state) => {
        state.boards.loading = true
        state.boards.error = null
      })
      .addCase(createBoard.fulfilled, (state) => {
        state.boards.loading = false
      })
      .addCase(createBoard.rejected, (state, action) => {
        state.boards.loading = false
        state.boards.error = action.payload?.message || 'Failed to create board'
      })

      .addCase(updateBoard.pending, (state) => {
        state.boards.loading = true
        state.boards.error = null
      })
      .addCase(updateBoard.fulfilled, (state) => {
        state.boards.loading = false
      })
      .addCase(updateBoard.rejected, (state, action) => {
        state.boards.loading = false
        state.boards.error = action.payload?.message || 'Failed to update board'
      })

      .addCase(deleteBoard.pending, (state) => {
        state.boards.loading = true
        state.boards.error = null
      })
      .addCase(deleteBoard.fulfilled, (state) => {
        state.boards.loading = false
      })
      .addCase(deleteBoard.rejected, (state, action) => {
        state.boards.loading = false
        state.boards.error = action.payload?.message || 'Failed to delete board'
      })

      // Categories
      .addCase(fetchCategories.pending, (state) => {
        state.categories.loading = true
        state.categories.error = null
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories.loading = false
        state.categories.data = action.payload.data?.categories || action.payload.categories || []
        state.categories.total = action.payload.data?.pagination?.total || action.payload.pagination?.total || 0
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.categories.loading = false
        state.categories.error = action.payload?.message || 'Failed to fetch categories'
      })
      
      .addCase(fetchCategoryTree.fulfilled, (state, action) => {
        state.categories.tree = action.payload || []
      })
      
      // Products
      .addCase(fetchProducts.pending, (state) => {
        state.products.loading = true
        state.products.error = null
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.products.loading = false
        // The API response is wrapped in data: { products: [...], pagination: {...} }
        state.products.data = action.payload.data?.products || action.payload.products || []
        state.products.total = action.payload.data?.pagination?.total || action.payload.pagination?.total || 0
        state.products.pagination = action.payload.data?.pagination || action.payload.pagination || {}
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.products.loading = false
        state.products.error = action.payload?.message || 'Failed to fetch products'
      })

      // Locations
      .addCase(fetchLocations.pending, (state) => {
        state.locations.loading = true
        state.locations.error = null
      })
      .addCase(fetchLocations.fulfilled, (state, action) => {
        state.locations.loading = false
        const locationsArray = action.payload.data?.locations || action.payload.locations || []
        state.locations.data = Array.isArray(locationsArray) ? locationsArray : []
        state.locations.total = action.payload.data?.pagination?.total || action.payload.pagination?.total || 0
        state.locations.pagination = action.payload.data?.pagination || action.payload.pagination || {}
      })
      .addCase(fetchLocations.rejected, (state, action) => {
        state.locations.loading = false
        state.locations.error = action.payload?.message || 'Failed to fetch locations'
      })
      
      .addCase(fetchLocationTree.fulfilled, (state, action) => {
        state.locations.tree = action.payload || []
      })
      
      .addCase(fetchStates.fulfilled, (state, action) => {
        state.locations.states = action.payload || []
      })
      
      .addCase(fetchCities.fulfilled, (state, action) => {
        state.locations.cities = action.payload || []
      })

      // Product Categories
      .addCase(fetchProductCategories.pending, (state) => {
        state.productCategories.loading = true
        state.productCategories.error = null
      })
      .addCase(fetchProductCategories.fulfilled, (state, action) => {
        state.productCategories.loading = false
        // The API response is wrapped in data: { categories: [...], pagination: {...} }
        const categoriesArray = action.payload.data?.categories || action.payload.categories || []
        // Should only contain top-level categories (parent_category_id IS NULL) from backend filtering
        state.productCategories.data = Array.isArray(categoriesArray) ? categoriesArray : []
        state.productCategories.total = action.payload.data?.pagination?.total || action.payload.pagination?.total || 0
        state.productCategories.pagination = action.payload.data?.pagination || action.payload.pagination || {}
      })
      .addCase(fetchProductCategories.rejected, (state, action) => {
        state.productCategories.loading = false
        state.productCategories.error = action.payload?.message || 'Failed to fetch product categories'
      })

      // Product Sub Categories
      .addCase(fetchProductSubCategories.pending, (state) => {
        state.productSubCategories.loading = true
        state.productSubCategories.error = null
      })
      .addCase(fetchProductSubCategories.fulfilled, (state, action) => {
        state.productSubCategories.loading = false
        // The API response is wrapped in data: { subcategories: [...], pagination: {...} }
        const subCategoriesArray = action.payload.data?.subcategories || action.payload.subcategories || []
        state.productSubCategories.data = Array.isArray(subCategoriesArray) ? subCategoriesArray : []
        state.productSubCategories.total = action.payload.data?.pagination?.total || subCategoriesArray.length
        state.productSubCategories.pagination = action.payload.data?.pagination || action.payload.pagination || {}
      })
      .addCase(fetchProductSubCategories.rejected, (state, action) => {
        state.productSubCategories.loading = false
        state.productSubCategories.error = action.payload?.message || 'Failed to fetch product sub categories'
      })

      // Product Types
      .addCase(fetchProductTypes.pending, (state) => {
        state.productTypes.loading = true
        state.productTypes.error = null
      })
      .addCase(fetchProductTypes.fulfilled, (state, action) => {
        state.productTypes.loading = false
        // The API response is wrapped in data: { productTypes: [...], pagination: {...} }
        const productTypesArray = action.payload.data?.productTypes || action.payload.productTypes || []
        state.productTypes.data = Array.isArray(productTypesArray) ? productTypesArray : []
        state.productTypes.total = action.payload.data?.pagination?.total || action.payload.pagination?.total || 0
        state.productTypes.pagination = action.payload.data?.pagination || action.payload.pagination || {}
      })
      .addCase(fetchProductTypes.rejected, (state, action) => {
        state.productTypes.loading = false
        state.productTypes.error = action.payload?.message || 'Failed to fetch product types'
      })

      // Product Series
      .addCase(fetchProductSeries.pending, (state) => {
        state.productSeries.loading = true
        state.productSeries.error = null
      })
      .addCase(fetchProductSeries.fulfilled, (state, action) => {
        state.productSeries.loading = false
        // The API response structure: { data: { productSeries: [...], pagination: {...} } }
        const productSeriesArray = action.payload.data?.productSeries || action.payload.data?.data || action.payload.data || []
        state.productSeries.data = Array.isArray(productSeriesArray) ? productSeriesArray : []
        state.productSeries.total = action.payload.data?.pagination?.total || action.payload.total || 0
        state.productSeries.pagination = action.payload.data?.pagination || action.payload.pagination || {}
      })
      .addCase(fetchProductSeries.rejected, (state, action) => {
        state.productSeries.loading = false
        state.productSeries.error = action.payload?.message || 'Failed to fetch product series'
      })

      // Clients
      .addCase(fetchClients.pending, (state) => {
        state.clients.loading = true
        state.clients.error = null
      })
      .addCase(fetchClients.fulfilled, (state, action) => {
        state.clients.loading = false
        const clientsArray = action.payload.data?.clients || action.payload.clients || []
        state.clients.data = Array.isArray(clientsArray) ? clientsArray : []
        state.clients.total = action.payload.data?.pagination?.total || action.payload.pagination?.total || 0
        state.clients.pagination = action.payload.data?.pagination || action.payload.pagination || {}
      })
      .addCase(fetchClients.rejected, (state, action) => {
        state.clients.loading = false
        state.clients.error = action.payload?.message || 'Failed to fetch clients'
      })

      // Location Types
      .addCase(fetchLocationTypes.pending, (state) => {
        state.locationTypes.loading = true
        state.locationTypes.error = null
      })
      .addCase(fetchLocationTypes.fulfilled, (state, action) => {
        state.locationTypes.loading = false
        const locationTypesArray = action.payload.data?.location_types || action.payload.location_types || []
        state.locationTypes.data = Array.isArray(locationTypesArray) ? locationTypesArray : []
        state.locationTypes.total = action.payload.data?.pagination?.total || action.payload.pagination?.total || 0
        state.locationTypes.pagination = action.payload.data?.pagination || action.payload.pagination || {}
      })
      .addCase(fetchLocationTypes.rejected, (state, action) => {
        state.locationTypes.loading = false
        state.locationTypes.error = action.payload?.message || 'Failed to fetch location types'
      })

  }
})

// Export actions
export const {
  clearMasterError,
  clearAllMasterErrors,
  setSelectedOem,
  setSelectedCategory,
  setSelectedProduct,
  setSelectedLocation,
  clearSelections,
  setMasterFilters,
  clearMasterFilters,
  clearAllMasterFilters,
  resetMasterState,
} = masterSlice.actions

// Selectors
export const selectBoards = (state) => state.master.boards
export const selectOEMs = (state) => state.master.oems
export const selectCategories = (state) => state.master.categories
export const selectProducts = (state) => state.master.products
export const selectProductTypes = (state) => state.master.productTypes
export const selectLocations = (state) => state.master.locations
export const selectMasterSelections = (state) => ({
  oem: state.master.selectedOem,
  category: state.master.selectedCategory,
  product: state.master.selectedProduct,
  location: state.master.selectedLocation,
})
export const selectMasterFilters = (state) => state.master.filters

export default masterSlice.reducer