/**
 * Type definitions for Studio UI/UX components
 * Feature: 004-studio-ui-ux-improvements
 * 
 * This file centralizes TypeScript types for all new UI components
 * to enable better reusability and type safety across the application.
 */

// ==================== Auto-Save Types ====================

/**
 * Auto-save status states
 */
export type AutoSaveStatusType = 'idle' | 'saving' | 'saved' | 'error'

/**
 * Auto-save status tracking
 */
export interface AutoSaveStatus {
  /** Current status of auto-save */
  status: AutoSaveStatusType
  /** Timestamp when last successful save occurred (milliseconds since epoch) */
  lastSavedAt?: number
  /** Error message when status is 'error' */
  errorMessage?: string
  /** Number of retry attempts attempted */
  retryCount?: number
}

/**
 * Props for AutoSaveStatus component
 */
export interface AutoSaveStatusProps {
  /** Current auto-save status */
  status: AutoSaveStatusType
  /** Timestamp when last save occurred (for 'saved' status) */
  lastSavedAt?: number
  /** Error message to display when status is 'error' */
  errorMessage?: string
  /** Optional retry callback for error state */
  onRetry?: () => void
  /** Additional CSS classes */
  className?: string
}

// ==================== Textarea Types ====================

/**
 * Textarea size options
 */
export type TextareaSize = 'default' | 'medium' | 'large' | 'fullscreen' | 'custom'

/**
 * Textarea user preferences
 */
export interface TextareaPreferences {
  /** Current textarea size */
  size: TextareaSize
  /** Custom height in pixels (when size is 'custom') */
  customHeight?: number
  /** Whether textarea is in fullscreen mode */
  isFullscreen: boolean
}

/**
 * Props for TextareaExpandButton component
 */
export interface TextareaExpandButtonProps {
  /** Current textarea size */
  currentSize: TextareaSize
  /** Callback when button is clicked */
  onToggle: () => void
  /** Whether the button is disabled */
  disabled?: boolean
}

// ==================== Footer Types ====================

/**
 * Footer state management
 */
export interface FooterState {
  /** Whether footer is collapsed to minimized state */
  isCollapsed: boolean
  /** Timestamp when footer was collapsed (milliseconds since epoch) */
  collapsedSince?: number
}

/**
 * Props for Footer component
 */
export interface FooterProps {
  /** Current footer state */
  state: FooterState
  /** Callback when toggle button is clicked */
  onToggle: () => void
  /** Additional CSS classes */
  className?: string
}

// ==================== Preview Panel Types ====================

/**
 * Preview panel state for mobile/tablet
 */
export interface PreviewPanelState {
  /** Whether preview panel is open */
  isOpen: boolean
  /** Timestamp when preview was last toggled (milliseconds since epoch) */
  lastToggledAt?: number
}

/**
 * Viewport breakpoint types
 */
export type ViewportType = 'mobile' | 'tablet' | 'desktop'

/**
 * Props for PreviewPanel component
 */
export interface PreviewPanelProps {
  /** Current preview panel state */
  state: PreviewPanelState
  /** Current viewport type */
  viewport: ViewportType
  /** Callback when panel is toggled */
  onToggle: () => void
  /** Children to render in preview */
  children?: React.ReactNode
}

// ==================== Error Types ====================

/**
 * Error message types for contextual error handling
 */
export type ErrorMessageType = 'network' | 'not_found' | 'permission' | 'quota' | 'unknown'

/**
 * Action types for error recovery
 */
export type ErrorAction = 'retry' | 'browse_templates' | 'sign_up' | 'none'

/**
 * Error context for contextual error messages
 */
export interface ErrorContext {
  /** Type of error that occurred */
  type: ErrorMessageType
  /** User-facing error message */
  message: string
  /** Additional error details */
  details?: string
  /** Timestamp when error occurred (milliseconds since epoch) */
  timestamp: number
  /** Suggested action for recovery */
  action?: ErrorAction
}

/**
 * Error message configuration
 */
export interface ErrorMessage {
  /** User-facing message */
  message: string
  /** Recovery action */
  action: ErrorAction
  /** Additional details */
  details: string
  /** Button label for action */
  buttonLabel?: string
}

/**
 * Props for ErrorDialog component
 */
export interface ErrorDialogProps {
  /** Error context to display */
  errorContext: ErrorContext | null
  /** Optional retry callback */
  onRetry?: () => void
  /** Script ID if error is related to a specific script */
  scriptId?: string
}

/**
 * Mapping of error types to error messages
 */
export type ErrorMessagesMap = Record<ErrorMessageType, ErrorMessage>

// ==================== Keyboard Shortcuts Types ====================

/**
 * Keyboard shortcuts statistics for discoverability
 */
export interface KeyboardShortcutsStats {
  /** Number of sessions user has opened Studio */
  sessionsCount: number
  /** Number of times shortcuts modal has been opened */
  modalOpenedCount: number
  /** Array of tips that have been shown to user */
  tipsShown: string[]
  /** Timestamp of last session (milliseconds since epoch) */
  lastSessionAt?: number
}

/**
 * Keyboard shortcut category
 */
export type ShortcutCategory = 'editing' | 'navigation' | 'config' | 'media' | 'general'

/**
 * Keyboard shortcut definition
 */
export interface KeyboardShortcut {
  /** Unique identifier for the shortcut */
  id: string
  /** Category the shortcut belongs to */
  category: ShortcutCategory
  /** Display label for the shortcut */
  label: string
  /** Description of what the shortcut does */
  description?: string
  /** Keyboard keys (e.g., 'Ctrl+Z', 'Cmd+Z') */
  keys: string[]
  /** i18n key for the label */
  labelKey: string
}

