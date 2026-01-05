# Z-Index Strategy Guide

## Overview

This document explains the z-index layering system used in the Runner component and provides guidelines for developers working with this codebase.

**Problem Solved:** Before this refactor, z-index values were scattered across multiple files with hardcoded values, causing conflicts and maintenance issues. This centralized system resolves:

- **CRITICAL:** QuickSettingsPanel conflict with control bars (both at z-50)
- **HIGH:** Music widget using unnecessarily high values (1000-9999)
- **HIGH:** Camera widget unable to be raised above music widget
- **MEDIUM:** No centralized constants
- **MEDIUM:** Redundant z-index patterns (inline style + Tailwind class)

---

## Constants Location

All z-index constants are defined in: `lib/constants/z-index.ts`

```typescript
import { ZIndex } from '@/lib/constants/z-index';
```

---

## Layer Architecture

### Visual Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│ Modal Layer (1000+)                                          │
│ - Future modals, confirmation dialogs                       │
├─────────────────────────────────────────────────────────────┤
│ Music Widget Configure Button (650)                         │
│ - Settings button that routes to /studio?tab=music          │
├─────────────────────────────────────────────────────────────┤
│ Music Widget (600-649)                                      │
│ - Draggable music player widget                             │
│ - Can increment by 10 on focus/drag                         │
├─────────────────────────────────────────────────────────────┤
│ Camera Widget (500-599)                                     │
│ - Draggable camera widget                                   │
│ - Can increment by 10 on focus/drag                         │
├─────────────────────────────────────────────────────────────┤
│ Quick Settings Panel (200)                                  │
│ - Floating settings dialog                                  │
│ - Overrides Radix UI Dialog default z-50                     │
├─────────────────────────────────────────────────────────────┤
│ Bottom Controls (110)                                       │
│ - Play/pause, speed slider, font size slider               │
├─────────────────────────────────────────────────────────────┤
│ Top Controls (100)                                          │
│ - Theme switcher, quick settings button, camera toggle      │
├─────────────────────────────────────────────────────────────┤
│ Content Text (10)                                           │
│ - Teleprompter scrolling text                               │
├─────────────────────────────────────────────────────────────┤
│ Overlay (1)                                                 │
│ - Tint overlay for text contrast                            │
├─────────────────────────────────────────────────────────────┤
│ Background (0)                                              │
│ - Background image                                          │
└─────────────────────────────────────────────────────────────┘
```

### Constant Values

| Constant | Value | Usage |
|----------|-------|-------|
| `ZIndex.Base` | 0 | Background div, backdrop images |
| `ZIndex.Overlay` | 1 | Black overlay with opacity for text contrast |
| `ZIndex.Content` | 10 | TeleprompterText container |
| `ZIndex.ControlsTop` | 100 | Theme switcher, quick settings, camera toggle |
| `ZIndex.ControlsBottom` | 110 | Play/pause, speed slider, font size |
| `ZIndex.QuickSettings` | 200 | QuickSettingsPanel Dialog override |
| `ZIndex.WidgetBase` | 500 | DraggableCamera widget container |
| `ZIndex.WidgetHandle` | 530 | Drag handle indicator (nested, no effect) |
| `ZIndex.WidgetMax` | 599 | Camera widget max dynamic z-index |
| `ZIndex.MusicWidgetBase` | 600 | MusicPlayerWidget container |
| `ZIndex.MusicWidgetConfigure` | 650 | Music widget settings button |
| `ZIndex.MusicWidgetMax` | 649 | Music widget max dynamic z-index |
| `ZIndex.Modal` | 1000 | Future modals/dialogs |

---

## Usage Guidelines

### 1. Always Import from Constants

**✅ GOOD:**
```typescript
import { ZIndex } from '@/lib/constants/z-index';

<div style={{ zIndex: ZIndex.ControlsTop }}>
```

**❌ BAD:**
```typescript
<div className="z-50">
// or
<div style={{ zIndex: 50 }}>
```

### 2. For Dynamic Z-Index Scenarios

When implementing draggable widgets that need to come to front on interaction:

```typescript
const [zIndex, setZIndex] = useState(ZIndex.WidgetBase);

const handleFocus = useCallback(() => {
  setZIndex((prev) => Math.min(prev + 10, ZIndex.WidgetMax));
}, []);
```

**Key Points:**
- Use 10-step increments to avoid conflicts
- Always cap at the appropriate `*_MAX` constant
- Document the range in component JSDoc

### 3. When Adding New Components

1. **Review existing layers** to find appropriate placement
2. **Use 10-step increments** within layers for related elements
3. **Add constants** to `lib/constants/z-index.ts` with JSDoc
4. **Update this documentation**
5. **Add tests** to verify ordering

### 4. Radix UI Dialog Override

Radix UI components default to `z-50`. Always override for proper layering:

```tsx
<DialogContent
  style={{ zIndex: ZIndex.QuickSettings }}
  // ... other props
