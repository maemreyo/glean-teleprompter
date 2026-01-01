# Quick Start: Configuration Panel UI/UX Improvements

**Branch**: `005-config-panel-improvements`  
**Feature**: Config Panel Toggle, Real-Time Preview, Proportional Scaling, Undo/Redo, Mobile Config, Adaptive Footer  
**Audience**: Developers implementing this feature

---

## Development Environment Setup

### Prerequisites

- **Node.js** 18+ installed
- **npm** or **pnpm** package manager
- **Git** with branch `005-config-panel-improvements` checked out

### Installation

```bash
# Install dependencies (if needed)
npm install
```

### Branch Workflow

1. Ensure you're on the correct branch: `git checkout 005-config-panel-improvements`
2. Pull latest changes: `git pull origin 005-config-panel-improvements`
3. Create a feature sub-branch if needed: `git checkout -b feature/name`

---

## Implementation Order

### Phase 1: Config Panel Toggle (P1) - 2-3 Days

**Files to Modify**:
1. [`stores/useUIStore.ts`](stores/useUIStore.ts)
2. [`components/teleprompter/editor/ContentPanel.tsx`](components/teleprompter/editor/ContentPanel.tsx)
3. [`components/teleprompter/config/ConfigPanel.tsx`](components/teleprompter/config/ConfigPanel.tsx)
4. [`components/teleprompter/Editor.tsx`](components/teleprompter/Editor.tsx)

**Key Steps**:

1. **Add Panel State to useUIStore**:
```typescript
// In stores/useUIStore.ts, add:
interface PanelState {
  isVisible: boolean
  isAnimating: boolean
  lastToggled: number
  animationDirection: 'opening' | 'closing' | null
}

panelState: PanelState
```

2. **Create Toggle Button in ContentPanel**:
```tsx
// In components/teleprompter/editor/ContentPanel.tsx header
import { Settings } from 'lucide-react'

<Button
  onClick={() => togglePanel()}
  className="p-2 hover:bg-secondary rounded text-muted-foreground"
  aria-label="Toggle configuration panel"
>
  <Settings className="w-5 h-5" />
</Button>
```

3. **Wrap ConfigPanel with Animation**:
```tsx
// In components/teleprompter/Editor.tsx or ConfigPanel.tsx
import { motion, AnimatePresence } from 'framer-motion'

<AnimatePresence>
  {panelState.isVisible && (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ duration: 0.3, ease: 'ease-out' }}
      className="w-full lg:w-[35%] bg-card border-l border-border"
    >
      <ConfigPanel />
    </motion.div>
  )}
</AnimatePresence>
```

4. **Add Keyboard Shortcut**:
```tsx
// In ContentPanel or Editor component
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === ',') {
      e.preventDefault()
      togglePanel()
    }
  }
  window.addEventListener('keydown', handleKeyDown)
  return () => window.removeEventListener('keydown', handleKeyDown)
}, [togglePanel])
```

5. **Add localStorage Persistence**:
```typescript
// In useUIStore, add persistence on toggle
setPanelVisible: (visible: boolean) => set({ 
  panelState: { 
    isVisible: visible, 
    lastToggled: Date.now() 
  } 
  // Persist to localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem('configPanelVisible', JSON.stringify(visible))
  }
})
```

---

### Phase 2: Real-Time Preview (P1) - 3-4 Days

**Files to Modify**:
1. [`components/teleprompter/editor/PreviewPanel.tsx`](components/teleprompter/editor/PreviewPanel.tsx)
2. [`lib/stores/useConfigStore.ts`](lib/stores/useConfigStore.ts)
3. [`components/teleprompter/config/animations/AnimationsTab.tsx`](components/teleprompter/config/animations/AnimationsTab.tsx)

**Key Steps**:

1. **Subscribe to Config Store in PreviewPanel**:
```tsx
// Ensure PreviewPanel subscribes to config changes
const config = useConfigStore(state => ({
  typography: state.typography,
  colors: state.colors,
  effects: state.effects,
  layout: state.layout,
  animations: state.animations,
}))
```

2. **Add Loading and Error States**:
```tsx
// In PreviewPanel
const [loading, setLoading] = useState(false)
const [error, setError] = useState<string | null>(null)

// Handle slow operations
useEffect(() => {
  if (config.colors.gradientEnabled) {
    setLoading(true)
    // When font loads, set loading(false)
  }
}, [config.colors.gradientEnabled])

{error && (
  <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
    Error loading configuration: {error}
  </div>
)}
```

