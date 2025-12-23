/**
 * Backup Service
 * API service for database backup and disaster recovery operations
 */

import api from './api';

const BASE_URL = '/backups';

const backupService = {
  /**
   * Get backup status and health information
   */
  getStatus: () => {
    return api.get(`${BASE_URL}/status`);
  },

  /**
   * Get backup history with optional filters
   * @param {Object} params - Filter parameters (database, type, startDate, limit)
   */
  getHistory: (params = {}) => {
    return api.get(`${BASE_URL}/history`, { params });
  },

  /**
   * Get current backup configuration
   */
  getConfig: () => {
    return api.get(`${BASE_URL}/config`);
  },

  /**
   * Get list of available backup files
   * @param {Object} params - Filter parameters (database, type)
   */
  getFiles: (params = {}) => {
    return api.get(`${BASE_URL}/files`, { params });
  },

  /**
   * Trigger a full backup
   * @param {string} database - Optional specific database to backup
   */
  triggerFullBackup: (database = null) => {
    return api.post(`${BASE_URL}/full`, { database });
  },

  /**
   * Trigger a differential backup
   * @param {string} database - Optional specific database to backup
   */
  triggerDifferentialBackup: (database = null) => {
    return api.post(`${BASE_URL}/differential`, { database });
  },

  /**
   * Trigger a transaction log backup
   * @param {string} database - Optional specific database to backup
   */
  triggerTransactionLogBackup: (database = null) => {
    return api.post(`${BASE_URL}/transaction-log`, { database });
  },

  /**
   * Verify a backup file integrity
   * @param {string} database - Database name
   * @param {string} backupPath - Path to backup file
   */
  verifyBackup: (database, backupPath) => {
    return api.post(`${BASE_URL}/verify`, { database, backupPath });
  },

  /**
   * Trigger cleanup of old backup files
   */
  triggerCleanup: () => {
    return api.post(`${BASE_URL}/cleanup`);
  },

  /**
   * Restore database from backup (requires confirmation)
   * @param {string} database - Database name
   * @param {string} backupPath - Path to backup file
   */
  restoreDatabase: (database, backupPath) => {
    return api.post(`${BASE_URL}/restore`, {
      database,
      backupPath,
      confirmRestore: 'I_UNDERSTAND_THIS_WILL_OVERWRITE_DATA'
    });
  },

  // Helper functions
  getHealthStatusColor: (status) => {
    const colors = {
      healthy: 'green',
      warning: 'orange',
      critical: 'red',
      error: 'red'
    };
    return colors[status] || 'default';
  },

  getBackupTypeColor: (type) => {
    const colors = {
      Full: 'blue',
      full: 'blue',
      Differential: 'cyan',
      differential: 'cyan',
      'Transaction Log': 'purple',
      transactionLog: 'purple'
    };
    return colors[type] || 'default';
  },

  getStatusColor: (status) => {
    return status === 'success' ? 'green' : 'red';
  },

  formatBytes: (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  formatDuration: (ms) => {
    if (!ms) return '-';
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  },

  parseCronExpression: (cron) => {
    const cronMap = {
      '0 2 * * *': 'Daily at 2:00 AM',
      '0 6,12,18,0 * * *': 'Every 6 hours (6AM, 12PM, 6PM, 12AM)',
      '*/30 * * * *': 'Every 30 minutes',
      '0 3 * * *': 'Daily at 3:00 AM',
      '0 5 * * 0': 'Weekly on Sunday at 5:00 AM'
    };
    return cronMap[cron] || cron;
  }
};

export default backupService;
