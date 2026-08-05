'use client'

import { useState, useMemo, useEffect } from 'react'
import { ToolPage, CopyButton } from '@/components/tool-page'

interface ParsedUA {
  browser: string
  browserVersion: string
  os: string
  osVersion: string
  deviceType: string
  engine: string
}

function parseUserAgent(ua: string): ParsedUA {
  const result: ParsedUA = {
    browser: 'Unknown',
    browserVersion: '',
    os: 'Unknown',
    osVersion: '',
    deviceType: 'Desktop',
    engine: 'Unknown',
  }

  // Device type
  if (/Mobile|Android.*Mobile|iPhone|iPod/i.test(ua)) {
    result.deviceType = 'Mobile'
  } else if (/iPad|Android(?!.*Mobile)|Tablet/i.test(ua)) {
    result.deviceType = 'Tablet'
  } else if (/Bot|Crawler|Spider|Slurp|Googlebot/i.test(ua)) {
    result.deviceType = 'Bot'
  }

  // OS detection
  if (/Windows NT 10/i.test(ua)) {
    result.os = 'Windows'
    result.osVersion = '10/11'
  } else if (/Windows NT 6\.3/i.test(ua)) {
    result.os = 'Windows'
    result.osVersion = '8.1'
  } else if (/Windows NT 6\.2/i.test(ua)) {
    result.os = 'Windows'
    result.osVersion = '8'
  } else if (/Windows NT 6\.1/i.test(ua)) {
    result.os = 'Windows'
    result.osVersion = '7'
  } else if (/Mac OS X ([\d_]+)/i.test(ua)) {
    result.os = 'macOS'
    const match = ua.match(/Mac OS X ([\d_]+)/i)
    result.osVersion = match ? match[1].replace(/_/g, '.') : ''
  } else if (/iPhone OS ([\d_]+)/i.test(ua)) {
    result.os = 'iOS'
    const match = ua.match(/iPhone OS ([\d_]+)/i)
    result.osVersion = match ? match[1].replace(/_/g, '.') : ''
  } else if (/iPad.*OS ([\d_]+)/i.test(ua)) {
    result.os = 'iPadOS'
    const match = ua.match(/OS ([\d_]+)/i)
    result.osVersion = match ? match[1].replace(/_/g, '.') : ''
  } else if (/Android ([\d.]+)/i.test(ua)) {
    result.os = 'Android'
    const match = ua.match(/Android ([\d.]+)/i)
    result.osVersion = match ? match[1] : ''
  } else if (/Linux/i.test(ua)) {
    result.os = 'Linux'
  } else if (/CrOS/i.test(ua)) {
    result.os = 'Chrome OS'
  }

  // Engine detection
  if (/Blink/i.test(ua) || (/Chrome/i.test(ua) && /AppleWebKit/i.test(ua))) {
    result.engine = 'Blink'
  } else if (/Gecko\//i.test(ua)) {
    result.engine = 'Gecko'
  } else if (/AppleWebKit/i.test(ua)) {
    result.engine = 'WebKit'
  } else if (/Trident/i.test(ua)) {
    result.engine = 'Trident'
  }

  // Browser detection (order matters - most specific first)
  if (/Edg\/([\d.]+)/i.test(ua)) {
    result.browser = 'Microsoft Edge'
    const match = ua.match(/Edg\/([\d.]+)/i)
    result.browserVersion = match ? match[1] : ''
  } else if (/OPR\/([\d.]+)/i.test(ua) || /Opera\/([\d.]+)/i.test(ua)) {
    result.browser = 'Opera'
    const match = ua.match(/OPR\/([\d.]+)/i) || ua.match(/Opera\/([\d.]+)/i)
    result.browserVersion = match ? match[1] : ''
  } else if (/Vivaldi\/([\d.]+)/i.test(ua)) {
    result.browser = 'Vivaldi'
    const match = ua.match(/Vivaldi\/([\d.]+)/i)
    result.browserVersion = match ? match[1] : ''
  } else if (/Brave/i.test(ua)) {
    result.browser = 'Brave'
    const match = ua.match(/Chrome\/([\d.]+)/i)
    result.browserVersion = match ? match[1] : ''
  } else if (/Firefox\/([\d.]+)/i.test(ua)) {
    result.browser = 'Firefox'
    const match = ua.match(/Firefox\/([\d.]+)/i)
    result.browserVersion = match ? match[1] : ''
  } else if (/Safari\/([\d.]+)/i.test(ua) && !/Chrome/i.test(ua)) {
    result.browser = 'Safari'
    const match = ua.match(/Version\/([\d.]+)/i)
    result.browserVersion = match ? match[1] : ''
  } else if (/Chrome\/([\d.]+)/i.test(ua)) {
    result.browser = 'Chrome'
    const match = ua.match(/Chrome\/([\d.]+)/i)
    result.browserVersion = match ? match[1] : ''
  } else if (/MSIE ([\d.]+)/i.test(ua) || /Trident.*rv:([\d.]+)/i.test(ua)) {
    result.browser = 'Internet Explorer'
    const match = ua.match(/MSIE ([\d.]+)/i) || ua.match(/rv:([\d.]+)/i)
    result.browserVersion = match ? match[1] : ''
  }

  return result
}

