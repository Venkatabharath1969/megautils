'use client'

import { useState, useCallback, useRef } from 'react'
import { ToolPage, ClearButton } from '@/components/tool-page'
import { Download, Plus, Trash2, Shield, FileText, Eye } from 'lucide-react'

interface PersonalInfo {
  fullName: string
  email: string
  phone: string
  location: string
  linkedin: string
  website: string
}

interface Experience {
  id: string
  company: string
  title: string
  startDate: string
  endDate: string
  current: boolean
  bullets: string
}

interface Education {
  id: string
  school: string
  degree: string
  startDate: string
  endDate: string
  gpa: string
}

interface ResumeData {
  personal: PersonalInfo
  summary: string
  experience: Experience[]
  education: Education[]
  skills: string
}

type TemplateStyle = 'professional' | 'modern' | 'minimal'

const TEMPLATES: { value: TemplateStyle; label: string; desc: string }[] = [
  { value: 'professional', label: 'Professional', desc: 'Clean and corporate' },
  { value: 'modern', label: 'Modern', desc: 'Color accent sidebar' },
  { value: 'minimal', label: 'Minimal', desc: 'Simple and elegant' },
]

function uid() { return Math.random().toString(36).slice(2, 9) }

function emptyExperience(): Experience {
  return { id: uid(), company: '', title: '', startDate: '', endDate: '', current: false, bullets: '' }
}

function emptyEducation(): Education {
  return { id: uid(), school: '', degree: '', startDate: '', endDate: '', gpa: '' }
}

const defaultData: ResumeData = {
  personal: { fullName: '', email: '', phone: '', location: '', linkedin: '', website: '' },
  summary: '',
  experience: [emptyExperience()],
  education: [emptyEducation()],
  skills: '',
}

function escHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function buildResumeHtml(data: ResumeData, template: TemplateStyle, accentColor: string): string {
  const { personal: p, summary, experience, education, skills } = data
  const skillTags = skills.split(',').map(s => s.trim()).filter(Boolean)

  const contactParts: string[] = []
  if (p.email) contactParts.push(`<a href="mailto:${escHtml(p.email)}" style="color:inherit;text-decoration:none">${escHtml(p.email)}</a>`)
  if (p.phone) contactParts.push(escHtml(p.phone))
  if (p.location) contactParts.push(escHtml(p.location))
  if (p.linkedin) contactParts.push(`<a href="${escHtml(p.linkedin)}" style="color:inherit;text-decoration:none">LinkedIn</a>`)
  if (p.website) contactParts.push(`<a href="${escHtml(p.website)}" style="color:inherit;text-decoration:none">${escHtml(p.website)}</a>`)

  const expHtml = experience.filter(e => e.company || e.title).map(e => {
    const bullets = e.bullets.split('\n').filter(b => b.trim()).map(b => `<li style="margin-bottom:3px">${escHtml(b.trim().replace(/^[-•]\s*/, ''))}</li>`).join('')
    const dateRange = e.current ? `${escHtml(e.startDate)} - Present` : `${escHtml(e.startDate)} - ${escHtml(e.endDate)}`
    return `
      <div style="margin-bottom:14px">
        <div style="display:flex;justify-content:space-between;align-items:baseline">
          <div><strong style="font-size:14px">${escHtml(e.title)}</strong>${e.company ? ` <span style="color:#555">at ${escHtml(e.company)}</span>` : ''}</div>
          <div style="font-size:12px;color:#777;white-space:nowrap">${dateRange}</div>
        </div>
        ${bullets ? `<ul style="margin:6px 0 0;padding-left:18px;font-size:13px;color:#333">${bullets}</ul>` : ''}
      </div>`
  }).join('')

  const eduHtml = education.filter(e => e.school || e.degree).map(e => {
    const dateRange = `${escHtml(e.startDate)} - ${escHtml(e.endDate)}`
    return `
      <div style="margin-bottom:10px">
        <div style="display:flex;justify-content:space-between;align-items:baseline">
          <div><strong style="font-size:14px">${escHtml(e.degree)}</strong>${e.school ? ` <span style="color:#555">- ${escHtml(e.school)}</span>` : ''}</div>
          <div style="font-size:12px;color:#777;white-space:nowrap">${dateRange}</div>
        </div>
        ${e.gpa ? `<div style="font-size:12px;color:#555;margin-top:2px">GPA: ${escHtml(e.gpa)}</div>` : ''}
      </div>`
  }).join('')

  const skillsHtml = skillTags.length > 0
    ? `<div style="display:flex;flex-wrap:wrap;gap:6px">${skillTags.map(s => {
        if (template === 'modern') return `<span style="background:${accentColor}22;color:${accentColor};padding:3px 10px;border-radius:12px;font-size:12px;font-weight:500">${escHtml(s)}</span>`
        if (template === 'minimal') return `<span style="font-size:13px;color:#333">${escHtml(s)}</span><span style="color:#ccc;margin:0 2px">&bull;</span>`
        return `<span style="background:#f0f0f0;padding:3px 10px;border-radius:4px;font-size:12px">${escHtml(s)}</span>`
      }).join('')}</div>`
    : ''

  const sectionTitle = (text: string) => {
    if (template === 'modern') return `<h2 style="font-size:16px;font-weight:700;color:${accentColor};text-transform:uppercase;letter-spacing:1px;margin:0 0 10px;padding-bottom:6px;border-bottom:2px solid ${accentColor}">${text}</h2>`
    if (template === 'minimal') return `<h2 style="font-size:14px;font-weight:600;text-transform:uppercase;letter-spacing:2px;color:#999;margin:0 0 10px">${text}</h2>`
    return `<h2 style="font-size:16px;font-weight:700;color:#222;margin:0 0 10px;padding-bottom:6px;border-bottom:2px solid #333">${text}</h2>`
  }

  const sections: string[] = []
  if (summary) sections.push(`<div style="margin-bottom:20px">${sectionTitle('Summary')}<p style="margin:0;font-size:13px;color:#444;line-height:1.6">${escHtml(summary)}</p></div>`)
  if (expHtml) sections.push(`<div style="margin-bottom:20px">${sectionTitle('Experience')}${expHtml}</div>`)
  if (eduHtml) sections.push(`<div style="margin-bottom:20px">${sectionTitle('Education')}${eduHtml}</div>`)
  if (skillsHtml) sections.push(`<div style="margin-bottom:20px">${sectionTitle('Skills')}${skillsHtml}</div>`)

  if (template === 'modern') {
    return `<div style="font-family:'Segoe UI',Roboto,Arial,sans-serif;max-width:800px;margin:0 auto;display:flex;min-height:1000px;background:#fff">
      <div style="width:240px;background:${accentColor};padding:36px 24px;color:#fff;flex-shrink:0">
        <h1 style="font-size:24px;font-weight:800;margin:0 0 6px;line-height:1.2">${escHtml(p.fullName || 'Your Name')}</h1>
        <div style="font-size:12px;opacity:0.85;margin-bottom:24px;line-height:1.6">${contactParts.join('<br>')}</div>
        ${skills ? `<div style="margin-top:16px"><h3 style="font-size:13px;text-transform:uppercase;letter-spacing:1px;margin:0 0 10px;opacity:0.8">Skills</h3>${skillTags.map(s => `<div style="font-size:12px;padding:3px 0;opacity:0.9">${escHtml(s)}</div>`).join('')}</div>` : ''}
      </div>
      <div style="flex:1;padding:36px 32px">${sections.filter(s => !s.includes('Skills')).join('')}</div>
    </div>`
  }

  if (template === 'minimal') {
    return `<div style="font-family:Georgia,'Times New Roman',serif;max-width:700px;margin:0 auto;padding:48px 40px;background:#fff">
      <div style="text-align:center;margin-bottom:28px">
        <h1 style="font-size:28px;font-weight:400;margin:0 0 8px;letter-spacing:1px">${escHtml(p.fullName || 'Your Name')}</h1>
        <div style="font-size:12px;color:#777">${contactParts.join(' &nbsp;&bull;&nbsp; ')}</div>
      </div>
      ${sections.join('')}
    </div>`
  }

  // Professional (default)
  return `<div style="font-family:'Segoe UI',Roboto,Arial,sans-serif;max-width:750px;margin:0 auto;padding:40px 36px;background:#fff">
    <div style="border-bottom:3px solid #222;padding-bottom:16px;margin-bottom:24px">
      <h1 style="font-size:28px;font-weight:800;margin:0 0 6px;color:#111">${escHtml(p.fullName || 'Your Name')}</h1>
      <div style="font-size:13px;color:#555">${contactParts.join(' &nbsp;|&nbsp; ')}</div>
    </div>
    ${sections.join('')}
  </div>`
}

