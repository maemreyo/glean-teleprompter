# Implementation Tasks: Configuration Panel UI/UX Improvements

**Feature Branch**: `005-config-panel-improvements`  
**Created**: 2026-01-01  
**Status**: Draft  
**Plan**: [plan.md](plan.md)

## Task Organization

Tasks are organized by phase and user story, with dependencies clearly marked. Each task includes:
- **Priority**: P1 (Critical), P2 (Important), P3 (Enhancement)
- **Estimated Effort**: In days
- **Dependencies**: Tasks that must be completed first
- **Acceptance Criteria**: Specific conditions for task completion

## Phase 1: Critical Features

### Story 1.1: Config Panel Toggle

#### Task 1.1.1: Add Panel Visibility State to UI Store
**Priority**: P1  
**Estimated Effort**: 0.5 days  
**Dependencies**: None

**Description**: Add `configPanelVisible` state to UI store with localStorage persistence

**Implementation Steps**:
1. Add `configPanelVisible` boolean to UI store state
2. Add `toggleConfigPanel()` action to flip state
3. Add `setConfigPanelVisible(visible)` action to set specific state
4. Implement localStorage persistence on state change
5. Load initial state from localStorage on mount

**Acceptance Criteria**:
- [ ] `configPanelVisible` defaults to `false` for first-time users
- [ ] State persists to localStorage with key 'configPanelVisible'
- [ ] State loads correctly from localStorage on page refresh
- [ ] Toggle action flips state correctly

**Files**: `stores/useUIStore.ts`

---

#### Task 1.1.2: Create Config Toggle Button Component
**Priority**: P1  
**Estimated Effort**: 1 day  
**Dependencies**: Task 1.1.1

**Description**: Create toggle button in content panel header with Settings icon

**Implementation Steps**:
1. Create `ConfigToggleButton.tsx` component
2. Add Settings icon from lucide-react
3. Style: 44x44px minimum, positioned in header
4. Add hover/focus states with proper contrast
5. Add ARIA labels for accessibility
6. Wire click handler to `toggleConfigPanel()` action

**Acceptance Criteria**:
- [ ] Button renders in content panel header next to existing controls
- [ ] Button has minimum 44x44px touch target
- [ ] Settings icon displays correctly
- [ ] Hover/focus states provide visual feedback
- [ ] ARIA labels pass accessibility audit
- [ ] Click toggles panel visibility

**Files**: `components/teleprompter/editor/ContentPanel.tsx`, `components/teleprompter/editor/ConfigToggleButton.tsx` (new)

---

#### Task 1.1.3: Implement Panel Animation with Framer Motion
**Priority**: P1  
**Estimated Effort**: 1.5 days  
**Dependencies**: Task 1.1.1, Task 1.1.2

**Description**: Add smooth slide-in/slide-out animation for config panel

**Implementation Steps**:
1. Wrap ConfigPanel with `AnimatePresence` and `motion.div`
2. Configure initial, animate, exit variants for slide animation
3. Set transition duration to 300ms with ease-out timing
4. Add `prefers-reduced-motion` detection
5. Implement debounce mechanism (300ms lock)
6. Test animation performance on target devices

**Acceptance Criteria**:
- [ ] Panel slides in from right edge when opening
- [ ] Panel slides out to right edge when closing
- [ ] Animation completes in 300ms
- [ ] Animation respects `prefers-reduced-motion`
- [ ] Rapid toggles don't break animation (debounce works)
- [ ] No frame drops during animation (60 FPS)

**Files**: `components/teleprompter/Editor.tsx`, `components/teleprompter/config/ConfigPanel.tsx`

---

#### Task 1.1.4: Adjust Layout for Panel Visibility
**Priority**: P1  
**Estimated Effort**: 1 day  
**Dependencies**: Task 1.1.1

**Description**: Update layout to expand content/preview panels when config is hidden

**Implementation Steps**:
1. Update `Editor.tsx` flex layout to use dynamic widths
2. Content panel: 30% → 50% when config hidden
3. Preview panel: 35% → 50% when config hidden
4. Add smooth width transitions (300ms)
5. Test on various viewport sizes

