# Quickstart: Fix Preview Inconsistency

**Feature**: 009-fix-preview  
**Date**: 2026-01-02  
**Status**: Complete

## Overview

This guide provides step-by-step instructions for implementing the fix for preview inconsistency between [`PreviewPanel`](../../components/teleprompter/editor/PreviewPanel.tsx) and [`FullPreviewDialog`](../../components/teleprompter/editor/FullPreviewDialog.tsx).

## Problem Summary

The [`FullPreviewDialog`](../../components/teleprompter/editor/FullPreviewDialog.tsx) component doesn't display background images because it doesn't access `bgUrl` from [`useContentStore`](../../lib/stores/useContentStore.ts). The fix is straightforward: make `FullPreviewDialog` use the same state source as `PreviewPanel`.

## Prerequisites

- TypeScript 5.3+ with strict mode
- React 18.2+
- Zustand 4.4+
- Familiarity with the project structure

## Implementation Steps

### Step 1: Locate the Component

Open [`components/teleprompter/editor/FullPreviewDialog.tsx`](../../components/teleprompter/editor/FullPreviewDialog.tsx).

### Step 2: Extract bgUrl from Content Store

Find the current store subscription (around line 31):

```typescript
const { text } = useContentStore()
```

**Change to:**

```typescript
const { text, bgUrl } = useContentStore()
```

### Step 3: Add useMemo Import

If not already imported, add `useMemo` to the React imports:

```typescript
import { useEffect, useMemo } from 'react'
```

### Step 4: Create Memoized Background Style

Add the background style memoization after the store subscription (around line 32):

```typescript
const { text, bgUrl } = useContentStore()

// Memoized background style
const backgroundStyle = useMemo(() => ({
  backgroundImage: bgUrl ? `url('${bgUrl}')` : undefined,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
}), [bgUrl])
```

### Step 5: Apply Style to Background Div

Find the background image div (around line 50):

```typescript
<div className="absolute inset-0 bg-cover bg-center opacity-70 transition-opacity duration-300" />
```

**Change to:**

```typescript
<div 
  className="absolute inset-0 bg-cover bg-center opacity-70 transition-opacity duration-300"
  style={backgroundStyle}
/>
```

### Complete Code Example

Here's the complete updated component:

```typescript
'use client'

import { useEffect, useMemo } from 'react'
import { Maximize2 } from 'lucide-react'
import { useContentStore } from '@/lib/stores/useContentStore'
import { TeleprompterText } from '@/components/teleprompter/display/TeleprompterText'
import { useTranslations } from 'next-intl'
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog'

interface FullPreviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function FullPreviewDialog({ open, onOpenChange }: FullPreviewDialogProps) {
  const { text, bgUrl } = useContentStore()

  // Memoized background style
  const backgroundStyle = useMemo(() => ({
    backgroundImage: bgUrl ? `url('${bgUrl}')` : undefined,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  }), [bgUrl])

  // Keyboard shortcut: Ctrl/Cmd + \ to toggle dialog
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === '\\') {
        e.preventDefault()
        onOpenChange(!open)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onOpenChange])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-screen h-screen max-w-screen max-h-screen p-0 gap-0 border-0 rounded-none bg-black">
        {/* Background Image Layer */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-70 transition-opacity duration-300"
          style={backgroundStyle}
        />
        
        {/* Overlay Layer - dark tint for readability */}
        <div className="absolute inset-0 bg-black/30" />
        
        {/* Teleprompter Text - Full viewport */}
        <div className="absolute inset-0 flex items-center justify-center p-12 overflow-hidden">
          <TeleprompterText
            text={text}
            className="max-h-full overflow-hidden"
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function FullPreviewDialogTrigger({ onClick }: { onClick: () => void }) {
  const t = useTranslations('FullPreviewDialog')
  return (
    <button
      onClick={onClick}
      className="p-2 bg-black/50 hover:bg-black/70 rounded-lg backdrop-blur-sm transition-all duration-200 text-white hover:text-white/80 flex items-center gap-2 text-sm font-medium"
      aria-label={t('openFullPreview')}
      title={t('openFullPreview')}
    >
      <Maximize2 size={16} />
      <span>{t('title')}</span>
    </button>
  )
}
```

## Testing Instructions

### Manual Testing

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Navigate to the studio page** (usually `/dashboard` or similar)

3. **Test Case 1: Default Background**
   - Open the inline preview panel
   - Click the "Full Preview" button to open `FullPreviewDialog`
   - **Expected**: Both previews show the same default background image

4. **Test Case 2: Custom Background**
   - Upload or select a custom background image
   - **Expected**: Both previews immediately show the new background

5. **Test Case 3: Real-time Update**
   - Keep the `FullPreviewDialog` open
   - Change the background image in settings
   - **Expected**: Dialog updates to show the new background without requiring close/reopen

6. **Test Case 4: Empty Background**
   - Clear or remove the background image
   - **Expected**: Both previews show the same default/empty state

7. **Test Case 5: Invalid URL**
   - Set an invalid background URL (e.g., broken link)
   - **Expected**: Preview still displays teleprompter content (graceful degradation)

