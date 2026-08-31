'use client'

import { useState, useCallback, useRef } from 'react'
import { ToolPage, ClearButton } from '@/components/tool-page'
import { Download, Plus, Trash2, Shield, FileText } from 'lucide-react'

interface LineItem {
  id: number
  description: string
  quantity: number
  unitPrice: number
}

interface InvoiceData {
  companyName: string
  companyAddress: string
  companyEmail: string
  companyPhone: string
  companyLogo: string | null
  clientName: string
  clientAddress: string
  clientEmail: string
  invoiceNumber: string
  invoiceDate: string
  dueDate: string
  items: LineItem[]
  taxRate: number
  discount: number
  currency: string
  notes: string
  paymentMethods: string
}

const CURRENCIES = [
  { code: 'USD', symbol: '$', label: 'USD ($)' },
  { code: 'EUR', symbol: '\u20AC', label: 'EUR (\u20AC)' },
  { code: 'GBP', symbol: '\u00A3', label: 'GBP (\u00A3)' },
  { code: 'INR', symbol: '\u20B9', label: 'INR (\u20B9)' },
  { code: 'CAD', symbol: 'C$', label: 'CAD (C$)' },
  { code: 'AUD', symbol: 'A$', label: 'AUD (A$)' },
  { code: 'JPY', symbol: '\u00A5', label: 'JPY (\u00A5)' },
  { code: 'CNY', symbol: '\u00A5', label: 'CNY (\u00A5)' },
  { code: 'BRL', symbol: 'R$', label: 'BRL (R$)' },
  { code: 'MXN', symbol: 'MX$', label: 'MXN (MX$)' },
  { code: 'CHF', symbol: 'CHF', label: 'CHF' },
  { code: 'KRW', symbol: '\u20A9', label: 'KRW (\u20A9)' },
]

function generateInvoiceNumber(): string {
  const prefix = 'INV'
  const date = new Date()
  const yr = date.getFullYear().toString().slice(-2)
  const mo = String(date.getMonth() + 1).padStart(2, '0')
  const rand = Math.floor(1000 + Math.random() * 9000)
  return `${prefix}-${yr}${mo}-${rand}`
}

function todayStr(): string {
  return new Date().toISOString().split('T')[0]
}

function dueDateStr(): string {
  const d = new Date()
  d.setDate(d.getDate() + 30)
  return d.toISOString().split('T')[0]
}

function getCurrencySymbol(code: string): string {
  return CURRENCIES.find(c => c.code === code)?.symbol || '$'
}

function formatCurrency(amount: number, currencyCode: string): string {
  const sym = getCurrencySymbol(currencyCode)
  return `${sym}${amount.toFixed(2)}`
}

