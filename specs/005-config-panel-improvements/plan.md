# Implementation Plan: Configuration Panel UI/UX Improvements

**Branch**: `005-config-panel-improvements`  
**Feature Spec**: [`spec.md`](spec.md)  
**Status**: Draft  
**Created**: 2026-01-01  

---

## Technical Context

### Existing Components
- **ConfigPanel**: [`components/teleprompter/config/ConfigPanel.tsx`](../../components/teleprompter/config/ConfigPanel.tsx) - Always-visible 35% width panel with undo/redo buttons
- **ConfigTabs**: [`components/teleprompter/config/ConfigTabs.tsx`](../../components/teleprompter/config/ConfigTabs.tsx) - Tab navigation with 7 tabs (Typography, Colors, Effects, Layout, Animations, Presets, Media)
- **ContentPanel**: [`components/teleprompter/editor/ContentPanel.tsx`](../../components/teleprompter/editor/ContentPanel.tsx) - Left panel with textarea, auto-save, auth controls
- **Editor**: [`components/teleprompter/Editor.tsx`](../../components/teleprompter/Editor.tsx) - Three-column layout (ContentPanel, ConfigPanel, PreviewPanel)

### State Management
- **useConfigStore**: [`lib/stores/useConfigStore.ts`](../../lib/stores/useConfigStore.ts) - Zustand store for typography, colors, effects, layout, animations
- **useUIStore**: `stores/useUIStore.ts` - UI preferences (needs review for panel visibility state)
- **useTeleprompterStore**: `stores/useTeleprompterStore.ts` - Text content, mode switching

### UI Framework
- **Framer Motion**: Used for animations in existing codebase (can leverage for panel animations)
- **Tailwind CSS**: Responsive utilities, breakpoints (sm: 640px, md: 768px, lg: 1024px)
- **shadcn/ui**: Button, Dialog, Input components available

### Key Integrations
- **localStorage**: Used for auto-save ([`__tests__/mocks/local-storage.mock.ts`](../../__tests__/mocks/local-storage.mock.ts))
- **Next.js 14+**: App Router, React Server Components
- **TypeScript 5.3+**: Strict mode enabled
- **React 18.2+**: Component architecture

### Technology Decisions Needed
- **History Management**: How to integrate with Zustand store without major refactoring (NEEDS CLARIFICATION)
- **Panel Animation**: Whether to use Framer Motion or CSS transitions for panel slide effect
- **Real-time Preview Integration**: How to connect config changes to preview panel (store subscription pattern)
- **Mobile Bottom Sheet**: Component choice - existing TabBottomSheet or new implementation
- **Textarea Scaling Logic**: How to calculate and apply proportional scaling multipliers

---

## Constitution Check

### I. User Experience First
✅ **PASS** - All 6 user stories focus on improving UX:
- Config Panel Toggle gives users more workspace control
- Real-Time Preview provides immediate visual feedback
- Proportional UI Scaling ensures visual consistency
- Undo/Redo enables confident exploration
- Mobile optimization ensures accessibility
- Adaptive Footer maintains usability at all sizes

### II. Performance & Reliability
✅ **PASS** - Performance metrics defined:
- 100ms update time for preview (SC-002)
- 300ms panel animation (SC-019)
- <5ms overhead for history management (SC-020)
- 60 FPS maintained during rapid changes (SC-022)
- Debouncing for batch updates (FR-013)

### III. Security & Privacy
✅ **PASS** - No security/privacy concerns in feature scope:
- All changes are client-side configuration
- No new data collection
- localStorage used for persistence (existing pattern)

### IV. Code Quality & Testing
⚠️ **NEEDS ATTENTION** - Testing strategy needs definition:
- Unit tests for new components (Toggle button, History management)
- Integration tests for panel state transitions
- E2E tests for mobile bottom sheet interactions
- Performance tests for real-time preview updates

### V. Technology Standards
✅ **PASS** - Aligns with technology stack:
- Next.js 14+ ✅
- TypeScript strict mode ✅
- Tailwind CSS ✅
- Framer Motion (existing dependency) ✅
- shadcn/ui components ✅

---

## Gate Evaluation

