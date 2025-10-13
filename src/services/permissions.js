/**
 * PERMISSION MANAGEMENT SERVICE
 * Frontend API client for the complete permission system
 */

import api, { apiUtils } from './api';

const permissionService = {
  // =====================================================
  // PERMISSION CATEGORIES
  // =====================================================

  /**
   * Get all permission categories with their permissions
   */
  getCategories: () => {
    return api.get('/admin/permissions/categories');
  },

  /**
   * Get all permissions (flat list)
   */
  getAllPermissions: () => {
    return api.get('/admin/permissions/all');
  },

  // =====================================================
  // ROLE TEMPLATES
  // =====================================================

  /**
   * Get all role templates with permissions and statistics
   */
  getRoles: () => {
    return api.get('/admin/permissions/roles');
  },

  /**
   * Get specific role template details
   * @param {string} roleName - Role name (e.g., 'admin', 'coordinator')
   */
  getRole: (roleName) => {
    return api.get(`/admin/permissions/roles/${roleName}`);
  },

  /**
   * Update role template permissions (SuperAdmin only)
   * @param {string} roleName - Role name
   * @param {Array<string>} permissions - Array of permission keys
   * @param {string} reason - Optional reason for change
   */
  updateRolePermissions: (roleName, permissions, reason = null) => {
    return api.put(`/admin/permissions/roles/${roleName}`, {
      permissions,
      reason
    });
  },

  // =====================================================
  // USER PERMISSIONS
  // =====================================================

  /**
   * Get user's effective permissions (role + custom)
   * @param {string} userId - User UUID
   */
  getUserPermissions: (userId) => {
    return api.get(`/admin/permissions/users/${userId}`);
  },

  /**
   * Grant custom permission to user
   * @param {string} userId - User UUID
   * @param {string} permissionKey - Permission key (e.g., 'users.create')
   * @param {string} reason - Reason for granting
   * @param {string} expiresAt - Optional expiration date (ISO 8601)
   */
  grantPermission: (userId, permissionKey, reason, expiresAt = null) => {
    return api.post(`/admin/permissions/users/${userId}/grant`, {
      permissionKey,
      reason,
      expiresAt
    });
  },

  /**
   * Revoke custom permission from user
   * @param {string} userId - User UUID
   * @param {string} permissionKey - Permission key
   * @param {string} reason - Reason for revoking
   */
  revokePermission: (userId, permissionKey, reason) => {
    return api.post(`/admin/permissions/users/${userId}/revoke`, {
      permissionKey,
      reason
    });
  },

  /**
   * Remove all custom permissions from user (reset to role defaults)
   * @param {string} userId - User UUID
   */
  resetUserPermissions: (userId) => {
    return api.delete(`/admin/permissions/users/${userId}/custom`);
  },

  // =====================================================
  // AUDIT & ANALYTICS
  // =====================================================

  /**
   * Get permission audit logs
   * @param {Object} filters - Filter options
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   */
  getAuditLogs: (filters = {}, page = 1, limit = 50) => {
    const queryString = apiUtils.buildQueryString({
      ...filters,
      page,
      limit
    });
    return api.get(`/admin/permissions/audit?${queryString}`);
  },

  /**
   * Get role distribution analytics
   */
  getRoleDistribution: () => {
    return api.get('/admin/permissions/analytics/role-distribution');
  },

  /**
   * Clear permission cache
   * @param {string} userId - Optional user ID to clear specific user cache
   * @param {string} roleName - Optional role name to clear role cache
   */
  clearCache: (userId = null, roleName = null) => {
    return api.post('/admin/permissions/cache/clear', {
      userId,
      roleName
    });
  },

  // =====================================================
  // BULK OPERATIONS
  // =====================================================

  /**
   * Grant multiple permissions to a user at once
   * @param {string} userId - User UUID
   * @param {Array<Object>} permissions - Array of {permissionKey, reason, expiresAt}
   */
  bulkGrantPermissions: async (userId, permissions) => {
    const results = [];
    for (const perm of permissions) {
      try {
        const result = await permissionService.grantPermission(
          userId,
          perm.permissionKey,
          perm.reason,
          perm.expiresAt
        );
        results.push({ success: true, permission: perm.permissionKey, result });
      } catch (error) {
        results.push({ success: false, permission: perm.permissionKey, error: error.message });
      }
    }
    return results;
  },

  /**
   * Revoke multiple permissions from a user at once
   * @param {string} userId - User UUID
   * @param {Array<Object>} permissions - Array of {permissionKey, reason}
   */
  bulkRevokePermissions: async (userId, permissions) => {
    const results = [];
    for (const perm of permissions) {
      try {
        const result = await permissionService.revokePermission(
          userId,
          perm.permissionKey,
          perm.reason
        );
        results.push({ success: true, permission: perm.permissionKey, result });
      } catch (error) {
        results.push({ success: false, permission: perm.permissionKey, error: error.message });
      }
    }
    return results;
  },

  // =====================================================
  // VALIDATION & UTILITIES
  // =====================================================

  /**
   * Check if permission key is valid
   * @param {string} permissionKey - Permission key to validate
   * @param {Array} allPermissions - Array of all permission objects (from getAllPermissions)
   */
  isValidPermission: (permissionKey, allPermissions) => {
    return allPermissions.some(p => p.key === permissionKey);
  },

  /**
   * Get permission display name
   * @param {string} permissionKey - Permission key
   * @param {Array} allPermissions - Array of all permission objects
   */
  getPermissionName: (permissionKey, allPermissions) => {
    const permission = allPermissions.find(p => p.key === permissionKey);
    return permission ? permission.name : permissionKey;
  },

  /**
   * Filter permissions by category
   * @param {string} categoryKey - Category key (e.g., 'user_management')
   * @param {Array} allPermissions - Array of all permission objects
   */
  filterByCategory: (categoryKey, allPermissions) => {
    return allPermissions.filter(p => p.category.key === categoryKey);
  },

  /**
   * Search permissions
   * @param {string} searchTerm - Search term
   * @param {Array} allPermissions - Array of all permission objects
   */
  searchPermissions: (searchTerm, allPermissions) => {
    const term = searchTerm.toLowerCase();
    return allPermissions.filter(p =>
      p.key.toLowerCase().includes(term) ||
      p.name.toLowerCase().includes(term) ||
      (p.description && p.description.toLowerCase().includes(term))
    );
  },

  /**
   * Compare two permission sets and get differences
   * @param {Array<string>} currentPermissions - Current permission keys
   * @param {Array<string>} newPermissions - New permission keys
   * @returns {Object} - {added: Array, removed: Array, unchanged: Array}
   */
  comparePermissions: (currentPermissions, newPermissions) => {
    const current = new Set(currentPermissions);
    const updated = new Set(newPermissions);

    const added = [...updated].filter(p => !current.has(p));
    const removed = [...current].filter(p => !updated.has(p));
    const unchanged = [...current].filter(p => updated.has(p));

    return { added, removed, unchanged };
  },

  /**
   * Export permissions to JSON
   * @param {Object} data - Data to export (roles, users, etc.)
   * @param {string} filename - Optional filename
   */
  exportToJSON: (data, filename = 'permissions-export.json') => {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }
};

export default permissionService;
