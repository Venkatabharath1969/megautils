'use client'

import { useState, useMemo } from 'react'
import { ToolPage, CopyButton, ClearButton } from '@/components/tool-page'

export default function SchemaEventTool() {
  const [eventName, setEventName] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [locationName, setLocationName] = useState('')
  const [locationAddress, setLocationAddress] = useState('')
  const [description, setDescription] = useState('')
  const [image, setImage] = useState('')
  const [offerPrice, setOfferPrice] = useState('')
  const [offerCurrency, setOfferCurrency] = useState('USD')
  const [offerAvailability, setOfferAvailability] = useState('InStock')
  const [offerUrl, setOfferUrl] = useState('')
  const [performerName, setPerformerName] = useState('')
  const [eventStatus, setEventStatus] = useState('EventScheduled')
  const [eventMode, setEventMode] = useState<'Offline' | 'Online' | 'Mixed'>('Offline')

  const output = useMemo(() => {
    const schema: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': 'Event',
    }
    if (eventName) schema.name = eventName
    if (description) schema.description = description
    if (image) schema.image = image
    if (startDate) schema.startDate = startDate
    if (endDate) schema.endDate = endDate
    if (performerName) {
      schema.performer = { '@type': 'Person', name: performerName }
    }

    const attendanceMap = {
      Offline: 'https://schema.org/OfflineEventAttendanceMode',
      Online: 'https://schema.org/OnlineEventAttendanceMode',
      Mixed: 'https://schema.org/MixedEventAttendanceMode',
    }
    schema.eventStatus = `https://schema.org/${eventStatus}`
    schema.eventAttendanceMode = attendanceMap[eventMode]

    if (eventMode === 'Online') {
      schema.location = { '@type': 'VirtualLocation', url: locationAddress || locationName }
    } else {
      if (locationName || locationAddress) {
        schema.location = {
          '@type': 'Place',
          name: locationName,
          address: locationAddress,
        }
      }
    }

    if (offerPrice) {
      schema.offers = {
        '@type': 'Offer',
        price: offerPrice,
        priceCurrency: offerCurrency,
        availability: `https://schema.org/${offerAvailability}`,
        ...(offerUrl && { url: offerUrl }),
      }
    }

    return `<script type="application/ld+json">\n${JSON.stringify(schema, null, 2)}\n</script>`
  }, [eventName, startDate, endDate, locationName, locationAddress, description, image, offerPrice, offerCurrency, offerAvailability, offerUrl, performerName, eventStatus, eventMode])

  const clear = () => {
    setEventName(''); setStartDate(''); setEndDate(''); setLocationName('')
    setLocationAddress(''); setDescription(''); setImage(''); setOfferPrice('')
    setOfferCurrency('USD'); setOfferAvailability('InStock'); setOfferUrl('')
    setPerformerName(''); setEventStatus('EventScheduled'); setEventMode('Offline')
  }

  const inputClass = 'w-full rounded-lg border border-input bg-tool-bg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring'

  return (
    <ToolPage
      title="Event Schema Generator"
      description="Generate Event JSON-LD structured data for SEO and rich results."
      category="seo"
      categoryLabel="SEO Tools"
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>Event Schema Generator is a free browser-based tool that lets you generate JSON-LD structured data for events including dates, locations, performers, and ticket information. It processes everything locally in your browser using JavaScript, so your data never leaves your device. No sign-up, no installation, and no server uploads required — just open the tool and start using it immediately.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Fill in the required fields with your page or content information.</li>
            <li>Configure optional settings to match your specific SEO needs.</li>
            <li>Review the generated output, preview, or analysis results.</li>
            <li>Copy the generated code or export the results for use on your website.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>This tool is particularly useful when getting event rich snippets in Google search results for conferences, concerts, webinars, or community events. Since it runs entirely in your browser, it works offline after the page loads and keeps your data completely private. Whether you are a developer, designer, student, or professional, this SEO tool saves time and eliminates the need for desktop software installation.</p>

          <h2>Tips and Best Practices</h2>
          <ul>
            <li>Validate generated markup using Google Rich Results Test before deploying to your site.</li>
            <li>Keep meta titles under 60 characters and descriptions under 160 characters for optimal display in search results.</li>
            <li>Update structured data whenever your page content changes significantly.</li>
            <li>Test how your pages appear in search results using the preview features provided.</li>
            <li>All SEO analysis runs in your browser — your website data stays private.</li>
          </ul>
        </>
      }
      faqs={[
        { question: 'What is Event schema markup?', answer: 'Event schema is JSON-LD structured data that describes an event, including its name, date, location, and ticket information. It enables Google to show rich event listings directly in search results.' },
        { question: 'Can I use Event schema for online events?', answer: 'Yes. Set the attendance mode to Online and provide a VirtualLocation URL. Google supports online, offline, and mixed attendance modes in Event structured data.' },
        { question: 'What fields are required for Event schema?', answer: 'Google requires at minimum the event name, start date, and either a physical location or virtual location. Adding offers, images, and descriptions is strongly recommended for richer results.' },
        { question: 'Does Event schema support recurring events?', answer: 'Each occurrence should have its own Event markup with unique start and end dates. Schema.org does not have a built-in recurrence field, so list each instance separately.' },
      ]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Event Details</h2>
            <ClearButton onClear={clear} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Event Name</label>
            <input type="text" value={eventName} onChange={e => setEventName(e.target.value)} placeholder="Tech Conference 2025" className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="About this event..." rows={3} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Image URL</label>
            <input type="url" value={image} onChange={e => setImage(e.target.value)} placeholder="https://example.com/event.jpg" className={inputClass} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Event Status</label>
            <select value={eventStatus} onChange={e => setEventStatus(e.target.value)} className="w-full rounded-lg border border-input bg-tool-bg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="EventScheduled">Scheduled</option>
              <option value="EventCancelled">Cancelled</option>
              <option value="EventPostponed">Postponed</option>
              <option value="EventRescheduled">Rescheduled</option>
              <option value="EventMovedOnline">Moved Online</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Start Date</label>
              <input type="datetime-local" value={startDate} onChange={e => setStartDate(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End Date</label>
              <input type="datetime-local" value={endDate} onChange={e => setEndDate(e.target.value)} className={inputClass} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Attendance Mode</label>
            <div className="flex gap-2">
              {(['Offline', 'Online', 'Mixed'] as const).map(m => (
                <button key={m} onClick={() => setEventMode(m)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${eventMode === m ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'}`}>
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">{eventMode === 'Online' ? 'Event URL' : 'Location Name'}</label>
              <input type="text" value={locationName} onChange={e => setLocationName(e.target.value)} placeholder={eventMode === 'Online' ? 'https://meet.example.com' : 'Convention Center'} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{eventMode === 'Online' ? 'Backup URL' : 'Location Address'}</label>
              <input type="text" value={locationAddress} onChange={e => setLocationAddress(e.target.value)} placeholder={eventMode === 'Online' ? 'https://...' : '123 Main St, City'} className={inputClass} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Performer Name</label>
            <input type="text" value={performerName} onChange={e => setPerformerName(e.target.value)} placeholder="Jane Speaker" className={inputClass} />
          </div>

          <h3 className="text-sm font-semibold pt-2">Offers</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Price</label>
              <input type="number" value={offerPrice} onChange={e => setOfferPrice(e.target.value)} placeholder="49.99" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Currency</label>
              <select value={offerCurrency} onChange={e => setOfferCurrency(e.target.value)} className={inputClass}>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="INR">INR</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Availability</label>
              <select value={offerAvailability} onChange={e => setOfferAvailability(e.target.value)} className={inputClass}>
                <option value="InStock">Available</option>
                <option value="SoldOut">Sold Out</option>
                <option value="PreOrder">Pre-Order</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Ticket URL</label>
              <input type="url" value={offerUrl} onChange={e => setOfferUrl(e.target.value)} placeholder="https://tickets.example.com" className={inputClass} />
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
