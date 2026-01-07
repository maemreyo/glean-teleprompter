"use client"

import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'

/**
 * ContentPanelSkeleton - Loading state for the content editing panel
 * Shows header bar and textarea placeholder
 */
export function ContentPanelSkeleton() {
  return (
    <div className="w-full lg:w-[30%] bg-card border-r border-border flex flex-col h-full z-20 relative">
      {/* Header Skeleton */}
      <div className="p-6 border-b border-border flex justify-between items-center gap-2">
        <Skeleton className="h-6 w-32" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      </div>

      {/* Content Area Skeleton */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="w-full h-32 rounded-lg" />
        </div>

        {/* Additional placeholder rows */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="w-full h-24 rounded-lg" />
        </div>
      </div>

      {/* Footer Actions Skeleton */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-card/90 backdrop-blur border-t border-border space-y-2">
        <Skeleton className="w-full h-12 rounded-lg" />
        <div className="grid grid-cols-2 gap-2">
          <Skeleton className="w-full h-10 rounded-lg" />
          <Skeleton className="w-full h-10 rounded-lg" />
        </div>
      </div>
    </div>
  )
}

/**
 * ConfigPanelSkeleton - Loading state for the configuration panel
 * Shows tab bar and content placeholders
 */
export function ConfigPanelSkeleton() {
  return (
    <div className="w-full lg:w-[35%] bg-card border-l border-border flex flex-col h-full z-20 relative overflow-hidden">
      {/* Tab Bar Skeleton */}
      <div className="flex border-b border-border overflow-x-auto">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="shrink-0 px-4 py-3">
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>

      {/* Config Content Skeleton */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Control Group Skeletons */}
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-5 w-28" />
            <div className="space-y-2">
              <Skeleton className="w-full h-10 rounded" />
              <Skeleton className="w-full h-2 rounded" />
              <div className="flex justify-between">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-12" />
              </div>
            </div>
          </div>
        ))}

        {/* Color Picker Skeleton */}
        <div className="space-y-3">
          <Skeleton className="h-5 w-20" />
          <div className="flex gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-10 rounded-full" />
            ))}
          </div>
        </div>

        {/* Select Control Skeleton */}
        <div className="space-y-3">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="w-full h-10 rounded" />
        </div>
      </div>

      {/* Preset Grid Skeleton */}
      <div className="p-4 border-t border-border">
        <Skeleton className="h-5 w-16 mb-3" />
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="aspect-video rounded" />
          ))}
        </div>
      </div>
    </div>
  )
}

/**
 * PreviewPanelSkeleton - Loading state for the preview panel
 * Shows rectangular placeholder matching preview aspect ratio
 */
export function PreviewPanelSkeleton() {
  return (
    <div className="hidden lg:block w-[35%] relative bg-black overflow-hidden animate-pulse">
      {/* Background placeholder */}
      <div className="absolute inset-0 bg-neutral-900" />
      
      {/* Overlay pattern */}
      <div className="absolute inset-0 opacity-10">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(45deg, #ffffff 25%, transparent 25%),
              linear-gradient(-45deg, #ffffff 25%, transparent 25%),
              linear-gradient(45deg, transparent 75%, #ffffff 75%),
              linear-gradient(-45deg, transparent 75%, #ffffff 75%)
            `,
            backgroundSize: '20px 20px',
            backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
          }}
        />
      </div>

      {/* Text placeholder */}
      <div className="absolute inset-0 flex items-center justify-center p-12">
        <div className="w-full space-y-3">
          <Skeleton className="h-4 w-full bg-neutral-700" />
          <Skeleton className="h-4 w-5/6 bg-neutral-700" />
          <Skeleton className="h-4 w-4/6 bg-neutral-700" />
          <Skeleton className="h-4 w-full bg-neutral-700" />
          <Skeleton className="h-4 w-3/4 bg-neutral-700" />
        </div>
      </div>

      {/* Loading indicator */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-neutral-700 border-t-neutral-500 rounded-full animate-spin" />
      </div>
    </div>
  )
}
