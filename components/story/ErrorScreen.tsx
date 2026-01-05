"use client";

/**
 * Error Screen Component
 *
 * Display validation errors, wake lock errors, and URL decode errors.
 * Provides user-friendly error messages for story viewer failures.
 *
 * @feature 012-standalone-story
 */

import React from 'react';
import Link from 'next/link';

export type ErrorType =
  | 'invalid-json'
  | 'malformed-data'
  | 'schema-violation'
  | 'wake-lock-unavailable'
  | 'wake-lock-failed'
  | 'decode-error';

export interface ErrorScreenProps {
  type: ErrorType;
  details?: string[];
  onRetry?: () => void;
}

/**
 * Error screen for story viewer failures
 */
export function ErrorScreen({ type, details, onRetry }: ErrorScreenProps): React.JSX.Element {
  const errorConfig = getErrorConfig(type);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 dark:bg-gray-900">
      <div className="max-w-md rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
        {/* Error Icon */}
        <div className="mb-4 flex justify-center">
          <svg
            className="h-16 w-16 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        {/* Error Title */}
        <h1 className="mb-2 text-center text-2xl font-bold text-gray-900 dark:text-white">
          {errorConfig.title}
        </h1>

        {/* Error Message */}
        <p className="mb-6 text-center text-gray-600 dark:text-gray-400">
          {errorConfig.message}
        </p>

        {/* Error Details */}
        {details && details.length > 0 && (
          <div className="mb-6 rounded-md bg-red-50 p-4 dark:bg-red-900/20">
            <p className="mb-2 text-sm font-semibold text-red-800 dark:text-red-300">
              Error Details:
            </p>
            <ul className="list-inside list-disc space-y-1 text-sm text-red-700 dark:text-red-400">
              {details.map((detail, index) => (
                <li key={index}>{detail}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Retry Button */}
        {onRetry && (
          <div className="flex justify-center">
            <button
              onClick={onRetry}
              className="rounded-md bg-blue-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Help Link */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm text-blue-600 hover:underline dark:text-blue-400"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

/**
 * Get error configuration based on error type
 */
function getErrorConfig(type: ErrorType) {
  const configs: Record<ErrorType, { title: string; message: string }> = {
    'invalid-json': {
      title: 'Invalid Story Data',
      message:
        'The story data could not be loaded. Please check the URL or contact the story creator.',
    },
    'malformed-data': {
      title: 'Malformed Story',
      message:
        'The story data is corrupted or invalid. Please check the URL and try again.',
    },
    'schema-violation': {
      title: 'Invalid Story Format',
      message:
        'The story does not match the required format. Please contact the story creator.',
    },
    'wake-lock-unavailable': {
      title: 'Wake Lock Unavailable',
      message:
        'Screen wake lock is not available on this device. The teleprompter feature requires a browser that supports wake lock or an active internet connection.',
    },
    'wake-lock-failed': {
      title: 'Wake Lock Failed',
      message:
        'Failed to keep the screen awake. Your device may sleep during teleprompter use. Please try a different browser or check your connection.',
    },
    'decode-error': {
      title: 'Failed to Load Story',
      message:
        'Unable to decode the story data. The URL may be corrupted or too long. Please try a shorter story or check the URL.',
    },
  };

  return configs[type];
}
