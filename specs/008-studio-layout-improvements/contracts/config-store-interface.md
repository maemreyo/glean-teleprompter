# API Contract: ConfigStore Interface

**Feature**: 008-studio-layout-improvements
**File**: `lib/stores/useConfigStore.ts`
**Version**: 1.0.0

## Interface Definition

```typescript
interface LayoutConfig {
  // Existing properties
  textAlign: 'left' | 'center';
  horizontalMargin: number;
  verticalPadding: number;
  
  // NEW: Column layout support
  columnCount: 1 | 2;
  columnGap: number;
}

interface ConfigState {
  layout: LayoutConfig;
  typography: TypographyConfig;
  effects: EffectsConfig;
  media: MediaConfig;
  presets: PresetsConfig;
  
  // Actions
  setLayout: (layout: Partial<LayoutConfig>) => void;
  resetLayout: () => void;
  setTypography: (typography: Partial<TypographyConfig>) => void;
  setEffects: (effects: Partial<EffectsConfig>) => void;
  setMedia: (media: Partial<MediaConfig>) => void;
  savePreset: (name: string) => void;
  loadPreset: (presetId: string) => void;
  deletePreset: (presetId: string) => void;
  
  // Migration
  migrate: (oldConfig: any) => ConfigState;
}
```

## Action Specifications

### `setLayout(columnCount?: 1 | 2, columnGap?: number): void`

Updates the layout configuration with new values.

**Parameters**:
- `columnCount` (optional): Number of text columns (1 or 2)
- `columnGap` (optional): Gap between columns in pixels

**Behavior**:
1. Validates input values
2. Merges with existing layout config
3. Persists to localStorage
4. Triggers re-render of subscribed components

**Validation Rules**:
```typescript
if (columnCount !== undefined && columnCount !== 1 && columnCount !== 2) {
  throw new Error('columnCount must be 1 or 2');
}
if (columnGap !== undefined && (columnGap < 0 || columnGap > 100)) {
  throw new Error('columnGap must be between 0 and 100');
}
```

**Example Usage**:
```typescript
const { setLayout } = useConfigStore();

// Set to 2 columns
setLayout({ columnCount: 2 });

// Change gap
setLayout({ columnGap: 48 });

// Reset to defaults
setLayout({ columnCount: 2, columnGap: 32 });
```

### `resetLayout(): void`

Resets layout configuration to default values.

**Behavior**:
1. Resets all layout properties to defaults
2. Persists to localStorage
3. Triggers re-render

**Default Values**:
```typescript
const defaultLayout: LayoutConfig = {
  textAlign: 'left',
  horizontalMargin: 48,
  verticalPadding: 32,
  columnCount: 2,
  columnGap: 32,
};
```

### `migrate(oldConfig: any): ConfigState`

Migrates legacy configuration objects to current schema.

**Parameters**:
- `oldConfig`: Any legacy configuration object

**Returns**: Migrated `ConfigState`

**Behavior**:
1. Checks for missing `columnCount` property
2. Checks for missing `columnGap` property
3. Merges with default values
4. Returns valid ConfigState

**Example**:
```typescript
const legacyConfig = {
  layout: {
    textAlign: 'center',
    horizontalMargin: 64,
    // Missing columnCount and columnGap
  }
};

const migrated = migrate(legacyConfig);
// Result: {
//   layout: {
//     textAlign: 'center',
//     horizontalMargin: 64,
//     verticalPadding: 32,  // Default
//     columnCount: 2,        // Migrated
//     columnGap: 32,         // Migrated
//   }
// }
```

## State Persistence

### localStorage Schema

**Key**: `glean-teleprompter-config`

**Structure**:
```typescript
interface StoredConfig {
  version?: number;
  layout: {
    textAlign: 'left' | 'center';
    horizontalMargin: number;
    verticalPadding: number;
    columnCount: 1 | 2;
    columnGap: number;
  };
  // ... other sections
}
```

### Persistence Behavior

1. **Auto-save**: Config auto-saves on every state change
2. **Migration**: Occurs on app load (one-time)
3. **Validation**: Invalid values throw errors before save
4. **Throttling**: No throttling (small config size)

## Event Flow

```
User Action
    ↓
setLayout({ columnCount: 2 })
    ↓
Validation
    ↓
State Update (Zustand)
    ↓
localStorage Write
    ↓
Subscriber Notification
    ↓
Component Re-render
```

## TypeScript Types

```typescript
// Literal types for column count
type ColumnCount = 1 | 2;

// Layout config with all properties
interface LayoutConfig {
  textAlign: 'left' | 'center';
  horizontalMargin: number;
  verticalPadding: number;
  columnCount: ColumnCount;
  columnGap: number;
}

// Partial update type
type LayoutUpdate = Partial<LayoutConfig>;

// Action signature
type SetLayoutAction = (update: LayoutUpdate) => void;
```

## Error Handling

```typescript
try {
  setLayout({ columnCount: 3 });  // Invalid
} catch (error) {
  // Error: columnCount must be 1 or 2
  console.error('Layout update failed:', error.message);
}
```

## Testing Contract

### Unit Tests Required

1. `setLayout()` with valid values
2. `setLayout()` with invalid values (error handling)
3. `setLayout()` with partial updates
4. `resetLayout()` restores defaults
5. `migrate()` adds missing properties
6. `migrate()` preserves existing properties
7. localStorage persistence
8. localStorage migration on load

### Test Example

```typescript
describe('useConfigStore - Layout', () => {
  it('should set columnCount to 2', () => {
    const { setLayout } = useConfigStore.getState();
    setLayout({ columnCount: 2 });
    
    const { layout } = useConfigStore.getState();
    expect(layout.columnCount).toBe(2);
  });
  
  it('should throw on invalid columnCount', () => {
    const { setLayout } = useConfigStore.getState();
    expect(() => setLayout({ columnCount: 3 })).toThrow();
  });
  
  it('should migrate legacy config', () => {
    const legacy = { layout: { textAlign: 'left' } };
    const migrated = migrate(legacy);
    expect(migrated.layout.columnCount).toBe(2);
    expect(migrated.layout.columnGap).toBe(32);
  });
});
```

---

**Contract Version**: 1.0.0
**Last Updated**: 2026-01-01
**Status**: Final
