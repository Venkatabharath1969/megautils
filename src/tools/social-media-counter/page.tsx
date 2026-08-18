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
    <ToolPage title="Social Media Character Counter" description="Check your text against character limits for Twitter/X, LinkedIn, Instagram, Facebook, TikTok, Threads, and YouTube." category="content" categoryLabel="Content Tools"
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>Social Media Character Counter is a free browser-based tool that lets you count characters for social media platforms with specific limits for Twitter/X (280), Instagram (2200), LinkedIn (3000), and more. It processes everything locally in your browser using JavaScript, so your data never leaves your device. No sign-up, no installation, and no server uploads required — just open the tool and start using it immediately.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Enter your data or content in the <strong>input area</strong>.</li>
            <li>Configure any available options or settings to match your needs.</li>
            <li>View the <strong>result instantly</strong> in the output area.</li>
            <li>Use the <strong>Copy</strong> or <strong>Download</strong> button to save your result.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>This tool is particularly useful when ensuring posts fit within platform character limits, optimizing content length for engagement. Since it runs entirely in your browser, it works offline after the page loads and keeps your data completely private. Whether you are a developer, designer, student, or professional, this social media tool saves time and eliminates the need for desktop software installation.</p>

          <h2>Tips and Best Practices</h2>
          <ul>
            <li>All processing happens locally in your browser — your data is never sent to any server, making it safe for sensitive content.</li>
            <li>The tool works on any modern browser including Chrome, Firefox, Safari, and Edge on both desktop and mobile devices.</li>
            <li>No account or sign-up is required — the tool is completely free with no usage limits.</li>
            <li>Use the Copy button to quickly transfer results to your clipboard for pasting into other applications.</li>
            <li>Bookmark this page for quick access whenever you need character counting.</li>
          </ul>
        </>
      }
 faqs={[
        { question: 'What is the character limit for Twitter/X posts?', answer: 'Twitter/X has a 280-character limit for standard posts. Verified subscribers on X Premium may have higher limits up to 25,000 characters.' },
        { question: 'What is the Instagram caption character limit?', answer: 'Instagram captions have a maximum limit of 2,200 characters. However, captions are truncated after about 125 characters in the feed, so put your most important text first.' },
        { question: 'What is the LinkedIn post character limit?', answer: 'LinkedIn posts support up to 3,000 characters. Content is truncated after about 140 characters with a "see more" link, so lead with a compelling hook.' },
        { question: 'Do hashtags count toward character limits?', answer: 'Yes, hashtags count toward the character limit on all social media platforms. Each hashtag uses characters equal to the # symbol plus the tag text.' },
      ]}>
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
