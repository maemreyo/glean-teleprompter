# URL Generation Guide

This guide explains how to generate shareable URLs for standalone story viewers.

## Overview

Stories are shared by encoding the story JSON as a URL parameter. The story viewer decodes and displays the content without requiring any server-side processing or authentication.

## Encoding Process

### Step 1: Create Story JSON

```javascript
const story = {
  id: "my-story",
  slides: [
    {
      id: "slide-1",
      type: "teleprompter",
      "content": "This is my teleprompter script...",
      "duration": "manual"
    }
  ]
};
```

### Step 2: Encode to URL-Safe Format

```javascript
// Convert to JSON string
const jsonString = JSON.stringify(story);

// Encode URI component
const encoded = encodeURIComponent(jsonString);

// Convert to base64
const base64Encoded = btoa(encoded);

// Create URL
const shareUrl = `${window.location.origin}/story/${base64Encoded}`;
```

### Helper Function

```javascript
function generateStoryUrl(story) {
  const json = JSON.stringify(story);
  const encoded = btoa(encodeURIComponent(json));
  return `/story/${encoded}`;
}

// Usage
const url = generateStoryUrl(story);
console.log(`Share this URL: ${window.location.origin}${url}`);
```

## URL Format

The final URL structure is:

```
https://yourdomain.com/story/[base64-encoded-json]
```

### Example URLs

**Simple text-highlight story:**
```
https://yourdomain.com/story/eyJpIjoiaWQiOiJzaG9ydC0xIiwidHlwZSI6InRleHhtaWdobGlnaHQiLCJjb250ZW50IjoiV2VsY29tZSB0byBteSBzdG9yeSE8ifQ==
```

**Teleprompter with long content:**
```
https://yourdomain.com/story/eyJpIjoiaWQiOiJ0ZWxlcHJvbXB0ZXItMSIsInR5cGUiOiJ0ZWxlcHJvbXB0ZXIiLCJjb250ZW50IjoiTG9uZyB0ZXh0IGNvbnRlbnQgdGhhdCB3aWxsIGF1dG8tc2Nyb2xsLi4uIiwiZHVyYXRpb24iOiJtYW51YWwifQ==
```

## Browser URL Limits

Different browsers have different URL length limits:

| Browser | Max Length | Practical Limit |
|---------|-------------|-----------------|
| Chrome | 2MB+ | 2,000,000+ chars |
| Firefox | Unlimited | 2,000,000+ chars practical |
| Safari | 2MB+ | 2,000,000+ chars |
| Edge | 2MB+ | 2,000,000+ chars |

**Note:** For stories with very long content (10,000+ words), consider:
- Splitting into multiple shorter stories
- Using server-side storage with short ID lookup (future feature)

## URL Shortening

For long URLs, you can use URL shortening services:

1. Bitly
2. TinyURL
3. Your own redirect service

Example:
```javascript
const shortUrl = await shortenUrl(shareUrl);
```

## Testing URLs

Before sharing, always:

1. **Test in browser**: Open the URL to verify it works
2. **Test on mobile**: Verify responsive behavior
3. **Test teleprompter**: If applicable, test scrolling and controls
4. **Test all slide types**: Ensure all slides display correctly

## Troubleshooting

### URL doesn't work

**Error: "Invalid story data"**

Check:
- JSON is valid (use JSON validator)
- All required fields are present
- Slide types are recognized
- Encoding was done correctly

### Content not displaying

Check:
- Browser console for errors
- Network tab for failed loads
- JSON structure matches expected format
- No syntax errors in story data

### URL is too long

Solutions:
1. Reduce content length
2. Split into multiple stories
3. Use compression (future feature)

## Security Considerations

- **No authentication**: Anyone with the URL can view the story
- **No encryption**: URLs can be decoded (URL-safe, but not encrypted)
- **Public access**: Treat story URLs as public information
- **Privacy**: Don't include sensitive information in stories

## Best Practices

1. **Keep URLs shareable**: Use reasonable content sizes
2. **Test thoroughly**: Always verify before sharing
3. **Document your stories**: Keep a copy of source JSON
4. **Version control**: Add version info to story IDs
5. **Monitor length**: Check URL length before generating
