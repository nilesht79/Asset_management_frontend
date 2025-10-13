import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { ConfigProvider } from 'antd'
import { Toaster } from 'react-hot-toast'

import App from './App.jsx'
import { store } from './store/index.js'
import './styles/globals.css'

// Make Redux store globally accessible for utility functions
if (typeof window !== 'undefined') {
  window.__REDUX_STORE__ = store
}

// Ant Design theme configuration
const antdTheme = {
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
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    boxShadowSecondary: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  },
  components: {
    Layout: {
      headerBg: '#ffffff',
      headerHeight: 64,
      headerPadding: '0 24px',
      siderBg: '#001529',
      bodyBg: '#f8fafc',
    },
    Menu: {
      itemBg: 'transparent',
      itemSelectedBg: 'rgba(239, 68, 68, 0.1)',
      itemHoverBg: 'rgba(255, 255, 255, 0.1)',
      darkItemBg: 'transparent',
      darkItemSelectedBg: 'rgba(239, 68, 68, 0.2)',
      darkItemHoverBg: 'rgba(255, 255, 255, 0.1)',
    },
    Button: {
      borderRadius: 8,
      controlHeight: 36,
      fontSize: 14,
      fontWeight: 500,
    },
    Input: {
      borderRadius: 8,
      controlHeight: 36,
      fontSize: 14,
    },
    Select: {
      borderRadius: 8,
      controlHeight: 36,
      fontSize: 14,
    },
    Card: {
      borderRadius: 12,
      paddingLG: 24,
      boxShadowTertiary: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    },
    Table: {
      borderRadius: 12,
      headerBg: '#f8fafc',
      headerColor: '#374151',
      rowHoverBg: '#f8fafc',
    },
    Modal: {
      borderRadius: 12,
      titleFontSize: 18,
      titleColor: '#1f2937',
    },
    Tabs: {
      borderRadius: 8,
      titleFontSize: 14,
      cardBg: '#ffffff',
    },
    Badge: {
      borderRadius: 4,
      fontSize: 12,
    },
    Tag: {
      borderRadius: 6,
      fontSize: 12,
    }
  },
  algorithm: [], // You can add theme.darkAlgorithm or theme.compactAlgorithm here
}

// Toast configuration
const toastOptions = {
  position: 'top-right',
  duration: 4000,
  style: {
    borderRadius: '8px',
    background: '#333',
    color: '#fff',
    fontSize: '14px',
    fontFamily: 'Inter, sans-serif',
  },
  success: {
    iconTheme: {
      primary: '#22c55e',
      secondary: '#fff',
    },
    style: {
      background: '#22c55e',
    },
  },
  error: {
    iconTheme: {
      primary: '#ef4444',
      secondary: '#fff',
    },
    style: {
      background: '#ef4444',
    },
  },
  loading: {
    iconTheme: {
      primary: '#ef4444',
      secondary: '#fff',
    },
    style: {
      background: '#ef4444',
    },
  },
}

// Initialize the React application
ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Provider store={store}>
      <ConfigProvider theme={antdTheme}>
        <App />
        <Toaster toastOptions={toastOptions} />
      </ConfigProvider>
    </Provider>
  </BrowserRouter>
)

// Mark app as loaded for loading screen
setTimeout(() => {
  document.body.classList.add('app-loaded')
}, 100)