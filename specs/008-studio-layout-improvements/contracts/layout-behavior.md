# API Contract: Layout Behavior Specifications

**Feature**: 008-studio-layout-improvements
**File**: `components/teleprompter/Editor.tsx`
**Version**: 1.0.0

## Layout Behavior Overview

This document specifies the layout behavior for the Editor component when implementing the floating ConfigPanel overlay. The key change is that ContentPanel and PreviewPanel maintain their positions (50/50 split) regardless of ConfigPanel visibility.

## Layout States

### State 1: ConfigPanel Hidden (Default)

```
┌─────────────────────────────────────────────────────────────────┐
│                    Studio Page Layout                            │
├──────────────────────────────┬──────────────────────────────────┤
│       ContentPanel           │         PreviewPanel              │
│          (50%)               │            (50%)                  │
│                              │                                  │
│  • Header                    │  • Background                    │
│  • Textarea                  │  • TeleprompterText              │
│  • Actions                   │    (1 or 2 columns)              │
│                              │                                  │
└──────────────────────────────┴──────────────────────────────────┘
```

**CSS Classes**:
```typescript
// ContentPanel
className="w-full lg:w-[50%] flex flex-col"

// PreviewPanel
className="w-full lg:w-[50%] relative"

// ConfigPanel: Not rendered (portal)
```

**Breakpoints**:
- Mobile (<1024px): Stacked vertical layout
- Desktop (≥1024px): 50/50 horizontal split

### State 2: ConfigPanel Visible (Overlay)

```
┌─────────────────────────────────────────────────────────────────┐
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              ConfigPanel Overlay                         │    │
│  │  (400px width, centered, z-50)                          │    │
│  │  • Backdrop (z-40, semi-transparent)                    │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  ═══════════════════════ Backdrop Dimmer ════════════════════    │
│                                                                 │
│  ┌──────────────────────────────┬──────────────────────────┐    │
│  │       ContentPanel           │      PreviewPanel        │    │
│  │          (50%)               │          (50%)           │    │
│  │                              │                          │    │
│  │  • Maintains position        │  • Maintains position    │    │
│  │  • No layout shift           │  • No layout shift       │    │
│  └──────────────────────────────┴──────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

**CSS Classes**:
```typescript
// ContentPanel: Unchanged
className="w-full lg:w-[50%] flex flex-col"

// PreviewPanel: Unchanged
className="w-full lg:w-[50%] relative"

// ConfigPanel: Rendered via Radix UI Portal
<Dialog.Root open={panel.visible}>
  <Dialog.Portal>
    <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
    <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 
                              w-[400px] max-w-[90vw] h-[80vh] z-50" />
  </Dialog.Portal>
</Dialog.Root>
```

## Layout Transition Behavior

### Opening Animation

```typescript
// Duration: 300ms
// Easing: ease-out

// Backdrop fade in
const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

// Panel fade + scale in
const panelVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
};
```

**Timeline**:
```
0ms:    User toggles panel
0ms:    Backdrop starts fading in (opacity: 0 → 1)
0ms:    Panel starts fading in (opacity: 0 → 1, scale: 0.95 → 1)
300ms:  Animation complete
300ms:  Focus trap activates
```

### Closing Animation

```typescript
// Duration: 300ms
// Easing: ease-in

// Backdrop fade out
const overlayVariants = {
  visible: { opacity: 1 },
  hidden: { opacity: 0 },
};

// Panel fade + scale out
const panelVariants = {
  visible: { opacity: 1, scale: 1 },
  hidden: { opacity: 0, scale: 0.95 },
};
```

**Timeline**:
```
0ms:    User closes panel (Escape / click outside / close button)
0ms:    Backdrop starts fading out (opacity: 1 → 0)
0ms:    Panel starts fading out (opacity: 1 → 0, scale: 1 → 0.95)
0ms:    Focus returns to trigger button
300ms:  Animation complete, panel removed from DOM
```

## Width Specifications

### ContentPanel

| Breakpoint | Width | Behavior |
|------------|-------|----------|
| Mobile (<1024px) | `w-full` | Full width, stacked |
| Desktop (≥1024px) | `lg:w-[50%]` | Half width, fixed |

**CSS**:
```typescript
className="w-full lg:w-[50%] flex flex-col h-full"
```

### PreviewPanel

| Breakpoint | Width | Behavior |
|------------|-------|----------|
| Mobile (<1024px) | `w-full` | Full width, stacked |
| Desktop (≥1024px) | `lg:w-[50%]` | Half width, fixed |

**CSS**:
```typescript
className="w-full lg:w-[50%] relative h-full"
```

### ConfigPanel (Overlay)

| Property | Value | Description |
|----------|-------|-------------|
| Position | `fixed` | Overlay positioning |
| Width | `w-[400px]` | Minimum 400px |
| Max Width | `max-w-[90vw]` | Responsive max |
| Height | `h-[80vh]` | 80% of viewport |
| Centering | `-translate-x-1/2 -translate-y-1/2` | Centered |
| Z-Index | `z-50` | Above content |
| Border Radius | `rounded-lg` | Rounded corners |
| Shadow | `shadow-2xl` | Elevation |

**CSS**:
```typescript
className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 
           w-[400px] max-w-[90vw] h-[80vh] 
           bg-card rounded-lg shadow-2xl z-50 
           flex flex-col"
