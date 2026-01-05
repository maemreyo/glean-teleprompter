# Research: Standalone Story with Teleprompter

**Feature**: 012-standalone-story
**Date**: 2026-01-05
**Status**: Complete

## Overview

This document consolidates research findings for all technology decisions and best practices required to implement the standalone story feature. All "NEEDS CLARIFICATION" items from the implementation plan have been resolved.

---

## 1. NoSleep.js Integration Pattern

### Decision: Load NoSleep.js from CDN with Async Script Injection

**Implementation Approach**:
```typescript
// lib/story/hooks/useWakeLock.ts
const loadNoSleep = async (): Promise<typeof NoSleep | null> => {
  // Check if Wake Lock API is supported first
  if ('wakeLock' in navigator) {
    return null; // NoSleep not needed
  }

  // Check if already loaded
  if (window.NoSleep) {
    return window.NoSleep;
  }

  // Load from CDN
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/nosleep.js@0.12.0/dist/NoSleep.min.js';
    script.async = true;
    script.onload = () => resolve(window.NoSleep);
    script.onerror = () => {
      console.error('NoSleep.js failed to load from CDN');
      resolve(null);
    };
    document.head.appendChild(script);
  });
};
```

**Rationale**:
- **CDN URL**: jsDelivr provides reliable CDN hosting with fallback to unpkg if needed
- **Async Loading**: Non-blocking load that doesn't delay initial render
- **Error Handling**: Graceful degradation if CDN fails
- **TypeScript Types**: Add `@types/nosleep.js` or declare custom types
- **Wake Lock Priority**: Check native API first to avoid unnecessary CDN load

**Alternatives Considered**:
1. **Bundle NoSleep.js**: Rejected because adds ~2KB to bundle size for Safari-only use case
2. **Wake Lock Only**: Rejected because Safari/iOS users would have no wake lock support
3. **Multiple CDN Fallbacks**: Rejected due to complexity; single reliable CDN (jsDelivr) sufficient

**TypeScript Declaration**:
```typescript
// types/nosleep.d.ts
declare global {
  interface Window {
    NoSleep?: {
      new (): {
        enable(): Promise<void>;
        disable(): Promise<void>;
      };
    };
  }
}
```

---

## 2. Virtual Scrolling Library Selection

### Decision: Custom Implementation with Intersection Observer

**Implementation Approach**:
```typescript
// lib/story/utils/virtualScroller.ts
export const useVirtualScroller = (content: string, threshold = 50) => {
  const paragraphs = useMemo(() => {
    return content.split('\n\n');
  }, [content]);

  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 10 });

  const observerCallback = useCallback((entries: IntersectionObserverEntry[]) => {
    // Update visible range based on viewport
    const visibleIndexes = entries
      .filter(entry => entry.isIntersecting)
      .map(entry => parseInt(entry.target.dataset.index || '0'));

    if (visibleIndexes.length > 0) {
      setVisibleRange({
        start: Math.max(0, Math.min(...visibleIndexes) - 5),
        end: Math.min(paragraphs.length, Math.max(...visibleIndexes) + 5)
      });
    }
  }, [paragraphs.length]);

  const { ref } = useIntersectionObserver(observerCallback, {
    threshold: 0.1
  });

  return {
    paragraphs,
    visibleRange,
    visibleParagraphs: paragraphs.slice(visibleRange.start, visibleRange.end)
  };
};
```

**Rationale**:
- **Lightweight**: No additional library dependencies
- **React 18+ Compatible**: Works seamlessly with concurrent rendering
- **Mobile Optimized**: Intersection Observer is performant on mobile devices
- **Paragraph-Based**: Natural boundary for text content (better than arbitrary line heights)
- **Simplicity**: Custom implementation easier to maintain than learning library API

**Alternatives Considered**:
1. **react-window**: Rejected because designed for fixed-height rows, not variable text paragraphs
2. **react-virtualized**: Rejected because larger bundle size (~30KB), overkill for this use case
3. **react-virtuoso**: Rejected because more complex than needed, though excellent for lists

