"use client";

import React from 'react';
import { X, Sparkles } from 'lucide-react';
import { useDemoStore } from '@/stores/useDemoStore';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { useTranslations } from 'next-intl';

export function DemoBanner() {
  const { showWarning, setShowWarning } = useDemoStore();
  const t = useTranslations('Demo');

  if (!showWarning) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-linear-to-r from-pink-500/20 to-violet-500/20 border-b border-pink-500/30 backdrop-blur-sm"
      >
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-pink-400" />
            <div>
              <span className="font-bold text-pink-400">{t('mode')}</span>
              <span className="text-gray-300 ml-2">
                {t('signUpToSave')}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeSwitcher />
            <Link
              href="/auth/sign-up"
              className="px-4 py-1.5 bg-pink-500 text-white text-sm font-bold rounded-full hover:bg-pink-600 transition-colors"
            >
              {t('signUpFree')}
            </Link>
            <button
              onClick={() => setShowWarning(false)}
              className="p-1 hover:bg-white/10 rounded transition-colors"
              aria-label={t('dismiss')}
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
