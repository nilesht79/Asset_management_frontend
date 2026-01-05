import axios from 'axios'
import toast from 'react-hot-toast'
import { redirectToRoleBasedLogin } from '../utils/redirectUtils'

// Rate limiting for refresh token attempts
let refreshTokenAttempts = 0
let lastRefreshAttempt = 0
let isRefreshing = false // Global flag to prevent multiple simultaneous refresh attempts
let lastRateLimitTime = 0 // Track rate limit hits
const REFRESH_COOLDOWN = 5000 // 5 seconds between refresh attempts
const RATE_LIMIT_COOLDOWN = 10000 // 10 seconds after rate limit
const MAX_REFRESH_ATTEMPTS = 3

// Queue for requests waiting for refresh to complete
let refreshQueue = []

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  timeout: 30000, // 30 seconds
  withCredentials: true, // Enable sending cookies with requests
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for debugging (cookies are sent automatically)
api.interceptors.request.use(
  (config) => {
    // Cookies are automatically sent with withCredentials: true
    // No need to manually add Authorization header

    // Add request timestamp for debugging
    config.metadata = { startTime: new Date() }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle token refresh and errors
api.interceptors.response.use(
  (response) => {
    // Log request duration in development
    if (import.meta.env.NODE_ENV === 'development') {
      const duration = new Date() - response.config.metadata.startTime
      console.log(`API Request: ${response.config.method?.toUpperCase()} ${response.config.url} - ${duration}ms`)
    }

    return response
  },
  async (error) => {
    const originalRequest = error.config

    // Log API errors in development
    if (import.meta.env.NODE_ENV === 'development') {
      console.log(`API Error: ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url} - Status: ${error.response?.status}`)
    }

    // Handle network errors
    if (!error.response) {
      toast.error('Network error. Please check your internet connection.')
      return Promise.reject(error)
    }

    const { status, data } = error.response

    // Handle 429 Too Many Requests - don't retry, just fail
    if (status === 429) {
      lastRateLimitTime = Date.now()
      console.log('Rate limited - backing off for', RATE_LIMIT_COOLDOWN / 1000, 'seconds')
      toast.error('Too many requests. Please wait before trying again.')
      return Promise.reject(error)
    }

    // Handle 401 Unauthorized for OAuth 2.0
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      // Don't try to refresh for auth endpoints or refresh endpoint itself
      const isAuthEndpoint = originalRequest.url.includes('/auth/profile') ||
                             originalRequest.url.includes('/auth/oauth-') ||
                             originalRequest.url.includes('/oauth/') ||
                             originalRequest.url.endsWith('/oauth-refresh')

      if (isAuthEndpoint) {
        console.log('401 on auth endpoint - not retrying, letting it fail gracefully')
        return Promise.reject(error)
      }

      // Rate limiting for refresh token attempts
      const now = Date.now()
      if (now - lastRefreshAttempt < REFRESH_COOLDOWN) {
        console.log('Refresh token rate limited - too many attempts')
        redirectToRoleBasedLogin()
        return Promise.reject(error)
      }

      if (refreshTokenAttempts >= MAX_REFRESH_ATTEMPTS) {
        console.log('Max refresh token attempts exceeded')
        refreshTokenAttempts = 0
        isRefreshing = false
        redirectToRoleBasedLogin()
        return Promise.reject(error)
      }

      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push({ resolve, reject, originalRequest })
        })
      }

      // Try to refresh token using OAuth 2.0 (cookies-based)
      try {
        isRefreshing = true
        lastRefreshAttempt = now
        refreshTokenAttempts++

        const refreshInstance = axios.create({
          baseURL: '/api/v1',
          withCredentials: true
        })

        const refreshResponse = await refreshInstance.post('/auth/oauth-refresh', {
          client_id: 'asset-management-web'
        })

        // Only retry if refresh was successful
        if (refreshResponse.status === 200) {
          refreshTokenAttempts = 0 // Reset on success
          isRefreshing = false

          // Process queued requests
          const queuedRequests = [...refreshQueue]
          refreshQueue = []

          // Retry all queued requests
          queuedRequests.forEach(({ resolve, originalRequest: queuedRequest }) => {
            resolve(api(queuedRequest))
          })

          // Retry original request (cookies are automatically updated)
          return api(originalRequest)
        } else {
          throw new Error('Refresh token failed')
        }

      } catch (refreshError) {
        isRefreshing = false
        console.error('Token refresh failed:', refreshError.response?.status)

        // Reject all queued requests
        const queuedRequests = [...refreshQueue]
        refreshQueue = []
        queuedRequests.forEach(({ reject }) => {
          reject(refreshError)
        })

        // If we've exceeded attempts, redirect immediately
        if (refreshTokenAttempts >= MAX_REFRESH_ATTEMPTS) {
          refreshTokenAttempts = 0
          redirectToRoleBasedLogin()
        }
        return Promise.reject(error)
      }
    }
    
    // Handle 410 Gone for deprecated JWT endpoints
    if (status === 410) {
      console.warn('Deprecated endpoint accessed:', originalRequest.url)
      toast.error('This authentication method is no longer supported. Please use OAuth 2.0.')
      return Promise.reject(error)
    }

    // Handle specific error status codes
    switch (status) {
      case 400:
        toast.error(data?.message || 'Bad request. Please check your input.')
        break
      
      case 403:
        toast.error(data?.message || 'You do not have permission to perform this action.')
        break
      
      case 404:
        toast.error(data?.message || 'The requested resource was not found.')
        break
      
      case 409:
        toast.error(data?.message || 'A conflict occurred. The resource may already exist.')
        break
      
      case 422:
        // Validation errors - don't show toast, let components handle
        if (import.meta.env.NODE_ENV === 'development') {
          console.warn('Validation errors:', data?.errors)
        }
        break
      
      case 429:
        toast.error(data?.message || 'Too many requests. Please try again later.')
        break
      
      case 500:
        toast.error('Internal server error. Please try again later.')
        break
      
      case 503:
        toast.error('Service temporarily unavailable. Please try again later.')
        break
      
      default:
        if (status >= 500) {
          toast.error('Server error occurred. Please try again later.')
        } else if (status >= 400) {
          toast.error(data?.message || 'An error occurred. Please try again.')
        }
    }
    
    return Promise.reject(error)
  }
)

