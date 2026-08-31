'use client'

import { useState, useCallback } from 'react'
import { ToolPage, CopyButton } from '@/components/tool-page'
import { Plus, Trash2, BookOpen, Copy, Check } from 'lucide-react'

// ── Types ──
type SourceType = 'website' | 'book' | 'journal' | 'newspaper'
type CitationStyle = 'apa7' | 'mla9' | 'chicago' | 'harvard' | 'ieee'

interface CitationSource {
  id: string
  type: SourceType
  // Common
  title: string
  author: string
  year: string
  // Website
  url: string
  websiteName: string
  dateAccessed: string
  datePublished: string
  // Book
  publisher: string
  edition: string
  city: string
  // Journal
  journalName: string
  volume: string
  issue: string
  pages: string
  doi: string
}

const emptySource = (type: SourceType = 'website'): CitationSource => ({
  id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
  type,
  title: '', author: '', year: '',
  url: '', websiteName: '', dateAccessed: new Date().toISOString().split('T')[0], datePublished: '',
  publisher: '', edition: '', city: '',
  journalName: '', volume: '', issue: '', pages: '', doi: '',
})

const SOURCE_TYPES: { value: SourceType; label: string }[] = [
  { value: 'website', label: 'Website' },
  { value: 'book', label: 'Book' },
  { value: 'journal', label: 'Journal Article' },
  { value: 'newspaper', label: 'Newspaper' },
]

const STYLES: { value: CitationStyle; label: string }[] = [
  { value: 'apa7', label: 'APA 7th' },
  { value: 'mla9', label: 'MLA 9th' },
  { value: 'chicago', label: 'Chicago' },
  { value: 'harvard', label: 'Harvard' },
  { value: 'ieee', label: 'IEEE' },
]

// ── Formatting helpers ──
function lastFirst(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length < 2) return name.trim()
  const last = parts.pop()!
  return `${last}, ${parts.map(p => p.charAt(0).toUpperCase() + '.').join(' ')}`
}

function lastFirstFull(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length < 2) return name.trim()
  const last = parts.pop()!
  return `${last}, ${parts.join(' ')}`
}

function formatAuthorsAPA(author: string): string {
  if (!author) return ''
  const authors = author.split(/\s*[,;&]\s*/).filter(Boolean)
  if (authors.length === 1) return lastFirst(authors[0])
  if (authors.length === 2) return `${lastFirst(authors[0])}, & ${lastFirst(authors[1])}`
  return authors.slice(0, -1).map(a => lastFirst(a)).join(', ') + ', & ' + lastFirst(authors[authors.length - 1])
}

function formatAuthorsMLA(author: string): string {
  if (!author) return ''
  const authors = author.split(/\s*[,;&]\s*/).filter(Boolean)
  if (authors.length === 1) return lastFirstFull(authors[0])
  if (authors.length === 2) return `${lastFirstFull(authors[0])}, and ${authors[1].trim()}`
  return `${lastFirstFull(authors[0])}, et al.`
}

function formatAuthorsHarvard(author: string): string {
  return formatAuthorsAPA(author) // Same pattern
}

function formatAuthorsChicago(author: string): string {
  if (!author) return ''
  const authors = author.split(/\s*[,;&]\s*/).filter(Boolean)
  if (authors.length === 1) return lastFirstFull(authors[0])
  if (authors.length <= 3) return authors.slice(0, -1).map((a, i) => i === 0 ? lastFirstFull(a) : a.trim()).join(', ') + ', and ' + authors[authors.length - 1].trim()
  return `${lastFirstFull(authors[0])} et al.`
}

function formatAuthorsIEEE(author: string): string {
  if (!author) return ''
  const authors = author.split(/\s*[,;&]\s*/).filter(Boolean)
  return authors.map(a => {
    const parts = a.trim().split(/\s+/)
    if (parts.length < 2) return a.trim()
    const last = parts.pop()!
    return `${parts.map(p => p.charAt(0).toUpperCase() + '.').join(' ')} ${last}`
  }).join(', ')
}

