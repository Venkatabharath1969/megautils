'use client'

import { useState, useMemo, useCallback } from 'react'
import { ToolPage } from '@/components/tool-page'
import { Check, Copy, Search } from 'lucide-react'

interface EmojiItem {
  emoji: string
  name: string
  category: string
}

const EMOJIS: EmojiItem[] = [
  // Smileys & Emotion
  { emoji: '😀', name: 'Grinning Face', category: 'Smileys' },
  { emoji: '😃', name: 'Grinning Face with Big Eyes', category: 'Smileys' },
  { emoji: '😄', name: 'Grinning Face with Smiling Eyes', category: 'Smileys' },
  { emoji: '😁', name: 'Beaming Face', category: 'Smileys' },
  { emoji: '😆', name: 'Grinning Squinting Face', category: 'Smileys' },
  { emoji: '😅', name: 'Grinning Face with Sweat', category: 'Smileys' },
  { emoji: '🤣', name: 'Rolling on the Floor Laughing', category: 'Smileys' },
  { emoji: '😂', name: 'Face with Tears of Joy', category: 'Smileys' },
  { emoji: '🙂', name: 'Slightly Smiling Face', category: 'Smileys' },
  { emoji: '🙃', name: 'Upside Down Face', category: 'Smileys' },
  { emoji: '😉', name: 'Winking Face', category: 'Smileys' },
  { emoji: '😊', name: 'Smiling Face with Smiling Eyes', category: 'Smileys' },
  { emoji: '😇', name: 'Smiling Face with Halo', category: 'Smileys' },
  { emoji: '🥰', name: 'Smiling Face with Hearts', category: 'Smileys' },
  { emoji: '😍', name: 'Heart Eyes', category: 'Smileys' },
  { emoji: '🤩', name: 'Star Struck', category: 'Smileys' },
  { emoji: '😘', name: 'Face Blowing a Kiss', category: 'Smileys' },
  { emoji: '😗', name: 'Kissing Face', category: 'Smileys' },
  { emoji: '😚', name: 'Kissing Face with Closed Eyes', category: 'Smileys' },
  { emoji: '😋', name: 'Face Savoring Food', category: 'Smileys' },
  { emoji: '😛', name: 'Face with Tongue', category: 'Smileys' },
  { emoji: '😜', name: 'Winking Face with Tongue', category: 'Smileys' },
  { emoji: '🤪', name: 'Zany Face', category: 'Smileys' },
  { emoji: '😝', name: 'Squinting Face with Tongue', category: 'Smileys' },
  { emoji: '🤑', name: 'Money Mouth Face', category: 'Smileys' },
  { emoji: '🤗', name: 'Hugging Face', category: 'Smileys' },
  { emoji: '🤔', name: 'Thinking Face', category: 'Smileys' },
  { emoji: '🤐', name: 'Zipper Mouth Face', category: 'Smileys' },
  { emoji: '😐', name: 'Neutral Face', category: 'Smileys' },
  { emoji: '😑', name: 'Expressionless Face', category: 'Smileys' },
  { emoji: '😶', name: 'Face Without Mouth', category: 'Smileys' },
  { emoji: '😏', name: 'Smirking Face', category: 'Smileys' },
  { emoji: '😒', name: 'Unamused Face', category: 'Smileys' },
  { emoji: '🙄', name: 'Face with Rolling Eyes', category: 'Smileys' },
  { emoji: '😬', name: 'Grimacing Face', category: 'Smileys' },
  { emoji: '😮', name: 'Face with Open Mouth', category: 'Smileys' },
  { emoji: '😲', name: 'Astonished Face', category: 'Smileys' },
  { emoji: '😴', name: 'Sleeping Face', category: 'Smileys' },
  { emoji: '🤤', name: 'Drooling Face', category: 'Smileys' },
  { emoji: '😷', name: 'Face with Medical Mask', category: 'Smileys' },
  { emoji: '🤒', name: 'Face with Thermometer', category: 'Smileys' },
  { emoji: '🤕', name: 'Face with Head Bandage', category: 'Smileys' },
  { emoji: '🤢', name: 'Nauseated Face', category: 'Smileys' },
  { emoji: '🤮', name: 'Face Vomiting', category: 'Smileys' },
  { emoji: '🥵', name: 'Hot Face', category: 'Smileys' },
  { emoji: '🥶', name: 'Cold Face', category: 'Smileys' },
  { emoji: '😎', name: 'Smiling Face with Sunglasses', category: 'Smileys' },
  { emoji: '🤓', name: 'Nerd Face', category: 'Smileys' },
  { emoji: '😈', name: 'Smiling Face with Horns', category: 'Smileys' },
  { emoji: '💀', name: 'Skull', category: 'Smileys' },
  // People & Body
  { emoji: '👋', name: 'Waving Hand', category: 'People' },
  { emoji: '🤚', name: 'Raised Back of Hand', category: 'People' },
  { emoji: '✋', name: 'Raised Hand', category: 'People' },
  { emoji: '🖖', name: 'Vulcan Salute', category: 'People' },
  { emoji: '👌', name: 'OK Hand', category: 'People' },
  { emoji: '🤌', name: 'Pinched Fingers', category: 'People' },
  { emoji: '✌️', name: 'Victory Hand', category: 'People' },
  { emoji: '🤞', name: 'Crossed Fingers', category: 'People' },
  { emoji: '🤟', name: 'Love You Gesture', category: 'People' },
  { emoji: '🤘', name: 'Sign of the Horns', category: 'People' },
  { emoji: '👈', name: 'Backhand Index Pointing Left', category: 'People' },
  { emoji: '👉', name: 'Backhand Index Pointing Right', category: 'People' },
  { emoji: '👆', name: 'Backhand Index Pointing Up', category: 'People' },
  { emoji: '👇', name: 'Backhand Index Pointing Down', category: 'People' },
  { emoji: '👍', name: 'Thumbs Up', category: 'People' },
  { emoji: '👎', name: 'Thumbs Down', category: 'People' },
  { emoji: '✊', name: 'Raised Fist', category: 'People' },
  { emoji: '👊', name: 'Oncoming Fist', category: 'People' },
  { emoji: '👏', name: 'Clapping Hands', category: 'People' },
  { emoji: '🙌', name: 'Raising Hands', category: 'People' },
  { emoji: '🤝', name: 'Handshake', category: 'People' },
  { emoji: '🙏', name: 'Folded Hands', category: 'People' },
  { emoji: '💪', name: 'Flexed Biceps', category: 'People' },
  { emoji: '🦾', name: 'Mechanical Arm', category: 'People' },
  { emoji: '👀', name: 'Eyes', category: 'People' },
  { emoji: '👁️', name: 'Eye', category: 'People' },
  // Animals & Nature
  { emoji: '🐶', name: 'Dog Face', category: 'Animals' },
  { emoji: '🐱', name: 'Cat Face', category: 'Animals' },
  { emoji: '🐭', name: 'Mouse Face', category: 'Animals' },
  { emoji: '🐹', name: 'Hamster', category: 'Animals' },
  { emoji: '🐰', name: 'Rabbit Face', category: 'Animals' },
  { emoji: '🦊', name: 'Fox', category: 'Animals' },
  { emoji: '🐻', name: 'Bear', category: 'Animals' },
  { emoji: '🐼', name: 'Panda', category: 'Animals' },
  { emoji: '🐨', name: 'Koala', category: 'Animals' },
  { emoji: '🐯', name: 'Tiger Face', category: 'Animals' },
  { emoji: '🦁', name: 'Lion', category: 'Animals' },
  { emoji: '🐮', name: 'Cow Face', category: 'Animals' },
  { emoji: '🐷', name: 'Pig Face', category: 'Animals' },
  { emoji: '🐸', name: 'Frog', category: 'Animals' },
  { emoji: '🐵', name: 'Monkey Face', category: 'Animals' },
  { emoji: '🐔', name: 'Chicken', category: 'Animals' },
  { emoji: '🐧', name: 'Penguin', category: 'Animals' },
  { emoji: '🐦', name: 'Bird', category: 'Animals' },
  { emoji: '🦅', name: 'Eagle', category: 'Animals' },
  { emoji: '🦆', name: 'Duck', category: 'Animals' },
  { emoji: '🦉', name: 'Owl', category: 'Animals' },
  { emoji: '🐺', name: 'Wolf', category: 'Animals' },
  { emoji: '🐗', name: 'Boar', category: 'Animals' },
  { emoji: '🐴', name: 'Horse Face', category: 'Animals' },
  { emoji: '🦄', name: 'Unicorn', category: 'Animals' },
  { emoji: '🐝', name: 'Honeybee', category: 'Animals' },
  { emoji: '🐛', name: 'Bug', category: 'Animals' },
  { emoji: '🦋', name: 'Butterfly', category: 'Animals' },
  { emoji: '🐌', name: 'Snail', category: 'Animals' },
  { emoji: '🐙', name: 'Octopus', category: 'Animals' },
  { emoji: '🌸', name: 'Cherry Blossom', category: 'Animals' },
  { emoji: '🌻', name: 'Sunflower', category: 'Animals' },
  { emoji: '🌹', name: 'Rose', category: 'Animals' },
  { emoji: '🌲', name: 'Evergreen Tree', category: 'Animals' },
  { emoji: '🌵', name: 'Cactus', category: 'Animals' },
  // Food & Drink
  { emoji: '🍎', name: 'Red Apple', category: 'Food' },
  { emoji: '🍐', name: 'Pear', category: 'Food' },
  { emoji: '🍊', name: 'Tangerine', category: 'Food' },
  { emoji: '🍋', name: 'Lemon', category: 'Food' },
  { emoji: '🍌', name: 'Banana', category: 'Food' },
  { emoji: '🍉', name: 'Watermelon', category: 'Food' },
  { emoji: '🍇', name: 'Grapes', category: 'Food' },
  { emoji: '🍓', name: 'Strawberry', category: 'Food' },
  { emoji: '🍑', name: 'Peach', category: 'Food' },
  { emoji: '🍒', name: 'Cherries', category: 'Food' },
  { emoji: '🍕', name: 'Pizza', category: 'Food' },
  { emoji: '🍔', name: 'Hamburger', category: 'Food' },
  { emoji: '🍟', name: 'French Fries', category: 'Food' },
  { emoji: '🌭', name: 'Hot Dog', category: 'Food' },
  { emoji: '🍿', name: 'Popcorn', category: 'Food' },
  { emoji: '🍩', name: 'Doughnut', category: 'Food' },
  { emoji: '🍪', name: 'Cookie', category: 'Food' },
  { emoji: '🎂', name: 'Birthday Cake', category: 'Food' },
  { emoji: '🍰', name: 'Shortcake', category: 'Food' },
  { emoji: '☕', name: 'Hot Beverage', category: 'Food' },
  // Travel & Places
  { emoji: '🚗', name: 'Car', category: 'Travel' },
  { emoji: '🚕', name: 'Taxi', category: 'Travel' },
  { emoji: '🚌', name: 'Bus', category: 'Travel' },
  { emoji: '🚎', name: 'Trolleybus', category: 'Travel' },
  { emoji: '🚐', name: 'Minibus', category: 'Travel' },
  { emoji: '🚑', name: 'Ambulance', category: 'Travel' },
  { emoji: '🚒', name: 'Fire Engine', category: 'Travel' },
  { emoji: '✈️', name: 'Airplane', category: 'Travel' },
  { emoji: '🚀', name: 'Rocket', category: 'Travel' },
  { emoji: '🛸', name: 'Flying Saucer', category: 'Travel' },
  { emoji: '🏠', name: 'House', category: 'Travel' },
  { emoji: '🏢', name: 'Office Building', category: 'Travel' },
  { emoji: '🏥', name: 'Hospital', category: 'Travel' },
  { emoji: '🏫', name: 'School', category: 'Travel' },
  { emoji: '⛪', name: 'Church', category: 'Travel' },
  { emoji: '🗽', name: 'Statue of Liberty', category: 'Travel' },
  { emoji: '🗼', name: 'Tokyo Tower', category: 'Travel' },
  { emoji: '🌍', name: 'Globe Europe Africa', category: 'Travel' },
  { emoji: '🌎', name: 'Globe Americas', category: 'Travel' },
  { emoji: '🌏', name: 'Globe Asia Australia', category: 'Travel' },
  // Activities
  { emoji: '⚽', name: 'Soccer Ball', category: 'Activities' },
  { emoji: '🏀', name: 'Basketball', category: 'Activities' },
  { emoji: '🏈', name: 'American Football', category: 'Activities' },
  { emoji: '⚾', name: 'Baseball', category: 'Activities' },
  { emoji: '🎾', name: 'Tennis', category: 'Activities' },
  { emoji: '🏐', name: 'Volleyball', category: 'Activities' },
  { emoji: '🎱', name: 'Pool 8 Ball', category: 'Activities' },
  { emoji: '🏓', name: 'Ping Pong', category: 'Activities' },
  { emoji: '🎯', name: 'Bullseye', category: 'Activities' },
  { emoji: '🎮', name: 'Video Game', category: 'Activities' },
  { emoji: '🎲', name: 'Game Die', category: 'Activities' },
  { emoji: '🎸', name: 'Guitar', category: 'Activities' },
  { emoji: '🎹', name: 'Musical Keyboard', category: 'Activities' },
  { emoji: '🎤', name: 'Microphone', category: 'Activities' },
  { emoji: '🎬', name: 'Clapper Board', category: 'Activities' },
  // Objects
  { emoji: '💻', name: 'Laptop', category: 'Objects' },
  { emoji: '🖥️', name: 'Desktop Computer', category: 'Objects' },
  { emoji: '📱', name: 'Mobile Phone', category: 'Objects' },
  { emoji: '📞', name: 'Telephone Receiver', category: 'Objects' },
  { emoji: '⌨️', name: 'Keyboard', category: 'Objects' },
  { emoji: '🖨️', name: 'Printer', category: 'Objects' },
  { emoji: '💾', name: 'Floppy Disk', category: 'Objects' },
  { emoji: '📷', name: 'Camera', category: 'Objects' },
  { emoji: '🔋', name: 'Battery', category: 'Objects' },
  { emoji: '💡', name: 'Light Bulb', category: 'Objects' },
  { emoji: '🔑', name: 'Key', category: 'Objects' },
  { emoji: '🔒', name: 'Locked', category: 'Objects' },
  { emoji: '🔓', name: 'Unlocked', category: 'Objects' },
  { emoji: '📧', name: 'Email', category: 'Objects' },
  { emoji: '📦', name: 'Package', category: 'Objects' },
  { emoji: '📝', name: 'Memo', category: 'Objects' },
  { emoji: '📚', name: 'Books', category: 'Objects' },
  { emoji: '✏️', name: 'Pencil', category: 'Objects' },
  { emoji: '📎', name: 'Paperclip', category: 'Objects' },
  { emoji: '🗑️', name: 'Wastebasket', category: 'Objects' },
  // Symbols
  { emoji: '❤️', name: 'Red Heart', category: 'Symbols' },
  { emoji: '🧡', name: 'Orange Heart', category: 'Symbols' },
  { emoji: '💛', name: 'Yellow Heart', category: 'Symbols' },
  { emoji: '💚', name: 'Green Heart', category: 'Symbols' },
  { emoji: '💙', name: 'Blue Heart', category: 'Symbols' },
  { emoji: '💜', name: 'Purple Heart', category: 'Symbols' },
  { emoji: '🖤', name: 'Black Heart', category: 'Symbols' },
  { emoji: '🤍', name: 'White Heart', category: 'Symbols' },
  { emoji: '💯', name: 'Hundred Points', category: 'Symbols' },
  { emoji: '💢', name: 'Anger Symbol', category: 'Symbols' },
  { emoji: '💥', name: 'Collision', category: 'Symbols' },
  { emoji: '💫', name: 'Dizzy', category: 'Symbols' },
  { emoji: '💬', name: 'Speech Balloon', category: 'Symbols' },
  { emoji: '✅', name: 'Check Mark Button', category: 'Symbols' },
  { emoji: '❌', name: 'Cross Mark', category: 'Symbols' },
  { emoji: '⭐', name: 'Star', category: 'Symbols' },
  { emoji: '🔥', name: 'Fire', category: 'Symbols' },
  { emoji: '💧', name: 'Droplet', category: 'Symbols' },
  { emoji: '⚡', name: 'High Voltage', category: 'Symbols' },
  { emoji: '🎉', name: 'Party Popper', category: 'Symbols' },
  { emoji: '✨', name: 'Sparkles', category: 'Symbols' },
  { emoji: '🏆', name: 'Trophy', category: 'Symbols' },
  { emoji: '🎖️', name: 'Military Medal', category: 'Symbols' },
  { emoji: '♻️', name: 'Recycling Symbol', category: 'Symbols' },
  { emoji: '⚠️', name: 'Warning', category: 'Symbols' },
  // Flags
  { emoji: '🏁', name: 'Chequered Flag', category: 'Flags' },
  { emoji: '🚩', name: 'Triangular Flag', category: 'Flags' },
  { emoji: '🎌', name: 'Crossed Flags', category: 'Flags' },
  { emoji: '🏴', name: 'Black Flag', category: 'Flags' },
  { emoji: '🏳️', name: 'White Flag', category: 'Flags' },
  { emoji: '🇺🇸', name: 'United States', category: 'Flags' },
  { emoji: '🇬🇧', name: 'United Kingdom', category: 'Flags' },
  { emoji: '🇨🇦', name: 'Canada', category: 'Flags' },
  { emoji: '🇦🇺', name: 'Australia', category: 'Flags' },
  { emoji: '🇩🇪', name: 'Germany', category: 'Flags' },
  { emoji: '🇫🇷', name: 'France', category: 'Flags' },
  { emoji: '🇯🇵', name: 'Japan', category: 'Flags' },
  { emoji: '🇰🇷', name: 'South Korea', category: 'Flags' },
  { emoji: '🇮🇳', name: 'India', category: 'Flags' },
  { emoji: '🇧🇷', name: 'Brazil', category: 'Flags' },
  { emoji: '🇲🇽', name: 'Mexico', category: 'Flags' },
  { emoji: '🇮🇹', name: 'Italy', category: 'Flags' },
  { emoji: '🇪🇸', name: 'Spain', category: 'Flags' },
  { emoji: '🇨🇳', name: 'China', category: 'Flags' },
  { emoji: '🇷🇺', name: 'Russia', category: 'Flags' },
]

