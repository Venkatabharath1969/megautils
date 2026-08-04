// Placeholder for Google AdSense ads
// Replace with actual AdSense code after approval
export function AdSlot({ slot, format = 'auto', className = '' }: { slot: string; format?: string; className?: string }) {
  if (process.env.NODE_ENV === 'development') {
    return (
      <div className={`bg-muted/50 border border-dashed border-border rounded-lg flex items-center justify-center text-xs text-muted-foreground p-4 ${className}`}>
        Ad Slot: {slot}
      </div>
    )
  }
  return (
    <div className={className}>
      {/* Google AdSense will go here after approval */}
      {/* <ins className="adsbygoogle" style={{display:'block'}} data-ad-client="ca-pub-XXXXX" data-ad-slot={slot} data-ad-format={format}></ins> */}
    </div>
  )
}
