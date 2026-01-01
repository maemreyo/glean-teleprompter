/**
 * Secure localStorage utilities with XSS protection and data validation
 * T096: Security hardening for localStorage operations
 */

/**
 * Maximum allowed size for stored data (10MB)
 * Prevents quota exhaustion attacks
 */
const MAX_STORAGE_SIZE = 10 * 1024 * 1024 // 10MB

/**
 * Sanitizes a string to prevent XSS attacks
 * Removes potentially dangerous HTML/Script content
 */
function sanitizeString(input: string): string {
  // Remove null bytes
  let sanitized = input.replace(/\0/g, '')
  
  // Limit length to prevent DoS
  const MAX_STRING_LENGTH = 10000
  if (sanitized.length > MAX_STRING_LENGTH) {
    sanitized = sanitized.substring(0, MAX_STRING_LENGTH)
  }
  
  return sanitized
}

/**
 * Validates data structure against expected schema
 * Returns true if data is valid, false otherwise
 */
function validateDataStructure(data: unknown, expectedKeys: string[]): boolean {
  if (!data || typeof data !== 'object') {
    return false
  }
  
  const dataObj = data as Record<string, unknown>
  
  // Check that all expected keys exist
  for (const key of expectedKeys) {
    if (!(key in dataObj)) {
      return false
    }
  }
  
  // Check that data doesn't have suspicious properties
  const dataKeys = Object.keys(dataObj)
  
  // Reject if too many properties (potential DoS)
  if (dataKeys.length > 100) {
    return false
  }
  
  // Check for prototype pollution patterns
  if (dataKeys.some(k => k === '__proto__' || k === 'constructor' || k === 'prototype')) {
    return false
  }
  
  return true
}

/**
 * Validates and sanitizes a numeric value
 */
function validateNumber(value: unknown, min: number = -Infinity, max: number = Infinity): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return null
  }
  
  if (value < min || value > max) {
    return null
  }
  
  return value
}

/**
 * Validates and sanitizes a boolean value
 */
function validateBoolean(value: unknown): boolean {
  return typeof value === 'boolean' ? value : false
}

/**
 * Validates and sanitizes a string value
 */
function validateString(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null
  }
  
  return sanitizeString(value)
}

/**
 * Securely loads data from localStorage with validation
 * 
 * @param key - Storage key
 * @param defaultValue - Default value if loading fails
 * @param expectedKeys - Expected keys in the data object for validation
 * @returns The loaded data or default value
 */
export function secureLoadFromStorage<T extends Record<string, unknown>>(
  key: string,
  defaultValue: T,
  expectedKeys?: (keyof T)[]
): T {
  try {
    // Check if running in browser
    if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
      return defaultValue
    }
    
    // Get the raw value
    const rawValue = localStorage.getItem(key)
    
    if (rawValue === null) {
      return defaultValue
    }
    
    // Check size limits
    if (rawValue.length > MAX_STORAGE_SIZE) {
      console.warn(`Storage value for "${key}" exceeds size limit, clearing and returning default`)
      localStorage.removeItem(key)
      return defaultValue
    }
    
    // Parse JSON
    let parsedData: unknown
    try {
      parsedData = JSON.parse(rawValue)
    } catch (parseError) {
      console.warn(`Failed to parse JSON for "${key}":`, parseError)
      localStorage.removeItem(key)
      return defaultValue
    }
    
    // Validate data structure
    if (!parsedData || typeof parsedData !== 'object') {
      console.warn(`Invalid data structure for "${key}", returning default`)
      localStorage.removeItem(key)
      return defaultValue
    }
    
    // Validate expected keys if provided
    if (expectedKeys && expectedKeys.length > 0) {
      if (!validateDataStructure(parsedData, expectedKeys as string[])) {
        console.warn(`Data structure validation failed for "${key}", returning default`)
        localStorage.removeItem(key)
        return defaultValue
      }
    }
    
    // Sanitize the data recursively
    const sanitized = sanitizeData(parsedData)
    
    return sanitized as T
  } catch (error) {
    console.warn(`Failed to load "${key}" from localStorage:`, error)
    return defaultValue
  }
}

