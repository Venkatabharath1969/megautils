'use client'

import { useState } from 'react'
import { ToolPage } from '@/components/tool-page'
import { Check, Copy } from 'lucide-react'

const tailwindColors: Record<string, Record<string, string>> = {
  slate: { '50': '#f8fafc', '100': '#f1f5f9', '200': '#e2e8f0', '300': '#cbd5e1', '400': '#94a3b8', '500': '#64748b', '600': '#475569', '700': '#334155', '800': '#1e293b', '900': '#0f172a', '950': '#020617' },
  gray: { '50': '#f9fafb', '100': '#f3f4f6', '200': '#e5e7eb', '300': '#d1d5db', '400': '#9ca3af', '500': '#6b7280', '600': '#4b5563', '700': '#374151', '800': '#1f2937', '900': '#111827', '950': '#030712' },
  zinc: { '50': '#fafafa', '100': '#f4f4f5', '200': '#e4e4e7', '300': '#d4d4d8', '400': '#a1a1aa', '500': '#71717a', '600': '#52525b', '700': '#3f3f46', '800': '#27272a', '900': '#18181b', '950': '#09090b' },
  neutral: { '50': '#fafafa', '100': '#f5f5f5', '200': '#e5e5e5', '300': '#d4d4d4', '400': '#a3a3a3', '500': '#737373', '600': '#525252', '700': '#404040', '800': '#262626', '900': '#171717', '950': '#0a0a0a' },
  stone: { '50': '#fafaf9', '100': '#f5f5f4', '200': '#e7e5e4', '300': '#d6d3d1', '400': '#a8a29e', '500': '#78716c', '600': '#57534e', '700': '#44403c', '800': '#292524', '900': '#1c1917', '950': '#0c0a09' },
  red: { '50': '#fef2f2', '100': '#fee2e2', '200': '#fecaca', '300': '#fca5a5', '400': '#f87171', '500': '#ef4444', '600': '#dc2626', '700': '#b91c1c', '800': '#991b1b', '900': '#7f1d1d', '950': '#450a0a' },
  orange: { '50': '#fff7ed', '100': '#ffedd5', '200': '#fed7aa', '300': '#fdba74', '400': '#fb923c', '500': '#f97316', '600': '#ea580c', '700': '#c2410c', '800': '#9a3412', '900': '#7c2d12', '950': '#431407' },
  amber: { '50': '#fffbeb', '100': '#fef3c7', '200': '#fde68a', '300': '#fcd34d', '400': '#fbbf24', '500': '#f59e0b', '600': '#d97706', '700': '#b45309', '800': '#92400e', '900': '#78350f', '950': '#451a03' },
  yellow: { '50': '#fefce8', '100': '#fef9c3', '200': '#fef08a', '300': '#fde047', '400': '#facc15', '500': '#eab308', '600': '#ca8a04', '700': '#a16207', '800': '#854d0e', '900': '#713f12', '950': '#422006' },
  lime: { '50': '#f7fee7', '100': '#ecfccb', '200': '#d9f99d', '300': '#bef264', '400': '#a3e635', '500': '#84cc16', '600': '#65a30d', '700': '#4d7c0f', '800': '#3f6212', '900': '#365314', '950': '#1a2e05' },
  green: { '50': '#f0fdf4', '100': '#dcfce7', '200': '#bbf7d0', '300': '#86efac', '400': '#4ade80', '500': '#22c55e', '600': '#16a34a', '700': '#15803d', '800': '#166534', '900': '#14532d', '950': '#052e16' },
  emerald: { '50': '#ecfdf5', '100': '#d1fae5', '200': '#a7f3d0', '300': '#6ee7b7', '400': '#34d399', '500': '#10b981', '600': '#059669', '700': '#047857', '800': '#065f46', '900': '#064e3b', '950': '#022c22' },
  teal: { '50': '#f0fdfa', '100': '#ccfbf1', '200': '#99f6e4', '300': '#5eead4', '400': '#2dd4bf', '500': '#14b8a6', '600': '#0d9488', '700': '#0f766e', '800': '#115e59', '900': '#134e4a', '950': '#042f2e' },
  cyan: { '50': '#ecfeff', '100': '#cffafe', '200': '#a5f3fc', '300': '#67e8f9', '400': '#22d3ee', '500': '#06b6d4', '600': '#0891b2', '700': '#0e7490', '800': '#155e75', '900': '#164e63', '950': '#083344' },
  sky: { '50': '#f0f9ff', '100': '#e0f2fe', '200': '#bae6fd', '300': '#7dd3fc', '400': '#38bdf8', '500': '#0ea5e9', '600': '#0284c7', '700': '#0369a1', '800': '#075985', '900': '#0c4a6e', '950': '#082f49' },
  blue: { '50': '#eff6ff', '100': '#dbeafe', '200': '#bfdbfe', '300': '#93c5fd', '400': '#60a5fa', '500': '#3b82f6', '600': '#2563eb', '700': '#1d4ed8', '800': '#1e40af', '900': '#1e3a8a', '950': '#172554' },
  indigo: { '50': '#eef2ff', '100': '#e0e7ff', '200': '#c7d2fe', '300': '#a5b4fc', '400': '#818cf8', '500': '#6366f1', '600': '#4f46e5', '700': '#4338ca', '800': '#3730a3', '900': '#312e81', '950': '#1e1b4b' },
  violet: { '50': '#f5f3ff', '100': '#ede9fe', '200': '#ddd6fe', '300': '#c4b5fd', '400': '#a78bfa', '500': '#8b5cf6', '600': '#7c3aed', '700': '#6d28d9', '800': '#5b21b6', '900': '#4c1d95', '950': '#2e1065' },
  purple: { '50': '#faf5ff', '100': '#f3e8ff', '200': '#e9d5ff', '300': '#d8b4fe', '400': '#c084fc', '500': '#a855f7', '600': '#9333ea', '700': '#7e22ce', '800': '#6b21a8', '900': '#581c87', '950': '#3b0764' },
  fuchsia: { '50': '#fdf4ff', '100': '#fae8ff', '200': '#f5d0fe', '300': '#f0abfc', '400': '#e879f9', '500': '#d946ef', '600': '#c026d3', '700': '#a21caf', '800': '#86198f', '900': '#701a75', '950': '#4a044e' },
  pink: { '50': '#fdf2f8', '100': '#fce7f3', '200': '#fbcfe8', '300': '#f9a8d4', '400': '#f472b6', '500': '#ec4899', '600': '#db2777', '700': '#be185d', '800': '#9d174d', '900': '#831843', '950': '#500724' },
  rose: { '50': '#fff1f2', '100': '#ffe4e6', '200': '#fecdd3', '300': '#fda4af', '400': '#fb7185', '500': '#f43f5e', '600': '#e11d48', '700': '#be123c', '800': '#9f1239', '900': '#881337', '950': '#4c0519' },
}

