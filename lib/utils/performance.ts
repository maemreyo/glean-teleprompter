/**
 * Performance monitoring utilities
 * Implements FPS monitoring and typing latency measurement
 */

import { useEffect, useRef, useState } from 'react'

/**
 * Performance metrics result
 */
export interface PerformanceMetrics {
  fps: number
  isLowPerformance: boolean
  averageFrameTime: number
}

/**
 * Typing latency measurement result
 */
export interface TypingLatencyResult {
  latency: number // Time in milliseconds
  isSlow: boolean // Whether latency is above threshold
  timestamp: number
}

// Threshold for considering performance "low" (below 30 FPS)
const LOW_FPS_THRESHOLD = 30

// Threshold for considering typing "slow" (above 100ms)
const SLOW_TYPING_THRESHOLD = 100

/**
 * Custom hook for monitoring render performance
 * Tracks FPS using requestAnimationFrame
 * 
 * @param sampleInterval - How often to sample FPS in ms (default: 1000)
 * @returns PerformanceMetrics object
 * 
 * @example
 * const { fps, isLowPerformance } = usePerformanceMonitor()
 * if (isLowPerformance) {
 *   // Reduce animations or simplify rendering
 * }
 */
export function usePerformanceMonitor(sampleInterval: number = 1000): PerformanceMetrics {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    isLowPerformance: false,
    averageFrameTime: 16.67, // ~60fps
  })

  const frameTimesRef = useRef<number[]>([])
  const lastFrameTimeRef = useRef<number>(performance.now())
  const rafIdRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    let lastSampleTime = performance.now()

    const measureFrame = (currentTime: number) => {
      const frameTime = currentTime - lastFrameTimeRef.current
      lastFrameTimeRef.current = currentTime

      // Store frame time
      frameTimesRef.current.push(frameTime)

      // Sample FPS at the specified interval
      if (currentTime - lastSampleTime >= sampleInterval) {
        // Calculate average frame time from collected samples
        const totalFrameTime = frameTimesRef.current.reduce((sum, time) => sum + time, 0)
        const avgFrameTime = totalFrameTime / frameTimesRef.current.length

        // Calculate FPS
        const fps = Math.round(1000 / avgFrameTime)

        setMetrics({
          fps,
          isLowPerformance: fps < LOW_FPS_THRESHOLD,
          averageFrameTime: avgFrameTime,
        })

        // Reset samples
        frameTimesRef.current = []
        lastSampleTime = currentTime
      }

      rafIdRef.current = requestAnimationFrame(measureFrame)
    }

    rafIdRef.current = requestAnimationFrame(measureFrame)

    return () => {
      if (rafIdRef.current !== undefined) {
        cancelAnimationFrame(rafIdRef.current)
      }
    }
  }, [sampleInterval])

  return metrics
}

/**
 * Measure the time it takes for text to render
 * Useful for detecting input lag
 * 
 * @param text - The text to render
 * @param renderFn - Function that performs the rendering
 * @returns Promise with typing latency result
 * 
 * @example
 * const result = await measureTypingLatency('Hello world', (text) => {
 *   textarea.value = text
 *   // Trigger any React re-renders
 * })
 * console.log(`Typing latency: ${result.latency}ms`)
 */
export async function measureTypingLatency(
  text: string,
  renderFn: (text: string) => void | Promise<void>
): Promise<TypingLatencyResult> {
  const startTime = performance.now()

  // Perform the render operation
  await renderFn(text)

  // Wait for next paint to ensure rendering is complete
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        resolve()
      })
    })
  })

  const endTime = performance.now()
  const latency = endTime - startTime

  return {
    latency: Math.round(latency),
    isSlow: latency > SLOW_TYPING_THRESHOLD,
    timestamp: Date.now(),
  }
}

/**
 * Create a performance marker for Chrome DevTools Performance tab
 * 
 * @param name - Marker name
 * @param detail - Optional detail string
 * 
 * @example
 * performanceMark('typing-start', { char: 'a' })
 * // ... do work ...
 * performanceMark('typing-end', { char: 'a' })
 * performanceMeasure('typing', 'typing-start', 'typing-end')
 */
export function performanceMark(name: string, detail?: string): void {
  if (typeof performance !== 'undefined' && performance.mark) {
    try {
      performance.mark(name, { detail } as PerformanceMarkOptions)
    } catch (e) {
      // Mark may already exist, ignore
    }
  }
}