**Performance Considerations**:
- Activate virtual scrolling only when paragraph count > 50 (FR-035)
- Render 5 paragraphs before and after visible range for smooth scrolling
- Use `will-change: transform` on paragraph elements for GPU acceleration

---

## 3. 9:16 Aspect Ratio Implementation

### Decision: CSS Custom Properties with env() Safe Areas

**Implementation Approach**:
```css
/* app/story/[storyId]/page.css */
.story-container {
  /* Fix mobile viewport height issue */
  height: 100vh;
  height: 100dvh; /* Dynamic viewport height (preferred) */
  max-width: 100vw;
  max-width: 100dvw;

  /* Fallback for browsers without dvh support */
  @supports not (height: 100dvh) {
    height: calc(var(--vh, 1vh) * 100);
  }

  /* Safe area insets for notched devices */
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);

  /* 9:16 aspect ratio enforcement */
  aspect-ratio: 9 / 16;
  width: 100%;
  max-width: 56.25vh; /* 9/16 * 100vh */
}

/* Focal point adjustment for safe area */
.teleprompter-focal-point {
  top: calc(33vh + env(safe-area-inset-top, 0px));
  top: calc(33dvh + env(safe-area-inset-top, 0px));

  /* Adjust to 38% when safe area detected */
  @supports (padding-top: env(safe-area-inset-top)) {
    top: 38vh;
    top: 38dvh;
  }
}
```

**JavaScript Fix for --vh**:
```typescript
// lib/story/hooks/useVHFix.ts
export const useVHFix = () => {
  useEffect(() => {
    const setVH = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    setVH();
    window.addEventListener('resize', setVH);
    window.addEventListener('orientationchange', setVH);

    return () => {
      window.removeEventListener('resize', setVH);
      window.removeEventListener('orientationchange', setVH);
    };
  }, []);
};
```

**Rationale**:
- **dvh Support**: Modern browsers support `dvh` (dynamic viewport height), which fixes address bar issues
- **Fallback**: `--vh` custom property for older browsers
- **Safe Areas**: `env()` function provides native safe area detection on iOS and Android
- **Aspect Ratio**: CSS `aspect-ratio` property (widely supported in 2024)

**Alternatives Considered**:
1. **Fixed Height (e.g., 812px)**: Rejected because doesn't adapt to different device sizes
2. **Container Queries**: Rejected because not widely supported yet, adds complexity
3. **JavaScript-Only Height**: Rejected because CSS-first approach is more performant

**Orientation Change Handling**:
```typescript
// lib/story/hooks/useOrientationChange.ts
export const useOrientationChange = (callback: () => void) => {
  useEffect(() => {
    const handleChange = () => {
      // Small delay for layout to settle
      setTimeout(callback, 100);
    };

    window.addEventListener('orientationchange', handleChange);
    window.addEventListener('resize', handleChange);

    return () => {
      window.removeEventListener('orientationchange', handleChange);
      window.removeEventListener('resize', handleChange);
    };
  }, [callback]);
};
```

---

## 4. URL-Based JSON Data Loading

### Decision: Route Parameter with Base64 Encoding + Compression

**Implementation Approach**:
```typescript
// app/story/[storyId]/page.tsx
import { decode } from 'js-base64';
import pako from 'pako';

export default async function StoryPage({ params }: { params: { storyId: string } }) {
  try {
    // Decode Base64
    const compressed = decode(params.storyId);

    // Decompress gzip
    const decompressed = pako.ungzip(compressed, { to: 'string' });

    // Parse JSON
    const storyData = JSON.parse(decompressed);

    // Validate with schema
    const validatedStory = validateStorySchema(storyData);

    return <StoryViewer story={validatedStory} />;
  } catch (error) {
    return <ErrorScreen type="invalid-json" />;
  }
}

// URL generation utility
export const generateStoryUrl = (storyData: StoryScript) => {
  const json = JSON.stringify(storyData);
  const compressed = pako.gzip(json);
  const base64 = encode(compressed);
  return `/story/${base64}`;
};
```

