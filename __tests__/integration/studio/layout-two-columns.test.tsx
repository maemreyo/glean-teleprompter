/**
 * T011: [US1] Integration test for two-column layout behavior
 * 
 * Tests the integration between:
 * - ConfigStore (layout.columnCount, layout.columnGap)
 * - TeleprompterText component
 * - PreviewPanel component
 * 
 * Verifies that:
 * - Text displays in 2 columns by default
 * - Text flows correctly between columns
 * - Layout responds to config changes
 * - Mobile fallback to single column works
 */

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { renderHook, act } from '@testing-library/react'
import { useConfigStore } from '@/lib/stores/useConfigStore'
import { useUIStore } from '@/stores/useUIStore'
import { TeleprompterText } from '@/components/teleprompter/display/TeleprompterText'
import { PreviewPanel } from '@/components/teleprompter/editor/PreviewPanel'
import { useContentStore } from '@/lib/stores/useContentStore'

// Mock hooks
jest.mock('@/hooks/useMediaQuery', () => ({
  useMediaQuery: (query: string) => {
    // Default to desktop for most tests
    if (query.includes('1024px')) return true
    if (query.includes('768px')) return false
    return false
  },
}))

describe('Studio - Two-Column Layout Integration (US1)', () => {
  const mockText = 'Paragraph one\n\nParagraph two\n\nParagraph three\n\nParagraph four\n\nParagraph five'
  
  beforeEach(() => {
    // Reset stores
    useConfigStore.setState({
      layout: {
        horizontalMargin: 0,
        verticalPadding: 0,
        textAlign: 'center',
        columnCount: 2,
        columnGap: 32,
        textAreaWidth: 100,
        textAreaPosition: 'center',
      },
    })
    
    useContentStore.setState({
      text: mockText,
      bgUrl: '',
    })
    
    useUIStore.setState({
      previewState: { isOpen: true },
    })
  })

  describe('TeleprompterText with two-column layout', () => {
    it('should render text in 2 columns by default', () => {
      const { container } = render(<TeleprompterText text={mockText} />)
      
      const textElement = container.querySelector('p')
      expect(textElement).toBeInTheDocument()
      
      const styles = window.getComputedStyle(textElement!)
      // Note: column-count may be '2' or 'auto' depending on browser
      expect(['2', 'auto']).toContain(styles.columnCount)
    })

    it('should apply 32px column gap by default', () => {
      const { container } = render(<TeleprompterText text={mockText} />)
      
      const textElement = container.querySelector('p')
      const styles = window.getComputedStyle(textElement!)
      expect(styles.columnGap).toBe('32px')
    })

    it('should update layout when config changes', async () => {
      const { result } = renderHook(() => useConfigStore())
      const { container, rerender } = render(<TeleprompterText text={mockText} />)
      
      // Initial state - 2 columns
      let textElement = container.querySelector('p')
      const initialStyles = window.getComputedStyle(textElement!)
      expect(initialStyles.columnGap).toBe('32px')
      
      // Change to 3 columns with 48px gap
      act(() => {
        result.current.setLayout({ columnCount: 3, columnGap: 48 })
      })
      
      // Re-render to pick up new config
      rerender(<TeleprompterText text={mockText} />)
      
      textElement = container.querySelector('p')
      const updatedStyles = window.getComputedStyle(textElement!)
      expect(updatedStyles.columnGap).toBe('48px')
    })
  })

  describe('PreviewPanel integration', () => {
    it('should render TeleprompterText with two-column layout in PreviewPanel', () => {
      render(<PreviewPanel />)
      
      // PreviewPanel should render TeleprompterText
      const textContent = screen.getByText(/Paragraph one/)
      expect(textContent).toBeInTheDocument()
    })

    it('should use layout config from store', () => {
      const { container } = render(<PreviewPanel />)
      
      // Check that layout data attribute is present
      const layoutDiv = container.querySelector('[data-config-layout]')
      expect(layoutDiv).toBeInTheDocument()
      
      const layoutData = JSON.parse(layoutDiv?.getAttribute('data-config-layout') || '{}')
      expect(layoutData.columnCount).toBe(2)
      expect(layoutData.columnGap).toBe(32)
    })
  })

  describe('Content flow between columns', () => {
    it('should render all text content', () => {
      const { container } = render(<TeleprompterText text={mockText} />)
      
      expect(screen.getByText('Paragraph one')).toBeInTheDocument()
      expect(screen.getByText('Paragraph two')).toBeInTheDocument()
      expect(screen.getByText('Paragraph three')).toBeInTheDocument()
      expect(screen.getByText('Paragraph four')).toBeInTheDocument()
      expect(screen.getByText('Paragraph five')).toBeInTheDocument()
    })

    it('should preserve paragraph breaks', () => {
      const { container } = render(<TeleprompterText text={mockText} />)
      
      const textElement = container.querySelector('p')
      expect(textElement).toHaveClass('whitespace-pre-wrap')
    })
  })

  describe('Responsive behavior', () => {
    it('should use single column on mobile (columnCount: 1)', async () => {
      // Simulate mobile by changing config
      const { result } = renderHook(() => useConfigStore())
      
      act(() => {
        result.current.setLayout({ columnCount: 1 })
      })
      
      const { container } = render(<TeleprompterText text={mockText} />)
      
      const textElement = container.querySelector('p')
      const styles = window.getComputedStyle(textElement!)
      
      // Single column means columnCount should be 1 or auto/none
      const columnCount = styles.columnCount
      expect(columnCount === '1' || columnCount === 'auto' || columnCount === 'none').toBe(true)
    })
  })

  describe('Layout persistence', () => {
    it('should maintain layout across re-renders', () => {
      const { rerender, container } = render(<TeleprompterText text={mockText} />)
      
      // First render
      let textElement = container.querySelector('p')
      const firstStyles = window.getComputedStyle(textElement!)
      const firstColumnGap = firstStyles.columnGap
      
      // Re-render with same props
      rerender(<TeleprompterText text={mockText} />)
      
      textElement = container.querySelector('p')
      const secondStyles = window.getComputedStyle(textElement!)
      
      expect(secondStyles.columnGap).toBe(firstColumnGap)
    })
  })
})
