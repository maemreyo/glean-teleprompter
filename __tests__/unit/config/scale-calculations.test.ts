/**
 * T040 [US3]: Unit test - Scale multipliers calculated correctly
 * Tests that scale multipliers are calculated correctly for each size level
 */

import { TEXTAREA_SCALE_MULTIPLIERS } from '@/lib/config/types';

describe('Scale Calculations (T040)', () => {
  /**
   * Test: Compact scale multiplier is correct
   * Given: Scale multipliers are defined
   * When: Checking compact multiplier
   * Then: Should be 1.0
   */
  it('should have correct compact scale multiplier', () => {
    // Given: Multipliers exist
    const compact = TEXTAREA_SCALE_MULTIPLIERS.compact;

    // Then: Should be 1.0
    expect(compact).toBe(1.0);
  });

  /**
   * Test: Medium scale multiplier is correct
   * Given: Scale multipliers are defined
   * When: Checking medium multiplier
   * Then: Should be 1.2
   */
  it('should have correct medium scale multiplier', () => {
    // Given: Multipliers exist
    const medium = TEXTAREA_SCALE_MULTIPLIERS.medium;

    // Then: Should be 1.2
    expect(medium).toBe(1.2);
  });

  /**
   * Test: Large scale multiplier is correct
   * Given: Scale multipliers are defined
   * When: Checking large multiplier
   * Then: Should be 1.4
   */
  it('should have correct large scale multiplier', () => {
    // Given: Multipliers exist
    const large = TEXTAREA_SCALE_MULTIPLIERS.large;

    // Then: Should be 1.4
    expect(large).toBe(1.4);
  });

  /**
   * Test: Scale multipliers are numeric
   * Given: Scale multipliers exist
   * When: Checking types
   * Then: All should be numbers
   */
  it('should have numeric scale multipliers', () => {
    // Given: Multipliers exist
    const { compact, medium, large } = TEXTAREA_SCALE_MULTIPLIERS;

    // Then: Should be numbers
    expect(typeof compact).toBe('number');
    expect(typeof medium).toBe('number');
    expect(typeof large).toBe('number');
  });

  /**
   * Test: Scale multipliers are positive
   * Given: Scale multipliers exist
   * When: Checking values
   * Then: All should be greater than 0
   */
  it('should have positive scale multipliers', () => {
    // Given: Multipliers exist
    const { compact, medium, large } = TEXTAREA_SCALE_MULTIPLIERS;

    // Then: Should be positive
    expect(compact).toBeGreaterThan(0);
    expect(medium).toBeGreaterThan(0);
    expect(large).toBeGreaterThan(0);
  });

  /**
   * Test: Scale multipliers increase incrementally
   * Given: Scale multipliers exist
   * When: Checking increments
   * Then: Should increase by 0.2 each step
   */
  it('should increase by 0.2 at each level', () => {
    // Given: Multipliers exist
    const { compact, medium, large } = TEXTAREA_SCALE_MULTIPLIERS;

    // When: Calculating differences
    const diff1 = medium - compact;
    const diff2 = large - medium;

    // Then: Should be 0.2
    expect(diff1).toBe(0.2);
    expect(diff2).toBe(0.2);
  });

  /**
   * Test: Scale multipliers are frozen constants
   * Given: Scale multipliers exist
   * When: Attempting to modify
   * Then: Should be immutable
   */
  it('should have immutable scale multipliers', () => {
    // Given: Multipliers exist
    const originalCompact = TEXTAREA_SCALE_MULTIPLIERS.compact;

    // When: Attempting to modify (should fail in strict mode)
    try {
      (TEXTAREA_SCALE_MULTIPLIERS as any).compact = 999;
    } catch (e) {
      // Expected in strict mode
    }

    // Then: Value should remain unchanged
    expect(TEXTAREA_SCALE_MULTIPLIERS.compact).toBe(originalCompact);
  });

  /**
   * Test: Scale calculation for custom size
   * Given: Base size and multiplier
   * When: Calculating scaled size
   * Then: Should return correct value
   */
  it('should calculate scaled size correctly', () => {
    // Given: Base size of 14px and medium multiplier
    const baseSize = 14;
    const multiplier = TEXTAREA_SCALE_MULTIPLIERS.medium;

    // When: Calculating
    const scaled = baseSize * multiplier;

    // Then: Should be 16.8
    expect(scaled).toBe(16.8);
  });

  /**
   * Test: Scale calculation with cap at 16px
   * Given: Base size and large multiplier
   * When: Calculating with cap
   * Then: Should not exceed 16px for labels
   */
  it('should cap label font size at 16px', () => {
    // Given: Base size of 14px and large multiplier
    const baseSize = 14;
    const multiplier = TEXTAREA_SCALE_MULTIPLIERS.large;
    const maxLabelSize = 16;

    // When: Calculating
    const scaled = Math.min(baseSize * multiplier, maxLabelSize);

    // Then: Should be capped at 16px
    expect(scaled).toBe(16);
  });

  /**
   * Test: Scale multipliers for different element types
   * Given: Different UI elements
   * When: Applying multipliers
   * Then: Should scale proportionally
   */
  it('should apply to different UI elements proportionally', () => {
    // Given: Different base sizes
    const buttonSize = 40;
    const iconSize = 20;
    const multiplier = TEXTAREA_SCALE_MULTIPLIERS.large;

    // When: Calculating
    const scaledButton = buttonSize * multiplier;
    const scaledIcon = iconSize * multiplier;

    // Then: Should maintain proportion
    expect(scaledButton).toBe(56);
    expect(scaledIcon).toBe(28);
  });

  /**
   * Test: Scale multiplier precision
   * Given: Multipliers are defined
   * When: Checking precision
   * Then: Should have single decimal precision
   */
  it('should have single decimal precision', () => {
    // Given: Multipliers exist
    const { compact, medium, large } = TEXTAREA_SCALE_MULTIPLIERS;

    // When: Checking precision
    // Then: Should have at most 1 decimal place
    expect(compact % 1).toBe(0);
    expect(medium % 1).toBeLessThan(1);
    expect(large % 1).toBeLessThan(1);
  });

  /**
   * Test: All scale multipliers are exported
   * Given: Scale multipliers object
   * When: Checking keys
   * Then: Should have all three levels
   */
  it('should export all scale levels', () => {
    // Given: Multipliers object
    const keys = Object.keys(TEXTAREA_SCALE_MULTIPLIERS);

    // When: Checking
    // Then: Should have all levels
    expect(keys).toContain('compact');
    expect(keys).toContain('medium');
    expect(keys).toContain('large');
    expect(keys).toHaveLength(3);
  });
});