**Acceptance Criteria**:
- [ ] Content panel expands to 50% when config hidden
- [ ] Preview panel expands to 50% when config hidden
- [ ] Both panels contract to original sizes when config visible
- [ ] Width transitions are smooth (300ms)
- [ ] No layout breaks on mobile/tablet viewports

**Files**: `components/teleprompter/Editor.tsx`

---

#### Task 1.1.5: Add Keyboard Shortcut for Panel Toggle
**Priority**: P1  
**Estimated Effort**: 0.5 days  
**Dependencies**: Task 1.1.1

**Description**: Implement Ctrl/Cmd + , keyboard shortcut to toggle config panel

**Implementation Steps**:
1. Add global keydown listener in `Editor.tsx`
2. Detect Ctrl/Cmd + , combination
3. Call `toggleConfigPanel()` action
4. Prevent default browser behavior
5. Add documentation to keyboard shortcuts

**Acceptance Criteria**:
- [ ] Ctrl/Cmd + , toggles panel visibility
- [ ] Works on both Windows (Ctrl) and Mac (Cmd)
- [ ] Doesn't conflict with existing shortcuts
- [ ] Prevents default browser action

**Files**: `components/teleprompter/Editor.tsx`

---

### Story 1.2: Real-Time Configuration Preview

#### Task 1.2.1: Subscribe Preview Panel to Config Changes
**Priority**: P1  
**Estimated Effort**: 1 day  
**Dependencies**: None

**Description**: Make preview panel react to configuration store changes

**Implementation Steps**:
1. Import `useConfigStore` in `PreviewPanel.tsx`
2. Add config state as dependencies to useEffect
3. Implement 100ms debounce for updates
4. Test update timing with performance monitoring

**Acceptance Criteria**:
- [ ] Preview updates within 100ms of config change
- [ ] Preview updates for all config categories (typography, colors, layout, effects, animations, media)
- [ ] Preview updates even when config panel hidden
- [ ] Multiple rapid changes are batched efficiently

**Files**: `components/teleprompter/editor/PreviewPanel.tsx`, `lib/stores/useConfigStore.ts`

---

#### Task 1.2.2: Add Loading Indicator for Slow Operations
**Priority**: P1  
**Estimated Effort**: 1 day  
**Dependencies**: Task 1.2.1

**Description**: Show loading state when fonts or media are loading

**Implementation Steps**:
1. Create `LoadingIndicator.tsx` component
2. Add loading state to preview panel
3. Detect font loading in `FontLoader.tsx`
4. Detect media loading in preview
5. Show "Updating..." message during loads
6. Hide indicator when complete

**Acceptance Criteria**:
- [ ] Loading indicator appears when fonts are loading
- [ ] Loading indicator appears when media URLs are being fetched
- [ ] "Updating..." message displays clearly
- [ ] Indicator disappears when load completes
- [ ] Indicator doesn't interfere with preview display

**Files**: `components/teleprompter/editor/PreviewPanel.tsx`, `components/teleprompter/config/ui/LoadingIndicator.tsx` (new), `components/teleprompter/config/typography/FontLoader.tsx`

---

#### Task 1.2.3: Implement Batch Update Mechanism
**Priority**: P1  
**Estimated Effort**: 1.5 days  
**Dependencies**: None

**Description**: Batch rapid config changes to prevent performance issues

**Implementation Steps**:
1. Add batching mechanism to config store
2. Collect changes within 50ms window
3. Apply batched changes as single update
4. Use requestAnimationFrame for smooth updates
5. Test with rapid slider adjustments

**Acceptance Criteria**:
- [ ] Changes within 50ms are batched together
- [ ] Batched updates apply efficiently
- [ ] No performance degradation with rapid changes
- [ ] Preview updates smoothly during batching

**Files**: `lib/stores/useConfigStore.ts`

---

#### Task 1.2.4: Add Test Button for Entrance Animations
**Priority**: P1  
**Estimated Effort**: 0.5 days  
**Dependencies**: Task 1.2.1

