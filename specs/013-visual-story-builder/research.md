# Research: Visual Drag-and-Drop Story Builder

**Feature**: 013-visual-story-builder
**Branch**: `013-visual-story-builder`
**Date**: 2026-01-06
**Related**: [spec.md](./spec.md), [plan.md](./plan.md)

---

## Overview

This document captures technical research and decisions for implementing the Visual Story Builder. Each section addresses a specific technical unknown with a decision, rationale, and alternatives considered.

---

## 1. Drag-and-Drop Library Selection

### Decision
Use `@dnd-kit` (v6.1.0+) with `@dnd-kit/sortable` and `@dnd-kit/utilities`

### Rationale
- **Modern Architecture**: Built for React 18+ with hooks-first design
- **Accessibility First**: Built-in keyboard navigation and screen reader support
- **Performance**: Uses CSS transforms for 60fps animations
- **TypeScript Support**: First-class TypeScript definitions
- **Active Maintenance**: Regular updates and responsive maintainers
- **Proven in Production**: Used by major companies (Notion, Linear)

### Alternatives Considered
1. **react-beautiful-dnd** (Atlassian)
   - ❌ Deprecated and no longer maintained
   - ❌ No React 18+ support
   - ❌ Limited TypeScript support
   
2. **react-dnd** (React DnD)
   - ❌ Older API with HOC patterns
   - ❌ Steeper learning curve
   - ❌ Performance issues with large lists

3. **dnd-kit** (previous version)
   - ❌ Replaced by `@dnd-kit`
   - ❌ No longer maintained

### Implementation Notes
```typescript
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, arrayMove, useSortable } from '@dnd-kit/sortable';

// Basic setup
<DndContext
  sensors={sensors}
  collisionDetection={closestCenter}
  onDragStart={handleDragStart}
  onDragOver={handleDragOver}
  onDragEnd={handleDragEnd}
>
  <SortableContext items={slides} strategy={horizontalListSortingStrategy}>
    {slides.map((slide) => <SortableSlide key={slide.id} slide={slide} />)}
  </SortableContext>
</DndContext>
```

---

## 2. iframe PostMessage Communication

### Decision
Use isolated iframe with `postMessage` API for preview communication

### Rationale
- **Style Isolation**: Preview styles don't leak into editor
- **Script Isolation**: Preview scripts run in separate context
- **Memory Protection**: Preview memory leaks don't affect editor
- **Security**: Content Security Policy can be stricter for preview
- **Performance**: Preview can be lazy-loaded and cached

### Implementation Pattern

**Editor → Preview**:
```typescript
// In editor
const updatePreview = useCallback(() => {
  previewRef.current?.contentWindow?.postMessage({
    type: 'UPDATE_STORY',
    payload: { slides, activeIndex }
  }, '*');
}, [slides, activeIndex]);
```

**Preview → Editor**:
```typescript
// In preview iframe
window.addEventListener('message', (event) => {
  if (event.data.type === 'UPDATE_STORY') {
    renderStory(event.data.payload);
  }
});

// Preview can send messages back
window.parent.postMessage({
  type: 'SLIDE_CHANGED',
  payload: { index: newIndex }
}, '*');
```

### Security Considerations
- **Origin Validation**: Check `event.origin` in production
- **Message Structure**: Use strict message format with `type` field
- **No Code Execution**: Never `eval()` message content

### Alternatives Considered
1. **Direct Component Rendering**
   - ❌ Style conflicts between editor and preview
   - ❌ State management complexity
   
2. **Server-Side Rendering**
   - ❌ Overkill for real-time preview
   - ❌ Increased latency

---

## 3. localStorage Cross-Tab Synchronization

### Decision
Use `storage` event listener with last-write-wins strategy

### Rationale
- **Browser Native**: No additional dependencies
- **Automatic**: Browser fires events automatically
- **Simple**: Minimal code required
- **Reliable**: Works across all modern browsers

### Implementation Pattern

