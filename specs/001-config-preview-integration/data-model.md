# Data Model: Config Panel to Preview Integration Tests

**Date**: 2025-12-31
**Purpose**: Define test data structures and scenarios for integration testing.

## Test Scenario Model

### ConfigTestScenario

Represents a complete test case for config-to-preview integration.

```typescript
interface ConfigTestScenario {
  name: string;                    // Test case identifier
  category: 'typography' | 'colors' | 'effects' | 'layout' | 'animations';
  configChange: Partial<ConfigUpdate>; // The config property being changed
  expectedStyles: ExpectedStyle[];     // Expected CSS properties on preview
  description: string;             // Human-readable test description
}
```

### ConfigUpdate

Partial configuration update matching Zustand store structure.

```typescript
interface ConfigUpdate {
  typography?: Partial<TypographyConfig>;
  colors?: Partial<ColorConfig>;
  effects?: Partial<EffectConfig>;
  layout?: Partial<LayoutConfig>;
  animations?: Partial<AnimationConfig>;
}
```

### ExpectedStyle

Expected CSS property on the preview element.

```typescript
interface ExpectedStyle {
  property: string;     // CSS property name (e.g., 'fontSize', 'color')
  value: string;        // Expected value (e.g., '48px', '#ffffff')
  element?: string;     // CSS selector for target element (default: main text element)
}
```

## Test Data Categories

### Typography Test Scenarios

- Font family changes (Inter → Roboto)
- Font size adjustments (24px → 72px)
- Font weight modifications (400 → 700)
- Letter spacing changes (0 → 2px)
- Line height adjustments (1.5 → 2.0)
- Text transform applications (none → uppercase)

### Color Test Scenarios

- Primary color changes (#ffffff → #ff0000)
- Gradient enable/disable
- Gradient color modifications
- Gradient type changes (linear ↔ radial)
- Gradient angle adjustments (0° → 180°)

### Effects Test Scenarios

- Shadow enable/disable and parameter changes
- Outline enable/disable and styling
- Glow effects and intensity
- Backdrop filter settings
- Multiple effects combinations

### Layout Test Scenarios

- Horizontal margin adjustments
- Vertical padding changes
- Text alignment modifications (left/center/right/justify)
- Column layout activation and count changes
- Text area width and positioning

### Animation Test Scenarios

- Smooth scroll damping verification
- Entrance animation application
- Word highlight color settings
- Auto scroll speed validation
- Animation combinations

## Validation Rules

### Style Assertion Rules

- Font properties must match exactly (case-sensitive)
- Color values must be in hex format (#rrggbb)
- Numeric values include units (px, %, deg)
- Gradient values use CSS gradient syntax
- Boolean flags affect presence/absence of styles

### Test Execution Rules

- Each scenario runs in isolation
- Store state resets between tests
- Assertions use computed styles when possible
- Async operations use appropriate waiting mechanisms
- Edge cases include invalid inputs and boundary values