export interface Comparison {
  slug: string          // "jpg-vs-png"
  title: string         // "JPG vs PNG"
  subtitle: string      // "Which Image Format Should You Use?"
  itemA: { name: string; description: string }
  itemB: { name: string; description: string }
  verdict: string       // "Use JPG for photos, PNG for graphics with transparency"
  features: { feature: string; a: string; b: string }[]
  useCaseA: string[]    // when to use A
  useCaseB: string[]    // when to use B
  relatedTool: string   // tool slug to link to
}

export const COMPARISONS: Comparison[] = [
  {
    slug: 'jpg-vs-png',
    title: 'JPG vs PNG',
    subtitle: 'Which Image Format Should You Use?',
    itemA: { name: 'JPG (JPEG)', description: 'Lossy compressed image format, best for photographs' },
    itemB: { name: 'PNG', description: 'Lossless image format supporting transparency' },
    verdict: 'Use JPG for photos and complex images. Use PNG for logos, screenshots, and images needing transparency.',
    features: [
      { feature: 'Compression', a: 'Lossy (smaller files)', b: 'Lossless (larger files)' },
      { feature: 'Transparency', a: 'No', b: 'Yes (alpha channel)' },
      { feature: 'Best for', a: 'Photos, gradients', b: 'Logos, text, screenshots' },
      { feature: 'File size', a: 'Smaller', b: 'Larger' },
      { feature: 'Quality loss', a: 'Yes (on each save)', b: 'No' },
      { feature: 'Animation', a: 'No', b: 'No (use APNG)' },
      { feature: 'Color depth', a: '24-bit (16.7M colors)', b: '24/32-bit with alpha' },
    ],
    useCaseA: ['Website photos', 'Social media images', 'Email attachments', 'Product photography'],
    useCaseB: ['Logos and icons', 'Screenshots', 'Graphics with text', 'Images needing transparency'],
    relatedTool: 'image-format-converter',
  },
  {
    slug: 'pdf-vs-docx',
    title: 'PDF vs DOCX',
    subtitle: 'Document Formats Compared',
    itemA: { name: 'PDF', description: 'Portable Document Format — preserves layout across all devices' },
    itemB: { name: 'DOCX', description: 'Microsoft Word format — fully editable document' },
    verdict: 'Use PDF for sharing final documents. Use DOCX when the document needs editing.',
    features: [
      { feature: 'Editable', a: 'No (view-only)', b: 'Yes (fully editable)' },
      { feature: 'Layout', a: 'Always preserved', b: 'May shift between devices' },
      { feature: 'File size', a: 'Usually smaller', b: 'Usually larger' },
      { feature: 'Compatibility', a: 'Universal (any device)', b: 'Needs Word/Google Docs' },
      { feature: 'Security', a: 'Can be password-protected', b: 'Limited protection' },
      { feature: 'Forms', a: 'Interactive forms possible', b: 'Basic forms only' },
    ],
    useCaseA: ['Contracts and agreements', 'Resumes for submission', 'Reports and presentations', 'Invoices'],
    useCaseB: ['Draft documents', 'Collaborative editing', 'Templates', 'Documents needing changes'],
    relatedTool: 'markdown-to-text',
  },
  {
    slug: 'rgb-vs-hex',
    title: 'RGB vs HEX',
    subtitle: 'Color Code Formats Explained',
    itemA: { name: 'RGB', description: 'Red, Green, Blue color model using 0-255 values' },
    itemB: { name: 'HEX', description: 'Hexadecimal color codes (#RRGGBB)' },
    verdict: 'They represent the same colors. HEX is shorter for CSS. RGB is easier to understand and manipulate programmatically.',
    features: [
      { feature: 'Format', a: 'rgb(255, 128, 0)', b: '#FF8000' },
      { feature: 'Length', a: 'Longer', b: 'Shorter (6 chars)' },
      { feature: 'Readability', a: 'Easier to understand', b: 'Compact but cryptic' },
      { feature: 'CSS usage', a: 'rgb() function', b: '#hex notation' },
      { feature: 'Alpha support', a: 'rgba(R,G,B,A)', b: '#RRGGBBAA (8-digit)' },
      { feature: 'Programmatic', a: 'Easy math operations', b: 'Needs parsing' },
    ],
    useCaseA: ['JavaScript color manipulation', 'CSS animations', 'Dynamic theming', 'When you need opacity (rgba)'],
    useCaseB: ['CSS stylesheets', 'Design handoffs', 'Brand color documentation', 'Quick inline styles'],
    relatedTool: 'color-converter',
  },
  {
    slug: 'celsius-vs-fahrenheit',
    title: 'Celsius vs Fahrenheit',
    subtitle: 'Temperature Scales Compared',
    itemA: { name: 'Celsius (°C)', description: 'Metric temperature scale used worldwide' },
    itemB: { name: 'Fahrenheit (°F)', description: 'Imperial temperature scale used in the US' },
    verdict: 'Celsius is used internationally and in science. Fahrenheit is used in the US for everyday temperatures.',
    features: [
      { feature: 'Water freezing', a: '0°C', b: '32°F' },
      { feature: 'Water boiling', a: '100°C', b: '212°F' },
      { feature: 'Body temperature', a: '37°C', b: '98.6°F' },
      { feature: 'Used in', a: 'Most countries, science', b: 'United States, Belize' },
      { feature: 'Formula', a: '°C = (°F - 32) × 5/9', b: '°F = °C × 9/5 + 32' },
      { feature: 'Absolute zero', a: '-273.15°C', b: '-459.67°F' },
    ],
    useCaseA: ['Science and engineering', 'International communication', 'Cooking (metric recipes)', 'Medical use (most countries)'],
    useCaseB: ['US weather reports', 'US cooking (imperial recipes)', 'HVAC in the US', 'Swimming pool temperature (US)'],
    relatedTool: 'temperature-converter',
  },
  {
    slug: 'km-vs-miles',
    title: 'Kilometers vs Miles',
    subtitle: 'Distance Units Compared',
    itemA: { name: 'Kilometers (km)', description: 'Metric unit of distance, 1 km = 1000 meters' },
    itemB: { name: 'Miles (mi)', description: 'Imperial unit of distance, 1 mile = 1.609 km' },
    verdict: 'Kilometers are used in most countries. Miles are used in the US, UK (roads), and a few other countries.',
    features: [
      { feature: 'Conversion', a: '1 km = 0.6214 mi', b: '1 mi = 1.6093 km' },
      { feature: 'Used in', a: 'Most countries', b: 'US, UK (roads), Myanmar' },
      { feature: 'In science', a: 'Standard (SI)', b: 'Rarely used' },
      { feature: 'Marathon', a: '42.195 km', b: '26.219 miles' },
      { feature: 'Speed limits', a: 'km/h in most countries', b: 'mph in US/UK' },
    ],
    useCaseA: ['International travel', 'Scientific measurements', 'Running and athletics', 'Most GPS apps (outside US)'],
    useCaseB: ['US road distances', 'UK road signs', 'US aviation (nautical miles)', 'US speedometers'],
    relatedTool: 'length-converter',
  },
  {
    slug: 'mb-vs-gb',
    title: 'MB vs GB',
    subtitle: 'Data Storage Units Explained',
    itemA: { name: 'Megabyte (MB)', description: '1 MB = 1,024 KB = 1,048,576 bytes' },
    itemB: { name: 'Gigabyte (GB)', description: '1 GB = 1,024 MB = 1,073,741,824 bytes' },
    verdict: '1 GB = 1,024 MB. Use MB for small files (photos, documents). Use GB for large storage (apps, videos, drives).',
    features: [
      { feature: 'Size', a: 'Smaller (1/1024 of GB)', b: 'Larger (1024 MB)' },
      { feature: 'Typical photo', a: '2-5 MB', b: 'N/A' },
      { feature: 'Typical app', a: '50-200 MB', b: '1-5 GB (large games)' },
      { feature: 'Typical movie', a: '700-1500 MB', b: '1-4 GB (HD)' },
      { feature: 'Phone storage', a: 'N/A', b: '64-512 GB' },
      { feature: 'Internet speed', a: 'Mbps (megabits/s)', b: 'Gbps (gigabits/s)' },
    ],
    useCaseA: ['Email attachment limits', 'Photo sizes', 'Document sizes', 'Internet speed (Mbps)'],
    useCaseB: ['Phone/computer storage', 'Hard drive capacity', 'RAM size', 'Data plan limits'],
    relatedTool: 'data-storage-converter',
  },
]

export function getComparisonBySlug(slug: string): Comparison | undefined {
  return COMPARISONS.find((c) => c.slug === slug)
}