| Gate | Status | Notes |
|------|--------|-------|
| Technical Feasibility | ✅ PASS | All required components exist, patterns established |
| Testing Strategy Required | ⚠️ | Define testing approach before Phase 1 |
| No Breaking Changes | ⚠️ | Verify panel toggle doesn't disrupt existing Editor layout |
| Performance Impact | ✅ PASS | Metrics defined; debouncing prevents performance issues |
| Mobile Responsive | ✅ PASS | Tailwind breakpoints defined; bottom sheet approach proven |

---

## Phase 0: Research & Design Decisions

### Research Tasks

1. **Panel Animation Approach**
   - Research: Compare Framer Motion vs CSS transitions for 300ms panel slide
   - Decision needed: Which approach for smooth 60fps animation?
   - Options: Framer Motion (existing dependency), CSS transitions (lighter), React Spring (not in stack)

2. **History Management Pattern**
   - Research: Zustand history middleware patterns
   - Decision needed: How to integrate undo/redo into useConfigStore?
   - Options: Custom middleware, separate history store, patch middleware

3. **Real-Time Preview Architecture**
   - Research: Store subscription patterns for preview updates
   - Decision needed: How to efficiently sync config changes to preview?
   - Options: useConfigStore subscription, custom event emitter, React context

4. **Mobile Bottom Sheet Component**
   - Research: Existing TabBottomSheet capabilities vs new component
   - Decision needed: Can existing component handle requirements?
   - Options: Extend TabBottomSheet, create new MobileConfigPanel, use third-party library

5. **Textarea Scaling Implementation**
   - Research: CSS transform vs inline style calculations
   - Decision needed: How to apply 1.2x/1.4x multipliers proportionally?
   - Options: CSS custom properties (variables), Tailwind arbitrary values, style object computation

### Data Model Requirements

From spec Key Entities, need to define:
- **HistoryEntry structure**: How to store configuration snapshots efficiently
- **HistoryStack interface**: FIFO queue behavior with 50-state limit
- **PanelState interface**: Animation state management
- **ConfigurationState type**: Extended from useConfigStore

---

## Phase 1: Design & Contracts

### Data Model Design

**Entities to Define**:

1. **HistoryEntry**
   ```typescript
   interface HistoryEntry {
     id: string
     timestamp: number
     config: ConfigurationState // full config snapshot
     description?: string // optional change description
   }
   ```

2. **HistoryStack**
   ```typescript
   interface HistoryStack {
     entries: HistoryEntry[]
     currentIndex: number // points to current state
     maxSize: 50 // maximum entries
   }
   ```

3. **PanelState** (extend existing useUIStore)
   ```typescript
   interface PanelState {
     isVisible: boolean
     isAnimating: boolean
     lastToggled: number
   }
   ```

4. **TextareaScaleState** (extend existing useUIStore)
   ```typescript
   interface TextareaScaleState {
     size: 'default' | 'medium' | 'large' | 'fullscreen'
     scaleMultiplier: 1.0 | 1.2 | 1.4 | 1.5
   }
   ```

### Contracts (Internal APIs)

**Config Store Extensions**:
```typescript
// History Management
interface ConfigStoreHistory {
  history: HistoryStack
  undo(): void
  redo(): void
  canUndo(): boolean
  canRedo(): boolean
  clearHistory(): void
  recordChange(change: Partial<ConfigurationState>): void
}

// Panel Visibility
interface ConfigStorePanel {
  panelVisible: boolean
  togglePanel(): void
}
```

**UI Store Extensions**:
```typescript
interface UIStoreExtensions {
  panelState: PanelState
  textareaScale: TextareaScaleState
  setPanelVisible(visible: boolean): void
  setTextareaScale(size: TextareaSize): void
}
```

---

## Implementation Phases

### Phase 1A: Config Panel Toggle (P1)
**Duration**: 2-3 days

**Tasks**:
1. Add panel visibility state to useUIStore
2. Create toggle button component (Settings icon) in ContentPanel header
3. Implement panel slide animation with Framer Motion
4. Add localStorage persistence (key: 'configPanelVisible')
5. Add keyboard shortcut (Ctrl/Cmd + ,)
6. Ensure responsive behavior (hidden by default on mobile/tablet)
7. Add ARIA labels and screen reader announcements

