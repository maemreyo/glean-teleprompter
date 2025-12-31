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
} as const
