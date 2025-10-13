import { useState, useEffect, useRef, useCallback } from 'react'

// Basic debounce hook
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Debounced callback hook
export const useDebouncedCallback = (callback, delay, dependencies = []) => {
  const timeoutRef = useRef(null)
  const callbackRef = useRef(callback)

  // Update callback ref when dependencies change
  useEffect(() => {
    callbackRef.current = callback
  }, dependencies)

  const debouncedCallback = useCallback(
    (...args) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args)
      }, delay)
    },
    [delay]
  )

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  // Cancel function to manually cancel the debounced call
  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  // Flush function to immediately execute the debounced call
  const flush = useCallback(
    (...args) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
      callbackRef.current(...args)
    },
    []
  )

  return [debouncedCallback, cancel, flush]
}

// Debounced search hook
export const useDebouncedSearch = (searchCallback, delay = 300) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState([])
  const [error, setError] = useState(null)

  const debouncedSearchTerm = useDebounce(searchTerm, delay)

  useEffect(() => {
    const performSearch = async () => {
      if (!debouncedSearchTerm.trim()) {
        setSearchResults([])
        setIsSearching(false)
        setError(null)
        return
      }

      setIsSearching(true)
      setError(null)

      try {
        const results = await searchCallback(debouncedSearchTerm)
        setSearchResults(results || [])
      } catch (err) {
        setError(err.message || 'Search failed')
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    }

    performSearch()
  }, [debouncedSearchTerm, searchCallback])

  const clearSearch = useCallback(() => {
    setSearchTerm('')
    setSearchResults([])
    setError(null)
    setIsSearching(false)
  }, [])

  return {
    searchTerm,
    setSearchTerm,
    searchResults,
    isSearching,
    error,
    clearSearch,
    debouncedSearchTerm
  }
}

// Debounced API call hook
export const useDebouncedApiCall = (apiCall, delay = 500) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [lastParams, setLastParams] = useState(null)

  const [debouncedCall, cancelCall] = useDebouncedCallback(
    async (params) => {
      setLoading(true)
      setError(null)
      setLastParams(params)

      try {
        const result = await apiCall(params)
        setData(result)
      } catch (err) {
        setError(err.message || 'API call failed')
        setData(null)
      } finally {
        setLoading(false)
      }
    },
    delay
  )

  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setLoading(false)
    setLastParams(null)
    cancelCall()
  }, [cancelCall])

  return {
    data,
    loading,
    error,
    lastParams,
    execute: debouncedCall,
    cancel: cancelCall,
    reset
  }
}

// Debounced form validation hook
export const useDebouncedValidation = (validationFn, delay = 300) => {
  const [errors, setErrors] = useState({})
  const [isValidating, setIsValidating] = useState(false)
  const [isValid, setIsValid] = useState(true)

  const [debouncedValidate] = useDebouncedCallback(
    async (values) => {
      setIsValidating(true)

      try {
        const validationErrors = await validationFn(values)
        setErrors(validationErrors || {})
        setIsValid(Object.keys(validationErrors || {}).length === 0)
      } catch (err) {
        setErrors({ _general: err.message || 'Validation failed' })
        setIsValid(false)
      } finally {
        setIsValidating(false)
      }
    },
    delay
  )

  const validateField = useCallback(
    (fieldName, value, allValues = {}) => {
      debouncedValidate({ ...allValues, [fieldName]: value })
    },
    [debouncedValidate]
  )

  const validateForm = useCallback(
    (values) => {
      debouncedValidate(values)
    },
    [debouncedValidate]
  )

  const clearErrors = useCallback(() => {
    setErrors({})
    setIsValid(true)
    setIsValidating(false)
  }, [])

  return {
    errors,
    isValidating,
    isValid,
    validateField,
    validateForm,
    clearErrors
  }
}

// Debounced auto-save hook
export const useDebouncedAutoSave = (saveCallback, delay = 2000) => {
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState(null)
  const [saveError, setSaveError] = useState(null)

  const [debouncedSave] = useDebouncedCallback(
    async (data) => {
      setIsSaving(true)
      setSaveError(null)

      try {
        await saveCallback(data)
        setLastSaved(new Date())
      } catch (err) {
        setSaveError(err.message || 'Save failed')
      } finally {
        setIsSaving(false)
      }
    },
    delay
  )

  const save = useCallback(
    (data) => {
      debouncedSave(data)
    },
    [debouncedSave]
  )

  const getLastSavedText = useCallback(() => {
    if (!lastSaved) return 'Never saved'
    const now = new Date()
    const diff = now - lastSaved
    const minutes = Math.floor(diff / 60000)
    const seconds = Math.floor((diff % 60000) / 1000)

    if (minutes > 0) {
      return `Saved ${minutes} minute${minutes !== 1 ? 's' : ''} ago`
    } else {
      return `Saved ${seconds} second${seconds !== 1 ? 's' : ''} ago`
    }
  }, [lastSaved])

  return {
    save,
    isSaving,
    lastSaved,
    saveError,
    getLastSavedText
  }
}

// Debounced resize hook
export const useDebouncedResize = (callback, delay = 100) => {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  })

  const [debouncedCallback] = useDebouncedCallback(
    (size) => {
      setWindowSize(size)
      if (callback) callback(size)
    },
    delay
  )

  useEffect(() => {
    const handleResize = () => {
      const newSize = {
        width: window.innerWidth,
        height: window.innerHeight
      }
      debouncedCallback(newSize)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [debouncedCallback])

  return windowSize
}

// Debounced scroll hook
export const useDebouncedScroll = (callback, delay = 100) => {
  const [scrollPosition, setScrollPosition] = useState({
    x: window.pageXOffset,
    y: window.pageYOffset
  })

  const [debouncedCallback] = useDebouncedCallback(
    (position) => {
      setScrollPosition(position)
      if (callback) callback(position)
    },
    delay
  )

  useEffect(() => {
    const handleScroll = () => {
      const newPosition = {
        x: window.pageXOffset,
        y: window.pageYOffset
      }
      debouncedCallback(newPosition)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [debouncedCallback])

  return scrollPosition
}

export default useDebounce