**Rationale**:
- **Base64 Encoding**: Safe for URL parameters, widely supported
- **gzip Compression**: Reduces URL length by ~70% for text-heavy stories
- **js-base64 Library**: Reliable encoding/decoding with TypeScript support
- **pako Library**: Fast gzip compression/decompression (browser-compatible)

**URL Length Limits**:
- **Browser Safe Limit**: ~2000 characters for URL parameters
- **With Compression**: Can handle ~50KB of JSON data (compressed to ~15KB, encoded to ~20KB)
- **Beyond Limit**: Document limit and provide alternative (e.g., file upload or server storage)

**Alternatives Considered**:
1. **No Compression**: Rejected because severely limits story length
2. **LZ-Based Compression**: Rejected because less efficient than gzip for JSON
3. **Hash Fragment**: Rejected because server-side rendering can't access hash
4. **Server Storage**: Rejected because requires backend (violates standalone requirement)

**Best Practice**: Document URL length limits in user guide and provide validation during story creation

---

## 5. Progress Synchronization Strategy

### Decision: requestAnimationFrame + Throttle Combo

**Implementation Approach**:
```typescript
// lib/story/utils/progressUtils.ts
export const useProgressSync = (
  getScrollRatio: () => number,
  onProgress: (ratio: number) => void
) => {
  const lastUpdateTime = useRef(0);
  const rafId = useRef<number>();

  const updateProgress = useCallback(() => {
    const now = performance.now();
    const scrollRatio = getScrollRatio();

    // Throttle to 100ms (FR-036)
    if (now - lastUpdateTime.current >= 100) {
      onProgress(scrollRatio);
      lastUpdateTime.current = now;
    }

    // Continue RAF loop
    rafId.current = requestAnimationFrame(updateProgress);
  }, [getScrollRatio, onProgress]);

  const startSync = useCallback(() => {
    rafId.current = requestAnimationFrame(updateProgress);
  }, [updateProgress]);

  const stopSync = useCallback(() => {
    if (rafId.current) {
      cancelAnimationFrame(rafId.current);
    }
  }, []);

  useEffect(() => {
    return () => stopSync();
  }, [stopSync]);

  return { startSync, stopSync };
};
```

**Rationale**:
- **requestAnimationFrame**: Ensures updates sync with display refresh rate (60fps)
- **100ms Throttle**: Prevents excessive re-renders while maintaining accuracy
- **Performance**: RAF ensures smooth 30fps+ scrolling (FR-040)
- **Accuracy**: Throttle doesn't lose data; scroll ratio is calculated fresh each RAF

**Alternatives Considered**:
1. **Throttle Only**: Rejected because can miss frames, causing janky updates
2. **Debounce**: Rejected because delays updates, making progress bar laggy
3. **RAF Only**: Rejected because updates too frequently (60fps), causing re-renders

**Performance Optimization**:
```typescript
// Optimize progress bar updates with React.memo
const StoryProgressBar = memo(({ progress }: { progress: number }) => {
  // Use CSS transform instead of width for GPU acceleration
  return (
    <div
      className="progress-bar-fill"
      style={{ transform: `translateX(${(progress - 1) * 100}%)` }}
    />
  );
});
```

---

## 6. Safe Area Detection Cross-Browser

### Decision: Hybrid CSS + JavaScript Approach

