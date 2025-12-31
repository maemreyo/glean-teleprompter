"use client";

import { useEffect } from 'react';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

/**
 * AuthInitializer - Initializes auth state on app mount
 * This component should be rendered once at the app root
 */
export function AuthInitializer() {
  // The useSupabaseAuth hook handles auth initialization via useEffect
  useSupabaseAuth();

  return null;
}