**Files to Modify**:
- [`stores/useUIStore.ts`](stores/useUIStore.ts)
- [`components/teleprompter/editor/ContentPanel.tsx`](components/teleprompter/editor/ContentPanel.tsx)
- [`components/teleprompter/ConfigPanel.tsx`](components/teleprompter/config/ConfigPanel.tsx)
- [`components/teleprompter/Editor.tsx`](components/teleprompter/Editor.tsx)

**Testing**:
- Unit test: toggle button click updates state
- Unit test: localStorage persistence across reloads
- Unit test: keyboard shortcut functionality
- Integration test: panel animation smoothness
- Accessibility test: ARIA labels and announcements

### Phase 1B: Real-Time Preview (P1)
**Duration**: 3-4 days

**Tasks**:
1. Ensure PreviewPanel subscribes to useConfigStore
2. Add loading state indicators to PreviewPanel
3. Implement batch update debouncing (50ms window)
4. Add error state handling for invalid media URLs
5. Create "Test" button for entrance animations
6. Optimize for 100ms update target
7. Add performance monitoring

**Files to Modify**:
- [`components/teleprompter/editor/PreviewPanel.tsx`](components/teleprompter/editor/PreviewPanel.tsx)
- [`lib/stores/useConfigStore.ts`](lib/stores/useConfigStore.ts)
- [`components/teleprompter/config/animations/AnimationsTab.tsx`](components/teleprompter/config/animations/AnimationsTab.tsx)

**Testing**:
- Integration test: Preview updates within 100ms
- Performance test: 60 FPS maintained during rapid changes
- Unit test: Loading states display correctly
- Unit test: Error states display for invalid URLs

### Phase 2A: Proportional UI Scaling (P2)
**Duration**: 2-3 days

**Tasks**:
1. Define scale multipliers (1.2x, 1.4x, 1.5x) in useUIStore
2. Update TextareaExpandButton to scale with textarea
3. Update footer action buttons to scale proportionally
4. Ensure no horizontal scroll at any size
5. Implement 200ms size transition
6. Add cap for label text (16px max)
7. Test on minimum viewport width (375px)

**Files to Modify**:
- [`stores/useUIStore.ts`](stores/useUIStore.ts)
- [`components/teleprompter/editor/TextareaExpandButton.tsx`](components/teleprompter/editor/TextareaExpandButton.tsx)
- [`components/teleprompter/editor/ContentPanel.tsx`](components/teleprompter/editor/ContentPanel.tsx)

**Testing**:
- Visual regression test: Button scaling at each size level
- Unit test: Scale multipliers calculated correctly
- Integration test: No horizontal scroll appears
- Responsive test: Layout intact at 375px width

### Phase 2B: Configuration Undo/Redo (P2)
**Duration**: 4-5 days

**Tasks**:
1. Implement HistoryStack data structure
2. Create history management middleware for useConfigStore
3. Add hybrid recording logic (discrete=immediate, continuous=batched)
4. Implement undo/redo keyboard shortcuts
5. Add visual indicator ("5/10 changes")
6. Create "Clear History" dialog
7. Reset history on preset/template/script load
8. Implement localStorage persistence for history

**Files to Modify**:
- [`lib/stores/useConfigStore.ts`](lib/stores/useConfigStore.ts)
- [`components/teleprompter/config/ConfigPanel.tsx`](components/teleprompter/config/ConfigPanel.tsx)
- [`components/ui/dialog.tsx`](components/ui/dialog.tsx) - for clear history confirmation

**Testing**:
- Unit test: History stack maintains 50-state limit
- Unit test: FIFO removal when limit exceeded
- Integration test: Undo/redo restores correct states
- Unit test: Keyboard shortcuts work correctly
- Integration test: History resets on preset/template load

### Phase 3A: Mobile Config Interface (P3)
**Duration**: 5-6 days

**Tasks**:
1. Extend/modify TabBottomSheet for mobile config
2. Implement bottom sheet with 90% height
3. Add tab pills as horizontally scrollable
4. Touch-optimize all sliders (48px minimum)
5. Create mobile-specific color picker wrapper (native input)
6. Create mobile font picker (native select/modal)
7. Implement swipe-to-close gesture (100px threshold)
8. Add "Done" button
9. Implement landscape split view
10. Add compact layout for < 375px devices