**Implementation Approach**:
```typescript
// lib/story/hooks/useSafeArea.ts
export const useSafeArea = () => {
  const [safeArea, setSafeArea] = useState({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    hasSafeArea: false
  });

  useEffect(() => {
    // Check if CSS env() is supported
    const testElement = document.createElement('div');
    testElement.style.paddingTop = 'env(safe-area-inset-top)';
    document.body.appendChild(testElement);

    const computedStyle = window.getComputedStyle(testElement);
    const hasEnvSupport = computedStyle.paddingTop !== 'env(safe-area-inset-top)';
    document.body.removeChild(testElement);

    if (hasEnvSupport) {
      // Use getComputedStyle to get actual values
      const updateSafeArea = () => {
        const rootStyle = window.getComputedStyle(document.documentElement);
        setSafeArea({
          top: parseInt(rootStyle.getPropertyValue('env(safe-area-inset-top)') || '0'),
          bottom: parseInt(rootStyle.getPropertyValue('env(safe-area-inset-bottom)') || '0'),
          left: parseInt(rootStyle.getPropertyValue('env(safe-area-inset-left)') || '0'),
          right: parseInt(rootStyle.getPropertyValue('env(safe-area-inset-right)') || '0'),
          hasSafeArea: true
        });
      };

      updateSafeArea();
      window.addEventListener('resize', updateSafeArea);
      window.addEventListener('orientationchange', updateSafeArea);

      return () => {
        window.removeEventListener('resize', updateSafeArea);
        window.removeEventListener('orientationchange', updateSafeArea);
      };
    }

    // Fallback for older browsers
    setSafeArea({ top: 0, bottom: 0, left: 0, right: 0, hasSafeArea: false });
  }, []);

  return safeArea;
};
```

**CSS Application**:
```css
/* Apply safe areas with fallback */
.story-content {
  padding: 2rem;

  /* Apply safe areas if supported */
  padding-top: max(2rem, env(safe-area-inset-top));
  padding-bottom: max(2rem, env(safe-area-inset-bottom));
  padding-left: max(2rem, env(safe-area-inset-left));
  padding-right: max(2rem, env(safe-area-inset-right));
}

/* Focal point adjustment */
.focal-point {
  top: 33vh;
}

.focal-point.with-safe-area {
  top: 38vh;
}
```

**Rationale**:
- **CSS-First**: Uses native `env()` function for best performance
- **Progressive Enhancement**: Falls back gracefully for older browsers
- **JavaScript Detection**: Allows conditional logic (e.g., adjust focal point)
- **Cross-Browser**: Works on iOS Safari, Chrome Android, and modern desktop browsers

**Alternatives Considered**:
1. **CSS Only**: Rejected because can't conditionally adjust focal point based on safe area presence
2. **JavaScript Only**: Rejected because less performant than CSS
3. **User Agent Detection**: Rejected because unreliable and hard to maintain

**Safe Area Support Table**:
| Browser | Version | env() Support | Recommendation |
|---------|---------|---------------|----------------|
| iOS Safari | 11.0+ | ✅ Yes | Use env() |
| Chrome Android | 80+ | ✅ Yes | Use env() |
| Firefox Android | 79+ | ✅ Yes | Use env() |
| Desktop Chrome | 69+ | ✅ Yes | Use env() |
| Desktop Safari | 11.1+ | ✅ Yes | Use env() |
| Older Browsers | <2018 | ❌ No | Fallback to 2rem padding |

---

## 7. Best Practices Research

### React 18+ with Framer Motion

**Story Viewer Animation Patterns**:
```typescript
// components/story/SlideContainer.tsx
import { motion, AnimatePresence } from 'framer-motion';

export const SlideContainer = ({ slide, direction }: Props) => {
  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0
    })
  };

  return (
    <AnimatePresence initial={false} custom={direction}>
      <motion.div
        key={slide.id}
        custom={direction}
        variants={variants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{
          x: { type: 'spring', stiffness: 300, damping: 30 },
          opacity: { duration: 0.2 }
        }}
      >
        {renderSlide(slide)}
      </motion.div>
    </AnimatePresence>
  );
};
```

**Best Practices**:
- Use `AnimatePresence` for enter/exit animations
- Custom direction prop for swipe-style transitions
- Spring physics for natural mobile feel
- Separate x and opacity transitions for control

