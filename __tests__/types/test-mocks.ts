/**
 * Type definitions for test mocks and utilities
 * These types support the Studio page test suite
 */

import { ReactElement } from 'react';

// ============================================================================
// Store Types
// ============================================================================

export type FontStyle = 'Classic' | 'Modern' | 'Typewriter' | 'Novel' | 'Neon';
export type TextAlign = 'left' | 'center';
export type StudioMode = 'setup' | 'run';

/**
 * Mock Teleprompter Store interface
 */
export interface MockTeleprompterStore {
  // State
  text: string;
  bgUrl: string;
  musicUrl: string;
  font: FontStyle;
  colorIndex: number;
  speed: number;
  fontSize: number;
  align: TextAlign;
  lineHeight: number;
  margin: number;
  overlayOpacity: number;
  mode: StudioMode;
  isReadOnly: boolean;
  
  // Methods (jest mock functions)
  setText: jest.Mock;
  setBgUrl: jest.Mock;
  setMusicUrl: jest.Mock;
  setAll: jest.Mock;
}

/**
 * Mock Config Store interface
 */
export interface MockConfigStore {
  typography?: {
    fontFamily: string;
    fontSize: number;
    lineHeight: number;
    align: string;
  };
  colors?: {
    colorIndex: number;
  };
  effects?: {
    shadow?: { enabled: boolean };
    glow?: { enabled: boolean; color: string };
  };
  
  // Methods
  setAll: jest.Mock;
  getState: jest.Mock;
}

/**
 * Mock Demo Store interface
 */
export interface MockDemoStore {
  isDemoMode: boolean;
  setDemoMode: jest.Mock;
}

// ============================================================================
// Toast Types
// ============================================================================

/**
 * Mock Toast interface
 */
export interface MockToast {
  success: jest.Mock;
  error: jest.Mock;
  info: jest.Mock;
  warning: jest.Mock;
  promise: jest.Mock;
}

// ============================================================================
// localStorage Types
// ============================================================================

/**
 * Mock localStorage interface
 */
export interface MockLocalStorage {
  getItem: jest.Mock;
  setItem: jest.Mock;
  removeItem: jest.Mock;
  clear: jest.Mock;
  length: number;
  key: jest.Mock;
  
  // Error simulation methods
  simulateQuotaExceeded: () => void;
  simulateCorruptedData: (key: string) => void;
  simulateDisabled: () => void;
  reset: () => void;
}

// ============================================================================
// URL Search Params Types
// ============================================================================

/**
 * Mock SearchParams interface
 */
export interface MockSearchParams {
  get: jest.Mock;
  has: jest.Mock;
  entries: jest.Mock;
  keys: jest.Mock;
  values: jest.Mock;
  forEach: jest.Mock;
  toString: jest.Mock;
}

// ============================================================================
// Action Mock Types
// ============================================================================

/**
 * Script Action Result interface
 */
export interface ScriptActionResult {
  success: boolean;
  error?: string;
  script?: {
    content: string;
    bg_url: string;
    music_url: string;
    config?: Record<string, unknown>;
    settings?: {
      font: string;
      colorIndex: number;
      speed: number;
      fontSize: number;
      align: string;
      lineHeight: number;
      margin: number;
      overlayOpacity: number;
    };
  };
}

/**
 * Mock loadScriptAction interface
 */
export interface MockLoadScriptAction {
  (scriptId: string): Promise<ScriptActionResult>;
  
  // Helper methods for test control
  __setMockResult: (result: ScriptActionResult) => void;
  __setMockError: (error: string) => void;
  __setDelay: (ms: number) => void;
  __reset: () => void;
}

/**
 * Template Result interface
 */
export interface TemplateResult {
  id: string;
  name: string;
  content: string;
  settings: {
    font: FontStyle;
    colorIndex?: number;
    speed?: number;
    fontSize?: number;
    align?: TextAlign;
    lineHeight?: number;
    margin?: number;
    overlayOpacity?: number;
  };
}

/**
 * Mock getTemplateById interface
 */
export interface MockGetTemplateById {
  (templateId: string): TemplateResult | null;
  
  // Helper methods for test control
  __setMockTemplate: (template: TemplateResult) => void;
  __setNull: () => void;
  __reset: () => void;
}

// ============================================================================
// Test Helper Types
// ============================================================================

/**
 * Timer control interface
 */
export interface TimerControl {
  useFakeTimers: () => void;
  useRealTimers: () => void;
  advanceTimersByTime: (ms: number) => void;
  runAllTimers: () => void;
  runOnlyPendingTimers: () => void;
  advanceTimersToNextTimer: () => number;
  clearAllTimers: () => void;
  getTimerCount: () => number;
}

/**
 * Test render options interface
 */
export interface TestRenderOptions {
  mockStores?: {
    teleprompter?: Partial<MockTeleprompterStore>;
    config?: Partial<MockConfigStore>;
    demo?: Partial<MockDemoStore>;
  };
  mockSearchParams?: Record<string, string | null>;
  mockLocalStorage?: Record<string, string>;
  mockToast?: boolean;
  mockAnimatePresence?: boolean;
}

/**
 * Test render result interface
 */
export interface TestRenderResult {
  container: HTMLElement;
  baseElement: HTMLElement;
  debug: (element?: HTMLElement) => void;
  rerender: (ui: ReactElement) => void;
  unmount: () => void;
}

// ============================================================================
// Component Mock Types
// ============================================================================

/**
 * Mock Editor component interface
 */
export interface MockEditor {
  displayName: string;
  render: () => ReactElement;
}

/**
 * Mock Runner component interface
 */
export interface MockRunner {
  displayName: string;
  render: () => ReactElement;
}

/**
 * Mock AnimatePresence interface
 */
export interface MockAnimatePresence {
  displayName: string;
  render: () => ReactElement;
  __getExitDuration: () => number;
  __getEnterDuration: () => number;
  __waitForTransition: () => Promise<void>;
}
