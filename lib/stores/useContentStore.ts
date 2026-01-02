import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

/**
 * ContentStore - Manages content data and editor mutability state
 *
 * Responsibilities:
 * - Store and manage teleprompter text content
 * - Store and manage media URLs (background image, background music)
 * - Track editor read-only state
 *
 * Persistence: localStorage key 'teleprompter-content'
 */

interface ContentStoreState {
  /** The teleprompter script text content */
  text: string
  /** Background image URL displayed in Runner mode */
  bgUrl: string
  /** Background music URL for audio playback in Runner mode */
  musicUrl: string
  /** Whether the editor is in read-only mode */
  isReadOnly: boolean
}

interface ContentStoreActions {
  /** Set the teleprompter text content */
  setText: (text: string) => void
  /** Set the background image URL */
  setBgUrl: (url: string) => void
  /** Set the background music URL */
  setMusicUrl: (url: string) => void
  /** Set the editor read-only state */
  setIsReadOnly: (readOnly: boolean) => void
  /** Bulk update multiple state properties at once */
  setAll: (state: Partial<ContentStoreState>) => void
  /** Reset all state to default values */
  reset: () => void
  /** Reset only content properties (text, bgUrl, musicUrl) */
  resetContent: () => void
  /** Reset only media properties (bgUrl, musicUrl) */
  resetMedia: () => void
}

type ContentStore = ContentStoreState & ContentStoreActions

const DEFAULT_TEXT = 'Chào mừng! Hãy nhập nội dung của bạn vào đây...'
const DEFAULT_BG = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop'

// Create the store with proper typing
export const useContentStore = create<ContentStore>()(
  persist(
    (set) => ({
      // Initial state
      text: DEFAULT_TEXT,
      bgUrl: DEFAULT_BG,
      musicUrl: '',
      isReadOnly: false,

      // Actions
      setText: (text: string) => set({ text }),

      setBgUrl: (bgUrl: string) => set({ bgUrl }),

      setMusicUrl: (musicUrl: string) => set({ musicUrl }),

      setIsReadOnly: (isReadOnly: boolean) => set({ isReadOnly }),

      setAll: (newState: Partial<ContentStoreState>) => set((state) => ({
        ...state,
        ...newState
      })),

      reset: () => set({
        text: DEFAULT_TEXT,
        bgUrl: DEFAULT_BG,
        musicUrl: '',
        isReadOnly: false
      }),

      resetContent: () => set({
        text: DEFAULT_TEXT,
        bgUrl: DEFAULT_BG,
        musicUrl: ''
      }),

      resetMedia: () => set({
        bgUrl: DEFAULT_BG,
        musicUrl: ''
      })
    }),
    {
      name: 'teleprompter-content',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        text: state.text,
        bgUrl: state.bgUrl,
        musicUrl: state.musicUrl,
        isReadOnly: state.isReadOnly
      })
    }
  )
)
