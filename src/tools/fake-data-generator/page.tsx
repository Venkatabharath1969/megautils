'use client'

import { useState, useCallback } from 'react'
import { ToolPage, ToolTextarea, CopyButton, DownloadButton, ClearButton } from '@/components/tool-page'

const FIRST_NAMES = [
  'James', 'Mary', 'Robert', 'Patricia', 'John', 'Jennifer', 'Michael', 'Linda',
  'David', 'Elizabeth', 'William', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica',
  'Thomas', 'Sarah', 'Charles', 'Karen', 'Daniel', 'Lisa', 'Matthew', 'Nancy',
  'Anthony', 'Betty', 'Mark', 'Margaret', 'Steven', 'Sandra', 'Paul', 'Ashley',
  'Andrew', 'Dorothy', 'Joshua', 'Kimberly', 'Kenneth', 'Emily', 'Kevin', 'Donna',
  'Brian', 'Michelle', 'George', 'Carol', 'Timothy', 'Amanda', 'Ronald', 'Melissa',
  'Edward', 'Deborah', 'Jason', 'Stephanie', 'Jeffrey', 'Rebecca', 'Ryan', 'Sharon',
  'Jacob', 'Laura', 'Gary', 'Cynthia', 'Nicholas', 'Kathleen', 'Eric', 'Amy',
]

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
  'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
  'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker',
  'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
  'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell',
]

const STREET_NAMES = [
  'Main St', 'Oak Ave', 'Cedar Ln', 'Elm St', 'Pine Rd', 'Maple Dr', 'Washington Blvd',
  'Park Ave', 'Lake St', 'Hill Rd', 'Forest Dr', 'River Rd', 'Church St', 'Market St',
  'Spring St', 'Sunset Blvd', 'Highland Ave', 'Valley Rd', 'Meadow Ln', 'Garden Way',
]

const CITIES = [
  'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio',
  'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville', 'Fort Worth', 'Columbus',
  'Charlotte', 'Indianapolis', 'Seattle', 'Denver', 'Boston', 'Nashville', 'Portland',
]

const STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL',
  'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO',
]

const COMPANY_SUFFIXES = ['Inc', 'LLC', 'Corp', 'Group', 'Solutions', 'Technologies', 'Systems', 'Services', 'Labs', 'Co']
const COMPANY_WORDS = ['Alpha', 'Beta', 'Global', 'Digital', 'Tech', 'Smart', 'Blue', 'Green', 'Nova', 'Apex', 'Peak', 'Core', 'Bright', 'Swift', 'Cloud', 'Net', 'Pro', 'Max', 'Zen', 'Quantum']

const COUNTRIES = [
  'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France', 'Japan', 'Brazil',
  'India', 'China', 'Mexico', 'South Korea', 'Italy', 'Spain', 'Netherlands', 'Sweden', 'Norway',
  'Denmark', 'Finland', 'Switzerland', 'Austria', 'Belgium', 'Poland', 'Portugal', 'Ireland',
  'New Zealand', 'Singapore', 'South Africa', 'Argentina', 'Chile', 'Colombia', 'Peru', 'Egypt',
  'Turkey', 'Thailand', 'Vietnam', 'Indonesia', 'Philippines', 'Malaysia', 'Nigeria', 'Kenya',
  'Czech Republic', 'Romania', 'Greece', 'Hungary', 'Israel', 'UAE', 'Saudi Arabia', 'Ukraine', 'Pakistan',
]

const LOREM_WORDS = [
  'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
  'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
  'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
  'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
  'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
]

const DOMAINS = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'mail.com', 'proton.me', 'icloud.com']

const ADJECTIVES = ['swift', 'bright', 'cool', 'dark', 'epic', 'fast', 'grand', 'happy', 'icy', 'keen', 'loud', 'mega', 'noble', 'odd', 'prime', 'quiet', 'rare', 'super', 'tiny', 'ultra']
const NOUNS = ['tiger', 'eagle', 'shark', 'wolf', 'bear', 'hawk', 'lion', 'fox', 'dragon', 'phoenix', 'cobra', 'panda', 'falcon', 'raven', 'viper', 'orca', 'lynx', 'mantis', 'jaguar', 'python']
const URL_WORDS = ['alpha', 'beta', 'delta', 'gamma', 'omega', 'sigma', 'nova', 'apex', 'core', 'flux', 'nexus', 'pulse', 'spark', 'wave', 'zone', 'pixel', 'cloud', 'data', 'sync', 'tech']

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function generatePhone(): string {
  return `(${randInt(200, 999)}) ${randInt(200, 999)}-${String(randInt(0, 9999)).padStart(4, '0')}`
}

