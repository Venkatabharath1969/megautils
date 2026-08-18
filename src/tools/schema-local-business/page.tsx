'use client'

import { useState, useMemo } from 'react'
import { ToolPage, CopyButton, ClearButton } from '@/components/tool-page'

const BUSINESS_TYPES = [
  'LocalBusiness', 'Restaurant', 'Dentist', 'Hotel', 'BarOrPub', 'CafeOrCoffeeShop',
  'AutoRepair', 'Bakery', 'BeautySalon', 'ChildCare', 'DaySpa', 'Florist',
  'FurnitureStore', 'GasStation', 'GroceryStore', 'HairSalon', 'HealthClub',
  'HomeGoodsStore', 'Hospital', 'InsuranceAgency', 'LegalService', 'Library',
  'MedicalClinic', 'Pharmacy', 'RealEstateAgent', 'ShoppingCenter', 'TravelAgency',
  'VeterinaryCare',
]

interface OpeningHour {
  days: string[]
  opens: string
  closes: string
}

export default function SchemaLocalBusinessTool() {
  const [businessName, setBusinessName] = useState('')
  const [businessType, setBusinessType] = useState('LocalBusiness')
  const [street, setStreet] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [zip, setZip] = useState('')
  const [country, setCountry] = useState('')
  const [phone, setPhone] = useState('')
  const [website, setWebsite] = useState('')
  const [priceRange, setPriceRange] = useState('')
  const [image, setImage] = useState('')
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [hours, setHours] = useState<OpeningHour[]>([{ days: ['Monday'], opens: '09:00', closes: '17:00' }])

  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  const toggleDay = (hourIndex: number, day: string) => {
    const updated = [...hours]
    const current = updated[hourIndex].days
    if (current.includes(day)) {
      updated[hourIndex] = { ...updated[hourIndex], days: current.filter(d => d !== day) }
    } else {
      updated[hourIndex] = { ...updated[hourIndex], days: [...current, day] }
    }
    setHours(updated)
  }

  const output = useMemo(() => {
    const schema: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': businessType,
    }
    if (businessName) schema.name = businessName
    if (image) schema.image = image
    if (phone) schema.telephone = phone
    if (website) schema.url = website
    if (priceRange) schema.priceRange = priceRange
    if (street || city || state || zip || country) {
      schema.address = {
        '@type': 'PostalAddress',
        ...(street && { streetAddress: street }),
        ...(city && { addressLocality: city }),
        ...(state && { addressRegion: state }),
        ...(zip && { postalCode: zip }),
        ...(country && { addressCountry: country }),
      }
    }
    if (latitude && longitude) {
      schema.geo = {
        '@type': 'GeoCoordinates',
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
      }
    }
    const validHours = hours.filter(h => h.days.length > 0)
    if (validHours.length > 0) {
      schema.openingHoursSpecification = validHours.map(h => ({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: h.days,
        opens: h.opens,
        closes: h.closes,
      }))
    }
    return `<script type="application/ld+json">\n${JSON.stringify(schema, null, 2)}\n</script>`
  }, [businessName, businessType, street, city, state, zip, country, phone, website, priceRange, image, latitude, longitude, hours])

  const clear = () => {
    setBusinessName(''); setBusinessType('LocalBusiness'); setStreet(''); setCity('')
    setState(''); setZip(''); setCountry(''); setPhone(''); setWebsite('')
    setPriceRange(''); setImage(''); setLatitude(''); setLongitude('')
    setHours([{ days: ['Monday'], opens: '09:00', closes: '17:00' }])
  }

  const inputClass = 'w-full rounded-lg border border-input bg-tool-bg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring'

  return (
    <ToolPage
      title="Local Business Schema Generator"
      description="Generate LocalBusiness JSON-LD structured data for local SEO."
      category="seo"
      categoryLabel="SEO Tools"
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>Local Business Schema Generator is a free browser-based tool that lets you generate LocalBusiness JSON-LD structured data with address, hours, contact info, and geo-coordinates. It processes everything locally in your browser using JavaScript, so your data never leaves your device. No sign-up, no installation, and no server uploads required — just open the tool and start using it immediately.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Enter your data or content in the <strong>input area</strong>.</li>
            <li>Configure any available options or settings to match your needs.</li>
            <li>View the <strong>result instantly</strong> in the output area.</li>
            <li>Use the <strong>Copy</strong> or <strong>Download</strong> button to save your result.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>This tool is particularly useful when getting local business rich snippets in search and maps, improving local SEO visibility. Since it runs entirely in your browser, it works offline after the page loads and keeps your data completely private. Whether you are a developer, designer, student, or professional, this SEO tool saves time and eliminates the need for desktop software installation.</p>

          <h2>Tips and Best Practices</h2>
          <ul>
            <li>All processing happens locally in your browser — your data is never sent to any server, making it safe for sensitive content.</li>
            <li>The tool works on any modern browser including Chrome, Firefox, Safari, and Edge on both desktop and mobile devices.</li>
            <li>No account or sign-up is required — the tool is completely free with no usage limits.</li>
            <li>Use the Copy button to quickly transfer results to your clipboard for pasting into other applications.</li>
            <li>Bookmark this page for quick access whenever you need localbusiness schema.</li>
          </ul>
        </>
      }
      faqs={[
        { question: 'What is LocalBusiness schema?', answer: 'LocalBusiness schema is JSON-LD structured data that describes a physical business, including its name, address, phone number, hours, and coordinates. It helps Google display your business in local search results and map packs.' },
        { question: 'Should I use LocalBusiness or a more specific type?', answer: 'Use the most specific type available. For example, use Restaurant instead of LocalBusiness if you run a restaurant. More specific types give Google better context about your business.' },
        { question: 'Does LocalBusiness schema replace Google Business Profile?', answer: 'No. LocalBusiness schema and Google Business Profile serve different purposes. Use both for the best local SEO results: the schema on your website and the profile in Google Maps.' },
        { question: 'How do I add opening hours for different days?', answer: 'Add separate OpeningHoursSpecification entries for each schedule. For example, one entry for Monday-Friday 9-5 and another for Saturday 10-2. Each entry specifies the days, opening time, and closing time.' },
      ]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Business Details</h2>
            <ClearButton onClear={clear} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Business Name</label>
              <input type="text" value={businessName} onChange={e => setBusinessName(e.target.value)} placeholder="Acme Restaurant" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Business Type</label>
              <select value={businessType} onChange={e => setBusinessType(e.target.value)} className={inputClass}>
                {BUSINESS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <h3 className="text-sm font-semibold pt-2">Address</h3>
          <div>
            <label className="block text-sm font-medium mb-1">Street Address</label>
            <input type="text" value={street} onChange={e => setStreet(e.target.value)} placeholder="123 Main St" className={inputClass} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">City</label>
              <input type="text" value={city} onChange={e => setCity(e.target.value)} placeholder="Springfield" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">State / Region</label>
              <input type="text" value={state} onChange={e => setState(e.target.value)} placeholder="IL" className={inputClass} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Postal Code</label>
              <input type="text" value={zip} onChange={e => setZip(e.target.value)} placeholder="62701" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Country</label>
              <input type="text" value={country} onChange={e => setCountry(e.target.value)} placeholder="US" className={inputClass} />
            </div>
          </div>

          <h3 className="text-sm font-semibold pt-2">Contact & Details</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1-555-555-5555" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Website</label>
              <input type="url" value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://example.com" className={inputClass} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Price Range</label>
              <input type="text" value={priceRange} onChange={e => setPriceRange(e.target.value)} placeholder="$$" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Latitude</label>
              <input type="number" step="any" value={latitude} onChange={e => setLatitude(e.target.value)} placeholder="39.7817" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Longitude</label>
              <input type="number" step="any" value={longitude} onChange={e => setLongitude(e.target.value)} placeholder="-89.6501" className={inputClass} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Image URL</label>
            <input type="url" value={image} onChange={e => setImage(e.target.value)} placeholder="https://example.com/photo.jpg" className={inputClass} />
          </div>

          <h3 className="text-sm font-semibold pt-2">Opening Hours</h3>
          {hours.map((h, i) => (
            <div key={i} className="p-3 rounded-lg border border-border space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">Schedule #{i + 1}</span>
                {hours.length > 1 && (
                  <button onClick={() => setHours(hours.filter((_, j) => j !== i))} className="text-xs text-red-500 hover:text-red-700 font-medium">Remove</button>
                )}
              </div>
              <div className="flex flex-wrap gap-1">
                {DAYS.map(day => (
                  <button key={day} onClick={() => toggleDay(i, day)} className={`px-2 py-1 rounded text-xs font-medium transition-colors ${h.days.includes(day) ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'}`}>
                    {day.slice(0, 3)}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-muted-foreground mb-0.5">Opens</label>
                  <input type="time" value={h.opens} onChange={e => { const u = [...hours]; u[i] = { ...u[i], opens: e.target.value }; setHours(u) }} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-0.5">Closes</label>
                  <input type="time" value={h.closes} onChange={e => { const u = [...hours]; u[i] = { ...u[i], closes: e.target.value }; setHours(u) }} className={inputClass} />
                </div>
              </div>
            </div>
          ))}
          <button onClick={() => setHours([...hours, { days: [], opens: '09:00', closes: '17:00' }])} className="w-full px-4 py-2 rounded-lg border-2 border-dashed border-border text-sm font-medium text-muted-foreground hover:border-primary hover:text-primary transition-colors">+ Add Hours</button>
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
