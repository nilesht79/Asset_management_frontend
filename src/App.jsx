import React, { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ConfigProvider, theme } from 'antd'

import AppRouter from './routes/AppRouter'
import { checkAuth } from './store/slices/authSlice'
import { setTheme } from './store/slices/uiSlice'
import authService from './services/auth'

// Make authService available globally for security testing
if (typeof window !== 'undefined') {
  window.authService = authService
}

// Import pages
import Landing from './pages/Landing'
import Documentation from './pages/Documentation'
import Login from './pages/Login'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'

function App() {
  const dispatch = useDispatch()
  const { isAuthenticated, isLoading: authLoading } = useSelector(state => state.auth)
  const { theme: currentTheme } = useSelector(state => state.ui)
  const hasInitialized = useRef(false)

  // Initialize authentication check on app mount ONCE
  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true
      dispatch(checkAuth())
    }
  }, [])

  // Load theme preference from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme && savedTheme !== currentTheme) {
      dispatch(setTheme(savedTheme))
    }
  }, [dispatch, currentTheme])

  // Apply theme to Ant Design
  const antdTheme = {
    algorithm: currentTheme === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
    token: {
      colorPrimary: '#ef4444',
      colorInfo: '#ef4444',
      colorSuccess: '#22c55e',
      colorWarning: '#f59e0b',
      colorError: '#ef4444',
      borderRadius: 8,
      controlHeight: 36,
      fontSize: 14,
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    },
  }

  // Show loading screen while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }


  return (
    <ConfigProvider theme={antdTheme}>
      <div className={`app ${currentTheme}`}>
        <Routes>
          {/* Main Landing Page */}
          <Route
            path="/"
            element={
              isAuthenticated ? <Navigate to="/dashboard" replace /> : <Landing />
            }
          />

          {/* Documentation Page */}
          <Route 
            path="/documentation" 
            element={<Documentation />} 
          />

          {/* Login Route */}
          <Route
            path="/login"
            element={
              isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
            }
          />

          {/* Forgot Password Route */}
          <Route
            path="/forgot-password"
            element={
              isAuthenticated ? <Navigate to="/dashboard" replace /> : <ForgotPassword />
            }
          />

          {/* Reset Password Route */}
          <Route
            path="/reset-password"
            element={
              isAuthenticated ? <Navigate to="/dashboard" replace /> : <ResetPassword />
            }
          />

          {/* Protected routes */}
          <Route
            path="*"
            element={
              isAuthenticated ? <AppRouter /> : <Navigate to="/login" replace />
            }
          />
        </Routes>
      </div>
    </ConfigProvider>
  )
}

export default App