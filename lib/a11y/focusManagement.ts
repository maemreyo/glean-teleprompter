/**
 * Focus management utilities for accessibility
 * Implements focus trapping for modals, focus restoration, and focusable element detection
 */

/**
 * CSS selectors for all focusable HTML elements
 * Based on WCAG 2.1 focusable elements definition
 */
const FOCUSABLE_SELECTORS = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]',
  'audio[controls]',
  'video[controls]',
  '[role="button"]:not([aria-disabled="true"])',
  '[role="link"]:not([aria-disabled="true"])',
].join(', ')

/**
 * Get all focusable elements within a container
 * @param container - The container element to search within
 * @param filterVisible - Whether to only return visible elements (default: true)
 * @returns Array of focusable elements in DOM order
 * 
 * @example
 * const container = document.querySelector('#modal')
 * const focusable = getFocusableElements(container)
 */
export function getFocusableElements(
  container: HTMLElement | null,
  filterVisible: boolean = true
): HTMLElement[] {
  if (!container) {
    return []
  }

  const focusable = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS))

  if (!filterVisible) {
    return focusable
  }

  // Filter out elements that are not visible
  return focusable.filter((element) => {
    // Check if element or its ancestors are hidden
    if (element.offsetParent === null && element.tagName !== 'BODY') {
      return false
    }

    // Check for visibility via computed styles
    const styles = window.getComputedStyle(element)
    if (styles.display === 'none' || styles.visibility === 'hidden' || styles.opacity === '0') {
      return false
    }

    // Check for hidden attribute
    if (element.hasAttribute('hidden') || element.getAttribute('aria-hidden') === 'true') {
      return false
    }

    return true
  })
}

/**
 * Get the first and last focusable elements in a container
 * Useful for implementing focus traps in modals
 * @param container - The container element
 * @returns Object with first and last focusable elements
 */
export function getFocusBoundaries(
  container: HTMLElement | null
): { first: HTMLElement | null; last: HTMLElement | null } {
  const focusable = getFocusableElements(container)
  
  if (focusable.length === 0) {
    return { first: null, last: null }
  }

  return {
    first: focusable[0],
    last: focusable[focusable.length - 1],
  }
}

/**
 * Store the currently focused element to restore later
 * Call this before opening a modal or dialog
 * @returns The active element or null
 */
export function captureFocus(): HTMLElement | null {
  return document.activeElement as HTMLElement | null
}

/**
 * Restore focus to a previously captured element
 * Call this when closing a modal or dialog
 * @param element - The element to restore focus to
 * @param fallback - Optional fallback element if primary element is no longer focusable
 */
export function restoreFocus(element: HTMLElement | null, fallback?: HTMLElement | null): void {
  if (!element) {
    if (fallback) {
      fallback.focus()
    }
    return
  }

  // Check if element is still in DOM and focusable
  if (!document.body.contains(element)) {
    if (fallback) {
      fallback.focus()
    }
    return
  }

  // Restore focus
  element.focus()
}

/**
 * Trap focus within a container (for modals/dialogs)
 * This sets up a keyboard event listener to keep focus within the container
 * @param container - The container element to trap focus within
 * @returns Cleanup function to remove the event listener
 * 
 * @example
 * const cleanup = trapFocus(modal)
 * // Later, when modal closes:
 * cleanup()
 */
export function trapFocus(container: HTMLElement): () => void {
  const { first, last } = getFocusBoundaries(container)

  if (!first || !last) {
    // No focusable elements, return empty cleanup
    return () => {}
  }

  // Focus the first element when trap is set up
  first.focus()

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key !== 'Tab' && event.key !== 'Shift+Tab') {
      return
    }

    // If no focusable elements, do nothing
    if (!document.body.contains(first) || !document.body.contains(last)) {
      return
    }

    // Get current focusable elements in case DOM changed
    const currentFocusable = getFocusableElements(container)
    if (currentFocusable.length === 0) {
      return
    }

    const newFirst = currentFocusable[0]
    const newLast = currentFocusable[currentFocusable.length - 1]
    const activeElement = document.activeElement

    // Tab forward
    if (!event.shiftKey && activeElement === newLast) {
      event.preventDefault()
      newFirst.focus()
    }

    // Tab backward (Shift+Tab)
    if (event.shiftKey && activeElement === newFirst) {
      event.preventDefault()
      newLast.focus()
    }
  }

  // Add event listener with capture phase to intercept before other handlers
  document.addEventListener('keydown', handleKeyDown, true)

  // Return cleanup function
  return () => {
    document.removeEventListener('keydown', handleKeyDown, true)
  }
}

