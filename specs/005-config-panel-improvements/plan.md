# Implementation Plan: Configuration Panel UI/UX Improvements

**Feature Branch**: `005-config-panel-improvements`  
**Created**: 2026-01-01  
**Status**: Draft  
**Specification**: [spec.md](spec.md)

## Overview

This plan details the implementation of 6 user stories to improve the configuration panel UI/UX in the teleprompter editor. The stories are prioritized into three phases to deliver value incrementally.

### Implementation Strategy

- **Phase 1 (P1 - Critical)**: Core functionality that significantly impacts user workflow
  - Config Panel Toggle with Smooth Animation
  - Real-Time Configuration Preview

- **Phase 2 (P2 - Important)**: Enhanced user experience and safety features
  - Proportional UI Scaling with Textarea Expansion
  - Configuration Undo/Redo

- **Phase 3 (P3 - Enhancement)**: Specialized use cases and edge case refinements
  - Mobile-Optimized Configuration Interface
  - Adaptive Footer with Textarea Scaling

## Phase 1: Critical Features (Weeks 1-2)

### Story 1.1: Config Panel Toggle with Smooth Animation

**User Story**: Content creators need to maximize workspace by toggling the config panel visibility

**Acceptance Criteria**:
- [ ] Toggle button in content panel header with Settings icon (44x44px min)
- [ ] Panel slides in/out with 300ms ease-out animation
- [ ] State persists via localStorage (key: 'configPanelVisible')
- [ ] Keyboard shortcut: Ctrl/Cmd + ,
- [ ] Defaults to hidden for first-time users
- [ ] Content/preview panels expand when config hidden
- [ ] Debounce mechanism for rapid toggles
- [ ] ARIA labels for accessibility

**Technical Implementation**:

1. **State Management**:
   - Add `configPanelVisible` to UI store (`stores/useUIStore.ts`)
   - Initialize from localStorage on mount
   - Persist to localStorage on state change

2. **Toggle Button Component**:
   - Create `ConfigToggleButton.tsx` in content panel header
   - Use Settings icon from lucide-react
   - Style: 44x44px min, positioned next to existing controls
   - Add hover/focus states with proper contrast

3. **Panel Animation**:
   - Use Framer Motion for smooth transitions
   - Animate width from 35% to 0 and vice versa
   - Respect `prefers-reduced-motion` media query
   - Implement debounce: 300ms lock after toggle start

4. **Layout Adjustment**:
   - Update `Editor.tsx` layout to handle panel visibility
   - Content panel: 30% → 50% when config hidden
   - Preview panel: 35% → 50% when config hidden
   - Use flexbox with smooth width transitions

5. **Keyboard Shortcut**:
   - Add global keydown listener in `Editor.tsx`
   - Listen for Ctrl/Cmd + ,
   - Call toggle function from UI store
   - Prevent default browser behavior

**Files to Modify**:
- `stores/useUIStore.ts` - Add panel visibility state
- `components/teleprompter/Editor.tsx` - Layout adjustments, keyboard listener
- `components/teleprompter/editor/ContentPanel.tsx` - Add toggle button
- `components/teleprompter/config/ConfigPanel.tsx` - Add animation wrapper

**Dependencies**: None (can start immediately)

**Estimated Effort**: 3-4 days

---

### Story 1.2: Real-Time Configuration Preview

**User Story**: Content creators need immediate visual feedback when making configuration changes

**Acceptance Criteria**:
- [ ] Preview updates within 100ms of config changes
- [ ] Updates apply even when config panel hidden
- [ ] Loading indicator for slow operations
- [ ] Test button for entrance animations
- [ ] Batch updates within 50ms window
- [ ] Error state for invalid media URLs

**Technical Implementation**:

1. **Preview Update Mechanism**:
   - Subscribe to config store changes in `PreviewPanel.tsx`
   - Use `useEffect` with config state dependencies
   - Implement 100ms debounce for performance

2. **Loading States**:
   - Add loading indicator component in preview
   - Show when font files or media are loading
   - Display "Updating..." message during long operations

3. **Batch Updates**:
   - Implement 50ms batching in config store
   - Collect rapid changes and apply as single update
   - Use requestAnimationFrame for smooth updates

