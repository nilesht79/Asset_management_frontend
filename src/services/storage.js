const STORAGE_KEYS = {
  TOKEN: 'token',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
  PREFERENCES: 'userPreferences',
  THEME: 'theme',
  LANGUAGE: 'language',
  SIDEBAR_COLLAPSED: 'sidebarCollapsed',
  TABLE_SETTINGS: 'tableSettings',
  RECENT_SEARCHES: 'recentSearches',
  FAVORITES: 'favorites'
}

class StorageService {
  constructor() {
    this.storage = window.localStorage
    this.sessionStorage = window.sessionStorage
    this.isSupported = this.checkStorageSupport()
  }

  checkStorageSupport() {
    try {
      const test = '__storage_test__'
      this.storage.setItem(test, test)
      this.storage.removeItem(test)
      return true
    } catch (e) {
      console.warn('localStorage not supported, using memory storage as fallback')
      this.memoryStorage = new Map()
      return false
    }
  }

  // Token Management
  setToken(token) {
    this.setItem(STORAGE_KEYS.TOKEN, token)
  }

  getToken() {
    return this.getItem(STORAGE_KEYS.TOKEN)
  }

  removeToken() {
    this.removeItem(STORAGE_KEYS.TOKEN)
  }

  setRefreshToken(token) {
    this.setItem(STORAGE_KEYS.REFRESH_TOKEN, token)
  }

  getRefreshToken() {
    return this.getItem(STORAGE_KEYS.REFRESH_TOKEN)
  }

  removeRefreshToken() {
    this.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
  }

  // User Data
  setUser(user) {
    this.setItem(STORAGE_KEYS.USER, user)
  }

  getUser() {
    return this.getItem(STORAGE_KEYS.USER)
  }

  removeUser() {
    this.removeItem(STORAGE_KEYS.USER)
  }

  // User Preferences
  setPreferences(preferences) {
    const current = this.getPreferences()
    this.setItem(STORAGE_KEYS.PREFERENCES, { ...current, ...preferences })
  }

  getPreferences() {
    return this.getItem(STORAGE_KEYS.PREFERENCES) || {}
  }

  getPreference(key, defaultValue = null) {
    const preferences = this.getPreferences()
    return preferences[key] !== undefined ? preferences[key] : defaultValue
  }

  setPreference(key, value) {
    const preferences = this.getPreferences()
    preferences[key] = value
    this.setItem(STORAGE_KEYS.PREFERENCES, preferences)
  }

  removePreferences() {
    this.removeItem(STORAGE_KEYS.PREFERENCES)
  }

  // Theme
  setTheme(theme) {
    this.setItem(STORAGE_KEYS.THEME, theme)
    document.documentElement.setAttribute('data-theme', theme)
  }

  getTheme() {
    return this.getItem(STORAGE_KEYS.THEME) || 'light'
  }

  // Language
  setLanguage(language) {
    this.setItem(STORAGE_KEYS.LANGUAGE, language)
  }

  getLanguage() {
    return this.getItem(STORAGE_KEYS.LANGUAGE) || 'en'
  }

  // UI State
  setSidebarCollapsed(collapsed) {
    this.setItem(STORAGE_KEYS.SIDEBAR_COLLAPSED, collapsed)
  }

  getSidebarCollapsed() {
    return this.getItem(STORAGE_KEYS.SIDEBAR_COLLAPSED) || false
  }

  // Table Settings
  setTableSettings(tableId, settings) {
    const allSettings = this.getItem(STORAGE_KEYS.TABLE_SETTINGS) || {}
    allSettings[tableId] = settings
    this.setItem(STORAGE_KEYS.TABLE_SETTINGS, allSettings)
  }

  getTableSettings(tableId) {
    const allSettings = this.getItem(STORAGE_KEYS.TABLE_SETTINGS) || {}
    return allSettings[tableId] || null
  }

  removeTableSettings(tableId) {
    const allSettings = this.getItem(STORAGE_KEYS.TABLE_SETTINGS) || {}
    delete allSettings[tableId]
    this.setItem(STORAGE_KEYS.TABLE_SETTINGS, allSettings)
  }

  // Recent Searches
  addRecentSearch(query, category = 'general') {
    const searches = this.getRecentSearches()
    const categorySearches = searches[category] || []
    
    // Remove if exists
    const filtered = categorySearches.filter(item => item.query !== query)
    
    // Add to beginning
    filtered.unshift({
      query,
      timestamp: new Date().toISOString()
    })
    
    // Keep only last 10
    searches[category] = filtered.slice(0, 10)
    
    this.setItem(STORAGE_KEYS.RECENT_SEARCHES, searches)
  }

