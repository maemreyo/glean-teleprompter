import type { ErrorContext } from '@/stores/useUIStore'

/**
 * Error message types and configurations
 */
export type ErrorMessageType = 'network' | 'not_found' | 'permission' | 'quota' | 'unknown'

/**
 * Action types for error recovery
 */
export type ErrorAction = 'retry' | 'browse_templates' | 'sign_up' | 'none'

/**
 * Error message configuration
 */
export interface ErrorMessage {
  message: string
  action: ErrorAction
  details: string
  buttonLabel?: string
}

/**
 * Error message mappings for different error types
 */
export const ERROR_MESSAGES: Record<ErrorMessageType, ErrorMessage> = {
  network: {
    message: 'Network error. Check your connection and try again',
    action: 'retry',
    details: 'Unable to reach the server. Please check your internet connection.',
    buttonLabel: 'Retry',
  },
  not_found: {
    message: 'Script not found. It may have been deleted or the link is incorrect',
    action: 'browse_templates',
    details: 'The requested script does not exist or has been removed.',
    buttonLabel: 'Browse Templates',
  },
  permission: {
    message: "You don't have permission to view this script",
    action: 'none',
    details: 'This script is private or you need to sign in to access it.',
    buttonLabel: 'Create Your Own',
  },
  quota: {
    message: 'Storage full. Some browsers limit local storage.',
    action: 'sign_up',
    details: 'Your browser storage quota has been exceeded. Consider saving to your account or clearing old data.',
    buttonLabel: 'Sign Up',
  },
  unknown: {
    message: 'An unexpected error occurred',
    action: 'retry',
    details: 'Something went wrong. Please try again.',
    buttonLabel: 'Retry',
  },
} as const

/**
 * Get error context from an Error object
 * Maps common error patterns to ErrorContext
 */
export function getErrorContext(error: Error | unknown): ErrorContext {
  const now = Date.now()

  // Handle Error objects
  if (error instanceof Error) {
    const message = error.message.toLowerCase()
    const name = error.name.toLowerCase()

    // Network errors
    if (
      message.includes('network') ||
      message.includes('fetch') ||
      message.includes('connection') ||
      name === 'networkerror' ||
      name === 'typeerror' && message.includes('failed to fetch')
    ) {
      return {
        type: 'network',
        message: ERROR_MESSAGES.network.message,
        action: ERROR_MESSAGES.network.action,
        details: ERROR_MESSAGES.network.details,
        timestamp: now,
      }
    }

    // Not found errors (404)
    if (
      message.includes('not found') ||
      message.includes('404') ||
      name === 'notfounderror'
    ) {
      return {
        type: 'not_found',
        message: ERROR_MESSAGES.not_found.message,
        action: ERROR_MESSAGES.not_found.action,
        details: ERROR_MESSAGES.not_found.details,
        timestamp: now,
      }
    }

    // Permission errors (403, 401)
    if (
      message.includes('permission') ||
      message.includes('unauthorized') ||
      message.includes('403') ||
      message.includes('401') ||
      name === 'permissiondeniederror'
    ) {
      return {
        type: 'permission',
        message: ERROR_MESSAGES.permission.message,
        action: ERROR_MESSAGES.permission.action,
        details: ERROR_MESSAGES.permission.details,
        timestamp: now,
      }
    }

    // Quota errors (localStorage full)
    if (
      message.includes('quota') ||
      message.includes('storage') ||
      message.includes('exceeded') ||
      name === 'quotaexceedederror'
    ) {
      return {
        type: 'quota',
        message: ERROR_MESSAGES.quota.message,
        action: ERROR_MESSAGES.quota.action,
        details: ERROR_MESSAGES.quota.details,
        timestamp: now,
      }
    }
  }

  // Handle string errors
  if (typeof error === 'string') {
    const lowerError = error.toLowerCase()
    
    if (lowerError.includes('network') || lowerError.includes('fetch')) {
      return {
        type: 'network',
        message: ERROR_MESSAGES.network.message,
        action: ERROR_MESSAGES.network.action,
        details: ERROR_MESSAGES.network.details,
        timestamp: now,
      }
    }
    
    if (lowerError.includes('not found') || lowerError.includes('404')) {
      return {
        type: 'not_found',
        message: ERROR_MESSAGES.not_found.message,
        action: ERROR_MESSAGES.not_found.action,
        details: ERROR_MESSAGES.not_found.details,
        timestamp: now,
      }
    }
    
    if (lowerError.includes('permission') || lowerError.includes('unauthorized')) {
      return {
        type: 'permission',
        message: ERROR_MESSAGES.permission.message,
        action: ERROR_MESSAGES.permission.action,
        details: ERROR_MESSAGES.permission.details,
        timestamp: now,
      }
    }
    
    if (lowerError.includes('quota') || lowerError.includes('storage')) {
      return {
        type: 'quota',
        message: ERROR_MESSAGES.quota.message,
        action: ERROR_MESSAGES.quota.action,
        details: ERROR_MESSAGES.quota.details,
        timestamp: now,
      }
    }
  }

  // Default to unknown error
  return {
    type: 'unknown',
    message: ERROR_MESSAGES.unknown.message,
    action: ERROR_MESSAGES.unknown.action,
    details: ERROR_MESSAGES.unknown.details,
    timestamp: now,
  }
}

/**
 * Get user-friendly error message for display
 */
export function getUserMessage(errorContext: ErrorContext): string {
  return ERROR_MESSAGES[errorContext.type]?.message || errorContext.message
}

/**
 * Get action label button for error recovery
 */
export function getActionLabel(errorContext: ErrorContext): string {
  return ERROR_MESSAGES[errorContext.type]?.buttonLabel || 'Retry'
}