3. **Add "Test" Button for Animations**:
```tsx
// In AnimationsTab.tsx
<Button
  onClick={() => {
    // Trigger preview animation
    // This needs PreviewPanel integration
    setTestMode(true)
    setTimeout(() => setTestMode(false), 2000)
  }}
>
  Test Animation
</Button>
```

4. **Optimize with React.memo**:
```tsx
export const PreviewPanel = React.memo(({ config }) => {
  // Preview logic
}, (prevProps, nextProps) => {
  // Custom comparison for config equality
  return (
    prevProps.typography.fontSize === nextProps.typography.fontSize &&
    prevProps.typography.fontFamily === nextProps.typography.fontFamily
    // ... other comparisons
  )
})
```

---

### Phase 3: Proportional UI Scaling (P2) - 2-3 Days

**Files to Modify**:
1. [`stores/useUIStore.ts`](stores/useUIStore.ts)
2. [`components/teleprompter/editor/TextareaExpandButton.tsx`](components/teleprompter/editor/TextareaExpandButton.tsx)
3. [`components/teleprompter/editor/ContentPanel.tsx`](components/teleprompter/editor/ContentPanel.tsx)

**Key Steps**:

1. **Define Scale Multipliers**:
```typescript
const scaleMultipliers = {
  default: 1.0,
  medium: 1.2,
  large: 1.4,
  fullscreen: 1.5,
}
```

2. **Apply Scaling with CSS Variables**:
```css
/* In globals.css or component styles */
:root {
  --button-scale-override: 1;
  --label-scale-override: 1;
}

/* Apply scaling */
.scalable-button {
  transform: scale(calc(var(--base-scale) * var(--button-scale-override));
}

.scalable-label {
  font-size: calc(var(--base-label-size) * var(--label-scale-override));
}
```

3. **Update TextareaExpandButton**:
```tsx
// Calculate button scale based on textarea size
const buttonScale = scaleMultipliers[size]

<button
  className="scalable-button"
  style={{
    '--base-scale': buttonScale,
    '--button-scale-override': size === 'large' ? 1.1 : 1,
  }}
>
  {children}
</button>
```

---

### Phase 4: Configuration Undo/Redo (P2) - 4-5 Days

**Files to Modify**:
1. [`lib/stores/useConfigStore.ts`](lib/stores/useConfigStore.ts)
2. [`components/teleprompter/config/ConfigPanel.tsx`](components/teleprompter/config/ConfigPanel.tsx)

**Key Steps**:

1. **Implement History Middleware**:
```typescript
const historyMiddleware = (config: ConfigurationState) => (set: StateCreator<ConfigurationState>) => (get, api) => {
  let history: HistoryStack = {
    entries: [],
    currentIndex: -1,
    maxEntries: 50,
    totalChanges: 0,
  }
  
  return {
    ...set(get(), api),
    
    recordChange: (change: Partial<ConfigurationState>, isBatched: boolean) => {
      const newEntry: HistoryEntry = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        sequenceNumber: history.totalChanges++,
        timestamp: Date.now(),
        config: { ...get(), ...change },
        description: `Changed: ${Object.keys(change).join(', ')}`,
        changeCategory: determineCategory(change),
      }
      
      history.entries.push(newEntry)
      
      // Enforce FIFO limit
      if (history.entries.length > history.maxEntries) {
        history.entries.shift()
      }
      
      history.currentIndex = history.entries.length - 1
    },
    
    undo: () => {
      if (!canUndo()) return
      history.currentIndex -= 1
      set(history.entries[history.currentIndex].config)
    },
    
    redo: () => {
      if (!canRedo()) return
      history.currentIndex += 1
      set(history.entries[history.currentIndex].config)
    },
    
    canUndo: () => history.currentIndex > -1,
    canRedo: () => history.currentIndex < history.entries.length - 1,
    clearHistory: () => {
      history.entries = []
      history.currentIndex = -1
    },
    
    getPosition: () => {
      return `${history.currentIndex + 1}/${history.entries.length}`
    },
  }
}
```

2. **Add Hybrid Recording Logic**:
```typescript
// For discrete controls (checkboxes, selects)
const handleChange = (value) => {
  setTypography({ fontSize: value })
  recordChange({ fontSize: value }, false) // Immediate recording
}

// For continuous controls (sliders, color pickers)
const handleSliderChange = (value) => {
  setTypography({ fontSize: value })
}

const handleSliderRelease = () => {
  recordChange({ fontSize: typography.fontSize }, true) // Batched on release
}
```

