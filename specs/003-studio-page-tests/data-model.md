# Data Model: Studio Page Testing

**Feature**: Studio Page Core Module Testing  
**Date**: 2025-12-31  
**Status**: Complete

## Overview

This document defines test fixtures, mock data structures, and state representations for testing the Studio page ([`app/studio/page.tsx`](../../app/studio/page.tsx)).

---

## Test Fixture Categories

### 1. Template Fixtures

Mock template data for testing template loading functionality.

```typescript
interface TemplateFixture {
  id: string;
  name: string;
  content: string;
  settings: {
    font: 'Classic' | 'Modern' | 'Typewriter' | 'Novel' | 'Neon';
    colorIndex: number;
    speed: number;
    fontSize: number;
    align: 'left' | 'center';
    lineHeight: number;
    margin: number;
    overlayOpacity: number;
  };
}
```

**Standard Templates**:

```typescript
// Valid template with all settings
const validTemplate: TemplateFixture = {
  id: 'classic-news',
  name: 'Classic News Broadcast',
  content: 'Welcome to the evening news. Tonight we cover...',
  settings: {
    font: 'Classic',
    colorIndex: 0,
    speed: 3,
    fontSize: 48,
    align: 'center',
    lineHeight: 1.5,
    margin: 0,
    overlayOpacity: 0.5
  }
};

// Template with minimal settings
const minimalTemplate: TemplateFixture = {
  id: 'minimal',
  name: 'Minimal Template',
  content: 'Simple content',
  settings: {
    font: 'Modern',
    colorIndex: 0
    // Missing optional settings should use defaults
  }
};

// Template with null/undefined values (edge case)
const edgeCaseTemplate: TemplateFixture = {
  id: 'edge-case',
  name: 'Edge Case Template',
  content: 'Test content',
  settings: {
    font: 'Neon',
    colorIndex: null,
    speed: undefined,
    fontSize: 48,
    align: 'center',
    lineHeight: 1.5,
    margin: 0,
    overlayOpacity: 0.5
  }
};
```

---

### 2. Saved Script Fixtures

Mock saved script data for testing script loading functionality.

```typescript
interface SavedScriptFixture {
  id: string;
  content: string;
  bg_url: string;
  music_url: string;
  config?: Record<string, unknown>; // Full config snapshot
  settings?: { // Legacy format
    font: string;
    colorIndex: number;
    speed: number;
    fontSize: number;
    align: string;
    lineHeight: number;
    margin: number;
    overlayOpacity: number;
  };
}
```

**Script Variants**:

```typescript
// Script with modern config format
const scriptWithConfig: SavedScriptFixture = {
  id: 'script-001',
  content: 'This is a saved script with config',
  bg_url: 'https://example.com/bg.jpg',
  music_url: 'https://example.com/music.mp3',
  config: {
    typography: {
      fontFamily: 'Classic',
      fontSize: 48,
      lineHeight: 1.5,
      align: 'center'
    },
    colors: {
      colorIndex: 0
    },
    effects: {
      shadow: { enabled: false },
      glow: { enabled: true, color: '#00ffff' }
    }
  }
};

// Script with legacy settings format
const scriptWithLegacySettings: SavedScriptFixture = {
  id: 'script-002',
  content: 'This is a saved script with legacy settings',
  bg_url: 'https://example.com/bg.jpg',
  music_url: '',
  settings: {
    font: 'Modern',
    colorIndex: 2,
    speed: 4,
    fontSize: 52,
    align: 'left',
    lineHeight: 1.6,
    margin: 10,
    overlayOpacity: 0.6
  }
};

// Script with neither config nor settings
const scriptWithoutConfig: SavedScriptFixture = {
  id: 'script-003',
  content: 'Basic script without any styling',
  bg_url: '',
  music_url: ''
};

// Script with invalid values (edge case)
const scriptWithInvalidValues: SavedScriptFixture = {
  id: 'script-004',
  content: 'Script with invalid values',
  bg_url: '',
  music_url: '',
  settings: {
    font: 'Classic',
    colorIndex: -1, // Invalid
    speed: 0,
    fontSize: -48, // Invalid
    align: 'center',
    lineHeight: 0, // Invalid
    margin: 0,
    overlayOpacity: 2 // Invalid (>1)
  }
};
```