**Description**: Add button to trigger entrance animation for preview

**Implementation Steps**:
1. Add "Test" button to AnimationsTab
2. Wire button to trigger entrance animation
3. Reset animation state after completion
4. Style button to match other controls

**Acceptance Criteria**:
- [ ] "Test" button displays in AnimationsTab
- [ ] Clicking button plays entrance animation in preview
- [ ] Animation resets after completion
- [ ] Button can be clicked multiple times

**Files**: `components/teleprompter/config/animations/AnimationsTab.tsx`

---

#### Task 1.2.5: Add Error State for Invalid Media URLs
**Priority**: P1  
**Estimated Effort**: 1 day  
**Dependencies**: Task 1.2.1

**Description**: Show error in preview when invalid media URLs provided

**Implementation Steps**:
1. Validate media URLs before loading
2. Detect load failures for images/audio
3. Show error state in preview panel
4. Display error message to user
5. Fallback to previous valid state

**Acceptance Criteria**:
- [ ] Invalid URLs are detected before loading
- [ ] Error state displays in preview panel
- [ ] Error message is clear and helpful
- [ ] Preview reverts to previous state on error
- [ ] User can recover from error

**Files**: `components/teleprompter/editor/PreviewPanel.tsx`, `components/teleprompter/config/media/MediaTab.tsx`

---

## Phase 2: Important Features

### Story 2.1: Proportional UI Scaling

#### Task 2.1.1: Define Scaling System in UI Store
**Priority**: P2  
**Estimated Effort**: 0.5 days  
**Dependencies**: None

**Description**: Add scale factors to UI store for different textarea sizes

**Implementation Steps**:
1. Define scale factors: default (1.0), medium (1.2), large (1.4), fullscreen (1.5)
2. Add scale factor state to UI store
3. Update scale factor when textarea size changes
4. Create CSS custom properties for scaling

**Acceptance Criteria**:
- [ ] Scale factors defined correctly
- [ ] Scale factor updates on textarea size change
- [ ] CSS custom properties are set dynamically

**Files**: `stores/useUIStore.ts`

---

#### Task 2.1.2: Add Scaling to Button Components
**Priority**: P2  
**Estimated Effort**: 1.5 days  
**Dependencies**: Task 2.1.1

**Description**: Update buttons to scale proportionally with textarea size

**Implementation Steps**:
1. Update base Button component to accept scale factor
2. Scale padding, margins, and icon sizes
3. Ensure minimum 44x44px at all sizes
4. Apply scaling to all interactive buttons
5. Test at each textarea size

**Acceptance Criteria**:
- [ ] Buttons scale by 1.2x at medium size
- [ ] Buttons scale by 1.4x at large size
- [ ] Buttons cap at 1.5x for fullscreen
- [ ] Minimum 44x44px maintained at all sizes
- [ ] Button padding and margins scale proportionally

**Files**: `components/ui/button.tsx`, `components/teleprompter/editor/ContentPanel.tsx`

---

#### Task 2.1.3: Prevent Horizontal Scroll at All Sizes
**Priority**: P2  
**Estimated Effort**: 1 day  
**Dependencies**: Task 2.1.1

**Description**: Ensure no horizontal scroll appears regardless of textarea size

**Implementation Steps**:
1. Add `overflow-x: hidden` to content panel
2. Update layouts to use flexbox with proper wrapping
3. Test at each textarea size
4. Add horizontal scroll detection and prevention
5. Fix any overflow issues

**Acceptance Criteria**:
- [ ] No horizontal scroll at default size
- [ ] No horizontal scroll at medium size
- [ ] No horizontal scroll at large size
- [ ] No horizontal scroll at fullscreen size
- [ ] All buttons remain visible without scrolling

**Files**: `components/teleprompter/editor/ContentPanel.tsx`

---

#### Task 2.1.4: Center Expand/Collapse Button on Textarea Edge
**Priority**: P2  
**Estimated Effort**: 1 day  
**Dependencies**: Task 2.1.1

**Description**: Keep expand/collapse button vertically centered on textarea edge

