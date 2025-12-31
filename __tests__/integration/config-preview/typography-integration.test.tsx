import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ConfigPreviewTestWrapper } from '../../utils/ConfigPreviewTestWrapper'
import { resetConfigStore, setConfigState, createTestConfigUpdate } from '../../utils/mock-config-store'
import { setupTestEnvironment, teardownTestEnvironment } from '../../utils/test-helpers'

describe('Typography Integration Tests', () => {
  beforeEach(() => {
    setupTestEnvironment()
    resetConfigStore()
  })

  afterEach(() => {
    teardownTestEnvironment()
  })

  describe('Font Family Changes', () => {
    it('should update preview text font family when changed in config panel', async () => {
      const user = userEvent.setup()
      render(<ConfigPreviewTestWrapper />)

      // Navigate to typography tab
      const typographyTab = screen.getByRole('tab', { name: /typography/i })
      await user.click(typographyTab)

      // Click font selector dropdown
      const fontSelector = screen.getByText('Inter') // Current default font
      await user.click(fontSelector)

      // Select Roboto from dropdown
      const robotoOption = screen.getByText('Roboto')
      await user.click(robotoOption)

      // Verify the preview text has the new font family
      await waitFor(() => {
        const previewText = screen.getByText('Test teleprompter text')
        const computedStyle = window.getComputedStyle(previewText)
        expect(computedStyle.fontFamily).toContain('Roboto')
      })
    })
  })

  describe('Font Size Adjustments', () => {
    it('should update preview text size when font size is changed', async () => {
      const user = userEvent.setup()
      render(<ConfigPreviewTestWrapper />)

      // Navigate to typography tab
      const typographyTab = screen.getByRole('tab', { name: /typography/i })
      await user.click(typographyTab)

      // Find font size number input and change it
      const fontSizeInput = screen.getByDisplayValue('48') // Default font size
      await user.clear(fontSizeInput)
      await user.type(fontSizeInput, '72')

      // Verify the preview text has the new font size
      await waitFor(() => {
        const previewText = screen.getByText('Test teleprompter text')
        const computedStyle = window.getComputedStyle(previewText)
        expect(computedStyle.fontSize).toBe('72px')
      })
    })
  })

  describe('Font Weight Modifications', () => {
    it('should update preview text weight when font weight is changed', async () => {
      const user = userEvent.setup()
      render(<ConfigPreviewTestWrapper />)

      // Navigate to typography tab
      const typographyTab = screen.getByRole('tab', { name: /typography/i })
      await user.click(typographyTab)

      // Find font weight select and change it
      const fontWeightSelect = screen.getByDisplayValue('Regular (400)') // Default weight
      await user.selectOptions(fontWeightSelect, 'Bold (700)')

      // Verify the preview text has the new font weight
      await waitFor(() => {
        const previewText = screen.getByText('Test teleprompter text')
        const computedStyle = window.getComputedStyle(previewText)
        expect(computedStyle.fontWeight).toBe('700')
      })
    })
  })

  describe('Letter Spacing Changes', () => {
    it('should update preview text letter spacing when adjusted', async () => {
      const user = userEvent.setup()
      render(<ConfigPreviewTestWrapper />)

      // Navigate to typography tab
      const typographyTab = screen.getByRole('tab', { name: /typography/i })
      await user.click(typographyTab)

      // Find letter spacing number input (assuming it's labeled)
      const letterSpacingLabel = screen.getByText(/letter.*spacing/i)
      const letterSpacingInput = letterSpacingLabel.closest('div')?.querySelector('input[type="number"]') as HTMLInputElement
      expect(letterSpacingInput).toBeInTheDocument()

      await user.clear(letterSpacingInput)
      await user.type(letterSpacingInput, '2')

      // Verify the preview text has the new letter spacing
      await waitFor(() => {
        const previewText = screen.getByText('Test teleprompter text')
        const computedStyle = window.getComputedStyle(previewText)
        expect(computedStyle.letterSpacing).toBe('2px')
      })
    })
  })

  describe('Line Height Adjustments', () => {
    it('should update preview text line height when changed', async () => {
      const user = userEvent.setup()
      render(<ConfigPreviewTestWrapper />)

      // Navigate to typography tab
      const typographyTab = screen.getByRole('tab', { name: /typography/i })
      await user.click(typographyTab)

      // Find line height number input
      const lineHeightLabel = screen.getByText(/line.*height/i)
      const lineHeightInput = lineHeightLabel.closest('div')?.querySelector('input[type="number"]') as HTMLInputElement
      expect(lineHeightInput).toBeInTheDocument()

      await user.clear(lineHeightInput)
      await user.type(lineHeightInput, '2')

      // Verify the preview text has the new line height
      await waitFor(() => {
        const previewText = screen.getByText('Test teleprompter text')
        const computedStyle = window.getComputedStyle(previewText)
        expect(computedStyle.lineHeight).toBe('2')
      })
    })
  })

  describe('Text Transform Applications', () => {
    it('should apply text transform to preview when changed', async () => {
      const user = userEvent.setup()
      render(<ConfigPreviewTestWrapper />)

      // Navigate to typography tab
      const typographyTab = screen.getByRole('tab', { name: /typography/i })
      await user.click(typographyTab)

      // Find and click uppercase transform button
      const uppercaseButton = screen.getByRole('button', { name: /uppercase/i })
      await user.click(uppercaseButton)

      // Verify the preview text is uppercase
      await waitFor(() => {
        const previewText = screen.getByText('TEST TELEPROMPTER TEXT')
        const computedStyle = window.getComputedStyle(previewText)
        expect(computedStyle.textTransform).toBe('uppercase')
      })
    })
  })
})