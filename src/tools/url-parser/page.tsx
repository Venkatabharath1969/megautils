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
  const [toolMode, setToolMode] = useState<'parse' | 'build'>('parse')
  const [input, setInput] = useState('https://example.com:8080/path/page?name=John&age=30&city=NYC#section1')

  // Build mode state
  const [buildProtocol, setBuildProtocol] = useState('https')
  const [buildHost, setBuildHost] = useState('')
  const [buildPort, setBuildPort] = useState('')
  const [buildPath, setBuildPath] = useState('')
  const [buildHash, setBuildHash] = useState('')
  const [buildParams, setBuildParams] = useState<{ key: string; value: string }[]>([{ key: '', value: '' }])

  const builtUrl = useMemo(() => {
    if (!buildHost) return ''
    let url = `${buildProtocol}://${buildHost}`
    if (buildPort) url += `:${buildPort}`
    if (buildPath) url += buildPath.startsWith('/') ? buildPath : `/${buildPath}`
    const validParams = buildParams.filter(p => p.key.trim())
    if (validParams.length > 0) url += '?' + validParams.map(p => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`).join('&')
    if (buildHash) url += buildHash.startsWith('#') ? buildHash : `#${buildHash}`
    return url
  }, [buildProtocol, buildHost, buildPort, buildPath, buildHash, buildParams])

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
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>URL Parser is a free browser-based tool that lets you parse URLs into their components including protocol, host, port, path, query parameters, and fragment. It processes everything locally in your browser using JavaScript, so your data never leaves your device. No sign-up, no installation, and no server uploads required — just open the tool and start using it immediately.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Enter the URL, IP address, or network value you want to analyze.</li>
            <li>The tool parses and displays all extracted components and details.</li>
            <li>Review the structured breakdown of each element.</li>
            <li>Copy specific values or the full analysis for your documentation.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>This tool is particularly useful when debugging URLs, extracting query parameters, understanding URL structure, or validating URL formatting. Since it runs entirely in your browser, it works offline after the page loads and keeps your data completely private. Whether you are a developer, designer, student, or professional, this web development tool saves time and eliminates the need for desktop software installation.</p>

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
        { question: 'What are the parts of a URL?', answer: 'A URL consists of the protocol (http/https), hostname (domain name), port, pathname (page path), query parameters (key-value pairs after ?), and hash fragment (section after #).' },
        { question: 'What is the difference between a URL and a URI?', answer: 'A URL (Uniform Resource Locator) is a specific type of URI (Uniform Resource Identifier) that provides the location and access method for a resource on the internet.' },
        { question: 'What are query parameters in a URL?', answer: 'Query parameters are key-value pairs appended to a URL after a question mark (?), separated by ampersands (&), used to pass data to the server like search terms or filter options.' },
      ]}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Mode tabs */}
        <div className="flex gap-2">
          <button onClick={() => setToolMode('parse')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${toolMode === 'parse' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'}`}>Parse URL</button>
          <button onClick={() => setToolMode('build')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${toolMode === 'build' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'}`}>Build URL</button>
        </div>

        {toolMode === 'build' && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1">Protocol</label>
                <select value={buildProtocol} onChange={e => setBuildProtocol(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="https">https</option>
                  <option value="http">http</option>
                  <option value="ftp">ftp</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Host</label>
                <input type="text" value={buildHost} onChange={e => setBuildHost(e.target.value)} placeholder="example.com" className="w-full h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Port</label>
                <input type="text" value={buildPort} onChange={e => setBuildPort(e.target.value)} placeholder="8080" className="w-full h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1">Path</label>
                <input type="text" value={buildPath} onChange={e => setBuildPath(e.target.value)} placeholder="/api/users" className="w-full h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Hash / Fragment</label>
                <input type="text" value={buildHash} onChange={e => setBuildHash(e.target.value)} placeholder="#section1" className="w-full h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Query Parameters</label>
              {buildParams.map((p, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <input type="text" value={p.key} onChange={e => { const u = [...buildParams]; u[i] = { ...u[i], key: e.target.value }; setBuildParams(u) }} placeholder="key" className="flex-1 h-9 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                  <input type="text" value={p.value} onChange={e => { const u = [...buildParams]; u[i] = { ...u[i], value: e.target.value }; setBuildParams(u) }} placeholder="value" className="flex-1 h-9 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                  {buildParams.length > 1 && <button onClick={() => setBuildParams(buildParams.filter((_, j) => j !== i))} className="text-red-500 text-xs px-2">Remove</button>}
                </div>
              ))}
              <button onClick={() => setBuildParams([...buildParams, { key: '', value: '' }])} className="text-xs text-primary hover:underline">+ Add Parameter</button>
            </div>
            {builtUrl && (
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-muted-foreground">Generated URL</span>
                  <CopyButton text={builtUrl} />
                </div>
                <div className="font-mono text-sm break-all">{builtUrl}</div>
              </div>
            )}
          </div>
        )}

        {toolMode === 'parse' && <>
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
        </>}
      </div>
    </ToolPage>
  )
}
