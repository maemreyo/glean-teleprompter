/**
 * Unit tests for useContentStore
 * T012: [US1] Unit test for useContentStore actions
 * Created for 007-unified-state-architecture
 */

import { renderHook, act } from '@testing-library/react'
import { useContentStore } from '@/lib/stores/useContentStore'

describe('useContentStore', () => {
  beforeEach(() => {
    // Reset store before each test
    localStorage.clear()
  })

  describe('Initial State', () => {
    it('should have default text value', () => {
      const { result } = renderHook(() => useContentStore())
      expect(result.current.text).toBe('Chào mừng! Hãy nhập nội dung của bạn vào đây...')
    })

    it('should have default bgUrl value', () => {
      const { result } = renderHook(() => useContentStore())
      expect(result.current.bgUrl).toBe('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')
    })

    it('should have default musicUrl as empty', () => {
      const { result } = renderHook(() => useContentStore())
      expect(result.current.musicUrl).toBe('')
    })

    it('should have default isReadOnly as false', () => {
      const { result } = renderHook(() => useContentStore())
      expect(result.current.isReadOnly).toBe(false)
    })
  })

  describe('setText action', () => {
    it('should update text content', () => {
      const { result } = renderHook(() => useContentStore())
      const newText = 'New test content'

      act(() => {
        result.current.setText(newText)
      })

      expect(result.current.text).toBe(newText)
    })

    it('should persist text to localStorage', () => {
      const { result, unmount } = renderHook(() => useContentStore())
      const newText = 'Persistent text'

      act(() => {
        result.current.setText(newText)
      })

      // Unmount to simulate component unmount
      unmount()

      // Check localStorage
      const storedData = localStorage.getItem('teleprompter-content')
      expect(storedData).toBeDefined()
      
      if (storedData) {
        const parsed = JSON.parse(storedData)
        expect(parsed.state.text).toBe(newText)
      }
    })
  })

  describe('setBgUrl action', () => {
    it('should update background URL', () => {
      const { result } = renderHook(() => useContentStore())
      const newUrl = 'https://example.com/background.jpg'

      act(() => {
        result.current.setBgUrl(newUrl)
      })

      expect(result.current.bgUrl).toBe(newUrl)
    })
  })

  describe('setMusicUrl action', () => {
    it('should update music URL', () => {
      const { result } = renderHook(() => useContentStore())
      const newUrl = 'https://example.com/music.mp3'

      act(() => {
        result.current.setMusicUrl(newUrl)
      })

      expect(result.current.musicUrl).toBe(newUrl)
    })
  })

  describe('setIsReadOnly action', () => {
    it('should update read-only state to true', () => {
      const { result } = renderHook(() => useContentStore())

      act(() => {
        result.current.setIsReadOnly(true)
      })

      expect(result.current.isReadOnly).toBe(true)
    })

    it('should update read-only state to false', () => {
      const { result } = renderHook(() => useContentStore())

      act(() => {
        result.current.setIsReadOnly(true)
        result.current.setIsReadOnly(false)
      })

      expect(result.current.isReadOnly).toBe(false)
    })
  })

  describe('setAll action', () => {
    it('should update multiple properties at once', () => {
      const { result } = renderHook(() => useContentStore())
      const updates = {
        text: 'Bulk update text',
        bgUrl: 'https://example.com/new-bg.jpg',
        musicUrl: 'https://example.com/new-music.mp3'
      }

      act(() => {
        result.current.setAll(updates)
      })

      expect(result.current.text).toBe(updates.text)
      expect(result.current.bgUrl).toBe(updates.bgUrl)
      expect(result.current.musicUrl).toBe(updates.musicUrl)
    })
  })

  describe('reset action', () => {
    it('should reset all state to defaults', () => {
      const { result } = renderHook(() => useContentStore())

      act(() => {
        result.current.setText('Modified text')
        result.current.setBgUrl('https://example.com/bg.jpg')
        result.current.setMusicUrl('https://example.com/music.mp3')
        result.current.setIsReadOnly(true)
      })

      act(() => {
        result.current.reset()
      })

      expect(result.current.text).toBe('Chào mừng! Hãy nhập nội dung của bạn vào đây...')
      expect(result.current.bgUrl).toBe('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')
      expect(result.current.musicUrl).toBe('')
      expect(result.current.isReadOnly).toBe(false)
    })
  })

  describe('resetContent action', () => {
    it('should reset only content properties', () => {
      const { result } = renderHook(() => useContentStore())

      act(() => {
        result.current.setText('Modified text')
        result.current.setBgUrl('https://example.com/bg.jpg')
        result.current.setMusicUrl('https://example.com/music.mp3')
        result.current.setIsReadOnly(true)
      })

      act(() => {
        result.current.resetContent()
      })

      expect(result.current.text).toBe('Chào mừng! Hãy nhập nội dung của bạn vào đây...')
      expect(result.current.bgUrl).toBe('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')
      expect(result.current.musicUrl).toBe('')
      expect(result.current.isReadOnly).toBe(true) // Should preserve isReadOnly
    })
  })

  describe('resetMedia action', () => {
    it('should reset only media properties', () => {
      const { result } = renderHook(() => useContentStore())

      act(() => {
        result.current.setText('Modified text')
        result.current.setBgUrl('https://example.com/bg.jpg')
        result.current.setMusicUrl('https://example.com/music.mp3')
        result.current.setIsReadOnly(true)
      })

      act(() => {
        result.current.resetMedia()
      })

      expect(result.current.text).toBe('Modified text') // Should preserve text
      expect(result.current.bgUrl).toBe('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')
      expect(result.current.musicUrl).toBe('')
      expect(result.current.isReadOnly).toBe(true) // Should preserve isReadOnly
    })
  })

  describe('localStorage persistence', () => {
    it('should persist state to localStorage', () => {
      const { unmount } = renderHook(() => useContentStore())

      unmount()

      const storedData = localStorage.getItem('teleprompter-content')
      expect(storedData).toBeDefined()
    })

    it('should restore state from localStorage on hydration', () => {
      // Set up initial state in localStorage
      const initialState = {
        state: {
          text: 'Stored text',
          bgUrl: 'https://example.com/stored-bg.jpg',
          musicUrl: 'https://example.com/stored-music.mp3',
          isReadOnly: true
        }
      }
      localStorage.setItem('teleprompter-content', JSON.stringify(initialState))

      // Create new store instance
      const { result } = renderHook(() => useContentStore())

      expect(result.current.text).toBe('Stored text')
      expect(result.current.bgUrl).toBe('https://example.com/stored-bg.jpg')
      expect(result.current.musicUrl).toBe('https://example.com/stored-music.mp3')
      expect(result.current.isReadOnly).toBe(true)
    })
  })
})