// ── Citation formatters ──
function formatCitation(src: CitationSource, style: CitationStyle): string {
  const y = src.year || 'n.d.'

  // ── APA 7th ──
  if (style === 'apa7') {
    const author = src.author ? formatAuthorsAPA(src.author) : ''
    if (src.type === 'website') {
      const who = author || src.websiteName || ''
      return `${who}${who ? ' ' : ''}(${y}). ${src.title}. ${src.websiteName ? src.websiteName + '. ' : ''}${src.url ? src.url : ''}`
    }
    if (src.type === 'book') {
      const ed = src.edition ? ` (${src.edition} ed.)` : ''
      return `${author}${author ? ' ' : ''}(${y}). *${src.title}*${ed}. ${src.publisher ? src.publisher + '.' : ''}`
    }
    if (src.type === 'journal') {
      const vol = src.volume ? `, *${src.volume}*` : ''
      const iss = src.issue ? `(${src.issue})` : ''
      const pg = src.pages ? `, ${src.pages}` : ''
      const d = src.doi ? ` https://doi.org/${src.doi.replace(/^https?:\/\/doi\.org\//, '')}` : ''
      return `${author}${author ? ' ' : ''}(${y}). ${src.title}. *${src.journalName}*${vol}${iss}${pg}.${d}`
    }
    // newspaper
    return `${author}${author ? ' ' : ''}(${src.datePublished || y}). ${src.title}. *${src.websiteName || 'Newspaper'}*.${src.url ? ' ' + src.url : ''}`
  }

  // ── MLA 9th ──
  if (style === 'mla9') {
    const author = src.author ? formatAuthorsMLA(src.author) : ''
    if (src.type === 'website') {
      return `${author}${author ? '. ' : ''}"${src.title}." *${src.websiteName || 'Website'}*, ${src.datePublished || y}${src.url ? ', ' + src.url : ''}. Accessed ${src.dateAccessed || 'n.d.'}.`
    }
    if (src.type === 'book') {
      const ed = src.edition ? `, ${src.edition} ed.` : ''
      return `${author}${author ? '. ' : ''}*${src.title}*${ed}. ${src.publisher ? src.publisher + ', ' : ''}${y}.`
    }
    if (src.type === 'journal') {
      const vol = src.volume ? `, vol. ${src.volume}` : ''
      const iss = src.issue ? `, no. ${src.issue}` : ''
      const pg = src.pages ? `, pp. ${src.pages}` : ''
      const d = src.doi ? ` https://doi.org/${src.doi.replace(/^https?:\/\/doi\.org\//, '')}` : ''
      return `${author}${author ? '. ' : ''}"${src.title}." *${src.journalName}*${vol}${iss}, ${y}${pg}.${d}`
    }
    return `${author}${author ? '. ' : ''}"${src.title}." *${src.websiteName || 'Newspaper'}*, ${src.datePublished || y}${src.url ? ', ' + src.url : ''}.`
  }

  // ── Chicago ──
  if (style === 'chicago') {
    const author = src.author ? formatAuthorsChicago(src.author) : ''
    if (src.type === 'website') {
      return `${author}${author ? '. ' : ''}"${src.title}." ${src.websiteName || ''}. ${src.datePublished || y}. ${src.url || ''}.`
    }
    if (src.type === 'book') {
      const ed = src.edition ? `, ${src.edition} ed.` : ''
      return `${author}${author ? '. ' : ''}*${src.title}*${ed}. ${src.city ? src.city + ': ' : ''}${src.publisher ? src.publisher + ', ' : ''}${y}.`
    }
    if (src.type === 'journal') {
      const vol = src.volume ? ` ${src.volume}` : ''
      const iss = src.issue ? `, no. ${src.issue}` : ''
      const pg = src.pages ? `: ${src.pages}` : ''
      const d = src.doi ? ` https://doi.org/${src.doi.replace(/^https?:\/\/doi\.org\//, '')}` : ''
      return `${author}${author ? '. ' : ''}"${src.title}." *${src.journalName}*${vol}${iss} (${y})${pg}.${d}`
    }
    return `${author}${author ? '. ' : ''}"${src.title}." *${src.websiteName || 'Newspaper'}*, ${src.datePublished || y}.${src.url ? ' ' + src.url : ''}`
  }

  // ── Harvard ──
  if (style === 'harvard') {
    const author = src.author ? formatAuthorsHarvard(src.author) : ''
    if (src.type === 'website') {
      return `${author}${author ? ' ' : ''}(${y}) *${src.title}*. ${src.websiteName ? src.websiteName + '. ' : ''}Available at: ${src.url || 'URL'} (Accessed: ${src.dateAccessed || 'n.d.'}).`
    }
    if (src.type === 'book') {
      const ed = src.edition ? ` ${src.edition} edn.` : ''
      return `${author}${author ? ' ' : ''}(${y}) *${src.title}*.${ed} ${src.city ? src.city + ': ' : ''}${src.publisher ? src.publisher + '.' : ''}`
    }
    if (src.type === 'journal') {
      const vol = src.volume ? `, ${src.volume}` : ''
      const iss = src.issue ? `(${src.issue})` : ''
      const pg = src.pages ? `, pp. ${src.pages}` : ''
      const d = src.doi ? ` doi: ${src.doi.replace(/^https?:\/\/doi\.org\//, '')}` : ''
      return `${author}${author ? ' ' : ''}(${y}) '${src.title}', *${src.journalName}*${vol}${iss}${pg}.${d}`
    }
    return `${author}${author ? ' ' : ''}(${y}) '${src.title}', *${src.websiteName || 'Newspaper'}*, ${src.datePublished || y}.${src.url ? ' Available at: ' + src.url : ''}`
  }

  // ── IEEE ──
  // IEEE uses numbered references: [1] A. Author, "Title," ...
  const author = src.author ? formatAuthorsIEEE(src.author) : ''
  if (src.type === 'website') {
    return `${author}${author ? ', ' : ''}"${src.title}," *${src.websiteName || 'Website'}*, ${y}. [Online]. Available: ${src.url || 'URL'}. [Accessed: ${src.dateAccessed || 'n.d.'}].`
  }
  if (src.type === 'book') {
    const ed = src.edition ? `, ${src.edition} ed.` : ''
    return `${author}${author ? ', ' : ''}*${src.title}*${ed}. ${src.city ? src.city + ': ' : ''}${src.publisher ? src.publisher + ', ' : ''}${y}.`
  }
  if (src.type === 'journal') {
    const vol = src.volume ? `, vol. ${src.volume}` : ''
    const iss = src.issue ? `, no. ${src.issue}` : ''
    const pg = src.pages ? `, pp. ${src.pages}` : ''
    return `${author}${author ? ', ' : ''}"${src.title}," *${src.journalName}*${vol}${iss}${pg}, ${y}.`
  }
  return `${author}${author ? ', ' : ''}"${src.title}," *${src.websiteName || 'Newspaper'}*, ${src.datePublished || y}.`
}

