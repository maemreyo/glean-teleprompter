/**
 * ARIA label generators for accessible UI components
 * These functions generate dynamic, descriptive ARIA labels for screen readers
 */

/**
 * Generate ARIA label for config tab buttons
 * @param label - Tab label (e.g., "Typography", "Colors")
 * @param index - Tab index (0-based)
 * @param total - Total number of tabs
 * @returns ARIA label string
 * 
 * @example
 * configTab('Typography', 0, 7) // "Typography tab, 1 of 7"
 * configTab('Colors', 2, 7) // "Colors tab, 3 of 7"
 */
export function configTab(label: string, index: number, total: number): string {
  return `${label} tab, ${index + 1} of ${total}`
}

/**
 * Generate ARIA label for color swatches
 * @param color - Color hex code or color name
 * @returns ARIA label string
 * 
 * @example
 * colorSwatch('#ffffff') // "Color, white"
 * colorSwatch('#ff0000') // "Color, red"
 * colorSwatch('#00ff00') // "Color, green"
 */
export function colorSwatch(color: string): string {
  // Named colors mapping for better accessibility
  const namedColors: Record<string, string> = {
    '#ffffff': 'white',
    '#000000': 'black',
    '#ff0000': 'red',
    '#00ff00': 'green',
    '#0000ff': 'blue',
    '#ffff00': 'yellow',
    '#ff00ff': 'magenta',
    '#00ffff': 'cyan',
    '#fbbf24': 'amber',
    '#f87171': 'light red',
    '#4ade80': 'light green',
    '#60a5fa': 'light blue',
    '#f472b6': 'pink',
    '#a78bfa': 'purple',

  }

  const colorLower = color.toLowerCase()
  const name = namedColors[colorLower] || colorLower
  
  return `Color, ${name}`
}

/**
 * Generate ARIA label for slider controls
 * @param label - Control label (e.g., "Font size", "Opacity")
 * @param value - Current value
 * @param unit - Unit of measurement (e.g., "pixels", "percent")
 * @returns ARIA label string
 * 
 * @example
 * slider('Font size', 48, 'pixels') // "Font size, 48 pixels"
 * slider('Opacity', 50, 'percent') // "Opacity, 50 percent"
 */
export function slider(label: string, value: number, unit: string): string {
  return `${label}, ${value} ${unit}`
}

/**
 * Generate ARIA label for expandable sections
 * @param label - Section label
 * @param isExpanded - Whether section is currently expanded
 * @returns ARIA label string
 * 
 * @example
 * expandableSection('Preview panel', true) // "Preview panel, expanded"
 * expandableSection('Preview panel', false) // "Preview panel, collapsed"
 */
export function expandableSection(label: string, isExpanded: boolean): string {
  return `${label}, ${isExpanded ? 'expanded' : 'collapsed'}`
}

/**
 * Generate ARIA label for toggle buttons
 * @param label - Button label
 * @param isPressed - Whether toggle is pressed/active
 * @returns ARIA label string
 * 
 * @example
 * toggleButton('Mute', true) // "Mute, on"
 * toggleButton('Mute', false) // "Mute, off"
 */
export function toggleButton(label: string, isPressed: boolean): string {
  return `${label}, ${isPressed ? 'on' : 'off'}`
}

/**
 * Generate ARIA label for selected items in lists
 * @param label - Item label
 * @param isSelected - Whether item is selected
 * @param index - Item index (optional)
 * @returns ARIA label string
 * 
 * @example
 * listItem('Typography', true) // "Typography, selected"
 * listItem('Colors', false, 2) // "Colors, 3"
 */
export function listItem(label: string, isSelected: boolean, index?: number): string {
  const selectedText = isSelected ? ', selected' : ''
  const indexText = index !== undefined ? `, ${index + 1}` : ''
  return `${label}${indexText}${selectedText}`
}

/**
 * Generate ARIA label for status indicators
 * @param status - Status type
 * @returns ARIA label string
 * 
 * @example
 * statusIndicator('saving') // "Status, saving"
 * statusIndicator('saved') // "Status, saved"
 * statusIndicator('error') // "Status, error"
 */
export function statusIndicator(status: 'idle' | 'saving' | 'saved' | 'error'): string {
  const statusMap = {
    idle: 'idle',
    saving: 'saving',
    saved: 'saved',
    error: 'error',
  }
  return `Status, ${statusMap[status]}`
}

