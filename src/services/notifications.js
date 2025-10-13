import { notification, message } from 'antd'
import { 
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  CloseCircleOutlined,
  WarningOutlined
} from '@ant-design/icons'

class NotificationService {
  constructor() {
    this.defaultConfig = {
      placement: 'topRight',
      duration: 4.5,
      maxCount: 5
    }
    
    // Configure default settings
    notification.config(this.defaultConfig)
    
    message.config({
      duration: 3,
      maxCount: 3,
      rtl: false
    })
  }

  // Success notifications
  success(config) {
    if (typeof config === 'string') {
      config = { message: config }
    }

    return notification.success({
      icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
      ...config
    })
  }

  // Error notifications
  error(config) {
    if (typeof config === 'string') {
      config = { message: config }
    }

    return notification.error({
      icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
      duration: 6, // Longer duration for errors
      ...config
    })
  }

  // Warning notifications
  warning(config) {
    if (typeof config === 'string') {
      config = { message: config }
    }

    return notification.warning({
      icon: <WarningOutlined style={{ color: '#faad14' }} />,
      ...config
    })
  }

  // Info notifications
  info(config) {
    if (typeof config === 'string') {
      config = { message: config }
    }

    return notification.info({
      icon: <InfoCircleOutlined style={{ color: '#1677ff' }} />,
      ...config
    })
  }

  // Custom notification
  open(config) {
    return notification.open(config)
  }

  // Close specific notification
  close(key) {
    notification.close(key)
  }

  // Close all notifications
  destroy() {
    notification.destroy()
  }

  // Message methods (for quick feedback)
  messageSuccess(content, duration, onClose) {
    return message.success(content, duration, onClose)
  }

  messageError(content, duration, onClose) {
    return message.error(content, duration, onClose)
  }

  messageWarning(content, duration, onClose) {
    return message.warning(content, duration, onClose)
  }

  messageInfo(content, duration, onClose) {
    return message.info(content, duration, onClose)
  }

  messageLoading(content, duration, onClose) {
    return message.loading(content, duration, onClose)
  }

  // Destroy all messages
  messageDestroy() {
    message.destroy()
  }

  // Specialized methods for common use cases
  
  // Authentication notifications
  loginSuccess(userName) {
    return this.success({
      message: 'Login Successful',
      description: `Welcome back, ${userName}!`,
      duration: 3
    })
  }

  loginError(error) {
    return this.error({
      message: 'Login Failed',
      description: error || 'Please check your credentials and try again.',
      duration: 5
    })
  }

  logoutSuccess() {
    return this.messageSuccess('You have been logged out successfully')
  }

  sessionExpired() {
    return this.warning({
      message: 'Session Expired',
      description: 'Your session has expired. Please log in again.',
      duration: 0, // Don't auto-close
      key: 'session-expired'
    })
  }

  // CRUD operation notifications
  createSuccess(itemType, itemName) {
    return this.success({
      message: `${itemType} Created`,
      description: itemName ? `${itemName} has been created successfully.` : `${itemType} has been created successfully.`
    })
  }

  updateSuccess(itemType, itemName) {
    return this.success({
      message: `${itemType} Updated`,
      description: itemName ? `${itemName} has been updated successfully.` : `${itemType} has been updated successfully.`
    })
  }

  deleteSuccess(itemType, itemName) {
    return this.success({
      message: `${itemType} Deleted`,
      description: itemName ? `${itemName} has been deleted successfully.` : `${itemType} has been deleted successfully.`
    })
  }

  operationError(operation, error) {
    return this.error({
      message: `${operation} Failed`,
      description: error || 'An unexpected error occurred. Please try again.'
    })
  }

  // Network and loading notifications
  networkError() {
    return this.error({
      message: 'Network Error',
      description: 'Unable to connect to the server. Please check your internet connection.',
      duration: 6,
      key: 'network-error'
    })
  }

  loadingError(resource) {
    return this.error({
      message: 'Loading Error',
      description: `Failed to load ${resource}. Please try refreshing the page.`
    })
  }

  // Permission notifications
  accessDenied() {
    return this.warning({
      message: 'Access Denied',
      description: 'You do not have permission to perform this action.',
      duration: 5
    })
  }

  // File upload notifications
  uploadProgress(fileName, percent) {
    return this.info({
      message: 'Uploading File',
      description: `${fileName} - ${percent}% complete`,
      key: `upload-${fileName}`,
      duration: 0
    })
  }

  uploadSuccess(fileName) {
    return this.success({
      message: 'Upload Complete',
      description: `${fileName} has been uploaded successfully.`,
      key: `upload-${fileName}`
    })
  }

  uploadError(fileName, error) {
    return this.error({
      message: 'Upload Failed',
      description: `Failed to upload ${fileName}. ${error}`,
      key: `upload-${fileName}`
    })
  }

  // Maintenance notifications
  maintenanceNotice(message, startTime, endTime) {
    return this.warning({
      message: 'Scheduled Maintenance',
      description: message || `System maintenance is scheduled from ${startTime} to ${endTime}. Some features may be unavailable.`,
      duration: 0,
      key: 'maintenance-notice'
    })
  }

  // Connection status notifications
  connectionLost() {
    return this.warning({
      message: 'Connection Lost',
      description: 'Connection to the server has been lost. Attempting to reconnect...',
      duration: 0,
      key: 'connection-lost'
    })
  }

  connectionRestored() {
    this.close('connection-lost')
    return this.success({
      message: 'Connection Restored',
      description: 'Connection to the server has been restored.',
      duration: 3
    })
  }

  // Bulk operation notifications
  bulkOperationStart(operation, count) {
    return this.info({
      message: `${operation} in Progress`,
      description: `Processing ${count} items...`,
      key: 'bulk-operation',
      duration: 0
    })
  }

  bulkOperationComplete(operation, successCount, failCount) {
    this.close('bulk-operation')
    
    if (failCount === 0) {
      return this.success({
        message: `${operation} Complete`,
        description: `Successfully processed ${successCount} items.`
      })
    } else {
      return this.warning({
        message: `${operation} Partially Complete`,
        description: `${successCount} items processed successfully, ${failCount} items failed.`
      })
    }
  }

  // Configuration methods
  config(config) {
    notification.config({ ...this.defaultConfig, ...config })
  }

  updateConfig(config) {
    this.defaultConfig = { ...this.defaultConfig, ...config }
    notification.config(this.defaultConfig)
  }

  // Get current configuration
  getConfig() {
    return { ...this.defaultConfig }
  }
}

// Create and export singleton instance
const notificationService = new NotificationService()

export default notificationService

// Export individual methods for convenience
export const {
  success,
  error,
  warning,
  info,
  open,
  close,
  destroy,
  messageSuccess,
  messageError,
  messageWarning,
  messageInfo,
  messageLoading,
  messageDestroy,
  loginSuccess,
  loginError,
  logoutSuccess,
  sessionExpired,
  createSuccess,
  updateSuccess,
  deleteSuccess,
  operationError,
  networkError,
  loadingError,
  accessDenied,
  uploadProgress,
  uploadSuccess,
  uploadError,
  maintenanceNotice,
  connectionLost,
  connectionRestored,
  bulkOperationStart,
  bulkOperationComplete,
  config,
  updateConfig,
  getConfig
} = notificationService