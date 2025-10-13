import api, { apiUtils } from './api'

const departmentService = {
  // Get all departments with pagination and filters
  getDepartments: (params = {}) => {
    const queryString = apiUtils.buildQueryString(params)
    return api.get(`/departments${queryString ? `?${queryString}` : ''}`)
  },

  // Get department hierarchy (tree structure)
  getDepartmentHierarchy: (params = {}) => {
    const queryString = apiUtils.buildQueryString(params)
    return api.get(`/departments/hierarchy${queryString ? `?${queryString}` : ''}`)
  },

  // Get department by ID
  getDepartmentById: (id) => {
    return api.get(`/departments/${id}`)
  },

  // Create new department
  createDepartment: (departmentData) => {
    return api.post('/departments', departmentData)
  },

  // Update department
  updateDepartment: (id, departmentData) => {
    return api.put(`/departments/${id}`, departmentData)
  },

  // Delete department (soft delete)
  deleteDepartment: (id) => {
    return api.delete(`/departments/${id}`)
  },

  // Get users in a department
  getDepartmentUsers: (id, params = {}) => {
    const queryString = apiUtils.buildQueryString(params)
    return api.get(`/departments/${id}/users${queryString ? `?${queryString}` : ''}`)
  },

  // Get sub-departments
  getSubDepartments: (id) => {
    return api.get(`/departments/${id}/sub-departments`)
  }
}

export default departmentService