import { render, screen } from '@testing-library/react'
import { TeleprompterText } from '@/components/teleprompter/display/TeleprompterText'
import { resetConfigStore, setConfigState, createTestConfigUpdate } from '../../utils/mock-config-store'
import { setupTestEnvironment, teardownTestEnvironment } from '../../utils/test-helpers'

describe('Config Store to TeleprompterText Integration', () => {
  beforeEach(() => {
    setupTestEnvironment()
    resetConfigStore()
  })

  afterEach(() => {
    teardownTestEnvironment()
  })

  describe('Typography Integration', () => {
    it('should apply font family changes to TeleprompterText', () => {
      // Set Roboto font family
      setConfigState(createTestConfigUpdate.typography({ fontFamily: 'Roboto' }))

      render(<TeleprompterText text="Test text" />)

      const textElement = screen.getByText('Test text')
      const computedStyle = window.getComputedStyle(textElement)
      expect(computedStyle.fontFamily).toContain('Roboto')
    })

    it('should apply font size changes to TeleprompterText', () => {
      // Set font size to 72px
      setConfigState(createTestConfigUpdate.typography({ fontSize: 72 }))

      render(<TeleprompterText text="Test text" />)

      const textElement = screen.getByText('Test text')
      const computedStyle = window.getComputedStyle(textElement)
      expect(computedStyle.fontSize).toBe('72px')
    })

    it('should apply font weight changes to TeleprompterText', () => {
      // Set font weight to bold (700)
      setConfigState(createTestConfigUpdate.typography({ fontWeight: 700 }))

      render(<TeleprompterText text="Test text" />)

      const textElement = screen.getByText('Test text')
      const computedStyle = window.getComputedStyle(textElement)
      expect(computedStyle.fontWeight).toBe('700')
    })

    it('should apply letter spacing changes to TeleprompterText', () => {
      // Set letter spacing to 2px
      setConfigState(createTestConfigUpdate.typography({ letterSpacing: 2 }))

      render(<TeleprompterText text="Test text" />)

      const textElement = screen.getByText('Test text')
      const computedStyle = window.getComputedStyle(textElement)
      expect(computedStyle.letterSpacing).toBe('2px')
    })

    it('should apply line height changes to TeleprompterText', () => {
      // Set line height to 2
      setConfigState(createTestConfigUpdate.typography({ lineHeight: 2 }))

      render(<TeleprompterText text="Test text" />)

      const textElement = screen.getByText('Test text')
      const computedStyle = window.getComputedStyle(textElement)
      expect(computedStyle.lineHeight).toBe('2')
    })

    it('should apply text transform changes to TeleprompterText', () => {
      // Set text transform to uppercase
      setConfigState(createTestConfigUpdate.typography({ textTransform: 'uppercase' }))

      render(<TeleprompterText text="Test text" />)

      const textElement = screen.getByText('Test text') // CSS text-transform doesn't change DOM text
      const computedStyle = window.getComputedStyle(textElement)
      expect(computedStyle.textTransform).toBe('uppercase')
    })
  })

  describe('Color Integration', () => {
    it('should apply primary color changes to TeleprompterText', () => {
      // Set primary color to red
      setConfigState(createTestConfigUpdate.colors({ primaryColor: '#ff0000' }))

      render(<TeleprompterText text="Test text" />)

      const textElement = screen.getByText('Test text')
      const computedStyle = window.getComputedStyle(textElement)
      expect(computedStyle.color).toBe('rgb(255, 0, 0)') // CSS color format
    })

    it('should apply gradient colors to TeleprompterText', () => {
      // Enable gradient with custom colors
      setConfigState(createTestConfigUpdate.colors({
        gradientEnabled: true,
        gradientColors: ['#ff0000', '#0000ff'],
        gradientType: 'linear',
        gradientAngle: 90
      }))

      render(<TeleprompterText text="Test text" />)

      const textElement = screen.getByText('Test text')
      const computedStyle = window.getComputedStyle(textElement)
      expect(computedStyle.backgroundImage).toContain('linear-gradient')
      expect(computedStyle.backgroundImage).toContain('#ff0000')
      expect(computedStyle.backgroundImage).toContain('#0000ff')
    })
  })

  describe('Effects Integration', () => {
    it('should apply shadow effects to TeleprompterText', () => {
      // Enable shadow
      setConfigState(createTestConfigUpdate.effects({
        shadowEnabled: true,
        shadowOffsetX: 2,
        shadowOffsetY: 2,
        shadowBlur: 4,
        shadowColor: '#000000',
        shadowOpacity: 0.5
      }))

      render(<TeleprompterText text="Test text" />)

      const textElement = screen.getByText('Test text')
      const computedStyle = window.getComputedStyle(textElement)
      expect(computedStyle.textShadow).toContain('rgba(0, 0, 0, 0.5)')
    })

    it('should apply outline effects to TeleprompterText', () => {
      // Enable outline
      setConfigState(createTestConfigUpdate.effects({
        outlineEnabled: true,
        outlineWidth: 2,
        outlineColor: '#ff0000'
      }))

      render(<TeleprompterText text="Test text" />)

      const textElement = screen.getByText('Test text')
      const computedStyle = window.getComputedStyle(textElement)
      // Note: webkitTextStroke may not be directly accessible in computed style
      expect(computedStyle.textShadow).toBeTruthy() // Outline creates text shadow
    })

    it('should apply glow effects to TeleprompterText', () => {
      // Enable glow
      setConfigState(createTestConfigUpdate.effects({
        glowEnabled: true,
        glowBlurRadius: 10,
        glowIntensity: 0.5,
        glowColor: '#00ff00'
      }))

      render(<TeleprompterText text="Test text" />)

      const textElement = screen.getByText('Test text')
      const computedStyle = window.getComputedStyle(textElement)
      expect(computedStyle.textShadow).toContain('#00ff00')
    })
  })

  describe('Layout Integration', () => {
    it('should apply text alignment to TeleprompterText container', () => {
      // Set center alignment
      setConfigState(createTestConfigUpdate.layout({ textAlign: 'center' }))

      render(<TeleprompterText text="Test text" />)

      const container = screen.getByText('Test text').parentElement
      expect(container?.className).toContain('text-center')
    })

    it('should apply horizontal margins to TeleprompterText', () => {
      // Set horizontal margin
      setConfigState(createTestConfigUpdate.layout({ horizontalMargin: 20 }))

      render(<TeleprompterText text="Test text" />)

      const container = screen.getByText('Test text').parentElement
      const computedStyle = window.getComputedStyle(container!)
      expect(computedStyle.paddingLeft).toBe('20px')
      expect(computedStyle.paddingRight).toBe('20px')
    })

    it('should apply text area width to TeleprompterText', () => {
      // Set text area width
      setConfigState(createTestConfigUpdate.layout({ textAreaWidth: 75 }))

      render(<TeleprompterText text="Test text" />)

      const container = screen.getByText('Test text').parentElement
      const computedStyle = window.getComputedStyle(container!)
      expect(computedStyle.width).toBe('75%')
    })
  })
})