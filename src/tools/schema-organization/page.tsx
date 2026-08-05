'use client'

import { useState, useMemo } from 'react'
import { ToolPage, CopyButton, ClearButton } from '@/components/tool-page'

interface SocialProfile {
  platform: string
  url: string
}

const PLATFORMS = ['Facebook', 'Twitter', 'LinkedIn', 'Instagram', 'YouTube', 'Pinterest', 'TikTok', 'GitHub']

export default function SchemaOrganizationTool() {
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [logo, setLogo] = useState('')
  const [description, setDescription] = useState('')
  const [foundingDate, setFoundingDate] = useState('')
  const [socials, setSocials] = useState<SocialProfile[]>([{ platform: 'Facebook', url: '' }])

  const updateSocial = (index: number, field: keyof SocialProfile, value: string) => {
    const updated = [...socials]
    updated[index] = { ...updated[index], [field]: value }
    setSocials(updated)
  }

  const output = useMemo(() => {
    const schema: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
    }
    if (name) schema.name = name
    if (url) schema.url = url
    if (logo) schema.logo = logo
    if (description) schema.description = description
    if (foundingDate) schema.foundingDate = foundingDate
    const validSocials = socials.filter(s => s.url.trim()).map(s => s.url)
    if (validSocials.length > 0) schema.sameAs = validSocials
    return `<script type="application/ld+json">\n${JSON.stringify(schema, null, 2)}\n</script>`
  }, [name, url, logo, description, foundingDate, socials])

  const clear = () => {
    setName(''); setUrl(''); setLogo(''); setDescription(''); setFoundingDate('')
    setSocials([{ platform: 'Facebook', url: '' }])
  }

  const inputClass = 'w-full rounded-lg border border-input bg-tool-bg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring'

  return (
    <ToolPage
      title="Organization Schema Generator"
      description="Generate Organization JSON-LD structured data for SEO."
      category="seo"
      categoryLabel="SEO Tools"
      faqs={[
        { question: 'What is Organization schema?', answer: 'Organization schema is JSON-LD structured data that describes a company or organization, including its name, logo, website, social profiles, and founding date. It helps Google build a Knowledge Panel for your brand.' },
        { question: 'Where should I place Organization schema?', answer: 'Place Organization schema on your homepage or About page. You only need it on one page since it describes your entire organization, not a specific page.' },
        { question: 'Does Organization schema help with Knowledge Panels?', answer: 'Yes. Properly implemented Organization schema with a logo, description, and social profiles increases the chances of Google generating a Knowledge Panel for your brand in search results.' },
        { question: 'Why should I include social profiles in Organization schema?', answer: 'Adding social profile URLs via the sameAs property helps Google verify your brand identity across platforms and can link your social accounts to your Knowledge Panel.' },
      ]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Organization Details</h2>
            <ClearButton onClear={clear} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Organization Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Acme Inc." className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Website URL</label>
            <input type="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://example.com" className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Logo URL</label>
            <input type="url" value={logo} onChange={e => setLogo(e.target.value)} placeholder="https://example.com/logo.png" className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="About the organization..." rows={3} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Founding Date</label>
            <input type="date" value={foundingDate} onChange={e => setFoundingDate(e.target.value)} className={inputClass} />
          </div>

          <h3 className="text-sm font-semibold pt-2">Social Profiles</h3>
          {socials.map((social, i) => (
            <div key={i} className="flex gap-2">
              <select value={social.platform} onChange={e => updateSocial(i, 'platform', e.target.value)} className="w-36 shrink-0 rounded-lg border border-input bg-tool-bg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <input type="url" value={social.url} onChange={e => updateSocial(i, 'url', e.target.value)} placeholder="https://..." className={inputClass} />
              {socials.length > 1 && (
                <button onClick={() => setSocials(socials.filter((_, j) => j !== i))} className="text-xs text-red-500 hover:text-red-700 shrink-0 px-2">Remove</button>
              )}
            </div>
          ))}
          <button onClick={() => setSocials([...socials, { platform: 'Twitter', url: '' }])} className="w-full px-4 py-2 rounded-lg border-2 border-dashed border-border text-sm font-medium text-muted-foreground hover:border-primary hover:text-primary transition-colors">+ Add Social Profile</button>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold">Generated JSON-LD</span>
            <CopyButton text={output} />
          </div>
          <pre className="w-full rounded-lg border border-input bg-tool-bg p-3 text-xs font-mono overflow-auto whitespace-pre-wrap min-h-[300px]">{output}</pre>
        </div>
      </div>
    </ToolPage>
  )
}
