'use client'

import { useState, useCallback, useRef } from 'react'
import { ToolPage, ClearButton } from '@/components/tool-page'
import { Upload, Copy, Download, MapPin, Shield, ShieldOff, Camera, Settings, Image as ImageIcon, Calendar, Globe, Cpu, CheckCircle } from 'lucide-react'

// ---------------------------------------------------------------------------
// EXIF tag definitions
// ---------------------------------------------------------------------------
const EXIF_TAGS: Record<number, { name: string; section: string }> = {
  // IFD0 – Image tags
  0x010E: { name: 'ImageDescription', section: 'Image' },
  0x010F: { name: 'Make', section: 'Camera' },
  0x0110: { name: 'Model', section: 'Camera' },
  0x0112: { name: 'Orientation', section: 'Image' },
  0x011A: { name: 'XResolution', section: 'Image' },
  0x011B: { name: 'YResolution', section: 'Image' },
  0x0128: { name: 'ResolutionUnit', section: 'Image' },
  0x0131: { name: 'Software', section: 'Software' },
  0x0132: { name: 'DateTime', section: 'Date' },
  0x013B: { name: 'Artist', section: 'Image' },
  0x8298: { name: 'Copyright', section: 'Image' },
  0xA430: { name: 'CameraOwnerName', section: 'Camera' },
  0xA431: { name: 'BodySerialNumber', section: 'Camera' },
  0xA432: { name: 'LensSpecification', section: 'Camera' },
  0xA433: { name: 'LensMake', section: 'Camera' },
  0xA434: { name: 'LensModel', section: 'Camera' },
  0xA435: { name: 'LensSerialNumber', section: 'Camera' },

  // ExifIFD – Camera settings
  0x829A: { name: 'ExposureTime', section: 'Settings' },
  0x829D: { name: 'FNumber', section: 'Settings' },
  0x8822: { name: 'ExposureProgram', section: 'Settings' },
  0x8827: { name: 'ISO', section: 'Settings' },
  0x9000: { name: 'ExifVersion', section: 'Settings' },
  0x9003: { name: 'DateTimeOriginal', section: 'Date' },
  0x9004: { name: 'DateTimeDigitized', section: 'Date' },
  0x9204: { name: 'ExposureBias', section: 'Settings' },
  0x9205: { name: 'MaxApertureValue', section: 'Settings' },
  0x9207: { name: 'MeteringMode', section: 'Settings' },
  0x9209: { name: 'Flash', section: 'Settings' },
  0x920A: { name: 'FocalLength', section: 'Settings' },
  0xA001: { name: 'ColorSpace', section: 'Image' },
  0xA002: { name: 'PixelXDimension', section: 'Image' },
  0xA003: { name: 'PixelYDimension', section: 'Image' },
  0xA210: { name: 'FocalPlaneResolutionUnit', section: 'Settings' },
  0xA402: { name: 'ExposureMode', section: 'Settings' },
  0xA403: { name: 'WhiteBalance', section: 'Settings' },
  0xA404: { name: 'DigitalZoomRatio', section: 'Settings' },
  0xA405: { name: 'FocalLengthIn35mm', section: 'Settings' },
  0xA406: { name: 'SceneCaptureType', section: 'Settings' },
  0xA408: { name: 'Contrast', section: 'Settings' },
  0xA409: { name: 'Saturation', section: 'Settings' },
  0xA40A: { name: 'Sharpness', section: 'Settings' },

  // GPS IFD
  0x0001: { name: 'GPSLatitudeRef', section: 'GPS' },
  0x0002: { name: 'GPSLatitude', section: 'GPS' },
  0x0003: { name: 'GPSLongitudeRef', section: 'GPS' },
  0x0004: { name: 'GPSLongitude', section: 'GPS' },
  0x0005: { name: 'GPSAltitudeRef', section: 'GPS' },
  0x0006: { name: 'GPSAltitude', section: 'GPS' },
}

// Tags that belong to the GPS IFD (use their own tag numbers)
const GPS_TAG_IDS = new Set([0x0001, 0x0002, 0x0003, 0x0004, 0x0005, 0x0006])

