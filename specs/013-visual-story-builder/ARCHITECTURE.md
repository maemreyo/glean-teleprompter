# Visual Story Builder - Architecture Documentation

## Overview

The Visual Story Builder is a drag-and-drop interface for creating and managing visual stories. It uses Zustand for state management, @dnd-kit for drag-and-drop functionality, and Next.js App Router for navigation.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Story Builder Page                       │
│                       (app/story-builder/page.tsx)              │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              │ consumes
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Story Builder Store                          │
│                  (lib/story-builder/store.ts)                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ State:                                                  │   │
│  │  - slides: BuilderSlide[]                              │   │
│  │  - activeSlideIndex: number | null                     │   │
│  │  - isDirty: boolean                                    │   │
│  │  - autoSaveEnabled: boolean                            │   │
│  │  - lastSaved: string | null                            │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Actions:                                               │   │
│  │  - addSlide(), removeSlide(), updateSlide()            │   │
│  │  - reorderSlides(), setActiveSlide()                  │   │
│  │  - reset(), markDirty(), markSaved()                   │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              │ provides state to
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        StoryBuilder Component                     │
│                   (app/story-builder/components/)               │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ SlideLibrary │  │  StoryRail   │  │ PreviewPanel │         │
│  │   (aside)    │  │  (section)   │  │   (aside)    │         │
│  │              │  │              │  │              │         │
│  │ - Drag source│  │ - Drop zone  │  │ - Live preview│         │
│  │ - Templates  │  │ - Reorder    │  │ - StoryViewer │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                  │
│  ┌─────────────────────────────────────────────────────┐       │
│  │                   SlideEditor                        │       │
│  │                   (section)                         │       │
│  │ - Form inputs for active slide                     │       │
│  │ - Real-time validation                            │       │
│  └─────────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Initial Load

```
User opens /story-builder
         │
         ▼
Load from localStorage (if exists)
         │
         ▼
Initialize store with slides
         │
         ▼
Render StoryBuilder with current state
```

### 2. Adding a Slide

```
User drags slide from Library
         │
         ▼
DndContext: onDragStart
         │
         ▼
Set active drag state
         │
         ▼
User drops on StoryRail
         │
         ▼
DndContext: onDragEnd
         │
         ▼
Store: addSlide(type, index)
         │
         ├─→ Update slides array
         ├─→ Set activeSlideIndex
         ├─→ markDirty()
         └─→ Trigger auto-save
         │
         ▼
Components re-render with new state
         │
         ▼
PreviewPanel receives updated story via postMessage
```

### 3. Editing a Slide

```
User edits form in SlideEditor
         │
         ▼
onChange handler
         │
         ▼
Store: updateSlide(index, data)
         │
         ├─→ Update slide in array
         ├─→ markDirty()
         └─→ Trigger auto-save
         │
         ▼
usePreviewSync hook detects changes
         │
         ▼
postMessage to /story-preview
         │
         ▼
PreviewPage sanitizes input
         │
         ▼
StoryViewer re-renders
```

### 4. Auto-Save Flow

```
Store state changes
         │
         ▼
useAutoSave hook (hook/useAutoSave.ts)
         │
         ▼
Debounce 500ms
         │
         ▼
Save to localStorage
         │
         ├─→ Serialize state
         ├─→ Compress with LZ-String
         └─→ Write to localStorage key 'story-builder-draft'
         │
         ▼
Update lastSaved timestamp
```

## Component Hierarchy

```
app/story-builder/page.tsx
└── StoryBuilder
    ├── Header
    │   ├── Logo
    │   ├── Actions (Undo/Redo, Clear, Help)
    │   └── AutoSaveIndicator
    ├── DndContext
    │   ├── SlideLibrary (draggable templates)
    │   │   └── SlideTemplate[] × 7
    │   ├── StoryRail (drop zone)
    │   │   ├── SlideCard[] (sortable)
    │   │   │   ├── DragHandle
    │   │   │   ├── Thumbnail
    │   │   │   └── DeleteButton
    │   │   └── EmptyState
    │   └── PreviewPanel
    │       └── iframe → /story-preview
    └── SlideEditor
        ├── TabNavigation (Content/Style/Timing)
        └── SlideEditorContent (slide-specific inputs)
```

## State Management Patterns

### Zustand Store Architecture

```typescript
// lib/story-builder/store.ts

interface StoryBuilderState {
  // State
  slides: BuilderSlide[];
  activeSlideIndex: number | null;
  isDirty: boolean;
  
  // Actions
  addSlide: (type: BuilderSlideType, index?: number) => void;
  removeSlide: (index: number) => void;
  updateSlide: (index: number, data: Partial<BuilderSlide>) => void;
  reorderSlides: (fromIndex: number, toIndex: number) => void;
  setActiveSlide: (index: number | null) => void;
  reset: () => void;
}

export const useStoryBuilderStore = create<StoryBuilderState>()(
  persist(
    (set, get) => ({
      // ... implementation
    }),
    {
      name: 'story-builder-storage',
      partialize: (state) => ({ slides: state.slides }),
    }
  )
);
```

### Selector Pattern (Optimization)

Components use selectors to prevent unnecessary re-renders:

```typescript
// ❌ Bad - re-renders on any state change
const store = useStoryBuilderStore();

// ✅ Good - only re-renders when slides change
const slides = useStoryBuilderStore(state => state.slides);
const addSlide = useStoryBuilderStore(state => state.addSlide);
```

### Derived State

Some computed values are derived using `useMemo`:

```typescript
const slideIds = slides.map(s => s.id); // for @dnd-kit
const shouldVirtualize = slides.length > 15; // for StoryRail
```