**Implementation Steps**:
1. Calculate textarea height dynamically
2. Position button using absolute positioning
3. Add transform to center vertically
4. Recalculate on textarea resize
5. Test at each textarea size

**Acceptance Criteria**:
- [ ] Button remains vertically centered at default size
- [ ] Button remains vertically centered at medium size
- [ ] Button remains vertically centered at large size
- [ ] Button remains vertically centered at fullscreen size
- [ ] Button position updates smoothly on resize

**Files**: `components/teleprompter/editor/TextareaExpandButton.tsx`

---

#### Task 2.1.5: Scale and Cap Label Text
**Priority**: P2  
**Estimated Effort**: 0.5 days  
**Dependencies**: Task 2.1.1

**Description**: Scale label text proportionally but cap at 16px maximum

**Implementation Steps**:
1. Apply font-size scaling to labels
2. Use CSS `clamp()` to cap at 16px
3. Test readability at all sizes
4. Ensure proper spacing hierarchy

**Acceptance Criteria**:
- [ ] Label text scales proportionally
- [ ] Label text caps at 16px maximum
- [ ] Labels remain readable at all sizes
- [ ] Spacing hierarchy is maintained

**Files**: `components/teleprompter/editor/ContentPanel.tsx`

---

### Story 2.2: Configuration Undo/Redo

#### Task 2.2.1: Create History Management Class
**Priority**: P2  
**Estimated Effort**: 1.5 days  
**Dependencies**: None

**Description**: Implement history stack with position tracking and FIFO removal

**Implementation Steps**:
1. Create `HistoryManager` class in `lib/config/history.ts`
2. Implement stack with array of config states
3. Add current position pointer
4. Implement push, undo, redo methods
5. Add FIFO removal when limit exceeded (50 states)
6. Add serialization for localStorage persistence

**Acceptance Criteria**:
- [ ] HistoryManager class created with all methods
- [ ] Stack supports up to 50 states
- [ ] Current position pointer works correctly
- [ ] FIFO removes oldest state when limit exceeded
- [ ] States can be serialized to JSON

**Files**: `lib/config/history.ts` (new)

---

#### Task 2.2.2: Implement Hybrid Change Recording
**Priority**: P2  
**Estimated Effort**: 2 days  
**Dependencies**: Task 2.2.1

**Description**: Record discrete changes immediately, batch continuous changes on release

**Implementation Steps**:
1. Create middleware for config store
2. Detect discrete controls (checkboxes, selects, dropdowns)
3. Detect continuous controls (sliders, color pickers)
4. Record discrete changes immediately
5. Batch continuous changes on mouse/touch release
6. Test recording accuracy

**Acceptance Criteria**:
- [ ] Discrete changes recorded immediately
- [ ] Continuous changes batched on release
- [ ] History stack populated correctly
- [ ] No duplicate entries in history

**Files**: `lib/stores/useConfigStore.ts`, `lib/config/history.ts`

---

#### Task 2.2.3: Add Undo/Redo Actions to Config Store
**Priority**: P2  
**Estimated Effort**: 1 day  
**Dependencies**: Task 2.2.1

**Description**: Add undo() and redo() actions to restore previous states

**Implementation Steps**:
1. Add `undoConfig()` action to config store
2. Add `redoConfig()` action to config store
3. Restore state from history manager
4. Update current position pointer
5. Trigger re-render with restored state

**Acceptance Criteria**:
- [ ] Undo restores previous config state
- [ ] Redo restores undone config state
- [ ] Current position pointer updates correctly
- [ ] Can undo multiple times
- [ ] Can redo after undo

**Files**: `lib/stores/useConfigStore.ts`, `lib/config/history.ts`

---

#### Task 2.2.4: Update Undo/Redo Button UI
**Priority**: P2  
**Estimated Effort**: 1 day  
**Dependencies**: Task 2.2.3

**Description**: Update existing undo/redo buttons with new history system

**Implementation Steps**:
1. Update undo button to use new history manager
2. Update redo button to use new history manager
3. Enable/disable based on history state
4. Add visual position indicator (e.g., "5/10 changes")
5. Test button states

