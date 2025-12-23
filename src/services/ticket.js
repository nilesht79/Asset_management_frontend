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
   * Get filter options - returns only values that exist in database
   */
  getFilterOptions: async () => {
    try {
      const response = await apiClient.get('/tickets/filter-options');
      return response;
    } catch (error) {
      console.error('Error fetching filter options:', error);
      throw error;
    }
  },

  /**
   * Export tickets to Excel
   */
  exportTickets: async (filters = {}) => {
    try {
      const response = await apiClient.get('/tickets/export', {
        params: filters,
        responseType: 'blob'
      });
      return response;
    } catch (error) {
      console.error('Error exporting tickets:', error);
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
   * Get my tickets (for engineers)
   */
  getMyTickets: async (params = {}) => {
    try {
      const response = await apiClient.get('/tickets/my-tickets', { params });
      return response;
    } catch (error) {
      console.error('Error fetching my tickets:', error);
      throw error;
    }
  },

  /**
   * Get tickets created by current user (for employees)
   */
  getMyCreatedTickets: async (params = {}) => {
    try {
      const response = await apiClient.get('/tickets/my-created-tickets', { params });
      return response;
    } catch (error) {
      console.error('Error fetching my created tickets:', error);
      throw error;
    }
  },

  /**
   * Engineer requests to close a ticket
   * @param {string} ticketId - Ticket ID
   * @param {string} requestNotes - Resolution notes
   * @param {string|null} serviceReportId - Service report ID (for repair/replace tickets)
   */
  requestTicketClose: async (ticketId, requestNotes, serviceReportId = null) => {
    try {
      const response = await apiClient.post(`/tickets/${ticketId}/request-close`, {
        request_notes: requestNotes,
        service_report_id: serviceReportId
      });
      return response;
    } catch (error) {
      console.error('Error requesting ticket close:', error);
      throw error;
    }
  },

  /**
   * Get pending close requests (for coordinators)
   */
  getPendingCloseRequests: async (filters = {}) => {
    try {
      const response = await apiClient.get('/tickets/pending-close-requests', {
        params: filters
      });
      return response;
    } catch (error) {
      console.error('Error fetching pending close requests:', error);
      throw error;
    }
  },

  /**
   * Get close request count (for badge)
   */
  getCloseRequestCount: async (filters = {}) => {
    try {
      const response = await apiClient.get('/tickets/close-requests-count', {
        params: filters
      });
      return response;
    } catch (error) {
      console.error('Error fetching close request count:', error);
      throw error;
    }
  },

  /**
   * Coordinator reviews (approves/rejects) close request
   */
  reviewCloseRequest: async (closeRequestId, action, reviewNotes = null) => {
    try {
      const response = await apiClient.put(`/tickets/${closeRequestId}/review-close-request`, {
        action,
        review_notes: reviewNotes
      });
      return response;
    } catch (error) {
      console.error('Error reviewing close request:', error);
      throw error;
    }
  },

  /**
   * Get close request history for a ticket
   */
  getCloseRequestHistory: async (ticketId) => {
    try {
      const response = await apiClient.get(`/tickets/${ticketId}/close-request-history`);
      return response;
    } catch (error) {
      console.error('Error fetching close request history:', error);
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
      pending_closure: 'cyan',
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
      pending_closure: 'Pending Closure',
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
  },

  // ============================================
  // TICKET ASSET LINKING METHODS
  // ============================================

  /**
   * Get current user's assigned assets for ticket creation
   */
  getMyAssets: async () => {
    try {
      const response = await apiClient.get('/tickets/my-assets');
      return response;
    } catch (error) {
      console.error('Error fetching my assets:', error);
      throw error;
    }
  },

  /**
   * Get specific employee's assets for ticket creation (coordinators)
   */
  getEmployeeAssets: async (userId) => {
    try {
      const response = await apiClient.get(`/tickets/employee-assets/${userId}`);
      return response;
    } catch (error) {
      console.error('Error fetching employee assets:', error);
      throw error;
    }
  },

  /**
   * Get current user's software installations for ticket creation
   */
  getMySoftware: async () => {
    try {
      const response = await apiClient.get('/tickets/my-software');
      return response;
    } catch (error) {
      console.error('Error fetching my software:', error);
      throw error;
    }
  },

  /**
   * Get specific employee's software installations for ticket creation (coordinators)
   */
  getEmployeeSoftware: async (userId) => {
    try {
      const response = await apiClient.get(`/tickets/employee-software/${userId}`);
      return response;
    } catch (error) {
      console.error('Error fetching employee software:', error);
      throw error;
    }
  },

  /**
   * Get all assets linked to a ticket
   */
  getTicketAssets: async (ticketId) => {
    try {
      const response = await apiClient.get(`/tickets/${ticketId}/assets`);
      return response;
    } catch (error) {
      console.error('Error fetching ticket assets:', error);
      throw error;
    }
  },

  /**
   * Link an asset to a ticket
   */
  linkAsset: async (ticketId, assetId, notes = null) => {
    try {
      const response = await apiClient.post(`/tickets/${ticketId}/assets`, {
        asset_id: assetId,
        notes
      });
      return response;
    } catch (error) {
      console.error('Error linking asset:', error);
      throw error;
    }
  },

  /**
   * Link multiple assets to a ticket
   */
  linkMultipleAssets: async (ticketId, assetIds) => {
    try {
      const response = await apiClient.post(`/tickets/${ticketId}/assets/bulk`, {
        asset_ids: assetIds
      });
      return response;
    } catch (error) {
      console.error('Error linking assets:', error);
      throw error;
    }
  },

  /**
   * Unlink an asset from a ticket
   */
  unlinkAsset: async (ticketId, assetId) => {
    try {
      const response = await apiClient.delete(`/tickets/${ticketId}/assets/${assetId}`);
      return response;
    } catch (error) {
      console.error('Error unlinking asset:', error);
      throw error;
    }
  },

  /**
   * Get asset count for a ticket
   */
  getTicketAssetCount: async (ticketId) => {
    try {
      const response = await apiClient.get(`/tickets/${ticketId}/assets/count`);
      return response;
    } catch (error) {
      console.error('Error fetching asset count:', error);
      throw error;
    }
  },

  /**
   * Get all software linked to a ticket
   */
  getTicketSoftware: async (ticketId) => {
    try {
      const response = await apiClient.get(`/tickets/${ticketId}/software`);
      return response;
    } catch (error) {
      console.error('Error fetching ticket software:', error);
      throw error;
    }
  },

  /**
   * Unlink software from a ticket
   */
  unlinkSoftware: async (ticketId, installationId) => {
    try {
      const response = await apiClient.delete(`/tickets/${ticketId}/software/${installationId}`);
      return response;
    } catch (error) {
      console.error('Error unlinking software:', error);
      throw error;
    }
  },

  // ============================================
  // TICKET TREND ANALYSIS METHODS
  // ============================================

  /**
   * Get ticket trend analysis
   * @param {Object} params - Filter parameters (months_back, location_id, department_id, priority)
   */
  getTrendAnalysis: async (params = {}) => {
    try {
      const response = await apiClient.get('/tickets/trend-analysis', { params });
      return response;
    } catch (error) {
      console.error('Error fetching trend analysis:', error);
      throw error;
    }
  },

  /**
   * Export ticket trend analysis to Excel
   * @param {Object} params - Filter parameters (months_back, location_id, department_id, priority)
   */
  exportTrendAnalysis: async (params = {}) => {
    try {
      const response = await apiClient.get('/tickets/trend-analysis/export', {
        params,
        responseType: 'blob'
      });

      // Create download link
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ticket_trend_analysis_${params.months_back || 6}m_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return response;
    } catch (error) {
      console.error('Error exporting trend analysis:', error);
      throw error;
    }
  },

  // ============================================
  // TICKET REOPEN METHODS
  // ============================================

  /**
   * Get ticket reopen configuration
   */
  getReopenConfig: async () => {
    try {
      const response = await apiClient.get('/tickets/reopen-config');
      return response;
    } catch (error) {
      console.error('Error fetching reopen config:', error);
      throw error;
    }
  },

  /**
   * Update ticket reopen configuration
   */
  updateReopenConfig: async (configData) => {
    try {
      const response = await apiClient.put('/tickets/reopen-config', configData);
      return response;
    } catch (error) {
      console.error('Error updating reopen config:', error);
      throw error;
    }
  },

  /**
   * Check if a ticket can be reopened
   */
  canReopenTicket: async (ticketId) => {
    try {
      const response = await apiClient.get(`/tickets/${ticketId}/can-reopen`);
      return response;
    } catch (error) {
      console.error('Error checking reopen eligibility:', error);
      throw error;
    }
  },

  /**
   * Reopen a closed ticket
   */
  reopenTicket: async (ticketId, reopenReason) => {
    try {
      const response = await apiClient.post(`/tickets/${ticketId}/reopen`, {
        reopen_reason: reopenReason
      });
      return response;
    } catch (error) {
      console.error('Error reopening ticket:', error);
      throw error;
    }
  },

  /**
   * Get reopen history for a ticket
   */
  getReopenHistory: async (ticketId) => {
    try {
      const response = await apiClient.get(`/tickets/${ticketId}/reopen-history`);
      return response;
    } catch (error) {
      console.error('Error fetching reopen history:', error);
      throw error;
    }
  }
};

export default ticketService;
