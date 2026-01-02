# Research: Fix Preview Inconsistency

**Feature**: 009-fix-preview  
**Date**: 2026-01-02  
**Status**: Complete

## Overview

This document outlines the research and implementation approach for fixing the preview inconsistency between `PreviewPanel` and `FullPreviewDialog` components. The issue is straightforward: `FullPreviewDialog` does not display background images because it doesn't access `bgUrl` from `useContentStore`, while `PreviewPanel` correctly implements this functionality.

## Problem Analysis

### Root Cause

The `FullPreviewDialog` component at [`components/teleprompter/editor/FullPreviewDialog.tsx`](components/teleprompter/editor/FullPreviewDialog.tsx) currently:

1. Only retrieves `text` from [`useContentStore`](lib/stores/useContentStore.ts:31):
   ```typescript
   const { text } = useContentStore()
   ```

2. Has a static background div with no dynamic styling:
   ```tsx
   <div className="absolute inset-0 bg-cover bg-center opacity-70 transition-opacity duration-300" />
   ```

### Working Reference: PreviewPanel

The [`PreviewPanel`](components/teleprompter/editor/PreviewPanel.tsx) component correctly implements background image display:

1. **State access** ([line 54](components/teleprompter/editor/PreviewPanel.tsx:54)):
   ```typescript
   const { text, bgUrl } = useContentStore();
   ```

2. **Background style memoization** ([lines 146-150](components/teleprompter/editor/PreviewPanel.tsx:146-150)):
   ```typescript
   const backgroundStyle = useMemo(() => ({
     backgroundImage: `url('${bgUrl}')`,
     backgroundSize: 'cover' as const,
     backgroundPosition: 'center' as const,
   }), [bgUrl]);
   ```

3. **Background image layer** with error handling ([lines 222-227](components/teleprompter/editor/PreviewPanel.tsx:222-227)):
   ```tsx
   <div
     className="absolute inset-0 bg-cover bg-center opacity-70 transition-opacity duration-300"
     style={backgroundStyle}
     onError={handleMediaError}
     onLoad={handleMediaLoad}
   />
   ```

## Implementation Approach

### Strategy: Single Source of Truth

Both preview components must consume background image URL from the same Zustand store ([`useContentStore`](lib/stores/useContentStore.ts)). This ensures:

1. **State consistency**: Both components react to the same `bgUrl` changes
2. **Real-time updates**: Changes propagate immediately via Zustand's reactivity
3. **No prop drilling**: Direct store access eliminates prop-passing complexity

### Required Changes to FullPreviewDialog

1. **Extract `bgUrl` from store**:
   ```typescript
   const { text, bgUrl } = useContentStore()
   ```

2. **Memoize background style** (for performance):
   ```typescript
   const backgroundStyle = useMemo(() => ({
     backgroundImage: bgUrl ? `url('${bgUrl}')` : undefined,
     backgroundSize: 'cover',
     backgroundPosition: 'center',
   }), [bgUrl])
   ```

3. **Apply style to background div**:
   ```tsx
   <div 
     className="absolute inset-0 bg-cover bg-center opacity-70 transition-opacity duration-300"
     style={backgroundStyle}
   />
   ```

### Optional Enhancements (from PreviewPanel reference)

For full feature parity with `PreviewPanel`, consider adding:

1. **Error handling** for invalid URLs:
   ```typescript
   const [hasError, setHasError] = useState(false)
   const handleMediaError = useCallback(() => {
     setHasError(true)
   }, [])
   ```

2. **Loading state** for large images:
   ```typescript
   const [isLoading, setIsLoading] = useState(false)
   ```

## State Management Patterns

### Zustand Store Structure

The [`useContentStore`](lib/stores/useContentStore.ts) provides:

```typescript
interface ContentStoreState {
  text: string
  bgUrl: string
  musicUrl: string
  isReadOnly: boolean
}

interface ContentStoreActions {
  setText: (text: string) => void
  setBgUrl: (url: string) => void
  setMusicUrl: (url: string) => void
  setIsReadOnly: (readOnly: boolean) => void
  setAll: (state: Partial<ContentStoreState>) => void
  reset: () => void
  resetContent: () => void
  resetMedia: () => void
}
```