/**
 * Generate ARIA label for keyboard shortcut hints
 * @param action - Action description
 * @param shortcut - Keyboard shortcut (e.g., "Ctrl+Z", "Cmd+S")
 * @returns ARIA label string
 * 
 * @example
 * keyboardHint('Undo', 'Ctrl+Z') // "Undo, keyboard shortcut: Control Z"
 * keyboardHint('Save', 'Cmd+S') // "Save, keyboard shortcut: Command S"
 */
export function keyboardHint(action: string, shortcut: string): string {
  // Format shortcuts for screen readers
  const formattedShortcut = shortcut
    .replace('Ctrl', 'Control')
    .replace('Cmd', 'Command')
    .replace('Opt', 'Option')
    .replace(/\+/g, ' ')
  
  return `${action}, keyboard shortcut: ${formattedShortcut}`
}

/**
 * Generate ARIA label for dialog/modal announcements
 * @param title - Dialog title
 * @param description - Dialog description
 * @returns ARIA label string
 * 
 * @example
 * dialogAnnouncement('Keyboard Shortcuts', 'Showing all available keyboard shortcuts')
 * // "Dialog opened: Keyboard Shortcuts. Showing all available keyboard shortcuts"
 */
export function dialogAnnouncement(title: string, description: string): string {
  return `Dialog opened: ${title}. ${description}`
}

/**
 * Generate ARIA label for draft list
 * @param count - Number of drafts in the list
 * @returns ARIA label string
 */
export function draftList(count: number): string {
  return `List of saved drafts, ${count} ${count === 1 ? 'draft' : 'drafts'}`
}

/**
 * Generate ARIA label for draft restore action
 * @param timestamp - Draft timestamp in milliseconds
 * @returns ARIA label string
 */
export function restoreDraft(timestamp: number): string {
  const date = new Date(timestamp)
  const relativeTime = formatRelativeTime(date)
  return `Restore draft from ${relativeTime}`
}

/**
 * Generate ARIA label for draft delete action
 * @param timestamp - Draft timestamp in milliseconds
 * @returns ARIA label string
 */
export function deleteDraft(timestamp: number): string {
  const date = new Date(timestamp)
  const relativeTime = formatRelativeTime(date)
  return `Delete draft from ${relativeTime}`
}

/**
 * Generate ARIA label for draft item in list
 * @param timestamp - Draft timestamp in milliseconds
 * @param index - Item index (0-based)
 * @param total - Total number of drafts
 * @param isSelected - Whether draft is selected for bulk actions
 * @returns ARIA label string
 */
export function draftListItem(
  timestamp: number,
  index: number,
  total: number,
  isSelected: boolean = false
): string {
  const date = new Date(timestamp)
  const relativeTime = formatRelativeTime(date)
  const selectedText = isSelected ? ', selected' : ''
  return `Draft from ${relativeTime}, ${index + 1} of ${total}${selectedText}`
}

/**
 * Generate ARIA label for auto-save status
 * @param status - Current save status
 * @param lastSaved - Timestamp of last save (optional)
 * @returns ARIA label string
 */
export function autoSaveStatus(
  status: 'idle' | 'saving' | 'saved' | 'error',
  lastSaved?: number
): string {
  const statusMap = {
    idle: 'No changes to save',
    saving: 'Saving draft...',
    saved: lastSaved ? `Saved ${formatRelativeTime(new Date(lastSaved))}` : 'Draft saved',
    error: 'Save failed, retrying...',
  }
  return statusMap[status]
}

/**
 * Generate ARIA label for storage quota warning
 * @param percentage - Storage usage percentage
 * @returns ARIA label string
 */
export function storageQuotaWarning(percentage: number): string {
  if (percentage >= 100) {
    return `Storage full. Clear old drafts to continue saving.`
  }
  if (percentage >= 90) {
    return `Storage almost full, ${percentage.toFixed(0)}% used. Consider clearing old drafts.`
  }
  return `Storage ${percentage.toFixed(0)}% full`
}

/**
 * Generate ARIA label for private browsing warning
 * @returns ARIA label string
 */
