# Quick Start: Studio Page UI/UX Improvements

**Feature**: 004-studio-ui-ux-improvements  
**Branch**: `004-studio-ui-ux-improvements`  
**Last Updated**: 2025-12-31

---

## Overview

This guide helps developers quickly understand and implement the 10 UI/UX improvements to the Studio page. Each improvement is organized by priority (P1 = critical, P2 = important) with implementation guidance.

---

## Prerequisites

**Required**:
- Node.js 18+
- TypeScript 5.3+ with strict mode
- Familiarity with React 18+, Next.js 14+, Zustand 4.4+
- Understanding of Tailwind CSS and shadcn/ui components

**Recommended Reading**:
- [Framer Motion docs](https://www.framer.com/motion/) - for bottom sheet animations
- [WCAG 2.1 AA guidelines](https://www.w3.org/WAI/WCAG21/quickref/) - for accessibility requirements
- [React performance optimization](https://react.dev/learn/render-and-commit) - for performance patterns

---

## Installation

### New Dependencies

```bash
npm install react-keyboard-event-listener
# or
npm install @types/react-keyboard-event-listener
```

**Total new bundle impact**: ~2KB gzipped

---

## Quick Reference: User Stories

### P1 (Critical) - Implement First

| Story | Focus Area | Files to Modify |
|-------|-----------|-----------------|
| US1 | Mobile Preview | `PreviewPanel.tsx`, `Editor.tsx` |
| US2 | Auto-Save Status | `ContentPanel.tsx`, `hooks/useAutoSave.ts` (NEW) |
| US3 | Footer Visibility | `ContentPanel.tsx` |
| US4 | Loading States | `app/studio/page.tsx`, `LoadingSkeleton.tsx` (NEW) |
| US5 | Accessibility | All config tabs, `lib/a11y/` (NEW) |

### P2 (Important) - Implement After P1

| Story | Focus Area | Files to Modify |
|-------|-----------|-----------------|
| US6 | Expandable Textarea | `ContentPanel.tsx`, `TextareaExpandButton.tsx` (NEW) |
| US7 | Mobile Tab Navigation | `ConfigTabs.tsx`, `TabBottomSheet.tsx` (NEW) |
| US8 | Error Messages | `app/studio/page.tsx`, `ErrorDialog.tsx` (NEW) |
| US9 | Keyboard Shortcuts | `ConfigPanel.tsx`, `KeyboardShortcutsModal.tsx` (NEW) |
| US10 | Performance | `TeleprompterText.tsx`, `lib/utils/performance.ts` (NEW) |

---

## Implementation Order

### Phase 1: Foundation (Day 1-2)

**1. Setup New Store**
```typescript
// stores/useUIStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIStore {
  // Textarea, footer, preview, shortcuts, error state
  // See data-model.md for full interface
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      // Initial state and actions
    }),
    { name: 'teleprompter-ui-store' }
  )
);
```

**2. Create Utility Functions**
```typescript
// lib/utils/formatRelativeTime.ts
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

// lib/utils/errorMessages.ts
export function getErrorMessage(error: Error): ErrorContext {
  // Map error types to user-friendly messages
  // See data-model.md for ERROR_MESSAGES mapping
}
```

**3. Add ARIA Constants**
```typescript
// lib/a11y/ariaLabels.ts
export const ARIA_LABELS = {
  configTab: (label: string, index: number, total: number) => 
    `${label} tab, ${index + 1} of ${total}`,
  // ... more labels
} as const;
```

---

### Phase 2: P1 Stories (Day 3-7)

#### US1: Mobile Preview (2-3 hours)

**Key Files**:
- `components/teleprompter/editor/PreviewPanel.tsx`
- `components/teleprompter/Editor.tsx`

**Implementation**:
```typescript
// PreviewPanel.tsx - Add mobile preview toggle
const [isMobilePreviewOpen, setIsMobilePreviewOpen] = useState(false);
const isMobile = useMediaQuery('(max-width: 768px)');

return (
  <>
    {/* Toggle button - show only on mobile */}
    {isMobile && (
      <button onClick={() => setIsMobilePreviewOpen(true)}>
        Preview
      </button>
    )}
    
    {/* Mobile bottom sheet */}
    {isMobile && (
      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: 300 }}
        initial={{ y: "100%" }}
        animate={{ y: isMobilePreviewOpen ? "0%" : "100%" }}
        className="fixed inset-x-0 bottom-0 h-[60vh] bg-black rounded-t-3xl"
      >
        <PreviewContent />
      </motion.div>
    )}
  </>
);
```

**Acceptance Criteria**:
- ✅ Preview toggles on/off on mobile
- ✅ Bottom sheet covers 60% screen height
- ✅ Swipe-down gesture closes preview
- ✅ Tablet: right-side panel (40% width)
- ✅ Desktop: existing 3-column layout unchanged

---

#### US2: Auto-Save Status (2-3 hours)

**Key Files**:
- `hooks/useAutoSave.ts` (NEW)
- `components/teleprompter/editor/ContentPanel.tsx`

**Implementation**:
```typescript
// hooks/useAutoSave.ts
export function useAutoSave(data: any, interval: number = 5000) {
  const [status, setStatus] = useState<AutoSaveStatus['status']>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<number>();
  
  useEffect(() => {
    const timer = setInterval(() => {
      requestIdleCallback(async () => {
        try {
          setStatus('saving');
          localStorage.setItem('teleprompter_draft', JSON.stringify(data));
          setLastSavedAt(Date.now());
          setStatus('saved');
        } catch (error) {
          setStatus('error');
        }
      });
    }, interval);
    
    return () => clearInterval(timer);
  }, [data, interval]);
  
  return { status, lastSavedAt };
}

// ContentPanel.tsx - Add status indicator
const { status, lastSavedAt } = useAutoSave({ text: store.text, /* ... */ });

return (
  <div className="p-6 border-b flex justify-between items-center">
    <h1>Editor</h1>
    {status === 'saving' && <Spinner />}
    {status === 'saved' && <span>{formatRelativeTime(lastSavedAt)}</span>}
    {status === 'error' && <button onClick={retry}>Retry</button>}
  </div>
);
```

**Acceptance Criteria**:
- ✅ "Saving..." spinner appears during save
- ✅ "Saved ✓" with relative timestamp after success
- ✅ Error indicator with retry button on failure
- ✅ Timestamp updates to "Just now" on manual save

---

#### US3: Footer Visibility (1-2 hours)

**Key Files**:
- `components/teleprompter/editor/ContentPanel.tsx`

**Implementation**:
```typescript
// ContentPanel.tsx - Add padding and collapse button
const { footerState, toggleFooter } = useUIStore();

return (
  <div className="w-full lg:w-[30%] bg-card flex flex-col h-full">
    {/* Content with extra padding */}
    <div className="flex-1 overflow-y-auto p-6 pb-32">
      {/* Textarea and other content */}
    </div>
    
    {/* Footer with collapse toggle */}
    <div className={cn(
      "absolute bottom-0 left-0 right-0 p-4 bg-card/90 border-t",
      footerState.isCollapsed ? "h-12" : "h-auto"
    )}>
      {!footerState.isCollapsed && (
        <div className="grid grid-cols-2 gap-2">
          <button>Preview</button>
          <button>Save</button>
          <button>Share</button>
        </div>
      )}
      <button onClick={toggleFooter} className="w-full text-center text-xs">
        {footerState.isCollapsed ? '▲' : '▼'}
      </button>
    </div>
  </div>
);
```

**Acceptance Criteria**:
- ✅ 100px padding-bottom in textarea container
- ✅ Auto-scroll to keep new lines visible
- ✅ Collapse/expand button works
- ✅ Footer semi-transparent (90% opacity)

---

#### US4: Loading States (2-3 hours)

**Key Files**:
- `app/studio/page.tsx`
- `components/teleprompter/config/ui/LoadingSkeleton.tsx` (NEW)

**Implementation**:
```typescript
// LoadingSkeleton.tsx
import { Skeleton } from '@/components/ui/skeleton';

export function ContentPanelSkeleton() {
  return (
    <div className="p-6 space-y-3">
      <Skeleton className="h-6 w-32" />
      <Skeleton className="h-32 w-full" />
    </div>
  );
}

// page.tsx - Replace Suspense fallback
export default function StudioPage() {
  return (
    <AppProvider>
      <Toaster />
      <Suspense fallback={<StudioLoadingScreen />}>
        <StudioLogic />
      </Suspense>
    </AppProvider>
  );
}

function StudioLoadingScreen() {
  return (
    <div className="h-screen flex lg:flex-row">
      <ContentPanelSkeleton />
      <ConfigPanelSkeleton />
      <PreviewPanelSkeleton />
    </div>
  );
}
```

**Acceptance Criteria**:
- ✅ Skeleton screens for all panels
- ✅ Progress bar for script/template loading
- ✅ 300ms fade-out animation
- ✅ Error message with Retry button

---

#### US5: Accessibility (4-6 hours)

**Key Files**:
- All config tabs
- `lib/a11y/ariaLabels.ts`
- `lib/a11y/focusManagement.ts`

**Implementation**:
```typescript
// ConfigTabs.tsx - Add ARIA labels
const tabs = getTabConfig(t);

return (
  <div role="tablist" className="flex border-b">
    {tabs.map((tab, index) => (
      <button
        key={tab.id}
        role="tab"
        aria-label={ARIA_LABELS.configTab(t(tab.labelKey), index, tabs.length)}
        aria-selected={activeTab === tab.id}
        tabIndex={activeTab === tab.id ? 0 : -1}
        onClick={() => setActiveTab(tab.id)}
        onKeyDown={(e) => {
          // Arrow key navigation
          if (e.key === 'ArrowRight') setActiveTab(tabs[(index + 1) % tabs.length].id);
          if (e.key === 'ArrowLeft') setActiveTab(tabs[(index - 1 + tabs.length) % tabs.length].id);
        }}
      >
        <Icon />
        <span>{t(tab.labelKey)}</span>
      </button>
    ))}
  </div>
);

// ColorsTab.tsx - Make color picker keyboard accessible
return (
  <div role="grid" aria-label="Color palette">
    {palette.colors.map((color) => (
      <button
        key={color}
        role="gridcell"
        aria-label={ARIA_LABELS.colorSwatch(color)}
        onClick={() => applyPalette(palette)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') applyPalette(palette);
        }}
      >
        <div style={{ backgroundColor: color }} />
      </button>
    ))}
  </div>
);
```

**Acceptance Criteria**:
- ✅ All interactive elements have ARIA labels
- ✅ Keyboard navigation works for tabs, color picker, sliders
- ✅ Focus indicators visible (2px outline, 3:1 contrast)
- ✅ Screen reader announces changes correctly
- ✅ Respects `prefers-reduced-motion`

---

### Phase 3: P2 Stories (Day 8-12)

#### US6: Expandable Textarea (2-3 hours)

**Key Files**:
- `components/teleprompter/editor/ContentPanel.tsx`
- `components/teleprompter/editor/TextareaExpandButton.tsx` (NEW)

**Implementation**:
```typescript
// TextareaExpandButton.tsx
export function TextareaExpandButton({ currentSize, onToggle }: Props) {
  const sizeIcons = {
    default: Maximize2,
    medium: Maximize2,
    large: Maximize2,
    fullscreen: Minimize2,
  };
  
  const Icon = sizeIcons[currentSize];
  
  return (
    <button
      onClick={onToggle}
      className="absolute bottom-4 right-4 p-2 bg-secondary rounded-full hover:bg-secondary/80"
      aria-label={currentSize === 'fullscreen' ? 'Exit fullscreen' : 'Expand'}
    >
      <Icon size={16} />
    </button>
  );
}

// ContentPanel.tsx - Add expand button
const { textareaPrefs, toggleTextareaSize } = useUIStore();

return (
  <div className="relative">
    <textarea
      style={{
        height: textareaPrefs.isFullscreen ? '100vh' : 
                textareaPrefs.size === 'medium' ? '300px' :
                textareaPrefs.size === 'large' ? '500px' : '128px'
      }}
      onKeyDown={(e) => {
        if (e.key === 'Escape' && textareaPrefs.isFullscreen) {
          toggleTextareaSize();
        }
      }}
    />
    <TextareaExpandButton
      currentSize={textareaPrefs.size}
      onToggle={toggleTextareaSize}
    />
  </div>
);
```

**Acceptance Criteria**:
- ✅ Three size states: default (128px), medium (300px), large (500px)
- ✅ Fullscreen mode with Esc to exit
- ✅ Drag handle for custom sizing (optional)
- ✅ Preference persists in localStorage

---

#### US7: Mobile Tab Navigation (2-3 hours)

**Key Files**:
- `components/teleprompter/config/ConfigTabs.tsx`
- `components/teleprompter/config/TabBottomSheet.tsx` (NEW)

**Implementation**:
```typescript
// ConfigTabs.tsx - Add scroll indicators
const tabsRef = useRef<HTMLDivElement>(null);
const [showScrollIndicator, setShowScrollIndicator] = useState(false);

useEffect(() => {
  const el = tabsRef.current;
  if (!el) return;
  
  setShowScrollIndicator(el.scrollWidth > el.clientWidth);
}, []);

return (
  <div ref={tabsRef} className="flex border-b overflow-x-auto relative">
    {tabs.map((tab) => <TabButton key={tab.id} {...tab} />)}
    
    {/* Scroll indicators */}
    {showScrollIndicator && (
      <>
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-card to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-card to-transparent pointer-events-none flex items-center justify-center">
          <ChevronRight size={16} />
        </div>
      </>
    )}
    
    {/* More button - opens bottom sheet */}
    <button onClick={() => setBottomSheetOpen(true)}>
      <MoreHorizontal size={20} />
    </button>
  </div>
);

// TabBottomSheet.tsx - Grid layout for mobile
export function TabBottomSheet({ isOpen, onClose, tabs, onSelect }: Props) {
  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: isOpen ? "0%" : "100%" }}
      className="fixed inset-x-0 bottom-0 h-[70vh] bg-card rounded-t-3xl p-4"
    >
      <h3 className="text-lg font-semibold mb-4">All Tabs</h3>
      <div className="grid grid-cols-2 gap-3">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              onSelect(tab.id);
              onClose();
            }}
            className="p-4 bg-secondary rounded-lg flex flex-col items-center gap-2"
          >
            <tab.icon size={24} />
            <span className="text-sm">{t(tab.labelKey)}</span>
          </button>
        ))}
      </div>
    </motion.div>
  );
}
```

**Acceptance Criteria**:
- ✅ Gradient fade and chevron indicators
- ✅ Horizontal swipe gesture works
- ✅ "More" button opens bottom sheet
- ✅ Bottom sheet shows all tabs in grid
- ✅ Tablet: tabs wrap to 2 rows

---

#### US8: Error Messages (2-3 hours)

**Key Files**:
- `app/studio/page.tsx`
- `lib/utils/errorMessages.ts`
- `components/teleprompter/ErrorDialog.tsx` (NEW)

**Implementation**:
```typescript
// errorMessages.ts
export function getErrorContext(error: Error): ErrorContext {
  if (error.message.includes('404')) {
    return {
      type: 'not_found',
      message: 'Script not found. It may have been deleted or the link is incorrect',
      details: error.message,
      timestamp: Date.now(),
      action: 'browse_templates',
    };
  }
  if (error.message.includes('network') || error.message.includes('fetch')) {
    return {
      type: 'network',
      message: 'Network error. Check your connection and try again',
      details: error.message,
      timestamp: Date.now(),
      action: 'retry',
    };
  }
  // ... more error types
}

// page.tsx - Use contextual errors
loadScriptAction(scriptId).then(result => {
  if (result.error) {
    const errorContext = getErrorContext(result.error);
    setErrorContext(errorContext);
    toast.error(errorContext.message);
  }
});

// ErrorDialog.tsx
export function ErrorDialog({ error, onRetry, onBrowseTemplates, onSignUp, onCopyError }: Props) {
  return (
    <Dialog open={!!error} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Error</DialogTitle>
        </DialogHeader>
        <p>{error?.message}</p>
        <DialogFooter>
          {error?.action === 'retry' && <Button onClick={onRetry}>Retry</Button>}
          {error?.action === 'browse_templates' && <Button onClick={onBrowseTemplates}>Browse Templates</Button>}
          {error?.action === 'sign_up' && <Button onClick={onSignUp}>Sign Up</Button>}
          <Button variant="ghost" onClick={onCopyError}>Copy Error</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

**Acceptance Criteria**:
- ✅ Specific messages per error type
- ✅ Contextual action buttons
- ✅ "Copy error" button works
- ✅ Error logged to console

---

#### US9: Keyboard Shortcuts (2-3 hours)

**Key Files**:
- `hooks/useKeyboardShortcuts.ts` (NEW)
- `components/teleprompter/KeyboardShortcutsModal.tsx` (NEW)
- `components/teleprompter/config/ConfigPanel.tsx`

**Implementation**:
```typescript
// useKeyboardShortcuts.ts
import useKeyboardEventListener from 'react-keyboard-event-listener';

export function useKeyboardShortcuts() {
  const { isOpen, toggle } = useShortcutsModal();
  
  // Open modal
  useKeyboardEventListener(
    [{ keys: ['Shift', '?'], action: 'openShortcutsModal' }],
    (e) => {
      e.preventDefault();
      toggle();
    }
  );
  
  // Undo/redo - existing
  useKeyboardEventListener(
    [{ keys: ['Control', 'z'], action: 'undo' }],
    (e) => {
      e.preventDefault();
      useConfigStore.getState().undo();
    }
  );
  
  // ... more shortcuts
}

// KeyboardShortcutsModal.tsx
export function KeyboardShortcutsModal({ isOpen, onClose, shortcuts }: Props) {
  const [search, setSearch] = useState('');
  
  const filteredShortcuts = shortcuts.filter(category =>
    category.name.toLowerCase().includes(search.toLowerCase()) ||
    category.shortcuts.some(s => s.description.toLowerCase().includes(search.toLowerCase()))
  );
  
  return (
    <Dialog open={isOpen} onOpenOpen={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
        </DialogHeader>
        <Input
          placeholder="Search shortcuts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="space-y-4">
          {filteredShortcuts.map(category => (
            <div key={category.name}>
              <h3 className="font-semibold">{category.name}</h3>
              {category.shortcuts.map(shortcut => (
                <div key={shortcut.description} className="flex justify-between">
                  <span>{shortcut.description}</span>
                  <kbd className="px-2 py-1 bg-secondary rounded">
                    {shortcut.keys.join(' + ')}
                  </kbd>
                </div>
              ))}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ConfigPanel.tsx - Add tooltip
return (
  <div className="flex items-center justify-between p-4">
    <h2>Configuration</h2>
    <Tooltip content="Undo (Ctrl+Z)">
      <Button onClick={undo}><Undo /></Button>
    </Tooltip>
    <Tooltip content="Keyboard shortcuts (?)">
      <Button onClick={toggleShortcutsModal}><Keyboard /></Button>
    </Tooltip>
  </div>
);
```

**Acceptance Criteria**:
- ✅ Modal opens with "?" button or Shift+?
- ✅ All shortcuts organized by category
- ✅ Search functionality works
- ✅ Tooltips show keyboard hints

---

#### US10: Performance (3-4 hours)

**Key Files**:
- `components/teleprompter/display/TeleprompterText.tsx`
- `lib/utils/performance.ts` (NEW)

**Implementation**:
```typescript
// TeleprompterText.tsx - Add React.memo
export const TeleprompterText = React.memo<Props>(({ text, config }) => {
  // Component implementation
}, (prevProps, nextProps) => {
  // Only re-render if text or config changes
  return prevProps.text === nextProps.text && 
         prevProps.config === nextProps.config;
});

// performance.ts - Performance monitoring
export function usePerformanceMonitor() {
  const [fps, setFps] = useState(60);
  
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;
    
    let frameCount = 0;
    let lastTime = performance.now();
    
    const measureFps = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime >= lastTime + 1000) {
        const currentFps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        setFps(currentFps);
        
        if (currentFps < 55) {
          console.warn(`FPS dropped to ${currentFps}`);
        }
        
        frameCount = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(measureFps);
    };
    
    const rafId = requestAnimationFrame(measureFps);
    return () => cancelAnimationFrame(rafId);
  }, []);
  
  return fps;
}
```

**Acceptance Criteria**:
- ✅ Typing latency < 50ms for 5000-word scripts
- ✅ 60fps during config adjustments
- ✅ No performance degradation during auto-save
- ✅ Memory usage stable when scrolling

---

## Testing Checklist

### Unit Tests
- [ ] `useAutoSave` hook
- [ ] `useKeyboardShortcuts` hook
- [ ] `formatRelativeTime` utility
- [ ] `getErrorMessage` utility

### Integration Tests
- [ ] Mobile preview toggle and swipe gesture
- [ ] Auto-save status updates
- [ ] Footer collapse/expand
- [ ] Loading states for script/template loading
- [ ] Keyboard navigation for all config controls

### Accessibility Tests
- [ ] All controls keyboard accessible
- [ ] ARIA labels correct
- [ ] Focus indicators visible
- [ ] Screen reader announcements work

### Performance Tests
- [ ] Typing latency < 50ms (5000 words)
- [ ] 60fps during config slider changes
- [ ] No memory leaks when scrolling

---

## Common Patterns

### localStorage Helper
```typescript
function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch (error) {
    console.warn(`Failed to load ${key}:`, error);
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    if (error.name === 'QuotaExceededError') {
      console.error('Storage quota exceeded');
      // Show error to user
    }
  }
}
```

### Zustand Store with Persistence
```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      // State
      textareaPrefs: DEFAULT_TEXTAREA_PREFS,
      
      // Actions
      setTextareaPrefs: (prefs) => set((state) => {
        const updated = { ...state.textareaPrefs, ...prefs };
        return { textareaPrefs: updated };
      }),
    }),
    { name: 'teleprompter-ui-store' }
  )
);
```

---

## Troubleshooting

**Problem**: Auto-save status not updating
- **Solution**: Check if requestIdleCallback is supported (fallback to setTimeout)
- **Solution**: Verify localStorage key names match

**Problem**: Bottom sheet not draggable on mobile
- **Solution**: Ensure touch events are not blocked by other elements
- **Solution**: Check if parent container has `overflow: hidden`

**Problem**: Keyboard shortcuts not working
- **Solution**: Verify key combinations don't conflict with browser shortcuts
- **Solution**: Check if event.preventDefault() is called

**Problem**: Performance still slow with large scripts
- **Solution**: Add React.memo to more components
- **Solution**: Consider using `useDeferredValue` for text input

---

## Resources

- [Framer Motion Gestures](https://www.framer.com/motion/gestures/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [React Performance Optimization](https://react.dev/learn/render-and-commit)
- [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)

---

**Quick Start Status**: ✅ Complete
