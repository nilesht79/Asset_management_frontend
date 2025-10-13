import { useState, useEffect, useCallback } from 'react'

// Custom hook for localStorage with JSON serialization and error handling
export const useLocalStorage = (key, initialValue) => {
  // Get value from localStorage or use initial value
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  // Return a wrapped version of useState's setter function that persists the value to localStorage
  const setValue = useCallback((value) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value
      
      // Save state
      setStoredValue(valueToStore)
      
      // Save to localStorage
      if (valueToStore === undefined) {
        window.localStorage.removeItem(key)
      } else {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error)
    }
  }, [key, storedValue])

  // Remove value from localStorage
  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key)
      setStoredValue(initialValue)
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error)
    }
  }, [key, initialValue])

  return [storedValue, setValue, removeValue]
}

// Hook for session storage
export const useSessionStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.sessionStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(`Error reading sessionStorage key "${key}":`, error)
      return initialValue
    }
  })

  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      
      if (valueToStore === undefined) {
        window.sessionStorage.removeItem(key)
      } else {
        window.sessionStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.error(`Error setting sessionStorage key "${key}":`, error)
    }
  }, [key, storedValue])

  const removeValue = useCallback(() => {
    try {
      window.sessionStorage.removeItem(key)
      setStoredValue(initialValue)
    } catch (error) {
      console.error(`Error removing sessionStorage key "${key}":`, error)
    }
  }, [key, initialValue])

  return [storedValue, setValue, removeValue]
}

// Hook for storing user preferences
export const useUserPreferences = () => {
  const [preferences, setPreferences, removePreferences] = useLocalStorage('userPreferences', {
    theme: 'light',
    language: 'en',
    sidebarCollapsed: false,
    tablePageSize: 10,
    notifications: {
      desktop: true,
      email: true,
      push: false
    },
    dashboard: {
      layout: 'default',
      widgets: []
    }
  })

  const updatePreference = useCallback((key, value) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }))
  }, [setPreferences])

  const updateNestedPreference = useCallback((category, key, value) => {
    setPreferences(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }))
  }, [setPreferences])

  const resetPreferences = useCallback(() => {
    removePreferences()
  }, [removePreferences])

  return {
    preferences,
    updatePreference,
    updateNestedPreference,
    resetPreferences,
    // Individual preference getters
    theme: preferences.theme,
    language: preferences.language,
    sidebarCollapsed: preferences.sidebarCollapsed,
    tablePageSize: preferences.tablePageSize,
    notifications: preferences.notifications,
    dashboard: preferences.dashboard
  }
}

// Hook for storing table settings
export const useTableSettings = (tableId) => {
  const [settings, setSettings, removeSettings] = useLocalStorage(`table_${tableId}`, {
    pageSize: 10,
    sortField: null,
    sortOrder: null,
    filters: {},
    columns: []
  })

  const updatePageSize = useCallback((pageSize) => {
    setSettings(prev => ({ ...prev, pageSize }))
  }, [setSettings])

  const updateSort = useCallback((sortField, sortOrder) => {
    setSettings(prev => ({ ...prev, sortField, sortOrder }))
  }, [setSettings])

  const updateFilters = useCallback((filters) => {
    setSettings(prev => ({ ...prev, filters }))
  }, [setSettings])

  const updateColumns = useCallback((columns) => {
    setSettings(prev => ({ ...prev, columns }))
  }, [setSettings])

  const resetSettings = useCallback(() => {
    removeSettings()
  }, [removeSettings])

  return {
    settings,
    updatePageSize,
    updateSort,
    updateFilters,
    updateColumns,
    resetSettings
  }
}

// Hook for storing recent searches
export const useRecentSearches = (category = 'general', maxItems = 10) => {
  const [searches, setSearches] = useLocalStorage(`recent_searches_${category}`, [])

  const addSearch = useCallback((query) => {
    if (!query || !query.trim()) return

    setSearches(prev => {
      // Remove existing entry if it exists
      const filtered = prev.filter(item => item.query !== query)
      
      // Add new entry at the beginning
      const newSearches = [{
        query: query.trim(),
        timestamp: new Date().toISOString(),
        category
      }, ...filtered]
      
      // Keep only the specified number of items
      return newSearches.slice(0, maxItems)
    })
  }, [setSearches, category, maxItems])

  const removeSearch = useCallback((query) => {
    setSearches(prev => prev.filter(item => item.query !== query))
  }, [setSearches])

  const clearSearches = useCallback(() => {
    setSearches([])
  }, [setSearches])

  return {
    searches,
    addSearch,
    removeSearch,
    clearSearches
  }
}

// Hook for storing favorites
export const useFavorites = (type) => {
  const [favorites, setFavorites] = useLocalStorage(`favorites_${type}`, [])

  const addFavorite = useCallback((item) => {
    setFavorites(prev => {
      const exists = prev.find(fav => fav.id === item.id)
      if (exists) return prev
      
      return [...prev, {
        ...item,
        addedAt: new Date().toISOString()
      }]
    })
  }, [setFavorites])

  const removeFavorite = useCallback((id) => {
    setFavorites(prev => prev.filter(item => item.id !== id))
  }, [setFavorites])

  const isFavorite = useCallback((id) => {
    return favorites.some(item => item.id === id)
  }, [favorites])

  const clearFavorites = useCallback(() => {
    setFavorites([])
  }, [setFavorites])

  return {
    favorites,
    addFavorite,
    removeFavorite,
    isFavorite,
    clearFavorites
  }
}

// Hook for persisting form data
export const useFormPersistence = (formId) => {
  const [formData, setFormData] = useLocalStorage(`form_${formId}`, null)

  const persistFormData = useCallback((data) => {
    setFormData({
      ...data,
      savedAt: new Date().toISOString()
    })
  }, [setFormData])

  const clearPersistedData = useCallback(() => {
    setFormData(null)
  }, [setFormData])

  const hasPersistedData = formData !== null

  return {
    formData,
    persistFormData,
    clearPersistedData,
    hasPersistedData
  }
}

// Hook for storing app-wide settings
export const useAppSettings = () => {
  const [settings, setSettings] = useLocalStorage('appSettings', {
    autoSave: true,
    confirmOnDelete: true,
    showHelpTips: true,
    debugMode: false,
    maxFileSize: 10, // MB
    defaultDateFormat: 'MM/DD/YYYY',
    defaultTimeFormat: '12h'
  })

  const updateSetting = useCallback((key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }, [setSettings])

  return {
    settings,
    updateSetting,
    // Individual setting getters
    autoSave: settings.autoSave,
    confirmOnDelete: settings.confirmOnDelete,
    showHelpTips: settings.showHelpTips,
    debugMode: settings.debugMode,
    maxFileSize: settings.maxFileSize,
    defaultDateFormat: settings.defaultDateFormat,
    defaultTimeFormat: settings.defaultTimeFormat
  }
}

// Utility hook to check if localStorage is available
export const useStorageAvailable = () => {
  const [isAvailable, setIsAvailable] = useState(false)

  useEffect(() => {
    try {
      const test = '__storage_test__'
      localStorage.setItem(test, test)
      localStorage.removeItem(test)
      setIsAvailable(true)
    } catch (e) {
      setIsAvailable(false)
    }
  }, [])

  return isAvailable
}

export default useLocalStorage