export function privateBrowsingWarning(): string {
  return `Private browsing detected. Your drafts will not be saved after you close this session.`
}

/**
 * Generate ARIA label for cleanup old drafts button
 * @param count - Number of drafts that would be deleted
 * @returns ARIA label string
 */
export function cleanupOldDrafts(count?: number): string {
  if (count !== undefined) {
    return `Clear ${count} old ${count === 1 ? 'draft' : 'drafts'} older than 30 days`
  }
  return 'Clear old drafts'
}

/**
 * T045 [Phase 6]: Generate ARIA label for Quick Settings panel
 * @param isOpen - Whether the panel is currently open
 * @returns ARIA label string
 *
 * @example
 * quickSettingsPanel(true) // "Quick Settings panel, open"
 * quickSettingsPanel(false) // "Quick Settings panel, closed"
 */
export function quickSettingsPanel(isOpen: boolean): string {
  return `Quick Settings panel, ${isOpen ? 'open' : 'closed'}`
}

/**
 * T045 [Phase 6]: Generate ARIA label for Quick Settings controls
 */

/**
 * Generate ARIA label for scroll speed control
 * @param speed - Current scroll speed value
 * @returns ARIA label string
 *
 * @example
 * quickSettingsScrollSpeed(50) // "Scroll speed, 50 pixels per second"
 */
export function quickSettingsScrollSpeed(speed: number): string {
  return `Scroll speed, ${speed} pixels per second`
}

/**
 * Generate ARIA label for font size control
 * @param fontSize - Current font size in pixels
 * @returns ARIA label string
 *
 * @example
 * quickSettingsFontSize(60) // "Font size, 60 pixels"
 */
export function quickSettingsFontSize(fontSize: number): string {
  return `Font size, ${fontSize} pixels`
}

/**
 * Generate ARIA label for text alignment control
 * @param align - Current text alignment
 * @returns ARIA label string
 *
 * @example
 * quickSettingsTextAlign('left') // "Text alignment, left"
 * quickSettingsTextAlign('center') // "Text alignment, center"
 * quickSettingsTextAlign('right') // "Text alignment, right"
 */
export function quickSettingsTextAlign(align: 'left' | 'center' | 'right'): string {
  return `Text alignment, ${align}`
}

/**
 * Generate ARIA label for background URL input
 * @param hasUrl - Whether a URL is currently set
 * @returns ARIA label string
 *
 * @example
 * quickSettingsBgUrl(true) // "Background image, URL set"
 * quickSettingsBgUrl(false) // "Background image, no URL"
 */
export function quickSettingsBgUrl(hasUrl: boolean): string {
  return `Background image, ${hasUrl ? 'URL set' : 'no URL'}`
}

/**
 * Generate ARIA label for Quick Settings modified indicator
 * @param isModified - Whether settings have been modified from defaults
 * @returns ARIA label string
 *
 * @example
 * quickSettingsModified(true) // "Settings modified from defaults"
 * quickSettingsModified(false) // "Settings at default values"
 */
export function quickSettingsModified(isModified: boolean): string {
  return `Settings ${isModified ? 'modified from defaults' : 'at default values'}`
}

/**
 * Generate ARIA label for Quick Settings close button
 * @returns ARIA label string
 */
export function quickSettingsClose(): string {
  return 'Close Quick Settings panel'
}

/**
 * Format relative time for accessibility
 * @param date - Date to format
 * @returns Relative time string
 */
function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`
  if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`
  if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`
  
  // For older drafts, use absolute date
  return date.toLocaleDateString()
}

/**
 * Combined ARIA_LABELS constant object for easy import
 */
export const ARIA_LABELS = {
  configTab,
  colorSwatch,
  slider,
  expandableSection,
  toggleButton,
  listItem,
  statusIndicator,
  keyboardHint,
  dialogAnnouncement,
  draftList,
  restoreDraft,
  deleteDraft,
  draftListItem,
  autoSaveStatus,
  storageQuotaWarning,
  privateBrowsingWarning,
  cleanupOldDrafts,
  // T045 [Phase 6]: Quick Settings labels
  quickSettingsPanel,
  quickSettingsScrollSpeed,
  quickSettingsFontSize,
  quickSettingsTextAlign,
  quickSettingsBgUrl,
  quickSettingsModified,
  quickSettingsClose,
} as const