/**
 * Recursively sanitizes data to remove potentially dangerous content
 */
function sanitizeData(data: unknown): unknown {
  if (data === null || data === undefined) {
    return data
  }
  
  // Handle primitives
  if (typeof data === 'string') {
    return sanitizeString(data)
  }
  
  if (typeof data === 'number') {
    return Number.isFinite(data) ? data : 0
  }
  
  if (typeof data === 'boolean') {
    return data
  }
  
  // Handle arrays
  if (Array.isArray(data)) {
    // Limit array size
    if (data.length > 1000) {
      return data.slice(0, 1000)
    }
    return data.map(sanitizeData)
  }
  
  // Handle objects
  if (typeof data === 'object') {
    const sanitized: Record<string, unknown> = {}
    const keys = Object.keys(data)
    
    // Limit object properties
    if (keys.length > 100) {
      console.warn('Object has too many properties, truncating')
    }
    
    for (const key of keys.slice(0, 100)) {
      // Skip dangerous keys
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        continue
      }
      
      sanitized[key] = sanitizeData((data as Record<string, unknown>)[key])
    }
    
    return sanitized
  }
  
  return data
}

/**
 * Securely saves data to localStorage with sanitization
 * 
 * @param key - Storage key
 * @param value - Value to store
 * @returns True if save was successful, false otherwise
 */
export function secureSaveToStorage<T extends Record<string, unknown>>(
  key: string,
  value: T
): boolean {
  try {
    // Check if running in browser
    if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
      return false
    }
    
    // Sanitize data before storing
    const sanitized = sanitizeData(value)
    
    // Convert to JSON
    const jsonValue = JSON.stringify(sanitized)
    
    if (jsonValue === undefined) {
      console.warn(`Failed to stringify data for "${key}"`)
      return false
    }
    
    // Check size limits
    if (jsonValue.length > MAX_STORAGE_SIZE) {
      console.warn(`Data for "${key}" exceeds size limit, not storing`)
      return false
    }
    
    // Store the sanitized data
    localStorage.setItem(key, jsonValue)
    
    return true
  } catch (error) {
    console.warn(`Failed to save "${key}" to localStorage:`, error)
    return false
  }
}

/**
 * Securely removes data from localStorage
 * 
 * @param key - Storage key to remove
 */
export function secureRemoveFromStorage(key: string): void {
  try {
    if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
      return
    }
    
    localStorage.removeItem(key)
  } catch (error) {
    console.warn(`Failed to remove "${key}" from localStorage:`, error)
  }
}

/**
 * Clears all application data from localStorage securely
 * Only removes keys that match the application prefix
 * 
 * @param prefix - Key prefix to match (e.g., 'teleprompter-')
 */
export function secureClearAppStorage(prefix: string): void {
  try {
    if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
      return
    }
    
    const keysToRemove: string[] = []
    
    // Collect keys to remove
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(prefix)) {
        keysToRemove.push(key)
      }
    }
    
    // Remove keys
    for (const key of keysToRemove) {
      localStorage.removeItem(key)
    }
  } catch (error) {
    console.warn('Failed to clear app storage:', error)
  }
}

/**
 * Gets the approximate size of localStorage data for a key
 * 
 * @param key - Storage key
 * @returns Size in bytes, or 0 if key doesn't exist
 */
export function getStorageSize(key: string): number {
  try {
    if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
      return 0
    }
    
    const value = localStorage.getItem(key)
    return value ? value.length * 2 : 0 // Approximate (UTF-16)
  } catch (error) {
    return 0
  }
}

/**
 * Checks if localStorage is available and has quota
 * 
 * @returns True if localStorage is available
 */
export function isStorageAvailable(): boolean {
  try {
    if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
      return false
    }
    
    const testKey = '__storage_test__'
    localStorage.setItem(testKey, 'test')
    localStorage.removeItem(testKey)
    return true
  } catch (error) {
    return false
  }
}
