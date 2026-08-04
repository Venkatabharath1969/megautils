'use client'

import { useState, useMemo } from 'react'
import { ToolPage, ToolTextarea, CopyButton, DownloadButton, ClearButton } from '@/components/tool-page'

function mdToPlainText(md: string): string {
  let text = md
  // Remove images
  text = text.replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
  // Remove links, keep text
  text = text.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
  // Remove headings markers
  text = text.replace(/^#{1,6}\s+/gm, '')
  // Remove bold/italic
  text = text.replace(/(\*\*\*|___)(.*?)\1/g, '$2')
  text = text.replace(/(\*\*|__)(.*?)\1/g, '$2')
  text = text.replace(/(\*|_)(.*?)\1/g, '$2')
  // Remove strikethrough
  text = text.replace(/~~(.*?)~~/g, '$1')
  // Remove inline code
  text = text.replace(/`([^`]*)`/g, '$1')
  // Remove code blocks
  text = text.replace(/```[\s\S]*?```/g, '')
  // Remove blockquotes
  text = text.replace(/^>\s?/gm, '')
  // Remove unordered list markers
  text = text.replace(/^[\s]*[-*+]\s+/gm, '')
  // Remove ordered list markers
  text = text.replace(/^[\s]*\d+\.\s+/gm, '')
  // Remove horizontal rules
  text = text.replace(/^[-*_]{3,}\s*$/gm, '')
  // Remove HTML tags
  text = text.replace(/<[^>]*>/g, '')
  // Collapse multiple blank lines
  text = text.replace(/\n{3,}/g, '\n\n')
  return text.trim()
}

function mdToRichText(md: string): string {
  const boldMap: Record<string, string> = {
    'A':'𝗔','B':'𝗕','C':'𝗖','D':'𝗗','E':'𝗘','F':'𝗙','G':'𝗚','H':'𝗛','I':'𝗜','J':'𝗝',
    'K':'𝗞','L':'𝗟','M':'𝗠','N':'𝗡','O':'𝗢','P':'𝗣','Q':'𝗤','R':'𝗥','S':'𝗦','T':'𝗧',
    'U':'𝗨','V':'𝗩','W':'𝗪','X':'𝗫','Y':'𝗬','Z':'𝗭',
    'a':'𝗮','b':'𝗯','c':'𝗰','d':'𝗱','e':'𝗲','f':'𝗳','g':'𝗴','h':'𝗵','i':'𝗶','j':'𝗷',
    'k':'𝗸','l':'𝗹','m':'𝗺','n':'𝗻','o':'𝗼','p':'𝗽','q':'𝗾','r':'𝗿','s':'𝘀','t':'𝘁',
    'u':'𝘂','v':'𝘃','w':'𝘄','x':'𝘅','y':'𝘆','z':'𝘇',
    '0':'𝟬','1':'𝟭','2':'𝟮','3':'𝟯','4':'𝟰','5':'𝟱','6':'𝟲','7':'𝟳','8':'𝟴','9':'𝟵',
  }
  const italicMap: Record<string, string> = {
    'A':'𝘈','B':'𝘉','C':'𝘊','D':'𝘋','E':'𝘌','F':'𝘍','G':'𝘎','H':'𝘏','I':'𝘐','J':'𝘑',
    'K':'𝘒','L':'𝘓','M':'𝘔','N':'𝘕','O':'𝘖','P':'𝘗','Q':'𝘘','R':'𝘙','S':'𝘚','T':'𝘛',
    'U':'𝘜','V':'𝘝','W':'𝘞','X':'𝘟','Y':'𝘠','Z':'𝘡',
    'a':'𝘢','b':'𝘣','c':'𝘤','d':'𝘥','e':'𝘦','f':'𝘧','g':'𝘨','h':'𝘩','i':'𝘪','j':'𝘫',
    'k':'𝘬','l':'𝘭','m':'𝘮','n':'𝘯','o':'𝘰','p':'𝘱','q':'𝘲','r':'𝘳','s':'𝘴','t':'𝘵',
    'u':'𝘶','v':'𝘷','w':'𝘸','x':'𝘹','y':'𝘺','z':'𝘻',
  }
  const toBold = (s: string) => s.split('').map(c => boldMap[c] || c).join('')
  const toItalic = (s: string) => s.split('').map(c => italicMap[c] || c).join('')

  let text = md
  // Headings -> bold unicode
  text = text.replace(/^#{1,6}\s+(.*)$/gm, (_, content) => toBold(content))
  // Bold+italic
  text = text.replace(/(\*\*\*|___)(.*?)\1/g, (_, __, content) => toBold(toItalic(content)))
  // Bold
  text = text.replace(/(\*\*|__)(.*?)\1/g, (_, __, content) => toBold(content))
  // Italic
  text = text.replace(/(\*|_)(.*?)\1/g, (_, __, content) => toItalic(content))
  // Remove images
  text = text.replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
  // Remove links keep text
  text = text.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
  // Remove code fences
  text = text.replace(/```[\s\S]*?```/g, '')
  text = text.replace(/`([^`]*)`/g, '$1')
  // Blockquotes
  text = text.replace(/^>\s?/gm, '\u2503 ')
  // Lists
  text = text.replace(/^[\s]*[-*+]\s+/gm, '  \u2022 ')
  text = text.replace(/^[\s]*(\d+)\.\s+/gm, '  $1. ')
  // Horizontal rules
  text = text.replace(/^[-*_]{3,}\s*$/gm, '\u2500'.repeat(40))
  // Strikethrough
  text = text.replace(/~~(.*?)~~/g, '$1')
  // HTML
  text = text.replace(/<[^>]*>/g, '')
  text = text.replace(/\n{3,}/g, '\n\n')
  return text.trim()
}

function mdToHtml(md: string): string {
  let html = md
  // Code blocks
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
  // Inline code
  html = html.replace(/`([^`]*)`/g, '<code>$1</code>')
  // Images
  html = html.replace(/!\[([^\]]*)\]\(([^)]*)\)/g, '<img src="$2" alt="$1" />')
  // Links
  html = html.replace(/\[([^\]]*)\]\(([^)]*)\)/g, '<a href="$2">$1</a>')
  // Headings
  html = html.replace(/^######\s+(.*)$/gm, '<h6>$1</h6>')
  html = html.replace(/^#####\s+(.*)$/gm, '<h5>$1</h5>')
  html = html.replace(/^####\s+(.*)$/gm, '<h4>$1</h4>')
  html = html.replace(/^###\s+(.*)$/gm, '<h3>$1</h3>')
  html = html.replace(/^##\s+(.*)$/gm, '<h2>$1</h2>')
  html = html.replace(/^#\s+(.*)$/gm, '<h1>$1</h1>')
  // Bold+italic
  html = html.replace(/(\*\*\*|___)(.*?)\1/g, '<strong><em>$2</em></strong>')
  // Bold
  html = html.replace(/(\*\*|__)(.*?)\1/g, '<strong>$2</strong>')
  // Italic
  html = html.replace(/(\*|_)(.*?)\1/g, '<em>$2</em>')
  // Strikethrough
  html = html.replace(/~~(.*?)~~/g, '<del>$1</del>')
  // Horizontal rules
  html = html.replace(/^[-*_]{3,}\s*$/gm, '<hr />')
  // Blockquotes
  html = html.replace(/^>\s?(.*)$/gm, '<blockquote>$1</blockquote>')
  // Unordered lists
  html = html.replace(/^[\s]*[-*+]\s+(.*)$/gm, '<li>$1</li>')
  // Ordered lists
  html = html.replace(/^[\s]*\d+\.\s+(.*)$/gm, '<li>$1</li>')
  // Wrap consecutive <li> in <ul>
  html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, '<ul>\n$1</ul>')
  // Paragraphs for remaining lines
  const lines = html.split('\n')
  const result: string[] = []
  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed && !trimmed.startsWith('<')) {
      result.push(`<p>${trimmed}</p>`)
    } else {
      result.push(line)
    }
  }
  return result.join('\n').trim()
}

type OutputTab = 'plain' | 'rich' | 'html'

export default function MarkdownToTextTool() {
  const [input, setInput] = useState('')
  const [tab, setTab] = useState<OutputTab>('plain')

  const outputs = useMemo(() => ({
    plain: input ? mdToPlainText(input) : '',
    rich: input ? mdToRichText(input) : '',
    html: input ? mdToHtml(input) : '',
  }), [input])

  const current = outputs[tab]
  const downloadExt = tab === 'html' ? 'html' : 'txt'
  const downloadMime = tab === 'html' ? 'text/html' : 'text/plain'

  return (
    <ToolPage title="Markdown to Text" description="Convert Markdown to plain text, rich text with Unicode formatting, or HTML." category="text" categoryLabel="Text Tools">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Markdown Input</span>
            <ClearButton onClear={() => setInput('')} />
          </div>
          <ToolTextarea value={input} onChange={setInput} placeholder="Paste your Markdown here..." rows={14} />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex gap-1">
              {(['plain', 'rich', 'html'] as OutputTab[]).map((t) => (
                <button key={t} onClick={() => setTab(t)} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${tab === t ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'}`}>
                  {t === 'plain' ? 'Plain Text' : t === 'rich' ? 'Rich Text' : 'HTML'}
                </button>
              ))}
            </div>
            <div className="flex gap-1.5">
              {current && <CopyButton text={current} />}
              {current && <DownloadButton content={current} filename={`converted.${downloadExt}`} mimeType={downloadMime} />}
            </div>
          </div>
          <ToolTextarea value={current} readOnly placeholder="Output will appear here..." rows={14} />
        </div>
      </div>
    </ToolPage>
  )
}