  getRecentSearches(category = null) {
    const searches = this.getItem(STORAGE_KEYS.RECENT_SEARCHES) || {}
    return category ? searches[category] || [] : searches
  }

  clearRecentSearches(category = null) {
    if (category) {
      const searches = this.getRecentSearches()
      delete searches[category]
      this.setItem(STORAGE_KEYS.RECENT_SEARCHES, searches)
    } else {
      this.removeItem(STORAGE_KEYS.RECENT_SEARCHES)
    }
  }

  // Favorites
  addFavorite(item) {
    const favorites = this.getFavorites()
    const exists = favorites.find(fav => fav.id === item.id && fav.type === item.type)
    
    if (!exists) {
      favorites.push({
        ...item,
        addedAt: new Date().toISOString()
      })
      this.setItem(STORAGE_KEYS.FAVORITES, favorites)
    }
  }

  removeFavorite(id, type) {
    const favorites = this.getFavorites()
    const filtered = favorites.filter(item => !(item.id === id && item.type === type))
    this.setItem(STORAGE_KEYS.FAVORITES, filtered)
  }

  getFavorites(type = null) {
    const favorites = this.getItem(STORAGE_KEYS.FAVORITES) || []
    return type ? favorites.filter(item => item.type === type) : favorites
  }

  isFavorite(id, type) {
    const favorites = this.getFavorites()
    return favorites.some(item => item.id === id && item.type === type)
  }

  clearFavorites() {
    this.removeItem(STORAGE_KEYS.FAVORITES)
  }

  // Session Storage (temporary data)
  setSessionItem(key, value) {
    if (this.isSupported) {
      try {
        this.sessionStorage.setItem(key, JSON.stringify(value))
      } catch (e) {
        console.error('Session storage error:', e)
      }
    }
  }

  getSessionItem(key) {
    if (this.isSupported) {
      try {
        const item = this.sessionStorage.getItem(key)
        return item ? JSON.parse(item) : null
      } catch (e) {
        console.error('Session storage error:', e)
        return null
      }
    }
    return null
  }

  removeSessionItem(key) {
    if (this.isSupported) {
      this.sessionStorage.removeItem(key)
    }
  }

  // Generic methods
  setItem(key, value) {
    if (this.isSupported) {
      try {
        this.storage.setItem(key, JSON.stringify(value))
      } catch (e) {
        console.error('Storage error:', e)
      }
    } else {
      this.memoryStorage.set(key, value)
    }
  }

  getItem(key) {
    if (this.isSupported) {
      try {
        const item = this.storage.getItem(key)
        return item ? JSON.parse(item) : null
      } catch (e) {
        console.error('Storage error:', e)
        return null
      }
    } else {
      return this.memoryStorage.get(key) || null
    }
  }

  removeItem(key) {
    if (this.isSupported) {
      this.storage.removeItem(key)
    } else {
      this.memoryStorage.delete(key)
    }
  }

  // Clear all application data
  clearAll() {
    if (this.isSupported) {
      // Clear only our app's keys
      Object.values(STORAGE_KEYS).forEach(key => {
        this.storage.removeItem(key)
      })
    } else {
      this.memoryStorage.clear()
    }
  }

  // Get storage info
  getStorageInfo() {
    if (!this.isSupported) {
      return {
        supported: false,
        used: this.memoryStorage.size,
        remaining: Infinity
      }
    }

    try {
      let used = 0
      for (let key in this.storage) {
        if (this.storage.hasOwnProperty(key)) {
          used += this.storage[key].length
        }
      }

      return {
        supported: true,
        used: used,
        remaining: 5 * 1024 * 1024 - used // Rough estimate of 5MB limit
      }
    } catch (e) {
      return {
        supported: true,
        used: 0,
        remaining: 0,
        error: e.message
      }
    }
  }

  // Export/Import data (for backup/restore)
  exportData() {
    const data = {}
    Object.values(STORAGE_KEYS).forEach(key => {
      const value = this.getItem(key)
      if (value !== null) {
        data[key] = value
      }
    })
    return data
  }

  importData(data) {
    Object.entries(data).forEach(([key, value]) => {
      if (Object.values(STORAGE_KEYS).includes(key)) {
        this.setItem(key, value)
      }
    })
  }
}

// Create and export singleton instance
const storageService = new StorageService()

export default storageService
export { STORAGE_KEYS }