---

### Zustand for Story State

**State Management Patterns**:
```typescript
// lib/stores/useStoryStore.ts
import create from 'zustand';

interface StoryState {
  // Current slide state
  currentSlideIndex: number;
  direction: number;
  isPaused: boolean;

  // Actions
  nextSlide: () => void;
  previousSlide: () => void;
  goToSlide: (index: number) => void;
  togglePause: () => void;
  reset: () => void;
}

export const useStoryStore = create<StoryState>((set, get) => ({
  currentSlideIndex: 0,
  direction: 0,
  isPaused: false,

  nextSlide: () => set(state => ({
    currentSlideIndex: state.currentSlideIndex + 1,
    direction: 1
  })),

  previousSlide: () => set(state => ({
    currentSlideIndex: state.currentSlideIndex - 1,
    direction: -1
  })),

  goToSlide: (index) => set({
    currentSlideIndex: index,
    direction: index > get().currentSlideIndex ? 1 : -1
  }),

  togglePause: () => set(state => ({
    isPaused: !state.isPaused
  })),

  reset: () => set({
    currentSlideIndex: 0,
    direction: 0,
    isPaused: false
  })
}));
```

**Best Practices**:
- Separate concerns: story navigation, teleprompter state, progress
- Use Zustand's shallow comparison for selectors
- Keep state minimal and derive computed values

---

### Mobile Touch Gestures

**Tap Zone Implementation**:
```typescript
// components/story/StoryViewer.tsx
export const StoryViewer = () => {
  const { nextSlide, previousSlide, togglePause } = useStoryStore();

  const handleTap = (e: ReactTouchEvent) => {
    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    const width = rect.width;
    const height = rect.height;

    // Center tap zone (30% of width)
    const isCenter = x > width * 0.35 && x < width * 0.65;

    if (isCenter) {
      togglePause();
      return;
    }

    // Right side (next)
    if (x > width * 0.65) {
      nextSlide();
      return;
    }

    // Left side (previous)
    previousSlide();
  };

  return (
    <div onTouchStart={handleTap}>
      {/* Story content */}
    </div>
  );
};
```

**Best Practices**:
- Use `onTouchStart` instead of `onClick` for faster response
- Clear visual feedback for tap zones (optional)
- Disable tap zones for teleprompter slides (FR-023)

---

### localStorage Error Handling

**Graceful Degradation Patterns**:
```typescript
// lib/story/hooks/useProgressPersistence.ts
export const useProgressPersistence = (slideId: string) => {
  const saveProgress = useCallback((scrollRatio: number) => {
    try {
      const data = {
        slideId,
        scrollRatio,
        timestamp: Date.now()
      };
      localStorage.setItem(`story-progress-${slideId}`, JSON.stringify(data));
    } catch (error) {
      // Quota exceeded or private browsing mode
      console.warn('Failed to save progress:', error);
      // Continue without saving - functionality still works
    }
  }, [slideId]);

  const loadProgress = useCallback((): { scrollRatio: number } | null => {
    try {
      const data = localStorage.getItem(`story-progress-${slideId}`);
      if (!data) return null;
      return JSON.parse(data);
    } catch (error) {
      console.warn('Failed to load progress:', error);
      return null;
    }
  }, [slideId]);

  return { saveProgress, loadProgress };
};
```

**Best Practices**:
- Wrap in try-catch for quota errors
- Warn in console (development only, no logging per spec)
- Continue functionality without persistence
- Test in private browsing mode

---

### TypeScript Strict Mode

**Pattern for External Libraries**:
```typescript
// types/nosleep.d.ts
declare module 'nosleep.js' {
  export default class NoSleep {
    enable(): Promise<void>;
    disable(): Promise<void>;
  }
}

// Usage with type safety
import NoSleep from 'nosleep.js';

const wakeLock = new NoSleep();
await wakeLock.enable(); // Type-safe!
```

