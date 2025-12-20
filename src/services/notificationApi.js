/**
 * IN-APP NOTIFICATION API SERVICE
 * API service for managing user notifications
 */

import apiClient from '../utils/apiClient';

const notificationApiService = {
  /**
   * Get all notifications for current user with filters and pagination
   * @param {Object} params - Query parameters (page, limit, is_read, notification_type, priority)
   * @returns {Promise} Response with notifications data
   */
  getNotifications: async (params = {}) => {
    try {
      const response = await apiClient.get('/notifications', { params });
      return response;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  },

  /**
   * Get unread notifications count
   * @returns {Promise} Response with unread_count
   */
  getUnreadCount: async () => {
    try {
      const response = await apiClient.get('/notifications/unread-count');
      return response;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      throw error;
    }
  },

  /**
   * Get single notification by ID
   * @param {string} notificationId - Notification ID
   * @returns {Promise} Response with notification data
   */
  getNotificationById: async (notificationId) => {
    try {
      const response = await apiClient.get(`/notifications/${notificationId}`);
      return response;
    } catch (error) {
      console.error('Error fetching notification:', error);
      throw error;
    }
  },

  /**
   * Mark a notification as read
   * @param {string} notificationId - Notification ID
   * @returns {Promise} Response confirming mark as read
   */
  markAsRead: async (notificationId) => {
    try {
      const response = await apiClient.put(`/notifications/${notificationId}/read`);
      return response;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  /**
   * Mark all notifications as read for current user
   * @returns {Promise} Response with count of marked notifications
   */
  markAllAsRead: async () => {
    try {
      const response = await apiClient.put('/notifications/mark-all-read');
      return response;
    } catch (error) {
      console.error('Error marking all as read:', error);
      throw error;
    }
  },

  /**
   * Delete a notification
   * @param {string} notificationId - Notification ID
   * @returns {Promise} Response confirming deletion
   */
  deleteNotification: async (notificationId) => {
    try {
      const response = await apiClient.delete(`/notifications/${notificationId}`);
      return response;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  },

  /**
   * Fetch notifications by priority
   * @param {string} priority - Priority level (low, medium, high, critical)
   * @param {Object} params - Additional query parameters
   * @returns {Promise} Response with filtered notifications
   */
  getNotificationsByPriority: async (priority, params = {}) => {
    try {
      const response = await apiClient.get('/notifications', {
        params: { ...params, priority }
      });
      return response;
    } catch (error) {
      console.error('Error fetching notifications by priority:', error);
      throw error;
    }
  },

  /**
   * Fetch notifications by type
   * @param {string} notificationType - Type of notification (sla_warning, sla_breached, etc.)
   * @param {Object} params - Additional query parameters
   * @returns {Promise} Response with filtered notifications
   */
  getNotificationsByType: async (notificationType, params = {}) => {
    try {
      const response = await apiClient.get('/notifications', {
        params: { ...params, notification_type: notificationType }
      });
      return response;
    } catch (error) {
      console.error('Error fetching notifications by type:', error);
      throw error;
    }
  },

  /**
   * Fetch only unread notifications
   * @param {Object} params - Additional query parameters
   * @returns {Promise} Response with unread notifications
   */
  getUnreadNotifications: async (params = {}) => {
    try {
      const response = await apiClient.get('/notifications', {
        params: { ...params, is_read: false }
      });
      return response;
    } catch (error) {
      console.error('Error fetching unread notifications:', error);
      throw error;
    }
  }
};

export default notificationApiService;
