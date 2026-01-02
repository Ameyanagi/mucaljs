import { useState, useCallback } from 'react'

/**
 * Custom hook for syncing state with localStorage
 * @param key - localStorage key
 * @param initialValue - Default value if not in localStorage
 * @returns Current value and setter function
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  // Get initial value from localStorage or use default
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  // Update localStorage when value changes
  const setValue = useCallback((value: T | ((val: T) => T)) => {
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
 * @param defaults - Object with keys and default values
 * @returns Object with values from localStorage or defaults
 */
export function loadFromStorage<T extends Record<string, unknown>>(defaults: T): T {
  const result = {} as T
  for (const [key, defaultValue] of Object.entries(defaults)) {
    try {
      const item = localStorage.getItem(key)
      ;(result as Record<string, unknown>)[key] = item ? JSON.parse(item) : defaultValue
    } catch {
      ;(result as Record<string, unknown>)[key] = defaultValue
    }
  }
  return result
}

/**
 * Save multiple values to localStorage at once
 * @param values - Object with keys and values to save
 */
export function saveToStorage(values: Record<string, unknown>): void {
  for (const [key, value] of Object.entries(values)) {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.warn(`Error saving to localStorage:`, error)
    }
  }
}