### Automated Testing

Create a test file at `__tests__/unit/components/FullPreviewDialog-bgUrl.test.tsx`:

```typescript
import { render, screen } from '@testing-library/react'
import { useContentStore } from '@/lib/stores/useContentStore'
import { FullPreviewDialog } from '@/components/teleprompter/editor/FullPreviewDialog'

// Mock the store
jest.mock('@/lib/stores/useContentStore')

describe('FullPreviewDialog - bgUrl Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should subscribe to bgUrl from useContentStore', () => {
    const mockUseContentStore = useContentStore as jest.MockedFunction<typeof useContentStore>
    mockUseContentStore.mockReturnValue({
      text: 'Test text',
      bgUrl: 'https://example.com/bg.jpg',
      musicUrl: '',
      isReadOnly: false,
    })

    render(<FullPreviewDialog open={true} onOpenChange={jest.fn()} />)

    expect(mockUseContentStore).toHaveBeenCalled()
    // Verify the component rendered with bgUrl
  })

  it('should apply background style when bgUrl is provided', () => {
    const testBgUrl = 'https://example.com/test-bg.jpg'
    const mockUseContentStore = useContentStore as jest.MockedFunction<typeof useContentStore>
    mockUseContentStore.mockReturnValue({
      text: 'Test',
      bgUrl: testBgUrl,
      musicUrl: '',
      isReadOnly: false,
    })

    render(<FullPreviewDialog open={true} onOpenChange={jest.fn()} />)

    const bgDiv = document.querySelector('.absolute.inset-0.bg-cover')
    expect(bgDiv).toHaveStyle({
      backgroundImage: `url('${testBgUrl}')`,
    })
  })

  it('should handle empty bgUrl gracefully', () => {
    const mockUseContentStore = useContentStore as jest.MockedFunction<typeof useContentStore>
    mockUseContentStore.mockReturnValue({
      text: 'Test',
      bgUrl: '',
      musicUrl: '',
      isReadOnly: false,
    })

    render(<FullPreviewDialog open={true} onOpenChange={jest.fn()} />)

    // Should render without error
    const bgDiv = document.querySelector('.absolute.inset-0.bg-cover')
    expect(bgDiv).toBeInTheDocument()
  })
})
```

### Run Tests

```bash
npm test -- FullPreviewDialog-bgUrl
npm run lint
```

## Verification Checklist

- [ ] `bgUrl` is extracted from `useContentStore`
- [ ] `backgroundStyle` is memoized with `useMemo`
- [ ] `backgroundStyle` is applied to the background div
- [ ] Manual testing passes all test cases
- [ ] Automated tests pass
- [ ] Linting passes
- [ ] Type checking passes (`npm run type-check` if available)
- [ ] No console errors in development mode
- [ ] Visual consistency between `PreviewPanel` and `FullPreviewDialog`

## Optional Enhancements

For full feature parity with `PreviewPanel`, consider adding:

### Error Handling

```typescript
const [hasError, setHasError] = useState(false)

const handleMediaError = useCallback(() => {
  setHasError(true)
}, [])

// In the JSX
{hasError && (
  <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-10">
    <div className="text-center text-white p-4">
      <AlertCircle className="w-12 h-12 mx-auto mb-2 text-red-500" />
      <p className="text-sm">Failed to load background image</p>
    </div>
  </div>
)}
```

### Loading State

```typescript
const [isLoading, setIsLoading] = useState(false)

const handleMediaLoad = useCallback(() => {
  setIsLoading(false)
}, [])

// In the JSX
{isLoading && (
  <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-10">
    <Loader2 className="w-8 h-8 text-white animate-spin" />
  </div>
)}
```

## Troubleshooting

### Issue: Background image not showing

**Check:**
1. `bgUrl` has a valid value
2. The URL is accessible (test in browser)
3. CORS headers are set for external images

**Debug:**
```typescript
console.log('bgUrl:', bgUrl)
```

### Issue: Component not updating

**Check:**
1. Component is properly subscribed to `bgUrl`
2. `useMemo` dependency array includes `bgUrl`

### Issue: TypeScript error

**Check:**
1. `useMemo` is imported from React
2. `bgUrl` type matches store definition (`string`)

## Performance Notes

- `useMemo` prevents unnecessary style recalculations
- Background images are cached by browser after first load
- Target update latency: 100ms for images up to 5MB

## Related Files

- Component to modify: [`components/teleprompter/editor/FullPreviewDialog.tsx`](../../components/teleprompter/editor/FullPreviewDialog.tsx)
- Working reference: [`components/teleprompter/editor/PreviewPanel.tsx`](../../components/teleprompter/editor/PreviewPanel.tsx)
- State store: [`lib/stores/useContentStore.ts`](../../lib/stores/useContentStore.ts)
- Feature spec: [`spec.md`](spec.md)
- Research: [`research.md`](research.md)
- Data model: [`data-model.md`](data-model.md)

## Summary

This fix requires minimal code changes:

1. Add `bgUrl` to store subscription
2. Create memoized background style
3. Apply style to background div

The implementation ensures both preview components use the same state source, providing visual consistency and real-time updates.
