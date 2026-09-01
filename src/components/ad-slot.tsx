'use client'

import { useEffect, useRef } from 'react'

export function AdSlot({ slot, format = 'auto', className = '' }: { slot: string; format?: string; className?: string }) {
  const adRef = useRef<HTMLModElement>(null)
  const pushed = useRef(false)

  useEffect(() => {
    if (pushed.current) return
    try {
      const adsbygoogle = (window as any).adsbygoogle || []
      adsbygoogle.push({})
      pushed.current = true
    } catch {}
  }, [])

  if (process.env.NODE_ENV === 'development') {
    return (
      <div className={`bg-muted/50 border border-dashed border-border rounded-lg flex items-center justify-center text-xs text-muted-foreground p-4 ${className}`}>
        Ad Slot: {slot}
      </div>
    )
  }

  return (
    <div className={className}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-3062425605979427"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  )
}
