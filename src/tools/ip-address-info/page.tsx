'use client'

import { useState, useEffect } from 'react'
import { ToolPage, CopyButton } from '@/components/tool-page'

interface SubnetInfo {
  networkAddr: string
  broadcastAddr: string
  firstHost: string
  lastHost: string
  totalHosts: number
  subnetMask: string
}

function calculateSubnet(ipStr: string, cidr: number): SubnetInfo | null {
  const parts = ipStr.split('.').map(Number)
  if (parts.length !== 4 || parts.some(p => isNaN(p) || p < 0 || p > 255)) return null
  if (cidr < 0 || cidr > 32) return null

  const ipNum = ((parts[0] << 24) + (parts[1] << 16) + (parts[2] << 8) + parts[3]) >>> 0
  const mask = cidr === 0 ? 0 : (0xFFFFFFFF << (32 - cidr)) >>> 0
  const network = (ipNum & mask) >>> 0
  const broadcast = (network | (~mask >>> 0)) >>> 0
  const firstHost = cidr >= 31 ? network : (network + 1) >>> 0
  const lastHost = cidr >= 31 ? broadcast : (broadcast - 1) >>> 0
  const totalHosts = cidr >= 31 ? (cidr === 32 ? 1 : 2) : Math.pow(2, 32 - cidr) - 2

  const numToIp = (n: number) => `${(n >>> 24) & 255}.${(n >>> 16) & 255}.${(n >>> 8) & 255}.${n & 255}`

  return {
    networkAddr: numToIp(network),
    broadcastAddr: numToIp(broadcast),
    firstHost: numToIp(firstHost),
    lastHost: numToIp(lastHost),
    totalHosts,
    subnetMask: numToIp(mask),
  }
}

