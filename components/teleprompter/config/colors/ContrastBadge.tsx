'use client'

import { cn } from '@/lib/utils'
import { Check, X, AlertCircle } from 'lucide-react'
import type { ContrastValidation } from '@/lib/config/types'

interface ContrastBadgeProps {
  validation: ContrastValidation
  className?: string
}

export function ContrastBadge({ validation, className }: ContrastBadgeProps) {
  const { level, ratio } = validation
  
  const getBadgeStyle = () => {
    switch (level) {
      case 'AAA':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700'
      case 'AA':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700'
      case 'FAIL':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700'
      default:
        return 'bg-muted text-muted-foreground border-border'
    }
  }
  
  const getIcon = () => {
    switch (level) {
      case 'AAA':
        return <Check className="w-3.5 h-3.5" />
      case 'AA':
        return <Check className="w-3.5 h-3.5" />
      case 'FAIL':
        return <X className="w-3.5 h-3.5" />
      default:
        return <AlertCircle className="w-3.5 h-3.5" />
    }
  }
  
  return (
    <div className={cn(
      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium',
      getBadgeStyle(),
      className
    )}>
      {getIcon()}
      <span className="font-semibold">{level}</span>
      <span className="text-opacity-70">({ratio.toFixed(1)}:1)</span>
    </div>
  )
}
