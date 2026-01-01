/**
 * Integration test for Editor-Runner visual consistency
 * T014: [US1] Integration test for Editor-Runner visual consistency
 * Created for 007-unified-state-architecture
 */

import { render, screen } from '@testing-library/react'
import { renderHook, act } from '@testing-library/react'
import { useContentStore } from '@/lib/stores/useContentStore'
import { useConfigStore } from '@/lib/stores/useConfigStore'

describe('Editor-Runner Visual Consistency', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('Typography consistency', () => {
    it('should maintain font size between Editor and Runner', () => {
      const { result: configResult } = renderHook(() => useConfigStore())

      // Set font size in Editor (via ConfigStore)
      act(() => {
        configResult.current.setTypography({ fontSize: 60 })
      })

      // Runner should read the same font size from ConfigStore
      const { result: runnerResult } = renderHook(() => useConfigStore())
      expect(runnerResult.current.typography.fontSize).toBe(60)
    })

    it('should maintain font family between Editor and Runner', () => {
      const { result: configResult } = renderHook(() => useConfigStore())

      // Set font family in Editor
      act(() => {
        configResult.current.setTypography({ fontFamily: 'Roboto' })
      })

      // Runner should read the same font family
      const { result: runnerResult } = renderHook(() => useConfigStore())
      expect(runnerResult.current.typography.fontFamily).toBe('Roboto')
    })

    it('should maintain all typography properties between Editor and Runner', () => {
      const { result: configResult } = renderHook(() => useConfigStore())

      const typographyConfig = {
        fontFamily: 'Inter',
        fontWeight: 700,
        fontSize: 54,
        letterSpacing: 1,
        lineHeight: 1.6,
        textTransform: 'uppercase' as const
      }

      act(() => {
        configResult.current.setTypography(typographyConfig)
      })

      // All properties should match
      const { result: runnerResult } = renderHook(() => useConfigStore())
      expect(runnerResult.current.typography).toEqual(expect.objectContaining(typographyConfig))
    })
  })

  describe('Colors consistency', () => {
    it('should maintain primary color between Editor and Runner', () => {
      const { result: configResult } = renderHook(() => useConfigStore())

      act(() => {
        configResult.current.setColors({ primaryColor: '#ff0000' })
      })

      const { result: runnerResult } = renderHook(() => useConfigStore())
      expect(runnerResult.current.colors.primaryColor).toBe('#ff0000')
    })

    it('should maintain gradient settings between Editor and Runner', () => {
      const { result: configResult } = renderHook(() => useConfigStore())

      const gradientConfig = {
        gradientEnabled: true,
        gradientType: 'linear' as const,
        gradientColors: ['#ffffff', '#00ff00', '#0000ff'],
        gradientAngle: 45
      }

      act(() => {
        configResult.current.setColors(gradientConfig)
      })

      const { result: runnerResult } = renderHook(() => useConfigStore())
      expect(runnerResult.current.colors.gradientEnabled).toBe(true)
      expect(runnerResult.current.colors.gradientColors).toEqual(gradientConfig.gradientColors)
    })
  })

  describe('Effects consistency', () => {
    it('should maintain shadow settings between Editor and Runner', () => {
      const { result: configResult } = renderHook(() => useConfigStore())

      act(() => {
        configResult.current.setEffects({
          shadowEnabled: true,
          shadowColor: '#ff00ff',
          shadowBlur: 8
        })
      })

      const { result: runnerResult } = renderHook(() => useConfigStore())
      expect(runnerResult.current.effects.shadowEnabled).toBe(true)
      expect(runnerResult.current.effects.shadowColor).toBe('#ff00ff')
      expect(runnerResult.current.effects.shadowBlur).toBe(8)
    })

    it('should maintain outline settings between Editor and Runner', () => {
      const { result: configResult } = renderHook(() => useConfigStore())

      act(() => {
        configResult.current.setEffects({
          outlineEnabled: true,
          outlineColor: '#00ff00',
          outlineWidth: 3
        })
      })

      const { result: runnerResult } = renderHook(() => useConfigStore())
      expect(runnerResult.current.effects.outlineEnabled).toBe(true)
      expect(runnerResult.current.effects.outlineColor).toBe('#00ff00')
      expect(runnerResult.current.effects.outlineWidth).toBe(3)
    })

    it('should maintain glow settings between Editor and Runner', () => {
      const { result: configResult } = renderHook(() => useConfigStore())

      act(() => {
        configResult.current.setEffects({
          glowEnabled: true,
          glowColor: '#ffff00',
          glowIntensity: 0.8
        })
      })

      const { result: runnerResult } = renderHook(() => useConfigStore())
      expect(runnerResult.current.effects.glowEnabled).toBe(true)
      expect(runnerResult.current.effects.glowColor).toBe('#ffff00')
      expect(runnerResult.current.effects.glowIntensity).toBe(0.8)
    })

    it('should maintain overlay opacity between Editor and Runner', () => {
      const { result: configResult } = renderHook(() => useConfigStore())

      act(() => {
        configResult.current.setEffects({ overlayOpacity: 0.7 })
      })

      const { result: runnerResult } = renderHook(() => useConfigStore())
      expect(runnerResult.current.effects.overlayOpacity).toBe(0.7)
    })
  })

  describe('Layout consistency', () => {
    it('should maintain text alignment between Editor and Runner', () => {
      const { result: configResult } = renderHook(() => useConfigStore())

      act(() => {
        configResult.current.setLayout({ textAlign: 'left' })
      })

      const { result: runnerResult } = renderHook(() => useConfigStore())
      expect(runnerResult.current.layout.textAlign).toBe('left')
    })

    it('should maintain margin settings between Editor and Runner', () => {
      const { result: configResult } = renderHook(() => useConfigStore())

      act(() => {
        configResult.current.setLayout({
          horizontalMargin: 20,
          verticalPadding: 30
        })
      })

      const { result: runnerResult } = renderHook(() => useConfigStore())
      expect(runnerResult.current.layout.horizontalMargin).toBe(20)
      expect(runnerResult.current.layout.verticalPadding).toBe(30)
    })
  })

  describe('Animations consistency', () => {
    it('should maintain auto-scroll speed between Editor and Runner', () => {
      const { result: configResult } = renderHook(() => useConfigStore())

      act(() => {
        configResult.current.setAnimations({ autoScrollSpeed: 100 })
      })

      const { result: runnerResult } = renderHook(() => useConfigStore())
      expect(runnerResult.current.animations.autoScrollSpeed).toBe(100)
    })

    it('should maintain smooth scroll setting between Editor and Runner', () => {
      const { result: configResult } = renderHook(() => useConfigStore())

      act(() => {
        configResult.current.setAnimations({ smoothScrollEnabled: false })
      })

      const { result: runnerResult } = renderHook(() => useConfigStore())
      expect(runnerResult.current.animations.smoothScrollEnabled).toBe(false)
    })
  })

  describe('Content consistency', () => {
    it('should maintain text content between Editor and Runner', () => {
      const { result: contentResult } = renderHook(() => useContentStore())

      act(() => {
        contentResult.current.setText('Test teleprompter content')
      })

      const { result: runnerResult } = renderHook(() => useContentStore())
      expect(runnerResult.current.text).toBe('Test teleprompter content')
    })

    it('should maintain background URL between Editor and Runner', () => {
      const { result: contentResult } = renderHook(() => useContentStore())

      act(() => {
        contentResult.current.setBgUrl('https://example.com/bg.jpg')
      })

      const { result: runnerResult } = renderHook(() => useContentStore())
      expect(runnerResult.current.bgUrl).toBe('https://example.com/bg.jpg')
    })
  })

  describe('Complete visual consistency', () => {
    it('should maintain all styling properties between Editor and Runner', () => {
      const { result: configResult } = renderHook(() => useConfigStore())

      // Set all configuration in Editor
      act(() => {
        configResult.current.setTypography({
          fontSize: 72,
          fontFamily: 'Roboto',
          fontWeight: 600,
          lineHeight: 1.8
        })
        configResult.current.setColors({
          primaryColor: '#00ff00',
          gradientEnabled: true
        })
        configResult.current.setEffects({
          shadowEnabled: true,
          shadowColor: '#000000',
          shadowBlur: 10
        })
        configResult.current.setLayout({
          textAlign: 'right' as const,
          horizontalMargin: 40
        })
        configResult.current.setAnimations({
          autoScrollSpeed: 120,
          smoothScrollEnabled: true
        })
      })

      // Runner should have identical configuration
      const { result: runnerResult } = renderHook(() => useConfigStore())
      
      expect(runnerResult.current.typography.fontSize).toBe(72)
      expect(runnerResult.current.typography.fontFamily).toBe('Roboto')
      expect(runnerResult.current.colors.primaryColor).toBe('#00ff00')
      expect(runnerResult.current.effects.shadowEnabled).toBe(true)
      expect(runnerResult.current.layout.textAlign).toBe('right')
      expect(runnerResult.current.animations.autoScrollSpeed).toBe(120)
    })
  })
})
