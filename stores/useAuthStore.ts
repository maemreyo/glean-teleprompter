import { create } from 'zustand';
import { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  isPro: boolean;
  isLoading: boolean;
  
  setUser: (user: User | null) => void;
  setIsPro: (isPro: boolean) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isPro: false,
  isLoading: true,

  setUser: (user) => set({ user }),
  setIsPro: (isPro) => set({ isPro }),
  setLoading: (isLoading) => set({ isLoading }),
  logout: () => set({ user: null, isPro: false })
}));
