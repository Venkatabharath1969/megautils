'use client'

import { useState, useMemo } from 'react'
import { ToolPage, ToolTextarea, ClearButton } from '@/components/tool-page'

const PLATFORMS = [
  { name: 'Twitter/X', limit: 280, color: 'bg-black dark:bg-white/20' },
  { name: 'Threads', limit: 500, color: 'bg-black dark:bg-white/20' },
  { name: 'YouTube Title', limit: 100, color: 'bg-red-500' },
  { name: 'LinkedIn', limit: 3000, color: 'bg-blue-600' },
  { name: 'Instagram', limit: 2200, color: 'bg-gradient-to-r from-purple-500 to-pink-500' },
  { name: 'TikTok', limit: 2200, color: 'bg-black dark:bg-white/20' },
  { name: 'Facebook', limit: 63206, color: 'bg-blue-500' },
  { name: 'YouTube Description', limit: 5000, color: 'bg-red-500' },
]

export default function SocialMediaCounterTool() {
  const [text, setText] = useState('')

  const charCount = useMemo(() => text.length, [text])

  return (
    <ToolPage title="Social Media Character Counter" description="Check your text against character limits for Twitter/X, LinkedIn, Instagram, Facebook, TikTok, Threads, and YouTube." category="content" categoryLabel="Content Tools">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold">Your Text</span>
          <ClearButton onClear={() => setText('')} />
        </div>
        <ToolTextarea value={text} onChange={setText} placeholder="Type or paste your social media post here..." rows={6} />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {PLATFORMS.map(platform => {
            const remaining = platform.limit - charCount
            const percentage = Math.min(100, (charCount / platform.limit) * 100)
            const isOver = remaining < 0
            const isNear = remaining >= 0 && remaining < platform.limit * 0.1

            return (
              <div key={platform.name} className={`p-3 rounded-lg border ${isOver ? 'border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/30' : 'border-border bg-muted'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-2 h-2 rounded-full ${platform.color}`} />
                  <span className="text-xs font-semibold">{platform.name}</span>
                </div>

                <div className="flex items-baseline justify-between mb-1.5">
                  <span className={`text-2xl font-bold ${isOver ? 'text-red-500' : isNear ? 'text-yellow-500' : 'text-primary'}`}>
                    {charCount.toLocaleString()}
                  </span>
                  <span className="text-xs text-muted-foreground">/ {platform.limit.toLocaleString()}</span>
                </div>

                <div className="w-full h-1.5 rounded-full bg-card overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${isOver ? 'bg-red-500' : isNear ? 'bg-yellow-500' : 'bg-green-500'}`}
                    style={{ width: `${Math.min(100, percentage)}%` }}
                  />
                </div>

                <div className={`text-xs mt-1 font-medium ${isOver ? 'text-red-500' : isNear ? 'text-yellow-600 dark:text-yellow-400' : 'text-muted-foreground'}`}>
                  {isOver ? `${Math.abs(remaining).toLocaleString()} over limit` : `${remaining.toLocaleString()} remaining`}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </ToolPage>
  )
}