## Key Integration Points

### 1. Preview Sync

**Hook**: `lib/story-builder/hooks/usePreviewSync.ts`

- Listens to store changes via Zustand subscription
- Sends postMessage to preview iframe
- Handles iframe lifecycle (mount/unmount)

**Receiver**: `app/story-preview/page.tsx`

- Validates message origin (`event.origin === window.location.origin`)
- Sanitizes all user content using `xssProtection.ts`
- Converts BuilderSlide → StoryScript format
- Renders using StoryViewer component

### 2. Drag and Drop

**Library**: `@dnd-kit/core` + `@dnd-kit/sortable`

**Setup**:
```typescript
<DndContext
  sensors={sensors}
  onDragStart={handleDragStart}
  onDragOver={handleDragOver}
  onDragEnd={handleDragEnd}
>
  <SortableContext items={slideIds} strategy={horizontalListSortingStrategy}>
    {slides.map(...)}
  </SortableContext>
</DndContext>
```

**Data Flow**:
1. Drag starts → set `activeDrag` state
2. Drag over → calculate drop indicator position
3. Drag ends → update store with new slide order

### 3. Auto-Save

**Hook**: `hooks/useAutoSave.ts`

- Wraps the story-builder store
- Debounces saves (500ms)
- Uses LZ-String compression for localStorage
- Shows save status via AutoSaveIndicator

**Storage**:
```typescript
// Key: 'story-builder-draft'
// Format: { slides: BuilderSlide[], timestamp: string }
// Compression: LZ-String.compressToUTF16()
```

## Security Considerations

### XSS Prevention

1. **Input Sanitization** (`lib/story-builder/utils/xssProtection.ts`)
   - Uses DOMPurify for all user content
   - Strips HTML tags from text fields
   - Validates URLs (blocks `javascript:`, `data:`)

2. **Origin Validation** (`app/story-preview/page.tsx`)
   ```typescript
   if (event.origin !== window.location.origin) {
     console.warn('Rejected message from untrusted origin');
     return;
   }
   ```

3. **Content Security**
   - PostMessage data is sanitized before rendering
   - No `dangerouslySetInnerHTML` usage
   - All text rendered as text content, not HTML

## Performance Optimizations

### 1. Virtual Scrolling (StoryRail)

- **Threshold**: 15+ slides trigger virtualization
- **Buffer**: 3 slides on each side of viewport
- **Implementation**: Custom windowing (compatible with @dnd-kit)

```typescript
if (slides.length > 15) {
  // Only render visible + buffer slides
  const visibleRange = calculateVisibleRange(scrollOffset, containerWidth);
  return slides.slice(visibleRange.start, visibleRange.end).map(...);
}
```

### 2. Selector Optimization

Components subscribe to specific state slices:

```typescript
// StoryRail.tsx
const { slides, activeSlideIndex, setActiveSlide } = useStoryBuilderStore();
```

### 3. Memoization

```typescript
// Prevent unnecessary re-renders
const slideIds = useMemo(() => slides.map(s => s.id), [slides]);
const storyScript = useMemo(() => convertToStoryScript(slides), [slides]);
```

## Responsive Design

### Breakpoints

```typescript
// Mobile (< 768px)
- Tab navigation (Library/Story/Preview)
- Stacked layout

// Tablet (768px - 1023px)
- 2-column layout (Editor + Preview)
- Library accessible via tabs

// Desktop (≥ 1024px)
- 3-column layout (Library | Editor + Rail | Preview)
- All panels visible simultaneously
```

### A11y Features

- Semantic HTML (`<main>`, `<aside>`, `<section>`, ARIA landmarks)
- Keyboard navigation (Arrow keys, Delete/Backspace, Escape)
- Screen reader announcements (aria-live regions)
- Focus management during drag operations
- Touch targets ≥ 44×44px (WCAG 2.1 AAA)

## Testing Strategy

### Unit Tests

- Store actions and state mutations
- Utility functions (xssProtection, urlGenerator)
- Custom hooks (useAutoSave, usePreviewSync)

### Integration Tests

- Drag and drop flow
- Preview sync mechanism
- Form validation

### E2E Tests (Playwright)

- Complete story creation workflow
- Cross-browser compatibility
- Mobile gestures

## Key Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| @dnd-kit/core | ^6.3.1 | Drag and drop |
| @dnd-kit/sortable | ^8.0.0 | Sortable lists |
| zustand | ^5.0.9 | State management |
| framer-motion | ^12.23.26 | Animations |
| dompurify | ^3.3.1 | XSS prevention |
| lz-string | ^1.5.0 | Compression |
| sonner | ^2.0.7 | Toast notifications |

## Future Enhancements

1. **Cloud Backup**: Supabase integration for draft storage
2. **Collaboration**: Real-time multi-user editing
3. **Templates**: Pre-built story templates
4. **Export**: JSON, PDF, video export options
5. **Analytics**: Track slide engagement

## Troubleshooting

### Common Issues

**Issue**: Preview not updating
- **Solution**: Check iframe origin validation, verify postMessage is sending

**Issue**: Drag and drop not working
- **Solution**: Ensure @dnd-kit sensors are configured, check pointer events

**Issue**: Auto-save not persisting
- **Solution**: Check localStorage quota (5MB limit), verify compression is working

**Issue**: Performance degradation with many slides
- **Solution**: Verify virtualization is active (check `slides.length > 15`)

## Related Documentation

- [Feature Plan](./FEATURE.md)
- [Tasks](./tasks.md)
- [Roast Report](./roasts/roast-report-013-story-builder-studio-2026-01-06-1420.md)
- [XSS Protection](../../lib/story-builder/utils/xssProtection.ts)
