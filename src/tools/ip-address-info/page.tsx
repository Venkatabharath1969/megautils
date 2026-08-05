'use client'

import { useState, useEffect } from 'react'
import { ToolPage, CopyButton } from '@/components/tool-page'

export default function IpAddressInfoTool() {
  const [ip, setIp] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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

  // Simple IP validation helper
  const isIPv4 = (addr: string) => /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(addr)
  const isIPv6 = (addr: string) => /^[0-9a-fA-F:]+$/.test(addr) && addr.includes(':')

  const ipType = ip ? (isIPv4(ip) ? 'IPv4' : isIPv6(ip) ? 'IPv6' : 'Unknown') : ''

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

        {/* IP Display */}
        {loading ? (
          <div className="p-8 rounded-xl border border-border bg-muted/30 text-center">
            <div className="animate-spin inline-block w-6 h-6 border-2 border-primary border-t-transparent rounded-full mb-2" />
            <div className="text-sm text-muted-foreground">Fetching your IP address...</div>
          </div>
        ) : error ? (
          <div className="p-5 rounded-xl bg-red-500/10 border border-red-500/30 text-center">
            <div className="text-red-600 dark:text-red-400 text-sm">{error}</div>
            <button
              onClick={() => window.location.reload()}
              className="mt-3 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            <div className="p-6 rounded-xl bg-primary/10 border border-primary/20 text-center">
              <div className="text-sm text-muted-foreground mb-2">Your Public IP Address</div>
              <div className="text-3xl sm:text-4xl font-bold font-mono text-primary mb-3">{ip}</div>
              <CopyButton text={ip} />
            </div>

            {/* IP Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { label: 'IP Version', value: ipType },
                { label: 'IP Class', value: getIPv4Class(ip) },
                { label: 'Address Type', value: isPrivate(ip) ? 'Private' : 'Public' },
                { label: 'Decimal', value: ipToDecimal(ip) },
              ].map((f) => (
                <div key={f.label} className="p-4 rounded-xl bg-muted/30 border border-border">
                  <div className="text-xs text-muted-foreground">{f.label}</div>
                  <div className="text-sm font-semibold mt-0.5">{f.value}</div>
                </div>
              ))}
            </div>

            {isIPv4(ip) && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold">Alternative Representations</h3>
                {[
                  { label: 'Binary', value: ipToBinary(ip) },
                  { label: 'Hexadecimal', value: ipToHex(ip) },
                  { label: 'Integer', value: ipToDecimal(ip) },
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
        )}
      </div>
    </ToolPage>
  )
}
