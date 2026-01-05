# Quickstart Guide: Standalone Story with Teleprompter

**Feature**: 012-standalone-story
**Last Updated**: 2026-01-05
**Target Audience**: Developers implementing this feature

---

## Overview

This guide helps developers quickly get started with implementing the standalone story feature. It covers setup, story JSON format, testing procedures, and common workflows.

---

## Prerequisites

### Required Dependencies

```bash
# Core dependencies (already in project)
npm install zustand framer-motion clsx tailwind-merge

# New dependencies for this feature
npm install js-base64 pako ajv
npm install --save-dev @types/nosleep.js
```

### External Library

**NoSleep.js** is loaded from CDN (not bundled):
- URL: `https://cdn.jsdelivr.net/npm/nosleep.js@0.12.0/dist/NoSleep.min.js`
- Loaded dynamically when Wake Lock API is not supported
- TypeScript declarations included in `types/nosleep.d.ts`

---

## Development Setup

### 1. Local Development

```bash
# Start development server
npm run dev

# Access story viewer
# http://localhost:3000/story/{encoded-story-data}
```

### 2. Story Viewer Route

The story viewer is accessible at:
```
/story/[storyId]
```

Where `[storyId]` is Base64-encoded, gzip-compressed story JSON.

---

## Story JSON Format

### Minimal Example

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "My First Story",
  "version": "1.0",
  "autoAdvance": true,
  "showProgress": true,
  "slides": [
    {
      "id": "slide-001",
      "type": "text-highlight",
      "content": "Welcome to our story!",
      "duration": 5000
    },
    {
      "id": "slide-002",
      "type": "teleprompter",
      "content": "This is a long script that will auto-scroll...",
      "duration": "manual"
    }
  ]
}
```

### Complete Example with All Slide Types

```json
{
  "id": "story-123",
  "title": "Product Launch Announcement",
  "version": "1.0",
  "autoAdvance": true,
  "showProgress": true,
  "slides": [
    {
      "id": "slide-1",
      "type": "text-highlight",
      "content": "Introducing our new product",
      "duration": 3000,
      "highlights": [
        {
          "startIndex": 11,
          "endIndex": 27,
          "color": "#FFD700",
          "fontWeight": "bold"
        }
      ],
      "animation": {
        "type": "slide-in",
        "direction": "left",
        "duration": 300
      }
    },
    {
      "id": "slide-2",
      "type": "widget-chart",
      "duration": 5000,
      "data": {
        "type": "bar",
        "title": "Q4 Sales Growth",
        "labels": ["Q1", "Q2", "Q3", "Q4"],
        "values": [120, 150, 180, 200],
        "colors": ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"]
      }
    },
    {
      "id": "slide-3",
      "type": "image",
      "content": "https://example.com/product-image.jpg",
      "alt": "Product photo",
      "duration": 4000
    },
    {
      "id": "slide-4",
      "type": "poll",
      "question": "Which feature interests you most?",
      "duration": 10000,
      "options": [
        { "id": "opt-1", "text": "Teleprompter" },
        { "id": "opt-2", "text": "Music Player" },
        { "id": "opt-3", "text": "Camera Widget" }
      ]
    },
    {
      "id": "slide-5",
      "type": "teleprompter",
      "content": "Welcome everyone! Today we're excited to announce our latest product. This innovative solution combines the best features of modern teleprompter technology with an intuitive user interface.\n\nLet me walk you through the key features...",
      "duration": "manual",
      "animation": {
        "type": "fade",
        "duration": 200
      }
    }
  ]
}
```

---

## Generating Story URLs

### Method 1: Using URL Generator Utility

```typescript
// lib/story/utils/urlGenerator.ts
import { encode } from 'js-base64';
import pako from 'pako';
import type { StoryScript } from './types';