>
```

---

## Troubleshooting

### Element Not Appearing

1. **Check parent stacking context** - Nested z-index only affects children
2. **Verify z-index is applied** - Use browser DevTools to inspect computed styles
3. **Check for duplicate z-index props** - Don't use both `className="z-50"` AND `style={{ zIndex: 50 }}`

### Radix UI Dialog Conflicts

**Symptom:** Dialog appears behind other elements

**Solution:** Override the default z-50:
```tsx
<DialogContent style={{ zIndex: ZIndex.YourLayer }}>
```

### Nested Z-Index Not Working

**Symptom:** Child element with higher z-index still behind siblings

**Cause:** Nested z-index only creates a new stacking context for children

**Example:**
```tsx
// Parent at z-100
<div style={{ zIndex: 100 }}>
  {/* This creates a NEW stacking context */}
  {/* z-9999 here only affects other children of this parent */}
  <div style={{ zIndex: 9999 }}>Still behind parent's siblings</div>
</div>
```

**Solution:** Adjust the parent's z-index instead

### Widget Interaction Issues

**Symptom:** Camera widget always appears behind music widget

**Current Design:** Camera (500-599) is below music (600-649) by default

**Solution:** Both widgets support dynamic incrementing on drag/focus. The user can bring either widget to front by interacting with it.

---

## Migration Guide

For developers updating legacy code:

### Before (Hardcoded)
```tsx
<div className="absolute inset-0 z-0"> {/* Background */}</div>
<div className="absolute inset-0 z-[1]"> {/* Overlay */}</div>
<div className="relative z-10"> {/* Content */}</div>
<div className="absolute top-6 left-6 z-50"> {/* Controls */}</div>
```

### After (Centralized)
```tsx
import { ZIndex } from '@/lib/constants/z-index';

<div style={{ zIndex: ZIndex.Base }}> {/* Background */}</div>
<div style={{ zIndex: ZIndex.Overlay }}> {/* Overlay */}</div>
<div style={{ zIndex: ZIndex.Content }}> {/* Content */}</div>
<div style={{ zIndex: ZIndex.ControlsTop }}> {/* Controls */}</div>
```

---

## Testing

### Unit Tests

Run z-index unit tests:
```bash
npm test -- z-index
```

Tests verify:
- Constant values are correct
- Layer ordering is maintained
- Proper spacing between layers
- Dynamic ranges are adequate
- Critical fixes are verified

### Manual Testing Checklist

- [ ] Quick Settings Panel appears above all controls when open
- [ ] Music widget can be dragged to any position
- [ ] Camera widget can be dragged to any position
- [ ] Camera widget can be brought above music widget by dragging
- [ ] Music widget can be brought above camera widget by dragging
- [ ] Music configure button appears above music widget
- [ ] No overlapping elements in default state
- [ ] All controls remain clickable and accessible
- [ ] Keyboard navigation works correctly
- [ ] Mobile viewport maintains correct layering

---

## Design Decisions

### Why These Values?

1. **Lower base range (0-1000)**: Aligns with Tailwind's default scale and common patterns
2. **100-step major layers**: Allows future insertions without conflicts
3. **10-step within layers**: Sufficient for related elements without wasting space
4. **Widget ranges (500-599, 600-649)**: Provides 49-99 increments for dynamic layering
5. **Modal at 1000**: Reserved space for future overlay elements

### Why Not Use Tailwind Classes?

Tailwind's `z-*` classes work for static values, but:
- Cannot be dynamically incremented
- Harder to maintain relationships between layers
- No type safety
- Difficult to refactor globally

### Widget Interaction Strategy

Instead of a complex z-index manager, both widgets use simple increment-on-interaction:
- Each increments by 10 on focus/drag
- Capped at their respective MAX values
- Simple, predictable, and sufficient for 2-widget scenario

For 3+ draggable widgets, consider implementing a shared z-index manager.

---

## Future Considerations

### Extensibility

- Reserved range at 1000+ for modals
- 10-step increments allow inserting new layers
- Dynamic ranges allow for multiple draggable widgets

### Potential Enhancements

1. **Global Z-Index Manager**: For complex multi-widget scenarios
2. **Auto-increment on drag**: Shared hook for all draggable widgets
3. **Visual debugging mode**: Toggle to show z-index values on elements
4. **Automated testing**: Visual regression tests for layering

### Related Components

These components may need similar treatment:
- Editor components (config panels, etc.)
- Any other dialogs/modals in the application
- Toast notifications (Sonner) - verify they appear above Runner layers

---

## References

- Implementation Plan: `plans/012-z-index-refactor-plan.md`
- Constants File: `lib/constants/z-index.ts`
- Unit Tests: `__tests__/unit/lib/z-index.test.ts`