/**
 * Move focus to the next or previous focusable element
 * @param container - The container element
 * @param direction - Direction to move ('next' or 'previous')
 * @param wrap - Whether to wrap around to beginning/end (default: true)
 * @returns The element that received focus, or null if no element found
 */
export function moveFocus(
  container: HTMLElement,
  direction: 'next' | 'previous',
  wrap: boolean = true
): HTMLElement | null {
  const focusable = getFocusableElements(container)
  const activeElement = document.activeElement

  if (focusable.length === 0) {
    return null
  }

  const currentIndex = focusable.indexOf(activeElement as HTMLElement)

  if (direction === 'next') {
    if (currentIndex === -1 || currentIndex === focusable.length - 1) {
      const target = wrap ? focusable[0] : null
      if (target) target.focus()
      return target
    }
    const target = focusable[currentIndex + 1]
    target.focus()
    return target
  } else {
    // previous
    if (currentIndex <= 0) {
      const target = wrap ? focusable[focusable.length - 1] : null
      if (target) target.focus()
      return target
    }
    const target = focusable[currentIndex - 1]
    target.focus()
    return target
  }
}

/**
 * Set focus to a specific element with a delay
 * Useful for focusing elements after animations or transitions
 * @param element - Element to focus
 * @param delay - Delay in milliseconds (default: 0)
 */
export function setFocusAfterDelay(element: HTMLElement | null, delay: number = 0): void {
  if (!element) {
    return
  }

  setTimeout(() => {
    element.focus()
  }, delay)
}

/**
 * Check if an element can receive focus
 * @param element - Element to check
 * @returns Whether element is focusable
 */
export function isFocusable(element: HTMLElement | null): boolean {
  if (!element || !document.body.contains(element)) {
    return false
  }

  // Check if disabled
  if (element.hasAttribute('disabled') || element.getAttribute('aria-disabled') === 'true') {
    return false
  }

  // Check visibility
  const styles = window.getComputedStyle(element)
  if (styles.display === 'none' || styles.visibility === 'hidden') {
    return false
  }

  // Check if it matches one of the focusable selectors
  return element.matches(FOCUSABLE_SELECTORS)
}

/**
 * Create a focus scope for a specific region
 * Similar to trapFocus but more flexible - allows focus to move outside
 * but maintains a reference point to return to
 * @param container - The container element
 * @returns Object with enter and exit functions
 * 
 * @example
 * const scope = createFocusScope(modal)
 * scope.enter() // Sets up scope and focuses first element
 * // ... later
 * scope.exit() // Restores focus to element before scope
 */
export function createFocusScope(container: HTMLElement) {
  let previousFocus: HTMLElement | null = null
  let cleanupTrap: (() => void) | null = null

  return {
    /**
     * Enter the focus scope
     * Captures current focus and sets up trap
     */
    enter: () => {
      previousFocus = captureFocus()
      cleanupTrap = trapFocus(container)
    },

    /**
     * Exit the focus scope
     * Removes trap and restores previous focus
     */
    exit: () => {
      cleanupTrap?.()
      restoreFocus(previousFocus)
      previousFocus = null
      cleanupTrap = null
    },
  }
}

/**
 * Get the interactive parent (closest interactive element)
 * Useful for determining the actionable element for keyboard events
 * @param element - Starting element
 * @returns The closest interactive parent, or the element itself if interactive
 */
export function getInteractiveParent(element: HTMLElement | null): HTMLElement | null {
  if (!element || element === document.body) {
    return null
  }

  if (isFocusable(element)) {
    return element
  }

  return getInteractiveParent(element.parentElement)
}