4. **Animation Testing**:
   - Add "Test" button in AnimationsTab
   - Trigger entrance animation on click
   - Reset animation state after completion

5. **Error Handling**:
   - Validate media URLs before loading
   - Show error state in preview for invalid URLs
   - Display error message and fallback to previous state

**Files to Modify**:
- `components/teleprompter/editor/PreviewPanel.tsx` - Subscribe to config changes
- `lib/stores/useConfigStore.ts` - Add batching mechanism
- `components/teleprompter/config/animations/AnimationsTab.tsx` - Add Test button
- `components/teleprompter/config/ui/LoadingIndicator.tsx` - New component

**Dependencies**: None (can work in parallel with Story 1.1)

**Estimated Effort**: 4-5 days

---

## Phase 2: Important Features (Weeks 3-4)

### Story 2.1: Proportional UI Scaling with Textarea Expansion

**User Story**: Content creators need UI elements to scale proportionally with textarea size

**Acceptance Criteria**:
- [ ] Buttons scale 1.2x (medium), 1.4x (large), 1.5x max (fullscreen)
- [ ] No horizontal scroll at any size
- [ ] Smooth 200ms transitions
- [ ] Expand/collapse button remains centered
- [ ] Label text caps at 16px
- [ ] Proper spacing hierarchy maintained

**Technical Implementation**:

1. **Scaling System**:
   - Define scale factors in UI store: default (1.0), medium (1.2), large (1.4), fullscreen (1.5)
   - Create CSS custom properties for dynamic scaling
   - Apply scaling to button components via data attributes

2. **Button Component Updates**:
   - Update all interactive buttons to use scaling
   - Scale padding, margins, and icon sizes proportionally
   - Ensure minimum 44x44px at all sizes

3. **Layout Adjustments**:
   - Update `ContentPanel.tsx` to use flex layouts
   - Prevent overflow with `overflow-x: hidden`
   - Add horizontal scroll detection and prevention

4. **Expand Button Centering**:
   - Calculate vertical position based on textarea height
   - Use absolute positioning with transform
   - Recalculate on textarea resize

5. **Label Scaling**:
   - Apply font-size scaling to labels
   - Cap at 16px using CSS `clamp()`
   - Ensure readability at all sizes

**Files to Modify**:
- `stores/useUIStore.ts` - Add scale factor state
- `components/teleprompter/editor/ContentPanel.tsx` - Apply scaling
- `components/teleprompter/editor/TextareaExpandButton.tsx` - Center positioning
- `components/ui/button.tsx` - Add scaling support

**Dependencies**: Story 1.1 (needs toggle button in place)

**Estimated Effort**: 3-4 days

---

### Story 2.2: Configuration Undo/Redo

**User Story**: Content creators need to undo and redo configuration changes safely

**Acceptance Criteria**:
- [ ] Hybrid recording: discrete immediate, continuous batched
- [ ] 50-state history limit with FIFO
- [ ] Keyboard shortcuts: Ctrl/Cmd + Z, Ctrl/Cmd + Shift + Z
- [ ] Visual position indicator (e.g., "5/10 changes")
- [ ] Reset on preset/template/script load
- [ ] Clear History with confirmation

**Technical Implementation**:

1. **History Management**:
   - Create `HistoryManager` class in `lib/config/history.ts`
   - Implement stack with current position tracking
   - Add FIFO removal when limit exceeded

2. **Change Recording**:
   - Middleware for config store to intercept changes
   - Detect discrete vs continuous controls
   - Batch continuous changes on mouse/touch release

3. **Undo/Redo Actions**:
   - Add `undo()` and `redo()` actions to config store
   - Restore previous state from history
   - Update current position pointer

4. **UI Components**:
   - Update undo/redo buttons in `ConfigPanel.tsx`
   - Enable/disable based on history state
   - Add position indicator display

5. **Reset Triggers**:
   - Listen for preset/template/script load events
   - Clear history on these events
   - Add confirmation dialog for Clear History

**Files to Modify**:
- `lib/config/history.ts` - New file for history management
- `lib/stores/useConfigStore.ts` - Add history actions
- `components/teleprompter/config/ConfigPanel.tsx` - Update UI
- `components/ui/dialog.tsx` - Confirmation dialog

