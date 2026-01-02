/**
 * Store Helpers for Playwright E2E Tests
 *
 * Provides type-safe access to Zustand stores exposed via window object
 * for browser evaluation during Playwright tests.
 *
 * Stores exposed to window (non-production only):
 * - window.__CONTENT_STORE__: Content store (text, bgUrl, musicUrl, isReadOnly)
 */

/**
 * Content Store State Interface
 * Matches the ContentStore type in lib/stores/useContentStore.ts
 */
export interface ContentStoreState {
  text: string
  bgUrl: string
  musicUrl: string
  isReadOnly: boolean
}

/**
 * Content Store Actions Interface
 */
export interface ContentStoreActions {
  setText: (text: string) => void
  setBgUrl: (url: string) => void
  setMusicUrl: (url: string) => void
  setIsReadOnly: (readOnly: boolean) => void
  setAll: (state: Partial<ContentStoreState>) => void
  reset: () => void
  resetContent: () => void
  resetMedia: () => void
}

/**
 * Full Content Store Interface (State + Actions)
 */
export interface ContentStore extends ContentStoreState, ContentStoreActions {}

/**
 * Window Store Interface
 * Defines the shape of exposed stores on window object
 */
export interface WindowStores {
  __CONTENT_STORE__?: {
    getState: () => ContentStore
    setState: (partial: Partial<ContentStore>) => void
    subscribe: (listener: (state: ContentStore, prevState: ContentStore) => void) => () => void
  }
}

/**
 * Extended Window interface for Playwright page evaluation
 */
export interface PlaywrightWindow extends Window {
  __CONTENT_STORE__?: {
    getState: () => ContentStore
    setState: (partial: Partial<ContentStore>) => void
    subscribe: (listener: (state: ContentStore, prevState: ContentStore) => void) => () => void
  }
}

/**
 * Store Helper Class
 * Provides type-safe methods to interact with stores via window
 */
export class StoreHelper {
  /**
   * Get the current content store state
   * @returns Current content store state or null if not available
   */
  static getContentState(): ContentStoreState | null {
    if (typeof window === 'undefined') return null
    const win = window as PlaywrightWindow
    const store = win.__CONTENT_STORE__
    return store ? store.getState() : null
  }

  /**
   * Set content store state
   * @param partial Partial state to update
   */
  static setContentState(partial: Partial<ContentStoreState>): void {
    if (typeof window === 'undefined') return
    const win = window as PlaywrightWindow
    const store = win.__CONTENT_STORE__
    if (store) {
      store.setState(partial)
    }
  }

  /**
   * Set the background URL (bgUrl) in content store
   * @param url The background image URL to set
   */
  static setBgUrl(url: string): void {
    this.setContentState({ bgUrl: url })
  }

  /**
   * Set the text content in content store
   * @param text The teleprompter text content
   */
  static setText(text: string): void {
    this.setContentState({ text })
  }

  /**
   * Set the music URL in content store
   * @param url The background music URL
   */
  static setMusicUrl(url: string): void {
    this.setContentState({ musicUrl: url })
  }

  /**
   * Set the read-only state in content store
   * @param readOnly Whether the editor is read-only
   */
  static setIsReadOnly(readOnly: boolean): void {
    this.setContentState({ isReadOnly: readOnly })
  }

  /**
   * Reset content store to default values
   */
  static resetContentStore(): void {
    if (typeof window === 'undefined') return
    const win = window as PlaywrightWindow
    const store = win.__CONTENT_STORE__
    if (store) {
      const state = store.getState()
      state.reset()
    }
  }

  /**
   * Reset media properties only (bgUrl, musicUrl)
   */
  static resetMedia(): void {
    if (typeof window === 'undefined') return
    const win = window as PlaywrightWindow
    const store = win.__CONTENT_STORE__
    if (store) {
      const state = store.getState()
      state.resetMedia()
    }
  }

  /**
   * Subscribe to content store changes
   * @param listener Callback function for state changes
   * @returns Unsubscribe function
   */
  static subscribeToContent(
    listener: (state: ContentStore, prevState: ContentStore) => void
  ): (() => void) | null {
    if (typeof window === 'undefined') return null
    const win = window as PlaywrightWindow
    const store = win.__CONTENT_STORE__
    return store ? store.subscribe(listener) : null
  }
}

/**
 * Playwright-specific evaluation helpers
 * These are meant to be used with page.evaluate() in Playwright tests
 */

/**
 * JavaScript code string to get content state in page.evaluate()
 */
export const GET_CONTENT_STATE = `
  () => {
    const store = window.__CONTENT_STORE__;
    return store ? store.getState() : null;
  }
`

/**
 * JavaScript code string to set bgUrl in page.evaluate()
 */
export const SET_BG_URL = (url: string) => `
  () => {
    const store = window.__CONTENT_STORE__;
    if (store) {
      store.setState({ bgUrl: '${url}' });
    }
  }
`

/**
 * JavaScript code string to set text in page.evaluate()
 */
export const SET_TEXT = (text: string) => `
  () => {
    const store = window.__CONTENT_STORE__;
    if (store) {
      store.setState({ text: ${JSON.stringify(text)} });
    }
  }
`

/**
 * JavaScript code string to reset content store in page.evaluate()
 */
export const RESET_CONTENT_STORE = `
  () => {
    const store = window.__CONTENT_STORE__;
    if (store) {
      const state = store.getState();
      state.reset();
    }
  }
`

/**
 * JavaScript code string to reset media in page.evaluate()
 */
export const RESET_MEDIA = `
  () => {
    const store = window.__CONTENT_STORE__;
    if (store) {
      const state = store.getState();
      state.resetMedia();
    }
  }
`

/**
 * JavaScript code string to check if store is available in page.evaluate()
 */
export const CHECK_STORE_AVAILABLE = `
  () => {
    return typeof window.__CONTENT_STORE__ !== 'undefined';
  }
`

/**
 * Utility function to wait for store to be available on window
 * Useful in tests that need to ensure the store is exposed before proceeding
 */
export async function waitForStore(page: any, timeout = 5000): Promise<boolean> {
  const startTime = Date.now()
  while (Date.now() - startTime < timeout) {
    const isAvailable = await page.evaluate(CHECK_STORE_AVAILABLE)
    if (isAvailable) return true
    await page.waitForTimeout(100)
  }
  return false
}

/**
 * Example usage in Playwright tests:
 *
 * // Get current state
 * const state = await page.evaluate(GET_CONTENT_STATE);
 *
 * // Set background URL
 * await page.evaluate(SET_BG_URL('https://example.com/image.jpg'));
 *
 * // Reset media
 * await page.evaluate(RESET_MEDIA);
 *
 * // Wait for store availability
 * await waitForStore(page);
 */