**Acceptance Criteria**:
- [ ] Undo button enabled when history not empty
- [ ] Undo button disabled when at start of history
- [ ] Redo button enabled when not at latest state
- [ ] Redo button disabled when at latest state
- [ ] Position indicator displays correctly

**Files**: `components/teleprompter/config/ConfigPanel.tsx`, `lib/config/history.ts`

---

#### Task 2.2.5: Implement History Reset Triggers
**Priority**: P2  
**Estimated Effort**: 1 day  
**Dependencies**: Task 2.2.1

**Description**: Reset history when preset/template/script is loaded

**Implementation Steps**:
1. Detect preset application
2. Detect template loading
3. Detect script loading
4. Clear history stack on these events
5. Reset position pointer

**Acceptance Criteria**:
- [ ] History clears when preset applied
- [ ] History clears when template loaded
- [ ] History clears when script loaded
- [ ] Cannot undo to pre-preset state
- [ ] Position indicator resets to 0/0

**Files**: `lib/stores/useConfigStore.ts`, `lib/config/history.ts`

---

#### Task 2.2.6: Add Clear History Confirmation Dialog
**Priority**: P2  
**Estimated Effort**: 0.5 days  
**Dependencies**: Task 2.2.4

**Description**: Add confirmation dialog for clear history action

**Implementation Steps**:
1. Add "Clear History" button to config panel
2. Create confirmation dialog component
3. Show dialog when clear clicked
4. Clear history if confirmed
5. Do nothing if cancelled

**Acceptance Criteria**:
- [ ] "Clear History" button displays in config panel
- [ ] Confirmation dialog appears on click
- [ ] History clears if user confirms
- [ ] History preserved if user cancels

**Files**: `components/teleprompter/config/ConfigPanel.tsx`, `components/ui/dialog.tsx`

---

## Phase 3: Enhancement Features

### Story 3.1: Mobile Configuration Interface

#### Task 3.1.1: Create Mobile Config Bottom Sheet Component
**Priority**: P3  
**Estimated Effort**: 2 days  
**Dependencies**: Task 1.1.1

**Description**: Create bottom sheet component for mobile configuration interface

**Implementation Steps**:
1. Create `MobileConfigSheet.tsx` component
2. Implement slide-up animation (200ms duration)
3. Set height to 90% of viewport
4. Add drag handle at top
5. Configure to show on mobile (< 768px)

**Acceptance Criteria**:
- [ ] Bottom sheet slides up from bottom
- [ ] Sheet occupies 90% of screen height
- [ ] Animation completes in 200ms
- [ ] Drag handle displays at top
- [ ] Sheet only shows on mobile viewport

**Files**: `components/teleprompter/config/MobileConfigSheet.tsx` (new)

---

#### Task 3.1.2: Add Touch-Optimized Sliders for Mobile
**Priority**: P3  
**Estimated Effort**: 1 day  
**Dependencies**: Task 3.1.1

**Description**: Increase slider height to 48px minimum on mobile devices

**Implementation Steps**:
1. Update `SliderInput.tsx` with mobile detection
2. Increase height to 48px on touch devices
3. Test touch interaction on mobile
4. Ensure proper hit testing

**Acceptance Criteria**:
- [ ] Slider height is 48px minimum on mobile
- [ ] Touch interaction works smoothly
- [ ] Slider value updates correctly
- [ ] Visual feedback is clear on touch

**Files**: `components/teleprompter/config/ui/SliderInput.tsx`

---

#### Task 3.1.3: Implement Native Color Input for Mobile
**Priority**: P3  
**Estimated Effort**: 1 day  
**Dependencies**: Task 3.1.1

**Description**: Replace react-colorful with native color input on mobile

**Implementation Steps**:
1. Add mobile detection to `ColorPicker.tsx`
2. Replace HexColorPicker with `<input type="color">` on mobile
3. Style native input to match design
4. Test on mobile devices