3. **Add Keyboard Shortcuts**:
```typescript
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
      e.preventDefault()
      undo()
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
      e.preventDefault()
      redo()
    }
  }
  window.addEventListener('keydown', handleKeyDown)
  return () => window.removeEventListener('keydown', handleKeyDown)
}, [undo, redo])
```

---

### Phase 5: Mobile Configuration Interface (P3) - 5-6 Days

**Files to Modify**:
1. [`components/teleprompter/config/TabBottomSheet.tsx`](components/teleprompter/config/TabBottomSheet.tsx)
2. [`components/teleprompter/config/ui/SliderInput.tsx`](components/teleprompter/config/ui/SliderInput.tsx)
3. [`components/teleprompter/config/colors/ColorsTab.tsx`](components/teleprompter/config/colors/ColorsTab.tsx)
4. [`components/teleprompter/config/ConfigTabs.tsx`](components/teleprompter/config/ConfigTabs.tsx)

**Key Steps**:

1. **Extend TabBottomSheet for Mobile Config**:
```tsx
// Mobile bottom sheet for configuration
interface MobileConfigBottomSheetProps {
  isOpen: boolean
  onClose: () => void
}

export function MobileConfigBottomSheet({ isOpen, onClose }: MobileConfigBottomSheetProps) {
  const isMobile = useMediaQuery('(max-width: 767px)')
  
  if (!isMobile) return null
  
  return (
    <div className={cn(
      "fixed inset-x-0 bottom-0 z-50",
      "transform transition-transform duration-300 ease-out",
      isOpen ? "translate-y-0" : "translate-y-full"
    )}>
      <div className="h-[90vh] bg-card rounded-t-2xl border-t border-border p-4">
        <div className="flex justify-between items-center mb-4">
          <h3>Configuration</h3>
          <Button onClick={onClose} variant="ghost">Done</Button>
        </div>
        <ConfigTabs />
      </div>
    </div>
  )
}
```

2. **Touch-Optimize Sliders**:
```tsx
// In SliderInput.tsx, add mobile detection
const isMobile = useMediaQuery('(max-width: 767px)')

<div className={cn(
  "flex items-center gap-3",
  isMobile && "h-12" // 48px minimum for touch targets
)}>
  <input type="range" className="flex-1 h-2" />
</div>
```

3. **Mobile Color Picker**:
```tsx
// In ColorsTab.tsx
const isMobile = useMediaQuery('(max-width: 767px)')

{isMobile ? (
  <input 
    type="color"
    value={colors.primaryColor}
    onChange={(e) => setColors({ primaryColor: e.target.value })}
    className="w-full h-12 rounded-lg cursor-pointer"
  />
) : (
  <HexColorPicker color={colors.primaryColor} onChange={setColors} />
)}
```

---

### Phase 6: Adaptive Footer (P3) - 2-3 Days

**Files to Modify**:
1. [`stores/useUIStore.ts`](stores/useUIStore.ts)
2. [`components/teleprompter/editor/ContentPanel.tsx`](components/teleprompter/editor/ContentPanel.tsx)

**Key Steps**:

1. **Implement Fixed Footer with Content Padding**:
```css
/* Add to ContentPanel styles or global CSS */
.content-area {
  position: relative;
  padding-bottom: var(--footer-height);
}

.footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: hsl(var(--card) / 0.9);
  backdrop-filter: blur(8px);
  z-index: 40;
}
```

2. **Dynamic Height Calculation**:
```typescript
// Calculate footer height based on textarea size
const footerHeight = (() => {
  switch (textareaPrefs.size) {
    case 'default': return 100
    case 'medium': return Math.min(100 * 1.2, 120)
    case 'large': return Math.min(100 * 1.4, 120)
    case 'fullscreen': return 0
  }
})()

// Apply to CSS variable
document.documentElement.style.setProperty('--footer-height', `${footerHeight}px`)
```

3. **Hide Footer in Fullscreen**:
```tsx
{textareaPrefs.size !== 'fullscreen' && (
  <Footer />
)}
```

---

## Common Patterns & Examples

### Pattern: Store Subscription with Selective Updates

```typescript
// Instead of subscribing to entire store
// Subscribe only to needed slices for performance
const config = useConfigStore(state => ({
  typography: state.typography,
  colors: state.colors,
  // Only subscribe to what's needed
}))
```

### Pattern: Debounced Update Handler