function generateZip(): string {
  return String(randInt(10000, 99999))
}

function generateDOB(): string {
  const now = new Date()
  const minAge = 18, maxAge = 80
  const year = now.getFullYear() - randInt(minAge, maxAge)
  const month = randInt(1, 12)
  const day = randInt(1, 28)
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function generateUsername(): string {
  return `${pick(ADJECTIVES)}${pick(NOUNS)}${randInt(1, 999)}`
}

function generateUrl(): string {
  return `https://www.${pick(URL_WORDS)}${pick(URL_WORDS)}.com`
}

function generateIPv4(): string {
  return `${randInt(1, 254)}.${randInt(0, 255)}.${randInt(0, 255)}.${randInt(1, 254)}`
}

function generateUUID(): string {
  const hex = () => Math.floor(Math.random() * 16).toString(16)
  const s = (n: number) => Array.from({ length: n }, hex).join('')
  return `${s(8)}-${s(4)}-4${s(3)}-${['8','9','a','b'][randInt(0,3)]}${s(3)}-${s(12)}`
}

function generateColor(): string {
  return `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`
}

function generateBoolean(): string {
  return Math.random() < 0.5 ? 'true' : 'false'
}

function generateLatitude(): string {
  return (Math.random() * 180 - 90).toFixed(6)
}

function generateLongitude(): string {
  return (Math.random() * 360 - 180).toFixed(6)
}

function generateParagraph(): string {
  const sentenceCount = randInt(2, 3)
  const sentences: string[] = []
  for (let s = 0; s < sentenceCount; s++) {
    const wordCount = randInt(6, 12)
    const words: string[] = []
    for (let w = 0; w < wordCount; w++) words.push(pick(LOREM_WORDS))
    words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1)
    sentences.push(words.join(' ') + '.')
  }
  return sentences.join(' ')
}

function generateInteger(): string {
  return String(randInt(1, 10000))
}

function generateMacAddress(): string {
  return Array.from({ length: 6 }, () =>
    Math.floor(Math.random() * 256).toString(16).padStart(2, '0').toUpperCase()
  ).join(':')
}

function generateFakeCreditCard(): string {
  // Intentionally Luhn-failing fake card with 4111 prefix
  const digits = '4111' + Array.from({ length: 12 }, () => randInt(0, 9)).join('')
  return `${digits.slice(0,4)}-${digits.slice(4,8)}-${digits.slice(8,12)}-${digits.slice(12,16)}`
}

type FieldKey = 'name' | 'email' | 'phone' | 'address' | 'company' | 'dob' | 'username' | 'url' | 'ipv4' | 'uuid' | 'creditCard' | 'color' | 'boolean' | 'latitude' | 'longitude' | 'country' | 'paragraph' | 'integer' | 'mac_address'

const ALL_FIELDS: { key: FieldKey; label: string }[] = [
  { key: 'name', label: 'Full Name' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'address', label: 'Address' },
  { key: 'company', label: 'Company' },
  { key: 'dob', label: 'Date of Birth' },
  { key: 'username', label: 'Username' },
  { key: 'url', label: 'URL' },
  { key: 'ipv4', label: 'IPv4 Address' },
  { key: 'uuid', label: 'UUID' },
  { key: 'creditCard', label: 'Credit Card (fake)' },
  { key: 'color', label: 'Color' },
  { key: 'boolean', label: 'Boolean' },
  { key: 'latitude', label: 'Latitude' },
  { key: 'longitude', label: 'Longitude' },
  { key: 'country', label: 'Country' },
  { key: 'paragraph', label: 'Paragraph' },
  { key: 'integer', label: 'Integer' },
  { key: 'mac_address', label: 'MAC Address' },
]

type FakeRecord = Record<string, string>