**Acceptance Criteria**:
- [ ] Native color input shows on mobile
- [ ] HexColorPicker shows on desktop
- [ ] Color selection works on mobile
- [ ] Visual style is consistent

**Files**: `components/teleprompter/config/ui/ColorPicker.tsx`

---

#### Task 3.1.4: Implement Native Font Picker for Mobile
**Priority**: P3  
**Estimated Effort**: 1 day  
**Dependencies**: Task 3.1.1

**Description**: Replace font dropdown with native select on mobile

**Implementation Steps**:
1. Add mobile detection to `FontSelector.tsx`
2. Replace dropdown with `<select>` on mobile
3. Populate options with available fonts
4. Style native select to match design
5. Test on mobile devices

**Acceptance Criteria**:
- [ ] Native select shows on mobile
- [ ] Font dropdown shows on desktop
- [ ] Font selection works on mobile
- [ ] All fonts available in select

**Files**: `components/teleprompter/config/typography/FontSelector.tsx`

---

#### Task 3.1.5: Add Swipe Down Gesture to Close Sheet
**Priority**: P3  
**Estimated Effort**: 1.5 days  
**Dependencies**: Task 3.1.1

**Description**: Implement swipe down gesture with 100px threshold to close mobile config

**Implementation Steps**:
1. Add touch event listeners to sheet
2. Track touch start and move positions
3. Calculate drag distance
4. Close sheet when threshold exceeded (100px)
5. Add visual feedback during drag

**Acceptance Criteria**:
- [ ] Swipe down gesture is detected
- [ ] Sheet closes when drag > 100px
- [ ] Sheet stays open when drag < 100px
- [ ] Visual feedback shows during drag
- [ ] Sheet springs back if threshold not met

**Files**: `components/teleprompter/config/MobileConfigSheet.tsx`

---

#### Task 3.1.6: Add Done Button to Mobile Config Sheet
**Priority**: P3  
**Estimated Effort**: 0.5 days  
**Dependencies**: Task 3.1.1

**Description**: Add Done button at top-right of mobile config panel

**Implementation Steps**:
1. Add Done button to sheet header
2. Position at top-right corner
3. Style to match other controls
4. Wire click handler to close sheet

**Acceptance Criteria**:
- [ ] Done button displays at top-right
- [ ] Button style is consistent
- [ ] Clicking button closes sheet
- [ ] Button is easily tappable (44x44px min)

**Files**: `components/teleprompter/config/MobileConfigSheet.tsx`

---

#### Task 3.1.7: Implement Landscape Split View
**Priority**: P3  
**Estimated Effort**: 1 day  
**Dependencies**: Task 3.1.1

**Description**: Switch to split view (half screen) when device rotates to landscape

**Implementation Steps**:
1. Detect device orientation changes
2. Switch between bottom sheet (portrait) and split view (landscape)
3. Update layout dynamically
4. Test orientation transitions

**Acceptance Criteria**:
- [ ] Portrait mode shows bottom sheet
- [ ] Landscape mode shows split view
- [ ] Transitions are smooth
- [ ] Layout adjusts correctly on rotation

**Files**: `components/teleprompter/config/MobileConfigSheet.tsx`

---

#### Task 3.1.8: Add Compact Layout for Small Screens
**Priority**: P3  
**Estimated Effort**: 0.5 days  
**Dependencies**: Task 3.1.1

**Description**: Use compact spacing with reduced padding on screens < 375px

**Implementation Steps**:
1. Detect small screens (< 375px)
2. Reduce padding on small screens
3. Adjust spacing between controls
4. Test on very small devices

**Acceptance Criteria**:
- [ ] Compact layout shows on screens < 375px
- [ ] Padding is reduced appropriately
- [ ] All controls remain accessible
- [ ] No layout overlap

**Files**: `components/teleprompter/config/MobileConfigSheet.tsx`

---

### Story 3.2: Adaptive Footer

#### Task 3.2.1: Implement Footer Scaling with Textarea Size
**Priority**: P3  
**Estimated Effort**: 1 day  
**Dependencies**: Task 2.1.1

**Description**: Scale footer proportionally with textarea size changes