**Auto-Save Hook**:
```typescript
const useAutoSave = (store: StoryBuilderStore) => {
  useEffect(() => {
    // Save on change (debounced)
    const saveTimer = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store.getState()));
    }, 30000); // 30 seconds
    
    return () => clearTimeout(saveTimer);
  }, [store]);
};
```

**Cross-Tab Sync**:
```typescript
useEffect(() => {
  const handleStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY && event.newValue) {
      const externalState = JSON.parse(event.newValue);
      
      // Show warning toast
      toast.warning('Changes were saved in another tab');
      
      // Reload state
      store.setState(externalState);
    }
  };
  
  window.addEventListener('storage', handleStorage);
  return () => window.removeEventListener('storage', handleStorage);
}, [store]);
```

### Edge Cases Handled
- **localStorage Disabled**: Graceful degradation with warning toast
- **localStorage Full**: Catch `QuotaExceededError` and show error
- **Concurrent Writes**: Last write wins (browser guarantees)
- **Tab Closed**: Auto-save on `beforeunload` event

### Alternatives Considered
1. **BroadcastChannel API**
   - ❌ More complex than needed
   - ❌ Doesn't provide history (old vs new value)
   
2. **SharedWorker**
   - ❌ Overkill for simple sync
   - ❌ Browser support issues

---

## 4. DOMPurify Configuration for React

### Decision
Use `dompurify` (v3.0.6+) with React-specific configuration

### Rationale
- **XSS Protection**: Sanitizes HTML from malicious scripts
- **Defense in Depth**: Even though URLs are encoded, sanitize display content
- **React Compatible**: Works seamlessly with `dangerouslySetInnerHTML`
- **Customizable**: Allow specific tags/attributes as needed

### Implementation Pattern

**Sanitization Hook**:
```typescript
import DOMPurify from 'dompurify';

const useSanitizedContent = (content: string): string => {
  return useMemo(() => {
    return DOMPurify.sanitize(content, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'span', 'br'],
      ALLOWED_ATTR: ['style', 'class'],
      ALLOW_DATA_ATTR: false,
      SAFE_FOR_JQUERY: true,
    });
  }, [content]);
};

// Usage
<div dangerouslySetInnerHTML={{ __html: useSanitizedContent(userInput) }} />
```

**Configuration by Slide Type**:
```typescript
const sanitizeConfigs = {
  'text-highlight': {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'span', 'br'],
    ALLOWED_ATTR: ['style', 'class'],
  },
  'poll': {
    ALLOWED_TAGS: ['p', 'span'],
    ALLOWED_ATTR: [],
  },
  // ... other types
};
```

### Security Considerations
- **Input Validation**: Validate before sanitization
- **Output Encoding**: Always use sanitized content
- **No `javascript:` URLs**: Block all script protocols
- **No `on*` Attributes**: Block all event handlers

### Alternatives Considered
1. **JSX escaping**
   - ❌ Only handles text, not HTML markup
   - ❌ Doesn't prevent all XSS vectors
   
2. **Custom sanitizer**
   - ❌ Reinventing the wheel
   - ❌ Security risks if incomplete

---

## 5. Instagram Stories Drag-and-Drop UX Patterns

### Decision
Mirror Instagram Stories interaction patterns with design system compliance

### Key Patterns Identified

**1. Visual Feedback During Drag**
- **Scale Up**: 1.05x scale when dragging starts
- **Shadow Elevation**: `shadow-drag` (elevation +7)
- **Opacity**: 80% opacity on original element
- **Cursor**: `grabbing` cursor during drag

**2. Drop Indicators**
- **4px Purple Line**: Shows exact drop position
- **Snap Animation**: 200ms spring animation on drop
- **Hover Preview**: Shows where element will land

**3. Horizontal Scroll Rail**
- **Thumbnail Size**: 120×213px (9:16 ratio)
- **Gap**: 12px between thumbnails
- **Active State**: 2px gradient border (purple→pink→orange)
- **Smooth Scroll**: `scroll-behavior: smooth`

