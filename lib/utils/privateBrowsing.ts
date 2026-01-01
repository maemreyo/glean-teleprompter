/**
 * Private browsing mode detection utility
 * Tests localStorage write capability and caches result
 */

import { STORAGE_KEYS } from '@/lib/storage/types';

/**
 * Detection result cache
 */
let detectionCache: boolean | null = null;

/**
 * Detect if browser is in private browsing mode
 * Tests localStorage write capability
 * @returns true if private browsing detected
 */
export function detectPrivateBrowsing(): boolean {
  // Return cached result if available
  if (detectionCache !== null) {
    return detectionCache;
  }

  try {
    const testKey = '__private_browsing_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    
    // localStorage worked - not in private browsing
    detectionCache = false;
    return false;
  } catch (e) {
    // localStorage failed - likely in private browsing
    detectionCache = true;
    
    // Cache result for session
    try {
      sessionStorage.setItem(STORAGE_KEYS.PRIVATE_BROWSING_DETECTED, 'true');
    } catch {
      // sessionStorage also not available
    }
    
    return true;
  }
}

/**
 * Check if private browsing was previously detected
 * @returns true if previously detected in this session
 */
export function wasPrivateBrowsingDetected(): boolean {
  try {
    return sessionStorage.getItem(STORAGE_KEYS.PRIVATE_BROWSING_DETECTED) === 'true';
  } catch {
    return false;
  }
}

/**
 * Clear the detection cache and re-detect
 */
export function clearDetectionCache(): void {
  detectionCache = null;
  try {
    sessionStorage.removeItem(STORAGE_KEYS.PRIVATE_BROWSING_DETECTED);
  } catch {
    // Ignore errors
  }
}

/**
 * Re-check detection (clears cache and runs detection again)
 */
export function recheckDetection(): boolean {
  clearDetectionCache();
  return detectPrivateBrowsing();
}

/**
 * Multi-layered defense for session-only storage
 * Combines detection tests with user education
 */
export interface PrivateBrowsingInfo {
  isPrivate: boolean;
  detectionMethod: 'localStorage' | 'sessionStorage' | 'quota';
  confidence: 'high' | 'medium' | 'low';
}

/**
 * Comprehensive private browsing detection with multiple methods
 */
export function detectPrivateBrowsingComprehensive(): PrivateBrowsingInfo {
  const methods = {
    localStorage: false,
    sessionStorage: false,
    quota: false,
  };

  // Method 1: localStorage write test
  try {
    const testKey = '__pb_test_ls__';
    localStorage.setItem(testKey, 'x');
    localStorage.removeItem(testKey);
  } catch {
    methods.localStorage = true;
  }

  // Method 2: sessionStorage write test (some private browsers allow this)
  try {
    const testKey = '__pb_test_ss__';
    sessionStorage.setItem(testKey, 'x');
    sessionStorage.removeItem(testKey);
  } catch {
    methods.sessionStorage = true;
  }

  // Method 3: Check for unusually low storage quota
  try {
    const testKey = '__pb_test_quota__';
    const data = 'x'.repeat(1024); // 1KB
    localStorage.setItem(testKey, data);
    localStorage.removeItem(testKey);
  } catch {
    methods.quota = true;
  }

  // Determine confidence
  const positiveCount = Object.values(methods).filter(Boolean).length;
  let confidence: 'high' | 'medium' | 'low' = 'low';

  if (positiveCount >= 2) {
    confidence = 'high';
  } else if (positiveCount === 1) {
    confidence = 'medium';
  }

  // Overall detection
  const isPrivate = methods.localStorage || (methods.sessionStorage && methods.quota);

  return {
    isPrivate,
    detectionMethod: methods.localStorage ? 'localStorage' : 
                     methods.sessionStorage ? 'sessionStorage' : 
                     methods.quota ? 'quota' : 'localStorage',
    confidence,
  };
}