function formatInText(src: CitationSource, style: CitationStyle, index: number): string {
  const y = src.year || 'n.d.'
  const first = src.author ? src.author.split(/\s*[,;&]\s*/)[0].trim().split(/\s+/).pop() || 'Author' : 'Author'
  const authorCount = src.author ? src.author.split(/\s*[,;&]\s*/).filter(Boolean).length : 0

  if (style === 'apa7' || style === 'harvard') {
    if (authorCount <= 1) return `(${first}, ${y})`
    if (authorCount === 2) {
      const second = src.author.split(/\s*[,;&]\s*/)[1]?.trim().split(/\s+/).pop() || ''
      return `(${first} & ${second}, ${y})`
    }
    return `(${first} et al., ${y})`
  }
  if (style === 'mla9') {
    if (authorCount <= 1) return `(${first} ${src.pages ? src.pages : ''})`
    return `(${first} et al. ${src.pages ? src.pages : ''})`
  }
  if (style === 'chicago') {
    if (authorCount <= 1) return `(${first} ${y}, ${src.pages ? src.pages : ''})`
    return `(${first} et al. ${y}, ${src.pages ? src.pages : ''})`
  }
  // IEEE
  return `[${index + 1}]`
}

function InputField({ label, value, onChange, type = 'text', placeholder }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string
}) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground mb-1 block">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm"
      />
    </div>
  )
}

function CopyInlineButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
      className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded border border-border hover:bg-muted transition-colors"
      title="Copy"
    >
      {copied ? <><Check className="h-3 w-3 text-green-500" /> Copied</> : <><Copy className="h-3 w-3" /> Copy</>}
    </button>
  )
}

export default function CitationGeneratorPage() {
  const [style, setStyle] = useState<CitationStyle>('apa7')
  const [sources, setSources] = useState<CitationSource[]>([emptySource()])
  const [activeIdx, setActiveIdx] = useState(0)

  const activeSrc = sources[activeIdx] || emptySource()

  const updateField = useCallback((field: keyof CitationSource, value: string) => {
    setSources(prev => prev.map((s, i) => i === activeIdx ? { ...s, [field]: value } : s))
  }, [activeIdx])

  const changeType = useCallback((type: SourceType) => {
    setSources(prev => prev.map((s, i) => i === activeIdx ? { ...s, type } : s))
  }, [activeIdx])

  const addSource = () => {
    const n = emptySource()
    setSources(prev => [...prev, n])
    setActiveIdx(sources.length)
  }

  const removeSource = (idx: number) => {
    if (sources.length <= 1) return
    setSources(prev => prev.filter((_, i) => i !== idx))
    if (activeIdx >= sources.length - 1) setActiveIdx(Math.max(0, sources.length - 2))
    else if (activeIdx > idx) setActiveIdx(activeIdx - 1)
  }

  const citation = formatCitation(activeSrc, style)
  const inText = formatInText(activeSrc, style, activeIdx)

  // Full bibliography (all sources)
  const bibliography = sources.map((src, i) => {
    const c = formatCitation(src, style)
    return style === 'ieee' ? `[${i + 1}] ${c}` : c
  }).join('\n\n')

  return (
    <ToolPage
      title="Citation Generator"
      description="Generate APA, MLA, Chicago, Harvard, and IEEE citations for websites, books, journals, and newspapers — free"
      category="text"
      categoryLabel="Text Tools"
      helpContent={
        <div>
          <h2>Free Online Citation Generator</h2>
          <p>
            Generate properly formatted citations and bibliographies instantly. Supports APA 7th Edition,
            MLA 9th Edition, Chicago, Harvard, and IEEE styles. Add multiple sources to build a complete
            bibliography — all free, no sign-up required.
          </p>
          <h3>Supported Citation Styles</h3>
          <ul>
            <li><strong>APA 7th Edition</strong> — Used in psychology, education, and social sciences.</li>
            <li><strong>MLA 9th Edition</strong> — Used in humanities, literature, and the arts.</li>
            <li><strong>Chicago / Turabian</strong> — Used in history, philosophy, and some social sciences.</li>
            <li><strong>Harvard</strong> — Used widely in UK and Australian universities.</li>
            <li><strong>IEEE</strong> — Used in engineering, computer science, and technical fields.</li>
          </ul>
          <h3>Source Types</h3>
          <ul>
            <li><strong>Website</strong> — URL, title, author, date published, date accessed, website name.</li>
            <li><strong>Book</strong> — Title, author(s), publisher, year, edition, city.</li>
            <li><strong>Journal Article</strong> — Title, author(s), journal name, volume, issue, pages, year, DOI.</li>
            <li><strong>Newspaper</strong> — Title, author, newspaper name, date published, URL.</li>
          </ul>
          <h3>How to Use</h3>
          <ol>
            <li>Choose a citation style (APA, MLA, Chicago, Harvard, IEEE).</li>
            <li>Select your source type (Website, Book, Journal, Newspaper).</li>
            <li>Fill in the fields — the citation updates in real time.</li>
            <li>Copy the formatted citation or in-text citation.</li>
            <li>Add more sources with the + button to build a full bibliography.</li>
            <li>Copy the complete bibliography at the bottom.</li>
          </ol>
          <h3>Why Use This Instead of Paid Tools?</h3>
          <p>
            EasyBib requires a Chegg subscription ($15/month), MyBib shows ads and has limited features,
            and BibMe has paywalled styles. This tool supports all 5 major citation styles, handles
            multiple sources, and generates both in-text citations and full bibliographies — completely free.
          </p>
        </div>
      }
      faqs={[
        { question: 'Which citation style should I use?', answer: 'It depends on your field: APA for psychology/education, MLA for humanities/literature, Chicago for history, Harvard for UK/Australian universities, IEEE for engineering/CS. Always check your assignment or journal requirements.' },
        { question: 'Is this citation generator accurate?', answer: 'This tool follows the official formatting rules for each style. However, always double-check citations against your style manual, as edge cases (e.g., 20+ authors, special characters) may need manual adjustment.' },
        { question: 'Can I generate a bibliography with multiple sources?', answer: 'Yes! Use the + Add Source button to add as many sources as you need. The full bibliography is generated at the bottom and can be copied in one click.' },
        { question: 'Does it handle DOIs?', answer: 'Yes — for journal articles, enter the DOI and it will be formatted correctly for each style. It also auto-strips the https://doi.org/ prefix if you paste the full URL.' },
        { question: 'Is my data saved?', answer: 'No — everything runs in your browser. No data is sent to any server. If you refresh the page, your citations are reset, so copy them before leaving.' },
      ]}
    >
      <div className="space-y-6">
        {/* ── Style selector ── */}
        <div>
          <label className="text-sm font-medium mb-2 block">Citation Style</label>
          <div className="flex flex-wrap gap-2">
            {STYLES.map(s => (
              <button
                key={s.value}
                onClick={() => setStyle(s.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  style === s.value ? 'bg-primary text-primary-foreground border-primary' : 'border-border bg-card hover:bg-muted'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* ── Source list (sidebar) ── */}
          <div className="lg:col-span-1 space-y-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Sources</span>
              <button onClick={addSource} className="p-1.5 rounded hover:bg-muted transition-colors" title="Add source">
                <Plus className="h-4 w-4" />
              </button>
            </div>
            {sources.map((src, i) => (
              <div
                key={src.id}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors ${
                  activeIdx === i ? 'bg-primary/10 border-primary' : 'border-border hover:bg-muted'
                }`}
                onClick={() => setActiveIdx(i)}
              >
                <BookOpen className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <span className="text-xs truncate flex-1">{src.title || `Source ${i + 1}`}</span>
                {sources.length > 1 && (
                  <button
                    onClick={e => { e.stopPropagation(); removeSource(i) }}
                    className="p-0.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* ── Source fields ── */}
          <div className="lg:col-span-2 space-y-4">
            {/* Source type */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Source Type</label>
              <div className="flex flex-wrap gap-1.5">
                {SOURCE_TYPES.map(st => (
                  <button
                    key={st.value}
                    onClick={() => changeType(st.value)}
                    className={`px-3 py-1.5 rounded text-xs font-medium border transition-colors ${
                      activeSrc.type === st.value ? 'bg-primary text-primary-foreground border-primary' : 'border-border bg-card hover:bg-muted'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Common fields */}
            <InputField label="Title" value={activeSrc.title} onChange={v => updateField('title', v)} placeholder="Title of the work" />
            <InputField label="Author(s)" value={activeSrc.author} onChange={v => updateField('author', v)} placeholder="John Smith & Jane Doe" />

            {/* Type-specific fields */}
            {activeSrc.type === 'website' && (
              <>
                <InputField label="Website Name" value={activeSrc.websiteName} onChange={v => updateField('websiteName', v)} placeholder="BBC News" />
                <InputField label="URL" value={activeSrc.url} onChange={v => updateField('url', v)} placeholder="https://example.com/article" />
                <div className="grid grid-cols-2 gap-3">
                  <InputField label="Date Published" value={activeSrc.datePublished} onChange={v => updateField('datePublished', v)} type="date" />
                  <InputField label="Date Accessed" value={activeSrc.dateAccessed} onChange={v => updateField('dateAccessed', v)} type="date" />
                </div>
                <InputField label="Year" value={activeSrc.year} onChange={v => updateField('year', v)} placeholder="2024" />
              </>
            )}

            {activeSrc.type === 'book' && (
              <>
                <InputField label="Year" value={activeSrc.year} onChange={v => updateField('year', v)} placeholder="2024" />
                <InputField label="Publisher" value={activeSrc.publisher} onChange={v => updateField('publisher', v)} placeholder="Oxford University Press" />
                <div className="grid grid-cols-2 gap-3">
                  <InputField label="Edition" value={activeSrc.edition} onChange={v => updateField('edition', v)} placeholder="3rd" />
                  <InputField label="City" value={activeSrc.city} onChange={v => updateField('city', v)} placeholder="New York" />
                </div>
              </>
            )}

            {activeSrc.type === 'journal' && (
              <>
                <InputField label="Journal Name" value={activeSrc.journalName} onChange={v => updateField('journalName', v)} placeholder="Nature" />
                <InputField label="Year" value={activeSrc.year} onChange={v => updateField('year', v)} placeholder="2024" />
                <div className="grid grid-cols-3 gap-3">
                  <InputField label="Volume" value={activeSrc.volume} onChange={v => updateField('volume', v)} placeholder="12" />
                  <InputField label="Issue" value={activeSrc.issue} onChange={v => updateField('issue', v)} placeholder="3" />
                  <InputField label="Pages" value={activeSrc.pages} onChange={v => updateField('pages', v)} placeholder="45-67" />
                </div>
                <InputField label="DOI" value={activeSrc.doi} onChange={v => updateField('doi', v)} placeholder="10.1000/xyz123" />
              </>
            )}

            {activeSrc.type === 'newspaper' && (
              <>
                <InputField label="Newspaper Name" value={activeSrc.websiteName} onChange={v => updateField('websiteName', v)} placeholder="The New York Times" />
                <InputField label="Date Published" value={activeSrc.datePublished} onChange={v => updateField('datePublished', v)} type="date" />
                <InputField label="Year" value={activeSrc.year} onChange={v => updateField('year', v)} placeholder="2024" />
                <InputField label="URL (if online)" value={activeSrc.url} onChange={v => updateField('url', v)} placeholder="https://nytimes.com/..." />
              </>
            )}
          </div>

          {/* ── Output ── */}
          <div className="lg:col-span-2 space-y-4">
            {/* Formatted citation */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-medium">Formatted Citation</label>
                <CopyInlineButton text={citation.replace(/\*/g, '')} />
              </div>
              <div className="p-4 rounded-lg border border-border bg-muted/30 text-sm leading-relaxed min-h-[80px]"
                dangerouslySetInnerHTML={{
                  __html: citation
                    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
                    .replace(/(https?:\/\/[^\s.]+\.[^\s,;)]+)/g, '<a href="$1" class="text-primary underline" target="_blank" rel="noopener">$1</a>')
                }}
              />
            </div>

            {/* In-text citation */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-medium">In-text Citation</label>
                <CopyInlineButton text={inText} />
              </div>
              <div className="p-3 rounded-lg border border-border bg-muted/30 text-sm font-mono">
                {inText}
              </div>
            </div>

            {/* Full bibliography */}
            {sources.length > 1 && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium">Full Bibliography ({sources.length} sources)</label>
                  <CopyInlineButton text={bibliography.replace(/\*/g, '')} />
                </div>
                <div className="p-4 rounded-lg border border-border bg-muted/30 text-sm leading-relaxed max-h-64 overflow-y-auto space-y-3">
                  {sources.map((src, i) => {
                    const c = formatCitation(src, style)
                    const display = style === 'ieee' ? `[${i + 1}] ${c}` : c
                    return (
                      <div key={src.id} className="pb-2 border-b border-border last:border-0"
                        dangerouslySetInnerHTML={{
                          __html: display
                            .replace(/\*([^*]+)\*/g, '<em>$1</em>')
                            .replace(/(https?:\/\/[^\s.]+\.[^\s,;)]+)/g, '<a href="$1" class="text-primary underline" target="_blank" rel="noopener">$1</a>')
                        }}
                      />
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ToolPage>
  )
}
