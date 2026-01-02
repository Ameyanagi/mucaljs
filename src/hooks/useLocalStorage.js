import { useState, useEffect, useCallback } from 'react'

/**
 * Custom hook for syncing state with localStorage
 * @param {string} key - localStorage key
 * @param {*} initialValue - Default value if not in localStorage
 * @returns {[*, Function]} Current value and setter function
 */
export function useLocalStorage(key, initialValue) {
  // Get initial value from localStorage or use default
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  // Update localStorage when value changes
  const setValue = useCallback((value) => {
    try {
      // Allow value to be a function for state updates
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error)
    }
  }, [key, storedValue])

  return [storedValue, setValue]
}

/**
 * Load multiple values from localStorage at once
 * @param {Object} defaults - Object with keys and default values
 * @returns {Object} Object with values from localStorage or defaults
 */
export function loadFromStorage(defaults) {
  const result = {}
  for (const [key, defaultValue] of Object.entries(defaults)) {
    try {
      const item = localStorage.getItem(key)
      result[key] = item ? JSON.parse(item) : defaultValue
    } catch {
      result[key] = defaultValue
    }
  }
  return result
}

/**
 * Save multiple values to localStorage at once
 * @param {Object} values - Object with keys and values to save
 */
export function saveToStorage(values) {
  for (const [key, value] of Object.entries(values)) {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.warn(`Error saving to localStorage:`, error)
    }
  }
}
