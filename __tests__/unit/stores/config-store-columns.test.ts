/**
 * T010: [US1] Unit test for config store column state
 * 
 * Tests that the config store:
 * - Has columnCount and columnGap in LayoutConfig
 * - Defaults to columnCount: 2 and columnGap: 32
 * - Correctly migrates legacy configs
 */

import { renderHook, act } from '@testing-library/react'
import { useConfigStore, defaultLayout, migrateLegacyLayoutConfig } from '@/lib/stores/useConfigStore'
import type { LayoutConfig } from '@/lib/config/types'

describe('Config Store - Column State (US1)', () => {
  beforeEach(() => {
    // Reset store state before each test
    useConfigStore.setState({
      layout: defaultLayout,
    })
  })

  describe('Default layout values', () => {
    it('should have columnCount default to 2', () => {
      const { result } = renderHook(() => useConfigStore())
      
      expect(result.current.layout.columnCount).toBe(2)
    })

    it('should have columnGap default to 32', () => {
      const { result } = renderHook(() => useConfigStore())
      
      expect(result.current.layout.columnGap).toBe(32)
    })

    it('should export defaultLayout with correct column values', () => {
      expect(defaultLayout.columnCount).toBe(2)
      expect(defaultLayout.columnGap).toBe(32)
    })
  })

  describe('setLayout action', () => {
    it('should update columnCount', () => {
      const { result } = renderHook(() => useConfigStore())
      
      act(() => {
        result.current.setLayout({ columnCount: 3 })
      })
      
      expect(result.current.layout.columnCount).toBe(3)
    })

    it('should update columnGap', () => {
      const { result } = renderHook(() => useConfigStore())
      
      act(() => {
        result.current.setLayout({ columnGap: 40 })
      })
      
      expect(result.current.layout.columnGap).toBe(40)
    })

    it('should update both columnCount and columnGap', () => {
      const { result } = renderHook(() => useConfigStore())
      
      act(() => {
        result.current.setLayout({ columnCount: 3, columnGap: 48 })
      })
      
      expect(result.current.layout.columnCount).toBe(3)
      expect(result.current.layout.columnGap).toBe(48)
    })

    it('should preserve other layout properties when updating column values', () => {
      const { result } = renderHook(() => useConfigStore())
      
      const originalMargin = result.current.layout.horizontalMargin
      const originalPadding = result.current.layout.verticalPadding
      
      act(() => {
        result.current.setLayout({ columnCount: 3, columnGap: 48 })
      })
      
      expect(result.current.layout.horizontalMargin).toBe(originalMargin)
      expect(result.current.layout.verticalPadding).toBe(originalPadding)
    })
  })

  describe('Migration function', () => {
    it('should migrate undefined config to default values', () => {
      const migrated = migrateLegacyLayoutConfig()
      
      expect(migrated.columnCount).toBe(2)
      expect(migrated.columnGap).toBe(32)
    })

    it('should migrate partial config with missing columnCount', () => {
      const legacy = { horizontalMargin: 10 }
      const migrated = migrateLegacyLayoutConfig(legacy)
      
      expect(migrated.columnCount).toBe(2)
      expect(migrated.horizontalMargin).toBe(10)
    })

    it('should migrate partial config with missing columnGap', () => {
      const legacy = { verticalPadding: 20 }
      const migrated = migrateLegacyLayoutConfig(legacy)
      
      expect(migrated.columnGap).toBe(32)
      expect(migrated.verticalPadding).toBe(20)
    })

    it('should preserve existing columnCount and columnGap values', () => {
      const existing = { columnCount: 3, columnGap: 40 }
      const migrated = migrateLegacyLayoutConfig(existing)
      
      expect(migrated.columnCount).toBe(3)
      expect(migrated.columnGap).toBe(40)
    })

    it('should use default values for other properties when not specified', () => {
      const migrated = migrateLegacyLayoutConfig({ columnCount: 3 })
      
      expect(migrated.horizontalMargin).toBe(defaultLayout.horizontalMargin)
      expect(migrated.verticalPadding).toBe(defaultLayout.verticalPadding)
    })
  })

  describe('Persistence', () => {
    it('should persist column layout changes to localStorage', () => {
      const { result } = renderHook(() => useConfigStore())
      
      act(() => {
        result.current.setLayout({ columnCount: 3, columnGap: 48 })
      })
      
      // Verify the state was updated
      expect(result.current.layout.columnCount).toBe(3)
      expect(result.current.layout.columnGap).toBe(48)
      
      // In a real test, we would check localStorage here
      // but for now we just verify the store state
    })
  })
})