**Dependencies**: Story 1.2 (needs real-time preview to work correctly)

**Estimated Effort**: 5-6 days

---

## Phase 3: Enhancement Features (Weeks 5-6)

### Story 3.1: Mobile-Optimized Configuration Interface

**User Story**: Mobile users need full access to configuration options via mobile-friendly interface

**Acceptance Criteria**:
- [ ] Bottom sheet on mobile (< 768px)
- [ ] 90% screen height when open
- [ ] Horizontally scrollable tab pills
- [ ] Touch-optimized sliders (48px min height)
- [ ] Native color/font inputs
- [ ] Swipe down to close (100px threshold)
- [ ] Done button at top-right
- [ ] Landscape split view
- [ ] Compact layout on small screens (< 375px)

**Technical Implementation**:

1. **Bottom Sheet Component**:
   - Create `MobileConfigSheet.tsx`
   - Use existing `TabBottomSheet.tsx` as base
   - Implement slide-up animation with 200ms duration
   - Add drag handle at top

2. **Touch Optimization**:
   - Update `SliderInput.tsx` for mobile
   - Increase height to 48px on touch devices
   - Add larger touch targets for all controls

3. **Native Inputs**:
   - Detect mobile viewport
   - Replace `ColorPicker` with `<input type="color">` on mobile
   - Replace font dropdown with native select on mobile

4. **Gesture Handling**:
   - Add touch event listeners for swipe detection
   - Calculate drag distance
   - Close sheet when threshold exceeded

5. **Orientation Handling**:
   - Detect device orientation changes
   - Switch between bottom sheet (portrait) and split view (landscape)
   - Update layout dynamically

**Files to Modify**:
- `components/teleprompter/config/TabBottomSheet.tsx` - Enhance for mobile config
- `components/teleprompter/config/ui/SliderInput.tsx` - Touch optimization
- `components/teleprompter/config/ui/ColorPicker.tsx` - Mobile detection
- `components/teleprompter/config/typography/FontSelector.tsx` - Native select on mobile

**Dependencies**: Story 1.1 (needs toggle button), Story 1.2 (needs real-time preview)

**Estimated Effort**: 5-6 days

---

### Story 3.2: Adaptive Footer with Textarea Scaling

**User Story**: Content creators need footer actions to remain accessible at all textarea sizes

**Acceptance Criteria**:
- [ ] Footer scales proportionally with textarea
- [ ] Caps at 120px maximum height
- [ ] Fixed/sticky positioning at viewport bottom
- [ ] Content padding equals footer height
- [ ] Minimum 44x44px button size
- [ ] Hidden in fullscreen mode
- [ ] Semi-transparent backdrop
- [ ] Reflows on mobile

**Technical Implementation**:

1. **Footer Scaling**:
   - Calculate scale factor based on textarea size
   - Apply to footer height and padding
   - Cap at 120px using CSS `max-height`

2. **Positioning**:
   - Use `position: fixed` with `bottom: 0`
   - Add `backdrop-filter: blur()` for semi-transparent effect
   - Ensure footer stays on top of content with z-index

3. **Content Padding**:
   - Calculate footer height dynamically
   - Add bottom padding to content area
   - Update on footer resize and textarea size change

4. **Fullscreen Handling**:
   - Detect fullscreen mode in UI store
   - Hide footer with CSS when fullscreen active
   - Show footer when exiting fullscreen

5. **Mobile Reflow**:
   - Use flexbox with `flex-wrap` for buttons
   - Ensure minimum touch targets on mobile
   - Test with various viewport widths

**Files to Modify**:
- `components/teleprompter/editor/ContentPanel.tsx` - Footer implementation
- `stores/useUIStore.ts` - Footer state management
- `components/teleprompter/editor/TextareaExpandButton.tsx` - Fullscreen detection

**Dependencies**: Story 2.1 (needs proportional scaling to work correctly)

**Estimated Effort**: 2-3 days

---

## Testing Strategy

### Unit Tests

1. **Config Panel Toggle**:
   - Test toggle button rendering and state
   - Test localStorage persistence
   - Test keyboard shortcut handler
   - Test debounce mechanism