**4. Empty State**
- **Centered Card**: Onboarding message in rail
- **CTA Button**: "Add Your First Slide" with gradient background
- **No Confirmation**: Allow deleting last slide without prompt

### Implementation Example

```typescript
// Drag visual feedback
const dragStyles = {
  transform: CSS.Transform.toString(transform),
  transition: isDragging ? 'none' : 'transform 200ms cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  opacity: isDragging ? 0.8 : 1,
  boxShadow: isDragging ? 'var(--shadow-drag)' : 'var(--shadow-sm)',
  cursor: isDragging ? 'grabbing' : 'grab',
};

// Drop indicator
const DropIndicator = ({ position }: { position: number }) => (
  <div
    className="absolute w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-full animate-pulse"
    style={{ top: `${position * 227}px` }} // 213px + 12px gap + 2px indicator
  />
);
```

### Accessibility Enhancements
- **Keyboard Dragging**: Arrow keys to reorder, Enter to select
- **ARIA Live Regions**: Announce drag actions to screen readers
- **Focus Management**: Return focus after drag operation

### Alternatives Considered
1. **Trello-style Columns**
   - ❌ Not suitable for horizontal rail
   - ❌ Doesn't match Instagram UX
   
2. **Figma-style Free Drag**
   - ❌ Too complex for linear slide order
   - ❌ Harder to make accessible

---

## 6. Mobile Touch Drag Performance

### Decision
Use CSS transforms with passive event listeners for optimal mobile performance

### Rationale
- **GPU Acceleration**: Transforms use GPU, not CPU
- **No Layout Thrashing**: Doesn't trigger reflow
- **Passive Listeners**: Prevents scroll jank
- **Touch Action**: Controls browser default behavior

### Implementation Pattern

```css
/* Enable GPU acceleration */
.slide-card {
  will-change: transform;
  transform: translateZ(0); /* Force GPU layer */
  touch-action: none; /* Prevent browser scrolling */
}

/* Smooth drag */
.slide-card.dragging {
  transition: none; /* No transition during drag */
  transform: scale(1.05);
}

/* Snap on drop */
.slide-card.snap {
  transition: transform 200ms cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
```

```typescript
// Passive event listeners
const sensors = useSensors(
  useSensor(PointerSensor, {
    activationConstraint: {
      distance: 8, // 8px threshold to prevent accidental drags
    },
  }),
  useSensor(TouchSensor, {
    activationConstraint: {
      delay: 250, // Long press to start drag
      tolerance: 8,
    },
  })
);
```

### Performance Optimizations
- **Debounce Updates**: Throttle state updates during drag
- **requestAnimationFrame**: Sync with browser repaint
- **Memoized Callbacks**: Prevent unnecessary re-renders
- **Virtual Scrolling**: Only render visible slides (if >10 slides)

### Browser Testing
- **iOS Safari**: Test on iPhone (most restrictive)
- **Chrome Android**: Test on Pixel
- **Samsung Internet**: Test on Galaxy devices

### Alternatives Considered
1. **Position Absolute**
   - ❌ Triggers layout thrashing
   - ❌ Poor performance on mobile
   
2. **Top/Left Properties**
   - ❌ CPU-bound rendering
   - ❌ Janky on low-end devices

---

## 7. Preview Update Optimization

### Decision
Debounce preview updates with 100ms threshold and shallow comparison

### Rationale
- **Reduced Re-renders**: Don't update on every keystroke
- **Responsive Still**: 100ms feels instant to users
- **Performance**: Reduces iframe postMessage overhead

### Implementation Pattern