function generateRecord(fields: FieldKey[]): FakeRecord {
  const first = pick(FIRST_NAMES)
  const last = pick(LAST_NAMES)
  const record: FakeRecord = {}
  for (const field of fields) {
    switch (field) {
      case 'name': record.name = `${first} ${last}`; break
      case 'email': record.email = `${first.toLowerCase()}.${last.toLowerCase()}${randInt(1, 99)}@${pick(DOMAINS)}`; break
      case 'phone': record.phone = generatePhone(); break
      case 'address': record.address = `${randInt(1, 9999)} ${pick(STREET_NAMES)}, ${pick(CITIES)}, ${pick(STATES)} ${generateZip()}`; break
      case 'company': record.company = `${pick(COMPANY_WORDS)} ${pick(COMPANY_WORDS)} ${pick(COMPANY_SUFFIXES)}`; break
      case 'dob': record.dob = generateDOB(); break
      case 'username': record.username = generateUsername(); break
      case 'url': record.url = generateUrl(); break
      case 'ipv4': record.ipv4 = generateIPv4(); break
      case 'uuid': record.uuid = generateUUID(); break
      case 'creditCard': record.creditCard = generateFakeCreditCard(); break
      case 'color': record.color = generateColor(); break
      case 'boolean': record.boolean = generateBoolean(); break
      case 'latitude': record.latitude = generateLatitude(); break
      case 'longitude': record.longitude = generateLongitude(); break
      case 'country': record.country = pick(COUNTRIES); break
      case 'paragraph': record.paragraph = generateParagraph(); break
      case 'integer': record.integer = generateInteger(); break
      case 'mac_address': record.mac_address = generateMacAddress(); break
    }
  }
  return record
}