---

### 3. Local Draft Fixtures

Mock localStorage draft data for testing draft persistence.

```typescript
interface LocalDraftFixture {
  text: string;
  bgUrl: string;
  musicUrl: string;
  font: string;
  colorIndex: number;
  speed: number;
  fontSize: number;
  align: string;
  lineHeight: number;
  margin: number;
  overlayOpacity: number;
}
```

**Draft Variants**:

```typescript
// Valid draft
const validDraft: LocalDraftFixture = {
  text: 'My saved draft content',
  bgUrl: 'https://example.com/bg.jpg',
  musicUrl: 'https://example.com/music.mp3',
  font: 'Typewriter',
  colorIndex: 1,
  speed: 2,
  fontSize: 44,
  align: 'center',
  lineHeight: 1.4,
  margin: 5,
  overlayOpacity: 0.4
};

// Minimal draft
const minimalDraft: LocalDraftFixture = {
  text: '',
  bgUrl: '',
  musicUrl: '',
  font: 'Classic',
  colorIndex: 0,
  speed: 2,
  fontSize: 48,
  align: 'center',
  lineHeight: 1.5,
  margin: 0,
  overlayOpacity: 0.5
};

// Draft with extra properties (schema evolution)
const draftWithExtraProps: LocalDraftFixture = {
  text: 'Content',
  bgUrl: '',
  musicUrl: '',
  font: 'Novel',
  colorIndex: 3,
  speed: 3,
  fontSize: 50,
  align: 'left',
  lineHeight: 1.5,
  margin: 0,
  overlayOpacity: 0.5,
  // Extra properties that don't exist in current schema
  newProperty: 'should be ignored',
  anotherNewProp: 123
} as unknown as LocalDraftFixture;
```

---

### 4. Store State Fixtures

Mock store states for testing store integration.

```typescript
interface TeleprompterStoreState {
  text: string;
  bgUrl: string;
  musicUrl: string;
  font: string;
  colorIndex: number;
  speed: number;
  fontSize: number;
  align: string;
  lineHeight: number;
  margin: number;
  overlayOpacity: number;
  mode: 'setup' | 'run';
  isReadOnly: boolean;
}
```

**Store States**:

```typescript
// Default/initial state
const defaultStoreState: TeleprompterStoreState = {
  text: '',
  bgUrl: '',
  musicUrl: '',
  font: 'Classic',
  colorIndex: 0,
  speed: 2,
  fontSize: 48,
  align: 'center',
  lineHeight: 1.5,
  margin: 0,
  overlayOpacity: 0.5,
  mode: 'setup',
  isReadOnly: false
};

// Setup mode (editable)
const setupModeState: TeleprompterStoreState = {
  ...defaultStoreState,
  text: 'Editable content',
  mode: 'setup',
  isReadOnly: false
};

// Run mode (playing)
const runModeState: TeleprompterStoreState = {
  ...defaultStoreState,
  text: 'Playing content',
  mode: 'run',
  isReadOnly: false
};

// Read-only state
const readOnlyState: TeleprompterStoreState = {
  ...defaultStoreState,
  text: 'Read-only content',
  mode: 'setup',
  isReadOnly: true
};
```

---

### 5. URL Parameter Fixtures

Mock URL search parameters for testing parameter-based loading.

```typescript
interface URLParamsFixture {
  template?: string;
  script?: string;
}
```

**Parameter Combinations**:

```typescript
// No parameters (fresh start)
const noParams: URLParamsFixture = {};

// Template only
const templateParams: URLParamsFixture = {
  template: 'classic-news'
};

// Script only
const scriptParams: URLParamsFixture = {
  script: 'script-001'
};

// Both parameters (template should take priority)
const bothParams: URLParamsFixture = {
  template: 'classic-news',
  script: 'script-001'
};

// Invalid template
const invalidTemplateParams: URLParamsFixture = {
  template: 'non-existent-template'
};

// Invalid script
const invalidScriptParams: URLParamsFixture = {
  script: 'non-existent-script'
};
```

---

### 6. Toast Notification Fixtures

Expected toast notification data for verification.

```typescript
interface ToastFixture {
  type: 'success' | 'error';
  message: string;
}
```

**Expected Toasts**:

```typescript
// Template loaded successfully
const templateSuccessToast: ToastFixture = {
  type: 'success',
  message: 'Loaded template: Classic News Broadcast'
};

// Script with config loaded
const scriptWithConfigToast: ToastFixture = {
  type: 'success',
  message: 'Loaded script with custom styling'
};

// Script with legacy settings loaded
const scriptLegacyToast: ToastFixture = {
  type: 'success',
  message: 'Loaded script'
};

// Script load failed
const scriptErrorToast: ToastFixture = {
  type: 'error',
  message: expect.stringContaining('Failed to load script')
};
```

---

## Test Data Organization

### Directory Structure

```text
__tests__/
├── fixtures/
│   ├── templates.ts          # Template fixtures
│   ├── scripts.ts            # Saved script fixtures
│   ├── drafts.ts             # Local draft fixtures
│   ├── store-states.ts       # Store state fixtures
│   └── url-params.ts         # URL parameter fixtures
└── utils/
    ├── fixture-factory.ts    # Factory functions for creating custom fixtures
    └── data-helpers.ts       # Helper functions for test data manipulation
```

### Fixture Factory Pattern

```typescript
// factory function for creating custom templates
const createTemplate = (overrides: Partial<TemplateFixture>): TemplateFixture => ({
  id: 'default-template',
  name: 'Default Template',
  content: 'Default content',
  settings: {
    font: 'Classic',
    colorIndex: 0,
    speed: 2,
    fontSize: 48,
    align: 'center',
    lineHeight: 1.5,
    margin: 0,
    overlayOpacity: 0.5
  },
  ...overrides
});

// Usage in tests
const customTemplate = createTemplate({
  id: 'custom',
  name: 'Custom Template',
  settings: { ...createTemplate().settings, speed: 5 }
});
```

---

## Data Validation Rules

### Template Validation

- `id`: Required, non-empty string
- `name`: Required, non-empty string
- `content`: Required (can be empty string)
- `settings.font`: Required, one of: 'Classic', 'Modern', 'Typewriter', 'Novel', 'Neon'
- `settings.colorIndex`: Optional, defaults to 0
- `settings.speed`: Optional, defaults to 2
- `settings.fontSize`: Optional, defaults to 48
- `settings.align`: Optional, defaults to 'center', one of: 'left', 'center'
- `settings.lineHeight`: Optional, defaults to 1.5
- `settings.margin`: Optional, defaults to 0
- `settings.overlayOpacity`: Optional, defaults to 0.5

### Script Validation

- `id`: Required, non-empty string
- `content`: Required (can be empty string)
- `bg_url`: Required (can be empty string)
- `music_url`: Required (can be empty string)
- `config`: Optional, if present takes precedence over `settings`
- `settings`: Optional, legacy format

### Draft Validation

- All properties optional with sensible defaults
- Extra properties should be ignored (schema evolution)
- Invalid JSON should be handled gracefully

---

## Summary

This data model provides comprehensive test fixtures covering:

1. **6 template variants** (valid, minimal, edge case)
2. **4 script variants** (with config, legacy, without config, invalid values)
3. **4 draft variants** (valid, minimal, with extra props, corrupted)
4. **4 store states** (default, setup mode, run mode, read-only)
5. **6 URL parameter combinations**
6. **4 toast notification types**

All fixtures align with the functional requirements and success criteria defined in the specification.
