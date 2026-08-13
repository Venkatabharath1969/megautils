'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, ArrowRight, Sparkles } from 'lucide-react'
import Fuse from 'fuse.js'
import { TOOLS, CATEGORIES, type Tool } from '@/lib/tool-registry'

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  // Fuse.js instance
  const fuse = useMemo(() => new Fuse(TOOLS, {
    keys: [
      { name: 'name', weight: 3 },
      { name: 'keywords', weight: 2 },
      { name: 'description', weight: 1 },
      { name: 'category', weight: 0.5 },
    ],
    threshold: 0.4,
    distance: 100,
    minMatchCharLength: 2,
    ignoreLocation: true,
    includeScore: true,
  }), [])

  // Get recent tools from localStorage
  const [recentIds, setRecentIds] = useState<string[]>([])
  useEffect(() => {
    if (!open) return
    try {
      const stored = JSON.parse(localStorage.getItem('utilsnow-recent-tools') || '[]')
      setRecentIds(stored)
    } catch {
      // ignore
    }
  }, [open])

  // Search results
  const results = useMemo(() => {
    if (!query.trim()) return []
    return fuse.search(query).slice(0, 8).map(r => r.item)
  }, [query, fuse])

  // Popular tools when no query
  const popularTools = useMemo(() => {
    const popularIds = ['json-formatter', 'base64-encoder', 'qr-code-generator', 'word-counter', 'password-generator', 'color-picker', 'image-resizer', 'ai-bg-remover']
    return popularIds.map(id => TOOLS.find(t => t.id === id)).filter(Boolean) as Tool[]
  }, [])

  const recentTools = useMemo(() => {
    return recentIds.map(id => TOOLS.find(t => t.id === id)).filter(Boolean).slice(0, 5) as Tool[]
  }, [recentIds])

  // Display items (what's shown in the list)
  const displayItems = query.trim() ? results : [...recentTools, ...popularTools.filter(p => !recentIds.includes(p.id))].slice(0, 8)

  // Global Cmd+K handler
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(prev => !prev)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setQuery('')
      setActiveIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  // Scroll active item into view
  useEffect(() => {
    if (!listRef.current) return
    const activeEl = listRef.current.querySelector(`[data-index="${activeIndex}"]`)
    if (activeEl) {
      activeEl.scrollIntoView({ block: 'nearest' })
    }
  }, [activeIndex])

  // Navigate to tool
  const selectTool = useCallback((tool: Tool) => {
    // Save to recent
    const updated = [tool.id, ...recentIds.filter(id => id !== tool.id)].slice(0, 10)
    localStorage.setItem('utilsnow-recent-tools', JSON.stringify(updated))
    setOpen(false)
    router.push(`/tools/${tool.id}`)
  }, [recentIds, router])

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex(prev => Math.min(prev + 1, displayItems.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex(prev => Math.max(prev - 1, 0))
    } else if (e.key === 'Enter' && displayItems[activeIndex]) {
      e.preventDefault()
      selectTool(displayItems[activeIndex])
    }
  }

  // Public method to open from outside (used by header trigger)
  // We expose this via a custom event
  useEffect(() => {
    const handleOpen = () => setOpen(true)
    window.addEventListener('open-command-palette', handleOpen)
    return () => window.removeEventListener('open-command-palette', handleOpen)
  }, [])

  if (!open) return null

  const getCategoryLabel = (catId: string) => {
    return CATEGORIES.find(c => c.id === catId)?.label || catId
  }

  return (
    <div className="fixed inset-0 z-[100]" onClick={() => setOpen(false)}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Dialog */}
      <div className="relative mx-auto mt-[15vh] max-w-xl w-[95%] sm:w-full" onClick={e => e.stopPropagation()}>
        <div className="bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
          {/* Search input */}
          <div className="flex items-center gap-3 px-4 border-b border-border">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => { setQuery(e.target.value); setActiveIndex(0) }}
              onKeyDown={handleKeyDown}
              placeholder="Search tools... (e.g. 'json format', 'resize image')"
              className="flex-1 h-12 bg-transparent border-0 outline-none text-sm placeholder:text-muted-foreground"
              autoComplete="off"
              spellCheck={false}
            />
            <kbd className="hidden sm:inline-flex text-[10px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded border border-border">ESC</kbd>
          </div>

          {/* Results */}
          <div ref={listRef} className="max-h-[50vh] overflow-y-auto p-1">
            {/* Section header */}
            {!query.trim() && recentTools.length > 0 && (
              <div className="px-3 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Recent</div>
            )}
            {!query.trim() && recentTools.length === 0 && (
              <div className="px-3 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Popular Tools</div>
            )}
            {query.trim() && results.length === 0 && (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                No tools found for &quot;{query}&quot;
              </div>
            )}
            {query.trim() && results.length > 0 && (
              <div className="px-3 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{results.length} tools found</div>
            )}

            {displayItems.map((tool, i) => (
              <button
                key={tool.id}
                data-index={i}
                onClick={() => selectTool(tool)}
                onMouseEnter={() => setActiveIndex(i)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                  i === activeIndex ? 'bg-primary/10 text-foreground' : 'text-foreground hover:bg-muted'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate">{tool.name}</span>
                    {tool.isAI && (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-500/10 text-purple-600 dark:text-purple-400">
                        <Sparkles className="h-2.5 w-2.5" /> AI
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground truncate block">{getCategoryLabel(tool.category)}</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              </button>
            ))}
          </div>

          {/* Footer */}
          <div className="hidden sm:flex items-center gap-4 px-4 py-2 border-t border-border text-[10px] text-muted-foreground">
            <span>↑↓ navigate</span>
            <span>↵ open</span>
            <span>esc close</span>
          </div>
        </div>
      </div>
    </div>
  )
}