const shades = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950']
const colorNames = Object.keys(tailwindColors)

function isDark(hex: string): boolean {
  const clean = hex.replace('#', '')
  const r = parseInt(clean.substring(0, 2), 16)
  const g = parseInt(clean.substring(2, 4), 16)
  const b = parseInt(clean.substring(4, 6), 16)
  return (r * 299 + g * 587 + b * 114) / 1000 < 128
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const clean = hex.replace('#', '')
  if (!/^[0-9a-f]{6}$/i.test(clean)) return null
  return { r: parseInt(clean.substring(0, 2), 16), g: parseInt(clean.substring(2, 4), 16), b: parseInt(clean.substring(4, 6), 16) }
}

function findNearestTailwind(hex: string): { name: string; shade: string; hex: string; distance: number } | null {
  const input = hexToRgb(hex)
  if (!input) return null
  let best = { name: '', shade: '', hex: '', distance: Infinity }
  for (const name of colorNames) {
    for (const shade of shades) {
      const twHex = tailwindColors[name][shade]
      const tw = hexToRgb(twHex)
      if (!tw) continue
      const dist = Math.sqrt((input.r - tw.r) ** 2 + (input.g - tw.g) ** 2 + (input.b - tw.b) ** 2)
      if (dist < best.distance) {
        best = { name, shade, hex: twHex, distance: dist }
      }
    }
  }
  return best.distance < Infinity ? best : null
}

