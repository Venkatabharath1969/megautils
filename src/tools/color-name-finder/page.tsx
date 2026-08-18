'use client'

import { useState, useMemo } from 'react'
import { ToolPage, CopyButton } from '@/components/tool-page'

const CSS_COLORS: [string, string][] = [
  ['aliceblue','#F0F8FF'],['antiquewhite','#FAEBD7'],['aqua','#00FFFF'],['aquamarine','#7FFFD4'],
  ['azure','#F0FFFF'],['beige','#F5F5DC'],['bisque','#FFE4C4'],['black','#000000'],
  ['blanchedalmond','#FFEBCD'],['blue','#0000FF'],['blueviolet','#8A2BE2'],['brown','#A52A2A'],
  ['burlywood','#DEB887'],['cadetblue','#5F9EA0'],['chartreuse','#7FFF00'],['chocolate','#D2691E'],
  ['coral','#FF7F50'],['cornflowerblue','#6495ED'],['cornsilk','#FFF8DC'],['crimson','#DC143C'],
  ['cyan','#00FFFF'],['darkblue','#00008B'],['darkcyan','#008B8B'],['darkgoldenrod','#B8860B'],
  ['darkgray','#A9A9A9'],['darkgreen','#006400'],['darkkhaki','#BDB76B'],['darkmagenta','#8B008B'],
  ['darkolivegreen','#556B2F'],['darkorange','#FF8C00'],['darkorchid','#9932CC'],['darkred','#8B0000'],
  ['darksalmon','#E9967A'],['darkseagreen','#8FBC8F'],['darkslateblue','#483D8B'],['darkslategray','#2F4F4F'],
  ['darkturquoise','#00CED1'],['darkviolet','#9400D3'],['deeppink','#FF1493'],['deepskyblue','#00BFFF'],
  ['dimgray','#696969'],['dodgerblue','#1E90FF'],['firebrick','#B22222'],['floralwhite','#FFFAF0'],
  ['forestgreen','#228B22'],['fuchsia','#FF00FF'],['gainsboro','#DCDCDC'],['ghostwhite','#F8F8FF'],
  ['gold','#FFD700'],['goldenrod','#DAA520'],['gray','#808080'],['green','#008000'],
  ['greenyellow','#ADFF2F'],['honeydew','#F0FFF0'],['hotpink','#FF69B4'],['indianred','#CD5C5C'],
  ['indigo','#4B0082'],['ivory','#FFFFF0'],['khaki','#F0E68C'],['lavender','#E6E6FA'],
  ['lavenderblush','#FFF0F5'],['lawngreen','#7CFC00'],['lemonchiffon','#FFFACD'],['lightblue','#ADD8E6'],
  ['lightcoral','#F08080'],['lightcyan','#E0FFFF'],['lightgoldenrodyellow','#FAFAD2'],['lightgray','#D3D3D3'],
  ['lightgreen','#90EE90'],['lightpink','#FFB6C1'],['lightsalmon','#FFA07A'],['lightseagreen','#20B2AA'],
  ['lightskyblue','#87CEFA'],['lightslategray','#778899'],['lightsteelblue','#B0C4DE'],['lightyellow','#FFFFE0'],
  ['lime','#00FF00'],['limegreen','#32CD32'],['linen','#FAF0E6'],['magenta','#FF00FF'],
  ['maroon','#800000'],['mediumaquamarine','#66CDAA'],['mediumblue','#0000CD'],['mediumorchid','#BA55D3'],
  ['mediumpurple','#9370DB'],['mediumseagreen','#3CB371'],['mediumslateblue','#7B68EE'],['mediumspringgreen','#00FA9A'],
  ['mediumturquoise','#48D1CC'],['mediumvioletred','#C71585'],['midnightblue','#191970'],['mintcream','#F5FFFA'],
  ['mistyrose','#FFE4E1'],['moccasin','#FFE4B5'],['navajowhite','#FFDEAD'],['navy','#000080'],
  ['oldlace','#FDF5E6'],['olive','#808000'],['olivedrab','#6B8E23'],['orange','#FFA500'],
  ['orangered','#FF4500'],['orchid','#DA70D6'],['palegoldenrod','#EEE8AA'],['palegreen','#98FB98'],
  ['paleturquoise','#AFEEEE'],['palevioletred','#DB7093'],['papayawhip','#FFEFD5'],['peachpuff','#FFDAB9'],
  ['peru','#CD853F'],['pink','#FFC0CB'],['plum','#DDA0DD'],['powderblue','#B0E0E6'],
  ['purple','#800080'],['rebeccapurple','#663399'],['red','#FF0000'],['rosybrown','#BC8F8F'],
  ['royalblue','#4169E1'],['saddlebrown','#8B4513'],['salmon','#FA8072'],['sandybrown','#F4A460'],
  ['seagreen','#2E8B57'],['seashell','#FFF5EE'],['sienna','#A0522D'],['silver','#C0C0C0'],
  ['skyblue','#87CEEB'],['slateblue','#6A5ACD'],['slategray','#708090'],['snow','#FFFAFA'],
  ['springgreen','#00FF7F'],['steelblue','#4682B4'],['tan','#D2B48C'],['teal','#008080'],
  ['thistle','#D8BFD8'],['tomato','#FF6347'],['turquoise','#40E0D0'],['violet','#EE82EE'],
  ['wheat','#F5DEB3'],['white','#FFFFFF'],['whitesmoke','#F5F5F5'],['yellow','#FFFF00'],
  ['yellowgreen','#9ACD32'],
]

