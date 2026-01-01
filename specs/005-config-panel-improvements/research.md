# Research: Configuration Panel UI/UX Improvements

**Feature**: Configuration Panel UI/UX Improvements  
**Branch**: `005-config-panel-improvements`  
**Created**: 2026-01-01  
**Status**: In Progress

---

## Decision 1: Panel Animation Approach

**Question**: Should we use Framer Motion or CSS transitions for the 300ms panel slide animation?

**Decision**: **Framer Motion**

**Rationale**:
- Framer Motion is already a project dependency (used in [`ConfigTabs.tsx`](../../components/teleprompter/config/ConfigTabs.tsx))
- Provides built-in animation controls and spring physics for smooth 60fps animations
- Better handling of animation state (isAnimating, animationProgress)
- Easier to implement complex exit/enter animations
- Proven pattern in existing codebase (see AnimatePresence usage)

**Alternatives Considered**:
1. **CSS Transitions**: Lighter weight, but harder to control complex animation states; less fine-grained control
2. **React Spring**: Not in project stack; adds new dependency
3. **Pure CSS Animations**: Difficult to coordinate with React state; less flexible

**Implementation Details**:
- Use Framer Motion's `motion.div` wrapper around ConfigPanel
- Implement slide-in/slide-out variants
- Respect `prefers-reduced-motion` media query (disable animations when user prefers reduced motion)
- 300ms duration with ease-out timing function
- Animate `x` property from `0` to `100%` (or equivalent off-canvas values)

---

## Decision 2: History Management Pattern

**Question**: How should we integrate undo/redo functionality into the existing Zustand store?

**Decision**: **Zustand Middleware with HistorySnapshot Pattern**

**Rationale**:
- Zustand supports middleware for intercepting state changes
- Allows keeping history separate from config state (avoids polluting config interface)
- Can easily implement FIFO limit (50 states)
- Enables selective recording (discrete vs batched)
- TypeScript-friendly with existing strict mode setup

**Alternatives Considered**:
1. **Separate History Store**: Would require complex coordination between stores; added complexity
2. **Patch Middleware**: Powerful but adds complexity; overkill for this use case
3. **In-Store History Array**: Pollutes config state; harder to manage FIFO limit

**Implementation Details**:
```typescript
// Middleware that records config changes
const historyMiddleware = (config: ConfigurationState) => (set: StateCreator<ConfigurationState>) => (get, api) => {
  const historyStore = create<HistoryStack>(() => ({
    entries: [],
    currentIndex: -1,
  }))
  
  // Record changes to history (discrete=immediate, batched on release)
  const recordChange = (change: Partial<ConfigurationState>, isBatched: boolean) => {
    // Implementation: push to entries, enforce 50-state limit
  }
  
  return Object.assign(set(get()), api, { recordChange, undo, redo, clearHistory })
})
```

---

## Decision 3: Real-Time Preview Architecture

**Question**: How should we efficiently sync configuration changes to the preview panel?

**Decision**: **useConfigStore Subscription Pattern with React.memo Optimization**

**Rationale**:
- PreviewPanel already exists as separate component
- Zustand stores provide efficient subscription mechanism
- React.memo prevents unnecessary re-renders of preview
- Direct store access enables 100ms update target
- No additional event emitter needed

**Alternatives Considered**:
1. **Custom Event Emitter**: Overkill; adds complexity
2. **React Context + useSync**: Less efficient for frequent updates
3. **Polling**: Too slow; not real-time

**Implementation Details**:
- PreviewPanel subscribes to specific config slices using `useConfigStore` hooks
- Each tab component (TypographyTab, etc.) updates store directly
- PreviewPanel wraps preview content in React.memo with custom comparison
- Batch updates (within 50ms) reduce re-renders
- Loading and error states managed in PreviewPanel component

```typescript
// PreviewPanel component pattern
const PreviewPanel = () => {
  const config = useConfigStore(state => ({
    typography: state.typography,
    colors: state.colors,
    // ... other slices
  }))
  
  return (
    <React.memo>
      <TeleprompterText config={config} />
    </React.memo>
  )
}
```

---

## Decision 4: Mobile Bottom Sheet Component

**Question**: Should we use existing TabBottomSheet or create a new component?

**Decision**: **Extend and Modify TabBottomSheet for Mobile Config Panel**

**Rationale**:
- Existing component already handles swipe gestures and animations
- Reduces code duplication and maintenance burden
- Proven pattern in mobile UX (familiar to users)
- Can be adapted for configuration needs

**Alternatives Considered**:
1. **New MobileConfigPanel Component**: More control but adds maintenance burden
2. **Third-party Library (e.g., react-bottom-sheet)**: Adds dependency; may conflict with existing patterns
3. **Pure CSS/HTML Solution**: Difficult to maintain; lacks gesture support

**Implementation Details**:
- Add props to TabBottomSheet for configuration mode
- Override default height to 90% viewport
- Add touch-optimized tab pills component
- Integrate with ConfigTabs component (reuse existing tab components)
- Add "Done" button at top-right
- Implement landscape split view (conditional rendering based on orientation)
- Use existing swipe-to-close gesture (100px threshold from FR-048)

