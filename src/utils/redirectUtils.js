// Utility functions for role-based redirects

/**
 * Get the appropriate login route based on user role
 * @param {string} userRole - The user's role
 * @returns {string} - The login route for the role
 */
export const getRoleBasedLoginRoute = (userRole) => {
  // All roles use the same login page
  return '/login'
}

/**
 * Get the user role from Redux store
 * @returns {string|null} - The current user's role or null
 */
export const getCurrentUserRole = () => {
  try {
    // Access Redux store globally if available
    if (typeof window !== 'undefined' && window.__REDUX_STORE__) {
      const state = window.__REDUX_STORE__.getState()
      return state.auth?.user?.role || null
    }

    // Fallback: try to get from sessionStorage/localStorage if Redux not available
    const userDataString = sessionStorage.getItem('auth_user') || localStorage.getItem('auth_user')
    if (userDataString) {
      const userData = JSON.parse(userDataString)
      return userData.role
    }

    return null
  } catch (error) {
    console.warn('Could not determine user role for redirect:', error)
    return null
  }
}

/**
 * Redirect to appropriate login page based on user role
 * @param {string} userRole - Optional user role. If not provided, will try to determine from store
 */
export const redirectToRoleBasedLogin = (userRole = null) => {
  const role = userRole || getCurrentUserRole()
  const loginRoute = getRoleBasedLoginRoute(role)

  console.log(`🔄 Redirecting to role-based login: ${role} → ${loginRoute}`)

  if (typeof window !== 'undefined') {
    window.location.href = loginRoute
  }
}

/**
 * Store user data for fallback role detection
 * @param {object} userData - User data object containing role
 */
export const storeUserDataForRedirect = (userData) => {
  if (userData?.role) {
    try {
      sessionStorage.setItem('auth_user', JSON.stringify({ role: userData.role }))
    } catch (error) {
      console.warn('Could not store user data for redirect:', error)
    }
  }
}

/**
 * Clear stored user data
 */
export const clearStoredUserData = () => {
  try {
    sessionStorage.removeItem('auth_user')
    localStorage.removeItem('auth_user')
  } catch (error) {
    console.warn('Could not clear stored user data:', error)
  }
}