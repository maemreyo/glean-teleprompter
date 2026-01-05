/**
 * NoSleep.js TypeScript Declarations
 * Feature: 012-standalone-story
 * 
 * NoSleep.js is a library for keeping the screen awake on devices that don't support
 * the Wake Lock API (primarily Safari/iOS).
 * 
 * @see https://github.com/richtr/NoSleep.js
 */

declare class NoSleep {
  /**
   * Creates a new NoSleep instance
   */
  constructor();

  /**
   * Enables the wake lock
   * This must be triggered by a user action (click, tap, keypress)
   */
  enable(): void;

  /**
   * Disables the wake lock
   */
  disable(): void;

  /**
   * Checks if the wake lock is currently enabled
   */
  readonly isEnabled: boolean;
}

declare module 'nosleep.js' {
  export default NoSleep;
}

// Also support default import from the package
declare module '@types/nosleep.js' {
  export default NoSleep;
}