**Implementation Steps**:
1. Calculate scale factor based on textarea size
2. Apply scaling to footer height and padding
3. Cap at 120px maximum height
4. Test at each textarea size

**Acceptance Criteria**:
- [ ] Footer scales at medium size
- [ ] Footer scales at large size
- [ ] Footer caps at 120px maximum
- [ ] Scaling is proportional and smooth

**Files**: `components/teleprompter/editor/ContentPanel.tsx`

---

#### Task 3.2.2: Implement Fixed Footer Positioning
**Priority**: P3  
**Estimated Effort**: 1 day  
**Dependencies**: None

**Description**: Anchor footer to bottom of viewport with fixed/sticky positioning

**Implementation Steps**:
1. Add `position: fixed` with `bottom: 0` to footer
2. Add `backdrop-filter: blur()` for semi-transparent effect
3. Set z-index to stay on top of content
4. Test on various viewport sizes

**Acceptance Criteria**:
- [ ] Footer is fixed at bottom of viewport
- [ ] Semi-transparent backdrop works correctly
- [ ] Footer stays on top of content
- [ ] Footer doesn't interfere with scrolling

**Files**: `components/teleprompter/editor/ContentPanel.tsx`

---

#### Task 3.2.3: Add Content Padding to Prevent Overlap
**Priority**: P3  
**Estimated Effort**: 1 day  
**Dependencies**: Task 3.2.2

**Description**: Add bottom padding to content equal to footer height

**Implementation Steps**:
1. Calculate footer height dynamically
2. Add bottom padding to content area
3. Update padding on footer resize
4. Update padding on textarea size change
5. Test that no content is hidden

**Acceptance Criteria**:
- [ ] Content padding equals footer height
- [ ] No content is hidden behind footer
- [ ] Padding updates dynamically
- [ ] Users can always access all content

**Files**: `components/teleprompter/editor/ContentPanel.tsx`

---

#### Task 3.2.4: Hide Footer in Fullscreen Mode
**Priority**: P3  
**Estimated Effort**: 0.5 days  
**Dependencies**: None

**Description**: Hide footer when textarea is in fullscreen mode

**Implementation Steps**:
1. Detect fullscreen mode in UI store
2. Hide footer with CSS when fullscreen active
3. Show footer when exiting fullscreen
4. Test transitions

**Acceptance Criteria**:
- [ ] Footer hides in fullscreen mode
- [ ] Footer shows when exiting fullscreen
- [ ] Transitions are smooth
- [ ] Editing space is maximized in fullscreen

**Files**: `components/teleprompter/editor/ContentPanel.tsx`, `stores/useUIStore.ts`

---

#### Task 3.2.5: Reflow Footer Content on Mobile
**Priority**: P3  
**Estimated Effort**: 0.5 days  
**Dependencies**: Task 3.2.1

**Description**: Wrap footer buttons to multiple rows on mobile if needed

**Implementation Steps**:
1. Add flex-wrap to footer button container
2. Ensure minimum touch targets (44x44px) on mobile
3. Test on various mobile viewport widths
4. Adjust spacing as needed

**Acceptance Criteria**:
- [ ] Footer buttons wrap on mobile
- [ ] All buttons maintain 44x44px minimum
- [ ] Layout is readable on mobile
- [ ] No overlap or crowding

**Files**: `components/teleprompter/editor/ContentPanel.tsx`

---

## Testing Tasks

### Task T1: Write Unit Tests for Config Panel Toggle
**Priority**: P1  
**Estimated Effort**: 2 days  
**Dependencies**: Task 1.1.5

**Test Cases**:
- [ ] Test toggle button rendering
- [ ] Test localStorage persistence
- [ ] Test keyboard shortcut handler
- [ ] Test debounce mechanism
- [ ] Test animation states

**Files**: `__tests__/unit/config/ConfigPanelToggle.test.tsx`

---

### Task T2: Write Unit Tests for Real-Time Preview
**Priority**: P1  
**Estimated Effort**: 2 days  
**Dependencies**: Task 1.2.5

