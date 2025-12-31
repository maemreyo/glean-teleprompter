# Research: Studio Page UI/UX Improvements

**Feature**: 004-studio-ui-ux-improvements  
**Date**: 2025-12-31  
**Status**: Complete

## Overview

This document consolidates research findings for 10 UI/UX improvements to the Studio page. Each technology decision is documented with rationale and alternatives considered.

---

## 1. Mobile Bottom Sheet Pattern

### Decision: Use Framer Motion with custom implementation

**Rationale**:
- **Already in use**: Project already uses Framer Motion for animations (Editor.tsx, Runner.tsx)
- **No additional dependencies**: Avoids adding react-spring or other animation libraries
- **TypeScript support**: Excellent TypeScript support
- **Performance**: Hardware-accelerated CSS transitions via animate prop
- **Customizable**: Full control over bottom sheet behavior (snap points, drag gestures)

**Implementation Approach**:
```typescript
// Use Framer Motion's motion.div with drag constraints
<motion.div
  drag="y"
  dragConstraints={{ top: 0, bottom: 300 }}
  dragElastic={0.2}
  initial={{ y: "100%" }}
  animate={{ y: isOpen ? "0%" : "100%" }}
  transition={{ type: "spring", damping: 25, stiffness: 300 }}
/>
```

**Alternatives Considered**:
- **react-spring**: Powerful but adds another animation library, larger bundle size
- **react-bottom-sheet**: Popular library but less flexible, additional dependency
- **Pure CSS**: Simpler but lacks gesture handling and snap points

**Snap Points Strategy**:
- Mobile: 60% screen height (open), 0% (closed)
- Tablet: 40% width right-side panel (using conditional render based on breakpoint)
- Swipe-down gesture to close (via drag="y")

---

## 2. Skeleton Screen Patterns

### Decision: Use shadcn/ui Skeleton component + custom variants

**Rationale**:
- **shadcn/ui consistency**: Project already uses shadcn/ui components
- **Tailwind CSS based**: Matches existing styling approach
- **Customizable**: Easy to create variants for ContentPanel, ConfigPanel, PreviewPanel
- **Accessible**: Built-in ARIA attributes for loading states

**Implementation Approach**:
```typescript
// Create skeleton variants for each panel
const ContentPanelSkeleton = () => (
  <div className="space-y-3 animate-pulse">
    <Skeleton className="h-4 w-[250px]" />
    <Skeleton className="h-32 w-full" />
  </div>
);
```

**Skeleton Structure**:
- **ContentPanel**: Header bar (h-4), textarea placeholder (h-32), button placeholders
- **ConfigPanel**: Tab bar (h-12), content placeholders (3-4 bars per tab)
- **PreviewPanel**: Rectangle placeholder matching preview aspect ratio

**Animation Timing**:
- Fade out: 300ms transition when content loads (matches FR-018)
- Use Framer Motion's AnimatePresence for exit animations

**Alternatives Considered**:
- **react-loading-skeleton**: Popular but redundant with shadcn/ui
- **Custom CSS only**: More control but more maintenance
- **react-spinners**: Spinners instead of skeletons, less modern UX

---

## 3. ARIA Label Best Practices

### Decision: WAI-ARIA Authoring Practices 1.2 + custom hook pattern

**Rationale**:
- **WCAG 2.1 AA compliance**: Follow official W3C guidelines
- **Screen reader tested**: Patterns tested with NVDA, VoiceOver, TalkBack
- **Consistent naming**: Create reusable ARIA label constants
- **Dynamic announcements**: Use aria-live for status updates

**Implementation Approach**:
```typescript
// lib/a11y/ariaLabels.ts
export const ARIA_LABELS = {
  configTab: (label: string, index: number, total: number) => 
    `${label} tab, ${index + 1} of ${total}`,
  colorSwatch: (color: string) => `Color ${color}, hex ${color}`,
  slider: (label: string, value: number, unit: string) => 
    `${label}, ${value} ${unit}`,
} as const;

// Use in components
<button
  aria-label={ARIA_LABELS.configTab('Typography', 0, 7)}
  aria-selected={isActive}
  role="tab"
>
```

**Keyboard Navigation Pattern**:
- **Tabs**: Arrow keys (Left/Right) to navigate, Enter/Space to select
- **Color picker**: Arrow keys within grid, Enter to select
- **Sliders**: Arrow keys for incremental changes, Home/End for min/max
- **Focus trap**: In modals (shortcuts help), trap focus with Escape to close