// ---------------------------------------------------------------------------
// Minimal JPEG EXIF parser
// ---------------------------------------------------------------------------
interface ExifEntry { name: string; value: string; section: string }

function readUint16(dv: DataView, off: number, le: boolean) { return le ? dv.getUint16(off, true) : dv.getUint16(off, false) }
function readUint32(dv: DataView, off: number, le: boolean) { return le ? dv.getUint32(off, true) : dv.getUint32(off, false) }
function readInt32(dv: DataView, off: number, le: boolean) { return le ? dv.getInt32(off, true) : dv.getInt32(off, false) }

function readRational(dv: DataView, offset: number, le: boolean): number {
  const num = readUint32(dv, offset, le)
  const den = readUint32(dv, offset + 4, le)
  return den === 0 ? 0 : num / den
}

function readSignedRational(dv: DataView, offset: number, le: boolean): number {
  const num = readInt32(dv, offset, le)
  const den = readInt32(dv, offset + 4, le)
  return den === 0 ? 0 : num / den
}

function readString(dv: DataView, offset: number, count: number): string {
  let s = ''
  for (let i = 0; i < count; i++) {
    const c = dv.getUint8(offset + i)
    if (c === 0) break
    s += String.fromCharCode(c)
  }
  return s
}

function formatExposureTime(val: number): string {
  if (val >= 1) return `${val}s`
  const denom = Math.round(1 / val)
  return `1/${denom}s`
}

function formatGPSDMS(degrees: number, minutes: number, seconds: number, ref: string): string {
  return `${degrees}\u00B0 ${minutes}' ${seconds.toFixed(2)}" ${ref}`
}

function gpsToDecimal(degrees: number, minutes: number, seconds: number, ref: string): number {
  let d = degrees + minutes / 60 + seconds / 3600
  if (ref === 'S' || ref === 'W') d = -d
  return d
}

function readTagValue(dv: DataView, type: number, count: number, valueOffset: number, tiffStart: number, le: boolean): string | number | number[] {
  // value fits in 4 bytes inline if total bytes <= 4
  const totalBytes = [0, 1, 1, 2, 4, 8, 1, 1, 2, 4, 8, 4, 8][type] * count
  const dataOffset = totalBytes <= 4 ? valueOffset : tiffStart + readUint32(dv, valueOffset, le)

  switch (type) {
    case 1: // BYTE
    case 7: // UNDEFINED
      if (count <= 4) return dv.getUint8(dataOffset)
      return Array.from({ length: Math.min(count, 32) }, (_, i) => dv.getUint8(dataOffset + i)).join(' ')
    case 2: // ASCII
      return readString(dv, dataOffset, count)
    case 3: // SHORT
      if (count === 1) return readUint16(dv, dataOffset, le)
      return Array.from({ length: Math.min(count, 16) }, (_, i) => readUint16(dv, dataOffset + i * 2, le))
    case 4: // LONG
      if (count === 1) return readUint32(dv, dataOffset, le)
      return Array.from({ length: Math.min(count, 16) }, (_, i) => readUint32(dv, dataOffset + i * 4, le))
    case 5: // RATIONAL
      if (count === 1) return readRational(dv, dataOffset, le)
      return Array.from({ length: Math.min(count, 8) }, (_, i) => readRational(dv, dataOffset + i * 8, le))
    case 9: // SLONG
      if (count === 1) return readInt32(dv, dataOffset, le)
      return readInt32(dv, dataOffset, le)
    case 10: // SRATIONAL
      if (count === 1) return readSignedRational(dv, dataOffset, le)
      return Array.from({ length: Math.min(count, 8) }, (_, i) => readSignedRational(dv, dataOffset + i * 8, le))
    default:
      return `(type ${type})`
  }
}

