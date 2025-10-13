import notificationService from './notifications'
import storageService from './storage'

class WebSocketService {
  constructor() {
    this.socket = null
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.reconnectInterval = 1000
    this.heartbeatInterval = 30000
    this.heartbeatTimer = null
    this.isConnecting = false
    this.listeners = new Map()
    this.messageQueue = []
    this.config = {
      url: process.env.REACT_APP_WS_URL || 'ws://localhost:3001',
      protocols: [],
      reconnectOnClose: true,
      heartbeat: true
    }
  }

  // Initialize connection
  connect(token = null) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected')
      return Promise.resolve()
    }

    if (this.isConnecting) {
      console.log('WebSocket connection already in progress')
      return Promise.resolve()
    }

    return new Promise((resolve, reject) => {
      try {
        this.isConnecting = true
        const authToken = token || storageService.getToken()
        const wsUrl = `${this.config.url}${authToken ? `?token=${authToken}` : ''}`
        
        console.log('Connecting to WebSocket:', wsUrl.replace(/token=[^&]*/, 'token=***'))
        
        this.socket = new WebSocket(wsUrl, this.config.protocols)

        this.socket.onopen = () => {
          console.log('WebSocket connected')
          this.isConnecting = false
          this.reconnectAttempts = 0
          
          // Send queued messages
          this.flushMessageQueue()
          
          // Start heartbeat
          if (this.config.heartbeat) {
            this.startHeartbeat()
          }
          
          // Emit connection event
          this.emit('connected')
          
          notificationService.connectionRestored()
          resolve()
        }

        this.socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            this.handleMessage(data)
          } catch (error) {
            console.error('Error parsing WebSocket message:', error)
          }
        }

        this.socket.onclose = (event) => {
          console.log('WebSocket disconnected:', event.code, event.reason)
          this.isConnecting = false
          this.stopHeartbeat()
          
          this.emit('disconnected', { code: event.code, reason: event.reason })
          
          if (this.config.reconnectOnClose && event.code !== 1000) {
            this.handleReconnect()
          }
        }

        this.socket.onerror = (error) => {
          console.error('WebSocket error:', error)
          this.isConnecting = false
          this.emit('error', error)
          
          if (this.reconnectAttempts === 0) {
            notificationService.connectionLost()
          }
          
          reject(error)
        }

      } catch (error) {
        this.isConnecting = false
        console.error('Error creating WebSocket connection:', error)
        reject(error)
      }
    })
  }

  // Disconnect
  disconnect() {
    this.config.reconnectOnClose = false
    this.stopHeartbeat()
    
    if (this.socket) {
      this.socket.close(1000, 'Client disconnect')
      this.socket = null
    }
    
    this.clearMessageQueue()
    this.emit('disconnected', { code: 1000, reason: 'Client disconnect' })
  }

  // Send message
  send(type, data = {}) {
    const message = {
      type,
      data,
      timestamp: new Date().toISOString(),
      id: this.generateMessageId()
    }

    if (this.isConnected()) {
      try {
        this.socket.send(JSON.stringify(message))
        return true
      } catch (error) {
        console.error('Error sending WebSocket message:', error)
        this.queueMessage(message)
        return false
      }
    } else {
      this.queueMessage(message)
      return false
    }
  }

  // Queue message for later sending
  queueMessage(message) {
    this.messageQueue.push(message)
    
    // Limit queue size
    if (this.messageQueue.length > 100) {
      this.messageQueue.shift()
    }
  }

  // Flush message queue
  flushMessageQueue() {
    while (this.messageQueue.length > 0 && this.isConnected()) {
      const message = this.messageQueue.shift()
      try {
        this.socket.send(JSON.stringify(message))
      } catch (error) {
        console.error('Error sending queued message:', error)
        this.messageQueue.unshift(message)
        break
      }
    }
  }

  // Clear message queue
  clearMessageQueue() {
    this.messageQueue = []
  }

  // Handle incoming messages
  handleMessage(message) {
    const { type, data } = message

    switch (type) {
      case 'ping':
        this.send('pong', { timestamp: new Date().toISOString() })
        break
        
      case 'pong':
        // Heartbeat response received
        break
        
      case 'notification':
        this.handleNotification(data)
        break
        
      case 'user_update':
        this.handleUserUpdate(data)
        break
        
      case 'asset_update':
        this.handleAssetUpdate(data)
        break
        
      case 'ticket_update':
        this.handleTicketUpdate(data)
        break
        
      case 'system_message':
        this.handleSystemMessage(data)
        break
        
      default:
        console.log('Unknown WebSocket message type:', type)
    }

    // Emit message event
    this.emit('message', message)
    this.emit(type, data)
  }

  // Handle notifications
  handleNotification(data) {
    const { level, title, message, duration, actions } = data
    
    const config = {
      message: title,
      description: message,
      duration: duration || 4.5
    }

    if (actions && actions.length > 0) {
      config.btn = actions.map(action => ({
        ...action,
        onClick: () => this.handleNotificationAction(action)
      }))
    }

    switch (level) {
      case 'success':
        notificationService.success(config)
        break
      case 'error':
        notificationService.error(config)
        break
      case 'warning':
        notificationService.warning(config)
        break
      case 'info':
      default:
        notificationService.info(config)
        break
    }
  }

  // Handle notification actions
  handleNotificationAction(action) {
    this.send('notification_action', {
      actionId: action.id,
      timestamp: new Date().toISOString()
    })
    
    if (action.url) {
      window.location.href = action.url
    }
  }

  // Handle user updates
  handleUserUpdate(data) {
    this.emit('user_update', data)
  }

  // Handle asset updates
  handleAssetUpdate(data) {
    this.emit('asset_update', data)
  }

  // Handle ticket updates
  handleTicketUpdate(data) {
    this.emit('ticket_update', data)
  }

  // Handle system messages
  handleSystemMessage(data) {
    const { messageType, content, persistent } = data
    
    switch (messageType) {
      case 'maintenance':
        notificationService.maintenanceNotice(content.message, content.startTime, content.endTime)
        break
      case 'announcement':
        notificationService.info({
          message: 'System Announcement',
          description: content,
          duration: persistent ? 0 : 8
        })
        break
      default:
        notificationService.info(content)
    }
  }

  // Reconnection logic
  handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max reconnection attempts reached')
      notificationService.error({
        message: 'Connection Failed',
        description: 'Unable to reconnect to the server. Please refresh the page.',
        duration: 0
      })
      return
    }

    this.reconnectAttempts++
    const delay = this.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1)
    
    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
    
    setTimeout(() => {
      if (!this.isConnected() && !this.isConnecting) {
        this.connect().catch(() => {
          // Error already handled in connect method
        })
      }
    }, delay)
  }

  // Heartbeat functionality
  startHeartbeat() {
    this.stopHeartbeat()
    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected()) {
        this.send('ping', { timestamp: new Date().toISOString() })
      }
    }, this.heartbeatInterval)
  }

  stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  // Event listener management
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event).add(callback)
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback)
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error('Error in WebSocket event callback:', error)
        }
      })
    }
  }

  // Utility methods
  isConnected() {
    return this.socket && this.socket.readyState === WebSocket.OPEN
  }

  isConnecting() {
    return this.isConnecting || (this.socket && this.socket.readyState === WebSocket.CONNECTING)
  }

  getState() {
    if (!this.socket) return 'CLOSED'
    
    switch (this.socket.readyState) {
      case WebSocket.CONNECTING:
        return 'CONNECTING'
      case WebSocket.OPEN:
        return 'OPEN'
      case WebSocket.CLOSING:
        return 'CLOSING'
      case WebSocket.CLOSED:
        return 'CLOSED'
      default:
        return 'UNKNOWN'
    }
  }

  generateMessageId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  // Configuration
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig }
  }

  getConfig() {
    return { ...this.config }
  }

  // Subscribe to specific data types
  subscribeToAssets() {
    this.send('subscribe', { type: 'assets' })
  }

  subscribeToTickets() {
    this.send('subscribe', { type: 'tickets' })
  }

  subscribeToUsers() {
    this.send('subscribe', { type: 'users' })
  }

  subscribeToNotifications() {
    this.send('subscribe', { type: 'notifications' })
  }

  unsubscribeFromAssets() {
    this.send('unsubscribe', { type: 'assets' })
  }

  unsubscribeFromTickets() {
    this.send('unsubscribe', { type: 'tickets' })
  }

  unsubscribeFromUsers() {
    this.send('unsubscribe', { type: 'users' })
  }

  unsubscribeFromNotifications() {
    this.send('unsubscribe', { type: 'notifications' })
  }
}

// Create and export singleton instance
const webSocketService = new WebSocketService()

export default webSocketService