**Focus Indicators**:
```css
/* Global focus styles (add to globals.css) */
*:focus-visible {
  outline: 2px solid hsl(var(--primary));
  outline-offset: 2px;
}
```

**Alternatives Considered**:
- **react-aria**: Comprehensive but heavy for our use case
- **radix-ui primitives**: Good but requires significant refactoring
- **Manual ARIA only**: More error-prone, inconsistent patterns

---

## 4. Text Virtualization

### Decision: Custom implementation with React.memo (no virtualization library)

**Rationale**:
- **Text is simple content**: Unlike complex lists, teleprompter text is plain paragraphs
- **React.memo sufficient**: Memoizing TeleprompterText component prevents unnecessary re-renders
- **Bundle size**: Avoids adding ~10KB for react-virtual or react-window
- **CSS overflow**: Native scrolling is already optimized by browsers
- **Performance target**: 50ms typing latency achievable without virtualization

**Implementation Strategy**:

**1. Component Memoization**:
```typescript
export const TeleprompterText = React.memo(({ text, config }) => {
  // Component implementation
}, (prevProps, nextProps) => {
  // Custom comparison: only re-render if text or config changes
  return prevProps.text === nextProps.text && 
         prevProps.config === nextProps.config;
});
```

**2. Debounced Config Updates**:
```typescript
const debouncedUpdateConfig = useMemo(
  () => debounce((newConfig) => {
    setConfig(newConfig);
  }, 16), // ~60fps
  []
);
```

**3. Lazy Rendering for Very Long Scripts**:
```typescript
// For scripts > 10,000 words, show warning and suggest splitting
if (wordCount > 10000) {
  return <LargeScriptWarning />;
}
```

**Performance Testing**:
- Measure typing latency with Chrome DevTools Performance tab
- Target: < 50ms for 5000-word scripts
- Fallback: If latency exceeds 100ms, show "Large script - consider splitting" message

**Alternatives Considered**:
- **react-virtual**: Overkill for simple text content, adds complexity
- **react-window**: Similar to react-virtual, not designed for text
- **Pagination**: Breaks reading flow, not suitable for teleprompter

---

## 5. Web Workers for Auto-Save

### Decision: Use requestIdleCallback + debouncing (no Web Workers)

**Rationale**:
- **localStorage is synchronous but fast**: < 5ms for typical script data
- **Web Worker overhead**: Serialization/deserialization cost exceeds save time
- **Complexity**: Web Workers require separate files, complicate Next.js App Router
- **Non-blocking achievable**: Use requestIdleCallback to schedule saves during browser idle

**Implementation Approach**:
```typescript
// hooks/useAutoSave.ts
const useAutoSave = (data: any, interval: number = 5000) => {
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  
  useEffect(() => {
    const saveTimer = setInterval(() => {
      requestIdleCallback(() => {
        try {
          setStatus('saving');
          localStorage.setItem('teleprompter_draft', JSON.stringify(data));
          setStatus('saved');
        } catch (error) {
          setStatus('error');
        }
      });
    }, interval);
    
    return () => clearInterval(saveTimer);
  }, [data, interval]);
  
  return status;
};
```

**Debouncing Strategy**:
- Only save after changes have stopped for 5 seconds
- Prevents excessive writes during active typing
- Reset timer on every keystroke

**Error Handling**:
- **Quota exceeded**: Clear old drafts, show error with "Sign up for cloud storage" CTA
- **Privacy mode**: Detect when storage is disabled, show appropriate message

**Alternatives Considered**:
- **Web Workers**: Too complex for simple localStorage writes
- **IndexedDB**: Overkill, more complex API than localStorage
- **Service Workers**: Not suitable for same-origin localStorage

---

## 6. Keyboard Shortcuts Library

### Decision: Custom hook with react-keyboard-event-listener

**Rationale**:
- **Lightweight**: Only ~2KB gzipped
- **React-specific**: Designed for React components
- **Composable**: Can create scoped shortcut listeners
- **TypeScript support**: Strong typing for key combinations
- **No conflicts**: Handles modifier keys correctly (Ctrl/Cmd, Alt/Option)

**Implementation Approach**:
```typescript
// hooks/useKeyboardShortcuts.ts
import useKeyboardEventListener from 'react-keyboard-event-listener';

export const useKeyboardShortcuts = () => {
  // Modal toggle
  useKeyboardEventListener(
    [{ keys: ['Shift', '?'], action: 'openShortcutsModal' }],
    (e) => {
      e.preventDefault();
      toggleShortcutsModal();
    }
  );
  
  // Existing shortcuts (document existing)
  useKeyboardEventListener(
    [{ keys: ['Control', 'z'], action: 'undo' }],
    (e) => {
      e.preventDefault();
      useConfigStore.getState().undo();
    }
  );
};
```

