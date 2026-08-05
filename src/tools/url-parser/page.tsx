'use client'

import { useState, useMemo } from 'react'
import { ToolPage, CopyButton } from '@/components/tool-page'

interface ParsedURL {
  protocol: string
  hostname: string
  port: string
  pathname: string
  search: string
  hash: string
  origin: string
  host: string
  params: [string, string][]
}

function parseUrl(input: string): ParsedURL | null {
  try {
    const url = new URL(input)
    const params: [string, string][] = []
    url.searchParams.forEach((value, key) => {
      params.push([key, value])
    })
    return {
      protocol: url.protocol,
      hostname: url.hostname,
      port: url.port,
      pathname: url.pathname,
      search: url.search,
      hash: url.hash,
      origin: url.origin,
      host: url.host,
      params,
    }
  } catch {
    return null
  }
}

export default function UrlParserTool() {
  const [input, setInput] = useState('https://example.com:8080/path/page?name=John&age=30&city=NYC#section1')

  const parsed = useMemo(() => parseUrl(input), [input])

  const fields = parsed
    ? [
        { label: 'Protocol', value: parsed.protocol },
        { label: 'Origin', value: parsed.origin },
        { label: 'Hostname', value: parsed.hostname },
        { label: 'Host (with port)', value: parsed.host },
        { label: 'Port', value: parsed.port || '(default)' },
        { label: 'Pathname', value: parsed.pathname },
        { label: 'Search', value: parsed.search || '(none)' },
        { label: 'Hash', value: parsed.hash || '(none)' },
      ]
    : []

  return (
    <ToolPage
      title="URL Parser"
      description="Parse a URL into its components: protocol, hostname, port, pathname, query parameters, and hash."
      category="network"
      categoryLabel="Network Tools"
      faqs={[
        { question: 'What are the parts of a URL?', answer: 'A URL consists of the protocol (http/https), hostname (domain name), port, pathname (page path), query parameters (key-value pairs after ?), and hash fragment (section after #).' },
        { question: 'What is the difference between a URL and a URI?', answer: 'A URL (Uniform Resource Locator) is a specific type of URI (Uniform Resource Identifier) that provides the location and access method for a resource on the internet.' },
        { question: 'What are query parameters in a URL?', answer: 'Query parameters are key-value pairs appended to a URL after a question mark (?), separated by ampersands (&), used to pass data to the server like search terms or filter options.' },
      ]}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Input */}
        <div>
          <label className="block text-sm font-medium mb-1.5">Enter URL</label>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="https://example.com/path?key=value#hash"
            className="w-full h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {!parsed && input.trim() && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-sm">
            Invalid URL. Make sure to include the protocol (e.g., https://).
          </div>
        )}

        {parsed && (
          <>
            {/* URL Components */}
            <div>
              <h3 className="text-sm font-semibold mb-3">URL Components</h3>
              <div className="space-y-2">
                {fields.map((f) => (
                  <div key={f.label} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border">
                    <div className="min-w-0 flex-1">
                      <div className="text-xs text-muted-foreground">{f.label}</div>
                      <div className="text-sm font-mono font-medium break-all">{f.value}</div>
                    </div>
                    {f.value && !f.value.startsWith('(') && (
                      <div className="ml-3 shrink-0">
                        <CopyButton text={f.value} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Query Parameters Table */}
            {parsed.params.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-3">Query Parameters ({parsed.params.length})</h3>
                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="text-left p-3 font-medium">#</th>
                        <th className="text-left p-3 font-medium">Key</th>
                        <th className="text-left p-3 font-medium">Value</th>
                        <th className="text-right p-3 font-medium">Copy</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsed.params.map(([key, value], i) => (
                        <tr key={`${key}-${i}`} className={i % 2 === 0 ? 'bg-card' : 'bg-muted/20'}>
                          <td className="p-3 text-muted-foreground">{i + 1}</td>
                          <td className="p-3 font-mono font-medium">{key}</td>
                          <td className="p-3 font-mono">{decodeURIComponent(value)}</td>
                          <td className="p-3 text-right">
                            <CopyButton text={`${key}=${value}`} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </ToolPage>
  )
}
