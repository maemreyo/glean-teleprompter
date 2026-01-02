"use client";

import React from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/useAuthStore';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { LogOut, Crown } from 'lucide-react';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { useTranslations } from 'next-intl';

export function PublicNavbar() {
  const { user, isPro } = useAuthStore();
  const { logout } = useSupabaseAuth();
  const t = useTranslations('Navigation');

  return (
    <nav className="border-b border-border bg-background/80 backdrop-blur sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">
          {t('brand')}
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link href="/demo" className="text-muted-foreground hover:text-foreground transition-colors">
            {t('tryDemo')}
          </Link>
          <Link href="/quickstart" className="text-muted-foreground hover:text-foreground transition-colors">
            {t('templates')}
          </Link>
        </div>

        {!user ? (
          <div className="flex gap-2 items-center">
            <ThemeSwitcher />
            <Link
              href="/auth/login"
              className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {t('logIn')}
            </Link>
            <Link
              href="/auth/sign-up"
              className="px-4 py-2 text-sm bg-gradient-to-r from-pink-500 to-violet-500 text-white font-bold rounded-full hover:shadow-lg hover:shadow-pink-500/25 transition-all"
            >
              {t('signUp')}
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <ThemeSwitcher />
            <Link
              href="/dashboard"
              className="px-4 py-2 text-sm bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
            >
              {t('dashboard')}
            </Link>
            <div className="flex items-center gap-2 px-3 py-2 bg-secondary rounded-lg">
              <div className="flex flex-col items-end">
                <span className="text-xs text-secondary-foreground max-w-[100px] truncate">{user.email}</span>
                {isPro && (
                  <span className="text-[10px] text-yellow-400 font-bold flex items-center gap-0.5">
                    <Crown size={8} /> PRO
                  </span>
                )}
              </div>
              <button
                onClick={logout}
                className="p-1 hover:bg-secondary-foreground/10 rounded text-muted-foreground hover:text-secondary-foreground transition-colors"
                aria-label={t('logout')}
              >
                <LogOut size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile menu items */}
      <div className="md:hidden border-t border-border py-3 flex justify-around items-center">
        <Link href="/demo" className="text-sm text-muted-foreground hover:text-foreground">
          {t('demo')}
        </Link>
        <Link href="/quickstart" className="text-sm text-muted-foreground hover:text-foreground">
          {t('templates')}
        </Link>
        <ThemeSwitcher />
      </div>
    </nav>
  );
}