export default function UserAgentParserTool() {
  const [input, setInput] = useState('')
  const [currentUA, setCurrentUA] = useState('')

  useEffect(() => {
    setCurrentUA(navigator.userAgent)
    setInput(navigator.userAgent)
  }, [])

  const parsed = useMemo(() => parseUserAgent(input), [input])

  const fields = [
    { label: 'Browser', value: parsed.browser + (parsed.browserVersion ? ` ${parsed.browserVersion}` : ''), icon: '\uD83C\uDF10' },
    { label: 'Operating System', value: parsed.os + (parsed.osVersion ? ` ${parsed.osVersion}` : ''), icon: '\uD83D\uDCBB' },
    { label: 'Device Type', value: parsed.deviceType, icon: '\uD83D\uDCF1' },
    { label: 'Rendering Engine', value: parsed.engine, icon: '\u2699\uFE0F' },
  ]

  return (
    <ToolPage
      title="User Agent Parser"
      description="Parse user agent strings to detect browser, OS, and device type. Shows your current browser's UA."
      category="network"
      categoryLabel="Network Tools"
      faqs={[
        { question: 'What is a user agent string?', answer: 'A user agent string is a text identifier sent by your browser to websites, containing information about your browser type, version, operating system, and device.' },
        { question: 'How do I find my browser user agent?', answer: 'This tool automatically detects and displays your current browser\'s user agent string at the top of the page. You can also find it by typing "navigator.userAgent" in your browser\'s developer console.' },
        { question: 'Why do user agent strings all start with Mozilla?', answer: 'Most browsers include "Mozilla" for historical compatibility reasons, dating back to the early browser wars when servers would serve different content based on the user agent.' },
        { question: 'Can user agent strings be spoofed?', answer: 'Yes, user agent strings can be easily changed using browser extensions or developer tools, which is why they should not be relied upon for security purposes.' },
      ]}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Current UA */}
        {currentUA && (
          <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
            <div className="flex items-center justify-between mb-1">
              <div className="text-sm font-medium">Your Browser&apos;s User Agent</div>
              <CopyButton text={currentUA} />
            </div>
            <div className="text-xs font-mono text-muted-foreground break-all">{currentUA}</div>
          </div>
        )}

        {/* Input */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-medium">User Agent String</label>
            <button
              onClick={() => setInput(currentUA)}
              className="text-xs text-primary hover:underline"
            >
              Use current browser
            </button>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste a user agent string here..."
            rows={3}
            className="w-full rounded-lg border border-input bg-tool-bg p-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
          />
        </div>

        {/* Results */}
        {input.trim() && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {fields.map((f) => (
              <div key={f.label} className="p-4 rounded-xl bg-muted/30 border border-border">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <span>{f.icon}</span>
                  <span>{f.label}</span>
                </div>
                <div className="text-lg font-semibold">{f.value}</div>
              </div>
            ))}
          </div>
        )}

        {/* Sample UAs */}
        <div>
          <h3 className="text-sm font-semibold mb-2">Try Sample User Agents</h3>
          <div className="space-y-1.5">
            {[
              { label: 'Chrome on Windows', ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' },
              { label: 'Safari on iPhone', ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1' },
              { label: 'Firefox on Linux', ua: 'Mozilla/5.0 (X11; Linux x86_64; rv:120.0) Gecko/20100101 Firefox/120.0' },
              { label: 'Edge on macOS', ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0' },
              { label: 'Googlebot', ua: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)' },
            ].map((s) => (
              <button
                key={s.label}
                onClick={() => setInput(s.ua)}
                className="w-full text-left p-3 rounded-lg border border-border bg-card hover:bg-muted transition-colors"
              >
                <div className="text-sm font-medium">{s.label}</div>
                <div className="text-xs text-muted-foreground font-mono truncate">{s.ua}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </ToolPage>
  )
}