function hexToRgb(hex: string): [number, number, number] {
  const cleaned = hex.replace('#', '')
  let r: number, g: number, b: number
  if (cleaned.length === 3) {
    r = parseInt(cleaned[0] + cleaned[0], 16)
    g = parseInt(cleaned[1] + cleaned[1], 16)
    b = parseInt(cleaned[2] + cleaned[2], 16)
  } else {
    r = parseInt(cleaned.slice(0, 2), 16)
    g = parseInt(cleaned.slice(2, 4), 16)
    b = parseInt(cleaned.slice(4, 6), 16)
  }
  return [r, g, b]
}

function colorDistance(rgb1: [number, number, number], rgb2: [number, number, number]): number {
  // Weighted Euclidean distance for perceptual similarity
  const rMean = (rgb1[0] + rgb2[0]) / 2
  const dR = rgb1[0] - rgb2[0]
  const dG = rgb1[1] - rgb2[1]
  const dB = rgb1[2] - rgb2[2]
  return Math.sqrt(
    (2 + rMean / 256) * dR * dR +
    4 * dG * dG +
    (2 + (255 - rMean) / 256) * dB * dB
  )
}

interface ColorMatch {
  name: string
  hex: string
  distance: number
  matchPercent: number
}

export default function ColorNameFinderTool() {
  const [hexInput, setHexInput] = useState('#3b82f6')

  const matches = useMemo((): ColorMatch[] => {
    try {
      const inputRgb = hexToRgb(hexInput)
      const results = CSS_COLORS.map(([name, hex]) => {
        const dist = colorDistance(inputRgb, hexToRgb(hex))
        return {
          name,
          hex,
          distance: dist,
          matchPercent: Math.max(0, Math.round((1 - dist / 764) * 100)),
        }
      })
      results.sort((a, b) => a.distance - b.distance)
      return results.slice(0, 20)
    } catch {
      return []
    }
  }, [hexInput])

  const isValidHex = /^#?([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(hexInput)

  return (
    <ToolPage
      title="Color Name Finder"
      description="Find the nearest CSS named color for any HEX color value"
      category="color"
      categoryLabel="Color Tools"
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>Color Name Finder is a free browser-based tool that lets you find the closest named color for any HEX, RGB, or HSL value from a database of hundreds of named colors. It processes everything locally in your browser using JavaScript, so your data never leaves your device. No sign-up, no installation, and no server uploads required — just open the tool and start using it immediately.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Enter your data or content in the <strong>input area</strong>.</li>
            <li>Configure any available options or settings to match your needs.</li>
            <li>View the <strong>result instantly</strong> in the output area.</li>
            <li>Use the <strong>Copy</strong> or <strong>Download</strong> button to save your result.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>This tool is particularly useful when finding descriptive color names for design systems, documentation, or accessibility labels. Since it runs entirely in your browser, it works offline after the page loads and keeps your data completely private. Whether you are a developer, designer, student, or professional, this design tool saves time and eliminates the need for desktop software installation.</p>

          <h2>Tips and Best Practices</h2>
          <ul>
            <li>All processing happens locally in your browser — your data is never sent to any server, making it safe for sensitive content.</li>
            <li>The tool works on any modern browser including Chrome, Firefox, Safari, and Edge on both desktop and mobile devices.</li>
            <li>No account or sign-up is required — the tool is completely free with no usage limits.</li>
            <li>Use the Copy button to quickly transfer results to your clipboard for pasting into other applications.</li>
            <li>Bookmark this page for quick access whenever you need color naming.</li>
          </ul>
        </>
      }
      faqs={[
        { question: 'How many CSS named colors are there?', answer: 'There are 148 named CSS colors recognized by all modern browsers, ranging from basic names like "red" and "blue" to specific ones like "rebeccapurple" and "cornflowerblue."' },
        { question: 'How does the color name finder work?', answer: 'It calculates the perceptual distance between your input color and all 148 CSS named colors, then ranks them by closest match percentage.' },
        { question: 'Can I use CSS color names in my code instead of hex values?', answer: 'Yes, CSS named colors are valid in any CSS property. For example, "color: dodgerblue" is equivalent to "color: #1E90FF."' },
      ]}
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="text-sm font-medium block mb-1">HEX Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={isValidHex ? (hexInput.startsWith('#') ? hexInput : '#' + hexInput) : '#000000'}
                onChange={(e) => setHexInput(e.target.value)}
                className="w-12 h-10 rounded border border-input cursor-pointer"
              />
              <input
                type="text"
                value={hexInput}
                onChange={(e) => setHexInput(e.target.value)}
                className="px-3 py-2 rounded-lg border border-input bg-tool-bg text-sm font-mono w-32 focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="#3b82f6"
              />
            </div>
          </div>

          {matches.length > 0 && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
              <div className="w-12 h-12 rounded-lg border border-border" style={{ backgroundColor: matches[0].hex }} />
              <div>
                <div className="font-semibold">{matches[0].name}</div>
                <div className="text-sm text-muted-foreground font-mono">{matches[0].hex}</div>
                <div className="text-xs text-green-600 dark:text-green-400">{matches[0].matchPercent}% match</div>
              </div>
              <CopyButton text={matches[0].name} />
            </div>
          )}
        </div>

        {matches.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold mb-3">Top 20 Closest CSS Colors</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {matches.map((m, i) => (
                <div key={m.name + i} className="flex items-center gap-3 p-2 rounded-lg border border-border hover:bg-muted transition-colors">
                  <div className="w-8 h-8 rounded shrink-0 border border-border" style={{ backgroundColor: m.hex }} />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium truncate">{m.name}</div>
                    <div className="text-xs text-muted-foreground font-mono">{m.hex}</div>
                  </div>
                  <span className={`text-xs font-medium shrink-0 ${m.matchPercent >= 95 ? 'text-green-600 dark:text-green-400' : m.matchPercent >= 80 ? 'text-yellow-600 dark:text-yellow-400' : 'text-muted-foreground'}`}>
                    {m.matchPercent}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolPage>
  )
}