function parseIFD(
  dv: DataView,
  tiffStart: number,
  ifdOffset: number,
  le: boolean,
  tagMap: Record<number, { name: string; section: string }>,
  sectionOverride?: string,
): { entries: ExifEntry[]; subIFDs: { exif?: number; gps?: number } } {
  const entries: ExifEntry[] = []
  const subIFDs: { exif?: number; gps?: number } = {}

  const numEntries = readUint16(dv, tiffStart + ifdOffset, le)
  for (let i = 0; i < numEntries; i++) {
    const entryOffset = tiffStart + ifdOffset + 2 + i * 12
    if (entryOffset + 12 > dv.byteLength) break

    const tag = readUint16(dv, entryOffset, le)
    const type = readUint16(dv, entryOffset + 2, le)
    const count = readUint32(dv, entryOffset + 4, le)
    const valueOffset = entryOffset + 8

    // Sub-IFD pointers
    if (tag === 0x8769) { subIFDs.exif = readUint32(dv, valueOffset, le); continue }
    if (tag === 0x8825) { subIFDs.gps = readUint32(dv, valueOffset, le); continue }

    const info = tagMap[tag]
    if (!info) continue

    const raw = readTagValue(dv, type, count, valueOffset, tiffStart, le)
    const section = sectionOverride ?? info.section
    let display = typeof raw === 'number' ? String(raw) : Array.isArray(raw) ? raw.join(', ') : raw

    // Pretty-print certain tags
    if (info.name === 'ExposureTime' && typeof raw === 'number') display = formatExposureTime(raw)
    if (info.name === 'FNumber' && typeof raw === 'number') display = `f/${raw.toFixed(1)}`
    if (info.name === 'FocalLength' && typeof raw === 'number') display = `${raw.toFixed(1)} mm`
    if (info.name === 'FocalLengthIn35mm' && typeof raw === 'number') display = `${raw} mm`
    if (info.name === 'ExposureBias' && typeof raw === 'number') display = `${raw > 0 ? '+' : ''}${raw.toFixed(2)} EV`

    entries.push({ name: info.name, value: display, section })
  }

  return { entries, subIFDs }
}

function parseExif(buffer: ArrayBuffer): { entries: ExifEntry[]; lat?: number; lng?: number } {
  const dv = new DataView(buffer)
  const entries: ExifEntry[] = []
  let lat: number | undefined
  let lng: number | undefined

  // Find APP1 marker
  if (dv.getUint16(0) !== 0xFFD8) return { entries } // not JPEG

  let offset = 2
  while (offset < dv.byteLength - 4) {
    const marker = dv.getUint16(offset)
    if (marker === 0xFFE1) break // APP1
    if ((marker & 0xFF00) !== 0xFF00) return { entries }
    const len = dv.getUint16(offset + 2)
    offset += 2 + len
  }

  if (offset >= dv.byteLength - 4) return { entries }

  const app1Start = offset + 4 // skip marker + length
  // Check "Exif\0\0"
  if (
    dv.getUint8(app1Start) !== 0x45 || // E
    dv.getUint8(app1Start + 1) !== 0x78 || // x
    dv.getUint8(app1Start + 2) !== 0x69 || // i
    dv.getUint8(app1Start + 3) !== 0x66 // f
  ) return { entries }

  const tiffStart = app1Start + 6
  const endian = dv.getUint16(tiffStart)
  const le = endian === 0x4949 // II = little-endian

  const ifd0Offset = readUint32(dv, tiffStart + 4, le)
  const nonGpsTags = Object.fromEntries(
    Object.entries(EXIF_TAGS).filter(([, v]) => v.section !== 'GPS').map(([k, v]) => [Number(k), v]),
  )

  // Parse IFD0
  const ifd0 = parseIFD(dv, tiffStart, ifd0Offset, le, nonGpsTags)
  entries.push(...ifd0.entries)

  // Parse ExifIFD
  if (ifd0.subIFDs.exif) {
    const exifIfd = parseIFD(dv, tiffStart, ifd0.subIFDs.exif, le, nonGpsTags)
    entries.push(...exifIfd.entries)
  }

  // Parse GPS IFD
  if (ifd0.subIFDs.gps) {
    const gpsTags = Object.fromEntries(
      Object.entries(EXIF_TAGS).filter(([id]) => GPS_TAG_IDS.has(Number(id))).map(([k, v]) => [Number(k), v]),
    )
    const gpsIfd = parseIFD(dv, tiffStart, ifd0.subIFDs.gps, le, gpsTags, 'GPS')
    const gpsMap = new Map(gpsIfd.entries.map((e) => [e.name, e.value]))

    const latParts = gpsMap.get('GPSLatitude')
    const latRef = gpsMap.get('GPSLatitudeRef')
    const lngParts = gpsMap.get('GPSLongitude')
    const lngRef = gpsMap.get('GPSLongitudeRef')

    if (latParts && latRef && lngParts && lngRef) {
      const lp = latParts.split(',').map(Number)
      const lnp = lngParts.split(',').map(Number)
      if (lp.length >= 3 && lnp.length >= 3) {
        lat = gpsToDecimal(lp[0], lp[1], lp[2], latRef.trim())
        lng = gpsToDecimal(lnp[0], lnp[1], lnp[2], lngRef.trim())
        entries.push({
          name: 'Latitude',
          value: formatGPSDMS(lp[0], lp[1], lp[2], latRef.trim()),
          section: 'GPS',
        })
        entries.push({
          name: 'Longitude',
          value: formatGPSDMS(lnp[0], lnp[1], lnp[2], lngRef.trim()),
          section: 'GPS',
        })
        entries.push({
          name: 'Coordinates',
          value: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
          section: 'GPS',
        })
      }
    }

    const alt = gpsMap.get('GPSAltitude')
    if (alt) {
      entries.push({ name: 'Altitude', value: `${Number(alt).toFixed(1)} m`, section: 'GPS' })
    }
  }

  return { entries, lat, lng }
}