export default function TailwindColorPickerTool() {
  const [search, setSearch] = useState('')
  const [copiedKey, setCopiedKey] = useState('')
  const [nearestHex, setNearestHex] = useState('')
  const [nearestResult, setNearestResult] = useState<ReturnType<typeof findNearestTailwind>>(null)

  const filteredColors = colorNames.filter(name =>
    name.toLowerCase().includes(search.toLowerCase())
  )

  const handleCopy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(''), 2000)
  }

  const handleNearestSearch = (value: string) => {
    setNearestHex(value)
    const cleaned = value.startsWith('#') ? value : `#${value}`
    if (/^#[0-9a-f]{6}$/i.test(cleaned)) {
      setNearestResult(findNearestTailwind(cleaned))
    } else {
      setNearestResult(null)
    }
  }

  return (
    <ToolPage
      title="Tailwind Color Picker"
      description="Browse all Tailwind CSS default colors. Click any shade to copy the class name or hex value."
      category="css"
      categoryLabel="CSS Tools"
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>Tailwind Color Picker is a free browser-based tool that lets you browse and search all Tailwind CSS color classes with visual previews, HEX values, and one-click copy. It processes everything locally in your browser using JavaScript, so your data never leaves your device. No sign-up, no installation, and no server uploads required — just open the tool and start using it immediately.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Use the visual controls (sliders, color pickers, toggles) to design your effect.</li>
            <li>See the <strong>live preview</strong> update in real time as you adjust settings.</li>
            <li>Review the generated <strong>CSS code</strong> in the code panel below.</li>
            <li>Click <strong>Copy CSS</strong> to paste the code directly into your stylesheet.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>This tool is particularly useful when finding the right Tailwind color class for your design, converting between Tailwind colors and HEX/RGB values. Since it runs entirely in your browser, it works offline after the page loads and keeps your data completely private. Whether you are a developer, designer, student, or professional, this Tailwind CSS tool saves time and eliminates the need for desktop software installation.</p>

          <h2>Tips and Best Practices</h2>
          <ul>
            <li>Copy the generated CSS directly into your project stylesheet — it is production-ready.</li>
            <li>Test the effect in multiple browsers since some CSS properties have varying support.</li>
            <li>Combine multiple generators (e.g., gradient + box-shadow) for layered visual effects.</li>
            <li>Use CSS custom properties (variables) to make generated values easy to update later.</li>
            <li>All code generation happens in your browser — no external dependencies required.</li>
          </ul>
        </>
      }
      faqs={[
        { question: 'How many colors does Tailwind CSS include by default?', answer: 'Tailwind CSS includes 22 color families (like slate, red, blue, emerald) each with 11 shades ranging from 50 (lightest) to 950 (darkest), totaling 242 default color values.' },
        { question: 'How do I use Tailwind colors in my project?', answer: 'Apply Tailwind color classes directly in your HTML using the pattern bg-{color}-{shade} for backgrounds, text-{color}-{shade} for text, and border-{color}-{shade} for borders.' },
        { question: 'Can I customize the default Tailwind color palette?', answer: 'Yes, you can extend or override the default colors in your Tailwind configuration file (tailwind.config.js or v4 CSS theme) by adding custom color values.' },
      ]}
    >
      {/* Find Nearest Tailwind Color */}
      <div className="mb-6 p-4 rounded-lg bg-muted/50 border border-border">
        <h3 className="text-sm font-semibold mb-2">Find Nearest Tailwind Color</h3>
        <div className="flex items-center gap-3 flex-wrap">
          <input
            type="text"
            value={nearestHex}
            onChange={e => handleNearestSearch(e.target.value)}
            placeholder="Enter any hex (e.g. #ff6347)"
            className="w-48 h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
          />
          {nearestResult && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg border border-border" style={{ backgroundColor: nearestHex.startsWith('#') ? nearestHex : `#${nearestHex}` }} />
                <span className="text-sm text-muted-foreground">→</span>
                <div className="w-10 h-10 rounded-lg border border-border" style={{ backgroundColor: nearestResult.hex }} />
              </div>
              <div className="text-sm">
                <p className="font-semibold capitalize">{nearestResult.name}-{nearestResult.shade}</p>
                <p className="text-xs text-muted-foreground font-mono">{nearestResult.hex} · Distance: {nearestResult.distance.toFixed(1)}</p>
              </div>
              <button
                onClick={() => handleCopy(`bg-${nearestResult!.name}-${nearestResult!.shade}`, 'nearest')}
                className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
              >
                {copiedKey === 'nearest' ? 'Copied!' : 'Copy Class'}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mb-6">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search colors... (e.g. blue, red, emerald)"
          className="w-full max-w-md h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div className="space-y-6">
        {filteredColors.map(colorName => (
          <div key={colorName}>
            <h3 className="text-sm font-semibold mb-2 capitalize">{colorName}</h3>
            <div className="grid grid-cols-11 gap-1">
              {shades.map(shade => {
                const hex = tailwindColors[colorName][shade]
                const className = `${colorName}-${shade}`
                const key = `${colorName}-${shade}`
                const dark = isDark(hex)
                const isCopied = copiedKey === key || copiedKey === `${key}-hex`

                return (
                  <div key={shade} className="flex flex-col items-center gap-1">
                    <div
                      className="w-full aspect-square rounded-lg cursor-pointer border border-border/30 hover:ring-2 hover:ring-primary transition-all relative group"
                      style={{ backgroundColor: hex }}
                      onClick={() => handleCopy(hex, key)}
                      title={`Click to copy: ${hex}`}
                    >
                      <div className={`absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity ${dark ? 'text-white' : 'text-black'}`}>
                        {copiedKey === key ? <Check className="h-4 w-4" /> : <Copy className="h-3.5 w-3.5" />}
                      </div>
                    </div>
                    <button
                      onClick={() => handleCopy(`bg-${className}`, `${key}-class`)}
                      className="text-[10px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                      title={`Copy class: bg-${className}`}
                    >
                      {shade}
                    </button>
                    <span className="text-[9px] text-muted-foreground font-mono hidden sm:block">{hex}</span>
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        {filteredColors.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No colors match &quot;{search}&quot;
          </div>
        )}
      </div>

      <div className="mt-8 p-4 rounded-lg bg-muted/50 border border-border">
        <h3 className="text-sm font-semibold mb-2">How to use</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>Click a color swatch to copy its <strong>hex value</strong></li>
          <li>Click the shade number to copy the <strong>Tailwind class name</strong> (e.g. bg-blue-500)</li>
          <li>Use the search bar to filter colors by name</li>
        </ul>
      </div>
    </ToolPage>
  )
}