**Files to Modify**:
- [`components/teleprompter/config/TabBottomSheet.tsx`](components/teleprompter/config/TabBottomSheet.tsx)
- [`components/teleprompter/config/ui/SliderInput.tsx`](components/teleprompter/config/ui/SliderInput.tsx)
- [`components/teleprompter/config/colors/ColorsTab.tsx`](components/teleprompter/config/colors/ColorsTab.tsx)
- [`components/teleprompter/config/typography/FontSelector.tsx`](components/teleprompter/config/typography/FontSelector.tsx)
- [`components/teleprompter/config/ConfigTabs.tsx`](components/teleprompter/config/ConfigTabs.tsx)

**Testing**:
- Mobile integration test: Bottom sheet opens correctly
- Touch test: Sliders meet 48px touch target
- Gesture test: Swipe-to-close works at 100px threshold
- Responsive test: Landscape split view activates
- Accessibility test: "Done" button and gestures accessible

### Phase 3B: Adaptive Footer (P3)
**Duration**: 2-3 days

**Tasks**:
1. Calculate footer scale multiplier based on textarea size
2. Implement fixed/sticky positioning at viewport bottom
3. Add bottom padding to content equal to footer height
4. Ensure 44x44px minimum touch targets for all buttons
5. Hide footer in fullscreen mode
6. Add semi-transparent backdrop (bg-card/90)
7. Implement reflow for mobile (wrap if needed)

**Files to Modify**:
- [`stores/useUIStore.ts`](stores/useUIStore.ts)
- [`components/teleprompter/editor/ContentPanel.tsx`](components/teleprompter/editor/ContentPanel.tsx)

**Testing**:
- Integration test: Footer remains fixed at bottom
- Visual test: No content hidden behind footer
- Responsive test: Touch targets maintained
- Mobile test: Footer reflow works on small screens

---

## Dependencies & Risks

### Dependencies
- **Framer Motion** - Required for panel animations (existing dependency)
- **Zustand** - Required for state management (existing dependency)
- **Tailwind CSS** - Required for responsive utilities (existing dependency)

### Risks
- **Breaking Changes**: Panel toggle could disrupt Editor layout - **Mitigation**: Test thoroughly on all viewport sizes
- **Performance Overhead**: History management adds <5ms per change - **Mitigation**: Batch updates, limit to 50 states
- **Mobile Complexity**: Bottom sheet implementation may require custom component - **Mitigation**: Leverage existing TabBottomSheet patterns
- **Browser Support**: prefers-reduced-motion must be respected - **Mitigation**: Test with accessibility tools

---

## Success Metrics Tracking

### Quantitative Metrics
- Panel toggle animation: 300ms ±50ms
- Preview update latency: <100ms for 95% of changes
- History overhead: <5ms per change
- Mobile panel open time: <200ms on 90% of devices
- No horizontal scroll at any textarea size

### Qualitative Metrics
- User satisfaction: 85% improved workspace satisfaction (survey)
- Confidence in exploration: 80% increased confidence due to undo/redo
- Mobile usability: 75% report "accessible" or "easy to use"
- Polished feel: 90% report "professional" with proportional scaling

### Testing Coverage Goals
- Unit tests: 80% coverage for new components
- Integration tests: All user scenarios covered
- E2E tests: Critical paths (toggle, preview, undo/redo)
- Accessibility: WCAG 2.1 AA compliance for all new features
- Performance: 60 FPS maintained during rapid interactions

---

## Next Steps

1. **Phase 0**: Complete research tasks above and document in `research.md`
2. **Phase 1A**: Begin Config Panel Toggle implementation (highest priority)
3. **Phase 1B**: Implement Real-Time Preview alongside toggle
4. **Phase 2**: Implement P2 features (Scaling, Undo/Redo)
5. **Phase 3**: Implement P3 features (Mobile, Footer)
6. **Final Testing**: Comprehensive test suite and performance validation
7. **Documentation**: Update README and user guides

**Current Phase**: Research & Design Decisions (Phase 0)

**Ready for Phase 1**: After research.md is complete with all decisions documented