---

## Decision 5: Textarea Scaling Implementation

**Question**: How should we calculate and apply proportional scaling multipliers?

**Decision**: **CSS Custom Properties (Variables) + Tailwind Arbitrary Values**

**Rationale**:
- CSS variables enable smooth 200ms transitions
- Tailwind arbitrary values (`scale-[1.2]`) for exact multipliers
- Performant and maintainable
- Works with existing Tailwind setup
- Browser-native (no JavaScript overhead for scaling)

**Alternatives Considered**:
1. **Inline Style Computation**: More control but slower; harder to animate
2. **CSS Transform Scale**: Would scale entire element including text, not desired
3. **Hardcoded Size Classes**: Less flexible; doesn't scale proportionally

**Implementation Details**:
```typescript
// Define scale multipliers as CSS variables
const scaleMultipliers = {
  default: 1,
  medium: 1.2,
  large: 1.4,
  fullscreen: 1.5,
}

// Apply via CSS custom properties
const scaledButtonStyle = {
  transform: `scale(${scaleMultipliers[size]})`,
  transition: 'transform 200ms ease-out',
}

// For label text with cap
const labelStyle = {
  fontSize: `calc(var(--base-label-size) * ${Math.min(scaleMultipliers[size], 16/12)})`,
}
```

---

## Decision 6: Button Positioning in UI

**Question**: Where exactly should the config toggle button be placed in the content panel header?

**Decision**: **In the content panel header, right side of existing controls, with proper spacing**

**Rationale**:
- Header already exists with ThemeSwitcher and auth controls
- Consistent with existing UI patterns
- Always visible regardless of textarea size
- Easy to discover and access

**Implementation Details**:
- Add button in [`ContentPanel.tsx`](../../components/teleprompter/editor/ContentPanel.tsx) header section
- Position after ThemeSwitcher and before/after auth controls
- Use Settings icon from Lucide React
- Minimum 44x44px touch target
- Add tooltip/descriptive label for accessibility

---

## Decision 7: Mobile Breakpoint Strategy

**Question**: What breakpoints should define mobile vs tablet vs desktop?

**Decision**: **Tailwind Standard Breakpoints (Mobile < 768px, Tablet 768-1023px, Desktop > 1023px)**

**Rationale**:
- Industry-standard breakpoints widely recognized
- Consistent with existing Tailwind setup in project
- Clear delineation between device classes
- Maps to existing media query patterns

**Alternatives**:
- Single mobile/desktop split (< 1024px, ≥ 1024px): Simpler but less granular
- Custom breakpoints: More control but harder to maintain

**Implementation Details**:
```typescript
// Use in component checks
const isMobile = useMediaQuery('(max-width: 767px)')
const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1023px)')
const isDesktop = useMediaQuery('(min-width: 1024px)')
```

---

## Decision 8: Animation Easing Function

**Question**: What timing function should be used for panel animations?

**Decision**: **CSS ease-out (cubic-bezier(0, 0, 0.2, 1))**

**Rationale**:
- Feels natural and "fast" for UI panel transitions
- Industry standard for slide-in/slide-out animations
- Provides slight deceleration for polish
- Supported natively by CSS and Framer Motion
- Better user experience than linear timing

**Accessibility Consideration**:
- Disabled entirely when `prefers-reduced-motion` is set
- Animation completes instantly (0ms) for users who prefer reduced motion
- Framer Motion's `useReducedMotion()` hook can detect preference

---

## Decision 9: Footer Positioning Strategy

**Question**: How should we implement fixed/sticky footer positioning?

**Decision**: **CSS position: fixed with viewport bottom anchoring + bottom padding on content**

**Rationale**:
- CSS native solution, no JavaScript overhead
- Works reliably across browsers
- Footer always visible, consistent UX
- Content padding prevents overlap
- Matches mobile design patterns users expect

**Implementation Details**:
```css
.footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 40; /* Above content */
  background: hsl(var(--card) / 0.9); /* Semi-transparent */
}

.content-area {
  padding-bottom: var(--footer-height); /* Dynamic based on footer size */
}
```

---

## Summary

**All Clarifications Resolved**: ✅

| Research Question | Decision | Impact |
|------------------|----------|--------|
| Panel Animation | Framer Motion | Leverage existing dependency, smooth 60fps |
| History Management | Zustand middleware | Clean separation, TypeScript-friendly |
| Real-Time Preview | useConfigStore subscription | Direct, efficient, reactive |
| Mobile Bottom Sheet | Extend TabBottomSheet | Reuse proven pattern |
| Textarea Scaling | CSS variables + Tailwind arbitrary | Performant, animatable |
| Button Positioning | ContentPanel header, right side | Consistent UX, discoverable |
| Mobile Breakpoints | Tailwind standards (<768px, 768-1023px, >1023px) | Industry standard |
| Animation Timing | ease-out, respect prefers-reduced-motion | Accessible, natural feel |
| Footer Positioning | CSS fixed + content padding | Reliable, performant |

**Ready for Phase 1**: ✅ All decisions documented, no blockers remaining