/**
 * Props for KeyboardShortcutsModal component
 */
export interface KeyboardShortcutsModalProps {
  /** Whether modal is open */
  open: boolean
  /** Callback to close modal */
  onClose: () => void
  /** Shortcuts to display */
  shortcuts: KeyboardShortcut[]
  /** Current search query */
  searchQuery?: string
  /** Callback when search query changes */
  onSearchChange?: (query: string) => void
}

// ==================== Loading States Types ====================

/**
 * Loading state for Studio page
 */
export type StudioLoadingState = 'initial' | 'loading_script' | 'loading_template' | 'ready' | 'error'

/**
 * Props for StudioLoadingScreen component
 */
export interface StudioLoadingScreenProps {
  /** Current loading state */
  state: StudioLoadingState
  /** Optional progress value (0-100) */
  progress?: number
  /** Optional message to display */
  message?: string
}

/**
 * Skeleton variant type
 */
export type SkeletonVariant = 'content' | 'config' | 'preview'

// ==================== Tab Navigation Types ====================

/**
 * Props for TabBottomSheet component
 */
export interface TabBottomSheetProps {
  /** Whether bottom sheet is open */
  open: boolean
  /** Callback to close bottom sheet */
  onClose: () => void
  /** Available tabs */
  tabs: TabDefinition[]
  /** Currently selected tab */
  selectedTab: string
  /** Callback when tab is selected */
  onTabSelect: (tabId: string) => void
}

/**
 * Tab definition for tab navigation
 */
export interface TabDefinition {
  /** Unique tab identifier */
  id: string
  /** Display label */
  label: string
  /** Icon component */
  icon: React.ComponentType<{ className?: string }>
  /** i18n key for the label */
  labelKey: string
}

/**
 * Scroll indicators state for tab bar
 */
export interface TabScrollIndicators {
  /** Show left indicator */
  showLeft: boolean
  /** Show right indicator */
  showRight: boolean
}

// ==================== Performance Types ====================

/**
 * Performance monitoring data
 */
export interface PerformanceMetrics {
  /** Typing latency in milliseconds */
  typingLatency?: number
  /** Current frame rate */
  fps?: number
  /** Memory usage in bytes */
  memoryUsed?: number
  /** Timestamp of measurement */
  timestamp: number
}

/**
 * Props for performance warning component
 */
export interface PerformanceWarningProps {
  /** Character count threshold */
  threshold: number
  /** Current character count */
  current: number
  /** Callback to dismiss warning */
  onDismiss?: () => void
}

// ==================== A11y Types ====================

/**
 * ARIA label configuration
 */
export interface AriaLabelConfiguration {
  /** Label for the element */
  label: string
  /** Additional context for screen readers */
  description?: string
  /** Current state (e.g., 'selected', 'expanded') */
  state?: string
}

/**
 * Focus management options
 */
export interface FocusManagementOptions {
  /** Whether to trap focus within container */
  trapFocus?: boolean
  /** Whether to restore focus on unmount */
  restoreFocus?: boolean
  /** Initial element to focus */
  initialFocus?: HTMLElement | string
}

// ==================== Hook Return Types ====================

/**
 * Return type for useAutoSave hook
 */
export interface UseAutoSaveReturn {
  /** Current auto-save status */
  status: AutoSaveStatusType
  /** Timestamp of last successful save */
  lastSavedAt: number | null
  /** Error message if save failed */
  error: string | null
  /** Manually trigger a save */
  saveNow: () => Promise<void>
}

/**
 * Options for useAutoSave hook
 */
export interface UseAutoSaveOptions {
  /** Interval in milliseconds between auto-save attempts (default: 5000ms) */
  interval?: number
  /** Whether auto-save is enabled (default: true) */
  enabled?: boolean
  /** Custom storage key (default: 'teleprompter_draft') */
  storageKey?: string
  /** Debounce delay in milliseconds (default: 1000ms) */
  debounceMs?: number
}

/**
 * Return type for useMediaQuery hook
 */
export interface UseMediaQueryReturn {
  /** Current viewport type */
  viewport: ViewportType
  /** Whether screen width is less than 768px (mobile) */
  isMobile: boolean
  /** Whether screen width is between 768px and 1024px (tablet) */
  isTablet: boolean
  /** Whether screen width is 1024px or more (desktop) */
  isDesktop: boolean
}

/**
 * Return type for useKeyboardShortcuts hook
 */
export interface UseKeyboardShortcutsReturn {
  /** Registered shortcuts */
  shortcuts: KeyboardShortcut[]
  /** Register a new shortcut */
  registerShortcut: (shortcut: KeyboardShortcut) => void
  /** Unregister a shortcut */
  unregisterShortcut: (id: string) => void
  /** Check if a key combination is registered */
  isShortcutRegistered: (keys: string[]) => boolean
}

// ==================== Utility Types ====================

/**
 * Props with polymorphic 'as' prop
 */
export interface PolymorphicComponentProps<E extends React.ElementType> {
  /** Element to render as */
  as?: E
  /** Additional CSS classes */
  className?: string
  /** Children to render */
  children?: React.ReactNode
}

/**
 * Make specific props required, others optional
 */
export type RequireFields<T, K extends keyof T> = T & Required<Pick<T, K>>

/**
 * Omit specific keys from type
 */
export type OmitFields<T, K extends keyof T> = Omit<T, K>

/**
 * Partial type with specific keys required
 */
export type PartialWithRequired<T, K extends keyof T> = Partial<T> & Required<Pick<T, K>>