**Test Cases**:
- [ ] Test config store subscription
- [ ] Test 100ms update timing
- [ ] Test batching mechanism
- [ ] Test loading states
- [ ] Test error states

**Files**: `__tests__/unit/config/RealTimePreview.test.tsx`

---

### Task T3: Write Unit Tests for Proportional Scaling
**Priority**: P2  
**Estimated Effort**: 1.5 days  
**Dependencies**: Task 2.1.5

**Test Cases**:
- [ ] Test scale factor calculations
- [ ] Test button scaling at each size
- [ ] Test horizontal scroll prevention
- [ ] Test label capping

**Files**: `__tests__/unit/config/ProportionalScaling.test.tsx`

---

### Task T4: Write Unit Tests for Undo/Redo
**Priority**: P2  
**Estimated Effort**: 2 days  
**Dependencies**: Task 2.2.6

**Test Cases**:
- [ ] Test history stack operations
- [ ] Test FIFO removal at limit
- [ ] Test hybrid recording strategy
- [ ] Test reset triggers
- [ ] Test keyboard shortcuts

**Files**: `__tests__/unit/config/UndoRedo.test.tsx`

---

### Task T5: Write Integration Tests for Panel Toggle + Preview
**Priority**: P1  
**Estimated Effort**: 1.5 days  
**Dependencies**: Task 1.2.5

**Test Cases**:
- [ ] Test preview updates when panel hidden
- [ ] Test layout adjustment
- [ ] Test state persistence across reloads

**Files**: `__tests__/integration/config/PanelTogglePreview.test.tsx`

---

### Task T6: Write Integration Tests for Scaling + Footer
**Priority**: P2  
**Estimated Effort**: 1 day  
**Dependencies**: Task 3.2.5

**Test Cases**:
- [ ] Test footer scales with textarea
- [ ] Test content padding prevents overlap
- [ ] Test buttons remain accessible

**Files**: `__tests__/integration/config/ScalingFooter.test.tsx`

---

### Task T7: Write E2E Tests for User Workflows
**Priority**: P2  
**Estimated Effort**: 2 days  
**Dependencies**: Task T6

**Test Cases**:
- [ ] Complete configuration workflow
- [ ] Real-time preview verification
- [ ] Undo/redo after multiple changes
- [ ] Mobile configuration workflow

**Files**: `__tests__/e2e/config/ConfigurationWorkflow.test.tsx`

---

### Task T8: Write Accessibility Tests
**Priority**: P2  
**Estimated Effort**: 1.5 days  
**Dependencies**: Task T7

**Test Cases**:
- [ ] Test screen reader navigation
- [ ] Test keyboard navigation
- [ ] Test prefers-reduced-motion compliance
- [ ] Test ARIA label verification

**Files**: `__tests__/a11y/config/Accessibility.test.tsx`

---

### Task T9: Write Performance Tests
**Priority**: P2  
**Estimated Effort**: 1.5 days  
**Dependencies**: Task T8

**Test Cases**:
- [ ] Test animation frame rate (60 FPS)
- [ ] Test config change update timing (< 100ms)
- [ ] Test history overhead (< 5ms per change)
- [ ] Test mobile panel open time (< 200ms)

**Files**: `__tests__/performance/config/Performance.test.tsx`

---

## Summary

**Total Estimated Effort**: 42-48 days

### Phase 1 (P1): 9-11 days
- Config Panel Toggle: 4 days
- Real-Time Preview: 5-7 days

### Phase 2 (P2): 12-14 days
- Proportional UI Scaling: 4 days
- Configuration Undo/Redo: 6-7 days
- Testing: 2-3 days

### Phase 3 (P3): 9-11 days
- Mobile Configuration Interface: 6-7 days
- Adaptive Footer: 2-3 days
- Testing: 1 day

### Testing (All Phases): 12-13 days
- Unit Tests: 8 days
- Integration Tests: 2.5 days
- E2E Tests: 2 days
- Accessibility Tests: 1.5 days

**Recommended Schedule**: 6-week sprint with 2-week checkpoints for each phase