// API utility functions
export const apiUtils = {
  // Upload file with progress tracking
  uploadFile: (url, file, onProgress, options = {}) => {
    const formData = new FormData()
    formData.append('file', file)

    // Add additional fields if provided
    if (options.fields) {
      Object.entries(options.fields).forEach(([key, value]) => {
        formData.append(key, value)
      })
    }

    return api.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: options.timeout || 300000, // 5 minutes default for file uploads
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          )
          onProgress(percentCompleted)
        } else if (onProgress) {
          // If total is unknown, show indeterminate progress
          onProgress(-1)
        }
      },
      ...options.config,
    })
  },
  
  // Download file
  downloadFile: async (url, filename, options = {}) => {
    try {
      const response = await api.get(url, {
        responseType: 'blob',
        ...options,
      })
      
      // Create blob link to download
      const blob = new Blob([response.data])
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(downloadUrl)
      
      return response
    } catch (error) {
      toast.error('Failed to download file')
      throw error
    }
  },
  
  // Cancel request
  createCancelToken: () => axios.CancelToken.source(),
  
  // Check if error is due to cancelled request
  isCancelledRequest: (error) => axios.isCancel(error),
  
  // Batch requests
  batchRequests: (requests) => Promise.allSettled(requests),
  
  // Retry failed request
  retryRequest: (originalRequest, maxRetries = 3, delay = 1000) => {
    return new Promise((resolve, reject) => {
      let retries = 0
      
      const attemptRequest = () => {
        api(originalRequest)
          .then(resolve)
          .catch((error) => {
            retries++
            if (retries < maxRetries && error.response?.status >= 500) {
              setTimeout(attemptRequest, delay * retries)
            } else {
              reject(error)
            }
          })
      }
      
      attemptRequest()
    })
  },
  
  // Build query string from object
  buildQueryString: (params) => {
    const query = new URLSearchParams()
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(item => query.append(key, item))
        } else {
          query.append(key, value)
        }
      }
    })
    
    return query.toString()
  },
  
  // Format API error for display
  formatError: (error) => {
    if (!error.response) {
      return { message: 'Network error occurred' }
    }
    
    const { status, data } = error.response
    
    return {
      status,
      message: data?.message || 'An error occurred',
      errors: data?.errors || null,
      code: data?.code || null,
    }
  }
}

export default api