const CATEGORIES = ['All', 'Smileys', 'People', 'Animals', 'Food', 'Travel', 'Activities', 'Objects', 'Symbols', 'Flags']

export default function EmojiPickerTool() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [copiedEmoji, setCopiedEmoji] = useState<string | null>(null)
  const [recentlyCopied, setRecentlyCopied] = useState<string[]>([])

  const filtered = useMemo(() => {
    return EMOJIS.filter((e) => {
      const matchesCategory = category === 'All' || e.category === category
      const matchesSearch = !search || e.name.toLowerCase().includes(search.toLowerCase())
      return matchesCategory && matchesSearch
    })
  }, [search, category])

  const copyEmoji = useCallback(async (emoji: string) => {
    await navigator.clipboard.writeText(emoji)
    setCopiedEmoji(emoji)
    setRecentlyCopied((prev) => {
      const next = [emoji, ...prev.filter(e => e !== emoji)].slice(0, 20)
      return next
    })
    setTimeout(() => setCopiedEmoji(null), 1500)
  }, [])

  return (
    <ToolPage
      title="Emoji Picker"
      description="Search and copy emojis to your clipboard instantly"
      category="generators"
      categoryLabel="Generators"
    >
      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search emojis by name..."
            className="w-full h-10 pl-10 pr-4 rounded-lg border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                category === cat
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground border border-border hover:bg-muted'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Recently copied */}
        {recentlyCopied.length > 0 && (
          <div>
            <span className="text-xs font-medium text-muted-foreground mb-1.5 block">Recently Copied</span>
            <div className="flex flex-wrap gap-1">
              {recentlyCopied.map((emoji, i) => (
                <button
                  key={`${emoji}-${i}`}
                  onClick={() => copyEmoji(emoji)}
                  className="w-9 h-9 flex items-center justify-center rounded-md hover:bg-muted transition-colors text-lg"
                  title="Click to copy"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Emoji grid */}
        <div className="grid grid-cols-[repeat(auto-fill,minmax(2.5rem,1fr))] gap-1">
          {filtered.map((e, i) => (
            <button
              key={`${e.emoji}-${i}`}
              onClick={() => copyEmoji(e.emoji)}
              className="group relative w-10 h-10 flex items-center justify-center rounded-lg hover:bg-muted transition-colors text-xl"
              title={e.name}
            >
              {copiedEmoji === e.emoji ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                e.emoji
              )}
              {/* Tooltip */}
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 rounded text-xs bg-foreground text-background whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                {e.name}
              </span>
            </button>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No emojis found matching &ldquo;{search}&rdquo;
          </div>
        )}

        {/* Copy notification */}
        {copiedEmoji && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg bg-foreground text-background text-sm font-medium shadow-lg flex items-center gap-2 z-50">
            <Copy className="h-3.5 w-3.5" /> Copied {copiedEmoji}
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          {filtered.length} emojis &middot; Click any emoji to copy to clipboard
        </div>
      </div>
    </ToolPage>
  )
}