export default function ResumeBuilderTool() {
  const [data, setData] = useState<ResumeData>(defaultData)
  const [template, setTemplate] = useState<TemplateStyle>('professional')
  const [accentColor, setAccentColor] = useState('#2563eb')
  const [isGenerating, setIsGenerating] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const previewRef = useRef<HTMLDivElement>(null)

  const updatePersonal = (field: keyof PersonalInfo, value: string) => {
    setData(prev => ({ ...prev, personal: { ...prev.personal, [field]: value } }))
  }

  const updateExperience = (id: string, field: keyof Experience, value: string | boolean) => {
    setData(prev => ({
      ...prev,
      experience: prev.experience.map(e => e.id === id ? { ...e, [field]: value } : e),
    }))
  }

  const addExperience = () => setData(prev => ({ ...prev, experience: [...prev.experience, emptyExperience()] }))
  const removeExperience = (id: string) => setData(prev => ({ ...prev, experience: prev.experience.filter(e => e.id !== id) }))

  const updateEducation = (id: string, field: keyof Education, value: string) => {
    setData(prev => ({
      ...prev,
      education: prev.education.map(e => e.id === id ? { ...e, [field]: value } : e),
    }))
  }

  const addEducation = () => setData(prev => ({ ...prev, education: [...prev.education, emptyEducation()] }))
  const removeEducation = (id: string) => setData(prev => ({ ...prev, education: prev.education.filter(e => e.id !== id) }))

  const downloadPdf = useCallback(async () => {
    setIsGenerating(true)
    try {
      const html2pdf = (await import('html2pdf.js')).default
      const html = buildResumeHtml(data, template, accentColor)

      const container = document.createElement('div')
      container.innerHTML = html
      document.body.appendChild(container)

      await html2pdf().set({
        margin: 0,
        filename: `${data.personal.fullName || 'resume'}-${template}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      }).from(container).save()

      document.body.removeChild(container)
    } catch {
      alert('PDF generation failed. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }, [data, template, accentColor])

  const clear = () => {
    setData(defaultData)
    setTemplate('professional')
    setAccentColor('#2563eb')
    setShowPreview(false)
  }

  const previewHtml = buildResumeHtml(data, template, accentColor)

  return (
    <ToolPage
      title="Resume / CV Builder"
      description="Build a professional resume with live preview and download as PDF — free, no sign-up"
      category="generators"
      categoryLabel="Generators"
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>Resume / CV Builder is a free browser-based tool for creating professional resumes. Fill in your personal info, work experience, education, and skills, choose from 3 template styles, customize the accent color, and download a polished PDF — all without sign-ups, watermarks, or subscriptions.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Fill in your <strong>Personal Information</strong> — name, email, phone, location, and optional LinkedIn/website links.</li>
            <li>Write a brief <strong>Summary</strong> highlighting your key qualifications.</li>
            <li>Add <strong>Work Experience</strong> entries with company, job title, dates, and bullet point descriptions.</li>
            <li>Add <strong>Education</strong> entries with school, degree, dates, and optional GPA.</li>
            <li>Enter your <strong>Skills</strong> as a comma-separated list (e.g., JavaScript, React, Project Management).</li>
            <li>Choose a <strong>template style</strong> — Professional, Modern, or Minimal.</li>
            <li>Optionally adjust the <strong>accent color</strong> (used by the Modern template).</li>
            <li>Click <strong>Preview</strong> to see a live preview of your resume.</li>
            <li>Click <strong>Download PDF</strong> to save a high-quality PDF file.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>Use this tool when you need a polished resume or CV quickly. It is a great free alternative to Canva Resume ($15/mo), Resume.io ($2-8/mo), or Zety ($24/mo) — with no watermarks, no account required, and complete privacy since your data never leaves your browser.</p>

          <h2>Tips and Best Practices</h2>
          <ul>
            <li>Keep your resume to 1-2 pages. Use concise bullet points starting with action verbs.</li>
            <li>Tailor your summary and skills to the specific job you are applying for.</li>
            <li>Use the &quot;Professional&quot; template for corporate roles, &quot;Modern&quot; for creative/tech, and &quot;Minimal&quot; for academia.</li>
            <li>Include quantifiable achievements (e.g., &quot;Increased revenue by 30%&quot;) in your experience bullets.</li>
            <li>Your data is never uploaded to any server — everything stays in your browser.</li>
          </ul>
        </>
      }
      faqs={[
        { question: 'Is this resume builder really free?', answer: 'Yes! It is 100% free with no watermarks, no limits, and no sign-up required. Your resume is generated entirely in your browser.' },
        { question: 'Can I download the resume as a PDF?', answer: 'Yes! Click the "Download PDF" button to save a high-quality A4 PDF file using the html2pdf.js library, entirely in your browser.' },
        { question: 'What templates are available?', answer: 'Three templates: Professional (clean corporate style), Modern (color accent sidebar), and Minimal (simple and elegant with serif fonts).' },
        { question: 'Does this upload my personal information?', answer: 'No. All data stays in your browser. Nothing is sent to any server. Your resume is generated entirely on your device.' },
        { question: 'Is this a free alternative to Canva or Resume.io?', answer: 'Yes! This tool provides professional resume templates for free. Unlike Canva ($15/mo) or Resume.io ($2-8/mo), there are no subscriptions, watermarks, or sign-ups required.' },
      ]}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Build Your Resume</span>
          <div className="flex items-center gap-2">
            {data.personal.fullName && <ClearButton onClear={clear} />}
          </div>
        </div>

        {/* Template and color */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Template Style</label>
            <div className="flex flex-wrap gap-2">
              {TEMPLATES.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setTemplate(t.value)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${template === t.value ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'}`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <div className="text-xs text-muted-foreground mt-1">{TEMPLATES.find(t => t.value === template)?.desc}</div>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Accent Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                className="w-10 h-10 rounded border border-border cursor-pointer"
              />
              <span className="text-sm text-muted-foreground">{accentColor} (used by Modern template)</span>
            </div>
          </div>
        </div>

        {/* Personal Info */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold flex items-center gap-1.5"><FileText className="h-4 w-4" /> Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {([
              ['fullName', 'Full Name', 'John Doe'],
              ['email', 'Email', 'john@example.com'],
              ['phone', 'Phone', '+1 (555) 123-4567'],
              ['location', 'Location', 'San Francisco, CA'],
              ['linkedin', 'LinkedIn URL', 'https://linkedin.com/in/johndoe'],
              ['website', 'Website', 'https://johndoe.com'],
            ] as [keyof PersonalInfo, string, string][]).map(([field, label, placeholder]) => (
              <div key={field}>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">{label}</label>
                <input
                  type="text"
                  value={data.personal[field]}
                  onChange={(e) => updatePersonal(field, e.target.value)}
                  placeholder={placeholder}
                  className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Summary / Objective</h3>
          <textarea
            value={data.summary}
            onChange={(e) => setData(prev => ({ ...prev, summary: e.target.value }))}
            placeholder="Brief professional summary highlighting your key qualifications and career goals..."
            rows={3}
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
          />
        </div>

        {/* Experience */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Work Experience</h3>
            <button onClick={addExperience} className="text-xs text-primary hover:underline inline-flex items-center gap-1">
              <Plus className="h-3 w-3" /> Add Entry
            </button>
          </div>
          {data.experience.map((exp, idx) => (
            <div key={exp.id} className="p-3 rounded-lg border border-border bg-muted/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Experience #{idx + 1}</span>
                {data.experience.length > 1 && (
                  <button onClick={() => removeExperience(exp.id)} className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <input
                  type="text"
                  value={exp.title}
                  onChange={(e) => updateExperience(exp.id, 'title', e.target.value)}
                  placeholder="Job Title"
                  className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <input
                  type="text"
                  value={exp.company}
                  onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                  placeholder="Company Name"
                  className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <input
                  type="text"
                  value={exp.startDate}
                  onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                  placeholder="Start Date (e.g., Jan 2023)"
                  className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={exp.endDate}
                    onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                    placeholder="End Date"
                    disabled={exp.current}
                    className="flex-1 px-3 py-1.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
                  />
                  <label className="flex items-center gap-1 text-xs whitespace-nowrap cursor-pointer">
                    <input
                      type="checkbox"
                      checked={exp.current}
                      onChange={(e) => updateExperience(exp.id, 'current', e.target.checked)}
                      className="accent-primary"
                    />
                    Current
                  </label>
                </div>
              </div>
              <textarea
                value={exp.bullets}
                onChange={(e) => updateExperience(exp.id, 'bullets', e.target.value)}
                placeholder="Description bullets (one per line):&#10;- Led team of 5 engineers&#10;- Increased revenue by 30%"
                rows={3}
                className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              />
            </div>
          ))}
        </div>

        {/* Education */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Education</h3>
            <button onClick={addEducation} className="text-xs text-primary hover:underline inline-flex items-center gap-1">
              <Plus className="h-3 w-3" /> Add Entry
            </button>
          </div>
          {data.education.map((edu, idx) => (
            <div key={edu.id} className="p-3 rounded-lg border border-border bg-muted/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Education #{idx + 1}</span>
                {data.education.length > 1 && (
                  <button onClick={() => removeEducation(edu.id)} className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <input
                  type="text"
                  value={edu.degree}
                  onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                  placeholder="Degree (e.g., B.S. Computer Science)"
                  className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <input
                  type="text"
                  value={edu.school}
                  onChange={(e) => updateEducation(edu.id, 'school', e.target.value)}
                  placeholder="School / University"
                  className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <input
                  type="text"
                  value={edu.startDate}
                  onChange={(e) => updateEducation(edu.id, 'startDate', e.target.value)}
                  placeholder="Start Date"
                  className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <input
                  type="text"
                  value={edu.endDate}
                  onChange={(e) => updateEducation(edu.id, 'endDate', e.target.value)}
                  placeholder="End Date"
                  className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <input
                  type="text"
                  value={edu.gpa}
                  onChange={(e) => updateEducation(edu.id, 'gpa', e.target.value)}
                  placeholder="GPA (optional)"
                  className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Skills */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Skills</h3>
          <input
            type="text"
            value={data.skills}
            onChange={(e) => setData(prev => ({ ...prev, skills: e.target.value }))}
            placeholder="Comma-separated skills: JavaScript, React, Python, Project Management, AWS..."
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          {data.skills && (
            <div className="flex flex-wrap gap-1.5">
              {data.skills.split(',').map(s => s.trim()).filter(Boolean).map((s, i) => (
                <span key={i} className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">{s}</span>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-secondary text-secondary-foreground border border-border hover:bg-muted transition-colors"
          >
            <Eye className="h-4 w-4" /> {showPreview ? 'Hide Preview' : 'Preview'}
          </button>
          <button
            onClick={downloadPdf}
            disabled={isGenerating || !data.personal.fullName}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="h-4 w-4" /> {isGenerating ? 'Generating PDF...' : 'Download PDF'}
          </button>
        </div>

        {/* Live preview */}
        {showPreview && (
          <div className="space-y-2">
            <span className="text-sm font-medium">Resume Preview</span>
            {/* bg-white intentional: simulates printed resume/paper appearance */}
            <div className="border border-border rounded-lg p-4 bg-white overflow-auto max-h-[600px]" ref={previewRef}>
              <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-border">
          <Shield className="h-3.5 w-3.5" />
          <span>Your personal data never leaves your device. All resume generation happens locally in your browser.</span>
        </div>
      </div>
    </ToolPage>
  )
}