export const generateStoryUrl = (story: StoryScript): string => {
  const json = JSON.stringify(story);
  const compressed = pako.gzip(json);
  const encoded = encode(compressed);
  
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/story/${encoded}`;
  }
  
  return `/story/${encoded}`;
};

// Usage
const storyUrl = generateStoryUrl(myStory);
console.log(storyUrl);
// Output: https://mysite.com/story/H4sIAAAAAAAAE...
```

### Method 2: Manual Encoding (for testing)

```bash
# Create story JSON file
cat > story.json << 'EOF'
{
  "id": "test-story",
  "title": "Test",
  "version": "1.0",
  "slides": [...]
}
EOF

# Encode using Node.js
node -e "
const fs = require('fs');
const pako = require('pako');
const { encode } = require('js-base64');

const story = JSON.parse(fs.readFileSync('story.json', 'utf8'));
const compressed = pako.gzip(JSON.stringify(story));
const encoded = encode(compressed);
console.log('/story/' + encoded);
"
```

---

## Testing Different Slide Types

### 1. Text Highlight Slide

```json
{
  "id": "slide-1",
  "type": "text-highlight",
  "content": "Key message with important highlights",
  "duration": 5000,
  "highlights": [
    { "startIndex": 0, "endIndex": 4, "color": "#FF0000" },
    { "startIndex": 20, "endIndex": 36, "color": "#00FF00" }
  ]
}
```

**Expected Behavior**:
- Displays text with highlighted ranges
- Progress bar animates from 0% to 100% over 5 seconds
- Tap right side advances to next slide

### 2. Widget Chart Slide

```json
{
  "id": "slide-2",
  "type": "widget-chart",
  "duration": 5000,
  "data": {
    "type": "bar",
    "title": "Monthly Revenue",
    "labels": ["Jan", "Feb", "Mar"],
    "values": [10000, 15000, 20000]
  }
}
```

**Expected Behavior**:
- Renders bar chart with data
- Chart is responsive to screen size
- Tap zones work for navigation

### 3. Image Slide

```json
{
  "id": "slide-3",
  "type": "image",
  "content": "https://picsum.photos/800/1200",
  "alt": "Random image",
  "duration": 4000
}
```

**Expected Behavior**:
- Displays image in 9:16 aspect ratio
- Image covers slide area (object-fit: cover)
- Alt text available for screen readers

### 4. Poll Slide

```json
{
  "id": "slide-4",
  "type": "poll",
  "question": "What's your favorite color?",
  "duration": 10000,
  "options": [
    { "id": "1", "text": "Blue" },
    { "id": "2", "text": "Red" },
    { "id": "3", "text": "Green" }
  ]
}
```

**Expected Behavior**:
- Displays poll question and options
- Users can select an option (interactive)
- Visual feedback on selection

### 5. Teleprompter Slide

```json
{
  "id": "slide-5",
  "type": "teleprompter",
  "content": "Long text content that will auto-scroll...\n\nParagraph 2...\n\nParagraph 3...",
  "duration": "manual"
}
```

**Expected Behavior**:
- Displays scrollable text with focal point indicator
- Tap zones disabled (use control panel)
- Control panel appears on tap
- Speed slider, font controls, mirror toggle available
- Progress bar syncs to scroll depth (not time)

---

## Teleprompter Testing Procedures

### 1. Basic Scrolling Test

**Steps**:
1. Create a teleprompter slide with 1000+ words
2. Open story in browser
3. Tap "Start Reading" button
4. Observe smooth scrolling at default speed (1.5)

**Expected Results**:
- Text scrolls from bottom to top
- Yellow focal indicator visible at 33% from top
- Progress bar updates based on scroll depth
- Scrolling maintains 30fps+ (check with DevTools Performance tab)

### 2. Wake Lock Test

**Steps**:
1. Start teleprompter scrolling
2. Wait 2 minutes without touching device
3. Verify screen remains awake

**Expected Results**:
- Screen does not sleep
- Wake lock indicator (if visible) shows active
- On Chrome/Edge: Wake Lock API active
- On Safari: NoSleep.js fallback active

**Test Failure Mode**:
- If wake lock fails, show error: "Screen wake lock not available - please try a different browser or check your network connection"
- Teleprompter mode is blocked

### 3. Speed Adjustment Test

**Steps**:
1. Start scrolling at speed 1.5
2. Move speed slider to 3.0
3. Observe immediate speed increase
4. Move slider to 0.5
5. Observe immediate speed decrease

**Expected Results**:
- Speed changes take effect immediately
- No interruption to scrolling
- WPM display updates (speed × 150)

### 4. Font Size Test

**Steps**:
1. Start scrolling
2. Increase font size from 28px to 36px
3. Verify scroll position maintained at same percentage
4. Decrease font size back to 28px
5. Verify position still maintained

**Expected Results**:
- Scroll ratio preserved (e.g., 50% stays at 50%)
- No layout shift or jump
- Text remains readable

### 5. Mirror Mode Test

**Steps**:
1. Enable mirror mode toggle
2. View content through teleprompter glass (if available)
3. Verify text appears correctly mirrored

**Expected Results**:
- Content displays horizontally flipped (scaleX(-1))
- Text appears normal when viewed through mirror/glass
- Mirror mode has no effect on non-teleprompter slides

---

## Common Workflows

### Creating a New Story

```typescript
// 1. Define story data
const newStory: StoryScript = {
  id: crypto.randomUUID(),
  title: "My Story",
  version: "1.0",
  autoAdvance: true,
  showProgress: true,
  slides: [
    // Add slides here
  ]
};

// 2. Validate story
import { validateStorySchema } from './lib/story/validation';
const validatedStory = validateStorySchema(newStory);

// 3. Generate URL
const url = generateStoryUrl(validatedStory);

// 4. Share URL
console.log('Story URL:', url);
```

### Testing Wake Lock Functionality

```typescript
// 1. Test Wake Lock API
if ('wakeLock' in navigator) {
  const wakeLock = await navigator.wakeLock.request('screen');
  console.log('Wake Lock active:', wakeLock.active);
}

// 2. Test NoSleep.js fallback
import NoSleep from 'nosleep.js';
const noSleep = new NoSleep();
await noSleep.enable();
console.log('NoSleep.js active');

// 3. Test visibility handling
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    // Re-request wake lock
  }
});
```

### Debugging Teleprompter Scrolling

```typescript
// Enable debug logging
const DEBUG = true;

if (DEBUG) {
  setInterval(() => {
    console.log({
      scrollPosition: teleprompterState.scrollPosition,
      scrollDepth: teleprompterState.scrollDepth,
      scrollSpeed: teleprompterState.scrollSpeed,
      fps: calculateFPS()
    });
  }, 1000);
}

// Check RAF loop
let frameCount = 0;
const checkFPS = () => {
  frameCount++;
  requestAnimationFrame(checkFPS);
  
  if (frameCount % 60 === 0) {
    console.log('60 frames rendered');
  }
};
```

---

## Troubleshooting

### Issue: Story URL is too long

**Symptoms**: URL truncated, story fails to load

**Solutions**:
1. Compress story data more aggressively
2. Reduce number of slides
3. Use shorter text content
4. Consider server-side storage for large stories

**Check URL Length**:
```javascript
const url = generateStoryUrl(story);
console.log('URL length:', url.length);
console.log('Max safe:', 2000); // Safari limit
```

### Issue: Wake Lock not working

**Symptoms**: Screen sleeps during teleprompter use

**Diagnosis**:
```typescript
// Check Wake Lock API support
console.log('Wake Lock supported:', 'wakeLock' in navigator);

// Check NoSleep.js loaded
console.log('NoSleep.js available:', typeof window.NoSleep !== 'undefined');

// Check current wake lock state
console.log('Wake Lock active:', wakeLock?.active);
```

**Solutions**:
1. Use Chrome/Edge on desktop (best Wake Lock support)
2. On Safari, ensure NoSleep.js CDN loads successfully
3. Check browser console for NoSleep.js loading errors
4. Verify device is not in low battery mode

### Issue: Teleprompter scrolling is janky

**Symptoms**: Scrolling not smooth, FPS drops below 30

**Diagnosis**:
```typescript
// Measure FPS
let lastTime = performance.now();
let frames = 0;

const measureFPS = () => {
  frames++;
  const now = performance.now();
  
  if (now >= lastTime + 1000) {
    console.log('FPS:', frames);
    frames = 0;
    lastTime = now;
  }
  
  requestAnimationFrame(measureFPS);
};

measureFPS();
```

**Solutions**:
1. Enable GPU acceleration: `transform: translateZ(0)`
2. Use virtual scrolling for long content (50+ paragraphs)
3. Disable text selection: `user-select: none`
4. Throttle progress updates to 100ms
5. Use React.memo for heavy components

### Issue: Progress bar not accurate

**Symptoms**: Progress bar doesn't match scroll position

**Diagnosis**:
```typescript
// Check scroll calculation
const scrollDepth = scrollPosition / totalScrollHeight;
console.log('Scroll depth:', scrollDepth);

// Verify progress sync
onProgress(scrollDepth);
```

**Solutions**:
1. Ensure progress updates throttled to 100ms max
2. Use scroll depth (not time) for teleprompter slides
3. Recalculate total scroll height after font changes
4. Handle orientation changes gracefully

### Issue: Safe areas not working

**Symptoms**: Content obscured by notch/home indicator

**Diagnosis**:
```css
/* Check env() support */
.test {
  padding-top: env(safe-area-inset-top);
}

/* Check computed value */
const paddingTop = getComputedStyle(element).paddingTop;
console.log('Safe area top:', paddingTop);
```

**Solutions**:
1. Use `env(safe-area-inset-*)` in CSS
2. Add JavaScript fallback for older browsers
3. Test on real device with notch (iPhone 14 Pro)
4. Adjust focal point from 33vh to 38vh with safe area

---

## Performance Benchmarks

### Target Metrics

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Slide transition delay | <100ms | Performance API timing |
| Scrolling FPS | 30fps+ | DevTools Performance tab |
| Battery drain | <20% vs video | Measure over 30min session |
| DOM nodes (virtual) | 90% reduction | Count nodes with DevTools |
| Progress update rate | 100ms max | Throttle implementation check |
| Control panel appearance | <100ms | Performance timing |

### Measuring FPS

```typescript
// FPS counter
let frameCount = 0;
let lastTime = performance.now();

const updateFPS = () => {
  frameCount++;
  const now = performance.now();
  
  if (now >= lastTime + 1000) {
    const fps = frameCount;
    console.log('FPS:', fps);
    
    if (fps < 30) {
      console.warn('FPS below target!');
    }
    
    frameCount = 0;
    lastTime = now;
  }
  
  requestAnimationFrame(updateFPS);
};
```

### Measuring Battery

```typescript
// Battery API (Chrome only)
if ('getBattery' in navigator) {
  const battery = await navigator.getBattery();
  
  const startLevel = battery.level;
  
  // Run 30min session...
  
  const endLevel = battery.level;
  const drain = startLevel - endLevel;
  
  console.log('Battery drain:', drain * 100, '%');
}
```

---

## Accessibility Testing

### Keyboard Shortcuts

| Key | Action | Expected Behavior |
|-----|--------|-------------------|
| Space | Toggle play/pause | Scrolling starts/stops |
| Arrow Up | Increase speed | Speed +0.2 |
| Arrow Down | Decrease speed | Speed -0.2 |
| r | Reset to top | Scroll position = 0 |

### Screen Reader Testing

**VoiceOver (macOS/iOS)**:
1. Enable VoiceOver (Cmd+F5)
2. Navigate to story viewer
3. Verify announcements:
   - "Teleprompter content, use arrow keys to control speed"
   - "Speed changed to 2.0, 300 words per minute"
   - "Font size changed to 32 pixels"

**NVDA (Windows)**:
1. Enable NVDA (Ctrl+Alt+N)
2. Test same announcements as VoiceOver
3. Verify all interactive elements have labels

### High Contrast Mode

**Windows**:
1. Settings → Ease of Access → High Contrast
2. Enable high contrast theme
3. Verify teleprompter displays white text on black background

**macOS**:
1. System Preferences → Accessibility → Display
2. Increase contrast
3. Verify text remains readable

---

## Deployment Checklist

### Pre-Deployment

- [ ] All 55 functional requirements implemented
- [ ] All 15 success criteria met
- [ ] All 10 edge cases handled
- [ ] Constitution check passed
- [ ] Unit tests passing (Jest)
- [ ] Integration tests passing (RTL)
- [ ] E2E tests passing (Playwright)
- [ ] Accessibility audit passed
- [ ] Performance benchmarks met
- [ ] Browser compatibility verified (Chrome, Safari, Firefox, Edge)

### Deployment Steps

1. **Build Production Bundle**
```bash
npm run build
```

2. **Test Production Build**
```bash
npm run preview
# Test story viewer at http://localhost:3000/story/...
```

3. **Deploy to Vercel**
```bash
vercel --prod
```

4. **Post-Deployment Verification**
   - Test story viewer on mobile devices
   - Test teleprompter wake lock
   - Test all slide types
   - Test keyboard shortcuts
   - Test screen reader compatibility

### Monitoring

**Note**: Per specification, no production monitoring is implemented (no logging, metrics, or analytics).

---

## Quick Reference

### File Locations

| Component | Path |
|-----------|------|
| Story viewer page | `app/story/[storyId]/page.tsx` |
| Story types | `lib/story/types.ts` |
| Validation | `lib/story/validation.ts` |
| Hooks | `lib/story/hooks/` |
| Components | `components/story/` |
| Tests | `__tests__/story/` |

### Key Commands

```bash
# Development
npm run dev

# Testing
npm test                          # Unit tests
npm run test:e2e                 # E2E tests
npm run test:a11y                # Accessibility tests

# Linting
npm run lint
npm run lint:fix

# Building
npm run build
npm run preview
```

### Environment Variables

No environment variables required for this feature (public access, no authentication).

---

## Getting Help

### Documentation

- [Specification](./spec.md) - Full feature specification
- [Data Model](./data-model.md) - Entity definitions
- [Contracts](./contracts/contracts.md) - API contracts
- [Research](./research.md) - Technology decisions

### Troubleshooting

1. Check browser console for errors
2. Verify story JSON schema is valid
3. Test with minimal story example
4. Check network tab for CDN failures
5. Verify localStorage availability

### Common Issues

| Issue | Solution |
|-------|----------|
| URL too long | Compress story data, reduce slides |
| Wake lock fails | Use Chrome/Edge, check NoSleep.js loading |
| Scrolling janky | Enable GPU acceleration, use virtual scrolling |
| Progress inaccurate | Throttle updates, use scroll depth not time |
| Safe areas broken | Test on real device, check env() support |

---

## Next Steps

After completing this quickstart:

1. **Read the full specification**: [`spec.md`](./spec.md)
2. **Review the data model**: [`data-model.md`](./data-model.md)
3. **Study the contracts**: [`contracts/contracts.md`](./contracts/contracts.md)
4. **Check the implementation plan**: [`plan.md`](./plan.md)
5. **Start implementing**: Follow Phase 2-10 tasks in plan.md

---

**Happy coding! 🚀**
