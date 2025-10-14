/**
 * TICKET SERVICE
 * API service for ticket management
 */

import apiClient from '../utils/apiClient';

const ticketService = {
  /**
   * Get all tickets with filters and pagination
   */
  getTickets: async (params = {}) => {
    try {
      const response = await apiClient.get('/tickets', { params });
      return response;
    } catch (error) {
      console.error('Error fetching tickets:', error);
      throw error;
    }
  },

  /**
   * Get single ticket by ID
   */
  getTicketById: async (ticketId) => {
    try {
      const response = await apiClient.get(`/tickets/${ticketId}`);
      return response;
    } catch (error) {
      console.error('Error fetching ticket:', error);
      throw error;
    }
  },

  /**
   * Create new ticket
   */
  createTicket: async (ticketData) => {
    try {
      const response = await apiClient.post('/tickets', ticketData);
      return response;
    } catch (error) {
      console.error('Error creating ticket:', error);
      throw error;
    }
  },

  /**
   * Update ticket
   */
  updateTicket: async (ticketId, updateData) => {
    try {
      const response = await apiClient.put(`/tickets/${ticketId}`, updateData);
      return response;
    } catch (error) {
      console.error('Error updating ticket:', error);
      throw error;
    }
  },

  /**
   * Assign engineer to ticket
   */
  assignEngineer: async (ticketId, engineerId) => {
    try {
      const response = await apiClient.put(`/tickets/${ticketId}/assign`, {
        engineer_id: engineerId
      });
      return response;
    } catch (error) {
      console.error('Error assigning engineer:', error);
      throw error;
    }
  },

  /**
   * Close ticket
   */
  closeTicket: async (ticketId, resolutionNotes) => {
    try {
      const response = await apiClient.put(`/tickets/${ticketId}/close`, {
        resolution_notes: resolutionNotes
      });
      return response;
    } catch (error) {
      console.error('Error closing ticket:', error);
      throw error;
    }
  },

  /**
   * Get available engineers
   */
  getAvailableEngineers: async (filters = {}) => {
    try {
      const response = await apiClient.get('/tickets/engineers', {
        params: filters
      });
      return response;
    } catch (error) {
      console.error('Error fetching engineers:', error);
      throw error;
    }
  },

  /**
   * Get employees for ticket creation
   */
  getEmployees: async () => {
    try {
      const response = await apiClient.get('/tickets/employees');
      return response;
    } catch (error) {
      console.error('Error fetching employees:', error);
      throw error;
    }
  },

  /**
   * Get ticket statistics
   */
  getTicketStats: async (filters = {}) => {
    try {
      const response = await apiClient.get('/tickets/stats', {
        params: filters
      });
      return response;
    } catch (error) {
      console.error('Error fetching ticket stats:', error);
      throw error;
    }
  },

  /**
   * Add comment to ticket
   */
  addComment: async (ticketId, commentData) => {
    try {
      const response = await apiClient.post(
        `/tickets/${ticketId}/comments`,
        commentData
      );
      return response;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  },

  /**
   * Get comments for ticket
   */
  getComments: async (ticketId) => {
    try {
      const response = await apiClient.get(`/tickets/${ticketId}/comments`);
      return response;
    } catch (error) {
      console.error('Error fetching comments:', error);
      throw error;
    }
  },

  /**
   * Helper: Get status color for badges
   */
  getStatusColor: (status) => {
    const colors = {
      open: 'blue',
      assigned: 'orange',
      in_progress: 'purple',
      pending: 'gold',
      resolved: 'green',
      closed: 'default',
      cancelled: 'red'
    };
    return colors[status] || 'default';
  },

  /**
   * Helper: Get priority color for badges
   */
  getPriorityColor: (priority) => {
    const colors = {
      low: 'green',
      medium: 'blue',
      high: 'orange',
      critical: 'red',
      emergency: 'red'
    };
    return colors[priority] || 'default';
  },

  /**
   * Helper: Get status display name
   */
  getStatusDisplayName: (status) => {
    const names = {
      open: 'Open',
      assigned: 'Assigned',
      in_progress: 'In Progress',
      pending: 'Pending',
      resolved: 'Resolved',
      closed: 'Closed',
      cancelled: 'Cancelled'
    };
    return names[status] || status;
  },

  /**
   * Helper: Get priority display name
   */
  getPriorityDisplayName: (priority) => {
    const names = {
      low: 'Low',
      medium: 'Medium',
      high: 'High',
      critical: 'Critical',
      emergency: 'Emergency'
    };
    return names[priority] || priority;
  },

  /**
   * Helper: Build search params for API
   */
  buildSearchParams: (filters, pagination) => {
    const params = {};

    // Add filters
    if (filters.status) params.status = filters.status;
    if (filters.priority) params.priority = filters.priority;
    if (filters.category) params.category = filters.category;
    if (filters.department_id) params.department_id = filters.department_id;
    if (filters.location_id) params.location_id = filters.location_id;
    if (filters.assigned_to_engineer_id)
      params.assigned_to_engineer_id = filters.assigned_to_engineer_id;
    if (filters.search) params.search = filters.search;

    // Add pagination
    if (pagination.page) params.page = pagination.page;
    if (pagination.limit) params.limit = pagination.limit;

    return params;
  },

  /**
   * Helper: Format date for display
   */
  formatDate: (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  /**
   * Helper: Format relative time (e.g., "2 hours ago")
   */
  formatRelativeTime: (dateString) => {
    if (!dateString) return 'N/A';

    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
};

export default ticketService;