/**
 * Create a performance measure between two marks
 * 
 * @param name - Measure name
 * @param startMark - Starting mark name
 * @param endMark - Ending mark name
 * @returns The duration in ms, or null if measurement failed
 * 
 * @example
 * const duration = performanceMeasure('typing', 'typing-start', 'typing-end')
 * console.log(`Typing took ${duration}ms`)
 */
export function performanceMeasure(
  name: string,
  startMark: string,
  endMark: string
): number | null {
  if (typeof performance !== 'undefined' && performance.measure) {
    try {
      performance.measure(name, startMark, endMark)
      const entries = performance.getEntriesByName(name, 'measure')
      if (entries.length > 0) {
        const duration = entries[0].duration
        // Clean up marks and measure
        performance.clearMarks(startMark)
        performance.clearMarks(endMark)
        performance.clearMeasures(name)
        return Math.round(duration)
      }
    } catch (e) {
      // Measure may have failed, ignore
    }
  }
  return null
}

/**
 * Throttle a function based on performance
 * If FPS is low, throttle more aggressively
 * 
 * @param fn - Function to throttle
 * @param metrics - Performance metrics from usePerformanceMonitor
 * @param baseDelay - Base delay in ms (default: 16)
 * @returns Throttled function
 * 
 * @example
 * const throttledUpdate = throttleByPerformance(updatePreview, metrics, 50)
 */
export function throttleByPerformance<T extends (...args: any[]) => any>(
  fn: T,
  metrics: PerformanceMetrics,
  baseDelay: number = 16
): T {
  let lastCall = 0

  return ((...args: Parameters<T>) => {
    const now = performance.now()
    
    // Adjust delay based on performance
    // If low performance, increase delay to reduce CPU load
    const delayMultiplier = metrics.isLowPerformance ? 3 : 1
    const delay = baseDelay * delayMultiplier

    if (now - lastCall >= delay) {
      lastCall = now
      return fn(...args)
    }
  }) as T
}

/**
 * Debounce a function based on performance
 * If FPS is low, debounce for longer
 * 
 * @param fn - Function to debounce
 * @param metrics - Performance metrics from usePerformanceMonitor
 * @param baseDelay - Base delay in ms (default: 300)
 * @returns Debounced function
 * 
 * @example
 * const debouncedSave = debounceByPerformance(saveDraft, metrics, 500)
 */
export function debounceByPerformance<T extends (...args: any[]) => any>(
  fn: T,
  metrics: PerformanceMetrics,
  baseDelay: number = 300
): T {
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  return ((...args: Parameters<T>) => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId)
    }

    // Adjust delay based on performance
    const delayMultiplier = metrics.isLowPerformance ? 2 : 1
    const delay = baseDelay * delayMultiplier

    timeoutId = setTimeout(() => {
      fn(...args)
      timeoutId = null
    }, delay)
  }) as T
}

/**
 * Hook to detect if the user's device has reduced performance
 * Based on navigator.hardwareConcurrency and device memory
 * 
 * @returns Whether device appears to have limited performance
 */
export function useReducedPerformance(): boolean {
  const [isReduced, setIsReduced] = useState(false)

  useEffect(() => {
    // Check for low core count
    const hardwareConcurrency = navigator.hardwareConcurrency || 4
    const isLowCpu = hardwareConcurrency <= 2

    // Check for low memory (if available)
    // @ts-expect-error - deviceMemory is not in standard types
    const deviceMemory = navigator.deviceMemory || 8
    const isLowMemory = deviceMemory <= 2

    setIsReduced(isLowCpu || isLowMemory)
  }, [])

  return isReduced
}

/**
 * Performance budget configuration
 */
export interface PerformanceBudget {
  maxScriptSize: number // In bytes
  maxRenderTime: number // In ms
  maxFpsDrop: number // Acceptable FPS drop from 60
}

/**
 * Default performance budgets
 */
export const DEFAULT_BUDGETS: PerformanceBudget = {
  maxScriptSize: 200 * 1024, // 200KB
  maxRenderTime: 100, // 100ms
  maxFpsDrop: 10, // 50fps minimum
}

/**
 * Check if current performance meets budget requirements
 * 
 * @param metrics - Performance metrics
 * @param budget - Performance budget to check against
 * @returns Whether performance is within budget
 */
export function isPerformanceWithinBudget(
  metrics: PerformanceMetrics,
  budget: PerformanceBudget = DEFAULT_BUDGETS
): boolean {
  const fps = metrics.fps
  const fpsDrop = 60 - fps

  return (
    fpsDrop <= budget.maxFpsDrop &&
    metrics.averageFrameTime <= budget.maxRenderTime
  )
}
