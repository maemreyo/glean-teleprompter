/**
 * Mock Framer Motion
 * Mocks the framer-motion library, specifically AnimatePresence
 */

import { ReactElement } from 'react';

/**
 * Mock AnimatePresence component
 */
export const mockAnimatePresence = ({ children }: { children: ReactElement; mode?: string }) => {
  return <>{children}</>;
};

/**
 * Mock motion.div component
 */
export const mockMotionDiv = ({ children, ...props }: { children?: ReactElement; [key: string]: unknown }) => {
  return <div {...props}>{children}</div>;
};

/**
 * Wait for AnimatePresence transition to complete
 */
export function waitForTransition(ms = 500): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Get exit animation duration
 */
export function getExitDuration(): number {
  return 300; // Default exit duration
}

/**
 * Get enter animation duration
 */
export function getEnterDuration(): number {
  return 300; // Default enter duration
}

// Set up the Jest mock for framer-motion
jest.mock('framer-motion', () => ({
  AnimatePresence: mockAnimatePresence,
  motion: {
    div: mockMotionDiv
  }
}));
