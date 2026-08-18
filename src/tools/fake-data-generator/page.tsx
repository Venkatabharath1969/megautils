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

const DOMAINS = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'mail.com', 'proton.me', 'icloud.com']

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

interface FakeRecord {
  name: string
  email: string
  phone: string
  address: string
  company: string
}

function generateRecord(): FakeRecord {
  const first = pick(FIRST_NAMES)
  const last = pick(LAST_NAMES)
  const name = `${first} ${last}`
  const email = `${first.toLowerCase()}.${last.toLowerCase()}${randInt(1, 99)}@${pick(DOMAINS)}`
  const phone = generatePhone()
  const address = `${randInt(1, 9999)} ${pick(STREET_NAMES)}, ${pick(CITIES)}, ${pick(STATES)} ${generateZip()}`
  const company = `${pick(COMPANY_WORDS)} ${pick(COMPANY_WORDS)} ${pick(COMPANY_SUFFIXES)}`
  return { name, email, phone, address, company }
}

export default function FakeDataGeneratorTool() {
  const [count, setCount] = useState(10)
  const [format, setFormat] = useState<'json' | 'csv'>('json')
  const [output, setOutput] = useState('')
  const [records, setRecords] = useState<FakeRecord[]>([])

  const generate = useCallback(() => {
    const data: FakeRecord[] = []
    for (let i = 0; i < Math.min(count, 100); i++) {
      data.push(generateRecord())
    }
    setRecords(data)

    if (format === 'json') {
      setOutput(JSON.stringify(data, null, 2))
    } else {
      const header = 'Name,Email,Phone,Address,Company'
      const rows = data.map(r =>
        `"${r.name}","${r.email}","${r.phone}","${r.address}","${r.company}"`
      )
      setOutput([header, ...rows].join('\n'))
    }
  }, [count, format])

  const clear = () => {
    setOutput('')
    setRecords([])
  }

  const mimeType = format === 'json' ? 'application/json' : 'text/csv'
  const filename = format === 'json' ? 'fake-data.json' : 'fake-data.csv'

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
            <li>Enter your data or content in the <strong>input area</strong>.</li>
            <li>Configure any available options or settings to match your needs.</li>
            <li>View the <strong>result instantly</strong> in the output area.</li>
            <li>Use the <strong>Copy</strong> or <strong>Download</strong> button to save your result.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>This tool is particularly useful when populating databases with test data, building UI prototypes, testing form validation, or demonstrating features without real user data. Since it runs entirely in your browser, it works offline after the page loads and keeps your data completely private. Whether you are a developer, designer, student, or professional, this development tool saves time and eliminates the need for desktop software installation.</p>

          <h2>Tips and Best Practices</h2>
          <ul>
            <li>All processing happens locally in your browser — your data is never sent to any server, making it safe for sensitive content.</li>
            <li>The tool works on any modern browser including Chrome, Firefox, Safari, and Edge on both desktop and mobile devices.</li>
            <li>No account or sign-up is required — the tool is completely free with no usage limits.</li>
            <li>Use the Copy button to quickly transfer results to your clipboard for pasting into other applications.</li>
            <li>Bookmark this page for quick access whenever you need test data generation.</li>
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
              <button
                onClick={() => setFormat('json')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${format === 'json' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'}`}
              >
                JSON
              </button>
              <button
                onClick={() => setFormat('csv')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${format === 'csv' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'}`}
              >
                CSV
              </button>
            </div>
          </div>
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
                  <th className="px-3 py-2 text-left font-medium">Name</th>
                  <th className="px-3 py-2 text-left font-medium">Email</th>
                  <th className="px-3 py-2 text-left font-medium">Phone</th>
                  <th className="px-3 py-2 text-left font-medium">Company</th>
                </tr>
              </thead>
              <tbody>
                {records.slice(0, 20).map((r, i) => (
                  <tr key={i} className="border-t border-border">
                    <td className="px-3 py-1.5 text-muted-foreground">{i + 1}</td>
                    <td className="px-3 py-1.5">{r.name}</td>
                    <td className="px-3 py-1.5 font-mono text-xs">{r.email}</td>
                    <td className="px-3 py-1.5">{r.phone}</td>
                    <td className="px-3 py-1.5">{r.company}</td>
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
