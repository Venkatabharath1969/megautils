'use client'

import { useState, useMemo } from 'react'
import { ToolPage, CopyButton, ClearButton } from '@/components/tool-page'

export default function SchemaJobPostingTool() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [companyUrl, setCompanyUrl] = useState('')
  const [location, setLocation] = useState('')
  const [isRemote, setIsRemote] = useState(false)
  const [salaryMin, setSalaryMin] = useState('')
  const [salaryMax, setSalaryMax] = useState('')
  const [salaryCurrency, setSalaryCurrency] = useState('USD')
  const [salaryUnit, setSalaryUnit] = useState('YEAR')
  const [employmentType, setEmploymentType] = useState('FULL_TIME')
  const [datePosted, setDatePosted] = useState('')
  const [validThrough, setValidThrough] = useState('')

  const output = useMemo(() => {
    const schema: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': 'JobPosting',
    }
    if (title) schema.title = title
    if (description) schema.description = description
    if (datePosted) schema.datePosted = datePosted
    if (validThrough) schema.validThrough = validThrough
    schema.employmentType = employmentType

    if (companyName) {
      schema.hiringOrganization = {
        '@type': 'Organization',
        name: companyName,
        ...(companyUrl && { sameAs: companyUrl }),
      }
    }

    if (isRemote) {
      schema.jobLocationType = 'TELECOMMUTE'
    }
    if (location && !isRemote) {
      schema.jobLocation = {
        '@type': 'Place',
        address: {
          '@type': 'PostalAddress',
          addressLocality: location,
        },
      }
    }

    if (salaryMin || salaryMax) {
      schema.baseSalary = {
        '@type': 'MonetaryAmount',
        currency: salaryCurrency,
        value: {
          '@type': 'QuantitativeValue',
          ...(salaryMin && { minValue: parseFloat(salaryMin) }),
          ...(salaryMax && { maxValue: parseFloat(salaryMax) }),
          unitText: salaryUnit,
        },
      }
    }

    return `<script type="application/ld+json">\n${JSON.stringify(schema, null, 2)}\n</script>`
  }, [title, description, companyName, companyUrl, location, isRemote, salaryMin, salaryMax, salaryCurrency, salaryUnit, employmentType, datePosted, validThrough])

  const clear = () => {
    setTitle(''); setDescription(''); setCompanyName(''); setCompanyUrl('')
    setLocation(''); setIsRemote(false); setSalaryMin(''); setSalaryMax('')
    setSalaryCurrency('USD'); setSalaryUnit('YEAR'); setEmploymentType('FULL_TIME')
    setDatePosted(''); setValidThrough('')
  }

  const inputClass = 'w-full rounded-lg border border-input bg-tool-bg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring'

  return (
    <ToolPage
      title="Job Posting Schema Generator"
      description="Generate JobPosting JSON-LD structured data for SEO."
      category="seo"
      categoryLabel="SEO Tools"
      faqs={[
        { question: 'What is JobPosting schema?', answer: 'JobPosting schema is JSON-LD structured data that describes a job listing, including the title, salary, location, and hiring company. It enables your jobs to appear in Google for Jobs search results.' },
        { question: 'Is salary information required in JobPosting schema?', answer: 'Salary is not required but strongly recommended. Google gives preference to job postings that include salary ranges, and many candidates filter by salary in Google for Jobs.' },
        { question: 'How do I mark a job as remote in the schema?', answer: 'Set the jobLocationType to "TELECOMMUTE" in your JobPosting schema. This tells Google the position is remote and makes it appear when users filter for remote jobs.' },
        { question: 'What happens when the validThrough date passes?', answer: 'Google will automatically stop showing the job listing in search results after the validThrough date expires. Keep this date updated or remove expired job postings from your site.' },
      ]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Job Details</h2>
            <ClearButton onClear={clear} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Job Title</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Senior Software Engineer" className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Job Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="We are looking for..." rows={3} className={inputClass} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Company Name</label>
              <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Acme Inc." className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Company URL</label>
              <input type="url" value={companyUrl} onChange={e => setCompanyUrl(e.target.value)} placeholder="https://acme.com" className={inputClass} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Location</label>
            <div className="flex gap-3 items-center">
              <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="New York, NY" disabled={isRemote} className={`${inputClass} ${isRemote ? 'opacity-50' : ''}`} />
              <label className="flex items-center gap-1.5 text-sm whitespace-nowrap cursor-pointer">
                <input type="checkbox" checked={isRemote} onChange={e => setIsRemote(e.target.checked)} className="rounded border-input" />
                Remote
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Employment Type</label>
            <select value={employmentType} onChange={e => setEmploymentType(e.target.value)} className={inputClass}>
              <option value="FULL_TIME">Full Time</option>
              <option value="PART_TIME">Part Time</option>
              <option value="CONTRACT">Contract</option>
              <option value="TEMPORARY">Temporary</option>
              <option value="INTERN">Intern</option>
            </select>
          </div>

          <h3 className="text-sm font-semibold pt-2">Salary</h3>
          <div className="grid grid-cols-4 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Min</label>
              <input type="number" value={salaryMin} onChange={e => setSalaryMin(e.target.value)} placeholder="50000" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Max</label>
              <input type="number" value={salaryMax} onChange={e => setSalaryMax(e.target.value)} placeholder="80000" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Currency</label>
              <select value={salaryCurrency} onChange={e => setSalaryCurrency(e.target.value)} className={inputClass}>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="INR">INR</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Unit</label>
              <select value={salaryUnit} onChange={e => setSalaryUnit(e.target.value)} className={inputClass}>
                <option value="YEAR">Year</option>
                <option value="MONTH">Month</option>
                <option value="HOUR">Hour</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Date Posted</label>
              <input type="date" value={datePosted} onChange={e => setDatePosted(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Valid Through</label>
              <input type="date" value={validThrough} onChange={e => setValidThrough(e.target.value)} className={inputClass} />
            </div>
          </div>
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