// ---------------------------------------------------------------------------
// Strip EXIF — returns a clean JPEG with all APP1 markers removed
// ---------------------------------------------------------------------------
function stripExif(buffer: ArrayBuffer): Blob {
  const dv = new DataView(buffer)
  const pieces: ArrayBuffer[] = []

  // Copy SOI
  pieces.push(buffer.slice(0, 2))

  let offset = 2
  while (offset < dv.byteLength - 2) {
    const marker = dv.getUint16(offset)
    if (marker === 0xFFDA) {
      // Start of scan — copy rest as-is
      pieces.push(buffer.slice(offset))
      break
    }
    if ((marker & 0xFF00) !== 0xFF00) break

    const len = dv.getUint16(offset + 2)
    if (marker === 0xFFE1) {
      // APP1 — skip it (this is EXIF)
      offset += 2 + len
      continue
    }
    pieces.push(buffer.slice(offset, offset + 2 + len))
    offset += 2 + len
  }

  return new Blob(pieces, { type: 'image/jpeg' })
}

// ---------------------------------------------------------------------------
// Section icons & labels
// ---------------------------------------------------------------------------
const SECTIONS = [
  { key: 'Camera',   icon: Camera,   label: 'Camera' },
  { key: 'Settings', icon: Settings, label: 'Settings' },
  { key: 'Image',    icon: ImageIcon, label: 'Image' },
  { key: 'GPS',      icon: MapPin,   label: 'GPS Location' },
  { key: 'Date',     icon: Calendar, label: 'Date & Time' },
  { key: 'Software', icon: Cpu,      label: 'Software' },
]

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function ExifViewerTool() {
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [fileName, setFileName] = useState('')
  const [entries, setEntries] = useState<ExifEntry[]>([])
  const [lat, setLat] = useState<number | undefined>()
  const [lng, setLng] = useState<number | undefined>()
  const [strippedUrl, setStrippedUrl] = useState<string | null>(null)
  const [rawBuffer, setRawBuffer] = useState<ArrayBuffer | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const processFile = useCallback((file: File) => {
    setStrippedUrl(null)
    setFileName(file.name)
    // Read as data URL for preview
    const reader1 = new FileReader()
    reader1.onload = (ev) => setImageSrc(ev.target?.result as string)
    reader1.readAsDataURL(file)
    // Read as ArrayBuffer for EXIF parsing
    const reader2 = new FileReader()
    reader2.onload = (ev) => {
      const buf = ev.target?.result as ArrayBuffer
      setRawBuffer(buf)
      const result = parseExif(buf)
      setEntries(result.entries)
      setLat(result.lat)
      setLng(result.lng)
    }
    reader2.readAsArrayBuffer(file)
  }, [])

  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }, [processFile])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) processFile(file)
  }, [processFile])

  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(true) }, [])
  const handleDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(false) }, [])

  const handleStrip = () => {
    if (!rawBuffer) return
    const blob = stripExif(rawBuffer)
    setStrippedUrl(URL.createObjectURL(blob))
  }

  const handleDownloadStripped = () => {
    if (!strippedUrl) return
    const a = document.createElement('a')
    a.href = strippedUrl
    a.download = `stripped-${fileName}`
    a.click()
  }

  const copyValue = (name: string, value: string) => {
    navigator.clipboard.writeText(value)
    setCopied(name)
    setTimeout(() => setCopied(null), 1500)
  }

  const clear = () => {
    setImageSrc(null)
    setFileName('')
    setEntries([])
    setLat(undefined)
    setLng(undefined)
    setStrippedUrl(null)
    setRawBuffer(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const groupedEntries = SECTIONS.map((s) => ({
    ...s,
    items: entries.filter((e) => e.section === s.key),
  })).filter((s) => s.items.length > 0)

  return (
    <ToolPage
      title="Image EXIF Viewer"
      description="View, inspect, and strip EXIF metadata from photos — replaces paid photo tool subscriptions"
      category="image"
      categoryLabel="Image Tools"
      faqs={[
        { question: 'What is EXIF data?', answer: 'EXIF (Exchangeable Image File Format) is metadata embedded in photos by cameras and smartphones. It includes camera model, settings (ISO, aperture, shutter speed), date taken, GPS location, and more.' },
        { question: 'Which file formats contain EXIF data?', answer: 'JPEG files are the most common format with EXIF data. PNG and WebP files can contain some metadata but not standard EXIF. HEIC and TIFF files also support EXIF.' },
        { question: 'Why should I strip EXIF data?', answer: 'EXIF data can contain your GPS location, camera serial number, and other personal information. Stripping EXIF before sharing photos online protects your privacy.' },
        { question: 'Is my photo uploaded to a server?', answer: 'No. All EXIF parsing and stripping happens entirely in your browser. Your photos are never uploaded anywhere.' },
        { question: 'Why do I see no EXIF data?', answer: 'Some images have been stripped of metadata already (e.g., screenshots, social media downloads, images saved from the web). PNG files usually have minimal or no EXIF data.' },
      ]}
      helpContent={
        <>
          <h2>What is the Image EXIF Viewer?</h2>
          <p>
            This tool reads and displays all EXIF metadata embedded in your photos. Digital cameras and
            smartphones store detailed information inside every photo, including camera make and model,
            lens details, exposure settings, GPS coordinates, timestamps, and editing software. This viewer
            parses all of that data and presents it in organized sections. You can also strip all EXIF
            metadata from a photo to protect your privacy before sharing it online. Everything runs locally
            in your browser — your images are never uploaded to any server.
          </p>

          <h2>How to Use</h2>
          <ol>
            <li>Upload a JPEG photo by clicking the drop zone or dragging a file onto it.</li>
            <li>The tool instantly parses and displays all available EXIF data organized by category.</li>
            <li>Click any value to copy it to your clipboard.</li>
            <li>If GPS coordinates are found, click the Google Maps link to see the photo location.</li>
            <li>Click <strong>Strip EXIF Data</strong> to remove all metadata, then download the cleaned file.</li>
          </ol>

          <h2>EXIF Data Sections</h2>
          <ul>
            <li><strong>Camera</strong> — Make, Model, Lens, Serial Number</li>
            <li><strong>Settings</strong> — ISO, Aperture, Shutter Speed, Focal Length, Flash, Metering</li>
            <li><strong>Image</strong> — Width, Height, Orientation, Color Space, Resolution</li>
            <li><strong>GPS</strong> — Latitude, Longitude, Altitude (with Google Maps link)</li>
            <li><strong>Date</strong> — Date Taken, Date Digitized, Date Modified</li>
            <li><strong>Software</strong> — Editing software used on the photo</li>
          </ul>

          <h2>Privacy Tips</h2>
          <ul>
            <li>Always strip EXIF data before posting photos publicly if you do not want to reveal your location.</li>
            <li>Most social media platforms strip EXIF automatically, but forums, blogs, and cloud storage often do not.</li>
            <li>Check photos before uploading to classified ads or real-estate listings — they often contain home GPS coordinates.</li>
          </ul>
        </>
      }
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Upload Image</label>
          {imageSrc && <ClearButton onClear={clear} />}
        </div>

        {!imageSrc ? (
          <label
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${isDragging ? 'border-primary bg-primary/10' : 'border-border hover:bg-muted/50'}`}
          >
            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
            <span className="text-sm text-muted-foreground">
              {isDragging ? 'Drop your image here' : 'Click to upload or drag an image (JPEG recommended)'}
            </span>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
          </label>
        ) : (
          <div className="space-y-6">
            {/* Preview + actions */}
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <div className="border border-border rounded-lg p-2 bg-muted/20 shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageSrc} alt="Uploaded" className="max-h-40 max-w-[200px] object-contain" />
              </div>
              <div className="space-y-3">
                <div className="text-sm text-muted-foreground">
                  <strong>{fileName}</strong>
                  <div className="flex items-center gap-1.5 mt-1 text-green-600 dark:text-green-400">
                    <Shield className="h-3.5 w-3.5" /> Processed locally — never uploaded
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={handleStrip}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
                  >
                    <ShieldOff className="h-3.5 w-3.5" /> Strip EXIF Data
                  </button>
                  {strippedUrl && (
                    <button
                      onClick={handleDownloadStripped}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-border bg-card hover:bg-muted transition-colors"
                    >
                      <Download className="h-3.5 w-3.5" /> Download Stripped
                    </button>
                  )}
                </div>
                {strippedUrl && (
                  <div className="p-2 rounded-md bg-green-500/10 text-green-600 dark:text-green-400 text-xs flex items-center gap-1.5">
                    <CheckCircle className="h-3.5 w-3.5" /> EXIF data removed successfully
                  </div>
                )}
              </div>
            </div>

            {/* GPS map link */}
            {lat !== undefined && lng !== undefined && (
              <a
                href={`https://www.google.com/maps?q=${lat},${lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-3 rounded-lg border border-border bg-blue-500/5 hover:bg-blue-500/10 transition-colors"
              >
                <Globe className="h-5 w-5 text-blue-500" />
                <div>
                  <div className="text-sm font-medium text-blue-600 dark:text-blue-400">View on Google Maps</div>
                  <div className="text-xs text-muted-foreground font-mono">{lat.toFixed(6)}, {lng.toFixed(6)}</div>
                </div>
              </a>
            )}

            {/* EXIF sections */}
            {groupedEntries.length > 0 ? (
              <div className="space-y-4">
                {groupedEntries.map((section) => (
                  <div key={section.key} className="border border-border rounded-lg overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-muted/50 border-b border-border">
                      <section.icon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-semibold">{section.label}</span>
                      <span className="text-xs text-muted-foreground">({section.items.length})</span>
                    </div>
                    <div className="divide-y divide-border">
                      {section.items.map((entry) => (
                        <div
                          key={entry.name}
                          className="flex items-center justify-between px-4 py-2 hover:bg-muted/30 transition-colors group"
                        >
                          <div className="text-sm">
                            <span className="text-muted-foreground">{entry.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-mono font-medium">{entry.value}</span>
                            <button
                              onClick={() => copyValue(entry.name, entry.value)}
                              className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-muted transition-all"
                              title="Copy value"
                            >
                              {copied === entry.name ? (
                                <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                              ) : (
                                <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                              )}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center border border-border rounded-lg bg-muted/20">
                <ImageIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  No EXIF data found. This image may have already been stripped, or it may be a format (PNG, screenshot) that does not contain EXIF metadata.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </ToolPage>
  )
}