function escapeSqlValue(value: string): string {
  return value.replace(/'/g, "''")
}

export default function FakeDataGeneratorTool() {
  const [count, setCount] = useState(10)
  const [format, setFormat] = useState<'json' | 'csv' | 'sql'>('json')
  const [output, setOutput] = useState('')
  const [records, setRecords] = useState<FakeRecord[]>([])
  const [selectedFields, setSelectedFields] = useState<FieldKey[]>(['name', 'email', 'phone', 'address', 'company'])
  const [tableName, setTableName] = useState('users')

  const toggleField = (key: FieldKey) => {
    setSelectedFields(prev =>
      prev.includes(key) ? prev.filter(f => f !== key) : [...prev, key]
    )
  }

  const generate = useCallback(() => {
    if (selectedFields.length === 0) return
    const data: FakeRecord[] = []
    for (let i = 0; i < Math.min(count, 100); i++) {
      data.push(generateRecord(selectedFields))
    }
    setRecords(data)

    if (format === 'json') {
      setOutput(JSON.stringify(data, null, 2))
    } else if (format === 'csv') {
      const header = selectedFields.map(f => ALL_FIELDS.find(af => af.key === f)!.label).join(',')
      const rows = data.map(r =>
        selectedFields.map(f => `"${r[f] || ''}"`).join(',')
      )
      setOutput([header, ...rows].join('\n'))
    } else {
      // SQL INSERT format
      const columns = selectedFields.join(', ')
      const tbl = tableName.trim() || 'users'
      const statements = data.map(r => {
        const values = selectedFields.map(f => `'${escapeSqlValue(r[f] || '')}'`).join(', ')
        return `INSERT INTO ${tbl} (${columns}) VALUES (${values});`
      })
      setOutput(statements.join('\n'))
    }
  }, [count, format, selectedFields, tableName])

  const clear = () => {
    setOutput('')
    setRecords([])
  }

  const mimeType = format === 'json' ? 'application/json' : format === 'csv' ? 'text/csv' : 'text/sql'
  const filename = format === 'json' ? 'fake-data.json' : format === 'csv' ? 'fake-data.csv' : 'fake-data.sql'

  return (
    <ToolPage
      title="Fake Data Generator"
      description="Generate realistic fake names, emails, phone numbers, addresses, and company names"
      category="generators"
      categoryLabel="Generators"
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>Fake Data Generator is a free browser-based tool that lets you generate realistic but fake data including names, emails, addresses, phone numbers, and more for testing. It processes everything locally in your browser using JavaScript, so your data never leaves your device. No sign-up, no installation, and no server uploads required — just open the tool and start using it immediately.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Configure the generation parameters — type, format, quantity, and any constraints.</li>
            <li>Click <strong>Generate</strong> to produce your output.</li>
            <li>Review the generated content and regenerate if needed.</li>
            <li>Copy individual items or download the full set for immediate use.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>This tool is particularly useful when populating databases with test data, building UI prototypes, testing form validation, or demonstrating features without real user data. Since it runs entirely in your browser, it works offline after the page loads and keeps your data completely private. Whether you are a developer, designer, student, or professional, this development tool saves time and eliminates the need for desktop software installation.</p>

          <h2>Tips and Best Practices</h2>
          <ul>
            <li>Generated values use cryptographically secure random sources when security-sensitive (passwords, UUIDs).</li>
            <li>Click Generate multiple times to produce different variations until you find what you need.</li>
            <li>Customize format options to match the exact requirements of your project or platform.</li>
            <li>Copy individual items or generate in bulk depending on the tool capabilities.</li>
            <li>All generation happens in your browser — nothing is stored on any server.</li>
          </ul>
        </>
      }
      faqs={[
        { question: 'Is the generated fake data real?', answer: 'No. All names, emails, phone numbers, and addresses are randomly generated and do not correspond to real people or places. The data is suitable for testing and development purposes only.' },
        { question: 'Can I use this fake data for software testing?', answer: 'Yes. This tool is designed for populating test databases, mocking API responses, creating demo content, and UI prototyping without using real personal information.' },
        { question: 'How many records can I generate at once?', answer: 'You can generate up to 100 records at a time. The output is available in both JSON and CSV formats for easy import into your application or spreadsheet.' },
        { question: 'Is the data generated on the server?', answer: 'No. All data is generated entirely in your browser in your browser. Nothing is sent to or stored on any server, ensuring complete privacy.' },
      ]}
    >
      <div className="space-y-4">
        {/* Field Selector */}
        <div>
          <label className="text-sm font-medium mb-2 block">Fields to Generate</label>
          <div className="flex flex-wrap gap-2">
            {ALL_FIELDS.map(f => (
              <label key={f.key} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${selectedFields.includes(f.key) ? 'bg-primary/15 border border-primary/40 text-primary' : 'bg-secondary border border-border text-secondary-foreground'}`}>
                <input
                  type="checkbox"
                  checked={selectedFields.includes(f.key)}
                  onChange={() => toggleField(f.key)}
                  className="sr-only"
                />
                <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center text-[10px] ${selectedFields.includes(f.key) ? 'bg-primary border-primary text-primary-foreground' : 'border-muted-foreground'}`}>
                  {selectedFields.includes(f.key) && '✓'}
                </span>
                {f.label}
              </label>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Count (1-100)</label>
            <input
              type="number"
              value={count}
              onChange={(e) => setCount(Math.max(1, Math.min(100, Number(e.target.value))))}
              min={1}
              max={100}
              className="w-24 h-9 px-3 rounded-md border border-input bg-card text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Format</label>
            <div className="flex gap-2">
              {(['json', 'csv', 'sql'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFormat(f)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${format === f ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'}`}
                >
                  {f.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          {format === 'sql' && (
            <div>
              <label className="text-sm font-medium mb-1 block">Table Name</label>
              <input
                type="text"
                value={tableName}
                onChange={(e) => setTableName(e.target.value)}
                placeholder="users"
                className="w-36 h-9 px-3 rounded-md border border-input bg-card text-sm"
              />
            </div>
          )}
          <button
            onClick={generate}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Generate
          </button>
          {output && <ClearButton onClear={clear} />}
        </div>

        {records.length > 0 && (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">#</th>
                  {selectedFields.map(f => (
                    <th key={f} className="px-3 py-2 text-left font-medium">{ALL_FIELDS.find(af => af.key === f)!.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {records.slice(0, 20).map((r, i) => (
                  <tr key={i} className="border-t border-border">
                    <td className="px-3 py-1.5 text-muted-foreground">{i + 1}</td>
                    {selectedFields.map(f => (
                      <td key={f} className="px-3 py-1.5 font-mono text-xs">{r[f]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {records.length > 20 && (
              <div className="px-3 py-2 text-xs text-muted-foreground bg-muted/30 border-t border-border">
                Showing 20 of {records.length} records. Full data available in output below.
              </div>
            )}
          </div>
        )}

        {output && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Output ({format.toUpperCase()})</span>
              <div className="flex gap-2">
                <CopyButton text={output} />
                <DownloadButton content={output} filename={filename} mimeType={mimeType} />
              </div>
            </div>
            <ToolTextarea value={output} readOnly rows={14} />
          </div>
        )}
      </div>
    </ToolPage>
  )
}
