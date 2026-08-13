'use client'
import { useState, useEffect } from 'react'
import { Star } from 'lucide-react'

export function FavoriteButton({ toolId }: { toolId: string }) {
  const [isFav, setIsFav] = useState(false)
  
  useEffect(() => {
    try {
      const favs = JSON.parse(localStorage.getItem('utilsnow-favorites') || '[]')
      setIsFav(favs.includes(toolId))
    } catch {}
  }, [toolId])

  const toggle = () => {
    const favs = JSON.parse(localStorage.getItem('utilsnow-favorites') || '[]')
    const updated = isFav ? favs.filter((id: string) => id !== toolId) : [...favs, toolId]
    localStorage.setItem('utilsnow-favorites', JSON.stringify(updated))
    setIsFav(!isFav)
  }

  return (
    <button onClick={toggle} aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
      className="inline-flex items-center justify-center w-8 h-8 rounded-md border border-border hover:bg-muted transition-colors">
      <Star className={`h-3.5 w-3.5 ${isFav ? 'fill-yellow-500 text-yellow-500' : 'text-muted-foreground'}`} />
    </button>
  )
}
