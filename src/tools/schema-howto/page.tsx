'use client'

import { useState, useMemo } from 'react'
import { ToolPage, CopyButton, ClearButton } from '@/components/tool-page'

interface HowToStep {
  name: string
  text: string
  image: string
}

export default function SchemaHowToTool() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [totalTime, setTotalTime] = useState('')
  const [estimatedCost, setEstimatedCost] = useState('')
  const [costCurrency, setCostCurrency] = useState('USD')
  const [steps, setSteps] = useState<HowToStep[]>([{ name: '', text: '', image: '' }])
  const [tools, setTools] = useState<string[]>([''])
  const [supplies, setSupplies] = useState<string[]>([''])

  const updateStep = (index: number, field: keyof HowToStep, value: string) => {
    const updated = [...steps]
    updated[index] = { ...updated[index], [field]: value }
    setSteps(updated)
  }

  const output = useMemo(() => {
    const schema: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
    }
    if (name) schema.name = name
    if (description) schema.description = description
    if (totalTime) schema.totalTime = totalTime
    if (estimatedCost) {
      schema.estimatedCost = {
        '@type': 'MonetaryAmount',
        currency: costCurrency,
        value: estimatedCost,
      }
    }
    const validTools = tools.filter(t => t.trim())
    if (validTools.length > 0) {
      schema.tool = validTools.map(t => ({ '@type': 'HowToTool', name: t }))
    }
    const validSupplies = supplies.filter(s => s.trim())
    if (validSupplies.length > 0) {
      schema.supply = validSupplies.map(s => ({ '@type': 'HowToSupply', name: s }))
    }
    const validSteps = steps.filter(s => s.name.trim() || s.text.trim())
    if (validSteps.length > 0) {
      schema.step = validSteps.map((s, i) => {
        const step: Record<string, unknown> = {
          '@type': 'HowToStep',
          position: i + 1,
          name: s.name,
          text: s.text,
        }
        if (s.image) step.image = s.image
        return step
      })
    }
    return `<script type="application/ld+json">\n${JSON.stringify(schema, null, 2)}\n</script>`
  }, [name, description, totalTime, estimatedCost, costCurrency, steps, tools, supplies])

  const clear = () => {
    setName(''); setDescription(''); setTotalTime(''); setEstimatedCost(''); setCostCurrency('USD')
    setSteps([{ name: '', text: '', image: '' }]); setTools(['']); setSupplies([''])
  }

  const inputClass = 'w-full rounded-lg border border-input bg-tool-bg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring'

  return (
    <ToolPage title="HowTo Schema Generator" description="Generate HowTo JSON-LD structured data for step-by-step guides." category="seo" categoryLabel="SEO Tools">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">HowTo Details</h2>
            <ClearButton onClear={clear} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="How to tie a tie" className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="A guide to..." rows={2} className={inputClass} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Total Time (ISO 8601)</label>
              <input type="text" value={totalTime} onChange={e => setTotalTime(e.target.value)} placeholder="PT30M" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Est. Cost</label>
              <input type="text" value={estimatedCost} onChange={e => setEstimatedCost(e.target.value)} placeholder="20" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Currency</label>
              <select value={costCurrency} onChange={e => setCostCurrency(e.target.value)} className={inputClass}>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="INR">INR</option>
              </select>
            </div>
          </div>

          <h3 className="text-sm font-semibold pt-2">Tools</h3>
          {tools.map((tool, i) => (
            <div key={i} className="flex gap-2">
              <input type="text" value={tool} onChange={e => { const u = [...tools]; u[i] = e.target.value; setTools(u) }} placeholder={`Tool ${i + 1}`} className={inputClass} />
              {tools.length > 1 && (
                <button onClick={() => setTools(tools.filter((_, j) => j !== i))} className="text-xs text-red-500 hover:text-red-700 shrink-0 px-2">Remove</button>
              )}
            </div>
          ))}
          <button onClick={() => setTools([...tools, ''])} className="w-full px-3 py-1.5 rounded-lg border-2 border-dashed border-border text-xs font-medium text-muted-foreground hover:border-primary hover:text-primary transition-colors">+ Add Tool</button>

          <h3 className="text-sm font-semibold pt-2">Supplies</h3>
          {supplies.map((supply, i) => (
            <div key={i} className="flex gap-2">
              <input type="text" value={supply} onChange={e => { const u = [...supplies]; u[i] = e.target.value; setSupplies(u) }} placeholder={`Supply ${i + 1}`} className={inputClass} />
              {supplies.length > 1 && (
                <button onClick={() => setSupplies(supplies.filter((_, j) => j !== i))} className="text-xs text-red-500 hover:text-red-700 shrink-0 px-2">Remove</button>
              )}
            </div>
          ))}
          <button onClick={() => setSupplies([...supplies, ''])} className="w-full px-3 py-1.5 rounded-lg border-2 border-dashed border-border text-xs font-medium text-muted-foreground hover:border-primary hover:text-primary transition-colors">+ Add Supply</button>

          <h3 className="text-sm font-semibold pt-2">Steps</h3>
          {steps.map((step, i) => (
            <div key={i} className="p-3 rounded-lg border border-border space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">Step {i + 1}</span>
                {steps.length > 1 && (
                  <button onClick={() => setSteps(steps.filter((_, j) => j !== i))} className="text-xs text-red-500 hover:text-red-700 font-medium">Remove</button>
                )}
              </div>
              <input type="text" value={step.name} onChange={e => updateStep(i, 'name', e.target.value)} placeholder="Step name" className={inputClass} />
              <textarea value={step.text} onChange={e => updateStep(i, 'text', e.target.value)} placeholder="Step instructions..." rows={2} className={inputClass} />
              <input type="url" value={step.image} onChange={e => updateStep(i, 'image', e.target.value)} placeholder="Step image URL (optional)" className={inputClass} />
            </div>
          ))}
          <button onClick={() => setSteps([...steps, { name: '', text: '', image: '' }])} className="w-full px-4 py-2 rounded-lg border-2 border-dashed border-border text-sm font-medium text-muted-foreground hover:border-primary hover:text-primary transition-colors">+ Add Step</button>
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
