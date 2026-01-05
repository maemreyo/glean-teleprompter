# Standalone Story JSON Format

This document describes the JSON format for creating standalone story viewers with teleprompter functionality.

## Story Structure

A story is a JSON object with the following structure:

```json
{
  "id": "unique-story-id",
  "slides": [
    {
      "id": "slide-1",
      "type": "teleprompter|text-highlight|widget-chart|image|poll",
      "content": "Slide content",
      "data": { /* type-specific data */ },
      "duration": 5000,
      "animation": {
        "type": "slide-in|fade|zoom",
        "duration": 300
      }
    }
  ],
  "autoAdvance": true,
  "showProgress": true
}
```

## Field Descriptions

### Story Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique identifier for the story |
| `slides` | array | Yes | Array of slide objects (minimum 1 slide) |
| `autoAdvance` | boolean | No | Whether slides auto-advance (default: true) |
| `showProgress` | boolean | No | Whether to show progress bars (default: true) |

### Slide Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique identifier for this slide |
| `type` | string | Yes | Slide type: `teleprompter`, `text-highlight`, `widget-chart`, `image`, or `poll` |
| `content` | string | Conditional | Text content for text-based slides |
| `data` | object | Conditional | Type-specific data object |
| `duration` | number/string | No | Duration in milliseconds, or `"manual"` for no auto-advance |
| `animation` | object | No | Animation settings for slide transitions |

## Slide Types

### Teleprompter Slide

Used for auto-scrolling teleprompter text.

```json
{
  "id": "slide-1",
  "type": "teleprompter",
  "content": "Long text content that will auto-scroll...",
  "duration": "manual"
}
```

**Required Fields:**
- `type`: "teleprompter"
- `content`: The text content to display

**Optional Fields:**
- `duration`: Should be `"manual"` for teleprompter slides (auto-scrolling is controlled by user)

### Text Highlight Slide

Displays highlighted text with emphasis.

```json
{
  "id": "slide-2",
  "type": "text-highlight",
  "content": "Important text to highlight",
  "data": {
    "highlights": ["important", "emphasized"]
  },
  "duration": 5000
}
```

**Required Fields:**
- `type`: "text-highlight"
- `content`: The text content

**Optional Fields:**
- `data.highlights`: Array of text phrases to highlight
- `duration`: Duration in milliseconds (default: 5000)

### Widget Chart Slide

Displays interactive charts (bar, pie, line, doughnut).

```json
{
  "id": "slide-3",
  "type": "widget-chart",
  "data": {
    "type": "bar|pie|line|doughnut",
    "title": "Chart Title",
    "labels": ["A", "B", "C"],
    "values": [10, 20, 30],
    "colors": ["#3b82f6", "#10b981", "#f59e0b"]
  },
  "duration": 8000
}
```

**Required Fields:**
- `type`: "widget-chart"
- `data.type`: Chart type
- `data.labels`: Array of label strings
- `data.values`: Array of numeric values

**Optional Fields:**
- `data.title`: Chart title
- `data.colors`: Custom color array (defaults provided)
- `duration`: Duration in milliseconds (default: 5000)

### Image Slide

Displays images.

```json
{
  "id": "slide-4",
  "type": "image",
  "data": {
    "url": "https://example.com/image.jpg",
    "alt": "Image description",
    "fit": "cover|contain|fill"
  },
  "duration": 6000
}
```

**Required Fields:**
- `type`: "image"
- `data.url`: Image URL

**Optional Fields:**
- `data.alt`: Alt text for accessibility
- `data.fit`: Image fit mode (default: "cover")
- `duration`: Duration in milliseconds (default: 5000)

### Poll Slide

Displays interactive polls.

```json
{
  "id": "slide-5",
  "type": "poll",
  "data": {
    "question": "What is your favorite color?",
    "options": ["Red", "Blue", "Green", "Yellow"]
  },
  "duration": "manual"
}
```

**Required Fields:**
- `type`: "poll"
- `data.question`: Poll question
- `data.options`: Array of answer options

**Optional Fields:**
- `duration`: Duration in milliseconds (default: "manual")

## URL Encoding

Stories are shared by encoding the JSON as URL-safe base64:

1. Create your story JSON object
2. Encode: `btoa(encodeURIComponent(JSON.stringify(story)))`
3. Navigate to: `/story/[encoded-string]`

### Example

```javascript
const story = {
  id: "my-story",
  slides: [
    {
      id: "slide-1",
      type: "text-highlight",
      content: "Welcome to my story!",
      duration: 3000
    }
  ]
};

const encoded = btoa(encodeURIComponent(JSON.stringify(story)));
window.location.href = `/story/${encoded}`;
```

## Validation

The story viewer validates the JSON on load and will display an error screen if:
- JSON is malformed
- Required fields are missing
- Slide types are invalid
- Data structures don't match expected format

## Size Limits

- Maximum URL length: Browser-dependent (typically 2048+ characters for modern browsers)
- Recommended: Keep stories under 50 slides for optimal performance
- For long teleprompter content: Use virtual scrolling automatically activates at 50+ paragraphs

## Best Practices

1. **Test your story**: Always preview before sharing
2. **Keep it simple**: Fewer slides with clear content work better
3. **Duration**: Use appropriate durations (3000-8000ms) for time-based slides
4. **Teleprompter**: Use "manual" duration and let users control scroll speed
5. **Accessibility**: Provide alt text for images and clear content descriptions
