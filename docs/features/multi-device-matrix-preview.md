# Multi-Device Matrix Preview Feature

**Feature ID**: 015-multi-device-matrix  
**Status**: ✅ Complete  
**Last Updated**: 2025-01-07

## Overview

The Multi-Device Matrix Preview feature enables users to view teleprompter content across multiple device types simultaneously in a responsive grid layout. Users can configure grid layouts, select device types, and reorganize devices via drag-and-drop.

## Features

### 1. Multi-Device View (User Story 1)
- Toggle between single and multi-device preview modes
- View 3+ devices simultaneously in responsive grid
- Real-time content sync across all device frames
- Viewport warning below 1024px width

### 2. Grid Configuration (User Story 2)
- Select grid layouts (1x1, 2x1, 2x2, 3x2)
- Enable/disable device types (mobile, tablet, desktop)
- Memory usage monitoring with warnings
- Persistent preferences across sessions

### 3. Drag-and-Drop Reordering (User Story 3)
- Drag device frames to reorder layout
- Keyboard navigation (Ctrl/Cmd + Arrow keys)
- Smooth animations with framer-motion
- Performance target: <200ms per operation

## Architecture

### Components

```
components/story-builder/preview/multi-device/
├── DeviceMatrix.tsx          # Main container
├── DeviceGrid.tsx            # Grid layout with DnD
├── DeviceFrame.tsx           # Individual device frame
├── DeviceChrome.tsx          # Device frame styling
├── MultiDeviceToggle.tsx     # Toggle button
├── GridConfiguration.tsx     # Config toolbar
├── GridConfigSelector.tsx    # Grid layout picker
├── DeviceTypeChecklist.tsx   # Device type selector
├── MemoryUsageDisplay.tsx    # Memory indicator
├── EmptySlot.tsx             # Empty grid slot
├── LoadingIndicator.tsx      # Loading state
├── ErrorState.tsx            # Error display
└── ViewportWarning.tsx       # Width warning
```

### State Management

```typescript
// lib/stores/useMultiDeviceStore.ts
interface MultiDevicePreviewStore {
  enabled: boolean;                    // Multi-device mode active
  gridConfig: GridConfig;              // { rows, columns }
  enabledDeviceTypes: string[];        // Selected device IDs
  deviceOrder: string[];               // Custom device order
  isDragging: boolean;                 // Drag state
  draggedDeviceId: string | null;      // Currently dragged

  // Actions
  setEnabled(enabled: boolean): void;
  setGridConfig(config: GridConfig): void;
  toggleDeviceType(deviceId: string): void;
  reorderDevices(fromIndex: number, toIndex: number): void;
  resetToDefaults(): void;
}
```

### Device Registry

```typescript
// lib/story-builder/multi-device/deviceRegistry.ts
export const DEVICE_REGISTRY = [
  { id: 'iphone-se', name: 'iPhone SE', width: 375, height: 667, scale: 1.0, category: 'mobile' },
  { id: 'iphone-14-pro', name: 'iPhone 14 Pro', width: 393, height: 852, scale: 1.0, category: 'mobile' },
  { id: 'ipad-air', name: 'iPad Air', width: 820, height: 1180, scale: 1.0, category: 'tablet' },
  { id: 'desktop', name: 'Desktop', width: 1920, height: 1080, scale: 0.5, category: 'desktop' },
];
```

## Usage

### Basic Setup

```tsx
import { DeviceMatrix } from '@/components/story-builder/preview/multi-device/DeviceMatrix';
import { MultiDeviceToggle } from '@/components/story-builder/preview/multi-device/MultiDeviceToggle';

function PreviewPanel() {
  return (
    <div>
      <MultiDeviceToggle />
      <DeviceMatrix previewUrl="/preview" />
    </div>
  );
}
```

### Custom Grid Configuration

```tsx
import { useMultiDeviceStore } from '@/lib/stores/useMultiDeviceStore';

function GridConfigExample() {
  const { setGridConfig, toggleDeviceType } = useMultiDeviceStore();

  // Set 2x2 grid
  setGridConfig({ rows: 2, columns: 2 });

  // Enable only mobile devices
  toggleDeviceType('iphone-se');
  toggleDeviceType('iphone-14-pro');
}
```

### Keyboard Navigation

- **Ctrl/Cmd + Arrow Keys**: Move focused device
- **Tab**: Navigate between device frames
- **Space/Enter**: Toggle device type checkboxes

## Performance

### Memory Management

- **Warning Threshold**: 250MB
- **Hard Limit**: 350MB
- **Max Devices**: 6 (3x2 grid)

### Content Sync

- **Target Latency**: <100ms (desktop), <150ms (mobile)
- **BroadcastChannel**: Cross-tab synchronization

### Drag-and-Drop

- **Target Latency**: <200ms per operation
- **Animation**: Smooth transitions with framer-motion

## Accessibility

### ARIA Labels

- Toggle button: `aria-pressed`, `aria-label`
- Grid: `role="list"`, `aria-label`
- Device frames: `aria-label`, `aria-posinset`, `aria-setsize`
- Checkboxes: `aria-label`, `aria-describedby`

### Keyboard Support

- Full keyboard navigation for all controls
- Drag-and-drop alternative via Ctrl/Cmd + Arrow keys
- Screen reader announcements for state changes

### Focus Management

- Visible focus indicators on all interactive elements
- Logical tab order through grid
- Focus trap in configuration dialogs

## Testing

### Unit Tests

- `__tests__/unit/story-builder/multi-device/`
  - `deviceRegistry.test.ts`
  - `storage.test.ts`
  - `memory.test.ts`
  - `store.test.ts`
  - `previewSync.test.ts`

### Integration Tests

- `__tests__/integration/story-builder/`
  - `multi-device-preview-sync.test.tsx`
  - `grid-configuration.test.tsx`
  - `memory-management.test.tsx`
  - `multi-device-persistence.test.tsx`
  - `drag-drop-reorder.test.tsx`

### E2E Tests

- `__tests__/e2e/playwright/015-multi-device-matrix/`
  - `toggle.spec.ts`
  - `responsive-layout.spec.ts`
  - `grid-configuration.spec.ts`
  - `device-selection.spec.ts`
  - `drag-drop.spec.ts`

### Performance Tests

- `__tests__/performance/story-builder/`
  - `drag-drop-performance.test.ts`

## Success Criteria

| ID | Criterion | Status |
|----|-----------|--------|
| SC-001 | View 3+ devices simultaneously | ✅ |
| SC-002 | Content sync <100ms/150ms | ✅ |
| SC-003 | Single-click toggle on/off | ✅ |
| SC-004 | Grid layout persists | ✅ |
| SC-005 | Performance up to 6 devices | ✅ |
| SC-006 | Accurate device dimensions | ✅ |
| SC-007 | Drag-and-drop <200ms | ✅ |

## Dependencies

- `@dnd-kit/core` - Drag and drop library
- `@dnd-kit/sortable` - Sortable lists
- `@dnd-kit/utilities` - Animation utilities
- `framer-motion` - Smooth animations
- `sonner` - Toast notifications
- `zustand` - State management

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Known Limitations

1. **Memory Constraints**: Maximum 6 devices due to iframe overhead
2. **Viewport**: Requires ≥1024px width for optimal experience
3. **Mobile**: Responsive layout active but limited to 1 column

## Future Enhancements

- Custom device dimensions
- Device rotation (landscape/portrait)
- Export grid configuration
- Comparison mode (before/after)
- Device frame themes