```typescript
const [batchTimeout, setBatchTimeout] = useState<NodeJS.Timeout | null>(null)

const debouncedUpdate = (newValue: number) => {
  setBatchTimeout(timeout => clearTimeout(timeout))
  setBatchTimeout(
    setTimeout(() => {
      setTypography({ fontSize: newValue })
    }, 50)
  )
}

// Usage with slider
<input 
  type="range"
  onChange={(e) => debouncedUpdate(parseFloat(e.target.value))}
/>
```

### Pattern: Conditional Rendering Based on Screen Size

```typescript
const isMobile = useMediaQuery('(max-width: 767px)')

{isMobile ? (
  <MobileBottomSheet />
) : (
  <DesktopConfigPanel />
)}
```

### Pattern: ARIA Labels for Accessibility

```typescript
// Example for toggle button
<Button
  aria-label={panelState.isVisible 
    ? 'Hide configuration panel' 
    : 'Show configuration panel'
  }
  aria-pressed={panelState.isVisible}
>
  <Settings className="w-5 h-5" />
</Button>
```

---

## Testing Checklist

### Unit Tests

- [ ] Panel state toggle updates correctly
- [ ] localStorage persistence works across reloads
- [ ] Keyboard shortcuts function (Ctrl/Cmd + ,, Ctrl/Cmd + Z, Ctrl/Cmd + Shift + Z)
- [ ] History stack maintains 50-state limit with FIFO removal
- ] Undo/Redo restores correct config states
- ] Scale multipliers calculate correctly for each size
- ] Footer height caps at 120px maximum
- ] Mobile bottom sheet swipe-to-close works at 100px threshold

### Integration Tests

- [ ] Panel animation completes in 300ms without frame drops
- ] Preview updates within 100ms for configuration changes
- ] Real-time preview shows loading states for slow operations
- ] Proportional scaling prevents horizontal scroll at all sizes
- ] Mobile config panel opens in under 200ms
- ] Footer remains fixed at viewport bottom during scroll
- ] History resets when preset/template/script is loaded

### Accessibility Tests

- [ ] Keyboard navigation works for all controls
- [ ] Screen reader announces panel state changes
- - ARIA labels are present and descriptive
- - Touch targets meet minimum size requirements (44x44px)
- - Colors meet WCAG AA contrast ratios
- - Animations respect prefers-reduced-motion preference

### Performance Tests

- [ ] History management adds <5ms overhead per change
- - Preview updates maintain 60 FPS during rapid changes
- | Panel animations maintain 60 FPS
- - No memory leaks (history cleanup works)
- | localStorage writes are batched appropriately

---

## Troubleshooting

### Issue: Panel animation feels jerky

**Solution**: 
- Check Framer Motion is properly initialized
- Ensure no conflicting CSS transitions
- Verify `prefers-reduced-motion` is respected

### Issue: History not recording changes

**Solution**:
- Check if middleware is properly integrated
- Verify change is passing through middleware
- Ensure change is not a batched control with release handler

### Issue: Preview not updating

**Solution**:
- Verify PreviewPanel is subscribing to config store
- Check React.memo comparison function is working
- Ensure config changes are triggering store updates

### Issue: Scaling not applying

**Solution**:
- Check CSS variables are being set correctly
- Verify Tailwind classes are being applied
- Check if component is re-rendering with new scale

### Issue: Mobile bottom sheet not appearing

**Solution**:
- Verify max-width breakpoint (767px, not 1023px)
- Check if TabBottomSheet is properly integrated
- Ensure z-index is higher than overlapping elements

---

## Development Tips

1. **Work in Priority Order**: Start with P1 features (Config Toggle, Real-Time Preview)
2. **Test Locally**: Run tests frequently during development
3. **Use React DevTools**: Check component props, state, and performance
4. **Console Logging**: Add debug logs for complex state changes
5. **Break Down Tasks**: Each user story has multiple acceptance scenarios - tackle them one at a time

---

## Next Steps

After completing all phases:

1. **Run Test Suite**: `npm test && npm run lint`
2. **Fix Any Issues**: Address test failures or lint errors
3. **Create Pull Request**: Target branch: `005-config-panel-improvements`
4. **Code Review**: Ensure all requirements met
5. **Merge to Main**: Once approved, merge to main branch
6. **Delete Branch**: Cleanup after merge

---

## Support

**Questions or issues?** Contact the development team or review:
- [`spec.md`](spec.md) - Full feature specification
- [`plan.md`](plan.md) - Implementation plan
- [`research.md`](research.md) - Research decisions and rationale
- [`data-model.md`](data-model.md) - Data model definitions
