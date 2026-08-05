'use client'

import { useState, useMemo } from 'react'
import { ToolPage, CopyButton, ClearButton } from '@/components/tool-page'

export default function SchemaProductTool() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [image, setImage] = useState('')
  const [brand, setBrand] = useState('')
  const [sku, setSku] = useState('')
  const [price, setPrice] = useState('')
  const [currency, setCurrency] = useState('USD')
  const [availability, setAvailability] = useState('InStock')
  const [ratingValue, setRatingValue] = useState('')
  const [reviewCount, setReviewCount] = useState('')

  const output = useMemo(() => {
    const schema: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': 'Product',
    }
    if (name) schema.name = name
    if (description) schema.description = description
    if (image) schema.image = image
    if (brand) schema.brand = { '@type': 'Brand', name: brand }
    if (sku) schema.sku = sku
    if (price) {
      schema.offers = {
        '@type': 'Offer',
        price: price,
        priceCurrency: currency,
        availability: `https://schema.org/${availability}`,
      }
    }
    if (ratingValue && reviewCount) {
      schema.aggregateRating = {
        '@type': 'AggregateRating',
        ratingValue: ratingValue,
        reviewCount: reviewCount,
      }
    }
    return `<script type="application/ld+json">\n${JSON.stringify(schema, null, 2)}\n</script>`
  }, [name, description, image, brand, sku, price, currency, availability, ratingValue, reviewCount])

  const clear = () => {
    setName(''); setDescription(''); setImage(''); setBrand(''); setSku('')
    setPrice(''); setCurrency('USD'); setAvailability('InStock')
    setRatingValue(''); setReviewCount('')
  }

  const inputClass = 'w-full rounded-lg border border-input bg-tool-bg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring'

  return (
    <ToolPage
      title="Product Schema Generator"
      description="Generate Product JSON-LD structured data for SEO and rich results."
      category="seo"
      categoryLabel="SEO Tools"
      faqs={[
        { question: 'What is Product schema markup?', answer: 'Product schema is JSON-LD structured data that describes a product with details like name, price, availability, brand, and reviews. It enables Google to display rich product snippets with price and rating stars in search results.' },
        { question: 'What fields are required for Product rich results?', answer: 'Google requires the product name and at least one of the following: review, aggregateRating, or offers. Including price, availability, and an image is strongly recommended for the best results.' },
        { question: 'Does Product schema show star ratings in Google?', answer: 'Yes. When you include aggregateRating with a ratingValue and reviewCount, Google can display star ratings directly in search results, which significantly improves click-through rates.' },
        { question: 'Can I use Product schema for digital products?', answer: 'Yes. Product schema works for both physical and digital products including software, ebooks, and online courses. Set the availability and price just as you would for a physical item.' },
      ]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Product Details</h2>
            <ClearButton onClear={clear} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Product Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Widget Pro" className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Product description..." rows={3} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Image URL</label>
            <input type="url" value={image} onChange={e => setImage(e.target.value)} placeholder="https://example.com/product.jpg" className={inputClass} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Brand</label>
              <input type="text" value={brand} onChange={e => setBrand(e.target.value)} placeholder="Acme" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">SKU</label>
              <input type="text" value={sku} onChange={e => setSku(e.target.value)} placeholder="SKU-12345" className={inputClass} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Price</label>
              <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="29.99" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Currency</label>
              <select value={currency} onChange={e => setCurrency(e.target.value)} className={inputClass}>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="INR">INR</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Availability</label>
              <select value={availability} onChange={e => setAvailability(e.target.value)} className={inputClass}>
                <option value="InStock">In Stock</option>
                <option value="OutOfStock">Out of Stock</option>
                <option value="PreOrder">Pre-Order</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Review Rating (1-5)</label>
              <input type="number" min="1" max="5" step="0.1" value={ratingValue} onChange={e => setRatingValue(e.target.value)} placeholder="4.5" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Review Count</label>
              <input type="number" min="0" value={reviewCount} onChange={e => setReviewCount(e.target.value)} placeholder="120" className={inputClass} />
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
