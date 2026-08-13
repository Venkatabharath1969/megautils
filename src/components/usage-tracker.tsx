'use client'

import { useState, useEffect } from 'react'
import { Sparkles, X } from 'lucide-react'

const DAILY_FREE_LIMIT = 10
const STORAGE_KEY = 'utilsnow-usage'

interface UsageData {
  date: string  // YYYY-MM-DD
  count: number
}

function getUsage(): UsageData {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    const today = new Date().toISOString().split('T')[0]
    if (stored.date === today) return stored
    return { date: today, count: 0 }
  } catch {
    return { date: new Date().toISOString().split('T')[0], count: 0 }
  }
}

function incrementUsage(): UsageData {
  const usage = getUsage()
  usage.count++
  localStorage.setItem(STORAGE_KEY, JSON.stringify(usage))
  return usage
}

export function useUsageTracker() {
  const [usage, setUsage] = useState<UsageData>({ date: '', count: 0 })
  
  useEffect(() => {
    setUsage(getUsage())
  }, [])

  const trackUse = () => {
    const updated = incrementUsage()
    setUsage(updated)
  }

  return { usage, trackUse, isOverLimit: usage.count >= DAILY_FREE_LIMIT }
}

export function ProUpsellBanner() {
  const [usage, setUsage] = useState<UsageData>({ date: '', count: 0 })
  const [dismissed, setDismissed] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setHydrated(true)
    setUsage(incrementUsage())
  }, [])

  if (!hydrated || dismissed || usage.count < DAILY_FREE_LIMIT) return null

  return (
    <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-xl p-4 mb-6">
      <div className="flex items-start gap-3">
        <Sparkles className="h-5 w-5 text-purple-500 shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-sm font-semibold mb-1">You&apos;ve used {usage.count} tools today!</h3>
          <p className="text-xs text-muted-foreground mb-3">
            Upgrade to UtilsNow Pro for unlimited usage, no ads, batch processing, and priority support.
          </p>
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-primary">$4.99/month</span>
            <span className="text-xs text-muted-foreground line-through">$9.99/month</span>
            <span className="text-[10px] bg-green-500/10 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full font-medium">50% OFF LAUNCH</span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-2">Coming soon — join the waitlist to get notified</p>
        </div>
        <button onClick={() => setDismissed(true)} className="text-muted-foreground hover:text-foreground" aria-label="Dismiss">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