```typescript
const usePreviewSync = (slides: AnySlide[], activeIndex: number) => {
  const previewRef = useRef<HTMLIFrameElement>(null);
  
  // Debounced update
  const updatePreview = useMemo(
    () => debounce((data: PreviewData) => {
      previewRef.current?.contentWindow?.postMessage({
        type: 'UPDATE_STORY',
        payload: data
      }, '*');
    }, 100),
    []
  );
  
  // Shallow comparison to prevent unnecessary updates
  const prevSlidesRef = useRef<AnySlide[]>(slides);
  
  useEffect(() => {
    // Only update if slides actually changed
    if (!shallowEqual(prevSlidesRef.current, slides)) {
      updatePreview({ slides, activeIndex });
      prevSlidesRef.current = slides;
    }
  }, [slides, activeIndex, updatePreview]);
  
  return previewRef;
};

// Shallow equality check
function shallowEqual(a: any[], b: any[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((item, index) => item === b[index]);
}
```

### Performance Metrics
- **Target**: <100ms for 95% of updates
- **Measurement**: Use `performance.mark()` and `performance.measure()`
- **Monitoring**: Log updates that exceed threshold

### Alternatives Considered
1. **Immediate Updates**
   - ❌ Too many postMessage calls
   - ❌ Preview flicker on rapid edits
   
2. **Longer Debounce (500ms)**
   - ❌ Feels laggy to users
   - ❌ Doesn't meet 100ms requirement

---

## 8. Template Storage Strategy

### Decision
Hardcode template data in TypeScript file for initial release

### Rationale
- **Simplicity**: No database or API required
- **Version Control**: Templates tracked in git
- **Type Safety**: TypeScript validation at compile time
- **Performance**: No network latency
- **Scalability**: 3 templates is manageable in code

### Implementation Pattern

```typescript
// lib/story-builder/templates/data.ts
export const templates: Template[] = [
  {
    id: 'product-announcement',
    name: 'Product Announcement',
    description: 'Introduce your new product with style',
    thumbnail: '/templates/product-announcement.jpg',
    category: 'business',
    difficulty: 'beginner',
    estimatedTime: 5,
    slides: [
      {
        id: 'template-slide-1', // Will be replaced with UUIDs
        type: 'text-highlight',
        content: { ... },
        duration: 5,
        backgroundColor: '#FFFFFF',
      },
      // ... more slides
    ],
  },
  // ... more templates
];

// Template registry
export const getTemplateById = (id: string): Template | undefined => {
  return templates.find(t => t.id === id);
};

export const getTemplatesByCategory = (category: TemplateCategory): Template[] => {
  return templates.filter(t => t.category === category);
};
```

### Future Enhancement (If Templates >10)
```typescript
// Move to JSON file
// templates/templates.json
{
  "templates": [
    { "id": "product-announcement", ... }
  ]
}

// Load dynamically
export const loadTemplates = async (): Promise<Template[]> => {
  const response = await fetch('/templates/templates.json');
  const data = await response.json();
  return data.templates;
};
```

### Alternatives Considered
1. **Database Storage**
   - ❌ Overkill for 3 templates
   - ❌ Requires backend changes
   
2. **CMS Integration**
   - ❌ Adds external dependency
   - ❌ More complex than needed

---

## 9. Color Picker Integration

### Decision
Use `react-colorful` (already in project) with custom wrapper

### Rationale
- **Already Installed**: Part of existing tech stack
- **Lightweight**: <3KB gzipped
- **TypeScript Support**: Built-in types
- **Accessibility**: Keyboard navigation included
- **Customizable**: Easy to style with Tailwind

### Implementation Pattern

```typescript
import { HexColorPicker } from 'react-colorful';

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  label?: string;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  color,
  onChange,
  label = 'Background Color'
}) => (
  <div className="space-y-2">
    <label className="text-sm font-medium text-text-primary">
      {label}
    </label>
    <div className="w-full p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
      <HexColorPicker
        color={color}
        onChange={onChange}
        className="w-full"
        style={{ height: 200 }}
      />
      <input
        type="text"
        value={color}
        onChange={(e) => onChange(e.target.value)}
        className="mt-4 w-full min-h-[44px] px-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-center font-mono text-sm uppercase focus:outline-none focus:ring-2 focus:ring-purple-500"
        maxLength={7}
      />
    </div>
  </div>
);
```

