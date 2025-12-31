"use client";

import React from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/useAuthStore';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { LogOut, Crown } from 'lucide-react';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';

export function PublicNavbar() {
  const { user, isPro } = useAuthStore();
  const { logout } = useSupabaseAuth();

  return (
    <nav className="border-b border-gray-800 bg-gray-950/80 backdrop-blur sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">
          Glean Teleprompter
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link href="/demo" className="text-gray-300 hover:text-white transition-colors">
            Try Demo
          </Link>
          <Link href="/quickstart" className="text-gray-300 hover:text-white transition-colors">
            Templates
          </Link>
        </div>

        {!user ? (
          <div className="flex gap-2 items-center">
            <ThemeSwitcher />
            <Link
              href="/auth/login"
              className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors"
            >
              Log In
            </Link>
            <Link
              href="/auth/sign-up"
              className="px-4 py-2 text-sm bg-gradient-to-r from-pink-500 to-violet-500 text-white font-bold rounded-full hover:shadow-lg hover:shadow-pink-500/25 transition-all"
            >
              Sign Up
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <ThemeSwitcher />
            <Link
              href="/dashboard"
              className="px-4 py-2 text-sm bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Dashboard
            </Link>
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-800 rounded-lg">
              <div className="flex flex-col items-end">
                <span className="text-xs text-gray-300 max-w-[100px] truncate">{user.email}</span>
                {isPro && (
                  <span className="text-[10px] text-yellow-400 font-bold flex items-center gap-0.5">
                    <Crown size={8} /> PRO
                  </span>
                )}
              </div>
              <button
                onClick={logout}
                className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors"
                aria-label="Logout"
              >
                <LogOut size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile menu items */}
      <div className="md:hidden border-t border-gray-800 py-3 flex justify-around items-center">
        <Link href="/demo" className="text-sm text-gray-400 hover:text-white">
          Demo
        </Link>
        <Link href="/quickstart" className="text-sm text-gray-400 hover:text-white">
          Templates
        </Link>
        <ThemeSwitcher />
      </div>
    </nav>
  );
}