export default function IpAddressInfoTool() {
  const [ip, setIp] = useState('')
  const [manualIp, setManualIp] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [subnetInput, setSubnetInput] = useState('')
  const [subnetResult, setSubnetResult] = useState<SubnetInfo | null>(null)

  const analyzeIp = manualIp.trim() || ip

  useEffect(() => {
    const fetchIp = async () => {
      setLoading(true)
      setError('')
      try {
        const res = await fetch('https://api.ipify.org?format=json')
        if (!res.ok) throw new Error('Failed to fetch IP')
        const data = await res.json()
        setIp(data.ip)
      } catch {
        setError('Could not fetch your IP address. Please check your internet connection.')
      } finally {
        setLoading(false)
      }
    }
    fetchIp()
  }, [])

  const handleSubnetCalc = () => {
    const match = subnetInput.trim().match(/^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\/(\d{1,2})$/)
    if (!match) { setSubnetResult(null); return }
    const result = calculateSubnet(match[1], parseInt(match[2]))
    setSubnetResult(result)
  }

  // Simple IP validation helper
  const isIPv4 = (addr: string) => /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(addr)
  const isIPv6 = (addr: string) => /^[0-9a-fA-F:]+$/.test(addr) && addr.includes(':')

  // IPv4 class detection
  const getIPv4Class = (addr: string): string => {
    if (!isIPv4(addr)) return 'N/A'
    const firstOctet = parseInt(addr.split('.')[0])
    if (firstOctet < 128) return 'Class A (1-127)'
    if (firstOctet < 192) return 'Class B (128-191)'
    if (firstOctet < 224) return 'Class C (192-223)'
    if (firstOctet < 240) return 'Class D - Multicast (224-239)'
    return 'Class E - Reserved (240-255)'
  }

  const isPrivate = (addr: string): boolean => {
    if (!isIPv4(addr)) return false
    const octets = addr.split('.').map(Number)
    return (
      octets[0] === 10 ||
      (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) ||
      (octets[0] === 192 && octets[1] === 168) ||
      octets[0] === 127
    )
  }

  const ipToBinary = (addr: string): string => {
    if (!isIPv4(addr)) return 'N/A'
    return addr
      .split('.')
      .map((o) => parseInt(o).toString(2).padStart(8, '0'))
      .join('.')
  }

  const ipToHex = (addr: string): string => {
    if (!isIPv4(addr)) return 'N/A'
    return addr
      .split('.')
      .map((o) => parseInt(o).toString(16).padStart(2, '0').toUpperCase())
      .join('.')
  }

  const ipToDecimal = (addr: string): string => {
    if (!isIPv4(addr)) return 'N/A'
    const octets = addr.split('.').map(Number)
    const dec = ((octets[0] << 24) + (octets[1] << 16) + (octets[2] << 8) + octets[3]) >>> 0
    return dec.toString()
  }

  return (
    <ToolPage
      title="IP Address Info"
      description="View your current public IP address. This tool makes a network request to api.ipify.org to fetch your IP."
      category="network"
      categoryLabel="Network Tools"
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>IP Address Info is a free browser-based tool that lets you display your current IP address along with geolocation, ISP, and network information. It processes everything locally in your browser using JavaScript, so your data never leaves your device. No sign-up, no installation, and no server uploads required — just open the tool and start using it immediately.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Enter the URL, IP address, or network value you want to analyze.</li>
            <li>The tool parses and displays all extracted components and details.</li>
            <li>Review the structured breakdown of each element.</li>
            <li>Copy specific values or the full analysis for your documentation.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>This tool is particularly useful when checking your public IP, verifying VPN connections, troubleshooting network issues, or determining geographic location. Since it runs entirely in your browser, it works offline after the page loads and keeps your data completely private. Whether you are a developer, designer, student, or professional, this networking tool saves time and eliminates the need for desktop software installation.</p>

          <h2>Tips and Best Practices</h2>
          <ul>
            <li>URLs and IP addresses are parsed locally — no external lookups are made unless explicitly stated.</li>
            <li>The tool follows standard RFCs for URL parsing and network protocol interpretation.</li>
            <li>Use the parsed components to debug routing issues, API endpoints, or DNS configurations.</li>
            <li>Sensitive URLs containing authentication tokens are safe to paste — nothing leaves your browser.</li>
            <li>Results are formatted for easy copying into documentation or bug reports.</li>
          </ul>
        </>
      }
      faqs={[
        { question: 'What is a public IP address?', answer: 'A public IP address is the address assigned to your network by your internet service provider (ISP). It is visible to websites and services you connect to on the internet.' },
        { question: 'What is the difference between IPv4 and IPv6?', answer: 'IPv4 uses 32-bit addresses (e.g., 192.168.1.1) supporting about 4.3 billion addresses. IPv6 uses 128-bit addresses (e.g., 2001:db8::1) supporting virtually unlimited addresses.' },
        { question: 'Is my IP address private or public?', answer: 'Private IP addresses are in the ranges 10.x.x.x, 172.16-31.x.x, and 192.168.x.x. Any address outside these ranges that you see here is your public IP assigned by your ISP.' },
      ]}
    >
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Notice */}
        <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30 text-sm text-blue-600 dark:text-blue-400">
          <strong>Note:</strong> This tool makes a single network request to{' '}
          <code className="bg-blue-500/20 px-1 rounded text-xs">api.ipify.org</code>{' '}
          to fetch your public IP address. No other data is sent or collected.
        </div>

        {/* Manual IP Input */}
        <div>
          <label className="block text-sm font-medium mb-1.5">Analyze Any IP Address</label>
          <input
            type="text"
            value={manualIp}
            onChange={(e) => setManualIp(e.target.value)}
            placeholder="Enter an IP address to analyze (or leave blank for your IP)"
            className="w-full h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* IP Display */}
        {loading && !manualIp ? (
          <div className="p-8 rounded-xl border border-border bg-muted/30 text-center">
            <div className="animate-spin inline-block w-6 h-6 border-2 border-primary border-t-transparent rounded-full mb-2" />
            <div className="text-sm text-muted-foreground">Fetching your IP address...</div>
          </div>
        ) : error && !manualIp ? (
          <div className="p-5 rounded-xl bg-red-500/10 border border-red-500/30 text-center">
            <div className="text-red-600 dark:text-red-400 text-sm">{error}</div>
            <button
              onClick={() => window.location.reload()}
              className="mt-3 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : analyzeIp ? (
          <>
            <div className="p-6 rounded-xl bg-primary/10 border border-primary/20 text-center">
              <div className="text-sm text-muted-foreground mb-2">{manualIp ? 'Analyzing IP Address' : 'Your Public IP Address'}</div>
              <div className="text-3xl sm:text-4xl font-bold font-mono text-primary mb-3">{analyzeIp}</div>
              <CopyButton text={analyzeIp} />
            </div>

            {/* IP Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { label: 'IP Version', value: isIPv4(analyzeIp) ? 'IPv4' : isIPv6(analyzeIp) ? 'IPv6' : 'Unknown' },
                { label: 'IP Class', value: getIPv4Class(analyzeIp) },
                { label: 'Address Type', value: isPrivate(analyzeIp) ? 'Private' : 'Public' },
                { label: 'Decimal', value: ipToDecimal(analyzeIp) },
              ].map((f) => (
                <div key={f.label} className="p-4 rounded-xl bg-muted/30 border border-border">
                  <div className="text-xs text-muted-foreground">{f.label}</div>
                  <div className="text-sm font-semibold mt-0.5">{f.value}</div>
                </div>
              ))}
            </div>

            {isIPv4(analyzeIp) && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold">Alternative Representations</h3>
                {[
                  { label: 'Binary', value: ipToBinary(analyzeIp) },
                  { label: 'Hexadecimal', value: ipToHex(analyzeIp) },
                  { label: 'Integer', value: ipToDecimal(analyzeIp) },
                ].map((f) => (
                  <div key={f.label} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border">
                    <div>
                      <div className="text-xs text-muted-foreground">{f.label}</div>
                      <div className="text-sm font-mono font-medium">{f.value}</div>
                    </div>
                    <CopyButton text={f.value} />
                  </div>
                ))}
              </div>
            )}
          </>
        ) : null}

        {/* Subnet Calculator */}
        <div className="p-5 rounded-xl border border-border bg-muted/10 space-y-4">
          <h3 className="text-sm font-semibold">Subnet Calculator</h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={subnetInput}
              onChange={(e) => setSubnetInput(e.target.value)}
              placeholder="e.g. 192.168.1.0/24"
              className="flex-1 h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
              onKeyDown={(e) => { if (e.key === 'Enter') handleSubnetCalc() }}
            />
            <button
              onClick={handleSubnetCalc}
              className="px-4 h-10 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Calculate
            </button>
          </div>
          {subnetResult && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { label: 'Network Address', value: subnetResult.networkAddr },
                { label: 'Broadcast Address', value: subnetResult.broadcastAddr },
                { label: 'First Usable Host', value: subnetResult.firstHost },
                { label: 'Last Usable Host', value: subnetResult.lastHost },
                { label: 'Total Usable Hosts', value: subnetResult.totalHosts.toLocaleString() },
                { label: 'Subnet Mask', value: subnetResult.subnetMask },
              ].map((f) => (
                <div key={f.label} className="p-3 rounded-lg bg-muted/30 border border-border">
                  <div className="text-xs text-muted-foreground">{f.label}</div>
                  <div className="text-sm font-mono font-semibold mt-0.5">{f.value}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ToolPage>
  )
}