### Reactivity Pattern

Zustand automatically triggers re-renders when subscribed state changes:

```typescript
// Component subscribes to specific properties
const { text, bgUrl } = useContentStore()

// When bgUrl changes via setBgUrl(), component re-renders
useContentStore.getState().setBgUrl(newUrl)
```

## Testing Strategy

### Unit Tests

1. **Store subscription verification**:
   - Verify `FullPreviewDialog` subscribes to `bgUrl`
   - Test re-render on `bgUrl` change

2. **Background style application**:
   - Verify `backgroundImage` CSS property matches `bgUrl`
   - Test empty `bgUrl` handling

### Integration Tests

1. **Visual consistency**:
   - Render both `PreviewPanel` and `FullPreviewDialog` with same state
   - Compare background image display

2. **Real-time updates**:
   - Change `bgUrl` via store action
   - Verify both components update within 100ms

### Visual Regression Tests

1. **Screenshot comparison**:
   - Capture screenshots of both preview modes
   - Verify identical rendering (except for viewport size)

## Performance Optimization

### Memoization

Use `useMemo` for background style to prevent unnecessary recalculations:

```typescript
const backgroundStyle = useMemo(() => ({
  backgroundImage: `url('${bgUrl}')`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
}), [bgUrl])
```

### Image Loading Considerations

1. **Browser caching**: Same URL will be cached after first load
2. **Preloading**: Consider preloading background images when user navigates to studio
3. **Lazy loading**: For very large images, consider progressive loading

### Performance Targets

- **Update latency**: 100ms for images up to 5MB (SC-002)
- **Render time**: <16ms (60fps) for background style application

## Edge Cases Handling

### Invalid Background URLs

When `bgUrl` fails to load (404, network error, invalid URL, CORS):

1. Show teleprompter content without background
2. Display subtle "image failed to load" indicator
3. Log error for debugging

### Empty/Null Background

When `bgUrl` is empty, null, or cleared:

1. Show default theme background (no custom image)
2. Maintain consistent styling across both preview modes

### Large Image Loading

For images 5MB+ or 4K+ resolution:

1. Show previous state with loading indicator
2. Prevent layout shifts
3. Maintain visual continuity during load

## Accessibility Considerations

1. **ARIA attributes**: Ensure background changes don't affect screen reader experience
2. **Loading indicators**: Should be announced to screen readers
3. **Error states**: Error messages should be accessible

## Security Considerations

1. **URL validation**: Validate URL format before applying
2. **XSS prevention**: URL values are used in CSS, ensure no script injection
3. **CORS handling**: Respect CORS policies for external images

## Implementation Checklist

- [ ] Update `FullPreviewDialog` to extract `bgUrl` from `useContentStore`
- [ ] Add `backgroundStyle` memoization using `useMemo`
- [ ] Apply `backgroundStyle` to background div
- [ ] Add error handling for invalid image URLs (optional enhancement)
- [ ] Add loading state for large images (optional enhancement)
- [ ] Write unit tests for store subscription
- [ ] Write integration tests for visual consistency
- [ ] Verify 100ms update latency requirement
- [ ] Test with empty/null `bgUrl`
- [ ] Test with invalid URLs
- [ ] Test with large images (5MB+)

## References

- Feature Specification: [`spec.md`](spec.md)
- Component to Fix: [`components/teleprompter/editor/FullPreviewDialog.tsx`](../../components/teleprompter/editor/FullPreviewDialog.tsx)
- Working Reference: [`components/teleprompter/editor/PreviewPanel.tsx`](../../components/teleprompter/editor/PreviewPanel.tsx)
- State Store: [`lib/stores/useContentStore.ts`](../../lib/stores/useContentStore.ts)
- Constitution: [`.specify/memory/constitution.md`](../../.specify/memory/constitution.md)