**Shortcut Categories**:
- **Global**: ? (shortcuts modal), Esc (exit fullscreen/collapse)
- **Editing**: Ctrl+S (save), Ctrl+/ (formatting help)
- **Navigation**: Ctrl+1-7 (switch config tabs)
- **Config**: Ctrl+Z/Y (undo/redo - existing)

**Platform Detection**:
```typescript
const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
const modifierKey = isMac ? 'Cmd' : 'Ctrl';
```

**Conflict Prevention**:
- Check for existing browser shortcuts (Ctrl+S for save, Ctrl+P for print)
- Provide alternative shortcuts (e.g., Ctrl+Shift+S for save if Ctrl+S conflicts)
- Document all shortcuts in modal for user reference

**Alternatives Considered**:
- **hotkeys.js**: Popular but not React-specific, requires manual cleanup
- **react-hotkeys-hook**: Good alternative but slightly larger bundle
- **Pure event listeners**: More control but more boilerplate and edge cases

---

## 7. Performance Monitoring Tools

### Decision: Custom performance hooks + Chrome DevTools integration

**Rationale**:
- **No production monitoring**: This feature doesn't require production analytics
- **Development-focused**: Use during development and testing only
- **Built-in APIs**: Performance API, requestAnimationFrame sufficient
- **Bundle size**: Avoid adding monitoring libraries for development-only feature

**Implementation Approach**:

**1. Typing Latency Measurement**:
```typescript
// lib/utils/performance.ts
export const measureTypingLatency = () => {
  const start = performance.now();
  
  return (callback: () => void) => {
    callback();
    const end = performance.now();
    return end - start;
  };
};

// Usage in component
const measure = measureTypingLatency();
setText(newValue);
const latency = measure(() => {/* render complete */});
if (latency > 50) {
  console.warn(`Typing latency exceeded 50ms: ${latency}ms`);
}
```

**2. Frame Rate Monitoring**:
```typescript
export const useFrameRate = () => {
  const [fps, setFps] = useState(60);
  
  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    
    const measureFps = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime >= lastTime + 1000) {
        setFps(Math.round((frameCount * 1000) / (currentTime - lastTime)));
        frameCount = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(measureFps);
    };
    
    const rafId = requestAnimationFrame(measureFps);
    return () => cancelAnimationFrame(rafId);
  }, []);
  
  return fps;
};
```

**3. Development Mode Only**:
```typescript
if (process.env.NODE_ENV === 'development') {
  // Enable performance monitoring
  // Show FPS counter in corner
  // Log slow operations
}
```

**Testing Approach**:
- Manual testing with Chrome DevTools Performance tab
- Measure typing latency with 5000-word script
- Verify 60fps during config slider adjustments
- Test on low-end devices (Chrome DevTools device simulation)

**Alternatives Considered**:
- **Web Vitals**: Good for production monitoring but overkill for development
- **react-performance**: Adds bundle size for development-only feature
- **Profiler (React)**: Useful but requires React DevTools, programmatic API better

---

## Summary of Technology Choices

| Area | Choice | Bundle Impact | Complexity |
|------|--------|---------------|------------|
| Bottom Sheets | Framer Motion (existing) | 0 KB | Low |
| Skeleton Screens | shadcn/ui Skeleton (existing) | 0 KB | Low |
| ARIA Labels | Custom + constants | 0 KB | Low |
| Text Virtualization | React.memo (built-in) | 0 KB | Low |
| Auto-Save | requestIdleCallback (built-in) | 0 KB | Low |
| Keyboard Shortcuts | react-keyboard-event-listener | ~2 KB | Low |
| Performance Monitoring | Custom hooks + Performance API | 0 KB | Low |

**Total New Dependencies**: 1 (react-keyboard-event-listener ~2KB)

**Constitution Alignment**: ✅ All choices align with technology standards (Next.js, TypeScript, minimal dependencies)

---

## Next Steps

With Phase 0 research complete:

1. ✅ **Technical Context**: Defined in plan.md
2. ✅ **Constitution Check**: Passed all gates
3. ✅ **Research Decisions**: Documented in this file
4. ⏳ **Phase 1**: Create data-model.md and quickstart.md

---

**Research Status**: ✅ Complete  
**All NEEDS CLARIFICATION items resolved**
