# Data Model: Fix Preview Inconsistency

**Feature**: 009-fix-preview  
**Date**: 2026-01-02  
**Status**: Complete

## Overview

This document describes the data model for the background image URL (`bgUrl`) property used by preview components. The data is managed through the Zustand-based [`useContentStore`](../../lib/stores/useContentStore.ts).

## Core Data Structure

### ContentStore State

The [`ContentStoreState`](../../lib/stores/useContentStore.ts:15-24) interface defines the content data structure:

```typescript
interface ContentStoreState {
  /** The teleprompter script text content */
  text: string
  
  /** Background image URL displayed in Runner mode */
  bgUrl: string
  
  /** Background music URL for audio playback in Runner mode */
  musicUrl: string
  
  /** Whether the editor is in read-only mode */
  isReadOnly: boolean
}
```

### ContentStore Actions

The [`ContentStoreActions`](../../lib/stores/useContentStore.ts:26-43) interface defines state mutations:

```typescript
interface ContentStoreActions {
  /** Set the teleprompter text content */
  setText: (text: string) => void
  
  /** Set the background image URL */
  setBgUrl: (url: string) => void
  
  /** Set the background music URL */
  setMusicUrl: (url: string) => void
  
  /** Set the editor read-only state */
  setIsReadOnly: (readOnly: boolean) => void
  
  /** Bulk update multiple state properties at once */
  setAll: (state: Partial<ContentStoreState>) => void
  
  /** Reset all state to default values */
  reset: () => void
  
  /** Reset only content properties (text, bgUrl, musicUrl) */
  resetContent: () => void
  
  /** Reset only media properties (bgUrl, musicUrl) */
  resetMedia: () => void
}
```

## bgUrl Property

### Definition

| Property | Type | Default Value | Description |
|----------|------|---------------|-------------|
| `bgUrl` | `string` | `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop` | URL of the background image to display in preview modes |

### Usage Pattern

```typescript
// Read from store
const { bgUrl } = useContentStore()

// Update via action
useContentStore.getState().setBgUrl('https://example.com/image.jpg')

// Reset to default
useContentStore.getState().resetMedia()
```

### Reactivity

Components that subscribe to `bgUrl` automatically re-render when the value changes:

```typescript
const { bgUrl } = useContentStore() // Component re-renders on bgUrl change
```

## Validation Rules

### URL Format

The `bgUrl` should be a valid URL string. While the store doesn't enforce URL format validation at the state level, components should handle invalid URLs gracefully.

**Valid formats:**
- Absolute URLs: `https://example.com/image.jpg`
- Relative URLs: `/images/background.jpg`
- Data URLs: `data:image/jpeg;base64,...`
- Unsplash URLs: `https://images.unsplash.com/photo-xxx?q=80&w=2564&auto=format&fit=crop`

**Invalid formats (should be handled):**
- Empty string: `""`
- Malformed URLs: `htp://invalid`
- Non-URL strings: `not a url`
- Null/undefined (though TypeScript prevents this)

### Empty States

The `bgUrl` property supports the following empty states:

| State | Value | Behavior |
|-------|-------|----------|
| Default | Unsplash URL | Shows default gradient background image |
| Empty string | `""` | Shows theme background (no custom image) |
| Null | Not allowed (TypeScript) | N/A |
| Undefined | Not allowed (TypeScript) | N/A |

### Size Constraints

From the feature specification ([FR-007](spec.md:66)):

- **Maximum file size**: 5MB
- **Recommended resolution**: Up to 4K (3840×2160)
- **Performance target**: 100ms update latency for images ≤5MB

## State Transitions

### Loading State

When a background image URL is set, the browser loads the image asynchronously:

```
┌─────────────┐     setBgUrl()     ┌──────────────┐
│   Previous  │ ──────────────────> │   Loading    │
│   State     │                    │   State      │
└─────────────┘                    └──────┬───────┘
                                           │
                    ┌──────────────────────┼──────────────────────┐
                    │                      │                      │
                    ▼                      ▼                      ▼
            ┌───────────────┐      ┌───────────────┐      ┌───────────────┐
            │    Loaded     │      │     Error     │      │    Timeout    │
            │    State      │      │    State      │      │    State      │
            └───────────────┘      └───────────────┘      └───────────────┘
```

**State descriptions:**

1. **Previous State**: The background image before the change (could be default, custom, or empty)
2. **Loading State**: Browser is fetching the image. UI should show loading indicator
3. **Loaded State**: Image successfully loaded and displayed
4. **Error State**: Image failed to load (404, network error, CORS, invalid URL)
5. **Timeout State**: Image took too long to load (fallback behavior)

### Error Handling

When image loading fails, components should:

1. Display teleprompter content without background
2. Show subtle "image failed to load" indicator
3. Log error for debugging

```typescript
const handleMediaError = useCallback(() => {
  setHasError(true)
  setErrorMessage(t('failedToLoadBg'))
  console.error('[PreviewPanel] Media load error:', bgUrl)
}, [bgUrl])
```

### Reset Behavior

