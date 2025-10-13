import api from './api'

// OAuth 2.0 Configuration
const OAUTH_CONFIG = {
  clientId: 'asset-management-web',
  scope: 'read write',
  // Note: client_secret should not be stored in frontend for security
  // Use public client or PKCE flow in production
}

const authService = {
  // OAuth 2.0 Login (generic)
  login: (credentials) => {
    console.log('OAuth General login:', { credentials: { ...credentials, password: '[HIDDEN]' } })

    return api.post('/auth/oauth-login', {
      ...credentials,
      client_id: OAUTH_CONFIG.clientId,
      scope: OAUTH_CONFIG.scope
    })
  },

  // Role-based login endpoints
  roleBasedLogin: (credentials, role) => {
    const endpoint = role === 'employee'
      ? '/auth/oauth-login'
      : `/auth/oauth-${role.replace('_', '-')}-login`;

    console.log('OAuth Role-based login:', { role, endpoint, credentials: { ...credentials, password: '[HIDDEN]' } })

    return api.post(endpoint, {
      ...credentials,
      client_id: OAUTH_CONFIG.clientId,
      scope: OAUTH_CONFIG.scope
    })
  },

  // Admin registration
  registerAdmin: (registrationData) => {
    return api.post('/auth/register/admin', registrationData)
  },

  // Superadmin registration
  registerSuperAdmin: (registrationData) => {
    return api.post('/auth/register/superadmin', registrationData)
  },

  // Logout user
  logout: () => {
    return api.post('/auth/oauth-logout')
  },

  // Refresh access token (now handled automatically via cookies)
  refreshToken: () => {
    return api.post('/auth/oauth-refresh', {
      client_id: OAUTH_CONFIG.clientId
    })
  },

  // Get user profile
  getProfile: () => {
    return api.get('/auth/profile')
  },

  // Update user profile
  updateProfile: (profileData) => {
    return api.put('/auth/profile', profileData)
  },

  // Change password
  changePassword: (passwordData) => {
    return api.put('/auth/change-password', passwordData)
  },

  // Forgot password (if implemented)
  forgotPassword: (email) => {
    return api.post('/auth/forgot-password', { email })
  },

  // Reset password (if implemented)
  resetPassword: (data) => {
    return api.post('/auth/reset-password', data)
  },

  // Verify email (if implemented)
  verifyEmail: (token) => {
    return api.post('/auth/verify-email', { token })
  },

  // Resend verification email (if implemented)
  resendVerification: (email) => {
    return api.post('/auth/resend-verification', { email })
  },

  // Check if user is authenticated (server-side validation via cookies)
  isAuthenticated: async () => {
    try {
      const response = await api.get('/auth/profile')
      return !!response.data
    } catch (error) {
      return false
    }
  },

  // Authentication tokens are now HttpOnly and cannot be accessed via JavaScript
  // These methods are deprecated and will always return null for security
  getAccessToken: () => {
    console.warn('⚠️ getAccessToken() is deprecated. Auth tokens are now HttpOnly and handled automatically.')
    return null
  },

  getRefreshToken: () => {
    console.warn('⚠️ getRefreshToken() is deprecated. Auth tokens are now HttpOnly and handled automatically.')
    return null
  },

  clearTokens: () => null,
  setTokens: () => null,

  // Store OAuth response (tokens are automatically stored as HttpOnly cookies)
  storeOAuthResponse: (responseData) => {
    return responseData
  },

  // Get user role from profile (server-side validation)
  getUserRole: async () => {
    try {
      const response = await api.get('/auth/profile')
      return response.data?.data?.role || null
    } catch (error) {
      console.error('Error getting user role:', error)
      return null
    }
  },

  // Get user ID from profile (server-side validation)
  getUserId: async () => {
    try {
      const response = await api.get('/auth/profile')
      return response.data?.data?.id || null
    } catch (error) {
      console.error('Error getting user ID:', error)
      return null
    }
  },

  // Check if token is expired (server-side validation)
  isTokenExpired: async () => {
    try {
      await api.get('/auth/profile')
      return false // If profile call succeeds, token is valid
    } catch (error) {
      return true // If profile call fails, token is likely expired
    }
  },

  // Token expiration is now handled server-side
  getTokenExpiration: () => {
    console.warn('Token expiration is now handled server-side via HttpOnly cookies')
    return null
  },

  // Check if user has specific role (server-side validation)
  hasRole: async (role) => {
    const userRole = await authService.getUserRole()
    return userRole === role
  },

  // Check if user has any of the specified roles (server-side validation)
  hasAnyRole: async (roles) => {
    const userRole = await authService.getUserRole()
    return roles.includes(userRole)
  },

  // Role hierarchy for permission checking
  roleHierarchy: {
    'superadmin': 100,
    'admin': 90,
    'department_head': 70,
    'coordinator': 60,
    'department_coordinator': 50,
    'engineer': 30,
    'employee': 10
  },

  // Check if user has minimum role level (server-side validation)
  hasMinimumRole: async (minimumRole) => {
    const userRole = await authService.getUserRole()
    if (!userRole) return false

    const userLevel = authService.roleHierarchy[userRole] || 0
    const requiredLevel = authService.roleHierarchy[minimumRole] || 0

    return userLevel >= requiredLevel
  },

  // Token refresh is now handled automatically by server-side cookies
  setupTokenRefresh: () => {
    console.log('Token refresh is now handled automatically by server-side HttpOnly cookies')
    // Server handles token refresh automatically via cookie expiration and refresh token
  },

  // OAuth 2.0 specific methods
  getOAuthConfig: () => OAUTH_CONFIG,

  // Introspect current token (server-side validation)
  introspectToken: async () => {
    try {
      const response = await api.post('/oauth/introspect')
      return response.data
    } catch (error) {
      console.error('Token introspection failed:', error)
      return null
    }
  },

  // Get OAuth client info
  getClientInfo: async () => {
    try {
      const response = await api.get(`/oauth/clients/${OAUTH_CONFIG.clientId}`)
      return response.data
    } catch (error) {
      console.error('Error getting client info:', error)
      return null
    }
  },

  // Security validation - verifies HttpOnly cookie implementation
  testSecurity: () => {
    console.log('🔒 Testing authentication security...')

    // Check if any auth tokens are accessible via JavaScript (they shouldn't be)
    const allCookies = document.cookie
    const hasAccessibleAuthTokens = allCookies.includes('access_token=') || allCookies.includes('refresh_token=')

    console.log('📋 Cookies accessible via JavaScript:')
    console.log(allCookies || 'No cookies accessible via JavaScript')

    if (!hasAccessibleAuthTokens) {
      console.log('✅ SUCCESS: Authentication tokens are properly secured with HttpOnly cookies!')
      console.log('✅ Tokens cannot be accessed by JavaScript (preventing XSS attacks)')
      console.log('✅ Tokens are sent automatically on same-origin requests')
    } else {
      console.error('🚨 SECURITY ISSUE: Authentication tokens are accessible via JavaScript!')
      console.error('🚨 This creates a potential XSS vulnerability')
    }

    return {
      secure: !hasAccessibleAuthTokens,
      accessibleCookies: allCookies,
      hasHttpOnlyTokens: !hasAccessibleAuthTokens,
      message: hasAccessibleAuthTokens
        ? 'Authentication tokens are insecure - accessible via JavaScript'
        : 'Authentication tokens are secure - HttpOnly implementation working correctly'
    }
  }
}

export default authService