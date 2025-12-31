import { create } from 'zustand';

interface DemoState {
  isDemoMode: boolean;
  showWarning: boolean;
  
  // Actions
  setDemoMode: (isDemo: boolean) => void;
  setShowWarning: (show: boolean) => void;
  reset: () => void;
}

export const useDemoStore = create<DemoState>((set) => ({
  isDemoMode: false,
  showWarning: true,
  
  setDemoMode: (isDemoMode) => set({ isDemoMode }),
  setShowWarning: (showWarning) => set({ showWarning }),
  
  reset: () => set({
    isDemoMode: false,
    showWarning: true
  })
}));
