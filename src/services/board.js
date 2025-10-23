import api, { apiUtils } from './api'

const boardService = {
  // Get all boards with pagination and filters
  getBoards: (params = {}) => {
    const queryString = apiUtils.buildQueryString(params)
    return api.get(`/boards${queryString ? `?${queryString}` : ''}`)
  },

  // Get board by ID (includes assigned departments)
  getBoardById: (id) => {
    return api.get(`/boards/${id}`)
  },

  // Create new board
  createBoard: (boardData) => {
    return api.post('/boards', boardData)
  },

  // Update board
  updateBoard: (id, boardData) => {
    return api.put(`/boards/${id}`, boardData)
  },

  // Delete board
  deleteBoard: (id) => {
    return api.delete(`/boards/${id}`)
  },

  // Assign departments to board
  assignDepartments: (id, departmentIds) => {
    return api.put(`/boards/${id}`, { departmentIds })
  }
}

export default boardService