**Best Practices**:
- Create `types/` directory for custom declarations
- Use `declare module` for npm packages without types
- Enable `strict: true` in tsconfig.json
- Use `unknown` instead of `any` for type errors

---

### Jest + React Testing Library

**Testing requestAnimationFrame**:
```typescript
// __tests__/unit/story/hooks/useTeleprompterScroll.test.ts
import { renderHook, act } from '@testing-library/react';

// Mock requestAnimationFrame
global.requestAnimationFrame = jest.fn((cb) => setTimeout(cb, 16));
global.cancelAnimationFrame = jest.fn();

test('scrolls at correct speed', async () => {
  const { result } = renderHook(() => useTeleprompterScroll(text));

  act(() => {
    result.current.startScrolling();
  });

  await act(async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
  });

  expect(result.current.scrollPosition).toBeGreaterThan(0);
});
```

**Best Practices**:
- Mock RAF with setTimeout (16ms = 60fps)
- Use `act()` for state updates
- Test scroll position after multiple frames
- Clean up RAF in tests

---

### Playwright Mobile E2E

**Mobile Emulation and Gesture Testing**:
```typescript
// __tests__/e2e/story/mobile-gestures.spec.ts
import { test, expect } from '@playwright/test';

test.use({
  viewport: { width: 390, height: 844 }, // iPhone 14 Pro
  deviceScaleFactor: 3,
  hasTouch: true
});

test('tap right side advances to next slide', async ({ page }) => {
  await page.goto('/story/abc123');

  const firstSlide = page.locator('[data-slide="0"]');
  await expect(firstSlide).toBeVisible();

  // Tap right side
  await page.touchscreen.tap(350, 422);

  const secondSlide = page.locator('[data-slide="1"]');
  await expect(secondSlide).toBeVisible();
});
```

**Best Practices**:
- Use specific device viewport (iPhone 14 Pro for notched device testing)
- Use `touchscreen.tap()` for touch events
- Test both portrait and landscape orientations
- Use `data-testid` for stable selectors

---

## Summary of Decisions

| Decision | Choice | Key Benefit |
|----------|--------|-------------|
| NoSleep.js Loading | CDN with async injection | Minimal bundle size, graceful fallback |
| Virtual Scrolling | Custom with Intersection Observer | Lightweight, paragraph-based |
| 9:16 Aspect Ratio | CSS custom properties + env() | Native, performant, mobile-optimized |
| URL Data Loading | Base64 + gzip compression | Handles ~50KB stories in URL |
| Progress Sync | RAF + 100ms throttle | 30fps+ smooth scrolling |
| Safe Area Detection | Hybrid CSS + JS | Progressive enhancement, cross-browser |

---

## Implementation Checklist

Based on research findings, ensure the following during implementation:

- [ ] Add NoSleep.js CDN loading with error handling
- [ ] Create custom virtual scrolling for 50+ paragraphs
- [ ] Implement --vh fix for mobile viewport
- [ ] Add gzip + base64 URL encoding for story data
- [ ] Implement RAF + throttle for progress updates
- [ ] Add safe area detection with CSS env() fallbacks
- [ ] Test on real devices with notches (iPhone 14 Pro)
- [ ] Add @types/nosleep.js or custom declarations
- [ ] Mock RAF in Jest tests
- [ ] Configure Playwright for mobile emulation
- [ ] Document URL length limits for users
- [ ] Test localStorage quota exceeded scenarios
- [ ] Verify Wake Lock API support across browsers

---

## References

- [NoSleep.js Documentation](https://github.com/richtr/NoSleep.js)
- [Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)
- [CSS env() Function](https://developer.mozilla.org/en-US/docs/Web/CSS/env())
- [Framer Motion Animations](https://www.framer.com/motion/)
- [Zustand State Management](https://github.com/pmndrs/zustand)
- [js-base64 Library](https://www.npmjs.com/package/js-base64)
- [pako Compression Library](https://www.npmjs.com/package/pako)
