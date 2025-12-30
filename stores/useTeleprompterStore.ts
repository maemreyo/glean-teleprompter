import { create } from 'zustand';

type FontStyle = 'Classic' | 'Modern' | 'Typewriter' | 'Novel' | 'Neon';
type TextAlign = 'left' | 'center';

interface TeleprompterState {
  text: string;
  bgUrl: string;
  musicUrl: string;
  font: FontStyle;
  colorIndex: number;
  align: TextAlign;
  speed: number;
  fontSize: number;
  overlayOpacity: number;
  isReadOnly: boolean;
  mode: 'setup' | 'running';
  
  lineHeight: number;
  margin: number;
  
  // Actions
  setText: (text: string) => void;
  setBgUrl: (url: string) => void;
  setMusicUrl: (url: string) => void;
  setFont: (font: FontStyle) => void;
  setColorIndex: (index: number) => void;
  setAlign: (align: TextAlign) => void;
  setSpeed: (speed: number) => void;
  setFontSize: (size: number) => void;
  setLineHeight: (height: number) => void;
  setMargin: (margin: number) => void;
  setMode: (mode: 'setup' | 'running') => void;
  setIsReadOnly: (api: boolean) => void;
  reset: () => void;
  
  // Bulk update (for loading from URL/DB)
  setAll: (state: Partial<TeleprompterState>) => void;
}

const DEFAULT_BG = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop';
const DEFAULT_TEXT = 'Chào mừng! Hãy nhập nội dung của bạn vào đây...';

export const useTeleprompterStore = create<TeleprompterState>((set) => ({
  text: DEFAULT_TEXT,
  bgUrl: DEFAULT_BG,
  musicUrl: '',
  font: 'Classic',
  colorIndex: 0,
  align: 'center',
  speed: 2,
  fontSize: 48,
  lineHeight: 1.5,
  margin: 0,
  overlayOpacity: 0.5,
  isReadOnly: false,
  mode: 'setup',

  setText: (text) => set({ text }),
  setBgUrl: (bgUrl) => set({ bgUrl }),
  setMusicUrl: (musicUrl) => set({ musicUrl }),
  setFont: (font) => set({ font }),
  setColorIndex: (colorIndex) => set({ colorIndex }),
  setAlign: (align) => set({ align }),
  setSpeed: (speed) => set({ speed }),
  setFontSize: (fontSize) => set({ fontSize }),
  setLineHeight: (lineHeight) => set({ lineHeight }),
  setMargin: (margin) => set({ margin }),
  setMode: (mode) => set({ mode }),
  setIsReadOnly: (isReadOnly) => set({ isReadOnly }),
  
  setAll: (newState) => set((state) => ({ ...state, ...newState })),
  
  reset: () => set({
    text: DEFAULT_TEXT,
    bgUrl: DEFAULT_BG,
    musicUrl: '',
    font: 'Classic',
    colorIndex: 0,
    align: 'center',
    mode: 'setup',
    isReadOnly: false,
    lineHeight: 1.5,
    margin: 0
  })
}));