```

## Layout Metrics

### Desktop Layout (≥1024px)

| Metric | Value | Calculation |
|--------|-------|-------------|
| Total Width | 100% | Viewport width |
| ContentPanel | 50% | `viewport * 0.5` |
| PreviewPanel | 50% | `viewport * 0.5` |
| ConfigPanel | 400px | Fixed (overlay) |
| Gap | 0px | No gap (adjacent) |

**Example** (1920px viewport):
- ContentPanel: 960px
- PreviewPanel: 960px
- ConfigPanel: 400px (overlay, centered)

### Mobile Layout (<1024px)

| Metric | Value | Calculation |
|--------|-------|-------------|
| Total Width | 100% | Viewport width |
| ContentPanel | 100% | Full width |
| PreviewPanel | 100% | Full width (stacked) |
| ConfigPanel | Bottom sheet | Mobile behavior |

## Animation Performance

### Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Animation Duration | ≤300ms | Framer Motion config |
| Frame Rate | ≥60 FPS | Chrome DevTools Performance |
| Layout Shift | <0.1 | Chrome DevTools CLS |
| First Paint | <100ms | Performance API |

### Optimization Techniques

```typescript
// GPU acceleration
const panelStyle = {
  willChange: 'transform, opacity',  // Hint to browser
  transform: 'translateZ(0)',        // Force GPU layer
};

// Containment
const containerStyle = {
  contain: 'layout style paint',  // Isolate recalculations
};

// Reduced motion
const prefersReducedMotion = usePrefersReducedMotion();
const animationDuration = prefersReducedMotion ? 0 : 0.3;
```

## Responsive Breakpoints

### Tailwind CSS Breakpoints

```typescript
// Mobile first approach
const breakpoints = {
  sm: '640px',   // Small tablets
  md: '768px',   // Tablets
  lg: '1024px',  // Desktop (layout split point)
  xl: '1280px',  // Large desktop
  '2xl': '1536px', // Extra large desktop
};
```

### Layout Behavior by Breakpoint

| Breakpoint | Layout | Columns | ConfigPanel |
|------------|--------|---------|-------------|
| <1024px | Stacked | 1 | Bottom sheet |
| ≥1024px | Split 50/50 | User config (1-2) | Overlay |

## Accessibility Behavior

### Focus Management

```typescript
// Opening
1. Save active element (trigger button)
2. Render ConfigPanel in portal
3. Move focus to first interactive element in panel
4. Enable focus trap

// Closing
1. Restore focus to saved trigger button
2. Disable focus trap
3. Remove panel from DOM
```

### Keyboard Navigation

| Key | Action | Behavior |
|-----|--------|----------|
| `Ctrl/Cmd + ,` | Toggle panel | Open/close ConfigPanel |
| `Escape` | Close panel | Close overlay, restore focus |
| `Tab` | Next element | Cycle through panel controls |
| `Shift + Tab` | Previous element | Reverse cycle through controls |

### ARIA Attributes

```typescript
<Dialog.Root>
  <Dialog.Portal>
    <Dialog.Overlay 
      aria-hidden="true"
      className="backdrop"
    />
    <Dialog.Content
      role="dialog"
      aria-modal="true"
      aria-labelledby="panel-title"
      aria-describedby="panel-description"
      className="panel"
    >
      <h2 id="panel-title">Configuration</h2>
      <div id="panel-description">{/* Content */}</div>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
```

## Layout Testing

### Visual Regression Tests

```typescript
// Test scenarios
describe('Editor Layout', () => {
  it('should render 50/50 split when panel hidden', () => {
    render(<Editor />);
    expect(ContentPanel).toHaveWidth('50%');
    expect(PreviewPanel).toHaveWidth('50%');
  });
  
  it('should maintain 50/50 split when panel visible', () => {
    const { togglePanel } = useUIStore.getState();
    togglePanel();
    render(<Editor />);
    expect(ContentPanel).toHaveWidth('50%');
    expect(PreviewPanel).toHaveWidth('50%');
  });
});
```

### Performance Tests

```typescript
// Animation performance
describe('Layout Animations', () => {
  it('should complete open animation in ≤300ms', async () => {
    const start = performance.now();
    togglePanel();
    await waitFor(() => expect(panel).toBeVisible());
    const duration = performance.now() - start;
    expect(duration).toBeLessThanOrEqual(300);
  });
  
  it('should maintain 60 FPS during animation', () => {
    // Measure frame rate during transition
    const fps = measureFPSDuringAnimation(() => togglePanel());
    expect(fps).toBeGreaterThanOrEqual(60);
  });
});
```

---

**Contract Version**: 1.0.0
**Last Updated**: 2026-01-01
**Status**: Final