2. **Real-Time Preview**:
   - Test config store subscription
   - Test 100ms update timing
   - Test batching mechanism
   - Test loading states

3. **Proportional Scaling**:
   - Test scale factor calculations
   - Test button scaling at each size
   - Test horizontal scroll prevention
   - Test label capping at 16px

4. **Undo/Redo**:
   - Test history stack operations
   - Test FIFO removal at limit
   - Test hybrid recording strategy
   - Test reset triggers

5. **Mobile Interface**:
   - Test bottom sheet rendering
   - Test gesture handling
   - Test orientation changes
   - Test native input fallbacks

6. **Adaptive Footer**:
   - Test footer scaling calculations
   - Test fixed positioning
   - Test content padding adjustments
   - Test fullscreen hiding

### Integration Tests

1. **Panel Toggle + Preview**:
   - Test that preview updates when panel is hidden
   - Test that layout adjusts correctly
   - Test state persistence across page reloads

2. **Scaling + Footer**:
   - Test that footer scales with textarea
   - Test that content padding prevents overlap
   - Test that buttons remain accessible

3. **Undo/Redo + All Features**:
   - Test that undo works for all config changes
   - Test that history resets appropriately
   - Test that keyboard shortcuts work globally

### End-to-End Tests

1. **User Workflow Tests**:
   - Complete configuration workflow with panel toggle
   - Real-time preview verification
   - Undo/redo after multiple changes
   - Mobile configuration workflow

2. **Accessibility Tests**:
   - Screen reader navigation
   - Keyboard navigation
   - prefers-reduced-motion compliance
   - ARIA label verification

3. **Performance Tests**:
   - Animation frame rate (60 FPS)
   - Config change update timing (< 100ms)
   - History overhead (< 5ms per change)
   - Mobile panel open time (< 200ms)

## Deployment Plan

### Phase 1 Deployment (Week 2)
- Deploy Config Panel Toggle
- Deploy Real-Time Preview
- Monitor for: layout issues, animation performance, localStorage errors

### Phase 2 Deployment (Week 4)
- Deploy Proportional UI Scaling
- Deploy Configuration Undo/Redo
- Monitor for: scaling issues, history performance, keyboard conflicts

### Phase 3 Deployment (Week 6)
- Deploy Mobile Configuration Interface
- Deploy Adaptive Footer
- Monitor for: mobile layout issues, gesture conflicts, footer positioning

## Risk Mitigation

### High-Risk Areas

1. **Animation Performance**:
   - Risk: Animations may stutter on low-end devices
   - Mitigation: Implement prefers-reduced-motion detection, use CSS transforms (GPU-accelerated)

2. **History Management**:
   - Risk: Large config objects may cause memory issues
   - Mitigation: Use 50-state limit, implement efficient serialization

3. **Mobile Gestures**:
   - Risk: Gesture conflicts with native browser actions
   - Mitigation: Test on multiple devices, provide fallback controls

4. **Cross-Browser Compatibility**:
   - Risk: CSS grid/flexbox inconsistencies
   - Mitigation: Use Tailwind utilities, test on major browsers

## Success Metrics

### Phase 1 Success Criteria
- [ ] 95% of users successfully toggle panel on first attempt
- [ ] Config changes appear in preview within 100ms (95th percentile)
- [ ] No animation frame drops on target devices (60 FPS)

### Phase 2 Success Criteria
- [ ] 80% of users report increased confidence with undo/redo
- [ ] No horizontal scrolling at any textarea size
- [ ] History overhead < 5ms per change

### Phase 3 Success Criteria
- [ ] 75% of mobile users report configuration is "accessible"
- [ ] Footer remains visible at all textarea sizes
- [ ] Mobile config panel opens in < 200ms (90th percentile)

## Rollback Plan

Each phase is independently deployable and can be rolled back if critical issues are discovered:

- **Phase 1 Rollback**: Remove toggle button, revert layout changes
- **Phase 2 Rollback**: Remove scaling, disable history
- **Phase 3 Rollback**: Remove mobile bottom sheet, revert footer positioning

Feature flags will be implemented to allow quick disabling of individual features without code deployment.