export default function InvoiceGeneratorTool() {
  const [invoice, setInvoice] = useState<InvoiceData>({
    companyName: '',
    companyAddress: '',
    companyEmail: '',
    companyPhone: '',
    companyLogo: null,
    clientName: '',
    clientAddress: '',
    clientEmail: '',
    invoiceNumber: generateInvoiceNumber(),
    invoiceDate: todayStr(),
    dueDate: dueDateStr(),
    items: [{ id: 1, description: '', quantity: 1, unitPrice: 0 }],
    taxRate: 0,
    discount: 0,
    currency: 'USD',
    notes: '',
    paymentMethods: '',
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const nextId = useRef(2)

  const update = useCallback(<K extends keyof InvoiceData>(field: K, value: InvoiceData[K]) => {
    setInvoice(prev => ({ ...prev, [field]: value }))
  }, [])

  const updateItem = useCallback((id: number, field: keyof LineItem, value: string | number) => {
    setInvoice(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }))
  }, [])

  const addItem = useCallback(() => {
    setInvoice(prev => ({
      ...prev,
      items: [...prev.items, { id: nextId.current++, description: '', quantity: 1, unitPrice: 0 }],
    }))
  }, [])

  const removeItem = useCallback((id: number) => {
    setInvoice(prev => ({
      ...prev,
      items: prev.items.length > 1 ? prev.items.filter(item => item.id !== id) : prev.items,
    }))
  }, [])

  const handleLogoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => update('companyLogo', ev.target?.result as string)
    reader.readAsDataURL(file)
  }, [update])

  // Calculations
  const subtotal = invoice.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
  const discountAmount = subtotal * (invoice.discount / 100)
  const taxableAmount = subtotal - discountAmount
  const taxAmount = taxableAmount * (invoice.taxRate / 100)
  const total = taxableAmount + taxAmount
  const sym = getCurrencySymbol(invoice.currency)

  const generatePDF = useCallback(async () => {
    setIsGenerating(true)
    setError(null)

    try {
      const html2pdf = (await import('html2pdf.js')).default

      const logoHtml = invoice.companyLogo
        ? `<img src="${invoice.companyLogo}" style="max-height:60px;max-width:180px;object-fit:contain;" />`
        : ''

      const itemsHtml = invoice.items.map(item => {
        const amount = item.quantity * item.unitPrice
        return `
          <tr>
            <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;">${item.description || 'Untitled item'}</td>
            <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;text-align:center;">${item.quantity}</td>
            <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;text-align:right;">${formatCurrency(item.unitPrice, invoice.currency)}</td>
            <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;text-align:right;">${formatCurrency(amount, invoice.currency)}</td>
          </tr>
        `
      }).join('')

      const notesHtml = invoice.notes
        ? `<div style="margin-top:24px;">
            <div style="font-weight:600;font-size:13px;margin-bottom:6px;color:#374151;">Notes</div>
            <div style="font-size:12px;color:#6b7280;white-space:pre-wrap;">${invoice.notes}</div>
           </div>`
        : ''

      const paymentHtml = invoice.paymentMethods
        ? `<div style="margin-top:16px;">
            <div style="font-weight:600;font-size:13px;margin-bottom:6px;color:#374151;">Payment Methods</div>
            <div style="font-size:12px;color:#6b7280;white-space:pre-wrap;">${invoice.paymentMethods}</div>
           </div>`
        : ''

      const template = `
        <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:800px;margin:0 auto;padding:32px;color:#111827;">
          <!-- Header -->
          <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px;">
            <div>
              ${logoHtml}
              <div style="font-size:22px;font-weight:700;margin-top:${invoice.companyLogo ? '12px' : '0'};">${invoice.companyName || 'Your Company'}</div>
              <div style="font-size:12px;color:#6b7280;white-space:pre-wrap;margin-top:4px;">${invoice.companyAddress}</div>
              ${invoice.companyEmail ? `<div style="font-size:12px;color:#6b7280;margin-top:2px;">${invoice.companyEmail}</div>` : ''}
              ${invoice.companyPhone ? `<div style="font-size:12px;color:#6b7280;margin-top:2px;">${invoice.companyPhone}</div>` : ''}
            </div>
            <div style="text-align:right;">
              <div style="font-size:32px;font-weight:800;color:#3b82f6;letter-spacing:-1px;">INVOICE</div>
              <div style="font-size:13px;color:#6b7280;margin-top:8px;"><strong>Invoice #:</strong> ${invoice.invoiceNumber}</div>
              <div style="font-size:13px;color:#6b7280;margin-top:2px;"><strong>Date:</strong> ${invoice.invoiceDate}</div>
              <div style="font-size:13px;color:#6b7280;margin-top:2px;"><strong>Due Date:</strong> ${invoice.dueDate}</div>
            </div>
          </div>

          <!-- Bill To -->
          <div style="background:#f9fafb;border-radius:8px;padding:16px;margin-bottom:24px;">
            <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:#9ca3af;margin-bottom:6px;">Bill To</div>
            <div style="font-size:15px;font-weight:600;">${invoice.clientName || 'Client Name'}</div>
            <div style="font-size:12px;color:#6b7280;white-space:pre-wrap;margin-top:4px;">${invoice.clientAddress}</div>
            ${invoice.clientEmail ? `<div style="font-size:12px;color:#6b7280;margin-top:2px;">${invoice.clientEmail}</div>` : ''}
          </div>

          <!-- Items Table -->
          <table style="width:100%;border-collapse:collapse;font-size:13px;">
            <thead>
              <tr style="background:#f3f4f6;">
                <th style="padding:10px 12px;text-align:left;font-weight:600;border-bottom:2px solid #e5e7eb;">Description</th>
                <th style="padding:10px 12px;text-align:center;font-weight:600;border-bottom:2px solid #e5e7eb;">Qty</th>
                <th style="padding:10px 12px;text-align:right;font-weight:600;border-bottom:2px solid #e5e7eb;">Unit Price</th>
                <th style="padding:10px 12px;text-align:right;font-weight:600;border-bottom:2px solid #e5e7eb;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <!-- Totals -->
          <div style="display:flex;justify-content:flex-end;margin-top:24px;">
            <div style="width:280px;">
              <div style="display:flex;justify-content:space-between;padding:6px 0;font-size:13px;">
                <span>Subtotal</span>
                <span>${formatCurrency(subtotal, invoice.currency)}</span>
              </div>
              ${invoice.discount > 0 ? `
                <div style="display:flex;justify-content:space-between;padding:6px 0;font-size:13px;color:#dc2626;">
                  <span>Discount (${invoice.discount}%)</span>
                  <span>-${formatCurrency(discountAmount, invoice.currency)}</span>
                </div>
              ` : ''}
              ${invoice.taxRate > 0 ? `
                <div style="display:flex;justify-content:space-between;padding:6px 0;font-size:13px;">
                  <span>Tax (${invoice.taxRate}%)</span>
                  <span>${formatCurrency(taxAmount, invoice.currency)}</span>
                </div>
              ` : ''}
              <div style="display:flex;justify-content:space-between;padding:12px 0 6px;font-size:18px;font-weight:700;border-top:2px solid #111827;margin-top:8px;">
                <span>Total</span>
                <span>${formatCurrency(total, invoice.currency)}</span>
              </div>
            </div>
          </div>

          ${notesHtml}
          ${paymentHtml}

          <!-- Footer -->
          <div style="margin-top:48px;padding-top:16px;border-top:1px solid #e5e7eb;text-align:center;font-size:11px;color:#9ca3af;">
            Generated with UtilsNow Invoice Generator &mdash; utilsnow.com
          </div>
        </div>
      `

      const element = document.createElement('div')
      element.innerHTML = template

      await html2pdf().set({
        margin: [10, 10, 10, 10],
        filename: `${invoice.invoiceNumber}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      }).from(element).save()
    } catch {
      setError('Failed to generate PDF. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }, [invoice, subtotal, discountAmount, taxAmount, total])

  const clear = () => {
    setInvoice({
      companyName: '',
      companyAddress: '',
      companyEmail: '',
      companyPhone: '',
      companyLogo: null,
      clientName: '',
      clientAddress: '',
      clientEmail: '',
      invoiceNumber: generateInvoiceNumber(),
      invoiceDate: todayStr(),
      dueDate: dueDateStr(),
      items: [{ id: 1, description: '', quantity: 1, unitPrice: 0 }],
      taxRate: 0,
      discount: 0,
      currency: 'USD',
      notes: '',
      paymentMethods: '',
    })
    nextId.current = 2
    setError(null)
  }

  const inputCls = 'w-full h-9 px-3 rounded-md border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring'
  const labelCls = 'text-xs font-medium mb-1 block'

  return (
    <ToolPage
      title="Invoice Generator"
      description="Create professional invoices with line items, tax, discounts, and download as PDF. Free alternative to FreshBooks, Invoice Ninja, and Wave."
      category="financial"
      categoryLabel="Financial Calculators"
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>Invoice Generator is a free browser-based tool for creating professional invoices. Fill in your company and client details, add line items, set tax rates and discounts, and download a clean PDF invoice &mdash; all without creating an account or paying for software. It&apos;s a free alternative to Invoice Ninja ($10/mo), FreshBooks ($17/mo), and Wave ($16/mo).</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Enter your <strong>company details</strong>: name, address, email, phone, and optionally upload your logo.</li>
            <li>Enter your <strong>client details</strong>: name, address, and email.</li>
            <li>The <strong>invoice number</strong> is auto-generated but can be customized. Set the invoice date and due date.</li>
            <li>Add <strong>line items</strong> with description, quantity, and unit price. The amount is calculated automatically.</li>
            <li>Set <strong>tax rate</strong> and/or <strong>discount</strong> percentages. Subtotal, tax, discount, and total are all calculated in real-time.</li>
            <li>Choose your <strong>currency</strong> from 12 options (USD, EUR, GBP, INR, etc.).</li>
            <li>Add optional <strong>notes</strong> and <strong>payment methods</strong> text.</li>
            <li>Click <strong>Download as PDF</strong> to generate and save your professional invoice.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>Perfect for freelancers, small businesses, consultants, and anyone who needs to create professional invoices quickly. No subscription, no sign-up, and no data leaves your browser. Use it for one-off invoices or regular billing.</p>

          <h2>Tips and Best Practices</h2>
          <ul>
            <li>Upload your company logo for a more professional look. Keep logos under 500KB for best PDF quality.</li>
            <li>Use clear, descriptive line item names so clients understand each charge.</li>
            <li>Set due dates 15-30 days from the invoice date for standard payment terms.</li>
            <li>Include payment instructions (bank details, PayPal, etc.) in the Payment Methods field.</li>
            <li>All data stays in your browser &mdash; nothing is sent to any server.</li>
          </ul>
        </>
      }
      faqs={[
        { question: 'Is this invoice generator really free?', answer: 'Yes, completely free with no limits. Unlike FreshBooks ($17/mo), Invoice Ninja ($10/mo), or Wave ($16/mo), this tool runs entirely in your browser with no subscription, no sign-up, and no usage caps.' },
        { question: 'Does this tool save or upload my data?', answer: 'No. All invoice data stays in your browser. Nothing is sent to any server. When you generate a PDF, it is created locally on your device using html2pdf.js.' },
        { question: 'Can I add my company logo to invoices?', answer: 'Yes! Click the logo upload button and select an image file. Your logo will appear in the top-left corner of the invoice PDF. Recommended size is under 500KB.' },
        { question: 'What currencies are supported?', answer: 'USD, EUR, GBP, INR, CAD, AUD, JPY, CNY, BRL, MXN, CHF, and KRW are currently supported. The correct currency symbol is used throughout the invoice.' },
        { question: 'Can I customize the invoice number?', answer: 'Yes. An invoice number is auto-generated (e.g., INV-2608-1234) but you can edit it to any format you prefer.' },
        { question: 'Is the generated invoice legally valid?', answer: 'The invoices contain all standard fields expected on a commercial invoice. However, legal requirements vary by jurisdiction. Consult local regulations for specific compliance needs.' },
      ]}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium flex items-center gap-2">
            <FileText className="h-4 w-4" /> Invoice Details
          </span>
          <ClearButton onClear={clear} />
        </div>

        {/* Company & Client Details - Side by Side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Company Details */}
          <div className="space-y-3 p-4 rounded-lg border border-border bg-muted/20">
            <div className="text-sm font-medium">Your Company</div>
            <div>
              <label className={labelCls}>Company Name</label>
              <input type="text" value={invoice.companyName} onChange={e => update('companyName', e.target.value)} placeholder="Acme Inc." className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Address</label>
              <textarea value={invoice.companyAddress} onChange={e => update('companyAddress', e.target.value)} placeholder="123 Main St&#10;City, State ZIP" rows={2} className="w-full rounded-md border border-input bg-card p-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Email</label>
                <input type="email" value={invoice.companyEmail} onChange={e => update('companyEmail', e.target.value)} placeholder="billing@acme.com" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Phone</label>
                <input type="tel" value={invoice.companyPhone} onChange={e => update('companyPhone', e.target.value)} placeholder="+1 555-0100" className={inputCls} />
              </div>
            </div>
            <div>
              <label className={labelCls}>Logo (optional)</label>
              <div className="flex items-center gap-3">
                <input type="file" accept="image/*" onChange={handleLogoUpload} className="text-xs file:mr-2 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90" />
                {invoice.companyLogo && (
                  <button onClick={() => update('companyLogo', null)} className="text-xs text-red-500 hover:underline">Remove</button>
                )}
              </div>
              {invoice.companyLogo && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={invoice.companyLogo} alt="Logo preview" className="mt-2 max-h-12 object-contain" />
              )}
            </div>
          </div>

          {/* Client Details */}
          <div className="space-y-3 p-4 rounded-lg border border-border bg-muted/20">
            <div className="text-sm font-medium">Bill To</div>
            <div>
              <label className={labelCls}>Client Name</label>
              <input type="text" value={invoice.clientName} onChange={e => update('clientName', e.target.value)} placeholder="Client Corp." className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Address</label>
              <textarea value={invoice.clientAddress} onChange={e => update('clientAddress', e.target.value)} placeholder="456 Oak Ave&#10;City, State ZIP" rows={2} className="w-full rounded-md border border-input bg-card p-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className={labelCls}>Email</label>
              <input type="email" value={invoice.clientEmail} onChange={e => update('clientEmail', e.target.value)} placeholder="accounts@client.com" className={inputCls} />
            </div>

            {/* Invoice meta */}
            <div className="grid grid-cols-1 gap-3 pt-3 border-t border-border">
              <div>
                <label className={labelCls}>Invoice Number</label>
                <input type="text" value={invoice.invoiceNumber} onChange={e => update('invoiceNumber', e.target.value)} className={inputCls} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Invoice Date</label>
                  <input type="date" value={invoice.invoiceDate} onChange={e => update('invoiceDate', e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Due Date</label>
                  <input type="date" value={invoice.dueDate} onChange={e => update('dueDate', e.target.value)} className={inputCls} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Currency selector */}
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium">Currency:</label>
          <select
            value={invoice.currency}
            onChange={e => update('currency', e.target.value)}
            className="h-9 px-3 rounded-md border border-input bg-card text-sm"
          >
            {CURRENCIES.map(c => (
              <option key={c.code} value={c.code}>{c.label}</option>
            ))}
          </select>
        </div>

        {/* Line Items */}
        <div className="space-y-3">
          <div className="text-sm font-medium">Line Items</div>

          {/* Header */}
          <div className="hidden sm:grid sm:grid-cols-[1fr_80px_100px_100px_32px] gap-2 text-xs font-medium text-muted-foreground px-1">
            <span>Description</span>
            <span className="text-center">Qty</span>
            <span className="text-right">Unit Price</span>
            <span className="text-right">Amount</span>
            <span></span>
          </div>

          {invoice.items.map((item) => {
            const amount = item.quantity * item.unitPrice
            return (
              <div key={item.id} className="grid grid-cols-1 sm:grid-cols-[1fr_80px_100px_100px_32px] gap-2 items-center">
                <input
                  type="text"
                  value={item.description}
                  onChange={e => updateItem(item.id, 'description', e.target.value)}
                  placeholder="Item description"
                  className={inputCls}
                />
                <input
                  type="number"
                  value={item.quantity}
                  onChange={e => updateItem(item.id, 'quantity', Math.max(0, Number(e.target.value)))}
                  min={0}
                  className={`${inputCls} text-center`}
                />
                <input
                  type="number"
                  value={item.unitPrice}
                  onChange={e => updateItem(item.id, 'unitPrice', Math.max(0, Number(e.target.value)))}
                  min={0}
                  step={0.01}
                  className={`${inputCls} text-right`}
                />
                <div className="h-9 px-3 rounded-md border border-input bg-muted/50 flex items-center justify-end text-sm font-medium">
                  {sym}{amount.toFixed(2)}
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  disabled={invoice.items.length <= 1}
                  className="h-9 w-9 flex items-center justify-center rounded-md hover:bg-muted transition-colors disabled:opacity-30"
                  title="Remove item"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            )
          })}

          <button
            onClick={addItem}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-dashed border-border hover:bg-muted transition-colors"
          >
            <Plus className="h-3.5 w-3.5" /> Add Line Item
          </button>
        </div>

        {/* Tax, Discount, Totals */}
        <div className="flex justify-end">
          <div className="w-full max-w-sm space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">{sym}{subtotal.toFixed(2)}</span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm text-muted-foreground whitespace-nowrap">Discount</label>
                <input
                  type="number"
                  value={invoice.discount}
                  onChange={e => update('discount', Math.max(0, Math.min(100, Number(e.target.value))))}
                  min={0}
                  max={100}
                  step={0.5}
                  className="w-20 h-8 px-2 rounded-md border border-input bg-card text-sm text-right"
                />
                <span className="text-sm text-muted-foreground">%</span>
              </div>
              {invoice.discount > 0 && (
                <span className="text-sm text-red-500 font-medium">-{sym}{discountAmount.toFixed(2)}</span>
              )}
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm text-muted-foreground whitespace-nowrap">Tax Rate</label>
                <input
                  type="number"
                  value={invoice.taxRate}
                  onChange={e => update('taxRate', Math.max(0, Math.min(100, Number(e.target.value))))}
                  min={0}
                  max={100}
                  step={0.5}
                  className="w-20 h-8 px-2 rounded-md border border-input bg-card text-sm text-right"
                />
                <span className="text-sm text-muted-foreground">%</span>
              </div>
              {invoice.taxRate > 0 && (
                <span className="text-sm font-medium">{sym}{taxAmount.toFixed(2)}</span>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t-2 border-foreground">
              <span className="text-lg font-bold">Total</span>
              <span className="text-lg font-bold">{sym}{total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Notes & Payment Methods */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Notes / Terms (optional)</label>
            <textarea
              value={invoice.notes}
              onChange={e => update('notes', e.target.value)}
              placeholder="Payment is due within 30 days. Late payments may incur a 1.5% monthly fee."
              rows={3}
              className="w-full rounded-md border border-input bg-card p-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className={labelCls}>Payment Methods (optional)</label>
            <textarea
              value={invoice.paymentMethods}
              onChange={e => update('paymentMethods', e.target.value)}
              placeholder="Bank Transfer: Routing 123456789, Account 987654321&#10;PayPal: billing@acme.com"
              rows={3}
              className="w-full rounded-md border border-input bg-card p-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Download button */}
        <button
          onClick={generatePDF}
          disabled={isGenerating}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="h-4 w-4" />
          {isGenerating ? 'Generating PDF...' : 'Download as PDF'}
        </button>

        {/* Privacy badge */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-border">
          <Shield className="h-3.5 w-3.5" />
          <span>All data stays in your browser. Nothing is uploaded to any server. PDF is generated locally.</span>
        </div>
      </div>
    </ToolPage>
  )
}