Calling `resetMedia()` restores default values:

```typescript
resetMedia() // Sets bgUrl to DEFAULT_BG
```

## Persistence

### Storage Location

The `ContentStore` persists to localStorage with the key `'teleprompter-content'`:

```typescript
persist(
  (set) => ({ /* state */ }),
  {
    name: 'teleprompter-content',
    storage: createJSONStorage(() => localStorage),
    partialize: (state) => ({
      text: state.text,
      bgUrl: state.bgUrl,
      musicUrl: state.musicUrl,
      isReadOnly: state.isReadOnly
    })
  }
)
```

### Storage Schema

```json
{
  "state": {
    "text": "Chào mừng! Hãy nhập nội dung của bạn vào đây...",
    "bgUrl": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop",
    "musicUrl": "",
    "isReadOnly": false
  },
  "version": 0
}
```

## Component Integration

### PreviewPanel (Working Reference)

The [`PreviewPanel`](../../components/teleprompter/editor/PreviewPanel.tsx) correctly integrates `bgUrl`:

```typescript
// Subscribe to bgUrl
const { text, bgUrl } = useContentStore()

// Memoize background style
const backgroundStyle = useMemo(() => ({
  backgroundImage: `url('${bgUrl}')`,
  backgroundSize: 'cover' as const,
  backgroundPosition: 'center' as const,
}), [bgUrl])

// Apply to background div
<div
  className="absolute inset-0 bg-cover bg-center opacity-70 transition-opacity duration-300"
  style={backgroundStyle}
  onError={handleMediaError}
  onLoad={handleMediaLoad}
/>
```

### FullPreviewDialog (To Be Fixed)

The [`FullPreviewDialog`](../../components/teleprompter/editor/FullPreviewDialog.tsx) currently missing `bgUrl`:

**Current implementation:**
```typescript
const { text } = useContentStore() // Missing bgUrl
```

**Required implementation:**
```typescript
const { text, bgUrl } = useContentStore() // Add bgUrl

const backgroundStyle = useMemo(() => ({
  backgroundImage: bgUrl ? `url('${bgUrl}')` : undefined,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
}), [bgUrl])

<div
  className="absolute inset-0 bg-cover bg-center opacity-70 transition-opacity duration-300"
  style={backgroundStyle}
/>
```

## Type Safety

### TypeScript Types

The store uses TypeScript strict mode with full type safety:

```typescript
type ContentStore = ContentStoreState & ContentStoreActions

export const useContentStore = create<ContentStore>()(
  persist(
    (set) => ({ /* implementation */ })
  )
)
```

### Type Guards

For runtime validation (optional):

```typescript
function isValidBgUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}
```

## Data Flow Diagram

```
┌─────────────────┐
│  User Action    │
│  (Upload/Select │
│   Background)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  MediaInput or  │
│  Template Load  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  setBgUrl(url)  │
│  Action called  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  useContentStore│
│  State Updated  │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│           Zustand Reactivity             │
│  (All subscribed components re-render)   │
└────────┬────────────────────────────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐ ┌──────────┐
│Preview │ │  Full    │
│ Panel  │ │ Preview  │
│        │ │ Dialog   │
└────┬───┘ └────┬─────┘
     │           │
     ▼           ▼
┌─────────┐ ┌─────────┐
│ bgUrl   │ │ bgUrl   │
│ Applied │ │ Applied │
└─────────┘ └─────────┘
     │           │
     └─────┬─────┘
           ▼
┌─────────────────┐
│ Visual Update   │
│ (Both show same │
│  background)    │
└─────────────────┘
```

## Performance Considerations

### Memoization

Background style should be memoized to prevent unnecessary recalculations:

```typescript
const backgroundStyle = useMemo(() => ({
  backgroundImage: `url('${bgUrl}')`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
}), [bgUrl]) // Only recalculate when bgUrl changes
```

### Browser Caching

Once loaded, background images are cached by the browser:
- First load: Full download time
- Subsequent loads: Near-instant from cache
- Both preview modes benefit from shared cache

### Update Latency

Target: 100ms for images up to 5MB

Factors affecting latency:
- Network speed
- Image size and format
- Browser processing time
- React re-render time

## Security Considerations

### XSS Prevention

URL values are used in CSS `backgroundImage` property. Modern browsers prevent script injection in CSS, but validate URLs when possible.

### CORS Handling

External images must have proper CORS headers to display correctly. Handle CORS errors gracefully:

```typescript
const handleMediaError = useCallback(() => {
  setHasError(true)
  setErrorMessage(t('failedToLoadBg'))
}, [])
```

## References

- Store Implementation: [`lib/stores/useContentStore.ts`](../../lib/stores/useContentStore.ts)
- Working Component: [`components/teleprompter/editor/PreviewPanel.tsx`](../../components/teleprompter/editor/PreviewPanel.tsx)
- Component to Fix: [`components/teleprompter/editor/FullPreviewDialog.tsx`](../../components/teleprompter/editor/FullPreviewDialog.tsx)
- Feature Spec: [`spec.md`](spec.md)