### Validation
```typescript
const isValidHex = (color: string): boolean => {
  return /^#[0-9A-Fa-f]{6}$/.test(color);
};
```

### Alternatives Considered
1. **react-color**
   - ❌ Too large (50KB+)
   - ❌ Not actively maintained
   
2. **chroma-js**
   - ❌ Overkill for simple hex picker
   - ❌ More complex API

---

## 10. Animation Library Selection

### Decision
Use Framer Motion (already in project) for animations

### Rationale
- **Already Installed**: Part of existing tech stack
- **Declarative**: Easy to understand and maintain
- **Performance**: Optimized for 60fps
- **TypeScript**: Full type safety
- **Spring Physics**: Natural-feeling animations

### Implementation Pattern

```typescript
import { motion, AnimatePresence } from 'framer-motion';

// Slide card animations
const slideVariants = {
  initial: { scale: 0.95, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.95, opacity: 0 },
};

<motion.div
  variants={slideVariants}
  initial="initial"
  animate="animate"
  exit="exit"
  transition={{
    type: 'spring',
    stiffness: 300,
    damping: 20,
  }}
>
  <SlideCard slide={slide} />
</motion.div>

// Drag animation
const dragVariants = {
  idle: { scale: 1, boxShadow: 'var(--shadow-sm)' },
  dragging: { 
    scale: 1.05, 
    boxShadow: 'var(--shadow-drag)',
    transition: { duration: 0.1 } // Fast transition
  },
};

<motion.div
  variants={dragVariants}
  animate={isDragging ? 'dragging' : 'idle'}
>
  <DraggableCard />
</motion.div>
```

### Animation Timings (from Design System)
- **Micro-interactions**: 100ms (hover, focus)
- **Drag Operations**: 200ms (snap, reorder)
- **Panel Slides**: 300ms (modals, sheets)
- **Page Transitions**: 400ms

### Alternatives Considered
1. **CSS Animations**
   - ❌ Harder to coordinate with state
   - ❌ Less flexible than Framer Motion
   
2. **React Spring**
   - ❌ Already using Framer Motion
   - ❌ No need for two animation libraries

---

## Summary of Technical Decisions

| Area | Decision | Key Benefit |
|------|----------|-------------|
| Drag-and-Drop | `@dnd-kit` | Modern, accessible, performant |
| Preview Communication | iframe + postMessage | Isolation, security, performance |
| Cross-Tab Sync | `storage` event | Browser native, simple, reliable |
| XSS Protection | DOMPurify | Defense-in-depth for URL sharing |
| UX Patterns | Instagram-inspired | Familiar, intuitive, tested |
| Mobile Performance | CSS transforms + GPU | 60fps on mobile devices |
| Preview Updates | Debounced 100ms | Responsive but efficient |
| Templates | Hardcoded in TypeScript | Simple, type-safe, no backend |
| Color Picker | react-colorful | Lightweight, accessible |
| Animations | Framer Motion | Declarative, performant |

---

## Open Questions for Implementation

1. **Template Thumbnails**: Should we generate real screenshots or use CSS-based previews?
   - **Recommendation**: Start with CSS-based previews, add screenshots in enhancement
   
2. **Undo/Redo**: Should we implement full undo/redo stack?
   - **Recommendation**: Start without undo/redo (localStorage provides recovery)
   
3. **Keyboard Shortcuts**: Which shortcuts should we support?
   - **Recommendation**: Ctrl+S (save), Ctrl+Z (undo), Escape (close modal), Arrow keys (navigation)

---

## References

- [@dnd-kit Documentation](https://docs.dndkit.com/)
- [DOMPurify Documentation](https://github.com/cure53/DOMPurify)
- [Framer Motion Documentation](https://www.framer.com/motion/)
- [PostMessage API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage)
- [Storage Event (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Window/storage_event)

---

**End of Research Document**
