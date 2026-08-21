'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Users } from 'lucide-react'

/**
 * Animates a number counting up from 0 to target over `duration` ms.
 */
function useCountUp(target: number, duration = 1200): number {
  const [display, setDisplay] = useState(0)
  const animated = useRef(false)

  useEffect(() => {
    if (target <= 0 || animated.current) return
    animated.current = true
    const start = performance.now()
    const step = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.floor(eased * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, duration])

  return display
}

/**
 * Format a number with commas: 12847 → "12,847"
 */
function formatNumber(n: number): string {
  return n.toLocaleString('en-US')
}

// ─── Individual Tool Usage Badge ────────────────────────────────────────────

interface UsageCounterProps {
  slug: string
}

export function UsageCounter({ slug }: UsageCounterProps) {
  const [count, setCount] = useState(0)
  const [loaded, setLoaded] = useState(false)
  const animated = useCountUp(count, 1000)

  // Fetch count on mount
  useEffect(() => {
    fetch(`/api/usage?slug=${encodeURIComponent(slug)}`)
      .then(r => r.json())
      .then(data => {
        setCount(data.count || 0)
        setLoaded(true)
      })
      .catch(() => setLoaded(true))
  }, [slug])

  // Track usage once per session per tool (debounced via sessionStorage)
  const trackUsage = useCallback(() => {
    const key = `utilsnow-tracked-${slug}`
    if (typeof window === 'undefined') return
    if (sessionStorage.getItem(key)) return
    sessionStorage.setItem(key, '1')
    fetch('/api/usage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.count) setCount(data.count)
      })
      .catch(() => {})
  }, [slug])

  // Track on mount (once per session)
  useEffect(() => {
    trackUsage()
  }, [trackUsage])

  if (!loaded || count === 0) return null

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-medium">
      <Users className="h-3 w-3" />
      {formatNumber(animated)} uses
    </span>
  )
}

// ─── Homepage Total Usage Counter ───────────────────────────────────────────

export function TotalUsageCounter() {
  const [total, setTotal] = useState(0)
  const [loaded, setLoaded] = useState(false)
  const animated = useCountUp(total, 1500)

  useEffect(() => {
    fetch('/api/usage?total=true')
      .then(r => r.json())
      .then(data => {
        setTotal(data.total || 0)
        setLoaded(true)
      })
      .catch(() => setLoaded(true))
  }, [])

  if (!loaded) {
    return (
      <span className="text-2xl font-bold text-primary">---</span>
    )
  }

  return (
    <span className="text-2xl font-bold text-primary">
      {formatNumber(animated)}+
    </span>
  )
}
