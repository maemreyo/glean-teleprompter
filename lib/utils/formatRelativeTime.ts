/**
 * Format a timestamp as a relative time string
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Relative time string (e.g., "Just now", "5m ago", "2h ago", "3d ago")
 */
export function formatRelativeTime(timestamp: number | null): string {
  if (timestamp === null) {
    return 'Never'
  }

  const now = Date.now()
  const diff = now - timestamp

  // Less than 1 minute
  if (diff < 60 * 1000) {
    return 'Just now'
  }

  // Less than 1 hour
  if (diff < 60 * 60 * 1000) {
    const minutes = Math.floor(diff / (60 * 1000))
    return `${minutes}m ago`
  }

  // Less than 1 day
  if (diff < 24 * 60 * 60 * 1000) {
    const hours = Math.floor(diff / (60 * 60 * 1000))
    return `${hours}h ago`
  }

  // 1 day or more
  const days = Math.floor(diff / (24 * 60 * 60 * 1000))
  return `${days}d ago`
}
