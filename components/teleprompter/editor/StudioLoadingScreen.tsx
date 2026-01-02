"use client"

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations } from 'next-intl'
import {
  ContentPanelSkeleton,
  ConfigPanelSkeleton,
  PreviewPanelSkeleton
} from '../config/ui/LoadingSkeleton'

/**
 * StudioLoadingScreen - Professional loading state with skeleton screens
 * Replaces "Loading Studio..." text with animated skeleton screens for all panels
 * Features 300ms fade-out animation via Framer Motion
 */
export function StudioLoadingScreen() {
  const t = useTranslations('LoadingStates')
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 0.3 }}
      className="w-full h-screen bg-black text-white overflow-hidden"
    >
      {/* Loading message overlay */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50 bg-black/50">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-card/90 backdrop-blur-sm border border-border rounded-lg px-6 py-3 shadow-xl"
        >
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-medium">{t('loadingStudio')}</span>
          </div>
        </motion.div>
      </div>

      {/* Three-panel layout matching Editor.tsx */}
      <div className="flex h-full">
        <AnimatePresence mode="wait">
          {/* Content Panel Skeleton */}
          <motion.div
            key="content-skeleton"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <ContentPanelSkeleton />
          </motion.div>

          {/* Config Panel Skeleton */}
          <motion.div
            key="config-skeleton"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <ConfigPanelSkeleton />
          </motion.div>

          {/* Preview Panel Skeleton */}
          <motion.div
            key="preview-skeleton"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <PreviewPanelSkeleton />
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
